// Farm Record Management System with localStorage persistence

// ---- Storage Keys ----
const STORAGE_KEYS = {
  farms: 'fr_farms',
  applications: 'fr_apps',
  crops: 'fr_crops',
  activities: 'fr_acts'
};

// ---- In-memory data (start empty; will load from storage) ----
let farms = [];
let applications = [];
let crops = [];
let activities = [];

// ---- Helpers: load/save all ----
function loadAll() {
  const parse = (k) => JSON.parse(localStorage.getItem(k) || '[]'); // null -> []
  return {
    farms: parse(STORAGE_KEYS.farms),
    applications: parse(STORAGE_KEYS.applications),
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

// ---- Initialize from localStorage ----
(function initFromStorage(){
  const s = loadAll();
  farms = s.farms;
  applications = s.applications;
  crops = s.crops;
  activities = s.activities;
})();

// ---- Cross-tab sync ----
window.addEventListener('storage', (e) => {
  if (!Object.values(STORAGE_KEYS).includes(e.key)) return;
  const s = loadAll();
  farms = s.farms; applications = s.applications; crops = s.crops; activities = s.activities;
  rerenderActive();
});

// ---- Utilities ----
function generateId(arr){ return arr.length ? Math.max(...arr.map(i=>i.id || 0)) + 1 : 1; }
function formatDate(d){ const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString(); }
function getFarmNameById(id){ const f = farms.find(x=>x.id===id); return f ? f.name : 'Unknown Farm'; }
function $(sel, ctx=document){ return ctx.querySelector(sel); }
function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }
function setToday(){ const el = $('#currentDate'); if (el) el.textContent = new Date().toLocaleDateString(); }
function rerenderActive(){
  const id = $('.section.active')?.id || 'dashboard';
  if (id==='dashboard') renderDashboard();
  if (id==='farms') renderFarms();
  if (id==='applications') renderApplications();
  if (id==='crops') renderCrops();
  if (id==='records') renderRecords();
  if (id==='historical') renderHistorical();
}

// ---- Navigation ----
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
if (navToggle && navMenu) navToggle.addEventListener('click',()=>navMenu.classList.toggle('show'));

const navItems = document.querySelectorAll('.nav-item');
function showSection(id){
  document.querySelectorAll('.section').forEach(sec=>sec.classList.toggle('active', sec.id===id));
  navItems.forEach(btn=>btn.classList.toggle('active', btn.dataset.section===id));
}
navItems.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.dataset.section;
    showSection(id);
    if (id==='dashboard') renderDashboard();
    if (id==='farms') renderFarms();
    if (id==='applications') renderApplications();
    if (id==='crops') renderCrops();
    if (id==='records') renderRecords();
    if (id==='historical') renderHistorical();
  });
});

// ---- Reset Data button (navbar) ----
const resetBtn = document.getElementById('resetDataBtn');
if (resetBtn){
  resetBtn.addEventListener('click', ()=>{
    if (!confirm('This will clear all locally saved data on this device. Continue?')) return;
    localStorage.removeItem(STORAGE_KEYS.farms);
    localStorage.removeItem(STORAGE_KEYS.applications);
    localStorage.removeItem(STORAGE_KEYS.crops);
    localStorage.removeItem(STORAGE_KEYS.activities);
    farms=[]; applications=[]; crops=[]; activities=[];
    saveAll();
    rerenderActive();
    alert('All local data cleared.');
  });
}

// ---- Dashboard ----
function renderDashboard(){
  const sec = $('#dashboard');
  const totalFarms = farms.length;
  const recentApps = applications.filter(a=>{
    const dt=new Date(a.date); const weekAgo=new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    return !isNaN(dt) && dt>=weekAgo;
  }).length;
  const recentCropsCount = crops.filter(c=>{
    const dt=new Date(c.plantationDate); const monthAgo=new Date(); monthAgo.setMonth(monthAgo.getMonth()-1);
    return !isNaN(dt) && dt>=monthAgo;
  }).length;

  sec.innerHTML = `
    <div class="section-header">
      <h1>Farm Dashboard</h1>
      <p class="current-date" id="currentDate"></p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🏡</div><div><h3>${totalFarms}</h3><p>Total Farms</p></div></div>
      <div class="stat-card"><div class="stat-icon">🧪</div><div><h3>${recentApps}</h3><p>Applications (7 days)</p></div></div>
      <div class="stat-card"><div class="stat-icon">🌱</div><div><h3>${recentCropsCount}</h3><p>New Crops (30 days)</p></div></div>
    </div>
    <div>
      <h2>Recent Activities</h2>
      <ul>${activities.slice(-10).reverse().map(a=>`<li>${a.date}: ${a.action}</li>`).join('')}</ul>
    </div>
  `;
  setToday();
}

// ---- Farms ----
function renderFarms(){
  const sec = $('#farms');
  sec.innerHTML = `
    <div class="section-header"><h1>Manage Farms</h1></div>
    <form id="farmForm">
      <label for="farmName">Farm Name *</label><input id="farmName" required/>
      <label for="farmId">Farm ID (unique) *</label><input id="farmId" required/>
      <label for="farmLocation">Location</label><input id="farmLocation"/>
      <label for="farmSize">Size (acres)</label><input id="farmSize" type="number" min="0" step="0.1"/>
      <button type="submit">Add Farm</button>
    </form>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Farm ID</th><th>Location</th><th>Size</th><th>Actions</th></tr></thead>
        <tbody id="farmsTbody"></tbody>
      </table>
    </div>
  `;

  const tbody = $('#farmsTbody');
  tbody.innerHTML = farms.map(f=>`
    <tr>
      <td>${f.name}</td><td>${f.farmId}</td><td>${f.location||''}</td><td>${f.size??''}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${f.id}">✏️</button>
        <button class="action-btn delete-btn" data-id="${f.id}">🗑️</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="5">No farms yet.</td></tr>`;

  // Create
  $('#farmForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#farmName').value.trim();
    const farmId = $('#farmId').value.trim();
    const location = $('#farmLocation').value.trim();
    const size = parseFloat($('#farmSize').value);
    if (!name || !farmId) return alert('Farm Name and Farm ID are required.');
    if (farms.some(f=>f.farmId.toLowerCase()===farmId.toLowerCase())) return alert('Farm ID must be unique.');
    const item = { id: generateId(farms), name, farmId, location, size: isNaN(size)?0:size, dateAdded: new Date().toISOString().slice(0,10) };
    farms.push(item); activities.push({date: item.dateAdded, action:`Added farm ${name}`, type:'farm'});
    saveAll(); renderFarms();
  });

  // Edit
  $all('.edit-btn', tbody).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = parseInt(btn.dataset.id,10); const f = farms.find(x=>x.id===id); if (!f) return;
      const newName = prompt('Edit Farm Name:', f.name); if (newName===null) return;
      const newLocation = prompt('Edit Location:', f.location||''); if (newLocation===null) return;
      const newSizeStr = prompt('Edit Size (acres):', f.size??''); if (newSizeStr===null) return;
      const newSize = parseFloat(newSizeStr);
      if (!newName.trim()) return alert('Farm name cannot be empty.');
      f.name=newName.trim(); f.location=(newLocation||'').trim(); if(!isNaN(newSize)) f.size=newSize;
      saveAll(); renderFarms();
    });
  });

  // Delete
  $all('.delete-btn', tbody).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = parseInt(btn.dataset.id,10);
      if (!confirm('Delete this farm and related records?')) return;
      farms = farms.filter(x=>x.id!==id);
      applications = applications.filter(a=>a.farmId!==id);
      crops = crops.filter(c=>c.farmId!==id);
      activities.push({date:new Date().toISOString().slice(0,10), action:'Deleted a farm', type:'farm'});
      saveAll(); renderFarms();
    });
  });
}

// ---- Applications ----
function renderApplications(){
  const sec = $('#applications');
  sec.innerHTML = `
    <div class="section-header"><h1>Record Fertilizer & Spray</h1></div>
    <form id="appForm">
      <label for="appType">Product Type *</label>
      <select id="appType" required>
        <option value="">Select</option><option>Fertilizer</option><option>Pesticide</option><option>Herbicide</option>
      </select>
      <label for="productName">Product Name *</label><input id="productName" required/>
      <label for="quantity">Quantity *</label><input id="quantity" type="number" min="0" step="0.1" required/>
      <label for="unit">Unit *</label>
      <select id="unit" required><option>kg</option><option>liters</option><option>bags</option></select>
      <label for="appDate">Application Date *</label><input id="appDate" type="date" required/>
      <label for="farmSelect">Farm *</label>
      <select id="farmSelect" required>
        <option value="">Select Farm</option>
        ${farms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}
      </select>
      <label for="method">Method *</label>
      <select id="method" required><option>Spray</option><option>Granular</option><option>Liquid</option></select>
      <label for="notes">Notes</label><textarea id="notes" placeholder="Optional"></textarea>
      <button type="submit">Add Application</button>
    </form>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Type</th><th>Product</th><th>Qty</th><th>Date</th><th>Farm</th><th>Method</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody id="appsTbody"></tbody>
      </table>
    </div>
  `;

  const tbody = $('#appsTbody');
  function paint(){
    tbody.innerHTML = applications.map(a=>`
      <tr>
        <td>${a.type}</td><td>${a.productName}</td><td>${a.quantity} ${a.unit}</td>
        <td>${formatDate(a.date)}</td><td>${getFarmNameById(a.farmId)}</td><td>${a.method}</td><td>${a.notes||''}</td>
        <td><button class="action-btn edit-btn" data-id="${a.id}">✏️</button><button class="action-btn delete-btn" data-id="${a.id}">🗑️</button></td>
      </tr>
    `).join('') || `<tr><td colspan="8">No applications yet.</td></tr>`;
    bindRowActions();
  }
  function bindRowActions(){
    $all('.edit-btn', tbody).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = parseInt(btn.dataset.id,10); const a = applications.find(x=>x.id===id); if (!a) return;
        const t = prompt('Type (Fertilizer/Pesticide/Herbicide):', a.type); if (t===null) return;
        const p = prompt('Product Name:', a.productName); if (p===null) return;
        const qStr = prompt('Quantity:', a.quantity); if (qStr===null) return; const q = parseFloat(qStr);
        const u = prompt('Unit (kg/liters/bags):', a.unit); if (u===null) return;
        const d = prompt('Date (YYYY-MM-DD):', a.date); if (d===null) return;
        const m = prompt('Method (Spray/Granular/Liquid):', a.method); if (m===null) return;
        const n = prompt('Notes (optional):', a.notes||''); if (n===null) return;
        if (!t||!p||isNaN(q)||!u||!d||!m) return alert('Invalid input.');
        a.type=t; a.productName=p; a.quantity=q; a.unit=u; a.date=d; a.method=m; a.notes=n;
        saveAll(); paint();
      });
    });
    $all('.delete-btn', tbody).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = parseInt(btn.dataset.id,10);
        if (!confirm('Delete this application record?')) return;
        applications = applications.filter(x=>x.id!==id);
        saveAll(); paint();
      });
    });
  }

  // Create
  $('#appForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const type = $('#appType').value;
    const productName = $('#productName').value.trim();
    const quantity = parseFloat($('#quantity').value);
    const unit = $('#unit').value;
    const date = $('#appDate').value;
    const farmId = parseInt($('#farmSelect').value,10);
    const method = $('#method').value;
    const notes = $('#notes').value.trim();
    if (!type||!productName||isNaN(quantity)||!unit||!date||isNaN(farmId)||!method) return alert('Please fill all required fields.');
    const item = { id: generateId(applications), type, productName, quantity, unit, date, farmId, method, notes };
    applications.push(item);
    activities.push({date, action:`Applied ${productName} to ${getFarmNameById(farmId)}`, type:type.toLowerCase()});
    saveAll(); paint(); e.target.reset();
  });

  paint();
}

// ---- Crops ----
function renderCrops(){
  const sec = $('#crops');
  sec.innerHTML = `
    <div class="section-header"><h1>Manage Crops</h1></div>
    <form id="cropForm">
      <label for="cropName">Crop Name *</label><input id="cropName" required/>
      <label for="variety">Variety</label><input id="variety"/>
      <label for="plantationDate">Plantation Date *</label><input id="plantationDate" type="date" required/>
      <label for="harvestDate">Expected Harvest Date *</label><input id="harvestDate" type="date" required/>
      <label for="cropFarm">Farm *</label>
      <select id="cropFarm" required>
        <option value="">Select Farm</option>
        ${farms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}
      </select>
      <label for="areaPlanted">Area Planted (acres)</label><input id="areaPlanted" type="number" min="0" step="0.1"/>
      <label for="cropNotes">Notes</label><textarea id="cropNotes" placeholder="Optional"></textarea>
      <button type="submit">Add Crop</button>
    </form>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Crop</th><th>Variety</th><th>Plant</th><th>Harvest</th><th>Farm</th><th>Area</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody id="cropsTbody"></tbody>
      </table>
    </div>
  `;

  const tbody = $('#cropsTbody');
  function paint(){
    tbody.innerHTML = crops.map(c=>`
      <tr>
        <td>${c.cropName}</td><td>${c.variety||''}</td><td>${formatDate(c.plantationDate)}</td>
        <td>${formatDate(c.harvestDate)}</td><td>${getFarmNameById(c.farmId)}</td>
        <td>${c.area||''}</td><td>${c.notes||''}</td>
        <td><button class="action-btn edit-btn" data-id="${c.id}">✏️</button><button class="action-btn delete-btn" data-id="${c.id}">🗑️</button></td>
      </tr>
    `).join('') || `<tr><td colspan="8">No crops yet.</td></tr>`;
    bindRowActions();
  }
  function bindRowActions(){
    $all('.edit-btn', tbody).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = parseInt(btn.dataset.id,10); const c = crops.find(x=>x.id===id); if (!c) return;
        const name = prompt('Crop Name:', c.cropName); if (name===null) return;
        const variety = prompt('Variety:', c.variety||''); if (variety===null) return;
        const plant = prompt('Plantation Date (YYYY-MM-DD):', c.plantationDate); if (plant===null) return;
        const harvest = prompt('Harvest Date (YYYY-MM-DD):', c.harvestDate); if (harvest===null) return;
        const areaStr = prompt('Area (acres):', c.area??''); if (areaStr===null) return; const area = parseFloat(areaStr);
        const notes = prompt('Notes:', c.notes||''); if (notes===null) return;
        if (!name||!plant||!harvest) return alert('Crop name, plantation date, and harvest date are required.');
        if (new Date(plant) > new Date(harvest)) return alert('Plantation date cannot be after harvest date.');
        c.cropName=name.trim(); c.variety=(variety||'').trim(); c.plantationDate=plant; c.harvestDate=harvest; if(!isNaN(area)) c.area=area; c.notes=(notes||'').trim();
        saveAll(); paint();
      });
    });
    $all('.delete-btn', tbody).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = parseInt(btn.dataset.id,10);
        if (!confirm('Delete this crop record?')) return;
        crops = crops.filter(x=>x.id!==id);
        saveAll(); paint();
      });
    });
  }

  // Create
  $('#cropForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const cropName = $('#cropName').value.trim();
    const variety = $('#variety').value.trim();
    const plantationDate = $('#plantationDate').value;
    const harvestDate = $('#harvestDate').value;
    const farmId = parseInt($('#cropFarm').value,10);
    const area = parseFloat($('#areaPlanted').value);
    const notes = $('#cropNotes').value.trim();
    if (!cropName||!plantationDate||!harvestDate||isNaN(farmId)) return alert('Please fill all required fields.');
    if (new Date(plantationDate) > new Date(harvestDate)) return alert('Plantation date cannot be after harvest date.');
    const item = { id: generateId(crops), cropName, variety, plantationDate, harvestDate, farmId, area: isNaN(area)?0:area, notes };
    crops.push(item);
    activities.push({date: plantationDate, action:`Planted ${cropName} at ${getFarmNameById(farmId)}`, type:'crop'});
    saveAll(); paint(); e.target.reset();
  });

  paint();
}

// ---- Records (combined view) ----
function renderRecords(){
  const sec = $('#records');
  sec.innerHTML = `
    <div class="section-header"><h1>All Records</h1></div>
    <div class="filters">
      <label>Farm
        <select id="fFilter"><option value="">All</option>${farms.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>
      </label>
      <label>From <input type="date" id="fromD"></label>
      <label>To <input type="date" id="toD"></label>
      <label>Type
        <select id="tFilter">
          <option value="">All</option>
          <option value="fertilizer">Fertilizers</option>
          <option value="pesticide">Pesticides</option>
          <option value="herbicide">Herbicides</option>
          <option value="crop">Crops</option>
        </select>
      </label>
      <label>Search <input id="q" placeholder="Product or Crop"/></label>
      <button class="btn" id="expPdf">Export PDF</button>
      <button class="btn" id="expXls">Export Excel</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Type</th><th>Name</th><th>Qty/Area</th><th>Date</th><th>Farm</th><th>Method/Variety</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody id="recTbody"></tbody>
      </table>
    </div>
  `;

  const tbody = $('#recTbody');
  const fFilter = $('#fFilter');
  const fromD = $('#fromD');
  const toD = $('#toD');
  const tFilter = $('#tFilter');
  const q = $('#q');

  function combined(){
    const out=[];
    applications.forEach(a=>out.push({
      id:a.id, type:a.type.toLowerCase(), name:a.productName, qty:`${a.quantity} ${a.unit}`, date:a.date, farmId:a.farmId,
      mv:a.method, notes:a.notes||'', src:'app'
    }));
    crops.forEach(c=>out.push({
      id:c.id, type:'crop', name:c.cropName, qty:c.area?`${c.area} acres`:'', date:c.plantationDate, farmId:c.farmId,
      mv:c.variety||'', notes:c.notes||'', src:'crop'
    }));
    return out;
  }
  function paint(){
    let rows = combined();
    if (fFilter.value) rows = rows.filter(r=>r.farmId===parseInt(fFilter.value,10));
    if (fromD.value) rows = rows.filter(r=>new Date(r.date)>=new Date(fromD.value));
    if (toD.value) rows = rows.filter(r=>new Date(r.date)<=new Date(toD.value));
    if (tFilter.value) rows = rows.filter(r=>r.type===tFilter.value);
    if (q.value.trim()) rows = rows.filter(r=>r.name.toLowerCase().includes(q.value.trim().toLowerCase()));
    rows.sort((a,b)=>new Date(b.date)-new Date(a.date));
    tbody.innerHTML = rows.map(r=>`
      <tr>
        <td>${r.type.toUpperCase()+r.type.slice(1)}</td><td>${r.name}</td><td>${r.qty||''}</td>
        <td>${formatDate(r.date)}</td><td>${getFarmNameById(r.farmId)
