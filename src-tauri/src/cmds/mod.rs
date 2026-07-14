use crate::prelude::*;
use crate::state::AppState;

// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Generic(#[from] anyhow::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

type CmdRes<T> = Result<T, Error>;

#[tauri::command]
pub fn shutdown() -> CmdRes<()> {
    system_shutdown::shutdown()?;

    Ok(())
}

#[tauri::command]
pub fn update_url(state: State<Mutex<AppState>>, url: Option<String>) -> CmdRes<()> {
    let mut state = state.lock().unwrap();
    state.config.url = url;
    state.write_config()?;

    Ok(())
}

#[tauri::command]
pub fn read_url(state: State<Mutex<AppState>>) -> CmdRes<Option<String>> {
    let state = state.lock().unwrap();

    Ok(state.config.url.clone())
}
