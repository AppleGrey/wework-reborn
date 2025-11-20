import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入'https://webrtc.github.io/adapter/adapter-latest.js'
// import 'https://webrtc.github.io/adapter/adapter-latest.js'
// import '@/assets/css/font.css'
import '@/assets/css/chat.css'

// 初始化全局消息处理器（在 App.vue 之前设置，确保组件加载时可用）
let globalMessageHandler = null;
window._globalMessageHandler = null; // 用于 App.vue 访问

window.setGlobalMessageHandler = (handler) => {
  console.log("🌐 [main.js] setGlobalMessageHandler 被调用，handler 类型:", typeof handler);
  globalMessageHandler = handler;
  window._globalMessageHandler = handler; // 同步到 window，供 App.vue 访问
  console.log("🌐 [main.js] globalMessageHandler 已设置:", !!globalMessageHandler);
};
console.log("🌐 [main.js] window.setGlobalMessageHandler 已初始化");

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(store).use(router).use(ElementPlus).mount('#app')
