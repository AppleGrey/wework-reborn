<template>
  <div class="navigation-bar">
    <div class="up-bar">
      <button class="avatar-btn">
        <el-avatar :src="userInfo.avatar" />
      </button>
    </div>
    <div class="middle-bar">
      <el-tooltip
        effect="customized"
        content="会话聊天"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn" @click="handleToSessionList">
          <el-icon>
            <ChatRound />
          </el-icon>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="customized"
        content="通讯录管理"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn contact-btn-with-badge" @click="handleToContactList">
          <el-icon>
            <User />
          </el-icon>
          <!-- 未读通知数量徽章 -->
          <span 
            v-if="unreadCount > 0" 
            class="notification-badge"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="customized"
        content="朋友圈"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn">
          <el-icon>
            <Share />
          </el-icon>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="customized"
        content="我的收藏"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn">
          <el-icon>
            <Star />
          </el-icon>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="customized"
        content="搜索"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn">
          <el-icon>
            <Search />
          </el-icon>
        </button>
      </el-tooltip>
    </div>
    <div class="down-bar">
      <el-tooltip
        effect="customized"
        content="设置"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn" @click="handleToSettings">
          <el-icon>
            <Setting />
          </el-icon>
        </button>
      </el-tooltip>
      <el-tooltip
        effect="customized"
        content="我的主页"
        placement="left"
        hide-after="0"
        enterable="false"
      >
        <button class="icon-btn" @click="handleToOwnInfo">
          <el-icon><HomeFilled /></el-icon>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { reactive, toRefs, computed } from "vue";
import axios from "@/utils/axios";
export default {
  name: "NavigationModal",
  setup() {
    const router = useRouter();
    const store = useStore();
    const data = reactive({
      userInfo: store.state.userInfo,
    });
    
    // 计算未读通知数量
    const unreadCount = computed(() => {
      const count = store.state.unreadNotificationCount || 0;
      console.log("📊 [NavigationModal] 计算未读数量:", count);
      return count;
    });

    const handleToContactList = () => {
      router.push("/chat/contactlist");
    };

    const handleToSessionList = () => {
      router.push("/chat/sessionlist");
    };

    const handleToManager = () => {
      console.log(data.userInfo);
      router.push("/manager");
    };
    
    const handleToSettings = () => {
      router.push("/chat/settings");
    };
    const handleToOwnInfo = () => {
      router.push("/chat/owninfo");
    };
    return {
      ...toRefs(data),
      router,
      unreadCount,
      handleToContactList,
      handleToSessionList,
      handleToOwnInfo,
      handleToManager,
      handleToSettings,
    };
  },
};
</script>

<style scoped>
.contact-btn-with-badge {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 8%;
  right: 8px;
  background-color: #f56c6c;
  color: #ffffff;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  padding: 0 4px;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>