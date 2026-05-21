import { invoke } from '@tauri-apps/api/core';

console.log("Battery_power.js loaded");

async function fetchBattery() {
  try {
    const battery = await invoke("get_battery_info");
    console.log("电量信息：", battery);

    const el = document.querySelector("#battery");
    if (el) el.textContent = `${Math.round(battery.percent)}%`;
    else console.warn("找不到 #battery 元素");
  } catch (err) {
    console.error("获取电池失败：", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchBattery);