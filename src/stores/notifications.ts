import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useNotificationsApi, type NotificationData } from '@/services/notifications.api';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  createdAtDisplay: string;
  section: 'today' | 'previous';
  entity?: string;
  entityId?: number | null;
  rawData?: any;
}

function mapNotificationData(data: NotificationData): AppNotification {
  return {
    id: data.id,
    type: data.type,
    title: data.title,
    message: data.message,
    read: !!data.read_at,
    createdAt: data.created_at,
    createdAtDisplay: data.created_at_display,
    section: data.section,
    entity: data.entity,
    entityId: data.entity_id,
    rawData: data.data,
  };
}

export const useNotificationsStore = defineStore("notifications", () => {
  const api = useNotificationsApi();
  
  const items = ref<AppNotification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const nextCursor = ref<string | null>(null);
  const hasMore = ref(true);

  async function fetchNotifications(params?: {
    per_page?: number;
    unread_only?: boolean;
    section?: 'today' | 'previous';
    cursor?: string;
  }) {
    try {
      loading.value = true;
      const response = await api.getNotifications(params);
      
      const notifications = response.data.map(mapNotificationData);
      
      if (params?.cursor) {
        items.value = [...items.value, ...notifications];
      } else {
        items.value = notifications;
      }
      
      unreadCount.value = response.unread_count;
      nextCursor.value = response.pagination?.next_cursor || null;
      hasMore.value = !!response.pagination?.next_cursor;
      
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value || !nextCursor.value) return;
    await fetchNotifications({ cursor: nextCursor.value });
  }

  async function refreshUnreadCount() {
    try {
      const response = await api.getUnreadCount();
      unreadCount.value = response.data.unread_count;
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  }

  async function markAllRead() {
    try {
      const response = await api.markAllAsRead();
      items.value = items.value.map((i) => ({ ...i, read: true }));
      unreadCount.value = 0;
      return response;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }

  async function deleteAll() {
    try {
      const response = await api.deleteAllNotifications();
      items.value = [];
      unreadCount.value = 0;
      return response;
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  }

  async function remove(id: string) {
    try {
      await api.deleteNotification(id);
      items.value = items.value.filter((i) => i.id !== id);
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async function markRead(id: string) {
    try {
      const response = await api.markAsRead(id);
      const idx = items.value.findIndex((i) => i.id === id);
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], read: true };
      }
      unreadCount.value = response.unread_count;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  return {
    items,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    refreshUnreadCount,
    markAllRead,
    deleteAll,
    remove,
    markRead,
  };
});
