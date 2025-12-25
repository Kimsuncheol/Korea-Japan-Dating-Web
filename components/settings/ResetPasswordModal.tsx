'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error';

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, onClose }) => {
  const { user, resetPassword } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [state, setState] = useState<ModalState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Please enter your email address');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      await resetPassword(email);
      setState('success');
    } catch (error: unknown) {
      setState('error');
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          setErrorMessage('No account found with this email');
        } else if (error.message.includes('invalid-email')) {
          setErrorMessage('Please enter a valid email address');
        } else {
          setErrorMessage('Failed to send reset email. Please try again.');
        }
      } else {
        setErrorMessage('Failed to send reset email. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setState('idle');
    setErrorMessage('');
    setEmail(user?.email || '');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Reset Password
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          {state === 'success' ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '50%', 
                  bgcolor: 'success.light', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CheckCircle size={32} color="#22c55e" />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Email Sent!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check your inbox for password reset instructions.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Typography>

              {state === 'error' && (
                <Alert 
                  severity="error" 
                  icon={<AlertCircle size={20} />}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  {errorMessage}
                </Alert>
              )}

              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === 'loading'}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8, color: '#9ca3af' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {state === 'success' ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{ 
                borderRadius: 3, 
                py: 1.5, 
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                disabled={state === 'loading'}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5,
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={state === 'loading'}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5, 
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                {state === 'loading' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
