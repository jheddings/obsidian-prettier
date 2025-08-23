// settings.ts - settings UI for the Obsidian Prettier plugin

import { App } from "obsidian";
import { LogLevel, PluginSettingsTab, SettingsTabPage } from "obskit";
import { DropdownSetting, SliderSetting, ToggleSetting } from "obskit";
import { ProseWrapOptions } from "./config";
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
 * Controls the single quote user setting.
 * https://prettier.io/docs/options.html#quotes
 */
class SingleQuoteSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Single quotes", "quotes"),
            description: "Use single quotes instead of double quotes.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.singleQuote as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.singleQuote = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
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
        return this.plugin.settings.autoFormat ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.autoFormat = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
    }
}

/**
 * Control the show notices user setting.
 */
class ShowNoticesSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: "Show notices",
            description:
                "Display notices after formatting. When disabled, notices are only shown for errors.",
        });
    }

    get value(): boolean {
        return this.plugin.settings.showNotices ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.showNotices = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return true;
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
 * Settings page for general options.
 */
class GeneralSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("General");
    }

    /**
     * Displays the general settings UI.
     */
    display(containerEl: HTMLElement): void {
        new TabWidthSetting(this.plugin).display(containerEl);
        new UseTabsSetting(this.plugin).display(containerEl);
        new PrintWidthSetting(this.plugin).display(containerEl);
        new ProseWrapSetting(this.plugin).display(containerEl);
        new SingleQuoteSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings page for advanced options.
 */
class AdvancedSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("Advanced");
    }

    /**
     * Displays the advanced settings UI.
     */
    display(containerEl: HTMLElement): void {
        new AutoFormatSetting(this.plugin).display(containerEl);
        new ShowNoticesSetting(this.plugin).display(containerEl);
        new LogLevelSetting(this.plugin).display(containerEl);
    }
}

export class PrettierSettingsTab extends PluginSettingsTab {
    constructor(app: App, plugin: PrettierPlugin) {
        super(app, plugin);

        this.addTabs([new GeneralSettings(plugin), new AdvancedSettings(plugin)]);
    }
}
