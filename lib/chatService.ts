import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc,
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: Timestamp;
  read: boolean;
  translatedText?: string;
}

export interface ChatSubscription {
  unsubscribe: () => void;
}

/**
 * Send a text message
 */
export async function sendMessage(
  matchId: string, 
  senderId: string, 
  text: string,
  imageUrl?: string
): Promise<string> {
  const messagesRef = collection(db, 'chats', matchId, 'messages');
  
  const messageDoc = await addDoc(messagesRef, {
    senderId,
    text,
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
    read: false
  });
  
  // Update match with last message preview
  const matchRef = doc(db, 'matches', matchId);
  await updateDoc(matchRef, {
    lastMessage: text.substring(0, 50),
    lastMessageAt: serverTimestamp()
  });
  
  return messageDoc.id;
}

/**
 * Subscribe to messages in real-time
 */
export function subscribeToMessages(
  matchId: string, 
  callback: (messages: Message[]) => void
): ChatSubscription {
  const messagesRef = collection(db, 'chats', matchId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
  
  return { unsubscribe };
}

/**
 * Mark a message as read
 */
export async function markAsRead(matchId: string, messageId: string): Promise<void> {
  const messageRef = doc(db, 'chats', matchId, 'messages', messageId);
  await updateDoc(messageRef, { read: true });
}

/**
 * Mark all messages from other user as read
 */
export async function markAllAsRead(matchId: string, currentUserId: string): Promise<void> {
  // This would require a batch update or cloud function for efficiency
  // For MVP, we'll handle this on message-by-message basis
}

/**
 * Upload an image and return the download URL
 */
export async function uploadChatImage(
  matchId: string, 
  senderId: string, 
  file: File
): Promise<string> {
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `chats/${matchId}/${senderId}/${filename}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Translate a message (mock implementation for MVP)
 * In production, integrate Google Cloud Translate API
 */
export async function translateMessage(
  text: string, 
  targetLang: 'ko' | 'ja' | 'en'
): Promise<string> {
  // Mock translation for MVP
  // Replace with actual Google Translate API call
  const translations: Record<string, Record<string, string>> = {
    'Hello': { ko: '안녕하세요', ja: 'こんにちは', en: 'Hello' },
    '안녕하세요': { ko: '안녕하세요', ja: 'こんにちは', en: 'Hello' },
    'こんにちは': { ko: '안녕하세요', ja: 'こんにちは', en: 'Hello' },
  };
  
  if (translations[text]?.[targetLang]) {
    return translations[text][targetLang];
  }
  
  // Return original with prefix for demo
  return `[${targetLang.toUpperCase()}] ${text}`;
}

/**
 * Check if chat is accessible (match is active and not blocked)
 */
export async function isChatAccessible(matchId: string, userId: string): Promise<boolean> {
  const matchRef = doc(db, 'matches', matchId);
  const matchDoc = await getDoc(matchRef);
  
  if (!matchDoc.exists()) return false;
  
  const match = matchDoc.data();
  
  // Check if user is part of match
  if (!match.users.includes(userId)) return false;
  
  // Check if match is active
  if (!match.active) return false;
  
  return true;
}
