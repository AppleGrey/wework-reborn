<template>
  <router-view />
</template>

<script>
import { onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "@/utils/axios";
import { ElMessage } from "element-plus";

export default {
  name: "App",
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const getUserInfo = async () => {
      try {
        const req = {
          uuid: store.state.userInfo.uuid,
        };
        const rsp = await axios.post("/user/getUserInfo", req);
        if (rsp.data.code == 200) {
          if (!rsp.data.data.avatar.startsWith("http")) {
            rsp.data.data.avatar = store.state.backendUrl + rsp.data.data.avatar;
          }
          store.commit("setUserInfo", rsp.data.data);
        } else {
          console.error(rsp.data.message);
        }
        console.log(rsp);
      } catch (error) {
        console.log(error);
      }
    };
    
    const logout = async () => {
      store.commit("cleanUserInfo");
      const req = {
        owner_id: store.state.userInfo.uuid,
      };
      const rsp = await axios.post(
        store.state.backendUrl + "/user/wsLogout",
        req
      );
      if (rsp.data.code == 200) {
        router.push("/login");
        ElMessage.success("账号被封禁，退出登录");
      } else {
        ElMessage.error(rsp.data.message);
      }
    };
    
    // 全局 WebSocket 消息处理器
    const handleWebSocketMessage = async (jsonMessage) => {
      try {
        const message = JSON.parse(jsonMessage.data);
        console.log("🌐 [App.vue] 全局收到 WebSocket 消息：", message);
        
        // 处理通知推送消息
        if (message.type === 'notification') {
          console.log("🔔 [App.vue] 收到通知推送，未读数量:", message.unread_count);
          // 只更新未读通知数量，不处理通知对象
          // 前端打开通知界面时会自动从后端获取完整的通知列表
          if (message.unread_count !== undefined) {
            store.commit('setUnreadNotificationCount', message.unread_count);
            console.log("🔔 [App.vue] 已更新未读通知数量:", message.unread_count);
          }
          return;
        }
        
        console.log("🌐 [App.vue] globalMessageHandler 是否存在:", !!globalMessageHandler, "类型:", typeof globalMessageHandler);
        
        // 从 window 获取全局消息处理器（由 main.js 管理）
        const handler = window._globalMessageHandler;
        console.log("🌐 [App.vue] globalMessageHandler 是否存在:", !!handler, "类型:", typeof handler);
        
        // 如果有注册的全局消息处理器（由 ContactChat 组件注册），则调用它
        if (handler && typeof handler === 'function') {
          console.log("🌐 [App.vue] 调用 globalMessageHandler");
          try {
            // 如果处理器是异步的，需要 await
            const result = handler(jsonMessage);
            if (result instanceof Promise) {
              await result;
            }
            console.log("🌐 [App.vue] globalMessageHandler 执行完成");
          } catch (handlerError) {
            console.error("🌐 [App.vue] globalMessageHandler 执行失败:", handlerError);
            console.error("🌐 [App.vue] 错误堆栈:", handlerError.stack);
          }
        } else {
          // 如果没有注册的处理器，说明不在聊天页面，可以在这里处理其他逻辑
          // 比如更新会话列表、显示通知等
          console.log("🌐 [App.vue] ⚠️ 当前不在聊天页面，消息已接收但未处理");
        }
      } catch (error) {
        console.error("🌐 [App.vue] 处理 WebSocket 消息失败：", error);
        console.error("🌐 [App.vue] 错误堆栈:", error.stack);
      }
    };
    
    onMounted(() => {
      if (store.state.userInfo.uuid) {
        getUserInfo();
        if (store.state.userInfo.status == 1) {
          logout();
        }
        
        // 如果 WebSocket 已存在（可能是 Login.vue 创建的），重新设置消息处理器
        if (store.state.socket && store.state.socket.readyState === WebSocket.OPEN) {
          console.log("🌐 [App.vue] WebSocket 已存在且已连接，重新设置全局消息处理器");
          // 移除旧的监听器（如果有）
          store.state.socket.removeEventListener('message', handleWebSocketMessage);
          // 设置全局消息处理器（覆盖 Login.vue 设置的简单处理器）
          store.state.socket.onmessage = handleWebSocketMessage;
          // 也使用 addEventListener 作为备份
          store.state.socket.addEventListener('message', handleWebSocketMessage);
          console.log("🌐 [App.vue] 已重新设置全局消息处理器");
          return;
        }
        
        // 如果 WebSocket 不存在，创建新的连接
        const wsUrl =
          store.state.wsUrl + "/wss?client_id=" + store.state.userInfo.uuid + "&token=" + encodeURIComponent(store.state.token);
        console.log("🌐 [App.vue] 创建新的 WebSocket 连接:", wsUrl);
        
        store.state.socket = new WebSocket(wsUrl);
        store.state.socket.onopen = () => {
          console.log("🌐 [App.vue] WebSocket连接已打开");
          console.log("🌐 [App.vue] 连接信令服务器成功");
        };
        // 设置全局消息处理器
        store.state.socket.onmessage = handleWebSocketMessage;
        console.log("🌐 [App.vue] 已设置全局消息处理器 handleWebSocketMessage");
        
        // 也使用 addEventListener 作为备份，确保不会被覆盖
        store.state.socket.addEventListener('message', handleWebSocketMessage);
        console.log("🌐 [App.vue] 已使用 addEventListener 注册消息处理器");
        
        store.state.socket.onclose = () => {
          console.log("🌐 [App.vue] WebSocket连接已关闭");
          console.log("🌐 [App.vue] 连接信令服务器断开");
        };
        store.state.socket.onerror = (error) => {
          console.log("🌐 [App.vue] WebSocket连接发生错误");
          console.log("🌐 [App.vue] 连接信令服务器失败，错误信息：", error);
        };
        console.log("🌐 [App.vue] WebSocket 对象:", store.state.socket);
      }
    });
    
    onUnmounted(() => {
      // 不要删除 window.setGlobalMessageHandler，因为其他组件可能还需要使用
      // 只清理消息处理器引用
      window._globalMessageHandler = null;
      console.log("🌐 [App.vue] onUnmounted: 已清理 globalMessageHandler 引用");
    });
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 推荐使用，以确保布局计算的一致性 */
}
</style>