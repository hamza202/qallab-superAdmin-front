<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  loading?: boolean;
  itemName?: string;
  currentStatus?: boolean;
  title?: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemName: '',
  currentStatus: false,
  title: 'تغيير الحالة',
  message: 'هل أنت متأكد من تغيير حالة',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
  close: [];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const newStatus = computed(() => !props.currentStatus);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  internalOpen.value = false;
};

const icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#F79009" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <AppDialog
    v-model="internalOpen"
    max-width="400"
    persistent
    @close="emit('close')"
  >
    <template #title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="bg-gray-50 border border-gray-100 rounded px-1 py-0.5">
            <span v-html="icon"></span>
          </span>
          <span class="text-base font-bold text-gray-900">{{ title }}</span>
        </div>
      </div>
    </template>

    <div class="py-2">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center">
          <span v-html="icon" class="text-warning-600"></span>
        </div>
      </div>

      <slot>
        <div class="text-center">
          <p class="text-gray-700 mb-4">
            {{ message }}
            <strong v-if="itemName" class="text-primary-700">{{ itemName }}</strong>
            ؟
          </p>
          <div class="flex items-center justify-center gap-3">
            <span class="text-sm text-gray-600">الحالة:</span>
            <v-switch :model-value="newStatus" hide-details inset density="compact" color="primary" readonly />
          </div>
        </div>
      </slot>
    </div>

    <template #actions>
      <v-btn
        variant="flat"
        color="primary-100"
        class="text-primary-700 font-semibold"
        :disabled="loading"
        @click="handleCancel"
      >
        إلغاء
      </v-btn>
      <v-btn
        variant="flat"
        color="primary"
        class="font-semibold"
        :loading="loading"
        @click="handleConfirm"
      >
        تأكيد
      </v-btn>
    </template>
  </AppDialog>
</template>
