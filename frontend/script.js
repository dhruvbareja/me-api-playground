const api = (path) => `/api${path}`;

async function checkHealth() {
  try {
    const res = await fetch(api('/health'));
    const data = await res.json();
    document.getElementById('health').textContent = data.status;
  } catch {
    document.getElementById('health').textContent = 'down';
  }
}

async function loadProfile() {
  const res = await fetch(api('/profile'));
  const p = await res.json();
  document.getElementById('profile').innerHTML = `
    <h3>${p.name}</h3>
    <p>${p.education || ''}</p>
    <p><a href="mailto:${p.email}">${p.email}</a></p>
    <div class="tags">
      ${p.github ? `<a class="tag" href="${p.github}" target="_blank">GitHub</a>` : ''}
      ${p.linkedin ? `<a class="tag" href="${p.linkedin}" target="_blank">LinkedIn</a>` : ''}
      ${p.portfolio ? `<a class="tag" href="${p.portfolio}" target="_blank">Portfolio</a>` : ''}
    </div>
  `;
}

function renderProjectCard(p) {
  const tags = (p.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
  return `<div class="card">
    <h3>${p.title}</h3>
    <p class="muted">${p.description}</p>
    ${p.link ? `<a href="${p.link}" target="_blank">🔗 View Project</a>` : ''}
    <div>${tags}</div>
  </div>`;
}

async function loadProjects(skill = '') {
  const url = skill ? api(`/projects?skill=${encodeURIComponent(skill)}`) : api('/projects');
  const res = await fetch(url);
  const items = await res.json();
  document.getElementById('projects').innerHTML = items.map(renderProjectCard).join('');
}

async function loadTopSkills() {
  const res = await fetch(api('/skills/top'));
  const items = await res.json();
  const el = document.getElementById('top-skills');
  el.innerHTML = items.map(x =>
    `<span class="skill" onclick="loadProjects('${x.name}')">${x.name} (${x.count})</span>`
  ).join('');
}

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const res = await fetch(api(`/search?q=${encodeURIComponent(q)}`));
  const data = await res.json();
  const projects = data.projects || [];
  const skills = data.skills || [];
  document.getElementById('search-results').innerHTML = `
    <div><strong>Skills:</strong> ${skills.map(s => `<span class="tag">${s}</span>`).join('')}</div>
    <h3 style="margin-top:8px;">Projects</h3>
    ${projects.map(renderProjectCard).join('') || '<p>No results found</p>'}
  `;
}

// Events
document.getElementById('filter-btn').addEventListener('click', () => {
  loadProjects(document.getElementById('skill-filter').value.trim());
});
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('skill-filter').value = '';
  loadProjects('');
});
document.getElementById('search-btn').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') doSearch();
});

// Init
checkHealth();
loadProfile();
loadTopSkills();
loadProjects();