<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'

const { t } = useI18n()
const localeStore = useLocaleStore()

const isRtl = computed(() => localeStore.currentLocale === 'ar')

const toggleLocale = () => {
  localeStore.setLocale(localeStore.currentLocale === 'ar' ? 'en' : 'ar')
}
</script>

<template>
  <div class="auth-layout flex" :style="{ minHeight: '100vh', display: 'flex' }">
    <!-- Left Side - Branding -->
    <div class="branding-side" :style="{ width: '50%', background: 'linear-gradient(to bottom right, #2563eb, #1d4ed8, #1e3a8a)', position: 'relative', overflow: 'hidden', display: 'flex' }">
      <!-- Background Pattern -->
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
        <!-- Logo -->
        <div class="mb-8">
          <div class="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg style="width: 56px; height: 56px; color: white;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        </div>
        
        <!-- Title -->
        <h1 class="text-4xl font-bold mb-4 text-center">{{ t('app.name', 'Qallab') }}</h1>
        <p class="text-xl text-white/80 text-center max-w-md">
          {{ t('auth.welcomeMessage', 'Clients & Providers Portal') }}
        </p>
        
      </div>
    </div>

    <!-- Right Side - Form -->
    <div :style="{ width: '50%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }">
      <!-- Header -->
      <div class="flex justify-between items-center p-6">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center gap-2">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="font-bold text-xl text-gray-800">{{ t('app.name', 'Qallab') }}</span>
        </div>
        <div class="hidden lg:block"></div>
        
        <!-- Language Toggle -->
        <button
          @click="toggleLocale"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
        >
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
          <span>{{ localeStore.currentLocale === 'ar' ? 'English' : 'العربية' }}</span>
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex items-center justify-center p-6">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 text-center text-sm text-gray-500">
        <p>© {{ new Date().getFullYear() }} {{ t('app.name', 'Qallab') }}. {{ t('auth.allRightsReserved', 'All rights reserved.') }}</p>
      </div>
    </div>
  </div>
</template>
