<template>
  <div class="recursive-form">
    <div v-for="(item, key) in data" :key="key" class="form-group">
      <!-- 递归渲染嵌套对象 -->
      <div v-if="item && item.value && typeof item.value === 'object'" class="nested-field">
        <fieldset class="nested-fieldset">
          <legend>{{ item.label || key }}</legend>
          <RecursiveForm :data="item.value" />
        </fieldset>
      </div>

      <!-- 渲染简单的表单项 -->
      <div v-else-if="item && (item.value !== undefined)" class="form-item">
        <label :for="key" class="form-label">{{ item.label }}</label>
        <input
          :id="key"
          v-model="item.value"
          class="form-input"
          :placeholder="item.label"
          :type="getInputType(item.type)"
          @input="handleInput(item)"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecursiveForm',
  props: {
    data: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false // 默认为可编辑
    }
  },
  methods: {
    getInputType(type) {
      // 根据字段类型确定输入框类型
      switch (type) {
        case 'number':
          return 'number'
        case 'boolean':
          return 'checkbox'
        default:
          return 'text' // 默认是字符串
      }
    },
    handleInput(item) {
      if (this.readonly) return
      if (item.type === 'number') {
        item.value = Number(item.value) // 强制转换为数字
      } else if (item.type === 'boolean') {
        item.value = Boolean(item.value) // 强制转换为布尔值
      }
      // 字符串和其他类型不需要特殊处理
    }
  }
}
</script>

<style scoped>
.recursive-form {
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  padding: 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.form-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #444;
}

.form-input {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #007BFF;
}

.nested-field {
  margin-left: 15px;
  padding-left: 10px;
  border-left: 2px solid #ddd;
}

.nested-fieldset {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
}

.nested-fieldset legend {
  font-size: 14px;
  font-weight: bold;
  color: #555;
  padding: 0 5px;
}
</style>
