import { createApp } from 'vue'
import App from './App.vue'
const mountEl = document.querySelector("#app");

createApp(App,{ ...mountEl.dataset }).mount('#app')
