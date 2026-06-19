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
  async pingHost(host, ipv6 = false, onOutput = null) {
    if (!this.isTauri()) {
      throw new Error("ping/ping6 仅在 App 中支持使用");
    }
    if (!window.__TAURI__.event || !window.__TAURI__.event.listen) {
      throw new Error("Tauri event API is unavailable");
    }

    const requestId = `ping-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let unlisten = null;

    try {
      await new Promise((resolve, reject) => {
        window.__TAURI__.event.listen("win12://ping-output", (event) => {
          const payload = event.payload || {};
          if (payload.request_id !== requestId) return;

          if (payload.text && onOutput) {
            onOutput(payload.text);
          }

          if (payload.done) {
            resolve(payload);
          }
        })
          .then((unlistenFn) => {
            unlisten = unlistenFn;
            return window.__TAURI__.core.invoke("ping_host", { host, ipv6, requestId });
          })
          .catch(reject);
      });
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  },
};
