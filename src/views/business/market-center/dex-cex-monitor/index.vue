
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
              <router-link :to="{name:'BusDexCexMonitorDetail', params: {id:scope.row.id}}" class="link-type">
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
            label="DEX"
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
              {{ scope.row.minSolAmount }} - {{ scope.row.maxSolAmount }}
            </template>
          </el-table-column>
          <el-table-column label="DEX买入CEX卖出" align="center">
            <el-table-column
              label="CEX卖价"
              width="150"
              align="center"
              prop="cexSellPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="DEX买价"
              width="150"
              align="center"
              prop="dexBuyPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="价差"
              width="150"
              align="center"
              prop="dexBuyDiffPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="利润"
              width="150"
              align="center"
              prop="profitOfBuyOnDex"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
          </el-table-column>

          <el-table-column label="DEX卖出CEX买入" align="center">
            <el-table-column
              label="CEX买价"
              width="150"
              align="center"
              prop="cexBuyPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="DEX卖价"
              width="150"
              align="center"
              prop="dexSellPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="价差"
              width="150"
              align="center"
              prop="dexSellDiffPrice"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
            <el-table-column
              label="利润"
              width="150"
              align="center"
              prop="profitOfSellOnDex"
              :show-overflow-tooltip="true"
              :formatter="formatProfit"
            />
          </el-table-column>

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="260">
            <template slot-scope="scope">
              <div class="action-buttons">
                <!-- 交易已开启，显示暂停交易和修改交易参数 -->
                <template v-if="scope.row.isTrading">
                  <el-popconfirm
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
                </template>
                <!-- 交易未开启，并且 status = 2（水位调节中），显示一个禁用的按钮 -->
                <el-button
                  v-else-if="scope.row.status === '2'"
                  size="mini"
                  type="info"
                  style="color: #606266; background-color: #f5f7fa; border-color: #dcdfe6;"
                  disabled
                >
                  ⏳ 水位调节中
                </el-button>

                <!-- 交易未开启，并且 status = 1（可启动交易），显示启动交易按钮 -->
                <el-button
                  v-else-if="scope.row.status === '1'"
                  size="mini"
                  type="primary"
                  icon="el-icon-caret-right"
                  @click="openStartTradeDialog(scope.row)"
                >启动交易</el-button>

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
          <!-- 说明区域 -->
          <el-alert type="info" show-icon :closable="false">
            交易启动流程：
            <ul>
              <li>先启动水位调节，确保资金池中的水位达到设定要求。</li>
              <li>当水位达到交易条件后，才会正式开启交易功能。</li>
              <li>交易过程中当资金超出水位阈值，可能触发告警和交易功能暂停</li>
            </ul>
          </el-alert>

          <el-form :model="startTraderFormData" label-width="150px">
            <!-- 水位调节参数 -->
            <h3 style="margin-top: 50px; margin-bottom: 10px;">水位调节参数</h3>
            <el-form-item label="最低预警余额" class="mb16">
              <el-input v-model="startTraderFormData.alertThreshold" placeholder="请输入最低预警余额" />
            </el-form-item>
            <el-form-item label="低水位触发余额" class="mb16">
              <el-input v-model="startTraderFormData.buyTriggerThreshold" placeholder="请输入低水位触发余额" />
            </el-form-item>
            <el-form-item label="低水位调节目标余额" class="mb16">
              <el-input v-model="startTraderFormData.targetBalanceThreshold" placeholder="请输入低水位调节目标余额" />
            </el-form-item>
            <el-form-item label="高水位触发余额" class="mb16">
              <el-input v-model="startTraderFormData.sellTriggerThreshold" placeholder="请输入高水位触发余额" />
            </el-form-item>

            <!-- 交易参数 -->
            <h3 style="margin-top: 30px; margin-bottom: 10px;">交易参数</h3>
            <el-form-item label="指定滑点BPS" prop="slippage" class="mb16">
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
              <el-form-item label="Min SOL Amount" prop="minSolAmount">
                <el-input
                  v-model="startTraderFormData.minSolAmount"
                  placeholder="请输入最小交易量"
                />
              </el-form-item>
              <el-form-item label="Max SOL Amount" prop="maxSolAmount">
                <el-input
                  v-model="startTraderFormData.maxSolAmount"
                  placeholder="请输入最大交易量"
                />
              </el-form-item>
              <el-form-item label="Min Profit" prop="minProfit">
                <el-input v-model="startTraderFormData.minProfit" placeholder="请输入预期最低收益" />
              </el-form-item>
              <el-form-item label="Priority Fee(SOL)" prop="priorityFee">
                <el-input v-model="startTraderFormData.priorityFee" placeholder="请指定优先费" />
              </el-form-item>
              <el-form-item label="Jito Fee(SOL)" prop="jitoFee">
                <el-input v-model="startTraderFormData.jitoFee" placeholder="请指定jito手续费" />
              </el-form-item>
            </el-row>
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
                  <el-form-item label="Owner Program" prop="ownerProgram">
                    <el-input
                      v-model="batchForm.ownerProgram"
                      placeholder="请输入Owner Program地址"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" class="mb8">
                <el-col :span="1.5">
                  <el-form-item label="Token 精度" prop="decimals">
                    <el-input
                      v-model="batchForm.decimals"
                      placeholder="请输入Token 精度"
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
              <el-row v-if="batchForm.dexType === 'RAY_CLMM'" :gutter="20" class="mb8">
                <el-col :span="8">
                  <el-form-item label="Max Array Size" prop="maxArraySize">
                    <el-input
                      v-model="batchForm.maxArraySize"
                      placeholder="请输入maxArraySize"
                      size="small"
                      style="width: 400px;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

            </el-card>
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>Observer参数配置</h5>
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
              <el-row :gutter="4" class="mb8">
                <el-form-item label="Min SOL Amount" prop="minSolAmount">
                  <el-input
                    v-model="batchForm.minSolAmount"
                    placeholder="请输入最小交易量"
                  />
                </el-form-item>
                <el-form-item label="Max SOL Amount" prop="maxSolAmount">
                  <el-input
                    v-model="batchForm.maxSolAmount"
                    placeholder="请输入最大交易量"
                  />
                </el-form-item>
                <el-form-item label="Min Profit" prop="minProfit">
                  <el-input v-model="batchForm.triggerProfitQuoteAmount" placeholder="请输入预期最低收益" />
                </el-form-item>
                <el-form-item label="Priority Fee(SOL)" prop="priorityFee">
                  <el-input v-model="batchForm.priorityFee" placeholder="请指定优先费" />
                </el-form-item>
                <el-form-item label="Jito Fee(SOL)" prop="jitoFee">
                  <el-input v-model="batchForm.jitoFee" placeholder="请指定jito手续费" />
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
        minSolAmount: undefined,
        maxSolAmount: undefined,
        exchangeType: undefined,
        dexType: undefined,
        takerFee: undefined,
        maxArraySize: undefined,
        triggerProfitQuoteAmount: undefined,
        priorityFee: undefined,
        jitoFee: undefined
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
        alertThreshold: undefined,
        buyTriggerThreshold: undefined,
        targetBalanceThreshold: undefined,
        sellTriggerThreshold: undefined,
        slippage: ''
      },
      originalMinSolAmount: {}, // 记录原始值，方便取消恢复
      originalMaxSolAmount: {}, // 记录原始值，方便取消恢复

      // 表单校验
      rules: {
        targetToken: [{ required: true, message: '至少指定一个Target Token', trigger: 'blur' }],
        quoteToken: [{ required: true, message: '至少指定一个Quote Token', trigger: 'blur' }],
        ammPool: [{ required: true, message: 'ammPool不能为空', trigger: 'blur' }],
        slippage: [{ required: true, message: '请设置滑点', trigger: 'blur' }],
        minSolAmount: [{ required: true, message: '请设置最小交易金额', trigger: 'blur' }],
        maxSolAmount: [{ required: true, message: '请设置最大交易金额', trigger: 'blur' }],
        takerFee: [{ required: true, message: '请设置交易所taker手续费', trigger: 'blur' }],
        exchangeType: [{ required: true, message: '请选择交易所', trigger: 'blur' }],
        triggerProfitQuoteAmount: [{ required: true, message: '请输入触发套利的最小利润', trigger: 'blur' }],
        priorityFee: [{ required: true, message: '请输入交易优先费', trigger: 'blur' }],
        jitoFee: [{ required: true, message: '请输入jito费', trigger: 'blur' }]
      }
    }
  },
  computed: {
    minProfitLabel() {
      return `Min Profit`
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
      requestData.minSolAmount = Number(requestData.minSolAmount)
      requestData.maxSolAmount = Number(requestData.maxSolAmount)
      requestData.maxArraySize = Number(requestData.maxArraySize)
      requestData.decimals = Number(requestData.decimals)
      requestData.triggerProfitQuoteAmount = Number(requestData.triggerProfitQuoteAmount)
      requestData.priorityFee = Number(requestData.priorityFee)
      requestData.jitoFee = Number(requestData.jitoFee)

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

    // 打开修改observer参数表单
    handleObserverParamsUpdate(row) {
      console.log('this row', row)
      this.currentRow = row
      this.startTraderFormData = {
        instanceId: row.id,
        minProfit: row.minProfit,
        minSolAmount: row.minSolAmount,
        maxSolAmount: row.maxSolAmount,
        // slippage: parseFloat(row.slippage) / 100,
        priorityFee: row.priorityFee / 1_000_000_000,
        jitoFee: row.jitoFee / 1_000_000_000
      }
      this.showEditTraderDialog = true
    },

    // 重置表单数据
    resetStartTraderFormData() {
      this.startTraderFormData = {
        id: undefined,
        minProfit: '',
        slippage: '',
        priorityFee: '',
        jitoFee: ''
      }
    },

    // 确认启动交易
    confirmStartTrade() {
      const requestData = { ...this.startTraderFormData }
      requestData.id = this.currentRow.id
      requestData.alertThreshold = Number(requestData.alertThreshold)
      requestData.buyTriggerThreshold = Number(requestData.buyTriggerThreshold)
      requestData.targetBalanceThreshold = Number(requestData.targetBalanceThreshold)
      requestData.sellTriggerThreshold = Number(requestData.sellTriggerThreshold)
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
        id: row.id
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
        return delBusDexCexTriangularObserver({ 'ids': Ids })
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
      this.originalMinSolAmount[row.id] = row.minSolAmount
      this.originalMaxSolAmount[row.id] = row.maxSolAmount
      this.clearTimer()
      this.$set(row, 'isEditing', true)
      this.$set(row, 'newMinSolAmount', row.minSolAmount)
      this.$set(row, 'newMaxSolAmount', row.maxSolAmount)
    },
    confirmVolume(row) {
      const newMinSolAmount = Number(row.newMinSolAmount)
      const newMaxSolAmount = Number(row.newMaxSolAmount)
      if (isNaN(newMinSolAmount) || newMinSolAmount <= 0 || isNaN(newMaxSolAmount) || newMaxSolAmount <= 0) {
        this.$message.error('请输入有效的数字')
        return
      }
      if (newMinSolAmount > newMaxSolAmount) {
        this.$message.error('最大交易金额必须大于最小交易金额')
        return
      }
      row.isUpdating = true
      const requestData = {
        instanceId: row.id,
        minSolAmount: newMinSolAmount,
        maxSolAmount: newMaxSolAmount
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
      row.minSolAmount = this.originalMinSolAmount[row.id]
      row.maxSolAmount = this.originalMaxSolAmount[row.id]
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
        return Number(numStr).toFixed(6) + ' ' + row.quoteToken
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
        return `0.0{${leadingZeros - 1}}${significantDigits}` + ' ' + row.quoteToken
      }

      return Number(numStr).toFixed(leadingZeros + 6) + ' ' + row.quoteToken
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
.vertical-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px; /* 按钮之间的间距 */
}
</style>
