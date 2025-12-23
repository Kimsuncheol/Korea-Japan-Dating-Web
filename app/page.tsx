'use client';

import { DiscoveryScreen } from "@/components/DiscoveryScreen";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress, Stack } from '@mui/material';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      }
      // } else if (userData && !userData.onboardingCompleted) {
      //   router.push('/onboarding');
      // }
    }
  }, [user, userData, loading, router]);

  if (loading || !user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={64} sx={{ color: 'primary.main' }} />
          <Box sx={{ width: 128, height: 16, bgcolor: 'grey.100', borderRadius: 1 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ maxWidth: 480, mx: 'auto', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <DiscoveryScreen />
      </Box>
    </Box>
  );
}
