<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { nextTick } from "vue";
const router = useRouter();
const ruleFormRef = ref(null);
const ruleForm = ref({
  name: "chen",
  password: "Clx12345",
  repeat_password: "Clx12345",
  phone_number: "18528597017",
});
const rules = ref({
  name: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 2, max: 4, message: "长度在 2 到 4 个字符", trigger: "blur" },
  ],
  password: [
    //密码需要大写字母+小写字母+数字校验
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/, message: "密码至少包含一个大写字母、一个小写字母、一个数字", trigger: "blur" },
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 10, message: "", trigger: "blur" },
  ],
  repeat_password: [
    //密码需要大写字母+小写字母+数字校验
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/, message: "密码至少包含一个大写字母、一个小写字母、一个数字", trigger: "blur" },
    { required: true, message: "请输入确认密码", trigger: "blur" },
    { min: 6, max: 10, message: "", trigger: "blur" },
    { validator: (rule, value, callback) => {
      if (value !== ruleForm.value.password) {
        callback(new Error("两次密码输入不一致!"));
      } else {
        callback();
      }
    }
  },
  ],
  phone_number: [
    { required: true, message: "请输入手机号码", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" },
  ],
});
const loginClick = async () => {
  try {
    await ruleFormRef.value.validate();
    const response = await axios.post("http://localhost:3001/register", {
      name: ruleForm.value.name,
      password: ruleForm.value.password,
      phone_number: ruleForm.value.phone_number,
    });
    if (response.status === 200) {
      ElMessage.success("注册成功");
      nextTick();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      throw new Error("注册失败");
    }
  } catch (error) {
    console.error("注册请求错误:", error); // 在这里打印错误信息以便调试
    if (error.response && error.response.data && error.response.data.message) {
      // 请求已发出，服务器以状态码出错，且包含错误消息
      ElMessage.error("注册失败: " + error.response.data.message);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error("注册失败: 服务器无响应");
    } else {
      // 设置请求时发生了某些问题
      ElMessage.error("注册失败: 请求无法发送");
    }
  }
};
</script>

<template >
  <div class="registerMain">
    <div class="register_container">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      status-icon
    >
      <el-form-item label="用户名" prop="name" style="width: 400px;">
        <el-input v-model="ruleForm.name" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone_number" style="padding-top: 10px;width: 400px;">
        <el-input v-model="ruleForm.phone_number" />
      </el-form-item>
      <el-form-item label="密码" prop="password" style="padding-top: 10px;width: 400px;">
        <el-input type="password" v-model="ruleForm.password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="repeat_password" style="padding-top: 10px;width: 400px;">
        <el-input type="password" v-model="ruleForm.repeat_password" />
      </el-form-item>
      <el-button type="primary" style="width:170px;margin-left:200px;height:40px;line-height:40px;" @click="loginClick()" >注册</el-button>
    </el-form>
    </div>
  </div>

</template>

<style lang="scss" scoped>
.registerMain{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: #005831;
  .register_container{
    width: 500px;
    height: 400px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    margin: auto;
  }
}
 
  
</style>