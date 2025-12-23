import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Timestamp;
}

export interface Match {
  id: string;
  users: string[];
  createdAt: Timestamp;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  active: boolean;
}

/**
 * Create a like record and check for mutual match
 * Uses Firestore transaction for atomicity
 */
export async function createLike(fromUserId: string, toUserId: string): Promise<{ matched: boolean; matchId?: string }> {
  const likeId = `${fromUserId}_${toUserId}`;
  const reverseLikeId = `${toUserId}_${fromUserId}`;
  
  return await runTransaction(db, async (transaction) => {
    // Check if reverse like exists (mutual like)
    const reverseLikeRef = doc(db, 'likes', reverseLikeId);
    const reverseLike = await transaction.get(reverseLikeRef);
    
    // Create the like record
    const likeRef = doc(db, 'likes', likeId);
    transaction.set(likeRef, {
      id: likeId,
      fromUserId,
      toUserId,
      createdAt: serverTimestamp()
    });
    
    // If mutual like exists, create a match
    if (reverseLike.exists()) {
      const matchId = [fromUserId, toUserId].sort().join('_');
      const matchRef = doc(db, 'matches', matchId);
      
      // Check if match already exists
      const existingMatch = await transaction.get(matchRef);
      if (!existingMatch.exists()) {
        transaction.set(matchRef, {
          id: matchId,
          users: [fromUserId, toUserId].sort(),
          createdAt: serverTimestamp(),
          active: true
        });
      }
      
      return { matched: true, matchId };
    }
    
    return { matched: false };
  });
}

/**
 * Check if two users have mutually liked each other
 */
export async function checkMutualLike(userId1: string, userId2: string): Promise<boolean> {
  const like1Id = `${userId1}_${userId2}`;
  const like2Id = `${userId2}_${userId1}`;
  
  const [like1, like2] = await Promise.all([
    getDoc(doc(db, 'likes', like1Id)),
    getDoc(doc(db, 'likes', like2Id))
  ]);
  
  return like1.exists() && like2.exists();
}

/**
 * Get all active matches for a user
 */
export async function getMatches(userId: string): Promise<Match[]> {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('users', 'array-contains', userId),
    where('active', '==', true),
    orderBy('lastMessageAt', 'desc')
  );
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Match[];
  } catch {
    // If no lastMessageAt field, fallback to createdAt ordering
    const fallbackQ = query(
      matchesRef,
      where('users', 'array-contains', userId),
      where('active', '==', true)
    );
    const snapshot = await getDocs(fallbackQ);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Match[];
  }
}

/**
 * Get the other user's ID from a match
 */
export function getOtherUserId(match: Match, currentUserId: string): string {
  return match.users.find(id => id !== currentUserId) || '';
}

/**
 * Unmatch - sets match to inactive
 */
export async function unmatch(matchId: string): Promise<void> {
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, {
    active: false,
    unmatchedAt: serverTimestamp()
  });
}

/**
 * Check if a like exists
 */
export async function hasLiked(fromUserId: string, toUserId: string): Promise<boolean> {
  const likeId = `${fromUserId}_${toUserId}`;
  const likeDoc = await getDoc(doc(db, 'likes', likeId));
  return likeDoc.exists();
}

/**
 * Get match by ID
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  const matchDoc = await getDoc(doc(db, 'matches', matchId));
  if (!matchDoc.exists()) return null;
  return { id: matchDoc.id, ...matchDoc.data() } as Match;
}
