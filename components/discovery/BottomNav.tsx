import React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
  FlashOn as FlashOnIcon,
  ChatBubble as ChatBubbleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const BottomNav: React.FC = () => {
  const router = useRouter();

  return (
    <Paper elevation={3} sx={{ borderTop: '1px solid', borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
      <BottomNavigation showLabels={false}>
        <BottomNavigationAction icon={<FlashOnIcon sx={{ fontSize: 24 }} />} sx={{ color: 'primary.main', minWidth: 0 }} />
        <BottomNavigationAction 
          icon={<ChatBubbleIcon sx={{ fontSize: 24 }} />} 
          onClick={() => router.push('/matches')}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, minWidth: 0 }} 
        />
        <BottomNavigationAction 
          icon={<PersonIcon sx={{ fontSize: 24 }} />} 
          onClick={() => router.push('/profile/edit')}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, minWidth: 0 }} 
        />
        <BottomNavigationAction 
          icon={<SettingsIcon sx={{ fontSize: 24 }} />} 
          onClick={() => router.push('/settings')}
          sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, minWidth: 0 }} 
        />
      </BottomNavigation>
    </Paper>
  );
};
