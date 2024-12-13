import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from "primevue/config";
import Noir from "./theme/Noir.ts";

const app = createApp(App)

app.use(PrimeVue,{
    theme: {
        preset: Noir,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false,
        }
    }
})

app.mount('#app')