
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="交易对" prop="symbols">
            <el-select
              v-model="queryParams.symbol"
              placeholder="请选择交易对"
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

        <el-table v-loading="loading" :data="busDexCexTriangularObserverList" class="table-container" style="width: 100%;">
          <el-table-column
            label="TargetToken"
            width="100"
            align="center"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <router-link :to="{name:'BusDexCexMonitorDetail', params: {id:scope.row.id, instanceId: scope.row.instanceId}}" class="link-type">
                <span>{{ scope.row.targetToken }}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column
            label="QuoteToken"
            width="100"
            align="center"
            prop="quoteToken"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="CEX"
            align="center"
            width="100"
            prop="exchangeType"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Dex"
            width="150"
            align="center"
            prop="dexType"
            :show-overflow-tooltip="true"
            :formatter="formatDexType"
          />
          <el-table-column
            label="Sol交易数量"
            width="160"
            align="center"
            prop="volume"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div v-if="!scope.row.isEditing">
                {{ scope.row.volume }}
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  type="text"
                  @click="startEditing(scope.row)"
                />
              </div>

              <div v-else class="edit-container">
                <el-input
                  v-model="scope.row.newVolume"
                  size="mini"
                  style="width: 60px"
                />
                <el-button
                  icon="el-icon-check"
                  size="mini"
                  type="text"
                  :disabled="scope.row.isUpdating"
                  @click="confirmVolume(scope.row)"
                />
                <el-button
                  icon="el-icon-close"
                  size="mini"
                  type="text"
                  :disabled="scope.row.isUpdating"
                  @click="cancelEditing(scope.row)"
                />
                <i v-if="scope.row.isUpdating" class="el-icon-loading" />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="Dex Buy Price"
            width="150"
            align="center"
            prop="dexBuyPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Cex Sell Price"
            width="150"
            align="center"
            prop="cexSellPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Dex买入价差"
            width="150"
            align="center"
            prop="dexBuyDiffPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Dex Buy Profit"
            width="150"
            align="center"
            prop="profitOfBuyOnDex"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Dex Sell Price"
            width="150"
            align="center"
            prop="dexSellPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Cex Buy Price"
            width="150"
            align="center"
            prop="cexBuyPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Dex卖出价差"
            width="150"
            align="center"
            prop="dexSellDiffPrice"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="Dex Sell Profit"
            width="150"
            align="center"
            prop="profitOfSellOnDex"
            :show-overflow-tooltip="true"
            :formatter="formatProfit"
          />
          <el-table-column
            label="交易所Taker Fee"
            width="100"
            align="center"
            prop="takerFee"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="TokenMint"
            width="150"
            align="center"
            prop="tokenMint"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Amm Pool"
            width="150"
            align="center"
            prop="ammPoolId"
            :show-overflow-tooltip="true"
          />

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="260">
            <template slot-scope="scope">
              <div class="action-buttons">
                <el-button
                  v-if="!scope.row.isTrading"
                  size="mini"
                  type="primary"
                  icon="el-icon-caret-right"
                  @click="openStartTradeDialog(scope.row)"
                >启动交易</el-button>

                <!-- 暂停交易 -->
                <el-popconfirm
                  v-if="scope.row.isTrading"
                  title="确认暂停交易吗？"
                  confirm-button-text="暂停"
                  @confirm="pauseTrader(scope.row)"
                >
                  <el-button
                    slot="reference"
                    size="mini"
                    type="danger"
                    icon="el-icon-video-pause"
                  >暂停交易</el-button>
                </el-popconfirm>
                <el-button
                  v-if="scope.row.isTrading"
                  slot="reference"
                  type="text"
                  size="mini"
                  icon="el-icon-edit"
                  @click="handleTradeParamsUpdate(scope.row)"
                >修改交易参数
                </el-button>
                <el-popconfirm
                  class="delete-popconfirm"
                  title="确认要删除吗?"
                  confirm-button-text="删除"
                  @confirm="handleDelete(scope.row)"
                >
                  <el-button
                    slot="reference"
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                  >删除
                  </el-button>
                </el-popconfirm>
              </div>
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

        <!-- 启动交易表单弹窗 -->
        <el-dialog title="启动交易参数设置" :visible.sync="showStartDialog" width="600px">
          <el-form :model="startTraderFormData" label-width="150px">
            <el-row :gutter="20" class="mb8">
              <el-form-item label="指定滑点BPS" prop="slippage">
                <el-slider
                  v-model="startTraderFormData.slippage"
                  show-input
                  step="0.01"
                  :precision="2"
                  :max="5"
                >
                  <template slot="append">%</template>
                </el-slider>
              </el-form-item>
            </el-row>
            <el-form-item :label="minProfitLabel">
              <el-input v-model="startTraderFormData.minProfit" placeholder="请输入预期最低收益" />
            </el-form-item>
            <el-form-item label="Priority Fee(SOL)">
              <el-input v-model="startTraderFormData.priorityFee" placeholder="请指定优先费" />
            </el-form-item>
            <el-form-item label="Jito Fee(SOL)">
              <el-input v-model="startTraderFormData.jitoFee" placeholder="请指定jito手续费" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="showStartDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmStartTrade">确定</el-button>
          </div>
        </el-dialog>

        <!-- 修改交易表单弹窗 -->
        <el-dialog title="修改交易参数设置" :visible.sync="showEditTraderDialog" width="600px">
          <el-form :model="startTraderFormData" label-width="150px">
            <el-row :gutter="20" class="mb8">
              <el-form-item label="指定滑点BPS" prop="slippage">
                <el-slider
                  v-model="startTraderFormData.slippage"
                  show-input
                  step="0.01"
                  :precision="2"
                  :max="5"
                >
                  <template slot="append">%</template>
                </el-slider>
              </el-form-item>
            </el-row>
            <el-form-item :label="minProfitLabel">
              <el-input v-model="startTraderFormData.minProfit" placeholder="请输入预期最低收益" />
            </el-form-item>
            <el-form-item label="Priority Fee(SOL)">
              <el-input v-model="startTraderFormData.priorityFee" placeholder="请指定优先费" />
            </el-form-item>
            <el-form-item label="Jito Fee(SOL)">
              <el-input v-model="startTraderFormData.jitoFee" placeholder="请指定jito手续费" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="showEditTraderDialog = false">取消</el-button>
            <el-button type="primary" @click="updateTraderParams">确定</el-button>
          </div>
        </el-dialog>

        <el-dialog :title="title" :visible.sync="batchOpen" width="800px">
          <el-form ref="batchForm" :model="batchForm" :rules="rules" label-width="150px">

            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>
              </div>
              <el-form-item label="Target Token" prop="targetToken">
                <el-input
                  v-model="batchForm.targetToken"
                  placeholder="请输入Target Token"
                />
              </el-form-item>
              <el-form-item label="Quote Token" prop="quoteToken">
                <el-input
                  v-model="batchForm.quoteToken"
                  placeholder="请输入Quote Token"
                />
              </el-form-item>
            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>DEX配置</h5>
              </div>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Market地址" prop="ammPool">
                    <el-input
                      v-model="batchForm.ammPool"
                      placeholder="请输入Market地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Token 地址" prop="tokenMint">
                    <el-input
                      v-model="batchForm.tokenMint"
                      placeholder="请输入Base Token地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Dex Type" prop="dexType">
                    <el-select
                      v-model="batchForm.dexType"
                      placeholder="请选择Dex类型"
                      clearable
                      size="small"
                      style="width: 400px;"
                    >
                      <el-option
                        v-for="dex in dexTypeList"
                        :key="dex.key"
                        :value="dex.key"
                        :label="dex.label"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>Amber配置</h5>
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
                <el-form-item label="SOL Amount" prop="volume">
                  <el-input
                    v-model="batchForm.volume"
                    placeholder="请输入交易SOL Amount"
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
  busDexCexTriangularStartTrader,
  busDexCexTriangularStopTrader, busDexCexTriangularUpdateObserver,
  busDexCexTriangularUpdateTrader,
  delBusDexCexTriangularObserver,
  getBusDexCexTriangularObserver,
  listBusDexCexTriangularObserver,
  listBusDexCexTriangularSymbolList
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
      // 记录操作行
      operationRow: undefined,
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
        symbols: [],
        targetToken: [],
        quoteToken: undefined,
        ammPool: undefined,
        tokenMint: undefined,
        slippage: undefined,
        volume: undefined,
        exchangeType: undefined,
        dexType: undefined,
        takerFee: undefined
      },
      exchangeType: [
        { key: 'Binance', value: 'Binance' },
        { key: 'OKX', value: 'OKX' },
        { key: 'GateIO', value: 'GateIO' }
      ],
      dexTypeList: [
        { key: 'RAY_AMM', label: 'Raydium Liquidity Pool V4' },
        { key: 'RAY_CLMM', label: 'Raydium Centralized Liquidity' }
      ],

      showStartDialog: false, // 控制启动trader表单弹窗显示
      showEditTraderDialog: false, // 控制编辑trader参数的弹窗显示
      currentRow: null, // 当前选中的行数据
      startTraderFormData: {
        instanceId: undefined,
        minProfit: '',
        slippage: '',
        priorityFee: '',
        jitoFee: ''
      },
      originalVolume: {}, // 记录原始值，方便取消恢复

      // 表单校验
      rules: {
        targetToken: [{ required: true, message: '至少指定一个Target Token', trigger: 'blur' }],
        quoteToken: [{ required: true, message: '至少指定一个Quote Token', trigger: 'blur' }],
        ammPool: [{ required: true, message: 'ammPool不能为空', trigger: 'blur' }],
        slippage: [{ required: true, message: '请设置滑点', trigger: 'blur' }],
        volume: [{ required: true, message: '请设置交易金额', trigger: 'blur' }],
        takerFee: [{ required: true, message: '请设置交易所taker手续费', trigger: 'blur' }],
        exchangeType: [{ required: true, message: '请选择交易所', trigger: 'blur' }]
      }
    }
  },
  computed: {
    minProfitLabel() {
      return `Min Profit (${this.selectedRow?.quoteToken || 'USDT'})`
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
      const targetTokenArray = [this.batchForm.targetToken]

      const requestData = { ...this.batchForm }
      requestData.takerFee = Number(requestData.takerFee)
      requestData.volume = Number(requestData.volume)

      requestData.targetToken = targetTokenArray

      // 批量请求
      batchAddBusDexCexTriangularObserver(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.batchOpen = false
          this.batchForm = []
          this.getList()
        } else {
          this.msgError(res.msg)
          this.batchOpen = false
          this.batchForm = []
          this.getList()
        }
      })
    },

    // 打开启动交易表单
    openStartTradeDialog(row) {
      this.currentRow = row
      this.resetStartTraderFormData()
      this.showStartDialog = true
    },

    // 打开修改交易参数表单
    handleTradeParamsUpdate(row) {
      console.log('this row', row)
      this.startTraderFormData = {
        instanceId: row.instanceId,
        minProfit: row.minProfit,
        slippage: parseFloat(row.slippage) / 100,
        priorityFee: row.priorityFee / 1_000_000_000,
        jitoFee: row.jitoFee / 1_000_000_000
      }
      this.showEditTraderDialog = true
    },

    // 重置表单数据
    resetStartTraderFormData() {
      this.startTraderFormData = {
        instanceId: undefined,
        minProfit: '',
        slippage: '',
        priorityFee: '',
        jitoFee: ''
      }
    },

    // 确认启动交易
    confirmStartTrade() {
      const requestData = { ...this.startTraderFormData }
      requestData.instanceId = this.currentRow.instanceId
      requestData.minProfit = Number(requestData.minProfit)
      requestData.priorityFee = Number(requestData.priorityFee)
      requestData.jitoFee = Number(requestData.jitoFee)
      requestData.slippage = (requestData.slippage * 100).toString() // 只在副本上乘以 100
      console.log('this.requestData', requestData)

      busDexCexTriangularStartTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
        }
        this.showStartDialog = false
      })
    },

    // 确认更新交易参数
    updateTraderParams() {
      const requestData = { ...this.startTraderFormData }
      requestData.slippage = (requestData.slippage * 100).toString() // 只在副本上乘以 100
      requestData.minProfit = Number(requestData.minProfit)
      requestData.priorityFee = Number(requestData.priorityFee)
      requestData.jitoFee = Number(requestData.jitoFee)

      busDexCexTriangularUpdateTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
        }
      })
      this.showEditTraderDialog = false
    },

    // 暂停交易
    pauseTrader(row) {
      console.log('暂停交易:', row)
      const requestData = {
        instanceId: row.instanceId
      }
      busDexCexTriangularStopTrader(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
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
        return delBusDexCexTriangularObserver({ 'ids': Ids, 'instanceId': row.instanceId })
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
    // 进入sol_amount的编辑模式
    startEditing(row) {
      this.originalVolume[row.id] = row.volume
      this.clearTimer()
      this.$set(row, 'isEditing', true)
      this.$set(row, 'newVolume', row.volume)
    },
    confirmVolume(row) {
      const newValue = Number(row.newVolume)
      if (isNaN(newValue) || newValue <= 0) {
        this.$message.error('请输入有效的数字')
        return
      }
      row.isUpdating = true
      const requestData = {
        instanceId: row.instanceId,
        solAmount: newValue
      }
      busDexCexTriangularUpdateObserver(requestData).then(res => {
        if (res.code === 200) {
          this.msgSuccess(res.msg)
          this.getList()
        } else {
          this.msgError(res.msg)
          this.getList()
        }
        row.isEditing = false
        row.isUpdating = false
        this.startTimer()
      })
    },
    // 取消编辑
    cancelEditing(row) {
      row.volume = this.originalVolume[row.id]
      row.isEditing = false
      this.startTimer()
    },

    formatSlippage(cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue) / 100
      return slippage.toFixed(2).toString() // 保留四位小数，根据需要调整
    },
    formatProfit(row, column, cellValue, index) {
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return '' // 或者其他默认值，例如 0
      }
      const slippage = Number(cellValue)
      return slippage.toFixed(6).toString() + ' ' + row.quoteToken // 保留四位小数，根据需要调整
    },
    formatDexType(row) {
      const match = this.dexTypeList.find(item => item.key === row.dexType)
      return match ? match.label : row.dexType // 如果匹配不到，就显示原始值
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
.action-buttons {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
  white-space: nowrap; /* 防止按钮换行 */
  align-items: center;
}
</style>
