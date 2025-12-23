'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getMatch, getOtherUserId, unmatch } from '@/lib/matchService';
import { 
  subscribeToMessages, 
  sendMessage, 
  Message, 
  isChatAccessible,
  uploadChatImage,
  translateMessage
} from '@/lib/chatService';
import { blockUser, reportUser, REPORT_CATEGORIES, ReportCategory } from '@/lib/safetyService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Send, 
  MoreVertical, 
  Flag, 
  Ban, 
  UserX,
  Image as ImageIcon,
  Languages,
  X
} from 'lucide-react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  Stack
} from '@mui/material';

interface OtherUser {
  id: string;
  displayName: string;
  photoURL?: string;
  photos?: string[];
}

export default function ChatPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>('other');
  const [reportDescription, setReportDescription] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadChatData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if chat is accessible
      const accessible = await isChatAccessible(matchId, user.uid);
      if (!accessible) {
        router.push('/matches');
        return;
      }
      
      // Get match and other user info
      const match = await getMatch(matchId);
      if (!match) {
        router.push('/matches');
        return;
      }
      
      const otherUserId = getOtherUserId(match, user.uid);
      const userDoc = await getDoc(doc(db, 'users', otherUserId));
      const userData = userDoc.data();
      
      setOtherUser({
        id: otherUserId,
        displayName: userData?.displayName || 'Unknown',
        photoURL: userData?.photoURL,
        photos: userData?.photos
      });
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  }, [user, matchId, router]);

  useEffect(() => {
    if (!user || !matchId) return;
    
    loadChatData();
  }, [user, matchId, loadChatData]);

  useEffect(() => {
    if (!user || !matchId) return;
    
    const subscription = subscribeToMessages(matchId, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });
    
    return () => subscription.unsubscribe();
  }, [user, matchId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    
    setSending(true);
    try {
      await sendMessage(matchId, user.uid, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    
    setSending(true);
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadChatImage(matchId, user.uid, file);
      await sendMessage(matchId, user.uid, '📷 Photo', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTranslate = async (messageId: string, text: string) => {
    const translated = await translateMessage(text, 'en');
    setMessages(msgs => msgs.map(m => 
      m.id === messageId ? { ...m, translatedText: translated } : m
    ));
  };

  const handleBlock = async () => {
    if (!user || !otherUser) return;
    
    if (confirm(`Block ${otherUser.displayName}? They won't be able to contact you.`)) {
      await blockUser(user.uid, otherUser.id);
      await unmatch(matchId);
      router.push('/matches');
    }
    setAnchorEl(null);
  };

  const handleUnmatch = async () => {
    if (!otherUser) return;
    
    if (confirm(`Unmatch with ${otherUser.displayName}? This cannot be undone.`)) {
      await unmatch(matchId);
      router.push('/matches');
    }
    setAnchorEl(null);
  };

  const handleReport = async () => {
    if (!user || !otherUser) return;
    
    try {
      await reportUser(
        user.uid,
        otherUser.id,
        reportCategory,
        reportDescription,
        'chat',
        matchId
      );
      setShowReportModal(false);
      alert('Report submitted. We will review it shortly.');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Loading chat...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.push('/matches')} sx={{ mr: 2, color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          <Avatar 
            src={otherUser?.photos?.[0] || otherUser?.photoURL}
            alt={otherUser?.displayName}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: 'text.primary' }}>
            {otherUser?.displayName}
          </Typography>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
            <MoreVertical size={20} />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: { borderRadius: 3, mt: 1, minWidth: 200 }
            }}
          >
            <MenuItem onClick={() => { setShowReportModal(true); setAnchorEl(null); }}>
              <ListItemIcon><Flag size={18} /></ListItemIcon>
              <ListItemText>Report</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleBlock}>
              <ListItemIcon><Ban size={18} /></ListItemIcon>
              <ListItemText>Block</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUnmatch} sx={{ color: 'error.main' }}>
              <ListItemIcon><UserX size={18} color="currentColor" /></ListItemIcon>
              <ListItemText>Unmatch</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <Typography>Say hello to start the conversation!</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {messages.map((message) => {
              const isOwn = message.senderId === user?.uid;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        maxWidth: '75%',
                        px: 2,
                        py: 1.5,
                        borderRadius: 4,
                        ...(isOwn ? {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderBottomRightRadius: 4
                        } : {
                          bgcolor: 'white',
                          color: 'text.primary',
                          borderBottomLeftRadius: 4,
                          boxShadow: 1
                        })
                      }}
                    >
                      {message.imageUrl && (
                        <Box sx={{ mb: 1, borderRadius: 2, overflow: 'hidden', position: 'relative', width: '100%', maxWidth: 250, aspectRatio: '4/3' }}>
                          <Image 
                            src={message.imageUrl} 
                            alt="Shared image"
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                      <Typography variant="body2">{message.text}</Typography>
                      {message.translatedText && (
                        <Typography variant="caption" sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid', borderColor: isOwn ? 'rgba(255,255,255,0.2)' : 'grey.200', display: 'block', opacity: 0.8 }}>
                          {message.translatedText}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                  {!isOwn && !message.translatedText && (
                    <Button 
                      size="small"
                      onClick={() => handleTranslate(message.id, message.text)}
                      startIcon={<Languages size={12} />}
                      sx={{ mt: 0.5, fontSize: '0.75rem', textTransform: 'none', color: 'text.secondary' }}
                    >
                      Translate
                    </Button>
                  )}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: 'text.secondary' }}>
            <ImageIcon size={24} />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                bgcolor: 'grey.100'
              }
            }}
          />
          <IconButton 
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'grey.300' } }}
          >
            <Send size={20} />
          </IconButton>
        </Stack>
      </Paper>

      {/* Report Modal */}
      <Dialog open={showReportModal} onClose={() => setShowReportModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Report User</Typography>
          <IconButton onClick={() => setShowReportModal(false)} size="small">
            <X size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>Category</FormLabel>
              <RadioGroup
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value as ReportCategory)}
              >
                {REPORT_CATEGORIES.map((cat) => (
                  <FormControlLabel 
                    key={cat.value} 
                    value={cat.value} 
                    control={<Radio />} 
                    label={cat.label}
                    sx={{ 
                      py: 1, 
                      px: 1.5, 
                      border: '1px solid', 
                      borderColor: 'grey.200', 
                      borderRadius: 3, 
                      mb: 1,
                      '&:hover': { bgcolor: 'grey.50' }
                    }}
                  />
                ))}
              </RadioGroup>
            </Box>
            
            <Box>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1 }}>Description</FormLabel>
              <TextField
                multiline
                rows={3}
                fullWidth
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide more details..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleReport}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none' }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
