'use client';

import { DiscoveryScreen } from "@/components/DiscoveryScreen";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (userData && !userData.onboardingCompleted) {
        router.push('/onboarding');
      }
    }
  }, [user, userData, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <DiscoveryScreen />
    </main>
  );
}
