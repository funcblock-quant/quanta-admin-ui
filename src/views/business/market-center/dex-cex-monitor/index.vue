
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="交易对" prop="symbols">
            <el-select
              v-model="queryParams.symbol"
              placeholder="请选择交易对(多选)"
              clearable
              size="small"
              style="width: 400px;"
            >
              <el-option
                v-for="symbol in symbolWatchList"
                :key="symbol.symbol"
                :value="symbol.symbol"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busDexCexMonitor:list']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleBatchAdd"
            >新增
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busDexCexTriangularObserverList">
          <el-table-column
            label="观察币种"
            align="center"
            prop="symbol"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所"
            align="center"
            prop="exchangeType"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所Taker Fee"
            align="center"
            prop="takerFee"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Slippage Bps"
            align="center"
            prop="slippageBps"
            :show-overflow-tooltip="true"
            :formatter="formatSlippage"
          />
          <el-table-column
            label="Amm Pool"
            align="center"
            prop="ammPoolId"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Base Token"
            align="center"
            prop="baseTokenMint"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Base Profit"
            align="center"
            prop="baseProfit"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Quote Token"
            align="center"
            prop="quoteTokenMint"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Quote Profit"
            align="center"
            prop="quoteProfit"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-popconfirm
                class="delete-popconfirm"
                title="确认要删除吗?"
                confirm-button-text="删除"
                @confirm="handleDelete(scope.row)"
              >
                <el-button
                  slot="reference"
                  v-permisaction="['business:busDexCexMonitor:list']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                >删除
                </el-button>
              </el-popconfirm>
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

        <el-dialog :title="title" :visible.sync="batchOpen" width="800px">
          <el-form ref="batchForm" :model="batchForm" :rules="rules" label-width="150px">

            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>
              </div>
              <el-form-item label="观察币种列表" prop="symbols">
                <el-input
                  v-model="batchForm.symbols"
                  placeholder="请输入交易币种"
                />
              </el-form-item>
            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>AMM监控配置</h5>
              </div>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="AMM池合约地址" prop="ammPool">
                    <el-input
                      v-model="batchForm.ammPool"
                      placeholder="请输入AMM合约地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Base Token地址" prop="baseTokenMint">
                    <el-input
                      v-model="batchForm.baseTokenMint"
                      placeholder="请输入Base Token地址"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="1.5">
                  <el-form-item label="Base Token精度" prop="baseTokenDecimals">
                    <el-input
                      v-model="batchForm.baseTokenDecimals"
                      placeholder="请输入Base Token精度"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Quote Token地址" prop="quoteTokenMint">
                    <el-input
                      v-model="batchForm.quoteTokenMint"
                      placeholder="请输入Quote Token地址"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="1.5">
                  <el-form-item label="Quote Token精度" prop="quoteTokenDecimals">
                    <el-input
                      v-model="batchForm.quoteTokenDecimals"
                      placeholder="请输入Quote Token精度"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20" class="mb8">
                <el-form-item label="指定滑点BPS" prop="slippage">
                  <el-slider
                    v-model="batchForm.slippage"
                    show-input
                    step="0.01"
                    :precision="2"
                  >
                    <template slot="append">%</template>
                  </el-slider>
                </el-form-item>

              </el-row>

            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>Amber监控配置</h5>
              </div>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="交易所" prop="exchangeType">
                    <el-select
                      v-model="batchForm.exchangeType"
                      placeholder="请选择交易所"
                      clearable
                      size="small"
                      style="width: 400px;"
                    >
                      <el-option
                        v-for="symbol in exchangeType"
                        :key="symbol.value"
                        :value="symbol.value"
                      />

                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-form-item label="Volume" prop="volume">
                  <el-input
                    v-model="batchForm.volume"
                    placeholder="请输入交易volume"
                  />
                </el-form-item>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-form-item label="Taker Fee" prop="takerFee">
                  <el-input
                    v-model="batchForm.takerFee"
                    placeholder="请输入交易所taker fee"
                  />
                </el-form-item>
              </el-row>
            </el-card>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitBatchForm">确定</el-button>
            <el-button @click="batchOpen = false">取消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  batchAddBusDexCexTriangularObserver,
  delBusDexCexTriangularObserver,
  getBusDexCexTriangularObserver,
  listBusDexCexTriangularObserver, listBusDexCexTriangularSymbolList
} from '@/api/business/bus-dex-cex-triangular-observer'

export default {
  name: 'BusDexCexTriangularObserver',
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
      // 批量添加弹出层
      batchOpen: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      busDexCexTriangularObserverList: [],
      // 观察币对列表
      symbolWatchList: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        symbols: []

      },

      // 表单参数
      form: {
      },
      batchForm: {
        symbol: [],
        ammPool: undefined,
        baseTokenMint: undefined,
        quoteTokenMint: undefined,
        baseTokenDecimals: undefined,
        quoteTokenDecimals: undefined,
        slippage: undefined,
        volume: undefined,
        exchangeType: undefined,
        takerFee: undefined
      },
      exchangeType: [
        { key: 'Binance', value: 'Binance' },
        { key: 'OKX', value: 'OKX' },
        { key: 'GateIO', value: 'GateIO' }
      ],

      // 表单校验
      rules: {
        symbols: [{ required: true, message: '至少指定一个观察币种', trigger: 'blur' }],
        ammPool: [{ required: true, message: 'ammPool不能为空', trigger: 'blur' }],
        baseTokenMint: [{ required: true, message: 'base token的地址不能为空', trigger: 'blur' }],
        baseTokenDecimals: [{ required: true, message: 'base token的精度不能为空', trigger: 'blur' }],
        quoteTokenMint: [{ required: true, message: 'quote token的地址不能为空', trigger: 'blur' }],
        quoteTokenDecimals: [{ required: true, message: 'quote token的精度不能为空', trigger: 'blur' }],
        slippage: [{ required: true, message: '请设置滑点', trigger: 'blur' }],
        volume: [{ required: true, message: '请设置交易金额', trigger: 'blur' }],
        takerFee: [{ required: true, message: '请设置交易所taker手续费', trigger: 'blur' }],
        exchangeType: [{ required: true, message: '请选择交易所', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getSymbolWatchList()
    this.startTimer()
  },
  mounted() {
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('blur', this.handleBlur)
  },
  beforeDestroy() {
    this.clearTimer() // 组件销毁前清除定时器
    window.removeEventListener('focus', this.handleFocus)
    window.removeEventListener('blur', this.handleBlur)
  },

  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      console.log('this.queryParams', this.queryParams)
      listBusDexCexTriangularObserver(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        if (response.code === 200) { // 检查响应状态码
          // 正确的做法是替换整个数组，而不是修改数组的引用
          this.busDexCexTriangularObserverList = response.data.list
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
    /** 查询观察币种 */
    getSymbolWatchList() {
      this.loading = true
      listBusDexCexTriangularSymbolList().then(response => {
        this.symbolWatchList = response.data
        this.loading = false
        console.log(this.symbolWatchList)
      }
      )
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer) // 如果定时器已存在，先清除
      }
      this.timer = setInterval(() => {
        this.getList()
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
    handleBatchAdd() {
      this.reset()
      this.batchOpen = true
      this.title = '添加链上链下三角套利观察'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
        row.id || this.ids
      getBusDexCexTriangularObserver(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改链上链下三角套利观察'
        this.isEdit = true
      })
    },
    // 提交批量添加
    submitBatchForm() {
      const symbolsArray = [this.batchForm.symbols]

      this.batchForm.takerFee = Number(this.batchForm.takerFee)
      this.batchForm.volume = Number(this.batchForm.volume)
      this.batchForm.slippage = (this.batchForm.slippage * 10000).toString()
      console.log('this.batchForm.takerFee', this.batchForm.takerFee)
      // 构造请求数据
      this.batchForm.symbolsArray = symbolsArray

      // 批量请求
      batchAddBusDexCexTriangularObserver(this.batchForm).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.batchOpen = false
          this.batchForm = []
          this.getList()
        } else {
          this.msgError(res.msg)
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = row.id

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusDexCexTriangularObserver({ 'ids': Ids, 'observerId': row.observerId })
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
    formatSlippage(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue) / 100
      return slippage.toFixed(2).toString() + '%' // 保留四位小数，根据需要调整
    },
    formatProfit(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue)
      return slippage.toFixed(6).toString() // 保留四位小数，根据需要调整
    }
  }
}
</script>
