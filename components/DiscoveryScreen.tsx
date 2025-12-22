'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SwipeableCard } from './SwipeableCard';
import { ProfileDetailView } from './ProfileDetailView';
import { mockProfiles, Profile } from '@/lib/mockData';
import { Heart, X, MessageCircle, User, Zap, Star } from 'lucide-react';

export const DiscoveryScreen = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [matchShow, setMatchShow] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Simulate a match logic
      if (Math.random() > 0.6) {
        setMatchShow(true);
        setTimeout(() => setMatchShow(false), 3000);
      }
    }
    setProfiles(prev => prev.slice(1));
  };

  const handleRefresh = () => {
    setProfiles(mockProfiles);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-black text-primary tracking-tighter italic">KO-JA Match</h1>
        <button className="p-2 text-muted hover:text-primary transition-colors">
          <Zap size={24} />
        </button>
      </header>

      {/* Card Stack Area */}
      <main className="flex-1 relative px-4 flex items-center justify-center">
        <div className="relative w-full aspect-[3/4]">
          <AnimatePresence>
            {profiles.length > 0 ? (
              profiles.map((profile, index) => (
                <SwipeableCard
                  key={profile.id}
                  profile={profile}
                  isTop={index === 0}
                  onSwipe={handleSwipe}
                  onOpenDetail={() => setSelectedProfile(profile)}
                />
              )).reverse() // Reverse to make index 0 on top
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <User className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-bold">No more profiles!</h3>
                <p className="text-muted mt-2">Check back later or expand your search.</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-6 px-6 py-2 tinder-gradient text-white font-bold rounded-full shadow-lg"
                >
                  Refresh
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Like/Dislike Buttons */}
      <div className="flex justify-center items-center gap-6 py-8">
        <button 
          onClick={() => handleSwipe('left')}
          className="p-4 rounded-full bg-white shadow-xl text-rose-500 border border-gray-100 hover:scale-110 active:scale-95 transition-all"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          className="p-3 rounded-full bg-white shadow-lg text-amber-400 border border-gray-100 hover:scale-110 active:scale-95 transition-all"
        >
          <Star size={24} fill="currentColor" />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="p-4 rounded-full bg-white shadow-xl text-emerald-500 border border-gray-100 hover:scale-110 active:scale-95 transition-all"
        >
          <Heart size={32} fill="currentColor" strokeWidth={0} />
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="flex justify-around items-center py-4 px-6 border-t border-gray-100 bg-white/80 backdrop-blur-md">
        <button className="text-primary"><Zap size={24} /></button>
        <button className="text-muted"><MessageCircle size={24} /></button>
        <button onClick={() => router.push('/profile/edit')} className="text-muted hover:text-primary transition-colors"><User size={24} /></button>
      </nav>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchShow && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-10 bg-black/90 text-white text-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-primary mb-6"
            >
              <Heart size={80} fill="currentColor" />
            </motion.div>
            <h2 className="text-5xl font-black italic tracking-tighter mb-2">IT'S A MATCH!</h2>
            <p className="text-lg opacity-80 mb-8">You and this person both liked each other.</p>
            <button className="w-full py-4 tinder-gradient rounded-full font-bold text-lg shadow-xl mb-4">
              Send a Message
            </button>
            <button 
              onClick={() => setMatchShow(false)}
              className="px-6 py-2 border-2 border-white rounded-full font-bold"
            >
              Keep Swiping
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileDetailView 
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
