<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLocaleStore } from "@/stores/locale";
import { useNotificationsStore, type AppNotification } from "@/stores/notifications";
import { formatNotificationTimeLabel } from "@/utils/notificationDisplay";

const emit = defineEmits<{ (e: "close"): void }>();

const { t } = useI18n();
const router = useRouter();
const localeStore = useLocaleStore();
const notificationsStore = useNotificationsStore();
const { items, unreadCount } = storeToRefs(notificationsStore);

const filterTab = ref<"all" | "unread">("all");

const visibleItems = computed(() => {
  const list = [...items.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return filterTab.value === "unread" ? list.filter((i) => !i.read) : list;
});

const isRtl = computed(() => localeStore.currentLocale === "ar");

function titleOf(n: AppNotification) {
  return isRtl.value ? n.title.ar : n.title.en;
}
function descriptionOf(n: AppNotification) {
  return isRtl.value ? n.description.ar : n.description.en;
}
function timeLabel(iso: string) {
  return formatNotificationTimeLabel(
    iso,
    isRtl.value ? "ar" : "en",
    (time) => t("notifications.time.today", { time }),
    (time) => t("notifications.time.yesterday", { time }),
  );
}
function openFullPage() {
  emit("close");
  router.push({ name: "Notifications" });
}
function onRowClick(n: AppNotification) {
  if (!n.read) notificationsStore.markRead(n.id);
}
</script>

<template>
  <div
    class="bg-white rounded-[20px] border border-[#E3E8EF] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] overflow-hidden flex flex-col"
    style="max-height: min(520px, calc(100vh - 96px))"
  >
    <!-- ── Header ── -->
    <header class="flex items-center justify-between gap-3 px-5 pt-4 pb-4 border-b border-[#F2F4F7] shrink-0">
      <!-- icon + title/subtitle -->
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <v-icon size="26" color="primary" class="shrink-0">mdi-bell-outline</v-icon>
        <div class="min-w-0">
          <p class="text-[15px] font-bold text-primary-600 m-0 leading-tight">
            {{ t("notifications.title") }}
          </p>
          <p class="text-xs text-gray-400 m-0 mt-0.5 leading-tight">
            {{ t("notifications.popupSubtitle") }}
          </p>
        </div>
      </div>
      <!-- actions: close + expand -->
      <div class="flex items-center shrink-0">
        <v-btn icon variant="text" size="small" density="comfortable"
          class="!text-gray-400 hover:!text-gray-600"
          @click="emit('close')">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" density="comfortable"
          class="!text-gray-400 hover:!text-gray-600"
          @click="openFullPage">
          <v-icon size="18">mdi-arrow-expand-all</v-icon>
        </v-btn>
      </div>
    </header>

    <!-- ── Filter row ── -->
    <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#F2F4F7] shrink-0">
      <!-- count label (start = right in RTL, left in LTR) -->
      <p class="text-sm text-primary-600 font-medium m-0 leading-none">
        {{ t("notifications.newCount", { count: unreadCount }) }}
      </p>
      <!-- filter buttons (end = left in RTL) -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="text-sm font-semibold px-4 h-9 rounded-lg border transition-colors"
          :class="filterTab === 'all'
            ? 'border-primary-600 text-primary-600 bg-white'
            : 'border-gray-200 text-gray-500 bg-white'"
          @click="filterTab = 'all'"
        >{{ t("notifications.tabAll") }}</button>
        <button
          type="button"
          class="text-sm font-semibold px-4 h-9 rounded-lg border transition-colors"
          :class="filterTab === 'unread'
            ? 'border-primary-600 text-primary-600 bg-white'
            : 'border-gray-200 text-gray-500 bg-white'"
          @click="filterTab = 'unread'"
        >{{ t("notifications.tabUnread") }}</button>
      </div>
    </div>

    <!-- ── List ── -->
    <div class="overflow-y-auto flex-1 min-h-0">
      <div v-if="visibleItems.length === 0"
        class="text-center text-gray-400 py-12 text-sm">
        {{ t("notifications.empty") }}
      </div>
      <template v-else>
        <button
          v-for="n in visibleItems"
          :key="n.id"
          type="button"
          class="w-full text-start border-0 m-0 p-0 appearance-none cursor-pointer block border-b border-[#F2F4F7] last:border-b-0"
          :class="n.read ? 'bg-white' : 'bg-[#EFF8FF]'"
          @click="onRowClick(n)"
        >
          <!--
            Row layout — always LTR at the grid level so column order is predictable:
              col-1 (auto) : timestamp   → physically LEFT
              col-2 (1fr)  : content     → physically MIDDLE (text direction set per locale)
              col-3 (4px)  : accent bar  → physically RIGHT
          -->
          <div
            class="grid items-stretch min-h-[5rem]"
            style="direction: ltr; grid-template-columns: auto 1fr 4px"
          >
            <!-- timestamp -->
            <p class="text-[11px] text-gray-400 m-0 self-center whitespace-nowrap px-3 leading-snug">
              {{ timeLabel(n.createdAt) }}
            </p>

            <!-- content -->
            <div
              class="py-3 pe-2 flex flex-col justify-center gap-1 min-w-0"
              :style="{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }"
            >
              <p class="text-sm font-bold text-gray-900 m-0 leading-snug">
                {{ titleOf(n) }}
              </p>
              <p class="text-xs text-gray-500 m-0 leading-relaxed line-clamp-2">
                {{ descriptionOf(n) }}
              </p>
            </div>

            <!-- accent bar -->
            <span
              class="self-stretch w-full shrink-0"
              :class="n.read ? 'bg-[#F59E0B]' : 'bg-primary-600'"
              aria-hidden="true"
            />
          </div>
        </button>
      </template>
    </div>

    <!-- ── Footer ── -->
    <footer class="px-5 py-2.5 border-t border-[#F2F4F7] shrink-0 flex justify-end bg-white">
      <button
        type="button"
        class="text-sm font-semibold text-primary-600 bg-transparent border-0 cursor-pointer px-1 py-1"
        @click="openFullPage"
      >
        {{ t("notifications.viewAll") }}
      </button>
    </footer>
  </div>
</template>
