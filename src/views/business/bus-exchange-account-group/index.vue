
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
          <el-form-item label="账户组" prop="groupName"><el-input
            v-model="queryParams.groupName"
            placeholder="请输入交易所账户组"
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

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busExchangeAccountGroup:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button></el-col>
        </el-row>

        <el-table v-loading="loading" :data="busExchangeAccountGroupList">
          <el-table-column
            label="交易所账户组"
            align="center"
            prop="groupName"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="描述"
            align="center"
            prop="description"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="创建人"
            align="center"
            prop="createBy"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busExchangeAccountGroup:edit']"
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
                  v-permisaction="['business:busExchangeAccountGroup:remove']"
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
        <el-dialog :title="title" :visible.sync="open" width="800px">
          <el-form ref="form" :model="form" :rules="rules" label-width="100px">

            <el-form-item label="账户组名称" prop="groupName">
              <el-input
                v-model="form.groupName"
                placeholder="交易所账户组名称"
              />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="form.description"
                placeholder="描述"
              />
            </el-form-item>
            <el-form-item label="添加账户" prop="description">
              <el-transfer
                v-model="form.selectedAccounts"
                filterable
                filter-placeholder="请输入账号名称"
                :data="exchangeAccountList"
                :titles="['未添加', '已添加']"
                @change="handleTransferChange"
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
import { addBusExchangeAccountGroup, delBusExchangeAccountGroup, getBusExchangeAccountGroup, listBusExchangeAccountGroup, updateBusExchangeAccountGroup } from '@/api/business/bus-exchange-account-group'
import { listBusExchangeAccountInfo, listBusExchangeAccountInfoByGroupId } from '@/api/business/bus-exchange-account-info'

export default {
  name: 'BusExchangeAccountGroup',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 非单个禁用
      single: true,
      // 选中数组
      ids: [],
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
      busExchangeAccountGroupList: [],

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        groupName: undefined
      },
      // 账户列表查询参数
      accountsQueryParams: {
        pageIndex: 1,
        pageSize: Number.MAX_SAFE_INTEGER,
        status: 2
      },

      // 表单参数
      form: {
        selectedAccounts: []
      },
      // 表单校验
      rules: { groupName: [{ required: true, message: '交易所账户组名称不能为空', trigger: 'blur' }]
      },
      exchangeAccountList: [
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusExchangeAccountGroup(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busExchangeAccountGroupList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    /** 查询所有账户列表*/
    getTotalAccountList() {
      listBusExchangeAccountInfo(this.addDateRange(this.accountsQueryParams, this.dateRange)).then(response => {
        const list = response.data.list || [] // 确保列表存在
        // 遍历响应数据
        this.exchangeAccountList = list.map((item) => {
          return {
            key: item.id, // 以 id 作为唯一键
            label: `${item.accountName}-${item.exchangeName}` // 拼接 accountName 和 platformName
          }
        })
        console.log('exchangeAccountList:', this.exchangeAccountList)
      }).catch(error => {
        console.error('获取列表数据失败:', error) // 捕获错误
      })
    },
    handleTransferChange(newVal, direction, moveKeys) {
      console.log('新的选中数据:', newVal)
      console.log('方向:', direction) // 'right' 表示添加到右侧，'left' 表示移回左侧
      console.log('当前 selectedAccounts:', this.form.selectedAccounts)
      this.form.selectedAccounts = [...newVal]
      console.log('当前 exchangeAccountList:', this.exchangeAccountList)
      console.log('被移动的项:', moveKeys) // 例如 [1, 2, 3]
      // 在 Vue 完成 DOM 更新之后
      this.$nextTick(() => {
        console.log('视图更新后的 selectedAccounts:', this.form.selectedAccounts)
      })
    },
    /** 查询已选账户列表*/
    // getSelectedAccountList(row) {
    //   listBusExchangeAccountInfoByGroupId(row.id).then(response => {
    //     const list = response.data || [] // 确保列表存在
    //     // 遍历响应数据
    //     this.form.selectedAccounts = list.map((item) => item.id)
    //     console.log('selectAccounts:', this.form.selectedAccounts)
    //     this.$nextTick(() => {
    //       console.log('Transfer组件状态更新后：', this.form.selectedAccounts)
    //     })
    //   }).catch(error => {
    //     console.error('获取列表数据失败:', error) // 捕获错误
    //   })
    // },

    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {

        id: undefined,
        groupName: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
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
      this.title = '添加账号组设置'
      this.isEdit = false
      this.getTotalAccountList()
    },
    /** 修改按钮操作 */
    // handleUpdate(row) {
    //   this.reset()
    //   const id = row.id
    //   this.getTotalAccountList()
    //   getBusExchangeAccountGroup(id).then(response => {
    //     this.form = response.data
    //     this.open = true
    //     this.title = '修改账号组设置'
    //     this.isEdit = true
    //   })
    //   this.getSelectedAccountList(row)
    // },

    handleUpdate(row) {
      this.reset()
      const id = row.id
      Promise.all([
        getBusExchangeAccountGroup(id),
        listBusExchangeAccountInfo(this.addDateRange(this.queryParams, this.dateRange)),
        listBusExchangeAccountInfoByGroupId(row.id)]
      ).then(([groupResponse, accountResp, selectedAccountResp]) => {
        this.form = groupResponse.data

        const accountList = accountResp.data.list || [] // 确保列表存在
        // 遍历响应数据
        this.exchangeAccountList = accountList.map((item) => {
          return {
            key: item.id, // 以 id 作为唯一键
            label: `${item.accountName}-${item.exchangeName}` // 拼接 accountName 和 platformName
          }
        })
        console.log('exchangeAccountList', this.exchangeAccountList)
        const selectedList = selectedAccountResp.data || [] // 确保列表存在
        // 遍历响应数据
        this.form.selectedAccounts = selectedList.map((item) => item.id)
        console.log('selectedAccounts', this.form.selectedAccounts)
        this.$nextTick(() => {
          // 确保更新后，相关内容被重新渲染
        })
        this.open = true
        this.title = '修改账号组设置'
        this.isEdit = true
      }).catch(error => {
        console.error('数据加载失败', error)
        this.$message.error('加载数据失败，请重试')
      })
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
            const params = {
              ...this.form,
              accountIds: this.form.selectedAccounts // 保存选中的账户ID列表
            }
            if (this.form.id !== undefined) {
              updateBusExchangeAccountGroup(params).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusExchangeAccountGroup(params).then(response => {
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

      this.$confirm('删除账户组后，会自动解绑相关联的账户，确认要删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusExchangeAccountGroup({ 'ids': Ids })
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
