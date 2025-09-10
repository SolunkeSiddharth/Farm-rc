console.log('Farm Records App loaded');

// Storage keys
const STORAGE_KEYS = {
  farms: 'farm_records_farms',
  applications: 'farm_records_applications', 
  crops: 'farm_records_crops',
  activities: 'farm_records_activities'
};

// In-memory data arrays
let farms = [];
let applications = [];
let crops = [];
let activities = [];

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Load data from localStorage
function loadFromStorage() {
  try {
    farms = JSON.parse(localStorage.getItem(STORAGE_KEYS.farms)) || [];
    applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.applications)) || [];
    crops = JSON.parse(localStorage.getItem(STORAGE_KEYS.crops)) || [];
    activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
  } catch (error) {
    console.error('Error loading from storage:', error);
    // Initialize with empty arrays if there's an error
    farms = [];
    applications = [];
    crops = [];
    activities = [];
  }
}

// Save data to localStorage
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.farms, JSON.stringify(farms));
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.crops, JSON.stringify(crops));
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving to storage:', error);
    showToast('Error saving data', 'error');
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Get farm name by ID
function getFarmName(farmId) {
  const farm = farms.find(f => f.id === farmId);
  return farm ? farm.name : 'Unknown Farm';
}

// Add activity log
function addActivity(message) {
  activities.unshift({
    id: generateId(),
    message: message,
    date: new Date().toISOString(),
    timestamp: Date.now()
  });
  
  // Keep only last 50 activities
  if (activities.length > 50) {
    activities = activities.slice(0, 50);
  }
  
  saveToStorage();
  updateDashboard();
}

// Navigation functionality
function initializeNavigation() {
  const navItems = $$('.nav-item');
  const sections = $$('.section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Show target section
      sections.forEach(section => section.classList.remove('active'));
      const target = $(`#${targetSection}`);
      if (target) {
        target.classList.add('active');
        
        // Load section data
        switch (targetSection) {
          case 'dashboard':
            updateDashboard();
            break;
          case 'farms':
            loadFarmsTable();
            break;
          case 'applications':
            loadApplicationsTable();
            populateFarmSelects();
            break;
          case 'crops':
            loadCropsTable();
            populateFarmSelects();
            break;
          case 'records':
            loadRecordsTable();
            populateFilterSelects();
            break;
          case 'historical':
            loadHistoricalData();
            break;
        }
      }
    });
  });
}

// Switch section programmatically
function switchSection(sectionName) {
  const navItem = $(`.nav-item[data-section="${sectionName}"]`);
  if (navItem) {
    navItem.click();
  }
}

// Update dashboard statistics
function updateDashboard() {
  // Update stats
  $('#totalFarms').textContent = farms.length;
  $('#recentApplications').textContent = applications.filter(app => {
    const appDate = new Date(app.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return appDate >= thirtyDaysAgo;
  }).length;
  
  $('#recentCrops').textContent = crops.filter(crop => {
    const plantDate = new Date(crop.plantationDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return plantDate >= thirtyDaysAgo;
  }).length;
  
  $('#totalRecords').textContent = applications.length + crops.length;
  
  // Update current date
  $('#currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Update activities list
  const activityList = $('#activityList');
  if (activityList) {
    if (activities.length === 0) {
      activityList.innerHTML = '<p>No recent activities</p>';
    } else {
      activityList.innerHTML = activities.slice(0, 5).map(activity => 
        `<div class="activity-item">
          <div class="activity-date">${formatDate(activity.date)}</div>
          <div class="activity-text">${activity.message}</div>
        </div>`
      ).join('');
    }
  }
}

// Farm management functions
function showAddFarmForm() {
  $('#farmForm').style.display = 'block';
}

function hideFarmForm() {
  $('#farmForm').style.display = 'none';
  $('#addFarmForm').reset();
}

function setupFarmForm() {
  const form = $('#addFarmForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const farmName = $('#farmName').value.trim();
      const farmId = $('#farmId').value.trim();
      const location = $('#farmLocation').value.trim();
      const size = parseFloat($('#farmSize').value) || 0;
      
      if (!farmName || !farmId) {
        showToast('Farm name and ID are required', 'error');
        return;
      }
      
      // Check if farm ID already exists
      if (farms.some(f => f.farmId.toLowerCase() === farmId.toLowerCase())) {
        showToast('Farm ID already exists', 'error');
        return;
      }
      
      const newFarm = {
        id: generateId(),
        name: farmName,
        farmId: farmId,
        location: location,
        size: size,
        dateAdded: new Date().toISOString()
      };
      
      farms.push(newFarm);
      saveToStorage();
      addActivity(`Added new farm: ${farmName}`);
      
      loadFarmsTable();
      hideFarmForm();
      showToast('Farm added successfully', 'success');
    });
  }
}

function loadFarmsTable() {
  const tbody = $('#farmsTableBody');
  if (!tbody) return;
  
  if (farms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No farms added yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = farms.map(farm => `
    <tr>
      <td>${farm.name}</td>
      <td>${farm.farmId}</td>
      <td>${farm.location || '-'}</td>
      <td>${farm.size || '-'}</td>
      <td>${formatDate(farm.dateAdded)}</td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="editFarm('${farm.id}')">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteFarm('${farm.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function editFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;
  
  const newName = prompt('Enter farm name:', farm.name);
  if (newName && newName.trim()) {
    farm.name = newName.trim();
    saveToStorage();
    loadFarmsTable();
    addActivity(`Updated farm: ${farm.name}`);
    showToast('Farm updated successfully', 'success');
  }
}

function deleteFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;
  
  if (confirm(`Are you sure you want to delete "${farm.name}"? This will also delete all related records.`)) {
    // Remove related applications and crops
    applications = applications.filter(app => app.farmId !== farmId);
    crops = crops.filter(crop => crop.farmId !== farmId);
    farms = farms.filter(f => f.id !== farmId);
    
    saveToStorage();
    loadFarmsTable();
    addActivity(`Deleted farm: ${farm.name}`);
    showToast('Farm deleted successfully', 'success');
  }
}
// Application management functions
function setupApplicationForm() {
  const form = $('#addApplicationForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const productType = $('#productType').value;
      const productName = $('#productName').value.trim();
      const quantity = parseFloat($('#quantity').value);
      const unit = $('#unit').value;
      const applicationDate = $('#applicationDate').value;
      const farmId = $('#applicationFarm').value;
      const method = $('#applicationMethod').value;
      const notes = $('#applicationNotes').value.trim();
      
      if (!productType || !productName || !quantity || !applicationDate || !farmId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      const newApplication = {
        id: generateId(),
        type: productType,
        productName: productName,
        quantity: quantity,
        unit: unit,
        date: applicationDate,
        farmId: farmId,
        method: method,
        notes: notes,
        createdAt: new Date().toISOString()
      };
      
      applications.push(newApplication);
      saveToStorage();
      addActivity(`Recorded ${productType.toLowerCase()}: ${productName} at ${getFarmName(farmId)}`);
      
      loadApplicationsTable();
      form.reset();
      showToast('Application recorded successfully', 'success');
    });
  }
}

function loadApplicationsTable() {
  const tbody = $('#applicationsTableBody');
  if (!tbody) return;
  
  if (applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No applications recorded yet</td></tr>';
    return;
  }
  
  const sortedApplications = [...applications].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  tbody.innerHTML = sortedApplications.map(app => `
    <tr>
      <td>${formatDate(app.date)}</td>
      <td>${app.type}</td>
      <td>${app.productName}</td>
      <td>${app.quantity} ${app.unit}</td>
      <td>${getFarmName(app.farmId)}</td>
      <td>${app.method}</td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="editApplication('${app.id}')">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteApplication('${app.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function editApplication(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;
  
  const newProductName = prompt('Enter product name:', app.productName);
  if (newProductName && newProductName.trim()) {
    app.productName = newProductName.trim();
    saveToStorage();
    loadApplicationsTable();
    addActivity(`Updated application: ${app.productName}`);
    showToast('Application updated successfully', 'success');
  }
}

function deleteApplication(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;
  
  if (confirm(`Are you sure you want to delete this application record?`)) {
    applications = applications.filter(a => a.id !== appId);
    saveToStorage();
    loadApplicationsTable();
    addActivity(`Deleted application: ${app.productName}`);
    showToast('Application deleted successfully', 'success');
  }
}

// Crop management functions
function setupCropForm() {
  const form = $('#addCropForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const cropName = $('#cropName').value.trim();
      const variety = $('#cropVariety').value.trim();
      const plantationDate = $('#plantationDate').value;
      const harvestDate = $('#harvestDate').value;
      const farmId = $('#cropFarm').value;
      const area = parseFloat($('#cropArea').value) || 0;
      const notes = $('#cropNotes').value.trim();
      
      if (!cropName || !plantationDate || !farmId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      
      const newCrop = {
        id: generateId(),
        name: cropName,
        variety: variety,
        plantationDate: plantationDate,
        harvestDate: harvestDate,
        farmId: farmId,
        area: area,
        notes: notes,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      crops.push(newCrop);
      saveToStorage();
      addActivity(`Added crop: ${cropName} at ${getFarmName(farmId)}`);
      
      loadCropsTable();
      form.reset();
      showToast('Crop added successfully', 'success');
    });
  }
}

function loadCropsTable() {
  const tbody = $('#cropsTableBody');
  if (!tbody) return;
  
  if (crops.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No crops added yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = crops.map(crop => `
    <tr>
      <td>${crop.name}</td>
      <td>${crop.variety || '-'}</td>
      <td>${formatDate(crop.plantationDate)}</td>
      <td>${formatDate(crop.harvestDate) || '-'}</td>
      <td>${getFarmName(crop.farmId)}</td>
      <td>${crop.area || '-'}</td>
      <td><span class="status status--success">${crop.status}</span></td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="editCrop('${crop.id}')">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteCrop('${crop.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function editCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;
  
  const newName = prompt('Enter crop name:', crop.name);
  if (newName && newName.trim()) {
    crop.name = newName.trim();
    saveToStorage();
    loadCropsTable();
    addActivity(`Updated crop: ${crop.name}`);
    showToast('Crop updated successfully', 'success');
  }
}

function deleteCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;
  
  if (confirm(`Are you sure you want to delete this crop record?`)) {
    crops = crops.filter(c => c.id !== cropId);
    saveToStorage();
    loadCropsTable();
    addActivity(`Deleted crop: ${crop.name}`);
    showToast('Crop deleted successfully', 'success');
  }
}

// Populate farm select dropdowns
function populateFarmSelects() {
  const selects = ['#applicationFarm', '#cropFarm', '#filterFarm'];
  
  selects.forEach(selector => {
    const select = $(selector);
    if (select) {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select Farm</option>' + 
        farms.map(farm => `<option value="${farm.id}">${farm.name}</option>`).join('');
      select.value = currentValue;
    }
  });
}

// Records and filtering
function loadRecordsTable() {
  const tbody = $('#recordsTableBody');
  if (!tbody) return;
  
  let allRecords = [
    ...applications.map(app => ({
      ...app,
      type: 'Application',
      name: app.productName,
      details: `${app.quantity} ${app.unit} - ${app.method}`
    })),
    ...crops.map(crop => ({
      ...crop,
      type: 'Crop',
      name: crop.name,
      date: crop.plantationDate,
      details: `${crop.area || 0} acres${crop.variety ? ` - ${crop.variety}` : ''}`
    }))
  ];
  
  if (allRecords.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No records found</td></tr>';
    return;
  }
  
  allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  tbody.innerHTML = allRecords.map(record => `
    <tr>
      <td>${formatDate(record.date)}</td>
      <td>${record.type}</td>
      <td>${record.name}</td>
      <td>${record.details}</td>
      <td>${getFarmName(record.farmId)}</td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="viewRecord('${record.id}', '${record.type}')">View</button>
      </td>
    </tr>
  `).join('');
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Initialize app
function initializeApp() {
  loadFromStorage();
  initializeNavigation();
  setupFarmForm();
  setupApplicationForm();
  setupCropForm();
  updateDashboard();
  
  // Set default date for forms
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['#applicationDate', '#plantationDate'];
  dateInputs.forEach(selector => {
    const input = $(selector);
    if (input) input.value = today;
  });
}

// Placeholder functions for features to be implemented
function populateFilterSelects() { populateFarmSelects(); }
function applyFilters() { loadRecordsTable(); }
function clearFilters() { loadRecordsTable(); }
function exportRecords(format) { showToast(`Export to ${format} feature coming soon!`); }
function loadHistoricalData() { showToast('Historical data loading...'); }
function viewRecord(id, type) { showToast(`View ${type} record feature coming soon!`); }
function closeEditModal() { $('#editModal').classList.add('hidden'); }
function sortRecords(field) { showToast(`Sort by ${field} feature coming soon!`); }

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('Farm Records App initialized');
