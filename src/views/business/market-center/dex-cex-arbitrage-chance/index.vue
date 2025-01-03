
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px">
          <el-form-item label="交易对" prop="symbols">
            <el-select
              v-model="queryParams.symbols"
              placeholder="请选择交易对(多选)"
              clearable
              size="small"
              multiple
              style="width: 400px;"
            >
              <el-option
                v-for="symbol in symbolWatchList"
                :key="symbol.name"
                :value="symbol.name"
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
            <el-button type="primary" icon="el-icon-search" size="mini" style="margin-left: 300px;" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="busDexCexArbitrageChanceList">
          <el-table-column
            label="dex"
            align="center"
            prop="exchange1"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="cex"
            align="center"
            prop="exchange2"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易对"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="count"
            align="center"
            prop="count"
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

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">

            <el-form-item label="交易角色" prop="role">
              <el-input
                v-model="form.role"
                placeholder="交易角色"
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
import { listDexCexArbitrageChance } from '@/api/business/bus-dex-cex-triangular-arbitrage-record'

export default {
  name: 'BusTriangleOrdersRecord',
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
      // 日期范围
      dateRange: [],
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
      symbolWatchList: [
        { name: 'BTC/USDT', id: 'btc_usdt' },
        { name: 'ETH/USDT', id: 'eth_usdt' },
        { name: 'BNB/USDT', id: 'bnb_usdt' },
        { name: 'DOGE/USDT', id: 'doge_usdt' },
        { name: 'XRP/USDT', id: 'xrp_usdt' }
      ],
      // 查询参数
      queryParams: {
        symbols: [],
        minProfit: '',
        maxProfit: '',
        strategyInstanceId: '1'

      },

      pickerOptions: {
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {},
      busDexCexArbitrageChanceList: []
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
    this.getDicts('bus_trade_tif').then(response => {
      this.timeInForceOptions = response.data
    })
    this.getDicts('bus_order_role').then(response => {
      this.roleOptions = response.data
    })
    this.getDicts('bus_spot_order_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listDexCexArbitrageChance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexArbitrageChanceList = response.data
        this.loading = false
      }
      )
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        role: undefined,
        status: undefined,
        fees: undefined,
        feeAsset: undefined
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
    timeInForceFormat(row) {
      return this.selectDictLabel(this.timeInForceOptions, row.timeInForce)
    },
    roleFormat(row) {
      return this.selectDictLabel(this.roleOptions, row.role)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
