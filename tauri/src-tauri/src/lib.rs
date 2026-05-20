use serde::Serialize;

#[derive(Serialize)]
struct BatteryInfo {
    percent: f32,
    charging: bool,
    state: String,
}

#[tauri::command]
fn get_battery_info() -> Result<BatteryInfo, String> {
    let manager = battery::Manager::new()
        .map_err(|e| e.to_string())?;

    let mut batteries = manager
        .batteries()
        .map_err(|e| e.to_string())?;

    let battery = batteries
        .next()
        .ok_or("No battery found")?
        .map_err(|e| e.to_string())?;

    let percent = battery
        .state_of_charge()
        .get::<battery::units::ratio::percent>();

    let state = format!("{:?}", battery.state());

    let charging = matches!(
        battery.state(),
        battery::State::Charging | battery::State::Full
    );

    Ok(BatteryInfo {
        percent,
        charging,
        state,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_battery_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}