
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="钱包名称" prop="accountName"><el-input
            v-model="queryParams.accountName"
            placeholder="请输入钱包名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易所" prop="exchangeId"><el-select
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
          <el-form-item label="账户类型" prop="accountType"><el-select
            v-model="queryParams.accountType"
            placeholder="账户配置账户类型"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in accountTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status"><el-select
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

        <el-row :gutter="10" class="mb8">
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
        </el-row>

        <el-table v-loading="loading" :data="busExchangeAccountInfoList">
          <el-table-column
            label="账户名称"
            align="center"
            prop="accountName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="交易所名称"
            align="center"
            prop="exchangeName"
            width="100"
          />
          <el-table-column
            label="交易所uid"
            align="center"
            prop="uid"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="账户类型"
            align="center"
            prop="accountType"
            :formatter="accountTypeFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ accountTypeFormat(scope.row) }}
            </template>
          </el-table-column>
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
              <el-button
                slot="reference"
                v-permisaction="['business:busExchangeAccountInfo:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
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

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">

            <el-form-item label="账户名称" prop="accountName">
              <el-input
                v-model="form.accountName"
                placeholder="账户名称"
              />
            </el-form-item>
            <el-form-item label="交易所名称" prop="exchangeId">
              <el-select
                v-model="form.exchangeId"
                placeholder="请选择"
                @change="updateExchangeInfo"
              >
                <el-option
                  v-for="dict in exchangeOptions"
                  :key="dict.key"
                  :label="dict.value"
                  :value="dict.key"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="交易所uid" prop="uid">
              <el-input
                v-model="form.uid"
                placeholder="交易所uid"
              />
            </el-form-item>
            <el-form-item label="账户类型" prop="accountType">
              <el-select
                v-model="form.accountType"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in accountTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="账户组" prop="accountGroup">
              <el-select
                v-model="form.accountGroupIds"
                placeholder="请选择账户组"
                clearable
                size="small"
                multiple
              >
                <el-option
                  v-for="group in accountGroupList"
                  :key="group.key"
                  :value="group.key"
                  :label="group.value"
                />
              </el-select>
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
import { addBusExchangeAccountInfo, delBusExchangeAccountInfo, getBusExchangeAccountInfo, listBusExchangeAccountInfo, updateBusExchangeAccountInfo } from '@/api/business/bus-exchange-account-info'

import { listBusStrategyExchange } from '@/api/business/bus-strategy-exchange'
import {
  listBusExchangeAccountGroup,
  listBusExchangeAccountInfoByGroupId
} from '@/api/business/bus-exchange-account-group'
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
      accountTypeOptions: [], statusOptions: [],
      // 关系表类型
      exchangeOptions: [],
      accountGroupList: [],

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        accountName: undefined,
        exchangeId: undefined,
        exchangeName: undefined,
        accountType: undefined,
        status: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { accountName: [{ required: true, message: '钱包名称不能为空', trigger: 'blur' }],
        exchangeId: [{ required: true, message: '请选择账户对应交易所', trigger: 'blur' }],
        accountType: [{ required: true, message: '账户类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
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
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        accountName: undefined,
        exchangeId: undefined,
        exchangeName: undefined,
        uid: undefined,
        accountType: undefined,
        status: undefined,
        accountGroupIds: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    accountTypeFormat(row) {
      return this.selectDictLabel(this.accountTypeOptions, row.accountType)
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
    getBusExchangeAccountGroupList() {
      this.getItems(listBusExchangeAccountGroup, undefined).then(res => {
        console.log('res', res.data.list)
        this.accountGroupList = this.setItems(res, 'id', 'groupName')
        console.log('accountGroupList', this.accountGroupList)
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
      this.getBusExchangeAccountGroupList()
      this.open = true
      this.title = '添加账户配置'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      this.getBusExchangeAccountGroupList()
      getBusExchangeAccountInfo(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改账户配置'
        this.isEdit = true
      })
      listBusExchangeAccountInfoByGroupId(row.id).then(response => {
        const selectedList = response.data || [] // 确保列表存在
        // 遍历响应数据
        this.form.accountGroupIds = selectedList.map((item) => item.id.toString())
        console.log('accountGroupIds', this.form.accountGroupIds)
      })
    },
    updateExchangeInfo(selectedId) {
      const selectedOption = this.exchangeOptions.find(
        option => option.key === selectedId
      )
      this.form.exchangeName = selectedOption ? selectedOption.value : ''
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
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = (row.id && [row.id]) || this.ids

      this.$confirm('是否确认删除账户? 删除后，账户将从已绑定的账户组移除。', '警告', {
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
    }
  }
}
</script>
