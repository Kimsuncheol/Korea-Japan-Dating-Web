'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMatches, getOtherUserId, Match } from '@/lib/matchService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft } from 'lucide-react';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Chip
} from '@mui/material';

interface MatchWithProfile extends Match {
  otherUser: {
    id: string;
    displayName: string;
    photoURL?: string;
    photos?: string[];
  };
}

export default function MatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!user) return;
    
    try {
      const matchList = await getMatches(user.uid);
      
      // Fetch other user's profile for each match
      const matchesWithProfiles = await Promise.all(
        matchList.map(async (match) => {
          const otherUserId = getOtherUserId(match, user.uid);
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.data();
          
          return {
            ...match,
            otherUser: {
              id: otherUserId,
              displayName: userData?.displayName || 'Unknown',
              photoURL: userData?.photoURL,
              photos: userData?.photos
            }
          };
        })
      );
      
      setMatches(matchesWithProfiles);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadMatches();
  }, [user, router, loadMatches]);

  const handleRoomLeft = (matchId: string) => {
    setMatches(prev => prev.filter(match => match.id !== matchId));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', maxWidth: 480, mx: 'auto', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 2, color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Messages
          </Typography>
          <Chip 
            label={matches.length} 
            size="small"
            sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      {/* Chat Room List */}
      <ChatRoomList
        matches={matches}
        userId={user?.uid || ''}
        loading={loading}
        onRoomLeft={handleRoomLeft}
      />
    </Box>
  );
}
