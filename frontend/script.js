
const api = (path) => `/api${path}`;

async function checkHealth() {
  try {
    const res = await fetch(api('/health'));
    const data = await res.json();
    document.getElementById('health').textContent = data.status;
  } catch (e) {
    document.getElementById('health').textContent = 'down';
  }
}

async function loadProfile() {
  const res = await fetch(api('/profile'));
  const p = await res.json();
  const el = document.getElementById('profile');
  el.innerHTML = `
    <div><strong>Name:</strong> ${p.name}</div>
    <div><strong>Email:</strong> ${p.email}</div>
    <div><strong>Education:</strong> ${p.education || '-'}</div>
    <div><strong>Links:</strong>
      <a href="${p.github || '#'}" target="_blank">GitHub</a> |
      <a href="${p.linkedin || '#'}" target="_blank">LinkedIn</a> |
      <a href="${p.portfolio || '#'}" target="_blank">Portfolio</a>
    </div>
  `;
}

function renderProjectCard(p) {
  const tags = (p.skills || []).map(s => `<span class="tag">${s}</span>`).join('');
  return `<div class="card">
    <div><strong>${p.title}</strong></div>
    <div class="muted">${p.description}</div>
    ${p.link ? `<div><a href="${p.link}" target="_blank">Link</a></div>` : ''}
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
  document.getElementById('top-skills').innerHTML =
    items.map(x => `<li>${x.name} <span class="muted">(${x.count})</span></li>`).join('');
}

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const res = await fetch(api(`/search?q=${encodeURIComponent(q)}`));
  const data = await res.json();
  const projects = data.projects || [];
  const skills = data.skills || [];
  const el = document.getElementById('search-results');
  el.innerHTML = `
    <div><strong>Skills:</strong> ${skills.map(s => `<span class="tag">${s}</span>`).join('')}</div>
    <div style="margin-top:8px;"><strong>Projects:</strong></div>
    ${projects.map(renderProjectCard).join('')}
  `;
}

document.getElementById('filter-btn').addEventListener('click', () => {
  const val = document.getElementById('skill-filter').value.trim();
  loadProjects(val);
});
document.getElementById('clear-btn').addEventListener('click', () => {
  document.getElementById('skill-filter').value = '';
  loadProjects('');
});
document.getElementById('search-btn').addEventListener('click', doSearch);

// Init
checkHealth();
loadProfile();
loadTopSkills();
loadProjects();
