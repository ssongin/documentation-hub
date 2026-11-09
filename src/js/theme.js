const STORAGE_KEY = 'developer-hub-theme';
const THEMES = ['system', 'light', 'dark'];

export function initTheme() {
  const select = document.querySelector('#theme-select');
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = THEMES.includes(saved) ? saved : 'system';
  document.documentElement.dataset.theme = initial;
  select.value = initial;

  select.addEventListener('change', () => {
    const theme = THEMES.includes(select.value) ? select.value : 'system';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  });
}
