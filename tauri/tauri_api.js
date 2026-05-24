window.win12Native = {
  isTauri() {
    return !!(window.__TAURI__ && window.__TAURI__.core);
  },
  async getBatteryInfo() {
    if (!this.isTauri()) return null;
    return await window.__TAURI__.core.invoke("get_battery_info");
  },
};
