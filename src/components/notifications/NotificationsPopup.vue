<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLocaleStore } from "@/stores/locale";
import { useNotificationsStore } from "@/stores/notifications";
import { billIcon, closeIcon, expandIcon } from "../icons/globalIcons";

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

function openFullPage() {
  emit("close");
  router.push({ name: "Notifications" });
}

function onRowClick(n: any) {
  if (!n.read) notificationsStore.markRead(n.id);
}

onMounted(() => {
  notificationsStore.fetchNotifications({ per_page: 15 });
});
</script>

<template>
  <div
    class="bg-white !rounded-[16px] border !border-gray-200 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] overflow-hidden flex flex-col w-full md:w-[520px]"
    style="height: min(90vh, 500px)">
    <!-- ── Header ── -->
    <header class="flex flex-col gap-1 px-6 pt-5 pb-4 border-b !border-gray-200 shrink-0">
      <!-- Top row: icon + title | actions -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0 flex-1 text-primary-600">
          <span v-html="billIcon"></span>
          <p class="text-lg font-bold m-0 leading-tight">
            {{ t("notifications.title") }}
          </p>
        </div>
        <!-- actions: close + expand -->
        <div class="flex items-center gap-2 shrink-0">
          <v-btn icon variant="text" size="small" density="comfortable" class="!text-gray-400 hover:!text-gray-600"
            @click="openFullPage">
            <span v-html="expandIcon"></span>
          </v-btn>
          <v-btn icon variant="text" size="small" density="comfortable" class="!text-gray-400 hover:!text-gray-600"
            @click="emit('close')">
            <span v-html="closeIcon"></span>
          </v-btn>
        </div>
      </div>
      <!-- Subtitle -->
      <p class="text-sm text-gray-500 m-0 leading-relaxed" :class="isRtl ? 'text-right' : 'text-left'">
        {{ t("notifications.popupSubtitle") }}
      </p>
    </header>

    <!-- ── Filter row ── -->
    <div class="flex items-center justify-between gap-3 px-6 py-3 border-b !border-gray-200 shrink-0">
      <!-- count label (start = right in RTL, left in LTR) -->
      <p class="text-sm text-primary-600 font-bold m-0 leading-none">
        {{ t("notifications.newCount", { count: unreadCount }) }}
      </p>
      <!-- filter buttons (end = left in RTL) -->
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" class="text-[13px] font-bold px-3 h-8 rounded border transition-colors border-primary-600 text-primary-600 bg-primary-50"  @click="filterTab = 'all'">{{
            t("notifications.tabAll") }}</button>
        <button type="button" class="text-[13px] font-bold px-3 h-8 rounded border transition-colors !border-gray-400 !text-gray-400 bg-white" 
           @click="filterTab = 'unread'">{{
            t("notifications.tabUnread") }}</button>
      </div>
    </div>

    <!-- ── List ── -->
    <div class="overflow-y-auto flex-1 min-h-0 light-scroll" style="max-height: 400px">
      <div v-if="visibleItems.length === 0" class="text-center text-gray-400 py-12 text-sm">
        {{ t("notifications.empty") }}
      </div>
      <template v-else>
        <button v-for="n in visibleItems" :key="n.id" type="button"
          class="w-full text-start border-0 m-0 p-0 appearance-none cursor-pointer block border-b !border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50"
          :class="n.read ? 'bg-white' : 'bg-[#EFF8FF]'" @click="onRowClick(n)">
          <!--
            Row layout — always LTR at the grid level so column order is predictable:
              col-1 (auto) : timestamp   → physically LEFT
              col-2 (1fr)  : content     → physically MIDDLE (text direction set per locale)
              col-3 (4px)  : accent bar  → physically RIGHT
          -->
          <div class="grid items-stretch min-h-[6rem]" style="direction: rtl; grid-template-columns: 3px 1fr auto">
            <!-- accent bar -->
            <span class="self-stretch w-full shrink-0 bg-[#E3E8EF] me-4 -translate-x-[10px] h-[50%] rounded-lg my-auto" aria-hidden="true" />

            <!-- content -->
            <div class="py-3 pe-3 ps-6 flex flex-col justify-center gap-1.5 min-w-0"
              :style="{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }">
              <p class="text-[15px] font-bold text-gray-900 m-0 leading-snug">
                {{ n.title }}
              </p>
              <p class="text-[13px] text-gray-500 m-0 leading-relaxed line-clamp-2">
                {{ n.message }}
              </p>
            </div>

            <!-- timestamp -->
            <p class="text-[11px] text-gray-400 m-0 self-start pt-4 whitespace-nowrap px-4 leading-snug">
              {{ n.createdAtDisplay }}
            </p>


          </div>
        </button>
      </template>
    </div>

    <!-- ── Footer ── -->
    <!-- <footer class="px-6 py-3 border-t border-[#F2F4F7] shrink-0 flex justify-end bg-white">
      <button type="button"
        class="text-sm font-semibold text-primary-600 bg-transparent border-0 cursor-pointer px-2 py-1.5 hover:underline transition-all"
        @click="openFullPage">
        {{ t("notifications.viewAll") }}
      </button>
    </footer> -->
  </div>
</template>


<style>
/* Scroll container */
.light-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: #d9dee5 transparent;
  /* thumb / track */
}

/* Chrome, Edge, Safari */
.light-scroll::-webkit-scrollbar {
  width: 6px;
}

.light-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.light-scroll::-webkit-scrollbar-thumb {
  background: #d9dee5;
  border-radius: 999px;
}

.light-scroll::-webkit-scrollbar-thumb:hover {
  background: #cfd6de;
}
</style>