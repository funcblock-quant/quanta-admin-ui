
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="85px">
          <el-form-item label="策略id" prop="strategyId"><el-input
            v-model="queryParams.strategyId"
            placeholder="请输入策略id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="套利记录id" prop="arbitrageId">
            <el-input
              v-model="queryParams.arbitrageId"
              placeholder="请输入套利记录id"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="套利类型" prop="type"><el-select
            v-model="queryParams.type"
            placeholder="链上链下三角套利记录套利类型"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in typeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>
          <el-form-item label="套利单状态" prop="status"><el-select
            v-model="queryParams.status"
            placeholder="链上链下三角套利记录套利单状态"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="busDexCexTriangularArbitrageRecordList">
          <el-table-column
            label="策略id"
            align="center"
            prop="strategyId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="套利记录id"
            align="center"
            prop="arbitrageId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="套利类型"
            align="center"
            prop="type"
            :formatter="typeFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ typeFormat(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            label="dex pool id"
            align="center"
            prop="dexPoolId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="dex平台"
            align="center"
            prop="dexPlatform"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="dex区块链"
            align="center"
            prop="dexBlockchain"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="dex交易对"
            align="center"
            prop="dexSymbol"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="token in 交易量"
            align="center"
            prop="tokenInAmount"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="token out 交易量"
            align="center"
            prop="tokenOutAmount"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易手续费"
            align="center"
            prop="txGasAmount"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="dex是否完成"
            align="center"
            prop="statusOnDex"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="dex交易hash"
            align="center"
            prop="txHash"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="cex平台"
            align="center"
            prop="cexPlatform"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="cex中quote交易对"
            align="center"
            prop="cexSymbolForQuoteToken"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="quote token交易量"
            align="center"
            prop="cexQuantityForQuoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="quote token价格"
            align="center"
            prop="cexPriceForQuoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="quote token手续费"
            align="center"
            prop="cexFeeAmountForQuoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="cex是否完成"
            align="center"
            prop="statusOnCexForQuoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="cex中base交易对"
            align="center"
            prop="cexSymbolForBaseToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="base token"
            align="center"
            prop="cexVolumnForBaseToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="base token价格"
            align="center"
            prop="cexPriceForBaseToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="base token手续费"
            align="center"
            prop="cexFeeAmountForBaseToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="cex是否完成"
            align="center"
            prop="statusOnCexForBaseToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="quote token利润"
            align="center"
            prop="quoteTokenProfit"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="base token利润"
            align="center"
            prop="baseTokenProfit"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="套利单状态"
            align="center"
            prop="status"
            :formatter="statusFormat"
            width="100"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busDexCexTriangularArbitrageRecord:edit']"
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
                  v-permisaction="['business:busDexCexTriangularArbitrageRecord:remove']"
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

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusDexCexTriangularArbitrageRecord, delBusDexCexTriangularArbitrageRecord, getBusDexCexTriangularArbitrageRecord, listBusDexCexTriangularArbitrageRecord, updateBusDexCexTriangularArbitrageRecord } from '@/api/business/bus-dex-cex-triangular-arbitrage-record'

export default {
  name: 'BusDexCexTriangularArbitrageRecord',
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
      busDexCexTriangularArbitrageRecordList: [],
      typeOptions: [], statusOptions: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        strategyId: undefined,
        arbitrageId: undefined,
        type: undefined,
        status: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { strategyId: [{ required: true, message: '策略id不能为空', trigger: 'blur' }],
        arbitrageId: [{ required: true, message: '套利记录id不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '套利类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '套利单状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_arbitrage_type').then(response => {
      this.typeOptions = response.data
    })
    this.getDicts('bus_arbitrage_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusDexCexTriangularArbitrageRecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexTriangularArbitrageRecordList = response.data.list
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
    typeFormat(row) {
      return this.selectDictLabel(this.typeOptions, row.type)
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
      this.title = '添加链上链下三角套利记录'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusDexCexTriangularArbitrageRecord(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改链上链下三角套利记录'
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
              updateBusDexCexTriangularArbitrageRecord(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusDexCexTriangularArbitrageRecord(this.form).then(response => {
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
        return delBusDexCexTriangularArbitrageRecord({ 'ids': Ids })
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
