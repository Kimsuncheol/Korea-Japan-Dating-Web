import React from 'react';
import { Stack, IconButton } from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
} from '@mui/icons-material';

interface ActionButtonsProps {
  onSwipe: (direction: 'left' | 'right') => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSwipe }) => {
  return (
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ py: 4 }}>
      <IconButton 
        onClick={() => onSwipe('left')}
        sx={{ 
          p: 2, 
          bgcolor: 'white', 
          boxShadow: 8, 
          color: 'rose.500', 
          border: '1px solid', 
          borderColor: 'grey.100',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <CloseIcon sx={{ fontSize: 32, color: 'rose.500' }} />
      </IconButton>
      <IconButton 
        sx={{ 
          p: 1.5, 
          bgcolor: 'white', 
          boxShadow: 4, 
          color: 'amber.400', 
          border: '1px solid', 
          borderColor: 'grey.100',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <StarIcon sx={{ fontSize: 24, color: 'amber.400' }} />
      </IconButton>
      <IconButton 
        onClick={() => onSwipe('right')}
        sx={{ 
          p: 2, 
          bgcolor: 'white', 
          boxShadow: 8, 
          color: 'green.500', 
          border: '1px solid', 
          borderColor: 'grey.100',
          '&:hover': { transform: 'scale(1.1)', bgcolor: 'white' },
          '&:active': { transform: 'scale(0.95)' },
          transition: 'transform 0.2s'
        }}
      >
        <FavoriteIcon sx={{ fontSize: 32, color: 'green.500' }} />
      </IconButton>
    </Stack>
  );
};
