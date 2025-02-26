
<template>
  <BasicLayout>
    <template #wrapper>
      <el-row v-loading="dashLoading" :gutter="12">
        <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '24px'}">
          <chart-card title="总套利次数" :total="dashboardData.totalTrade">
            <el-tooltip slot="action" class="item" effect="dark" content="统计当前系统总套利次数" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
            <template slot="footer">24H 套利次数 <span>{{ dashboardData.dailyTotalTrade }}</span></template>
          </chart-card>
        </el-col>
        <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
          <chart-card title="总利润" :total="'$ ' + dashboardData.totalProfit">
            <el-tooltip slot="action" class="item" effect="dark" content="统计当前系统总利润" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
            <div>
              <trend :flag="dashboardData.dailyProfitChangePercent >= 0 ? 'top' : 'bottom'" style="margin-right: 16px;" :rate="dashboardData.dailyProfitChangePercent">
                <span slot="term" />
              </trend>
            </div>
            <template slot="footer">24H 利润 <span>$ {{ dashboardData.dailyTotalProfit }}</span></template>
          </chart-card>
        </el-col>
        <el-col :sm="24" :xs="24" :md="6" :xl="6" :lg="6" :style="{ marginBottom: '12px' }">
          <chart-card title="总交易量" :total="dashboardData.totalTradeVolume">
            <el-tooltip slot="action" class="item" effect="dark" content="统计当前总的套利交易量" placement="top-start">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
            <template slot="footer">24H 交易量 <span>{{ dashboardData.dailyTotalTradeVolume }}%</span></template>
          </chart-card>
        </el-col>
      </el-row>

      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
          <el-form-item label="实例id" prop="instanceId">
            <el-input
              v-model="queryParams.instanceId"
              placeholder="请输入instance ID"
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

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>

          <div class="fixed-button">
            <router-link :to="{ name: 'StrategyDexCexTriangularArbitrageFailedTrades' }">
              <el-button type="danger" icon="el-icon-close" size="small">
                查看失败记录
              </el-button>
            </router-link>
          </div>
        </el-form>

        <el-table v-loading="loading" :data="busDexCexTriangularArbitrageTradesList">
          <el-table-column
            label="ID"
            width="100"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <router-link :to="{name:'BusDexCexTradeDetail', params: {id:scope.row.id}}" class="link-type">
                <span>{{ scope.row.id }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            label="实例id"
            align="center"
            prop="instanceId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="套利币种"
            align="center"
            prop="symbol"
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
            label="利润"
            align="center"
            width="100"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column label="DEX侧交易信息" align="center">
            <el-table-column
              label="交易状态"
              align="center"
              prop="dexSuccess"
              :show-overflow-tooltip="true"
              :formatter="formatTradeStatus"
            />
            <el-table-column
              label="交易手续费"
              align="center"
              prop="dexTxFee"
              :show-overflow-tooltip="true"
              :formatter="formatNumber"
            />
            <el-table-column
              label="币种交易数量"
              align="center"
              prop="dexTargetAmount"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="SOL交易金额"
              align="center"
              prop="dexSolAmount"
              :show-overflow-tooltip="true"
            />
          </el-table-column>
          <el-table-column label="CEX侧交易信息" align="center">
            <el-table-column
              label="CEX"
              align="center"
              prop="cexExchangeType"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="卖单ID"
              align="center"
              prop="cexSellOrderId"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="卖单数量"
              align="center"
              prop="cexSellQuantity"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="卖单金额"
              align="center"
              prop="cexSellQuoteAmount"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="卖单结果"
              align="center"
              prop="cexSellSuccess"
              :show-overflow-tooltip="true"
              :formatter="formatTradeStatus"
            />
            <el-table-column
              label="卖单手续费"
              align="center"
              prop="cexSellFee"
              :show-overflow-tooltip="true"
              :formatter="formatNumber"
            />
            <el-table-column
              label="卖单手续费币种"
              align="center"
              prop="cexSellFeeAsset"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="买单ID"
              align="center"
              prop="cexBuyOrderId"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="买单数量"
              align="center"
              prop="cexBuyQuantity"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="买单金额"
              align="center"
              prop="cexBuyQuoteAmount"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="买单结果"
              align="center"
              prop="cexBuySuccess"
              :show-overflow-tooltip="true"
              :formatter="formatTradeStatus"
            />
            <el-table-column
              label="买单手续费"
              align="center"
              prop="cexBuyFee"
              :show-overflow-tooltip="true"
              :formatter="formatNumber"
            />
            <el-table-column
              label="买单手续费币种"
              align="center"
              prop="cexBuyFeeAsset"
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
import {
  addStrategyDexCexTriangularArbitrageTrades,
  delStrategyDexCexTriangularArbitrageTrades,
  getStrategyDexCexTriangularArbitrageTrades,
  getStrategyDexCexTriangularArbitrageTradesStatistics,
  listStrategyDexCexTriangularArbitrageTrades,
  updateStrategyDexCexTriangularArbitrageTrades
} from '@/api/business/bus-dex-cex-triangular-arbitrage-trades'
import { listBusDexCexTriangularSymbolList } from '@/api/business/bus-dex-cex-triangular-observer'
import ChartCard from '@/components/ChartCard/index.vue'
import Trend from '@/components/Trend/index.vue'

export default {
  name: 'StrategyDexCexTriangularArbitrageTrades',
  components: {
    Trend,
    ChartCard
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      dashLoading: true,
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
      busDexCexTriangularArbitrageTradesList: [],
      dashboardData: {
        totalTrade: undefined,
        totalSuccessTrade: undefined,
        totalFailedTrade: undefined,
        dailyTotalTrade: undefined,
        dailyTotalSuccessTrade: undefined,
        dailyTotalFailedTrade: undefined,
        totalProfit: undefined,
        dailyTotalProfit: undefined,
        dailyProfitChangePercent: undefined,
        totalTradeVolume: undefined,
        dailyTotalTradeVolume: undefined
      },

      // 日期范围
      dateRange: [],
      pickerOptions: {
      },
      symbolList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        instanceId: undefined,
        buyOnDex: undefined,
        idOrder: 'desc',
        isSuccess: true // 只查成功的记录
      },
      // 表单参数
      form: {
      },
      buyOndexList: [
        { label: 'CEX', value: '0' },
        { label: 'DEX', value: '1' }
      ],
      // 表单校验
      rules: { instanceId: [{ required: true, message: 'Arbitrager instance ID不能为空', trigger: 'blur' }],
        buyOnDex: [{ required: true, message: 'Buy on dex or cex不能为空', trigger: 'blur' }]
      }
    }
  },
  activated() {
    // 触发数据更新，例如重新获取数据
    this.getList()
    this.getSymbolList()
    this.getDashboard()
  },
  created() {
    this.getList()
    this.getSymbolList()
    this.getDashboard()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listStrategyDexCexTriangularArbitrageTrades(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexTriangularArbitrageTradesList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    /** 获取dashboard统计信息*/
    getDashboard() {
      this.dashLoading = true
      getStrategyDexCexTriangularArbitrageTradesStatistics().then(response => {
        this.dashboardData = response.data
        this.dashLoading = false
      })
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
      this.title = '添加DEX-CEX套利记录'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getStrategyDexCexTriangularArbitrageTrades(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改DEX-CEX套利记录'
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
              updateStrategyDexCexTriangularArbitrageTrades(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addStrategyDexCexTriangularArbitrageTrades(this.form).then(response => {
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
        return delStrategyDexCexTriangularArbitrageTrades({ 'ids': Ids })
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
    },
    formatNumber(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      let numStr = cellValue.toString()

      // 处理科学计数法
      if (numStr.includes('e')) {
        const [base, exponent] = numStr.split('e').map(Number)
        numStr = (base * Math.pow(10, exponent)).toFixed(20)
      }
      return Number(numStr)
    },

    formatTradeStatus(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }

      if (cellValue === '1') {
        return '成功'
      } else {
        return '失败'
      }
    }
  }
}
</script>
