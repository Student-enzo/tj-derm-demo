/* ============================================================
   Dermatology & Skin Cancer Center — inventory engine (v4)
   Pure formulas over STORE. The depth lives here:
   FEFO, par/reorder, buy-quantity, JIC (critical) rule, LN2
   boil-off, days-of-cover, valuation, usage analytics, spend.
   ============================================================ */
(function (w) {
  "use strict";
  function round(n,d){ var p=Math.pow(10,d||0); return Math.round(n*p)/p; }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function D(){ return w.STORE.data(); }
  function casesPerWeek(){ return D().casesPerWeek || 12; }

  /* ----- on hand / FEFO / expiry ----- */
  function onHand(it){ if(it.tank) return round(ln2(it).estPct,0); return (it.lots||[]).reduce(function(s,l){return s+l.qty;},0); }
  function fefo(it){ return (it.lots||[]).slice().sort(function(a,b){return a.expDays-b.expDays;}); }
  function nextLot(it){ return fefo(it)[0]||null; }
  function earliestExpiryDays(it){ var l=nextLot(it); return l?l.expDays:Infinity; }
  function expiryBucket(days){ if(days<=7) return 'bad'; if(days<=30) return 'warn'; return 'ok'; }

  /* ----- LN2 boil-off ----- */
  function ln2(it){ var t=it.tank;
    var est=clamp(t.lastReadingPct - t.boiloffPerDay*t.lastReadingDaysAgo - (t.dispensedSincePct||0),0,100);
    var dEmpty=t.boiloffPerDay>0?round(est/t.boiloffPerDay,0):Infinity;
    var dReorder=t.boiloffPerDay>0?round((est-t.reorderPct)/t.boiloffPerDay,0):Infinity;
    return {estPct:est,daysToEmpty:dEmpty,daysToReorder:dReorder,
      status:est<=t.reorderPct?'bad':(dReorder<=7?'warn':'ok'),liters:round(est/100*t.capacityL,0)};
  }

  /* ----- demand + status ----- */
  function needed(it){ return round((it.avgPerCase||0)*casesPerWeek(),1); } // weekly demand
  function jicBuffer(it){ return Math.ceil((it.par||0)*0.5); }
  function status(it){
    if(it.tank) return ln2(it).status;
    var oh=onHand(it), exp=expiryBucket(earliestExpiryDays(it));
    if(oh<=0) return 'bad';
    if(oh<=it.reorderPoint) return 'bad';
    if(it.critical && oh < it.par + jicBuffer(it)) return 'warn';
    if(oh<it.par || exp!=='ok') return 'warn';
    return 'ok';
  }
  function daysOfCover(it){ if(it.tank) return ln2(it).daysToEmpty; var u=it.usagePerWeek||needed(it); if(!u) return Infinity; return round(onHand(it)/(u/7),0); }

  /* ----- buy-quantity (AYC-style):  buy = ceil( needed + par − on-hand ) ----- */
  function buyQty(it){
    if(it.tank){ return Math.max(0, Math.ceil(100 - ln2(it).estPct)); } // % to fill
    var base = Math.max(0, Math.ceil(needed(it) + it.par - onHand(it)));
    if(it.critical){ var jic = Math.max(0, Math.ceil(it.par + jicBuffer(it) - onHand(it))); return Math.max(base, jic); }
    return base;
  }
  function needsBuy(it){
    if(it.tank) return ln2(it).status==='bad';
    var oh=onHand(it);
    if(oh<=it.reorderPoint) return true;
    if(it.critical && oh < it.par + jicBuffer(it)) return true;
    return false;
  }
  function buyReason(it){
    if(it.tank) return 'LN2 low';
    var oh=onHand(it);
    if(oh<=0) return 'Out';
    if(it.critical && oh < it.par + jicBuffer(it)) return 'JIC';
    if(oh<=it.reorderPoint) return 'Low';
    return '';
  }

  /* ----- valuation ----- */
  function itemValue(it){ if(it.tank) return round(ln2(it).estPct/100*it.tank.capacityL*it.unitCost,0); return round(onHand(it)*it.unitCost,0); }
  function totalValue(){ return D().items.reduce(function(s,it){return s+itemValue(it);},0); }

  /* ----- derived lists ----- */
  function reorderList(){ return D().items.filter(needsBuy).map(function(it){
    return {it:it, qty:buyQty(it), vendor:(w.STORE.vendor(it.vendorId)||{}).name, cost:round(buyQty(it)*it.unitCost,2), reason:buyReason(it)}; }); }
  var shoppingList = reorderList; // alias (AYC: "Shopping List")
  function expiringList(within){ var out=[]; D().items.forEach(function(it){ if(it.tank) return; (it.lots||[]).forEach(function(l){ if(l.expDays<=(within||30)) out.push({it:it,lot:l,days:l.expDays,bucket:expiryBucket(l.expDays)}); }); }); return out.sort(function(a,b){return a.days-b.days;}); }
  function domainRollup(){ var m={}; D().items.forEach(function(it){ var k=it.domain; (m[k]=m[k]||{count:0,worst:'ok',value:0,low:0}); m[k].count++; m[k].value+=itemValue(it); var s=status(it); if(needsBuy(it)) m[k].low++; if(s==='bad')m[k].worst='bad'; else if(s==='warn'&&m[k].worst!=='bad')m[k].worst='warn'; }); return m; }

  function kpis(){ var items=D().items;
    return { items:items.length, low:items.filter(needsBuy).length,
      out:items.filter(function(it){return !it.tank&&onHand(it)<=0;}).length,
      critical:items.filter(function(it){return it.critical;}).length,
      expiring:expiringList(30).length, value:round(totalValue(),0),
      ln2:w.STORE.item('i-ln2')?ln2(w.STORE.item('i-ln2')).estPct:0 }; }

  /* ----- usage analytics (from case log) ----- */
  function analytics(){ var log=D().caseLog||[]; var byItem={}, byDomain={}, total=0;
    log.forEach(function(c){ (c.items||[]).forEach(function(k){ var it=w.STORE.item(k.itemId); if(!it) return; total+=k.qty;
      byItem[k.itemId]=(byItem[k.itemId]||0)+k.qty; byDomain[it.domain]=(byDomain[it.domain]||0)+k.qty; }); });
    var top=Object.keys(byItem).sort(function(a,b){return byItem[b]-byItem[a];})[0];
    var topDom=Object.keys(byDomain).sort(function(a,b){return byDomain[b]-byDomain[a];})[0];
    return { cases:log.length, totalUnits:total, avgPerCase: log.length?round(total/log.length,1):0,
      byItem:byItem, byDomain:byDomain, topItem:top?w.STORE.item(top):null, topDomain:topDom||'—' }; }

  /* ----- spend (from purchase ledger) ----- */
  function spend(){ var ps=D().purchases||[]; var total=0, byDomain={}, byWeek=[0,0,0,0,0,0,0,0];
    ps.forEach(function(p){ total+=p.cost; byDomain[p.domain]=(byDomain[p.domain]||0)+p.cost; var wk=Math.floor((p.daysAgo||0)/7); if(wk<8) byWeek[wk]+=p.cost; });
    var weeks=ps.length?Math.max(1,Math.ceil(Math.max.apply(null,ps.map(function(p){return p.daysAgo||0;}))/7)):1;
    var projected = reorderList().reduce(function(s,r){return s+r.cost;},0);
    return { total:round(total,0), byDomain:byDomain, byWeek:byWeek, avgPerWeek:round(total/weeks,0), projected:round(projected,0) }; }

  /* ----- transparency: the formulas in plain English ----- */
  var FORMULAS=[
    {k:'Weekly demand', f:'avg-per-case × cases-per-week  ('+12+' cases/wk)'},
    {k:'Buy quantity', f:'ceil( weekly-demand + par − on-hand )'},
    {k:'JIC (critical) rule', f:'always keep par + ½·par; buy ceil(par + buffer − on-hand)'},
    {k:'Stock status', f:'out / ≤ reorder → red · < par or lot ≤30d → amber · else green'},
    {k:'FEFO pick', f:'first-expiring lot is used / dispensed first'},
    {k:'Expiry bucket', f:'days-to-expiry ≤7 → critical · ≤30 → watch'},
    {k:'Days of cover', f:'on-hand ÷ (weekly-demand ÷ 7)'},
    {k:'LN2 level', f:'last reading − boil-off%/day × days − dispensed%'},
    {k:'Inventory value', f:'Σ on-hand × unit-cost'}
  ];

  w.INV={ onHand:onHand, fefo:fefo, nextLot:nextLot, earliestExpiryDays:earliestExpiryDays, expiryBucket:expiryBucket,
    ln2:ln2, status:status, needed:needed, jicBuffer:jicBuffer, daysOfCover:daysOfCover,
    buyQty:buyQty, needsBuy:needsBuy, buyReason:buyReason, suggestedQty:buyQty,
    itemValue:itemValue, totalValue:totalValue, reorderList:reorderList, shoppingList:shoppingList,
    expiringList:expiringList, domainRollup:domainRollup, kpis:kpis, analytics:analytics, spend:spend,
    round:round, FORMULAS:FORMULAS };
})(window);
