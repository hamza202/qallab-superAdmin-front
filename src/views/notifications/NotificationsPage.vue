<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { useLocaleStore } from "@/stores/locale";
import { useNotificationsStore, type AppNotification } from "@/stores/notifications";
import { formatNotificationTimeLabel, isSameCalendarDay } from "@/utils/notificationDisplay";

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
    locale.value,
    (time) => t("notifications.time.today", { time }),
    (time) => t("notifications.time.yesterday", { time }),
  );
}

function iconWrapClass(v: AppNotification["variant"]) {
  if (v === "warning") return "bg-amber-100 text-amber-700";
  if (v === "info") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
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
    <div class="space-y-6 -mx-2">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"
          >
            <v-icon size="26">mdi-bell-outline</v-icon>
          </div>
          <div>
            <h1 class="text-xl font-bold text-primary-600 m-0">
              {{ t("notifications.title") }}
            </h1>
            <p class="text-sm text-primary-600 m-0 mt-0.5 font-medium">
              {{ t("notifications.newCount", { count: unreadCount }) }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex gap-2">
            <v-btn
              rounded="lg"
              variant="flat"
              size="small"
              class="text-none font-semibold px-5"
              :class="
                filterTab === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
              "
              @click="setFilter('all')"
            >
              {{ t("notifications.tabAll") }}
            </v-btn>
            <v-btn
              rounded="lg"
              variant="flat"
              size="small"
              class="text-none font-semibold px-5"
              :class="
                filterTab === 'unread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              "
              @click="setFilter('unread')"
            >
              {{ t("notifications.tabUnread") }}
            </v-btn>
          </div>
          <ButtonWithIcon
            color="success"
            variant="flat"
            class="!bg-emerald-50 !text-emerald-700 font-semibold"
            height="40"
            rounded="lg"
            prepend-icon="mdi-check-circle-outline"
            :label="t('notifications.markAllRead')"
            @click="notificationsStore.markAllRead()"
          />
          <ButtonWithIcon
            color="error"
            variant="flat"
            class="!bg-red-50 !text-red-600 font-semibold"
            height="40"
            rounded="lg"
            prepend-icon="mdi-trash-can-outline"
            :label="t('notifications.deleteAll')"
            @click="notificationsStore.deleteAll()"
          />
        </div>
      </div>

      <div v-if="sortedVisible.length === 0" class="text-center text-gray-500 py-16">
        {{ t("notifications.empty") }}
      </div>

      <template v-else>
        <section v-if="todayItems.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-gray-800 m-0">
            {{ t("notifications.sectionToday") }}
          </h2>
          <div class="space-y-3">
            <div
              v-for="n in todayItems"
              :key="n.id"
              role="button"
              tabindex="0"
              class="rounded-2xl border !border-gray-200 bg-white p-4 flex gap-4 items-start cursor-pointer hover:border-primary-200 transition-colors shadow-sm"
              @click="onCardClick(n)"
              @keydown.enter="onCardClick(n)"
            >
              <div
                class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                :class="iconWrapClass(n.variant)"
              >
                <v-icon size="22">mdi-bell-outline</v-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 m-0 leading-snug">
                  {{ titleOf(n) }}
                </p>
                <p class="text-sm text-gray-500 mt-1 m-0">
                  {{ descriptionOf(n) }}
                </p>
                <v-btn
                  v-if="n.action"
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="text-none mt-3"
                  prepend-icon="mdi-link-variant"
                  rounded="lg"
                  @click="onActionClick($event, n)"
                >
                  {{ actionLabelOf(n) }}
                </v-btn>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-2">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{
                  timeLabel(n.createdAt)
                }}</span>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  class="text-gray-400"
                  @click.stop="notificationsStore.remove(n.id)"
                >
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </section>

        <section v-if="previousItems.length > 0" class="space-y-3 pt-2">
          <h2 class="text-base font-bold text-gray-800 m-0">
            {{ t("notifications.sectionPrevious") }}
          </h2>
          <div class="space-y-3">
            <div
              v-for="n in previousItems"
              :key="n.id"
              role="button"
              tabindex="0"
              class="rounded-2xl border !border-gray-200 bg-white p-4 flex gap-4 items-start cursor-pointer hover:border-primary-200 transition-colors shadow-sm"
              @click="onCardClick(n)"
              @keydown.enter="onCardClick(n)"
            >
              <div
                class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                :class="iconWrapClass(n.variant)"
              >
                <v-icon size="22">mdi-bell-outline</v-icon>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 m-0 leading-snug">
                  {{ titleOf(n) }}
                </p>
                <p class="text-sm text-gray-500 mt-1 m-0">
                  {{ descriptionOf(n) }}
                </p>
                <v-btn
                  v-if="n.action"
                  variant="tonal"
                  color="primary"
                  size="small"
                  class="text-none mt-3"
                  prepend-icon="mdi-link-variant"
                  rounded="lg"
                  @click="onActionClick($event, n)"
                >
                  {{ actionLabelOf(n) }}
                </v-btn>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-2">
                <span class="text-xs text-gray-400 whitespace-nowrap">{{
                  timeLabel(n.createdAt)
                }}</span>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  class="text-gray-400"
                  @click.stop="notificationsStore.remove(n.id)"
                >
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </default-layout>
</template>
