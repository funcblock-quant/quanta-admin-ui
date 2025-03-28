<template>
  <BasicLayout>
    <template #wrapper>

      <el-card v-loading="loading" class="box-card">
        <el-descriptions title="交易详情" :column="2">
          <el-descriptions-item label="ID" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="策略实例ID" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.instanceId }}</el-descriptions-item>
          <el-descriptions-item label="套利机会ID" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.opportunityId }}</el-descriptions-item>
          <el-descriptions-item label="套利币种" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexTargetAsset }}</el-descriptions-item>
          <el-descriptions-item label="买方" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ formatBuyOnDex(busDexCexTriangularRecord.buyOnDex) }}</el-descriptions-item>
          <el-descriptions-item label="交易时间" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ formatTime(busDexCexTriangularRecord.createdAt) }}</el-descriptions-item>
          <el-descriptions-item :column="1" label="交易结果" label-class-name="custom-bold-descriptions-label" content-class-name="custom-error-descriptions-content">
            <el-tag :type="busDexCexTriangularRecord.dexSuccess === '1' && busDexCexTriangularRecord.cexBuySuccess === '1' && busDexCexTriangularRecord.cexSellSuccess === '1' ? 'success' : 'danger'">
              {{ formatTradeStatus(busDexCexTriangularRecord.dexSuccess, busDexCexTriangularRecord.cexBuySuccess, busDexCexTriangularRecord.cexSellSuccess) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="busDexCexTriangularRecord.dexSuccess !== '1' || busDexCexTriangularRecord.cexBuySuccess !== '1' && busDexCexTriangularRecord.cexSellSuccess !== '1'" :column="1" label="失败信息" label-class-name="custom-error-descriptions-label" content-class-name="custom-error-descriptions-content">{{ busDexCexTriangularRecord.error }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <el-descriptions title="交易参数" :column="1">
          <el-descriptions-item label="Dex Pool Id" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.dexPoolId }}</el-descriptions-item>
          <el-descriptions-item label="Dex Pool Type" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.dexPoolType }}</el-descriptions-item>
          <el-descriptions-item label="Dex Priority Fee" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ formatNumber(busDexCexTriangularRecord.dexTxPriorityFee) }} SOL</el-descriptions-item>
          <el-descriptions-item label="Dex Jito Fee" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ formatNumber(busDexCexTriangularRecord.dexTxJitoFee) }} SOL</el-descriptions-item>
          <el-descriptions-item label="Dex Trader Address" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.dexTrader }}</el-descriptions-item>
          <el-descriptions-item label="Cex Account Id" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexAccountId }}</el-descriptions-item>
          <el-descriptions-item label="Cex Account Type" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexAccountType }}</el-descriptions-item>
          <el-descriptions-item label="Cex Exchange Type" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexExchangeType }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <div class="descriptions-container">
          <!-- DEX侧交易信息 -->
          <el-descriptions title="DEX侧套利预期" :column="1" class="descriptions-item expected">
            <el-descriptions-item label="交易数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoDexTargetAmount }}
              {{ busDexCexTriangularRecord.cexTargetAsset }}
            </el-descriptions-item>
            <el-descriptions-item label="SOL Amount" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoDexSolAmount }} SOL
            </el-descriptions-item>
          </el-descriptions>

          <!-- DEX侧成交信息 -->
          <el-descriptions title="DEX侧成交信息" :column="1" class="descriptions-item actual">
            <el-descriptions-item label="交易数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.dexTargetAmount }}
              {{ busDexCexTriangularRecord.dexTargetAmount !== '' ? busDexCexTriangularRecord.cexTargetAsset : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="SOL Amount" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.dexSolAmount }}
              {{ busDexCexTriangularRecord.dexSolAmount !== '' ? 'SOL' : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="交易手续费" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ formatNumber(busDexCexTriangularRecord.dexTxFee) }}
              {{ busDexCexTriangularRecord.dexTxFee !== '' ? 'SOL' : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="交易状态" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              <el-tag :type="busDexCexTriangularRecord.dexSuccess === '1' ? 'success' : 'danger'">
                {{ formatTradeStatus(busDexCexTriangularRecord.dexSuccess) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="交易签名" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              <!-- 省略中间部分 -->
              <el-tooltip class="item" effect="dark" :content="busDexCexTriangularRecord.dexTxSig" placement="top">
                <a
                  :href="'https://solscan.io/tx/' + busDexCexTriangularRecord.dexTxSig"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: #409EFF; text-decoration: underline; cursor: pointer;"
                >
                  {{ shortenTxSig(busDexCexTriangularRecord.dexTxSig) }}
                </a>
              </el-tooltip>
            </el-descriptions-item>
          </el-descriptions>

        </div>

        <div class="descriptions-container">
          <!-- CEX侧套利预期 -->
          <el-descriptions title="CEX侧套利预期" :column="1" class="descriptions-item expected">
            <el-descriptions-item label="卖出数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoCexSellQuantity }}
              {{ busDexCexTriangularRecord.buyOnDex === '0' ? 'SOL' : busDexCexTriangularRecord.cexTargetAsset }}
            </el-descriptions-item>
            <el-descriptions-item label="卖出金额" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoCexSellQuoteAmount }} {{ busDexCexTriangularRecord.cexQuoteAsset }}
            </el-descriptions-item>
            <el-descriptions-item label="买入数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoCexBuyQuantity }}
              {{ busDexCexTriangularRecord.buyOnDex === '1' ? 'SOL' : busDexCexTriangularRecord.cexTargetAsset }}
            </el-descriptions-item>
            <el-descriptions-item label="买入金额" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.oppoCexBuyQuoteAmount }} {{ busDexCexTriangularRecord.cexQuoteAsset }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- CEX侧成交信息 -->
          <el-descriptions title="CEX侧成交信息" :column="1" class="descriptions-item actual">
            <el-descriptions-item label="卖单ID" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexSellOrderId }}</el-descriptions-item>
            <el-descriptions-item label="卖出数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.cexSellQuantity }}
              {{ getSellQuantityUnit(busDexCexTriangularRecord) }}
            </el-descriptions-item>
            <el-descriptions-item label="卖出金额" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.cexSellQuoteAmount }}
              {{ busDexCexTriangularRecord.cexSellQuoteAmount !== '' ? busDexCexTriangularRecord.cexQuoteAsset : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="卖出手续费" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexSellFee }} {{ busDexCexTriangularRecord.cexSellFeeAsset }}</el-descriptions-item>
            <el-descriptions-item label="卖单状态" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              <el-tag :type="busDexCexTriangularRecord.cexSellSuccess === '1' ? 'success' : 'danger'">
                {{ formatTradeStatus(busDexCexTriangularRecord.cexSellSuccess) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="买单ID" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexBuyOrderId }}</el-descriptions-item>
            <el-descriptions-item label="买入数量" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.cexBuyQuantity }}
              {{ getBuyQuantityUnit(busDexCexTriangularRecord) }}
            </el-descriptions-item>
            <el-descriptions-item label="买入金额" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              {{ busDexCexTriangularRecord.cexBuyQuoteAmount }}
              {{ busDexCexTriangularRecord.cexBuyQuoteAmount !== '' ? busDexCexTriangularRecord.cexQuoteAsset : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="买入手续费" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">{{ busDexCexTriangularRecord.cexBuyFee }} {{ busDexCexTriangularRecord.cexBuyFeeAsset }}</el-descriptions-item>
            <el-descriptions-item label="买入状态" label-class-name="custom-descriptions-label" content-class-name="custom-descriptions-content">
              <el-tag :type="busDexCexTriangularRecord.cexBuySuccess === '1' ? 'success' : 'danger'">
                {{ formatTradeStatus(busDexCexTriangularRecord.cexBuySuccess) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="descriptions-container">
          <!-- 预期利润 -->
          <el-descriptions :column="1" class="descriptions-item expected">
            <el-descriptions-item label="预期利润" label-class-name="custom-bold-descriptions-label" content-class-name="custom-descriptions-content">
              {{ formatProfit(busDexCexTriangularRecord.oppoCexSellQuoteAmount, busDexCexTriangularRecord.oppoCexBuyQuoteAmount) }} {{ busDexCexTriangularRecord.cexQuoteAsset }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 成交利润 -->
          <el-descriptions v-if="busDexCexTriangularRecord.dexSuccess === '1' && busDexCexTriangularRecord.cexBuySuccess === '1' && busDexCexTriangularRecord.cexSellSuccess === '1'" :column="1" class="descriptions-item actual">
            <el-descriptions-item label="成交利润" label-class-name="custom-bold-descriptions-label" content-class-name="custom-descriptions-content">{{ formatProfit(busDexCexTriangularRecord.cexSellQuoteAmount, busDexCexTriangularRecord.cexBuyQuoteAmount) }} {{ busDexCexTriangularRecord.cexQuoteAsset }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="descriptions-container">
          <!-- 预期利润 -->
          <el-descriptions :column="1" class="descriptions-item expected">
            <el-descriptions-item label="预期利润比" label-class-name="custom-bold-descriptions-label" content-class-name="custom-descriptions-content">
              {{ formatProfitPercent(busDexCexTriangularRecord.oppoCexSellQuoteAmount, busDexCexTriangularRecord.oppoCexBuyQuoteAmount) }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 成交利润 -->
          <el-descriptions v-if="busDexCexTriangularRecord.dexSuccess === '1' && busDexCexTriangularRecord.cexBuySuccess === '1' && busDexCexTriangularRecord.cexSellSuccess === '1'" :column="1" class="descriptions-item actual">
            <el-descriptions-item label="成交利润比" label-class-name="custom-bold-descriptions-label" content-class-name="custom-descriptions-content">{{ formatProfitPercent(busDexCexTriangularRecord.cexSellQuoteAmount, busDexCexTriangularRecord.cexBuyQuoteAmount) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

    </template>
  </BasicLayout>
</template>

<script>
import { getStrategyDexCexTriangularArbitrageTrades } from '@/api/business/bus-dex-cex-triangular-arbitrage-trades'

export default {
  name: 'BusDexCexTradeDetail',
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
      busDexCexTriangularRecord: {},
      id: undefined // 详情id
    }
  },
  created() {
    const id = this.$route.params && this.$route.params.id
    this.id = id
    this.getTraderRecordDetail(id)
  },
  methods: {
    /** 查询参数列表 */
    getTraderRecordDetail(id) {
      this.loading = true
      getStrategyDexCexTriangularArbitrageTrades(id).then(response => {
        if (response.code === 200) { // 检查响应状态码
          this.busDexCexTriangularRecord = response.data
          this.id = response.data.id
          console.log('this.busDexCexTriangularRecord', this.busDexCexTriangularRecord)
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
    // 交易签名缩短显示
    shortenTxSig(sig) {
      if (!sig) return ''
      return sig.length > 15 ? sig.slice(0, 16) + '...' + sig.slice(-8) : sig
    },
    getSellQuantityUnit(record) {
      if (!record || record.cexSellQuantity === '') return '' // 先检查是否为空
      // 如果是dex 买入，那么cex卖出的应该是target，否则是 SOL
      // 如果是cex 买入，那么cex卖出的应该是SOL，否则是targetAsset
      return record.buyOnDex === '0' ? 'SOL' : record.cexTargetAsset
    },
    getBuyQuantityUnit(record) {
      if (!record || record.cexBuyQuantity === '') return '' // 先检查是否为空
      // 如果是dex 买入，那么cex买入的应该是SOL，否则是 targetAsset
      // 如果是cex 买入，那么cex买入的单位应该是targetAsset
      return record.buyOnDex === '0' ? record.cexTargetAsset : 'SOL'
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 格式化方法
    formatBuyOnDex(flag) {
      console.log('row.buyOnDex', flag)
      return flag === '1' ? 'DEX' : 'CEX'
    },
    formatTime(time) {
      console.log('row.createdAt', time)
      const date = new Date(time) // 将返回的 ISO 格式时间字符串转为 Date 对象
      const milliseconds = date.getMilliseconds().toString().padStart(3, '0') // 确保毫秒是 3 位数
      return `${date.toLocaleString()}.${milliseconds}`
    },
    formatProfit(sellAmount, buyAmount) {
      const cexSellQuoteAmount = parseFloat(sellAmount) || 0
      const cexBuyQuoteAmount = parseFloat(buyAmount) || 0
      console.log('cexSellQuoteAmount - cexBuyQuoteAmount', cexSellQuoteAmount - cexBuyQuoteAmount)
      return (cexSellQuoteAmount - cexBuyQuoteAmount)
    },
    formatProfitPercent(sellAmount, buyAmount) {
      const cexSellQuoteAmount = parseFloat(sellAmount) || 0
      const cexBuyQuoteAmount = parseFloat(buyAmount) || 0
      const profitPercent = ((cexSellQuoteAmount - cexBuyQuoteAmount) / cexBuyQuoteAmount) * 100
      return `${profitPercent.toFixed(2)}%`
    },

    formatTradeStatus(...statusList) {
      if (!statusList.length) {
        return '' // 或者默认值
      }

      // 检查是否所有状态都等于 '1'
      return statusList.every(status => status === '1') ? '成功' : '失败'
    },
    formatNumber(number) {
      if (number === null || number === undefined || number === '' || number === 0) {
        return '' // 或者其他默认值，例如 0
      }
      let numStr = number.toString()

      // 处理科学计数法
      if (numStr.includes('e')) {
        const [base, exponent] = numStr.split('e').map(Number)
        numStr = (base * Math.pow(10, exponent)).toFixed(20)
      }
      return Number(numStr)
    }
  }
}
</script>

<style>

/* Flexbox 容器 */
.descriptions-container {
  display: flex;
  justify-content: space-between; /* 控制子元素左右分布 */
  gap: 20px; /* 设置两个 Descriptions 之间的间距 */
}

/* 设置每个 Descriptions 的宽度 */
.descriptions-item {
  flex: 1; /* 每个 item 占据相同的宽度 */
  min-width: 0; /* 防止溢出 */
}

/* 预期数据样式 - 左侧 */
.expected {
  border-left: 5px solid #4db8ff; /* 左侧边框颜色 */
  padding: 15px;
}

/* 实际数据样式 - 右侧 */
.actual {
  border-left: 5px solid #32cd32; /* 左侧边框颜色 */
  padding: 15px;
}

.custom-descriptions-label {
  text-align: right !important; /* 右对齐 label */
  color: #484848;
  width: 140px;
  display: flex;
  align-items: center;
}

.custom-bold-descriptions-label {
  text-align: right !important; /* 右对齐 label */
  color: #484848;
  width: 140px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.custom-error-descriptions-label {
  text-align: right !important; /* 右对齐 label */
  color: #ba0000;
  width: 140px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.custom-descriptions-content {
  color: #111111; /* 修改内容的字体颜色 */
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.custom-error-descriptions-content {
  color: #ba0000; /* 修改内容的字体颜色 */
  margin-left: 20px;
  display: flex;
  align-items: center;
}
</style>
