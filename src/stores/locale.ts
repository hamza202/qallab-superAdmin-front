import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Locale = 'ar' | 'en'

const STORAGE_KEY = 'qallab_locale'

const getBrowserLanguage = (): Locale => {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ar')) {
    return 'ar'
  }
  return 'en'
}

const getInitialLocale = (): Locale => {
  try {
    // Clean up old 'locale' key if it exists
    const oldLocale = localStorage.getItem('locale')
    if (oldLocale) {
      localStorage.removeItem('locale')
    }
    
    const stored = localStorage.getItem(STORAGE_KEY) as Locale
    if (stored === 'ar' || stored === 'en') {
      return stored
    }
  } catch (error) {
    console.error('Failed to read locale from localStorage:', error)
  }
  return getBrowserLanguage()
}

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref<Locale>(getInitialLocale())

  const isRtl = computed(() => currentLocale.value === 'ar')

  function setLocale(locale: Locale) {
    currentLocale.value = locale
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch (error) {
      console.error('Failed to save locale to localStorage:', error)
    }
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    
    window.dispatchEvent(new CustomEvent('language-changed', { 
      detail: { locale } 
    }))
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'ar' ? 'en' : 'ar')
  }

  function initializeLocale() {
    setLocale(currentLocale.value)
  }

  return {
    currentLocale,
    isRtl,
    setLocale,
    toggleLocale,
    initializeLocale,
  }
})