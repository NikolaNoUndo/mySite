// ── Remove native browser tooltips ───────────────────────
document.querySelectorAll('.icon-btn').forEach(btn => {
  btn._tipLabel = btn.title;
  btn.removeAttribute('title');
});

// ── Tooltip system — 1.5s delay ──────────────────────────
const TOOLTIP_DELAY = 1500;
const customTips = {
  'Star':         'Starred',
  'Emoji':        'Add reaction',
  'Reply':        'Reply',
  'Mark as read': 'Mark as read',
};

// sender-to tooltip
const senderTo = document.querySelector('.sender-to');
senderTo.style.position = 'relative';
const senderTip = document.createElement('span');
senderTip.className = 'tooltip';
senderTip.textContent = 'Show details';
senderTo.appendChild(senderTip);
let senderTimer = null;
senderTo.addEventListener('mouseenter', () => { senderTimer = setTimeout(() => senderTip.classList.add('visible'), TOOLTIP_DELAY); });
senderTo.addEventListener('mouseleave', () => { clearTimeout(senderTimer); senderTip.classList.remove('visible'); });

document.querySelectorAll('.icon-btn').forEach(btn => {
  const label = customTips[btn._tipLabel];
  if (!label) return;
  let timer = null;
  const tip = document.createElement('span');
  tip.className = 'tooltip';
  tip.textContent = label;
  btn.style.position = 'relative';
  btn.appendChild(tip);
  btn.addEventListener('mouseenter', () => { timer = setTimeout(() => tip.classList.add('visible'), TOOLTIP_DELAY); });
  btn.addEventListener('mouseleave', () => { clearTimeout(timer); tip.classList.remove('visible'); });
  btn.addEventListener('click',      () => { clearTimeout(timer); tip.classList.remove('visible'); });
});


// ── Label × close ─────────────────────────────────────────
document.querySelector('.label-x').addEventListener('click', () => {
  const label = document.querySelector('.label');
  const spacer = document.createElement('span');
  spacer.style.cssText = `display:inline-block;visibility:hidden;width:${label.offsetWidth}px;height:${label.offsetHeight}px;`;
  label.replaceWith(spacer);
});


// ── Star — swap icon + yellow filter ─────────────────────
const starBtn = Array.from(document.querySelectorAll('.icon-btn')).find(b => b._tipLabel === 'Star');
let starred = false;
starBtn.addEventListener('click', () => {
  starred = !starred;
  const img = starBtn.querySelector('img');
  starBtn.classList.remove('star-animating');
  void starBtn.offsetWidth;
  starBtn.classList.add('star-animating');
  starBtn.addEventListener('animationend', () => starBtn.classList.remove('star-animating'), { once: true });
  if (starred) {
    img.src = 'icons/star-filled.svg';
    img.style.filter = 'none';
    img.style.color = '#FFD230';

  } else {
    img.src = 'icons/star.svg';
    img.style.filter = '';
  }
  starBtn.classList.toggle('star-active', starred);
});


// ── Emoji picker ──────────────────────────────────────────
const emojiBtn = Array.from(document.querySelectorAll('.icon-btn')).find(b => b._tipLabel === 'Emoji');
const emojis = ['✨','😐','😮','🔥','😢','🫨'];
let emojiMenu = null;

function openEmojiPicker(e) {
  e.stopPropagation();
  if (emojiMenu) { emojiMenu.remove(); emojiMenu = null; return; }
  emojiMenu = document.createElement('div');
  emojiMenu.style.cssText = `position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #e8eaed;border-radius:24px;box-shadow:0 4px 12px rgba(0,0,0,0.14);z-index:400;display:flex;padding:4px 6px;gap:2px;`;
  emojis.forEach(emoji => {
    const pick = document.createElement('button');
    pick.textContent = emoji;
    pick.style.cssText = `background:none;border:none;cursor:pointer;font-size:18px;padding:4px 5px;border-radius:50%;transition:transform 0.1s,background 0.1s;`;
    pick.addEventListener('mouseenter', () => { pick.style.transform='scale(1.3)'; pick.style.background='#f1f3f4'; });
    pick.addEventListener('mouseleave', () => { pick.style.transform='scale(1)'; pick.style.background='none'; });
    pick.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const tip = emojiBtn.querySelector('.tooltip');
      emojiBtn.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#fff;font-size:16px;line-height:1;box-shadow:0 0 0 1.5px #e8eaed;">${emoji}</span>`;
      if (tip) emojiBtn.appendChild(tip);
      emojiMenu.remove(); emojiMenu = null;
    });
    emojiMenu.appendChild(pick);
  });
  emojiBtn.style.position = 'relative';
  emojiBtn.appendChild(emojiMenu);
}
emojiBtn.addEventListener('click', openEmojiPicker);
document.addEventListener('click', () => { if (emojiMenu) { emojiMenu.remove(); emojiMenu = null; } });


// ── Read receipt — single ↔ double checkmark ─────────────
const readBtn   = document.getElementById('readBtn');
const checkIcon = document.getElementById('checkIcon');
let isRead = false;
readBtn.addEventListener('click', () => {
  isRead = !isRead;
  checkIcon.classList.remove('check-animate-in', 'check-animate-out');
  void checkIcon.offsetWidth;
  checkIcon.classList.add('check-animate-out');
  checkIcon.addEventListener('animationend', () => {
    checkIcon.classList.remove('check-animate-out');
    checkIcon.src = isRead ? 'icons/check-double.svg' : 'icons/check-single.svg';
    checkIcon.alt = isRead ? 'Read' : 'Mark as read';
    readBtn.classList.toggle('read-active', isRead);
    checkIcon.classList.add('check-animate-in');
    checkIcon.addEventListener('animationend', () => checkIcon.classList.remove('check-animate-in'), { once: true });
  }, { once: true });
});


// ── Print ─────────────────────────────────────────────────
Array.from(document.querySelectorAll('.icon-btn')).find(b => b._tipLabel === 'Print')
  .addEventListener('click', () => window.print());

// ── Open in new window ────────────────────────────────────
Array.from(document.querySelectorAll('.icon-btn')).find(b => b._tipLabel === 'Open in new window')
  .addEventListener('click', () => window.open(window.location.href, '_blank'));


// ── TV Static effect ──────────────────────────────────────
function makeStaticCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const palette = [0, 20, 40, 70, 100, 130, 160, 190, 220, 255];

  function drawFrame() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    // draw horizontal scanlines for realism
    let y = 0;
    while (y < height) {
      const lineHeight = Math.floor(Math.random() * 2) + 1;
      const lineVal = palette[Math.floor(Math.random() * palette.length)];
      for (let row = y; row < Math.min(y + lineHeight, height); row++) {
        for (let x = 0; x < width; x++) {
          const idx = (row * width + x) * 4;
          const val = Math.random() < 0.7 ? lineVal : palette[Math.floor(Math.random() * palette.length)];
          data[idx] = data[idx+1] = data[idx+2] = val;
          data[idx+3] = 255;
        }
      }
      y += lineHeight;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  let animId;
  (function animate() { drawFrame(); animId = requestAnimationFrame(animate); })();
  canvas._stop = () => cancelAnimationFrame(animId);
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

function makeStaticBlock(text, font, extraStyle) {
  const { w, h } = measureText(text, font);
  const wrap = document.createElement('span');
  wrap.className = 'static-block';
  wrap.style.cssText = `position:relative;display:inline-block;vertical-align:middle;border-radius:2px;overflow:visible;width:${w}px;height:${h}px;`;
  if (extraStyle) wrap.style.cssText += extraStyle;

  // inner canvas wrapper (clipped)
  const inner = document.createElement('span');
  inner.style.cssText = `display:block;width:${w}px;height:${h}px;border-radius:2px;overflow:hidden;`;
  inner.appendChild(makeStaticCanvas(w, h));
  wrap.appendChild(inner);

  // "No signal:(" tooltip
  const tip = document.createElement('span');
  tip.className = 'no-signal-tip';
  tip.textContent = 'No signal:(';
  wrap.appendChild(tip);

  return wrap;
}

// 1. Replace [Name] in body
const bodyEl = document.querySelector('.email-body');
const bodyFont = getComputedStyle(bodyEl).font;
bodyEl.innerHTML = bodyEl.innerHTML.replace(/\[Name\]/g, '<span class="static-ph" data-text="Name"></span>');
bodyEl.querySelectorAll('.static-ph').forEach(ph => {
  ph.replaceWith(makeStaticBlock(ph.dataset.text, bodyFont));
});

// 2. sender-to plain 'You' is in HTML directly

// 3. Replace "Daryl <daryl@example.com>" in the sender-details dropdown
// We build details box AFTER static so we can inject static there too
const detailsBox = document.createElement('div');
detailsBox.className = 'sender-details';

// Build "To:" row with static for name+email
const toRow = document.createElement('div');
toRow.innerHTML = '<strong>To:</strong> You ';
const detailFont = '12px "Inter var","Inter",sans-serif';

toRow.appendChild(document.createTextNode(' '));
toRow.appendChild(makeStaticBlock('<daryl@example.com>', detailFont, 'vertical-align:middle;'));

detailsBox.innerHTML = `
  <div><strong>From:</strong> Nikola Stojkovic &lt;info@itsnikola.site&gt;</div>
  <div><strong>Date:</strong> Today, <span id="detailsTime"></span></div>
  <div><strong>Subject:</strong> Re: The Conversation Starter</div>
`;
// Insert To row as second child (after From)
detailsBox.insertBefore(toRow, detailsBox.children[1]);

senderTo.parentElement.insertBefore(detailsBox, senderTo.nextSibling);

senderTo.addEventListener('click', () => {
  const open = detailsBox.classList.toggle('visible');
  senderTo.classList.toggle('expanded', open);
  senderTip.textContent = open ? 'Hide details' : 'Show details';
});


// ── Reply box — email field + textarea → real POST ────────
const replyBtn  = Array.from(document.querySelectorAll('.icon-btn')).find(b => b._tipLabel === 'Reply');
const emailBody2 = document.querySelector('.email-body');

const replyBox = document.createElement('div');
replyBox.className = 'reply-box';
emailBody2.after(replyBox);

function buildReplyBox() {
  replyBox.innerHTML = `
    <div class="reply-to-label">Reply to <span>Nikola Stojkovic</span></div>
    <input class="reply-email-input" type="email" placeholder="Your email address" required />
    <textarea class="reply-textarea" placeholder="Write your message..."></textarea>
    <div class="reply-actions">
      <button class="reply-send-btn">Send</button>
      <button class="reply-discard-btn">Discard</button>
    </div>
  `;

  replyBox.querySelector('.reply-discard-btn').addEventListener('click', () => {
    replyBox.classList.remove('visible');
    replyBox.querySelector('.reply-email-input').value = '';
    replyBox.querySelector('.reply-textarea').value = '';
  });

  replyBox.querySelector('.reply-send-btn').addEventListener('click', async () => {
    const emailInput = replyBox.querySelector('.reply-email-input');
    const textInput  = replyBox.querySelector('.reply-textarea');
    const fromEmail  = emailInput.value.trim();
    const text       = textInput.value.trim();

    // Validate
    if (!fromEmail || !fromEmail.includes('@')) {
      emailInput.style.borderColor = '#d93025';
      emailInput.focus();
      return;
    }
    if (!text) {
      textInput.style.borderColor = '#d93025';
      textInput.focus();
      return;
    }

    const sendBtn = replyBox.querySelector('.reply-send-btn');
    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;

    try {
      // Web3Forms — free, no backend needed
      // Replace ACCESS_KEY below with your key from web3forms.com
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: '183a2983-6092-45e2-8d16-2cdbe4ef772d', // ← zameni ovde
          subject: 'Re: Welcome to Godly — New Reply',
          from_name: fromEmail,
          replyto: fromEmail,
          to: 'info@itsnikola.site',
          message: text,
        })
      });
      const data = await res.json();

      if (data.success) {
        replyBox.innerHTML = `<div style="color:#188038;font-size:13px;padding:6px 0;">✓ Message sent!</div>`;
        setTimeout(() => { replyBox.classList.remove('visible'); buildReplyBox(); }, 2500);
      } else {
        throw new Error('failed');
      }
    } catch {
      // Fallback to mailto if fetch fails
      const subject = encodeURIComponent('Re: Welcome to Godly');
      const body    = encodeURIComponent(`From: ${fromEmail}\n\n${text}`);
      window.location.href = `mailto:info@itsnikola.site?subject=${subject}&body=${body}`;
    }
  });
}

buildReplyBox();

replyBtn.addEventListener('click', () => {
  replyBox.classList.add('visible');
  setTimeout(() => {
    replyBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    replyBox.querySelector('.reply-email-input').focus();
  }, 100);
});


// sender-to: 'to You' is plain text from HTML — nothing to inject

// ── Dynamic entry time ────────────────────────────────────
(function() {
  const entryTime = new Date(); // capture page load moment
  const timeEl = document.querySelector('.time');

  function formatTime(d) {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function relativeTime(since) {
    const secs = Math.floor((Date.now() - since) / 1000);
    if (secs < 60)  return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60)  return mins + ' minute' + (mins !== 1 ? 's' : '') + ' ago';
    const hrs  = Math.floor(mins / 60);
    if (hrs  < 24)  return hrs + ' hour' + (hrs !== 1 ? 's' : '') + ' ago';
    const days = Math.floor(hrs / 24);
    return days + ' day' + (days !== 1 ? 's' : '') + ' ago';
  }

  function updateTime() {
    timeEl.textContent = formatTime(entryTime) + ' (' + relativeTime(entryTime.getTime()) + ')';
  }

  updateTime();
  setInterval(updateTime, 10000); // refresh every 10s
})();
