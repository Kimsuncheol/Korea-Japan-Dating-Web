'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Message } from '@/lib/chatService';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  onTranslate: (messageId: string, text: string) => void;
}

export default function MessageList({ messages, currentUserId, onTranslate }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 10, 
          color: 'text.secondary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Start the Conversation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Say hello to break the ice! 👋
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
      <Stack spacing={1.5}>
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              onTranslate={onTranslate}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  );
}
