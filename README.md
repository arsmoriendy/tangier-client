# To add commands

1. Create a command using the `#[tauri::command]` macro
2. Register it in `lib.rs` `invoke_handler`
3. Register it in `build.rs` `app_manifest`
