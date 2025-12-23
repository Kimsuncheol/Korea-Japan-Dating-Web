import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export type ReportCategory = 'spam' | 'harassment' | 'inappropriate' | 'impersonation' | 'other';
export type ReportContextType = 'profile' | 'chat';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: ReportCategory;
  description: string;
  contextType: ReportContextType;
  contextId?: string;
  status: ReportStatus;
  createdAt: Timestamp;
}

/**
 * Block a user
 */
export async function blockUser(userId: string, blockedUserId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(blockedUserId)
  });
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string, blockedUserId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    blockedUsers: arrayRemove(blockedUserId)
  });
}

/**
 * Check if a user is blocked
 */
export async function isBlocked(userId: string, targetUserId: string): Promise<boolean> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return false;
  
  const blockedUsers = userDoc.data()?.blockedUsers || [];
  return blockedUsers.includes(targetUserId);
}

/**
 * Check if either user has blocked the other
 */
export async function isEitherBlocked(userId1: string, userId2: string): Promise<boolean> {
  const [blocked1, blocked2] = await Promise.all([
    isBlocked(userId1, userId2),
    isBlocked(userId2, userId1)
  ]);
  return blocked1 || blocked2;
}

/**
 * Get list of blocked user IDs
 */
export async function getBlockedUsers(userId: string): Promise<string[]> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return [];
  return userDoc.data()?.blockedUsers || [];
}

/**
 * Report a user - creates a moderation ticket
 */
export async function reportUser(
  reporterId: string,
  reportedUserId: string,
  category: ReportCategory,
  description: string,
  contextType: ReportContextType,
  contextId?: string
): Promise<string> {
  const reportsRef = collection(db, 'reports');
  
  const reportDoc = await addDoc(reportsRef, {
    reporterId,
    reportedUserId,
    category,
    description,
    contextType,
    contextId: contextId || null,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  
  return reportDoc.id;
}

/**
 * Report categories with labels
 */
export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'spam', label: 'Spam/Scam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' }
];
