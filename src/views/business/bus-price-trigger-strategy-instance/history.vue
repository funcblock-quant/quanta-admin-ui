<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px" class="query-form">
          <el-form-item label="API Key" prop="status">
            <el-select
              v-model="queryParams.apiConfig"
              placeholder="请选择API Key"
              clearable
              size="small"
            >
              <el-option
                v-for="apiKey in apiKeyList"
                :key="apiKey.id"
                :label="apiKey.accountName"
                :value="apiKey.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              size="small"
            >
              <el-option
                v-for="status in strategyStatus"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="交易币种" prop="symbol">
            <el-select
              v-model="queryParams.symbol"
              placeholder="请选择交易币种"
              clearable
              size="small"
            >
              <el-option
                v-for="symbol in symbolList"
                :key="symbol.value"
                :label="symbol.label"
                :value="symbol.value"
              />
            </el-select>
          </el-form-item>

          <div class="button-group">  <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" class="mr-10" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
          </div>
        </el-form>
      </el-card>

      <el-card v-for="item in busPriceTriggerStrategyInstanceList" :key="item.id" class="box-card">
        <div class="main-data">
          <div class="data-item">
            <span class="label">Exchange User Id：</span>
            <span class="value">{{ item.exchangeUserId }}</span>
          </div>
          <div class="data-item full-width">
            <span class="label">API Key：</span>
            <span class="value">{{ item.apiConfigData.accountName }}</span>
          </div>
          <div class="data-item">
            <span class="label">交易币种：</span>
            <span class="value">{{ item.symbol }}</span>
          </div>
          <div class="data-item">
            <span class="label">买卖方向：</span>
            <span class="value" :class="sideClass(item.side)">{{ sideFormat(item.side) }}</span>
          </div>
          <div class="data-item">
            <span class="label">开仓价格：</span>
            <span class="value">{{ item.openPrice }}</span>
          </div>
          <div class="data-item">
            <span class="label">平仓价格：</span>
            <span class="value">{{ item.closePrice }}</span>
          </div>
          <div class="data-item">
            <span class="label">开仓数量：</span>
            <span class="value">{{ item.amount }}</span>
          </div>
          <div class="data-item">
            <span class="label">停止时间：</span>
            <span class="value">{{ parseTime(item.closeTime) }}</span>
          </div>
          <div class="data-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ parseTime(item.createdAt) }}</span>
          </div>
          <div class="data-item">
            <span class="label">状态：</span>
            <span class="value" :class="statusClass(item.status)">{{ statusFormat(item.status) }}</span>
          </div>
          <div class="data-item full-width">
            <span class="label">总下单次数：</span>
            <span class="value">{{ item.statistical.orderNum }}</span>
          </div>
          <div class="data-item full-width">
            <span class="label">总盈亏：</span>
            <span class="value">{{ item.statistical.totalPnl }}</span>
          </div>
          <div v-if="item.status==='started'" class="data-item">
            <el-popconfirm
              class="delete-popconfirm"
              title="确认要暂停吗?"
              confirm-button-text="暂停"
              @confirm="handleStopInstance(item.id)"
            >
              <el-button
                slot="reference"
                size="mini"
                type="text"
                icon="el-icon-delete"
              >暂停
              </el-button>
            </el-popconfirm>
          </div>
        </div>

        <el-collapse v-model="activeNames" @change="handleCollapseChange">
          <el-collapse-item :name="item.id">
            <template slot="title">详情</template>
            <div v-if="item.loadingDetails">
              <el-loading text="加载中..." />
            </div>
            <div v-else ref="detailLog" class="detail-log">
              <div v-for="(detail, index) in displayedDetails(item.details)" :key="index" class="log-item">
                <div v-if="!detail.errMsg" class="detail-line">
                  <span style="color: #457940; font-weight: bold;">[{{ detail.formattedCreatedAt }}]: </span>
                  <span> 交易所: <span style="font-weight: bold;">{{ detail.exchangeName }}</span></span>
                  <span> 成交一笔 <span style="font-weight: bold;">{{ detail.symbol }}</span> <span style="font-weight: bold;">  价格:</span>${{ detail.originPrice }}  <span style="font-weight: bold;">  数量:</span> {{ detail.originQty }} </span>
                  <span><span style="font-weight: bold;"> 方向: </span> {{ detail.formattedSide }}</span>
                  <span><span style="font-weight: bold;"> 手续费:</span> {{ detail.formattedFee }}{{ detail.feeAsset }}</span>
                  <!-- <span><span style="font-weight: bold;"> 角色:</span> {{ detail.formattedRole }}</span>
                  <span><span style="font-weight: bold;"> 状态:</span> {{ detail.status }}</span> -->
                  <span><span style="font-weight: bold;"> pnl: </span> {{ detail.pnl }}</span>
                </div>
                <div v-else class="error-message">
                  <span style="font-weight: bold;">[{{ detail.formattedCreatedAt }}]: </span>
                  <span><span style="font-weight: bold;"> 交易所订单ID: </span> {{ detail.orderId }}</span>
                  <span><span style="font-weight: bold;"> 发生异常: </span> {{ detail.errMsg }}</span>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

    </template>
  </BasicLayout>
</template>

<script>
import {
  addBusPriceTriggerStrategyInstance,
  getBusPriceTriggerStrategyInstance, getSymbolList,
  listBusPriceTriggerStrategyInstance,
  stopBusPriceTriggerStrategyInstance,
  updateBusPriceTriggerStrategyInstance
} from '@/api/business/bus-price-trigger-strategy-instance'
import { listBusPriceMonitorForOptionHedging } from '@/api/business/bus-price-monitor-for-option-hedging'
import moment from 'moment'
import { listBusPriceTriggerStrategyApikeyConfig } from '@/api/business/bus-price-trigger-strategy-apikey-config'

export default {
  name: 'BusPriceTriggerStrategyInstanceHistory',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      apiKeyManageTitle: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 用户角色
      roleKey: '',
      // 类型数据字典
      typeOptions: [],
      busPriceTriggerStrategyInstanceList: [],
      expandRowKeys: [],
      passwordVisible: false, // 控制密码可见性
      // 关系表类型
      strategyStatus: [
        { label: '已暂停', value: 'stopped' },
        { label: '已过期', value: 'expired' }
      ],
      sideDict: [
        { label: '做多', value: 'long' },
        { label: '做空', value: 'short' }
      ],
      symbolList: [
        { label: 'BTC/USDT', value: 'BTC/USDT' },
        { label: 'ETH/USDT', value: 'ETH/USDT' },
        { label: 'DOGE/USDT', value: 'DOGE/USDT' },
        { label: 'CHEEMS/USDT', value: 'CHEEMS/USDT' },
        { label: 'BTC/USDC', value: 'BTC/USDC' },
        { label: 'ETH/USDC', value: 'ETH/USDC' },
        { label: 'DOGE/USDC', value: 'DOGE/USDC' }
      ],
      exchangeList: [
        { label: 'Gate.io', value: 'GateIo' }
      ],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10000,
        closeTime: undefined,
        status: 'stopped',
        symbol: 'BTC/USDT',
        apiConfig: '',
        idOrder: 'desc',
        createBy: '',
        exchangeUserId: ''

      },
      // 联通性测试
      apikeyTesting: false, // 是否正在测试
      apikeyTestResult: null, // 测试结果提示
      // 表单参数
      form: {
      },
      detailFields: ['id', 'exchangeName', 'monitoredOpenedNum', 'pnl'], // 需要显示的字段列表
      activeNames: [], // 用于控制 Collapse 组件的展开状态
      apiKeyBound: null,
      apiKeyEditMode: false,
      apiKeyData: {
        id: undefined,
        apiKey: undefined,
        secretKey: undefined,
        accountName: undefined,
        exchange: undefined
      },
      apiKeyList: [],
      showBindForm: false,
      showApiKeyList: false
    }
  },
  computed: {
    displayedDetails() {
      return (details) => {
        if (!details || details.length === 0) {
          return []
        }
        return details.map(detail => {
          if (typeof detail !== 'object' || detail === null) {
            return ''
          }
          const { createdAt, exchangeName, pnl, originQty, originPrice, symbol, side, role, fees, feeAsset, status, errMsg, orderId } = detail
          console.log('get fee:', fees)
          return {
            formattedCreatedAt: this.formatUTCTime(createdAt),
            exchangeName: exchangeName ? exchangeName.trim() : '',
            originPrice,
            originQty,
            symbol: symbol ? symbol.trim() : '',
            formattedFee: this.formatFees(fees),
            feeAsset,
            formattedSide: this.formatSide(side),
            formattedRole: this.formatRole(role),
            pnl,
            status,
            errMsg,
            orderId
          }
        })
      }
    }
  },
  created() {
    this.getSymbolList()
    this.getBindApiKey()
    this.getList()
  },
  methods: {
    /** 测试 API key连通性*/
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusPriceTriggerStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busPriceTriggerStrategyInstanceList = response.data.list.map(item => ({
          ...item,
          detailsLoaded: false,
          loadingDetails: false,
          details: item.details
        }))
        this.total = response.data.count
        this.loading = false
      })
    },
    /** 获取用户绑定的apikey列表,只在刚进页面的时候使用*/
    getBindApiKey() {
      const queryApiKeyParams = {
        pageIndex: 1,
        pageSize: 10000,
        id: 'desc'
      }
      listBusPriceTriggerStrategyApikeyConfig(queryApiKeyParams).then(response => {
        this.total = response.data.count
        if (this.total > 0) {
          this.apiKeyBound = true
          this.apiKeyList = response.data.list
        }
      })
    },
    // 获取币种列表
    getSymbolList() {
      getSymbolList().then(response => {
        this.symbolList = response.data.map(item => ({
          label: item.symbol,
          value: item.symbol
        }))
      })
    },
    /** 展开或收起详情*/
    handleCollapseChange(activeNames) {
      this.busPriceTriggerStrategyInstanceList.forEach(item => {
        if (activeNames.includes(item.id) && !this.timers[item.id]) {
          // 展开且定时器不存在，则创建定时器
          this.fetchDetails(item)
        }
      })
    },
    fetchDetails(item) {
      const queryDetailForm = {
        pageIndex: 1,
        pageSize: 10000,
        idOrder: 'desc',
        strategyInstanceId: item.id
      }
      listBusPriceMonitorForOptionHedging(queryDetailForm).then(response => {
        this.$set(item, 'details', response.data.list || [])
      }).catch(error => {
        this.$message.error(`加载详情失败: ${error.message}`)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        openPrice: undefined,
        closePrice: undefined,
        execTimes: undefined,
        amount: undefined,
        side: undefined,
        symbol: undefined,
        closeTime: undefined,
        status: undefined
      }
      this.resetForm('form')
    },
    statusFormat(status) {
      if (status === 'created') {
        return '已创建'
      } else if (status === 'stopped') {
        return '已暂停'
      } else if (status === 'expired') {
        return '已过期'
      } else if (status === 'started') {
        return '运行中'
      } else {
        return '未知状态'
      }
    },
    sideFormat(side) {
      if (side === 'long') {
        return '做多'
      } else if (side === 'short') {
        return '做空'
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加价格触发下单条件'
      this.isEdit = false
      this.getApiKeyList()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusPriceTriggerStrategyInstance(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改价格触发下单条件'
        this.isEdit = true
      })
    },
    handleStopInstance(instanceId) {
      const stopRequest = {
        id: instanceId
      }
      stopBusPriceTriggerStrategyInstance(stopRequest).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getList()
          // 清除该记录的定时器
          clearInterval(this.timers[instanceId])
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const confirmMessage = this.isEdit
            ? '确定提交修改吗?'
            : '确定提交新增吗?'
          this.$confirm(confirmMessage, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.form.id !== undefined) {
              updateBusPriceTriggerStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusPriceTriggerStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            }
          }).catch(() => {
            // 取消确认时不执行任何操作
          })
        }
      })
    },
    // 根据状态，显示不同的状态样式
    statusClass(status) {
      if (status === 'stopped') { // 假设 0 代表暂停
        return 'status-paused'
      } else if (status === 'started') { // 假设 1 代表运行中
        return 'status-running'
      } else if (status === 'expired') {
        return 'status-expired'
      } else if (status === 'created') {
        return 'status-created'
      }
      return '' // 其他状态，不添加样式
    },
    // 根据买卖方向，显示不同样式
    sideClass(side) {
      if (side === 'long') {
        return 'buy-side'
      } else if (side === 'short') {
        return 'sell-side'
      }
      return '' // 其他状态，不添加样式
    },
    formatUTCTime(isoString) {
      return moment(isoString).format('YYYY-MM-DD HH:mm:ss')
    },
    formatFees(fee) {
      if (fee === null || fee === undefined || fee === '') {
        return '0.00000000' // 处理 null、undefined 或空字符串的情况
      }

      const num = Number(fee)

      if (isNaN(num)) {
        console.error('费用格式错误:', fee)
        return fee // 如果转换失败，返回原始值或一个错误提示
      }

      return num.toFixed(8)
    },
    formatSide(side) {
      if (side === '1') {
        return '做多'
      } else {
        return '做空'
      }
    },
    formatRole(role) {
      if (role === '1') {
        return 'maker'
      } else if (role === '2') {
        return 'taker'
      }
    }

  }
}
</script>

<style scoped>
.status-paused {
  background-color: #ffffff;
  color: #d00000;
}
.status-running {
  background-color: #ffffff;
  color: #008000;
}
.status-expired {
  background-color: #ffffff;
  color: #7e7e7e;
}
.status-created {
  background-color: #ffffff;
  color: #050505;
}

.buy-side {
  background-color: #e9fad5;
  color: #008000;
}

.sell-side {
  background-color: #fceeee;
  color: #d00000;
}

.main-data {
  display: flex; /* 使用 Flexbox 布局 */
  flex-wrap: wrap; /* 允许换行 */
}
.detail-data {
  height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
  box-sizing: border-box;
}

.data-item {
  width: 25%; /* 每项占据 25% 的宽度，一行显示 4 个 */
  margin-bottom: 5px; /* 调整间距 */
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 5px;
}
.query-form {
  display: flex;
  align-items: center;
}

.button-group {
  display: flex; /* 让搜索和重置按钮横向排列 */
  align-items: center;
}

.add-button {
  margin-left: auto; /* 将“新建规则”按钮推到最右边 */
}

.mr-10 {
  margin-right: 10px;
}

.detail-log {
  height: 200px; /* 设置固定高度 */
  background-color: #f5f5f5;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
  box-sizing: border-box;
}

.log-item {
  padding: 2px 0;
  line-height: 1.2;
}

.detail-line{
  display: inline-block;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
/* 新增样式 */
.full-width {
  flex-basis: 800%; /* 或 width: 100%; 占据一行 */
  min-width: 0;/*重置最小宽度，否则会以min-width宽度为准*/
}
.error-message {
  color: red;
  font-weight: bold;
}
</style>
