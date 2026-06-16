window.win12Native = {
  isTauri() {
    return !!(window.__TAURI__ && window.__TAURI__.core);
  },
  async getBatteryInfo() {
    if (!this.isTauri()) return null;
    return await window.__TAURI__.core.invoke("get_battery_info");
  },
  async getLoginPasswordStatus() {
    if (!this.isTauri()) return null;
    return await window.__TAURI__.core.invoke("get_login_password_status");
  },
  async verifyLoginPassword(password) {
    if (!this.isTauri()) return { ok: true };
    return await window.__TAURI__.core.invoke("verify_login_password", { password });
  },
  async setLoginPassword(currentPassword, newPassword) {
    if (!this.isTauri()) return null;
    return await window.__TAURI__.core.invoke("set_login_password", { currentPassword, newPassword });
  },
};
