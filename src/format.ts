// format.ts - formatting operations for the Obsidian Prettier plugin

import * as prettier from "prettier";

import * as parserMarkdown from "prettier/plugins/markdown";
import * as parserBabel from "prettier/plugins/babel";
import * as parserTypescript from "prettier/plugins/typescript";
import * as parserHtml from "prettier/plugins/html";
import * as parserPostcss from "prettier/plugins/postcss";
import * as parserYaml from "prettier/plugins/yaml";
import * as parserEstree from "prettier/plugins/estree";

import { App } from "obsidian";
import { Logger } from "./logger";

export function format(content: string, options: prettier.Options): Promise<string> {
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

    return prettier.format(content, prettierOptions);
}

export class Formatter {
    private app: App;
    private logger = Logger.getLogger("formatter");

    constructor(app: App) {
        this.app = app;
    }
}
