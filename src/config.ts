// config model for the Obsidian Prettier plugin

import { App } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { Options } from "prettier";

export interface PrettierPluginSettings {
    logLevel: LogLevel;
    prettierOptions: Options;
}

export class ConfigManager {
    private app: App;
    private logger = Logger.getLogger("config");

    constructor(app: App) {
        this.app = app;
    }

    async getEffectivePrettierOptions(userPrefs: Options): Promise<Options> {
        const options = { ...userPrefs };

        // look for vault files to override plugin settings
        const configPaths = [".prettierrc", ".prettierrc.json", "prettierrc.json"];

        for (const configPath of configPaths) {
            try {
                const file = this.app.vault.getFileByPath(configPath);
                const configContent = await this.app.vault.read(file);

                let configOptions;

                try {
                    configOptions = JSON.parse(configContent);
                } catch {
                    // If not JSON, skip for now (could add YAML support later)
                    this.logger.warn(`Unsupported config format in ${configPath}, skipping`);
                    continue;
                }

                // Merge config file options with plugin options (config file takes precedence)
                this.logger.debug(`Loaded Prettier config from ${configPath}`);
                Object.assign(options, configOptions);

                break;
            } catch (error) {
                // config file doesn't exist or can't be read, continue to next
                this.logger.debug(`Could not read config from ${configPath}: ${error.message}`);
            }
        }

        return options;
    }
}
