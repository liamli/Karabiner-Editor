<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElDialog, ElButton, ElRow, ElCol, ElSelect, ElOption } from 'element-plus'

const props = defineProps<{
  visible: boolean
  title?: string
  currentValue?: string
  defaultKeyType?: 'main' | 'modifier'
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'select': [key: string]
}>();

const selectedKeys = ref<Set<string>>(new Set())
const selectedKeyType = ref(props.defaultKeyType)

// 监听 defaultKeyType 的变化
watch(() => props.defaultKeyType, (newValue) => {
  if (newValue) {
    selectedKeyType.value = newValue
  }
}, { immediate: true })

// 监听 currentValue 的变化
watch(() => props.currentValue, (newValue) => {
  selectedKeys.value.clear()
  if (newValue) {
    newValue.split(',').forEach(key => selectedKeys.value.add(key))
  }
}, { immediate: true })

// 定义按键组
const functionKeys = Array.from({ length: 12 }, (_, i) => `f${i + 1}`)
const numberKeys = Array.from({ length: 10 }, (_, i) => `${i}`)
const letterKeys = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))
const specialKeys = [
  'caps_lock',
  'delete_or_backspace',
  'escape',
  'return_or_enter',
  'spacebar',
  'tab',
  'grave_accent_and_tilde',
  'hyphen',
  'equal_sign',
  'open_bracket',
  'close_bracket',
  'backslash',
  'semicolon',
  'quote',
  'comma',
  'period',
  'slash'
]
const otherKeys = [
  'page_up',
  'page_down',
  'up_arrow',
  'down_arrow',
  'left_arrow',
  'right_arrow'
]
const modifierKeys = [
  'caps_lock',
  'left_command',
  'left_control',
  'left_option',
  'left_shift',
  'right_command',
  'right_control',
  'right_option',
  'right_shift',
  'fn',
  'command',
  'control',
  'option',
  'shift'
]

// 按键类型选项
const keyTypeOptions = [
  { label: '主键', value: 'main' },
  { label: '修饰键', value: 'modifier' }
]

// 按键显示名称映射
const keyDisplayNames: Record<string, string> = {
  // 特殊键
  delete_or_backspace: '⌫',
  escape: 'Esc',
  return_or_enter: '↵',
  spacebar: 'Space',
  tab: 'Tab',
  grave_accent_and_tilde: '~/`',
  hyphen: '-',
  equal_sign: '=',
  open_bracket: '[',
  close_bracket: ']',
  backslash: '\\',
  semicolon: ';',
  quote: '\'',
  comma: ',',
  period: '.',
  slash: '/',
  // 其他键
  page_up: 'PgUp',
  page_down: 'PgDn',
  up_arrow: '↑',
  down_arrow: '↓',
  left_arrow: '←',
  right_arrow: '→',
  // 修饰键
  caps_lock: 'Caps',
  left_command: 'Command⬅',
  left_control: 'Control⬅',
  left_option: 'Option⬅',
  left_shift: 'Shift⬅',
  right_command: 'Command➡',
  right_control: 'Control➡',
  right_option: 'Option➡',
  right_shift: 'Shift➡',
  fn: 'Fn',
  command: 'Command',
  control: 'Control',
  option: 'Option',
  shift: 'Shift'
}

// 处理按键点击
const handleKeyClick = (key: string) => {
  // 如果是主键，实现单选逻辑
  if (selectedKeyType.value === 'main') {
    // 如果点击的是已选中的键，则取消选中
    if (selectedKeys.value.has(key)) {
      selectedKeys.value.delete(key)
    } else {
      // 清除之前选中的所有主键
      Array.from(selectedKeys.value).forEach(k => {
        if (!modifierKeys.includes(k)) {
          selectedKeys.value.delete(k)
        }
      })
      // 添加新选中的主键
      selectedKeys.value.add(key)
    }
  } else {
    // 修饰键保持多选逻辑
    if (selectedKeys.value.has(key)) {
      selectedKeys.value.delete(key)
    } else {
      selectedKeys.value.add(key)
    }
  }
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 处理取消
const handleCancel = () => {
  selectedKeys.value.clear()
  if (props.currentValue) {
    props.currentValue.split(',').forEach(key => selectedKeys.value.add(key))
  }
  handleClose()
}

// 处理确定
const handleConfirm = () => {
  const selectedKeysArray = Array.from(selectedKeys.value)
  emit('select', selectedKeysArray.join(','))
  handleClose()
}
</script>

<template>
  <el-dialog
    :modelValue="visible"
    @update:modelValue="emit('update:visible', $event)"
    title="按键列表"
    width="80%"
    :show-close="true"
    @close="handleClose"
  >
    <div class="key-selector">
      <!-- 按键类型选择 -->
      <el-select v-model="selectedKeyType" class="key-type-select" placeholder="选择按键类型" disabled>
        <el-option
          v-for="option in keyTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>

      <!-- 主键（功能键、数字键、字母键、特殊键、其他键） -->
      <template v-if="selectedKeyType === 'main'">
        <!-- 功能键 F1-F12 -->
        <el-row class="key-row" justify="space-around">
          <el-col :span="2" v-for="key in functionKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ key.toUpperCase() }}
            </el-button>
          </el-col>
        </el-row>

        <!-- 数字键 0-9 -->
        <el-row class="key-row" justify="space-around">
          <el-col :span="2" v-for="key in numberKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ key }}
            </el-button>
          </el-col>
        </el-row>

        <!-- 字母键 a-z -->
        <el-row class="key-row" justify="space-around">
          <el-col :span="2" v-for="key in letterKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ key.toUpperCase() }}
            </el-button>
          </el-col>
        </el-row>

        <!-- 特殊键 -->
        <el-row class="key-row" justify="space-around">
          <el-col :span="3" v-for="key in specialKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ keyDisplayNames[key] || key }}
            </el-button>
          </el-col>
        </el-row>

        <!-- 其他键 -->
        <el-row class="key-row" justify="space-around">
          <el-col :span="4" v-for="key in otherKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ keyDisplayNames[key] || key }}
            </el-button>
          </el-col>
        </el-row>
      </template>

      <!-- 修饰键 -->
      <template v-if="selectedKeyType === 'modifier'">
        <el-row class="key-row" justify="space-around">
          <el-col :span="4" v-for="key in modifierKeys" :key="key">
            <el-button
              :class="{ 'is-active': selectedKeys.has(key) }"
              @click="handleKeyClick(key)"
            >
              {{ keyDisplayNames[key] || key }}
            </el-button>
          </el-col>
        </el-row>
      </template>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.key-selector {
  padding: 20px;
}

.key-type-select {
  width: 100%;
  margin-bottom: 20px;
}

.key-row {
  margin-bottom: 15px;
}

.key-row :deep(.el-button) {
  width: 100%;
  min-width: 60px;
}

.key-row :deep(.el-button.is-active) {
  background-color: #409EFF;
  color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>