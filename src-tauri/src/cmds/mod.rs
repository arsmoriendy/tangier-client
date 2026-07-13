#[tauri::command]
pub fn shutdown() -> Result<(), String> {
    system_shutdown::shutdown().map_err(|e| e.to_string())?;
    Ok(())
}
