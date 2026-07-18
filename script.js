// Apply saved theme before paint
(function() {
  try {
    var s = localStorage.getItem('theme');
    if (s) document.body.setAttribute('data-theme', s);
  } catch(e) {}
})();

var overlay, fading = false;

window.addEventListener('DOMContentLoaded', function() {
  overlay = document.getElementById('theme-overlay');

  // Email copy
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
});

function toggleTheme() {
  if (!overlay || fading) return;
  fading = true;
  var isDark = document.body.getAttribute('data-theme') === 'dark';
  var next = isDark ? 'light' : 'dark';

  overlay.style.background = isDark ? '#0D0D0D' : '#ffffff';
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

// ── FAQ ACCORDION ──
window.addEventListener('DOMContentLoaded', function() {
  var triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var item = trigger.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function(i) {
        i.classList.remove('open');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
});

// ── CUSTOM DROPDOWNS ──
window.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.dropdown').forEach(function(dropdown) {
    var trigger = dropdown.querySelector('.dropdown-trigger');
    var valueEl = dropdown.querySelector('.dropdown-value');
    var hiddenInput = dropdown.querySelector('input[type="hidden"]');
    var options = dropdown.querySelectorAll('.dropdown-option');

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');

      document.querySelectorAll('.dropdown.open').forEach(function(d) {
        d.classList.remove('open');
        d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        var text = opt.textContent.trim();
        valueEl.textContent = text;
        hiddenInput.value = text;
        trigger.classList.add('has-value');

        options.forEach(function(o) { o.classList.remove('selected'); });
        opt.classList.add('selected');

        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');

        maybeRefresh(dropdown.closest('form'));
      });
    });
  });

  document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown.open').forEach(function(d) {
      d.classList.remove('open');
      d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });
});

// Resets a dropdown to its empty/placeholder state
function resetDropdown(dropdown) {
  var trigger = dropdown.querySelector('.dropdown-trigger');
  var valueEl = dropdown.querySelector('.dropdown-value');
  var hiddenInput = dropdown.querySelector('input[type="hidden"]');
  valueEl.textContent = valueEl.getAttribute('data-placeholder');
  hiddenInput.value = '';
  trigger.classList.remove('has-value');
  dropdown.classList.remove('invalid', 'open');
  dropdown.querySelectorAll('.dropdown-option.selected').forEach(function(o) {
    o.classList.remove('selected');
  });
}

// ── FORM VALIDATION + ERROR UI ──
// Nothing is checked while the user is typing. Only clicking the submit
// button runs the check; after that first attempt, fixes are reflected live.
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pure check — no DOM mutation. Returns { valid, type: 'missing'|'email'|null }
function computeValidity(form) {
  var name = form.querySelector('#fieldName').value.trim();
  var email = form.querySelector('#fieldEmail').value.trim();
  var about = form.querySelector('#fieldAbout').value.trim();
  var service = form.querySelector('#fieldService').value;
  var budget = form.querySelector('#fieldBudget').value;

  if (!name || !email || !service || !budget || !about) {
    return { valid: false, type: 'missing' };
  }
  if (!EMAIL_RE.test(email)) {
    return { valid: false, type: 'email' };
  }
  return { valid: true, type: null };
}

// Re-checks the whole form and updates: per-field red-800 borders, the
// warning banner, and whether the submit button is enabled.
function refreshFormUI(form) {
  if (!form) return;
  var result = computeValidity(form);

  var nameInput = form.querySelector('#fieldName');
  var emailInput = form.querySelector('#fieldEmail');
  var aboutInput = form.querySelector('#fieldAbout');
  var serviceDropdown = form.querySelector('.dropdown[data-name="service"]');
  var budgetDropdown = form.querySelector('.dropdown[data-name="budget"]');

  nameInput.classList.toggle('invalid', !nameInput.value.trim());
  var emailVal = emailInput.value.trim();
  emailInput.classList.toggle('invalid', !emailVal || !EMAIL_RE.test(emailVal));
  aboutInput.classList.toggle('invalid', !aboutInput.value.trim());
  if (serviceDropdown) serviceDropdown.classList.toggle('invalid', !form.querySelector('#fieldService').value);
  if (budgetDropdown) budgetDropdown.classList.toggle('invalid', !form.querySelector('#fieldBudget').value);

  var banner = document.getElementById('formError');
  var text = document.getElementById('formErrorText');
  if (banner && text) {
    if (!result.valid) {
      text.textContent = result.type === 'email'
        ? 'The email address is not entered correctly.'
        : 'Please fill in all the fields.';
      banner.classList.add('show');
    } else {
      banner.classList.remove('show');
    }
  }

  var btn = form.querySelector('.btn-cook');
  if (btn) btn.disabled = !result.valid;

  return result;
}

// Only re-checks live once the user has already tried to submit once
function maybeRefresh(form) {
  if (!form || form.dataset.attempted !== '1') return;
  refreshFormUI(form);
}

window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('projectForm');
  if (form) {
    ['fieldName', 'fieldEmail', 'fieldAbout'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function() { maybeRefresh(form); });
    });
  }
});

// ── PROJECT MODAL ──
function openProjectModal() {
  var backdrop = document.getElementById('modalBackdrop');
  if (!backdrop) return;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  var backdrop = document.getElementById('modalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.style.overflow = '';

  // Don't remember anything between visits — wipe the form on close
  var form = document.getElementById('projectForm');
  if (form) {
    form.reset();
    form.querySelectorAll('.dropdown').forEach(resetDropdown);
    form.querySelectorAll('.invalid').forEach(function(el) { el.classList.remove('invalid'); });
    form.dataset.attempted = '0';
    var banner = document.getElementById('formError');
    if (banner) banner.classList.remove('show');
    var btn = form.querySelector('.btn-cook');
    if (btn) btn.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', function() {
  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeProjectModal();
  });

  // Form submit — first click runs the check; only sends if everything's valid
  var form = document.getElementById('projectForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      form.dataset.attempted = '1';
      var result = refreshFormUI(form);
      if (result.valid) submitProjectForm(form);
    });
  }
});

// ── TELEGRAM SUBMISSION ──
var TELEGRAM_BOT_TOKEN = '8432468154:AAE2o9LOHCioen1MAAcy3gjjf-PE6S34hrA';
var TELEGRAM_CHAT_ID = '6493948562';

function submitProjectForm(form) {
  var serviceInput = form.querySelector('#fieldService');
  var budgetInput = form.querySelector('#fieldBudget');

  var submitBtn = form.querySelector('.btn-cook');
  var originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  var data = new FormData(form);
  var name = (data.get('name') || '').trim();
  var email = (data.get('email') || '').trim();
  var service = serviceInput.value;
  var budget = budgetInput.value;
  var about = (data.get('about') || '').trim();

  var message =
    '🍳 New project inquiry\n\n' +
    '👤 Name: ' + name + '\n' +
    '✉️ Email: ' + email + '\n' +
    '🛠️ Service: ' + service + '\n' +
    '💰 Budget: ' + budget + '\n\n' +
    '📝 About:\n' + about;

  var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(result) {
    if (result.ok) {
      submitBtn.textContent = 'Sent!';
      setTimeout(function() {
        closeProjectModal(); // also wipes the form + resets the button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 900);
    } else {
      throw new Error('Telegram API error');
    }
  })
  .catch(function() {
    submitBtn.textContent = 'Failed — try again';
    submitBtn.disabled = false;
    setTimeout(function() {
      submitBtn.innerHTML = originalText;
    }, 2200);
  });
}
