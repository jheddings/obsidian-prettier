// settings.ts - settings UI for the Obsidian Prettier plugin

import { PluginSettingTab, App, Setting } from "obsidian";
import { LogLevel } from "./logger";
import PrettierPlugin from "./main";

/**
 * Base class for settings tab pages.
 */
abstract class SettingsTabPage {
    public isActive: boolean = false;

    protected _plugin: PrettierPlugin;
    protected _name: string;

    /**
     * Creates a new SettingsTabPage instance.
     */
    constructor(plugin: PrettierPlugin, name: string) {
        this._plugin = plugin;
        this._name = name;
    }

    /**
     * Gets the tab page ID.
     * @returns The tab page ID string.
     */
    get id(): string {
        return this._name.toLowerCase().replace(/\s+/g, "-");
    }

    /**
     * Gets the tab page name.
     * @returns The tab page name string.
     */
    get name(): string {
        return this._name;
    }

    abstract display(containerEl: HTMLElement): void;
}

/**
 * Settings page for general options.
 */
class GeneralSettings extends SettingsTabPage {
    /**
     * Creates a new GeneralSettings instance.
     */
    constructor(plugin: PrettierPlugin) {
        super(plugin, "General");
    }

    /**
     * Displays the general settings UI.
     */
    display(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Tab width")
            .setDesc("Number of spaces per indentation level")
            .addSlider((slider) => {
                slider.setLimits(1, 8, 1);
                slider.setValue(this._plugin.settings.prettierOptions.tabWidth ?? 2);
                slider.setDynamicTooltip();
                slider.onChange(async (value) => {
                    this._plugin.settings.prettierOptions.tabWidth = value;
                    await this._plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Use tabs")
            .setDesc("Use tabs instead of spaces for indentation")
            .addToggle((toggle) => {
                toggle.setValue(this._plugin.settings.prettierOptions.useTabs ?? false);
                toggle.onChange(async (value) => {
                    this._plugin.settings.prettierOptions.useTabs = value;
                    await this._plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Print width")
            .setDesc("Line length that the printer will wrap on")
            .addSlider((slider) => {
                slider.setLimits(40, 200, 1);
                slider.setValue(this._plugin.settings.prettierOptions.printWidth ?? 80);
                slider.setDynamicTooltip();
                slider.onChange(async (value) => {
                    this._plugin.settings.prettierOptions.printWidth = value;
                    await this._plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Prose wrap")
            .setDesc("How to wrap prose (markdown text)")
            .addDropdown((dropdown) => {
                dropdown.addOption("always", "Always");
                dropdown.addOption("never", "Never");
                dropdown.addOption("preserve", "Preserve");
                dropdown.setValue(this._plugin.settings.prettierOptions.proseWrap ?? "preserve");
                dropdown.onChange(async (value) => {
                    this._plugin.settings.prettierOptions.proseWrap = value as
                        | "always"
                        | "never"
                        | "preserve";
                    await this._plugin.saveSettings();
                });
            });
    }
}

/**
 * Settings page for advanced options.
 */
class AdvancedSettings extends SettingsTabPage {
    /**
     * Creates a new AdvancedSettings instance.
     */
    constructor(plugin: PrettierPlugin) {
        super(plugin, "Advanced");
    }

    /**
     * Displays the advanced settings UI.
     */
    display(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Auto format")
            .setDesc("Automatically keep files formatted when changed")
            .addToggle((toggle) => {
                toggle.setValue(this._plugin.settings.autoFormat);
                toggle.onChange(async (value) => {
                    this._plugin.settings.autoFormat = value;
                    await this._plugin.saveSettings();
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
                dropdown.setValue(this._plugin.settings.logLevel.toString());
                dropdown.onChange(async (value) => {
                    this._plugin.settings.logLevel = parseInt(value) as LogLevel;
                    await this._plugin.saveSettings();
                });
            });
    }
}

export class PrettierSettingsTab extends PluginSettingTab {
    private tabs: SettingsTabPage[];

    constructor(app: App, plugin: PrettierPlugin) {
        super(app, plugin);

        this.tabs = [new GeneralSettings(plugin), new AdvancedSettings(plugin)];
    }

    /**
     * Displays the settings tab UI.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        const tabContainer = containerEl.createEl("div", {
            cls: "prettier-settings-tab-container",
        });

        const tabContentDiv = containerEl.createEl("div");

        this.tabs.forEach((tab) => {
            const tabEl = tabContainer.createEl("button", {
                text: tab.name,
                cls: "prettier-settings-tab-button",
            });

            tabEl.addEventListener("click", () => {
                tabContentDiv.empty();

                this.tabs.forEach((jtab) => {
                    jtab.isActive = jtab.id === tab.id;
                });

                this.updateTabButtonStyles(tabContainer);

                tab.display(tabContentDiv);
            });
        });

        // show the first tab to start off
        this.tabs[0].isActive = true;
        this.tabs[0].display(tabContentDiv);

        this.updateTabButtonStyles(tabContainer);
    }

    /**
     * Updates the styles for the tab buttons.
     */
    private updateTabButtonStyles(tabContainer: HTMLElement): void {
        const tabButtons = tabContainer.querySelectorAll(".prettier-settings-tab-button");

        tabButtons.forEach((button, index) => {
            const tab = this.tabs[index];
            if (tab && tab.isActive) {
                button.addClass("prettier-settings-tab-button-active");
            } else {
                button.removeClass("prettier-settings-tab-button-active");
            }
        });
    }
}
