// main.js - main entry point for the Obsidian Prettier plugin

import { Plugin, Notice, Editor } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { format } from "./format";
import { ConfigManager, PrettierPluginSettings } from "./config";

const DEFAULT_SETTINGS: PrettierPluginSettings = {
    logLevel: LogLevel.ERROR,

    prettierOptions: {
        proseWrap: "preserve",
        embeddedLanguageFormatting: "auto",
        htmlWhitespaceSensitivity: "css",
    },
};

export default class PrettierPlugin extends Plugin {
    settings: PrettierPluginSettings;

    private configManager: any;
    private logger: Logger = Logger.getLogger("main");

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: "format-current-file",
            name: "Format current file with Prettier",
            editorCallback: async (editor, _view) => {
                await this.formatCurrentFile(editor);
            },
        });

        this.configManager = new ConfigManager(this.app);
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

    private async formatCurrentFile(editor: Editor) {
        const file = this.app.workspace.getActiveFile();

        if (!file) {
            this.logger.warn("No active file to format");
            return;
        }

        const content = editor.getValue();
        const filePath = file.path;

        try {
            const prettierOptions = this.configManager.getEffectivePrettierOptions(
                this.settings.prettierOptions
            );
            const formattedContent = await format(content, prettierOptions);

            if (content !== formattedContent) {
                editor.setValue(formattedContent);
                new Notice(`Formatted ${file.name} with Prettier`);
                this.logger.info(`Formatted file: ${filePath}`);
            } else {
                new Notice(`${file.name} is already formatted`);
                this.logger.debug(`No changes needed for file: ${filePath}`);
            }
        } catch (error) {
            const errorMessage = `Failed to format file: ${error.message}`;
            new Notice(errorMessage);
            this.logger.error(errorMessage, error);
        }
    }
}
