const characters = window.NYX_CHARACTERS || [];
const updates = window.NYX_UPDATES || [];
const byId = id => document.getElementById(id);
const grid = byId('character-grid');
const search = byId('search');
const genre = byId('genre');
const trope = byId('trope');
const savedOnly = byId('saved-only');
const storyTypes = [...document.querySelectorAll('[name=story-type]')];
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
const archive = characters.filter(character => !character.inProgress);
const worlds = new Map(["Elyndor","Lirenne","Sons of Lamia","Araya","Thaloria","Daril","Edrath","Contemporary"].map(name => [name, []]));
for (const character of archive) {
  if (!character.world) continue;
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
        <div class="card-top"><span>${esc(character.genre)}</span>
          ${character.messages ? `<span>${character.messages.toLocaleString('en-US')} messages</span>` : ''}</div>
        <h3>${name}</h3><p class="card-title">${esc(character.title || character.description)}</p>
        <div class="card-bottom"><span>${esc(character.world || character.type)}</span><span>Read profile ↗</span></div>
      </div>
    </a>
    <button class="favorite" type="button" data-favorite="${esc(character.id)}"
      aria-label="Save ${name}" aria-pressed="${pressed}">${pressed ? '♥' : '♡'}</button>
  </article>`;
}

function matchingStories() {
  const query = search.value.trim().toLowerCase();
  const type = storyTypes.find(control => control.checked).value;
  return archive.filter(character =>
    (type === 'all' || character.type === type)
    &&
    (genre.value === 'all' || character.genre === genre.value)
    && (trope.value === 'all' || character.tropes.includes(trope.value))
    && (!savedOnly.checked || favorites.has(character.id))
    && [character.name, character.title, character.world, character.genre,
      character.description, ...character.tropes].join(' ').toLowerCase().includes(query)
  );
}

function renderCollection() {
  const matches = matchingStories();
  byId('surprise').disabled = !matches.length;
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
  const character = hash.startsWith('#character-') && characters.find(entry => entry.id === (key === 'haisan' ? 'heisan' : key));
  const renamedWorlds = { 'Court of Thorns': 'Elyndor', 'Caer Avar': 'Elyndor', Ayara: 'Araya', 'Daril Empire': 'Daril', Galewynd: 'Edrath', 'Contemporary Romance': 'Contemporary' };
  if (hash.startsWith('#world/') && Object.hasOwn(renamedWorlds, key)) key = renamedWorlds[key];
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
  detail.innerHTML = `<nav class="detail-nav" aria-label="Breadcrumb"><a href="${character?.inProgress ? '#in-progress' : '#archive'}">← ${character?.inProgress ? 'Works in Progress' : 'The Archive'}</a>
    ${character ? (worlds.has(worldName) ? `<a href="${worldLink}">${esc(worldName)} ↗</a>` : '') : '<a href="#worlds">All worlds ↗</a>'}</nav>
    ${character ? `<article class="profile-layout detail-panel story-book">
      <div class="book-cover" aria-hidden="true">
        <div class="book-cover-front"><span>☾</span><strong>House of Nyx</strong></div>
        <div class="book-cover-back"></div>
      </div>
      ${portrait(character, 'profile-art')}
      <div class="profile-body">
        <p class="eyebrow">${esc(character.genre)}</p><h1 tabindex="-1">${esc(title)}</h1>
        ${character.title ? `<h2>${esc(character.title)}</h2>` : ''}<p class="profile-description">${esc(character.description)}</p>
        ${character.details ? `<p>${esc(character.details)}</p>` : ''}
        <div class="profile-tags">${character.tropes.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
        ${/^https?:\/\//i.test(character.url) ? `<a class="button button-primary" href="${esc(character.url)}" target="_blank" rel="noopener noreferrer">Open on DreamJourneyAI ↗</a>`
          : '<p class="link-note">DreamJourneyAI link coming soon.</p>'}
      </div>
    </article>` : `<h1 tabindex="-1">${esc(title)}</h1><div class="character-grid">${world.map(characterCard).join('')}</div>`}`;
  window.scrollTo(0, 0);
  detail.querySelector('h1').focus({ preventScroll: true });
}

addOptions(genre, archive.map(character => character.genre));
addOptions(trope, archive.flatMap(character => character.tropes));
search.addEventListener('input', renderCollection);
for (const filter of [genre, trope, savedOnly, ...storyTypes]) filter.addEventListener('change', renderCollection);
byId('clear').addEventListener('click', () => {
  search.value = '';
  genre.value = trope.value = 'all';
  savedOnly.checked = false;
  storyTypes[0].checked = true;
  renderCollection();
});

byId('surprise').addEventListener('click', () => {
  const matches = matchingStories();
  const story = matches[Math.floor(Math.random() * matches.length)];
  if (story) location.hash = '#character-' + encodeURIComponent(story.id);
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
  for (const control of document.querySelectorAll('[data-favorite]')) {
    if (control.dataset.favorite !== id) continue;
    control.setAttribute('aria-pressed', pressed);
    control.textContent = pressed ? '♥' : '♡';
  }
  if (savedOnly.checked && grid.contains(button)) {
    renderCollection();
    byId('saved-only').focus();
  } else {
    if (savedOnly.checked) renderCollection();
  }
});

const popular = archive.filter(character => character.messages)
  .sort((first, second) => second.messages - first.messages).slice(0, 6);
if (popular.length) {
  byId('featured').hidden = false;
  const [lead, ...other] = popular;
  const leadLink = `#character-${encodeURIComponent(lead.id)}`;
  byId('featured').innerHTML = `<div class="section-heading"><h2>Most Popular</h2></div>
    <article class="featured-story">
      <a href="${leadLink}" aria-label="Read ${esc(lead.name)} profile">${portrait(lead)}</a>
      <div class="featured-copy"><p class="eyebrow">Most-chatted story · ${lead.messages.toLocaleString('en-US')} messages</p>
      <h3>${esc(lead.name)}</h3><p>${esc(lead.description)}</p>
      <a class="button button-primary" href="${leadLink}">Open this story ↗</a></div>
    </article>
    <details class="popular-more"><summary>See the rest of the top six</summary>
    <div class="character-grid">${other.map(characterCard).join('')}</div></details>`;
}

byId('progress-grid').innerHTML = ['heisan', 'dracula', 'caedric-nondros', 'tykan-aendart', 'conall-thanlar']
  .map(id => characters.find(character => character.id === id && character.inProgress))
  .filter(Boolean).map(characterCard).join('');

byId('world-grid').innerHTML = [...worlds].filter(([, entries]) => entries.length).map(([world, entries]) =>
  `<a class="world-card" href="#world/${encodeURIComponent(world)}">${portrait(entries[0], 'world-art')}<h3>${esc(world)}</h3>
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
