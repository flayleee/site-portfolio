const minimap = document.querySelector('.case-minimap');
const ticks = Array.from({length:45}, () => {
  const tick = document.createElement('b');
  minimap.append(tick);
  return tick;
});
const contents = document.querySelector('.case-contents');
const mobileCase = matchMedia('(max-width:720px)');
const motionCase = matchMedia('(prefers-reduced-motion:reduce)');
const sectionLinks = [...document.querySelectorAll('[data-section]')];
const caseSections = [...document.querySelectorAll('.case-row[id]')];
function syncCaseLayout() { contents.open = !mobileCase.matches; }
syncCaseLayout();
mobileCase.addEventListener('change', syncCaseLayout);
let scheduled = false;
function updateCaseProgress() {
  scheduled = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  const progress = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
  ticks.forEach((tick, index) => {
    const delta = Math.abs(index / (ticks.length - 1) - progress);
    const scale = delta < .12 ? 1 + Math.cos(delta / .12 * Math.PI / 2) * .8 : 1;
    tick.style.transform = `scaleX(${scale})`;
  });
  let current = caseSections[0];
  for (const section of caseSections) {
    if (section.getBoundingClientRect().top <= innerHeight * .3) current = section;
  }
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 8) current = caseSections.at(-1);
  for (const link of sectionLinks) {
    if (link.dataset.section === current?.id) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  }
}
addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateCaseProgress); } }, {passive:true});
addEventListener('resize', updateCaseProgress);
for (const link of sectionLinks) {
  link.addEventListener('click', event => {
    const section = document.getElementById(link.dataset.section);
    if (!section || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (mobileCase.matches) contents.open = false;
    history.pushState(null,'',`#${section.id}`);
    section.focus({preventScroll:true});
    section.scrollIntoView({behavior:motionCase.matches?'instant':'smooth',block:'start'});
  });
}
updateCaseProgress();
const caseVideo = document.querySelector('.case-detail__video');
function syncCaseVideo() {
  if (!caseVideo) return;
  if (motionCase.matches || document.hidden) caseVideo.pause();
  else caseVideo.play().catch(()=>{});
}
motionCase.addEventListener('change',syncCaseVideo);
document.addEventListener('visibilitychange',syncCaseVideo);
syncCaseVideo();
