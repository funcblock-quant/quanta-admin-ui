
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="交易组" prop="symbolGroupId">
            <el-select
              v-model="queryParams.symbolGroupId"
              placeholder="请选择交易组"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            >
              <el-option
                v-for="group in symbolGroupList"
                :key="group.key"
                :value="group.key"
                :label="group.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                v-permisaction="['business:busStrategyTradeList:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新增
              </el-button>

              <el-button
                v-permisaction="['business:busStrategyTradeList:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleBatchAdd"
              >
                批量添加
              </el-button>
            </el-col>
          </el-row>

          <el-table v-loading="loading" :data="busStrategyTradeList">
            <el-table-column
              label="币对组"
              align="center"
              prop="groupName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="交易币种名称"
              align="center"
              prop="symbol"
              :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  slot="reference"
                  v-permisaction="['business:busStrategyTradeList:edit']"
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
                    v-permisaction="['business:busStrategyTradeList:remove']"
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
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">

              <el-form-item label="币对组" prop="symbolGroupId">
                <el-select
                  v-model="form.symbolGroupId"
                  placeholder="请选择币对组"
                  clearable
                  size="small"
                >
                  <el-option
                    v-for="group in symbolGroupList"
                    :key="group.key"
                    :value="group.key"
                    :label="group.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="交易币种名称" prop="symbol">
                <el-input
                  v-model="form.symbol"
                  placeholder="交易币种名称"
                />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </el-dialog>

          <el-dialog :title="'批量添加交易币种'" :visible.sync="batchOpen" width="600px">
            <el-form ref="batchForm" :model="batchForm" label-width="100px">
              <el-form-item label="币对组" prop="symbolGroupId">
                <el-select
                  v-model="batchForm.symbolGroupId"
                  placeholder="请选择币对组"
                  clearable
                  size="small"
                >
                  <el-option
                    v-for="group in symbolGroupList"
                    :key="group.key"
                    :value="group.key"
                    :label="group.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="交易币种名称" prop="symbols">
                <el-input
                  v-model="batchForm.symbols"
                  type="textarea"
                  placeholder="请输入交易币种，每个币种用`;`分隔，例如：BTC/USDT;ETH/USDT"
                  rows="8"
                />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="batchOpen = false">取消</el-button>
              <el-button type="primary" @click="submitBatchForm">确定</el-button>
            </div>
          </el-dialog>

        </el-form></el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addBusStrategyTradeList, delBusStrategyTradeList, getBusStrategyTradeList, listBusStrategyTradeList, updateBusStrategyTradeList } from '@/api/business/bus-strategy-trade-list'
import { listBusStrategyInstance } from '@/api/business/bus-strategy-instance'
import { listBusStrategySymbolGroup } from '@/api/business/bus-strategy-symbol-group'

export default {
  name: 'BusStrategyTradeList',
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
      busStrategyTradeList: [],
      // 交易对组
      symbolGroupList: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        strategyInstanceId: undefined

      },
      // 表单参数
      form: {
      },
      batchOpen: false,
      batchForm: {
        symbolGroupId: undefined,
        symbols: ''
      },
      // 表单校验
      rules: {}
    }
  },
  created() {
    this.getSymbolGroupList()
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusStrategyTradeList(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategyTradeList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    getSymbolGroupList() {
      const queryGroupParams = {
        pageIndex: 1,
        pageSize: 10000,
        groupType: '2'
      }
      listBusStrategySymbolGroup(queryGroupParams).then(response => {
        this.symbolGroupList = this.setItems(response, 'id', 'groupName')
      })
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
        strategyInstanceId: undefined,
        symbol: undefined
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
      this.queryParams = {
        pageIndex: 1,
        pageSize: 10000
      }
      listBusStrategyInstance(this.queryParams).then(response => {
        this.strategyInstanceList = response.data.list
        this.open = true
        this.title = '添加交易币种配置'
        this.isEdit = false
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusStrategyTradeList(id).then(response => {
        this.form = response.data
        // this.form.symbolGroupId = parseInt(response.data.symbolGroupId)
        console.log(this.symbolGroupList)
        console.log(this.form)
        this.open = true
        this.title = '修改交易币种配置'
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
              updateBusStrategyTradeList(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusStrategyTradeList(this.form).then(response => {
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

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delBusStrategyTradeList({ 'ids': Ids })
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
    // 打开批量添加弹框
    handleBatchAdd() {
      this.batchForm = {
        symbolGroupId: undefined,
        symbols: ''
      }
      this.batchOpen = true
    },

    // 提交批量添加
    submitBatchForm() {
      // 验证表单
      if (!this.batchForm.symbolGroupId || !this.batchForm.symbols) {
        this.$message.error('请填写币对组和交易币种')
        return
      }

      // 将 symbols 文本解析为数组
      const symbolsArray = this.batchForm.symbols
        .split(';')
        .map(s => s.trim())
        .filter(s => s) // 去除空字符串

      if (symbolsArray.length === 0) {
        this.$message.error('请至少输入一个交易币种')
        return
      }

      // 构造请求数据
      const requestData = symbolsArray.map(symbol => ({
        symbolGroupId: this.batchForm.symbolGroupId,
        symbol: symbol
      }))

      // 批量请求
      Promise.all(requestData.map(data => addBusStrategyTradeList(data)))
        .then(responses => {
          if (responses.every(res => res.code === 200)) {
            this.$message.success('批量添加成功')
            this.batchOpen = false
            this.getList() // 重新加载列表
          } else {
            this.$message.error('部分数据添加失败，请检查')
          }
        })
        .catch(() => {
          this.$message.error('批量添加失败')
        })
    }
  }
}
</script>
