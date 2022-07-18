import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar, useQuasar } from 'quasar';
import quasarUserOptions from './quasar-user-options'

// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


// app
const app = createApp(App)
app.use(Quasar, quasarUserOptions)
app.use(pinia);
app.use(router)

// global variables
app.provide('some_var', 5);

app.mount('#app')
