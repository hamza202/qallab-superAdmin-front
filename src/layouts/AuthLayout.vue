<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  translationKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  translationKey: 'auth.supplierDashboard'
})
</script>

<template>
  <div class="auth-layout min-h-screen w-full p-0">
    <div class="flex min-h-screen">
      <!-- Right Side - Content Slot -->
      <div class="w-full lg:w-1/2 flex items-center justify-center bg-white px-8">
        <div class="w-full max-w-[360px] py-12">
          <slot></slot>
        </div>
      </div>
      <!-- Left Side - Blue Background with Logo and Label -->
      <div class="w-full lg:w-1/2 hidden lg:flex relative overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0 w-full h-full">
          <img 
            src="/login-bg.webp" 
            alt="Background" 
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Blue Gradient Overlay -->
        <div class="absolute inset-0 w-full h-full"></div>
        
        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center justify-center w-full h-full px-8">
          <!-- White Logo -->
          <div class="mb-8">
            <img 
              src="/white-logo.svg" 
              alt="Qallab Logo" 
              class="w-[280px] h-auto"
            />
          </div>
          
          <!-- Label Badge -->
          <div class="bg-[#D1E9FF] rounded-full px-8 py-4 min-w-80">
            <p class="text-[#1849A9] font-bold text-base text-center">
              {{ t(props.translationKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
}
</style>