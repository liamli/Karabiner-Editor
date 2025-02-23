interface Device {
  name: string
  address: string
  vendorId?: string
}

export const fetchDevices = async (): Promise<Device[]> => {
  try {
    console.log('开始获取蓝牙设备列表...')
    const stdout = await window.api.getBluetoothDevices()
    
    console.log('命令执行成功，开始解析数据...')
    // console.log('原始数据:', stdout)
      
    const lines = stdout.split('\n')
    const newDevices: Device[] = []
    let currentDevice: Partial<Device> = {}
    let isParsingDevices = false
    let indentLevel = 0

    lines.forEach(line => {
      // 计算当前行的缩进级别
      const match = line.match(/^\s*/)
      indentLevel = match ? Math.floor(match[0].length / 4) : 0
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // 开始解析设备列表的标记
      if (trimmedLine === 'Connected:' || trimmedLine === 'Not Connected:') {
        isParsingDevices = true
        return
      }

      if (!isParsingDevices) return

      // 处理设备名称（缩进级别为1）
      if (indentLevel === 2 && trimmedLine.endsWith(':')) {
        if (currentDevice.name && currentDevice.address) {
          newDevices.push(currentDevice as Device)
        }
        currentDevice = {
          name: trimmedLine.slice(0, -1).trim()
        }
      }
      // 处理设备属性（缩进级别为2）
      else if (indentLevel === 3 && currentDevice.name) {
        const [key, ...valueParts] = trimmedLine.split(':')
        const value = valueParts.join(':').trim()
        
        switch (key.trim()) {
          case 'Address':
            currentDevice.address = value
            break
          case 'Vendor ID':
            // 将十六进制的 Vendor ID 转换为十进制
            const hexVendorId = value.split(' ')[0] // 获取十六进制值
            currentDevice.vendorId = parseInt(hexVendorId).toString() // 转换为十进制
            break
        }
      }

    })

    // 处理最后一个设备
    if (currentDevice.name && currentDevice.address) {
      newDevices.push(currentDevice as Device)
    }
    
    return newDevices
  } catch (error) {
    console.error('获取设备列表失败:', error)
    return []
  }
}

export type { Device }