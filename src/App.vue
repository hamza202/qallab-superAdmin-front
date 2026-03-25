<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch, computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { useLocale } from 'vuetify'

const localeStore = useLocaleStore()
const { locale } = useI18n()
const { current: vuetifyLocale } = useLocale()

const isRtl = computed(() => localeStore.currentLocale === 'ar')

watch(
  () => localeStore.currentLocale,
  (newLocale) => {
    locale.value = newLocale
    vuetifyLocale.value = newLocale
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
  },
  { immediate: true }
)
</script>

<template>
  <v-app :rtl="isRtl">
    <router-view :key="localeStore.currentLocale" />
  </v-app>
</template>
