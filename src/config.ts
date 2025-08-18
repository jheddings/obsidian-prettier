// config.ts - config models for the Obsidian Prettier plugin

import { App, normalizePath } from "obsidian";
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
        const localConfigFiles = [".prettierrc", ".prettierrc.json", "prettierrc.json"];

        for (const localConfig of localConfigFiles) {
            try {
                const normPath = normalizePath(localConfig);
                this.logger.debug(`Checking for local config :: ${normPath}`);

                // use the vault adapter to access files directly, including hidden files
                const exists = await this.app.vault.adapter.exists(normPath);
                if (!exists) continue;

                const configContent = await this.app.vault.adapter.read(normPath);
                const configOptions = JSON.parse(configContent);
                this.logger.debug(`Loaded Prettier config from ${localConfig}`);

                Object.assign(options, configOptions);
            } catch (error) {
                // config file doesn't exist or can't be read, continue to next
                this.logger.debug(`Could not read config from ${localConfig}: ${error.message}`);
            }
        }

        return options;
    }
}
