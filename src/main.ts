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
};

const AUTO_FORMAT_DELAY_MS = 2500;

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: ConfigManager = new ConfigManager(this.app);
    private formatter: Formatter = new Formatter(this.app);
    private logger: Logger = Logger.getLogger("main");

    private autoFormatMap: Map<TFile, NodeJS.Timeout> = new Map();
    private lastActiveFile: TFile | null = null;

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

        /*
        this.registerEvent(
            this.app.vault.on("modify", async (file) => {
                if (file instanceof TFile && this.settings.autoFormat) {
                    this.scheduleAutoFormat(file);
                }
            })
        );
        */

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
        for (const [file, timeout] of this.autoFormatMap) {
            clearTimeout(timeout);
            await this.formatFile(file);
        }

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

    private scheduleAutoFormat(file: TFile) {
        const existingTimeout = this.autoFormatMap.get(file);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        this.autoFormatMap.set(
            file,
            setTimeout(async () => {
                this.autoFormatMap.delete(file);
                await this.formatFile(file);
            }, AUTO_FORMAT_DELAY_MS)
        );
    }

    private async handleFocusChange() {
        const currentActiveFile = this.app.workspace.getActiveFile();

        if (this.lastActiveFile && this.lastActiveFile !== currentActiveFile) {
            await this.formatFile(this.lastActiveFile);
        }

        this.lastActiveFile = currentActiveFile;
    }
}
