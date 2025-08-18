// settings.ts - settings UI for the Obsidian Prettier plugin

import { PluginSettingTab, App, Setting } from "obsidian";
import { LogLevel } from "./logger";
import PrettierPlugin from "./main";

export class PrettierSettingsTab extends PluginSettingTab {
    private plugin: PrettierPlugin;

    constructor(app: App, plugin: PrettierPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Displays the settings tab UI.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Format on save")
            .setDesc("Automatically format files when they are saved")
            .addToggle((toggle) => {
                toggle.setValue(this.plugin.settings.formatOnSave);
                toggle.onChange(async (value) => {
                    this.plugin.settings.formatOnSave = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Log level")
            .setDesc("Set the logging level for debug output")
            .addDropdown((dropdown) => {
                dropdown.addOption(LogLevel.ERROR.toString(), "Error");
                dropdown.addOption(LogLevel.WARN.toString(), "Warning");
                dropdown.addOption(LogLevel.INFO.toString(), "Info");
                dropdown.addOption(LogLevel.DEBUG.toString(), "Debug");
                dropdown.setValue(this.plugin.settings.logLevel.toString());
                dropdown.onChange(async (value) => {
                    this.plugin.settings.logLevel = parseInt(value) as LogLevel;
                    await this.plugin.saveSettings();
                });
            });
    }
}
