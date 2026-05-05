import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type NotificationVariant = "warning" | "info" | "neutral";

export interface AppNotification {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  read: boolean;
  createdAt: string;
  variant: NotificationVariant;
  action?: {
    label: { ar: string; en: string };
    to?: string;
  };
}

const DEMO_DESC = {
  ar: "يمكنك متابعة التفاصيل والإجراءات المرتبطة بهذا الإشعار من الرابط أدناه عند توفره.",
  en: "Review the details and any next steps for this notification below.",
};

function seedNotifications(): AppNotification[] {
  const now = new Date();
  const todayIso = now.toISOString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const older = new Date(now);
  older.setDate(older.getDate() - 5);

  return [
    {
      id: "1",
      title: {
        ar: "عرض السعر تم الموافقة عليه",
        en: "Price offer has been approved",
      },
      description: DEMO_DESC,
      read: false,
      createdAt: todayIso,
      variant: "warning",
      action: {
        label: { ar: "رابط العرض", en: "Offer link" },
        to: "#",
      },
    },
    {
      id: "2",
      title: {
        ar: "تم إنشاء طلبية شراء جديدة",
        en: "A new purchase order was created",
      },
      description: DEMO_DESC,
      read: false,
      createdAt: todayIso,
      variant: "info",
      action: {
        label: { ar: "رابط الطلبية", en: "Order link" },
        to: "#",
      },
    },
    {
      id: "3",
      title: {
        ar: "تنبيه: موعد التسليم اليوم",
        en: "Reminder: delivery due today",
      },
      description: DEMO_DESC,
      read: true,
      createdAt: todayIso,
      variant: "neutral",
    },
    {
      id: "4",
      title: {
        ar: "تم تحديث حالة الشحنة",
        en: "Shipment status updated",
      },
      description: DEMO_DESC,
      read: true,
      createdAt: yesterday.toISOString(),
      variant: "info",
    },
    {
      id: "5",
      title: {
        ar: "فاتورة جديدة بانتظار المراجعة",
        en: "New invoice pending review",
      },
      description: DEMO_DESC,
      read: false,
      createdAt: yesterday.toISOString(),
      variant: "warning",
    },
    {
      id: "6",
      title: {
        ar: "تم استلام الدفعة المقدمة",
        en: "Advance payment received",
      },
      description: DEMO_DESC,
      read: true,
      createdAt: older.toISOString(),
      variant: "neutral",
    },
  ];
}

export const useNotificationsStore = defineStore("notifications", () => {
  const items = ref<AppNotification[]>(seedNotifications());

  const unreadCount = computed(() => items.value.filter((i) => !i.read).length);

  function markAllRead() {
    items.value = items.value.map((i) => ({ ...i, read: true }));
  }

  function deleteAll() {
    items.value = [];
  }

  function remove(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  function markRead(id: string) {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], read: true };
    }
  }

  return {
    items,
    unreadCount,
    markAllRead,
    deleteAll,
    remove,
    markRead,
  };
});
