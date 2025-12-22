'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, Loader2, Trash2, Eye } from 'lucide-react';
import { ProfileDetailView } from '@/components/ProfileDetailView';
import { Profile } from '@/lib/mockData';

export default function ProfileEditPage() {
  const { user, userData } = useAuth();
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
    <div className="min-h-screen bg-slate-50 pb-20">
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

      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft />
        </button>
        <h1 className="font-bold text-lg">Edit Profile</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPreview(true)}
            className="p-2 text-primary bg-primary/10 rounded-full"
            title="Preview Profile"
          >
            <Eye size={20} />
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
          </button>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-md mx-auto">
        {/* Photos Section */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Photos</h2>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="aspect-[2/3] relative rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 group">
                {formData.photos[index] ? (
                  <>
                    <img src={formData.photos[index]} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                    {uploading ? (
                      <Loader2 className="animate-spin text-slate-300" />
                    ) : (
                      <Camera className="text-slate-300" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, index)}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">About You</h2>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
             <label className="block text-xs font-bold text-slate-400 mb-1">Display Name</label>
             <input 
               type="text"
               value={formData.displayName}
               onChange={e => setFormData({...formData, displayName: e.target.value})}
               className="w-full text-lg font-medium outline-none text-slate-800"
               placeholder="Your name"
             />
          </div>

           <div className="bg-white p-4 rounded-2xl border border-slate-200">
             <label className="block text-xs font-bold text-slate-400 mb-1">Bio</label>
             <textarea 
               value={formData.bio}
               onChange={e => setFormData({...formData, bio: e.target.value})}
               className="w-full text-base font-medium outline-none text-slate-800 resize-none"
               rows={4}
               placeholder="Write something about yourself..."
             />
          </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-slate-200">
               <label className="block text-xs font-bold text-slate-400 mb-1">Age</label>
               <input 
                 type="number"
                 value={formData.age}
                 onChange={e => setFormData({...formData, age: e.target.value})}
                 className="w-full text-lg font-medium outline-none text-slate-800"
                 placeholder="25"
               />
            </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-200">
               <label className="block text-xs font-bold text-slate-400 mb-1">Location</label>
               <input 
                 type="text"
                 value={formData.location}
                 onChange={e => setFormData({...formData, location: e.target.value})}
                 className="w-full text-lg font-medium outline-none text-slate-800"
                 placeholder="Seoul"
               />
            </div>
           </div>
        </section>

        {/* Visibility Settings */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Visibility Settings</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <span className="font-medium text-slate-700">Show Distance</span>
              <button 
                onClick={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, showDistance: !prev.visibility.showDistance}}))}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.visibility?.showDistance ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${formData.visibility?.showDistance ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <span className="font-medium text-slate-700">Show Last Active</span>
              <button 
                onClick={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, showLastActive: !prev.visibility.showLastActive}}))}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.visibility?.showLastActive ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${formData.visibility?.showLastActive ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-700 block">Pause Discovery</span>
                <span className="text-xs text-slate-400">Hide your profile from new people</span>
              </div>
              <button 
                onClick={() => setFormData(prev => ({...prev, visibility: {...prev.visibility, discoveryPaused: !prev.visibility.discoveryPaused}}))}
                className={`w-12 h-7 rounded-full transition-colors relative ${formData.visibility?.discoveryPaused ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${formData.visibility?.discoveryPaused ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
