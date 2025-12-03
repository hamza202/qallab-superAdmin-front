import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Locale = 'ar' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref<Locale>(
    (localStorage.getItem('locale') as Locale) || 'ar'
  )

  const isRtl = computed(() => currentLocale.value === 'ar')

  function setLocale(locale: Locale) {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'ar' ? 'en' : 'ar')
  }

  return {
    currentLocale,
    isRtl,
    setLocale,
    toggleLocale,
  }
})