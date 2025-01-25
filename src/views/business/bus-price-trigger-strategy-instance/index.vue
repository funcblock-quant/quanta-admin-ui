<template>
  <BasicLayout>
    <template #wrapper>
      <div v-if="apiKeyBound === null" />
      <div v-else-if="!apiKeyBound && !showBindForm">
        <el-card class="box-card">
          <h1>您尚未绑定 API Key</h1>
          <p>请绑定 API Key 后继续使用。</p>
          <el-button type="primary" @click="showBindForm = true">去绑定</el-button>
        </el-card>
      </div>
      <div v-else-if="!apiKeyBound && showBindForm">
        <el-card class="box-card">
          <h1>绑定 API Key</h1>
          <el-form ref="apiKeyForm" :model="apiKeyData" label-width="120px">
            <el-form-item label="API Key" prop="apiKey" :rules="[{ required: true, message: '请输入 API Key', trigger: 'blur' }]">
              <el-input v-model="apiKeyData.apiKey" placeholder="请输入 API Key" style="width: 600px" />
            </el-form-item>
            <el-form-item label="Secret Key" prop="secretKey" :rules="[{ required: true, message: '请输入 Secret Key', trigger: 'blur' }]">
              <el-input
                v-model="apiKeyData.secretKey"
                placeholder="请输入 Secret Key"
                style="width: 600px"
              >
                <!-- 在这里添加后置插槽 -->
                <template #append>
                  <el-button
                    type="primary"
                    size="small"
                    :loading="apikeyTesting"
                    style="background-color: #4a90e2; color: white; border-color: #4a90e2"
                    @click="testConnection"
                  >
                    {{ apikeyTesting ? "测试中..." : "测试连接" }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="账户名称" prop="accountName" :rules="[{ required: true, message: '请输入 账户名称', trigger: 'blur' }]">
              <el-input
                v-model="apiKeyData.accountName"
                placeholder="请输入 账户名称"
                style="width: 600px"
              />
            </el-form-item>
            <el-form-item label="交易所" prop="exchange" :rules="[{ required: true, message: '请选择 交易所', trigger: 'blur' }]">
              <el-select
                v-model="apiKeyData.exchange"
                placeholder="请选择交易所"
                clearable
                size="small"
                style="width: 600px"
              >
                <el-option
                  v-for="exchange in exchangeList"
                  :key="exchange.value"
                  :label="exchange.label"
                  :value="exchange.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="bindApiKey">确认</el-button>
              <el-button @click="cancelBindApiKey">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <div v-else>
        <el-card class="box-card">
          <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px" class="query-form">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="请输入状态"
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

            <div class="button-group">  <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" class="mr-10" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
            </div>

            <el-form-item class="add-button">
              <el-button
                v-permisaction="['business:busPriceTriggerStrategyInstance:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新建规则
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-s-tools"
                size="mini"
                @click="handleApiKeyManage"
              >管理API-Key
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card v-for="item in busPriceTriggerStrategyInstanceList" :key="item.id" class="box-card">
          <div class="main-data">
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
                  v-permisaction="['business:busPriceTriggerStrategyInstance:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                >暂停
                </el-button>
              </el-popconfirm>
            </div>
          <!--          <div class="mt-10">-->
          <!--            <el-button-->
          <!--              v-permisaction="['business:busPriceTriggerStrategyInstance:edit']"-->
          <!--              size="mini"-->
          <!--              type="text"-->
          <!--              icon="el-icon-edit"-->
          <!--              @click="handleUpdate(item)"-->
          <!--            >修改-->
          <!--            </el-button>-->
          <!--            <el-popconfirm-->
          <!--              class="delete-popconfirm"-->
          <!--              title="确认要删除吗?"-->
          <!--              confirm-button-text="删除"-->
          <!--              @confirm="handleDelete(item)"-->
          <!--            >-->
          <!--              <el-button type="text" size="mini">删除</el-button>-->
          <!--            </el-popconfirm>-->
          <!--          </div>-->
          </div>

          <el-collapse v-model="activeNames" @change="handleCollapseChange">
            <el-collapse-item :name="item.id">
              <template slot="title">详情</template>
              <div v-if="item.loadingDetails">
                <el-loading text="加载中..." />
              </div>
              <div v-else ref="detailLog" class="detail-log">
                <div v-for="(detail, index) in displayedDetails(item.details)" :key="index" class="log-item">
                  <div class="detail-line">
                    <span style="color: #457940; font-weight: bold;">[{{ detail.formattedCreatedAt }}]: </span>
                    <span> 交易所: <span style="font-weight: bold;">{{ detail.exchangeName }}</span></span>
                    <span> 成交一笔 <span style="font-weight: bold;">{{ detail.symbol }}</span> <span style="font-weight: bold;">  价格:</span>${{ detail.originPrice }}  <span style="font-weight: bold;">  数量:</span> {{ detail.originQty }} </span>
                    <span><span style="font-weight: bold;"> 方向: </span> <span :class="detailSideClass(detail.side)">{{ detail.formattedSide }}</span></span>
                    <span><span style="font-weight: bold;"> 手续费:</span> {{ detail.formattedFee }}{{ detail.feeAsset }}</span>
                    <span><span style="font-weight: bold;"> 角色:</span> {{ detail.formattedRole }}</span>
                    <span><span style="font-weight: bold;"> 状态:</span> {{ detail.status }}</span>
                    <span><span style="font-weight: bold;"> pnl: </span> {{ detail.pnl }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="交易币种" prop="symbol">
              <el-select
                v-model="form.symbol"
                placeholder="交易币种"
              >
                <el-option
                  v-for="symb in symbolList"
                  :key="symb.value"
                  :label="symb.label"
                  :value="symb.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="开仓价格" prop="openPrice">
              <el-input
                v-model="form.openPrice"
                placeholder="开仓价格"
              />
            </el-form-item>
            <el-form-item label="平仓价格" prop="closePrice">
              <el-input
                v-model="form.closePrice"
                placeholder="平仓价格"
              />
            </el-form-item>
            <el-form-item label="开仓数量" prop="amount">
              <el-input
                v-model="form.amount"
                placeholder="开仓数量"
              />
            </el-form-item>
            <el-form-item label="买卖方向" prop="side">
              <el-select
                v-model="form.side"
                placeholder="买卖方向"
              >
                <el-option
                  v-for="side in sideDict"
                  :key="side.value"
                  :label="side.label"
                  :value="side.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="停止时间" prop="closeTime">
              <el-date-picker
                v-model="form.closeTime"
                type="datetime"
                placeholder="选择日期"
              />
            </el-form-item>
            <el-form-item label="api key" prop="side">
              <el-select
                v-model="form.apiConfig"
                placeholder="选择api key"
              >
                <el-option
                  v-for="apikey in apiKeyList"
                  :key="apikey.id"
                  :label="apikey.accountName"
                  :value="apikey.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <!-- api-key list -->
        <el-dialog :title="apiKeyManageTitle" :visible.sync="showApiKeyList" width="1200px">
          <el-table v-loading="loading" :data="apiKeyList">
            <el-table-column
              label="API Key"
              align="center"
              prop="apiKey"
              width="400"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="Secret Key"
              align="center"
              prop="secretKey"
              width="400"
            />>
            <el-table-column
              label="账户名称"
              align="center"
              prop="accountName"
              width="80"
            />
            <el-table-column
              label="交易所"
              align="center"
              prop="exchange"
              width="80"
            />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <!--                <el-button-->
                <!--                  slot="reference"-->
                <!--                  size="mini"-->
                <!--                  type="text"-->
                <!--                  icon="el-icon-edit"-->
                <!--                  @click="handleApiKeyUpdate(scope.row)"-->
                <!--                >修改-->
                <!--                </el-button>-->
                <el-popconfirm
                  class="delete-popconfirm"
                  title="确认要删除该API key吗?"
                  confirm-button-text="删除"
                  @confirm="handleApiKeyDelete(scope.row)"
                >
                  <el-button
                    slot="reference"
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                  >删除
                  </el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <div style="text-align: center; margin: 20px 0;">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleApiKeyAdd">绑定新的API Key</el-button>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="closeApiManage">返 回</el-button>
          </div>
        </el-dialog>
      </div></template>
  </BasicLayout>
</template>

<script>
import {
  addBusPriceTriggerStrategyInstance,
  getBusPriceTriggerStrategyInstance,
  listBusPriceTriggerStrategyInstance,
  stopBusPriceTriggerStrategyInstance,
  updateBusPriceTriggerStrategyInstance
} from '@/api/business/bus-price-trigger-strategy-instance'
import { listBusPriceMonitorForOptionHedging } from '@/api/business/bus-price-monitor-for-option-hedging'
import {
  addBusPriceTriggerStrategyApikeyConfig, checkApiKeyHealth, delBusPriceTriggerStrategyApikeyConfig,
  listBusPriceTriggerStrategyApikeyConfig, updateBusPriceTriggerStrategyApikeyConfig
} from '@/api/business/bus-price-trigger-strategy-apikey-config'
import moment from 'moment'

export default {
  name: 'BusPriceTriggerStrategyInstance',
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
      // 类型数据字典
      typeOptions: [],
      busPriceTriggerStrategyInstanceList: [],
      expandRowKeys: [],
      passwordVisible: false, // 控制密码可见性
      // 关系表类型
      strategyStatus: [
        { label: '已创建', value: 'created' },
        { label: '运行中', value: 'started' },
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
        { label: 'BTC/USDC', value: 'BTC/USDC' },
        { label: 'ETH/USDC', value: 'ETH/USDC' }
      ],
      exchangeList: [
        { label: 'Gate.io', value: 'GateIo' }
      ],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10000,
        closeTime: undefined,
        status: 'started',
        idOrder: 'desc'

      },
      // 联通性测试
      apikeyTesting: false, // 是否正在测试
      apikeyTestResult: null, // 测试结果提示
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { status: [{ required: true, message: '状态，created, started, stopped, closed不能为空', trigger: 'blur' }]
      },
      detailFields: ['id', 'exchangeName', 'monitoredOpenedNum', 'pnl'], // 需要显示的字段列表
      timers: {}, // 使用对象存储定时器，key 为 item.id
      listTimers: {}, // 用来存储list的定时器
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
          const { createdAt, exchangeName, pnl, originQty, originPrice, symbol, side, role, fee, feeAsset } = detail
          return {
            formattedCreatedAt: this.formatUTCTime(createdAt),
            exchangeName: exchangeName ? exchangeName.trim() : '',
            originPrice,
            originQty,
            symbol: symbol ? symbol.trim() : '',
            formattedFee: this.formatFees(fee),
            feeAsset,
            formattedSide: this.formatSide(side),
            formattedRole: this.formatRole(role),
            pnl
          }
        })
      }
    }
  },
  created() {
    // this.getList()
    this.getBindApiKey()
  },
  beforeDestroy() {
    console.log('beforeDestroy')
    for (const key in this.timers) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.timers.hasOwnProperty(key)) { // 检查是否是对象自身的属性
        const timer = this.timers[key]
        if (typeof timer === 'number') { // 检查 timer 是否是有效的定时器 ID
          clearInterval(timer) // 如果是setInterval，使用clearInterval
          clearTimeout(timer)// 如果是setTimeout，使用clearTimeout
        }
      }
    }
    this.timer = {}
  },
  methods: {
    /** 获取用户绑定的apikey列表*/
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
          this.getList()
          this.timers['listKey'] = setInterval(() => {
            this.getList()
          }, 2000)
        } else {
          this.apiKeyBound = false
          this.showBindForm = false
        }
      })
    },
    /** 测试 API key连通性*/
    testConnection() {
      if (!this.apiKeyData.apiKey || !this.apiKeyData.secretKey) {
        this.$message.error('请先填写 API Key 和 Secret Key')
        return
      }
      this.apikeyTesting = true
      const testConnectionParams = {
        apiKey: this.apiKeyData.apiKey,
        secretKey: this.apiKeyData.secretKey,
        exchange: this.apiKeyData.exchange
      }
      try {
        checkApiKeyHealth(testConnectionParams).then(response => {
          console.log(response)
          this.apikeyTestResult = response.data
          if (response.code === 200) {
            if (response.data) {
              this.$message.success('连接成功！')
            } else {
              this.$message.error('连接失败！')
            }
          } else {
            this.$message.error('测试发生异常')
          }
        })
      } finally {
        this.apikeyTesting = false
      }
    },
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
        // this.activeNames = [] // 在列表加载完成后重置 activeNames
      })
    },
    /** 更新apikey*/
    handleApiKeyManage() {
      this.getBindApiKey()
      this.showApiKeyList = true
      this.apiKeyManageTitle = 'API Key管理'
    },
    handleApiKeyBind() {
      this.apiKeyData = {}
      this.apiKeyEditMode = true
      this.apiKeyBound = false
      this.showBindForm = true
    },
    handleApiKeyUpdate(row) {
      this.apiKeyData = row
      this.apiKeyBound = false
      this.showBindForm = true
      this.apiKeyEditMode = true
    },
    handleApiKeyAdd() {
      this.apiKeyData = {}
      this.apiKeyBound = false
      this.showBindForm = true
      this.apiKeyEditMode = true
    },
    handleApiKeyDelete(row) {
      var Ids = (row.id && [row.id]) || this.ids

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusPriceTriggerStrategyApikeyConfig({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.getBindApiKey()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    },
    /** 展开或收起详情*/
    handleCollapseChange(activeNames) {
      this.busPriceTriggerStrategyInstanceList.forEach(item => {
        if (activeNames.includes(item.id) && !this.timers[item.id]) {
          // 展开且定时器不存在，则创建定时器
          this.fetchDetails(item)
          this.timers[item.id] = setInterval(() => {
            this.fetchDetails(item)
          }, 5000)
          console.log('start timer for', item.id)
        } else if (!activeNames.includes(item.id) && this.timers[item.id]) {
          // 收起且定时器存在，则清除定时器
          clearInterval(this.timers[item.id])
          delete this.timers[item.id]
          console.log('clear timer for', item.id)
        }
      })
    },
    // startTimers() {
    //   console.log('startTimers called')
    //   this.busPriceTriggerStrategyInstanceList.forEach(item => {
    //     if (!this.timers[item.id]) { // 使用 timers 对象判断
    //       console.log('creating timer for item:', item.id)
    //       this.timers[item.id] = setInterval(() => { // 使用 timers 对象存储
    //         this.fetchDetails(item)
    //       }, 5000)
    //     }
    //   })
    // },
    /** 清除定时器，防止定时器还在请求*/
    clearTimer(id) {
      if (this.timers[id]) {
        clearInterval(this.timers[id])
        delete this.timers[id]
        console.log('timer cleared for item:', id)
      }
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
        this.clearTimer(item.id)
      })
    },
    beforeDestroy() {
      this.busPriceTriggerStrategyInstanceList.forEach(item => {
        clearInterval(item.timer)
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 返回按钮
    closeApiManage() {
      this.showApiKeyList = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        openPrice: undefined,
        closePrice: undefined,
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
        return '已停止'
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
      this.getBindApiKey()
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
    /** 绑定apikey*/
    bindApiKey() {
      if (this.apiKeyData.id === undefined) {
        addBusPriceTriggerStrategyApikeyConfig(this.apiKeyData).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
            this.showBindForm = false
            this.apiKeyBound = true
            this.getBindApiKey()
            this.getList()
          } else {
            this.msgError(response.msg)
          }
        })
      } else {
        updateBusPriceTriggerStrategyApikeyConfig(this.apiKeyData).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
            this.showBindForm = false
            this.apiKeyBound = true
          } else {
            this.msgError(response.msg)
          }
        })
      }
    },
    cancelBindApiKey() {
      this.showBindForm = false
      if (this.apiKeyEditMode) {
        this.apiKeyBound = true
      }
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
    detailSideClass(side) {
      if (side === '1') {
        return 'buy-side'
      } else {
        return 'sell-side'
      }
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
</style>
