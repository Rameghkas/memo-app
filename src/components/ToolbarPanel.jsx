import React, { useState } from 'react';
import { Paper, Box, Typography, Stack, Button, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetAppIcon from '@mui/icons-material/GetApp';

export default function ToolbarPanel({
  fileName,
  fileSize,
  onFileLoaded,
  onResetFile,
  onOpenAddModal,
  onOpenSummaryModal,
  onDownloadExcel
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onFileLoaded(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, display: { xs: 'none', sm: 'block' } }}>
      <Stack spacing={2}>
        {/* Dropzone container */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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

        {/* File detail badge */}
        {fileSize && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'success.light',
              p: 1,
              borderRadius: 1,
              opacity: 0.85,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilePresentIcon color="success" fontSize="small" />
              <Typography
                variant="caption"
                fontWeight={500}
                color="text.primary"
                sx={{ maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                {fileName} ({fileSize})
              </Typography>
            </Box>
            <IconButton size="small" onClick={onResetFile} color="inherit">
              <HighlightOffIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onOpenAddModal}
            sx={{ fontWeight: 600 }}
          >
            Add Entry
          </Button>
          <Button variant="outlined" fullWidth startIcon={<CalculateIcon />} onClick={onOpenSummaryModal}>
            Summary
          </Button>
        </Stack>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<GetAppIcon />}
          onClick={onDownloadExcel}
        >
          Download Excel
        </Button>
      </Stack>
    </Paper>
  );
}
