'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getMatches, getOtherUserId, Match } from '@/lib/matchService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, ChevronLeft } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Stack,
  CircularProgress
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

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadMatches();
  }, [user, router]);

  const loadMatches = async () => {
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
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 480, mx: 'auto' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={64} sx={{ color: 'primary.main' }} />
          <Typography color="text.secondary">Loading matches...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', maxWidth: 480, mx: 'auto', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'grey.200' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.200', backdropFilter: 'blur(12px)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 2, color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Matches
          </Typography>
          <Chip 
            label={matches.length} 
            size="small"
            sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 'bold' }}
          />
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, py: 3 }}>
        {matches.length === 0 ? (
          <Stack alignItems="center" spacing={3} sx={{ py: 10 }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                bgcolor: 'rose.50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart className="w-12 h-12 text-rose-300" size={48} />
            </Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              No matches yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center' }}>
              Keep swiping to find your perfect match!
            </Typography>
            <Button 
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ 
                mt: 3, 
                px: 4, 
                py: 1.5, 
                borderRadius: 10,
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Start Swiping
            </Button>
          </Stack>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => router.push(`/chat/${match.id}`)}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 1,
                    border: '1px solid',
                    borderColor: 'grey.100',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '1/1' }}>
                    <Image
                      src={match.otherUser.photos?.[0] || match.otherUser.photoURL || 'https://via.placeholder.com/200'}
                      alt={match.otherUser.displayName}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    {match.lastMessage && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                          p: 1.5
                        }}
                      >
                        <Typography variant="caption" color="white" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {match.lastMessage}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ px: 1.5, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {match.otherUser.displayName}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                      <MessageCircle size={12} className="text-slate-400" />
                      <Typography variant="caption" color="text.secondary">
                        {match.lastMessage ? 'Tap to chat' : 'Say hello!'}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
