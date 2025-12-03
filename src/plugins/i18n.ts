import { createI18n } from 'vue-i18n'
import ar from '@/locales/ar.json'
import en from '@/locales/en.json'

export type MessageSchema = typeof ar

const i18n = createI18n<[MessageSchema], 'ar' | 'en'>({
  legacy: false,
  globalInjection: true,
  locale: import.meta.env.VITE_DEFAULT_LOCALE || 'ar',
  fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE || 'en',
  messages: {
    ar,
    en,
  },
})

export default i18n
