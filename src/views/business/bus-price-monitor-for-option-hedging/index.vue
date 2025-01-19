
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busPriceMonitorForOptionHedging:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busPriceMonitorForOptionHedgingList">
          <el-table-column
            label="买卖方向"
            align="center"
            prop="side"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="总盈亏"
            align="center"
            prop="pnl"
            :show-overflow-tooltip="true"
          /><el-table-column label="监控的开单数量" align="center" prop="monitoredOpenedNum" :show-overflow-tooltip="true" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busPriceMonitorForOptionHedging:edit']"
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
              >
                <el-button
                  slot="reference"
                  v-permisaction="['business:busPriceMonitorForOptionHedging:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                >删除
                </el-button>
              </el-popconfirm>
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

            <el-form-item label="套利记录id" prop="arbitrageId">
              <el-input
                v-model="form.arbitrageId"
                placeholder="套利记录id"
              />
            </el-form-item>
            <el-form-item label="交易所id" prop="exchangeId">
              <el-input
                v-model="form.exchangeId"
                placeholder="交易所id"
              />
            </el-form-item>
            <el-form-item label="交易所名称" prop="exchangeName">
              <el-input
                v-model="form.exchangeName"
                placeholder="交易所名称"
              />
            </el-form-item>
            <el-form-item label="交易平台类型" prop="exchangeType">
              <el-input
                v-model="form.exchangeType"
                placeholder="交易平台类型"
              />
            </el-form-item>
            <el-form-item label="买卖方向" prop="side">
              <el-input
                v-model="form.side"
                placeholder="买卖方向"
              />
            </el-form-item>
            <el-form-item label="交易币种" prop="symbol">
              <el-input
                v-model="form.symbol"
                placeholder="交易币种"
              />
            </el-form-item>
            <el-form-item label="交易所订单id" prop="orderId">
              <el-input
                v-model="form.orderId"
                placeholder="交易所订单id"
              />
            </el-form-item>
            <el-form-item label="策略端生成的id" prop="orderClientId">
              <el-input
                v-model="form.orderClientId"
                placeholder="策略端生成的id"
              />
            </el-form-item>
            <el-form-item label="原始委托数量" prop="originQty">
              <el-input
                v-model="form.originQty"
                placeholder="原始委托数量"
              />
            </el-form-item>
            <el-form-item label="原始委托价格" prop="originPrice">
              <el-input
                v-model="form.originPrice"
                placeholder="原始委托价格"
              />
            </el-form-item>
            <el-form-item label="触发前订单类型" prop="originType">
              <el-input
                v-model="form.originType"
                placeholder="触发前订单类型"
              />
            </el-form-item>
            <el-form-item label="有效方法" prop="timeInForce">
              <el-input
                v-model="form.timeInForce"
                placeholder="有效方法"
              />
            </el-form-item>
            <el-form-item label="下单角色" prop="role">
              <el-input
                v-model="form.role"
                placeholder="下单角色"
              />
            </el-form-item>
            <el-form-item label="总盈亏" prop="pnl">
              <el-input
                v-model="form.pnl"
                placeholder="总盈亏"
              />
            </el-form-item>
            <el-form-item label="持仓状态" prop="status">
              <el-input
                v-model="form.status"
                placeholder="持仓状态"
              />
            </el-form-item>
            <el-form-item label="交易手续费" prop="fees">
              <el-input
                v-model="form.fees"
                placeholder="交易手续费"
              />
            </el-form-item>
            <el-form-item label="交易手续费计价单位" prop="feeAsset">
              <el-input
                v-model="form.feeAsset"
                placeholder="交易手续费计价单位"
              />
            </el-form-item>
            <el-form-item label="监控的开单数量" prop="monitoredOpenedNum">
              <el-input
                v-model="form.monitoredOpenedNum"
                placeholder="监控的开单数量"
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
import { addBusPriceMonitorForOptionHedging, delBusPriceMonitorForOptionHedging, getBusPriceMonitorForOptionHedging, listBusPriceMonitorForOptionHedging, updateBusPriceMonitorForOptionHedging } from '@/api/business/bus-price-monitor-for-option-hedging'

export default {
  name: 'BusPriceMonitorForOptionHedging',
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
      busPriceMonitorForOptionHedgingList: [],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        monitoredOpenedNum: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusPriceMonitorForOptionHedging(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busPriceMonitorForOptionHedgingList = response.data.list
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
        arbitrageId: undefined,
        exchangeId: undefined,
        exchangeName: undefined,
        exchangeType: undefined,
        side: undefined,
        symbol: undefined,
        orderId: undefined,
        orderClientId: undefined,
        originQty: undefined,
        originPrice: undefined,
        originType: undefined,
        timeInForce: undefined,
        role: undefined,
        pnl: undefined,
        status: undefined,
        fees: undefined,
        feeAsset: undefined,
        monitoredOpenedNum: undefined
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
      this.title = '添加价格触发下单记录'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusPriceMonitorForOptionHedging(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改价格触发下单记录'
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
              updateBusPriceMonitorForOptionHedging(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusPriceMonitorForOptionHedging(this.form).then(response => {
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
        return delBusPriceMonitorForOptionHedging({ 'ids': Ids })
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
    }
  }
}
</script>
