const state = {
  apps: [],
  category: 'All',
  query: '',
  sort: 'stars'
};

const appsEl = document.querySelector('#apps');
const filtersEl = document.querySelector('#filters');
const searchEl = document.querySelector('#search');
const sortEl = document.querySelector('#sort');
const statsEl = document.querySelector('#stats');

fetch('apps.json')
  .then(response => response.json())
  .then(apps => {
    state.apps = apps;
    renderFilters();
    render();
  });

searchEl.addEventListener('input', event => {
  state.query = event.target.value.toLowerCase();
  render();
});

sortEl.addEventListener('change', event => {
  state.sort = event.target.value;
  render();
});

function renderFilters() {
  const categories = ['All', ...new Set(state.apps.map(app => app.category))];

  filtersEl.innerHTML = categories.map(category => `
    <button class="${category === state.category ? 'active' : ''}" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join('');

  filtersEl.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderFilters();
      render();
    });
  });
}

function render() {
  let apps = [...state.apps];

  if (state.category !== 'All') {
    apps = apps.filter(app => app.category === state.category);
  }

  if (state.query) {
    apps = apps.filter(app => {
      const haystack = [
        app.name,
        app.description,
        app.language,
        app.category,
        ...(app.topics || [])
      ].join(' ').toLowerCase();

      return haystack.includes(state.query);
    });
  }

  apps.sort((a, b) => {
    if (state.sort === 'stars') return Number(b.stars || 0) - Number(a.stars || 0);
    if (state.sort === 'language') return String(a.language || '').localeCompare(String(b.language || ''));
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  statsEl.textContent = `${apps.length} visible artifacts / ${state.apps.length} total`;

  appsEl.innerHTML = apps.map(app => `
    <article class="card">
      <h2>
        <a href="${escapeAttr(app.url)}" target="_blank" rel="noopener">
          ${escapeHtml(app.name)}
        </a>
      </h2>

      <p>${escapeHtml(app.description || 'No description')}</p>

      <p class="meta">
        ⭐ ${Number(app.stars || 0)} · ${escapeHtml(app.language || 'Unknown')} · ${escapeHtml(app.category)}
      </p>

      <p class="topics">
        ${(app.topics || []).slice(0, 8).map(topic => `<span class="topic">${escapeHtml(topic)}</span>`).join('')}
      </p>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeMatrix();
window.addEventListener('resize', resizeMatrix);

const chars = '01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fontSize = 16;
let columns = Math.floor(window.innerWidth / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 8, 7, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ff9c';
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 45);
