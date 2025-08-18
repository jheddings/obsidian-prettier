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

export class Formatter {
    private app: App;
    private logger = Logger.getLogger("formatter");

    constructor(app: App) {
        this.app = app;
    }

    async formatFile(file: TFile, options: prettier.Options): Promise<boolean> {
        this.logger.debug(`Formatting file: ${file.path}`);

        const content = await this.app.vault.read(file);

        const formatted = await prettier.format(content, {
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
            ...options,
        });

        if (content === formatted) {
            this.logger.debug(`No changes made to file: ${file.path}`);
            return false;
        }

        this.logger.debug(`Formatted file: ${file.path}`);
        await this.app.vault.modify(file, formatted);

        return true;
    }
}
