import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Info } from 'lucide-react';
import { Profile } from '@/lib/mockData';

interface SwipeableCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onOpenDetail: () => void;
  isTop: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({ profile, onSwipe, onOpenDetail, isTop }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  if (!isTop) {
    return (
      <div className="absolute inset-0 w-full h-full bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        <img 
          src={profile.images[0]} 
          alt={profile.name}
          className="w-full h-full object-cover pointer-events-none grayscale-[20%]"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
          <p className="text-sm opacity-80">{profile.location}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      className="absolute inset-0 w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 cursor-grab active:cursor-grabbing z-10"
    >
      {/* Visual Feedback Labels */}
      <motion.div 
        style={{ opacity: likeOpacity }}
        className="absolute top-10 left-10 border-4 border-emerald-500 text-emerald-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[-20deg] z-20 pointer-events-none uppercase"
      >
        Like
      </motion.div>
      
      <motion.div 
        style={{ opacity: nopeOpacity }}
        className="absolute top-10 right-10 border-4 border-rose-500 text-rose-500 font-black text-4xl px-4 py-2 rounded-xl rotate-[20deg] z-20 pointer-events-none uppercase"
      >
        Nope
      </motion.div>

      <img 
        src={profile.images[0]} 
        alt={profile.name}
        className="w-full h-full object-cover pointer-events-none"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">{profile.name}, {profile.age}</h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${profile.nationality === 'Korean' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {profile.nationality}
              </span>
            </div>
            <p className="text-lg opacity-90 mt-1 flex items-center gap-1">
              <Info size={16} /> {profile.location}
            </p>
            <p className="mt-3 text-sm line-clamp-2 italic opacity-80">&quot;{profile.bio}&quot;</p>
            <div className="flex gap-2 mt-4">
              {profile.interests.map(interest => (
                <span key={interest} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="p-2 mb-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <Info size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
