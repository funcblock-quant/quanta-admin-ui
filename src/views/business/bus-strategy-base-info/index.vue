
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
          <el-form-item label="名称" prop="strategyName"><el-input
            v-model="queryParams.strategyName"
            placeholder="请输入策略名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="交易类型" prop="strategyCategory"><el-select
            v-model="queryParams.strategyCategory"
            placeholder="请输入注册策略交易类型"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in strategyCategoryOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>
          <el-form-item label="运行状态" prop="status"><el-select
            v-model="queryParams.status"
            placeholder="请输入注册策略运行状态"
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
              v-permisaction="['business:busStrategyBaseInfo:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['business:busStrategyBaseInfo:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busStrategyBaseInfoList">
          <el-table-column width="50" align="center" /><el-table-column
            label="名称"
            align="center"
            prop="strategyName"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="交易类型"
            align="center"
            prop="strategyCategory"
            :formatter="strategyCategoryFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ strategyCategoryFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="偏好"
            align="center"
            prop="preference"
            :formatter="preferenceFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ preferenceFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="描述"
            align="center"
            prop="description"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="运行状态"
            align="center"
            prop="status"
            :formatter="statusFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ statusFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="负责人"
            align="center"
            prop="owner"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busStrategyBaseInfo:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-popconfirm
                class="delete-popconfirm"
                title="确认要下线策略吗?"
                confirm-button-text="下线"
                @confirm="handleDelete(scope.row)"
              >
                <el-button
                  slot="reference"
                  v-permisaction="['business:busStrategyBaseInfo:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                >下线
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

            <el-form-item label="策略名称" prop="strategyName">
              <el-input
                v-model="form.strategyName"
                placeholder="策略名称"
              />
            </el-form-item>
            <el-form-item label="交易类型" prop="strategyCategory">
              <el-select
                v-model="form.strategyCategory"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in strategyCategoryOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="偏好" prop="preference">
              <el-select
                v-model="form.preference"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in preferenceOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="form.description"
                placeholder="策略描述"
              />
            </el-form-item>
            <el-form-item label="运行状态" prop="status">
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
            <el-form-item label="策略负责人" prop="owner">
              <el-input
                v-model="form.owner"
                placeholder="策略负责人"
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
import { addBusStrategyBaseInfo, delBusStrategyBaseInfo, getBusStrategyBaseInfo, listBusStrategyBaseInfo, updateBusStrategyBaseInfo } from '@/api/business/bus-strategy-base-info'

export default {
  name: 'BusStrategyBaseInfo',
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
      busStrategyBaseInfoList: [],
      strategyCategoryOptions: [], preferenceOptions: [], statusOptions: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        strategyName: undefined,
        strategyCategory: undefined,
        status: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { strategyName: [{ required: true, message: '策略名称不能为空', trigger: 'blur' }],
        strategyCategory: [{ required: true, message: '策略交易类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '策略运行状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_strategy_category').then(response => {
      this.strategyCategoryOptions = response.data
    })
    this.getDicts('bus_strategy_preference').then(response => {
      this.preferenceOptions = response.data
    })
    this.getDicts('bus_strategy_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusStrategyBaseInfo(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategyBaseInfoList = response.data.list
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
        strategyName: undefined,
        strategyCategory: undefined,
        preference: undefined,
        description: undefined,
        status: undefined,
        owner: undefined,
        isDeleted: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    strategyCategoryFormat(row) {
      return this.selectDictLabel(this.strategyCategoryOptions, row.strategyCategory)
    },
    preferenceFormat(row) {
      return this.selectDictLabel(this.preferenceOptions, row.preference)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
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
      this.open = true
      this.title = '添加策略注册'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getBusStrategyBaseInfo(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改策略注册'
        this.isEdit = true // 标记为编辑模式
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          // 弹出确认框
          const confirmMessage = this.isEdit
            ? '确定提交修改吗?'
            : '确定提交新增吗?'

          this.$confirm(confirmMessage, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 根据编辑模式决定调用更新还是添加接口
            if (this.form.id !== undefined) {
              updateBusStrategyBaseInfo(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusStrategyBaseInfo(this.form).then(response => {
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

      this.$confirm('是否确认下线编号为"' + Ids + '"的策略?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusStrategyBaseInfo({ 'ids': Ids })
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
