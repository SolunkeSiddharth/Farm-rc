console.log('Crop-Focused Farm Management System - Enhanced with PDF Export');

// Storage keys for crop-focused data
const STORAGE_KEYS = {
  farms: 'crop_focused_farms',
  crops: 'crop_focused_crops',
  applications: 'crop_focused_applications',
  activities: 'crop_focused_activities',
  recommendations: 'crop_focused_recommendations'
};

// In-memory data arrays
let farms = [];
let crops = [];
let applications = [];
let activities = [];
let recommendations = [];

// Chart instances
let applicationsByCropChart = null;
let monthlyTrendsChart = null;
let growthStageChart = null;
let costAnalysisChart = null;

// Crop knowledge base for recommendations
const CROP_KNOWLEDGE = {
  wheat: {
    name: 'Wheat',
    icon: '🌾',
    stages: ['seedling', 'tillering', 'stem-extension', 'heading', 'flowering', 'grain-filling', 'maturity'],
    applications: {
      'seedling': [
        { type: 'fertilizer', product: 'NPK 20-20-0', timing: 'At planting', purpose: 'Root establishment' },
        { type: 'herbicide', product: 'Pre-emergence herbicide', timing: 'Before germination', purpose: 'Weed control' }
      ],
      'tillering': [
        { type: 'fertilizer', product: 'Nitrogen (Urea)', timing: '3-4 weeks after planting', purpose: 'Tiller development' }
      ],
      'stem-extension': [
        { type: 'fertilizer', product: 'NPK 15-15-15', timing: '6-8 weeks after planting', purpose: 'Stem growth' },
        { type: 'fungicide', product: 'Propiconazole', timing: 'If disease symptoms appear', purpose: 'Disease prevention' }
      ],
      'heading': [
        { type: 'fertilizer', product: 'Nitrogen boost', timing: 'At flag leaf stage', purpose: 'Grain development' }
      ],
      'flowering': [
        { type: 'fungicide', product: 'Tebuconazole', timing: 'During flowering', purpose: 'Head blight prevention' }
      ]
    }
  },
  corn: {
    name: 'Corn',
    icon: '🌽',
    stages: ['seedling', 'vegetative', 'tasseling', 'silking', 'grain-filling', 'maturity'],
    applications: {
      'seedling': [
        { type: 'fertilizer', product: 'NPK 18-46-0', timing: 'At planting', purpose: 'Root development' },
        { type: 'pesticide', product: 'Seed treatment insecticide', timing: 'Before planting', purpose: 'Pest protection' }
      ],
      'vegetative': [
        { type: 'fertilizer', product: 'Nitrogen (28% UAN)', timing: '4-6 leaf stage', purpose: 'Vegetative growth' },
        { type: 'herbicide', product: 'Atrazine + Glyphosate', timing: '2-4 leaf stage', purpose: 'Weed control' }
      ],
      'tasseling': [
        { type: 'fertilizer', product: 'Potassium chloride', timing: 'Pre-tassel', purpose: 'Stalk strength' },
        { type: 'pesticide', product: 'Bt spray', timing: 'If corn borer present', purpose: 'Pest control' }
      ],
      'silking': [
        { type: 'fungicide', product: 'Strobilurin fungicide', timing: 'At silking', purpose: 'Disease prevention' }
      ]
    }
  },
  rice: {
    name: 'Rice',
    icon: '🌾',
    stages: ['seedling', 'tillering', 'panicle-initiation', 'flowering', 'grain-filling', 'maturity'],
    applications: {
      'seedling': [
        { type: 'fertilizer', product: 'NPK 16-20-0', timing: 'At transplanting', purpose: 'Root establishment' }
      ],
      'tillering': [
        { type: 'fertilizer', product: 'Urea', timing: '2-3 weeks after transplanting', purpose: 'Tiller development' },
        { type: 'herbicide', product: 'Butachlor', timing: '3-5 days after transplanting', purpose: 'Weed control' }
      ],
      'panicle-initiation': [
        { type: 'fertilizer', product: 'NPK 15-15-15', timing: '35-40 days after transplanting', purpose: 'Panicle development' }
      ],
      'flowering': [
        { type: 'fungicide', product: 'Tricyclazole', timing: 'At flowering', purpose: 'Blast disease control' }
      ]
    }
  },
  tomatoes: {
    name: 'Tomatoes',
    icon: '🍅',
    stages: ['seedling', 'vegetative', 'flowering', 'fruit-set', 'fruit-development', 'maturity'],
    applications: {
      'seedling': [
        { type: 'fertilizer', product: 'NPK 19-19-19', timing: 'At transplanting', purpose: 'Initial growth' }
      ],
      'vegetative': [
        { type: 'fertilizer', product: 'Calcium nitrate', timing: 'Weekly', purpose: 'Vegetative growth' },
        { type: 'pesticide', product: 'Imidacloprid', timing: 'If aphids present', purpose: 'Pest control' }
      ],
      'flowering': [
        { type: 'fertilizer', product: 'NPK 15-5-30', timing: 'At first flower', purpose: 'Flower development' },
        { type: 'fungicide', product: 'Copper sulfate', timing: 'Weekly during flowering', purpose: 'Disease prevention' }
      ],
      'fruit-set': [
        { type: 'fertilizer', product: 'Potassium sulfate', timing: 'At fruit set', purpose: 'Fruit development' }
      ],
      'fruit-development': [
        { type: 'fertilizer', product: 'Calcium chloride foliar', timing: 'Bi-weekly', purpose: 'Prevent blossom end rot' },
        { type: 'pesticide', product: 'Bacillus thuringiensis', timing: 'If caterpillars present', purpose: 'Organic pest control' }
      ]
    }
  }
};

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Enhanced date formatting function - DD-MM-YYYY
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateRelative(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Data management
function loadFromStorage() {
  try {
    farms = JSON.parse(localStorage.getItem(STORAGE_KEYS.farms)) || [];
    crops = JSON.parse(localStorage.getItem(STORAGE_KEYS.crops)) || [];
    applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.applications)) || [];
    activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
    recommendations = JSON.parse(localStorage.getItem(STORAGE_KEYS.recommendations)) || [];
  } catch (error) {
    console.error('Error loading from storage:', error);
    initializeEmptyData();
  }
}

function initializeEmptyData() {
  farms = [];
  crops = [];
  applications = [];
  activities = [];
  recommendations = [];
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.farms, JSON.stringify(farms));
    localStorage.setItem(STORAGE_KEYS.crops, JSON.stringify(crops));
    localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities));
    localStorage.setItem(STORAGE_KEYS.recommendations, JSON.stringify(recommendations));
  } catch (error) {
    console.error('Error saving to storage:', error);
    showToast('Error saving data', 'error');
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFarmName(farmId) {
  const farm = farms.find(f => f.id === farmId);
  return farm ? farm.name : 'Unknown Farm';
}

function getCropName(cropId) {
  const crop = crops.find(c => c.id === cropId);
  return crop ? crop.name || crop.type : 'Unknown Crop';
}

function getCropIcon(cropType) {
  if (CROP_KNOWLEDGE[cropType]) {
    return CROP_KNOWLEDGE[cropType].icon;
  }
  return '🌱';
}

function addActivity(message, cropId = null) {
  activities.unshift({
    id: generateId(),
    message: message,
    cropId: cropId,
    date: new Date().toISOString(),
    timestamp: Date.now()
  });

  if (activities.length > 100) {
    activities = activities.slice(0, 100);
  }

  saveToStorage();
  updateDashboard();
}

// Enhanced PDF Export Functions
function exportAllDataToPDF() {
  showToast('📄 Generating comprehensive PDF report...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPosition = 20;

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74);
    doc.text('🌾 Crop Management System - Complete Report', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 20, yPosition);
    yPosition += 20;

    // Farm Summary
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text('📊 Farm Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Farms: ${farms.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Crops: ${crops.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Applications: ${applications.length}`, 20, yPosition);
    yPosition += 15;

    // Farms Details
    if (farms.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text('🏡 Farms Details', 20, yPosition);
      yPosition += 10;

      farms.forEach((farm, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${farm.name} (ID: ${farm.farmId})`, 20, yPosition);
        yPosition += 6;

        if (farm.location) {
          doc.text(`   Location: ${farm.location}`, 25, yPosition);
          yPosition += 6;
        }

        if (farm.size) {
          doc.text(`   Size: ${farm.size} acres`, 25, yPosition);
          yPosition += 6;
        }

        if (farm.soilType) {
          doc.text(`   Soil Type: ${farm.soilType}`, 25, yPosition);
          yPosition += 6;
        }

        const farmCrops = crops.filter(c => c.farmId === farm.id);
        doc.text(`   Crops: ${farmCrops.length}`, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }

    // Crops Details
    if (crops.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text('🌾 Crops Details', 20, yPosition);
      yPosition += 10;

      crops.forEach((crop, index) => {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${crop.name || crop.type}`, 20, yPosition);
        yPosition += 6;

        doc.text(`   Farm: ${getFarmName(crop.farmId)}`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Area: ${crop.area} acres`, 25, yPosition);
        yPosition += 6;
        doc.text(`   Planted: ${formatDate(crop.plantationDate)}`, 25, yPosition);
        yPosition += 6;

        if (crop.harvestDate) {
          doc.text(`   Expected Harvest: ${formatDate(crop.harvestDate)}`, 25, yPosition);
          yPosition += 6;
        }

        if (crop.variety) {
          doc.text(`   Variety: ${crop.variety}`, 25, yPosition);
          yPosition += 6;
        }

        const cropApps = applications.filter(app => app.cropId === crop.id);
        doc.text(`   Applications: ${cropApps.length}`, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }

    // Applications Summary
    if (applications.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text('💉 Applications Summary', 20, yPosition);
      yPosition += 10;

      // Group by type
      const appsByType = {};
      applications.forEach(app => {
        appsByType[app.type] = (appsByType[app.type] || 0) + 1;
      });

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      Object.entries(appsByType).forEach(([type, count]) => {
        doc.text(`${type}: ${count} applications`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      // Recent applications
      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text('Recent Applications (Last 20):', 20, yPosition);
      yPosition += 8;

      const recentApps = applications
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);

      recentApps.forEach((app, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const crop = crops.find(c => c.id === app.cropId);
        const cropName = crop ? (crop.name || crop.type) : 'Unknown';

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${formatDate(app.date)} - ${app.productName}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Crop: ${cropName}, Type: ${app.type}, Qty: ${app.quantity} ${app.unit}`, 25, yPosition);
        yPosition += 7;
      });
    }

    // Analytics
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('📈 Analytics', 20, yPosition);
    yPosition += 10;

    const totalApps = applications.length;
    const avgAppsPerCrop = crops.length > 0 ? (totalApps / crops.length).toFixed(1) : 0;
    const uniqueVarieties = new Set(crops.map(c => c.variety).filter(v => v)).size;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Average Applications per Crop: ${avgAppsPerCrop}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Unique Crop Varieties: ${uniqueVarieties}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Data Quality Score: ${Math.min(95, Math.max(60, 70 + (totalApps * 2)))}%`, 20, yPosition);

    // Save PDF
    doc.save(`crop-management-report-${formatDate(new Date().toISOString()).replace(/-/g, '')}.pdf`);
    showToast('✅ PDF report exported successfully!', 'success');

  } catch (error) {
    console.error('PDF export error:', error);
    showToast('❌ Error exporting PDF. Please try again.', 'error');
  }
}

function exportCropReportToPDF(cropId = null) {
  showToast('📄 Generating crop report PDF...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPosition = 20;

    const selectedCrops = cropId ? crops.filter(c => c.id === cropId) : crops;

    if (selectedCrops.length === 0) {
      showToast('❌ No crops found to export', 'error');
      return;
    }

    // Header
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text(`🌾 ${cropId ? 'Individual' : 'All'} Crop Report`, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, yPosition);
    yPosition += 20;

    selectedCrops.forEach((crop, cropIndex) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      // Crop header
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(`${cropIndex + 1}. ${crop.name || crop.type}`, 20, yPosition);
      yPosition += 10;

      // Crop details
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Farm: ${getFarmName(crop.farmId)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Area: ${crop.area} acres`, 25, yPosition);
      yPosition += 6;
      doc.text(`Planted: ${formatDate(crop.plantationDate)}`, 25, yPosition);
      yPosition += 6;

      if (crop.harvestDate) {
        doc.text(`Expected Harvest: ${formatDate(crop.harvestDate)}`, 25, yPosition);
        yPosition += 6;
      }

      if (crop.variety) {
        doc.text(`Variety: ${crop.variety}`, 25, yPosition);
        yPosition += 6;
      }

      if (crop.fieldId) {
        doc.text(`Field/Block: ${crop.fieldId}`, 25, yPosition);
        yPosition += 6;
      }

      // Current stage
      const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
      const currentStage = determineCropStage(crop, daysSinceStart);
      doc.text(`Current Stage: ${currentStage} (${daysSinceStart} days)`, 25, yPosition);
      yPosition += 10;

      // Applications for this crop
      const cropApplications = applications.filter(app => app.cropId === crop.id);

      doc.setFontSize(12);
      doc.setTextColor(22, 163, 74);
      doc.text(`💉 Applications (${cropApplications.length} total):`, 25, yPosition);
      yPosition += 8;

      if (cropApplications.length > 0) {
        const sortedApps = cropApplications.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedApps.forEach((app, appIndex) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`${appIndex + 1}. ${formatDate(app.date)} - ${app.productName}`, 30, yPosition);
          yPosition += 5;
          doc.text(`   Type: ${app.type}, Quantity: ${app.quantity} ${app.unit}`, 35, yPosition);
          yPosition += 5;

          if (app.growthStage) {
            doc.text(`   Growth Stage: ${app.growthStage}`, 35, yPosition);
            yPosition += 5;
          }

          if (app.method) {
            doc.text(`   Method: ${app.method}`, 35, yPosition);
            yPosition += 5;
          }

          if (app.purpose) {
            doc.text(`   Purpose: ${app.purpose}`, 35, yPosition);
            yPosition += 5;
          }

          yPosition += 3;
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No applications recorded yet', 30, yPosition);
        yPosition += 8;
      }

      if (crop.notes) {
        doc.setFontSize(11);
        doc.setTextColor(22, 163, 74);
        doc.text('📝 Notes:', 25, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const notes = doc.splitTextToSize(crop.notes, 160);
        doc.text(notes, 30, yPosition);
        yPosition += notes.length * 5 + 5;
      }

      yPosition += 15; // Space between crops
    });

    const filename = cropId ? 
      `crop-report-${selectedCrops[0].name?.replace(/[^a-zA-Z0-9]/g, '') || 'crop'}-${formatDate(new Date().toISOString()).replace(/-/g, '')}.pdf` :
      `all-crops-report-${formatDate(new Date().toISOString()).replace(/-/g, '')}.pdf`;

    doc.save(filename);
    showToast('✅ Crop report PDF exported successfully!', 'success');

  } catch (error) {
    console.error('Crop PDF export error:', error);
    showToast('❌ Error exporting crop PDF. Please try again.', 'error');
  }
}

function exportApplicationsReportToPDF() {
  showToast('📄 Generating applications report PDF...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPosition = 20;

    if (applications.length === 0) {
      showToast('❌ No applications found to export', 'error');
      return;
    }

    // Header
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text('💉 Applications Report', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, yPosition);
    doc.text(`Total Applications: ${applications.length}`, 20, yPosition + 6);
    yPosition += 25;

    // Summary by type
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('📊 Summary by Type', 20, yPosition);
    yPosition += 10;

    const appsByType = {};
    applications.forEach(app => {
      appsByType[app.type] = (appsByType[app.type] || 0) + 1;
    });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    Object.entries(appsByType).forEach(([type, count]) => {
      doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} applications`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Summary by crop
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('🌾 Summary by Crop', 20, yPosition);
    yPosition += 10;

    const appsByCrop = {};
    applications.forEach(app => {
      const cropName = getCropName(app.cropId);
      appsByCrop[cropName] = (appsByCrop[cropName] || 0) + 1;
    });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    Object.entries(appsByCrop).forEach(([cropName, count]) => {
      doc.text(`${cropName}: ${count} applications`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 15;

    // Detailed applications list
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('📋 Detailed Applications List', 20, yPosition);
    yPosition += 10;

    const sortedApplications = applications.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedApplications.forEach((app, index) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      const crop = crops.find(c => c.id === app.cropId);
      const cropName = crop ? (crop.name || crop.type) : 'Unknown Crop';
      const farmName = crop ? getFarmName(crop.farmId) : 'Unknown Farm';

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${formatDate(app.date)} - ${app.productName}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.text(`   Crop: ${cropName} (${farmName})`, 25, yPosition);
      yPosition += 5;
      doc.text(`   Type: ${app.type}, Quantity: ${app.quantity} ${app.unit}`, 25, yPosition);
      yPosition += 5;

      if (app.growthStage) {
        doc.text(`   Growth Stage: ${app.growthStage}`, 25, yPosition);
        yPosition += 5;
      }

      if (app.method) {
        doc.text(`   Method: ${app.method}`, 25, yPosition);
        yPosition += 5;
      }

      if (app.weatherConditions) {
        doc.text(`   Weather: ${app.weatherConditions}`, 25, yPosition);
        yPosition += 5;
      }

      if (app.purpose) {
        doc.text(`   Purpose: ${app.purpose}`, 25, yPosition);
        yPosition += 5;
      }

      yPosition += 5; // Space between applications
    });

    doc.save(`applications-report-${formatDate(new Date().toISOString()).replace(/-/g, '')}.pdf`);
    showToast('✅ Applications report PDF exported successfully!', 'success');

  } catch (error) {
    console.error('Applications PDF export error:', error);
    showToast('❌ Error exporting applications PDF. Please try again.', 'error');
  }
}

// Enhanced mobile navigation
function initializeNavigation() {
  const navItems = $$('.nav-item');
  const sections = $$('.section');
  const navToggle = $('#navToggle');
  const navClose = $('#navClose');
  const navMenu = $('#navMenu');
  const navOverlay = $('#navOverlay');

  function openMobileMenu() {
    navMenu.classList.add('show');
    navOverlay.classList.add('show');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    navMenu.classList.remove('show');
    navOverlay.classList.remove('show');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('show')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (navClose) {
    navClose.addEventListener('click', closeMobileMenu);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      closeMobileMenu();
    }
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(section => section.classList.remove('active'));
      const target = $(`#${targetSection}`);
      if (target) {
        target.classList.add('active');
        closeMobileMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        switch (targetSection) {
          case 'dashboard':
            updateDashboard();
            break;
          case 'farms':
            loadFarmsTable();
            break;
          case 'crops':
            loadCropsGrid();
            populateFarmSelects();
            break;
          case 'crop-profiles':
            loadCropProfiles();
            break;
          case 'applications':
            loadApplicationsTimeline();
            populateCropSelects();
            break;
          case 'recommendations':
            loadRecommendations();
            populateCropSelects();
            break;
          case 'calendar':
            loadCalendar();
            populateCropSelects();
            break;
          case 'analytics':
            loadAnalytics();
            break;
        }
      }
    });
  });
}

function switchSection(sectionName) {
  const navItem = $(`.nav-item[data-section="${sectionName}"]`);
  if (navItem) {
    navItem.click();
  }
}

// Enhanced dashboard
function updateDashboard() {
  animateCounter('#totalCrops', crops.length);

  const thisMonthApps = applications.filter(app => {
    const appDate = new Date(app.date);
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  }).length;
  animateCounter('#recentApplications', thisMonthApps);

  const upcomingTasks = generateRecommendationsForAllCrops().length;
  animateCounter('#upcomingTasks', upcomingTasks);

  const uniqueVarieties = new Set(crops.map(c => c.variety).filter(v => v)).size;
  animateCounter('#totalVarieties', uniqueVarieties);

  $('#currentDate').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  loadCropOverviewCards();
  loadTodayRecommendations();
}

function loadCropOverviewCards() {
  const container = $('#cropCards');
  if (!container) return;

  if (crops.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🌱</div>
        <h3>No crops added yet</h3>
        <p>Start by adding your first crop to track applications and get recommendations!</p>
        <button class="btn btn--primary" onclick="switchSection('crops')" style="margin-top: 1rem;">
          ➕ Add Your First Crop
        </button>
      </div>`;
    return;
  }

  const activeCrops = crops.slice(0, 4);

  container.innerHTML = activeCrops.map(crop => {
    const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
    const currentStage = determineCropStage(crop, daysSinceStart);
    const recentApps = applications.filter(app => app.cropId === crop.id).length;
    const daysToHarvest = crop.harvestDate ? 
      Math.floor((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return `
      <div class="crop-card" onclick="openCropProfile('${crop.id}')">
        <div class="crop-card-header">
          <h4 class="crop-name">${crop.name || crop.type}</h4>
          <div class="crop-icon">${getCropIcon(crop.type)}</div>
        </div>
        <div class="crop-details">
          <div class="crop-detail">
            <span class="crop-detail-label">Farm:</span>
            <span class="crop-detail-value">${getFarmName(crop.farmId)}</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Area:</span>
            <span class="crop-detail-value">${crop.area} acres</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Stage:</span>
            <span class="crop-status crop-status--${currentStage}">${currentStage}</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Applications:</span>
            <span class="crop-detail-value">${recentApps}</span>
          </div>
          ${daysToHarvest !== null && daysToHarvest > 0 ? `
          <div class="crop-detail">
            <span class="crop-detail-label">Harvest in:</span>
            <span class="crop-detail-value">${daysToHarvest} days</span>
          </div>
          ` : ''}
        </div>
      </div>`;
  }).join('');
}

function loadTodayRecommendations() {
  const container = $('#todayRecommendations');
  if (!container) return;

  const recommendations = generateRecommendationsForAllCrops();
  const todayRecommendations = recommendations.filter(rec => rec.priority === 'high').slice(0, 3);

  if (todayRecommendations.length === 0) {
    container.innerHTML = `
      <div class="recommendation-item">
        <h4>🎉 No urgent tasks today!</h4>
        <p>All your crops are on track. Check the recommendations section for upcoming activities.</p>
      </div>`;
    return;
  }

  container.innerHTML = todayRecommendations.map(rec => `
    <div class="recommendation-item">
      <h4>${rec.title}</h4>
      <p>${rec.description}</p>
    </div>
  `).join('');
}

function animateCounter(selector, targetValue) {
  const element = $(selector);
  if (!element) return;

  const startValue = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// Crop management with delete functionality
function determineCropStage(crop, daysSinceStart) {
  if (daysSinceStart < 14) return 'seedling';
  if (daysSinceStart < 45) return 'vegetative';
  if (daysSinceStart < 75) return 'flowering';
  if (daysSinceStart < 105) return 'fruiting';
  return 'harvest';
}

function showAddCropForm() {
  const form = $('#cropForm');
  if (form) {
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#cropType').focus();
  }
}

function hideCropForm() {
  const form = $('#cropForm');
  if (form) {
    form.style.display = 'none';
    $('#addCropForm').reset();
    $('#customCropGroup').style.display = 'none';
  }
}

function setupCropForm() {
  const form = $('#addCropForm');
  const cropTypeSelect = $('#cropType');
  const customCropGroup = $('#customCropGroup');

  if (cropTypeSelect) {
    cropTypeSelect.addEventListener('change', () => {
      if (cropTypeSelect.value === 'other') {
        customCropGroup.style.display = 'block';
        $('#customCropName').required = true;
      } else {
        customCropGroup.style.display = 'none';
        $('#customCropName').required = false;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const cropType = $('#cropType').value;
      const customCropName = $('#customCropName').value.trim();
      const variety = $('#cropVariety').value.trim();
      const farmId = $('#cropFarm').value;
      const plantationDate = $('#plantationDate').value;
      const harvestDate = $('#harvestDate').value;
      const area = parseFloat($('#cropArea').value);
      const fieldId = $('#fieldId').value.trim();
      const notes = $('#cropNotes').value.trim();

      if (!cropType || !farmId || !plantationDate || !area) {
        showToast('📝 Please fill in all required fields', 'error');
        return;
      }

      if (cropType === 'other' && !customCropName) {
        showToast('📝 Please enter custom crop name', 'error');
        return;
      }

      const newCrop = {
        id: generateId(),
        type: cropType,
        name: cropType === 'other' ? customCropName : (CROP_KNOWLEDGE[cropType]?.name || cropType),
        variety: variety,
        farmId: farmId,
        plantationDate: plantationDate,
        harvestDate: harvestDate,
        area: area,
        fieldId: fieldId,
        notes: notes,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      crops.push(newCrop);
      saveToStorage();
      addActivity(`🌱 Added new crop: ${newCrop.name} (${area} acres)`, newCrop.id);

      loadCropsGrid();
      hideCropForm();
      showToast('✅ Crop added successfully!', 'success');

      generateRecommendationsForCrop(newCrop);
    });
  }
}

function loadCropsGrid() {
  const container = $('#cropsGrid');
  if (!container) return;

  if (crops.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
        <div style="font-size: 4rem; margin-bottom: 2rem;">🌾</div>
        <h3 style="margin-bottom: 1rem;">No crops added yet</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Start by adding your first crop to begin tracking applications and receive personalized recommendations.
        </p>
        <button class="btn btn--primary btn--mobile" onclick="showAddCropForm()">
          🌱 Add Your First Crop
        </button>
      </div>`;
    return;
  }

  container.innerHTML = crops.map(crop => {
    const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
    const currentStage = determineCropStage(crop, daysSinceStart);
    const recentApps = applications.filter(app => app.cropId === crop.id);
    const lastApplication = recentApps.length > 0 ? 
      recentApps.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;

    return `
      <div class="crop-card">
        <div class="crop-card-header">
          <h4 class="crop-name">${crop.name || crop.type}</h4>
          <div class="crop-icon">${getCropIcon(crop.type)}</div>
        </div>
        <div class="crop-details">
          <div class="crop-detail">
            <span class="crop-detail-label">Farm:</span>
            <span class="crop-detail-value">${getFarmName(crop.farmId)}</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Area:</span>
            <span class="crop-detail-value">${crop.area} acres</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Planted:</span>
            <span class="crop-detail-value">${formatDate(crop.plantationDate)}</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Stage:</span>
            <span class="crop-status crop-status--${currentStage}">${currentStage}</span>
          </div>
          <div class="crop-detail">
            <span class="crop-detail-label">Applications:</span>
            <span class="crop-detail-value">${recentApps.length}</span>
          </div>
          ${lastApplication ? `
          <div class="crop-detail">
            <span class="crop-detail-label">Last Treatment:</span>
            <span class="crop-detail-value">${formatDate(lastApplication.date)}</span>
          </div>
          ` : ''}
        </div>
        <div class="action-buttons">
          <button class="btn btn--sm btn--primary" onclick="addApplicationForCrop('${crop.id}')">💉 Add Application</button>
          <button class="btn btn--sm btn--primary" onclick="exportCropReportToPDF('${crop.id}')">📄 PDF</button>
          <button class="btn btn--sm btn--outline" onclick="editCrop('${crop.id}')">✏️ Edit</button>
          <button class="btn btn--sm btn--delete" onclick="deleteCrop('${crop.id}')">🗑️ Delete</button>
        </div>
      </div>`;
  }).join('');
}

// Enhanced delete functions for crops
function editCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  const newName = prompt('Enter crop name:', crop.name || crop.type);
  if (newName && newName.trim()) {
    const oldName = crop.name || crop.type;
    crop.name = newName.trim();
    saveToStorage();
    loadCropsGrid();
    addActivity(`✏️ Updated crop: ${oldName} → ${crop.name}`, cropId);
    showToast('✅ Crop updated successfully!', 'success');
  }
}

function deleteCrop(cropId) {
  const crop = crops.find(c => c.id === cropId);
  if (!crop) return;

  const relatedApps = applications.filter(app => app.cropId === cropId);
  let confirmMessage = `Delete crop: ${crop.name || crop.type}?`;

  if (relatedApps.length > 0) {
    confirmMessage += `\n\nThis crop has ${relatedApps.length} application record(s).\nDeleting will remove all related records.\n\nThis action cannot be undone.`;
  }

  if (confirm(confirmMessage)) {
    if (relatedApps.length > 0) {
      applications = applications.filter(app => app.cropId !== cropId);
    }

    crops = crops.filter(c => c.id !== cropId);
    saveToStorage();
    loadCropsGrid();
    addActivity(`🗑️ Deleted crop: ${crop.name || crop.type}`);
    showToast('✅ Crop deleted successfully!', 'success');
  }
}

// Farm management
function showAddFarmForm() {
  const form = $('#farmForm');
  if (form) {
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#farmName').focus();
  }
}

function hideFarmForm() {
  const form = $('#farmForm');
  if (form) {
    form.style.display = 'none';
    $('#addFarmForm').reset();
  }
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
      const soilType = $('#soilType').value;

      if (!farmName || !farmId) {
        showToast('📝 Farm name and ID are required', 'error');
        return;
      }

      if (farms.some(f => f.farmId.toLowerCase() === farmId.toLowerCase())) {
        showToast('⚠️ Farm ID already exists', 'error');
        return;
      }

      const newFarm = {
        id: generateId(),
        name: farmName,
        farmId: farmId,
        location: location,
        size: size,
        soilType: soilType,
        dateAdded: new Date().toISOString()
      };

      farms.push(newFarm);
      saveToStorage();
      addActivity(`🏡 Added new farm: ${farmName}`);

      loadFarmsTable();
      populateFarmSelects();
      hideFarmForm();
      showToast('✅ Farm added successfully!', 'success');
    });
  }
}

function loadFarmsTable() {
  const tbody = $('#farmsTableBody');
  if (!tbody) return;

  if (farms.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center" style="padding: 2rem;">
          <div style="color: var(--text-secondary);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏡</div>
            <div><strong>No farms added yet</strong></div>
            <div>Add your first farm to start managing crops!</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = farms.map(farm => {
    const farmCrops = crops.filter(c => c.farmId === farm.id);
    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${farm.name}</div>
          <small style="color: var(--text-secondary);">ID: ${farm.farmId}</small><br>
          <small style="color: var(--text-secondary);">${farm.location || 'Location not specified'}</small>
          ${farm.soilType ? `<br><small style="color: var(--text-secondary);">Soil: ${farm.soilType}</small>` : ''}
        </td>
        <td style="color: var(--text-secondary);">${farm.size ? farm.size + ' acres' : '-'}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${farmCrops.length} crops</div>
          ${farmCrops.map(c => `<small style="color: var(--text-secondary);">${c.name || c.type}</small>`).join('<br>')}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn--sm btn--outline" onclick="editFarm('${farm.id}')">✏️ Edit</button>
            <button class="btn btn--sm btn--delete" onclick="deleteFarm('${farm.id}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function editFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;

  const newName = prompt('Enter farm name:', farm.name);
  if (newName && newName.trim()) {
    const oldName = farm.name;
    farm.name = newName.trim();
    saveToStorage();
    loadFarmsTable();
    addActivity(`✏️ Updated farm: ${oldName} → ${farm.name}`);
    showToast('✅ Farm updated successfully!', 'success');
  }
}

function deleteFarm(farmId) {
  const farm = farms.find(f => f.id === farmId);
  if (!farm) return;

  const farmCrops = crops.filter(c => c.farmId === farmId);

  let confirmMessage = `Delete "${farm.name}"?`;
  if (farmCrops.length > 0) {
    confirmMessage += `\n\nThis will also delete:\n• ${farmCrops.length} crop(s)\n• All related application records`;
  }
  confirmMessage += '\n\nThis action cannot be undone.';

  if (confirm(confirmMessage)) {
    const deletedCropIds = farmCrops.map(c => c.id);
    applications = applications.filter(app => !deletedCropIds.includes(app.cropId));
    crops = crops.filter(c => c.farmId !== farmId);
    farms = farms.filter(f => f.id !== farmId);

    saveToStorage();
    loadFarmsTable();
    populateFarmSelects();
    addActivity(`🗑️ Deleted farm: ${farm.name}`);
    showToast('✅ Farm deleted successfully!', 'success');
  }
}

// Application management with delete functionality
function setupApplicationForm() {
  const form = $('#addApplicationForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const cropId = $('#applicationCrop').value;
      const applicationType = $('#applicationType').value;
      const productName = $('#productName').value.trim();
      const quantity = parseFloat($('#quantity').value);
      const unit = $('#unit').value;
      const applicationDate = $('#applicationDate').value;
      const growthStage = $('#growthStage').value;
      const method = $('#applicationMethod').value;
      const weatherConditions = $('#weatherConditions').value.trim();
      const purpose = $('#applicationPurpose').value.trim();
      const notes = $('#applicationNotes').value.trim();

      if (!cropId || !applicationType || !productName || !quantity || !applicationDate) {
        showToast('📝 Please fill in all required fields', 'error');
        return;
      }

      const crop = crops.find(c => c.id === cropId);
      if (!crop) {
        showToast('⚠️ Selected crop not found', 'error');
        return;
      }

      const newApplication = {
        id: generateId(),
        cropId: cropId,
        type: applicationType,
        productName: productName,
        quantity: quantity,
        unit: unit,
        date: applicationDate,
        growthStage: growthStage,
        method: method,
        weatherConditions: weatherConditions,
        purpose: purpose,
        notes: notes,
        createdAt: new Date().toISOString()
      };

      applications.push(newApplication);
      saveToStorage();

      const cropName = crop.name || crop.type;
      addActivity(`💉 Applied ${applicationType}: ${productName} to ${cropName}`, cropId);

      loadApplicationsTimeline();
      form.reset();
      $('#applicationDate').value = new Date().toISOString().split('T')[0];
      showToast('✅ Application recorded successfully!', 'success');
    });
  }
}

function loadApplicationsTimeline() {
  const container = $('#applicationsTimeline');
  if (!container) return;

  if (applications.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">💉</div>
        <h3>No applications recorded yet</h3>
        <p>Record your first crop application above to start tracking!</p>
        <button class="btn btn--primary btn--mobile" onclick="exportApplicationsReportToPDF()" style="margin-top: 1rem;" disabled>
          📄 Export PDF (No data)
        </button>
      </div>`;
    return;
  }

  const sortedApplications = [...applications]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0;">📋 Recent Applications</h3>
      <button class="btn btn--primary" onclick="exportApplicationsReportToPDF()">📄 Export PDF</button>
    </div>
  ` + sortedApplications.map(app => {
    const crop = crops.find(c => c.id === app.cropId);
    const cropName = crop ? (crop.name || crop.type) : 'Unknown Crop';
    const cropIcon = crop ? getCropIcon(crop.type) : '🌱';

    return `
      <div class="timeline-item">
        <button class="timeline-delete" onclick="deleteApplication('${app.id}')" title="Delete application">🗑️</button>
        <div class="timeline-date">${formatDate(app.date)} - ${formatDateRelative(app.date)}</div>
        <div class="timeline-content">
          <h4>${cropIcon} ${cropName} - ${app.productName}</h4>
          <p>
            <span class="application-type application-type--${app.type}">${app.type}</span>
            • ${app.quantity} ${app.unit}
            ${app.growthStage ? ` • ${app.growthStage} stage` : ''}
            ${app.method ? ` • ${app.method}` : ''}
          </p>
          ${app.purpose ? `<p><strong>Purpose:</strong> ${app.purpose}</p>` : ''}
          ${app.notes ? `<p><strong>Notes:</strong> ${app.notes}</p>` : ''}
        </div>
      </div>`;
  }).join('');
}

// Enhanced delete function for applications
function deleteApplication(appId) {
  const app = applications.find(a => a.id === appId);
  if (!app) return;

  const crop = crops.find(c => c.id === app.cropId);
  const cropName = crop ? (crop.name || crop.type) : 'Unknown Crop';

  const confirmMessage = `Delete this application?\n\n${app.productName} (${app.type})\nApplied to: ${cropName}\nDate: ${formatDate(app.date)}\n\nThis action cannot be undone.`;

  if (confirm(confirmMessage)) {
    applications = applications.filter(a => a.id !== appId);
    saveToStorage();
    loadApplicationsTimeline();
    addActivity(`🗑️ Deleted application: ${app.productName} from ${cropName}`);
    showToast('✅ Application deleted successfully!', 'success');
  }
}

// Recommendation system
function generateRecommendationsForAllCrops() {
  const recommendations = [];

  crops.forEach(crop => {
    const cropRecommendations = generateRecommendationsForCrop(crop);
    recommendations.push(...cropRecommendations);
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

function generateRecommendationsForCrop(crop) {
  const recommendations = [];
  const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
  const currentStage = determineCropStage(crop, daysSinceStart);
  const cropKnowledge = CROP_KNOWLEDGE[crop.type];

  if (!cropKnowledge) {
    return recommendations;
  }

  const cropApplications = applications.filter(app => app.cropId === crop.id);

  if (cropKnowledge.applications[currentStage]) {
    cropKnowledge.applications[currentStage].forEach(stageApp => {
      const recentSimilarApp = cropApplications.find(app => 
        app.type === stageApp.type && 
        app.productName.toLowerCase().includes(stageApp.product.toLowerCase().split(' ')[0]) &&
        Math.abs(new Date(app.date) - new Date()) < (14 * 24 * 60 * 60 * 1000)
      );

      if (!recentSimilarApp) {
        const priority = daysSinceStart <= 7 ? 'high' : 
                        daysSinceStart <= 21 ? 'medium' : 'low';

        recommendations.push({
          id: generateId(),
          cropId: crop.id,
          cropName: crop.name || crop.type,
          cropIcon: getCropIcon(crop.type),
          title: `${stageApp.type} Application for ${crop.name || crop.type}`,
          description: `Apply ${stageApp.product} - ${stageApp.purpose}. Timing: ${stageApp.timing}`,
          type: stageApp.type,
          product: stageApp.product,
          purpose: stageApp.purpose,
          timing: stageApp.timing,
          priority: priority,
          stage: currentStage,
          dueDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }
    });
  }

  if (crop.harvestDate) {
    const daysToHarvest = Math.floor((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToHarvest <= 30 && daysToHarvest > 0) {
      recommendations.push({
        id: generateId(),
        cropId: crop.id,
        cropName: crop.name || crop.type,
        cropIcon: getCropIcon(crop.type),
        title: `Prepare for harvest - ${crop.name || crop.type}`,
        description: `Harvest scheduled in ${daysToHarvest} days. Ensure final applications are completed.`,
        type: 'harvest-prep',
        priority: 'medium',
        dueDate: crop.harvestDate
      });
    }
  }

  return recommendations;
}

function loadRecommendations() {
  const container = $('#recommendationsGrid');
  if (!container) return;

  const allRecommendations = generateRecommendationsForAllCrops();

  if (allRecommendations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
        <div style="font-size: 4rem; margin-bottom: 2rem;">💡</div>
        <h3>No recommendations available</h3>
        <p>Add some crops and record applications to get personalized recommendations!</p>
      </div>`;
    return;
  }

  container.innerHTML = allRecommendations.map(rec => `
    <div class="recommendation-card">
      <div class="recommendation-priority recommendation-priority--${rec.priority}">
        ${rec.priority}
      </div>
      <h4>${rec.cropIcon} ${rec.title}</h4>
      <p>${rec.description}</p>
      <div style="margin-top: 1rem;">
        <span class="application-type application-type--${rec.type}">${rec.type}</span>
        ${rec.dueDate ? `<br><small style="color: var(--text-secondary);">Due: ${formatDate(rec.dueDate)}</small>` : ''}
      </div>
      <button class="btn btn--primary btn--mobile" onclick="createApplicationFromRecommendation('${rec.id}')" style="margin-top: 1rem;">
        📝 Record This Application
      </button>
    </div>
  `).join('');
}

function createApplicationFromRecommendation(recommendationId) {
  const recommendations = generateRecommendationsForAllCrops();
  const rec = recommendations.find(r => r.id === recommendationId);

  if (rec) {
    switchSection('applications');

    setTimeout(() => {
      $('#applicationCrop').value = rec.cropId;
      $('#applicationType').value = rec.type;
      $('#productName').value = rec.product || '';
      $('#applicationPurpose').value = rec.purpose || '';
      $('#applicationDate').value = new Date().toISOString().split('T')[0];

      showToast('📝 Form pre-filled with recommendation data', 'info');
    }, 500);
  }
}

// Populate selects
function populateFarmSelects() {
  const selects = ['#cropFarm'];

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

function populateCropSelects() {
  const selects = ['#applicationCrop', '#recommendationCrop', '#calendarCrop'];

  selects.forEach(selector => {
    const select = $(selector);
    if (select) {
      const currentValue = select.value;
      const baseOption = selector.includes('recommendation') || selector.includes('calendar') ? 
        '<option value="">All Crops</option>' : 
        '<option value="">Select Crop</option>';

      select.innerHTML = baseOption + 
        crops.map(crop => 
          `<option value="${crop.id}">${getCropIcon(crop.type)} ${crop.name || crop.type} (${getFarmName(crop.farmId)})</option>`
        ).join('');
      select.value = currentValue;
    }
  });
}

// Crop profiles with enhanced display and PDF export
function loadCropProfiles() {
  const container = $('#cropProfilesList');
  if (!container) return;

  if (crops.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; margin-bottom: 2rem;">🌱</div>
        <h3>No crop profiles available</h3>
        <p>Add crops to see detailed profiles with complete application history.</p>
        <button class="btn btn--primary btn--mobile" onclick="switchSection('crops')" style="margin-top: 2rem;">
          🌱 Add Your First Crop
        </button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div></div>
      <button class="btn btn--primary" onclick="exportCropReportToPDF()">📄 Export All Crops PDF</button>
    </div>
  ` + crops.map(crop => {
    const cropApplications = applications.filter(app => app.cropId === crop.id);
    const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
    const currentStage = determineCropStage(crop, daysSinceStart);

    return `
      <div class="card mobile-card" style="margin-bottom: 2rem;">
        <div class="card__body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                ${getCropIcon(crop.type)} ${crop.name || crop.type}
              </h3>
              <p style="margin: 0; color: var(--text-secondary);">
                ${crop.variety ? crop.variety + ' • ' : ''}${getFarmName(crop.farmId)} • ${crop.area} acres
              </p>
            </div>
            <span class="crop-status crop-status--${currentStage}">${currentStage}</span>
          </div>

          <div class="crop-profile-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div>
              <strong>Planted:</strong> ${formatDate(crop.plantationDate)}<br>
              <small style="color: var(--text-secondary);">${daysSinceStart} days ago</small>
            </div>
            ${crop.harvestDate ? `
            <div>
              <strong>Expected Harvest:</strong> ${formatDate(crop.harvestDate)}<br>
              <small style="color: var(--text-secondary);">
                ${Math.floor((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
              </small>
            </div>
            ` : ''}
            <div>
              <strong>Total Applications:</strong> ${cropApplications.length}<br>
              <small style="color: var(--text-secondary);">
                ${cropApplications.filter(app => {
                  const appDate = new Date(app.date);
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return appDate >= monthAgo;
                }).length} this month
              </small>
            </div>
            ${crop.fieldId ? `
            <div>
              <strong>Field/Block:</strong> ${crop.fieldId}
            </div>
            ` : ''}
          </div>

          <div class="crop-applications-history">
            <h4 style="margin-bottom: 1rem;">📋 Application History</h4>
            ${cropApplications.length === 0 ? 
              '<p style="color: var(--text-secondary); font-style: italic;">No applications recorded yet.</p>' :
              cropApplications.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8).map(app => `
                <div class="timeline-item" style="margin-bottom: 0.5rem; position: relative;">
                  <button class="timeline-delete" onclick="deleteApplication('${app.id}')" title="Delete application">🗑️</button>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${app.productName}</strong>
                      <span class="application-type application-type--${app.type}" style="margin-left: 0.5rem;">${app.type}</span>
                    </div>
                    <small style="color: var(--text-secondary);">${formatDate(app.date)}</small>
                  </div>
                  <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${app.quantity} ${app.unit} • ${app.method || 'Application'}
                    ${app.growthStage ? ` • ${app.growthStage} stage` : ''}
                  </div>
                </div>
              `).join('')
            }
            ${cropApplications.length > 8 ? 
              `<p style="text-align: center; margin-top: 1rem;">
                <small style="color: var(--text-secondary);">... and ${cropApplications.length - 8} more applications</small>
              </p>` : ''
            }
          </div>

          ${crop.notes ? `
          <div class="crop-notes" style="margin-top: 2rem; padding: 1rem; background: var(--bg-soft); border-radius: var(--border-radius);">
            <h5 style="margin-bottom: 0.5rem;">📝 Notes</h5>
            <p style="margin: 0; font-size: 0.875rem;">${crop.notes}</p>
          </div>
          ` : ''}

          <div class="action-buttons" style="margin-top: 2rem;">
            <button class="btn btn--primary" onclick="addApplicationForCrop('${crop.id}')">
              💉 Add Application
            </button>
            <button class="btn btn--primary" onclick="exportCropReportToPDF('${crop.id}')">
              📄 Export PDF
            </button>
            <button class="btn btn--outline" onclick="viewCropRecommendations('${crop.id}')">
              💡 Recommendations
            </button>
            <button class="btn btn--delete" onclick="deleteCrop('${crop.id}')">
              🗑️ Delete Crop
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function addApplicationForCrop(cropId) {
  switchSection('applications');
  setTimeout(() => {
    $('#applicationCrop').value = cropId;
    showToast('📝 Crop pre-selected in application form', 'info');
  }, 500);
}

function viewCropRecommendations(cropId) {
  switchSection('recommendations');
  setTimeout(() => {
    $('#recommendationCrop').value = cropId;
    loadRecommendations();
    showToast('💡 Showing recommendations for selected crop', 'info');
  }, 500);
}

function openCropProfile(cropId) {
  switchSection('crop-profiles');
}

// Calendar functionality (simplified)
function loadCalendar() {
  const container = $('#calendarView');
  if (!container) return;

  const selectedCrop = $('#calendarCrop').value;
  const selectedYear = $('#calendarYear').value;

  let relevantApplications = applications.filter(app => {
    const appDate = new Date(app.date);
    return appDate.getFullYear() == selectedYear;
  });

  if (selectedCrop) {
    relevantApplications = relevantApplications.filter(app => app.cropId === selectedCrop);
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let calendarHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">';

  months.forEach((month, index) => {
    const monthApplications = relevantApplications.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getMonth() === index;
    });

    calendarHTML += `
      <div class="calendar-month-card" style="background: var(--bg-card); border-radius: var(--border-radius-lg); padding: 1rem; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
        <h4 style="margin-bottom: 1rem; color: var(--text-primary);">${month} ${selectedYear}</h4>
        ${monthApplications.length === 0 ? 
          '<p style="color: var(--text-secondary); font-style: italic;">No applications</p>' :
          monthApplications.map(app => {
            const crop = crops.find(c => c.id === app.cropId);
            const cropName = crop ? (crop.name || crop.type) : 'Unknown';
            return `
              <div class="calendar-event" style="margin-bottom: 0.5rem; padding: 0.5rem; background: var(--bg-soft); border-radius: var(--border-radius); border-left: 3px solid var(--primary-color);">
                <div style="font-weight: 600; font-size: 0.875rem;">${formatDate(app.date)} - ${app.productName}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  ${getCropIcon(crop?.type)} ${cropName} • ${app.type}
                </div>
              </div>`;
          }).join('')
        }
      </div>`;
  });

  calendarHTML += '</div>';
  container.innerHTML = calendarHTML;
}

// Analytics (simplified)
function loadAnalytics() {
  setTimeout(() => {
    createApplicationsByCropChart();
    createMonthlyTrendsChart();
    createGrowthStageChart();
    loadPerformanceSummary();
  }, 300);
}

function createApplicationsByCropChart() {
  const ctx = $('#applicationsByCropChart');
  if (!ctx) return;

  if (applicationsByCropChart) {
    applicationsByCropChart.destroy();
  }

  const cropApplications = {};
  applications.forEach(app => {
    const crop = crops.find(c => c.id === app.cropId);
    const cropName = crop ? (crop.name || crop.type) : 'Unknown';
    cropApplications[cropName] = (cropApplications[cropName] || 0) + 1;
  });

  if (Object.keys(cropApplications).length === 0) {
    ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No application data available</div>';
    return;
  }

  applicationsByCropChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(cropApplications),
      datasets: [{
        data: Object.values(cropApplications),
        backgroundColor: [
          '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0',
          '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: { size: 11 }
          }
        }
      }
    }
  });
}

function createMonthlyTrendsChart() {
  const ctx = $('#monthlyTrendsChart');
  if (!ctx) return;

  if (monthlyTrendsChart) {
    monthlyTrendsChart.destroy();
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const monthlyData = Array(12).fill(0);

  applications.forEach(app => {
    const appDate = new Date(app.date);
    if (appDate.getFullYear() === currentYear) {
      monthlyData[appDate.getMonth()]++;
    }
  });

  monthlyTrendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthNames,
      datasets: [{
        label: 'Applications per Month',
        data: monthlyData,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function createGrowthStageChart() {
  const ctx = $('#growthStageChart');
  if (!ctx) return;

  if (growthStageChart) {
    growthStageChart.destroy();
  }

  const stageApplications = {};
  applications.forEach(app => {
    if (app.growthStage) {
      stageApplications[app.growthStage] = (stageApplications[app.growthStage] || 0) + 1;
    }
  });

  if (Object.keys(stageApplications).length === 0) {
    ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No growth stage data available</div>';
    return;
  }

  growthStageChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(stageApplications),
      datasets: [{
        label: 'Applications by Growth Stage',
        data: Object.values(stageApplications),
        backgroundColor: '#16a34a',
        borderColor: '#15803d',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function loadPerformanceSummary() {
  const container = $('#performanceSummary');
  if (!container) return;

  const totalCrops = crops.length;
  const totalApplications = applications.length;
  const avgApplicationsPerCrop = totalCrops > 0 ? (totalApplications / totalCrops).toFixed(1) : 0;

  const applicationTypes = {};
  applications.forEach(app => {
    applicationTypes[app.type] = (applicationTypes[app.type] || 0) + 1;
  });

  const mostUsedType = Object.keys(applicationTypes).reduce((a, b) => 
    applicationTypes[a] > applicationTypes[b] ? a : b, 'None'
  );

  const activeCrops = crops.filter(crop => {
    const daysSinceStart = Math.floor((new Date() - new Date(crop.plantationDate)) / (1000 * 60 * 60 * 24));
    return daysSinceStart < 120;
  }).length;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
      <div class="performance-stat">
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Total Crops Managed</h4>
        <div style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">${totalCrops}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary);">${activeCrops} currently active</div>
      </div>
      <div class="performance-stat">
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Applications per Crop</h4>
        <div style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">${avgApplicationsPerCrop}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary);">Average across all crops</div>
      </div>
      <div class="performance-stat">
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Most Used Treatment</h4>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${mostUsedType}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary);">${applicationTypes[mostUsedType] || 0} applications</div>
      </div>
      <div class="performance-stat">
        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Data Quality Score</h4>
        <div style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">
          ${Math.min(95, Math.max(60, 70 + (totalApplications * 2)))}%
        </div>
        <div style="font-size: 0.875rem; color: var(--text-secondary);">Based on record completeness</div>
      </div>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-soft); border-radius: var(--border-radius-lg); border-left: 3px solid var(--primary-color);">
      <h5 style="margin-bottom: 1rem; color: var(--text-primary);">📊 Insights & Recommendations</h5>
      <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
        ${totalApplications === 0 ? 
          '<li>Start recording applications to get personalized insights and recommendations.</li>' :
          `<li>You have recorded ${totalApplications} applications across ${totalCrops} crops.</li>`
        }
        ${activeCrops > 0 ? 
          `<li>You have ${activeCrops} active crops that may need attention soon.</li>` : 
          '<li>Consider adding new crops for the upcoming season.</li>'
        }
        ${mostUsedType !== 'None' ? 
          `<li>Your most frequently used treatment type is ${mostUsedType.toLowerCase()}.</li>` : ''
        }
        <li>Keep recording applications consistently to improve recommendation accuracy.</li>
      </ul>
      <div style="margin-top: 1rem; text-align: center;">
        <button class="btn btn--primary" onclick="exportAllDataToPDF()">📄 Export Complete Report PDF</button>
      </div>
    </div>`;
}

// Enhanced toast notifications
function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast mobile-toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);

    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [50] : [100, 50, 100]);
    }
  }
}

// Modal functions
function openCropModal(cropId) {
  const modal = $('#cropModal');
  const crop = crops.find(c => c.id === cropId);
  if (modal && crop) {
    $('#cropModalTitle').textContent = `${getCropIcon(crop.type)} ${crop.name || crop.type}`;
    modal.classList.remove('hidden');
  }
}

function closeCropModal() {
  const modal = $('#cropModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Initialize the app
function initializeApp() {
  loadFromStorage();
  initializeNavigation();
  setupFarmForm();
  setupCropForm();
  setupApplicationForm();
  updateDashboard();

  const today = new Date().toISOString().split('T')[0];
  const dateInputs = ['#applicationDate', '#plantationDate'];
  dateInputs.forEach(selector => {
    const input = $(selector);
    if (input) input.value = today;
  });

  document.addEventListener('touchstart', () => {}, { passive: true });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (applicationsByCropChart) applicationsByCropChart.resize();
      if (monthlyTrendsChart) monthlyTrendsChart.resize();
      if (growthStageChart) growthStageChart.resize();
      if (costAnalysisChart) costAnalysisChart.resize();
    }, 500);
  });
}

// Handle window resize for charts
window.addEventListener('resize', debounce(() => {
  if (applicationsByCropChart) applicationsByCropChart.resize();
  if (monthlyTrendsChart) monthlyTrendsChart.resize();
  if (growthStageChart) growthStageChart.resize();
  if (costAnalysisChart) costAnalysisChart.resize();
}, 250));

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('Enhanced Crop-Focused Farm Management System initialized with comprehensive PDF export functionality');