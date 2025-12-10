<template>
  <div class="chat-wrap">
    <div
      class="chat-window"
      :style="{
        boxShadow: `var(${'--el-box-shadow-dark'})`,
      }"
    >
      <el-container class="chat-window-container">
        <!-- 右侧主内容区 -->
        <el-main class="main-content">
          <div class="back-btn-container">
            <el-button circle size="large" @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
          </div>

          <div class="page-title">
            <h2>我的主页</h2>
          </div>

          <div class="profile-card">
            <div class="card-left">
              <div class="avatar-wrapper">
                <img :src="userInfo.avatar" class="user-avatar" />
              </div>
            </div>

            <div class="card-right">
              <div class="nickname-section">
                <span class="label">昵称：</span>
                <span class="nickname-value">{{ userInfo.nickname }}</span>
              </div>
              
              <div class="info-list">
                <div class="info-item">
                  <el-icon class="info-icon"><User /></el-icon>
                  <span class="info-label">用户id：</span>
                  <span class="info-value">{{ userInfo.uuid }}</span>
                </div>
                
                <div class="info-item">
                  <el-icon class="info-icon"><Iphone /></el-icon>
                  <span class="info-label">电话：</span>
                  <span class="info-value">{{ userInfo.telephone || '未填写' }}</span>
                </div>

                <div class="info-item">
                  <el-icon class="info-icon"><Message /></el-icon>
                  <span class="info-label">邮箱：</span>
                  <span class="info-value">{{ userInfo.email || '未填写' }}</span>
                </div>

                <div class="info-item">
                  <el-icon class="info-icon"><Male v-if="userInfo.gender === 0"/><Female v-else/></el-icon>
                  <span class="info-label">性别：</span>
                  <span class="info-value">{{ userInfo.gender === 0 ? "男" : "女" }}</span>
                </div>

                <div class="info-item">
                  <el-icon class="info-icon"><Calendar /></el-icon>
                  <span class="info-label">生日：</span>
                  <span class="info-value">{{ userInfo.birthday || '未填写' }}</span>
                </div>

                <div class="info-item">
                  <el-icon class="info-icon"><Star /></el-icon>
                  <span class="info-label">个性签名：</span>
                  <span class="info-value">{{ userInfo.signature || '未填写' }}</span>
                </div>

                <div class="info-item">
                  <el-icon class="info-icon"><Timer /></el-icon>
                  <span class="info-label">加入wework的时间：</span>
                  <span class="info-value">{{ userInfo.created_at }}</span>
                </div>
              </div>

              <div class="action-area">
                <el-button type="primary" class="edit-btn" @click="showMyInfoModal">编辑</el-button>
              </div>
            </div>
          </div>
        </el-main>

        <!-- 编辑弹窗 (保持原有逻辑) -->
        <Modal :isVisible="isMyInfoModalVisible">
          <template v-slot:header>
            <div class="modal-header">
              <div class="modal-quit-btn-container">
                <button class="modal-quit-btn" @click="quitMyInfoModal">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
              <div class="modal-header-title">
                <h3>修改主页</h3>
              </div>
            </div>
          </template>
          <template v-slot:body>
            <el-scrollbar
              max-height="300px"
              style="
                width: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 20px;
              "
            >
              <div class="modal-body">
                <el-form ref="formRef" :model="updateInfo" label-width="70px">
                  <el-form-item
                    prop="nickname"
                    label="昵称"
                    :rules="[
                      {
                        min: 3,
                        max: 10,
                        message: '昵称长度在 3 到 10 个字符',
                        trigger: 'blur',
                      },
                    ]"
                  >
                    <el-input
                      v-model="updateInfo.nickname"
                      placeholder="选填"
                    />
                  </el-form-item>
                  <el-form-item prop="email" label="邮箱">
                    <el-input v-model="updateInfo.email" placeholder="选填" />
                  </el-form-item>
                  <el-form-item prop="birthday" label="生日">
                    <el-input
                      v-model="updateInfo.birthday"
                      placeholder="选填，格式为2024.1.1"
                    />
                  </el-form-item>
                  <el-form-item prop="signature" label="个性签名">
                    <el-input
                      v-model="updateInfo.signature"
                      placeholder="选填"
                    />
                  </el-form-item>
                  <el-form-item prop="avatar" label="头像">
                    <el-upload
                      v-model:file-list="fileList"
                      ref="uploadRef"
                      :auto-upload="false"
                      :action="uploadPath"
                      :on-success="handleUploadSuccess"
                      :before-upload="beforeFileUpload"
                    >
                      <template #trigger>
                        <el-button
                          style="background-color: rgb(252, 210.9, 210.9)"
                          >上传图片</el-button
                        >
                      </template>
                    </el-upload>
                  </el-form-item>
                </el-form>
              </div>
            </el-scrollbar>
          </template>
          <template v-slot:footer>
            <div class="modal-footer">
              <el-button class="modal-close-btn" @click="closeMyInfoModal">
                完成
              </el-button>
            </div>
          </template>
        </Modal>
      </el-container>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, ref } from "vue";
import { useStore } from "vuex";
import axios from "@/utils/axios";
import { useRouter } from "vue-router";
import Modal from "@/components/Modal.vue";
import { checkEmailValid } from "@/assets/js/valid.js";
import { generateString } from "@/assets/js/random.js";
import SmallModal from "@/components/SmallModal.vue";
import { ElMessage } from "element-plus";
import { 
  User, 
  Iphone, 
  Message, 
  Male, 
  Female, 
  Calendar, 
  Star, 
  Timer, 
  Close,
  ArrowLeft
} from '@element-plus/icons-vue'

export default {
  name: "OwnInfo",
  components: {
    Modal,
    SmallModal,
    User, 
    Iphone, 
    Message, 
    Male, 
    Female, 
    Calendar, 
    Star, 
    Timer, 
    Close,
    ArrowLeft
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    
    const goBack = () => {
      // 优先跳转到会话列表，如果需要更通用的返回可以使用 router.back()
      router.push('/chat/sessionlist');
    };

    const data = reactive({
      userInfo: store.state.userInfo,
      updateInfo: {
        uuid: "",
        nickname: "",
        email: "",
        birthday: "",
        signature: "",
        avatar: "",
      },
      isMyInfoModalVisible: false,
      ownListReq: {
        owner_id: "",
      },
      uploadRef: null,
      uploadPath: store.state.backendUrl + "/message/uploadAvatar",
      fileList: [],
      cnt: 0,
    });
    const showMyInfoModal = () => {
      data.isMyInfoModalVisible = true;
    };
    const closeMyInfoModal = async () => {
      console.log(data.fileList);
      if (
        data.updateInfo.nickname == "" &&
        data.fileList.length == 0 &&
        data.updateInfo.email == "" &&
        data.updateInfo.birthday == "" &&
        data.updateInfo.signature == ""
      ) {
        ElMessage("请至少修改一项");
        return;
      }
      if (data.updateInfo.nickname != "") {
        if (
          data.updateInfo.nickname.length < 3 ||
          data.updateInfo.nickname.length > 10
        ) {
          return;
        }
      }
      if (data.updateInfo.email != "") {
        if (!checkEmailValid(data.updateInfo.email)) {
          ElMessage("请输入有效的邮箱。");
          return;
        }
      }
      if (data.updateInfo.nickname != "") {
        data.userInfo.nickname = data.updateInfo.nickname;
      }
      if (data.updateInfo.email != "") {
        data.userInfo.email = data.updateInfo.email;
      }
      if (data.fileList.length != 0) {
        try {
          data.updateInfo.avatar = "/static/avatars/" + data.fileList[0].name;
          console.log(data.updateInfo.avatar);
          data.userInfo.avatar = store.state.backendUrl + data.updateInfo.avatar;
          store.commit("setUserInfo", data.userInfo);
          data.uploadRef.submit();
        } catch (error) {
          console.log(error);
        }
      }

      if (data.updateInfo.birthday != "") {
        data.userInfo.birthday = data.updateInfo.birthday;
      }
      if (data.updateInfo.signature != "") {
        data.userInfo.signature = data.updateInfo.signature;
      }
      data.isMyInfoModalVisible = false;
      data.fileList = [];
      data.cnt = 0;
      data.updateInfo.uuid = data.userInfo.uuid;
      store.commit("setUserInfo", data.userInfo);
      try {
        const rsp = await axios.post(
          store.state.backendUrl + "/user/updateUserInfo",
          data.updateInfo
        );
        console.log(rsp);
        if (rsp.data.code == 200) {
          ElMessage.success(rsp.data.message);
        } else if (rsp.data.code == 400) {
          ElMessage.error(rsp.data.message);
        } else if (rsp.data.code == 500) {
          ElMessage.error(rsp.data.message);
        }
      } catch (error) {
        console.log(error);
      }
      router.go(0);
    };
    const quitMyInfoModal = () => {
      data.isMyInfoModalVisible = false;
      data.fileList = [];
      data.cnt = 0;
    };
    const handleUploadSuccess = () => {
      ElMessage.success("头像上传成功");
      data.fileList = [];
    };
    const beforeFileUpload = (file) => {
      console.log("上传前file====>", file);
      console.log(data.fileList);
      console.log(file);
      if (data.fileList.length > 1) {
        ElMessage.error("只能上传一张头像");
        return false;
      }
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        ElMessage.error("上传头像图片大小不能超过 50MB!");
        return false;
      }
    };
    const getFileExtension = (filename) => {
      const parts = filename.split(".");
      return parts.length > 1 ? parts.pop() : "";
    };

    
    return {
      ...toRefs(data),
      router,
      showMyInfoModal,
      closeMyInfoModal,
      quitMyInfoModal,
      handleUploadSuccess,
      beforeFileUpload,
      goBack,
    };
  },
};
</script>

<style scoped>
/* 保持原有布局容器 */
.chat-window-container {
  height: 100%;
}

.aside-container {
  display: none;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  background: linear-gradient(135deg, #ffe6e6 0%, #e8f4ff 100%); /* 粉蓝渐变背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100%; /* 确保高度填满 */
  box-sizing: border-box; /* 包含 padding */
  overflow: hidden; /* 防止外层滚动 */
  position: relative; /* 为绝对定位的返回按钮提供参考 */
}

.back-btn-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
}

.page-title h2 {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-weight: 800;
  letter-spacing: 2px;
}

/* 卡片样式 */
.profile-card {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 24px;
  padding: 30px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05); /* 柔和的阴影 */
  display: flex;
  gap: 40px;
  align-items: flex-start;
  transition: transform 0.3s ease;
  max-height: calc(100vh - 150px); /* 限制最大高度，减去标题和 padding */
  overflow-y: auto; /* 内容过多时内部滚动 */
}

.profile-card:hover {
  transform: translateY(-5px);
}

/* 卡片左侧：头像 */
.card-left {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid #6bb5ff; /* 亮蓝色边框 */
  padding: 4px;
  background-color: white;
  object-fit: cover;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #4facfe;
  transform: rotate(5deg);
}

/* 卡片右侧：信息 */
.card-right {
  flex: 1;
  width: 100%;
}

.nickname-section {
  font-size: 32px;
  margin-bottom: 25px;
  font-weight: 800;
  color: #1a1a1a;
  display: flex;
  align-items: baseline;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.nickname-value {
  margin-left: 10px;
}

.label {
  font-size: 20px;
  color: #666;
  font-weight: normal;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
}

.info-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #9ca3af;
}

.info-label {
  min-width: 70px;
  color: #6b7280;
}

.info-value {
  color: #111827;
  font-weight: 500;
}

/* 操作区域 */
.action-area {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  background-color: #4facfe;
  border: none;
  padding: 12px 36px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(79, 172, 254, 0.3);
}

.edit-btn:hover {
  background-color: #3d8bfe;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

/* 弹窗样式 (保持) */
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
}

.modal-header {
  height: 20%;
  width: 100%;
}

.modal-header-title {
  text-align: center;
}

h3 {
  font-family: Arial, Helvetica, sans-serif;
  color: rgb(69, 69, 68);
}

.modal-body {
  padding: 0 20px;
}

.modal-footer {
  height: 20%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>