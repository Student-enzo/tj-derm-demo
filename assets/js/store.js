/* ============================================================
   Dermatology & Skin Cancer Center — data store (v4, deep)
   Real client-side data layer modeled on the AYC inventory module:
   rich SKUs across domains, "critical/JIC" flags, per-case usage,
   a case log, a purchase ledger, vendors, prior-auth — full CRUD,
   append-only audit, localStorage persistence, pub/sub.
   No backend; behaves like one.
   ============================================================ */
(function (w) {
  "use strict";
  var KEY = 'dscc.data.v4';
  var CASES_PER_WEEK = 12; // busy Mohs practice — drives demand math

  /* ---------- SEED ---------- */
  function seed() {
    var V = [
      {id:'v-hs',  name:'Henry Schein', acct:'4471', leadDays:3, email:'orders@henryschein.com'},
      {id:'v-mck', name:'McKesson',     acct:'2210', leadDays:2, email:'derm@mckesson.com'},
      {id:'v-air', name:'Airgas',       acct:'8820', leadDays:1, email:'fills@airgas.com'},
      {id:'v-mid', name:'Medline',      acct:'5567', leadDays:4, email:'orders@medline.com'},
      {id:'v-eth', name:'Ethicon',      acct:'9031', leadDays:5, email:'sutures@ethicon.com'}
    ];
    // domain: Surgical | Lab | LN2 | Topical ; critical = "JIC" (must always be stocked)
    // avgPerCase = units consumed per Mohs/derm case ; expDays = days from today
    var I = [
      ['i-lido','Lidocaine 1%','20 mL vial · anesthetic','Surgical','vial',12,6,7.75,'v-hs',0.9,false,[['LD-7741',9,180]]],
      ['i-lidoepi','Lidocaine 1% w/ epi','20 mL vial · anesthetic','Surgical','vial',12,6,9.10,'v-hs',0.8,true,[['LE-2201',7,150]]],
      ['i-epi','Epinephrine 1:1000','amp · emergency','Surgical','amp',6,4,12.40,'v-mck',0.05,true,[['EP-0098',6,300]]],
      ['i-nylon','4-0 Nylon suture','box of 12','Surgical','box',5,3,22.0,'v-eth',0.6,false,[['NY-3320',9,520]]],
      ['i-prol','5-0 Prolene suture','box of 12','Surgical','box',5,3,28.5,'v-eth',0.5,false,[['PR-7781',6,540]]],
      ['i-blade','#15 scalpel blades','box of 100','Surgical','box',4,2,18.0,'v-mid',0.0,false,[['BL-1190',5,720]]],
      ['i-cur','Curettes (sterile)','single-use 4mm','Surgical','ea',10,5,3.10,'v-mid',1.2,false,[['CR-2231',14,6]]],
      ['i-gauze','Surgical gauze 4×4','sterile pack','Surgical','pack',40,18,0.45,'v-hs',4.0,false,[['GZ-1180',88,300]]],
      ['i-gloves','Sterile gloves 7.0','pair','Surgical','pair',60,30,0.85,'v-mid',2.0,false,[['GL-5540',120,400]]],
      ['i-tray','Mohs tray (sterile)','pre-packed','Surgical','tray',8,4,14.5,'v-mid',1.0,true,[['MT-3320',6,260]]],
      ['i-cautery','Electrocautery tips','box of 10','Surgical','box',3,2,32.0,'v-mid',0.3,false,[['EC-9001',4,500]]],
      ['i-form','Formalin 10%','1 gal · fixative','Lab','gal',5,3,15.6,'v-mck',0.5,false,[['FM-0455',3,21]]],
      ['i-he','H&E stain kit','histology reagent','Lab','kit',3,2,142.0,'v-mck',0.2,false,[['HE-3390',2,60]]],
      ['i-slides','Microscope slides','box of 72','Lab','box',6,3,9.5,'v-mck',1.5,false,[['MS-2200',10,900]]],
      ['i-cover','Coverslips','box of 100','Lab','box',5,3,7.2,'v-mck',1.5,false,[['CS-1140',8,900]]],
      ['i-ln2','Liquid nitrogen','bulk dewar · cryo','LN2','%',60,40,0.85,'v-air',0,true,null,{lastReadingPct:44,lastReadingDaysAgo:3,boiloffPerDay:1.8,dispensedSincePct:1.0,reorderPct:40,capacityL:230}],
      ['i-alcl','Aluminum chloride 20%','hemostatic','Topical','btl',8,5,9.20,'v-hs',0.4,false,[['AC-0912',11,24]]],
      ['i-clob','Clobetasol 0.05%','topical steroid','Topical','tube',12,6,11.40,'v-hs',0.3,false,[['CB-5521',24,240]]],
      ['i-mup','Mupirocin 2%','topical antibiotic','Topical','tube',10,5,8.90,'v-mid',0.5,false,[['MU-2204',19,330]]],
      ['i-peroxide','Hydrogen peroxide','16 oz','Topical','btl',6,3,2.10,'v-hs',0.2,false,[['HP-3300',7,400]]],
      ['i-petro','Petrolatum (white)','jar · wound care','Topical','jar',8,4,3.40,'v-mid',1.0,false,[['PV-7720',12,500]]]
    ].map(function(a){
      var it={id:a[0],name:a[1],sub:a[2],domain:a[3],unit:a[4],par:a[5],reorderPoint:a[6],unitCost:a[7],
        vendorId:a[8],avgPerCase:a[9],critical:a[10]};
      if(a[12]){ it.tank=a[12]; } else { it.lots=(a[11]||[]).map(function(l){return {lot:l[0],qty:l[1],expDays:l[2]};}); }
      it.usagePerWeek = Math.round(it.avgPerCase*CASES_PER_WEEK*10)/10; // demand = avg/case × cases/wk
      return it;
    });
    // case log — recent procedures and what they consumed (drives Usage Lab analytics)
    var KIT=[['i-lido',1],['i-gauze',4],['i-cur',1],['i-nylon',1],['i-blade',0],['i-tray',1],['i-gloves',2],['i-alcl',1]];
    var caseLog=[];
    var procs=['Mohs surgery','Mohs surgery','Excision, malignant','Biopsy','Mohs surgery','Excision, benign','Mohs surgery','Biopsy'];
    for(var c=0;c<8;c++){
      caseLog.push({id:'c'+c, type:procs[c], daysAgo:c, who:c%2?'Maria':'Jess',
        items:KIT.filter(function(k){return k[1]>0;}).map(function(k){return {itemId:k[0],qty:k[1]};})});
    }
    // purchase ledger — last ~8 weeks of buys (drives Spend dashboard)
    var purchases=[
      {id:'p1',itemId:'i-gauze',qty:120,cost:54,daysAgo:3,domain:'Surgical'},
      {id:'p2',itemId:'i-lido',qty:24,cost:186,daysAgo:6,domain:'Surgical'},
      {id:'p3',itemId:'i-form',qty:6,cost:94,daysAgo:9,domain:'Lab'},
      {id:'p4',itemId:'i-ln2',qty:1,cost:210,daysAgo:12,domain:'LN2'},
      {id:'p5',itemId:'i-tray',qty:12,cost:174,daysAgo:16,domain:'Surgical'},
      {id:'p6',itemId:'i-clob',qty:24,cost:274,daysAgo:20,domain:'Topical'},
      {id:'p7',itemId:'i-he',qty:3,cost:426,daysAgo:24,domain:'Lab'},
      {id:'p8',itemId:'i-gloves',qty:200,cost:170,daysAgo:28,domain:'Surgical'},
      {id:'p9',itemId:'i-nylon',qty:10,cost:220,daysAgo:34,domain:'Surgical'},
      {id:'p10',itemId:'i-alcl',qty:12,cost:110,daysAgo:41,domain:'Topical'},
      {id:'p11',itemId:'i-ln2',qty:1,cost:210,daysAgo:47,domain:'LN2'},
      {id:'p12',itemId:'i-mup',qty:12,cost:107,daysAgo:52,domain:'Topical'}
    ];
    return {
      vendors:V, items:I, pos:[], purchases:purchases, caseLog:caseLog,
      casesPerWeek:CASES_PER_WEEK,
      priorAuth:[
        {id:'pa1', proc:'Mohs surgery', cpt:'17311', pt:'J.R.', ins:'United HC', stage:'Draft', ageDays:0},
        {id:'pa2', proc:'Excision, malignant', cpt:'11606', pt:'M.K.', ins:'Aetna', stage:'Submitted', ageDays:2},
        {id:'pa3', proc:'Phototherapy series', cpt:'96910', pt:'D.S.', ins:'Cigna', stage:'Pending insurer', ageDays:4},
        {id:'pa4', proc:'Biopsy, lesion', cpt:'11102', pt:'A.L.', ins:'Florida Blue', stage:'Approved', ageDays:6},
        {id:'pa5', proc:'Excision, benign', cpt:'11402', pt:'R.P.', ins:'Medicare', stage:'Approved', ageDays:8}
      ],
      audit:[
        {ts:Date.now()-5400000, user:'Maria', action:'Received', detail:'120 × Surgical gauze 4×4'},
        {ts:Date.now()-9000000, user:'System', action:'Alert', detail:'Curettes expiring in 6 days'},
        {ts:Date.now()-86400000, user:'Jess', action:'Logged case', detail:'Mohs surgery — 8 items deducted'}
      ],
      meta:{seededAt:Date.now()}
    };
  }

  function load(){ try{ var d=JSON.parse(localStorage.getItem(KEY)); return d&&d.items?d:seed(); }catch(e){ return seed(); } }
  function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){} emit(); }
  var data = load();

  var subs=[];
  function on(fn){ subs.push(fn); return fn; }
  function emit(){ subs.forEach(function(f){ try{ f(data); }catch(e){} }); }

  function uid(p){ return (p||'x')+'-'+Math.abs((Date.now()^(subs.length*2654435761))%0xffffff).toString(36); }
  function item(id){ return data.items.filter(function(x){return x.id===id;})[0]; }
  function vendor(id){ return data.vendors.filter(function(x){return x.id===id;})[0]; }
  function onHandOf(it){ if(it.tank) return null; return (it.lots||[]).reduce(function(s,l){return s+l.qty;},0); }
  function log(user,action,detail){ data.audit.unshift({ts:Date.now(),user:user||'Jess',action:action,detail:detail}); if(data.audit.length>80) data.audit.pop(); }

  /* ---------- operations ---------- */
  function addItem(d){
    var it={id:uid('i'), name:d.name, sub:d.sub||'', domain:d.domain||'Surgical', unit:d.unit||'ea',
      par:+d.par||0, reorderPoint:+d.reorderPoint||Math.ceil((+d.par||0)/2), unitCost:+d.unitCost||0,
      vendorId:d.vendorId||data.vendors[0].id, avgPerCase:+d.avgPerCase||0, critical:!!(d.critical&&d.critical!=='false'), lots:[]};
    it.usagePerWeek=Math.round(it.avgPerCase*data.casesPerWeek*10)/10;
    if(d.qty){ it.lots.push({lot:d.lot||'—', qty:+d.qty, expDays:d.expDays!=null?+d.expDays:365}); }
    data.items.push(it); log(d.user,'Added item', it.name+' ('+it.domain+')'); persist(); return it;
  }
  function editItem(d){ var it=item(d.itemId); if(!it) return;
    ['par','reorderPoint','unitCost','avgPerCase'].forEach(function(k){ if(d[k]!=null&&d[k]!=='') it[k]=+d[k]; });
    if(d.vendorId) it.vendorId=d.vendorId;
    if(d.critical!=null) it.critical=(d.critical===true||d.critical==='true'||d.critical==='on');
    if(d.name) it.name=d.name; if(d.sub!=null) it.sub=d.sub;
    it.usagePerWeek=Math.round((it.avgPerCase||0)*data.casesPerWeek*10)/10;
    log(d.user,'Edited item', it.name); persist();
  }
  function receive(d){ var it=item(d.itemId); if(!it) return; var q=+d.qty||0;
    if(it.tank){ it.tank.lastReadingPct=Math.min(100,(d.toPct!=null?+d.toPct:100)); it.tank.lastReadingDaysAgo=0; it.tank.dispensedSincePct=0; log(d.user,'Received','LN2 refill → '+it.tank.lastReadingPct+'%'); persist(); return; }
    if(q<=0) return; it.lots=it.lots||[];
    it.lots.push({lot:d.lot||'—', qty:q, expDays:d.expDays!=null?+d.expDays:365});
    log(d.user,'Received', q+' × '+it.name+(d.lot?' (lot '+d.lot+')':'')); persist();
  }
  function useStock(d){ var it=item(d.itemId); if(!it) return;
    if(it.tank){ it.tank.dispensedSincePct=(it.tank.dispensedSincePct||0)+(+d.pct||2); log(d.user,'Dispensed','LN2 −'+(+d.pct||2)+'%'); persist(); return; }
    var q=+d.qty||0, lots=(it.lots||[]).slice().sort(function(a,b){return a.expDays-b.expDays;}), used=0;
    for(var i=0;i<lots.length&&q>0;i++){ var t=Math.min(lots[i].qty,q); lots[i].qty-=t; q-=t; used+=t; }
    it.lots=lots.filter(function(l){return l.qty>0;});
    if(!d.silent) log(d.user,'Used', used+' × '+it.name+' (FEFO)'); persist();
  }
  function count(d){ var it=item(d.itemId); if(!it||it.tank) return; var target=+d.counted||0, cur=onHandOf(it), delta=target-cur;
    adjust({itemId:it.id, delta:delta, reason:'cycle count', user:d.user, lot:'COUNT'}); }
  function adjust(d){ var it=item(d.itemId); if(!it||it.tank) return; var delta=+d.delta||0; it.lots=it.lots||[];
    if(delta>0){ it.lots.push({lot:d.lot||'ADJ', qty:delta, expDays:d.expDays!=null?+d.expDays:365}); }
    else { var q=-delta, lots=it.lots.sort(function(a,b){return a.expDays-b.expDays;}); for(var i=0;i<lots.length&&q>0;i++){ var t=Math.min(lots[i].qty,q); lots[i].qty-=t; q-=t; } it.lots=lots.filter(function(l){return l.qty>0;}); }
    log(d.user,'Adjusted', it.name+' '+(delta>=0?'+':'')+delta+' ('+(d.reason||'count')+')'); persist();
  }
  function purchase(d){ var it=item(d.itemId); if(!it) return; var q=+d.qty||0;
    var po={id:uid('po'), itemId:it.id, name:it.name, qty:q, status:'sent', at:Date.now()};
    data.pos.push(po);
    data.purchases.unshift({id:uid('p'), itemId:it.id, qty:q, cost:Math.round(q*it.unitCost*100)/100, daysAgo:0, domain:it.domain});
    log(d.user,'Purchased', q+' × '+it.name+' → '+((vendor(it.vendorId)||{}).name||'')); persist(); return po;
  }
  function logCase(d){ // {type, items:[{itemId,qty}], who}
    var items=d.items||[];
    items.forEach(function(k){ useStock({itemId:k.itemId, qty:k.qty, user:d.who, silent:true}); });
    data.caseLog.unshift({id:uid('c'), type:d.type||'Mohs surgery', daysAgo:0, who:d.who||'Jess', items:items});
    log(d.who,'Logged case', (d.type||'Case')+' — '+items.length+' items deducted'); persist();
  }
  function ln2Verify(d){ var it=item('i-ln2'); if(!it) return; it.tank.lastReadingPct=Math.max(0,Math.min(100,+d.pct)); it.tank.lastReadingDaysAgo=0; it.tank.dispensedSincePct=0; log(d.user,'Verified','LN2 reading '+it.tank.lastReadingPct+'%'); persist(); }
  function addVendor(d){ var v={id:uid('v'), name:d.name, acct:d.acct||'—', leadDays:+d.leadDays||3, email:d.email||''}; data.vendors.push(v); log(d.user,'Added vendor', v.name); persist(); return v; }
  function editVendor(d){ var v=vendor(d.vendorId); if(!v) return; if(d.name)v.name=d.name; if(d.acct!=null)v.acct=d.acct; if(d.leadDays!=null)v.leadDays=+d.leadDays; if(d.email!=null)v.email=d.email; log(d.user,'Edited vendor',v.name); persist(); }
  function addPriorAuth(d){ var pa={id:uid('pa'), proc:d.proc, cpt:d.cpt||'', pt:d.pt||'—', ins:d.ins||'', stage:'Draft', ageDays:0}; data.priorAuth.unshift(pa); log(d.user,'Prior-auth created', d.proc+' ('+(d.ins||'')+')'); persist(); return pa; }
  var PA_ORDER=['Draft','Submitted','Pending insurer','Approved'];
  function advancePriorAuth(id,user){ var pa=data.priorAuth.filter(function(p){return p.id===id;})[0]; if(!pa) return; var i=PA_ORDER.indexOf(pa.stage); if(i<PA_ORDER.length-1){ pa.stage=PA_ORDER[i+1]; log(user,'Prior-auth advanced', pa.proc+' → '+pa.stage); persist(); } }
  function setPriorAuthStage(id,stage,user){ var pa=data.priorAuth.filter(function(p){return p.id===id;})[0]; if(!pa) return; pa.stage=stage; log(user,'Prior-auth',pa.proc+' → '+stage); persist(); }
  function sendPO(d){ return purchase(d); } // alias kept for older pages
  function reset(){ data=seed(); persist(); }

  w.STORE={ data:function(){return data;}, on:on, emit:emit, item:item, vendor:vendor, uid:uid, onHandOf:onHandOf,
    addItem:addItem, editItem:editItem, receive:receive, useStock:useStock, count:count, adjust:adjust,
    purchase:purchase, sendPO:sendPO, logCase:logCase, ln2Verify:ln2Verify,
    addVendor:addVendor, editVendor:editVendor,
    addPriorAuth:addPriorAuth, advancePriorAuth:advancePriorAuth, setPriorAuthStage:setPriorAuthStage, PA_ORDER:PA_ORDER,
    reset:reset, CASES_PER_WEEK:CASES_PER_WEEK };
})(window);
