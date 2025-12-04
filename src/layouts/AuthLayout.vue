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
  <v-container fluid class="auth-layout min-h-screen p-0">
    <v-row class="min-h-screen" no-gutters>
      <!-- Left Side - Branding (hidden on extra-small mobile) -->
      <v-col sm="0" md="6"
        class="hidden md:flex branding-side relative overflow-hidden bg-[linear-gradient(135deg,#f0f4ff_0%,#e8f1ff_50%,#dae8ff_100%)] [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]">
        <div class="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div class="w-full max-w-lg">
            <img src="/src/assets/vectors/qallab-clients.svg" alt="Qallab Services" class="w-full h-auto" />
          </div>
        </div>
      </v-col>

      <!-- Right Side - Form -->
      <v-col sm="12" md="6" class="flex flex-col">
        <!-- Header -->
        <v-sheet class="flex justify-between items-center p-6" color="transparent" elevation="0">
          <div class="relative lg:left-[12%] z-20 flex items-center gap-2">
            <img src="/src/assets/logo.svg" alt="Qallab logo" />
          </div>

          <!-- Language Toggle -->
          <v-btn @click="toggleLocale" variant="outlined" prepend-icon="mdi-web" color="primary"
            class="text-none gap-2">
            <span class="pt-1">
              {{ localeStore.currentLocale === 'ar' ? 'English' : 'العربية' }}
            </span>
          </v-btn>
        </v-sheet>

        <!-- Main Content -->
        <div class="flex-1 flex items-center justify-center p-6">
          <div class="w-full max-w-md">
            <slot />
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 text-center text-sm text-gray-500">
          <p>
            {{ new Date().getFullYear() }} {{ t('app.name', 'Qallab') }}.
            {{ t('auth.allRightsReserved', 'All rights reserved.') }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
