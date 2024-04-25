<script setup lang="ts">
import { ref,watchEffect,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user';
const userStore = useUserStore() 
const router = useRouter()
import axios from 'axios'

// 定义一个响应式变量，用于存储收入记录数组
const incomeRecords = ref<{ income: string; remark: string; paymentMethod: string;incomeTime: string }[]>([])

// 监听收入记录数组的变化
watchEffect(() => {
  // 更新收入记录数组的值
  incomeRecords.value = userStore.incomeRecords
})

onMounted(async () => {
  try {
    // 发送请求时添加身份验证标头
    const response = await axios.get('http://localhost:3001/income_records', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // 使用用户的访问令牌作为身份验证令牌
      }
    })
    incomeRecords.value = response.data
    console.log(response);
    incomeRecords.value = response.data.data.map((item: any) => {
      return {
        income: item.income,
        remark: item.remark,
        paymentMethod: item.paymentMethod,
        incomeTime: item.incomeTime 
      };
    });
    // 将收入记录数据保存到本地存储中
    // localStorage.setItem('incomeRecords', JSON.stringify(incomeRecords.value))
  } catch (error) {
    console.error('Failed to fetch income records:', error)
  }
})
const handleClickExpenditure = () => {
  router.push('/Expenditure')
}
const handleClickAsset = () => { 
  router.push('/Asset')
}
const handleClickMainbox = () => {  
  router.push('/mainbox')
}
</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-aside width="200px">
          <div>
            <el-button type="primary">收入统计</el-button>
          </div>
          <div>
            <el-button @click="handleClickExpenditure">
                支出统计
            </el-button>
          </div>
          <div>
            <el-button type="warning" @click="handleClickAsset">资产统计</el-button>
          </div>
          <div>
            <el-button type="danger" @click="handleClickMainbox">退出</el-button>
          </div>
        </el-aside>
        <el-main>
            <div class="statictise-content">
                <div v-for="(record, index) in incomeRecords" :key="index"  class="statictise-box">
                    <div class="statictise-title">
                        <span>收入：</span>
                        <p>{{ record.income }}</p>
                    </div>
                    <div class="statictise-time"> 
                        <span>时间：</span>
                        <p>{{ record.incomeTime }}</p>
                    </div>
                    <div class="statictise-box-list">
                        <div class="statictise-box-item">
                            <span>备注：{{ record.remark }}</span>
                            <p>{{ record.paymentMethod }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </el-main>
      </el-container>
    </div>
</template>

<style lang="scss" scoped>
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.body{
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
     top:0;
     left: 0;
        div{
            text-align: center;
            font-size: 18px;
            padding-top: 50px;
            cursor: pointer;
            .el-button{
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
.statictise-content{
    width: 1200px;
    height: 100px;
    margin-left: 180px;
    
    .statictise-box{
      border-radius: 10px;
      margin-top: 10px;
      background-color: rgb(144, 195, 180);
        .statictise-title{
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            padding: 10px;
            
        }
    }
    .statictise-box-list{
        .statictise-box-item{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
        }
    }
    .statictise-time{
        display: flex;
        justify-content: space-between;
        padding: 10px;
        align-items: center;
        height: 100%;
      }
}
</style>