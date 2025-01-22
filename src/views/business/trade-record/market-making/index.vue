
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="120px">
          <el-form-item label="Client order id" prop="clientOrderId"><el-input
            v-model="queryParams.clientOrderId"
            placeholder="请输入Client order id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易所订单id" prop="exchangeOrderId"><el-input
            v-model="queryParams.exchangeOrderId"
            placeholder="请输入交易所订单号"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易对" prop="symbol"><el-input
            v-model="queryParams.symbol"
            placeholder="请输入"
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

        <el-table
          v-loading="loading"
          :data="gatemtMakerOrdersList"
          :expand-row-keys="expandRowKeys"
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
                <el-table-column prop="binanceLimitOrderSide" label="币安限价单方向" />
                <el-table-column prop="binanceLimitOrderPrice" label="币安限价单价格" />
                <el-table-column prop="binanceLimitOrderAmount" label="币安限价单数量" />
                <el-table-column prop="binanceLimitOrderSide" label="币安市价单方向" />
                <el-table-column prop="binanceLimitOrderAmount" label="币安市价单数量" />
                <el-table-column prop="binanceMarketOrderExecutedQuantity" label="币安市价单成交数量" />
                <el-table-column prop="binanceMarketOrderCummulativeQuoteQuantity" label="币安市场订单累计报价数量" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="OrderId"
            align="center"
            prop="clientOrderId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易对"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="订单方向"
            align="center"
            prop="orderSide"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="价格"
            align="center"
            prop="price"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="数量"
            align="center"
            prop="amount"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="mt订单ID"
            align="center"
            prop="exchangeOrderId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所订单创建时间"
            align="center"
            prop="localCreatedTime"
            :show-overflow-tooltip="true"
          />

        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 查看详情 -->
        <el-dialog :title="title" :visible.sync="showDetail" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <div slot="header">
              <h5>策略基础信息</h5>
              <el-form-item label="Client order id" prop="clientOrderId">
                <el-input
                  v-model="form.clientOrderId"
                  placeholder="Client order id"
                />
              </el-form-item>
              <el-form-item label="" prop="symbol">
                <el-input
                  v-model="form.symbol"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="orderSide">
                <el-input
                  v-model="form.orderSide"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="price">
                <el-input
                  v-model="form.price"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="amount">
                <el-input
                  v-model="form.amount"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="priceLevelUpdatedTime">
                <el-input
                  v-model="form.priceLevelUpdatedTime"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="priceLevelUpdatedAt">
                <el-input
                  v-model="form.priceLevelUpdatedAt"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="lowerAskPrice">
                <el-input
                  v-model="form.lowerAskPrice"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="higherBidPrice">
                <el-input
                  v-model="form.higherBidPrice"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="createdTime">
                <el-input
                  v-model="form.createdTime"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="elapseLocalTime">
                <el-input
                  v-model="form.elapseLocalTime"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="exchangeOrderId">
                <el-input
                  v-model="form.exchangeOrderId"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="exchangeOrderStatus">
                <el-input
                  v-model="form.exchangeOrderStatus"
                  placeholder=""
                />
              </el-form-item>
              <el-form-item label="" prop="exchangeOrderCreatedAt">
                <el-input
                  v-model="form.exchangeOrderCreatedAt"
                  placeholder=""
                />
              </el-form-item>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listGatemtMakerOrders } from '@/api/business/market-making/gatemt-maker-orders'
import {
  getGatemtMakerTradesByOrderId
} from '@/api/business/market-making/gatemt-maker-trades'
import row from 'element-ui/packages/row'

export default {
  name: 'GatemtMakerOrders',
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
      showDetail: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      gatemtMakerOrdersList: [],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {}
    }
  },
  computed: {
    row() {
      return row
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listGatemtMakerOrders(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.gatemtMakerOrdersList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    // 取消按钮
    cancel() {
      this.showDetail = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        clientOrderId: undefined,
        symbol: undefined,
        orderSide: undefined,
        price: undefined,
        amount: undefined,
        priceLevelUpdatedTime: undefined,
        priceLevelUpdatedAt: undefined,
        lowerAskPrice: undefined,
        higherBidPrice: undefined,
        createdTime: undefined,
        elapseLocalTime: undefined,
        exchangeOrderId: undefined,
        exchangeOrderStatus: undefined,
        exchangeOrderCreatedAt: undefined
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
    /** 查看详情操作 */
    handleExpand(row, expandedRows) {
      const id = row.id

      if (expandedRows.length) {
        this.expandRowKeys = [id] // 设置当前展开的行key
        if (!row.loadingDetails) {
          row.loadingDetails = true
          getGatemtMakerTradesByOrderId(row.clientOrderId).then(response => {
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
