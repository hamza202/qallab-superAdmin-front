import { createI18n } from 'vue-i18n'

type AvailableLocales = 'ar' | 'en'

function loadLocaleMessages(): Record<AvailableLocales, any> {
  // Load all JSON files under /locales
  const locales = import.meta.glob('../locales/*/*.json', { eager: true })
  const messages = {} as Record<AvailableLocales, any>

  for (const path in locales) {
    const match = path.match(/..\/locales\/(.+?)\/(.+?)\.json$/)
    if (!match) continue

    const locale = match[1] as AvailableLocales      // ar or en
    const fileName = match[2]     // app, auth, pages, validation...

    let value: any = locales[path]
    if (value && typeof value === 'object' && 'default' in value) {
      value = (value as any).default
    }

    if (
      value &&
      typeof value === 'object' &&
      fileName in value &&
      Object.keys(value).length === 1
    ) {
      value = (value as any)[fileName]
    }

    messages[locale] = {
      ...(messages[locale] || {}),
      [fileName]: value 
    }
  }

  return messages
}

export type MessageSchema = ReturnType<typeof loadLocaleMessages>['ar']

const i18n = createI18n<[MessageSchema], AvailableLocales>({
  legacy: false,
  globalInjection: true,
  locale: import.meta.env.VITE_DEFAULT_LOCALE || 'ar',
  fallbackLocale: import.meta.env.VITE_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})

export default i18n
