use crate::prelude::*;

#[derive(bon::Builder)]
pub struct AppState {
    pub config: Config,
    pub config_path: PathBuf,
}

#[derive(bon::Builder, Serialize, Deserialize, Default)]
pub struct Config {
    pub url: Option<String>,
}

impl AppState {
    pub fn new() -> Res<Self> {
        let project_dirs = ProjectDirs::from("top", "nugs", "tangier-client")
            .ok_or(anyhow!("Failed to parse project dir"))?;
        let config_dir = project_dirs.config_dir();
        if !config_dir.exists() {
            std::fs::create_dir_all(config_dir)?;
        }

        let config_file = config_dir.join("config.json");
        let mut state = AppState::builder()
            .config(Config::default())
            .config_path(config_file)
            .build();
        state.init_config()?;

        Ok(state)
    }

    pub fn init_config(&mut self) -> Res<()> {
        if self.config_path.exists() {
            self.config = self.read_config()?;
            return Ok(());
        }

        self.config = Config::default();
        self.write_config()?;
        Ok(())
    }

    pub fn write_config(&self) -> Res<()> {
        std::fs::write(
            &self.config_path,
            serde_json::to_string_pretty(&self.config)?,
        )?;
        Ok(())
    }

    pub fn read_config(&mut self) -> Res<Config> {
        let cfg_str = std::fs::read_to_string(&self.config_path)?;
        let config = serde_json::from_str(&cfg_str)?;
        Ok(config)
    }
}
