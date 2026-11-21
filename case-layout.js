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

// Reveal words once, preserving the original text, links and paragraph geometry.
(() => {
  if (!('IntersectionObserver' in window) || motionCase.matches) return;
  const blocks = [...document.querySelectorAll('.case-row__content')];
  const active = new Map();
  function finish(block) {
    const state = active.get(block);
    if (!state) return;
    clearTimeout(state.timer);
    state.spans.forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
    block.normalize();
    active.delete(block);
  }
  function reveal(block) {
    if (motionCase.matches) return;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
    }
    const spans = [];
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const token of node.textContent.split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) fragment.append(document.createTextNode(token));
        else {
          const span = document.createElement('span');
          span.textContent = token;
          span.className = 'case-typing-word';
          spans.push(span);
          fragment.append(span);
        }
      }
      node.replaceWith(fragment);
    }
    const step = Math.min(35, 1400 / Math.max(1, spans.length));
    spans.forEach((span, index) => span.style.setProperty('--typing-delay', `${index * step}ms`));
    active.set(block, {spans, timer: setTimeout(() => finish(block), spans.length * step + 180)});
  }
  const observer = new IntersectionObserver(entries => {
    if (document.documentElement.classList.contains('page-is-loading')) return;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      reveal(entry.target);
    });
  }, {threshold: 0, rootMargin: '0px 0px -8% 0px'});
  // Start after the loading screen, so the animation is actually visible.
  function start() { blocks.forEach(block => observer.observe(block)); }
  if (document.documentElement.classList.contains('page-is-loading')) {
    const loadingObserver = new MutationObserver(() => {
      if (document.documentElement.classList.contains('page-is-loading')) return;
      loadingObserver.disconnect();
      start();
    });
    loadingObserver.observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  } else start();
  function finishAll() { [...active.keys()].forEach(finish); }
  document.addEventListener('pointerdown', finishAll, {passive:true});
  document.addEventListener('focusin', finishAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  motionCase.addEventListener('change', () => {
    if (motionCase.matches) { observer.disconnect(); finishAll(); }
  });
  addEventListener('beforeprint', () => { observer.disconnect(); finishAll(); });
})();
