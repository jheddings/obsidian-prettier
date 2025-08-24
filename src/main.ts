// main.ts - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice, TFile } from "obsidian";
import { Logger, LogLevel } from "obskit";
import { Formatter } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";
import { PrettierSettingsTab } from "./settings";

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,
    showNotices: true,
    autoFormat: false,
    autoFormatDebounceMs: 100,
};

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: ConfigManager = new ConfigManager(this.app);
    private formatter: Formatter = new Formatter(this.app);
    private logger: Logger = Logger.getLogger("main");

    private lastActiveFile: TFile | null = null;
    private autoFormatMap: Map<TFile, NodeJS.Timeout> = new Map();

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new PrettierSettingsTab(this.app, this));

        this.addCommand({
            id: "format-current-file",
            name: "Format current file with Prettier",
            editorCallback: async (_editor, _view) => {
                const file = this.app.workspace.getActiveFile();
                if (file) await this.formatFileWithNotice(file);
            },
        });

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", async () => {
                if (this.settings.autoFormat) {
                    this.handleFocusChange();
                }
            })
        );

        this.logger.info("Plugin loaded");
    }

    async onunload() {
        await this.flushAutoFormatQueue();
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

    private scheduleAutoFormat(file: TFile) {
        const timeoutId = setTimeout(async () => {
            this.autoFormatMap.delete(file);
            this.formatFileWithSuccessNotice(file);
        }, this.settings.autoFormatDebounceMs);

        this.autoFormatMap.set(file, timeoutId);
    }

    private async flushAutoFormatQueue() {
        this.logger.debug("Flushing auto-format queue");
        for (const [file, timeout] of this.autoFormatMap) {
            clearTimeout(timeout);
            await this.formatFile(file);
        }
    }

    private handleFocusChange() {
        const currentActiveFile = this.app.workspace.getActiveFile();
        this.logger.debug(`Active file changed: ${currentActiveFile?.path}`);

        // clear any pending auto-format requests for this file
        if (currentActiveFile) {
            const existingTimeout = this.autoFormatMap.get(currentActiveFile);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }
        }

        // only process when we're switching from one file to another (not just initial load)
        if (this.lastActiveFile && this.lastActiveFile !== currentActiveFile) {
            const fileToFormat = this.lastActiveFile;
            this.scheduleAutoFormat(fileToFormat);
        }

        this.lastActiveFile = currentActiveFile;
    }

    private async formatFile(file: TFile) {
        this.logger.debug(`Applying format to file: ${file.path}`);

        try {
            const prettierOptions = await this.configManager.getVaultConfig();
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

    private async formatFileWithNotice(file: TFile) {
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

    private async formatFileWithSuccessNotice(file: TFile) {
        try {
            const changed = await this.formatFile(file);

            if (this.settings.showNotices && changed) {
                new Notice(`Formatted ${file.name} with Prettier`);
            }
        } catch {
            // Error handling is done in formatFile
        }
    }
}
