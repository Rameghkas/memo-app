import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Container } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function Header({ isDarkMode, onToggleTheme }) {
  return (
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
          
          <IconButton onClick={onToggleTheme} color="inherit" size="small">
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
