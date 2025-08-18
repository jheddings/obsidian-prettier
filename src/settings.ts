import { PluginSettingTab, App } from "obsidian";
import SkeletonPlugin from "./main";

export class SkeleSettingsTab extends PluginSettingTab {
    constructor(app: App, plugin: SkeletonPlugin) {
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
