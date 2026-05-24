const BATTERY_REFRESH_INTERVAL = 30000;

console.log("Battery_power.js loaded");

function normalizePercent(percent) {
  if (typeof percent !== "number" || Number.isNaN(percent)) return null;
  return Math.max(0, Math.min(100, percent > 1 ? percent : percent * 100));
}

function batteryLang(text, id) {
  return typeof lang === "function" ? lang(text, id) : text;
}

function setBatteryUnavailableUI() {
  const el = document.querySelector("#battery");
  if (el) {
    const title = batteryLang("无法获取电量", "battery.unavailable");
    el.setAttribute("win12_title", title);
    el.setAttribute("title", title);
  }
}

function updateBatteryUI(battery) {
  const percent = normalizePercent(battery?.percent);
  const el = document.querySelector("#battery");
  const pathElement = document.querySelector("#battery .battery-icon > path");

  if (percent === null || !el) {
    setBatteryUnavailableUI();
    return;
  }

  const roundedPercent = Math.round(percent);
  const batteryWidth = 18 * (percent / 100) + 5;
  const chargingText = battery.charging ? batteryLang("，正在充电", "battery.charging") : "";
  const title = `${batteryLang("电量：", "battery.level")}${roundedPercent}%${chargingText}`;

  el.setAttribute("win12_title", title);
  el.setAttribute("title", title);

  if (pathElement) {
    pathElement.setAttribute(
      "d",
      `M 4 7 C 2.3550302 7 1 8.3550302 1 10 L 1 19 C 1 20.64497 2.3550302 22 4 22 L 24 22 C 25.64497 22 27 20.64497 27 19 L 27 10 C 27 8.3550302 25.64497 7 24 7 L 4 7 z M 4 9 L 24 9 C 24.56503 9 25 9.4349698 25 10 L 25 19 C 25 19.56503 24.56503 20 24 20 L 4 20 C 3.4349698 20 3 19.56503 3 19 L 3 10 C 3 9.4349698 3.4349698 9 4 9 z M 5 11 L 5 18 L ${batteryWidth} 18 L ${batteryWidth} 11 L 5 11 z M 28 12 L 28 17 L 29 17 C 29.552 17 30 16.552 30 16 L 30 13 C 30 12.448 29.552 12 29 12 L 28 12 z`
    );
  }
}

async function fetchBattery() {
  if (!window.win12Native || !window.win12Native.isTauri || !window.win12Native.isTauri()) {
    return;
  }

  try {
    const battery = await window.win12Native.getBatteryInfo();
    console.log("电量信息：", battery);
    updateBatteryUI(battery);
  } catch (err) {
    console.error("获取电池失败：", err);
    setBatteryUnavailableUI();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  fetchBattery();
  window.setInterval(fetchBattery, BATTERY_REFRESH_INTERVAL);
});
