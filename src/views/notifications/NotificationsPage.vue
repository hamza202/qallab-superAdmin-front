<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { useLocaleStore } from "@/stores/locale";
import { useNotificationsStore, type AppNotification } from "@/stores/notifications";
import { formatNotificationTimeLabel, isSameCalendarDay } from "@/utils/notificationDisplay";
import { billIcon, checkSquareIcon, solidBillIcon, trash_1_icon, trash_2_icon } from "@/components/icons/globalIcons";

const { t } = useI18n();
const router = useRouter();
const localeStore = useLocaleStore();
const notificationsStore = useNotificationsStore();
const { items, unreadCount } = storeToRefs(notificationsStore);

const filterTab = ref<"all" | "unread">("all");

const locale = computed(() => (localeStore.currentLocale === "ar" ? "ar" : "en"));

const sortedVisible = computed(() => {
  const list = [...items.value];
  list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (filterTab.value === "unread") {
    return list.filter((i) => !i.read);
  }
  return list;
});

const todayItems = computed(() => {
  const now = new Date();
  return sortedVisible.value.filter((i) => isSameCalendarDay(new Date(i.createdAt), now));
});

const previousItems = computed(() => {
  const now = new Date();
  return sortedVisible.value.filter((i) => !isSameCalendarDay(new Date(i.createdAt), now));
});

function titleOf(n: AppNotification) {
  return locale.value === "ar" ? n.title.ar : n.title.en;
}

function descriptionOf(n: AppNotification) {
  return locale.value === "ar" ? n.description.ar : n.description.en;
}

function actionLabelOf(n: AppNotification) {
  if (!n.action) return "";
  return locale.value === "ar" ? n.action.label.ar : n.action.label.en;
}

function timeLabel(iso: string) {
  return formatNotificationTimeLabel(
    iso,
    "en",
    (time) => t("notifications.time.today", { time }),
    (time) => t("notifications.time.yesterday", { time }),
  );
}

function iconWrapClass(v: AppNotification["variant"]) {
  if (v === "warning") return "bg-warning-300";
  if (v === "info") return "bg-blue-600";
  return "bg-gray-500";
}

function setFilter(tab: "all" | "unread") {
  filterTab.value = tab;
}

function onCardClick(n: AppNotification) {
  if (!n.read) notificationsStore.markRead(n.id);
}

function onActionClick(e: Event, n: AppNotification) {
  e.stopPropagation();
  if (n.action?.to && n.action.to !== "#") {
    router.push(n.action.to);
  }
}
</script>

<template>
  <default-layout>
    <div class="space-y-6 -mx-6">
      <div class="flex items-center gap-3 text-primary-600 border-b !border-gray-200 pb-6 px-6">
        <span v-html="billIcon"></span>
        <div>
          <h1 class="text-xl font-bold  m-0">
            {{ t("notifications.title") }}
          </h1>
        </div>
      </div>

      <div class="flex flex-wrap items-start gap-3 flex flex-col gap-4 lg:flex-row lg:justify-between px-6">
        <div>
          <div class="flex gap-2">
            <v-btn variant="flat" height="42" 
              class="text-[13px] font-bold !rounded border transition-colors border-primary-600 text-primary-600 bg-primary-50"
              @click="setFilter('all')">
              {{ t("notifications.tabAll") }}
            </v-btn>
            <v-btn variant="flat" height="42"  class="text-[13px] font-bold !rounded border transition-colors border-gray-400 !text-gray-400 bg-white"  @click="setFilter('unread')">
              {{ t("notifications.tabUnread") }}
            </v-btn>
          </div>
          <p class="text-sm text-primary-500 m-0 mt-2 font-bold">
            {{ t("notifications.newCount", { count: unreadCount }) }}
          </p>
        </div>

        <div class="flex gap-3">
          <ButtonWithIcon color="success" variant="flat" class="!bg-emerald-100 !text-emerald-700 font-bold"
            height="42" rounded="4" :prepend-icon="checkSquareIcon" :label="t('notifications.markAllRead')"
            @click="notificationsStore.markAllRead()" />
          <ButtonWithIcon color="error" variant="flat" class="!bg-red-100 !text-red-600 font-bold" height="42"
            rounded="4" :prepend-icon="trash_2_icon" :label="t('notifications.deleteAll')"
            @click="notificationsStore.deleteAll()" />
        </div>
      </div>


      <div v-if="sortedVisible.length === 0" class="text-center text-gray-500 py-16 px-6">
        {{ t("notifications.empty") }}
      </div>

      <template v-else>
        <section v-if="todayItems.length > 0" class="space-y-3 px-6">
          <h2 class="text-base font-bold text-gray-500 m-0">
            {{ t("notifications.sectionToday") }}
          </h2>
          <div class="space-y-3">
            <div v-for="n in todayItems" :key="n.id" role="button" tabindex="0"
              class="rounded-2xl border !border-gray-200 bg-white p-4 flex gap-4 items-start cursor-pointer hover:border-primary-200 transition-colors shadow-sm"
              @click="onCardClick(n)" @keydown.enter="onCardClick(n)">
              <div class="shrink-0 w-[40px] h-[40px] rounded-lg flex items-center justify-center"
                :class="iconWrapClass(n.variant)">
                <span v-html="solidBillIcon"></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 m-0 leading-snug">
                  {{ titleOf(n) }}
                </p>
                <p class="text-sm text-gray-500 mt-1 m-0">
                  {{ descriptionOf(n) }}
                </p>
                <v-btn v-if="n.action" variant="tonal" color="primary"  class="text-none mt-3"
                  prepend-icon="mdi-link-variant" rounded="4" @click="onActionClick($event, n)">
                  {{ actionLabelOf(n) }}
                </v-btn>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-2">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{
                  timeLabel(n.createdAt)
                }}</span>
                <v-btn icon variant="text" size="x-small" class="text-gray-400"
                  @click.stop="notificationsStore.remove(n.id)">
                <span v-html="trash_2_icon"></span>
                </v-btn>
              </div>
            </div>
          </div>
        </section>

        <section v-if="previousItems.length > 0" class="space-y-3 pt-2 px-6">
          <h2 class="text-base font-bold text-gray-500 m-0">
            {{ t("notifications.sectionPrevious") }}
          </h2>
          <div class="space-y-3">
            <div v-for="n in previousItems" :key="n.id" role="button" tabindex="0"
              class="rounded-2xl border !border-gray-200 bg-white p-4 flex gap-4 items-start cursor-pointer hover:border-primary-200 transition-colors shadow-sm"
              @click="onCardClick(n)" @keydown.enter="onCardClick(n)">
              <div class="shrink-0 w-[40px] h-[40px] rounded-lg flex items-center justify-center"
                :class="iconWrapClass(n.variant)">
                <span v-html="solidBillIcon"></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 m-0 leading-snug">
                  {{ titleOf(n) }}
                </p>
                <p class="text-sm text-gray-500 mt-1 m-0">
                  {{ descriptionOf(n) }}
                </p>
                <v-btn v-if="n.action" variant="tonal" color="primary" class="text-none mt-3"
                  prepend-icon="mdi-link-variant" rounded="4" @click="onActionClick($event, n)">
                  {{ actionLabelOf(n) }}
                </v-btn>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-2">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{
                  timeLabel(n.createdAt)
                }}</span>
                <v-btn icon variant="text" size="x-small" class="text-gray-400"
                  @click.stop="notificationsStore.remove(n.id)">
                <span v-html="trash_2_icon"></span>
                </v-btn>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </default-layout>
</template>
