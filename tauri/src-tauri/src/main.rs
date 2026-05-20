// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;

#[derive(Serialize)]
struct BatteryInfo {
    percentage: f32,
    state: String,
    time_to_empty: Option<f32>,
    time_to_full: Option<f32>,
}

#[tauri::command]
fn get_battery_info() -> Result<BatteryInfo, String> {
    let manager = battery::Manager::new().map_err(|e| e.to_string())?;
    let mut batteries = manager.batteries().map_err(|e| e.to_string())?;

    let battery = batteries
        .next()
        .ok_or("No battery found")?
        .map_err(|e| e.to_string())?;

    Ok(BatteryInfo {
        percentage: battery.state_of_charge().value * 100.0,
        state: format!("{:?}", battery.state()),
        time_to_empty: battery.time_to_empty().map(|t| t.value / 60.0),
        time_to_full: battery.time_to_full().map(|t| t.value / 60.0),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_battery_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}