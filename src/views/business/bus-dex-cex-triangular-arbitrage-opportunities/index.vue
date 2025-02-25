
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
          <el-form-item label="实例id" prop="instanceId">
            <el-input
              v-model="queryParams.instanceId"
              placeholder="请输入实例id"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="买方" prop="buyOnDex">
            <el-select
              v-model="queryParams.buyOnDex"
              placeholder="请选择买方类型"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="buySide in buyOndexList"
                :key="buySide.value"
                :label="buySide.label"
                :value="buySide.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="套利币种" prop="symbols">
            <el-select
              v-model="queryParams.symbol"
              placeholder="请选择套利币种"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="symbol in symbolList"
                :key="symbol.symbol"
                :value="symbol.symbol"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="最小利润" prop="minProfit">
            <el-input
              v-model="queryParams.minProfit"
              placeholder="最小利润"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="最大利润" prop="maxProfit">
            <el-input
              v-model="queryParams.maxProfit"
              placeholder="最小利润"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="选择时间段">
            <el-date-picker
              v-model="dateRange"
              size="small"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form>

        <el-table v-loading="loading" :data="busDexCexTriangularArbitrageOpportunitiesList">
          <el-table-column
            label="实例id"
            align="center"
            prop="instanceId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="套利币种"
            align="center"
            prop="cexTargetAsset"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="买方"
            align="center"
            prop="buyOnDex"
            :show-overflow-tooltip="true"
            :formatter="formatBuyOnDex"
          />
          <el-table-column
            label="交易时间"
            align="center"
            width="180"
            :show-overflow-tooltip="true"
            :formatter="formatTime"
          />
          <el-table-column
            label="预期利润"
            align="center"
            width="100"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column label="DEX侧交易信息" align="center">
            <!--            <el-table-column-->
            <!--              label="token address"-->
            <!--              align="center"-->
            <!--              prop="dexTargetToken"-->
            <!--              :show-overflow-tooltip="true"-->
            <!--            />-->
            <!--            <el-table-column-->
            <!--              label="pool type"-->
            <!--              align="center"-->
            <!--              prop="dexPoolType"-->
            <!--              :show-overflow-tooltip="true"-->
            <!--            />-->
            <!--            <el-table-column-->
            <!--              label="pool id"-->
            <!--              align="center"-->
            <!--              prop="dexPoolId"-->
            <!--              :show-overflow-tooltip="true"-->
            <!--            />-->
            <el-table-column
              label="交易数量"
              align="center"
              prop="dexTargetAmount"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="SolAmount"
              align="center"
              prop="dexSolAmount"
              :show-overflow-tooltip="true"
            />

            <el-table-column
              label="priority fee"
              align="center"
              prop="dexTxPriorityFee"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="jito fee"
              align="center"
              prop="dexTxJitoFee"
              :show-overflow-tooltip="true"
            />
          </el-table-column>
          <el-table-column label="CEX侧交易信息" align="center">
            <el-table-column
              label="交易所"
              align="center"
              prop="cexExchangeType"
              :show-overflow-tooltip="true"
            /><el-table-column
              label="计价币种"
              align="center"
              prop="cexQuoteAsset"
              :show-overflow-tooltip="true"
            /><el-table-column
              label="卖出数量"
              align="center"
              prop="cexSellQuantity"
              :show-overflow-tooltip="true"
            /><el-table-column
              label="卖出金额"
              align="center"
              prop="cexSellQuoteAmount"
              :show-overflow-tooltip="true"
            /><el-table-column
              label="买入数量"
              align="center"
              prop="cexBuyQuantity"
              :show-overflow-tooltip="true"
            /><el-table-column
              label="买入金额"
              align="center"
              prop="cexBuyQuoteAmount"
              :show-overflow-tooltip="true"
            />
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
import { addStrategyDexCexTriangularArbitrageOpportunities, delStrategyDexCexTriangularArbitrageOpportunities, getStrategyDexCexTriangularArbitrageOpportunities, listStrategyDexCexTriangularArbitrageOpportunities, updateStrategyDexCexTriangularArbitrageOpportunities } from '@/api/business/bus-dex-cex-triangular-arbitrage-opportunities'
import { listBusDexCexTriangularSymbolList } from '@/api/business/bus-dex-cex-triangular-observer'

export default {
  name: 'StrategyDexCexTriangularArbitrageOpportunities',
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
      busDexCexTriangularArbitrageOpportunitiesList: [],

      // 日期范围
      dateRange: [],
      pickerOptions: {
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        instanceId: undefined,
        buyOnDex: undefined,
        idOrder: 'desc'

      },
      buyOndexList: [
        { label: 'CEX', value: '0' },
        { label: 'DEX', value: '1' }
      ],
      symbolList: [],
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { instanceId: [{ required: true, message: '实例id不能为空', trigger: 'blur' }],
        buyOnDex: [{ required: true, message: '买方标识不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getSymbolList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listStrategyDexCexTriangularArbitrageOpportunities(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexTriangularArbitrageOpportunitiesList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    /** 查询观察币种 */
    getSymbolList() {
      this.loading = true
      listBusDexCexTriangularSymbolList().then(response => {
        this.symbolList = response.data.map(symbol => {
          if (typeof symbol.symbol === 'string') {
            symbol.symbol = symbol.symbol.split('/')[0]
            return symbol// 获取 '/' 前的部分
          } else {
            return symbol // 如果 symbol 不是字符串，则直接返回
          }
        })
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
      this.title = '添加CEX-DEX套利机会统计'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getStrategyDexCexTriangularArbitrageOpportunities(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改CEX-DEX套利机会统计'
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
              updateStrategyDexCexTriangularArbitrageOpportunities(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addStrategyDexCexTriangularArbitrageOpportunities(this.form).then(response => {
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
        return delStrategyDexCexTriangularArbitrageOpportunities({ 'ids': Ids })
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
    // 格式化方法
    formatBuyOnDex(row, column, cellValue, index) {
      console.log('row.buyOnDex', row.buyOnDex)
      return row.buyOnDex === '1' ? 'DEX' : 'CEX'
    },
    formatTime(row, column, cellValue, index) {
      console.log('row.createdAt', row.createdAt)
      const date = new Date(row.createdAt) // 将返回的 ISO 格式时间字符串转为 Date 对象
      return date.toLocaleString()
    },
    formatProfit(row, column, cellValue, index) {
      const cexSellQuoteAmount = parseFloat(row.cexSellQuoteAmount) || 0
      const cexBuyQuoteAmount = parseFloat(row.cexBuyQuoteAmount) || 0
      return (cexSellQuoteAmount - cexBuyQuoteAmount)
    }
  }
}
</script>
