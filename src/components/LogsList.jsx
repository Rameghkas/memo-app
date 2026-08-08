import React, { useState } from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import LogCard from './LogCard.jsx';
import { formatCurrency } from '../utils/formatters.js';

export default function LogsList({ entries, onDeleteEntry }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCardExpand = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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

  if (entries.length === 0) {
    return (
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
    );
  }

  return (
    <Stack spacing={1.5}>
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

      <Stack spacing={1.2}>
        {filteredEntries.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3, fontStyle: 'italic' }}>
            No matching records found.
          </Typography>
        ) : (
          filteredEntries.map((entry, index) => (
            <LogCard
              key={index}
              entry={entry}
              isExpanded={!!expandedCards[index]}
              onToggleExpand={() => toggleCardExpand(index)}
              onDelete={() => onDeleteEntry(index)}
              formatCurrency={formatCurrency}
            />
          ))
        )}
      </Stack>
    </Stack>
  );
}
