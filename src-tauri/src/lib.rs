mod cmds;
mod prelude;
mod state;

use prelude::*;

use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> Res<()> {
    let state = AppState::new()?;

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(state))
        .invoke_handler(tauri::generate_handler![
            cmds::shutdown,
            cmds::update_url,
            cmds::read_url
        ])
        .run(tauri::generate_context!())
        .with_context(|| "error while running tauri application")?;

    Ok(())
}
