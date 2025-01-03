
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card" style="display: flex; flex-direction: column; height: 100%;">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="策略id" prop="strategyId"><el-input
            v-model="queryParams.strategyId"
            placeholder="请输入策略id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="账户组id" prop="accountGroupId"><el-input
            v-model="queryParams.accountGroupId"
            placeholder="请输入账户组id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
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
          <el-row :gutter="30">
            <el-col v-for="item in busStrategyInstanceList" :key="item.id" :span="8">
              <el-card :header="item.instanceName" class="custom-card" shadow="always">
                <div class="card-content">
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
                    <span class="info-value">{{ item.exchangeName1 || '-' }} ({{ item.exchangeId1Type || '-' }})</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">交易所2:</span>
                    <span class="info-value">{{ item.exchangeName2 || '-' }} ({{ item.exchangeId2Type || '-' }})</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">启动时间:</span>
                    <span class="info-value">{{ parseTime(item.startRunTime) || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">停止时间:</span>
                    <span class="info-value">{{ parseTime(item.stopRunTime) || '-' }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <el-button
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdate(item)"
                  >修改
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

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="600px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">

            <el-form-item label="策略id" prop="strategyId">
              <el-input
                v-model="form.strategyId"
                placeholder="策略id"
              />
            </el-form-item>
            <el-form-item label="账户组id" prop="accountGroupId">
              <el-input
                v-model="form.accountGroupId"
                placeholder="账户组id"
              />
            </el-form-item>
            <el-form-item label="交易所id1" prop="exchangeId1">
              <el-input
                v-model="form.exchangeId1"
                placeholder="交易所id1"
              />
            </el-form-item>
            <el-form-item label="平台类型" prop="exchangeId1Type">
              <el-input
                v-model="form.exchangeId1Type"
                placeholder="平台类型"
              />
            </el-form-item>
            <el-form-item label="交易所id2" prop="exchangeId2">
              <el-input
                v-model="form.exchangeId2"
                placeholder="交易所id2"
              />
            </el-form-item>
            <el-form-item label="平台类型" prop="exchangeId2Type">
              <el-input
                v-model="form.exchangeId2Type"
                placeholder="平台类型"
              />
            </el-form-item>
            <el-form-item label="策略实例名称" prop="instanceName">
              <el-input
                v-model="form.instanceName"
                placeholder="策略实例名称"
              />
            </el-form-item>
            <el-form-item label="服务器ip" prop="serverIp">
              <el-input
                v-model="form.serverIp"
                placeholder="服务器ip"
              />
            </el-form-item>
            <el-form-item label="服务器用户名" prop="serverName">
              <el-input
                v-model="form.serverName"
                placeholder="服务器用户名"
              />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusStrategyInstance, delBusStrategyInstance, getBusStrategyInstance, listBusStrategyInstance, updateBusStrategyInstance } from '@/api/business/bus-strategy-instance'

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
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      // 关系表类型

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
      },
      // 表单校验
      rules: { strategyId: [{ required: true, message: '策略id不能为空', trigger: 'blur' }],
        accountGroupId: [{ required: true, message: '账户组id不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadData() // 初始化加载第一页数据
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategyInstanceList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
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
        exchangeId1Type: undefined,
        exchangeId2: undefined,
        exchangeId2Type: undefined,
        instanceName: undefined,
        serverIp: undefined,
        serverName: undefined,
        startRunTime: undefined,
        stopRunTime: undefined
      }
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
      this.title = '添加策略实例配置'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusStrategyInstance(id).then(response => {
        this.form = response.data
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
            if (this.form.id !== undefined) {
              updateBusStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
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
        console.log('isNoMoreData', this.isNoMoreData)
        console.log('isLoading', this.isLoading)
        console.log('当前正在加载，或无更多数据，不再触发请求')
        return
      }
      this.isLoading = true

      // 异步加载数据
      setTimeout(() => {
        console.log('this.queryParams', this.queryParams)
        listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          console.log('response', response)
          this.total = response.data.count

          this.loading = false
          if (!response.data.list.length || response.data.list.length < this.queryParams.pageSize) {
            this.isNoMoreData = true // 数据量小于页面大小，无更多数据
          }
          console.log('before cardlist:', this.cardList)
          this.busStrategyInstanceList = [...this.busStrategyInstanceList, ...response.data.list] // 追加新数据
          console.log('after cardlist:', this.cardList)
          this.queryParams.pageIndex += 1 // 更新页码
          this.isLoading = false // 加载完成
          console.log('完成加载，isLoading', this.isLoading)
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
    max-height: 500px;
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
</style>
