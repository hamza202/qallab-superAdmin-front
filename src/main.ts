import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGoogleMaps from '@fawmi/vue-google-maps'

import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import vuetify from './plugins/vuetify'

// Styles - Order matters! Vuetify first, then Tailwind/custom styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles/main.scss'

const app = createApp(App)

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

app.mount('#app')
