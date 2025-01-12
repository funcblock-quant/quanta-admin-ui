
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px">
          <el-form-item label="ip" prop="serverIp"><el-input
            v-model="queryParams.serverIp"
            placeholder="请输入ip"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="网络健康" prop="networkStatus"><el-select
            v-model="queryParams.networkStatus"
            placeholder="网络健康"
            clearable
            size="small"
          >
            <el-option
              v-for="dict in networkStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>
          <el-form-item label="服务器状态" prop="status"><el-select
            v-model="queryParams.status"
            placeholder="状态"
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
          <el-form-item label="cpu核心数" prop="cpuNum"><el-input
            v-model="queryParams.cpuNum"
            placeholder="cpu核心数"
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
              v-permisaction="['business:busServerInfo:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="busServerInfoList">
          <el-table-column
            label="ip"
            align="center"
            prop="serverIp"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="用户名"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="认证方式"
            align="center"
            prop="connectType"
            :formatter="connectTypeFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ connectTypeFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="网络健康"
            align="center"
            prop="networkStatus"
            :formatter="networkStatusFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ networkStatusFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="服务器状态"
            align="center"
            prop="status"
            :formatter="statusFormat"
            width="100"
          >
            <template slot-scope="scope">
              {{ statusFormat(scope.row) }}
            </template>
          </el-table-column><el-table-column
            label="cpu核心数"
            align="center"
            prop="cpuNum"
            :show-overflow-tooltip="true"
          /><el-table-column
            label="内存大小"
            align="center"
            prop="memorySize"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                slot="reference"
                v-permisaction="['business:busServerInfo:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <template v-if="scope.row.status === '2'">
                <el-popconfirm
                  class="delete-popconfirm"
                  title="确认要启用该服务器吗?"
                  confirm-button-text="启用"
                  @confirm="handleStart(scope.row)"
                >
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busServerInfo:remove']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-play"
                  >启用
                  </el-button>
                </el-popconfirm>
              </template>

              <template v-else-if="scope.row.status === '1'">
                <el-popconfirm
                  class="delete-popconfirm"
                  title="确认要停用吗? 停用后不能再绑定实例到该服务器，已运行的策略实例不受影响"
                  confirm-button-text="停用"
                  @confirm="handleStop(scope.row)"
                >
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busServerInfo:remove']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-pause"
                  >停用
                  </el-button>
                </el-popconfirm>
              </template>
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

        <!-- 添加对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="85px">

            <el-form-item label="ip" prop="serverIp">
              <el-input
                v-model="form.serverIp"
                placeholder="ip"
              />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
              />
            </el-form-item>
            <el-form-item label="认证方式" prop="connectType">
              <el-select
                v-model="form.connectType"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in connectTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="cpu核心数" prop="cpuNum">
              <el-input
                v-model="form.cpuNum"
                placeholder="cpu核心数"
              />
            </el-form-item>
            <el-form-item label="内存大小(G)" prop="memorySize">
              <el-input
                v-model="form.memorySize"
                placeholder="内存大小"
              />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 修改对话框 -->
        <el-dialog :title="title" :visible.sync="editOpen" width="500px">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">

            <el-form-item label="ip" prop="serverIp">
              <el-input
                v-model="form.serverIp"
                placeholder="ip"
                :disabled="true"
              />
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
              />
            </el-form-item>
            <el-form-item label="认证方式" prop="connectType">
              <el-select
                v-model="form.connectType"
                placeholder="请选择"
              >
                <el-option
                  v-for="dict in connectTypeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="cpu核心数" prop="cpuNum">
              <el-input
                v-model="form.cpuNum"
                placeholder="cpu核心数"
              />
            </el-form-item>
            <el-form-item label="内存大小" prop="memorySize">
              <el-input
                v-model="form.memorySize"
                placeholder="内存大小"
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
import {
  addBusServerInfo,
  delBusServerInfo,
  getBusServerInfo,
  listBusServerInfo, startBusServerInfo,
  stopBusServerInfo,
  updateBusServerInfo
} from '@/api/business/bus-server-info'

export default {
  name: 'BusServerInfo',
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
      // 是否显示新增弹出层
      open: false,
      // 是否显示修改弹出层
      editOpen: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      busServerInfoList: [],
      connectTypeOptions: [], networkStatusOptions: [], statusOptions: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        serverIp: undefined,
        networkStatus: undefined,
        status: undefined,
        cpuNum: undefined,
        memorySize: undefined

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: { serverIp: [{ required: true, message: 'ip不能为空', trigger: 'blur' }],
        networkStatus: [{ required: true, message: '网络健康不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '服务器状态不能为空', trigger: 'blur' }],
        cpuNum: [{ required: true, message: 'cpu核心数不能为空', trigger: 'blur' }],
        memorySize: [{ required: true, message: '内存大小不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('bus_connect_type').then(response => {
      this.connectTypeOptions = response.data
    })
    this.getDicts('bus_server_network_status').then(response => {
      this.networkStatusOptions = response.data
    })
    this.getDicts('bus_server_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listBusServerInfo(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busServerInfoList = response.data.list
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
        serverIp: undefined,
        username: undefined,
        connectType: undefined,
        networkStatus: undefined,
        status: undefined,
        cpuNum: undefined,
        memorySize: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    connectTypeFormat(row) {
      return this.selectDictLabel(this.connectTypeOptions, row.connectType)
    },
    networkStatusFormat(row) {
      return this.selectDictLabel(this.networkStatusOptions, row.networkStatus)
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
      this.title = '添加服务器管理'
      this.isEdit = false
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id =
                row.id || this.ids
      getBusServerInfo(id).then(response => {
        this.form = response.data
        this.editOpen = true
        this.title = '修改服务器管理'
        this.isEdit = true
      })
    },
    handleStop(row) { // 新增处理停用方法
      this.$confirm('是否确认停用该服务器?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStopForm(row) // 调用提交停用请求的方法，并将 row 传递过去
      })
    },
    handleStart(row) { // 新增处理启用方法
      this.$confirm('是否确认启用该服务器?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStartForm(row) // 调用提交停用请求的方法，并将 row 传递过去
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
              updateBusServerInfo(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.editOpen = false
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusServerInfo(this.form).then(response => {
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
        return delBusServerInfo({ 'ids': Ids })
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
    /** 停用服务器 */
    submitStopForm(row) {
      console.log('stop server with id:', row.id)
      stopBusServerInfo(row.id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 启用服务器 */
    submitStartForm(row) {
      console.log('start server with id:', row.id)
      startBusServerInfo(row.id).then(response => {
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
