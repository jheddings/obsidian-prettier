// settings.ts - settings UI for the Obsidian Prettier plugin

import { App } from "obsidian";
import { LogLevel, PluginSettingsTab, DropdownSetting, ToggleSetting } from "obskit";

import PrettierPlugin from "./main";

/**
 * Control the auto format user setting.
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
        return [
            { key: "debug", label: "Debug", value: LogLevel.DEBUG },
            { key: "info", label: "Info", value: LogLevel.INFO },
            { key: "warn", label: "Warn", value: LogLevel.WARN },
            { key: "error", label: "Error", value: LogLevel.ERROR },
            { key: "silent", label: "Silent", value: LogLevel.SILENT },
        ];
    }
}

/**
 * Settings tab for the Prettier plugin.
 */
export class PrettierSettingsTab extends PluginSettingsTab {
    constructor(
        app: App,
        private plugin: PrettierPlugin
    ) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new AutoFormatSetting(this.plugin).display(containerEl);
        new ShowNoticesSetting(this.plugin).display(containerEl);
        new LogLevelSetting(this.plugin).display(containerEl);
    }
}
