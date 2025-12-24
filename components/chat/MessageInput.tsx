'use client';

import React, { useRef } from 'react';
import { Paper, Stack, IconButton, TextField } from '@mui/material';
import { Send, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sending: boolean;
}

export default function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  onImageUpload,
  sending 
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: 'grey.200',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,1))',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <IconButton 
          onClick={() => fileInputRef.current?.click()} 
          sx={{ 
            color: 'text.secondary',
            bgcolor: 'grey.100',
            '&:hover': {
              bgcolor: 'grey.200',
              color: 'primary.main'
            }
          }}
        >
          <ImageIcon size={22} />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              bgcolor: 'grey.50',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'grey.100',
              },
              '&.Mui-focused': {
                bgcolor: 'white',
                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
              }
            }
          }}
        />
        <IconButton 
          onClick={onSend}
          disabled={!value.trim() || sending}
          sx={{ 
            background: !value.trim() || sending 
              ? 'grey.300' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', 
            width: 44,
            height: 44,
            boxShadow: !value.trim() || sending 
              ? 'none' 
              : '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s',
            '&:hover': { 
              background: !value.trim() || sending 
                ? 'grey.300' 
                : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: !value.trim() || sending ? 'none' : 'scale(1.05)',
            },
            '&:disabled': { 
              bgcolor: 'grey.300',
              color: 'grey.500'
            }
          }}
        >
          <Send size={20} />
        </IconButton>
      </Stack>
    </Paper>
  );
}
