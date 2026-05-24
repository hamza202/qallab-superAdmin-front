import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { useNotificationsApi } from './notifications.api';

export class FCMService {
  private messaging: Messaging | null = null;
  private initialized = false;

  /**
   * Initialize Firebase Cloud Messaging
   * @param firebaseConfig Firebase configuration object
   */
  async initialize(firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }): Promise<void> {
    if (this.initialized) {
      console.warn('FCM already initialized');
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      this.messaging = getMessaging(app);
      this.initialized = true;
      console.log('FCM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      throw error;
    }
  }

  /**
   * Request notification permission and get FCM token
   * @param vapidKey VAPID public key for web push
   * @returns FCM token or null if permission denied
   */
  async requestPermissionAndGetToken(vapidKey: string): Promise<string | null> {
    if (!this.messaging) {
      console.error('FCM not initialized');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      const token = await getToken(this.messaging, { vapidKey });
      console.log('FCM token obtained:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   * @param token FCM device token
   * @param platform Platform type
   */
  async registerToken(
    token: string,
    platform: 'android' | 'ios' | 'web' = 'web'
  ): Promise<boolean> {
    try {
      const api = useNotificationsApi();
      await api.registerDeviceToken(token, platform);
      console.log('FCM token registered with backend');
      return true;
    } catch (error) {
      console.error('Failed to register FCM token:', error);
      return false;
    }
  }

  /**
   * Unregister FCM token from backend
   * @param token FCM device token to remove
   */
  async unregisterToken(token: string): Promise<boolean> {
    try {
      const api = useNotificationsApi();
      await api.unregisterDeviceToken(token);
      console.log('FCM token unregistered from backend');
      return true;
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
      return false;
    }
  }

  /**
   * Set up foreground message listener
   * @param callback Function to call when message received
   */
  onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
    if (!this.messaging) {
      console.error('FCM not initialized');
      return null;
    }

    const unsubscribe = onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  }

  /**
   * Complete flow: initialize, request permission, get token, and register
   * @param firebaseConfig Firebase configuration
   * @param vapidKey VAPID public key
   * @returns FCM token or null
   */
  async setupPushNotifications(
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    },
    vapidKey: string
  ): Promise<string | null> {
    try {
      await this.initialize(firebaseConfig);
      const token = await this.requestPermissionAndGetToken(vapidKey);
      
      if (token) {
        await this.registerToken(token, 'web');
        // Store token in localStorage for later unregistration
        localStorage.setItem('fcm_token', token);
      }
      
      return token;
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
      return null;
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

// Singleton instance
export const fcmService = new FCMService();
