import { createStore } from 'vuex'

// 辅助函数：将 Uint8Array 转换为 Base64 字符串
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 辅助函数：将 Base64 字符串转换为 Uint8Array
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// 尝试从 sessionStorage 加载主密钥
let initialMasterKey = null;
try {
  const savedMasterKey = sessionStorage.getItem('masterKey');
  if (savedMasterKey) {
    initialMasterKey = new Uint8Array(base64ToArrayBuffer(savedMasterKey));
    console.log('✅ 从 sessionStorage 加载主密钥成功');
  }
} catch (error) {
  console.error('❌ 从 sessionStorage 加载主密钥失败:', error);
}

export default createStore({
  state: {
    // web服务器地址（本地开发）
    backendUrl: 'http://127.0.0.1:8888',
    wsUrl: 'ws://127.0.0.1:8888',
    // 生产环境地址
    // backendUrl: 'https://123.56.164.220:8000',
    // wsUrl: 'wss://123.56.164.220:8000',
    // 信令服务器地址
    // signalUrl: 'wss://127.0.0.1:8001',
    userInfo: (sessionStorage.getItem('userInfo') && JSON.parse(sessionStorage.getItem('userInfo'))) || {},
    token: sessionStorage.getItem('token') || '',
    masterKey: initialMasterKey, // 主密钥（从 sessionStorage 加载，如果存在）
    socket: null,
  },
  getters: {
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      // 同时保存 token
      if (userInfo.token) {
        state.token = userInfo.token;
        sessionStorage.setItem('token', userInfo.token);
      }
    },
    setMasterKey(state, masterKey) {
      state.masterKey = masterKey;
      console.log('主密钥已设置到 Vuex store（仅内存）');
    },
    // 保存主密钥到 sessionStorage
    saveMasterKeyToStorage(state, masterKey) {
      try {
        const base64Key = arrayBufferToBase64(masterKey);
        sessionStorage.setItem('masterKey', base64Key);
        state.masterKey = masterKey;
        console.log('✅ 主密钥已保存到 sessionStorage');
      } catch (error) {
        console.error('❌ 保存主密钥到 sessionStorage 失败:', error);
      }
    },
    // 从 sessionStorage 删除主密钥（但保留在内存中）
    removeMasterKeyFromStorage(state) {
      sessionStorage.removeItem('masterKey');
      console.log('✅ 主密钥已从 sessionStorage 删除（内存中保留）');
      // 注意：不删除 state.masterKey，因为要保留在内存中
    },
    cleanUserInfo(state) {
      state.userInfo = {};
      state.token = '';
      state.masterKey = null; // 清除主密钥
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('masterKey'); // 清除 sessionStorage 中的主密钥
      console.log('用户信息和主密钥已清除');
    }
  },
  actions: {
  },
  modules: {
  }
})
