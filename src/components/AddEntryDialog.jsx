import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Button,
  IconButton,
  Typography,
  Stack,
  Box,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import ScaleIcon from '@mui/icons-material/Scale';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { CONFIG } from '../constants.js';
import { formatDateToDMY } from '../utils/formatters.js';

export default function AddEntryDialog({
  open,
  onClose,
  loadingLocations,
  unloadingLocations,
  onAddEntry,
  showToast,
  activeVehicle
}) {
  const [inputDate, setInputDate] = useState('');
  const [loading, setLoading] = useState('');
  const [unloading, setUnloading] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [gateNo, setGateNo] = useState('');

  useEffect(() => {
    if (open) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setInputDate(`${yyyy}-${mm}-${dd}`);
      
      setLoading('');
      setUnloading('');
      setWeight('');
      setRate('');
      setChallanNo('');
      setGateNo('');
    }
  }, [open]);

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

    onAddEntry(newEntry);

    // Reset inputs
    setLoading('');
    setUnloading('');
    setWeight('');
    setRate('');
    setChallanNo('');
    setGateNo('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Add Logistics Entry
          </Typography>
          {activeVehicle && (
            <Chip 
              label={activeVehicle} 
              size="small" 
              color="primary"
              sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
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
              placeholder="Max 20 characters"
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
              placeholder="Max 8 characters"
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
                  required
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
                  required
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
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 600 }}>
            Add Entry
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
