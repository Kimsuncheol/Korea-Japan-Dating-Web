import Image from 'next/image';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Info as InfoIcon } from '@mui/icons-material';
import { Profile } from '@/lib/mockData';
import { Box, Typography, Chip, IconButton, Stack } from '@mui/material';

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
      <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', bgcolor: 'white', borderRadius: 6, overflow: 'hidden', boxShadow: 4, border: '1px solid', borderColor: 'grey.100' }}>
        <Image 
          src={profile.images[0]} 
          alt={profile.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover', pointerEvents: 'none', filter: 'grayscale(20%)' }}
          priority={false}
        />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">{profile.name}, {profile.age}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>{profile.location}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
    >
      <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', bgcolor: 'white', borderRadius: 6, overflow: 'hidden', boxShadow: 12, border: '1px solid', borderColor: 'grey.100', cursor: 'grab', '&:active': { cursor: 'grabbing' }, zIndex: 10 }}>
        {/* Visual Feedback Labels */}
        <motion.div 
          style={{ opacity: likeOpacity }}
        >
          <Box sx={{ position: 'absolute', top: 40, left: 40, border: '4px solid', borderColor: 'success.main', color: 'success.main', fontWeight: 'black', fontSize: '2.25rem', px: 2, py: 1, borderRadius: 3, transform: 'rotate(-20deg)', zIndex: 20, pointerEvents: 'none', textTransform: 'uppercase' }}>
            Like
          </Box>
        </motion.div>
        
        <motion.div 
          style={{ opacity: nopeOpacity }}
        >
          <Box sx={{ position: 'absolute', top: 40, right: 40, border: '4px solid', borderColor: 'error.main', color: 'error.main', fontWeight: 'black', fontSize: '2.25rem', px: 2, py: 1, borderRadius: 3, transform: 'rotate(20deg)', zIndex: 20, pointerEvents: 'none', textTransform: 'uppercase' }}>
            Nope
          </Box>
        </motion.div>

        <Image 
          src={profile.images[0]} 
          alt={profile.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover', pointerEvents: 'none' }}
          priority={true}
        />
        
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 4, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent)', color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h4" fontWeight="bold">{profile.name}, {profile.age}</Typography>
                <Chip 
                  label={profile.nationality}
                  size="small"
                  sx={{ 
                    px: 1, 
                    py: 0.5, 
                    fontSize: '0.625rem', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    bgcolor: profile.nationality === 'Korean' ? 'blue.600' : 'red.600',
                    color: 'white'
                  }}
                />
              </Stack>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InfoIcon sx={{ fontSize: 16 }} /> {profile.location}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                &quot;{profile.bio}&quot;
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                {profile.interests.map(interest => (
                  <Chip 
                    key={interest} 
                    label={interest}
                    size="small"
                    sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', color: 'white', fontSize: '0.75rem', fontWeight: 'medium' }}
                  />
                ))}
              </Stack>
            </Box>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail();
              }}
              sx={{ 
                mb: 1, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(12px)', 
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.4)'
                }
              }}
            >
              <InfoIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </motion.div>
  );
};
