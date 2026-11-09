const CATALOG_URL = new URL('../../data/catalog.json', import.meta.url);

export async function loadCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return response.json();
}

export function validateCatalog(data) {
  if (!data || !Array.isArray(data.groups)) throw new Error('Catalog must contain a groups array.');
  const ids = new Set();
  for (const group of data.groups) {
    if (!group.id || !group.name || !Array.isArray(group.items)) {
      throw new Error('Every group needs id, name and items.');
    }
    if (ids.has(group.id)) throw new Error(`Duplicate ID: ${group.id}`);
    ids.add(group.id);
    for (const item of group.items) {
      if (!item.id || !item.name || !isHttpUrl(item.url)) {
        throw new Error(`Invalid item in group "${group.id}": id, name and valid http(s) url are required.`);
      }
      if (ids.has(item.id)) throw new Error(`Duplicate ID: ${item.id}`);
      ids.add(item.id);
      if (item.repository && !isHttpUrl(item.repository)) {
        throw new Error(`Invalid repository URL for "${item.id}".`);
      }
      if (item.tags !== undefined && !Array.isArray(item.tags)) {
        throw new Error(`Tags must be an array for "${item.id}".`);
      }
    }
  }
  return true;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
