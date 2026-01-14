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
  message: 'هل تريد بالتأكيد تغيير الحالة ؟',
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
  internalOpen.value = false;
  emit('cancel');
};

const icon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="4" y="4" width="48" height="48" rx="24" fill="#D1E9FF"/>
<rect x="4" y="4" width="48" height="48" rx="24" stroke="#EFF8FF" stroke-width="8"/>
<path d="M28 24V28M28 32H28.01M38 28C38 33.5228 33.5228 38 28 38C22.4772 38 18 33.5228 18 28C18 22.4772 22.4772 18 28 18C33.5228 18 38 22.4772 38 28Z" stroke="#2E90FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const infoIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.33333 6V9.33333M9.33333 12.6667H9.34167M17.6667 9.33333C17.6667 13.9357 13.9357 17.6667 9.33333 17.6667C4.73096 17.6667 1 13.9357 1 9.33333C1 4.73096 4.73096 1 9.33333 1C13.9357 1 17.6667 4.73096 17.6667 9.33333Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
</script>

<template>
  <AppDialog v-model="internalOpen" max-width="400" persistent @close="emit('close')">
    <template #title>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="bg-gray-50 border border-gray-100 rounded px-1 py-1" v-html="infoIcon"></span>
          <span class="text-base font-bold text-gray-900">{{ title }}</span>
        </div>
      </div>
    </template>

    <div>
      <div class="flex justify-center mb-3">
        <div class="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center" v-html="icon">
        </div>
      </div>

      <slot>
        <div class="text-center">
          <p class="text-gray-700 mb-4">
            {{ message }}
            <!-- <strong v-if="itemName" class="text-primary-700">{{ itemName }}</strong>
            ؟ -->
          </p>
          <!-- <div class="flex items-center justify-center gap-3">
            <span class="text-sm text-gray-600">الحالة:</span>
            <v-switch :model-value="newStatus" hide-details inset density="compact" color="primary" readonly />
          </div> -->
        </div>
      </slot>
    </div>

    <template #actions>
      <div class="flex justify-center gap-2 items-center flex-1">
        <v-btn variant="flat" color="primary" rounded="4" class="font-semibold px-6"
          :loading="loading" @click="handleConfirm">
          تأكيد
        </v-btn>
        <v-btn variant="outlined" color="gray-700" rounded="4" border="thin gray" class="font-semibold"
          :disabled="props.loading" @click="handleCancel">
         إلغاء
        </v-btn>
      </div>

    </template>
  </AppDialog>
</template>
