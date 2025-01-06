
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                v-permisaction="['business:busStrategySymbolGroup:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新增
              </el-button>
            </el-col>
          </el-row>

          <el-table v-loading="loading" :data="busStrategySymbolGroupList">
            <el-table-column
              label="交易组名称"
              align="center"
              prop="groupName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="是否自动刷新"
              align="center"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.autoRefresh"
                  size="mini"
                  active-color="#409EFF"
                  inactive-color="#C0C4CC"
                  @change="handleAutoRefreshChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="是否启用"
              align="center"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.isActive"
                  size="mini"
                  active-color="#409EFF"
                  inactive-color="#C0C4CC"
                  @change="handleIsActiveChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="自动刷新间隔"
              align="center"
              prop="refreshInterval"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  slot="reference"
                  v-permisaction="['business:busStrategySymbolGroup:edit']"
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
                    v-permisaction="['business:busStrategySymbolGroup:remove']"
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

          <el-dialog :title="title" :visible.sync="open" width="600px">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
              <el-form-item label="策略实例" prop="strategyId">
                <el-select
                  v-model="form.strategyInstanceId"
                  placeholder="请选择策略"
                  clearable
                  size="small"
                >
                  <el-option
                    v-for="strategy in strategyInstanceList"
                    :key="strategy.id"
                    :value="strategy.id"
                    :label="strategy.strategyName"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="币对组名称" prop="groupName">
                <el-input
                  v-model="form.groupName"
                  placeholder="币对组"
                />
              </el-form-item>
              <el-form-item label="是否自动刷新" prop="autoRefresh">
                <el-switch v-model="form.autoRefresh" size="mini" />
              </el-form-item>
              <br>
              <el-form-item label="是否启用" prop="autoRefresh">
                <el-switch v-model="form.isActive" size="mini" />
              </el-form-item>
              <el-form-item label="自动刷新间隔(ms)" prop="refreshInterval">
                <el-input
                  v-model="form.refreshInterval"
                  placeholder="自动刷新间隔"
                />
              </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </el-dialog>
        </el-form></el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusStrategySymbolGroup, delBusStrategySymbolGroup, getBusStrategySymbolGroup, listBusStrategySymbolGroup, updateBusStrategySymbolGroup } from '@/api/business/bus-strategy-symbol-group'
import { listBusStrategyInstance } from '@/api/business/bus-strategy-instance'

export default {
  name: 'BusStrategySymbolGroup',
  components: {},
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
      busStrategySymbolGroupList: [],
      groupTypeOptions: [],
      strategyInstanceList: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        groupType: '1' // 默认为观察组

      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_symbol_group_type').then(response => {
      this.groupTypeOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusStrategySymbolGroup(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategySymbolGroupList = response.data.list
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
        groupName: undefined,
        autoRefresh: undefined,
        refreshInterval: undefined,
        groupType: '1',
        strategyInstanceId: undefined
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
    handleAdd() {
      this.reset()
      this.instanceQueryParams = {
        pageIndex: 1,
        pageSize: 10000
      }
      listBusStrategyInstance(this.instanceQueryParams).then(response => {
        this.strategyInstanceList = response.data.list
        this.open = true
        this.title = '添加观察组配置'
        this.isEdit = false
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
        row.id || this.ids
      this.instanceQueryParams = {
        pageIndex: 1,
        pageSize: 10000
      }
      Promise.all([
        getBusStrategySymbolGroup(id),
        listBusStrategyInstance(this.instanceQueryParams)
      ]).then(([response, strategyListResp]) => {
        this.form = response.data
        this.strategyInstanceList = strategyListResp.data.list
        if (this.form.strategyInstanceId === '0') {
          this.form.strategyInstanceId = undefined
        }
        this.open = true
        this.title = '修改观察组配置'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const confirmMessage = this.isEdit
            ? '确定提交修改吗?'
            : '确定提交新增吗?'
          this.$confirm(confirmMessage, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.form.id !== undefined) {
              updateBusStrategySymbolGroup(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              if (this.form.strategyInstanceId === undefined && this.form.isActive === true) {
                this.$message({
                  message: '需要绑定策略实例后才能启用',
                  type: 'warning', // 提示类型，其他可用：success、info、error
                  duration: 3000 // 提示持续时间，单位毫秒
                })
                // 将 isActive 恢复为 false
                this.form.isActive = false
              } else {
                addBusStrategySymbolGroup(this.form).then(response => {
                  if (response.code === 200) {
                    this.msgSuccess(response.msg)
                    this.open = false
                    this.getList()
                  } else {
                    this.msgError(response.msg)
                  }
                })
              }
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

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusStrategySymbolGroup({ 'ids': Ids })
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
    /** 启用观察组*/
    handleAutoRefreshChange(row) {
      this.form = { ...row } // 克隆 row 对象
      updateBusStrategySymbolGroup(this.form).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 暂停观察组*/
    handleIsActiveChange(row) {
      this.form = { ...row } // 克隆 row 对象
      // 检查是否已经绑定 instanceId
      console.log(this.form.strategyInstanceId)
      if (!this.form.strategyInstanceId || this.form.strategyInstanceId === '0') {
        this.msgError('请绑定策略实例') // 提示用户绑定实例 ID
        row.isActive = !row.isActive
        return // 如果没有绑定，阻止后续操作
      }
      updateBusStrategySymbolGroup(this.form).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    }
  }
}
</script>

