import { useApi } from '@/composables/useApi';

export interface NotificationData {
  id: string;
  type: string;
  data: {
    title?: { ar: string; en: string };
    message?: { ar: string; en: string };
    extra?: any;
  };
  schema_version?: number;
  entity?: string;
  entity_id?: number | null;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  created_at_display: string;
  section: 'today' | 'previous';
}

export interface NotificationsListResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: NotificationData[];
  unread_count: number;
  pagination?: {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
  };
}

export interface UnreadCountResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    unread_count: number;
  };
}

export interface DeviceTokenResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    id: number;
    platform: string;
    updated_at: string;
  };
}

export interface DeleteTokenResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    deleted: boolean;
  };
}

export interface MarkReadResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: null;
  unread_count: number;
}

export interface ReadAllResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    updated_count: number;
  };
}

export interface DeleteAllResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    deleted_count: number;
  };
}

export const useNotificationsApi = () => {
  const api = useApi();
  const baseUrl = '/admin/notifications';

  /**
   * Get paginated list of notifications
   * @param params Query parameters (per_page, unread_only, section, cursor)
   */
  const getNotifications = async (params?: {
    per_page?: number;
    unread_only?: boolean;
    section?: 'today' | 'previous';
    cursor?: string;
  }): Promise<NotificationsListResponse> => {
    return api.get<NotificationsListResponse>(baseUrl, { params });
  };

  /**
   * Get unread notifications count
   */
  const getUnreadCount = async (): Promise<UnreadCountResponse> => {
    return api.get<UnreadCountResponse>(`${baseUrl}/unread-count`);
  };

  /**
   * Register FCM device token
   * @param token FCM device token (max 512 chars)
   * @param platform Platform: 'android' | 'ios' | 'web'
   */
  const registerDeviceToken = async (
    token: string,
    platform?: 'android' | 'ios' | 'web'
  ): Promise<DeviceTokenResponse> => {
    return api.post<DeviceTokenResponse>(`${baseUrl}/device-token`, {
      token,
      platform,
    });
  };

  /**
   * Unregister FCM device token
   * @param token FCM device token to remove
   */
  const unregisterDeviceToken = async (token: string): Promise<DeleteTokenResponse> => {
    return api.delete<DeleteTokenResponse>(`${baseUrl}/device-token`, {
      data: { token },
    });
  };

  /**
   * Mark a single notification as read
   * @param notificationId UUID of the notification
   */
  const markAsRead = async (notificationId: string): Promise<MarkReadResponse> => {
    return api.patch<MarkReadResponse>(`${baseUrl}/${notificationId}/read`);
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (): Promise<ReadAllResponse> => {
    return api.patch<ReadAllResponse>(`${baseUrl}/read-all`);
  };

  /**
   * Delete a single notification
   * @param notificationId UUID of the notification
   */
  const deleteNotification = async (notificationId: string): Promise<MarkReadResponse> => {
    return api.delete<MarkReadResponse>(`${baseUrl}/${notificationId}`);
  };

  /**
   * Delete all user notifications
   */
  const deleteAllNotifications = async (): Promise<DeleteAllResponse> => {
    return api.delete<DeleteAllResponse>(`${baseUrl}`);
  };

  return {
    getNotifications,
    getUnreadCount,
    registerDeviceToken,
    unregisterDeviceToken,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
