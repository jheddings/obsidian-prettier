// settings.ts - settings UI for the Obsidian Prettier plugin

import { App } from "obsidian";
import {
    LogLevel,
    PluginSettingsTab,
    SettingsTabPage,
    DropdownSetting,
    SliderSetting,
    ToggleSetting,
} from "obskit";

import {
    ProseWrapOptions,
    EmbeddedLanguageFormattingOptions,
    HtmlWhitespaceSensitivityOptions,
    TrailingCommaOptions,
    ArrowParensOptions,
    QuotePropsOptions,
    EndOfLineOptions,
} from "./config";
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

// ====================================================================
// FORMATTING SETTINGS
// ====================================================================

/**
 * Control the tab width user setting.
 * https://prettier.io/docs/options.html#tab-width
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
 * Control the use-tabs user setting.
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
 * Control the print width user setting.
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
 * Control the single quote user setting.
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
 * Control the bracket spacing setting.
 * https://prettier.io/docs/options.html#bracket-spacing
 */
class BracketSpacingSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Bracket spacing", "bracket-spacing"),
            description: "Print spaces between brackets in object literals.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.bracketSpacing as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.bracketSpacing = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return true;
    }
}

// ====================================================================
// MARKDOWN SETTINGS
// ====================================================================

/**
 * Control the prose wrap setting.
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
 * Control the embedded language formatting setting.
 * https://prettier.io/docs/options.html#embedded-language-formatting
 */
class EmbeddedLanguageFormattingSetting extends DropdownSetting<EmbeddedLanguageFormattingOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink(
                "Embedded language formatting",
                "embedded-language-formatting"
            ),
            description:
                "Control whether Prettier formats quoted code embedded in markdown code blocks.",
        });
    }

    get default(): EmbeddedLanguageFormattingOptions {
        return EmbeddedLanguageFormattingOptions.AUTO;
    }

    get value(): EmbeddedLanguageFormattingOptions {
        return (
            (this.plugin.settings.prettierOptions
                .embeddedLanguageFormatting as EmbeddedLanguageFormattingOptions) ?? this.default
        );
    }

    set value(val: EmbeddedLanguageFormattingOptions) {
        this.plugin.settings.prettierOptions.embeddedLanguageFormatting = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: EmbeddedLanguageFormattingOptions }[] {
        return [
            {
                key: "auto",
                label: "Auto (Format when detected)",
                value: EmbeddedLanguageFormattingOptions.AUTO,
            },
            {
                key: "off",
                label: "Off (Never format embedded code)",
                value: EmbeddedLanguageFormattingOptions.OFF,
            },
        ];
    }
}

/**
 * Control the HTML whitespace sensitivity setting.
 * https://prettier.io/docs/options.html#html-whitespace-sensitivity
 */
class HtmlWhitespaceSensitivitySetting extends DropdownSetting<HtmlWhitespaceSensitivityOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink(
                "HTML whitespace sensitivity",
                "html-whitespace-sensitivity"
            ),
            description: "Specify how to handle whitespace around HTML tags in markdown.",
        });
    }

    get default(): HtmlWhitespaceSensitivityOptions {
        return HtmlWhitespaceSensitivityOptions.CSS;
    }

    get value(): HtmlWhitespaceSensitivityOptions {
        return (
            (this.plugin.settings.prettierOptions
                .htmlWhitespaceSensitivity as HtmlWhitespaceSensitivityOptions) ?? this.default
        );
    }

    set value(val: HtmlWhitespaceSensitivityOptions) {
        this.plugin.settings.prettierOptions.htmlWhitespaceSensitivity = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: HtmlWhitespaceSensitivityOptions }[] {
        return [
            {
                key: "css",
                label: "CSS (Respect CSS display property)",
                value: HtmlWhitespaceSensitivityOptions.CSS,
            },
            {
                key: "strict",
                label: "Strict (All whitespace significant)",
                value: HtmlWhitespaceSensitivityOptions.STRICT,
            },
            {
                key: "ignore",
                label: "Ignore (All whitespace insignificant)",
                value: HtmlWhitespaceSensitivityOptions.IGNORE,
            },
        ];
    }
}

/**
 * Control the require pragma setting.
 * https://prettier.io/docs/options.html#require-pragma
 */
class RequirePragmaSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Require pragma", "require-pragma"),
            description: "Only format files that contain a special @prettier or @format comment.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.requirePragma as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.requirePragma = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
    }
}

/**
 * Control the insert pragma setting.
 * https://prettier.io/docs/options.html#insert-pragma
 */
class InsertPragmaSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Insert pragma", "insert-pragma"),
            description: "Insert a @format marker at the top of formatted files.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.insertPragma as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.insertPragma = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return false;
    }
}

// ====================================================================
// CODE BLOCK SETTINGS
// ====================================================================

/**
 * Control the trailing comma setting.
 * https://prettier.io/docs/options.html#trailing-commas
 */
class TrailingCommaSetting extends DropdownSetting<TrailingCommaOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Trailing comma", "trailing-commas"),
            description: "Print trailing commas wherever possible in multi-line code blocks.",
        });
    }

    get default(): TrailingCommaOptions {
        return TrailingCommaOptions.ALL;
    }

    get value(): TrailingCommaOptions {
        return (
            (this.plugin.settings.prettierOptions.trailingComma as TrailingCommaOptions) ??
            this.default
        );
    }

    set value(val: TrailingCommaOptions) {
        this.plugin.settings.prettierOptions.trailingComma = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: TrailingCommaOptions }[] {
        return [
            { key: "none", label: "None", value: TrailingCommaOptions.NONE },
            { key: "es5", label: "ES5", value: TrailingCommaOptions.ES5 },
            { key: "all", label: "All", value: TrailingCommaOptions.ALL },
        ];
    }
}

/**
 * Control the arrow parens setting.
 * https://prettier.io/docs/options.html#arrow-function-parentheses
 */
class ArrowParensSetting extends DropdownSetting<ArrowParensOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Arrow parens", "arrow-function-parentheses"),
            description:
                "Include parentheses around a sole arrow function parameter in code blocks.",
        });
    }

    get default(): ArrowParensOptions {
        return ArrowParensOptions.ALWAYS;
    }

    get value(): ArrowParensOptions {
        return (
            (this.plugin.settings.prettierOptions.arrowParens as ArrowParensOptions) ?? this.default
        );
    }

    set value(val: ArrowParensOptions) {
        this.plugin.settings.prettierOptions.arrowParens = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: ArrowParensOptions }[] {
        return [
            { key: "always", label: "Always", value: ArrowParensOptions.ALWAYS },
            { key: "avoid", label: "Avoid", value: ArrowParensOptions.AVOID },
        ];
    }
}

/**
 * Control the quote props setting.
 * https://prettier.io/docs/options.html#quote-props
 */
class QuotePropsSetting extends DropdownSetting<QuotePropsOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Quote props", "quote-props"),
            description: "Change when properties in objects are quoted in code blocks.",
        });
    }

    get default(): QuotePropsOptions {
        return QuotePropsOptions.AS_NEEDED;
    }

    get value(): QuotePropsOptions {
        return (
            (this.plugin.settings.prettierOptions.quoteProps as QuotePropsOptions) ?? this.default
        );
    }

    set value(val: QuotePropsOptions) {
        this.plugin.settings.prettierOptions.quoteProps = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: QuotePropsOptions }[] {
        return [
            { key: "as-needed", label: "As Needed", value: QuotePropsOptions.AS_NEEDED },
            { key: "consistent", label: "Consistent", value: QuotePropsOptions.CONSISTENT },
            { key: "preserve", label: "Preserve", value: QuotePropsOptions.PRESERVE },
        ];
    }
}

/**
 * Control the semi setting.
 * https://prettier.io/docs/options.html#semicolons
 */
class SemiSetting extends ToggleSetting {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("Semicolons", "semicolons"),
            description: "Print semicolons at the ends of statements in code blocks.",
        });
    }

    get value(): boolean {
        return (this.plugin.settings.prettierOptions.semi as boolean) ?? this.default;
    }

    set value(val: boolean) {
        this.plugin.settings.prettierOptions.semi = val;
        this.plugin.saveSettings();
    }

    get default(): boolean {
        return true;
    }
}

// ====================================================================
// FILE SETTINGS
// ====================================================================

/**
 * Control the end of line setting.
 * https://prettier.io/docs/options.html#end-of-line
 */
class EndOfLineSetting extends DropdownSetting<EndOfLineOptions> {
    constructor(private plugin: PrettierPlugin) {
        super({
            name: generatePrettierLink("End of line", "end-of-line"),
            description: "Specify the line ending style to use.",
        });
    }

    get default(): EndOfLineOptions {
        return EndOfLineOptions.LF;
    }

    get value(): EndOfLineOptions {
        return (this.plugin.settings.prettierOptions.endOfLine as EndOfLineOptions) ?? this.default;
    }

    set value(val: EndOfLineOptions) {
        this.plugin.settings.prettierOptions.endOfLine = val;
        this.plugin.saveSettings();
    }

    get options(): { key: string; label: string; value: EndOfLineOptions }[] {
        return [
            { key: "lf", label: "LF (Unix/Linux/macOS)", value: EndOfLineOptions.LF },
            { key: "crlf", label: "CRLF (Windows)", value: EndOfLineOptions.CRLF },
            { key: "cr", label: "CR (Classic Mac)", value: EndOfLineOptions.CR },
            { key: "auto", label: "Auto (Maintain existing)", value: EndOfLineOptions.AUTO },
        ];
    }
}

// ====================================================================
// PLUGIN SETTINGS
// ====================================================================

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

// ====================================================================
// TAB PAGES
// ====================================================================

/**
 * Settings page for formatting options.
 */
class FormattingSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("Formatting");
    }

    /**
     * Displays the formatting settings UI.
     */
    display(containerEl: HTMLElement): void {
        new TabWidthSetting(this.plugin).display(containerEl);
        new UseTabsSetting(this.plugin).display(containerEl);
        new PrintWidthSetting(this.plugin).display(containerEl);
        new SingleQuoteSetting(this.plugin).display(containerEl);
        new BracketSpacingSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings page for markdown-specific options.
 */
class MarkdownSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("Markdown");
    }

    /**
     * Displays the markdown settings UI.
     */
    display(containerEl: HTMLElement): void {
        new ProseWrapSetting(this.plugin).display(containerEl);
        new EmbeddedLanguageFormattingSetting(this.plugin).display(containerEl);
        new HtmlWhitespaceSensitivitySetting(this.plugin).display(containerEl);
        new RequirePragmaSetting(this.plugin).display(containerEl);
        new InsertPragmaSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings page for code block options.
 */
class CodeBlockSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("Code Blocks");
    }

    /**
     * Displays the code block settings UI.
     */
    display(containerEl: HTMLElement): void {
        new TrailingCommaSetting(this.plugin).display(containerEl);
        new ArrowParensSetting(this.plugin).display(containerEl);
        new QuotePropsSetting(this.plugin).display(containerEl);
        new SemiSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings page for file options.
 */
class FileSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("File Options");
    }

    /**
     * Displays the file settings UI.
     */
    display(containerEl: HTMLElement): void {
        new EndOfLineSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings page for plugin behavior options.
 */
class PluginSettings extends SettingsTabPage {
    constructor(private plugin: PrettierPlugin) {
        super("Plugin");
    }

    /**
     * Displays the plugin settings UI.
     */
    display(containerEl: HTMLElement): void {
        new AutoFormatSetting(this.plugin).display(containerEl);
        new ShowNoticesSetting(this.plugin).display(containerEl);
        new LogLevelSetting(this.plugin).display(containerEl);
    }
}

/**
 * Settings tab for the Prettier plugin.
 */
export class PrettierSettingsTab extends PluginSettingsTab {
    constructor(app: App, plugin: PrettierPlugin) {
        super(app, plugin);

        this.addTabs([
            new FormattingSettings(plugin),
            new MarkdownSettings(plugin),
            new CodeBlockSettings(plugin),
            new FileSettings(plugin),
            new PluginSettings(plugin),
        ]);
    }
}
