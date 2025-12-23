'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Box
} from '@mui/material';
import { 
  Zap, 
  Sun, 
  Moon, 
  Monitor
} from 'lucide-react';
import { useThemeContext } from '@/context/ThemeContext';

export const Header = () => {
  const { mode, setMode } = useThemeContext();

  const handleToggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  };

  const getThemeIcon = () => {
    switch (mode) {
      case 'light': return <Sun size={24} />;
      case 'dark': return <Moon size={24} />;
      case 'system': return <Monitor size={24} />;
      default: return <Sun size={24} />;
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" fontWeight="black" sx={{ color: 'primary.main', fontStyle: 'italic', letterSpacing: '-0.05em' }}>
          KO-JA Match
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <Zap size={24} />
            </IconButton>

            <IconButton 
              onClick={handleToggleTheme}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              {getThemeIcon()}
            </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
