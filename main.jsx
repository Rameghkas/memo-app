import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Divider,
  Card,
  CardContent,
  Collapse,
  Snackbar,
  Alert,
  Stack,
  Grid
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import PercentIcon from '@mui/icons-material/Percent';
import ScaleIcon from '@mui/icons-material/Scale';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import PlaceIcon from '@mui/icons-material/Place';
import NavigationIcon from '@mui/icons-material/Navigation';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { CONFIG } from './constants.js';

function App() {
  const [entries, setEntries] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(CONFIG.loadingLocations);
  const [unloadingLocations, setUnloadingLocations] = useState(CONFIG.unloadingLocations);
  const [globalMargin, setGlobalMargin] = useState(0.0);
  const [fileName, setFileName] = useState(CONFIG.fileName);
  const [fileSize, setFileSize] = useState('');
  
  // Dialog visibility states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  
  // Search query for preview items
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form input states
  const [inputDate, setInputDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [loading, setLoading] = useState('');
  const [unloading, setUnloading] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [gateNo, setGateNo] = useState('');
  
  // Drag over dropzone state
  const [dragOver, setDragOver] = useState(false);
  
  // Toast alerts
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  
  // Expanded mobile cards tracker
  const [expandedCards, setExpandedCards] = useState({});
  
  // Theme dark mode setting
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };
  
  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };
  
  const toggleCardExpand = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addNewLocation = (loc) => {
    if (!loc) return;
    const trimmed = loc.trim();
    if (!trimmed) return;
    
    setLoadingLocations(prev => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    setUnloadingLocations(prev => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
  };

  // Helper formatting routines
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };
  
  const formatDateToDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };
  
  const formatExcelDate = (cellVal) => {
    if (!cellVal) return '';
    if (cellVal instanceof Date) {
      const dd = String(cellVal.getDate()).padStart(2, '0');
      const mm = String(cellVal.getMonth() + 1).padStart(2, '0');
      const yyyy = cellVal.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    if (typeof cellVal === 'number') {
      const date = new Date(Math.round((cellVal - 25569) * 86400 * 1000));
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    if (typeof cellVal === 'string') {
      if (cellVal.includes('-')) {
        const parts = cellVal.split('-');
        if (parts[0].length === 4) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
      return cellVal;
    }
    return String(cellVal);
  };

  // Parsing XLSX rows
  const parseImportedData = (matrix) => {
    const headers = matrix[0].map(h => String(h).trim().toLowerCase());
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
    const customLocations = [];
    
    for (let i = 1; i < matrix.length; i++) {
      const row = matrix[i];
      if (row.length === 0) continue;

      const dateValStr = String(row[0] || '').trim();
      const labelValStr = String(row[5] || '').trim();

      if ((row[0] === undefined || dateValStr === '') && 
          !labelValStr.toLowerCase().includes('total') && 
          !labelValStr.toLowerCase().includes('margin') && 
          !labelValStr.toLowerCase().includes('net')) {
        continue;
      }
      
      if (dateValStr.toLowerCase().includes('total') || 
          dateValStr.toLowerCase().includes('margin') || 
          dateValStr.toLowerCase().includes('net') ||
          labelValStr.toLowerCase().includes('total') || 
          labelValStr.toLowerCase().includes('margin') || 
          labelValStr.toLowerCase().includes('net')) {
          
        if (dateValStr.toLowerCase().includes('margin') || labelValStr.toLowerCase().includes('margin')) {
          const marginIdx = idx.rate !== -1 ? idx.rate : 6;
          const marginCell = row[marginIdx];
          if (typeof marginCell === 'number') {
            const parsedMarg = marginCell <= 1 ? marginCell * 100 : marginCell;
            setGlobalMargin(parsedMarg);
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

      if (loadingVal) customLocations.push(loadingVal);
      if (unloadingVal) customLocations.push(unloadingVal);

      parsedEntries.push(newEntry);
    }

    setEntries(parsedEntries);
    if (!foundMargin) {
      setGlobalMargin(0.0);
    }

    if (customLocations.length > 0) {
      setLoadingLocations(prev => Array.from(new Set([...prev, ...customLocations])).sort());
      setUnloadingLocations(prev => Array.from(new Set([...prev, ...customLocations])).sort());
    }

    if (duplicateCount > 0) {
      showToast('warning', `Skipped ${duplicateCount} duplicate entries found in the file.`);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };
  
  const handleFile = (file) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length > 0) {
          parseImportedData(rawData);
          showToast('success', `Loaded ${file.name} successfully!`);
        } else {
          setEntries([]);
          showToast('warning', 'The selected Excel file is empty.');
        }
      } catch (err) {
        console.error(err);
        showToast('error', 'Error reading Excel file. Make sure it is valid.');
      }
    };
  };

  const resetFile = () => {
    setEntries([]);
    setGlobalMargin(0.0);
    setFileName(CONFIG.fileName);
    setFileSize('');
    showToast('success', 'Workbook cleared. Starting fresh.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const loadingVal = loading.trim();
    const unloadingVal = unloading.trim();
    
    if (!loadingVal) {
      showToast('error', 'Please select or enter a loading location.');
      return;
    }
    if (!unloadingVal) {
      showToast('error', 'Please select or enter an unloading location.');
      return;
    }
    if (loadingVal === unloadingVal) {
      showToast('error', 'Loading and unloading locations cannot be the same.');
      return;
    }
    if (challanNo.trim().length > CONFIG.maxLengths.challanNo) {
      showToast('error', `Challan No must be at most ${CONFIG.maxLengths.challanNo} characters.`);
      return;
    }
    if (gateNo.trim().length > CONFIG.maxLengths.gateNo) {
      showToast('error', `Gate No must be at most ${CONFIG.maxLengths.gateNo} characters.`);
      return;
    }
    
    const newEntry = {
      date: formatDateToDMY(inputDate),
      challanNo: challanNo.trim(),
      gateNo: gateNo.trim(),
      loading: loadingVal,
      unloading: unloadingVal,
      weight: parseFloat(weight) || 0,
      rate: parseFloat(rate) || 0
    };

    const isDuplicate = entries.some(entry => {
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
      showToast('warning', 'This entry (same Challan No or details) already exists.');
      return;
    }

    addNewLocation(loadingVal);
    addNewLocation(unloadingVal);
    setEntries(prev => [...prev, newEntry]);
    
    // Reset fields
    setLoading('');
    setUnloading('');
    setWeight('');
    setRate('');
    setChallanNo('');
    setGateNo('');
    setOpenAddModal(false);
    
    showToast('success', 'Entry added to preview! Save to download the file.');
  };

  const deleteEntry = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
    showToast('success', 'Entry deleted.');
  };

  const downloadExcel = () => {
    if (entries.length === 0) {
      showToast('warning', 'Add some entries before exporting.');
      return;
    }
    
    const headers = [
      'Date', 
      'Challan No',
      'Gate No',
      'Loading Location', 
      'Unloading Location', 
      'Weight (Kilo)', 
      'Rate'
    ];
    
    const dataRows = entries.map(e => [
      e.date,
      e.challanNo || '',
      e.gateNo || '',
      e.loading,
      e.unloading,
      e.weight,
      e.rate
    ]);
    
    const sheetData = [headers, ...dataRows];
    
    const totalRowIdx = dataRows.length + 3; 
    const marginRowIdx = totalRowIdx + 1;
    const netPaymentRowIdx = marginRowIdx + 1;
    
    const totalRateVal = entries.reduce((sum, e) => sum + e.rate, 0);
    const netPaymentVal = totalRateVal - (totalRateVal * (globalMargin / 100));

    sheetData.push([]); 
    
    sheetData.push([
      '', '', '', '', '', 'Total',
      { f: `SUM(G2:G${dataRows.length + 1})`, v: totalRateVal }
    ]);
    
    sheetData.push([
      '', '', '', '', '', 'Global Margin %',
      globalMargin / 100
    ]);
    
    sheetData.push([
      '', '', '', '', '', 'Net Payment',
      { f: `G${totalRowIdx}*(1-G${marginRowIdx})`, v: netPaymentVal }
    ]);
    
    const worksheet = window.XLSX.utils.aoa_to_sheet(sheetData);
    
    const marginCellRef = `G${marginRowIdx}`;
    if (worksheet[marginCellRef]) {
      worksheet[marginCellRef].t = 'n';
      worksheet[marginCellRef].z = '0.0%';
    }
    
    for (let r = 2; r <= dataRows.length + 1; r++) {
      const rateRef = `G${r}`;
      if (worksheet[rateRef]) {
        worksheet[rateRef].t = 'n';
        worksheet[rateRef].z = '#,##0.00';
      }
    }
    
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

    const maxColWidths = headers.map((h, i) => {
      let maxLen = h.length;
      sheetData.forEach(row => {
        if (!row || row[i] === undefined || row[i] === null) return;
        let valStr = '';
        if (typeof row[i] === 'object') {
          if (row[i].v !== undefined) {
            valStr = String(row[i].v);
          } else if (row[i].f !== undefined) {
            valStr = '123,456.78'; 
          }
        } else {
          valStr = String(row[i]);
        }
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: maxLen + 3 };
    });
    worksheet['!cols'] = maxColWidths;

    const newWorkbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Logistics Log');
    window.XLSX.writeFile(newWorkbook, fileName);
    showToast('success', `Exported and downloaded ${fileName}`);
  };

  // State derived metric computations
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const totalRate = entries.reduce((sum, e) => sum + e.rate, 0);
  const netPayment = totalRate - (totalRate * (globalMargin / 100));

  const filteredEntries = entries.filter(entry => {
    const q = searchQuery.toLowerCase();
    return (
      entry.date.toLowerCase().includes(q) ||
      (entry.challanNo && entry.challanNo.toLowerCase().includes(q)) ||
      (entry.gateNo && entry.gateNo.toLowerCase().includes(q)) ||
      entry.loading.toLowerCase().includes(q) ||
      entry.unloading.toLowerCase().includes(q) ||
      String(entry.weight).includes(q) ||
      String(entry.rate).includes(q) ||
      formatCurrency(entry.rate).toLowerCase().includes(q)
    );
  });

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#eab308',
        dark: '#ca8a04',
        light: '#fde047',
      },
      secondary: {
        main: '#ca8a04',
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f8fafc',
        paper: isDarkMode ? '#1e293b' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ pb: { xs: 10, sm: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigation AppBar */}
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
          <Container maxWidth="xs" disableGutters>
            <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                    boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)',
                  }}
                >
                  <LocalShippingIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, fontSize: '1.15rem' }}>
                    LogiSheet Sync
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mobile-first logistics logs
                  </Typography>
                </Box>
              </Box>
              
              <IconButton onClick={() => setIsDarkMode(!isDarkMode)} color="inherit" size="small">
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Main Content Area */}
        <Container maxWidth="xs">
          <Stack spacing={2.5}>
            
            {/* Controls panel */}
            <Paper variant="outlined" sx={{ p: 2, display: { xs: 'none', sm: 'block' } }}>
              <Stack spacing={2}>
                <Box
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('desktop-file-input').click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: dragOver ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragOver ? 'rgba(234, 179, 8, 0.05)' : 'background.default',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(234, 179, 8, 0.02)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <input
                    type="file"
                    id="desktop-file-input"
                    style={{ display: 'none' }}
                    accept=".xlsx, .xls"
                    onChange={handleFileSelect}
                  />
                  <CloudUploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600}>
                    Upload Excel Sheet
                  </Typography>
                </Box>

                {fileSize && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'success.light', p: 1, borderRadius: 1, opacity: 0.85 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilePresentIcon color="success" size="small" />
                      <Typography variant="caption" fontWeight={500} color="text.primary" sx={{ maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {fileName} ({fileSize})
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={resetFile}>
                      <HighlightOffIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)} sx={{ fontWeight: 600 }}>
                    Add Entry
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<CalculateIcon />} onClick={() => setOpenSummaryModal(true)}>
                    Summary
                  </Button>
                </Stack>
                <Button variant="outlined" color="secondary" fullWidth startIcon={<GetAppIcon />} onClick={downloadExcel}>
                  Download Excel
                </Button>
              </Stack>
            </Paper>

            {/* Mobile File Info Panel */}
            {fileSize && (
              <Paper variant="outlined" sx={{ p: 1.5, display: { xs: 'flex', sm: 'none' }, alignItems: 'center', justifyContent: 'space-between', borderColor: 'success.main', bgcolor: 'rgba(16, 185, 129, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilePresentIcon color="success" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {fileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fileSize}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={resetFile} color="error">
                  <HighlightOffIcon />
                </IconButton>
              </Paper>
            )}

            {/* Logs List & Search */}
            {entries.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 6,
                  px: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  No logs preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
                  Import an Excel sheet or tap <strong>Add Entry</strong> to start recording transactions.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                
                {/* Search Text field */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }
                  }}
                />

                {/* Mobile listing cards */}
                <Stack spacing={1.2}>
                  {filteredEntries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3, fontStyle: 'italic' }}>
                      No matching records found.
                    </Typography>
                  ) : (
                    filteredEntries.map((entry, index) => {
                      const isExpanded = !!expandedCards[index];
                      return (
                        <Card key={index} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => toggleCardExpand(index)}>
                          <CardContent sx={{ p: '12px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={700}>
                                  {entry.date}
                                </Typography>
                                <Typography variant="caption" color="text.muted">•</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap sx={{ maxWidth: 90 }}>
                                    {entry.loading}
                                  </Typography>
                                  <LocalShippingIcon sx={{ fontSize: 12, color: 'text.muted' }} />
                                  <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap sx={{ maxWidth: 90 }}>
                                    {entry.unloading}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton size="small" disabled sx={{ color: 'text.secondary' }}>
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>
                            
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mt: 1.5 }}>
                              <Divider sx={{ mb: 1.5 }} />
                              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                <Grid size={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Challan No
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {entry.challanNo || '-'}
                                  </Typography>
                                </Grid>
                                <Grid size={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Gate No
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {entry.gateNo || '-'}
                                  </Typography>
                                </Grid>
                                <Grid size={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Weight
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {entry.weight.toLocaleString()} kg
                                  </Typography>
                                </Grid>
                                <Grid size={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Rate
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600} color="primary.dark">
                                    ₹ {formatCurrency(entry.rate)}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEntry(index);
                                  }}
                                >
                                  Delete Entry
                                </Button>
                              </Box>
                            </Collapse>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Container>

        {/* Modal Dialog for Add Entry */}
        <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="xs">
          <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Add Logistics Entry
            </Typography>
            <IconButton onClick={() => setOpenAddModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ py: 2 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    },
                    inputLabel: { shrink: true }
                  }}
                />
                
                <TextField
                  label="Challan No"
                  placeholder="Max 12 characters"
                  fullWidth
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <DescriptionIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }
                  }}
                />
                
                <TextField
                  label="Gate No"
                  placeholder="Max 4 characters"
                  fullWidth
                  value={gateNo}
                  onChange={(e) => setGateNo(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <DescriptionIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }
                  }}
                />

                <Autocomplete
                  freeSolo
                  options={loadingLocations.filter(loc => loc.toLowerCase() !== (unloading || '').trim().toLowerCase())}
                  value={loading}
                  onChange={(event, newValue) => setLoading(newValue || '')}
                  onInputChange={(event, newInputValue) => setLoading(newInputValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Loading Location"
                      fullWidth
                    />
                  )}
                />

                <Autocomplete
                  freeSolo
                  options={unloadingLocations.filter(loc => loc.toLowerCase() !== (loading || '').trim().toLowerCase())}
                  value={unloading}
                  onChange={(event, newValue) => setUnloading(newValue || '')}
                  onInputChange={(event, newInputValue) => setUnloading(newInputValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Unloading Location"
                      fullWidth
                    />
                  )}
                />

                <TextField
                  label="Weight (Kilo)"
                  type="number"
                  placeholder="0"
                  required
                  fullWidth
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <ScaleIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }
                  }}
                />

                <TextField
                  label="Rate"
                  type="number"
                  placeholder="0.00"
                  required
                  fullWidth
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: <CurrencyRupeeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                    }
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenAddModal(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
                Add Entry
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modal Dialog for Summary Details */}
        <Dialog open={openSummaryModal} onClose={() => setOpenSummaryModal(false)} fullWidth maxWidth="xs">
          <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Sheet Summary
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenSummaryModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Global Margin %"
                type="number"
                fullWidth
                value={globalMargin}
                onChange={(e) => setGlobalMargin(parseFloat(e.target.value) || 0)}
                slotProps={{
                  input: {
                    startAdornment: <PercentIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                  }
                }}
              />

              <Box sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'primary.light', background: 'linear-gradient(135deg, rgba(234,179,8,0.03), rgba(202,138,4,0.03))' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Weight:</Typography>
                    <Typography variant="body2" fontWeight={700}>{totalWeight.toLocaleString()} kg</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Rate:</Typography>
                    <Typography variant="body2" fontWeight={700}>₹ {formatCurrency(totalRate)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                    <Typography variant="body1" fontWeight={700} color="primary.dark">Net Payment:</Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.dark">₹ {formatCurrency(netPayment)}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenSummaryModal(false)} variant="contained" sx={{ fontWeight: 600 }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sticky Mobile Navigation Bottom Bar */}
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'space-around',
            alignItems: 'center',
            py: 1,
            zIndex: 1000,
            borderRadius: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* File input click hook */}
          <input
            type="file"
            id="mobile-file-input"
            style={{ display: 'none' }}
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
          />
          <Button
            onClick={() => document.getElementById('mobile-file-input').click()}
            sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', minWidth: 64 }}
          >
            <CloudUploadIcon fontSize="small" />
            Upload
          </Button>
          <Button
            onClick={() => setOpenAddModal(true)}
            sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'primary.main', fontWeight: 700, minWidth: 64 }}
          >
            <AddIcon fontSize="small" />
            Add Entry
          </Button>
          <Button
            onClick={() => setOpenSummaryModal(true)}
            sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', minWidth: 64 }}
          >
            <CalculateIcon fontSize="small" />
            Summary
          </Button>
          <Button
            onClick={downloadExcel}
            sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', minWidth: 64 }}
          >
            <GetAppIcon fontSize="small" />
            Download
          </Button>
        </Paper>

        {/* Toaster alerts */}
        <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleCloseToast} severity={toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'success'} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}

// React 19 root bootstrap mounting
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
