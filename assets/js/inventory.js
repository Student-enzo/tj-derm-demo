/* ============================================================
   TJ DERM — inventory computation engine
   Pure formulas over STORE data. This is where the depth lives:
   FEFO, par/reorder math, LN2 boil-off estimation, days-of-cover
   burn-rate forecasting, expiry bucketing, valuation, auto-PO.
   Mirrors the computed-logic density of the AYC system.
   ============================================================ */
(function (w) {
  "use strict";
  var DAY = 86400000;
  function round(n,d){ var p=Math.pow(10,d||0); return Math.round(n*p)/p; }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }

  /* ----- on-hand ----- */
  function onHand(it){ if(it.tank) return round(ln2(it).estPct,0); return (it.lots||[]).reduce(function(s,l){return s+l.qty;},0); }

  /* ----- FEFO: lots earliest-expiry-first ----- */
  function fefo(it){ return (it.lots||[]).slice().sort(function(a,b){return a.expDays-b.expDays;}); }
  function nextLot(it){ return fefo(it)[0]||null; }
  function earliestExpiryDays(it){ var l=nextLot(it); return l?l.expDays:Infinity; }

  /* ----- expiry bucket: ≤7 critical, ≤30 watch ----- */
  function expiryBucket(days){ if(days<=7) return 'bad'; if(days<=30) return 'warn'; return 'ok'; }

  /* ----- LN2 boil-off:  est = last − boiloff×days − dispensed ----- */
  function ln2(it){ var t=it.tank;
    var est = clamp(t.lastReadingPct - t.boiloffPerDay*t.lastReadingDaysAgo - (t.dispensedSincePct||0), 0, 100);
    var daysToEmpty = t.boiloffPerDay>0 ? round(est / t.boiloffPerDay, 0) : Infinity;
    var daysToReorder = t.boiloffPerDay>0 ? round((est - t.reorderPct) / t.boiloffPerDay, 0) : Infinity;
    return { estPct:est, daysToEmpty:daysToEmpty, daysToReorder:daysToReorder,
             status: est<=t.reorderPct ? 'bad' : (daysToReorder<=7 ? 'warn' : 'ok'),
             liters: round(est/100 * t.capacityL, 0) };
  }

  /* ----- combined status: stock level + expiry ----- */
  function status(it){
    if(it.tank) return ln2(it).status;
    var oh=onHand(it), exp=expiryBucket(earliestExpiryDays(it));
    if(oh<=it.reorderPoint) return 'bad';
    if(oh<it.par || exp==='warn' || exp==='bad') return 'warn';
    return 'ok';
  }

  /* ----- reorder math: cover lead-time demand back up to par ----- */
  function suggestedQty(it){
    if(it.tank) return Math.ceil((100 - ln2(it).estPct)/1); // % to fill
    var v=(w.STORE.vendor(it.vendorId)||{leadDays:3});
    var leadDemand = it.usagePerWeek * (v.leadDays/7);
    return Math.max(0, Math.ceil(it.par + leadDemand - onHand(it)));
  }

  /* ----- burn-rate forecast: days of cover at current usage ----- */
  function daysOfCover(it){ if(it.tank) return ln2(it).daysToEmpty; if(!it.usagePerWeek) return Infinity; return round(onHand(it)/(it.usagePerWeek/7),0); }

  /* ----- valuation ----- */
  function itemValue(it){ if(it.tank) return round(ln2(it).estPct/100*it.tank.capacityL*it.unitCost,0); return round(onHand(it)*it.unitCost,0); }
  function totalValue(){ return w.STORE.data().items.reduce(function(s,it){return s+itemValue(it);},0); }

  /* ----- derived lists ----- */
  function reorderList(){ // items at/below reorder point or LN2 below threshold → PO suggestion
    return w.STORE.data().items.filter(function(it){ return it.tank? ln2(it).status==='bad' : onHand(it)<=it.reorderPoint; })
      .map(function(it){ var q=suggestedQty(it), v=(w.STORE.vendor(it.vendorId)||{}); return {it:it, qty:q, vendor:v.name, cost:round(q*it.unitCost,2)}; });
  }
  function expiringList(withinDays){ var out=[];
    w.STORE.data().items.forEach(function(it){ if(it.tank) return; (it.lots||[]).forEach(function(l){ if(l.expDays<=(withinDays||30)) out.push({it:it, lot:l, days:l.expDays, bucket:expiryBucket(l.expDays)}); }); });
    return out.sort(function(a,b){return a.days-b.days;});
  }
  function domainRollup(){ var m={}; w.STORE.data().items.forEach(function(it){ var d=it.domain; (m[d]=m[d]||{count:0,worst:'ok',value:0}); m[d].count++; m[d].value+=itemValue(it);
    var s=status(it); if(s==='bad') m[d].worst='bad'; else if(s==='warn'&&m[d].worst!=='bad') m[d].worst='warn'; }); return m; }
  function kpis(){ var items=w.STORE.data().items;
    return { reorder: reorderList().length, expiring: expiringList(30).length,
      lowDomains: Object.keys(domainRollup()).filter(function(d){return domainRollup()[d].worst!=='ok';}).length,
      value: round(totalValue(),0), ln2: w.STORE.item('i-ln2')?ln2(w.STORE.item('i-ln2')).estPct:0, items: items.length }; }

  /* ----- transparency: the formulas, in plain English (for the UI) ----- */
  var FORMULAS=[
    {k:'Stock status', f:'on-hand ≤ reorder point → reorder · on-hand < par OR lot ≤30d → watch · else OK'},
    {k:'On-hand', f:'Σ lot quantities (lot-tracked items)'},
    {k:'FEFO pick', f:'lots sorted by expiry ascending; first-expired is used / dispensed first'},
    {k:'Expiry bucket', f:'days-to-expiry ≤7 → critical · ≤30 → watch'},
    {k:'Suggested order', f:'ceil( par + weekly-usage × lead-days/7 − on-hand )'},
    {k:'Days of cover', f:'on-hand ÷ (weekly-usage ÷ 7)'},
    {k:'LN2 level', f:'last reading − boil-off%/day × days-since − dispensed%'},
    {k:'LN2 days to empty', f:'estimated level ÷ boil-off rate per day'},
    {k:'Inventory value', f:'Σ on-hand × unit-cost (LN2 = est% × capacity × $/L)'}
  ];

  w.INV={ onHand:onHand, fefo:fefo, nextLot:nextLot, earliestExpiryDays:earliestExpiryDays,
    expiryBucket:expiryBucket, ln2:ln2, status:status, suggestedQty:suggestedQty,
    daysOfCover:daysOfCover, itemValue:itemValue, totalValue:totalValue,
    reorderList:reorderList, expiringList:expiringList, domainRollup:domainRollup, kpis:kpis,
    round:round, FORMULAS:FORMULAS };
})(window);
