const comparison = document.querySelector('.redesign-comparison');
const slider = comparison.querySelector('input');
function updateComparison() {
  comparison.style.setProperty('--split', `${slider.value}%`);
  slider.setAttribute('aria-valuetext', `Стало: ${slider.value}%, было: ${100 - slider.value}%`);
}
slider.addEventListener('input', updateComparison);
updateComparison();
