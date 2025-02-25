<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-descriptions v-loading="loading" title="币种信息">
          <el-descriptions-item label="TargetToken">{{ busDexCexTriangularObserver.targetToken }}</el-descriptions-item>
          <el-descriptions-item label="QuoteToken">{{ busDexCexTriangularObserver.quoteToken }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card class="box-card">
        <el-descriptions v-loading="loading" title="CEX信息">
          <el-descriptions-item label="CEX">{{ busDexCexTriangularObserver.exchangeType }}</el-descriptions-item>
          <el-descriptions-item label="CEX Taker Fee">{{ busDexCexTriangularObserver.takerFee }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="box-card">
        <el-descriptions v-loading="loading" title="DEX信息">
          <el-descriptions-item label="Dex">{{ formatDexType(busDexCexTriangularObserver.dexType) }}</el-descriptions-item>
          <el-descriptions-item label="TokenMint">{{ busDexCexTriangularObserver.tokenMint }}</el-descriptions-item>
          <el-descriptions-item label="Market地址">{{ busDexCexTriangularObserver.ammPoolId }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="box-card">
        <el-descriptions v-loading="loading" title="Observer参数" :column="3">
          <template slot="extra">
            <el-button v-if="!loading && !isObserverEdit" type="text" icon="el-icon-edit" @click="handleObserverEdit">编辑</el-button>
          </template>

          <el-descriptions-item label="Min SOL Amount">
            <template v-if="!isObserverEdit">
              {{ busDexCexTriangularObserver.minSolAmount }}
            </template>
            <el-input v-else v-model="observerRequestParams.minSolAmount" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="Max SOL Amount">
            <template v-if="!isObserverEdit">
              {{ busDexCexTriangularObserver.maxSolAmount }}
            </template>
            <el-input v-else v-model="observerRequestParams.maxSolAmount" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="Min Profit">
            <template v-if="!isObserverEdit">
              {{ busDexCexTriangularObserver.minProfit }}
            </template>
            <el-input v-else v-model="observerRequestParams.minProfit" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="Priority Fee(SOL)">
            <template v-if="!isObserverEdit">
              {{ formattedPriorityFee }}
            </template>
            <el-input v-else v-model="observerRequestParams.priorityFee" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="Jito Fee(SOL)">
            <template v-if="!isObserverEdit">
              {{ formattedJitoFee }}
            </template>
            <el-input v-else v-model="observerRequestParams.jitoFee" size="mini" />
          </el-descriptions-item>
        </el-descriptions>
        <!-- 提交 & 取消 按钮 -->
        <div v-if="isObserverEdit" class="action-buttons">
          <el-button type="primary" @click="observerUpdateSubmit">提交</el-button>
          <el-button @click="handleObserverEdit">取消</el-button>
        </div>
      </el-card>

      <el-card v-if="busDexCexTriangularObserver.status === '3' && busDexCexTriangularObserver.isTrading" class="box-card">
        <el-descriptions v-loading="loading" title="Trader参数" :column="3">
          <template slot="extra">
            <el-button v-if="!loading && !isTraderEdit" type="text" icon="el-icon-edit" @click="handleTraderEdit">编辑</el-button>
          </template>

          <el-descriptions-item label="SlippageBps">
            <template v-if="!isTraderEdit">
              {{ (busDexCexTriangularObserver.slippage / 100).toFixed(2) }}%
            </template>
            <template v-else>
              <el-input v-model="traderRequestParams.slippage" size="mini" @input="handleSlippageInput">
                <template slot="append">%</template>
              </el-input>
            </template>
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="isTraderEdit" class="action-buttons">
          <el-button type="primary" @click="traderUpdateSubmit">提交</el-button>
          <el-button @click="handleTraderEdit">取消</el-button>
        </div>
      </el-card>

      <el-card v-if="busDexCexTriangularObserver.status === '2' || busDexCexTriangularObserver.status === '3'" class="box-card">
        <el-descriptions v-loading="loading" title="水位调节参数" :column="3">
          <template slot="extra">
            <el-button v-if="!loading && !isWaterLevelEdit" type="text" icon="el-icon-edit" @click="handleWaterLevelEdit">编辑</el-button>
          </template>

          <el-descriptions-item label="最低预警余额">
            <template v-if="!isWaterLevelEdit">
              {{ busDexCexTriangularObserver.alertThreshold }}
            </template>
            <el-input v-else v-model="waterLevelRequestParams.alertThreshold" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="低水位触发余额">
            <template v-if="!isWaterLevelEdit">
              {{ busDexCexTriangularObserver.buyTriggerThreshold }}
            </template>
            <el-input v-else v-model="waterLevelRequestParams.buyTriggerThreshold" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="低水位调节目标余额">
            <template v-if="!isWaterLevelEdit">
              {{ busDexCexTriangularObserver.targetBalanceThreshold }}
            </template>
            <el-input v-else v-model="waterLevelRequestParams.targetBalanceThreshold" size="mini" />
          </el-descriptions-item>
          <el-descriptions-item label="高水位触发余额">
            <template v-if="!isWaterLevelEdit">
              {{ busDexCexTriangularObserver.sellTriggerThreshold }}
            </template>
            <el-input v-else v-model="waterLevelRequestParams.sellTriggerThreshold" size="mini" />
          </el-descriptions-item>
        </el-descriptions>
        <div v-if="isWaterLevelEdit" class="action-buttons">
          <el-button type="primary" @click="waterLevelUpdateSubmit">提交</el-button>
          <el-button @click="handleWaterLevelEdit">取消</el-button>
        </div>
      </el-card>

      <el-card>
        <el-descriptions v-loading="loading" title="实时价差信息" column="5">
          <el-descriptions-item label="Dex买入价格">{{ formatProfit(busDexCexTriangularObserver.dexBuyPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Cex卖出价格">{{ formatProfit(busDexCexTriangularObserver.cexSellPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex买入价差">{{ formatProfit(busDexCexTriangularObserver.dexBuyDiffPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="利润">{{ formatProfit(busDexCexTriangularObserver.profitOfBuyOnDex, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex买入价差持续时间">{{ formatDuration(busDexCexTriangularObserver.dexBuyDiffDuration) }}</el-descriptions-item>

          <el-descriptions-item label="Dex卖出价格">{{ formatProfit(busDexCexTriangularObserver.dexSellPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Cex买入价格">{{ formatProfit(busDexCexTriangularObserver.cexBuyPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex卖出价差">{{ formatProfit(busDexCexTriangularObserver.dexSellDiffPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="利润">{{ formatProfit(busDexCexTriangularObserver.profitOfSellOnDex, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex卖出价差持续时间">{{ formatDuration(busDexCexTriangularObserver.dexSellDiffDuration) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-card v-loading="loading" class="box-card">
        <div class="chart-grid">
          <div id="chart" class="chart-box" />
          <div id="chart2" class="chart-box" />
        </div>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  busDexCexTriangularUpdateObserver,
  busDexCexTriangularUpdateTrader, busDexCexTriangularUpdateWaterLevel,
  getBusDexCexTriangularObserver
} from '@/api/business/bus-dex-cex-triangular-observer'
import { getDexCexHistoryChart } from '@/api/business/bus-dex-cex-price-spread-data'
import * as echarts from 'echarts'

export default {
  name: 'BusDexCexMonitorDetail',
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
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      // 观察币对列表
      symbolWatchList: [],
      // 关系表类型
      busDexCexTriangularObserver: undefined,

      chartDataDemo: {
        cexBuyPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: 21.12
          },
          {
            xAxis: 1738990260,
            yAxis: 20.34
          },
          {
            xAxis: 1738990320,
            yAxis: 22.4
          },
          {
            xAxis: 1738990380,
            yAxis: 21.212
          },
          {
            xAxis: 1738990440,
            yAxis: 20.121
          }
        ],
        cexSellPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: 21.5
          },
          {
            xAxis: 1738990260,
            yAxis: 21.2
          },
          {
            xAxis: 1738990320,
            yAxis: 21.244
          },
          {
            xAxis: 1738990380,
            yAxis: 21.214
          },
          {
            xAxis: 1738990440,
            yAxis: 20.1212
          }
        ],
        dexBuyPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: 21.52
          },
          {
            xAxis: 1738990260,
            yAxis: 20.84
          },
          {
            xAxis: 1738990320,
            yAxis: 19.12
          },
          {
            xAxis: 1738990380,
            yAxis: 21.24
          },
          {
            xAxis: 1738990440,
            yAxis: 22.121
          }
        ],
        dexSellPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: 24.14
          },
          {
            xAxis: 1738990260,
            yAxis: 23.1984
          },
          {
            xAxis: 1738990320,
            yAxis: 21.9775
          },
          {
            xAxis: 1738990380,
            yAxis: 21.212
          },
          {
            xAxis: 1738990440,
            yAxis: 20.121
          }
        ],
        dexSellPriceSpreadChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: -0.00021
          },
          {
            xAxis: 1738990260,
            yAxis: -0.00031
          },
          {
            xAxis: 1738990320,
            yAxis: -0.00023
          },
          {
            xAxis: 1738990380,
            yAxis: -0.000021
          },
          {
            xAxis: 1738990440,
            yAxis: -0.000021
          }
        ],
        dexBuyPriceSpreadChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: 2.12
          },
          {
            xAxis: 1738990260,
            yAxis: 2.22
          },
          {
            xAxis: 1738990320,
            yAxis: 1.9772
          },
          {
            xAxis: 1738990380,
            yAxis: 2.128
          },
          {
            xAxis: 1738990440,
            yAxis: 3.121
          }
        ],
        dexSellProfitChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: -0.00022
          },
          {
            xAxis: 1738990260,
            yAxis: -0.00021
          },
          {
            xAxis: 1738990320,
            yAxis: -0.00024
          },
          {
            xAxis: 1738990380,
            yAxis: -0.00025
          },
          {
            xAxis: 1738990440,
            yAxis: -0.00021
          }
        ],
        dexBuyProfitChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: -0.00021
          },
          {
            xAxis: 1738990260,
            yAxis: -0.00031
          },
          {
            xAxis: 1738990320,
            yAxis: -0.00011
          },
          {
            xAxis: 1738990380,
            yAxis: -0.00022
          },
          {
            xAxis: 1738990440,
            yAxis: -0.0000041
          }
        ]
      },
      dexTypeList: [
        { key: 'RAY_AMM', label: 'Raydium Liquidity Pool V4' },
        { key: 'RAY_CLMM', label: 'Raydium Centralized Liquidity' }
      ],

      isBrowserTabVisible: true, // 浏览器当前标签页是否可见
      isTabVisible: true, // 网站内当前标签页是否可见
      isWindowFocused: true, // 当前窗口是否聚焦
      isObserverEdit: false, // observer参数编辑模式
      isTraderEdit: false, // trader参数编辑模式
      isWaterLevelEdit: false, // 水位调节参数编辑模式
      observerRequestParams: {
        triggerProfitQuoteAmount: undefined
      }, // observer参数表单
      traderRequestParams: {}, // trader参数表单
      waterLevelRequestParams: {}, // 水位调节参数表单
      chart: null,
      chart2: null,
      chartData: {},
      id: undefined // 详情id
    }
  },
  computed: {
    formattedPriorityFee() {
      return parseFloat(this.busDexCexTriangularObserver.priorityFee / 1_000_000_000)
    },
    formattedJitoFee() {
      return parseFloat(this.busDexCexTriangularObserver.jitoFee / 1_000_000_000)
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.id = id
    this.getObserverDetail(id)
    this.startTimer()
  },
  mounted() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('blur', this.handleBlur)
    // 延迟初始化
    setTimeout(() => {
      const chartElement = document.getElementById('chart')
      const chart2Element = document.getElementById('chart2')
      if (chartElement) {
        this.chart = echarts.init(chartElement)
        this.chart2 = echarts.init(chart2Element)
        this.getChart(this.id)
      }
    }, 500) // 延迟500毫秒再进行初始化
  },
  beforeDestroy() {
    this.clearTimer() // 组件销毁前清除定时器
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('blur', this.handleBlur)
  },
  activated() {
    console.log('详情页 激活，启动定时器')
    this.isTabVisible = true
    this.toggleRefreshTask()
  },
  deactivated() {
    console.log('详情页 失活，清除定时器')
    this.isTabVisible = false
    this.toggleRefreshTask()
  },
  methods: {
    /** 查询参数列表 */
    getObserverDetail(id) {
      this.loading = true
      getBusDexCexTriangularObserver(id).then(response => {
        if (response.code === 200) { // 检查响应状态码
          this.busDexCexTriangularObserver = response.data
          this.id = response.data.id
          console.log('this.busDexCexTriangularObserver', this.busDexCexTriangularObserver)
          this.total = response.data.count
        } else {
          this.msgError(response.msg)
        }
        this.loading = false
      }).catch((error) => { // 添加错误处理
        this.loading = false
        this.msgError('获取列表数据失败：' + error)
      })
    },

    getChart(id) {
      this.loading = true
      const chartRequest = {
        id: id.toString()
      }
      console.log('node_env', process.env.NODE_ENV)
      if (process.env.NODE_ENV === 'development') {
        this.processData(this.chartDataDemo)
        this.updateChart()
      } else {
        getDexCexHistoryChart(chartRequest).then(response => {
          if (response.code === 200) {
            this.processData(response.data)
            this.updateChart()
            this.loading = false
          } else {
            this.msgError(response.msg)
            this.loading = false
          }
        })
      }
    },

    // 解析后端数据
    processData(data) {
      const xAxis = data.cexBuyPriceChartPoints.map((point) => this.formatXAxis(point.xAxis)) // 提取 X 轴
      const cexBuyPrices = data.cexBuyPriceChartPoints.map((point) => point.yAxis) // 提取 CEX 买入价格
      const cexSellPrices = data.cexSellPriceChartPoints.map((point) => point.yAxis) // 提取 CEX 卖出价格
      const dexBuyPrices = data.dexBuyPriceChartPoints.map((point) => point.yAxis) // 提取 DEX 买入价格
      const dexSellPrices = data.dexSellPriceChartPoints.map((point) => point.yAxis) // 提取 DEX 卖出价格
      const dexSellSpread = data.dexSellPriceSpreadChartPoints.map((point) => point.yAxis) // 提取 DEX 卖出价差
      const dexBuySpread = data.dexBuyPriceSpreadChartPoints.map((point) => point.yAxis) // 提取 DEX 买入价差
      const dexBuyProfit = data.dexBuyProfitChartPoints.map((point) => point.yAxis) // 提取 DEX 买入利润
      const dexSellProfit = data.dexSellProfitChartPoints.map((point) => point.yAxis) // 提取 DEX 卖出利润

      this.chartData = { xAxis, cexBuyPrices, cexSellPrices, dexBuyPrices, dexSellPrices, dexSellSpread, dexBuySpread, dexBuyProfit, dexSellProfit }
      console.log('this.chartData', this.chartData)
    },

    // 处理页面可见性变化
    handleVisibilityChange() {
      console.log('页面可见性变化')
      this.isBrowserTabVisible = document.visibilityState === 'visible'
      this.toggleRefreshTask()
    },
    handleFocus() {
      console.log('页面获取焦点')
      this.isWindowFocused = true
    },
    handleBlur() {
      console.log('页面失去焦点')
      this.isWindowFocused = false
    },
    // 根据条件切换定时任务
    toggleRefreshTask() {
      if (this.isBrowserTabVisible && this.isTabVisible) {
        // 如果页面在当前标签页且网站内tab也在该标签页且窗口聚焦，启动定时任务
        this.startTimer()
      } else {
        // 否则停止定时任务
        this.clearTimer()
      }
    },

    handleObserverEdit() {
      if (!this.isObserverEdit) {
        this.clearTimer()
        this.observerRequestParams = { ...this.busDexCexTriangularObserver }
        this.observerRequestParams.priorityFee = this.observerRequestParams.priorityFee / 1_000_000_000
        this.observerRequestParams.jitoFee = this.observerRequestParams.jitoFee / 1_000_000_000
      }
      this.isObserverEdit = !this.isObserverEdit
    },
    handleTraderEdit() {
      if (!this.isTraderEdit) {
        this.clearTimer()
        this.traderRequestParams = { ...this.busDexCexTriangularObserver }
        this.traderRequestParams.slippage = (this.busDexCexTriangularObserver.slippage / 100).toFixed(2)
      }
      this.isTraderEdit = !this.isTraderEdit
    },
    handleWaterLevelEdit() {
      if (!this.isWaterLevelEdit) {
        this.clearTimer()
        this.waterLevelRequestParams = { ...this.busDexCexTriangularObserver }
      }
      this.isWaterLevelEdit = !this.isWaterLevelEdit
    },

    // 更新提交
    observerUpdateSubmit() {
      console.log('提交数据:', this.observerRequestParams)
      // 提交逻辑（调用 API）
      const newMinSolAmount = Number(this.observerRequestParams.minSolAmount)
      const newMaxSolAmount = Number(this.observerRequestParams.maxSolAmount)
      const minProfit = Number(this.observerRequestParams.minProfit)
      const priorityFee = Number(this.observerRequestParams.priorityFee)
      const jitoFee = Number(this.observerRequestParams.jitoFee)
      if (isNaN(newMinSolAmount) || newMinSolAmount <= 0 || isNaN(newMaxSolAmount) || newMaxSolAmount <= 0) {
        this.$message.error('请输入有效的数字')
        return
      }
      if (newMinSolAmount > newMaxSolAmount) {
        this.$message.error('最大交易金额必须大于最小交易金额')
        return
      }
      const requestData = {
        id: this.observerRequestParams.id,
        minSolAmount: newMinSolAmount,
        maxSolAmount: newMaxSolAmount,
        minProfit: minProfit,
        priorityFee: priorityFee,
        jitoFee: jitoFee
      }
      busDexCexTriangularUpdateObserver(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getObserverDetail(requestData.id)
        } else {
          this.msgError(res.msg)
        }
      })
      this.startTimer()
      this.isObserverEdit = false
    },

    traderUpdateSubmit() {
      console.log('提交数据:', this.traderRequestParams)
      const requestData = { ...this.traderRequestParams }
      requestData.slippage = (requestData.slippage * 100).toString() // 只在副本上乘以 100

      busDexCexTriangularUpdateTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getObserverDetail(requestData.id)
        } else {
          this.msgError(res.msg)
        }
      })
      this.startTimer()
      this.isTraderEdit = false
    },

    waterLevelUpdateSubmit() {
      console.log('提交数据:', this.waterLevelRequestParams)
      const requestData = { ...this.waterLevelRequestParams }
      requestData.id = this.waterLevelRequestParams.id
      requestData.alertThreshold = Number(requestData.alertThreshold)
      requestData.buyTriggerThreshold = Number(requestData.buyTriggerThreshold)
      requestData.targetBalanceThreshold = Number(requestData.targetBalanceThreshold)
      requestData.sellTriggerThreshold = Number(requestData.sellTriggerThreshold)
      busDexCexTriangularUpdateWaterLevel(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getObserverDetail(requestData.id)
        } else {
          this.msgError(res.msg)
        }
      })
      this.startTimer()
      this.isWaterLevelEdit = false
    },

    getPriceYAxisRange(values) {
      if (values.length === 0) return { min: 0, max: 1 }
      const min = Math.min(...values)
      const max = Math.max(...values)
      return { min: this.formatPrice(min * 0.95), max: this.formatPrice(max * 1.05) }
    },

    getPriceSpreadYAxisRange(values, baseRange) {
      if (values.length === 0) return { min: 0, max: 1 }

      const min = Math.min(...values)
      const max = Math.max(...values)

      // 根据基准范围调整当前范围
      const range = baseRange.max - baseRange.min
      const adjustedMin = Math.floor(min - (range * 0.05))
      const adjustedMax = Math.ceil(max + (range * 0.05))

      return { min: adjustedMin, max: adjustedMax }
    },

    getProfitYAxisRange(values) {
      if (values.length === 0) return { min: 0, max: 1 }
      const min = Math.min(...values)
      const max = Math.max(...values)
      console.log(min, max)
      const padding = (max - min) * 2
      console.log('padding', padding)
      const adjustMin = min - padding
      const adjustMax = max + padding
      console.log(adjustMin, adjustMax)
      console.log(this.formatPrice(adjustMin), this.formatPrice(adjustMax))
      return { min: this.formatPrice(adjustMin), max: this.formatPrice(adjustMax) }
    },

    formatXAxis(timestamp) {
      // 后端返回的是int类型的时间戳
      const date = new Date(timestamp * 1000) // 秒级时间戳转换成毫秒
      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0') // 补零

      return `${hours}:${minutes}`
    },
    updateChart() {
      const dexBuyPriceRange = this.getPriceYAxisRange([...this.chartData.dexBuyPrices, ...this.chartData.cexSellPrices])
      const dexBuyPriceSpreadRange = this.getPriceSpreadYAxisRange([...this.chartData.dexBuySpread], dexBuyPriceRange)

      const option = {
        title: {
          text: 'Dex买入价格走势与价差变化',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: { trigger: 'axis' },
        legend: {
          bottom: 0,
          data: ['DEX买入价格', 'CEX卖出价格', '价差']
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxis
        },
        yAxis: [
          {
            type: 'value',
            name: '价格',
            min: dexBuyPriceRange.min,
            max: dexBuyPriceRange.max,
            alignTicks: true,
            axisLabel: {
              formatter: function(value) {
                return value.toFixed(4) // 保留4位小数
              }
            }
          },
          {
            type: 'value',
            name: '价差',
            min: dexBuyPriceSpreadRange.min,
            max: dexBuyPriceSpreadRange.max,
            alignTicks: true,
            axisLabel: {
              formatter: function(value) {
                return value.toFixed(6) // 保留6位小数
              }
            }
          }
        ],
        series: [
          {
            name: 'DEX买入价格',
            type: 'line',
            yAxisIndex: 0,
            data: this.chartData.dexBuyPrices,
            itemStyle: { color: '#8884d8' },
            symbol: 'none', // 去掉数据点
            smooth: true
          },
          {
            name: 'CEX卖出价格',
            type: 'line',
            yAxisIndex: 0,
            data: this.chartData.cexSellPrices,
            itemStyle: { color: '#82ca9d' },
            smooth: true,
            symbol: 'none' // 去掉数据点
          },
          {
            name: '价差',
            type: 'line',
            yAxisIndex: 1,
            data: this.chartData.dexBuySpread,
            itemStyle: { color: '#ff8042' },
            symbol: 'none', // 去掉数据点
            smooth: true
          }
        ],
        grid: { left: '10%', right: '10%', containLabel: true } // 让左右 Y 轴对齐
      }

      const dexSellPriceRange = this.getPriceYAxisRange([...this.chartData.dexSellPrices, ...this.chartData.cexBuyPrices])
      const dexSellPriceSpreadRange = this.getPriceSpreadYAxisRange([...this.chartData.dexSellSpread], dexSellPriceRange)

      const option2 = {
        title: {
          text: 'Dex卖出价格走势与价差变化',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: { trigger: 'axis' },
        legend: {
          bottom: 0,
          data: ['DEX卖出价格', 'CEX买入价格', '价差']
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxis
        },
        yAxis: [
          {
            type: 'value',
            name: '价格',
            min: dexSellPriceRange.min,
            max: dexSellPriceRange.max,
            alignTicks: true,
            axisLabel: {
              formatter: function(value) {
                return value.toFixed(6) // 保留6位小数
              }
            }
          },
          {
            type: 'value',
            name: '价差',
            min: dexSellPriceSpreadRange.min,
            max: dexSellPriceSpreadRange.max,
            alignTicks: true,
            axisLabel: {
              formatter: function(value) {
                return value.toFixed(6) // 保留6位小数
              }
            }
          }
        ],
        series: [
          {
            name: 'DEX卖出价格',
            type: 'line',
            yAxisIndex: 0,
            data: this.chartData.dexSellPrices,
            itemStyle: { color: '#8884d8' },
            symbol: 'none', // 去掉数据点
            smooth: true
          },
          {
            name: 'CEX买入价格',
            type: 'line',
            yAxisIndex: 0,
            data: this.chartData.cexBuyPrices,
            itemStyle: { color: '#82ca9d' },
            smooth: true,
            symbol: 'none' // 去掉数据点
          },
          {
            name: '价差',
            type: 'line',
            yAxisIndex: 1,
            data: this.chartData.dexSellSpread,
            itemStyle: { color: '#ff8042' },
            symbol: 'none', // 去掉数据点
            smooth: true
          }
        ],
        grid: { left: '10%', right: '10%', containLabel: true } // 让左右 Y 轴对齐
      }

      this.chart.setOption(option)
      this.chart2.setOption(option2)
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer) // 如果定时器已存在，先清除
      }
      this.timer = setInterval(() => {
        this.getObserverDetail(this.id)
        this.getChart(this.id)
      }, 5000) // 每 5 秒刷新一次
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
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
      this.batchForm = {
        symbol: [],
        slippage: undefined
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
    formatSlippage(cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue) / 100
      return slippage.toFixed(2).toString() + '%' // 保留四位小数，根据需要调整
    },
    formatFee(cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return ''
      }
      const fee = Number(fee) / 1000_000_000
      return fee
    },
    formatProfit(cellValue, quoteToken) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      let numStr = cellValue.toString()

      // 处理科学计数法
      if (numStr.includes('e')) {
        const [base, exponent] = numStr.split('e').map(Number)
        numStr = (base * Math.pow(10, exponent)).toFixed(20)
      }

      const [intPart, rawDecPart] = numStr.split('.')
      const decPart = rawDecPart || ''

      // 如果整数部分不为 0，直接保留 6 位小数
      if (intPart !== '0' && intPart !== '-0') {
        return Number(Number(numStr).toFixed(6)) + ' ' + quoteToken
      }

      // 计算小数部分前导 0 的个数
      let leadingZeros = 0
      for (const char of decPart) {
        if (char === '0') leadingZeros++
        else break
      }

      // 获取 4 位有效数字
      const significantDigits = decPart.slice(leadingZeros, leadingZeros + 6)
      if (leadingZeros > 3) {
        return `0.0{${leadingZeros - 1}}${significantDigits}` + ' ' + quoteToken
      }

      return Number(Number(numStr).toFixed(leadingZeros + 6)) + ' ' + quoteToken
    },
    formatPrice(value) {
      if (value === null || value === undefined || value === '' || value === 0) {
        return 0 // 或者其他默认值，例如 0
      }
      let numStr = value.toString()

      // 处理科学计数法
      if (numStr.includes('e')) {
        const [base, exponent] = numStr.split('e').map(Number)
        numStr = (base * Math.pow(10, exponent)).toFixed(20)
      }

      const [intPart, rawDecPart] = numStr.split('.')
      const decPart = rawDecPart || ''

      // 如果整数部分不为 0，直接保留 6 位小数
      if (intPart !== '0' && intPart !== '-0') {
        return Number(Number(numStr).toFixed(6))
      }

      // 计算小数部分前导 0 的个数
      let leadingZeros = 0
      for (const char of decPart) {
        if (char === '0') leadingZeros++
        else break
      }

      return Number(Number(numStr).toFixed(leadingZeros + 6))
    },
    formatDuration(cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '-' // 或者其他默认值
      }
      const durationSeconds = Number(cellValue)
      if (durationSeconds < 60) {
        // 展示单位为s
        return durationSeconds + 's'
      } else if (durationSeconds < 3600) {
        // 1分钟到1小时之间，转换为“xx分 xx秒”
        const minutes = Math.floor(durationSeconds / 60)
        const seconds = durationSeconds % 60
        return `${minutes}m ${seconds}s`
      } else {
        // 1小时及以上，转换为“xx小时 xx分 xx秒”
        const hours = Math.floor(durationSeconds / 3600)
        const minutes = Math.floor((durationSeconds % 3600) / 60)
        const seconds = durationSeconds % 60
        return `${hours}h ${minutes}m ${seconds}s`
      }
    },
    formatDexType(dexType) {
      const match = this.dexTypeList.find(item => item.key === dexType)
      return match ? match.label : dexType // 如果匹配不到，就显示原始值
    },
    handleSlippageInput() {
      let value = this.traderRequestParams.slippage
      // 只允许数字，并限制两位小数
      value = value.replace(/[^0-9.]/g, '') // 只能输入数字和小数点
      value = value.replace(/^0+(\d)/, '$1') // 去掉前导 0
      value = value.replace(/^\./, '0.') // 防止以 . 开头
      value = value.match(/^\d*(\.\d{0,2})?/)?.[0] || '' // 限制小数点后两位
      this.traderRequestParams.slippage = value
    }
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto; /* 添加水平滚动条 */
}

/* 表头和内容对齐 */
.table-container th,
.table-container td {
  text-align: center; /* 设置文字居中 */
}
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 让两个 chart 各占 50% */
  gap: 20px; /* 中间留 20px 空隙 */
  width: 100%;
}
.chart-box {
  height: 400px;
}
</style>
