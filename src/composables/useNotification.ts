import { ref } from 'vue';

export interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeout?: number;
}

const notification = ref<Notification>({
  show: false,
  message: '',
  type: 'info',
  timeout: 3000,
});

export function useNotification() {
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    timeout: number = 3000
  ) => {
    notification.value = {
      show: true,
      message,
      type,
      timeout,
    };

    if (timeout > 0) {
      setTimeout(() => {
        hideNotification();
      }, timeout);
    }
  };

  const hideNotification = () => {
    notification.value.show = false;
  };

  const success = (message: string, timeout?: number) => {
    showNotification(message, 'success', timeout);
  };

  const error = (message: string, timeout?: number) => {
    showNotification(message, 'error', timeout);
  };

  const warning = (message: string, timeout?: number) => {
    showNotification(message, 'warning', timeout);
  };

  const info = (message: string, timeout?: number) => {
    showNotification(message, 'info', timeout);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    success,
    error,
    warning,
    info,
  };
}

export default useNotification;
