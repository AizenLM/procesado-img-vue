import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ImageProcessor from './componentes/ImageProcessor.vue'

const app = createApp(App)
app.component("ImageProcessor", ImageProcessor) // Registra tu componente
app.mount('#app')
