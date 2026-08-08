import React from 'react';
import { Card, CardContent, Box, Typography, IconButton, Collapse, Divider, Button, Grid } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';

export default function LogCard({ entry, isExpanded, onToggleExpand, onDelete, formatCurrency }) {
  return (
    <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={onToggleExpand}>
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
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Challan No
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {entry.challanNo || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Gate No
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {entry.gateNo || '-'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Weight
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {entry.weight.toLocaleString()} kg
              </Typography>
            </Grid>
            <Grid item xs={6}>
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
                onDelete();
              }}
            >
              Delete Entry
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
