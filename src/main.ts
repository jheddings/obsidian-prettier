// main.ts - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice, TFile } from "obsidian";
import { Logger, LogLevel } from "obskit";
import { Formatter } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";
import { PrettierSettingsTab } from "./settings";

interface FormatNotifications {
    onModify?: string;
    onUnchanged?: string;
    onError?: string;
}

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,
    showNotices: true,
    autoFormat: false,
    autoFormatDebounceMs: 100,
    autoFormatExtensions: ["md", "mdx"],
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
                if (file) {
                    await this.formatFileWithNotice(file, {
                        onModify: `Formatted ${file.name} with Prettier`,
                        onUnchanged: `${file.name} is already formatted`,
                        onError: `Failed to format ${file.name}`,
                    });
                }
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
        this.logger.debug(`Scheduling auto-format for file: ${file.path}`);

        const timeoutId = setTimeout(async () => {
            this.autoFormatMap.delete(file);

            this.formatFileWithNotice(file, {
                onModify: `Formatted ${file.name} with Prettier`,
            });

            this.logger.debug(`Auto-format completed for file: ${file.path}`);
        }, this.settings.autoFormatDebounceMs);

        this.autoFormatMap.set(file, timeoutId);
    }

    private async flushAutoFormatQueue() {
        this.logger.debug("Flushing auto-format queue");
        for (const [file, timeout] of this.autoFormatMap) {
            clearTimeout(timeout);
            await this.formatFile(file);
        }
        this.autoFormatMap.clear();
    }

    private handleFocusChange() {
        const currentActiveFile = this.app.workspace.getActiveFile();
        this.logger.debug(`Active file changed: ${currentActiveFile?.path}`);

        // clear any pending auto-format requests for the current file
        if (currentActiveFile) {
            const existingTimeout = this.autoFormatMap.get(currentActiveFile);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                this.logger.debug(
                    `Cleared auto-format timeout for file: ${currentActiveFile.path}`
                );
            }
        }

        // format the file that was last active (if available)
        const fileExtension = this.lastActiveFile?.extension || "";
        const isMarkdownFile = this.settings.autoFormatExtensions.includes(fileExtension);
        const didFileChange = this.lastActiveFile !== currentActiveFile;
        const fileExists = this.app.vault.getFileByPath(this.lastActiveFile?.path) !== null;

        if (this.lastActiveFile && didFileChange && isMarkdownFile && fileExists) {
            this.scheduleAutoFormat(this.lastActiveFile);
        }

        this.lastActiveFile = currentActiveFile;
    }

    private async formatFile(file: TFile) {
        if (!this.app.vault.getFileByPath(file.path)) {
            throw new Error(`File does not exist: ${file.path}`);
        }

        this.logger.debug(`Applying format to file: ${file.path}`);

        const prettierOptions = await this.configManager.getVaultConfig();
        this.logger.debug("Prettier options:", prettierOptions);

        try {
            const changed = await this.formatter.formatFile(file, prettierOptions);

            if (changed) {
                this.logger.info(`File was changed: ${file.path}`);
            } else {
                this.logger.debug(`File was not changed: ${file.path}`);
            }

            return changed;
        } catch (error) {
            throw new Error(`Failed to format file: ${error.message}`);
        }
    }

    private async formatFileWithNotice(file: TFile, options: FormatNotifications) {
        try {
            const contentChanged = await this.formatFile(file);

            if (this.settings.showNotices) {
                if (contentChanged && options.onModify) {
                    new Notice(options.onModify);
                }
                if (!contentChanged && options.onUnchanged) {
                    new Notice(options.onUnchanged);
                }
            }
        } catch (err) {
            const errorMessage = err.message || "Unknown error";
            this.logger.error(`Failed to format file: ${errorMessage}`, err);

            if (this.settings.showNotices && options.onError) {
                new Notice(options.onError);
            }
        }
    }
}
