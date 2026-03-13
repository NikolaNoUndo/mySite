function tick() {
  const t = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Belgrade',
    hour: '2-digit',
    minute: '2-digit'
  }).split(':');

  const h = document.getElementById('h');
  const m = document.getElementById('m');

  if (h.textContent !== t[0]) h.textContent = t[0];
  if (m.textContent !== t[1]) m.textContent = t[1];
}

tick();
setInterval(tick, 10000);

const colors = ['#FF4136', '#B10DC9', '#FFDC00', '#2ECC40', '#FF851B', '#0074D9'];
let i = 0;

setInterval(() => {
  i = (i + 1) % colors.length;
  const color = colors[i].replace('#', '%23');
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="32" height="32" fill="${color}"/><rect x="0" y="0" width="32" height="2" fill="white" fill-opacity="0.3"/><rect x="0" y="30" width="32" height="2" fill="black" fill-opacity="0.2"/></svg>`;
  document.getElementById('favicon').href = `data:image/svg+xml,${svg}`;
}, 500);