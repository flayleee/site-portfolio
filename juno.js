(() => {
  const links = document.querySelectorAll('.juno-image-link, .juno-interaction-link');
  if (!links.length) return;

  const viewer = document.createElement('dialog');
  viewer.className = 'juno-image-viewer';
  viewer.setAttribute('aria-label', 'Просмотр экрана');
  viewer.innerHTML = '<button class="juno-image-viewer__close" type="button" aria-label="Закрыть просмотр" autofocus>×</button><img alt="">';
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  let opener;
  let previousOverflow;

  for (const link of links) {
    link.removeAttribute('target');
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-label', `${link.querySelector('img').alt} — увеличить`);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
    });
  }

  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    opener?.focus({preventScroll: true});
  });
})();
