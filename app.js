const characters = window.NYX_CHARACTERS || [];
const updates = window.NYX_UPDATES || [];
const byId = id => document.getElementById(id);
const grid = byId('character-grid');
const search = byId('search');
const genre = byId('genre');
const trope = byId('trope');
const savedOnly = byId('saved-only');
const home = byId('home-view');
const detail = byId('detail-view');
const siteTitle = document.title;
const storageKey = 'house-of-nyx-favorites';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

const favorites = loadFavorites();
const worlds = new Map();
for (const character of characters) {
  if (!worlds.has(character.world)) worlds.set(character.world, []);
  worlds.get(character.world).push(character);
}

function addOptions(select, values) {
  for (const value of [...new Set(values)].sort()) {
    select.add(new Option(value, value));
  }
}

function portrait(character, className = 'portrait') {
  const accent = /^#[0-9a-f]{6}$/i.test(character.accent) ? character.accent : '#426F61';
  const initials = character.name.split(' ').map(word => word[0]).join('');
  return `<div class="${className} ${character.image ? 'has-image' : ''}" style="--accent:${accent}">
    ${character.image
      ? `<img src="${esc(character.image)}" alt="Portrait of ${esc(character.name)}" loading="lazy">`
      : `<div class="placeholder-art" aria-hidden="true"><span>✦</span><strong>${esc(initials)}</strong></div>`}
  </div>`;
}

function characterCard(character) {
  const name = esc(character.name);
  const pressed = favorites.has(character.id);
  return `<article class="archive-card">
    <a class="character-card" href="#character-${encodeURIComponent(character.id)}" aria-label="Read ${name} profile">
      ${portrait(character)}
      <div class="card-content">
        <div class="card-top"><span>${esc(character.genre)}</span></div>
        <h3>${name}</h3><p class="card-title">${esc(character.title)}</p>
        <div class="card-bottom"><span>${esc(character.world)}</span><span>Read profile ↗</span></div>
      </div>
    </a>
    <button class="favorite" type="button" data-favorite="${esc(character.id)}"
      aria-label="Save ${name}" aria-pressed="${pressed}">${pressed ? '♥' : '♡'}</button>
  </article>`;
}

function renderCollection() {
  const query = search.value.trim().toLowerCase();
  const matches = characters.filter(character =>
    (genre.value === 'all' || character.genre === genre.value)
    && (trope.value === 'all' || character.tropes.includes(trope.value))
    && (!savedOnly.checked || favorites.has(character.id))
    && [character.name, character.title, character.world, character.genre,
      character.description, ...character.tropes].join(' ').toLowerCase().includes(query)
  );
  grid.innerHTML = matches.map(characterCard).join('');
  byId('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'profile' : 'profiles'}`;
  const empty = byId('empty-state');
  empty.hidden = matches.length > 0;
  empty.textContent = savedOnly.checked ? 'No saved profiles match these filters.' : 'No profiles match these filters.';
}

function renderRoute() {
  const hash = location.hash;
  let key;
  try {
    key = decodeURIComponent(hash.slice(hash.startsWith('#world/') ? 7 : 11));
  } catch {
    key = '';
  }
  const character = hash.startsWith('#character-') && characters.find(entry => entry.id === key);
  const world = hash.startsWith('#world/') && worlds.get(key);
  const wasDetail = !detail.hidden;
  detail.hidden = !character && !world;
  home.hidden = !detail.hidden;
  if (detail.hidden) {
    document.title = siteTitle;
    if (wasDetail) requestAnimationFrame(() => (byId(hash.slice(1)) || home).scrollIntoView());
    return;
  }

  const worldName = character ? character.world : key;
  const worldLink = `#world/${encodeURIComponent(worldName)}`;
  const title = character ? character.name : worldName;
  document.title = `${title} | House of Nyx`;
  detail.innerHTML = `<nav class="detail-nav" aria-label="Breadcrumb"><a href="#archive">← The Archive</a>
    ${character ? `<a href="${worldLink}">${esc(worldName)} ↗</a>` : '<a href="#worlds">All worlds ↗</a>'}</nav>
    ${character ? `<article class="profile-layout detail-panel">
      ${portrait(character, 'profile-art')}
      <div class="profile-body">
        <p class="eyebrow">${esc(character.genre)}</p><h1 tabindex="-1">${esc(title)}</h1>
        <h2>${esc(character.title)}</h2><p class="profile-description">${esc(character.description)}</p>
        <p>${esc(character.details)}</p>
        <div class="profile-tags">${character.tropes.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
        ${/^https?:\/\//i.test(character.url) ? `<a class="button button-primary" href="${esc(character.url)}" target="_blank" rel="noopener noreferrer">Open on DreamJourneyAI ↗</a>`
          : '<p class="link-note">DreamJourneyAI link coming soon.</p>'}
      </div>
    </article>` : `<h1 tabindex="-1">${esc(title)}</h1><div class="character-grid">${world.map(characterCard).join('')}</div>`}`;
  window.scrollTo(0, 0);
  detail.querySelector('h1').focus({ preventScroll: true });
}

addOptions(genre, characters.map(character => character.genre));
addOptions(trope, characters.flatMap(character => character.tropes));
search.addEventListener('input', renderCollection);
for (const filter of [genre, trope, savedOnly]) filter.addEventListener('change', renderCollection);
byId('clear').addEventListener('click', () => {
  search.value = '';
  genre.value = trope.value = 'all';
  savedOnly.checked = false;
  renderCollection();
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-favorite]');
  if (!button) return;
  const id = button.dataset.favorite;
  const pressed = !favorites.has(id);
  if (pressed) favorites.add(id);
  else favorites.delete(id);
  try {
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch {
    // Favorites are available for the current visit when storage is unavailable.
  }
  if (savedOnly.checked && detail.hidden) {
    renderCollection();
    byId('saved-only').focus();
  } else {
    button.setAttribute('aria-pressed', pressed);
    button.textContent = pressed ? '♥' : '♡';
    if (!detail.hidden) renderCollection();
  }
});

const featured = characters.find(character => character.status === 'Featured') || characters[0];
if (featured) {
  byId('featured').hidden = false;
  byId('featured').innerHTML = `<article class="profile-layout detail-panel featured-panel">
    ${portrait(featured, 'profile-art')}
    <div class="profile-body">
      <p class="eyebrow">Featured story</p><h2>${esc(featured.name)}</h2>
      <p class="profile-description">${esc(featured.description)}</p>
      <a class="button button-primary" href="#character-${encodeURIComponent(featured.id)}">Read the story ↗</a>
    </div></article>`;
}

byId('world-grid').innerHTML = [...worlds].map(([world, entries]) =>
  `<a class="world-card" href="#world/${encodeURIComponent(world)}"><h3>${esc(world)}</h3>
    <span>${entries.length} ${entries.length === 1 ? 'profile' : 'profiles'} ↗</span></a>`
).join('');

byId('updates-list').innerHTML = updates.map(update =>
  `<article class="update-entry"><div class="update-date">${esc(update.date)}<br><span>${esc(update.category)}</span></div>
    <div><h3>${esc(update.title)}</h3><p>${esc(update.text)}</p></div><span class="update-star">✧</span></article>`
).join('');

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
toggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

renderCollection();
renderRoute();
window.addEventListener('hashchange', renderRoute);
