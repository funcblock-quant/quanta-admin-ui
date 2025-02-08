<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">

        <el-descriptions v-loading="loading" title="监控信息">
          <el-descriptions-item label="BaseToken">{{ busDexCexTriangularObserver.baseToken }}</el-descriptions-item>
          <el-descriptions-item label="QuoteToken">{{ busDexCexTriangularObserver.quoteToken }}</el-descriptions-item>
          <el-descriptions-item label="交易所">{{ busDexCexTriangularObserver.exchangeType }}</el-descriptions-item>
          <el-descriptions-item label="Sol交易数量">{{ busDexCexTriangularObserver.volume }}</el-descriptions-item>
          <!--          <el-descriptions-item label="Dex Buy Price">{{ formatProfit(busDexCexTriangularObserver.dexBuyPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Cex Sell Price">{{ formatProfit(busDexCexTriangularObserver.cexSellPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Dex买入价差">{{ formatProfit(busDexCexTriangularObserver.dexBuyDiffPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Dex Buy Profit">{{ formatProfit(busDexCexTriangularObserver.profitOfBuyOnDex) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Dex Sell Price">{{ formatProfit(busDexCexTriangularObserver.dexSellPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Cex Buy Price">{{ formatProfit(busDexCexTriangularObserver.cexBuyPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Dex卖出价差">{{ formatProfit(busDexCexTriangularObserver.dexSellDiffPrice) }}</el-descriptions-item>-->
          <!--          <el-descriptions-item label="Dex Sell Profit">{{ formatProfit(busDexCexTriangularObserver.profitOfSellOnDex) }}</el-descriptions-item>-->
          <el-descriptions-item label="交易所Taker Fee">{{ busDexCexTriangularObserver.takerFee }}</el-descriptions-item>
          <el-descriptions-item label="TokenMint">{{ busDexCexTriangularObserver.tokenMint }}</el-descriptions-item>
          <el-descriptions-item label="Dex Type">{{ busDexCexTriangularObserver.dexType }}</el-descriptions-item>
          <el-descriptions-item label="Amm Pool">{{ busDexCexTriangularObserver.ammPoolId }}</el-descriptions-item>
          <el-descriptions-item label="Slippage Bps">{{ formatSlippage(busDexCexTriangularObserver.slippageBps) }}</el-descriptions-item>
        </el-descriptions>

      </el-card>

      <el-card>
        <el-descriptions v-loading="loading" title="实时价差信息" column="4">
          <el-descriptions-item label="Dex买入价格">{{ formatProfit(busDexCexTriangularObserver.dexBuyPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Cex卖出价格">{{ formatProfit(busDexCexTriangularObserver.cexSellPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex买入价差">{{ formatProfit(busDexCexTriangularObserver.dexBuyDiffPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex买入价差持续时间">{{ formatDuration(busDexCexTriangularObserver.dexBuyDiffDuration) }}</el-descriptions-item>

          <el-descriptions-item label="Dex卖出价格">{{ formatProfit(busDexCexTriangularObserver.dexSellPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Cex买入价格">{{ formatProfit(busDexCexTriangularObserver.cexBuyPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
          <el-descriptions-item label="Dex卖出价差">{{ formatProfit(busDexCexTriangularObserver.dexSellDiffPrice, busDexCexTriangularObserver.quoteToken) }}</el-descriptions-item>
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
            yAxis: '21'
          },
          {
            xAxis: 1738990260,
            yAxis: '20'
          },
          {
            xAxis: 1738990320,
            yAxis: '22'
          },
          {
            xAxis: 1738990380,
            yAxis: '21.212'
          },
          {
            xAxis: 1738990440,
            yAxis: '20.121'
          }
        ],
        cexSellPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: '21'
          },
          {
            xAxis: 1738990260,
            yAxis: '20'
          },
          {
            xAxis: 1738990320,
            yAxis: '22'
          },
          {
            xAxis: 1738990380,
            yAxis: '21.212'
          },
          {
            xAxis: 1738990440,
            yAxis: '20.121'
          }
        ],
        dexBuyPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: '21'
          },
          {
            xAxis: 1738990260,
            yAxis: '20'
          },
          {
            xAxis: 1738990320,
            yAxis: '22'
          },
          {
            xAxis: 1738990380,
            yAxis: '21.212'
          },
          {
            xAxis: 1738990440,
            yAxis: '20.121'
          }
        ],
        dexSellPriceChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: '21'
          },
          {
            xAxis: 1738990260,
            yAxis: '20'
          },
          {
            xAxis: 1738990320,
            yAxis: '22'
          },
          {
            xAxis: 1738990380,
            yAxis: '21.212'
          },
          {
            xAxis: 1738990440,
            yAxis: '20.121'
          }
        ],
        dexSellPriceSpreadChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: '-0.21'
          },
          {
            xAxis: 1738990260,
            yAxis: '-0.31'
          },
          {
            xAxis: 1738990320,
            yAxis: '-0.23'
          },
          {
            xAxis: 1738990380,
            yAxis: '-0.21'
          },
          {
            xAxis: 1738990440,
            yAxis: '-0.21'
          }
        ],
        dexBuyPriceSpreadChartPoints: [
          {
            xAxis: 1738990200,
            yAxis: '2.12'
          },
          {
            xAxis: 1738990260,
            yAxis: '2.22'
          },
          {
            xAxis: 1738990320,
            yAxis: '1.9772'
          },
          {
            xAxis: 1738990380,
            yAxis: '2.128'
          },
          {
            xAxis: 1738990440,
            yAxis: '3.121'
          }
        ]
      },

      chart: null,
      chart2: null,
      chartData: {},
      observerId: '',
      id: undefined // 详情id
    }
  },
  created() {
    const observerId = this.$route.params && this.$route.params.observerId
    const id = this.$route.params && this.$route.params.id
    this.observerId = observerId
    this.id = id
    this.getObserverDetail(id)
    this.startTimer()
  },
  mounted() {
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('blur', this.handleBlur)
    // 延迟初始化
    setTimeout(() => {
      const chartElement = document.getElementById('chart')
      const chart2Element = document.getElementById('chart2')
      if (chartElement) {
        this.chart = echarts.init(chartElement)
        this.chart2 = echarts.init(chart2Element)
        this.getChart(this.observerId)
      }
    }, 500) // 延迟500毫秒再进行初始化
  },
  beforeDestroy() {
    this.clearTimer() // 组件销毁前清除定时器
    window.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('blur', this.handleBlur)
  },

  methods: {
    /** 查询参数列表 */
    getObserverDetail(id) {
      this.loading = true
      getBusDexCexTriangularObserver(id).then(response => {
        if (response.code === 200) { // 检查响应状态码
          this.busDexCexTriangularObserver = response.data
          this.observerId = response.data.observerId
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

    getChart(observerId) {
      this.loading = true
      const chartRequest = {
        observerId: observerId
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

      this.chartData = { xAxis, cexBuyPrices, cexSellPrices, dexBuyPrices, dexSellPrices, dexSellSpread, dexBuySpread }
      console.log('this.chartData', this.chartData)
    },

    getPriceYAxisRange(values) {
      if (values.length === 0) return { min: 0, max: 1 }
      const min = Math.min(...values)
      const max = Math.max(...values)
      return { min: Math.floor(min * 0.95), max: Math.ceil(max * 1.05) }
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
          { type: 'value', name: '价格', min: dexBuyPriceRange.min, max: dexBuyPriceRange.max, alignTicks: true },
          { type: 'value', name: '价差', min: dexBuyPriceSpreadRange.min, max: dexBuyPriceSpreadRange.max, alignTicks: true }
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
          { type: 'value', name: '价格', min: dexSellPriceRange.min, max: dexSellPriceRange.max, alignTicks: true },
          { type: 'value', name: '价差', min: dexSellPriceSpreadRange.min, max: dexSellPriceSpreadRange.max, alignTicks: true }
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
        this.getChart(this.observerId)
      }, 5000) // 每 5 秒刷新一次
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    handleFocus() {
      console.log('页面获取焦点')
      this.startTimer()
    },
    handleBlur() {
      console.log('页面失去焦点')
      this.clearTimer()
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
    formatProfit(cellValue, quoteToken) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue)
      return slippage.toFixed(6).toString() + ' ' + quoteToken // 保留四位小数，根据需要调整
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
