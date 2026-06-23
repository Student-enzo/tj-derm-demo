/* ============================================================
   Dermatology & Skin Cancer Center — shared app runtime
   - SVG icon set (no emoji)
   - role-scoped navigation (Doctor / Supply room / Front desk)
   - the role is set by which page you're on; launcher picks it
   - mounts the sidebar + topbar shell on every page
   ============================================================ */
(function (w) {
  "use strict";

  /* ---------- ICONS ---------- */
  var P = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    box:'<path d="m7.5 4.3 9 5.1"/><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    bell:'<path d="M10.3 21a2 2 0 0 0 3.4 0"/><path d="M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.4 6-2.7 7.3"/>',
    shield:'<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    snow:'<line x1="12" y1="2" x2="12" y2="22"/><path d="m17 5-5 5-5-5"/><path d="m17 19-5-5-5 5"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m5 7 5 5-5 5"/><path d="m19 7-5 5 5 5"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
    flask:'<path d="M14 2v6a2 2 0 0 0 .2 1l5.5 10a2 2 0 0 1-1.7 3H6a2 2 0 0 1-1.8-3L9.8 9a2 2 0 0 0 .2-1V2"/><path d="M6.5 15h11"/><path d="M8.5 2h7"/>',
    droplet:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    scissors:'<circle cx="6" cy="6" r="3"/><path d="M8.1 8.1 12 12"/><path d="M20 4 8.1 15.9"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
    camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13.5" r="3.2"/>',
    keyboard:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
    zap:'<path d="M4 14a1 1 0 0 1-.8-1.6l9.9-10.2a.5.5 0 0 1 .9.5l-1.9 6a1 1 0 0 0 .9 1.3h7a1 1 0 0 1 .8 1.6l-9.9 10.2a.5.5 0 0 1-.9-.5l1.9-6a1 1 0 0 0-.9-1.3z"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu:'<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    sparkles:'<path d="M9.9 15.5A2 2 0 0 0 8.5 14L2.4 12.5a.5.5 0 0 1 0-1L8.5 10A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0L14 8.5A2 2 0 0 0 15.5 10l6.1 1.6a.5.5 0 0 1 0 1L15.5 14a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z"/>',
    clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    truck:'<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.7a1 1 0 0 0-.2-.6l-3.5-4.3A1 1 0 0 0 17.5 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    stetho:'<path d="M11 2v2M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    list:'<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
    layers:'<path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6a1 1 0 0 0 0 1.9l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.9z"/><path d="m22 17.7-9.2 4.2a2 2 0 0 1-1.6 0L2 17.7"/><path d="m22 12.7-9.2 4.2a2 2 0 0 1-1.6 0L2 12.7"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="m9 15 2 2 4-4"/>',
    home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    swap:'<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    dollar:'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    trend:'<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>'
  };
  function icon(name, cls){ return '<svg class="ico '+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[name]||'')+'</svg>'; }

  /* ---------- STATE ---------- */
  var KEY='tjui.v3';
  var DEFAULT={ role:'staff' };
  function load(){ try{ return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){ return Object.assign({},DEFAULT); } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
  var state = load();

  /* ---------- ROLES + NAV ---------- */
  var NAV_BY_ROLE = {
    doctor: [
      {id:'dashboard', label:'Today', icon:'stetho', href:'dashboard.html'},
      {id:'schedule', label:'This week', icon:'calendar', href:'schedule.html'}
    ],
    staff: [
      {id:'dashboard-ops', label:'Home',  icon:'home', href:'dashboard-ops.html'},
      {id:'schedule', label:'Schedule',   icon:'calendar', href:'schedule.html'},
      {id:'inventory', label:'Inventory', icon:'box',  href:'inventory.html'},
      {id:'receive',label:'Receive',      icon:'scan', href:'receive-scan.html'},
      {id:'shopping',label:'Shopping',    icon:'cart', href:'shopping.html'},
      {id:'vendors', label:'Vendors',     icon:'truck', href:'vendors.html'},
      {id:'spend',   label:'Spend',       icon:'zap',  href:'spend.html'}
    ],
    frontdesk: [
      {id:'auth', label:'Prior Authorization', icon:'shield', href:'prior-auth.html'}
    ]
  };
  var ACTIVE_ROLE = { dashboard:'doctor', 'dashboard-ops':'staff', schedule:'staff', shopping:'staff', inventory:'staff', stock:'staff', receive:'staff', vendors:'staff', spend:'staff', alerts:'staff', auth:'frontdesk' };
  var TITLES = { dashboard:"Today", 'dashboard-ops':'Supply room', schedule:'Surgery schedule', shopping:'Smart shopping list', inventory:'Inventory', stock:'Inventory', receive:'Receive a delivery',
    vendors:'Vendors & settings', spend:'Supply spend', alerts:'Alerts & reorder', auth:'Prior-authorization queue' };
  var ROLE = {
    doctor:    {label:'Doctor',      who:'Dr. Giuffrida', sub:'Owner · review only', av:'TG'},
    staff:     {label:'Supply room', who:'Jess · MA',     sub:'Receives, counts, orders', av:'JS'},
    frontdesk: {label:'Front desk',  who:'Front desk',    sub:'Insurance & prior-auth', av:'FD'}
  };

  /* ---------- SHELL ---------- */
  function mount(opts){
    opts=opts||{}; var active=opts.active||'dashboard';
    var role = opts.role || ACTIVE_ROLE[active] || state.role || 'staff';
    if(role!==state.role){ state.role=role; save(); }
    document.documentElement.setAttribute('data-role', role);

    var nav=(NAV_BY_ROLE[role]||[]).map(function(n){
      var on=(n.id===active)?' active':'';
      var badge=n.badge?'<span class="badge">'+n.badge+'</span>':'';
      return '<a class="nav-i'+on+'" href="'+n.href+'">'+icon(n.icon)+'<span>'+n.label+'</span>'+badge+'</a>';
    }).join('');
    var r=ROLE[role]||ROLE.staff;
    var side=document.getElementById('sidebar');
    if(side) side.innerHTML=
      '<a class="s-brand" href="index.html" style="text-decoration:none"><svg class="logo" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="tjbrand" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#2c7a62"/><stop offset="1" stop-color="#15402f"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#tjbrand)"/><path d="M15 9.5C20.5 8 23.8 10.2 23.8 13.6 23.8 15.4 27 15.7 27.6 18.4 27.9 19.8 25 20 24.9 21.4 24.8 23 26.2 23.4 24.7 25 23.6 26.3 22 27.4 20.2 28.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 9.5V28.5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.85"/><path d="M10 30.5H26" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.55"/></svg>'+
      '<span class="wm"><b>Dermatology &amp;<br>Skin&nbsp;Cancer&nbsp;Center</b><span>'+r.label+'</span></span></a>'+
      '<nav>'+nav+'</nav>'+
      '<a class="nav-i switch" href="index.html">'+icon('swap')+'<span>Switch user</span></a>'+
      '<div class="s-foot">Prototype · sample, de-identified data<br>Coral Gables, FL · HIPAA / CLIA</div>';

    var top=document.getElementById('topbar');
    if(top) top.innerHTML=
      '<button class="tb-burger" aria-label="Menu" onclick="TJ.toggleNav()">'+icon('menu')+'</button>'+
      '<div><h1>'+(TITLES[active]||'Dermatology & Skin Cancer Center')+'</h1><div class="crumb">'+r.label+' · live prototype</div></div>'+
      '<div class="spacer"></div>'+
      '<a class="btn ghost sm" href="index.html">'+icon('swap','ico-sm')+'Switch user</a>'+
      '<div class="who"><div class="av">'+r.av+'</div><div class="meta"><div class="nm">'+r.who+'</div><div class="rl">'+r.sub+'</div></div></div>';

    if(opts.onReady) setTimeout(function(){ try{ opts.onReady(state); }catch(e){ console.error(e); } },0);
  }

  function enter(role){ state.role=role; save(); var nav=NAV_BY_ROLE[role]; location.href=(nav&&nav[0]?nav[0].href:'dashboard.html'); }
  function setRole(r){ state.role=r; save(); document.documentElement.setAttribute('data-role',r); }
  function setTheme(){ /* single theme — no-op kept for compatibility */ }
  function toggleNav(){ var a=qs('.app'); if(a) a.classList.toggle('nav-open'); }

  /* ---------- TOAST ---------- */
  var tEl,tTimer;
  function toast(msg, ok){
    if(!tEl){ tEl=document.createElement('div'); tEl.className='toast'; document.body.appendChild(tEl); }
    tEl.innerHTML=(ok!==false?icon('check','ico-sm'):'')+'<span>'+msg+'</span>';
    tEl.classList.add('show'); clearTimeout(tTimer);
    tTimer=setTimeout(function(){ tEl.classList.remove('show'); },2400);
  }

  /* ---------- money + modal/form ---------- */
  function money(n){ n=Math.round((+n||0)*100)/100; return '$'+n.toLocaleString('en-US',{minimumFractionDigits:(n%1?2:0),maximumFractionDigits:2}); }
  var _modal;
  function modal(o){
    closeModal();
    _modal=document.createElement('div'); _modal.className='modal-wrap';
    var body=(o.fields||[]).map(function(f){
      var ip;
      if(f.type==='select'){ ip='<select name="'+f.name+'">'+(f.options||[]).map(function(op){var v=(op&&op.value!=null?op.value:op),l=(op&&op.label!=null?op.label:op);return '<option value="'+v+'"'+(String(v)===String(f.value)?' selected':'')+'>'+l+'</option>';}).join('')+'</select>'; }
      else if(f.type==='static'){ ip='<div class="input" style="background:var(--panel-3);border-style:dashed">'+(f.value||'')+'</div>'; }
      else { ip='<input name="'+f.name+'" type="'+(f.type||'text')+'" value="'+(f.value!=null?f.value:'')+'" placeholder="'+(f.placeholder||'')+'"'+((f.type==='number')?' inputmode="decimal"':'')+'>'; }
      return '<div class="field" style="margin-bottom:13px"><label>'+f.label+(f.hint?' <span class="tiny" style="text-transform:none;letter-spacing:0">'+f.hint+'</span>':'')+'</label>'+ip+'</div>';
    }).join('');
    _modal.innerHTML='<div class="modal-bd"></div><div class="modal" role="dialog" aria-modal="true">'+
      '<div class="modal-h"><strong>'+o.title+'</strong>'+(o.sub?'<div class="tiny" style="margin-top:3px">'+o.sub+'</div>':'')+
      '<button class="modal-x" aria-label="Close">'+icon('x','ico-sm')+'</button></div>'+
      '<form class="modal-b" id="tjform" onsubmit="return false">'+body+'</form>'+
      '<div class="modal-f"><button class="btn ghost" type="button" data-x>Cancel</button>'+
      '<button class="btn primary" type="button" id="tjok">'+(o.submitLabel||'Save')+'</button></div></div>';
    document.body.appendChild(_modal);
    _modal.querySelector('.modal-bd').onclick=closeModal;
    _modal.querySelector('.modal-x').onclick=closeModal;
    _modal.querySelector('[data-x]').onclick=closeModal;
    _modal.querySelector('#tjok').onclick=function(){
      var out={}; qsa('#tjform [name]',_modal).forEach(function(el){ out[el.name]=el.value; });
      if(o.onSubmit && o.onSubmit(out)===false) return;
      closeModal();
    };
    setTimeout(function(){ var fi=_modal.querySelector('input,select'); if(fi) fi.focus(); },30);
  }
  function closeModal(){ if(_modal){ _modal.remove(); _modal=null; } }

  function qs(s,r){return (r||document).querySelector(s);} function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

  /* ---------- smart vendor-order email (AYC draft-email, ported client-side) ----------
     Builds a ready-to-send order email for one vendor from the live reorder list,
     explaining WHY (the booked schedule that drives the quantities). */
  function draftVendorEmail(vendorId){
    var v=(w.STORE.vendor(vendorId)||{});
    var groups=(w.INV?w.INV.reorderByVendor():[]);
    var g=groups.filter(function(x){return x.vendorId===vendorId;})[0];
    var subject='Supply order — Dermatology & Skin Cancer Center'+(v.acct?' (acct '+v.acct+')':'');
    if(!g||!g.lines.length){ return {subject:subject, body:'Hi '+(v.name||'there')+' team,\n\nNothing needs ordering from you right now — our stock covers the booked schedule. Thank you!\n\nSupply Room — Dermatology & Skin Cancer Center', total:0, count:0}; }
    var load=(w.INV?w.INV.procedureLoad(7):{total:0});
    var lines=g.lines.map(function(r){
      var why=Object.keys(r.drivers||{}).map(function(t){return r.drivers[t]+' '+t;}).join(', ');
      return '  • '+r.qty+' × '+r.it.name+' ('+r.it.unit+')'+(why?'   — for '+why:'');
    }).join('\n');
    var lead=(v.leadDays!=null?v.leadDays:3);
    var body=''+
'Hi '+(v.name||'there')+' team,\n\n'+
'Please process the following order for the Dermatology & Skin Cancer Center'+(v.acct?' (account '+v.acct+')':'')+':\n\n'+
lines+'\n\n'+
'These quantities cover our booked surgical schedule for the coming week ('+load.total+' cases) plus par levels. '+
'Please confirm availability and expected delivery against your usual '+lead+'-day lead time.\n\n'+
'Ship to: Dermatology & Skin Cancer Center, Coral Gables, FL.\n\n'+
'Thank you,\nSupply Room — Dermatology & Skin Cancer Center';
    return {subject:subject, body:body, total:g.cost, count:g.lines.length, group:g};
  }

  w.TJ={ icon:icon, mount:mount, enter:enter, setRole:setRole, setTheme:setTheme, toggleNav:toggleNav,
         toast:toast, state:state, save:save, qs:qs, qsa:qsa,
         money:money, modal:modal, closeModal:closeModal, draftVendorEmail:draftVendorEmail,
         ROLE:ROLE, NAV_BY_ROLE:NAV_BY_ROLE };
})(window);
