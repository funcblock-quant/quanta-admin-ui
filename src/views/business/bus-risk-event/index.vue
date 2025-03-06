
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="120px">
          <el-form-item label="策略id" prop="strategyId"><el-input
            v-model="queryParams.strategyId"
            placeholder="请输入策略id"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="策略实例ID" prop="strategyInstanceId"><el-input
            v-model="queryParams.strategyInstanceId"
            placeholder="请输入策略实例ID"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <!-- <el-form-item label="风控范围" prop="riskScope">
            <el-select
              v-model="queryParams.riskScope"
              placeholder="请输入风控范围"
              clearable
              size="small"
            >
              <el-option
                v-for="scope in riskScopeList"
                :key="scope.key"
                :value="scope.value"
              />
            </el-select>
          </el-form-item> -->
          <el-form-item label="风控级别" prop="riskLevel">
            <el-select
              v-model="queryParams.riskLevel"
              placeholder="请输入风控级别"
              clearable
              size="small"
            >
              <el-option
                v-for="level in riskLevelList"
                :key="level.key"
                :label="level.value"
                :value="level.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="恢复方式" prop="manualRecover">
            <el-select
              v-model="queryParams.manualRecover"
              placeholder="请输入是否需要人工恢复"
              clearable
              size="small"
            >
              <el-option
                v-for="type in manualRecoverList"
                :key="type.key"
                :value="type.key"
                :label="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="恢复状态" prop="isRecovered">
            <el-select
              v-model="queryParams.isRecovered"
              placeholder="请输入是否已恢复"
              clearable
              size="small"
            >
              <el-option
                v-for="status in recoverStatusList"
                :key="status.key"
                :value="status.key"
                :label="status.value"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="触发规则" prop="triggerRule"><el-input
            v-model="queryParams.triggerRule"
            placeholder="请输入触发的风控规则"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item> -->

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="busRiskEventList">
          <el-table-column
            label="策略id"
            align="center"
            prop="strategyId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="策略实例ID"
            align="center"
            prop="strategyInstanceId"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="触发规则"
            align="center"
            prop="triggerRule"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="触发值"
            align="center"
            prop="triggerValue"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="风控范围"
            align="center"
            prop="riskScope"
            :show-overflow-tooltip="true"
            :formatter="formatRiskScope"
          /><el-table-column
            label="风控币种"
            align="center"
            prop="assetSymbol"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="风控级别"
            align="center"
            prop="riskLevel"
            :show-overflow-tooltip="true"
            :formatter="formatRiskLevel"
          /><el-table-column
            label="恢复方式"
            align="center"
            prop="manualRecover"
            :show-overflow-tooltip="true"
            :formatter="formatRecoverMethod"
          /><el-table-column
            label="自动恢复时间"
            align="center"
            prop="autoRecoverTime"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.autoRecoverTime) }}</span>
            </template>
          </el-table-column><el-table-column
            label="恢复状态"
            align="center"
            prop="isRecovered"
            :show-overflow-tooltip="true"
            :formatter="formatRecoverStatus"
          /><el-table-column
            label="审核人"
            align="center"
            prop="recoveredBy"
            :show-overflow-tooltip="true"
            :formatter="formatReviewer"
          /><el-table-column
            label="恢复时间"
            align="center"
            prop="recoveredAt"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.recoveredAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-if="!scope.row.isRecovered"
                slot="reference"
                v-permisaction="['business:busRiskEvent:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >审核
              </el-button>
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

            <el-form-item label="是否恢复" prop="isRecovered">
              <el-select
                v-model="form.isRecovered"
                placeholder="请输入是否已恢复"
                clearable
                size="small"
              >
                <el-option
                  v-for="status in recoverActionList"
                  :key="status.key"
                  :label="status.value"
                  :value="status.key"
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
import { addBusRiskEvent, getBusRiskEvent, listBusRiskEvent, updateBusRiskEvent } from '@/api/business/bus-risk-event'

export default {
  name: 'BusRiskEvent',
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
      busRiskEventList: [],
      riskScopeList: [
        { key: 0, value: '全局风控' },
        { key: 1, value: '单币种' }
      ],
      riskLevelList: [
        { key: 1, value: '预警' },
        { key: 2, value: '暂停交易' }
      ],
      manualRecoverList: [
        { key: 1, value: '人工恢复' },
        { key: 0, value: '自动恢复' }
      ],
      recoverStatusList: [
        { key: 1, value: '已恢复' },
        { key: 0, value: '未恢复' }
      ],
      recoverActionList: [
        { key: 1, value: '恢复' }
      ],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        strategyId: undefined,
        strategyInstanceId: undefined,
        riskScope: undefined,
        assetSymbol: undefined,
        riskLevel: undefined,
        manualRecover: undefined,
        autoRecoverTime: undefined,
        isRecovered: undefined,
        recoveredBy: undefined,
        recoveredAt: undefined,
        triggerRule: undefined,
        triggerValue: undefined,
        idOrder: 'desc'

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { strategyId: [{ required: true, message: '策略id不能为空', trigger: 'blur' }],
        strategyInstanceId: [{ required: true, message: '策略实例ID不能为空', trigger: 'blur' }],
        riskScope: [{ required: true, message: '风控范围不能为空', trigger: 'blur' }],
        riskLevel: [{ required: true, message: '风控级别不能为空', trigger: 'blur' }],
        manualRecover: [{ required: true, message: '是否需要人工恢复不能为空', trigger: 'blur' }],
        isRecovered: [{ required: true, message: '是否已恢复不能为空', trigger: 'blur' }],
        triggerRule: [{ required: true, message: '触发的风控规则不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusRiskEvent(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busRiskEventList = response.data.list
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
        isRecovered: undefined
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
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusRiskEvent(id).then(response => {
        this.form = response.data
        this.form.isRecovered = undefined
        this.open = true
        this.title = '修改风控记录'
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
              updateBusRiskEvent(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusRiskEvent(this.form).then(response => {
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
    formatRiskScope(row) {
      if (row.riskScope === 1) {
        return '单币种'
      } else {
        return '全币种'
      }
    },
    formatRiskLevel(row) {
      if (row.riskLevel === 1) {
        return '预警'
      } else if (row.riskLevel === 2) {
        return '暂停单币交易'
      } else {
        return '暂停全币交易'
      }
    },
    formatRecoverMethod(row) {
      if (row.manualRecover) {
        return '人工恢复'
      } else {
        return '自动恢复'
      }
    },
    formatRecoverStatus(row) {
      if (row.isRecovered) {
        return '已恢复'
      } else {
        return '未恢复'
      }
    },
    formatReviewer(row) {
      if (row.recoveredBy === '0') {
        return ''
      } else if (row.recoveredBy === '-1') {
        return '系统'
      } else {
        return row.recoveredBy
      }
    }

  }
}
</script>
