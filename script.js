// Apply saved theme immediately — before paint, no flash
(function() {
  try {
    var s = localStorage.getItem('theme');
    if (s) document.body.setAttribute('data-theme', s);
  } catch(e) {}
})();

var overlay;
var fading = false;

window.addEventListener('DOMContentLoaded', function() {
  overlay = document.getElementById('theme-overlay');

  // ── EMAIL COPY ──
  document.querySelectorAll('.email-copy').forEach(function(el) {
    el.addEventListener('click', function() {
      var email = el.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(function() {
        showToast(el);
      }).catch(function() {
        var t = document.createElement('textarea');
        t.value = email;
        t.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        showToast(el);
      });
    });
  });

  // ── BACK TO TOP ──
  var backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, { passive: true });

    backBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

function toggleTheme() {
  if (!overlay || fading) return;
  fading = true;

  var isDark = document.body.getAttribute('data-theme') === 'dark';
  var next = isDark ? 'light' : 'dark';

  overlay.style.background = isDark ? '#0f0f0f' : '#ffffff';
  overlay.style.opacity = '1';

  setTimeout(function() {
    document.body.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
    overlay.style.opacity = '0';
    setTimeout(function() { fading = false; }, 220);
  }, 200);
}

function showToast(el) {
  el.classList.add('show-toast');
  setTimeout(function() { el.classList.remove('show-toast'); }, 1800);
}
