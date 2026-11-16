(() => {
  const root = document.documentElement;
  const loader = document.querySelector('.page-loader');
  if (!loader || !root.classList.contains('page-is-loading')) return;
  const message = loader.querySelector('[role="status"]');
  function finish() {
    clearTimeout(window.pageLoadingDeadline);
    root.classList.remove('page-is-loading', 'page-loading-slow');
    loader.remove();
  }
  function fail() {
    if (!loader.isConnected) return;
    clearTimeout(window.pageLoadingDeadline);
    message.textContent = 'Не удалось загрузить часть страницы';
    root.classList.add('page-loading-slow');
  }
  addEventListener('pageshow', event => { if (event.persisted) finish(); });
  async function ready() {
    if (document.fonts) await document.fonts.ready;
    const images = [...document.images].filter(image => {
      if (!image.getAttribute('src') || loader.contains(image)) return false;
      const r = image.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    });
    await Promise.all(images.map(image => {
      image.loading = 'eager';
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          image.removeEventListener('load', loaded);
          image.removeEventListener('error', failed);
        };
        const loaded = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error('Image unavailable')); };
        image.addEventListener('load', loaded, {once: true});
        image.addEventListener('error', failed, {once: true});
        if (image.complete) image.naturalWidth ? loaded() : failed();
      });
    }));
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(link => !link.sheet)) throw new Error('Styles unavailable');
    finish();
  }
  ready().catch(fail);
})();
