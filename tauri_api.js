window.win12Native = {
  async getBatteryInfo() {
    if (!window.__TAURI__) return null;
    return await window.__TAURI__.core.invoke("get_battery_info");
  },
};