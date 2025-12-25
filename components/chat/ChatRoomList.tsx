'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { Heart } from 'lucide-react';
import { ChatRoomItem } from './ChatRoomItem';
import { Match } from '@/lib/matchService';
import { 
  ChatRoomSettings, 
  getAllRoomSettings, 
  pinRoom, 
  unpinRoom, 
  toggleRoomAlert, 
  leaveRoom 
} from '@/lib/chatRoomService';

interface MatchWithProfile extends Match {
  otherUser: {
    id: string;
    displayName: string;
    photoURL?: string;
    photos?: string[];
  };
}

interface ChatRoomListProps {
  matches: MatchWithProfile[];
  userId: string;
  loading: boolean;
  onRoomLeft: (matchId: string) => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  matches,
  userId,
  loading,
  onRoomLeft
}) => {
  const [roomSettings, setRoomSettings] = useState<Record<string, ChatRoomSettings>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAllSettings();
    }
  }, [userId]);

  const loadAllSettings = async () => {
    try {
      const settings = await getAllRoomSettings(userId);
      setRoomSettings(settings);
    } catch (error) {
      console.error('Error loading room settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handlePin = async (matchId: string, shouldPin: boolean) => {
    try {
      if (shouldPin) {
        await pinRoom(userId, matchId);
      } else {
        await unpinRoom(userId, matchId);
      }
      
      setRoomSettings(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          pinned: shouldPin,
          alertsEnabled: prev[matchId]?.alertsEnabled ?? true,
          pinnedAt: shouldPin ? new Date().toISOString() : undefined
        }
      }));
    } catch (error) {
      console.error('Error pinning/unpinning room:', error);
    }
  };

  const handleToggleAlert = async (matchId: string, enabled: boolean) => {
    try {
      await toggleRoomAlert(userId, matchId, enabled);
      
      setRoomSettings(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          pinned: prev[matchId]?.pinned ?? false,
          alertsEnabled: enabled
        }
      }));
    } catch (error) {
      console.error('Error toggling room alerts:', error);
    }
  };

  const handleLeave = async (matchId: string) => {
    try {
      await leaveRoom(matchId);
      onRoomLeft(matchId);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const getSettings = (matchId: string): ChatRoomSettings => {
    return roomSettings[matchId] || { pinned: false, alertsEnabled: true };
  };

  // Sort matches: pinned first, then by last message timestamp
  const sortedMatches = [...matches].sort((a, b) => {
    const settingsA = getSettings(a.id);
    const settingsB = getSettings(b.id);
    
    // Pinned items first
    if (settingsA.pinned && !settingsB.pinned) return -1;
    if (!settingsA.pinned && settingsB.pinned) return 1;
    
    // Then by last message timestamp
    const timeA = a.lastMessageAt?.toDate?.()?.getTime() || 0;
    const timeB = b.lastMessageAt?.toDate?.()?.getTime() || 0;
    return timeB - timeA;
  });

  if (loading || loadingSettings) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} sx={{ color: 'primary.main' }} />
          <Typography color="text.secondary">Loading conversations...</Typography>
        </Stack>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Stack alignItems="center" spacing={3} sx={{ py: 10, px: 3 }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            bgcolor: 'primary.light',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Heart size={48} style={{ color: '#ec4899' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          No matches yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
          Keep swiping to find your perfect match! Your conversations will appear here.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      {sortedMatches.map((match) => (
        <ChatRoomItem
          key={match.id}
          match={match}
          settings={getSettings(match.id)}
          onPin={handlePin}
          onToggleAlert={handleToggleAlert}
          onLeave={handleLeave}
        />
      ))}
    </Box>
  );
};
