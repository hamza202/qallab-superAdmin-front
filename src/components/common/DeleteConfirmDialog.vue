<script setup lang="ts">
import { useI18n } from "vue-i18n";


const trash_1_icon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.3333 4.99984V4.33317C13.3333 3.39975 13.3333 2.93304 13.1517 2.57652C12.9919 2.26292 12.7369 2.00795 12.4233 1.84816C12.0668 1.6665 11.6001 1.6665 10.6667 1.6665H9.33333C8.39991 1.6665 7.9332 1.6665 7.57668 1.84816C7.26308 2.00795 7.00811 2.26292 6.84832 2.57652C6.66667 2.93304 6.66667 3.39975 6.66667 4.33317V4.99984M8.33333 9.58317V13.7498M11.6667 9.58317V13.7498M2.5 4.99984H17.5M15.8333 4.99984V14.3332C15.8333 15.7333 15.8333 16.4334 15.5608 16.9681C15.3212 17.4386 14.9387 17.821 14.4683 18.0607C13.9335 18.3332 13.2335 18.3332 11.8333 18.3332H8.16667C6.76654 18.3332 6.06647 18.3332 5.53169 18.0607C5.06129 17.821 4.67883 17.4386 4.43915 16.9681C4.16667 16.4334 4.16667 15.7333 4.16667 14.3332V4.99984" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`


const trash_2_icon = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g style="mix-blend-mode:multiply">
<rect x="2" y="2" width="32" height="32" rx="16" fill="#FECDCA"/>
<rect x="2" y="2" width="32" height="32" rx="16" stroke="#FEE4E2" stroke-width="4"/>
<path d="M20.6667 14.0002V13.4668C20.6667 12.7201 20.6667 12.3467 20.5213 12.0615C20.3935 11.8106 20.1895 11.6067 19.9387 11.4788C19.6534 11.3335 19.2801 11.3335 18.5333 11.3335H17.4667C16.7199 11.3335 16.3466 11.3335 16.0613 11.4788C15.8105 11.6067 15.6065 11.8106 15.4787 12.0615C15.3333 12.3467 15.3333 12.7201 15.3333 13.4668V14.0002M16.6667 17.6668V21.0002M19.3333 17.6668V21.0002M12 14.0002H24M22.6667 14.0002V21.4668C22.6667 22.5869 22.6667 23.147 22.4487 23.5748C22.2569 23.9511 21.951 24.2571 21.5746 24.4488C21.1468 24.6668 20.5868 24.6668 19.4667 24.6668H16.5333C15.4132 24.6668 14.8532 24.6668 14.4254 24.4488C14.049 24.2571 13.7431 23.9511 13.5513 23.5748C13.3333 23.147 13.3333 22.5869 13.3333 21.4668V14.0002" stroke="#F04438" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`
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
  emit("confirm");
};
</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="props.maxWidth" :persistent="props.persistent" @close="emit('close')">
    <template #title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="bg-gray-50 border border-gray-100 rounded px-1 py-1" v-html="trash_1_icon">
          </span>
          <span class="text-base font-bold text-gray-900">{{ titleText }}</span>
        </div>
      </div>
    </template>

    <div class="py-2">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center" v-html="trash_2_icon">

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
      <div class="flex justify-center gap-2 items-center flex-1">
      <v-btn variant="flat" :color="props.confirmColor" rounded="4" class="font-semibold px-8" :loading="props.loading"
        @click="handleConfirm">
        {{ confirmText }}
      </v-btn>
      <v-btn variant="outlined" color="gray-700" rounded="4" border="thin gray" class="font-semibold" :disabled="props.loading"
        @click="handleCancel">
        {{ cancelText }}
      </v-btn>
      </div>
    </template>
  </AppDialog>
</template>

<style scoped></style>
