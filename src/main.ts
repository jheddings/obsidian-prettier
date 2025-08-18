import { Plugin } from "obsidian";
import { Logger, LogLevel } from "./logger";
import { SkeletonPluginSettings } from "./config";

const DEFAULT_SETTINGS: SkeletonPluginSettings = {
    logLevel: LogLevel.ERROR,
};

export default class SkeletonPlugin extends Plugin {
    settings: SkeletonPluginSettings;

    private logger: Logger = Logger.getLogger("main");

    async onload() {
        await this.loadSettings();

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
}
