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

  /* ----- FORWARD demand from the surgery schedule -------------------------
     AYC reads upcoming charters (guests×hours×tier); we read upcoming surgery
     days and multiply each booked case by its procedure kit. This is the brain. */
  function schedule(){ return D().schedule||[]; }
  function kitQty(type,id){ var k=(D().procedureKits||{})[type]||{}; return k[id]||0; }
  function leadWindow(it){ var v=w.STORE.vendor(it.vendorId)||{}; return Math.max(7,(+v.leadDays||3)+4); } // plan-ahead days = lead time + safety
  function scheduleNeed(it, days){ // units (or % for LN2) the booked schedule consumes within `days`
    var sum=0; schedule().forEach(function(d){ if(d.done||d.inDays>days) return;
      (d.cases||[]).forEach(function(c){ sum += (c.count||0)*kitQty(c.type, it.id); }); });
    return round(sum,1);
  }
  function forecastNeed(it){ return scheduleNeed(it, leadWindow(it)); }       // demand over THIS item's window
  function caseDrivers(it){ // which procedures drive this item's demand → the "why"
    var m={}; schedule().forEach(function(d){ if(d.done||d.inDays>leadWindow(it)) return;
      (d.cases||[]).forEach(function(c){ if((c.count||0)*kitQty(c.type,it.id)>0) m[c.type]=(m[c.type]||0)+c.count; }); });
    return m;
  }
  function procedureLoad(days){ var m={}, total=0; schedule().forEach(function(d){ if(d.done||d.inDays>(days==null?14:days)) return;
    (d.cases||[]).forEach(function(c){ m[c.type]=(m[c.type]||0)+c.count; total+=c.count; }); }); return {byType:m,total:total}; }
  function projectedOnHand(it, days){ var d=(days==null?leadWindow(it):days);
    if(it.tank) return round(ln2(it).estPct - scheduleNeed(it,d),0); return round(onHand(it) - scheduleNeed(it,d),0); }

  /* ----- LAYER 2: schedule → prior-auth — booked auth-requiring cases vs auths on file -----
     The same surgery schedule that drives supplies also tells us which insurance
     approvals are owed, and by when (deadline = surgery date). */
  function authQueue(days){ var d=(days==null?7:days);
    var load={}; schedule().forEach(function(day){ if(day.done||day.inDays>d) return;
      (day.cases||[]).forEach(function(c){ var a=w.STORE.procAuth(c.type); if(!a||!a.needsAuth) return;
        load[c.type]=load[c.type]||{cases:0, firstDay:Infinity, cpt:a.cpt, turn:a.turn};
        load[c.type].cases+=c.count; load[c.type].firstDay=Math.min(load[c.type].firstDay, day.inDays); }); });
    var pa=D().priorAuth||[];
    return Object.keys(load).map(function(type){ var L=load[type];
      var mine=pa.filter(function(p){return p.cpt===L.cpt;});
      var approved=mine.filter(function(p){return p.stage==='Approved';}).length;
      var inProgress=mine.filter(function(p){return p.stage!=='Approved';}).length;
      var have=mine.length, missing=Math.max(0, L.cases-have);
      var leadOk=(L.firstDay - L.turn) > 0;                 // enough lead time before the first case?
      return {type:type, cpt:L.cpt, cases:L.cases, firstDay:L.firstDay, turn:L.turn,
        approved:approved, inProgress:inProgress, have:have, missing:missing, leadOk:leadOk,
        urgent:(missing>0)||(inProgress>0 && !leadOk)}; })
      .sort(function(a,b){return a.firstDay-b.firstDay;}); }
  function authSummary(days){ var q=authQueue(days);
    return {types:q.length,
      cases:q.reduce(function(s,r){return s+r.cases;},0),
      missing:q.reduce(function(s,r){return s+r.missing;},0),
      approved:q.reduce(function(s,r){return s+r.approved;},0),
      inProgress:q.reduce(function(s,r){return s+r.inProgress;},0),
      urgent:q.filter(function(r){return r.urgent;}).length}; }

  /* ----- LAYER 3: reservations — supplies committed to auth-approved cases ----- */
  function reserved(itemId){ return (D().reservations||[]).reduce(function(s,r){
    (r.items||[]).forEach(function(it){ if(it.itemId===itemId) s+=it.qty; }); return s; },0); }
  function available(it){ if(it.tank) return round(ln2(it).estPct,0); return Math.max(0, onHand(it)-reserved(it.id)); }
  function caseCommitment(days){ var d=(days==null?7:days); var load={};
    schedule().forEach(function(day){ if(day.done||day.inDays>d) return; (day.cases||[]).forEach(function(c){
      var a=w.STORE.procAuth(c.type); load[c.type]=load[c.type]||{cases:0, needsAuth:!!(a&&a.needsAuth), cpt:a?a.cpt:null}; load[c.type].cases+=c.count; }); });
    var pa=D().priorAuth||[], committed=0, pending=0;
    Object.keys(load).forEach(function(type){ var L=load[type];
      if(!L.needsAuth){ committed+=L.cases; return; }
      var appr=pa.filter(function(p){return p.cpt===L.cpt && p.stage==='Approved';}).length;
      var c=Math.min(L.cases, appr); committed+=c; pending+=(L.cases-c); });
    return {committed:committed, pending:pending, total:committed+pending}; }

  /* ----- buy-quantity: now calendar-driven —  buy = ceil( forecast + par − on-hand ) ----- */
  function buyQty(it){
    if(it.tank){ return Math.max(0, Math.ceil(100 - ln2(it).estPct)); } // % to fill
    var fc=forecastNeed(it); var demand = fc>0 ? fc : needed(it);        // booked schedule, else flat weekly
    var base = Math.max(0, Math.ceil(demand + it.par - onHand(it)));
    if(it.critical){ var jic = Math.max(0, Math.ceil(it.par + jicBuffer(it) - onHand(it))); return Math.max(base, jic); }
    return base;
  }
  function needsBuy(it){
    if(it.tank){ var l=ln2(it); return l.status==='bad' || (l.estPct - scheduleNeed(it,leadWindow(it))) <= it.tank.reorderPct; }
    var oh=onHand(it);
    if(oh<=it.reorderPoint) return true;
    if(it.critical && oh < it.par + jicBuffer(it)) return true;
    if((oh - forecastNeed(it)) <= it.reorderPoint) return true;          // schedule will breach reorder before resupply
    return false;
  }
  function buyReason(it){
    if(it.tank) return ln2(it).status==='bad' ? 'LN2 low' : 'Cryo booked';
    var oh=onHand(it);
    if(oh<=0) return 'Out';
    if(it.critical && oh < it.par + jicBuffer(it)) return 'JIC';
    if(oh<=it.reorderPoint) return 'Low';
    if((oh - forecastNeed(it)) <= it.reorderPoint) return 'Schedule';
    return '';
  }

  /* ----- valuation ----- */
  function itemValue(it){ if(it.tank) return round(ln2(it).estPct/100*it.tank.capacityL*it.unitCost,0); return round(onHand(it)*it.unitCost,0); }
  function totalValue(){ return D().items.reduce(function(s,it){return s+itemValue(it);},0); }

  /* ----- derived lists ----- */
  function reorderList(){ return D().items.filter(needsBuy).map(function(it){
    var v=w.STORE.vendor(it.vendorId)||{};
    return {it:it, qty:buyQty(it), vendorId:it.vendorId, vendor:v.name, leadDays:v.leadDays,
      cost:round(buyQty(it)*it.unitCost,2), reason:buyReason(it),
      forecast:forecastNeed(it), window:leadWindow(it), drivers:caseDrivers(it),
      projected:projectedOnHand(it)}; }); }
  var shoppingList = reorderList; // alias (AYC: "Shopping List")
  function reorderByVendor(){ var g={}; reorderList().forEach(function(r){ var id=r.vendorId||'na';
      (g[id]=g[id]||{vendorId:id, vendor:w.STORE.vendor(id)||{name:r.vendor||'Misc'}, lines:[], cost:0});
      g[id].lines.push(r); g[id].cost=round(g[id].cost+r.cost,2); });
    return Object.keys(g).map(function(k){return g[k];}).sort(function(a,b){return b.cost-a.cost;}); }
  function forecastImpact(days){ var d=days||leadWindow({vendorId:null}); // what the schedule does to stock
    return D().items.map(function(it){ var proj=projectedOnHand(it,d), need=scheduleNeed(it,d);
      return {it:it, need:need, projected:proj, onHand:onHand(it),
        short: it.tank ? (proj<=it.tank.reorderPct) : (proj<=it.reorderPoint)}; })
      .filter(function(x){return x.need>0;}).sort(function(a,b){return a.projected-b.projected;}); }
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
    {k:'Forecast demand', f:'Σ booked-cases × procedure-kit-qty, over the supplier lead window'},
    {k:'Buy quantity', f:'ceil( forecast-demand + par − on-hand )'},
    {k:'Reorder trigger', f:'on-hand − forecast ≤ reorder point  →  before you run short'},
    {k:'Plan window', f:'max(7, supplier-lead-days + 4) — how far ahead each item plans'},
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
    scheduleNeed:scheduleNeed, forecastNeed:forecastNeed, leadWindow:leadWindow, caseDrivers:caseDrivers,
    procedureLoad:procedureLoad, projectedOnHand:projectedOnHand, reorderByVendor:reorderByVendor, forecastImpact:forecastImpact,
    authQueue:authQueue, authSummary:authSummary, reserved:reserved, available:available, caseCommitment:caseCommitment,
    itemValue:itemValue, totalValue:totalValue, reorderList:reorderList, shoppingList:shoppingList,
    expiringList:expiringList, domainRollup:domainRollup, kpis:kpis, analytics:analytics, spend:spend,
    round:round, FORMULAS:FORMULAS };
})(window);
