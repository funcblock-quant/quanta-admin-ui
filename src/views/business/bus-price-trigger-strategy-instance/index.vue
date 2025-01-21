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
            <el-form-item label="Username" prop="username" :rules="[{ required: true, message: '请输入 Username', trigger: 'blur' }]">
              <el-input v-model="apiKeyData.username" placeholder="请输入 Username" style="width: 600px" />
            </el-form-item>
            <el-form-item label="password" prop="password" :rules="[{ required: true, message: '请输入 Password', trigger: 'blur' }]">
              <el-input
                v-model="apiKeyData.password"
                placeholder="请输入 Password"
                style="width: 600px"
                :type="passwordVisible ? 'text' : 'password'"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="bindApiKey">绑定</el-button>
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
                placeholder="请输入注册策略交易类型"
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
                @click="handleApiKeyUpdate"
              >更新API-Key
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
                  <span v-for="(formattedDetail, key) in detail" :key="key" class="detail-line">
                    {{ formattedDetail }}
                  </span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="交易币种" prop="symbol">
              <el-input
                v-model="form.symbol"
                placeholder="交易币种"
              />
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
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </div></template>
  </BasicLayout>
</template>

<script>
import { addBusPriceTriggerStrategyInstance, getBusPriceTriggerStrategyInstance, listBusPriceTriggerStrategyInstance, updateBusPriceTriggerStrategyInstance } from '@/api/business/bus-price-trigger-strategy-instance'
import { listBusPriceMonitorForOptionHedging } from '@/api/business/bus-price-monitor-for-option-hedging'
import {
  addBusPriceTriggerStrategyApikeyConfig,
  listBusPriceTriggerStrategyApikeyConfig, updateBusPriceTriggerStrategyApikeyConfig
} from '@/api/business/bus-price-trigger-strategy-apikey-config'

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
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        closeTime: undefined,
        status: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { status: [{ required: true, message: '状态，created, started, stopped, closed不能为空', trigger: 'blur' }]
      },
      detailFields: ['id', 'exchangeName', 'monitoredOpenedNum', 'pnl'], // 需要显示的字段列表
      timers: {}, // 使用对象存储定时器，key 为 item.id
      activeNames: [], // 用于控制 Collapse 组件的展开状态
      apiKeyBound: null,
      apiKeyData: {
        id: undefined,
        apiKey: undefined,
        username: undefined,
        password: undefined
      },
      showBindForm: false
    }
  },
  computed: {
    displayedDetails() {
      return (details) => {
        if (!details || details.length === 0) {
          return []
        }
        return details.map(detail => {
          if (typeof detail !== 'object' || detail === null) { // 检查 detail 是否是对象且不为 null
            return '' // 如果不是对象或为 null，则返回空对象，避免错误
          }
          const { id, exchangeName, monitoredOpenedNum, pnl } = detail // 解构需要的字段
          return `Trade ID: ${id}, ExchangeName: ${exchangeName}, monitoredOpenedNum: ${monitoredOpenedNum}, pnl: ${pnl}` // 构建格式化字符串
        })
      }
    }
  },
  created() {
    // this.getList()
    this.getBindApiKey()
  },
  methods: {
    /** 获取用户绑定的apikey列表*/
    getBindApiKey() {
      const queryApiKeyParams = {
        pageIndex: 1,
        pageSize: 1,
        id: 'desc'
      }
      listBusPriceTriggerStrategyApikeyConfig(queryApiKeyParams).then(response => {
        this.total = response.data.count
        if (this.total > 0) {
          this.apiKeyBound = true
          this.apiKeyData = response.data.list[0]
          this.getList()
        } else {
          this.apiKeyBound = false
          this.showBindForm = false
        }
      })
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
        this.activeNames = [] // 在列表加载完成后重置 activeNames
      })
    },
    /** 更新apikey*/
    handleApiKeyUpdate() {
      this.showBindForm = true
      this.apiKeyBound = false
      console.log('this.apiKeyData', this.apiKeyData)
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
        pageSize: 1000,
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
    }

  }
}
</script>

<style scoped>
.status-paused {
  color: #d00000;
}
.status-running {
  color: #008000;
}
.status-expired {
  color: #7e7e7e;
}
.status-created {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
