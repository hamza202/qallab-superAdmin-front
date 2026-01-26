import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'

// Styles - Order matters! Vuetify first, then Tailwind/custom styles
import 'vuetify/styles'
import 'leaflet/dist/leaflet.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vue3-toastify/dist/index.css'
import './styles/main.scss'

const app = createApp(App)

// Set ApexCharts global defaults using window.Apex
if (typeof (window as any).Apex === 'undefined') {
  (window as any).Apex = {}
}
(window as any).Apex.chart = {
  fontFamily: 'Cairo, Inter, Tajawal, sans-serif',
}

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)
app.use(VueGoogleMaps, {
  load: {
    key: '',
    libraries: 'places'
  }
})

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-left',
  rtl: true,
  clearOnUrlChange: false,
} as ToastContainerOptions)

app.mount('#app')
