'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { SwipeableCard } from './SwipeableCard';
import { ProfileDetailView } from './ProfileDetailView';
import { mockProfiles, Profile } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { createLike } from '@/lib/matchService';
import { getBlockedUsers } from '@/lib/safetyService';
import { Box, CircularProgress, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Imported Sub-components
import { ActionButtons } from './discovery/ActionButtons';
import { MatchOverlay } from './discovery/MatchOverlay';
import { BottomNav } from './discovery/BottomNav';
import { NoProfilesView } from './discovery/NoProfilesView';

export const DiscoveryScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matchShow, setMatchShow] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    if (!user) {
      setProfiles(mockProfiles);
      setLoading(false);
      return;
    }

    try {
      const blockedUsers = await getBlockedUsers(user.uid);
      const filteredProfiles = mockProfiles.filter(
        p => !blockedUsers.includes(p.id) && p.id !== user.uid
      );
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProfile = profiles[0];
    if (!currentProfile) return;

    if (direction === 'right' && user) {
      try {
        const result = await createLike(user.uid, currentProfile.id);
        
        if (result.matched) {
          setMatchedProfile(currentProfile);
          setMatchId(result.matchId || null);
          setMatchShow(true);
        }
      } catch (error) {
        console.error('Error creating like:', error);
      }
    }

    setProfiles(prev => prev.slice(1));
  };

  const handleRefresh = () => {
    loadProfiles();
  };

  const handleSendMessage = () => {
    if (matchId) {
      router.push(`/chat/${matchId}`);
    }
    setMatchShow(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', maxWidth: 480, mx: 'auto', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={64} sx={{ color: 'rose.100' }} />
          <Box sx={{ width: 128, height: 16, bgcolor: 'grey.100', borderRadius: 1 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: theme.palette.background.default, position: 'relative', overflow: 'hidden', height: '100%' }}>

      {/* Card Stack Area */}
      <Box component="main" sx={{ flex: 1, position: 'relative', px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '3/4' }}>
          <AnimatePresence>
            {profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <SwipeableCard
                  key={profile.id}
                  profile={profile}
                  isTop={index === 0}
                  onSwipe={handleSwipe}
                  onOpenDetail={() => setSelectedProfile(profile)}
                />
              )).reverse()
            ) : (
              <NoProfilesView onRefresh={handleRefresh} />
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Like/Dislike Buttons */}
      <ActionButtons onSwipe={handleSwipe} />

      {/* Bottom Nav */}
      <BottomNav />

      {/* Match Overlay */}
      <MatchOverlay 
        visible={matchShow}
        matchedProfile={matchedProfile}
        onSendMessage={handleSendMessage}
        onKeepSwiping={() => setMatchShow(false)}
      />

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileDetailView 
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

