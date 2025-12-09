<template>
  <div class="chat-wrap">
    <div
      class="chat-window"
      :style="{
        boxShadow: `var(${'--el-box-shadow-dark'})`,
      }"
    >
      <el-container class="chat-window-container">
        <el-aside class="aside-container">
          <NavigationModal></NavigationModal>
          <div class="sessionlist-container">
            <div class="sessionlist-header">
              <el-input
                v-model="contactSearch"
                class="contact-search-input"
                placeholder="搜索会话"
                size="small"
                suffix-icon="Search"
              />
            </div>
            <div class="contactlist-body">
              <div class="contactlist-user">
                <el-menu router>
                  <el-menu-item
                    v-for="session in allSessionList"
                    :key="session.id"
                    @click="handleToSession(session)"
                    style="position: relative;"
                  >
                    <img :src="session.avatar" class="sessionlist-avatar" />
                    {{ session.name }}
                    <span v-if="session.unread_count > 0" class="session-unread-badge">
                      {{ session.unread_count > 99 ? '99+' : session.unread_count }}
                    </span>
                  </el-menu-item>
                </el-menu>
              </div>
            </div>
          </div>
        </el-aside>
      </el-container>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { useStore } from "vuex";
import axios from "@/utils/axios";
import eventBus from "@/utils/eventBus";
import Modal from "@/components/Modal.vue";
import NavigationModal from "@/components/NavigationModal.vue";
export default {
  name: "ContactList",
  components: {
    Modal,
    NavigationModal,
  },

  setup() {
    const router = useRouter();
    const store = useStore();
    const data = reactive({
      chatMessage: "",
      chatName: "",
      userInfo: store.state.userInfo,
      contactSearch: "",
      createGroupReq: {
        owner_id: "",
        name: "",
        notice: "",
        add_mode: null,
        avatar: "",
      },
      ownListReq: {
        owner_id: "",
      },
      allSessionList: [],
    });
    // 处理新消息接收事件（刷新会话列表）
    const handleNewMessageReceived = async (message) => {
      console.log("📬 [SessionList] 收到新消息通知，刷新会话列表");
      await loadAllSessions();
    };
    
    onMounted(async () => {
      await loadAllSessions();
      
      // 监听新消息事件
      eventBus.on('chat:new_message_received', handleNewMessageReceived);
      console.log("✅ [SessionList] 已订阅新消息事件");
    });
    
    onUnmounted(() => {
      // 取消订阅
      eventBus.off('chat:new_message_received', handleNewMessageReceived);
      console.log("✅ [SessionList] 已取消订阅新消息事件");
    });
    const handleToSession = (session) => {
      router.push("/chat/" + session.id);
    };

    const loadAllSessions = async () => {
      try {
        data.ownListReq.owner_id = data.userInfo.uuid;
        
        // 并行加载用户会话和群聊会话
        const [userSessionListRsp, groupSessionListRsp] = await Promise.all([
          axios.post(
            store.state.backendUrl + "/session/getUserSessionList",
            data.ownListReq
          ),
          axios.post(
            store.state.backendUrl + "/session/getGroupSessionList",
            data.ownListReq
          )
        ]);

        const allSessions = [];
        const sessionUnreadMap = {}; // 用于存储每个会话的未读数

        // 处理用户会话
        if (userSessionListRsp.data.data) {
          for (let i = 0; i < userSessionListRsp.data.data.length; i++) {
            const user = userSessionListRsp.data.data[i];
            if (!user.avatar.startsWith("http")) {
              user.avatar = store.state.backendUrl + user.avatar;
            }
            
            const unreadCount = user.unread_count || 0;
            allSessions.push({
              id: user.user_id,
              session_id: user.session_id,
              name: user.user_name,
              avatar: user.avatar,
              type: 'user',
              unread_count: unreadCount
            });
            
            // 存储到未读数映射
            if (user.session_id) {
              sessionUnreadMap[user.session_id] = unreadCount;
            }
          }
        }

        // 处理群聊会话
        if (groupSessionListRsp.data.data) {
          for (let i = 0; i < groupSessionListRsp.data.data.length; i++) {
            const group = groupSessionListRsp.data.data[i];
            if (!group.avatar.startsWith("http")) {
              group.avatar = store.state.backendUrl + group.avatar;
            }
            
            const unreadCount = group.unread_count || 0;
            allSessions.push({
              id: group.group_id,
              session_id: group.session_id,
              name: group.group_name,
              avatar: group.avatar,
              type: 'group',
              unread_count: unreadCount
            });
            
            // 存储到未读数映射
            if (group.session_id) {
              sessionUnreadMap[group.session_id] = unreadCount;
            }
          }
        }

        // 按创建时间排序（如果有时间字段，这里先简单按数组顺序）
        data.allSessionList = allSessions;
        
        // 将未读数存储到 Vuex
        store.commit('setSessionUnreadCounts', sessionUnreadMap);
        console.log("✅ [SessionList] 加载会话列表成功，未读数已更新到 Vuex");
      } catch (error) {
        console.error(error);
      }
    };
    const handleContextMenu = (event, group) => {
      event.preventDefault(); // 阻止默认的右键菜单
      // 显示自定义的删除选项
      ElMessageBox.confirm("确定要删除该会话组吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 执行删除操作
          this.deleteGroup(group);
        })
        .catch(() => {
          // 取消删除操作
        });
    };
    return {
      ...toRefs(data),
      router,
      handleToSession,
      loadAllSessions,
      handleContextMenu,
    };
  },
};
</script>

<style scoped>
.sessionlist-header {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.contact-search-input {
  width: 215px;
  height: 30px;
  margin-left: 5px;
  margin-right: 2px;
}

.sessionlist-container,
.contactlist-body,
.contactlist-user {
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
}

.el-menu {
  background-color: #f8f9fa;
  width: 100% !important;
  border: none;
  padding: 0 !important;
  margin: 0 !important;
}

.el-menu-item {
  background-color: #ffffff;
  height: 48px;
  border-radius: 0;
  margin: 0 !important;
  padding-left: 8px !important;
  padding-right: 0 !important;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  width: 100% !important;
  box-sizing: border-box;
}

.el-menu-item * {
  box-sizing: border-box;
}

.el-menu-item:last-child {
  border-bottom: none;
}

.el-menu-item:hover {
  background-color: #f3f4f6;
}

.el-menu-item.is-active {
  background-color: #4facfe;
  color: #ffffff;
}

.sessionlist-title {
  font-family: Arial, Helvetica, sans-serif;
}

h3 {
  font-family: Arial, Helvetica, sans-serif;
  color: rgb(69, 69, 68);
}

.modal-quit-btn-container {
  height: 30%;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}

.modal-quit-btn {
  background-color: rgba(255, 255, 255, 0);
  color: rgb(229, 25, 25);
  padding: 15px;
  border: none;
  cursor: pointer;
  position: fixed;
  justify-content: center;
  align-items: center;
}

.modal-header {
  height: 20%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*background-color:aqua;*/
}

.modal-body {
  height: 55%;
  width: 400px;
}

.modal-footer {
  height: 25%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-header-title {
  height: 70%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sessionlist-avatar {
  width: 30px;
  height: 30px;
  margin-right: 20px;
}

.session-unread-badge {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f56c6c;
  color: #ffffff;
  border-radius: 12px;
  padding: 1px 5px;
  font-size: 11px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  line-height: 14px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>