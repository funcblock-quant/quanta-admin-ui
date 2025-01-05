
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="套利记录id" prop="arbitrageId"><el-input
            v-model="queryParams.arbitrageId"
            placeholder="请输入套利记录id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易币种" prop="symbol"><el-input
            v-model="queryParams.symbol"
            placeholder="请输入交易币种"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易所订单id" prop="orderId"><el-input
            v-model="queryParams.orderId"
            placeholder="请输入交易所订单id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="策略端id" prop="orderClientId"><el-input
            v-model="queryParams.orderClientId"
            placeholder="请输入策略端id"
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busFuturePositionRecord:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busFuturePositionRecordList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" /><el-table-column
            label="套利记录id"
            align="center"
            prop="arbitrageId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="买卖方向"
            align="center"
            prop="side"
            :formatter="sideFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ sideFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="合约杠杆"
            align="center"
            prop="leverage"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易所订单id"
            align="center"
            prop="orderId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="策略端id"
            align="center"
            prop="orderClientId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="原始委托数量"
            align="center"
            prop="originQty"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="原始委托价格"
            align="center"
            prop="originPrice"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="触发前订单类型"
            align="center"
            prop="originType"
            :formatter="originTypeFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ originTypeFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="持仓方向"
            align="center"
            prop="positionSide"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="有效方法"
            align="center"
            prop="timeInForce"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易角色"
            align="center"
            prop="role"
            :formatter="roleFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ roleFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="持仓状态"
            align="center"
            prop="status"
            :formatter="statusFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ statusFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="交易手续费"
            align="center"
            prop="fees"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易手续费计价单位"
            align="center"
            prop="feeAsset"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="已实现盈亏"
            align="center"
            prop="realizedPnl"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="未实现盈亏"
            align="center"
            prop="unrealizedPnl"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busFuturePositionRecord:edit']"
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
                  v-permisaction="['business:busFuturePositionRecord:remove']"
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
          <el-form ref="form" :model="form" :rules="rules" label-width="80px" />
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
import { addBusFuturePositionRecord, delBusFuturePositionRecord, getBusFuturePositionRecord, listBusFuturePositionRecord, updateBusFuturePositionRecord } from '@/api/business/bus-future-position-record'

export default {
  name: 'BusFuturePositionRecord',
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
      busFuturePositionRecordList: [],
      sideOptions: [], originTypeOptions: [], roleOptions: [], statusOptions: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        arbitrageId: undefined,
        symbol: undefined,
        orderId: undefined,
        orderClientId: undefined,
        positionSide: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { arbitrageId: [{ required: true, message: '套利记录id不能为空', trigger: 'blur' }],
        symbol: [{ required: true, message: '交易币种不能为空', trigger: 'blur' }],
        orderId: [{ required: true, message: '交易所订单id不能为空', trigger: 'blur' }],
        orderClientId: [{ required: true, message: '策略端id不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_trade_side').then(response => {
      this.sideOptions = response.data
    })
    this.getDicts('bus_order_type').then(response => {
      this.originTypeOptions = response.data
    })
    this.getDicts('bus_order_role').then(response => {
      this.roleOptions = response.data
    })
    this.getDicts('bus_future_order_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusFuturePositionRecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busFuturePositionRecordList = response.data.list
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

        id: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    sideFormat(row) {
      return this.selectDictLabel(this.sideOptions, row.side)
    },
    originTypeFormat(row) {
      return this.selectDictLabel(this.originTypeOptions, row.originType)
    },
    roleFormat(row) {
      return this.selectDictLabel(this.roleOptions, row.role)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
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
      this.title = '添加合约交易记录'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusFuturePositionRecord(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改合约交易记录'
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
              updateBusFuturePositionRecord(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusFuturePositionRecord(this.form).then(response => {
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
        return delBusFuturePositionRecord({ 'ids': Ids })
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
