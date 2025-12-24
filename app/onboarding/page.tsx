'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, ChevronRight, Check } from 'lucide-react';
import { 
  Box, 
  Button, 
  Container, 
  LinearProgress, 
  TextField, 
  Typography, 
  Stack,
  MenuItem,
  InputAdornment,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    gender: 'male',
    interestedIn: 'female',
    location: '',
    bio: '',
    nationality: 'Korean',
    languages: [] as string[],
    interests: [] as string[]
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoHashes, setPhotoHashes] = useState<string[]>([]);

  // Helper function to compute SHA-256 hash of a file
  const getFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Name is required';
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
      } else {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 18) {
          newErrors.age = 'You must be 18 or older to use this app';
        } else if (ageNum > 100) {
          newErrors.age = 'Please enter a valid age';
        }
      }
    } else if (currentStep === 2) {
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      if (!formData.bio.trim()) {
        newErrors.bio = 'Bio is required';
      } else if (formData.bio.length < 10) {
        newErrors.bio = 'Bio must be at least 10 characters';
      }
    } else if (currentStep === 3) {
      if (photos.length < 2) {
        newErrors.photos = 'Please add at least 2 photos to complete your profile.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch country and city from Google Maps API
        // NOTE: Replace YOUR_GOOGLE_MAPS_API_KEY with your actual key
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=en`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          let city = '';
          let country = '';

          // Parse address components to find city and country
          for (const component of data.results[0].address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          }
          
          // Fallback if locality is missing (e.g. some rural areas)
          if (!city) {
             for (const component of data.results[0].address_components) {
                if (component.types.includes('administrative_area_level_1')) {
                   city = component.long_name;
                   break;
                }
             }
          }

          const locationString = `${city}, ${country}`;
          setFormData(prev => ({ ...prev, location: locationString }));
          if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        alert('Failed to get location details.');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error getting geolocation:', error);
      alert('Failed to retrieve your location.');
      setLoading(false);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check for duplicate using file hash
      const hash = await getFileHash(file);
      
      if (photoHashes.includes(hash)) {
        setErrors(prev => ({ ...prev, photos: 'This image has already been uploaded. Please choose a different photo.' }));
        // Reset the file input
        e.target.value = '';
        return;
      }

      // Read file and update state
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhotos = [...photos];
        const updatedHashes = [...photoHashes];

        // Handle replacing an existing photo at the index
        if (index < updatedPhotos.length && updatedPhotos[index]) {
          // Remove old hash if replacing
          const oldHash = updatedHashes[index];
          if (oldHash) {
            // We'll replace it, so no need to remove, just overwrite
          }
        }

        // Ensure array is big enough
        while (updatedPhotos.length <= index) {
          updatedPhotos.push('');
          updatedHashes.push('');
        }

        updatedPhotos[index] = reader.result as string;
        updatedHashes[index] = hash;

        setPhotos(updatedPhotos);
        setPhotoHashes(updatedHashes);
        if (errors.photos) setErrors(prev => ({ ...prev, photos: '' }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors(prev => ({ ...prev, photos: 'Error processing the image. Please try again.' }));
    }
  };

  const handleSubmit = async () => {
    if (!user) { 
      toast.error('User not found');
      return;
    }

    if (!validateStep(step)) { 
      toast.error('Please fill out all fields');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        photos: photos, // Save photos (in real app, upload to storage first)
        age: parseInt(formData.age),
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      });
      router.push('/');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // Step 1: Basic Info
    <Box key="step1" component="div">
      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My name is
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={formData.displayName}
            onChange={e => {
              setFormData({...formData, displayName: e.target.value});
              if (errors.displayName) setErrors({...errors, displayName: ''});
            }}
            error={!!errors.displayName}
            helperText={errors.displayName}
            placeholder="Min-jun"
            InputProps={{
              sx: { borderRadius: 3, bgcolor: 'background.paper' }
            }}
          />
        </Box>
        
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            I am a
          </Typography>
          <Stack direction="row" spacing={2}>
            {['Korean 🇰🇷', 'Japanese 🇯🇵', 'Other 🌏'].map(nat => {
              const value = nat.split(' ')[0];
              const isSelected = formData.nationality === value;
              return (
                <Button
                  key={nat}
                  variant={isSelected ? "contained" : "outlined"}
                  color={isSelected ? "primary" : "inherit"}
                  onClick={() => setFormData({...formData, nationality: value})}
                  sx={{ 
                    flex: 1, 
                    py: 2, 
                    borderRadius: 3,
                    borderColor: isSelected ? 'primary.main' : 'grey.300',
                    color: isSelected ? 'white' : 'grey.500',
                    backgroundColor: isSelected ? 'primary.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'grey.50'
                    }
                  }}
                >
                  {nat}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Stack direction="row" spacing={2}>
           <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Age
              </Typography>
              <TextField 
                type="number"
                fullWidth
                value={formData.age}
                onChange={e => {
                  setFormData({...formData, age: e.target.value});
                  if (errors.age) setErrors({...errors, age: ''});
                }}
                error={!!errors.age}
                helperText={errors.age}
                placeholder="25"
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: 'background.paper' }
                }}
              />
           </Box>
           <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Gender
              </Typography>
               <TextField
                select
                fullWidth
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                InputProps={{
                  sx: { borderRadius: 3, bgcolor: 'background.paper' }
                }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
           </Box>
        </Stack>
      </Stack>
    </Box>,

    // Step 2: Location & Bio
    <Box key="step2" component="div">
      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            I live in
          </Typography>
          <TextField 
            fullWidth
            value={formData.location}
            onChange={e => {
              setFormData({...formData, location: e.target.value});
              if (errors.location) setErrors({...errors, location: ''});
            }}
            error={!!errors.location}
            helperText={errors.location}
            placeholder="Seoul, Korea"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" onClick={handleLocationClick} style={{ cursor: 'pointer' }} data-testid="location-pin">
                  <MapPin size={20} className="text-gray-400 hover:text-blue-500" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: 'background.paper' }
            }}
          />
        </Box>
         <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            About me
          </Typography>
          <TextField 
            fullWidth
            multiline
            rows={4}
            value={formData.bio}
            onChange={e => {
              setFormData({...formData, bio: e.target.value});
              if (errors.bio) setErrors({...errors, bio: ''});
            }}
            error={!!errors.bio}
            helperText={errors.bio}
            placeholder="I love traveling and trying new foods..."
            InputProps={{
              sx: { borderRadius: 3, bgcolor: 'background.paper' }
            }}
          />
        </Box>
      </Stack>
    </Box>,

    // Step 3: Photos
    <Box key="step3" textAlign="center" component="div">
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Add your best photos
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Upload at least 2 photos to complete your profile.
          </Typography>
           {errors.photos && (
            <Typography variant="body2" color="error" gutterBottom>
              {errors.photos}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {[0, 1].map(i => (
            <Paper
              key={i}
              component="div"
              elevation={0}
              sx={{ 
                aspectRatio: '2/3', 
                bgcolor: 'grey.100', 
                borderRadius: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: errors.photos && !photos[i] ? 'error.main' : 'grey.300',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'grey.50',
                  borderColor: 'primary.main'
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
                onChange={(e) => handlePhotoUpload(e, i)}
              />
              {photos[i] ? (
                <Image 
                  src={photos[i]} 
                  alt={`Upload ${i+1}`} 
                  fill
                  style={{ objectFit: 'cover' }} 
                />
              ) : (
                <Camera className="text-slate-300" />
              )}
            </Paper>
          ))}
        </Box>
      </Stack>
    </Box>
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', maxWidth: 480, mx: 'auto' }}>
      <Container maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
      {/* Progress Bar */}
      <Box sx={{ width: '100%', mb: 4, mt: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={(step / steps.length) * 100} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: 'primary.main'
            }
          }}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%' }}
          >
            {steps[step-1]}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
         {step > 1 && (
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleBack}
            sx={{
              py: 2,
              borderRadius: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderColor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                 borderColor: 'primary.main',
                 bgcolor: 'background.paper'
              }
            }}
          >
            Back
          </Button>
        )}

        {step < steps.length ? (
          <Button 
            fullWidth
            variant="contained"
            size="large"
            onClick={handleNext}
            endIcon={<ChevronRight size={20} />}
            sx={{ 
              py: 2, 
              borderRadius: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 4
            }}
          >
            Continue
          </Button>
        ) : (
          <Button 
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            endIcon={<Check size={20} />}
            sx={{ 
              py: 2, 
              borderRadius: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              background: 'linear-gradient(to right, #ec4899, #f43f5e, #fbbf24)', // Tinder-like gradient
              boxShadow: 4,
              color: 'white'
            }}
          >
             {loading ? 'Setting up profile...' : 'Complete Profile'}
          </Button>
        )}
      </Box>
    </Container>
    </Box>
  );
}
