<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
const { t } = useI18n()
</script>

<template>
  <default-layout>
    <!-- Welcome Section -->
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <!-- Welcome Illustration -->
      <div class="w-full max-w-[400px] mb-8">
        <img 
          src="/welcome.svg" 
          alt="Welcome" 
          class="w-full h-auto"
        />
      </div>
      
      <!-- Welcome Text -->
      <div class="text-center">
        <h1 class="text-[30px] lg:text-[40px] font-bold leading-tight">
          <span class="text-[#697586]">{{ t('common.dashboard.welcomeText') }}&nbsp;</span>
          <span class="text-[#1570EF]">{{ t('common.dashboard.qallab') }}</span>
        </h1>
      </div>
    </div>
  </default-layout>
</template>