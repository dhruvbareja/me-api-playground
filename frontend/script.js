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

let allSkills = [];

async function preloadSkills() {
  const res = await fetch(api('/skills'));
  allSkills = await res.json();
}

// Dark Mode Toggle
document.getElementById('dark-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  localStorage.setItem("darkmode", dark); // save preference
});

// Apply saved theme on load
window.addEventListener('load', () => {
  if (localStorage.getItem("darkmode") === "true") {
    document.body.classList.add("dark");
  }
});
// Load saved preference
if (localStorage.getItem("darkmode") === "true") {
  document.body.classList.add("dark");
}

document.getElementById('search-input').addEventListener('input', (e) => {
  const val = e.target.value.toLowerCase();
  const suggestions = allSkills.filter(s => s.toLowerCase().includes(val)).slice(0,5);
  const sugBox = document.getElementById('suggestions');
  sugBox.innerHTML = suggestions.map(s => `<div onclick="useSuggestion('${s}')">${s}</div>`).join('');
});

function useSuggestion(skill) {
  document.getElementById('search-input').value = skill;
  document.getElementById('suggestions').innerHTML = '';
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
  document.getElementById('top-skills').innerHTML =
    items.map(x => `<span class="skill" onclick="loadProjects('${x.name}')">${x.name} (${x.count})</span>`).join('');
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

// 🔑 JWT handling
let token = null;

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(api('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    token = data.access_token;
    localStorage.setItem("jwt", token);
    document.getElementById('login-status').textContent = "✅ Logged in successfully!";
  } catch {
    document.getElementById('login-status').textContent = "❌ Invalid credentials";
  }
}

function logout() {
  localStorage.removeItem("jwt");
  token = null;
  document.getElementById('login-status').textContent = "🔒 Logged out";
}

async function createProject() {
  if (!token) {
    alert("Please login first!");
    return;
  }

  const title = document.getElementById("proj-title").value.trim();
  const description = document.getElementById("proj-desc").value.trim();
  const skills = document.getElementById("proj-skills").value.split(",").map(s => s.trim());

  const newProject = { title, description, skills };

  const res = await fetch(api('/projects'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newProject)
  });

  if (res.ok) {
    alert("✅ Project created!");
    loadProjects();
  } else {
    alert("❌ Failed to create project. Maybe token expired?");
  }
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('filter-btn').addEventListener('click', () => loadProjects(document.getElementById('skill-filter').value.trim()));
document.getElementById('clear-btn').addEventListener('click', () => { document.getElementById('skill-filter').value = ''; loadProjects(''); });
document.getElementById('search-btn').addEventListener('click', doSearch);
document.getElementById('search-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });

window.onload = () => {
  const saved = localStorage.getItem("jwt");
  if (saved) {
    token = saved;
    document.getElementById('login-status').textContent = "🔑 Using saved login";
  }
  checkHealth();
  loadProfile();
  loadTopSkills();
  loadProjects();
};