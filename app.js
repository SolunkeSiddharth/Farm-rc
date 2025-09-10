console.log('app.js loaded');

// Storage keys
const STORAGE_KEYS = {
  farms: 'fr_farms',
  applications: 'fr_apps',
  crops: 'fr_crops',
  activities: 'fr_acts'
};

let farms = [];
let applications = [];
let crops = [];
let activities = [];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));

function loadAll() {
  const parse = key => JSON.parse(localStorage.getItem(key) ?? '[]');
  return {
    farms: parse(STORAGE_KEYS.farms),
    applications: parse(STORAGE_KEYS.apps),
    crops: parse(STORAGE_KEYS.crops),
    activities: parse(STORAGE_KEYS.activities)
  };
}

function saveAll() {
  localStorage.setItem(STORAGE_KEYS.farms, JSON.stringify(farms));
  localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
  localStorage.setItem(STORAGE_KEYS.crops, JSON.stringify(crops));
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
}

(function init() {
  const data = loadAll();
  farms = data.farms;
  applications = data.applications;
  crops = data.crops;
  activities = data.activities;
})();

window.addEventListener('storage', e => {
  if (Object.values(STORAGE_KEYS).includes(e.key)) {
    const data = loadAll();
    farms = data.farms;
    applications = data.applications;
    crops = data.crops;
    activities = data.activities;
    renderCurrentSection();
  }
});

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString();
}

function generateId(arr) {
  return arr.length ? Math.max(...arr.map(item => item.id)) + 1 : 1;
}

function renderCurrentSection() {
  const active = document.querySelector('.section.active');
  if (!active) return;
  switch(active.id) {
    case 'dashboard': renderDashboard(); break;
    case 'farms': renderFarms(); break;
    case 'applications': renderApplications(); break;
    case 'crops': renderCrops(); break;
    case 'records': renderRecords(); break;
    case 'historical': renderHistorical(); break;
  }
}

// Navigation events
const navItems = $$('nav .nav-item');
navItems.forEach(item => item.addEventListener('click', () => {
  navItems.forEach(i => i.classList.remove('active'));
  item.classList.add('active');

  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  const target = item.dataset.section;
  const section = document.getElementById(target);
  if (section) section.classList.add('active');
  renderCurrentSection();
}));

// Reset data button
const resetButton = $('#resetDataBtn');
if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      farms = [];
      applications = [];
      crops = [];
      activities = [];
      alert('All data cleared.');
      renderCurrentSection();
    }
  });
}

// Render dashboard
function renderDashboard() {
  const dash = $('#dashboard');
  const recentApps = applications.filter(a => {
    const dateDiff = (Date.now() - new Date(a.date)) / (1000*60*60*24);
    return dateDiff <= 30;
  }).length;
  
  dash.innerHTML = `
    <h1>Farm Dashboard</h1>
    <div>
      <p>Total Farms: ${farms.length}</p>
      <p>Applications this month: ${recentApps}</p>
      <p>Active Crops: ${crops.length}</p>
    </div>
  `;
}

// Render farms management
function renderFarms() {
  const farmsSection = $('#farms');
  farmsSection.innerHTML = `
    <h1>Manage Farms</h1>
    <form id="farmForm">
      <input id="farmName" placeholder="Farm Name" required />
      <input id="farmId" placeholder="Farm ID" required />
      <input id="farmLocation" placeholder="Location" />
      <input id="farmSize" type="number" step="0.01" placeholder="Size (acres)" />
      <button type="submit">Add Farm</button>
    </form>
    <table>
      <thead><tr><th>Name</th><th>ID</th><th>Location</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody id="farmTableBody"></tbody>
    </table>
  `;

  const tbody = $('#farmTableBody');
  
  function refreshFarmTable() {
    tbody.innerHTML = farms.map(farm => `
      <tr>
        <td>${farm.name}</td>
        <td>${farm.farmId}</td>
        <td>${farm.location || ''}</td>
        <td>${farm.size || ''}</td>
        <td>
          <button class="edit-farm" data-id="${farm.id}">Edit</button>
          <button class="delete-farm" data-id="${farm.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    // Attach event listeners for edit and delete
    $$('.edit-farm').forEach(btn => btn.addEventListener('click', editFarm));
    $$('.delete-farm').forEach(btn => btn.addEventListener('click', deleteFarm));
  }

  function editFarm(e) {
    let id = Number(e.target.dataset.id);
    let farm = farms.find(f => f.id === id);
    if (!farm) return alert('Farm not found');
    let newName = prompt('New Farm Name', farm.name);
    if (!newName) return;
    farm.name = newName.trim();
    saveAll();
    refreshFarmTable();
  }

  function deleteFarm(e) {
    let id = Number(e.target.dataset.id);
    if (!confirm('Delete this farm?')) return;
    farms = farms.filter(f => f.id !== id);
    saveAll();
    refreshFarmTable();
    renderCurrentSection();
  }

  $('#farmForm').addEventListener('submit', e => {
    e.preventDefault();
    let name = $('#farmName').value.trim();
    let farmId = $('#farmId').value.trim();
    if (!name || !farmId) {
      alert('Please enter Name and ID');
      return;
    }
    if (farms.some(f => f.farmId.toLowerCase() === farmId.toLowerCase())) {
      alert('Farm ID must be unique');
      return;
    }
    farms.push({
      id: generateId(farms),
      name,
      farmId,
      location: $('#farmLocation').value.trim(),
      size: Number($('#farmSize').value) || 0
    });
    activities.push({ date: (new Date()).toISOString().split('T')[0], action: `Added farm ${name}` });
    saveAll();
    refreshFarmTable();
    e.target.reset();
  });

  refreshFarmTable();
}
// Functions for Applications, Crops, Records, and Historical would follow similar structure as Farms

function renderApplications() {
  const sec = $('#applications');
  // Implement rendering and managing applications similarly to farms
}

function renderCrops() {
  const sec = $('#crops');
  // Implement rendering and managing crops similarly to farms
}

function renderRecords() {
  const sec = $('#records');
  // Show combined records from farms, applications, and crops, with filters and actions
}

function renderHistorical() {
  const sec = $('#historical');
  /* Generate statistics comparing applications data year over year, show growth %, etc */
}

// Utility: rerender currently active section
function rerenderCurrentSection() {
  const activeId = document.querySelector('.section.active')?.id || 'dashboard';
  switch(activeId) {
    case 'dashboard': renderDashboard(); break;
    case 'farms': renderFarms(); break;
    case 'applications': renderApplications(); break;
    case 'crops': renderCrops(); break;
    case 'records': renderRecords(); break;
    case 'historical': renderHistorical(); break;
  }
}

// Set today's date wherever needed
function setToday() {
  const el = $('#currentDate');
  if (el) el.textContent = new Date().toLocaleDateString();
}

// On page loaded
document.addEventListener('DOMContentLoaded', () => {
  rerenderCurrentSection();
  setToday();
});
