function normalize(value) {
  return String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function safeIcon(name) {
  // Icon names are data, not HTML. Restrict to Lucide's kebab-case identifiers.
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name || '') ? name : 'box';
}

function createCard(item) {
  const article = document.createElement('article');
  article.className = 'resource-card';

  const top = document.createElement('div');
  top.className = 'card-top';

  const icon = document.createElement('span');
  icon.className = 'item-icon';
  const iconNode = document.createElement('i');
  iconNode.setAttribute('data-lucide', safeIcon(item.icon));
  icon.append(iconNode);

  const name = document.createElement('a');
  name.className = 'item-name';
  name.href = item.url;
  name.target = '_blank';
  name.rel = 'noopener noreferrer';
  name.textContent = item.name;
  name.setAttribute('aria-label', `${item.name} documentation (opens in a new tab)`);

  const arrow = document.createElement('i');
  arrow.className = 'card-arrow';
  arrow.setAttribute('data-lucide', 'arrow-up-right');

  top.append(icon, name, arrow);
  article.append(top);

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = item.description || ' ';
  article.append(description);

  if (Array.isArray(item.tags) && item.tags.length) {
    const tags = document.createElement('div');
    tags.className = 'tags';
    for (const tag of item.tags) {
      const badge = document.createElement('span');
      badge.className = 'tag';
      badge.textContent = tag;
      tags.append(badge);
    }
    article.append(tags);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const docs = document.createElement('a');
  docs.className = 'card-link';
  docs.href = item.url;
  docs.target = '_blank';
  docs.rel = 'noopener noreferrer';
  docs.innerHTML = '<span>Documentation</span><i data-lucide="external-link"></i>';
  footer.append(docs);

  if (item.repository) {
    const repo = document.createElement('a');
    repo.className = 'card-link';
    repo.href = item.repository;
    repo.target = '_blank';
    repo.rel = 'noopener noreferrer';
    repo.innerHTML = '<span>Source</span><i data-lucide="github"></i>';
    footer.append(repo);
  }
  article.append(footer);
  return article;
}

export function renderCatalog(data, query, container) {
  const term = normalize(query.trim());
  container.replaceChildren();
  let visibleCount = 0;

  for (const group of data.groups) {
    const matches = group.items.filter(item => {
      const searchable = normalize([
        item.name, item.description, item.id, ...(item.tags || []), group.name, group.description
      ].join(' '));
      return !term || searchable.includes(term);
    });
    if (!matches.length) continue;
    visibleCount += matches.length;

    const section = document.createElement('section');
    section.className = 'group';

    const header = document.createElement('div');
    header.className = 'group-header';
    const groupIcon = document.createElement('span');
    groupIcon.className = 'group-icon';
    const glyph = document.createElement('i');
    glyph.setAttribute('data-lucide', safeIcon(group.icon));
    groupIcon.append(glyph);

    const heading = document.createElement('div');
    heading.className = 'group-heading';
    const title = document.createElement('h2');
    title.textContent = group.name;
    heading.append(title);
    if (group.description) {
      const desc = document.createElement('p');
      desc.textContent = group.description;
      heading.append(desc);
    }
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `${matches.length} ${matches.length === 1 ? 'resource' : 'resources'}`;
    header.append(groupIcon, heading, count);

    const grid = document.createElement('div');
    grid.className = 'resource-grid';
    for (const item of matches) grid.append(createCard(item));
    section.append(header, grid);
    container.append(section);
  }
  return visibleCount;
}

export function initSearch(onChange) {
  const input = document.querySelector('#search-input');
  const clear = document.querySelector('#clear-search');
  const reset = document.querySelector('#reset-search');

  const update = () => {
    clear.hidden = !input.value;
    onChange(input.value);
  };
  input.addEventListener('input', update);
  clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  reset.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      input.focus();
    }
    if (event.key === 'Escape' && document.activeElement === input) {
      input.value = ''; update(); input.blur();
    }
  });
}
