/* ============================================================
   Dermatology & Skin Cancer Center — GUIDED TOUR engine
   A chaptered, story-driven walkthrough that uses the REAL
   STORE/INV engine. One action per scene. Foolproof: a 10-year-
   old can follow it alone. Every number that moves is genuine.
   ============================================================ */
(function (w) {
  "use strict";
  var icon = w.TJ.icon, money = w.TJ.money;
  var host, i = 0;

  /* ---------- small helpers ---------- */
  function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d.firstElementChild; }
  function lido(){ return INV.onHand(STORE.item('i-lido')); }
  function gauze(){ return INV.onHand(STORE.item('i-gauze')); }
  function burst(node){
    var b=document.createElement('div'); b.className='confetti';
    var colors=['#1e5c4a','#cf8a26','#2f8f5b','#c8861f','#fffdf8'];
    for(var k=0;k<26;k++){ var p=document.createElement('i');
      p.style.setProperty('--x',(Math.random()*2-1).toFixed(2));
      p.style.setProperty('--d',(0.5+Math.random()*0.5).toFixed(2));
      p.style.background=colors[k%colors.length];
      p.style.left=(45+Math.random()*10)+'%'; b.appendChild(p); }
    (node||document.body).appendChild(b);
    setTimeout(function(){ b.remove(); },1400);
  }

  /* ---------- SCENES ---------- */
  var SCENES = [

  /* 0 — COVER */
  { passive:true, kicker:'A guided tour · 90 seconds',
    body:function(){ return ''+
      '<div class="sc-cover">'+
        '<div class="logo-xl">'+brandMark()+'</div>'+
        '<h1>The supply room that<br><em>runs itself.</em></h1>'+
        '<p class="lede">See exactly how Dr. Giuffrida’s practice would receive supplies, never run out, '+
        'and keep insurance moving — without anyone keeping a list in their head.</p>'+
        '<button class="big-cta" onclick="TOUR.next()">Show me how it works '+icon('arrow')+'</button>'+
        '<div class="cover-foot">You’ll tap a few buttons. Real numbers move. Takes about a minute and a half.</div>'+
      '</div>'; } },

  /* 1 — THE PROBLEM */
  { passive:true, kicker:'The problem', title:'Right now, all of this lives in someone’s head.',
    lead:'A busy skin-cancer practice burns through hundreds of supplies a week. Today, three things quietly go wrong:',
    body:function(){ return cards([
      ['x','Things run out mid-surgery','You reach for a curette during a Mohs case — and it’s the last one. No one saw it coming.'],
      ['clock','Medicine expires on the shelf','Boxes get pushed to the back, expire, and get thrown away. That’s money in the trash.'],
      ['shield','Insurance approvals stall','A prior-authorization sits for days. The patient waits. Nobody’s tracking it.']
    ]); } },

  /* 2 — THE IDEA */
  { passive:true, kicker:'The idea', title:'One shared brain. Three simple screens.',
    lead:'Everyone works from the same live information — but each person only sees the screen built for their job.',
    body:function(){ return ''+
      '<div class="who-row">'+
        whoCard('box','Supply room','Tablet','Scans deliveries in, taps once after each case. Never makes a list.')+
        whoCard('stetho','Dr. Giuffrida','Phone','Glances for 5 seconds. Approves with one tap. Never types.')+
        whoCard('shield','Front desk','Desktop','Moves every insurance approval forward, in order of what’s on fire.')+
      '</div>'+
      '<div class="brain-note">'+icon('sparkles')+'<span>Behind all three: about 15 live formulas counting, predicting and reordering — automatically. Let’s watch it work.</span></div>'; } },

  /* 3 — RECEIVE (interactive) */
  { kicker:'Scene 1 · Supply room', title:'A delivery just arrived.',
    lead:'A box of surgical gauze showed up at the front desk. Instead of writing it in a notebook, the assistant just scans it.',
    body:function(){ return ''+
      '<div class="stage-card">'+
        '<div class="count-line">Surgical gauze 4×4 — on hand now: <b id="rcount">'+gauze()+'</b> packs</div>'+
        '<div class="scanbox" id="scanbox">'+
          '<div class="scanline"></div>'+
          icon('scan')+
          '<div class="scan-label">UDI &middot; (01)00819… lot GZ-9901</div>'+
        '</div>'+
        '<button class="big-cta" id="doScan">'+icon('scan')+'Scan the box</button>'+
      '</div>'; },
    mount:function(){
      var btn=document.getElementById('doScan'), box=document.getElementById('scanbox');
      function finish(){ box.classList.remove('scanning'); box.classList.add('done');
        document.getElementById('rcount').textContent=gauze();
        TOUR.done('Logged in 2 seconds. Lot &amp; expiry captured automatically — no typing.'); }
      if(gauze()>=200){ btn.disabled=true; finish(); return; }   // already scanned (revisited)
      btn.onclick=function(){
        box.classList.add('scanning'); this.disabled=true;
        setTimeout(function(){
          if(gauze()<200) STORE.receive({itemId:'i-gauze', qty:120, lot:'GZ-9901', expDays:300, user:'Jess'});
          document.getElementById('rcount').classList.add('pop'); finish();
        },1100);
      };
    } },

  /* 4 — LOG A CASE (interactive) */
  { kicker:'Scene 2 · Supply room', title:'Three Mohs surgeries this morning.',
    lead:'After each case, the assistant taps once and the kit is deducted. Watch what the supply of lidocaine (the numbing medicine) does.',
    body:function(){ return ''+
      '<div class="stage-card">'+
        '<div class="count-line">Lidocaine 1% — on hand: <b id="lcount">'+lido()+'</b> vials '+
          '<span class="reorder-at">reorder line: 6</span></div>'+
        '<div class="bar-track"><div class="bar-fill" id="lbar"></div><div class="bar-line"></div></div>'+
        '<button class="big-cta" id="doCase">'+icon('check')+'Log the morning’s cases</button>'+
        '<div id="caseResult"></div>'+
      '</div>'; },
    mount:function(){ paintBar();
      var btn=document.getElementById('doCase');
      function flag(){ document.getElementById('caseResult').innerHTML =
          '<div class="auto-flag">'+icon('zap')+
          '<div><b>Lidocaine just hit its reorder line.</b> The system already drafted an order to Henry Schein — '+
          'before anyone noticed. The doctor will see it on his phone tomorrow.</div></div>';
        TOUR.done('Stock counts itself down. The reorder writes itself.'); }
      if(lido()<=6){ btn.disabled=true; flag(); return; }        // already logged (revisited)
      btn.onclick=function(){
        this.disabled=true;
        STORE.logCase({type:'Mohs surgery (×3)', who:'Jess', items:[
          {itemId:'i-lido',qty:3},{itemId:'i-gauze',qty:12},{itemId:'i-cur',qty:3},
          {itemId:'i-nylon',qty:2},{itemId:'i-tray',qty:3},{itemId:'i-gloves',qty:6}
        ]});
        var c=document.getElementById('lcount'); c.textContent=lido(); c.classList.add('pop'); paintBar(); flag();
      };
    } },

  /* 5 — DOCTOR APPROVES (interactive, phone) */
  { kicker:'Scene 3 · The doctor’s phone', title:'Next morning. A 5-second glance.',
    lead:'Dr. Giuffrida opens his phone between patients. He doesn’t type, count, or scroll. One thing needs him.',
    body:function(){ return ''+
      '<div class="phone-wrap"><div class="phone"><div class="phone-notch"></div>'+
        '<div class="phone-screen" id="docScreen">'+docHome()+'</div>'+
      '</div></div>'; },
    mount:function(){
      if(lidoOrdered()){ showOrdered(false); return; }   // already approved (revisited)
      wireApprove();
    } },

  /* 6 — FRONT DESK (interactive) */
  { kicker:'Scene 4 · Front desk', title:'Meanwhile — insurance.',
    lead:'A new patient (J.R.) needs Mohs surgery approved by United Healthcare. The front desk moves it forward one step.',
    body:function(){ return ''+
      '<div class="stage-card">'+
        '<div class="pa-card" id="paCard">'+paRow()+'</div>'+
        '<button class="big-cta" id="doPA">'+icon('arrow')+'Submit it to the insurer</button>'+
      '</div>'; },
    mount:function(){
      var btn=document.getElementById('doPA');
      var pa=STORE.data().priorAuth.filter(function(p){return p.id==='pa1';})[0]||{};
      function flag(){ TOUR.done('Every approval has an owner and a clock. Nothing falls through the cracks.'); }
      if(pa.stage!=='Draft'){ btn.disabled=true; flag(); return; }  // already advanced (revisited)
      btn.onclick=function(){
        this.disabled=true;
        STORE.advancePriorAuth('pa1','Front desk');
        var card=document.getElementById('paCard'); card.innerHTML=paRow(); card.classList.add('flash');
        flag();
      };
    } },

  /* 7 — RECAP + HANDOFF */
  { passive:true, kicker:'That’s the whole thing', title:'You just ran the practice in 90 seconds.',
    lead:'No notebooks. No “I think we’re low.” No forgotten approvals. Here’s what just happened on its own:',
    body:function(){ return ''+
      cards([
        ['box','It counts itself','Every delivery and every case updates the numbers instantly.'],
        ['zap','It reorders itself','The moment something hits its line, the order is drafted — before you run out.'],
        ['shield','Nothing is forgotten','Expiry dates and insurance approvals are tracked with a clock on each one.']
      ])+
      '<div class="handoff">'+
        '<div class="handoff-h">Now explore the real screens yourself —</div>'+
        '<div class="handoff-row">'+
          '<a class="ho-card" href="dashboard.html">'+icon('stetho')+'<b>Doctor</b><span>The phone glance</span></a>'+
          '<a class="ho-card" href="dashboard-ops.html">'+icon('box')+'<b>Supply room</b><span>Receive · count · order</span></a>'+
          '<a class="ho-card" href="prior-auth.html">'+icon('shield')+'<b>Front desk</b><span>Insurance queue</span></a>'+
        '</div>'+
        '<button class="replay" onclick="TOUR.restart()">'+icon('swap')+'Replay the tour</button>'+
      '</div>'; } }
  ];

  /* ---------- scene fragments ---------- */
  function brandMark(){ return '<svg width="64" height="64" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="tg" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#2c7a62"/><stop offset="1" stop-color="#15402f"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#tg)"/><path d="M15 9.5C20.5 8 23.8 10.2 23.8 13.6 23.8 15.4 27 15.7 27.6 18.4 27.9 19.8 25 20 24.9 21.4 24.8 23 26.2 23.4 24.7 25 23.6 26.3 22 27.4 20.2 28.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 9.5V28.5" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"/><path d="M10 30.5H26" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/></svg>'; }
  function cards(items){ return '<div class="prob-grid">'+items.map(function(c){
    return '<div class="prob-card"><div class="pc-ic">'+icon(c[0])+'</div><h3>'+c[1]+'</h3><p>'+c[2]+'</p></div>'; }).join('')+'</div>'; }
  function whoCard(ic,name,device,desc){ return ''+
    '<div class="who-card"><div class="wc-ic">'+icon(ic)+'</div>'+
    '<div class="wc-dev">'+device+'</div><h3>'+name+'</h3><p>'+desc+'</p></div>'; }
  function paintBar(){ var b=document.getElementById('lbar'); if(!b) return;
    var pct=Math.max(6,Math.min(100, Math.round(lido()/12*100)));
    b.style.width=pct+'%'; b.className='bar-fill'+(lido()<=6?' low':''); }
  function docHome(){
    var r=INV.reorderList().filter(function(x){return x.it.id==='i-lido';})[0];
    var qty=r?r.qty:18, vendor=r?r.vendor:'Henry Schein', cost=r?r.cost:0;
    return ''+
      '<div class="ph-head"><div class="ph-eyebrow">Wednesday · 7:52 AM</div>'+
        '<div class="ph-greet">Good morning, Dr. Giuffrida</div>'+
        '<div class="ph-sub">One thing needs you. Everything else is handled.</div></div>'+
      '<div class="ph-card" id="phCard">'+
        '<div class="ph-row"><span class="dot bad"></span>Lidocaine 1% — only '+lido()+' left</div>'+
        '<div class="ph-d">'+vendor+' · order '+qty+' vials · '+money(cost)+'</div>'+
        '<button class="ph-approve" id="phApprove">'+icon('check')+'Approve order</button>'+
      '</div>'+
      '<div class="ph-foot">'+icon('stetho')+'You never type. You just decide.</div>';
  }
  function lidoOrdered(){ return (STORE.data().pos||[]).some(function(p){return p.itemId==='i-lido';}); }
  function showOrdered(celebrate){
    var card=document.getElementById('phCard'); if(!card) return;
    card.innerHTML='<div class="ph-ok">'+icon('check')+'<b>Ordered.</b><span>Sent to Henry Schein. Arrives in 3 days.</span></div>';
    if(celebrate) burst(document.querySelector('.phone-screen'));
    TOUR.done('He never typed a word. One tap, and the practice is restocked.');
  }
  function wireApprove(){ var b=document.getElementById('phApprove'); if(!b) return;
    b.onclick=function(){
      if(!lidoOrdered()){ var r=INV.reorderList().filter(function(x){return x.it.id==='i-lido';})[0];
        if(r) STORE.purchase({itemId:'i-lido', qty:r.qty, user:'Dr. Giuffrida'}); }
      showOrdered(true);
    };
  }
  function paRow(){
    var pa=STORE.data().priorAuth.filter(function(p){return p.id==='pa1';})[0]||{};
    var idx=STORE.PA_ORDER.indexOf(pa.stage);
    var steps=STORE.PA_ORDER.map(function(s,n){
      return '<div class="pa-step'+(n<=idx?' on':'')+(n===idx?' cur':'')+'">'+
        '<span class="pa-dot"></span>'+s+'</div>'; }).join('<div class="pa-conn"></div>');
    return ''+
      '<div class="pa-top"><div><b>J.R.</b> · Mohs surgery <span class="cpt">CPT 17311</span></div>'+
        '<span class="pill '+(idx>=3?'ok':'warn')+'">'+pa.stage+'</span></div>'+
      '<div class="pa-ins">United Healthcare</div>'+
      '<div class="pa-track">'+steps+'</div>';
  }

  /* ---------- engine ---------- */
  function chrome(s){
    var n=SCENES.length, pct=Math.round((i)/(n-1)*100);
    var stepLabel = i===0 ? 'Start' : (i===n-1 ? 'Done '+icon('check','ico-sm') : i+' / '+(n-2));
    var head = s.title ? '<div class="sc-head"><div class="sc-kicker">'+s.kicker+'</div>'+
        '<h2>'+s.title+'</h2>'+(s.lead?'<p class="sc-lead">'+s.lead+'</p>':'')+'</div>' : '';
    var navRight = i===0 ? '' /* cover has its own big CTA */
      : s.passive
      ? (i<n-1 ? '<button class="nav-next" onclick="TOUR.next()">Continue '+icon('arrow')+'</button>' : '')
      : '<span class="nav-hint" id="navHint">↑ Tap the green button to continue</span>'+
        '<button class="nav-next locked" id="navNext" onclick="TOUR.next()" disabled>Continue '+icon('arrow')+'</button>';
    return ''+
      '<div class="tour-top">'+
        '<a class="tour-exit" href="index.html">'+icon('x')+'</a>'+
        '<div class="tour-prog"><div class="tour-prog-fill" style="width:'+pct+'%"></div></div>'+
        '<div class="tour-step">'+stepLabel+'</div>'+
      '</div>'+
      '<div class="tour-stage'+(s.passive?' passive':'')+'">'+head+
        '<div class="sc-body">'+s.body()+'</div>'+
      '</div>'+
      '<div class="tour-nav">'+
        (i>0?'<button class="nav-back" onclick="TOUR.prev()">'+icon('chevron','flip')+'Back</button>':'<span></span>')+
        '<div class="nav-right">'+navRight+'</div>'+
      '</div>';
  }
  function render(){
    host.innerHTML=chrome(SCENES[i]);
    host.querySelector('.tour-stage').scrollTop=0;
    var s=SCENES[i]; if(s.mount) setTimeout(s.mount,30);
    window.scrollTo(0,0);
  }
  function next(){ if(i<SCENES.length-1){ i++; render(); } }
  function prev(){ if(i>0){ i--; render(); } }
  function done(msg){
    var btn=document.getElementById('navNext'); var hint=document.getElementById('navHint');
    if(btn){ btn.disabled=false; btn.classList.remove('locked'); btn.classList.add('ready'); }
    if(hint){ hint.innerHTML=icon('check','ico-sm')+(msg||'Nice. Keep going.'); hint.classList.add('ok'); }
  }
  function restart(){ STORE.reset(); i=0; render(); }
  function start(node){ host=node; STORE.reset(); i=0; render(); }

  w.TOUR={ start:start, next:next, prev:prev, done:done, restart:restart };
})(window);
