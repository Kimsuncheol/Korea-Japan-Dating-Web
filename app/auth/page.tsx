'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Chrome, Heart, AlertCircle } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  Divider,
  Alert,
  Link as MuiLink
} from '@mui/material';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, googleSignIn } = useAuth();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleSignIn();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', maxWidth: 480, mx: 'auto' }}>
      <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper elevation={3} sx={{ borderRadius: 4, p: 4, border: '1px solid', borderColor: 'grey.200' }}>
          {/* Logo/Brand */}
          <Stack alignItems="center" spacing={2} mb={4}>
            <Box
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: 4
              }}
            >
              <Heart size={36} fill="currentColor" />
            </Box>
            <Typography variant="h4" fontWeight="black" sx={{ fontStyle: 'italic', letterSpacing: '-0.05em' }}>
              KO-JA Match
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Connecting Korea & Japan
            </Typography>
          </Stack>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ mb: 3, borderRadius: 3 }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <Box component="form" onSubmit={handleAuth}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', ml: 0.5 }}>
                  Email Address
                </Typography>
                <TextField 
                  required
                  fullWidth
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} className="text-slate-400" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3, bgcolor: 'grey.50' }
                  }}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', ml: 0.5 }}>
                  Password
                </Typography>
                <TextField 
                  required
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} className="text-slate-400" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 3, bgcolor: 'grey.50' }
                  }}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Button 
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 2, 
                  borderRadius: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)',
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 8
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ position: 'relative', my: 4 }}>
            <Divider />
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                px: 2,
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              OR
            </Typography>
          </Box>

          {/* Social Login */}
          <Button 
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoogleSignIn}
            disabled={loading}
            startIcon={<Chrome size={20} className="text-primary" />}
            sx={{ 
              py: 2, 
              borderRadius: 4,
              fontWeight: 'bold',
              textTransform: 'none',
              borderColor: 'grey.300',
              '&:active': {
                transform: 'scale(0.98)'
              }
            }}
          >
            Continue with Google
          </Button>

          {/* Toggle */}
          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <MuiLink
              component="button"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              sx={{ fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </MuiLink>
          </Typography>
        </Paper>
      </motion.div>

      {/* Footer Info */}
      <Typography variant="caption" textAlign="center" mt={4} color="text.secondary" sx={{ maxWidth: 'xs', lineHeight: 1.6 }}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Typography>
    </Container>
    </Box>
  );
}
