import { Command } from "commander";

import { registerCompareCommand } from "./commands/compare.js";
import { registerFixCommand } from "./commands/fix.js";
import { registerScanUnusedCommand } from "./commands/scanUnused.js";

export function runCli(): void {
    const program = new Command();

    program
        .name("env-doctor")
        .description("Synchronize and validate .env files as a team")
        .version("1.0.0");

    registerCompareCommand(program);
    registerFixCommand(program);
    registerScanUnusedCommand(program);

    program.parse();

    if (!process.argv.slice(2).length) {
        program.help();
    }
}