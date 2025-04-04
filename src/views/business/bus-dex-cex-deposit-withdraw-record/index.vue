
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="88px">
          <el-form-item label="订单类型" prop="orderType">
            <el-select
              v-model="queryParams.orderType"
              placeholder="请选择订单类型"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="orderType in orderTypeList"
                :key="orderType.value"
                :label="orderType.label"
                :value="orderType.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="uid" prop="cexUid">
            <el-input
              v-model="queryParams.cexUid"
              placeholder="请输入cex账户uid"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="CEX业务id" prop="cexOrderId">
            <el-input
              v-model="queryParams.cexOrderId"
              placeholder="请输入交易所充提业务id"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="链上hash" prop="txHash">
            <el-input
              v-model="queryParams.txHash"
              placeholder="请输入链上交易hash"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="充提币种" prop="symbol">
            <el-input
              v-model="queryParams.symbol"
              placeholder="请输入充提币种"
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

        <el-table v-loading="loading" :data="busDexCexDepositWithdrawRecordList">
          <el-table-column
            label="订单类型"
            align="center"
            prop="orderType"
            :show-overflow-tooltip="true"
            :formatter="formatOrderType"
          />
          <el-table-column
            label="充提币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="充提数量"
            align="center"
            prop="amount"
            :show-overflow-tooltip="true"
            :formatter="formatDecimal"
          />
          <el-table-column
            label="from地址"
            align="center"
            prop="fromAddress"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="to地址"
            align="center"
            prop="toAddress"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="cex账户uid"
            align="center"
            prop="cexUid"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所业务id"
            align="center"
            prop="cexOrderId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="链上hash"
            align="center"
            prop="txHash"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="手续费"
            align="center"
            prop="fee"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="手续费币种"
            align="center"
            prop="feeAsset"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="发起时间"
            align="center"
            prop="startTime"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.startTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="完成时间"
            align="center"
            prop="finishTime"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.finishTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            align="center"
            prop="status"
            :show-overflow-tooltip="true"
            :formatter="formatStatus"
          />
          <el-table-column
            label="备注"
            align="center"
            prop="remark"
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
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listBusDexCexDepositWithdrawRecord } from '@/api/business/bus-dex-cex-deposit-withdraw-record'
import { formatDecimal } from '@/utils'

export default {
  name: 'BusDexCexDepositWithdrawRecord',
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
      busDexCexDepositWithdrawRecordList: [],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        orderType: undefined,
        fromAddress: undefined,
        toAddress: undefined,
        cexUid: undefined,
        cexOrderId: undefined,
        txHash: undefined,
        symbol: undefined,
        idOrder: 'desc'
      },
      // 表单参数
      form: {
      },
      orderTypeList: [
        { 'label': '提现', 'value': '-1' },
        { 'label': '充值', 'value': '1' }
      ],
      orderStatus: [
        { 'label': '初始化', 'value': '0' },
        { 'label': '处理中', 'value': '1' },
        { 'label': '成功', 'value': '2' },
        { 'label': '失败', 'value': '3' },
        { 'label': '未知状态', 'value': '4' }
      ],
      // 表单校验
      rules: { orderType: [{ required: true, message: '订单类型不能为空', trigger: 'blur' }],
        cexUid: [{ required: true, message: 'cex账户uid不能为空', trigger: 'blur' }],
        cexOrderId: [{ required: true, message: '交易所充提业务id不能为空', trigger: 'blur' }],
        txHash: [{ required: true, message: '链上交易hash不能为空', trigger: 'blur' }],
        symbol: [{ required: true, message: '充提币种不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    formatDecimal,
    getList() {
      this.loading = true
      listBusDexCexDepositWithdrawRecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexDepositWithdrawRecordList = response.data.list
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
    formatOrderType(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      this.orderTypeList.forEach(item => {
        if (item.value === cellValue) {
          cellValue = item.label
        }
      })
      return cellValue
    },
    formatStatus(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      this.orderStatus.forEach(item => {
        if (item.value === cellValue) {
          cellValue = item.label
        }
      })
      return cellValue
    }
  }
}
</script>
