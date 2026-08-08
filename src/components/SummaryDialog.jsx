import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalculateIcon from '@mui/icons-material/Calculate';
import PercentIcon from '@mui/icons-material/Percent';
import { formatCurrency } from '../utils/formatters.js';

export default function SummaryDialog({
  open,
  onClose,
  entries,
  globalMargin,
  onMarginChange
}) {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const totalRate = entries.reduce((sum, e) => sum + e.rate, 0);
  const netPayment = totalRate - (totalRate * (globalMargin / 100));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Sheet Summary
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
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
            onChange={(e) => onMarginChange(parseFloat(e.target.value) || 0)}
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
        <Button onClick={onClose} variant="contained" sx={{ fontWeight: 600 }}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
