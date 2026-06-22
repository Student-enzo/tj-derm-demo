/* ============================================================
   TJ DERM — data store
   A real client-side data layer for the showcase: seeded fake
   data, full CRUD, an append-only audit log, localStorage
   persistence, and a pub/sub so every screen re-renders live.
   No backend — but it behaves like one.
   ============================================================ */
(function (w) {
  "use strict";
  var KEY = 'tjderm.data.v3';

  /* ---------- SEED (rich, realistic, de-identified) ---------- */
  function seed() {
    return {
      vendors: [
        {id:'v-hs',  name:'Henry Schein', acct:'4471', leadDays:3},
        {id:'v-mck', name:'McKesson',     acct:'2210', leadDays:2},
        {id:'v-air', name:'Airgas',       acct:'8820', leadDays:1},
        {id:'v-mid', name:'Medline',      acct:'5567', leadDays:4}
      ],
      // expDays = days from *today* (kept relative so the demo never goes stale)
      items: [
        {id:'i-lido', name:'Lidocaine 1%', sub:'20 mL vial · local anesthetic', domain:'Surgical', unit:'vial', par:10, reorderPoint:6, unitCost:7.75, vendorId:'v-hs', usagePerWeek:5,
          lots:[{lot:'LD-7741', qty:6, expDays:5}]},
        {id:'i-nylon', name:'4-0 Nylon suture', sub:'Box of 12', domain:'Surgical', unit:'box', par:4, reorderPoint:2, unitCost:22.0, vendorId:'v-mid', usagePerWeek:1.5,
          lots:[{lot:'NY-3320', qty:9, expDays:420}]},
        {id:'i-cur', name:'Curettes (sterile)', sub:'Single-use, 4 mm', domain:'Surgical', unit:'ea', par:8, reorderPoint:4, unitCost:3.10, vendorId:'v-mid', usagePerWeek:6,
          lots:[{lot:'CR-2231', qty:14, expDays:6}]},
        {id:'i-gauze', name:'Surgical gauze 4×4', sub:'Sterile pack', domain:'Surgical', unit:'pack', par:30, reorderPoint:15, unitCost:0.45, vendorId:'v-hs', usagePerWeek:40,
          lots:[{lot:'GZ-1180', qty:88, expDays:300}]},
        {id:'i-form', name:'Formalin 10%', sub:'1 gal · fixative', domain:'Lab', unit:'gal', par:5, reorderPoint:3, unitCost:15.60, vendorId:'v-mck', usagePerWeek:1,
          lots:[{lot:'FM-0455', qty:3, expDays:21}]},
        {id:'i-he', name:'H&E stain kit', sub:'Histology reagent', domain:'Lab', unit:'kit', par:3, reorderPoint:2, unitCost:142.0, vendorId:'v-mck', usagePerWeek:0.4,
          lots:[{lot:'HE-3390', qty:2, expDays:60}]},
        {id:'i-ln2', name:'Liquid nitrogen', sub:'Bulk dewar · cryosurgery', domain:'LN2', unit:'%', par:60, reorderPoint:40, unitCost:0.85, vendorId:'v-air', usagePerWeek:0,
          tank:{lastReadingPct:44, lastReadingDaysAgo:3, boiloffPerDay:1.8, dispensedSincePct:1.0, reorderPct:40, capacityL:230}},
        {id:'i-alcl', name:'Aluminum chloride 20%', sub:'Hemostatic', domain:'Topical', unit:'btl', par:8, reorderPoint:5, unitCost:9.20, vendorId:'v-hs', usagePerWeek:2,
          lots:[{lot:'AC-0912', qty:11, expDays:24}]},
        {id:'i-clob', name:'Clobetasol 0.05%', sub:'Topical steroid', domain:'Topical', unit:'tube', par:12, reorderPoint:6, unitCost:11.40, vendorId:'v-hs', usagePerWeek:3,
          lots:[{lot:'CB-5521', qty:24, expDays:240}]},
        {id:'i-mup', name:'Mupirocin 2%', sub:'Topical antibiotic', domain:'Topical', unit:'tube', par:10, reorderPoint:5, unitCost:8.90, vendorId:'v-mid', usagePerWeek:2.5,
          lots:[{lot:'MU-2204', qty:19, expDays:330}]}
      ],
      pos: [], // generated/sent at runtime
      priorAuth: [
        {id:'pa1', proc:'Mohs surgery', cpt:'17311', pt:'J.R.', ins:'United HC', stage:'Draft', ageDays:0},
        {id:'pa2', proc:'Excision, malignant', cpt:'11606', pt:'M.K.', ins:'Aetna', stage:'Submitted', ageDays:2},
        {id:'pa3', proc:'Phototherapy series', cpt:'96910', pt:'D.S.', ins:'Cigna', stage:'Pending insurer', ageDays:4},
        {id:'pa4', proc:'Biopsy, lesion', cpt:'11102', pt:'A.L.', ins:'Florida Blue', stage:'Approved', ageDays:6},
        {id:'pa5', proc:'Excision, benign', cpt:'11402', pt:'R.P.', ins:'Medicare', stage:'Approved', ageDays:8}
      ],
      audit: [
        {ts:Date.now()-5400000, user:'Maria', action:'Received', detail:'40 × Surgical gauze 4×4 (lot GZ-1180)'},
        {ts:Date.now()-9000000, user:'System', action:'Alert', detail:'Lidocaine 1% fell below reorder point (6 ≤ 6)'},
        {ts:Date.now()-86400000, user:'Samantha', action:'Adjusted', detail:'Curettes −2 (reason: waste)'}
      ],
      meta:{seededAt:Date.now()}
    };
  }

  /* ---------- persistence ---------- */
  function load(){ try{ var d=JSON.parse(localStorage.getItem(KEY)); return d&&d.items?d:seed(); }catch(e){ return seed(); } }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){} emit(); }
  var data = load();

  /* ---------- pub/sub ---------- */
  var subs=[];
  function on(fn){ subs.push(fn); return fn; }
  function emit(){ subs.forEach(function(f){ try{ f(data); }catch(e){} }); }

  /* ---------- helpers ---------- */
  function uid(p){ return (p||'x')+'-'+Math.abs((Date.now()^(subs.length*2654435761))%0xffffff).toString(36); }
  function item(id){ return data.items.filter(function(x){return x.id===id;})[0]; }
  function vendor(id){ return data.vendors.filter(function(x){return x.id===id;})[0]; }
  function log(user,action,detail){ data.audit.unshift({ts:Date.now(),user:user||'Jess',action:action,detail:detail}); if(data.audit.length>60) data.audit.pop(); }

  /* ---------- CRUD / operations (each logs + persists + emits) ---------- */
  function addItem(d){
    var it={id:uid('i'), name:d.name, sub:d.sub||'', domain:d.domain||'Surgical', unit:d.unit||'ea',
      par:+d.par||0, reorderPoint:+d.reorderPoint|| Math.ceil((+d.par||0)/2), unitCost:+d.unitCost||0,
      vendorId:d.vendorId||data.vendors[0].id, usagePerWeek:+d.usagePerWeek||0, lots:[]};
    if(d.qty){ it.lots.push({lot:d.lot||'—', qty:+d.qty, expDays:d.expDays!=null?+d.expDays:365}); }
    data.items.push(it); log(d.user,'Added item', it.name+' ('+it.domain+')'); persist(); return it;
  }
  function receive(d){ // {itemId, lot, expDays, qty}
    var it=item(d.itemId); if(!it) return;
    var q=+d.qty||0; if(q<=0) return;
    if(it.tank){ it.tank.lastReadingPct=Math.min(100,(d.toPct!=null?+d.toPct:100)); it.tank.lastReadingDaysAgo=0; it.tank.dispensedSincePct=0;
      log(d.user,'Received','LN2 refill → '+it.tank.lastReadingPct+'%'); persist(); return; }
    it.lots=it.lots||[];
    it.lots.push({lot:d.lot||'—', qty:q, expDays:d.expDays!=null?+d.expDays:365});
    log(d.user,'Received', q+' × '+it.name+(d.lot?' (lot '+d.lot+')':'')); persist();
  }
  function useStock(d){ // {itemId, qty} — FEFO decrement
    var it=item(d.itemId); if(!it) return;
    if(it.tank){ it.tank.dispensedSincePct=(it.tank.dispensedSincePct||0)+(+d.pct||2); log(d.user,'Dispensed','LN2 −'+(+d.pct||2)+'%'); persist(); return; }
    var q=+d.qty||0; var lots=(it.lots||[]).slice().sort(function(a,b){return a.expDays-b.expDays;});
    var used=0;
    for(var i=0;i<lots.length && q>0;i++){ var take=Math.min(lots[i].qty,q); lots[i].qty-=take; q-=take; used+=take; }
    it.lots=lots.filter(function(l){return l.qty>0;});
    log(d.user,'Used', used+' × '+it.name+' (FEFO)'); persist();
  }
  function adjust(d){ // {itemId, delta, reason}
    var it=item(d.itemId); if(!it||it.tank) return;
    var delta=+d.delta||0; it.lots=it.lots||[];
    if(delta>0){ it.lots.push({lot:d.lot||'ADJ', qty:delta, expDays:d.expDays!=null?+d.expDays:365}); }
    else { var q=-delta, lots=it.lots.sort(function(a,b){return a.expDays-b.expDays;}); for(var i=0;i<lots.length&&q>0;i++){ var t=Math.min(lots[i].qty,q); lots[i].qty-=t; q-=t; } it.lots=lots.filter(function(l){return l.qty>0;}); }
    log(d.user,'Adjusted', it.name+' '+(delta>=0?'+':'')+delta+' (reason: '+(d.reason||'cycle count')+')'); persist();
  }
  function ln2Verify(d){ var it=item('i-ln2'); if(!it) return; it.tank.lastReadingPct=Math.max(0,Math.min(100,+d.pct)); it.tank.lastReadingDaysAgo=0; it.tank.dispensedSincePct=0; log(d.user,'Verified','LN2 physical reading '+it.tank.lastReadingPct+'%'); persist(); }
  function addVendor(d){ var v={id:uid('v'), name:d.name, acct:d.acct||'—', leadDays:+d.leadDays||3}; data.vendors.push(v); log(d.user,'Added vendor', v.name); persist(); return v; }
  function sendPO(d){ // {itemId, qty}
    var it=item(d.itemId); var po={id:uid('po'), itemId:d.itemId, name:it?it.name:d.name, qty:+d.qty||0, status:'sent', at:Date.now()};
    data.pos.push(po); log(d.user,'PO sent', po.qty+' × '+po.name+' → '+(it?(vendor(it.vendorId)||{}).name:'')); persist(); return po;
  }
  function receivePO(id,user){ var po=data.pos.filter(function(p){return p.id===id;})[0]; if(!po) return; po.status='received'; receive({itemId:po.itemId, qty:po.qty, user:user, lot:'PO-'+po.id.slice(-4)}); }
  function addPriorAuth(d){ var pa={id:uid('pa'), proc:d.proc, cpt:d.cpt||'', pt:d.pt||'—', ins:d.ins||'', stage:'Draft', ageDays:0}; data.priorAuth.unshift(pa); log(d.user,'Prior-auth created', d.proc+' ('+(d.ins||'')+')'); persist(); return pa; }
  var PA_ORDER=['Draft','Submitted','Pending insurer','Approved'];
  function advancePriorAuth(id,user){ var pa=data.priorAuth.filter(function(p){return p.id===id;})[0]; if(!pa) return; var i=PA_ORDER.indexOf(pa.stage); if(i<PA_ORDER.length-1){ pa.stage=PA_ORDER[i+1]; log(user,'Prior-auth advanced', pa.proc+' → '+pa.stage); persist(); } }
  function reset(){ data=seed(); persist(); }

  w.STORE={ data:function(){return data;}, on:on, emit:emit,
    item:item, vendor:vendor, uid:uid,
    addItem:addItem, receive:receive, useStock:useStock, adjust:adjust, ln2Verify:ln2Verify,
    addVendor:addVendor, sendPO:sendPO, receivePO:receivePO,
    addPriorAuth:addPriorAuth, advancePriorAuth:advancePriorAuth, PA_ORDER:PA_ORDER, reset:reset };
})(window);
