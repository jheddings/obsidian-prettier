// settings.ts - settings UI for the Obsidian Prettier plugin

import { PluginSettingTab, App, Setting } from "obsidian";
import { LogLevel } from "./logger";
import PrettierPlugin from "./main";

function generateLinkElement(name: string, docUrl: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const link = document.createElement("a");

    link.href = docUrl;
    link.textContent = name;
    link.className = "external-link";

    fragment.appendChild(link);
    return fragment;
}

function generatePrettierLink(name: string, option: string): DocumentFragment {
    return generateLinkElement(name, `https://prettier.io/docs/en/options.html#${option}`);
}

interface SettingConfig {
    name: string | DocumentFragment;
    description: string;
}

/**
 * Base class for reusable setting elements.
 */
abstract class BaseSetting<T> {
    protected name: string | DocumentFragment;
    protected description: string;

    constructor(config: SettingConfig) {
        this.name = config.name;
        this.description = config.description;
    }

    abstract get value(): T;

    abstract set value(val: T);

    abstract get default(): T;

    /**
     * Creates the setting element in the provided container.
     */
    abstract display(containerEl: HTMLElement): Setting;
}

/**
 * Toggle setting for boolean values.
 */
abstract class ToggleSetting extends BaseSetting<boolean> {
    display(containerEl: HTMLElement): Setting {
        return new Setting(containerEl)
            .setName(this.name)
            .setDesc(this.description)
            .addToggle((toggle) => {
                toggle.setValue(this.value);
                toggle.onChange(async (value) => {
                    this.value = value;
                });
            });
    }
}

/**
 * Slider setting for numeric values.
 */
abstract class SliderSetting extends BaseSetting<number> {
    display(containerEl: HTMLElement): Setting {
        return new Setting(containerEl)
            .setName(this.name)
            .setDesc(this.description)
            .addSlider((slider) => {
                slider.setLimits(this.minimum, this.maximum, this.step);
                slider.setDynamicTooltip();
                slider.setValue(this.value);
                slider.onChange(async (value) => {
                    this.value = value;
                });
            });
    }

    abstract get minimum(): number;

    abstract get maximum(): number;

    abstract get step(): number;
}

/**
 * Dropdown setting for enumerated values.
 */
abstract class DropdownSetting<T> extends BaseSetting<T> {
    display(containerEl: HTMLElement): Setting {
        return new Setting(containerEl)
            .setName(this.name)
            .setDesc(this.description)
            .addDropdown((dropdown) => {
                this.options.forEach(({ key, label }) => {
                    dropdown.addOption(key, label);
                });
                dropdown.setValue(this.getKeyForValue(this.value));
                dropdown.onChange(async (key) => {
                    this.value = this.getValueForKey(key);
                });
            });
    }

    abstract get options(): { key: string; label: string; value: T }[];

    /**
     * Get the key for a given value.
     */
    protected getKeyForValue(value: T): string {
        const option = this.options.find((opt) => opt.value === value);
        return option?.key ?? this.options[0]?.key ?? "";
    }

    /**
     * Get the value for a given key.
     */
    protected getValueForKey(key: string): T {
        const option = this.options.find((opt) => opt.key === key);
        return option?.value ?? this.options[0]?.value;
    }
}

/**
 * Control the tab width user setting.
 * https://prettier.io/docs/options#tab-width
 */
class TabWidthSetting extends SliderSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Tab width", "tab-width"),
            description: "Specify the number of spaces per indentation-level.",
        });
    }

    get value(): number {
        return this.plugin.settings.prettierOptions.tabWidth ?? this.default;
    }

    set value(val: number) {
        this.plugin.settings.prettierOptions.tabWidth = val;
        this.plugin.saveSettings();
    }

    get default(): number {
        return 2;
    }

    get minimum(): number {
        return 1;
    }

    get maximum(): number {
        return 8;
    }

    get step(): number {
        return 1;
    }
}

/**
 * Control the use-tab user setting.
 * https://prettier.io/docs/options.html#tabs
 */
class UseTabsSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Use tabs", "tabs"),
            description: "Indent lines with tabs instead of spaces.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.useTabs as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.useTabs = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
    }
}

/**
 * Controls the print width user setting.
 * https://prettier.io/docs/options.html#print-width
 */
class PrintWidthSetting extends SliderSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Print width", "print-width"),
            description: "Specify the line length that the printer will wrap on.",
        });
    }

    get value(): number {
        return (this.plugin.settings.prettierOptions.printWidth as number) ?? this.default;
    }

    set value(val: number) {
        this.plugin.settings.prettierOptions.printWidth = val;
        this.plugin.saveSettings();
    }

    get default(): number {
        return 80;
    }

    get minimum(): number {
        return 1;
    }

    get maximum(): number {
        return 200;
    }

    get step(): number {
        return 1;
    }
}

enum ProseWrapOptions {
    ALWAYS = "always",
    NEVER = "never",
    PRESERVE = "preserve",
}

/**
 * Controls the prose width user setting.
 * https://prettier.io/docs/options.html#prose-wrap
 */
class ProseWrapSetting extends DropdownSetting<ProseWrapOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Prose wrap", "prose-wrap"),
            description: "How to wrap prose (markdown text).",
        });
    }

    get default(): ProseWrapOptions {
        return ProseWrapOptions.PRESERVE;
    }

    get value(): ProseWrapOptions {
        return (this.plugin.settings.prettierOptions.proseWrap as ProseWrapOptions) ?? this.default;
    }

    set value(val: ProseWrapOptions) {
        this.plugin.settings.prettierOptions.proseWrap = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: ProseWrapOptions }[] {
        return Object.entries(ProseWrapOptions).map(([_key, value]) => ({
            key: value,
            label: value,
            value,
        }));
    }
}

/**
 * Controls the auto format user setting.
 */
class AutoFormatSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: "Auto format",
            description: "Automatically format files when they change.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.autoFormat as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.autoFormat = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
    }
}

/**
 * Control the log level user setting.
 */
class LogLevelSetting extends DropdownSetting<LogLevel> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: "Log level",
            description: "Set the logging level for console output.",
        });
    }

    get value(): LogLevel {
        return this.plugin.settings.logLevel ?? this.default;
    }

    set value(val: LogLevel) {
        this.plugin.settings.logLevel = val;
        this.plugin.saveSettings();
    }

    get default(): LogLevel {
        return LogLevel.INFO;
    }

    get options(): { key: string; label: string; value: LogLevel }[] {
        return Object.entries(LogLevel)
            .filter(([_key, value]) => typeof value === "number")
            .map(([key, value]) => ({
                key: key,
                label: key.toLowerCase(),
                value: value as LogLevel,
            }));
    }
}

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
     */
    get id(): string {
        return this._name.toLowerCase().replace(/\s+/g, "-");
    }

    /**
     * Gets the tab page name.
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
        new TabWidthSetting(this._plugin).display(containerEl);
        new UseTabsSetting(this._plugin).display(containerEl);
        new PrintWidthSetting(this._plugin).display(containerEl);
        new ProseWrapSetting(this._plugin).display(containerEl);
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
        new AutoFormatSetting(this._plugin).display(containerEl);
        new LogLevelSetting(this._plugin).display(containerEl);
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
