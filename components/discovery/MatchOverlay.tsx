import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { Profile } from '@/lib/mockData';
import { useTheme } from '@mui/material/styles';

interface MatchOverlayProps {
  visible: boolean;
  matchedProfile: Profile | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({ 
  visible, 
  matchedProfile, 
  onSendMessage, 
  onKeepSwiping 
}) => {
  const theme = useTheme();

  return (
    <AnimatePresence>
      {visible && matchedProfile && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ color: '#ec4899', marginBottom: 24 }}
          >
            <FavoriteIcon sx={{ fontSize: 80, backgroundColor: theme.palette.primary.main }} />
          </motion.div>
          <Typography variant="h2" fontWeight="black" sx={{ fontStyle: 'italic', letterSpacing: '-0.05em', mb: 1 }}>
            IT&apos;S A MATCH!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, mb: 2 }}>
            You and {matchedProfile.name} liked each other!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Avatar 
              src={matchedProfile.images[0]} 
              alt={matchedProfile.name}
              sx={{ width: 80, height: 80, border: '4px solid #ec4899' }}
            />
          </Box>
          <Button 
            onClick={onSendMessage}
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              py: 2, 
              borderRadius: 10, 
              background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)', 
              fontWeight: 'bold', 
              fontSize: '1.125rem',
              textTransform: 'none',
              boxShadow: 8,
              mb: 2
            }}
          >
            Send a Message
          </Button>
          <Button 
            onClick={onKeepSwiping}
            variant="outlined"
            sx={{ px: 4, py: 1.5, border: '2px solid white', borderRadius: 10, color: 'white', fontWeight: 'bold', textTransform: 'none' }}
          >
            Keep Swiping
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
