// config.ts - config models for the Obsidian Prettier plugin

import { App, normalizePath, parseYaml } from "obsidian";
import { Logger, LogLevel } from "obskit";
import { Options } from "prettier";

export enum ProseWrapOptions {
    ALWAYS = "always",
    NEVER = "never",
    PRESERVE = "preserve",
}

export interface PrettierPluginSettings {
    logLevel: LogLevel;
    showNotices: boolean;
    autoFormat: boolean;
    autoFormatDebounceMs: number;
    prettierOptions: Options;
}

const CONFIG_FILE_NAMES = [
    ".prettierrc",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.json",
    "prettier.yaml",
    "prettier.yml",
    "prettier.json",
];

export class ConfigManager {
    private app: App;

    private logger = Logger.getLogger("config");

    constructor(app: App) {
        this.app = app;
    }

    async getVaultConfig(): Promise<Options> {
        const options = {};

        // look for vault files to override plugin settings
        for (const localConfig of CONFIG_FILE_NAMES) {
            try {
                const normPath = normalizePath(localConfig);
                this.logger.debug(`Checking for local config :: ${normPath}`);

                // use the vault adapter to access files directly, including hidden files
                const exists = await this.app.vault.adapter.exists(normPath);
                if (!exists) continue;

                const configOptions = await this.loadConfigFile(normPath);
                Object.assign(options, configOptions);
            } catch (error) {
                this.logger.warn(`Could not read config from ${localConfig}:`, error.message);
            }
        }

        return options;
    }

    private async loadConfigFile(vaultFilePath: string): Promise<Options> {
        this.logger.debug("Loading config file:", vaultFilePath);

        const configContent = await this.app.vault.adapter.read(vaultFilePath);

        try {
            return JSON.parse(configContent) as Options;
        } catch {}

        try {
            return parseYaml(configContent) as Options;
        } catch {}

        throw Error("Invalid config format");
    }
}
