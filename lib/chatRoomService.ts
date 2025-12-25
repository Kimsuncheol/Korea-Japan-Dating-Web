import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { unmatch } from './matchService';

export interface ChatRoomSettings {
  pinned: boolean;
  alertsEnabled: boolean;
  pinnedAt?: string;
}

const DEFAULT_ROOM_SETTINGS: ChatRoomSettings = {
  pinned: false,
  alertsEnabled: true
};

/**
 * Get room settings for a specific match
 */
export async function getRoomSettings(
  userId: string, 
  matchId: string
): Promise<ChatRoomSettings> {
  try {
    const settingsRef = doc(db, 'users', userId, 'roomSettings', matchId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return { ...DEFAULT_ROOM_SETTINGS, ...settingsDoc.data() } as ChatRoomSettings;
    }
    
    return DEFAULT_ROOM_SETTINGS;
  } catch (error) {
    console.error('Error getting room settings:', error);
    return DEFAULT_ROOM_SETTINGS;
  }
}

/**
 * Get all room settings for a user
 */
export async function getAllRoomSettings(
  userId: string
): Promise<Record<string, ChatRoomSettings>> {
  try {
    const settingsRef = collection(db, 'users', userId, 'roomSettings');
    const snapshot = await getDocs(settingsRef);
    
    const settings: Record<string, ChatRoomSettings> = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = { ...DEFAULT_ROOM_SETTINGS, ...doc.data() } as ChatRoomSettings;
    });
    
    return settings;
  } catch (error) {
    console.error('Error getting all room settings:', error);
    return {};
  }
}

/**
 * Pin a chat room
 */
export async function pinRoom(
  userId: string, 
  matchId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'users', userId, 'roomSettings', matchId);
    const settingsDoc = await getDoc(settingsRef);
    
    const data = {
      pinned: true,
      pinnedAt: new Date().toISOString()
    };
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, data);
    } else {
      await setDoc(settingsRef, { ...DEFAULT_ROOM_SETTINGS, ...data });
    }
  } catch (error) {
    console.error('Error pinning room:', error);
    throw error;
  }
}

/**
 * Unpin a chat room
 */
export async function unpinRoom(
  userId: string, 
  matchId: string
): Promise<void> {
  try {
    const settingsRef = doc(db, 'users', userId, 'roomSettings', matchId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, { pinned: false, pinnedAt: null });
    }
  } catch (error) {
    console.error('Error unpinning room:', error);
    throw error;
  }
}

/**
 * Toggle room alerts
 */
export async function toggleRoomAlert(
  userId: string, 
  matchId: string, 
  enabled: boolean
): Promise<void> {
  try {
    const settingsRef = doc(db, 'users', userId, 'roomSettings', matchId);
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, { alertsEnabled: enabled });
    } else {
      await setDoc(settingsRef, { ...DEFAULT_ROOM_SETTINGS, alertsEnabled: enabled });
    }
  } catch (error) {
    console.error('Error toggling room alerts:', error);
    throw error;
  }
}

/**
 * Leave a chat room (uses unmatch from matchService)
 */
export async function leaveRoom(matchId: string): Promise<void> {
  await unmatch(matchId);
}
