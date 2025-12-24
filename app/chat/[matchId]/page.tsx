'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { blockUser, reportUser, ReportCategory } from '@/lib/safetyService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ReportModal from '@/components/chat/ReportModal';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>('other');
  const [reportDescription, setReportDescription] = useState('');

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
    });
    
    return () => subscription.unsubscribe();
  }, [user, matchId]);

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
  };

  const handleUnmatch = async () => {
    if (!otherUser) return;
    
    if (confirm(`Unmatch with ${otherUser.displayName}? This cannot be undone.`)) {
      await unmatch(matchId);
      router.push('/matches');
    }
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
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          maxWidth: 480, 
          mx: 'auto' 
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: 'white' }} />
          <Typography sx={{ color: 'white', fontWeight: 500 }}>
            Loading chat...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#f5f5f5', 
        maxWidth: 480, 
        mx: 'auto', 
        borderLeft: '1px solid', 
        borderRight: '1px solid', 
        borderColor: 'grey.300',
        boxShadow: '0 0 40px rgba(0,0,0,0.1)'
      }}
    >
      <ChatHeader
        otherUser={otherUser}
        onReport={() => setShowReportModal(true)}
        onBlock={handleBlock}
        onUnmatch={handleUnmatch}
      />

      <MessageList
        messages={messages}
        currentUserId={user?.uid}
        onTranslate={handleTranslate}
      />

      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSend}
        onImageUpload={handleImageUpload}
        sending={sending}
      />

      <ReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        category={reportCategory}
        onCategoryChange={setReportCategory}
        description={reportDescription}
        onDescriptionChange={setReportDescription}
        userName={otherUser?.displayName}
      />
    </Box>
  );
}
