'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, MapPin, Briefcase, GraduationCap, ChevronDown, Heart } from 'lucide-react';
import { Profile } from '@/lib/mockData';
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Stack,
  Button,
  Paper
} from '@mui/material';

interface ProfileDetailViewProps {
  profile: Profile;
  onClose: () => void;
}

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({ profile, onClose }) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'white',
        overflowY: 'auto'
      }}
    >
      {/* Back Button */}
      <IconButton 
        onClick={onClose}
        sx={{ 
          position: 'absolute', 
          top: 24, 
          right: 24, 
          bgcolor: 'rgba(0,0,0,0.2)', 
          backdropFilter: 'blur(12px)', 
          color: 'white',
          zIndex: 10,
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.4)'
          }
        }}
      >
        <ChevronDown size={28} />
      </IconButton>

      {/* Image Gallery */}
      <Box sx={{ position: 'relative', height: '60vh', width: '100%' }}>
        <Image 
          src={profile.images[0]} 
          alt={profile.name}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          priority
        />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 4, background: 'linear-gradient(to top, white, rgba(255,255,255,0.4), transparent)' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
             <Typography variant="h3" fontWeight="900">
{profile.name}, {profile.age}
             </Typography>
             <Chip 
               label={profile.nationality}
               size="small"
               sx={{ 
                 px: 1, 
                 py: 0.5, 
                 fontSize: '0.625rem', 
                 fontWeight: 'bold', 
                 textTransform: 'uppercase', 
                 letterSpacing: '0.05em',
                 bgcolor: profile.nationality === 'Korean' ? 'blue.600' : 'red.600',
                 color: 'white'
               }}
             />
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <MapPin size={20} /> {profile.location}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 4, pb: 16 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 1.5, display: 'block' }}>
              About Me
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.125rem', lineHeight: 1.75, color: 'text.primary' }}>
              {profile.bio}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 1.5, display: 'block' }}>
              Interests
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.interests.map(interest => (
                <Chip 
                  key={interest} 
                  label={interest}
                  sx={{ px: 2, py: 1, bgcolor: 'grey.100', fontWeight: '600', fontSize: '0.875rem' }}
                />
              ))}
            </Box>
          </Box>

          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
              <Briefcase size={20} />
              <Typography fontWeight="medium">Software Engineer at TechSpace</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
              <GraduationCap size={20} />
              <Typography fontWeight="medium">Yonsei University</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
              <MapPin size={20} />
              <Typography fontWeight="medium">Lives in {profile.location.split(',')[0]}</Typography>
            </Stack>
          </Stack>

          <Box sx={{ pt: 2 }}>
            <Button 
              fullWidth
              variant="outlined"
              color="error"
              sx={{ 
                py: 2, 
                borderRadius: 4, 
                borderWidth: 1, 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              Report {profile.name.toUpperCase()}
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Fixed Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 3, background: 'linear-gradient(to top, white, rgba(255,255,255,0.9), transparent)', pointerEvents: 'none' }}>
        <Stack direction="row" justifyContent="center" spacing={3} sx={{ pointerEvents: 'auto' }}>
           <IconButton 
             sx={{ 
               p: 2, 
               bgcolor: 'white', 
               boxShadow: 8, 
               color: 'error.main',
               border: '1px solid',
               borderColor: 'grey.100',
               transform: 'scale(1.1)',
               '&:active': {
                 transform: 'scale(0.95)'
               }
             }}
           >
            <X size={32} strokeWidth={3} />
          </IconButton>
          <IconButton 
            sx={{ 
              p: 2, 
              background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)', 
              boxShadow: 8, 
              color: 'white',
              transform: 'scale(1.25)',
              '&:active': {
                transform: 'scale(0.95)'
              },
              '&:hover': {
                background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)'
              }
            }}
          >
            <Heart size={36} fill="currentColor" strokeWidth={0} />
          </IconButton>
        </Stack>
      </Box>
    </motion.div>
  );
};
