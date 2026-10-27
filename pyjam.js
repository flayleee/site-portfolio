const cover = document.querySelector('.pyjam-cover');
const observer = new ResizeObserver(() => cover.style.setProperty('--cover-scale', cover.clientWidth / 705));
observer.observe(cover);
