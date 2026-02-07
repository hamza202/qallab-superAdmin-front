import { ref } from 'vue';
import { toast, type ToastOptions } from 'vue3-toastify';

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

    // Use vue3-toastify for actual display
    const toastOptions: ToastOptions = {
      autoClose: timeout,
      position: 'top-left',
      rtl: true,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
      default:
        toast.info(message, toastOptions);
        break;
    }

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

  /**
   * Handle API error response and show each validation error as a separate toast
   * @param err - The error object from axios catch block (e?.response?.data)
   * @param fallbackMessage - Message to show if no errors object found
   * @param timeout - Toast display duration
   * 
   * Expected API response format:
   * {
   *   status: false,
   *   code: 422,
   *   message: "البيانات المُدخلة غير صحيحة!",
   *   errors: {
   *     field_name: ["رسالة الخطأ"],
   *     "nested.field": ["رسالة أخرى"]
   *   }
   * }
   */
  const apiError = (
    err: any,
    fallbackMessage: string = 'حدث خطأ أثناء العملية',
    timeout?: number
  ) => {
    const responseData = err?.response?.data;
    
    // Check if errors object exists and has validation errors
    if (responseData?.errors && typeof responseData.errors === 'object') {
      const errorsObj = responseData.errors as Record<string, string[]>;
      
      // Iterate through all error fields and show each message
      Object.values(errorsObj).forEach((messages) => {
        if (Array.isArray(messages)) {
          messages.forEach((message) => {
            if (message && typeof message === 'string') {
              showNotification(message, 'error', timeout);
            }
          });
        }
      });
    } else {
      // Fallback to message or default fallback
      const message = responseData?.message || fallbackMessage;
      showNotification(message, 'error', timeout);
    }
  };

  return {
    notification,
    showNotification,
    hideNotification,
    success,
    error,
    warning,
    info,
    apiError,
  };
}

export default useNotification;

