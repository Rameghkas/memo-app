// State Management
let appState = {
  workbook: null,
  fileName: CONFIG.fileName,
  entries: [],
  loadingLocations: CONFIG.loadingLocations,
  unloadingLocations: CONFIG.unloadingLocations,
  globalMargin: 0.0
};

// UI Elements
const els = {
  fileDropzone: document.getElementById('file-dropzone'),
  fileInput: document.getElementById('file-input'),
  fileDetails: document.getElementById('file-details'),
  loadedFileName: document.getElementById('loaded-file-name'),
  loadedFileSize: document.getElementById('loaded-file-size'),
  btnResetFile: document.getElementById('btn-reset-file'),
  
  entryForm: document.getElementById('entry-form'),
  inputDate: document.getElementById('input-date'),
  selectLoading: document.getElementById('select-loading'),
  selectUnloading: document.getElementById('select-unloading'),
  inputWeight: document.getElementById('input-weight'),
  inputRate: document.getElementById('input-rate'),
  inputChallanNo: document.getElementById('input-challan-no'),
  inputGateNo: document.getElementById('input-gate-no'),
  
  inputGlobalMargin: document.getElementById('input-global-margin'),
  summaryTotalWeight: document.getElementById('summary-total-weight'),
  summaryTotalRate: document.getElementById('summary-total-rate'),
  summaryNetPayment: document.getElementById('summary-net-payment'),
  
  btnDownload: document.getElementById('btn-download'),
  btnOpenAddModal: document.getElementById('btn-open-add-modal'),
  addEntryModal: document.getElementById('add-entry-modal'),
  btnCloseAddModal: document.getElementById('btn-close-add-modal'),
  btnCancelAddModal: document.getElementById('btn-cancel-add-modal'),
  btnOpenSummaryModal: document.getElementById('btn-open-summary-modal'),
  summaryModal: document.getElementById('summary-modal'),
  btnCloseSummaryModal: document.getElementById('btn-close-summary-modal'),
  btnCloseSummaryModalOk: document.getElementById('btn-close-summary-modal-ok'),
  mobileBtnUpload: document.getElementById('mobile-btn-upload'),
  mobileBtnOpenAddModal: document.getElementById('mobile-btn-open-add-modal'),
  mobileBtnOpenSummaryModal: document.getElementById('mobile-btn-open-summary-modal'),
  mobileBtnDownload: document.getElementById('mobile-btn-download'),
  searchPreview: document.getElementById('search-preview'),
  mobileCardsContainer: document.getElementById('mobile-cards-container'),
  toastContainer: document.getElementById('toast-container'),
  toolbarCard: document.getElementById('toolbar-card'),
  previewCard: document.getElementById('preview-card'),
  dashboardEmptyState: document.getElementById('dashboard-empty-state')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  setupEventListeners();
  initializeLucide();
});

// Initialize elements, default dates, dropdowns
function initUI() {
  // Set date default to today (YYYY-MM-DD for input value)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  els.inputDate.value = `${yyyy}-${mm}-${dd}`;
  
  // Populate dropdowns
  populateDropdowns();
  calculateSummary();
}

function initializeLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Populate Dropdown Menus
function populateDropdowns() {
  els.selectLoading.innerHTML = '<option value="" disabled selected>Select Loading Location</option>';
  appState.loadingLocations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    els.selectLoading.appendChild(opt);
  });

  els.selectUnloading.innerHTML = '<option value="" disabled selected>Select Unloading Location</option>';
  appState.unloadingLocations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    els.selectUnloading.appendChild(opt);
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Global Margin Input
  els.inputGlobalMargin.addEventListener('input', () => {
    appState.globalMargin = parseFloat(els.inputGlobalMargin.value) || 0;
    calculateSummary();
  });
  
  // Form submission
  els.entryForm.addEventListener('submit', handleFormSubmit);
  
  // File upload
  els.fileDropzone.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', handleFileSelect);
  
  // Drag & Drop
  els.fileDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.fileDropzone.classList.add('dragover');
  });
  els.fileDropzone.addEventListener('dragleave', () => {
    els.fileDropzone.classList.remove('dragover');
  });
  els.fileDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    els.fileDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      els.fileInput.files = e.dataTransfer.files;
      handleFileSelect();
    }
  });

  // Reset file button
  els.btnResetFile.addEventListener('click', resetFile);

  // Download Excel
  els.btnDownload.addEventListener('click', downloadExcel);

  // Search filter
  if (els.searchPreview) {
    els.searchPreview.addEventListener('input', filterPreview);
  }

  // Modal Events
  els.btnOpenAddModal.addEventListener('click', openAddModal);
  
  [els.btnCloseAddModal, els.btnCancelAddModal].forEach(btn => {
    btn.addEventListener('click', closeAddModal);
  });
  
  els.addEntryModal.addEventListener('click', (e) => {
    if (e.target === els.addEntryModal) closeAddModal();
  });

  // Summary Modal Events
  els.btnOpenSummaryModal.addEventListener('click', openSummaryModal);
  
  [els.btnCloseSummaryModal, els.btnCloseSummaryModalOk].forEach(btn => {
    btn.addEventListener('click', closeSummaryModal);
  });
  
  // Mobile Bottom Bar Events
  if (els.mobileBtnUpload) {
    els.mobileBtnUpload.addEventListener('click', () => els.fileInput.click());
  }
  if (els.mobileBtnOpenAddModal) {
    els.mobileBtnOpenAddModal.addEventListener('click', openAddModal);
  }
  if (els.mobileBtnOpenSummaryModal) {
    els.mobileBtnOpenSummaryModal.addEventListener('click', openSummaryModal);
  }
  if (els.mobileBtnDownload) {
    els.mobileBtnDownload.addEventListener('click', downloadExcel);
  }
}

function openAddModal() {
  els.addEntryModal.classList.remove('hidden');
}

function closeAddModal() {
  els.addEntryModal.classList.add('hidden');
}

function openSummaryModal() {
  els.summaryModal.classList.remove('hidden');
}

function closeSummaryModal() {
  els.summaryModal.classList.add('hidden');
}

// Summary Calculations Logic
function calculateSummary() {
  const totalWeight = appState.entries.reduce((sum, e) => sum + e.weight, 0);
  const totalRate = appState.entries.reduce((sum, e) => sum + e.rate, 0);
  const margin = appState.globalMargin;
  const netPayment = totalRate - (totalRate * (margin / 100));
  
  els.summaryTotalWeight.textContent = `${totalWeight.toLocaleString()} kg`;
  els.summaryTotalRate.textContent = `₹ ${formatCurrency(totalRate)}`;
  els.summaryNetPayment.textContent = `₹ ${formatCurrency(netPayment)}`;
}

// Helper: Format to Currency (Plain Number with lakhs grouping, no currency symbol)
function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

// Helper: Format Date from YYYY-MM-DD to DD/MM/YYYY
function formatDateToDMY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Helper: Format Excel dates (serial numbers or Date objects) to DD/MM/YYYY
function formatExcelDate(cellVal) {
  if (!cellVal) return '';
  if (cellVal instanceof Date) {
    const dd = String(cellVal.getDate()).padStart(2, '0');
    const mm = String(cellVal.getMonth() + 1).padStart(2, '0');
    const yyyy = cellVal.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  if (typeof cellVal === 'number') {
    // Excel base date is Dec 30, 1899 (due to Leap Year 1900 bug in Lotus 1-2-3)
    const date = new Date(Math.round((cellVal - 25569) * 86400 * 1000));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  if (typeof cellVal === 'string') {
    if (cellVal.includes('-')) {
      const parts = cellVal.split('-');
      if (parts[0].length === 4) { // YYYY-MM-DD
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return cellVal;
  }
  return String(cellVal);
}

// File Selection & Parsing
function handleFileSelect() {
  const file = els.fileInput.files[0];
  if (!file) return;

  appState.fileName = file.name;
  els.loadedFileName.textContent = file.name;
  els.loadedFileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
  
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      appState.workbook = workbook;
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Parse Sheet to Array of Arrays
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rawData.length > 0) {
        parseImportedData(rawData);
      } else {
        appState.entries = [];
        showToast('warning', 'The selected Excel file is empty.');
      }
      
      els.fileDropzone.classList.add('hidden');
      els.fileDetails.classList.remove('hidden');
      if (els.toolbarCard) {
        els.toolbarCard.classList.remove('hidden');
      }
      renderPreview();
      calculateSummary();
      showToast('success', `Loaded ${file.name} successfully!`);
    } catch (err) {
      console.error(err);
      showToast('danger', 'Error reading Excel file. Make sure it is valid.');
    }
  };
}

// Parse imported matrix and map to entries array
function parseImportedData(matrix) {
  const headers = matrix[0].map(h => String(h).trim().toLowerCase());
  
  // Find column indices (seeking weight in kilo, date, locations, and rate)
  const idx = {
    date: headers.findIndex(h => h.includes('date')),
    challanNo: headers.findIndex(h => h.includes('challan')),
    gateNo: headers.findIndex(h => h.includes('gate')),
    loading: headers.findIndex(h => h.includes('loading')),
    unloading: headers.findIndex(h => h.includes('unloading')),
    weight: headers.findIndex(h => h.includes('weight') || h.includes('kilo') || h.includes('kg')),
    rate: headers.findIndex(h => h.includes('rate') && !h.includes('total'))
  };

  const parsedEntries = [];
  let foundMargin = false;
  let duplicateCount = 0;
  
  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (row.length === 0 || row[0] === undefined) continue; // skip empty rows

    const dateValStr = String(row[0] || '').trim();
    
    // Check if it's a summary row in Excel, skip loading it as a data entry row
    if (dateValStr.toLowerCase().includes('total') || 
        dateValStr.toLowerCase().includes('margin') || 
        dateValStr.toLowerCase().includes('net')) {
        
      // Try to parse global margin if the row starts with "Global Margin %"
      if (dateValStr.toLowerCase().includes('margin')) {
        // Search rate column for margin value
        const marginIdx = idx.rate !== -1 ? idx.rate : 6;
        const marginCell = row[marginIdx];
        if (typeof marginCell === 'number') {
          appState.globalMargin = marginCell <= 1 ? marginCell * 100 : marginCell;
          els.inputGlobalMargin.value = appState.globalMargin.toFixed(1);
          foundMargin = true;
        }
      }
      continue;
    }

    const dateVal = idx.date !== -1 ? formatExcelDate(row[idx.date]) : '';
    const challanNoVal = idx.challanNo !== -1 ? String(row[idx.challanNo] || '').trim().substring(0, CONFIG.maxLengths.challanNo) : '';
    const gateNoVal = idx.gateNo !== -1 ? String(row[idx.gateNo] || '').trim().substring(0, CONFIG.maxLengths.gateNo) : '';
    const loadingVal = idx.loading !== -1 ? String(row[idx.loading] || '') : '';
    const unloadingVal = idx.unloading !== -1 ? String(row[idx.unloading] || '') : '';
    const weightVal = idx.weight !== -1 ? parseFloat(row[idx.weight]) || 0 : 0;
    const rateVal = idx.rate !== -1 ? parseFloat(row[idx.rate]) || 0 : 0;

    const newEntry = {
      date: dateVal,
      challanNo: challanNoVal,
      gateNo: gateNoVal,
      loading: loadingVal,
      unloading: unloadingVal,
      weight: weightVal,
      rate: rateVal
    };

    // Check if duplicate of an entry already parsed
    const isDuplicate = parsedEntries.some(entry => {
      if (newEntry.challanNo && entry.challanNo && 
          newEntry.challanNo.toLowerCase() === entry.challanNo.toLowerCase()) {
        return true;
      }
      return (
        entry.date === newEntry.date &&
        entry.loading === newEntry.loading &&
        entry.unloading === newEntry.unloading &&
        entry.weight === newEntry.weight &&
        entry.rate === newEntry.rate &&
        entry.challanNo.toLowerCase() === newEntry.challanNo.toLowerCase() &&
        entry.gateNo.toLowerCase() === newEntry.gateNo.toLowerCase()
      );
    });

    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    parsedEntries.push(newEntry);
  }

  appState.entries = parsedEntries;
  if (!foundMargin) {
    appState.globalMargin = 0.0;
    els.inputGlobalMargin.value = '0.0';
  }

  if (duplicateCount > 0) {
    showToast('warning', `Skipped ${duplicateCount} duplicate entries found in the file.`);
  }
}

// Reset loaded file and clear state
function resetFile() {
  appState.workbook = null;
  appState.fileName = CONFIG.fileName;
  appState.entries = [];
  appState.globalMargin = 0.0;
  els.fileInput.value = '';
  els.inputGlobalMargin.value = '0.0';
  els.fileDropzone.classList.remove('hidden');
  els.fileDetails.classList.add('hidden');
  if (els.toolbarCard) {
    els.toolbarCard.classList.add('hidden');
  }
  renderPreview();
  calculateSummary();
  showToast('success', 'Workbook cleared. Starting fresh.');
}

// Helper: Check if an entry is a duplicate of an existing entry
function isDuplicateEntry(newEntry) {
  return appState.entries.some(entry => {
    // If both have the same non-empty challan number, it's a duplicate
    if (newEntry.challanNo && entry.challanNo && 
        newEntry.challanNo.toLowerCase() === entry.challanNo.toLowerCase()) {
      return true;
    }
    
    // If all details match exactly
    return (
      entry.date === newEntry.date &&
      entry.loading === newEntry.loading &&
      entry.unloading === newEntry.unloading &&
      entry.weight === newEntry.weight &&
      entry.rate === newEntry.rate &&
      entry.challanNo.toLowerCase() === newEntry.challanNo.toLowerCase() &&
      entry.gateNo.toLowerCase() === newEntry.gateNo.toLowerCase()
    );
  });
}

// Form Submission - Add Entry
function handleFormSubmit(e) {
  e.preventDefault();
  
  const rawDate = els.inputDate.value;
  const formattedDate = formatDateToDMY(rawDate);
  const loading = els.selectLoading.value;
  const unloading = els.selectUnloading.value;
  const weight = parseFloat(els.inputWeight.value) || 0;
  const rate = parseFloat(els.inputRate.value) || 0;
  
  const challanNo = els.inputChallanNo.value.trim();
  const gateNo = els.inputGateNo.value.trim();
  
  // Validate length
  if (challanNo.length > CONFIG.maxLengths.challanNo) {
    showToast('danger', `Challan No must be at most ${CONFIG.maxLengths.challanNo} characters.`);
    return;
  }
  if (gateNo.length > CONFIG.maxLengths.gateNo) {
    showToast('danger', `Gate No must be at most ${CONFIG.maxLengths.gateNo} characters.`);
    return;
  }
  
  // Validate loading and unloading locations are not the same
  if (loading === unloading) {
    showToast('danger', 'Loading and unloading locations cannot be the same.');
    return;
  }
  
  const newEntry = {
    date: formattedDate,
    challanNo,
    gateNo,
    loading,
    unloading,
    weight,
    rate
  };
  
  // Check for duplicate
  if (isDuplicateEntry(newEntry)) {
    showToast('warning', 'This entry (same Challan No or exact details) already exists.');
    return;
  }
  
  appState.entries.push(newEntry);
  
  // Re-render Preview & Update Summary
  renderPreview();
  calculateSummary();
  
  // Reset Form inputs (excluding date which stays today)
  els.selectLoading.selectedIndex = 0;
  els.selectUnloading.selectedIndex = 0;
  els.inputWeight.value = '';
  els.inputRate.value = '';
  els.inputChallanNo.value = '';
  els.inputGateNo.value = '';
  
  closeAddModal();
  
  showToast('success', 'Entry added to preview! Click "Save & Download Excel" to save the file.');
}

// Render preview table (Desktop) & card-list (Mobile)
function renderPreview() {
  // Toggle empty state dashboard vs preview card
  if (els.previewCard && els.dashboardEmptyState) {
    if (appState.entries.length === 0) {
      els.previewCard.classList.add('hidden');
      els.dashboardEmptyState.classList.remove('hidden');
    } else {
      els.previewCard.classList.remove('hidden');
      els.dashboardEmptyState.classList.add('hidden');
    }
  }

  const filterText = els.searchPreview ? els.searchPreview.value.toLowerCase() : '';
  
  // Filter entries
  const filtered = appState.entries.filter(entry => {
    return (
      entry.date.toLowerCase().includes(filterText) ||
      (entry.challanNo && entry.challanNo.toLowerCase().includes(filterText)) ||
      (entry.gateNo && entry.gateNo.toLowerCase().includes(filterText)) ||
      entry.loading.toLowerCase().includes(filterText) ||
      entry.unloading.toLowerCase().includes(filterText) ||
      String(entry.weight).includes(filterText) ||
      String(entry.rate).includes(filterText) ||
      formatCurrency(entry.rate).toLowerCase().includes(filterText)
    );
  });

  // Render Mobile Cards
  if (filtered.length === 0) {
    els.mobileCardsContainer.innerHTML = `<div class="empty-state">No matching records found.</div>`;
  } else {
    els.mobileCardsContainer.innerHTML = filtered.map((entry, index) => `
      <div class="mobile-card" onclick="toggleCardExpand(this)">
        <div class="mobile-card-header">
          <div class="mobile-card-summary">
            <span class="mobile-card-date">${entry.date}</span>
            <span class="mobile-card-divider">•</span>
            <div class="mobile-card-route">
              <span>${entry.loading}</span>
              <i data-lucide="arrow-right" class="route-arrow"></i>
              <span>${entry.unloading}</span>
            </div>
          </div>
          <div class="mobile-card-toggle">
            <i data-lucide="chevron-down" class="toggle-icon"></i>
          </div>
        </div>
        
        <div class="mobile-card-details hidden-details">
          <div class="mobile-card-grid" style="margin-top: 10px; margin-bottom: 12px;">
            <div>
              <span class="mobile-card-label">Challan No</span>
              <span class="mobile-card-val">${entry.challanNo || '-'}</span>
            </div>
            <div>
              <span class="mobile-card-label">Gate No</span>
              <span class="mobile-card-val">${entry.gateNo || '-'}</span>
            </div>
            <div>
              <span class="mobile-card-label">Weight</span>
              <span class="mobile-card-val">${entry.weight.toLocaleString()} kg</span>
            </div>
            <div>
              <span class="mobile-card-label">Rate</span>
              <span class="mobile-card-val">₹ ${formatCurrency(entry.rate)}</span>
            </div>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn-delete-mobile" onclick="event.stopPropagation(); deleteEntry(${index})">
              <i data-lucide="trash-2" style="width: 14px; height: 14px; margin-right: 4px;"></i> Delete Entry
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  initializeLucide();
}

// Global scope delete handler for inline onclicks
window.deleteEntry = function(index) {
  appState.entries.splice(index, 1);
  renderPreview();
  calculateSummary();
  showToast('success', 'Entry deleted.');
};

// Global scope card toggle handler for inline onclicks
window.toggleCardExpand = function(cardEl) {
  const detailsEl = cardEl.querySelector('.mobile-card-details');
  const toggleIcon = cardEl.querySelector('.toggle-icon');
  
  if (detailsEl.classList.contains('hidden-details')) {
    detailsEl.classList.remove('hidden-details');
    cardEl.classList.add('expanded');
    if (window.lucide) {
      toggleIcon.setAttribute('data-lucide', 'chevron-up');
      window.lucide.createIcons();
    }
  } else {
    detailsEl.classList.add('hidden-details');
    cardEl.classList.remove('expanded');
    if (window.lucide) {
      toggleIcon.setAttribute('data-lucide', 'chevron-down');
      window.lucide.createIcons();
    }
  }
};

// Filter preview search input
function filterPreview() {
  renderPreview();
}

// Generate SheetJS Workbook from current state
function generateWorkbook() {
  const headers = [
    'Date', 
    'Challan No',
    'Gate No',
    'Loading Location', 
    'Unloading Location', 
    'Weight (Kilo)', 
    'Rate'
  ];
  
  const dataRows = appState.entries.map(e => [
    e.date,
    e.challanNo || '',
    e.gateNo || '',
    e.loading,
    e.unloading,
    e.weight,
    e.rate
  ]);
  
  const sheetData = [headers, ...dataRows];
  
  // Calculate index locations for Excel formulas
  const totalRowIdx = dataRows.length + 3; // 1-indexed (headers + data + empty row + totals row)
  const marginRowIdx = totalRowIdx + 1;
  const netPaymentRowIdx = marginRowIdx + 1;
  
  // Totals calculations
  const totalWeightVal = appState.entries.reduce((sum, e) => sum + e.weight, 0);
  const totalRateVal = appState.entries.reduce((sum, e) => sum + e.rate, 0);
  const netPaymentVal = totalRateVal - (totalRateVal * (appState.globalMargin / 100));

  // Add summary rows with spreadsheet formulas
  sheetData.push([]); // blank row
  
  sheetData.push([
    'Total',
    '',
    '',
    '',
    '',
    { f: `SUM(F2:F${dataRows.length + 1})`, v: totalWeightVal },
    { f: `SUM(G2:G${dataRows.length + 1})`, v: totalRateVal }
  ]);
  
  sheetData.push([
    'Global Margin %',
    '',
    '',
    '',
    '',
    '',
    appState.globalMargin / 100
  ]);
  
  sheetData.push([
    'Net Payment',
    '',
    '',
    '',
    '',
    '',
    { f: `G${totalRowIdx}*(1-G${marginRowIdx})`, v: netPaymentVal }
  ]);
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Apply formatting to cells in worksheet
  // 1. Margin cell formatting (G[marginRowIdx])
  const marginCellRef = `G${marginRowIdx}`;
  if (worksheet[marginCellRef]) {
    worksheet[marginCellRef].t = 'n';
    worksheet[marginCellRef].z = '0.0%';
  }
  
  // 2. Currency formatting on Rate values (using plain numbers to avoid ### errors)
  for (let r = 2; r <= dataRows.length + 1; r++) {
    const rateRef = `G${r}`;
    if (worksheet[rateRef]) {
      worksheet[rateRef].t = 'n';
      worksheet[rateRef].z = '#,##0.00';
    }
  }
  
  // 3. Currency formatting on Total Rate and Net Payment formulas (using plain numbers)
  const totalRateRef = `G${totalRowIdx}`;
  if (worksheet[totalRateRef]) {
    worksheet[totalRateRef].t = 'n';
    worksheet[totalRateRef].z = '#,##0.00';
  }
  
  const netPaymentRef = `G${netPaymentRowIdx}`;
  if (worksheet[netPaymentRef]) {
    worksheet[netPaymentRef].t = 'n';
    worksheet[netPaymentRef].z = '#,##0.00';
  }

  // Auto-width adjustment for columns (iterating over all sheetData to prevent truncation)
  const maxColWidths = headers.map((h, i) => {
    let maxLen = h.length;
    sheetData.forEach(row => {
      if (!row || row[i] === undefined || row[i] === null) return;
      let valStr = '';
      if (typeof row[i] === 'object') {
        if (row[i].v !== undefined) {
          valStr = String(row[i].v);
        } else if (row[i].f !== undefined) {
          valStr = '123,456.78'; // estimated standard formatting length
        }
      } else {
        valStr = String(row[i]);
      }
      if (valStr.length > maxLen) maxLen = valStr.length;
    });
    return { wch: maxLen + 3 };
  });
  worksheet['!cols'] = maxColWidths;

  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Logistics Log');
  
  return newWorkbook;
}

// Trigger browser download of current Excel sheet
function downloadExcel() {
  if (appState.entries.length === 0) {
    showToast('warning', 'Add some entries before exporting.');
    return;
  }
  
  const wb = generateWorkbook();
  XLSX.writeFile(wb, appState.fileName);
  showToast('success', `Exported and downloaded ${appState.fileName}`);
}

// Toast Notifications Helper
function showToast(type, message) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Get matching icon name
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'warning') iconName = 'alert-triangle';
  if (type === 'danger') iconName = 'alert-octagon';
  
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i data-lucide="x"></i>
    </button>
  `;
  
  els.toastContainer.appendChild(toast);
  initializeLucide();
  
  // Auto-remove toast after 4.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}
  
