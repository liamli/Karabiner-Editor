interface Window {
  api: {
    getBluetoothDevices: () => Promise<string>
  }
}