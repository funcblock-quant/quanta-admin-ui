
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
          <el-form-item label="状态" prop="status"><el-select
            v-model="queryParams.status"
            placeholder="请输入策略状态"
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
        <el-dialog :title="title" :visible.sync="open" width="1000px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">

            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>

                <el-form-item label="策略名称" prop="strategyName">
                  <el-input v-model="form.strategyName" placeholder="策略名称" class="responsive-width" />
                </el-form-item>
                <el-form-item label="交易类型" prop="strategyCategory">
                  <el-select v-model="form.strategyCategory" placeholder="请选择" class="responsive-width">
                    <el-option
                      v-for="dict in strategyCategoryOptions"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="偏好" prop="preference">
                  <el-select v-model="form.preference" placeholder="请选择" class="responsive-width">
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
                    type="textarea"
                    placeholder="策略描述"
                    class="responsive-width"
                    :autosize="{ minRows: 3, maxRows: 5 }"
                  />
                </el-form-item>
                <el-form-item label="负责人" prop="owner">
                  <el-input v-model="form.owner" placeholder="策略负责人" class="responsive-width" />
                </el-form-item>
              </div></el-card>
            <!-- 分割线 -->
            <el-divider />
            <!-- 策略配置模版信息 -->
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略配置模板信息</h5>
              </div>
              <div v-for="(config, index) in form.configurations" :key="index" class="config-item">
                <div class="config-header">
                  <span>配置 {{ index + 1 }}</span>
                  <el-button
                    v-if="form.configurations.length > 0"
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="removeConfig(index,config.id)"
                  />
                </div>
                <el-row :gutter="20">
                  <!-- 第一行：key 和 名称 -->
                  <el-col :span="12">
                    <el-form-item label="key：" prop="paramKey">
                      <el-input v-model="config.paramKey" placeholder="key" size="mini" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="名称：" prop="paramName">
                      <el-input v-model="config.paramName" placeholder="名称" size="mini" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <!-- 第二行：默认值 和 是否必填 -->
                  <el-col :span="12">
                    <el-form-item label="默认值：" prop="defaultValue">
                      <el-input v-model="config.defaultValue" placeholder="默认值" size="mini" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="是否必填" prop="required">
                      <el-switch v-model="config.required" size="mini" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>

              <el-button type="primary" icon="el-icon-plus" @click="addConfig">新增</el-button>
            </el-card>
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

import { listBusStrategyConfigDictByStrategyId } from '@/api/business/bus-strategy-config-dict'
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
      // 表单校验
      rules: { strategyName: [{ required: true, message: '策略名称不能为空', trigger: 'blur' }],
        strategyCategory: [{ required: true, message: '策略交易类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '策略运行状态不能为空', trigger: 'blur' }]
      },
      form: {
        configurations: [{ // 初始化至少一个配置项
          paramKey: '',
          paramName: '',
          defaultValue: '',
          required: false
        }]
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
        configurations: []
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
      const id = row.id
      // 使用 Promise.all 并行查询数据
      Promise.all([
        getBusStrategyBaseInfo(id), // 查询策略基本信息
        listBusStrategyConfigDictByStrategyId(id) // 查询策略配置模版数据
      ])
        .then(([strategyResponse, configurations]) => {
          // 将接口数据设置到表单
          console.log(configurations)
          this.form = {
            ...strategyResponse.data, // 策略信息数据
            configurations: configurations.data.list // 附加数据
          }
          console.log(this.form)
          this.open = true
          this.title = '修改策略注册'
          this.isEdit = true // 标记为编辑模式
        })
        .catch(error => {
          console.error('数据加载失败', error)
          this.$message.error('加载数据失败，请重试')
        })
    },
    addConfig() {
      // 确保配置项数组存在再执行 push
      if (Array.isArray(this.form.configurations)) {
        this.form.configurations.push({
          paramKey: '',
          paramName: '',
          defaultValue: '',
          required: false
        })
      } else {
        console.error('configurations not initialized')
      }
    },
    removeConfig(index, id) {
      // var ids = (id && [id])
      // this.$confirm('是否确认删除该配置', '警告', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(function() {
      //   return delBusStrategyConfigDict({ 'ids': ids })
      // }).then((response) => {
      //   return this.form.configurations.splice(index, 1)
      // })
      return this.form.configurations.splice(index, 1)
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

<style scoped>
.config-item {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.responsive-width {
  width: 100%;
}

@media (min-width: 800px) {
  .responsive-width {
    width: 300px;
  }
}
</style>
