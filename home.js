const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const hoverPreference = matchMedia('(hover: hover) and (pointer: fine)');
const previews = [...document.querySelectorAll('.work-preview, .profile-item[data-bubble]')];
const resize = new ResizeObserver(entries => {
  for (const { target, contentRect } of entries) {
    target.style.setProperty('--scene-scale', contentRect.width / Number(target.dataset.width));
  }
});
let active = null;
function stopPreview(card) {
  if (!card) return;
  card._label.classList.remove('is-visible');
  card.classList.remove('is-playing');
  card.style.removeProperty('--tilt-x');
  card.style.removeProperty('--tilt-y');
  const video = card.querySelector('video');
  if (video) video.pause();
  if (active === card) active = null;
}
function positionLabel(card, x, y) {
  const label = card._label;
  const w = label.offsetWidth, h = label.offsetHeight;
  label.style.setProperty('--cursor-x', `${Math.max(8, Math.min(x + 14, innerWidth - w - 8))}px`);
  label.style.setProperty('--cursor-y', `${Math.max(8, y + h + 24 > innerHeight ? y - h - 12 : y + 16)}px`);
}
for (const card of previews) {
  if (card.dataset.width) resize.observe(card);
  if (card.dataset.bubble) {
    const bubble = document.createElement('span');
    bubble.className = 'cursor-label';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.textContent = card.dataset.bubble;
    card.append(bubble);
  }
  const label = card.querySelector('.cursor-label');
  card._label = label;
  // Keep the label outside clipped and transformed preview layers.
  document.body.append(label);
  card.addEventListener('pointerenter', event => {
    if (!hoverPreference.matches || event.pointerType === 'touch') return;
    stopPreview(active);
    active = card;
    positionLabel(card, event.clientX, event.clientY);
    label.classList.add('is-visible');
    const video = card.querySelector('video');
    if (video && !motionPreference.matches) {
      video.muted = true;
      video.play().then(() => {
        if (active === card && !motionPreference.matches) card.classList.add('is-playing');
        else video.pause();
      }).catch(() => card.classList.remove('is-playing'));
    }
  });
  card.addEventListener('pointermove', event => {
    if (active !== card) return;
    positionLabel(card, event.clientX, event.clientY);
    if (!motionPreference.matches) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${((event.clientX-r.left)/r.width-.5)*7}deg`);
      card.style.setProperty('--tilt-y', `${-((event.clientY-r.top)/r.height-.5)*5}deg`);
    }
  });
  card.addEventListener('pointerleave', () => stopPreview(card));
  card.addEventListener('focus', () => {
    if (!card.matches(':focus-visible')) return;
    stopPreview(active);
    active = card;
    const r = card.getBoundingClientRect();
    positionLabel(card, r.left+12, r.top+12);
    label.classList.add('is-visible');
  });
  card.addEventListener('blur', () => stopPreview(card));
}
addEventListener('scroll', () => previews.forEach(stopPreview), {passive:true,capture:true});
addEventListener('keydown', event => { if (event.key === 'Escape') previews.forEach(stopPreview); });
addEventListener('blur', () => previews.forEach(stopPreview));
document.addEventListener('visibilitychange', () => { if(document.hidden) previews.forEach(stopPreview); });
motionPreference.addEventListener('change', () => previews.forEach(stopPreview));
hoverPreference.addEventListener('change', () => previews.forEach(stopPreview));
const profileDetails = document.querySelector('.profile-details');
const mobileLayout = matchMedia('(max-width: 900px)');
function syncProfileLayout() { profileDetails.open = !mobileLayout.matches; }
syncProfileLayout();
mobileLayout.addEventListener('change', syncProfileLayout);
// Show secondary copy only when the full caption fits on one line.
const captions = [...document.querySelectorAll('.work-caption')];
for (const caption of captions) {
  const lines = [...caption.querySelectorAll('p')];
  lines.forEach((line, index) => line.classList.add(index === 0 ? 'caption-title' : 'caption-note'));
}
const measuringCanvas = document.createElement('canvas');
const measuringContext = measuringCanvas.getContext('2d');
function fitCaption(caption) {
  const lines = [...caption.querySelectorAll('p')];
  let needed = lines.reduce((sum, line) => {
    const style = getComputedStyle(line);
    measuringContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return sum + measuringContext.measureText(line.textContent.trim()).width;
  }, 0);
  needed += lines.length > 2 ? 28 : lines.length > 1 ? 12 : 0;
  caption.classList.toggle('is-compact', needed > caption.clientWidth - 2);
}
const captionObserver = new ResizeObserver(entries => entries.forEach(({target}) => fitCaption(target)));
captions.forEach(caption => captionObserver.observe(caption));
document.fonts.ready.then(() => captions.forEach(fitCaption));
