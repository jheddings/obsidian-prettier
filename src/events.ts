// helpers.ts - utilities for the Obsidian Prettier plugin

import { App, TFile, EventRef } from "obsidian";
import { Logger } from "./logger";

export class EventManager {
    private app: App;
    private logger = Logger.getLogger("EventManager");
    private eventRefs: EventRef[] = [];

    constructor(app: App) {
        this.app = app;
    }

    onModify(fileCallback: (file: TFile) => Promise<void>) {
        const eventRef = this.app.vault.on("modify", async (file) => {
            if (file instanceof TFile) {
                this.logger.debug(`File modified: ${file.path}`);
                await fileCallback(file);
            }
        });

        this.eventRefs.push(eventRef);

        this.logger.debug("Added 'modify' event listener");
    }

    clearEvents() {
        this.eventRefs.forEach((eventRef) => {
            this.app.vault.offref(eventRef);
        });

        this.eventRefs = [];

        this.logger.debug("All vault event listeners cleared");
    }
}
