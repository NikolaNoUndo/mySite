// Theme
function toggleTheme() {
  var d = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', d ? 'light' : 'dark');
  try { localStorage.setItem('theme', d ? 'light' : 'dark'); } catch(e){}
}
(function(){
  try { var s = localStorage.getItem('theme'); if(s) document.body.setAttribute('data-theme', s); } catch(e){}
})();

// Email copy with popup
document.querySelectorAll('.email-copy').forEach(function(el) {
  el.addEventListener('click', function() {
    var email = el.getAttribute('data-email');
    navigator.clipboard.writeText(email).then(function() {
      showToast(el);
    }).catch(function() {
      var t = document.createElement('textarea');
      t.value = email; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
      showToast(el);
    });
  });
});

function showToast(el) {
  el.classList.add('show-toast');
  setTimeout(function(){ el.classList.remove('show-toast'); }, 1800);
}
