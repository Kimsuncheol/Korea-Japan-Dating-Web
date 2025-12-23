import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

interface NoProfilesViewProps {
  onRefresh: () => void;
}

export const NoProfilesView: React.FC<NoProfilesViewProps> = ({ onRefresh }) => {
  return (
    <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 6, border: '1px solid', borderColor: 'grey.100' }}>
      <Box sx={{ width: 80, height: 80, bgcolor: 'grey.100', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <PersonIcon sx={{ fontSize: 40, color: 'grey.400' }} />
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>No more profiles!</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Check back later or expand your search.
      </Typography>
      <Button 
        onClick={onRefresh}
        variant="contained"
        sx={{ 
          mt: 3, 
          px: 4, 
          py: 1.5, 
          borderRadius: 10, 
          background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)',
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: 4
        }}
      >
        Refresh
      </Button>
    </Paper>
  );
};
