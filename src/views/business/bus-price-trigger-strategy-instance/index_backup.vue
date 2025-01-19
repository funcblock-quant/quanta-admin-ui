
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
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

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busPriceTriggerStrategyInstance:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新建规则
            </el-button>
          </el-col>
        </el-row>

        <el-table
          v-loading="loading"
          :data="busPriceTriggerStrategyInstanceList"
          :expand-row-keys="expandRowKeys"
          :default-expand-all="true"
          row-key="id"
          @expand-change="handleExpand"
        >
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template #default="props">
              <div v-if="!props.row.detailsLoaded">
                <v-loading
                  :text="'加载中...'"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                />
              </div>
              <el-table v-else :data="props.row.details" style="width: 100%" border>
                <el-table-column prop="clientOrderId" label="ClientOrderId" />
                <el-table-column prop="binanceLimitOrderSide" label="买卖方向" />
                <el-table-column prop="binanceLimitOrderPrice" label="交易币种" />
                <el-table-column prop="binanceLimitOrderAmount" label="总盈亏" />
                <el-table-column prop="binanceLimitOrderSide" label="监控的开单数量" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="交易币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="开仓价格"
            align="center"
            prop="openPrice"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="平仓价格"
            align="center"
            prop="closePrice"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="开仓数量"
            align="center"
            prop="amount"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="买卖方向"
            align="center"
            prop="side"
            :formatter="sideFormat"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              {{ sideFormat(scope.row.side) }}
            </template>
          </el-table-column>
          <el-table-column
            label="停止时间"
            align="center"
            prop="closeTime"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.closeTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            align="center"
            prop="status"
            :formatter="statusFormat"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              {{ statusFormat(scope.row.status) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busPriceTriggerStrategyInstance:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-popconfirm
                class="delete-popconfirm"
                title="确认要删除吗?"
                confirm-button-text="删除"
                @confirm="handleDelete(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

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
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusPriceTriggerStrategyInstance, getBusPriceTriggerStrategyInstance, listBusPriceTriggerStrategyInstance, updateBusPriceTriggerStrategyInstance } from '@/api/business/bus-price-trigger-strategy-instance'
import { listBusPriceMonitorForOptionHedging } from '@/api/business/bus-price-monitor-for-option-hedging'

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
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusPriceTriggerStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busPriceTriggerStrategyInstanceList = response.data.list
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
    // 根据状态，显示不同的状态样式
    statusClass(status) {
      if (status === '0') { // 假设 0 代表暂停
        return 'status-paused'
      } else if (status === '1') { // 假设 1 代表运行中
        return 'status-running'
      }
      return '' // 其他状态，不添加样式
    },
    /** 查看详情操作 */
    handleExpand(row, expandedRows) {
      const id = row.id

      if (expandedRows.length) {
        this.expandRowKeys = [id] // 设置当前展开的行key
        if (!row.loadingDetails) {
          row.loadingDetails = true
          listBusPriceMonitorForOptionHedging(id).then(response => {
            this.$set(row, 'details', response.data || [])
            this.$set(row, 'detailsLoaded', true)
            row.loadingDetails = false
          }).catch(error => {
            this.$message.error(`加载详情失败: ${error.message}`)
            row.loadingDetails = false
            this.expandRowKeys = [] // 请求失败，清空展开的行key
          })
        }
      } else {
        this.expandRowKeys = [] // 清空展开的行key
      }
    }
  }
}
</script>

<style scoped>
.status-paused {
  background-color: #d00000;
}
.status-running {
  background-color: green;
}

</style>
