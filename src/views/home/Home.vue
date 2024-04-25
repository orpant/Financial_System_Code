<script setup>
import { ref, onMounted ,computed} from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user';
import axios from 'axios';
import * as echarts from 'echarts';

const userStore = useUserStore()
const router = useRouter()
const chart = ref(null)
const value2 = ref('')

const setupChart = () => {
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(chart.value);

  // 绘制图表
  myChart.setOption({
    xAxis: {
      type: 'category',
      data: ['收入', '支出'] // 使用每日收入数据的日期作为 x 轴数据
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [selectedIncome.value,selectedExpense.value], // 使用每日收入数据的总额作为 y 轴数据
        type: 'line'
      }
    ]
  });
};


const shortcuts = [
  {
    text: 'Today',
    value: new Date(),
  },
  {
    text: 'Yesterday',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'A week ago',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
]

const disabledDate = (time) => {
  return time.getTime() > Date.now()
}
//用于控制表单的显示和隐藏记入
const showIncomeDialog = ref(false);
const showProfitDialog = ref(false);
const incomeForm = ref({
  income: '',
  remark: '',
  paymentMethod: '',
  incomeTime: '',
});
const profitForm = ref({  
  profit: '',
  profitIncome: '',
  profitExpense: '',
  income: '',
});
//支出
const showExpenseDialog = ref(false);
const expenseForm = ref({
  expense: '',
  remark: '',
  paymentMethod: '',
  incomeTime: ''
});

//点击按钮触发表单显示为true
const Recordincome = () => {
  showIncomeDialog.value = true;
}
const Statistics = async() => {
  try {
    const token = localStorage.getItem('token'); // 从本地存储中获取令牌
    if (!token) {
      console.error('Token not found in localStorage');
      return; // 如果令牌不存在，则退出函数
    }
    const response = await axios.get('http://localhost:3001/asset_data', {
      headers: {
        Authorization: `Bearer ${token}`, // 添加认证标头
      },
    });
    router.push('/Asset');
  } catch (error) {
    console.error('Error fetching asset data:', error);
  }
}
// 确认收入
const confirmIncome = async() => {
  // 将表单数据存储到 Pinia 存储中
    // 获取当前时间
    // const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const currentTime = new Date().toLocaleString();

  userStore.addIncomeRecord({
    income: incomeForm.value.income,
    remark: incomeForm.value.remark,
    paymentMethod: incomeForm.value.paymentMethod,
    incomeTime: currentTime
  })
  try {
    const response = await axios.post('http://localhost:3001/saveIncomeRecord', {
      income: incomeForm.value.income,
      remark: incomeForm.value.remark,
      paymentMethod: incomeForm.value.paymentMethod,
      incomeTime: currentTime // 将当前时间传递给后端
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('收入记录保存成功:', response.data);
    // 请求saveRecentTransaction接口将数据保存到最近收支记录中
    const responseRecent = await axios.post('http://localhost:3001/saveRecentTransaction', {
      type: 'income', // 收入类型
      description: incomeForm.value.remark,
      amount: incomeForm.value.income,
      date: currentTime // 将当前时间传递给后端
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('最近收支记录保存成功:', responseRecent.data);
    // 在这里处理请求成功后的逻辑，比如刷新数据等
    
  } catch (error) {
    console.error('保存收入记录失败:', error);
    // 在这里处理请求失败后的逻辑，比如提示用户保存失败等
  }
  router.push('/statictise');
  // 重置表单数据
  incomeForm.value.income = ''
  incomeForm.value.remark = ''
  incomeForm.value.paymentMethod = ''
  incomeForm.value.incomeTime = ''
}


// 确认支出
const confirmExpense = async() => {
  // 将表单数据存储到 Pinia 存储中
  // 获取当前时间
  const currentTime = new Date().toLocaleString();
  userStore.addExpenseRecord({
    expense: expenseForm.value.expense,
    remark: expenseForm.value.remark,
    paymentMethod: expenseForm.value.paymentMethod,
    incomeTime: currentTime
  })
  try {
    const response = await axios.post('http://localhost:3001/saveExpenditureRecord', {
      expense: expenseForm.value.expense,
      remark: expenseForm.value.remark,
      paymentMethod: expenseForm.value.paymentMethod,
      incomeTime: currentTime // 将当前时间传递给后端
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
    );
    console.log('支出记录保存成功:', response.data);
    // 在这里处理请求成功后的逻辑，比如刷新数据等
  } catch (error) {
    console.error('保存支出记录失败:', error);
    // 在这里处理请求失败后的逻辑，比如提示用户保存失败等
  }
  // 在确认后进行页面跳转或其他操作
  router.push('/Expenditure')
    // 重置表单数据
    expenseForm.value.expense = ''
    expenseForm.value.remark = ''
    expenseForm.value.paymentMethod = ''
    expenseForm.value.incomeTime = ''
};
//点击表单里面的取消按钮，触发表单为false关闭表单
const cancelIncome = () => {
  showIncomeDialog.value = false;
};

const Recordexpenses = () => {
  showExpenseDialog.value = true;
}

const cancelExpense = () => {
  showExpenseDialog.value = false;
};

const logout_btn = () => {
  router.push('/login')
}

// 定义变量用于存储最近一笔收支和今日新增收入记录
const latestRecorded = ref(null);
const latestIncome = ref(null);
let latestTransaction = ref({});
const yearIncomeTotal = ref(null);
const monthIncomeTotal = ref(null);
const yearExpenseTotal = ref(null);
const yearProfit = ref(null);
onMounted(async () => {
  try {
    // 获取最近一笔收入
    const latestIncomeResponse = await axios.get('http://localhost:3001/income_records',{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const latestIncome = latestIncomeResponse.data.data[latestIncomeResponse.data.data.length - 1];
    console.log('最近一笔收入:', latestIncome);
    userStore.latestIncome = latestIncome;
    console.log('最新收入记录:', userStore.latestIncome);
    
    // 获取最近一笔支出
    const latestExpenseResponse = await axios.get('http://localhost:3001/expense_records', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const latestExpense = latestExpenseResponse.data.data[latestExpenseResponse.data.data.length - 1];
    console.log('最近一笔支出:', latestExpense);
    userStore.latestRecorded = latestExpense;
    console.log('最新支出记录:', userStore.latestRecorded);
    // 这段代码的作用是 获取最近一笔收支记录，并将其赋值给latestTransaction变量
    latestTransaction.value = latestIncome.incomeTime > latestExpense.incomeTime ? latestIncome : latestExpense;
    // 设置最近一笔收支的类型
    latestTransaction.value.type = latestIncome.incomeTime > latestExpense.incomeTime ? 'income' : 'expense';
    console.log('最近收支类型:' + latestTransaction.value.type);
    console.log('最近收支记录:', latestTransaction.value);

    const getUserInfo = await axios.get('http://localhost:3001/user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('用户信息:', getUserInfo.data.data);
    userStore.name = getUserInfo.data.data.name;

    // 获取收入总额
    const aasetData = await axios.get('http://localhost:3001/asset_data', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    });
    console.log('总额:', aasetData.data.totalIncome);
    console.log(aasetData.data);
    // 年收入总额
    yearIncomeTotal.value = aasetData.data.totalIncome;
    // 年支出总额
    yearExpenseTotal.value = aasetData.data.totalExpense;
    // 年利润
   yearProfit.value = aasetData.data.totalIncome - aasetData.data.totalExpense;
    fetchDailyIncomeTotal()
    setupChart()
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

// 定义响应式数据
const selectedDate = ref(new Date());
const dailyIncomeTotal = null; // 用于存储每日收入总额
const dailyIncomeData = ref([]);
const processedData = ref([]); // 用于存储处理后的每日收入数据
const dailyExpenseData = ref([]); // 用于存储每日支出数据
const fetchDailyIncomeTotal = async () => {
  try {
    if (!selectedDate.value) {
      console.error('selectedDate is not defined');
      return;
    }
    const response = await axios.get('http://localhost:3001/daily_income_totals', {
      params: {
        date: selectedDate.value // 将所选日期作为查询参数发送到后端
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // 添加认证头
      }
    });

    // 支出
    const responseExpense = await axios.get('http://localhost:3001/daily_expense_totals', {
      params: {
        date: selectedDate.value // 将所选日期作为查询参数发送到后端
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // 添加认证头
      }
    });
    
    // 处理收入数据，日期数据：将UTC时间转换为本地时间
    const processedData = response.data.data.map(item => {
      const date = new Date(item.date);
      // 获取本地日期字符串
      const localDate = date.toLocaleDateString(); 
      return { ...item, date: localDate }; // 更新日期字段为本地日期
    });
    dailyIncomeData.value = processedData;
    console.log('每日收入数据:', dailyIncomeData.value);

    // 处理支出数据，日期数据：将UTC时间转换为本地时间
    const processedExpenseData = responseExpense.data.data.map(item => {
      const date = new Date(item.date);
      // 获取本地日期字符串
      const localDate = date.toLocaleDateString(); 
      return { ...item, date: localDate }; // 更新日期字段为本地日期
    });
    dailyExpenseData.value = processedExpenseData;
    console.log('每日支出数据:', processedExpenseData);
    setupChart();

  } catch (error) {
    console.error('Error fetching daily income total:', error);
  }
};
// 定义计算属性函数，用于获取所选日期的收入总额
const selectedIncome = computed(() => {
  if (!selectedDate.value || !dailyIncomeData.value.length) {
    return null; // 如果没有选择日期或者没有收入数据，则返回 null
  }
  // 控制台输出所选日期和每日收入数据，以便调试
  console.log('所选日期:', selectedDate.value);
  console.log('每日收入数据:', dailyIncomeData.value);

    // 将所选日期转换为字符串，格式为 'YYYY/MM/DD'
    const selectedMonth = selectedDate.value.getMonth() + 1; // 将月份减去 1
    const selectedDateString = `${selectedDate.value.getFullYear()}/${selectedMonth}/${selectedDate.value.getDate()}`;
    console.log('所选日期字符串:', selectedDateString);
  
  // 在 dailyIncomeData 中查找与所选日期对应的收入数据
  const selectedData = dailyIncomeData.value.find(item => {
    // 将每日收入数据中的日期转换为字符串，格式为 'YYYY/MM/DD'
    const itemDateString = `${new Date(item.date).getFullYear()}/${new Date(item.date).getMonth() + 1}/${new Date(item.date).getDate()}`;
    return itemDateString === selectedDateString;
});
  if(selectedData){
    console.log('所选日期的收入数据:', selectedData.date);
  }else{
    console.log('所选日期的收入数据不存在');
  }
  return selectedData ? selectedData.totalIncome : null; // 返回所选日期的收入总额，如果不存在则返回 null
});

// 定义计算属性函数，用于获取所选日期的支出总额
const selectedExpense = computed(() => {
  if (!selectedDate.value || !dailyIncomeData.value.length) {
    return null; // 如果没有选择日期或者没有支出数据，则返回 null
  }
  // 控制台输出所选日期和每日支出数据，以便调试
  console.log('所选日期:', selectedDate.value);
  console.log('每日支出数据:', dailyIncomeData.value);

    // 将所选日期转换为字符串，格式为 'YYYY/MM/DD'
    const selectedMonth = selectedDate.value.getMonth() + 1; // 将月份减去 1
    const selectedDateString = `${selectedDate.value.getFullYear()}/${selectedMonth}/${selectedDate.value.getDate()}`;
    console.log('所选日期字符串:', selectedDateString);
  
  // 在 dailyExpenseData 中查找与所选日期对应的支出数据
  const selectedData = dailyExpenseData.value.find(item => {
    // 将每日支出数据中的日期转换为字符串，格式为 'YYYY/MM/DD'
    const itemDateString = `${new Date(item.date).getFullYear()}/${new Date(item.date).getMonth() + 1}/${new Date(item.date).getDate()}`;
    return itemDateString === selectedDateString;
});
  if(selectedData){
    console.log('所选日期的支出数据:', selectedData.date);
  }else{
    console.log('所选日期的支出数据不存在');
  }
  return selectedData ? selectedData.totalExpense : null; // 返回所选日期的支出总额，如果不存在则返回 null
});



</script>
<template>
  <div class="home">
   <div class="home-header">
    <h1>欢迎{{userStore.name}}，使用财务管理系统</h1>
    <el-button @click="logout_btn">退出登录</el-button>
   </div>
    
    <el-header>
      <div>
        <div class="el-header-top">
       <div class="el-header-top-left">
        <span>最近一笔收支</span>
       </div>
        <div class="el-header-top-right" style="margin-left: auto;">
        <span>今日新增收入</span>
      </div>
      </div>
      <div class="el-header-top-foofter" style="display:flex; justify-content: space-between; margin-top: 10px;">
        <div class="el-header-footer">
          <!-- 判断最近一笔收支，如果是支出则渲染支出信息，如果是收入则渲染收入信息 -->
          <div v-if="latestTransaction">
            <div class="el-header-footer-income"> 
              <span>{{ latestTransaction.type === 'income' ? '收入：' + latestTransaction.income : '支出：' + latestTransaction.expense  }}</span>
              <p>{{ latestTransaction.remark }}</p>
              <p>{{ latestTransaction.paymentMethod }}</p>
              <p>{{ latestTransaction.incomeTime }}</p>
            </div>
          </div>
          <div v-else>
            <p>暂无最近一笔收支记录</p>
          </div>
      </div>
      <div class="el-header-footer">
        <!-- <span>2022-01-01 </span>
        <p>开发app</p>
        <p>3000元</p> -->
        <div v-if="userStore.latestIncome">
          <div class="el-header-footer-income"> 
              <span>{{'收入'+ userStore.latestIncome.income }}</span>
              <p>{{ userStore.latestIncome.remark }}</p>
              <p>{{ userStore.latestIncome.paymentMethod }}</p>
              <p>{{ userStore.latestIncome.incomeTime }}</p>
           </div>
        </div>
      <div v-else>
          <p>暂无今日新增收入记录</p>
      </div>
      </div>
      </div>
      </div>
     <div class="el-header-inner">
      <el-aside >
        <div class="el-year-month">
            <span>年收入总额和支出总额</span>
        </div>
        <div>
          <div class="el-year">
            <span>年收入总额:</span>
            <p>{{yearIncomeTotal }}</p>
          </div>
          <div class="el-year">
            <span>年支出总额:</span>
            <p>{{ yearExpenseTotal}}</p>
          </div>
          <div class="el-year">
            <span>年利润:</span>
            <p>{{ yearProfit }}</p>
          </div>
        </div>
      </el-aside>
      <el-aside >
          <h3>快捷功能</h3>
          <div class="button-elements">
            <el-button type="primary" size="default" style="width: 200px;height: 60px;" @click="Recordincome">记收入</el-button>
            <el-button  size="defalut" style="width: 200px;height: 60px;"  @click="Recordexpenses">记支出</el-button>
            <el-button type="warning" size="default" style="width: 200px;height: 60px;" @click="Statistics">收支统计</el-button>
          </div>
      </el-aside>
      <el-aside>
          <div class="el-date-picker-block">
            <h3>收支统计</h3>
            <!-- 选择需要查询的日期 -->
            <el-date-picker v-model="selectedDate" type="date" placeholder="Pick a day" @change="fetchDailyIncomeTotal" />
          </div>
          <div class="el-date-picker-block-2">
            <span>收入</span>
            <!-- 使用计算属性函数来获取所选日期的收入总额 -->
            <p>{{ selectedIncome }}元</p>
          </div>
          <div class="el-date-picker-block-3">
            <span>支出</span>
            <!-- 使用计算属性函数来获取所选日期的收入总额 -->
            <p>{{  selectedExpense }}元</p>
          </div>
      </el-aside>

  
<el-aside >
        <div class="el-date-picker-block-4">
          <h4>收支图标展示</h4>
        </div>
        <el-date-picker v-model="selectedDate" type="date" placeholder="Pick a day" @change="fetchDailyIncomeTotal" />
        <div class="chart" ref="chart" >
        </div>
</el-aside>
     </div>
</el-header> 


    <!-- 收入表单弹窗 -->
    <el-dialog v-model="showIncomeDialog" title="记收入">
      <el-form :model="incomeForm" label-width="100px">
        <el-form-item  label="收入">
          <el-input v-model="incomeForm.income"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="incomeForm.remark"></el-input>
        </el-form-item>
        <!-- 收入时间 -->
        <el-form-item label="收入时间">
          <el-date-picker v-model="incomeForm.incomeTime" type="date" placeholder="Pick a day" :disabled-date="disabledDate" :shortcuts="shortcuts"></el-date-picker>
        </el-form-item>
        <el-form-item label="收款方式">
          <el-select v-model="incomeForm.paymentMethod">
            <el-option label="现金" value="现金"></el-option>
            <el-option label="信用卡" value="信用卡"></el-option>
            <el-option label="转账" value="转账"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelIncome">取消</el-button>
        <el-button type="primary" @click="confirmIncome">确认</el-button>
      </template>
    </el-dialog>
   
    
      <!-- 支出表单弹窗 -->
    <el-dialog v-model="showExpenseDialog" title="记支出">
      <el-form :model="expenseForm" label-width="100px">
        <el-form-item label="支出">
          <el-input v-model="expenseForm.expense"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="expenseForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="收入时间">
          <el-date-picker v-model="expenseForm.incomeTime" type="date" placeholder="Pick a day"  :disabled-date="disabledDate" :shortcuts="shortcuts"></el-date-picker>
        </el-form-item>
        <el-form-item label="付款方式">
          <el-select v-model="expenseForm.paymentMethod">
            <el-option label="现金" value="现金"></el-option>
            <el-option label="信用卡" value="信用卡"></el-option>
            <el-option label="转账" value="转账"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
            <el-button @click="cancelExpense">取消</el-button>
            <el-button type="primary" @click="confirmExpense">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>   

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.home {
  width: 100%;
  font-family: 'Arial', sans-serif;
  padding: 20px;
  height: 100%;
  overflow: hidden;
}
.home-header{
  display: flex;

  h1 {
  margin: -20px 150px;
  width: 300px;
  height: 80px;
  background-color: #33a5bf;
  line-height: 80px;
  border-radius: 10px;
  position: relative;
  text-align: center;
  //添加阴影
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  font-size: 20px;
  right: 150px;
}
.el-button {
  margin-left: 600px;
  background-color: red;
  color: #fff;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

}

/* Header styles */
.el-header {
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  border-radius: 10px;
  padding: 20px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-header-top {
display: flex;
width: 1000px;
height: 30px;
border-radius: 5px;
}

.el-header-footer {
  display: flex;
  border-top: 1px solid #ccc;
  padding-top: 20px;
  margin-bottom: 20px;
}
.el-header-footer-income{
  display: flex;
  p{
    margin-left: 10px;
  }
}

.el-header-inner {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

/* Aside styles */
.el-aside {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: auto;
}

.el-aside h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Button container styles */
.button-elements {
  display: flex;
  flex-direction: column;
  align-items: center; /* 垂直居中对齐 */
  gap: 20px;
  margin-top: 30px;
}

/* Additional styles */
.el-year, .el-month {
  text-align: center;
  padding: 10px 5px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-top: 20px;
}

.el-year p, .el-month p {
  font-size: 24px;
  font-weight: bold;
}

.stats-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.el-date-picker-block-2, .el-date-picker-block-3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
  margin-top: 20px;
}
.chart {
  height: 300px;
  width: 300px;
}
.h4-two{
  margin-top: 20px;
}
.el-dialog {
  max-width: 400px; /* 设置最大宽度 */
}

.el-form-item {
  margin-bottom: 20px; /* 调整表单项之间的间距 */
}

.el-input,
.el-select {
  width: 100%; /* 让输入框和下拉框宽度充满父容器 */
}
.el-button {
  width: 120px; /* 设置按钮宽度 */
  height: 40px; /* 设置按钮高度 */
  margin-right: 10px; /* 设置按钮之间的间距 */
}

</style>