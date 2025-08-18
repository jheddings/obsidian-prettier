// format.ts - formatting operations for the Obsidian Prettier plugin

import * as prettier from "prettier";

import * as parserMarkdown from "prettier/plugins/markdown";
import * as parserBabel from "prettier/plugins/babel";
import * as parserTypescript from "prettier/plugins/typescript";
import * as parserHtml from "prettier/plugins/html";
import * as parserPostcss from "prettier/plugins/postcss";
import * as parserYaml from "prettier/plugins/yaml";
import * as parserEstree from "prettier/plugins/estree";

import { App, TFile } from "obsidian";
import { Logger } from "./logger";

const PARSER_MAP: Record<string, string> = {
    ".md": "markdown",
    ".markdown": "markdown",
    ".js": "babel",
    ".jsx": "babel-flow",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".vue": "vue",
    ".xml": "html",
    ".svg": "html",
};

function inferParserFromFilepath(filepath: string): string | null {
    const extension = filepath.toLowerCase().split(".").pop();
    if (!extension) return null;

    const fullExtension = "." + extension;
    return PARSER_MAP[fullExtension] || null;
}

export async function format(
    content: string,
    options: prettier.Options,
    filepath?: string
): Promise<string> {
    const prettierOptions = { ...options };

    // add relevant plugins
    prettierOptions.plugins = [
        parserMarkdown,
        parserBabel,
        parserTypescript,
        parserHtml,
        parserPostcss,
        parserYaml,
        parserEstree,
    ];

    if (filepath) {
        prettierOptions.filepath = filepath;

        if (!prettierOptions.parser) {
            const inferredParser = inferParserFromFilepath(filepath);
            if (inferredParser) {
                prettierOptions.parser = inferredParser;
            }
        }
    }

    return prettier.format(content, prettierOptions);
}

export class Formatter {
    private app: App;
    private logger = Logger.getLogger("formatter");

    constructor(app: App) {
        this.app = app;
    }

    async formatContent(
        content: string,
        options: prettier.Options,
        filepath?: string
    ): Promise<string> {
        this.logger.debug(`Formatting content${filepath ? ` for file: ${filepath}` : ""}`);

        return format(content, options, filepath);
    }

    async formatFile(file: TFile, options: prettier.Options): Promise<boolean> {
        this.logger.debug(`Formatting file: ${file.path}`);

        const content = await this.app.vault.read(file);

        // Infer parser from file extension
        const inferredParser = inferParserFromFilepath(file.path);

        if (!inferredParser) {
            this.logger.warn(`No parser could be inferred for file: ${file.path}`);
            return false;
        }

        // Create formatting options with the inferred parser and file path
        const formatOptions: prettier.Options = {
            ...options,
            parser: inferredParser,
            filepath: file.path,
            plugins: [
                parserMarkdown,
                parserBabel,
                parserTypescript,
                parserHtml,
                parserPostcss,
                parserYaml,
                parserEstree,
            ],
        };

        try {
            const formattedContent = await prettier.format(content, formatOptions);

            if (content !== formattedContent) {
                this.logger.debug(`Formatted file: ${file.path}`);
                await this.app.vault.modify(file, formattedContent);
                return true;
            }

            this.logger.debug(`No changes made to file: ${file.path}`);
        } catch (error) {
            this.logger.error(`Error formatting file ${file.path}:`, error);
            throw error;
        }

        return false;
    }
}
