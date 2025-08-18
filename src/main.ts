// main.ts - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice, TFile } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { Formatter } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";
import { PrettierSettingsTab } from "./settings";
import { EventManager } from "./events";

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,
    prettierOptions: {},
    formatOnSave: false,
};

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: ConfigManager = new ConfigManager(this.app);
    private formatter: Formatter = new Formatter(this.app);
    private eventManager: EventManager = new EventManager(this.app);
    private logger: Logger = Logger.getLogger("main");

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PrettierSettingsTab(this.app, this));

        this.addCommand({
            id: "format-current-file",
            name: "Format current file with Prettier",
            editorCallback: async (_editor, _view) => {
                const file = this.app.workspace.getActiveFile();
                if (file) await this.formatFile(file);
            },
        });

        this.eventManager.onModify(async (file) => {
            if (this.settings.formatOnSave) {
                await this.formatFile(file);
            }
        });

        this.logger.info("Plugin loaded");
    }

    async onunload() {
        this.eventManager.clearEvents();
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

    private async formatFile(file: TFile) {
        this.logger.debug(`Applying format to file: ${file.path}`);

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
