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
  async checkAppUpdate() {
    if (!this.isTauri()) {
      throw new Error("Windows 更新仅在 Tauri App 中可用");
    }
    return await window.__TAURI__.core.invoke("check_app_update");
  },
  async pingHost(host, ipv6 = false, onOutput = null) {
    if (!this.isTauri()) {
      throw new Error("ping/ping6 仅在 桌面版 中支持使用");
    }
    if (!window.__TAURI__.event || !window.__TAURI__.event.listen) {
      throw new Error("Tauri event API is unavailable");
    }

    const requestId = `ping-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let resolveFinished;
    const finished = new Promise((resolve) => {
      resolveFinished = resolve;
    });

    const unlisten = await window.__TAURI__.event.listen("win12://ping-output", (event) => {
      const payload = event.payload || {};
      if (payload.request_id !== requestId) return;

      if (payload.text && onOutput) {
        onOutput(payload.text);
      }

      if (payload.done) {
        resolveFinished(payload);
      }
    });

    // Backend timeout safety net: if the backend never sends done,
    // unblock the UI after 35 seconds
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("ping 超时")), 35000);
    });

    try {
      await window.__TAURI__.core.invoke("ping_host", { host, ipv6, requestId });
      await Promise.race([finished, timeout]);
    } catch (e) {
      // If the backend timed out, the event listener will linger;
      // ensure we always clean up and propagate the error
      throw e;
    } finally {
      unlisten();
    }
  },
};

if (typeof updateAboutAppEntrypoints === "function") {
  updateAboutAppEntrypoints();
}
