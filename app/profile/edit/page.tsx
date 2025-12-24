'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, Loader2, Trash2, Eye, LogOut } from 'lucide-react';
import { ProfileDetailView } from '@/components/ProfileDetailView';
import { Profile } from '@/lib/mockData';
import {
  Box,
  Button,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';

export default function ProfileEditPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photos: [] as string[],
    age: '',
    location: '',
    interests: [] as string[],
    visibility: {
      showDistance: true,
      showLastActive: true,
      discoveryPaused: false
    }
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        bio: userData.bio || '',
        photos: userData.photos || [],
        age: userData.age || '',
        location: userData.location || '',
        interests: userData.interests || [],
        visibility: userData.visibility || {
          showDistance: true,
          showLastActive: true,
          discoveryPaused: false
        }
      });
    }
  }, [userData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${user.uid}/photos/${Date.now()}_${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const newPhotos = [...formData.photos];
      if (index < newPhotos.length) {
        newPhotos[index] = downloadURL;
      } else {
        newPhotos.push(downloadURL);
      }
      
      setFormData(prev => ({ ...prev, photos: newPhotos }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
        router.push('/auth');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        age: parseInt(formData.age as string),
        updatedAt: new Date().toISOString()
      });
      alert('Profile updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10, maxWidth: 480, mx: 'auto', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'grey.200' }}>
      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <ProfileDetailView 
            profile={{
              id: user?.uid || 'preview',
              name: formData.displayName || 'Preview',
              age: parseInt(formData.age as string) || 25,
              location: formData.location || 'Unknown',
              bio: formData.bio,
              images: formData.photos.length > 0 ? formData.photos : ['https://via.placeholder.com/400'],
              nationality: 'Korean', // TODO: Add nationality to form
              interests: formData.interests
            } as Profile}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>

      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.200', backdropFilter: 'blur(12px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 2, color: 'text.secondary' }}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Edit Profile
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton 
              onClick={() => setShowPreview(true)}
              sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
              title="Preview Profile"
            >
              <Eye size={20} />
            </IconButton>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              variant="contained"
              size="small"
              sx={{ borderRadius: 10, px: 2, fontWeight: 'bold', textTransform: 'none' }}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
        <Stack spacing={4}>
          {/* Photos Section */}
          <Box>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', mb: 2, display: 'block' }}>
              Photos
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Box 
                  key={index}
                  sx={{ 
                    aspectRatio: '2/3', 
                    position: 'relative', 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    bgcolor: 'white', 
                    boxShadow: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover .remove-button': {
                      opacity: 1
                    }
                  }}
                >
                  {formData.photos[index] ? (
                    <>
                      <Image 
                        src={formData.photos[index]} 
                        alt={`Photo ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton 
                        onClick={() => removePhoto(index)}
                        className="remove-button"
                        sx={{ 
                          position: 'absolute', 
                          top: 4, 
                          right: 4, 
                          bgcolor: 'rgba(0,0,0,0.5)', 
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)'
                          }
                        }}
                        size="small"
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <Box
                      component="label"
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.50'
                        }
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={24} sx={{ color: 'grey.300' }} />
                      ) : (
                        <Camera className="text-slate-300" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageUpload(e, index)}
                        disabled={uploading}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Basic Info */}
          <Stack spacing={2}>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
              About You
            </Typography>
            
            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Display Name
              </Typography>
              <TextField 
                fullWidth
                variant="standard"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                placeholder="Your name"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '1.125rem', fontWeight: 'medium' }
                }}
              />
            </Paper>

            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Bio
              </Typography>
              <TextField 
                fullWidth
                multiline
                rows={4}
                variant="standard"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Write something about yourself..."
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '1rem', fontWeight: 'medium' }
                }}
              />
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Age
                </Typography>
                <TextField 
                  fullWidth
                  variant="standard"
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  placeholder="25"
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '1.125rem', fontWeight: 'medium' }
                  }}
                />
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Location
                </Typography>
                <TextField 
                  fullWidth
                  variant="standard"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Seoul"
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '1.125rem', fontWeight: 'medium' }
                  }}
                />
              </Paper>
            </Box>
          </Stack>

          {/* Visibility Settings */}
          <Stack spacing={2}>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
              Visibility Settings
            </Typography>
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.visibility?.showDistance}
                    onChange={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, showDistance: !prev.visibility.showDistance}}))}
                  />
                }
                label="Show Distance"
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.100' }}
                labelPlacement="start"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.visibility?.showLastActive}
                    onChange={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, showLastActive: !prev.visibility.showLastActive}}))}
                  />
                }
                label="Show Last Active"
                sx={{ m: 0, px: 2, py: 1.5, width: '100%', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'grey.100' }}
                labelPlacement="start"
              />
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Pause Discovery
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hide your profile from new people
                  </Typography>
                </Box>
                <Switch 
                  checked={formData.visibility?.discoveryPaused}
                  onChange={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, discoveryPaused: !prev.visibility.discoveryPaused}}))}
                />
              </Box>
            </Paper>
          </Stack>

          {/* Account Actions */}
          <Stack spacing={2}>
            <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
              Account
            </Typography>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogOut size={20} />}
              onClick={handleLogout}
              sx={{ 
                py: 1.5, 
                borderRadius: 4, 
                fontWeight: 'bold', 
                textTransform: 'none',
                borderColor: 'error.light',
                '&:hover': {
                  bgcolor: 'error.50',
                  borderColor: 'error.main'
                }
              }}
            >
              Sign Out
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
