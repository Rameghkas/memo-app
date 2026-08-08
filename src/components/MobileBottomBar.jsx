import React from 'react';
import { Paper, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import GetAppIcon from '@mui/icons-material/GetApp';

export default function MobileBottomBar({
  onFileLoaded,
  onOpenAddModal,
  onOpenSummaryModal,
  onDownloadExcel
}) {
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
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
        onClick={onOpenAddModal}
        sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'primary.main', fontWeight: 700, minWidth: 64 }}
      >
        <AddIcon fontSize="small" />
        Add Entry
      </Button>
      <Button
        onClick={onOpenSummaryModal}
        sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', minWidth: 64 }}
      >
        <CalculateIcon fontSize="small" />
        Summary
      </Button>
      <Button
        onClick={onDownloadExcel}
        sx={{ flexDirection: 'column', fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', minWidth: 64 }}
      >
        <GetAppIcon fontSize="small" />
        Download
      </Button>
    </Paper>
  );
}
