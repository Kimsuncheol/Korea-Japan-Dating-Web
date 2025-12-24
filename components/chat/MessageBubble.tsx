'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Languages } from 'lucide-react';
import { Message } from '@/lib/chatService';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onTranslate: (messageId: string, text: string) => void;
}

export default function MessageBubble({ message, isOwn, onTranslate }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: '75%',
            px: 2.5,
            py: 1.5,
            borderRadius: 5,
            position: 'relative',
            ...(isOwn ? {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderBottomRightRadius: 5,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            } : {
              bgcolor: 'white',
              color: 'text.primary',
              borderBottomLeftRadius: 5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)',
            })
          }}
        >
          {message.imageUrl && (
            <Box 
              sx={{ 
                mb: 1, 
                borderRadius: 3, 
                overflow: 'hidden', 
                position: 'relative', 
                width: '100%', 
                maxWidth: 250, 
                aspectRatio: '4/3',
                boxShadow: isOwn 
                  ? '0 2px 8px rgba(0,0,0,0.2)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Image 
                src={message.imageUrl} 
                alt="Shared image"
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
          )}
          <Typography 
            variant="body2" 
            sx={{ 
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}
          >
            {message.text}
          </Typography>
          {message.translatedText && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.5, 
                pt: 0.5, 
                borderTop: '1px solid', 
                borderColor: isOwn ? 'rgba(255,255,255,0.3)' : 'grey.200', 
                display: 'block', 
                opacity: 0.85,
                fontStyle: 'italic'
              }}
            >
              {message.translatedText}
            </Typography>
          )}
        </Paper>
      </Box>
      {!isOwn && !message.translatedText && (
        <Button 
          size="small"
          onClick={() => onTranslate(message.id, message.text)}
          startIcon={<Languages size={14} />}
          sx={{ 
            mt: 0.5, 
            fontSize: '0.75rem', 
            textTransform: 'none', 
            color: 'text.secondary',
            ml: 1,
            '&:hover': {
              bgcolor: 'rgba(102, 126, 234, 0.08)',
              color: 'primary.main'
            }
          }}
        >
          Translate
        </Button>
      )}
    </motion.div>
  );
}
