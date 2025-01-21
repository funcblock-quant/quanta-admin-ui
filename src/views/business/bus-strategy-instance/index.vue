
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card" style="display: flex; flex-direction: column; height: 100%;">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="策略" prop="strategyId">
            <el-select
              v-model="queryParams.strategyId"
              placeholder="请选择策略"
              clearable
              size="small"
            >
              <el-option
                v-for="strategy in strategyList"
                :key="strategy.key"
                :value="strategy.key"
                :label="strategy.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="20" class="mb8">
          <el-col :span="4">
            <el-button
              v-permisaction="['business:busStrategyInstance:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增实例
            </el-button>

            <el-button
              type="primary"
              size="mini"
              icon="el-icon-files"
              @click="toggleBulkMode"
            >批量操作
            </el-button>
          </el-col>
        </el-row>
        <el-row v-if="isBulkMode" class="bulk-toolbar">
          <el-button size="mini" @click="selectAll">全选</el-button>
          <el-button size="mini" @click="clearSelection">取消全选</el-button>
          <el-button
            type="primary"
            size="mini"
            @click="startSelectedInstances"
          >批量启动</el-button>
          <el-button size="mini" @click="toggleBulkMode">退出批量操作</el-button>
        </el-row>
        <div class="card-container" @scroll="handleScroll">
          <el-row :gutter="50">
            <el-col v-for="item in busStrategyInstanceList" :key="item.id" :span="8">
              <div class="card-header">
                <el-checkbox
                  v-if="isBulkMode"
                  v-model="selectedItems"
                  :label="item.id"
                  :value="item.id"
                />
              </div>
              <el-card
                :class="{ clickable: !isBulkMode }"
                @click.native="isBulkMode ? null : handleCardClick(item)"
              >

                <div class="card-status" :class="statusClass(item.status)" />
                <div class="card-content">
                  <div class="info-row">
                    <span class="info-title">实例id:</span>
                    <span class="info-value">{{ item.id || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">策略:</span>
                    <span class="info-value">{{ item.strategyName || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">实例名称:</span>
                    <span class="info-value">{{ item.instanceName || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">启动时间:</span>
                    <span class="info-value">{{ item.startRunTime || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-title">停止时间:</span>
                    <span class="info-value">{{ item.stopRunTime || '-' }}</span>
                  </div>
                </div>

                <div class="card-actions">
                  <el-button
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    :disabled="item.status === '1'"
                    @click.stop="handleUpdate(item)"
                  >修改
                  </el-button>
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-play"
                    :disabled="item.status === '1'"
                    @click.stop="handleStart(item)"
                  >启用
                  </el-button>
                  <el-button
                    slot="reference"
                    v-permisaction="['business:busStrategyInstance:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-video-pause"
                    :disabled="item.status === '0'"
                    @click.stop="handleStop(item)"
                  >停用
                  </el-button>
                  <el-popconfirm
                    class="delete-popconfirm"
                    title="确认要下线实例吗?"
                    confirm-button-text="下线"
                    @confirm="handleDelete(item)"
                  >
                    <el-button
                      slot="reference"
                      v-permisaction="['business:busStrategyInstance:remove']"
                      size="mini"
                      type="text"
                      icon="el-icon-delete"
                      :disabled="item.status === '1'"
                      @click.stop
                    >下线实例
                    </el-button>
                  </el-popconfirm>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 加载状态提示 -->
          <div v-if="isLoading" class="loading-text">加载中...</div>
          <div v-if="isNoMoreData" class="no-more-data">没有更多数据了</div>
        </div>

        <!-- 增加策略实例 -->
        <el-drawer :title="title" :visible.sync="open" :before-close="handleDrawClose">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-card class="fused-card" shadow="never">
              <div slot="header">
                <h5>策略基础信息</h5>

                <el-form-item label="策略" prop="strategyId">
                  <el-select
                    v-model="form.strategyId"
                    placeholder="请选择策略"
                    clearable
                    size="small"
                    :disabled="isEdit"
                    @change="getConfigSchema(form.strategyId)"
                  >
                    <el-option
                      v-for="strategy in strategyList"
                      :key="strategy.key"
                      :value="strategy.key"
                      :label="strategy.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="策略实例名称" prop="instanceName">
                  <el-input
                    v-model="form.instanceName"
                    placeholder="策略实例名称"
                  />
                </el-form-item>
                <el-form-item label="实例类型" prop="type">
                  <el-select
                    v-model="form.type"
                    placeholder="请选择实例类型"
                    clearable
                    size="small"
                  >
                    <el-option
                      v-for="type in instanceTypeList"
                      :key="type.key"
                      :value="type.key"
                      :label="type.value"
                    />
                  </el-select>
                </el-form-item>

              </div>
            </el-card>
            <!-- 分割线 -->
            <el-divider />
            <!--            <el-card class="fused-card" shadow="never">-->
            <!--              <div slot="header">-->
            <!--                <h5>选择服务器</h5>-->
            <!--                <el-form-item label="服务器" prop="serverIp">-->
            <!--                  <el-select-->
            <!--                    v-model="form.serverId"-->
            <!--                    placeholder="请选择要部署的服务器"-->
            <!--                  >-->
            <!--                    <el-option-->
            <!--                      v-for="server in serverList"-->
            <!--                      :key="server.id"-->
            <!--                      :value="`${server.id}`"-->
            <!--                      :label="formatServerInfo(server)"-->
            <!--                    />-->
            <!--                  </el-select>-->
            <!--                </el-form-item>-->
            <!--              </div>-->
            <!--            </el-card>-->

            <template>
              <el-card v-if="form.strategyId" class="fused-card" shadow="never">
                <div slot="header">
                  <h5>策略配置参数</h5>
                </div>
                <!--                <codemirror-->
                <!--                  ref="editor"-->
                <!--                  v-model="form.schema.schemaText"-->
                <!--                  :options="options"-->
                <!--                />-->
                <fieldset>
                  <RecursiveForm :data="form.schema.parsedData" />
                </fieldset>
              </el-card>
            </template>
          </el-form>
          <br>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </el-drawer>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import {
  addBusStrategyInstance, batchStartBusStrategyInstance,
  delBusStrategyInstance,
  getBusStrategyInstance,
  listBusStrategyInstance,
  startBusStrategyInstance, stopBusStrategyInstance,
  updateBusStrategyInstance
} from '@/api/business/bus-strategy-instance'
import { listBusStrategyBaseInfo } from '@/api/business/bus-strategy-base-info'
import editor from '@/views/dashboard/editor/index.vue'
import { listBusServerInfo } from '@/api/business/bus-server-info'
import '@/api/tools/cm-setting.js'
import * as YAML from 'yaml-ast-parser'
import toml from 'toml'
import RecursiveForm from '@/components/CodeMirrorInput/RecursiveForm.vue'
import { listBusStrategyConfigSchemaByInstanceId } from '@/api/business/bus-strategy-config-schema'

export default {
  name: 'BusStrategyInstance',
  components: {
    RecursiveForm
  },
  data() {
    return {
      options: {
        line: true,
        theme: '3024-day', // 主题
        tabSize: 4, // 制表符的宽度
        indentUnit: 2, // 一个块应该缩进多少个空格（无论这在编辑语言中意味着什么）。默认值为 2。
        firstLineNumber: 1, // 从哪个数字开始计算行数。默认值为 1。
        readOnly: false, // 只读
        smartIndent: true, // 上下文缩进
        lineNumbers: true, // 是否显示行号
        styleActiveLine: true, // 高亮选中行
        viewportMargin: Infinity, // 处理高度自适应时搭配使用
        showCursorWhenSelecting: true, // 当选择处于活动状态时是否应绘制游标
        mode: 'yaml'
      },
      instanceTypeList: [
        { key: '0', value: '观察' },
        { key: '1', value: '交易' }
      ],
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
      labelWidth: '120px',
      // 是否显示弹出层
      open: false,
      // 修改实例弹出层
      editOpen: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      // 关系表类型
      strategyList: [],
      // 可用服务器列表
      serverList: [],

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 9,
        strategyId: undefined

      },
      busStrategyInstanceList: [], // 卡片列表
      isLoading: false, // 是否正在加载数据
      isNoMoreData: false, // 是否没有更多数据
      // 表单参数
      form: {
        schema: {
          schemaText: undefined, // 存储 YAML 字符串
          schemaType: 'yaml',
          parsedData: {} // 存储解析后的动态对象
        }
      },
      // 表单校验
      rules: { strategyId: [{ required: true, message: '策略id不能为空', trigger: 'blur' }],
        instanceName: [{ required: true, message: '策略实例名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '实例类型不能为空', trigger: 'blur' }]
      },
      isBulkMode: false,
      selectedItems: []
    }
  },
  computed: {
    editor() {
      return editor
    }
  },
  created() {
    this.loadData() // 初始化加载第一页数据
    this.getStrategyList()
    this.getServerList()
    this.getDicts('bus_exchange_type').then(response => {
      this.exchangeTypeDicts = response.data
    })
  },
  methods: {
    // 批量启动实例
    toggleBulkMode() {
      this.isBulkMode = !this.isBulkMode
      this.selectedItems = [] // 重置选择
    },
    selectAll() {
      console.log('selectAll: ', this.busStrategyInstanceList)
      this.selectedItems = this.busStrategyInstanceList.map(item => item.id)
      console.log('after selectAll: ', this.selectedItems)
    },
    clearSelection() {
      this.selectedItems = []
    },
    startSelectedInstances() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要启动的实例！')
        return
      }
      // 批量启动 API 请求
      console.log('启动实例：', this.selectedItems)
      this.batchSubmitStartForm()
      // 提交逻辑
    },

    handleYamlChange() {
      try {
        const parsedAst = YAML.load(this.form.schema.schemaText) // 将 YAML 解析为 AST
        const lines = this.form.schema.schemaText.split('\n') // 将 YAML 拆分成行
        console.log(lines)
        console.log('parsedAst', parsedAst)

        // 递归解析 YAML 节点
        const parseNode = (node, lineIndexContext = { currentLine: 0 }) => {
          if (!node) return

          // 针对不同类型的 YAML 节点进行处理
          if (Array.isArray(node.mappings)) {
            // 处理对象结构
            const result = {}
            node.mappings.forEach((childNode) => {
              const key = childNode.key.value // 字段名
              const value = parseNode(childNode.value, lineIndexContext) // 递归解析值

              // 获取注释（通过 startPosition 转行号）
              const lineIndex = this.getLineIndexFromPosition(this.form.schema.schemaText, childNode.startPosition)
              const comment = this.getPreviousComment(lines, lineIndex)

              // 记录字段和注释
              result[key] = {
                value: value !== undefined ? value : null,
                label: comment || key
              }
            })
            return result
          } else if (node.items) {
            // 处理数组结构
            return node.items.map((item) => parseNode(item, lineIndexContext))
          } else if (node.value) {
            // 处理标量值
            return node.value
          }

          return null // 其他情况返回 null
        }

        // 开始解析根节点
        const result = parseNode(parsedAst)
        console.log('form.schema.schemaText', result)
        this.$set(this.form.schema, 'parsedData', result)
      } catch (error) {
        console.error('YAML 解析出错:', error)
      }
    },
    // 提取行号的工具方法
    getLineIndexFromPosition(yamlString, position) {
      const lines = yamlString.split('\n')
      let currentPos = 0

      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1 // 包括换行符
        if (currentPos + lineLength > position) {
          return i // 找到对应行号
        }
        currentPos += lineLength
      }

      return -1 // 如果无法找到，返回无效值
    },
    /** 解析toml配置，动态生成表单*/
    // handleTomlChange() {
    //   try {
    //     const lines = this.form.schema.schemaText.split('\n')
    //     const comments = {}
    //     let currentPath = ''
    //     console.log('lines', lines)
    //
    //     // 解析 TOML 节点
    //     lines.forEach((line, index) => {
    //       const trimmedLine = line.trim()
    //
    //       if (trimmedLine.startsWith('#')) {
    //         // 提取注释
    //         const comment = trimmedLine.substring(1).trim()
    //         // 查找下一个非空非注释行，提取key
    //         for (let i = index + 1; i < lines.length; i++) {
    //           const nextLine = lines[i].trim()
    //           if (nextLine.length > 0 && !nextLine.startsWith('#')) {
    //             const keyMatch = nextLine.match(/^([a-zA-Z0-9_.-]+)\s*=/)
    //             if (keyMatch) {
    //               comments[currentPath ? `${currentPath}.${keyMatch[1]}` : keyMatch[1]] = comment
    //               break
    //             } else if (nextLine.startsWith('[')) {
    //               const pathMatch = nextLine.match(/\[(.*?)\]/)
    //               if (pathMatch) {
    //                 currentPath = pathMatch[1]
    //                 if (currentPath.includes('.')) {
    //                   currentPath = currentPath.replaceAll('"', '')
    //                 }
    //               }
    //               break
    //             }
    //           }
    //         }
    //       }
    //     })
    //     console.log('comments', comments)
    //     const parsedTOML = toml.parse(this.form.schema.schemaText)
    //     console.log('parsedTOML', parsedTOML)
    //
    //     const addCommentsToResult = (node, path = '') => {
    //       console.log('node', node)
    //       console.log('path', path)
    //       if (typeof node === 'object' && node !== null) {
    //         if (Array.isArray(node)) {
    //           console.log('this node is array')
    //           return node.map((item, index) => addCommentsToResult(item, path ? `${path}[${index}]` : `[${index}]`))
    //         } else {
    //           console.log('this node is not array')
    //           const result = {}
    //           for (const key in node) {
    //             console.log('key', key)
    //             if (Object.prototype.hasOwnProperty.call(node, key)) {
    //               console.log('Object.prototype.hasOwnProperty.call is true')
    //               const currentPath = path ? `${path}.${key}` : key
    //               console.log('currentPath', currentPath)
    //               console.log('comments[currentPath]', currentPath)
    //               result[key] = {
    //                 value: addCommentsToResult(node[key], currentPath),
    //                 label: comments[currentPath] || key
    //               }
    //             }
    //           }
    //           return result
    //         }
    //       } else {
    //         console.log('path', [path.split('.').pop()])
    //         console.log('comments[path.split(\'.\').pop()', comments[path.split('.').pop()])
    //
    //         return { value: node, label: comments[path.split('.').pop()] || (path ? path.split('.').pop() : '') }
    //       }
    //     }
    //
    //     const result = addCommentsToResult(parsedTOML)
    //     console.log('form.schema.schemaText', result)
    //     this.$set(this.form.schema, 'parsedData', result)
    //   } catch (e) {
    //     console.error('TOML 解析出错:', e)
    //     return null
    //   }
    // },

    handleTomlChange() {
      try {
        const lines = this.form.schema.schemaText.split('\n')
        const comments = {}
        let currentSection = ''

        // 解析 TOML 注释并记录路径
        lines.forEach((line, index) => {
          const trimmedLine = line.trim()

          if (trimmedLine.startsWith('#')) {
            const comment = trimmedLine.substring(1).trim()
            for (let i = index + 1; i < lines.length; i++) {
              const nextLine = lines[i].trim()
              if (nextLine.length > 0 && !nextLine.startsWith('#')) {
                const keyMatch = nextLine.match(/^([a-zA-Z0-9_.-]+)\s*=/)
                if (keyMatch) {
                  const fullPath = currentSection
                    ? `${currentSection}.${keyMatch[1]}`
                    : keyMatch[1]
                  comments[fullPath] = comment
                  break
                } else if (nextLine.startsWith('[')) {
                  const sectionMatch = nextLine.match(/\[(.*?)\]/)
                  if (sectionMatch) {
                    currentSection = sectionMatch[1].replace(/"/g, '')
                  }
                  break
                }
              }
            }
          }

          // 检测 section 的切换
          if (trimmedLine.startsWith('[')) {
            const sectionMatch = trimmedLine.match(/\[(.*?)\]/)
            if (sectionMatch) {
              currentSection = sectionMatch[1].replace(/"/g, '')
            }
          }
        })

        console.log('Parsed comments:', comments)

        // 解析 TOML
        const parsedTOML = toml.parse(this.form.schema.schemaText)
        console.log('Parsed TOML:', parsedTOML)

        // 转换为目标格式
        const addCommentsToResult = (node, path = '') => {
          if (typeof node === 'object' && node !== null) {
            const result = {}

            // 如果是数组
            if (Array.isArray(node)) {
              return node.map((item, index) =>
                addCommentsToResult(item, path ? `${path}[${index}]` : `[${index}]`)
              )
            }

            for (const key in node) {
              if (Object.prototype.hasOwnProperty.call(node, key)) {
                const fullPath = path ? `${path}.${key}` : key

                // 如果是对象，递归处理
                if (typeof node[key] === 'object' && node[key] !== null) {
                  result[key] = {
                    value: addCommentsToResult(node[key], fullPath), // 对嵌套值递归
                    label: comments[fullPath] || key // 根据路径获取注释
                  }
                } else {
                  result[key] = {
                    value: node[key], // 直接赋值为 value
                    label: comments[fullPath] || key // 默认label是key
                  }
                }
              }
            }

            return result
          } else {
            return {
              value: node,
              label: comments[path] || path.split('.').pop() || '' // 添加注释信息
            }
          }
        }

        const result = addCommentsToResult(parsedTOML)
        console.log('Final Parsed Data:', result)

        // 更新表单数据
        this.$set(this.form.schema, 'parsedData', result)
      } catch (e) {
        console.error('TOML Parsing Error:', e)
        return null
      }
    },
    // 提取上一行注释的工具方法
    getPreviousComment(lines, currentLineIndex) {
      if (currentLineIndex <= 0 || currentLineIndex >= lines.length) return '' // 无效行索引

      const prevLine = lines[currentLineIndex - 1]?.trim() // 提取前一行，避免索引越界
      console.log('prevLine', prevLine)
      if (prevLine && prevLine.startsWith('#')) {
        return prevLine.slice(1).trim() // 返回去除 # 后的注释内容
      }
      return '' // 无注释
    },
    /** 查询参数列表 */
    getList() {
      this.loading = true
      console.log('this.queryParams', this.queryParams)
      listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.busStrategyInstanceList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },

    // 获取策略列表
    getStrategyList() {
      this.getItems(listBusStrategyBaseInfo, undefined).then(res => {
        this.strategyList = this.setItems(res, 'id', 'strategyName')
        console.log('strategyList', this.strategyList)
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
        strategyId: undefined,
        accountGroupId: undefined,
        exchangeId1: undefined,
        exchange1Type: undefined,
        exchange1TypeLabel: undefined,
        exchangeId2: undefined,
        exchange2Type: undefined,
        exchange2TypeLabel: undefined,
        instanceName: undefined,
        serverId: undefined,
        startRunTime: undefined,
        stopRunTime: undefined,
        schema: {
          schemaText: undefined,
          schemaType: 'yaml'
        }
      }
      this.configurationsDicts = []
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
      this.busStrategyInstanceList = []
      this.isNoMoreData = false
      this.isLoading = false
      this.loadData()
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
      this.title = '添加策略实例'
      this.isEdit = false
    },
    handleDrawClose(done) {
      this.$confirm('关闭后表单数据会丢失，确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      console.log('row', row)
      getBusStrategyInstance(id).then(response => {
        this.form = response.data
        if (response.data.schema.schemaType === 'yaml') {
          this.handleYamlChange()
        } else if (response.data.schema.schemaType === 'toml') {
          this.handleTomlChange()
        }
      })
      this.open = true
      this.title = '修改策略实例配置'
      this.isEdit = true
    },

    rebuildYaml(data, indentLevel = 0) {
      if (typeof data !== 'object' || data === null) return data

      const indent = '  '.repeat(indentLevel) // 用于控制嵌套时的缩进
      let yaml = ''

      Object.entries(data).forEach(([key, { value, label: comment }]) => {
        if (comment) {
          yaml += `${indent}# ${comment}\n` // 插入注释
        }

        if (typeof value === 'object' && value !== null) {
          // 递归处理嵌套对象
          yaml += `${indent}${key}:\n${this.rebuildYaml(value, indentLevel + 1)}`
        } else {
          // 简单键值对
          yaml += `${indent}${key}: ${value}\n`
        }
      })
      return yaml
    },

    rebuildToml(data, path = '') {
      if (typeof data !== 'object' || data === null) return data

      let toml = ''

      Object.entries(data).forEach(([key, { value, label: comment }]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (typeof value === 'object' && value !== null) {
          // 处理嵌套对象（TOML 中称为表格）
          if (!Array.isArray(value)) {
            // 如果不是数组，则创建表格
            toml += `\n[${currentPath}]\n`
            toml += this.rebuildToml(value, currentPath) // 递归调用
          } else {
            // 处理数组
            if (comment) {
              toml += `# ${comment}\n`
            }
            toml += `${currentPath} = ${JSON.stringify(value)}\n`
          }
        } else {
          // 处理简单键值对
          if (comment) {
            toml += `# ${comment}\n` // 插入注释
          }
          if (typeof value === 'string') {
            toml += `${key} = "${value}"\n` // 字符串需要用引号包裹
          } else if (typeof value === 'number') {
            toml += `${key} = ${value}\n` // 数字直接输出
          } else if (typeof value === 'boolean') {
            toml += `${key} = ${value}\n` // 布尔值直接输出
          } else if (value === null) {
            toml += `${key} = ""\n`
          }
        }
      })

      return toml
    },
    /** 提交按钮 */
    submitForm: function() {
      // 使用递归函数生成 YAML 字符串
      let updatedSchema = ''
      if (this.form.schema.schemaType === 'yaml') {
        updatedSchema = this.rebuildYaml(this.form.schema.parsedData)
      } else if (this.form.schema.schemaType === 'toml') {
        updatedSchema = this.rebuildToml(this.form.schema.parsedData)
      }

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
            this.$set(this.form.schema, 'schemaText', updatedSchema)

            if (this.form.id !== undefined) {
              updateBusStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.queryParams.pageIndex = 1
                  this.getList()
                } else {
                  this.msgError(response.msg)
                }
              })
            } else {
              addBusStrategyInstance(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess(response.msg)
                  this.open = false
                  this.queryParams.pageIndex = 1
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
        return delBusStrategyInstance({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          console.log('delete success')
          this.queryParams.pageIndex = 1
          this.busStrategyInstanceList = []
          console.log('this.queryParams', this.queryParams)
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    },
    // 模拟加载数据的函数
    async loadData() {
      if (this.isLoading || this.isNoMoreData) {
        return
      }
      this.isLoading = true

      // 异步加载数据
      setTimeout(() => {
        listBusStrategyInstance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.total = response.data.count

          this.loading = false
          if (!response.data.list.length || response.data.list.length < this.queryParams.pageSize) {
            this.isNoMoreData = true // 数据量小于页面大小，无更多数据
          }
          this.busStrategyInstanceList = [...this.busStrategyInstanceList, ...response.data.list] // 追加新数据
          this.queryParams.pageIndex += 1 // 更新页码
          this.isLoading = false // 加载完成
        }, 1000) // 模拟加载时间
      })
    },
    // 监听滚动事件
    handleScroll(e) {
      console.log('滚动事件触发')
      const container = e.target
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        this.loadData() // 触底加载更多数据
      }
    },
    handleCardClick(item) {
      // 根据需要进行跳转，可以使用路由导航或直接打开新页面
      this.$router.push({ name: 'Dashboard', query: { instanceId: item.id }})
    },

    getConfigSchema(strategyId) {
      listBusStrategyConfigSchemaByInstanceId(strategyId).then(response => {
        this.$set(this.form.schema, 'schemaText', response.data.list[0].schemaText)
        this.$set(this.form.schema, 'schemaType', response.data.list[0].schemaType)
        console.log('response.data.list[0].schemaText', response.data.list[0].schemaText)
        console.log('this.form.schema', this.form.schema)

        this.$nextTick(() => {
          console.log('this.form.schema after update:', this.form.schema)
          if (this.form.schema.schemaType === 'yaml') {
            console.log('parse yaml')
            this.handleYamlChange()
          } else if (this.form.schema.schemaType === 'toml') {
            console.log('parse toml')
            this.handleTomlChange()
          }
        })
      })
    },
    getServerList() {
      // 查询当前状态为已启用的服务器列表
      var queryServersParams = {
        pageIndex: 1,
        pageSize: 1000,
        status: 1,
        networkStatus: 1
      }
      listBusServerInfo(queryServersParams).then(response => {
        this.serverList = response.data.list
      })
    },
    formatServerInfo(server) {
      return server.serverIp + '(' + server.cpuNum + '核 ' + server.memorySize + 'G)'
    },
    handleStart(row) { // 新增处理启用方法
      this.$confirm('是否确认启动该策略实例?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStartForm(row) // 调用提交停用请求的方法，并将 row 传递过去
      })
    },
    handleStop(row) { // 新增处理停用方法
      this.$confirm('是否确认停用该策略实例?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitStopForm(row) // 调用提交停用请求的方法，并将 row 传递过去
      })
    },
    /** 停用服务器 */
    submitStopForm(row) {
      console.log('stop server with id:', row.id)
      stopBusStrategyInstance(row.id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.queryParams.pageIndex = 1
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    /** 启用策略实例 */
    submitStartForm(row) {
      console.log('start server with id:', row.id)
      startBusStrategyInstance(row.id).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.queryParams.pageIndex = 1
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },

    /** 批量启用策略实例 */
    batchSubmitStartForm() {
      console.log('selected items:', this.selectedItems)
      const batchStartParams = {
        ids: this.selectedItems.map(id => parseInt(id, 10))
      }
      console.log('batchStartParams', batchStartParams)
      batchStartBusStrategyInstance(batchStartParams).then(response => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.queryParams.pageIndex = 1
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      })
    },
    // 根据状态，显示不同的状态样式
    statusClass(status) {
      if (status === '0') { // 假设 0 代表暂停
        return 'status-paused'
      } else if (status === '1') { // 假设 1 代表运行中
        return 'status-running'
      }
      return '' // 其他状态，不添加样式
    }
  }
}
</script>

<style>
  .custom-card {
    margin-bottom: 20px; /* 添加卡片下方间隙 */
  }
  .card-actions {
    display: flex;
    justify-content: space-between;
  }
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 10px; /* 每行之间的间距 */
  }

  .info-row {
    display: flex;
    justify-content: space-between;
  }

  .info-title {
    font-weight: bold; /* 标题加粗 */
    color: #333;
  }

  .info-value {
    color: #666;
    text-align: right;
    word-break: break-word; /* 处理可能过长的内容换行 */
  }

  .card-container {
    max-height: 800px;
    overflow-y: auto;
    padding-right: 10px; /* 滚动条空间 */
    position: relative; /* 用于控制内部布局 */
  }
  .custom-card {
    margin-bottom: 20px;
  }
  .loading-text,
  .no-more-data {
    text-align: center;
    padding: 10px 0;
    color: #999;
    font-size: 14px;
  }
  .clickable-card {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .clickable-card:hover {
    background-color: #f5f5f5;
  }
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
  .label-container {
    display: inline-flex; /* 使用 inline-flex，更灵活 */
    align-items: center;
  }
  .custom-card {
    position: relative; /* 使小圆点可以定位 */
  }
  .card-status {
    position: absolute;
    top: 20px; /* 调整位置 */
    right: 10px; /* 调整位置 */
    width: 8px;
    height: 8px;
    border-radius: 100%; /* 圆形 */
  }
  .status-paused {
    background-color: #d00000;
  }
  .status-running {
    background-color: green;
  }
  .loading-text, .no-more-data {
    text-align: center;
    padding: 10px;
  }
  .tooltip-icon {
    margin-left: 5px;
    cursor: pointer;
  }
  @media (min-width: 800px) {
    .responsive-width {
      width: 300px;
    }
  }
</style>
