'use client';

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface NotificationSettings {
  matching: boolean;
  messages: boolean;
  likes: boolean;
  pushEnabled: boolean;
  pushSubscription?: PushSubscriptionJSON | null;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  matching: true,
  messages: true,
  likes: true,
  pushEnabled: false,
  pushSubscription: null
};

/**
 * Check if browser supports Web Push
 */
export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Get notification settings for a user
 */
export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return { ...DEFAULT_SETTINGS, ...settingsDoc.data() } as NotificationSettings;
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update notification settings for a user
 */
export async function updateNotificationSettings(
  userId: string, 
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, settings);
    } else {
      await setDoc(settingsRef, { ...DEFAULT_SETTINGS, ...settings });
    }
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return false;
    }

    // For MVP, we'll use local notifications
    // In production, you'd register a service worker and get a push subscription
    await updateNotificationSettings(userId, { 
      pushEnabled: true 
    });

    return true;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  await updateNotificationSettings(userId, { 
    pushEnabled: false,
    pushSubscription: null
  });
}

/**
 * Send a local notification (for testing/demo purposes)
 */
export async function sendLocalNotification(
  title: string, 
  body: string, 
  icon?: string
): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'koja-match-notification'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Check if a specific notification type is enabled
 */
export async function isNotificationTypeEnabled(
  userId: string, 
  type: 'matching' | 'messages' | 'likes'
): Promise<boolean> {
  const settings = await getNotificationSettings(userId);
  return settings.pushEnabled && settings[type];
}
