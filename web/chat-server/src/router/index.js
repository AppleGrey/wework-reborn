import { createRouter, createWebHistory } from 'vue-router'
import store from '../store/index.js'

const routes = [
  {
    path: '/',
    redirect: { name: 'Login' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/access/Login.vue')
  },
  {
    path: '/smsLogin',
    name: 'smsLogin',
    component: () => import('../views/access/SmsLogin.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/access/Register.vue')
  },
  {
    path: '/chat/owninfo',
    name: 'OwnInfo',
    component: () => import('../views/chat/user/OwnInfo.vue')
  },
  {
    path: '/chat/settings',
    name: 'Settings',
    component: () => import('../views/chat/user/Settings.vue')
  },
  {
    path: '/chat/contactlist',
    name: 'ContactList',
    component: () => import('../views/chat/contact/ContactList.vue')
  },
  {
    path: '/chat/:id',
    name: 'ContactChat',
    component: () => import('../views/chat/contact/ContactChat.vue')
  },
  {
    path: '/chat/sessionList',
    name: 'SessionList',
    component: () => import('../views/chat/session/SessionList.vue')
  },
  {
    path: '/manager',
    name: 'Manager',
    component: () => import('../views/manager/Manager.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  // 检查是否支持 Web Crypto API（需要 HTTPS 或 localhost）
  const isCryptoSupported = window.crypto && window.crypto.subtle;
  
  // 如果用户未登录，检查是否是登录/注册页面
  if (!store.state.userInfo.uuid) {
    if (to.path === '/login' || to.path === '/register' || to.path === '/smsLogin') {
      next()
      return
    }
    next('/login')
  } else {
    // 用户已登录
    // 如果不支持 Web Crypto API（HTTP 环境），跳过主密钥检查
    if (!isCryptoSupported) {
      console.log('⚠️ 当前环境不支持 Web Crypto API（需要 HTTPS），跳过加密功能');
      next();
      return;
    }
    
    // 检查主密钥状态
    // 如果 sessionStorage 中没有主密钥，且 Vuex 中也没有主密钥
    // 说明用户关闭了"保存主密钥"开关，页面刷新后应该跳转到登录页面
    const hasMasterKeyInStorage = sessionStorage.getItem('masterKey');
    const hasMasterKeyInMemory = store.state.masterKey;
    
    if (!hasMasterKeyInStorage && !hasMasterKeyInMemory) {
      // 没有主密钥，跳转到登录页面
      console.log('⚠️ 没有主密钥，跳转到登录页面');
      store.commit('cleanUserInfo');
      next('/login');
      return;
    }
    
    // 如果有主密钥在 sessionStorage 中，但 Vuex 中没有，则加载它
    if (hasMasterKeyInStorage && !hasMasterKeyInMemory) {
      try {
        // 辅助函数：将 Base64 字符串转换为 Uint8Array
        function base64ToArrayBuffer(base64) {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          return bytes.buffer;
        }
        const masterKey = new Uint8Array(base64ToArrayBuffer(hasMasterKeyInStorage));
        store.commit('setMasterKey', masterKey);
        console.log('✅ 从 sessionStorage 恢复主密钥到 Vuex');
      } catch (error) {
        console.error('❌ 从 sessionStorage 恢复主密钥失败:', error);
        // 如果恢复失败，清除损坏的数据并跳转到登录页面
        sessionStorage.removeItem('masterKey');
        store.commit('cleanUserInfo');
        next('/login');
        return;
      }
    }
    
    next()
  }
})

export default router
