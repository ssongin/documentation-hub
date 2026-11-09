import { loadCatalog, validateCatalog } from './catalog.js';
import { initSearch, renderCatalog } from './search.js';
import { initTheme } from './theme.js';

const catalogElement = document.querySelector('#catalog');
const emptyState = document.querySelector('#empty-state');
const errorState = document.querySelector('#error-state');
const countElement = document.querySelector('#resource-count');

function refreshIcons() {
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

async function start() {
  initTheme();
  try {
    const data = await loadCatalog();
    validateCatalog(data);
    const total = data.groups.reduce((sum, group) => sum + group.items.length, 0);
    countElement.textContent = `${total} ${total === 1 ? 'resource' : 'resources'} across ${data.groups.length} categories`;
    const update = (query = '') => {
      const visible = renderCatalog(data, query, catalogElement);
      emptyState.hidden = visible > 0;
      catalogElement.hidden = visible === 0;
      refreshIcons();
    };
    initSearch(update);
    update();
  } catch (error) {
    console.error('Catalog loading failed:', error);
    catalogElement.hidden = true;
    errorState.hidden = false;
    refreshIcons();
  }
}

start();
