// ── Remove native tooltips & store labels ─────────────────
document.querySelectorAll('.icon-btn').forEach(btn => {
  btn._tipLabel = btn.getAttribute('title') || '';
  btn.removeAttribute('title');
});

const TOOLTIP_DELAY = 500;

// ── Generic tooltip helper ────────────────────────────────
function attachTooltip(el, text) {
  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.textContent = text;
  el.style.position = 'relative';
  el.appendChild(tip);
  let timer = null;
  el.addEventListener('mouseenter', () => { timer = setTimeout(() => tip.classList.add('visible'), TOOLTIP_DELAY); });
  el.addEventListener('mouseleave', () => { clearTimeout(timer); tip.classList.remove('visible'); });
  el.addEventListener('click',      () => { clearTimeout(timer); tip.classList.remove('visible'); });
  return tip;
}

// ── sender-to tooltip ─────────────────────────────────────
const senderToEl = document.querySelector('.sender-to');
const senderTip  = attachTooltip(senderToEl, 'Show details');

// ── Desktop icon-btn tooltips ─────────────────────────────
const tipMap = {
  'Star':         'Star',
  'Emoji':        'Add reaction',
  'Reply':        'Reply',
  'Mark as read': 'Mark as read',
  'Print':        'Print',
  'Open in new window': 'Open in new window',
};

document.querySelectorAll('.icon-btn').forEach(btn => {
  const label = tipMap[btn._tipLabel];
  if (label) attachTooltip(btn, label);
});

// ── Three-dots more menu ──────────────────────────────────
const moreBtn      = document.getElementById('moreBtn');
const moreDropdown = document.getElementById('moreDropdown');

moreBtn.addEventListener('click', e => {
  e.stopPropagation();
  moreDropdown.classList.toggle('open');
});

document.addEventListener('click', () => moreDropdown.classList.remove('open'));
moreDropdown.addEventListener('click', e => e.stopPropagation());

document.getElementById('menuPrint').addEventListener('click', () => {
  moreDropdown.classList.remove('open');
  window.print();
});

document.getElementById('menuNewWindow').addEventListener('click', () => {
  moreDropdown.classList.remove('open');
  window.open(window.location.href, '_blank');
});

// ── Desktop print + new window ────────────────────────────
document.querySelectorAll('.icon-btn').forEach(btn => {
  if (btn._tipLabel === 'Print') btn.addEventListener('click', () => window.print());
  if (btn._tipLabel === 'Open in new window') btn.addEventListener('click', () => window.open(window.location.href, '_blank'));
});

// ── Label × close ─────────────────────────────────────────
document.querySelector('.label-x').addEventListener('click', () => {
  document.querySelector('.label').style.display = 'none';
});

// ── Star — burst on star, unburst on unstar ───────────────
let starred = false;

function applyStarState(animate = true) {
  document.querySelectorAll('.icon-btn').forEach(btn => {
    if (btn._tipLabel !== 'Star') return;
    const img = btn.querySelector('img');
    if (!img) return;
    if (animate) {
      btn.classList.remove('star-animating', 'star-unstar-animating');
      void btn.offsetWidth;
      btn.classList.add(starred ? 'star-animating' : 'star-unstar-animating');
      btn.addEventListener('animationend', () => {
        btn.classList.remove('star-animating', 'star-unstar-animating');
      }, { once: true });
    }
    img.src = starred ? 'icons/star-filled.svg' : 'icons/star.svg';
    btn.classList.toggle('star-active', starred);
  });
  // Mobile menu
  const moreStarIcon  = document.getElementById('moreStarIcon');
  const moreStarLabel = document.getElementById('moreStarLabel');
  if (moreStarIcon)  moreStarIcon.src = starred ? 'icons/star-filled.svg' : 'icons/star.svg';
  if (moreStarLabel) moreStarLabel.textContent = starred ? 'Starred' : 'Star';
}

document.querySelectorAll('.icon-btn').forEach(btn => {
  if (btn._tipLabel === 'Star') btn.addEventListener('click', () => {
    starred = !starred;
    applyStarState(true);
  });
});

document.getElementById('menuStar')?.addEventListener('click', () => {
  moreDropdown.classList.remove('open');
  starred = !starred;
  applyStarState(false);
});

// ── Emoji picker — shared, changes favicon ────────────────
const emojis = ['✨','😐','😮','🔥','😢','🫨'];
let emojiMenu = null;
let activeEmoji = null;

function emojiToFavicon(emoji) {
  const canvas  = document.createElement('canvas');
  canvas.width  = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font          = '52px serif';
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText(emoji, 32, 34);
  document.getElementById('favicon').href = canvas.toDataURL();
}

function applyEmojiToBtn(btn, emoji) {
  const tip = btn.querySelector('.tooltip');
  if (emoji) {
    btn.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#fff;font-size:16px;line-height:1;box-shadow:0 0 0 1.5px #e8eaed;">${emoji}</span>`;
  } else {
    btn.innerHTML = `<img src="icons/emoji.svg" width="18" height="18" alt="Emoji" class="icon" />`;
  }
  if (tip) btn.appendChild(tip);
}

function buildEmojiPicker(anchorBtn) {
  emojiMenu = document.createElement('div');
  emojiMenu.style.cssText = 'position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #e8eaed;border-radius:24px;box-shadow:0 4px 12px rgba(0,0,0,0.14);z-index:400;display:flex;padding:4px 6px;gap:2px;';
  emojis.forEach(emoji => {
    const pick = document.createElement('button');
    pick.textContent = emoji;
    pick.style.cssText = 'background:none;border:none;cursor:pointer;font-size:18px;padding:4px 5px;border-radius:50%;transition:transform 0.1s,background 0.1s;';
    pick.addEventListener('mouseenter', () => { pick.style.transform = 'scale(1.3)'; pick.style.background = '#f1f3f4'; });
    pick.addEventListener('mouseleave', () => { pick.style.transform = 'scale(1)';   pick.style.background = 'none'; });
    pick.addEventListener('click', ev => {
      ev.stopPropagation();
      activeEmoji = emoji;
      // Update all desktop emoji btns
      document.querySelectorAll('.icon-btn').forEach(btn => {
        if (btn._tipLabel === 'Emoji') applyEmojiToBtn(btn, emoji);
      });
      // Update mobile menu icon
      const moreEmojiIcon  = document.getElementById('moreEmojiIcon');
      const moreEmojiLabel = document.getElementById('moreEmojiLabel');
      if (moreEmojiIcon) {
        moreEmojiIcon.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;font-size:15px;';
        moreEmojiIcon.outerHTML = `<span style="font-size:16px;width:18px;text-align:center;" id="moreEmojiIcon">${emoji}</span>`;
      }
      if (moreEmojiLabel) moreEmojiLabel.textContent = emoji;
      emojiToFavicon(emoji);
      emojiMenu.remove(); emojiMenu = null;
    });
    emojiMenu.appendChild(pick);
  });
  anchorBtn.style.position = 'relative';
  anchorBtn.appendChild(emojiMenu);
}

// Desktop emoji btn
document.querySelectorAll('.icon-btn').forEach(btn => {
  if (btn._tipLabel !== 'Emoji') return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (emojiMenu) { emojiMenu.remove(); emojiMenu = null; return; }
    buildEmojiPicker(btn);
  });
});

// Mobile menu emoji
document.getElementById('menuEmoji').addEventListener('click', e => {
  e.stopPropagation();
  moreDropdown.classList.remove('open');
  // Open picker anchored to moreBtn
  if (emojiMenu) { emojiMenu.remove(); emojiMenu = null; return; }
  buildEmojiPicker(moreBtn);
});

document.addEventListener('click', () => { if (emojiMenu) { emojiMenu.remove(); emojiMenu = null; } });

// ── TV Static ─────────────────────────────────────────────
function makeStaticCanvas(width, height) {
  const canvas  = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx     = canvas.getContext('2d');
  const palette = [0,20,40,70,100,130,160,190,220,255];
  (function animate() {
    const img  = ctx.createImageData(width, height);
    const data = img.data;
    let y = 0;
    while (y < height) {
      const lh  = Math.floor(Math.random() * 2) + 1;
      const lv  = palette[Math.floor(Math.random() * palette.length)];
      for (let row = y; row < Math.min(y + lh, height); row++) {
        for (let x = 0; x < width; x++) {
          const i = (row * width + x) * 4;
          const v = Math.random() < 0.7 ? lv : palette[Math.floor(Math.random() * palette.length)];
          data[i] = data[i+1] = data[i+2] = v; data[i+3] = 255;
        }
      }
      y += lh;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(animate);
  })();
  return canvas;
}

function measureText(text, font) {
  const tmp = document.createElement('span');
  tmp.style.cssText = `visibility:hidden;position:absolute;white-space:nowrap;font:${font};`;
  tmp.textContent = text;
  document.body.appendChild(tmp);
  const w = Math.ceil(tmp.offsetWidth);
  const h = Math.ceil(tmp.offsetHeight) || 16;
  document.body.removeChild(tmp);
  return { w, h };
}

function makeStaticBlock(text, font) {
  const { w, h } = measureText(text, font);
  const wrap = document.createElement('span');
  wrap.className = 'static-block';
  wrap.style.cssText = `position:relative;display:inline-block;vertical-align:middle;overflow:visible;width:${w}px;height:${h}px;`;
  const inner = document.createElement('span');
  inner.style.cssText = `display:block;width:${w}px;height:${h}px;border-radius:2px;overflow:hidden;`;
  inner.appendChild(makeStaticCanvas(w, h));
  wrap.appendChild(inner);
  // No-signal tooltip
  const tip = document.createElement('span');
  tip.className = 'no-signal-tip';
  tip.textContent = 'No signal:(';
  wrap.appendChild(tip);
  let nsTimer = null;
  wrap.addEventListener('mouseenter', () => { nsTimer = setTimeout(() => tip.style.opacity = '1', TOOLTIP_DELAY); });
  wrap.addEventListener('mouseleave', () => { clearTimeout(nsTimer); tip.style.opacity = '0'; });
  return wrap;
}

// Replace [Name] in body
const bodyEl   = document.querySelector('.email-body');
const bodyFont = getComputedStyle(bodyEl).font;
bodyEl.innerHTML = bodyEl.innerHTML.replace(/\[Name\]/g, '<span class="static-ph" data-text="Name"></span>');
bodyEl.querySelectorAll('.static-ph').forEach(ph => ph.replaceWith(makeStaticBlock(ph.dataset.text, bodyFont)));

// ── Sender details dropdown ───────────────────────────────
const detailsBox  = document.createElement('div');
detailsBox.className = 'sender-details';
const detailFont  = '12px "Inter var","Inter",sans-serif';
const toRow       = document.createElement('div');
toRow.innerHTML   = '<strong>To:</strong> You ';
toRow.appendChild(makeStaticBlock('<daryl@example.com>', detailFont));
detailsBox.innerHTML = `
  <div><strong>From:</strong> Nikola Stojkovic &lt;info@itsnikola.site&gt;</div>
  <div><strong>Date:</strong> Today, <span id="detailsTime"></span></div>
  <div><strong>Subject:</strong> Re: The Conversation Starter</div>
`;
detailsBox.insertBefore(toRow, detailsBox.children[1]);

// Insert after sender-to-row
const senderToRow = document.querySelector('.sender-to-row');
senderToRow.after(detailsBox);

senderToEl.addEventListener('click', () => {
  const open = detailsBox.classList.toggle('visible');
  senderToEl.classList.toggle('expanded', open);
  senderTip.textContent = open ? 'Hide details' : 'Show details';
});

// ── Reply box ─────────────────────────────────────────────
const replyBox = document.createElement('div');
replyBox.className = 'reply-box';
bodyEl.after(replyBox);

function openReply() {
  replyBox.classList.add('visible');
  setTimeout(() => {
    replyBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    replyBox.querySelector('.reply-email-input')?.focus();
  }, 100);
}

function buildReplyBox() {
  replyBox.innerHTML = `
    <div class="reply-to-label">Reply to <span>Nikola Stojkovic</span></div>
    <input class="reply-email-input" type="email" placeholder="Your email address" />
    <textarea class="reply-textarea" placeholder="Write your message..."></textarea>
    <div class="reply-actions">
      <button class="reply-send-btn">Send</button>
      <button class="reply-discard-btn">Discard</button>
    </div>
  `;

  replyBox.querySelector('.reply-discard-btn').addEventListener('click', () => {
    replyBox.classList.remove('visible');
    replyBox.querySelector('.reply-email-input').value = '';
    replyBox.querySelector('.reply-textarea').value    = '';
  });

  replyBox.querySelector('.reply-send-btn').addEventListener('click', async () => {
    const emailEl = replyBox.querySelector('.reply-email-input');
    const textEl  = replyBox.querySelector('.reply-textarea');
    const from    = emailEl.value.trim();
    const msg     = textEl.value.trim();
    if (!from.includes('@')) { emailEl.style.borderColor = '#d93025'; emailEl.focus(); return; }
    if (!msg)                { textEl.style.borderColor  = '#d93025'; textEl.focus();  return; }
    const btn = replyBox.querySelector('.reply-send-btn');
    btn.textContent = 'Sending…'; btn.disabled = true;
    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: '183a2983-6092-45e2-8d16-2cdbe4ef772d', subject: 'Re: The Conversation Starter — New Reply', from_name: from, replyto: from, to: 'info@itsnikola.site', message: `From: ${from}\n\n${msg}` })
      });
      const data = await res.json();
      if (data.success) {
        replyBox.innerHTML = `<div style="color:#188038;font-size:13px;padding:6px 0;">✓ Message sent!</div>`;
        setTimeout(() => { replyBox.classList.remove('visible'); buildReplyBox(); }, 2500);
      } else throw new Error();
    } catch {
      const s = encodeURIComponent('Re: The Conversation Starter');
      const b = encodeURIComponent(`From: ${from}\n\n${msg}`);
      window.location.href = `mailto:info@itsnikola.site?subject=${s}&body=${b}`;
    }
  });
}

buildReplyBox();

// Wire all reply buttons (desktop icon-btn + mobile header btn)
document.querySelectorAll('.icon-btn').forEach(btn => {
  if (btn._tipLabel === 'Reply') btn.addEventListener('click', openReply);
});
const mobileReplyBtn = document.getElementById('mobileReplyBtn');
if (mobileReplyBtn) mobileReplyBtn.addEventListener('click', openReply);

// ── Dynamic time ──────────────────────────────────────────
(function () {
  const entry = new Date();

  function fmt(d) {
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  function rel(ms) {
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60)  return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60)  return m + ' minute' + (m !== 1 ? 's' : '') + ' ago';
    const h = Math.floor(m / 60);
    if (h < 24)  return h + ' hour'   + (h !== 1 ? 's' : '') + ' ago';
    const d = Math.floor(h / 24);
    return d + ' day' + (d !== 1 ? 's' : '') + ' ago';
  }

  function update() {
    const text = fmt(entry) + ' (' + rel(entry.getTime()) + ')';
    document.querySelectorAll('.time, .time-mobile').forEach(el => el.textContent = text);
    const dt = document.getElementById('detailsTime');
    if (dt) dt.textContent = text;
  }

  update();
  setInterval(update, 10000);
})();

// ── Read button (desktop only) ────────────────────────────
(function () {
  const readBtn   = document.getElementById('readBtn');
  const checkIcon = document.getElementById('checkIcon');
  if (!readBtn || !checkIcon) return;

  let isRead = false;
  attachTooltip(readBtn, 'Mark as read');

  readBtn.addEventListener('click', () => {
    isRead = !isRead;
    checkIcon.classList.remove('check-animate-in', 'check-animate-out');
    void checkIcon.offsetWidth;
    checkIcon.classList.add('check-animate-out');
    checkIcon.addEventListener('animationend', () => {
      checkIcon.classList.remove('check-animate-out');
      checkIcon.src = isRead ? 'icons/check-double.svg' : 'icons/check-single.svg';
      readBtn.classList.toggle('read-active', isRead);
      checkIcon.classList.add('check-animate-in');
      checkIcon.addEventListener('animationend', () => checkIcon.classList.remove('check-animate-in'), { once: true });
    }, { once: true });
    // Update tooltip label
    const tip = readBtn.querySelector('.tooltip');
    if (tip) tip.textContent = isRead ? 'Mark as unread' : 'Mark as read';
  });
})();

// ── Works lightbox ────────────────────────────────────────
(function () {
  // Load works from admin localStorage, fallback to default assets
  function loadWorks() {
    try {
      const stored = JSON.parse(localStorage.getItem('ns_works'));
      if (stored && stored.length) return stored;
    } catch(e) {}
    // Default fallback (before any admin upload)
    return [
      { id: 'default_1', name: 'Project 1', src: 'assets/project-1.jpg' },
      { id: 'default_2', name: 'Project 2', src: 'assets/project-2.jpg' },
      { id: 'default_3', name: 'Project 3', src: 'assets/project-3.jpg' },
    ];
  }

  const overlay    = document.getElementById('lbOverlay');
  const lbInner    = document.getElementById('lbInner');
  const lbScroll   = document.getElementById('lbScroll');
  const lbClose    = document.getElementById('lbClose');
  const lbDownload = document.getElementById('lbDownload');
  const lbPrint    = document.getElementById('lbPrint');
  const printFrame = document.getElementById('printFrame');

  let currentIndex = 0;

  // Build slides
  function buildSlides() {
    const works = loadWorks();
    lbInner.innerHTML = '';
    works.forEach((w, i) => {
      const slide = document.createElement('div');
      slide.className = 'lb-slide';
      slide.dataset.index = i;
      const img = document.createElement('img');
      img.src = w.src;
      img.alt = w.name || w.label || ('Work ' + (i+1));
      img.draggable = false;
      img.addEventListener('contextmenu', e => e.preventDefault());
      slide.appendChild(img);
      lbInner.appendChild(slide);
    });
  }

  function getSlides() { return Array.from(lbInner.querySelectorAll('.lb-slide')); }

  function setActive(i) {
    currentIndex = i;
  }

  // Track current slide on scroll
  lbScroll.addEventListener('scroll', () => {
    const slides = getSlides();
    const mid = lbScroll.scrollTop + lbScroll.clientHeight / 2;
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs((s.offsetTop + s.offsetHeight / 2) - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best !== currentIndex) setActive(best);
  });

  function openLightbox(index) {
    buildSlides();
    overlay.classList.add('lb-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setActive(index);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const slides = getSlides();
      if (slides[index]) slides[index].scrollIntoView({ block: 'start' });
    }));
  }

  function closeLightbox() {
    overlay.classList.remove('lb-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open from works chip link
  const worksLink = document.getElementById('worksLink');
  if (worksLink) {
    worksLink.addEventListener('click', e => { e.preventDefault(); openLightbox(0); });
  }

  lbClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // Block right-click on entire image area
  lbScroll.addEventListener('contextmenu', e => e.preventDefault());
  lbScroll.addEventListener('dragstart',   e => e.preventDefault());

  // Click dark sides to close
  ['lbSideLeft', 'lbSideRight'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', closeLightbox);
  });

  // Download current image
  lbDownload.addEventListener('click', () => {
    const slides = getSlides();
    const img = slides[currentIndex]?.querySelector('img');
    if (!img) return;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = loadWorks()[currentIndex]?.name || ('work-' + (currentIndex + 1));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Print current image only
  lbPrint.addEventListener('click', () => {
    const slides = getSlides();
    const img = slides[currentIndex]?.querySelector('img');
    if (!img) return;
    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}
      img{max-width:100%;max-height:100vh;object-fit:contain}
    </style></head><body><img src="${img.src}"/></body></html>`);
    doc.close();
    setTimeout(() => { try { printFrame.contentWindow.focus(); printFrame.contentWindow.print(); } catch(e){} }, 350);
  });


})();

// ── Avatar spin + dizzy modal ─────────────────────────────
(function () {
  const avatarBtn  = document.getElementById('avatarBtn');
  const avatarImg  = document.getElementById('avatarImg');
  const dizzyModal = document.getElementById('dizzyModal');
  const dizzyEmoji = document.getElementById('dizzyEmoji');

  if (!avatarBtn) return;

  let spinCount   = 0;
  let spinning    = false;
  let dizzyActive = false;

  function doSpin() {
    if (spinning || dizzyActive) return;
    spinning = true;
    avatarBtn.classList.add('spinning');

    avatarImg.addEventListener('animationend', () => {
      avatarBtn.classList.remove('spinning');
      spinning = false;
      spinCount++;

      if (spinCount >= 3) {
        spinCount = 0;
        showDizzy();
      }
    }, { once: true });
  }

  function showDizzy() {
    dizzyActive = true;
    dizzyModal.classList.add('show');
    dizzyEmoji.classList.add('rocking');

    // Rock for 2.5s then fade out
    setTimeout(() => {
      dizzyEmoji.classList.remove('rocking');
      dizzyModal.classList.remove('show');
      // Re-enable after transition ends
      setTimeout(() => { dizzyActive = false; }, 300);
    }, 2500);
  }

  avatarBtn.addEventListener('click', doSpin);
})();
