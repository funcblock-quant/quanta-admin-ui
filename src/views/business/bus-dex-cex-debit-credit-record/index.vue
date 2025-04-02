
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="交易所" prop="exchangeType">
            <el-select
              v-model="queryParams.exchangeType"
              placeholder="请选择交易所"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="exchangeType in exchangeTypeList"
                :key="exchangeType.value"
                :label="exchangeType.label"
                :value="exchangeType.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="uid" prop="uid">
            <el-input
              v-model="queryParams.uid"
              placeholder="请输入交易所账户uid"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />

          </el-form-item>
          <el-form-item label="类型" prop="debitType">
            <el-select
              v-model="queryParams.debitType"
              placeholder="请选择类型"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="debitType in debitTypeList"
                :key="debitType.value"
                :label="debitType.label"
                :value="debitType.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              size="small"
              style="width: 200px;"
            >
              <el-option
                v-for="debitStatus in debitStatusList"
                :key="debitStatus.value"
                :label="debitStatus.label"
                :value="debitStatus.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="busDexCexDebitCreditRecordList">
          <el-table-column
            label="类型"
            align="center"
            prop="debitType"
            :show-overflow-tooltip="true"
            :formatter="formatDebitType"
          />
          <el-table-column
            label="借贷币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="借还贷数量"
            align="center"
            prop="amount"
            :show-overflow-tooltip="true"
            :formatter="formatAmount"
          />
          <el-table-column
            label="交易所"
            align="center"
            prop="exchangeType"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所账户名称"
            align="center"
            prop="accountName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所账户uid"
            align="center"
            prop="uid"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="状态"
            align="center"
            prop="status"
            :show-overflow-tooltip="true"
            :formatter="formatDebitStatus"
          />
          <el-table-column
            label="发起时间"
            align="center"
            prop="createdAt"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createdAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="完成时间"
            align="center"
            prop="updatedAt"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updatedAt) }}</span>
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
import { listBusDexCexDebitCreditRecord } from '@/api/business/bus-dex-cex-debit-credit-record'

export default {
  name: 'BusDexCexDebitCreditRecord',
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
      busDexCexDebitCreditRecordList: [],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        accountName: undefined,
        uid: undefined,
        exchangeType: undefined,
        debitType: undefined,
        status: undefined,
        idOrder: 'desc'
      },
      // 表单参数
      form: {
      },
      exchangeTypeList: [
        { 'label': 'Binance', 'value': 'Binance' },
        { 'label': 'Gate', 'value': 'Gate' }
      ],
      debitTypeList: [
        { 'label': '借贷', 'value': '1' },
        { 'label': '还贷', 'value': '0' }
      ],
      debitStatusList: [
        { 'label': '处理中', 'value': '0' },
        { 'label': '成功', 'value': '1' },
        { 'label': '失败', 'value': '-1' }
      ],

      // 表单校验
      rules: { uid: [{ required: true, message: '交易所账户uid不能为空', trigger: 'blur' }],
        exchangeType: [{ required: true, message: '交易所不能为空', trigger: 'blur' }],
        debitType: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusDexCexDebitCreditRecord(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busDexCexDebitCreditRecordList = response.data.list
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
    formatDebitType(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      this.debitTypeList.forEach(item => {
        if (item.value === cellValue) {
          cellValue = item.label
        }
      })
      return cellValue
    },
    formatDebitStatus(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '' // 或者其他默认值，例如 0
      }
      this.debitStatusList.forEach(item => {
        if (item.value === cellValue) {
          cellValue = item.label
        }
      })
      return cellValue
    },
    formatAmount(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 0) {
        return '0.000000' // 或者其他默认值，例如 0
      }
      // 将 cellValue 转换为数字，并保留 6 位小数
      const formattedValue = parseFloat(cellValue).toFixed(6)

      // 如果转换失败（例如，cellValue 不是数字），则返回原始值
      if (isNaN(formattedValue)) {
        return cellValue
      }
      return formattedValue
    }
  }
}
</script>
