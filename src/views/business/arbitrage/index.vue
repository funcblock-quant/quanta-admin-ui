<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card" style="display: flex; flex-direction: column; height: 100%;">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="套利id" prop="arbitrageId">
            <el-input
              v-model="queryParams.arbitrageId"
              placeholder="请输入套利id"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="策略名称" prop="strategyName">
            <el-input
              v-model="queryParams.strategyName"
              placeholder="请输入策略名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="合约类型" prop="contractType">
            <el-select
              v-model="queryParams.contractType"
              placeholder="套利记录表合约类型"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in contractTypeOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
            <el-form-item label="创建时间">
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
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div
          ref="table-container"
          style="flex: 1; overflow-y: auto; margin-bottom: 10px; height: 50vh;"
          @scroll="onTableScroll"
        >
          <el-table
            v-loading="loading"
            :data="busArbitrageRecordList"
            style="border-collapse: collapse;"
          >
            <el-table-column
              label="套利id"
              align="center"
              prop="arbitrageId"
              width="60"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="策略名称"
              align="center"
              prop="strategyName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
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
              label="合约类型"
              align="center"
              prop="contractType"
              :formatter="contractTypeFormat"
              width="100"
            >
              <template slot-scope="scope">
                {{ contractTypeFormat(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              label="已实现盈亏"
              align="center"
              prop="realizedPnl"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="预期盈亏"
              align="center"
              prop="expectPnl"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="预期收益率"
              align="center"
              prop="expectPnlPercent"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="开始时间"
              align="center"
              prop="startTimeStr"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="结束时间"
              align="center"
              prop="endTimeStr"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="套利单状态"
              align="center"
              prop="status"
              :formatter="statusFormat"
              width="100"
            >
              <template slot-scope="scope">
                {{ statusFormat(scope.row) }}
              </template>
            </el-table-column>

          </el-table>

        </div>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  listBusArbitrageRecord
} from '@/api/business/bus_arbitrage'

export default {
  name: 'BusArbitrageRecord',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: false,
      hasMore: true, // 是否还有更多数据
      isFirstLoad: true, // 标记是否是首次加载
      // 日期范围
      dateRange: [],
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
      busArbitrageRecordList: [],
      typeOptions: [], contractTypeOptions: [], statusOptions: [],
      pickerOptions: {
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        arbitrageId: undefined,
        strategyName: undefined,
        contractType: undefined,
        startTime: undefined,
        endTime: undefined,
        arbitrageIdOrder: 'desc'

      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        arbitrageId: [{ required: true, message: '套利记录id不能为空', trigger: 'blur' }],
        strategyName: [{ required: true, message: '策略名称不能为空', trigger: 'blur' }],
        contractType: [{ required: true, message: '合约类型不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_arbitrage_type').then(response => {
      this.typeOptions = response.data
    })
    this.getDicts('bus_arbitrage_contract_type').then(response => {
      this.contractTypeOptions = response.data
    })
    this.getDicts('bus_arbitrage_status').then(response => {
      this.statusOptions = response.data
    })
    // this.startAutoRefresh() // 开始定时刷新
  },
  methods: {
    /** 查询参数列表 */
    // 加载数据的方法
    getList() {
      if (this.loading || (!this.hasMore && !this.isFirstLoad)) return // 如果正在加载且没有更多数据，就不再请求

      this.queryParams.pageIndex = 1 // 搜索固定从第一页开始
      const oldList = [...this.busArbitrageRecordList] // 备份旧数据

      this.loading = true

      listBusArbitrageRecord(this.addDateRange(this.queryParams, this.dateRange))
        .then(response => {
          const { list, count } = response.data
          console.log('list len:' + list.length)
          if (list.length > 0) {
            this.busArbitrageRecordList = list // 替换为新数据
            this.total = count
          } else {
            this.$message.warning('未查询到符合条件的数据')
            this.busArbitrageRecordList = oldList // 请求失败或空数据还原旧数据
          }
        })
        .catch(() => {
          this.$message.error('请求失败，请稍后重试')
          this.busArbitrageRecordList = oldList
        })
        .finally(() => {
          this.loading = false // 结束加载状态
        })
    },

    // 监听滚动事件，判断是否滚动到底部
    onTableScroll(event) {
      const table = event.target

      // 判断是否接近底部且当前没有正在加载数据
      if (table.scrollHeight - table.scrollTop <= table.clientHeight + 10 && !this.loading) {
        this.getList() // 触发加载更多数据
      }
    },

    // // 启动定时刷新
    // startAutoRefresh() {
    //   setInterval(() => {
    //     this.queryParams.pageIndex = 1 // 强制刷新第一页
    //     this.busArbitrageRecordList = [] // 清空当前数据，重新加载
    //     this.getList()
    //   }, 1000) // 每5秒刷新一次数据
    // },

    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    typeFormat(row) {
      return this.selectDictLabel(this.typeOptions, row.type)
    },
    contractTypeFormat(row) {
      return this.selectDictLabel(this.contractTypeOptions, row.contractType)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },

    // 关系
    // 文件
    /** 搜索按钮操作 */
    handleQuery() {
      console.log('Before Query', this.queryParams.pageIndex, this.busArbitrageRecordList)
      this.queryParams.pageIndex = 1
      this.busArbitrageRecordList = [] // 清空表格数据
      this.getList()
      console.log('After Query', this.queryParams.pageIndex, this.busArbitrageRecordList)
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

