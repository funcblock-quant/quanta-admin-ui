
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card" style="display: flex; flex-direction: column; height: 100%;">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="策略" prop="strategyId">
            <el-select
              v-model="queryParams.strategyId"
              placeholder="请选择策略"
              clearable
              size="small"
            >
              <el-option
                v-for="strategy in strategyList"
                :key="strategy.key"
                :value="strategy.key"
                :label="strategy.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="账户组" prop="accountGroupId">
            <el-select
              v-model="queryParams.accountGroupId"
              placeholder="请选择账户组"
              clearable
              size="small"
            >
              <el-option
                v-for="group in accountGroupList"
                :key="group.key"
                :value="group.key"
                :label="group.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="20" class="mb8">
          <el-col :span="4">
            <el-button
              v-permisaction="['business:busStrategyInstance:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增实例
            </el-button>
          </el-col>
        </el-row>
        <div class="card-container" @scroll="handleScroll">
          <el-row :gutter="50">
            <el-col v-for="item in busStrategyInstanceList" :key="item.id" :span="8">
              <el-card
                :header="item.instanceName"
                class="custom-card clickable-card"
                shadow="always"
                @click.native="handleCardClick(item)"
              >
                <div class="card-status" :class="statusClass(item.status)" />
                <div class="card-content">
                  <div class="info-row">
                    <span class="info-title">实例id:</span>
                    <span class="info-value">{{ item.id || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">策略:</span>
                    <span class="info-value">{{ item.strategyName || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">账户组:</span>
                    <span class="info-value">{{ item.accountGroupName || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">交易所1:</span>
                    <span class="info-value">
                      {{ item.exchange1Name || '-' }}
                      <template>
                        ({{ formatExchangeType(item.exchange1Type) }})
                      </template>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">交易所2:</span>
                    <span class="info-value">
                      {{ item.exchange2Name || '-' }}
                      <template>
                        ({{ formatExchangeType(item.exchange2Type) }})
                      </template>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">启动时间:</span>
                    <span class="info-value">{{ item.startRunTime || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">停止时间:</span>
                    <span class="info-value">{{ item.stopRunTime || '-' }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <el-button
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click.stop="handleUpdate(item)"
                  >修改
                  </el-button>
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-play"
                    :disabled="item.status === '1'"
                    @click.stop="handleStart(item)"
                  >启用
                  </el-button>
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-pause"
                    :disabled="item.status === '0'"
                    @click.stop="handleStop(item)"
                  >停用
                  </el-button>
                  <el-popconfirm
                    class="delete-popconfirm"
                    title="确认要下线实例吗?"
                    confirm-button-text="下线"
                    @confirm="handleDelete(item)"
                  >
                    <el-button
                      slot="reference"
                      v-permisaction="['business:busStrategyInstance:remove']"
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      @click.stop
                    >下线策略
                    </el-button>
                  </el-popconfirm>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 加载状态提示 -->
          <div v-if="isLoading" class="loading-text">加载中...</div>
          <div v-if="isNoMoreData" class="no-more-data">没有更多数据了</div>
        </div>

        <!-- 增加策略实例 -->
        <el-drawer :title="title" :visible.sync="open" :before-close="handleDrawClose">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>

                <el-form-item label="策略" prop="strategyId">
                  <el-select
                    v-model="form.strategyId"
                    placeholder="请选择策略"
                    clearable
                    size="small"
                    :disabled="isEdit"
                    @change="getConfigurationDicts(form.strategyId)"
                  >
                    <el-option
                      v-for="strategy in strategyList"
                      :key="strategy.key"
                      :value="strategy.key"
                      :label="strategy.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="账户组" prop="accountGroupId">
                  <el-select
                    v-model="form.accountGroupId"
                    placeholder="请选择账户组"
                    clearable
                    size="small"
                  >
                    <el-option
                      v-for="group in accountGroupList"
                      :key="group.key"
                      :value="group.key"
                      :label="group.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="交易所1" prop="exchangeId1">
                  <el-select
                    v-model="form.exchangeId1"
                    placeholder="请选择交易所1"
                    @change="updateExchangePlatformType('exchangeId1', 'exchange1TypeLabel', 'exchange1Type', 'exchange1Name')"
                  >
                    <el-option
                      v-for="exchange in exchangeOptions"
                      :key="exchange.key"
                      :value="exchange.key"
                      :label="exchange.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="平台类型" prop="exchangeId1Type">
                  <el-input
                    v-model="form.exchange1TypeLabel"
                    placeholder="平台类型"
                    readonly
                  />
                </el-form-item>
                <el-form-item label="交易所2" prop="exchangeId2">
                  <el-select
                    v-model="form.exchangeId2"
                    placeholder="请选择交易所2"
                    @change="updateExchangePlatformType('exchangeId2', 'exchange2TypeLabel', 'exchange2Type', 'exchange2Name')"
                  >
                    <el-option
                      v-for="exchange in exchangeOptions"
                      :key="exchange.key"
                      :value="exchange.key"
                      :label="exchange.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="平台类型" prop="exchangeId2Type">
                  <el-input
                    v-model="form.exchange2TypeLabel"
                    placeholder="平台类型"
                    readonly
                  />
                </el-form-item>
                <el-form-item label="策略实例名称" prop="instanceName">
                  <el-input
                    v-model="form.instanceName"
                    placeholder="策略实例名称"
                  />
                </el-form-item>

              </div>
            </el-card>
            <!-- 分割线 -->
            <el-divider />
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>选择服务器</h5>
                <el-form-item label="服务器" prop="serverIp">
                  <el-select
                    v-model="form.serverId"
                    placeholder="请选择要部署的服务器"
                  >
                    <el-option
                      v-for="server in serverList"
                      :key="server.id"
                      :value="`${server.id}`"
                      :label="formatServerInfo(server)"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </el-card>

            <template>
              <el-card v-if="form.strategyId" class="fused-card" shadow="never">
                <div slot="header">
                  <h5>策略配置参数</h5>
                </div>
                <el-form ref="form" :model="form" label-width="150px">
                  <el-form-item
                    v-for="(config, index) in configurationsDicts"
                    :key="config.paramKey"
                    :label-width="labelWidth"
                    :prop="getProp(index)"
                    :rules="getRules(config, index)"
                  >
                    <template slot="label">
                      <div class="label-container">
                        <span>{{ config.paramKey }}</span>
                        <el-tooltip :content="config.paramName" placement="top">
                          <i class="el-icon-question tooltip-icon" />
                        </el-tooltip>
                      </div>
                    </template>
                    <el-input
                      v-model="form.configurations[index].paramValue"
                      :placeholder="'请输入' + config.paramName + ',默认值为' + config.defaultValue"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </template>
          </el-form>
          <br>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </el-drawer>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  addBusStrategyInstance,
  delBusStrategyInstance,
  getBusStrategyInstance,
  listBusStrategyInstance,
  startBusStrategyInstance, stopBusStrategyInstance,
  updateBusStrategyInstance
} from '@/api/business/bus-strategy-instance'
import { listBusExchangeAccountGroup } from '@/api/business/bus-exchange-account-group'
import { listBusStrategyExchange } from '@/api/business/bus-strategy-exchange'
import { listBusStrategyBaseInfo } from '@/api/business/bus-strategy-base-info'
import { listBusStrategyConfigDictByStrategyId } from '@/api/business/bus-strategy-config-dict'
import editor from '@/views/dashboard/editor/index.vue'
import { listBusServerInfo } from '@/api/business/bus-server-info'

export default {
  name: 'BusStrategyInstance',
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
      labelWidth: '120px',
      // 是否显示弹出层
      open: false,
      // 修改实例弹出层
      editOpen: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      // 关系表类型
      accountGroupList: [],
      exchangeOptions: [],
      exchangeTypeOptions: [],
      exchangeTypeDicts: [],
      strategyList: [],
      // 可用服务器列表
      serverList: [],

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 9,
        strategyId: undefined,
        accountGroupId: undefined

      },
      busStrategyInstanceList: [], // 卡片列表
      isLoading: false, // 是否正在加载数据
      isNoMoreData: false, // 是否没有更多数据
      // 表单参数
      form: {
        configurations: []
      },
      // 表单校验
      rules: { strategyId: [{ required: true, message: '策略id不能为空', trigger: 'blur' }],
        accountGroupId: [{ required: true, message: '账户组id不能为空', trigger: 'blur' }],
        instanceName: [{ required: true, message: '策略实例名称不能为空', trigger: 'blur' }]
      },
      configurationsDicts: [
      ]
    }
  },
  computed: {
    editor() {
      return editor
    }
  },
  created() {
    this.loadData() // 初始化加载第一页数据
    this.getBusExchangeAccountGroupList()
    this.getBusStrategyExchangeItems()
    this.getStrategyList()
    this.getServerList()
    this.getDicts('bus_exchange_type').then(response => {
      this.exchangeTypeDicts = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      console.log('this.queryParams', this.queryParams)
      listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategyInstanceList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    // 获取交易所账户组列表
    getBusExchangeAccountGroupList() {
      this.getItems(listBusExchangeAccountGroup, undefined).then(res => {
        this.accountGroupList = this.setItems(res, 'id', 'groupName')
      })
    },
    // 获取交易所列表
    getBusStrategyExchangeItems() {
      this.getItems(listBusStrategyExchange, undefined).then(res => {
        this.exchangeOptions = this.setItems(res, 'id', 'exchangeName')
        this.exchangeTypeOptions = this.setItems(res, 'id', 'exchangeType')
      })
    },
    getConfigurationDicts(strategyId) {
      console.log('getConfigurationDicts 开始，strategyId:', strategyId)
      this.configurationsDicts = []
      this.form.configurations = [] // 初始化为空数组
      console.log('strategyId', strategyId)
      if (strategyId === undefined || strategyId === null || strategyId === '') {
        return
      }
      listBusStrategyConfigDictByStrategyId(strategyId).then(res => {
        console.log('listBusStrategyConfigDictByStrategyId resp', res)
        this.configurationsDicts = res.data.list
        console.log('this.configurationsDicts', this.configurationsDicts)
        this.configurationsDicts.forEach(config => {
          this.form.configurations.push({
            paramKey: config.paramKey,
            paramName: config.paramName
          })
        })
        console.log('getConfigurationDicts 结束，configurationsDicts:', this.configurationsDicts)
      })
    },
    getProp(index) {
      return `configurations[${index}].paramValue`
    },

    getRules(config, index) {
      if (config.required) {
        return [
          { required: true, message: `${config.paramName}不能为空`, trigger: 'blur' },
          ...(config.paramType === 'number' ? [{ type: 'number', message: `${config.paramName}必须是数字`, trigger: 'blur' }] : [])
        ]
      }
      return [] // 如果不是必填项，则返回空数组
    },
    // 获取策略列表
    getStrategyList() {
      this.getItems(listBusStrategyBaseInfo, undefined).then(res => {
        this.strategyList = this.setItems(res, 'id', 'strategyName')
        console.log('strategyList', this.strategyList)
      })
    },
    formatExchangeType(type) {
      const exchangeType = this.exchangeTypeDicts.find(option => option.value === type)
      return exchangeType ? exchangeType.label : '-'
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
        strategyId: undefined,
        accountGroupId: undefined,
        exchangeId1: undefined,
        exchange1Type: undefined,
        exchange1TypeLabel: undefined,
        exchangeId2: undefined,
        exchange2Type: undefined,
        exchange2TypeLabel: undefined,
        instanceName: undefined,
        serverId: undefined,
        startRunTime: undefined,
        stopRunTime: undefined,
        configurations: []
      }
      this.configurationsDicts = []
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    // 关系
    // 文件
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.busStrategyInstanceList = []
      this.isNoMoreData = false
      this.isLoading = false
      this.loadData()
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
      this.title = '添加策略实例'
      this.isEdit = false
    },
    handleDrawClose(done) {
      this.$confirm('关闭后表单数据会丢失，确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    updateExchangePlatformType(exchangeKey, exchangeTypeLabelKey, exchangeTypeKey, exchangeName) {
      const exchange = this.exchangeOptions.find(option => option.key === this.form[exchangeKey])
      this.form[exchangeName] = exchange.value
      if (exchange) {
        this.form[exchangeTypeLabelKey] = this.exchangeTypeDicts.find(option => option.value === this.exchangeTypeOptions.find(option => option.key === this.form[exchangeKey]).value).label
        this.form[exchangeTypeKey] = this.exchangeTypeDicts.find(option => option.value === this.exchangeTypeOptions.find(option => option.key === this.form[exchangeKey]).value).value
      } else {
        this.form[exchangeTypeLabelKey] = ''
        this.form[exchangeTypeKey] = ''
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      console.log('row', row)
      let strategyInstanceResponse
      getBusStrategyInstance(id)
        .then(response => {
          Object.assign(this.form, response.data)
          strategyInstanceResponse = response

          // 使用 response.data.id 作为参数调用 listBusStrategyConfigDictByStrategyId
          return listBusStrategyConfigDictByStrategyId(response.data.strategyId)
        })
        .then(configDictResp => {
          this.configurationsDicts = configDictResp.data.list
          // 根据配置模版，初始化this.form.configurations
          this.form.configurations = this.configurationsDicts.map(config => ({
            paramKey: config.paramKey,
            paramName: config.paramName
          }))
          // 根据策略实际查出的配置项，修改this.form.configurations，更新成之前设置的值
          if (strategyInstanceResponse && strategyInstanceResponse.data && strategyInstanceResponse.data.configs && Array.isArray(strategyInstanceResponse.data.configs)) {
            strategyInstanceResponse.data.configs.forEach(item => {
              const configIndex = this.form.configurations.findIndex(c => c.paramKey === item.paramKey)
              if (configIndex !== -1) {
                // 使用 $set 或 splice 正确更新
                this.$set(this.form.configurations, configIndex, {
                  ...this.form.configurations[configIndex],
                  paramValue: item.paramValue
                })
              }
            })
          }

          // 手动调用 updateExchangePlatformType 方法，设置平台类型
          if (this.form.exchangeId1) {
            this.updateExchangePlatformType('exchangeId1', 'exchange1TypeLabel', 'exchange1Type', 'exchange1Name')
          }
          if (this.form.exchangeId2) {
            this.updateExchangePlatformType('exchangeId2', 'exchange2TypeLabel', 'exchange2Type', 'exchange2Name')
          }

          this.open = true
          this.title = '修改策略实例配置'
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
            const configurationsArray = Object.keys(this.form.configurations).map(key => ({
              paramKey: key,
              paramValue: this.form.configurations[key].paramValue
            }))
            const formData = { ...this.form, configurations: configurationsArray }
            console.log('formData:', formData)
            if (this.form.id !== undefined) {
              updateBusStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.queryParams.pageIndex = 1
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.queryParams.pageIndex = 1
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
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = (row.id && [row.id]) || this.ids

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusStrategyInstance({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          console.log('delete success')
          this.queryParams.pageIndex = 1
          this.busStrategyInstanceList = []
          console.log('this.queryParams', this.queryParams)
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    },
    // 模拟加载数据的函数
    async loadData() {
      if (this.isLoading || this.isNoMoreData) {
        return
      }
      this.isLoading = true

      // 异步加载数据
      setTimeout(() => {
        listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.total = response.data.count

          this.loading = false
          if (!response.data.list.length || response.data.list.length < this.queryParams.pageSize) {
            this.isNoMoreData = true // 数据量小于页面大小，无更多数据
          }
          this.busStrategyInstanceList = [...this.busStrategyInstanceList, ...response.data.list] // 追加新数据
          this.queryParams.pageIndex += 1 // 更新页码
          this.isLoading = false // 加载完成
        }, 1000) // 模拟加载时间
      })
    },
    // 监听滚动事件
    handleScroll(e) {
      console.log('滚动事件触发')
      const container = e.target
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        this.loadData() // 触底加载更多数据
      }
    },
    handleCardClick(item) {
      // 根据需要进行跳转，可以使用路由导航或直接打开新页面
      this.$router.push({ name: 'Dashboard', query: { instanceId: item.id }})
    },
    getServerList() {
      // 查询当前状态为已启用的服务器列表
      var queryServersParams = {
        pageIndex: 1,
        pageSize: 1000,
        status: 1,
        networkStatus: 1
      }
      listBusServerInfo(queryServersParams).then(response => {
        this.serverList = response.data.list
      })
    },
    formatServerInfo(server) {
      return server.serverIp + '(' + server.cpuNum + '核 ' + server.memorySize + 'G)'
    },
    handleStart(row) { // 新增处理启用方法
      this.$confirm('是否确认启动该策略实例?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStartForm(row) // 调用提交停用请求的方法，并将 row 传递过去
      })
    },
    handleStop(row) { // 新增处理停用方法
      this.$confirm('是否确认停用该策略实例?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStopForm(row) // 调用提交停用请求的方法，并将 row 传递过去
      })
    },
    /** 停用服务器 */
    submitStopForm(row) {
      console.log('stop server with id:', row.id)
      stopBusStrategyInstance(row.id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.queryParams.pageIndex = 1
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 启用服务器 */
    submitStartForm(row) {
      console.log('start server with id:', row.id)
      startBusStrategyInstance(row.id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.queryParams.pageIndex = 1
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 根据状态，显示不同的状态样式
    statusClass(status) {
      if (status === '0') { // 假设 0 代表暂停
        return 'status-paused'
      } else if (status === '1') { // 假设 1 代表运行中
        return 'status-running'
      }
      return '' // 其他状态，不添加样式
    }
  }
}
</script>

<style>
  .custom-card {
    margin-bottom: 20px; /* 添加卡片下方间隙 */
  }
  .card-actions {
    display: flex;
    justify-content: space-between;
  }
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 10px; /* 每行之间的间距 */
  }

  .info-row {
    display: flex;
    justify-content: space-between;
  }

  .info-title {
    font-weight: bold; /* 标题加粗 */
    color: #333;
  }

  .info-value {
    color: #666;
    text-align: right;
    word-break: break-word; /* 处理可能过长的内容换行 */
  }

  .card-container {
    max-height: 800px;
    overflow-y: auto;
    padding-right: 10px; /* 滚动条空间 */
    position: relative; /* 用于控制内部布局 */
  }
  .custom-card {
    margin-bottom: 20px;
  }
  .loading-text,
  .no-more-data {
    text-align: center;
    padding: 10px 0;
    color: #999;
    font-size: 14px;
  }
  .clickable-card {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .clickable-card:hover {
    background-color: #f5f5f5;
  }
  .config-item {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .responsive-width {
    width: 100%;
  }
  .label-container {
    display: inline-flex; /* 使用 inline-flex，更灵活 */
    align-items: center;
  }
  .custom-card {
    position: relative; /* 使小圆点可以定位 */
  }
  .card-status {
    position: absolute;
    top: 20px; /* 调整位置 */
    right: 10px; /* 调整位置 */
    width: 8px;
    height: 8px;
    border-radius: 100%; /* 圆形 */
  }
  .status-paused {
    background-color: #d00000;
  }
  .status-running {
    background-color: green;
  }
  .loading-text, .no-more-data {
    text-align: center;
    padding: 10px;
  }
  .tooltip-icon {
    margin-left: 5px;
    cursor: pointer;
  }
  @media (min-width: 800px) {
    .responsive-width {
      width: 300px;
    }
  }
</style>
