export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  nationality: 'Korean' | 'Japanese';
  interests: string[];
}

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Min-jun',
    age: 26,
    location: 'Seoul, Korea',
    bio: 'Looking for someone to explore new cafes with. I love photography and indie music! 📸🎧',
    images: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'
    ],
    nationality: 'Korean',
    interests: ['Photography', 'Music', 'Cafes']
  },
  {
    id: '2',
    name: 'Haruka',
    age: 24,
    location: 'Tokyo, Japan',
    bio: 'Traveling and cooking are my passions. I want to learn more about Korean culture! 🍲🇰🇷',
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
    ],
    nationality: 'Japanese',
    interests: ['Cooking', 'Travel', 'K-Pop']
  },
  {
    id: '3',
    name: 'Ji-won',
    age: 28,
    location: 'Busan, Korea',
    bio: 'Work hard, play hard. I enjoy hiking and craft beer. Let\'s grab a drink sometime! 🍺⛰️',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
    ],
    nationality: 'Korean',
    interests: ['Hiking', 'Beer', 'Fitness']
  },
  {
    id: '4',
    name: 'Yui',
    age: 25,
    location: 'Osaka, Japan',
    bio: 'Art lover and cat person. I spend my weekends visiting museums and galleries. 🎨🐈',
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
    ],
    nationality: 'Japanese',
    interests: ['Art', 'Museums', 'Cats']
  }
];
