// loadingBar.js

// Create and inject a loading bar into the HTML
const loadingBar = document.createElement('div');
loadingBar.style.position = 'fixed';
loadingBar.style.top = '0';
loadingBar.style.left = '0';
loadingBar.style.height = '4px';
loadingBar.style.backgroundColor = '#3498db';
loadingBar.style.transition = 'width 0.2s ease';
loadingBar.style.width = '0%';
loadingBar.style.zIndex = '1000';
document.body.appendChild(loadingBar);

const maxPolygons = 55826;

function updateLoadingBar(currentCount) {
  const width = Math.min((currentCount / maxPolygons) * 100, 100);
  loadingBar.style.width = width + '%';
  if (currentCount >= maxPolygons) {
    setTimeout(() => loadingBar.style.display = 'none', 500);
  }
}

// Listen for a custom event that script.js will dispatch with the polygon count
document.addEventListener('polygonCountUpdated', (event) => {
  updateLoadingBar(event.detail.count);
});
