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
        <button class="icon-btn" @click="handleToContactList">
          <el-icon>
            <User />
          </el-icon>
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
import { reactive, toRefs } from "vue";
import axios from "@/utils/axios";
export default {
  name: "NavigationModal",
  setup() {
    const router = useRouter();
    const store = useStore();
    const data = reactive({
      userInfo: store.state.userInfo,
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
      handleToContactList,
      handleToSessionList,
      handleToOwnInfo,
      handleToManager,
      handleToSettings,
    };
  },
};
</script>