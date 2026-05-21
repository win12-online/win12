use network_interface::{NetworkInterface, NetworkInterfaceConfig};
use serde::Serialize;

#[derive(Serialize)]
struct BatteryInfo {
    percent: f32,
    charging: bool,
    state: String,
}

#[derive(Serialize)]
struct NetworkInfo {
    online: bool,
    kind: String,
    name: String,
}

#[tauri::command]
fn get_battery_info() -> Result<BatteryInfo, String> {
    let manager = battery::Manager::new().map_err(|e| e.to_string())?;

    let mut batteries = manager.batteries().map_err(|e| e.to_string())?;

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

#[tauri::command]
fn get_network_info() -> Result<NetworkInfo, String> {
    let interfaces = NetworkInterface::show().map_err(|e| e.to_string())?;

    for interface in interfaces {
        let name = interface.name.clone();

        // 跳过本机回环接口
        if name == "lo" || name.starts_with("lo") {
            continue;
        }

        // 没有 IP 地址的接口通常不是正在使用的网络
        if interface.addr.is_empty() {
            continue;
        }

        let kind = if name.starts_with("wl")
            || name.starts_with("wlan")
            || name.starts_with("wifi")
            || name.starts_with("wlp")
        {
            "wifi"
        } else if name.starts_with("en")
            || name.starts_with("eth")
            || name.starts_with("eno")
            || name.starts_with("ens")
            || name.starts_with("enp")
        {
            "ethernet"
        } else {
            "unknown"
        };

        return Ok(NetworkInfo {
            online: true,
            kind: kind.to_string(),
            name,
        });
    }

    Ok(NetworkInfo {
        online: false,
        kind: "offline".to_string(),
        name: String::new(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_battery_info,
            get_network_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
