/* ============================================================
   TJ DERM — shared app runtime
   - SVG icon set (Lucide-style, no emoji)
   - persistent state (localStorage)  -> every click sticks
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
    home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'
  };
  function icon(name, cls){ return '<svg class="ico '+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[name]||'')+'</svg>'; }

  /* ---------- STATE ---------- */
  var KEY='tjderm.v1';
  var DEFAULT={ theme:'clinical', role:'doctor', autoReorder:false, approvals:{}, pos:{}, received:[] };
  function load(){ try{ return Object.assign({},DEFAULT,JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){ return Object.assign({},DEFAULT); } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
  var state = load();

  /* ---------- NAV ---------- */
  var NAV=[
    {sec:'Operations'},
    {id:'dashboard', label:'Dashboard',  icon:'dashboard', href:'dashboard.html'},
    {id:'stock',     label:'Stock',      icon:'box',       href:'stock.html'},
    {id:'receive',   label:'Receive',    icon:'scan',      href:'receive-scan.html'},
    {id:'alerts',    label:'Alerts & Reorder', icon:'bell', href:'alerts.html', badge:5},
    {id:'auth',      label:'Prior Authorization', icon:'shield', href:'prior-auth.html', badge:3},
    {sec:'Design concepts'},
    {id:'dashboard-ops', label:'Dashboard · ops view', icon:'list', href:'dashboard-ops.html', alt:true},
    {id:'receive-grid',  label:'Receive · fast grid', icon:'keyboard', href:'receive-grid.html', alt:true},
    {id:'receive-guided',label:'Receive · guided',    icon:'sparkles', href:'receive-guided.html', alt:true}
  ];
  var TITLES={dashboard:'Dashboard','dashboard-ops':'Dashboard · operations view',stock:'Stock on hand',
    receive:'Receive a shipment','receive-grid':'Receive · fast grid','receive-guided':'Receive · guided',
    alerts:'Alerts & reorder',auth:'Insurance prior-authorization'};

  var PEOPLE={ doctor:{av:'TG',nm:'Dr. Giuffrida',rl:'Owner · review & approve'},
               staff:{av:'JS',nm:'Jess · front desk',rl:'Staff · full access'} };

  /* ---------- SHELL ---------- */
  function mount(opts){
    opts=opts||{}; var active=opts.active||'dashboard';
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.setAttribute('data-role', state.role);

    // sidebar
    var nav=NAV.map(function(n){
      if(n.sec) return '<div class="s-sec">'+n.sec+'</div>';
      var on=(n.id===active)?' active':'';
      var badge=n.badge?'<span class="badge">'+n.badge+'</span>':'';
      return '<a class="nav-i'+(n.alt?' alt':'')+on+'" href="'+n.href+'">'+icon(n.icon)+'<span>'+n.label+'</span>'+badge+'</a>';
    }).join('');
    var side=document.getElementById('sidebar');
    if(side) side.innerHTML=
      '<div class="s-brand"><img class="logo" src="assets/img/logo.svg" alt="TJ DERM"/>'+
      '<span class="wm"><b>TJ&nbsp;DERM</b><span>Inventory &amp; Auth</span></span></div>'+
      '<nav>'+nav+'</nav>'+
      '<div class="s-foot">Prototype · sample, de-identified data<br>Coral Gables, FL · HIPAA / CLIA</div>';

    // topbar
    var who=PEOPLE[state.role];
    var top=document.getElementById('topbar');
    if(top) top.innerHTML=
      '<button class="tb-burger" aria-label="Menu" onclick="TJ.toggleNav()">'+icon('menu')+'</button>'+
      '<div><h1>'+(TITLES[active]||'TJ DERM')+'</h1><div class="crumb">Tuesday · live prototype</div></div>'+
      '<div class="spacer"></div>'+
      '<div class="seg role" role="group" aria-label="Role">'+
        '<button id="r-doc" class="'+(state.role==='doctor'?'on':'')+'" onclick="TJ.setRole(\'doctor\')">'+icon('stetho','ico-sm')+'<span class="lbl">Doctor</span></button>'+
        '<button id="r-staff" class="'+(state.role==='staff'?'on':'')+'" onclick="TJ.setRole(\'staff\')">'+icon('box','ico-sm')+'<span class="lbl">Staff</span></button>'+
      '</div>'+
      '<div class="swatches" role="group" aria-label="Theme">'+
        '<div class="sw clinical '+(state.theme==='clinical'?'on':'')+'" title="Clinical" onclick="TJ.setTheme(\'clinical\')"></div>'+
        '<div class="sw midnight '+(state.theme==='midnight'?'on':'')+'" title="Midnight" onclick="TJ.setTheme(\'midnight\')"></div>'+
        '<div class="sw warm '+(state.theme==='warm'?'on':'')+'" title="Warm" onclick="TJ.setTheme(\'warm\')"></div>'+
      '</div>'+
      '<div class="who"><div class="av">'+who.av+'</div><div class="meta"><div class="nm">'+who.nm+'</div><div class="rl">'+who.rl+'</div></div></div>';

    if(opts.onReady) opts.onReady(state);
  }

  function setTheme(t){ state.theme=t; save(); document.documentElement.setAttribute('data-theme',t);
    qsa('.sw').forEach(function(s){ s.classList.toggle('on', s.classList.contains(t)); }); }
  function setRole(r){ state.role=r; save(); document.documentElement.setAttribute('data-role',r);
    var d=document.getElementById('r-doc'), s=document.getElementById('r-staff');
    if(d) d.classList.toggle('on',r==='doctor'); if(s) s.classList.toggle('on',r==='staff');
    var who=PEOPLE[r], av=qs('.who .av'), nm=qs('.who .nm'), rl=qs('.who .rl');
    if(av) av.textContent=who.av; if(nm) nm.textContent=who.nm; if(rl) rl.textContent=who.rl;
    document.dispatchEvent(new CustomEvent('tj:role',{detail:r}));
    toast(r==='doctor'?'Doctor view — review & approve only':'Staff view — receive, count & adjust'); }
  function toggleNav(){ var a=qs('.app'); if(a) a.classList.toggle('nav-open'); }

  /* ---------- TOAST ---------- */
  var tEl,tTimer;
  function toast(msg, ok){
    if(!tEl){ tEl=document.createElement('div'); tEl.className='toast'; document.body.appendChild(tEl); }
    tEl.innerHTML=(ok!==false?icon('check','ico-sm'):'')+'<span>'+msg+'</span>';
    tEl.classList.add('show'); clearTimeout(tTimer);
    tTimer=setTimeout(function(){ tEl.classList.remove('show'); },2400);
  }

  function qs(s,r){return (r||document).querySelector(s);} function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

  w.TJ={ icon:icon, mount:mount, setTheme:setTheme, setRole:setRole, toggleNav:toggleNav,
         toast:toast, state:state, save:save, qs:qs, qsa:qsa };
})(window);
