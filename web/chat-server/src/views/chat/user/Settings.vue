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
          <ContactListModal></ContactListModal>
        </el-aside>
        <div class="settings-window">
          <div class="settings-title"><h2>设置</h2></div>
          
          <el-tabs v-model="activeTab" class="settings-tabs">
            <el-tab-pane label="常规" name="general">
              <div class="settings-content">
                <!-- 保存主密钥开关 -->
                <div class="settings-item">
                  <div class="settings-item-label">
                    <span>保存主密钥</span>
                    <el-tooltip
                      effect="dark"
                      placement="right"
                      :content="masterKeyTooltip"
                      :show-after="300"
                      popper-class="master-key-tooltip"
                    >
                      <el-icon class="settings-tooltip-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                  <el-switch
                    v-model="saveMasterKey"
                    size="default"
                    @change="handleSaveMasterKeyChange"
                  />
                </div>

                <!-- 退出登录按钮 -->
                <div class="settings-item logout-item">
                  <el-button
                    type="danger"
                    size="large"
                    @click="handleLogout"
                    :loading="logoutLoading"
                  >
                    退出登录
                  </el-button>
                </div>
              </div>
            </el-tab-pane>
            <!-- 可以在这里添加其他标签页，如：安全、隐私等 -->
          </el-tabs>
        </div>
      </el-container>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "@/utils/axios";
import NavigationModal from "@/components/NavigationModal.vue";
import ContactListModal from "@/components/ContactListModal.vue";

export default {
  name: "Settings",
  components: {
    NavigationModal,
    ContactListModal,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    
    const data = reactive({
      activeTab: 'general', // 当前激活的标签页
      saveMasterKey: false, // 保存主密钥开关状态
      logoutLoading: false, // 退出登录加载状态
      masterKeyTooltip: `启用后，主密钥将被加密存储在浏览器中，刷新页面后无需重新输入密码即可使用加密功能。

安全性说明：
• 主密钥仅存储在 sessionStorage（会话存储）中
• 关闭浏览器标签页或浏览器后，主密钥会自动清除
• 主密钥使用加密方式存储，提供一定的安全性保障

警告：
• 如果其他人能够访问您的浏览器，启用此选项可能存在安全风险
• 建议在私人设备上使用此功能`,
    });

    // 页面加载时检查 sessionStorage 是否有主密钥
    onMounted(() => {
      const savedMasterKey = sessionStorage.getItem('masterKey');
      if (savedMasterKey) {
        data.saveMasterKey = true;
        console.log('✅ 检测到 sessionStorage 中有主密钥，开关设置为打开状态');
      } else {
        data.saveMasterKey = false;
        console.log('ℹ️ sessionStorage 中没有主密钥，开关设置为关闭状态');
      }
    });

    // 保存主密钥开关变化处理
    const handleSaveMasterKeyChange = (value) => {
      console.log("保存主密钥开关状态变化:", value);
      
      if (value) {
        // 打开开关：保存主密钥到 sessionStorage
        if (store.state.masterKey) {
          store.commit("saveMasterKeyToStorage", store.state.masterKey);
          ElMessage.success("主密钥已保存，刷新页面后无需重新输入密码");
        } else {
          ElMessage.warning("当前没有主密钥，请先登录");
          data.saveMasterKey = false; // 恢复开关状态
        }
      } else {
        // 关闭开关：从 sessionStorage 删除主密钥（但保留在内存中）
        store.commit("removeMasterKeyFromStorage");
        ElMessage.info("主密钥已从本地删除，刷新页面后需要重新登录");
      }
    };

    // 退出登录
    const handleLogout = async () => {
      data.logoutLoading = true;
      try {
        const req = {
          owner_id: store.state.userInfo.uuid,
        };
        // 先调用退出登录接口（此时 token 还在）
        const rsp = await axios.post("/user/wsLogout", req);
        
        if (rsp.data.code == 200) {
          // 接口成功后再清除 token
          store.commit("cleanUserInfo");
          ElMessage.success(rsp.data.message);
          router.push("/login");
        } else {
          ElMessage.error(rsp.data.message);
        }
      } catch (error) {
        // 即使接口失败，也清除本地 token（避免卡住）
        console.error("退出登录失败", error);
        store.commit("cleanUserInfo");
        router.push("/login");
      } finally {
        data.logoutLoading = false;
      }
    };

    return {
      ...toRefs(data),
      handleSaveMasterKeyChange,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.settings-window {
  width: 84%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
}

.settings-title {
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
}

.settings-title h2 {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: rgb(69, 69, 68);
}

.settings-tabs {
  width: 90%;
  max-width: 800px;
}

.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 30px;
}

.settings-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.settings-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: rgb(69, 69, 68);
}

.settings-tooltip-icon {
  cursor: help;
  color: #909399;
  font-size: 16px;
  transition: color 0.3s;
}

.settings-tooltip-icon:hover {
  color: #409eff;
}

.logout-item {
  justify-content: center;
  margin-top: 20px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
}

.logout-item :deep(.el-button) {
  width: 200px;
  font-size: 16px;
}
</style>

<style>
/* 全局样式：美化主密钥提示气泡 */
.master-key-tooltip {
  max-width: 400px !important;
  white-space: pre-line !important;
  line-height: 1.6 !important;
  font-size: 13px !important;
  padding: 12px 16px !important;
}
</style>

