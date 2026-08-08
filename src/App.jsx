import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Snackbar, Alert, Stack } from '@mui/material';
import Header from './components/Header.jsx';
import ToolbarPanel from './components/ToolbarPanel.jsx';
import LogsList from './components/LogsList.jsx';
import MobileBottomBar from './components/MobileBottomBar.jsx';
import AddEntryDialog from './components/AddEntryDialog.jsx';
import SummaryDialog from './components/SummaryDialog.jsx';
import DownloadDialog from './components/DownloadDialog.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { parseExcelFile, generateExcelWorkbook } from './utils/excel.js';
import { CONFIG, VEHICLES } from './constants.js';

export default function App() {
  const [entries, setEntries] = useLocalStorage('logistics_entries', []);
  const [globalMargin, setGlobalMargin] = useLocalStorage('logistics_margin', 0.0);
  
  const [activeVehicle, setActiveVehicle] = useLocalStorage('active_vehicle', '');
  
  const [loadingLocations, setLoadingLocations] = useState(CONFIG.loadingLocations);
  const [unloadingLocations, setUnloadingLocations] = useState(CONFIG.unloadingLocations);
  const [fileName, setFileName] = useState(CONFIG.fileName);
  const [fileSize, setFileSize] = useState('');
  
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openSummaryModal, setOpenSummaryModal] = useState(false);
  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });
  
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

  // Harvest custom locations from loaded entries on startup
  useEffect(() => {
    if (entries.length > 0) {
      const customLocs = [];
      entries.forEach(e => {
        if (e.loading) customLocs.push(e.loading);
        if (e.unloading) customLocs.push(e.unloading);
      });
      if (customLocs.length > 0) {
        const uniqueLocs = Array.from(new Set(customLocs));
        setLoadingLocations(prev => Array.from(new Set([...prev, ...uniqueLocs])).sort());
        setUnloadingLocations(prev => Array.from(new Set([...prev, ...uniqueLocs])).sort());
      }
    }
  }, []);

  const handleFileLoaded = (file) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    
    parseExcelFile(
      file,
      (rawData) => {
        const headers = rawData[0].map(h => String(h).trim().toLowerCase());
        const idx = {
          date: headers.findIndex(h => h.includes('date')),
          challanNo: headers.findIndex(h => h.includes('challan')),
          gateNo: headers.findIndex(h => h.includes('gate')),
          vehicle: headers.findIndex(h => h.includes('vehicle') || h.includes('vehical')),
          loading: headers.findIndex(h => h.includes('loading')),
          unloading: headers.findIndex(h => h.includes('unloading')),
          weight: headers.findIndex(h => h.includes('weight') || h.includes('kilo') || h.includes('kg')),
          rate: headers.findIndex(h => h.includes('rate') && !h.includes('total'))
        };

        const parsedEntries = [];
        let foundMargin = false;
        let duplicateCount = 0;
        const customLocations = [];
        
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
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

          const formatExcelDateLocal = (cellVal) => {
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

          const dateVal = idx.date !== -1 ? formatExcelDateLocal(row[idx.date]) : '';
          const challanNoVal = idx.challanNo !== -1 ? String(row[idx.challanNo] || '').trim().substring(0, CONFIG.maxLengths.challanNo) : '';
          const gateNoVal = idx.gateNo !== -1 ? String(row[idx.gateNo] || '').trim().substring(0, CONFIG.maxLengths.gateNo) : '';
          const vehicleVal = idx.vehicle !== -1 ? String(row[idx.vehicle] || '').trim() : '';
          const loadingVal = idx.loading !== -1 ? String(row[idx.loading] || '') : '';
          const unloadingVal = idx.unloading !== -1 ? String(row[idx.unloading] || '') : '';
          const weightVal = idx.weight !== -1 ? parseFloat(row[idx.weight]) || 0 : 0;
          const rateVal = idx.rate !== -1 ? parseFloat(row[idx.rate]) || 0 : 0;

          const newEntry = {
            date: dateVal,
            challanNo: challanNoVal,
            gateNo: gateNoVal,
            vehicle: vehicleVal || activeVehicle || 'UNKNOWN',
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
          const uniqueCustoms = Array.from(new Set(customLocations));
          setLoadingLocations(prev => Array.from(new Set([...prev, ...uniqueCustoms])).sort());
          setUnloadingLocations(prev => Array.from(new Set([...prev, ...uniqueCustoms])).sort());
        }

        showToast('success', `Loaded ${file.name} successfully!`);
        if (duplicateCount > 0) {
          showToast('warning', `Skipped ${duplicateCount} duplicate entries found in the file.`);
        }
      },
      (err) => {
        showToast('error', 'Error reading Excel file. Make sure it is valid.');
      }
    );
  };

  const handleResetFile = () => {
    setEntries([]);
    setGlobalMargin(0.0);
    setFileName(CONFIG.fileName);
    setFileSize('');
    showToast('success', 'Workbook cleared. Starting fresh.');
  };

  const handleAddEntry = (newEntry) => {
    const entryWithVehicle = {
      ...newEntry,
      vehicle: activeVehicle
    };

    const isDuplicate = entries.some(entry => {
      const entryVehicle = entry.vehicle;
      if (entryWithVehicle.challanNo && entry.challanNo && 
          entryWithVehicle.challanNo.toLowerCase() === entry.challanNo.toLowerCase() &&
          entryVehicle === activeVehicle) {
        return true;
      }
      return (
        entry.date === entryWithVehicle.date &&
        entry.loading === entryWithVehicle.loading &&
        entry.unloading === entryWithVehicle.unloading &&
        entry.weight === entryWithVehicle.weight &&
        entry.rate === entryWithVehicle.rate &&
        entry.challanNo.toLowerCase() === entryWithVehicle.challanNo.toLowerCase() &&
        entry.gateNo.toLowerCase() === entryWithVehicle.gateNo.toLowerCase() &&
        entryVehicle === activeVehicle
      );
    });

    if (isDuplicate) {
      showToast('warning', 'This entry (same Challan No or details) already exists for this vehicle.');
      return;
    }

    const loadingVal = newEntry.loading;
    const unloadingVal = newEntry.unloading;
    
    setLoadingLocations(prev => {
      if (!prev.includes(loadingVal)) return [...prev, loadingVal].sort();
      return prev;
    });
    setUnloadingLocations(prev => {
      if (!prev.includes(unloadingVal)) return [...prev, unloadingVal].sort();
      return prev;
    });

    setEntries(prev => [...prev, entryWithVehicle]);
    setOpenAddModal(false);
    showToast('success', 'Entry added successfully!');
  };

  const handleDeleteEntry = (index) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
    showToast('success', 'Entry deleted.');
  };

  const handleOpenAddModal = () => {
    if (!activeVehicle) {
      showToast('error', 'Please select an active vehicle in the header first.');
      return;
    }
    setOpenAddModal(true);
  };

  const handleOpenDownloadModal = () => {
    if (!activeVehicle) {
      showToast('error', 'Please select an active vehicle in the header first.');
      return;
    }
    setOpenDownloadModal(true);
  };

  const handleDownloadExcel = (month, year) => {
    if (!activeVehicle) {
      showToast('error', 'Please select an active vehicle in the header first.');
      return;
    }

    const filtered = entries.filter(e => {
      const parts = e.date.split('/');
      if (parts.length === 3) {
        const entryVehicle = e.vehicle || 'MH14AK5690';
        return parts[1] === month && parts[2] === year && entryVehicle === activeVehicle;
      }
      return false;
    });

    if (filtered.length === 0) {
      showToast('warning', `No entries found for ${activeVehicle} in the selected month and year.`);
      return;
    }

    const monthNames = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    const monthName = monthNames[month];
    const year2digit = year.substring(2);
    const dynamicFileName = `${monthName}_${year2digit}_${activeVehicle}.xlsx`;

    generateExcelWorkbook(
      filtered,
      globalMargin,
      dynamicFileName,
      activeVehicle,
      (name) => showToast('success', `Exported and downloaded ${name}`),
      (err) => showToast('error', 'Error generating workbook.')
    );
  };

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
        <Header 
          isDarkMode={isDarkMode} 
          onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
          vehicles={VEHICLES}
          activeVehicle={activeVehicle}
          onVehicleChange={setActiveVehicle}
        />
        
        <Container maxWidth="xs">
          <Stack spacing={2.5}>
            <ToolbarPanel
              fileName={fileName}
              fileSize={fileSize}
              onFileLoaded={handleFileLoaded}
              onResetFile={handleResetFile}
              onOpenAddModal={handleOpenAddModal}
              onOpenSummaryModal={() => setOpenSummaryModal(true)}
              onDownloadExcel={handleOpenDownloadModal}
            />

            <LogsList
              entries={entries}
              onDeleteEntry={handleDeleteEntry}
            />
          </Stack>
        </Container>

        <AddEntryDialog
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          loadingLocations={loadingLocations}
          unloadingLocations={unloadingLocations}
          onAddEntry={handleAddEntry}
          showToast={showToast}
          activeVehicle={activeVehicle}
        />

        <SummaryDialog
          open={openSummaryModal}
          onClose={() => setOpenSummaryModal(false)}
          entries={entries}
          globalMargin={globalMargin}
          onMarginChange={setGlobalMargin}
        />

        <DownloadDialog
          open={openDownloadModal}
          onClose={() => setOpenDownloadModal(false)}
          entries={entries}
          onDownload={handleDownloadExcel}
          showToast={showToast}
          activeVehicle={activeVehicle}
        />

        <MobileBottomBar
          onFileLoaded={handleFileLoaded}
          onOpenAddModal={handleOpenAddModal}
          onOpenSummaryModal={() => setOpenSummaryModal(true)}
          onDownloadExcel={handleOpenDownloadModal}
        />

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'success'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
