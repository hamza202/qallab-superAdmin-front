import { onMounted, onUnmounted } from 'vue';
import { fcmService } from '@/services/fcm.service';
import { useNotificationsStore } from '@/stores/notifications';

/**
 * Composable to handle FCM initialization and foreground messages
 * @param firebaseConfig Firebase configuration object
 * @param vapidKey VAPID public key for web push
 */
export const useFCM = (
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  },
  vapidKey: string
) => {
  const notificationsStore = useNotificationsStore();
  let unsubscribe: (() => void) | null = null;

  const setupFCM = async () => {
    // Check if FCM is supported
    if (!fcmService.isSupported()) {
      console.warn('FCM is not supported in this browser');
      return;
    }

    try {
      // Setup push notifications
      const token = await fcmService.setupPushNotifications(firebaseConfig, vapidKey);
      
      if (token) {
        console.log('FCM token registered successfully');
        
        // Listen for foreground messages
        unsubscribe = fcmService.onForegroundMessage((payload) => {
          console.log('Foreground notification received:', payload);
          
          // Refresh notifications list when a new notification arrives
          notificationsStore.fetchNotifications({ per_page: 15 });
          notificationsStore.refreshUnreadCount();
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted' && payload.notification) {
            new Notification(payload.notification.title || 'New Notification', {
              body: payload.notification.body || '',
              icon: payload.notification.icon || '/favicon.svg',
              badge: '/favicon.svg',
              data: payload.data,
            });
          }
        });
      } else {
        console.warn('Failed to get FCM token');
      }
    } catch (error) {
      console.error('Failed to setup FCM:', error);
    }
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  onMounted(() => {
    setupFCM();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    setupFCM,
    cleanup,
  };
};
