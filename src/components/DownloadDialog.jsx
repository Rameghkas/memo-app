import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';

const monthsList = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

export default function DownloadDialog({ open, onClose, entries, onDownload, showToast, activeVehicle }) {
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(new Date().getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);

  useEffect(() => {
    if (open) {
      const today = new Date();
      const mStr = String(today.getMonth() + 1).padStart(2, '0');
      const yStr = String(today.getFullYear());
      setSelectedMonth(mStr);
      setSelectedYear(yStr);
    }
  }, [open]);

  // Extract years dynamically from entries to populate the year dropdown, fallback to current year
  const availableYears = React.useMemo(() => {
    const years = new Set();
    years.add(currentYearStr); // Always include current year
    
    entries.forEach(e => {
      const parts = e.date.split('/');
      if (parts.length === 3) {
        years.add(parts[2]);
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Descending order
  }, [entries, currentYearStr]);

  const handleDownloadClick = () => {
    // Check if there is data for the selected month, year, and active vehicle
    const matchingEntries = entries.filter(e => {
      const parts = e.date.split('/');
      if (parts.length === 3) {
        const entryVehicle = e.vehicle;
        return parts[1] === selectedMonth && parts[2] === selectedYear && entryVehicle === activeVehicle;
      }
      return false;
    });

    if (matchingEntries.length === 0) {
      const monthLabel = monthsList.find(m => m.value === selectedMonth)?.label || selectedMonth;
      showToast('warning', `No entries found for ${activeVehicle} in ${monthLabel} ${selectedYear}.`);
      return;
    }

    onDownload(selectedMonth, selectedYear);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GetAppIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Download Data
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Select the Month and Year of the entries you want to export to Excel:
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel id="select-month-label">Month</InputLabel>
            <Select
              labelId="select-month-label"
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthsList.map(month => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="select-year-label">Year</InputLabel>
            <Select
              labelId="select-year-label"
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleDownloadClick} variant="contained" sx={{ fontWeight: 600 }}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
