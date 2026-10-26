(() => {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  loader.hidden = false;
  let finished = false;
  let deadline;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    loader.classList.add('is-ready');
    setTimeout(() => loader.remove(), reduced ? 0 : 320);
  }
  // Slow or failed assets must never leave the page covered.
  deadline = setTimeout(finish, 2500);
  addEventListener('pageshow', event => { if (event.persisted) finish(); });
  // Any deliberate interaction reveals the page immediately.
  addEventListener('pointerdown', finish, {once:true});
  addEventListener('keydown', finish, {once:true});
  document.addEventListener('DOMContentLoaded', async () => {
    const image = document.querySelector('.case-detail__hero img, .work-preview img');
    const ready = [document.fonts.ready];
    if (image) ready.push(image.decode().catch(() => {}));
    await Promise.allSettled(ready);
    requestAnimationFrame(() => requestAnimationFrame(finish));
  }, {once:true});
})();
