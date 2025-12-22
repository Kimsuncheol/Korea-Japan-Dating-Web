'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, ChevronRight, Check } from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
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
    <div key="step1" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My name is</h2>
        <input 
          type="text"
          value={formData.displayName}
          onChange={e => setFormData({...formData, displayName: e.target.value})}
          placeholder="Min-jun"
          className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-bold focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">I am a</h2>
        <div className="flex gap-4">
          {['Korean 🇰🇷', 'Japanese 🇯🇵', 'Other 🌏'].map(nat => (
            <button
              key={nat}
              onClick={() => setFormData({...formData, nationality: nat.split(' ')[0]})}
              className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${formData.nationality === nat.split(' ')[0] ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}
            >
              {nat}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
         <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Age</h2>
            <input 
              type="number"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              placeholder="25"
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-bold focus:ring-2 focus:ring-primary/50 outline-none"
            />
         </div>
         <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Gender</h2>
             <select 
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-bold focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
         </div>
      </div>
    </div>,

    // Step 2: Location & Bio
    <div key="step2" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">I live in</h2>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            placeholder="Seoul, Korea"
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-bold focus:ring-2 focus:ring-primary/50 outline-none"
          />
        </div>
      </div>
       <div>
        <h2 className="text-2xl font-bold mb-2">About me</h2>
        <textarea 
          value={formData.bio}
          onChange={e => setFormData({...formData, bio: e.target.value})}
          placeholder="I love traveling and trying new foods..."
          rows={4}
          className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-lg font-medium focus:ring-2 focus:ring-primary/50 outline-none resize-none"
        />
      </div>
    </div>,

    // Step 3: Photos (Placeholder)
    <div key="step3" className="space-y-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Add your best photos</h2>
      <p className="text-slate-400 mb-8">Upload at least 2 photos to continue.</p>
      
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="aspect-[2/3] bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-colors">
            <Camera className="text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 rounded-full mb-8 mt-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / steps.length) * 100}%` }}
          className="h-full bg-primary"
        />
      </div>

      <div className="w-full flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            {steps[step-1]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full mt-8">
        {step < steps.length ? (
          <button 
            onClick={handleNext}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 tinder-gradient text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
             {loading ? 'Setting up profile...' : 'Complete Profile'} <Check size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
