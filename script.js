function toggleTheme() {
    const d = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', d ? 'light' : 'dark');
    try { localStorage.setItem('theme', d ? 'light' : 'dark'); } catch(e){}
  }
  (function(){
    try { const s = localStorage.getItem('theme'); if(s) document.body.setAttribute('data-theme', s); } catch(e){}
  })();
  // Clock with flip animation on digit change and smooth colon blink
  var _ck = { h0:'', h1:'', m0:'', m1:'' };

  function flipSeg(id, val) {
    const seg = document.getElementById('cks-'+id);
    if (!seg) return;
    const cur = seg.querySelector('span:not(.exit)');
    if (cur && cur.textContent === val) return;
    if (cur) {
      cur.classList.add('exit');
      setTimeout(function(){ if(cur.parentNode) cur.remove(); }, 320);
    }
    const neo = document.createElement('span');
    neo.textContent = val;
    neo.classList.add('enter');
    seg.appendChild(neo);
    setTimeout(function(){ neo.classList.remove('enter'); }, 320);
  }

  function initClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours() % 12 || 12).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    el.innerHTML =
      '<span class="clock-seg" id="cks-h0"><span>'+h[0]+'</span></span>' +
      '<span class="clock-seg" id="cks-h1"><span>'+h[1]+'</span></span>' +
      '<span class="clock-colon-el" id="cks-colon">:</span>' +
      '<span class="clock-seg" id="cks-m0"><span>'+m[0]+'</span></span>' +
      '<span class="clock-seg" id="cks-m1"><span>'+m[1]+'</span></span>' +
      '<span>&nbsp;</span>' +
      '<span class="clock-seg" id="cks-ap"><span>'+ampm+'</span></span>';
    _ck = { h0:h[0], h1:h[1], m0:m[0], m1:m[1], ap:ampm };
  }

  var _lastMinKey = -1;
  function tickClock() {
    const now = new Date();
    const h = String(now.getHours() % 12 || 12).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const sec = now.getSeconds();
    // colon blink
    const colon = document.getElementById('cks-colon');
    if (colon) colon.classList.toggle('dim', sec % 2 === 0);
    // flip digits on minute change
    const minKey = now.getHours() * 60 + now.getMinutes();
    if (minKey !== _lastMinKey) {
      flipSeg('h0', h[0]); flipSeg('h1', h[1]);
      flipSeg('m0', m[0]); flipSeg('m1', m[1]);
      flipSeg('ap', ampm);
      _lastMinKey = minKey;
    }
  }
  initClock();
  setInterval(tickClock, 1000);

  document.querySelectorAll('[data-copy]').forEach(function(el) {
    function doCopy() {
      navigator.clipboard.writeText(el.dataset.copy).then(function() {
        el.classList.add('copied');
        setTimeout(function(){ el.classList.remove('copied'); }, 2000);
      }).catch(function() {
        var t = document.createElement('textarea');
        t.value = el.dataset.copy; t.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
        el.classList.add('copied');
        setTimeout(function(){ el.classList.remove('copied'); }, 2000);
      });
    }
    el.addEventListener('click', doCopy);
    el.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') doCopy(); });
  });

  // CRT shutdown/power-on for avatar
  (function(){
    var wrap = document.getElementById('avatarWrap');
    var crtTop = document.getElementById('crtTop');
    var crtBot = document.getElementById('crtBot');
    var crtLine = document.getElementById('crtLine');
    if (!wrap) return;
    var isOff = false, animating = false;

    function easeIn(t){ return t*t*t; }
    function easeOut(t){ return 1-Math.pow(1-t,3); }

    function getSvg(){
      var theme = document.body.getAttribute('data-theme') || 'dark';
      return theme === 'dark'
        ? wrap.querySelector('.avatar-dark')
        : wrap.querySelector('.avatar-light');
    }

    function shutdown(){
      animating = true;
      var svg = getSvg();
      var start = performance.now();
      var dur = 600;
      function step(ts){
        var p = Math.min((ts-start)/dur, 1);
        if(p < 0.22){
          svg.style.opacity = Math.random()>0.3 ? 1 : 0.4+Math.random()*0.5;
        } else {
          var cp = (p-0.22)/0.78;
          var e = easeIn(cp);
          var pct = e*50;
          crtTop.style.height = pct+'%';
          crtBot.style.height = pct+'%';
          svg.style.opacity = Math.max(0, 1 - cp*2.2);
          if(cp>0.28 && cp<0.82){
            var lp = (cp-0.28)/0.54;
            crtLine.style.opacity = Math.sin(lp*Math.PI)*0.55;
            crtLine.style.height = '2px';
            crtLine.style.top = (50 - pct*0.12)+'%';
          } else {
            crtLine.style.opacity = 0;
          }
        }
        if(p<1){ requestAnimationFrame(step); }
        else {
          crtTop.style.height='50%'; crtBot.style.height='50%';
          svg.style.opacity=0; crtLine.style.opacity=0;
          wrap.classList.add('crt-off');
          isOff=true; animating=false;
        }
      }
      requestAnimationFrame(step);
    }

    function powerOn(){
      animating = true;
      wrap.classList.remove('crt-off');
      var svg = getSvg();
      svg.style.opacity = 0;
      var start = performance.now();
      var dur = 500;
      function step(ts){
        var p = Math.min((ts-start)/dur, 1);
        var e = easeOut(p);
        var pct = (1-e)*50;
        crtTop.style.height = pct+'%';
        crtBot.style.height = pct+'%';
        if(p>0.45){ svg.style.opacity = easeOut((p-0.45)/0.55); }
        if(p<1){ requestAnimationFrame(step); }
        else {
          crtTop.style.height='0%'; crtBot.style.height='0%';
          svg.style.opacity=1; isOff=false; animating=false;
        }
      }
      requestAnimationFrame(step);
    }

    function bootOn(){
      animating = true;
      wrap.classList.remove('crt-off');
      var svg = getSvg();
      svg.style.opacity = 0;
      var start = performance.now();
      var dur = 2800;
      var flickerDone = false;
      function step(ts){
        var p = Math.min((ts-start)/dur, 1);
        // phase 1 (0-0.18): tinja, ploče se jedva mrdaju
        if(p < 0.18){
          var fp = p/0.18;
          var wiggle = fp * 4;
          crtTop.style.height = (50 - wiggle)+'%';
          crtBot.style.height = (50 - wiggle)+'%';
          if(fp > 0.5 && Math.random() > 0.6){
            crtLine.style.opacity = (Math.random()*0.4).toString();
            crtLine.style.height = '1px';
            crtLine.style.top = (50 - wiggle*0.5)+'%';
          } else {
            crtLine.style.opacity = '0';
          }
        }
        // phase 2 (0.18-0.45): polako se otvaraju, svetlosna linija
        else if(p < 0.45){
          var cp = (p-0.18)/0.27;
          var pct = 50 - easeOut(cp)*32;
          crtTop.style.height = pct+'%';
          crtBot.style.height = pct+'%';
          crtLine.style.opacity = (Math.sin(cp*Math.PI)*0.5).toString();
          crtLine.style.height = '2px';
          crtLine.style.top = pct+'%';
          svg.style.opacity = '0';
        }
        // phase 3 (0.45-0.72): flicker logo pojavljuje se
        else if(p < 0.72){
          var cp2 = (p-0.45)/0.27;
          var pct2 = 18 - cp2*14;
          crtTop.style.height = pct2+'%';
          crtBot.style.height = pct2+'%';
          crtLine.style.opacity = '0';
          var flicker = Math.random()>0.4 ? cp2*0.9 : cp2*0.3;
          svg.style.opacity = Math.min(flicker, 0.85).toString();
        }
        // phase 4 (0.72-1.0): finalno otvaranje, logo stabilan
        else {
          var cp3 = (p-0.72)/0.28;
          var pct3 = (1-easeOut(cp3))*4;
          crtTop.style.height = pct3+'%';
          crtBot.style.height = pct3+'%';
          svg.style.opacity = (0.85 + easeOut(cp3)*0.15).toString();
        }
        if(p<1){ requestAnimationFrame(step); }
        else {
          crtTop.style.height='0%'; crtBot.style.height='0%';
          crtLine.style.opacity='0';
          svg.style.opacity='1';
          isOff=false; animating=false;
        }
      }
      requestAnimationFrame(step);
    }

    function toggle(){
      if(animating) return;
      if(isOff) powerOn(); else shutdown();
    }
    wrap.addEventListener('click', toggle);
    wrap.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') toggle(); });

    // boot: power-on animation on page load
    setTimeout(function(){
      wrap.classList.remove('crt-boot');
      bootOn();
    }, 600);
  })();