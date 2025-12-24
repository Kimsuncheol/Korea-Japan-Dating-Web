import React from 'react';
import { Stack, IconButton } from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ActionButtonsProps {
  onSwipe: (direction: 'left' | 'right') => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSwipe }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ py: 4 }}>
      <IconButton 
        onClick={() => onSwipe('left')}
        sx={{ 
          p: 2, 
          bgcolor: 'white', 
          boxShadow: 8, 
          color: theme.palette.error.main, 
          border: '1px solid', 
          borderColor: '#f5f5f5',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <CloseIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
      </IconButton>
      <IconButton 
        sx={{ 
          p: 1.5, 
          bgcolor: 'white', 
          boxShadow: 4, 
          color: theme.palette.warning.main, 
          border: '1px solid', 
          borderColor: '#f5f5f5',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <StarIcon sx={{ fontSize: 24, color: theme.palette.warning.main }} />
      </IconButton>
      <IconButton 
        onClick={() => onSwipe('right')}
        sx={{ 
          p: 2, 
          bgcolor: 'white', 
          boxShadow: 8, 
          color: theme.palette.success.main, 
          border: '1px solid', 
          borderColor: '#f5f5f5',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <FavoriteIcon sx={{ fontSize: 32, color: theme.palette.success.main }} />
      </IconButton>
    </Stack>
  );
};
