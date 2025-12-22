'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Briefcase, GraduationCap, ChevronDown, Heart } from 'lucide-react';
import { Profile } from '@/lib/mockData';

interface ProfileDetailViewProps {
  profile: Profile;
  onClose: () => void;
}

export const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({ profile, onClose }) => {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
      {/* Back Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-black/20 backdrop-blur-md rounded-full text-white z-10 hover:bg-black/40 transition-colors"
      >
        <ChevronDown size={28} />
      </button>

      {/* Image Gallery (Simplified) */}
      <div className="relative h-[60vh] w-full">
        <img 
          src={profile.images[0]} 
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/40 to-transparent">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-extrabold">{profile.name}, {profile.age}</h1>
             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-white ${profile.nationality === 'Korean' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {profile.nationality}
              </span>
          </div>
          <p className="text-xl text-muted flex items-center gap-1 mt-1">
            <MapPin size={20} /> {profile.location}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 pb-32 space-y-8">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">About Me</h3>
          <p className="text-lg leading-relaxed text-gray-700">
            {profile.bio}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(interest => (
              <span key={interest} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                {interest}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-muted">
            <Briefcase size={20} />
            <span className="font-medium">Software Engineer at TechSpace</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <GraduationCap size={20} />
            <span className="font-medium">Yonsei University</span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <MapPin size={20} />
            <span className="font-medium">Lives in {profile.location.split(',')[0]}</span>
          </div>
        </section>

        <div className="pt-4">
          <button className="w-full py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-colors">
            REPORT {profile.name.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="flex justify-center gap-6 pointer-events-auto">
           <button className="p-4 rounded-full bg-white shadow-xl text-rose-500 border border-gray-100 scale-110 active:scale-95 transition-all">
            <X size={32} strokeWidth={3} />
          </button>
          <button className="p-4 rounded-full tinder-gradient shadow-xl text-white scale-125 active:scale-95 transition-all">
            <Heart size={36} fill="currentColor" strokeWidth={0} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
