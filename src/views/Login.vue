<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { useUserStore} from "../store/user"
import instance from "../api/instance"

const userStore = useUserStore()
const router = useRouter();
const ruleFormRef = ref(null);
const ruleForm = ref({
  name: "LCC",
  password: "Ll0713",
  phone_number: "13632567017",
});
const rules = ref({
  name: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 2, max: 4, message: "长度在 2 到 4 个字符", trigger: "blur" },
  ],
  password: [
    //密码需要大写字母+小写字母+数字校验
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/,
      message: "密码至少包含一个大写字母、一个小写字母、一个数字",
      trigger: "blur",
    },
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 10, message: "", trigger: "blur" },
  ],
  phone_number: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});
const registerClick = () => {
  router.push("/register");
};

const token = localStorage.getItem('token');
console.log("从 localStorage 中读取的 token：", token);

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // 后端地址
});

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  function (config) {
    // 在请求发送之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
console.log("axios 实例的请求配置信息：", axiosInstance.defaults.headers);

const incomeRecords = ref([]);
const loginMian = async() => {
  try {
    await ruleFormRef.value.validate();
    // 使用 axios 发送 POST 请求
    const response = await axios.post("http://localhost:3001/login", {
      name: ruleForm.value.name,
      password: ruleForm.value.password,
      phone_number: ruleForm.value.phone_number,
    });
    console.log("请求配置信息：", {
        name: ruleForm.value.name,
        password: ruleForm.value.password,
        phone_number: ruleForm.value.phone_number,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
});
const token = response.data.token;
console.log("从后端获取到的 token：", token);
// 将 token 存储在本地
localStorage.setItem('token', token);
const incomeResponse = await axiosInstance.get("/income_records");
// 将获取到的收入数据存储到响应式变量中
incomeRecords.value = incomeResponse.data.data;
console.log("收入数据：", incomeRecords.value);
console.log("存储在 localStorage 中的 token：", localStorage.getItem('token'));
    setTimeout(() => {
      router.push("/mainbox");
    }, 1000);
    //登录成功后弹出消息提示
    ElMessage.success("登录成功");
    // console.log(response);
    userStore.newName(ruleForm.value.name)
  } catch (error) {
    console.error("登录请求错误:", error); // 在这里打印错误信息以便调试
    // 处理错误
    if (error.response && error.response.data && error.response.data.message) {
      // 请求已发出，服务器以状态码出错，且包含错误消息
      ElMessage.error("登录失败: " + error.response.data.message);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error("登录失败: 服务器无响应");
    } else {
      // 设置请求时发生了某些问题
      ElMessage.error("登录失败: 请求无法发送");
    }
    console.error(error.message);
  }
  console.log("登录成功");
};

</script>

<template>
  <div class="MainWindow">
    <div class="MainWindow_left">
    <div class="MainWindow_left_top">
      <h1>财</h1>
      <h1>务</h1>
      <h1>系</h1>
      <h1>统</h1>
      <h1>管</h1>
      <h1>理</h1>
    </div>
    </div>
    <div class="register_container">
      <el-form
        ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto" class="demo-ruleForm" status-icon>
        <el-form-item label="用户名" prop="name" style="width: 400px;">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone_number" style="padding-top: 10px; width: 400px">
          <el-input v-model="ruleForm.phone_number" />
        </el-form-item>
        <el-form-item label="密码" prop="password" style="padding-top: 10px; width: 400px">
            <el-input type="" v-model="ruleForm.password" />
            <template #append>
              <el-icon><View /></el-icon>
            </template>
        </el-form-item>
  
        <div>图片验证码</div>
        <el-form-item>
          <el-button type="primary" style="width: 170px;height: 40px;line-height: 40px;margin: 20px 30px;" @click="loginMian">登录</el-button>
          <el-button style="width: 170px; height: 40px; line-height: 40px" @click="registerClick">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.MainWindow {
  display: flex;
  .MainWindow_left {
    width: 50%;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    background-color: #005831;
    position:absolute;
    top: 0;
    left: 0;
    .MainWindow_left_top{
      color: #faebd7;
      animation: 1s infinite ease-in-out alternate;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 200px;
      h1{
        padding: 0 10px;
      }
    }
    @keyframes colorChange {
      to{
        color: #ff0266;
      }
    }
    @for $i from 1 through 6 {
      h1:nth-child(#{$i}) {
        animation: colorChange 2s ease-in-out alternate infinite;
        animation-delay: ($i - 1) * 0.5s; // 设置动画延迟
      }
  }
}
  .register_container {
    width: 55%;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    border-radius: 30px 0 0 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    right: 0;
    background-color: #fff;
  }
}

</style>