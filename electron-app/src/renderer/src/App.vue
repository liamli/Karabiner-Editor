<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElContainer, ElHeader, ElMain, ElAside, ElFooter, ElInput, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import KeySelector from './components/KeySelector.vue'
import { nanoid } from 'nanoid' //或者自己写一个简单的生成ID函数  
import { fetchDevices, type Device } from './utils/deviceManager'


interface KeyConfig {
  selectedKey: string
  selectedModifier: string
}

interface Rule {
  id: string
  type: string
  from: KeyConfig
  to: KeyConfig
}

const description = ref('')
const rules = ref<Rule[]>([])
const selectedDevice = ref<string | undefined>(undefined)
const devices = ref<Device[]>([])
const keySelectorVisible = ref(false)
const currentEditingType = ref('')
const currentEditingRule = ref<number | null>(null)
const currentEditingKeyType = ref<'main' | 'modifier'>('main')

// 初始化时获取设备列表
onMounted(() => {
  fetchDevices().then(newDevices => {
    devices.value = newDevices
  })
  // 每30秒刷新一次设备列表
  // ¬setInterval(fetchDevices, 30000)
})

const showKeySelector = (type: 'from' | 'to', index: number, keyType: 'main' | 'modifier' = 'main') => {
  currentEditingType.value = type
  currentEditingRule.value = index
  currentEditingKeyType.value = keyType
  keySelectorVisible.value = true
}

const handleKeySelect = (key: string) => {
  if (currentEditingRule.value !== null) {
    const rule = rules.value[currentEditingRule.value]
    if (currentEditingType.value === 'from') {
      if (currentEditingKeyType.value === 'main') {
        rule.from.selectedKey = key
      } else {
        rule.from.selectedModifier = key
      }
    } else if (currentEditingType.value === 'to') {
      if (currentEditingKeyType.value === 'main') {
        rule.to.selectedKey = key
      } else {
        rule.to.selectedModifier = key
      }
    }
  }
  keySelectorVisible.value = false
}

const addRule = () => {
  rules.value.push({
    id: nanoid(), // 生成唯一 ID  
    type: 'basic',
    from: { selectedKey: '', selectedModifier: '' },
    to: { selectedKey: '', selectedModifier: '' }
  })
}

const deleteRule = (ruleId: string) => {
  const index = rules.value.findIndex(rule => rule.id === ruleId)
  if (index !== -1) {
    // 先检查并清理编辑状态  
    if (currentEditingRule.value === index) {  
      keySelectorVisible.value = false  
      currentEditingRule.value = null  
    }  
    // 然后再删除规则  
    rules.value.splice(index, 1)  
  }
}

const convertTo = () => {
  console.log('转换中...')
  console.log(rules.value)
  console.log(selectedDevice.value)
  const karabinerConfig = {
    description: description.value || 'Karabiner Configuration',
    manipulators: rules.value.map(rule => {
      const manipulator = {
        type: rule.type,
        conditions: [
          {
            type: 'device_if',
            identifiers: [{ vendor_id: selectedDevice.value ? devices.value.find(d => d.address === selectedDevice.value)?.vendorId || '000000' : 0 }]
          }
        ],
        from: {
          key_code: rule.from.selectedKey,
          ...(rule.from.selectedModifier && {
            modifiers: {
              mandatory: [rule.from.selectedModifier]
            }
          })
        },
        to: [
          {
            key_code: rule.to.selectedKey,
            ...(rule.to.selectedModifier && {
              modifiers: [rule.to.selectedModifier]
            })
          }
        ]
      }

      return manipulator
    })
  }

  console.log('转换完成')
  console.log(karabinerConfig)
  
  // 更新编辑器内容
  if (editorContent.value) {
    editorContent.value.textContent = JSON.stringify(karabinerConfig, null, 2)
  }
}

const editorContent = ref<HTMLElement | null>(null)
const currentContent = ref('')

const handleEditorInput = (event: Event) => {
  const target = event.target as HTMLElement
  currentContent.value = target.innerText
}

const copyToClipboard = async () => {
  if (editorContent.value) {
    try {
      await navigator.clipboard.writeText(editorContent.value.innerText)
      ElMessage.success('已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败')
    }
  }
}

</script>

<template>
  <el-container class="layout-container">
    <el-header height="60px" class="header">
      <h1>Karabiner 规则配置器</h1>
    </el-header>
    
    <el-container class="main-container">
      <el-aside width="50%" class="left-panel">
        <el-select v-model="selectedDevice" placeholder="选择设备" class="device-select" @focus="fetchDevices">
          <el-option
            v-for="device in devices"
            :key="device.address"
            :value="device.address"
            :vendor="device.vendorId"
            :label="device.name + (device.vendorId ? ' (Vendor ID: ' + device.vendorId + ')' : '')"
          />
        </el-select>
        <el-input
          v-model="description"
          type="textarea"
          :rows="2"
          placeholder="请输入描述"
          class="description-input"
        />
        <el-button type="primary" @click="addRule" class="add-rule-btn">
          创建新规则
        </el-button>
        
        <div class="rules-list">
          <div v-for="(rule, index) in rules" :key="rule.id" class="rule-item">
            <div class="rule-type">
              <div class="rule-type-content">
                <span>{{ rule.type }}</span>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click="deleteRule(rule.id)"
                >
                  X
                </el-button>
              </div>
            </div>
            <div class="from">
              <span>原按键：</span>
              <el-button size="small" @click="showKeySelector('from', index)">{{ rule.from.selectedKey || '选择主键' }}</el-button>
              <el-button size="small" @click="showKeySelector('from', index, 'modifier')">{{ rule.from.selectedModifier || '选择修饰键' }}</el-button>
            </div>
            <div class="to">
              <span>映射为：</span>
              <el-button size="small" @click="showKeySelector('to', index)">{{ rule.to.selectedKey || '选择主键' }}</el-button>
              <el-button size="small" @click="showKeySelector('to', index, 'modifier')">{{ rule.to.selectedModifier || '选择修饰键' }}</el-button>
            </div>
          </div>
        </div>
      </el-aside>
      
      <el-main width="5%" class="center-panel">
        <el-button class="arrow-button" @click="convertTo">
          <el-icon>➜</el-icon>
        </el-button>
      </el-main>
      
      <el-aside width="45%" class="right-panel">
        <div class="editor-header">
          <el-button
            type="primary"
            size="small"
            @click="copyToClipboard"
            class="copy-button"
          >
            复制
          </el-button>
        </div>
        <div
          ref="editorContent"
          class="editor-content"
          contenteditable="true"
          @input="handleEditorInput"
        ></div>
      </el-aside>
    </el-container>
    
    <el-footer height="60px" class="footer">
      <!-- 底部内容 -->
    </el-footer>
    <KeySelector
      v-model:visible="keySelectorVisible"
      :current-value="currentEditingRule !== null ? (currentEditingType === 'from' ? (currentEditingKeyType === 'main' ? rules[currentEditingRule].from.selectedKey : rules[currentEditingRule].from.selectedModifier) : (currentEditingKeyType === 'main' ? rules[currentEditingRule].to.selectedKey : rules[currentEditingRule].to.selectedModifier)) : ''"
      :default-key-type="currentEditingKeyType"
      @select="handleKeySelect"
    />
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.main-container {
  height: calc(100vh - 120px);
}

.left-panel {
  background-color: #f5f7fa;
  padding: 20px;
  border-right: 1px solid #e6e6e6;
}

.description-input {
  margin-bottom: 15px;
}

.add-rule-btn {
  width: 100%;
  margin-bottom: 15px;
}

.center-panel {
  background-color: #f5f7fa;
  width: 10%;
  min-width: 30px;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.convert-btn, .reverse-btn {
  width: 100%;
  padding: 12px 20px;
}

.arrow-icon {
  font-size: 24px;
  color: #409EFF;
}

.arrow-button {
  width: 80%;
  max-width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bolder;
  color: #f25100;
}

.arrow-button :deep(.el-icon) {
  font-size: 20px;
}

.right-panel {
  background-color: #1e1e1e;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.editor-header {
  background-color: #252526;
  padding: 8px;
  border-bottom: 1px solid #3c3c3c;
}

.copy-button {
  font-size: 12px;
}

.editor-content {
  flex: 1;
  padding: 16px;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  outline: none;
  overflow: auto;
}

.editor-content:focus {
  outline: none;
}

.footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e6e6e6;
}

.rule-item {
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rule-type {
  color: #606266;
  font-weight: bold;
  margin-bottom: 8px;
}

.rule-type-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.from, .to {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.from span, .to span {
  margin-right: 10px;
  color: #606266;
}
.device-select {
  width: 100%;
  margin-bottom: 20px;
}
</style>
