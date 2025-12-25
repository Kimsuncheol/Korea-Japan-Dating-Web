'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import {
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSupported,
  getNotificationPermission,
  NotificationSettings
} from '@/lib/pushService';
import { ResetPasswordModal } from '@/components/settings/ResetPasswordModal';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ChevronLeft, 
  Key, 
  Trash2, 
  Bell, 
  BellOff,
  Sun, 
  Moon, 
  Monitor,
  MessageCircle,
  Heart,
  Users,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, deleteAccount, logout } = useAuth();
  const { mode, setMode } = useThemeContext();
  const router = useRouter();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    matching: true,
    messages: true,
    likes: true,
    pushEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modals
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadSettings();
  }, [user, router]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const settings = await getNotificationSettings(user.uid);
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    if (!user) return;
    
    setSaving(true);
    const newValue = !notificationSettings[key];
    
    try {
      if (key === 'pushEnabled') {
        if (newValue) {
          const success = await subscribeToPush(user.uid);
          if (!success) {
            // Permission denied or not supported
            return;
          }
        } else {
          await unsubscribeFromPush(user.uid);
        }
      } else {
        await updateNotificationSettings(user.uid, { [key]: newValue });
      }
      
      setNotificationSettings(prev => ({ ...prev, [key]: newValue }));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    
    try {
      await deleteAccount();
      router.push('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. You may need to re-authenticate.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getThemeButtonStyle = (targetMode: 'light' | 'dark' | 'system') => ({
    flex: 1,
    py: 2,
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    bgcolor: mode === targetMode ? 'primary.light' : 'background.paper',
    color: mode === targetMode ? 'primary.main' : 'text.secondary',
    border: '2px solid',
    borderColor: mode === targetMode ? 'primary.main' : 'grey.200',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: mode === targetMode ? 'primary.main' : 'grey.300'
    }
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 480, mx: 'auto' }}>
        <CircularProgress size={48} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10, maxWidth: 480, mx: 'auto', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 2, color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* Appearance Section */}
          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 2, display: 'block' }}>
              Appearance
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Box 
                component="button"
                onClick={() => setMode('light')}
                sx={getThemeButtonStyle('light')}
              >
                <Sun size={24} />
                <Typography variant="caption" fontWeight="bold">Light</Typography>
              </Box>
              <Box 
                component="button"
                onClick={() => setMode('dark')}
                sx={getThemeButtonStyle('dark')}
              >
                <Moon size={24} />
                <Typography variant="caption" fontWeight="bold">Dark</Typography>
              </Box>
              <Box 
                component="button"
                onClick={() => setMode('system')}
                sx={getThemeButtonStyle('system')}
              >
                <Monitor size={24} />
                <Typography variant="caption" fontWeight="bold">System</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Push Notifications Section */}
          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 2, display: 'block' }}>
              Push Notifications
            </Typography>
            
            {!isPushSupported() && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                Push notifications are not supported in this browser.
              </Alert>
            )}

            {isPushSupported() && getNotificationPermission() === 'denied' && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                Notifications are blocked. Please enable them in your browser settings.
              </Alert>
            )}

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.pushEnabled}
                    onChange={() => handleNotificationToggle('pushEnabled')}
                    disabled={!isPushSupported() || saving}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {notificationSettings.pushEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                    <Typography variant="body2">Enable Notifications</Typography>
                  </Box>
                }
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}
                labelPlacement="start"
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.matching}
                    onChange={() => handleNotificationToggle('matching')}
                    disabled={!notificationSettings.pushEnabled || saving}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={18} />
                    <Typography variant="body2">New Matches</Typography>
                  </Box>
                }
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}
                labelPlacement="start"
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.messages}
                    onChange={() => handleNotificationToggle('messages')}
                    disabled={!notificationSettings.pushEnabled || saving}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageCircle size={18} />
                    <Typography variant="body2">Messages</Typography>
                  </Box>
                }
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}
                labelPlacement="start"
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.likes}
                    onChange={() => handleNotificationToggle('likes')}
                    disabled={!notificationSettings.pushEnabled || saving}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Heart size={18} />
                    <Typography variant="body2">Likes</Typography>
                  </Box>
                }
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between' }}
                labelPlacement="start"
              />
            </Paper>
          </Box>

          {/* Account Section */}
          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 2, display: 'block' }}>
              Account
            </Typography>
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Key size={20} />}
                onClick={() => setResetPasswordOpen(true)}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 4, 
                  fontWeight: 'bold', 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  px: 2
                }}
              >
                Reset Password
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={20} />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 4, 
                  fontWeight: 'bold', 
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  px: 2,
                  borderColor: 'error.light',
                  '&:hover': {
                    bgcolor: 'error.50',
                    borderColor: 'error.main'
                  }
                }}
              >
                Delete Account
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Reset Password Modal */}
      <ResetPasswordModal 
        open={resetPasswordOpen} 
        onClose={() => setResetPasswordOpen(false)} 
      />

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. All your data, matches, and messages will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            disabled={deleting}
            color="error"
            variant="contained"
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
          >
            {deleting ? <Loader2 className="animate-spin" size={20} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
