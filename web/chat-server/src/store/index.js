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
    // 测试环境地址
    backendUrl: 'http://localhost:8888',
    wsUrl: 'ws://localhost:8888',
    // 信令服务器地址
    // signalUrl: 'wss://127.0.0.1:8001',
    userInfo: (sessionStorage.getItem('userInfo') && JSON.parse(sessionStorage.getItem('userInfo'))) || {},
    token: sessionStorage.getItem('token') || '',
    masterKey: initialMasterKey, // 主密钥（从 sessionStorage 加载，如果存在）
    socket: null,
    notificationFilterType: null, // 通知筛选类型：null=全部, 'friend'=好友通知, 'group'=群通知, 'system'=系统消息
    unreadNotificationCount: 0, // 未读通知数量
    sessionUnreadCounts: {}, // 每个会话的未读消息数 { sessionId: count }
    totalUnreadMessageCount: 0, // 总的未读聊天消息数
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
    },
    setNotificationFilterType(state, filterType) {
      state.notificationFilterType = filterType;
    },
    setUnreadNotificationCount(state, count) {
      // 确保存储的是数字，而不是对象
      const numericCount = typeof count === 'number' ? count : (typeof count === 'object' && count !== null ? (count.count || 0) : 0);
      state.unreadNotificationCount = numericCount;
      console.log("🔄 [Store] setUnreadNotificationCount 被调用，接收到:", count, "存储为:", numericCount);
    },
    incrementUnreadNotificationCount(state) {
      state.unreadNotificationCount += 1;
    },
    decrementUnreadNotificationCount(state, count = 1) {
      state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - count);
    },
    // 设置所有会话的未读数（用于登录时批量加载）
    setSessionUnreadCounts(state, sessionUnreadMap) {
      state.sessionUnreadCounts = { ...sessionUnreadMap };
      // 计算总的未读数
      state.totalUnreadMessageCount = Object.values(sessionUnreadMap).reduce((sum, count) => sum + count, 0);
      console.log("🔄 [Store] 设置会话未读数:", state.sessionUnreadCounts, "总数:", state.totalUnreadMessageCount);
    },
    // 增加某个会话的未读数
    incrementSessionUnreadCount(state, sessionId) {
      if (!state.sessionUnreadCounts[sessionId]) {
        state.sessionUnreadCounts[sessionId] = 0;
      }
      state.sessionUnreadCounts[sessionId] += 1;
      state.totalUnreadMessageCount += 1;
      console.log(`🔄 [Store] 会话 ${sessionId} 未读数 +1，当前: ${state.sessionUnreadCounts[sessionId]}, 总数: ${state.totalUnreadMessageCount}`);
    },
    // 清除某个会话的未读数（进入会话时调用）
    clearSessionUnreadCount(state, sessionId) {
      const oldCount = state.sessionUnreadCounts[sessionId] || 0;
      if (oldCount > 0) {
        state.sessionUnreadCounts[sessionId] = 0;
        state.totalUnreadMessageCount = Math.max(0, state.totalUnreadMessageCount - oldCount);
        console.log(`🔄 [Store] 清除会话 ${sessionId} 未读数（原: ${oldCount}），总数: ${state.totalUnreadMessageCount}`);
      }
    },
    // 清除所有会话的未读数
    clearAllSessionUnreadCounts(state) {
      state.sessionUnreadCounts = {};
      state.totalUnreadMessageCount = 0;
      console.log("🔄 [Store] 清除所有会话未读数");
    }
  },
  actions: {
  },
  modules: {
  }
})
