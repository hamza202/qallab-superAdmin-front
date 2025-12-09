<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex items-start justify-between mb-6">
    <div class="flex items-center gap-4">
      <div class="w-[52px] h-[52px] flex items-center justify-center">
        <span v-html="icon"></span>
      </div>
      <div>
        <h1 class="text-lg font-bold text-primary-900">{{ t(titleKey) }}</h1>
        <p class="text-sm text-gray-600">{{ t(descriptionKey) }}</p>
      </div>
    </div>
  </div>
</template>
