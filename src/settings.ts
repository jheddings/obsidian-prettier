import { PluginSettingTab, App } from "obsidian";
import PrettierPlugin from "./main";

export class PrettierSettingsTab extends PluginSettingTab {
    constructor(app: App, plugin: PrettierPlugin) {
        super(app, plugin);
    }

    /**
     * Displays the settings tab UI.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
    }
}
