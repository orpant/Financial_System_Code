import { defineStore } from 'pinia'



export const useUserStore = defineStore('user',{
  state(){
    return {
      //用户名
        name:'',
        //收入
        income: '',
        //备注
        remark: '',
        //收款方式
        paymentMethod: '',
        //支出
        expense: '',
        //利润
        profit: '',
        //利润收入
        profitIncome:'',
        //利润支出
        profitExpense:'',
        //收入时间以及支出时间
        incomeTime: '',
        // 使用数组来存储多个收入记录
        incomeRecords: [],
        // 使用数组来存储多个支出记录
        expenseRecords: [],
        // 使用数组来储存资产统计数据
        assetsRecords: [],
        // 选定日期
        selectedDate: new Date(),
        incomeTotal: 0,
        expenseTotal: 0,
        token: '', // 新增 token 状态
        latestRecorded: null,
        latestIncome: null, // 最近的一笔收入记录
        latestTransaction: null, // 最近的一笔支出记录
        }
  },
  getters: {
    //收支统计计算
    totalIncome() {
      return this.incomeRecords.reduce((total, record) => total + parseFloat(record.income), 0)
    },
    totalExpense() {
      return this.expenseRecords.reduce((total, record) => total + parseFloat(record.expense), 0)
    },
    totalProfit() {
      return this.totalIncome - this.totalExpense;
    },
    //最近一笔支出
    latestRecord() {
      // 获取最后一笔收支记录
      const latestIncomeRecord = this.incomeRecords[this.incomeRecords.length - 1];
      const latestExpenseRecord = this.expenseRecords[this.expenseRecords.length - 1];
      
      // 定义最近一笔收支记录对象
      let latestRecord = null;
    
      // 获取最近一笔记录的时间
      const latestIncomeTime = latestIncomeRecord ? latestIncomeRecord.incomeTime : null;
      const latestExpenseTime = latestExpenseRecord ? latestExpenseRecord.incomeTime : null;
    
      // 比较最近一笔收入和支出记录的时间，确定哪个更晚
      if (latestIncomeTime && (!latestExpenseTime || latestIncomeTime >= latestExpenseTime)) {
        latestRecord = latestIncomeRecord;
      } else if (latestExpenseTime) {
        latestRecord = latestExpenseRecord;
      }
    
      // 如果最近一笔记录不为空，添加描述和金额属性
      if (latestRecord) {
        // 格式化日期
        const formattedDate = latestRecord.incomeTime.toLocaleString();
    
        // 添加备注、类型和金额属性
        const type = latestRecord === latestIncomeRecord ? '收入' : '支出';
        const amount = latestRecord === latestIncomeRecord ? latestRecord.income : latestRecord.expense;
        const description = `${formattedDate} ${latestRecord.remark} ${type} ${amount}`;
        latestRecord.description = description;
      }
      return latestRecord;
    },
    //今日新增
    todayRecords() {
      const today = new Date().toLocaleDateString();
      const filteredRecords = [];

      // 筛选今天的收入记录
      for (const record of this.incomeRecords) {
        if (new Date(record.incomeTime).toLocaleDateString() === today) {
          filteredRecords.push(record);
        }
      }

      // 筛选今天的支出记录
      for (const record of this.expenseRecords) {
        if (new Date(record.incomeTime).toLocaleDateString() === today) {
          filteredRecords.push(record);
        }
      }

      return filteredRecords;
    },
    
    // 计算年收入总额
    annualIncomeTotal() {
      const currentYear = new Date().getFullYear();
      return this.incomeRecords.reduce((total, record) => {
        const recordYear = new Date(record.incomeTime).getFullYear();
        return recordYear === currentYear ? total + parseFloat(record.income) : total;
      }, 0);
    },
    // 计算月收入总额
    monthlyIncomeTotal() {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return this.incomeRecords.reduce((total, record) => {
        const recordMonth = new Date(record.incomeTime).getMonth();
        const recordYear = new Date(record.incomeTime).getFullYear();
        return recordMonth === currentMonth && recordYear === currentYear ? total + parseFloat(record.income) : total;
      }, 0);
    },
  },
  actions:{
    //动态绑定登录用户名
    newName(name){
        this.name = name
    },
    setToken(token) {
      this.token = token;
    },
    // 设置最近收支记录的方法
    setLatestRecord(record) {
      this.latestRecord = record;
    },
    // 添加新的支出记录到数组中
    addExpenseRecord(expenseRecord) {
      this.expenseRecords.push(expenseRecord)
    },
    // 添加新的资产统计记录到数组中
    addAssetsRecord(assetsRecord) {
      this.assetsRecords.push(assetsRecord)
    },

    // 定义提交收入和支出的方法
    submitIncome(incomeData) {
      this.income = incomeData.income
      this.remark = incomeData.remark
      this.paymentMethod = incomeData.paymentMethod
      this.expense = incomeData.expense
      this.profit = incomeData.profit
      this.profitIncome = incomeData.profitIncome
      this.profitExpense = incomeData.profitExpense,
      this.incomeTime = incomeData.incomeTime,
      this.amount = incomeData.amount

    },
   
  // 添加新的收入记录到数组中，查询并更新统计数据
  addIncomeRecord(incomeRecord) {
    this.incomeRecords.push(incomeRecord);
    this.updateStatistics(this.selectedDate); // 添加记录后更新统计数据
  },
  
  // 添加新的支出记录到数组中，查询并更新统计数据
  addExpenseRecord(expenseRecord) {
    this.expenseRecords.push(expenseRecord);
    this.updateStatistics(this.selectedDate); // 添加记录后更新统计数据
  },

  // 更新收支统计数据，根据选定日期过滤出相应的记录并计算总额
  async updateStatistics(selectedDate) {
    // 更新选定日期
    this.selectedDate = selectedDate;

    // 过滤出选定日期的收入记录
    const filteredIncome = this.incomeRecords.filter(record => {
      return new Date(record.incomeTime).toDateString() === selectedDate.toDateString();
    });

    // 计算收入总额
    this.incomeTotal = filteredIncome.reduce((total, record) => total + parseFloat(record.income), 0);

    // 过滤出选定日期的支出记录
    const filteredExpense = this.expenseRecords.filter(record => {
      return new Date(record.incomeTime).toDateString() === selectedDate.toDateString();
    });

    // 计算支出总额
    this.expenseTotal = filteredExpense.reduce((total, record) => total + parseFloat(record.expense), 0);
  },
  }
})