// main.js - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { Formatter } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";
import { PrettierSettingsTab } from "./settings";

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,
    prettierOptions: {},
};

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: ConfigManager;
    private formatter: Formatter;

    private logger: Logger = Logger.getLogger("main");

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PrettierSettingsTab(this.app, this));

        this.addCommand({
            id: "format-current-file",
            name: "Format current file with Prettier",
            editorCallback: async (_editor, _view) => {
                await this.formatCurrentFile();
            },
        });

        this.configManager = new ConfigManager(this.app);
        this.formatter = new Formatter(this.app);

        this.logger.info("Plugin loaded");
    }

    async onunload() {
        this.logger.info("Plugin unloaded");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        this.applySettings();
    }

    async saveSettings() {
        await this.saveData(this.settings);

        this.applySettings();
    }

    private applySettings() {
        Logger.setGlobalLogLevel(this.settings.logLevel);
    }

    private async formatCurrentFile() {
        const file = this.app.workspace.getActiveFile();

        if (!file) {
            this.logger.warn("No active file to format");
            return;
        }

        this.logger.debug(`Formatting active file: ${file.path}`);

        const prettierOptions = await this.configManager.getEffectivePrettierOptions(
            this.settings.prettierOptions
        );

        try {
            const changed = await this.formatter.formatFile(file, prettierOptions);

            if (changed) {
                new Notice(`Formatted ${file.name} with Prettier`);
                this.logger.info(`File was changed: ${file.path}`);
            } else {
                new Notice(`${file.name} is already formatted`);
                this.logger.debug(`File was not changed: ${file.path}`);
            }
        } catch (error) {
            const errorMessage = `Failed to format file: ${error.message}`;
            new Notice(errorMessage);
            this.logger.error(errorMessage, error);
        }
    }
}
