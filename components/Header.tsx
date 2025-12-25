'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Box
} from '@mui/material';
import { 
  Zap, 
  Settings
} from 'lucide-react';

export const Header = () => {
  const router = useRouter();

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
              onClick={() => router.push('/settings')}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <Settings size={24} />
            </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
