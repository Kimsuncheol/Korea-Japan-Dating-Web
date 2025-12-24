'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ChevronLeft,
  MoreVertical,
  Flag,
  Ban,
  UserX,
} from 'lucide-react';

interface ChatHeaderProps {
  otherUser: {
    id: string;
    displayName: string;
    photoURL?: string;
    photos?: string[];
  } | null;
  onReport: () => void;
  onBlock: () => void;
  onUnmatch: () => void;
}

export default function ChatHeader({ otherUser, onReport, onBlock, onUnmatch }: ChatHeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar>
        <IconButton 
          edge="start" 
          onClick={() => router.push('/matches')} 
          sx={{ mr: 2, color: 'white' }}
        >
          <ChevronLeft />
        </IconButton>
        <Avatar 
          src={otherUser?.photos?.[0] || otherUser?.photoURL}
          alt={otherUser?.displayName}
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 2,
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          sx={{ 
            flexGrow: 1, 
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {otherUser?.displayName}
        </Typography>
        <IconButton 
          onClick={(e) => setAnchorEl(e.currentTarget)} 
          sx={{ color: 'white' }}
        >
          <MoreVertical size={20} />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: { 
              borderRadius: 3, 
              mt: 1, 
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }
          }}
        >
          <MenuItem 
            onClick={() => { 
              onReport(); 
              setAnchorEl(null); 
            }}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.08)'
              }
            }}
          >
            <ListItemIcon><Flag size={18} /></ListItemIcon>
            <ListItemText>Report</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              onBlock();
              setAnchorEl(null);
            }}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.08)'
              }
            }}
          >
            <ListItemIcon><Ban size={18} /></ListItemIcon>
            <ListItemText>Block</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              onUnmatch();
              setAnchorEl(null);
            }}
            sx={{ 
              color: 'error.main',
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.08)'
              }
            }}
          >
            <ListItemIcon><UserX size={18} color="currentColor" /></ListItemIcon>
            <ListItemText>Unmatch</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
