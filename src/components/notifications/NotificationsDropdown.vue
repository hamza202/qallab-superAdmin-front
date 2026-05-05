<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import NotificationsPopup from "@/components/notifications/NotificationsPopup.vue";
import { useNotificationsStore } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();
const { unreadCount } = storeToRefs(notificationsStore);

const open = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

const PANEL_MAX_W = 420;
const VIEWPORT_GUTTER = 16;
const OFFSET_Y = 10;

let attachOutsideTimeout: ReturnType<typeof setTimeout> | null = null;
let outsideAttached = false;

function updatePosition() {
  const el = triggerRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(PANEL_MAX_W, vw - VIEWPORT_GUTTER * 2);

  let top = rect.bottom + OFFSET_Y;
  const estimatedPanelH = Math.min(520, vh * 0.85);
  if (top + estimatedPanelH > vh - VIEWPORT_GUTTER) {
    top = Math.max(VIEWPORT_GUTTER, rect.top - estimatedPanelH - OFFSET_Y);
  }

  let left = rect.right - width;
  left = Math.max(VIEWPORT_GUTTER, Math.min(left, vw - width - VIEWPORT_GUTTER));

  panelStyle.value = {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
  };
}

function detachOutsideListeners() {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onEscape, true);
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
  outsideAttached = false;
}

function attachOutsideListeners() {
  if (outsideAttached) return;
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onEscape, true);
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
  outsideAttached = true;
}

function onDocPointerDown(ev: PointerEvent) {
  if (!open.value) return;

  const t = ev.target as Node;
  if (triggerRef.value?.contains(t) || panelRef.value?.contains(t)) return;

  open.value = false;
}

function onEscape(ev: KeyboardEvent) {
  if (ev.key === "Escape") open.value = false;
}

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

watch(open, (isOpen) => {
  if (attachOutsideTimeout) {
    clearTimeout(attachOutsideTimeout);
    attachOutsideTimeout = null;
  }

  if (!isOpen) {
    detachOutsideListeners();
    return;
  }

  nextTick(() => {
    if (!open.value) return;
    updatePosition();
    // Opening click has finished; attach on the next macrotask so we never treat it as "outside".
    attachOutsideTimeout = setTimeout(() => {
      attachOutsideTimeout = null;
      if (!open.value) return;
      attachOutsideListeners();
    }, 0);
  });
});

onUnmounted(() => {
  if (attachOutsideTimeout) clearTimeout(attachOutsideTimeout);
  detachOutsideListeners();
});
</script>

<template>
  <div class="notifications-dropdown-root relative inline-flex shrink-0 align-middle">
    <span ref="triggerRef" class="inline-flex">
      <v-badge
        :model-value="unreadCount > 0"
        :content="unreadCount > 99 ? '99+' : unreadCount"
        color="error"
        location="top start"
        offset-x="2"
        offset-y="4"
      >
        <!-- Clicks must be on v-btn: Vuetify stops propagation so a parent @click on the span never runs. -->
        <v-btn
          size="small"
          icon
          variant="flat"
          class="bg-gray-50 border !border-gray-100 text-primary-600 !rounded-full"
          :aria-expanded="open"
          aria-haspopup="true"
          type="button"
          @click.stop="toggle"
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </v-badge>
    </span>

    <Teleport to="#global-overlays">
      <Transition name="notifications-dropdown">
        <div
          v-if="open"
          ref="panelRef"
          class="notifications-dropdown-panel-host max-w-[calc(100vw-32px)]"
          :style="panelStyle"
          role="dialog"
          aria-modal="false"
        >
          <NotificationsPopup @close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.notifications-dropdown-enter-active,
.notifications-dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.notifications-dropdown-enter-from,
.notifications-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
