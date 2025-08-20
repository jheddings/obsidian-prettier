// main.ts - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice, TFile } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { Formatter } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";
import { PrettierSettingsTab } from "./settings";

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,
    prettierOptions: {},
    autoFormat: false,
    showNotices: true,
};

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: ConfigManager = new ConfigManager(this.app);
    private formatter: Formatter = new Formatter(this.app);
    private logger: Logger = Logger.getLogger("main");

    private lastActiveFile: TFile | null = null;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PrettierSettingsTab(this.app, this));

        this.addCommand({
            id: "format-current-file",
            name: "Format current file with Prettier",
            editorCallback: async (_editor, _view) => {
                const file = this.app.workspace.getActiveFile();
                if (file) await this.handleCommandCallback(file);
            },
        });

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", async () => {
                if (this.settings.autoFormat) {
                    await this.handleFocusChange();
                }
            })
        );

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

    private async formatFile(file: TFile) {
        this.logger.debug(`Applying format to file: ${file.path}`);

        const prettierOptions = await this.configManager.getEffectivePrettierOptions(
            this.settings.prettierOptions
        );

        try {
            const changed = await this.formatter.formatFile(file, prettierOptions);

            if (changed) {
                this.logger.info(`File was changed: ${file.path}`);
            } else {
                this.logger.debug(`File was not changed: ${file.path}`);
            }

            return changed;
        } catch (error) {
            const errorMessage = `Failed to format file: ${error.message}`;
            new Notice(errorMessage);
            this.logger.error(errorMessage, error);
            throw error;
        }
    }

    private async handleCommandCallback(file: TFile) {
        try {
            const changed = await this.formatFile(file);

            if (this.settings.showNotices) {
                if (changed) {
                    new Notice(`Formatted ${file.name} with Prettier`);
                } else {
                    new Notice(`${file.name} is already formatted`);
                }
            }
        } catch {
            // Error notice is already shown in formatFile
        }
    }

    private async handleFocusChange() {
        const currentActiveFile = this.app.workspace.getActiveFile();

        let changed = false;

        if (this.lastActiveFile && this.lastActiveFile !== currentActiveFile) {
            try {
                changed = await this.formatFile(this.lastActiveFile);
            } catch {
                changed = false;
            }
        }

        if (this.settings.showNotices && changed) {
            new Notice(`Formatted ${this.lastActiveFile.name} with Prettier`);
        }

        this.lastActiveFile = currentActiveFile;
    }
}
