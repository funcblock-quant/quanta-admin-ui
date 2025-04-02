
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <h3>CEX/DEX账户列表</h3>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="CEX 账户" name="cex">
            <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
              <el-form-item label="账户名称" prop="accountName">
                <el-input
                  v-model="queryParams.accountName"
                  placeholder="请输入账户名称"
                  clearable
                  size="small"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="交易所" prop="exchangeId">
                <el-select
                  v-model="queryParams.exchangeId"
                  placeholder="请选择交易所"
                  clearable
                  size="small"
                >
                  <el-option
                    v-for="dict in exchangeOptions"
                    :key="dict.key"
                    :label="dict.value"
                    :value="dict.key"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="queryParams.status"
                  placeholder="账户配置状态"
                  clearable
                  size="small"
                >
                  <el-option
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['business:busExchangeAccountInfo:add']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                >新增
                </el-button>
              </el-col>
            </el-row> -->

            <el-table v-loading="loading" :data="busExchangeAccountInfoList">
              <el-table-column
                label="账户名称"
                align="center"
                prop="accountName"
                width="100"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                label="交易所名称"
                align="center"
                prop="exchangeType"
                width="85"
              />
              <el-table-column
                label="交易所uid"
                align="center"
                prop="uid"
                width="80"
                :show-overflow-tooltip="true"
              />
              <el-table-column label="Passphrase" align="center" prop="passphrase" :show-overflow-tooltip="true" width="120" />
              <el-table-column label="是否绑定Amber" align="center" prop="isAmberBound" width="120">
                <template slot-scope="scope">
                  {{ scope.row.isAmberBound ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column label="Amber交易所类型" align="center" prop="amberExchangeType" width="150" />
              <el-table-column label="Amber账户名称" align="center" prop="amberAccountName" width="120" />
              <el-table-column label="邮箱" align="center" prop="email" width="150" />
              <el-table-column label="母账号ID" align="center" prop="masterAccountId" width="100" />
              <el-table-column
                label="状态"
                align="center"
                prop="status"
                :formatter="statusFormat"
                width="100"
              >
                <template slot-scope="scope">
                  {{ statusFormat(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <!-- <el-button
                    slot="reference"
                    v-permisaction="['business:busExchangeAccountInfo:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdate(scope.row)"
                  >修改
                  </el-button> -->
                  <el-popconfirm
                    class="delete-popconfirm"
                    title="确认要删除吗?"
                    confirm-button-text="删除"
                    @confirm="handleDelete(scope.row)"
                  >
                    <el-button
                      slot="reference"
                      v-permisaction="['business:busExchangeAccountInfo:remove']"
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
          </el-tab-pane>
          <el-tab-pane label="DEX 账户" name="dex">
            <el-form ref="queryDexForm" :model="queryDexParams" :inline="true" label-width="68px">
              <el-form-item label="钱包名称" prop="walletName"><el-input
                v-model="queryParams.walletName"
                placeholder="请输入钱包名称"
                clearable
                size="small"
                @keyup.enter.native="handleQuery"
              />
              </el-form-item>
              <el-form-item label="钱包地址" prop="walletAddress"><el-input
                v-model="queryParams.walletAddress"
                placeholder="请输入钱包地址"
                clearable
                size="small"
                @keyup.enter.native="handleQuery"
              />
              </el-form-item>
              <el-form-item label="链网络" prop="blockchain"><el-select
                v-model="queryParams.blockchain"
                placeholder="请选择链"
                clearable
                size="small"
              >
                <el-option
                  v-for="chain in blockchainOptions"
                  :key="chain.value"
                  :label="chain.label"
                  :value="chain.value"
                />
              </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['business:busExchangeAccountInfo:add']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleDexAdd"
                >新增
                </el-button>
              </el-col>
            </el-row> -->

            <el-table v-loading="loading" :data="busDexWalletInfoList">
              <el-table-column
                label="钱包名称"
                align="center"
                prop="walletName"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                label="钱包地址"
                align="center"
                prop="walletAddress"
                width="100"
              />
              <el-table-column
                label="链网络"
                align="center"
                prop="blockchain"
                :show-overflow-tooltip="true"
              />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-popconfirm
                    class="delete-popconfirm"
                    title="确认要删除吗?"
                    confirm-button-text="删除"
                    @confirm="handleDexDelete(scope.row)"
                  >
                    <el-button
                      slot="reference"
                      v-permisaction="['business:busExchangeAccountInfo:remove']"
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
          </el-tab-pane>
        </el-tabs>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="700px">
          <el-form ref="form" :model="form" :rules="rules" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="账户名称" prop="accountName">
                  <el-input v-model="form.accountName" placeholder="账户名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="交易所类型" prop="exchangeType">
                  <el-select v-model="form.exchangeType" placeholder="请选择" @change="updateExchangeInfo">
                    <el-option v-for="dict in exchangeOptions" :key="dict.key" :label="dict.value" :value="dict.key" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="交易所uid" prop="uid">
                  <el-input v-model="form.uid" placeholder="交易所uid" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Passphrase" prop="passphrase">
                  <el-input v-model="form.passphrase" placeholder="Passphrase" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-select v-model="form.status" placeholder="请选择">
                    <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="母账号ID" prop="masterAccountId">
                  <el-input v-model="form.masterAccountId" placeholder="母账号ID" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否绑定Amber" prop="isAmberBound">
                  <el-switch v-model="form.isAmberBound" @change="handleAmberBoundChange" />
                </el-form-item>
              </el-col>
              <el-col v-if="form.isAmberBound" :span="12">
                <el-form-item label="Amber交易所类型" prop="amberExchangeType">
                  <el-input v-model="form.amberExchangeType" placeholder="Amber交易所类型" />
                </el-form-item>
              </el-col>
              <el-col v-if="form.isAmberBound" :span="12">
                <el-form-item label="Amber账户名称" prop="amberAccountName">
                  <el-input v-model="form.amberAccountName" placeholder="Amber账户名称" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 添加或修改对话框 -->
        <!-- <el-dialog :title="dexEditTitle" :visible.sync="dexEditOpen" width="700px">
          <el-form ref="dexForm" :model="dexForm" :rules="rules" label-width="120px">
            <el-row>
              <el-form-item label="钱包名称" prop="walletName">
                <el-input v-model="dexForm.walletName" placeholder="钱包名称" />
              </el-form-item>
              <el-form-item label="钱包地址" prop="walletAddress">
                <el-input v-model="dexForm.walletAddress" placeholder="钱包地址" />
              </el-form-item>
              <el-form-item label="链网络" prop="blockchain">
                <el-select v-model="dexForm.blockchain" placeholder="请选择">
                  <el-option
                    v-for="chain in blockchainOptions"
                    :key="chain.value"
                    :label="chain.label"
                    :value="chain.value"
                  />
                </el-select>
              </el-form-item>

            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitDexForm">确 定</el-button>
            <el-button @click="cancelDex">取 消</el-button>
          </div>
        </el-dialog> -->
      </el-card>

      <el-card class="box-card">
        <h3>资金归拢</h3>

        <el-form ref="moneyCollectionForm" :model="moneyCollectionForm" :rules="moneyCollectionRules" label-width="120px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="币种" prop="tokenName">
                <el-input v-model="moneyCollectionForm.tokenName" placeholder="请输入币种" style="width: 200px;" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="token地址" prop="tokenAddress">
                <el-input v-model="moneyCollectionForm.tokenAddress" placeholder="请输入token地址" style="width: 400px;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="DEX 账号" prop="dexWalletId">
                <el-select v-model="moneyCollectionForm.dexWalletId" placeholder="请选择 DEX 账号">
                  <el-option
                    v-for="account in busDexWalletInfoList"
                    :key="account.id"
                    :label="account.walletName"
                    :value="account.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="CEX 账号" prop="cexAccountId">
                <el-select v-model="moneyCollectionForm.cexAccountId" placeholder="请选择 CEX 账号">
                  <el-option
                    v-for="account in busExchangeAccountInfoList"
                    :key="account.id"
                    :label="account.accountName"
                    :value="account.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div v-if="accountFunds" style="margin-bottom: 20px;">
          <el-table :data="[accountFunds]" border style="width: 100%">
            <el-table-column prop="tokenName" label="Token 名称" />
            <el-table-column prop="walletBalance" label="钱包余额" />
            <el-table-column prop="traderAccountMarginBalance" label="交易所杠杆账户余额" />
            <el-table-column prop="traderAccountSpotBalance" label="交易所现货账户余额" />
            <el-table-column prop="masterAccountSpotBalance" label="主账户现货账户余额" />
            <el-table-column prop="traderAccountBorrowed" label="交易所杠杆账户借贷金额" />
          </el-table>
        </div>

        <el-button type="primary" @click="handleCheckFunds">查询资产信息</el-button>
        <el-button type="primary" @click="handleMoneyCollectionSubmit">发起资金归拢</el-button>
        <el-button @click="handleMoneyCollectionFormReset">重置</el-button>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusExchangeAccountInfo, delBusExchangeAccountInfo, getBusExchangeAccountInfo, getPortfolioUnwindingInfo, listBusExchangeAccountInfo, portfolioUnwinding, updateBusExchangeAccountInfo } from '@/api/business/bus-exchange-account-info'

import { listBusStrategyExchange } from '@/api/business/bus-strategy-exchange'
import {
  listBusExchangeAccountInfoByGroupId
} from '@/api/business/bus-exchange-account-group'
import { addBusDexWallet, delBusDexWallet, listBusDexWallet, updateBusDexWallet } from '@/api/business/bus-dex-wallet'
export default {
  name: 'BusExchangeAccountInfo',
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
      busExchangeAccountInfoList: [],
      busDexWalletInfoList: [],
      accountTypeOptions: [],
      statusOptions: [],
      blockchainOptions: [],
      // 关系表类型
      exchangeOptions: [],
      accountGroupList: [],
      accountFunds: null, // 初始化为空

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        accountName: undefined,
        exchangeId: undefined,
        exchangeType: undefined,
        accountType: undefined,
        status: undefined

      },
      // 查询参数
      queryDexParams: {
        pageIndex: 1,
        pageSize: 10,
        walletName: undefined,
        walletAddress: undefined,
        blockchain: undefined
      },
      activeTab: 'cex', // 默认选中 CEX 账户
      // 表单参数
      form: {
      },
      // dex表单参数
      dexForm: {
      },
      // 资金归拢表单
      moneyCollectionForm: {
        tokenName: undefined,
        tokenAddress: undefined,
        dexWalletId: undefined,
        cexAccountId: undefined
      },
      // 表单校验
      rules: { accountName: [{ required: true, message: '钱包名称不能为空', trigger: 'blur' }],
        exchangeId: [{ required: true, message: '请选择账户对应交易所', trigger: 'blur' }],
        accountType: [{ required: true, message: '账户类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      },
      moneyCollectionRules: {
        tokenName: [{ required: true, message: '币种不能为空', trigger: 'blur' }],
        tokenAddress: [{ required: true, message: 'token地址不能为空', trigger: 'blur' }],
        dexWalletId: [{ required: true, message: '请选择 DEX 账号', trigger: 'blur' }],
        cexAccountId: [{ required: true, message: '请选择 CEX 账号', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDexWalletList()
    this.getBusStrategyExchangeItems()
    this.getDicts('bus_exchange_account_type').then(response => {
      this.accountTypeOptions = response.data
    })
    this.getDicts('bus_exchange_account_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusExchangeAccountInfo(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busExchangeAccountInfoList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    getDexWalletList() {
      this.loading = true
      listBusDexWallet(this.addDateRange(this.queryDexParams, this.dateRange)).then(response => {
        this.busDexWalletInfoList = response.data.list
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
    // 取消按钮
    cancelDex() {
      this.dexEditOpen = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        accountName: undefined,
        exchangeType: undefined,
        uid: undefined,
        passphrase: undefined,
        isAmberBound: false,
        amberExchangeType: undefined,
        amberAccountName: undefined,
        amberAccountToken: undefined,
        status: undefined,
        email: undefined,
        masterAccountId: undefined
      }
      this.resetForm('form')
    },
    resetDex() {
      this.dexForm = {

        id: undefined,
        walletName: undefined,
        walletAddress: undefined,
        blockchain: undefined
      }
      this.resetForm('dexForm')
    },
    handleMoneyCollectionFormReset() {
    // 处理重置操作的逻辑
      this.moneyCollectionForm.cexAccountId = undefined
      this.moneyCollectionForm.dexWalletId = undefined
      this.moneyCollectionForm.tokenName = undefined
      this.moneyCollectionForm.tokenAddress = undefined
      this.accountFunds = null // 重置 accountFunds
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 关系
    getBusStrategyExchangeItems() {
      this.getItems(listBusStrategyExchange, undefined).then(res => {
        this.exchangeOptions = this.setItems(res, 'id', 'exchangeName')
      })
    },
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
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加CEX账户'
      this.isEdit = false
    },
    /** 新增Dex按钮操作 */
    // handleDexAdd() {
    //   this.reset()
    //   this.dexEditOpen = true
    //   this.dexEditTitle = '添加Dex钱包'
    // },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      Promise.all([
        getBusExchangeAccountInfo(id),
        listBusExchangeAccountInfoByGroupId(row.id)
      ]).then(([response, selectedGroupResp]) => {
        this.form = response.data
        const selectedList = selectedGroupResp.data || [] // 确保列表存在
        // this.form.accountGroupIds = selectedList.map((item) => item.id.toString()) // 这种方式会导致vue响应机制问题
        // this.form = { ...this.form, accountGroupIds: selectedList.map(item => item.id.toString()) } //这种方法可行
        this.$set(this.form, 'accountGroupIds', selectedList.map(item => item.id.toString())) // 这个也可行
        console.log('accountGroupIds', this.form.accountGroupIds)

        this.form.status = String(this.form.status)
        this.open = true
        this.title = '修改账户配置'
        this.isEdit = true
      })
    },
    updateExchangeInfo(selectedId) {
      const selectedOption = this.exchangeOptions.find(
        option => option.key === selectedId
      )
      this.form.exchangeType = selectedOption ? selectedOption.value : ''
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          // 弹出确认框
          this.$confirm('确定提交修改吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.form.id !== undefined) {
              console.log('form', this.form)
              this.form.status = Number(this.form.status)
              updateBusExchangeAccountInfo(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusExchangeAccountInfo(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            }
          }).catch(() => {
            // 取消确认时不执行任何操作
          })
        }
      })
    },

    submitDexForm: function() {
      this.$refs['dexForm'].validate(valid => {
        if (valid) {
          // 弹出确认框
          this.$confirm('确定提交修改吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.dexForm.id !== undefined) {
              console.log('dexForm', this.dexForm)
              updateBusDexWallet(this.dexForm).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.dexEditOpen = false
                  this.getDexWalletList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusDexWallet(this.dexForm).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.dexEditOpen = false
                  this.getDexWalletList()
                } else {
                  this.msgError(response.msg)
                }
              })
            }
          }).catch(() => {
            // 取消确认时不执行任何操作
          })
        }
      })
    },
    handleMoneyCollectionSubmit: function() {
      this.$refs['moneyCollectionForm'].validate(valid => {
        if (valid) {
          // 弹出确认框
          this.$confirm('确定发起资金归拢吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 资金归拢接口
            portfolioUnwinding(this.moneyCollectionForm).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
              } else {
                this.msgError(response.msg)
              }
            })
          }).catch(() => {
            // 取消确认时不执行任何操作
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = (row.id && [row.id]) || this.ids

      this.$confirm('是否确认删除账户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusExchangeAccountInfo({ 'ids': Ids })
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
    handleDexDelete(row) {
      var Ids = (row.id && [row.id]) || this.ids

      this.$confirm('是否确认删除账户?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusDexWallet({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.dexEditOpen = false
          this.getDexWalletList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    },
    handleTabClick(tab, event) {
      console.log('tab', tab)
      if (tab.name === 'cex') {
        this.getList()
      } else if (tab.name === 'dex') {
        this.getDexWalletList()
      }
    },
    handleAmberBoundChange(value) {
      if (!value) {
        this.form.amberExchangeType = undefined
        this.form.amberAccountName = undefined
      }
    },
    handleCheckFunds() {
      this.$refs['moneyCollectionForm'].validate(valid => {
        if (valid) {
          this.fetchAccountFunds()
        }
      })
    },
    fetchAccountFunds() {
      // 调用接口，查看账户资金情况
      console.log('调用接口，查看账户资金情况', this.moneyCollectionForm)
      getPortfolioUnwindingInfo(this.moneyCollectionForm).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.accountFunds = response.data
        } else {
          this.msgError(response.msg)
        }
      })
    }

  }
}
</script>

<style>
  .el-row {
    margin-bottom: 20px;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
