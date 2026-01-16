import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Fonts from 'unplugin-fonts/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vuetify({
        autoImport: true,
      }),
      // Auto import Vue APIs and custom utilities
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          {
            '@/utils/validators': [
              'useValidators',
              'required',
              'minLength',
              'maxLength',
              'exactLength',
              'numeric',
              'integer',
              'minValue',
              'maxValue',
              'between',
              'positive',
              'email',
              'phone',
              'saudiPhone',
              'arabicOnly',
              'englishOnly',
              'noSpecialChars',
              'url',
              'strongPassword',
              'confirmPassword',
              'maxFileSize',
              'allowedFileTypes',
              'validDate',
              'futureDate',
              'pastDate',
              'pattern',
              'richTextMaxLength',
              'richTextMinLength',
              'richTextRequired',
              'custom',
            ],
          },
        ],
        dts: 'src/auto-imports.d.ts',
        vueTemplate: true,
      }),
      // Auto import Vue components
      Components({
        dirs: [
          'src/components/common',
          'src/components/common/forms',
          'src/components/common/tables',
          'src/layouts',
        ],
        dts: 'src/components.d.ts',
        resolvers: [],
      }),
      VueI18nPlugin({
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
        runtimeOnly: false,
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic'],
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 3000,
    },
  }
})
