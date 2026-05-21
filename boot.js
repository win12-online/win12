import { invoke } from '@tauri-apps/api/tauri';

async function fetchBattery() {
  try {
    const battery = await invoke("get_battery_info");
    console.log("电量信息：", battery);
    document.querySelector("#battery").textContent = `${Math.round(battery.percent)}%`;
  } catch (err) {
    console.error("获取电池失败：", err);
  }
}

window.addEventListener('DOMContentLoaded', fetchBattery);