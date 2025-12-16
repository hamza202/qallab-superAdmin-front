<script setup lang="ts">
import { useI18n } from "vue-i18n";

interface DeleteConfirmDialogProps {
  modelValue: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  maxWidth?: string | number;
  persistent?: boolean;
  loading?: boolean;
  confirmColor?: string;
  icon?: string;
}

const props = withDefaults(defineProps<DeleteConfirmDialogProps>(), {
  maxWidth: 420,
  persistent: true,
  loading: false,
  confirmColor: "error",
  icon: "mdi-trash-can-outline",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
  (e: "close"): void;
}>();

const { t } = useI18n();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const titleText = computed(() => props.title ?? t("common.deleteConfirm.title"));
const confirmText = computed(() => props.confirmText ?? t("common.deleteConfirm.confirm"));
const cancelText = computed(() => props.cancelText ?? t("common.deleteConfirm.cancel"));
const messageText = computed(() => props.message ?? t("common.deleteConfirm.message"));

const handleCancel = () => {
  internalOpen.value = false;
  emit("cancel");
};

const handleConfirm = () => {
  internalOpen.value = false;
  emit("confirm");
};
</script>

<template>
  <AppDialog
    v-model="internalOpen"
    :max-width="props.maxWidth"
    :persistent="props.persistent"
    @close="emit('close')"
  >
    <template #title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5">
            <v-icon>{{ props.icon }}</v-icon>
          </span>
          <span class="text-base font-bold text-gray-900">{{ titleText }}</span>
        </div>
      </div>
    </template>

    <div class="py-2">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center">
          <v-icon color="error" size="28">{{ props.icon }}</v-icon>
        </div>
      </div>

      <slot>
        <p class="text-gray-700 text-center">
          {{ messageText }}
          <strong v-if="props.itemName" class="text-primary-700">{{ props.itemName }}</strong>
        </p>
      </slot>
    </div>

    <template #actions>
      <v-btn
        variant="flat"
        color="primary-100"
        class="text-primary-700 font-semibold"
        :disabled="props.loading"
        @click="handleCancel"
      >
        {{ cancelText }}
      </v-btn>
      <v-btn
        variant="flat"
        :color="props.confirmColor"
        class="font-semibold"
        :loading="props.loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </v-btn>
    </template>
  </AppDialog>
</template>

<style scoped></style>
