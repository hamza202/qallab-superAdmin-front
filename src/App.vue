<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch, computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()
const { locale } = useI18n()

const isRtl = computed(() => localeStore.currentLocale === 'ar')

watch(
  () => localeStore.currentLocale,
  (newLocale) => {
    locale.value = newLocale
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  },
  { immediate: true }
)
</script>

<template>
  <v-app :rtl="isRtl">
    <router-view />
  </v-app>
</template>
