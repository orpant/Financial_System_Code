<script setup lang="ts">
import { ref ,onMounted,watchEffect} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import axios from 'axios'
const router = useRouter()
// 从 Pinia Store 中获取表单数据
const userStore = useUserStore() 
// const profit = userStore.totalProfit;
// const profitIncome = userStore.totalIncome;
// const profitExpense = userStore.totalExpense;

const totalIncome = ref(0);
const totalExpense = ref(0);
const profit = ref(0);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3001/asset_data', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    });
    console.log(response);
    
    const data = response.data;
    totalIncome.value = data.totalIncome;
    totalExpense.value = data.totalExpense;
    profit.value = data.profit;
  } catch (error) {
    console.error('Error fetching income and expense data:', error);
  }
});


// 处理点击事件跳转到支出统计、资产统计和主页的函数
const handleClickExpenditure = () => {
  router.push('/Expenditure')
}
const handleClickMainbox = () => {  
  router.push('/mainbox')
}
const handleClickIncome = () => {
    router.push('/statictise')
}
</script>
<template>
    <div class="common-layout">
      <el-container>
        <el-aside width="200px">
          <div>
            <el-button type="primary" @click="handleClickIncome">收入统计</el-button>
          </div>
          <div>
            <el-button @click="handleClickExpenditure">支出统计</el-button>
          </div>
          <div>
            <el-button type="warning">资产统计</el-button>
          </div>
          <div>
            <el-button type="danger" @click="handleClickMainbox">退出</el-button>
          </div>
        </el-aside>
        <el-main>
          <div class="statictise-content">
            <!-- 显示利润收入 -->
            <div class="statictise-box">
              <!-- 显示利润 -->
              <div class="statictise-title">
                <span>利润</span>
                <p>{{ profit }}</p>
              </div>
            </div>
            <div class="statictise-box">
                <div class="statictise-title">
              <span>收入</span>
              <p>{{ totalIncome }}</p>
            </div>
            </div>
            <!-- 显示利润支出 -->
            <div class="statictise-box">
              <div class="statictise-title">
                <span>支出</span>
                <p>{{ totalExpense }}</p>
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
</template>

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.body {
  width: 1200px;
}

.common-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;

  .el-aside {
    background-color: #f0f2f5;
    padding: 20px 0;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;

    div {
      text-align: center;
      font-size: 18px;
      padding-top: 50px;
      cursor: pointer;

      .el-button {
        width: 200px;
        height: 50px;
      }
    }
  }

  .el-main {
    flex: 1;
    background-color: #fff;
    padding: 20px;
  }
}

.statictise-content {
  width: 1200px;
  height: 150px;
  background-color: rgb(144, 195, 180);
  margin-left: 180px;
  border-radius: 10px;

  .statictise-box {
    .statictise-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      padding: 10px;
    }
  }

  .statictise-box-list {
    .statictise-box-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
    }
  }
}
</style>