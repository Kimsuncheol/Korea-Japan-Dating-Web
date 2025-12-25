'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Pin, 
  BellOff, 
  Bell,
  LogOut,
  MoreVertical,
  MessageCircle
} from 'lucide-react';
import { Match } from '@/lib/matchService';
import { ChatRoomSettings } from '@/lib/chatRoomService';

interface ChatRoomItemProps {
  match: Match & {
    otherUser: {
      id: string;
      displayName: string;
      photoURL?: string;
      photos?: string[];
    };
  };
  settings: ChatRoomSettings;
  onPin: (matchId: string, pinned: boolean) => void;
  onToggleAlert: (matchId: string, enabled: boolean) => void;
  onLeave: (matchId: string) => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  match,
  settings,
  onPin,
  onToggleAlert,
  onLeave
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePin = () => {
    onPin(match.id, !settings.pinned);
    handleMenuClose();
  };

  const handleToggleAlert = () => {
    onToggleAlert(match.id, !settings.alertsEnabled);
    handleMenuClose();
  };

  const handleLeave = () => {
    handleMenuClose();
    if (confirm('Are you sure you want to leave this conversation? This cannot be undone.')) {
      onLeave(match.id);
    }
  };

  const formatTimestamp = (timestamp: unknown): string => {
    if (!timestamp) return '';
    
    let date: Date;
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      date = (timestamp as { toDate: () => Date }).toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const photoUrl = match.otherUser.photos?.[0] || match.otherUser.photoURL || '';

  return (
    <Box
      onClick={() => router.push(`/chat/${match.id}`)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      {/* Avatar */}
      <Box sx={{ position: 'relative' }}>
        <Avatar
          sx={{ 
            width: 56, 
            height: 56,
            border: '2px solid',
            borderColor: settings.pinned ? 'primary.main' : 'transparent'
          }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={match.otherUser.displayName}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            match.otherUser.displayName.charAt(0).toUpperCase()
          )}
        </Avatar>
        {settings.pinned && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Pin size={12} color="white" />
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ color: 'text.primary' }}>
            {match.otherUser.displayName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {!settings.alertsEnabled && (
              <BellOff size={14} style={{ color: '#9ca3af' }} />
            )}
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(match.lastMessageAt)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageCircle size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            noWrap
            sx={{ flex: 1 }}
          >
            {match.lastMessage || 'Start a conversation...'}
          </Typography>
        </Box>
      </Box>

      {/* Actions Menu */}
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertical size={20} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handlePin}>
          <ListItemIcon>
            <Pin size={18} />
          </ListItemIcon>
          <ListItemText>{settings.pinned ? 'Unpin' : 'Pin'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleAlert}>
          <ListItemIcon>
            {settings.alertsEnabled ? <BellOff size={18} /> : <Bell size={18} />}
          </ListItemIcon>
          <ListItemText>
            {settings.alertsEnabled ? 'Mute notifications' : 'Unmute notifications'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLeave} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText>Leave conversation</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};
