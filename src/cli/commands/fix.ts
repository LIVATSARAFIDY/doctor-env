import { Command } from "commander";
import fs from "node:fs";
import pc from "picocolors";

import { parseEnv } from "../../env/parser.js";
import {
    getMissingLines,
    appendLines,
} from "../../env/writer.js";

export function registerFixCommand(program: Command): void {
    program
        .command("fix")
        .description(
            "Automatically add missing variables from the reference file"
        )
        .requiredOption("-t, --target <file>", "target file")
        .requiredOption("-r, --reference <file>", "reference file")
        .option(
            "--no-reference-value",
            "use empty values instead of reference values"
        )
        .option(
            "--dry-run",
            "show changes without modifying the target file",
            false
        )
        .action((options) => {
            const targetPath = options.target;
            const referencePath = options.reference;

            if (!fs.existsSync(targetPath)) {
                console.error(
                    `${pc.red("❌ Error: Target file not found:")} ${targetPath}`
                );
                process.exit(1);
            }

            if (!fs.statSync(targetPath).isFile()) {
                console.error(
                    `${pc.red("❌ Error: Target path is not a file:")} ${targetPath}`
                );
                process.exit(1);
            }

            if (!fs.existsSync(referencePath)) {
                console.error(
                    `${pc.red("❌ Error: Reference file not found:")} ${referencePath}`
                );
                process.exit(1);
            }

            if (!fs.statSync(referencePath).isFile()) {
                console.error(
                    `${pc.red("❌ Error: Reference path is not a file:")} ${referencePath}`
                );
                process.exit(1);
            }

            console.log(`Target: ${targetPath}`);
            console.log(`Reference: ${referencePath}`);

            const targetVars = parseEnv(targetPath);

            const targetValues = new Map(
                Array.from(targetVars, ([key, variable]) => [
                    key,
                    variable.value,
                ])
            );

            const missingLines = getMissingLines(
                targetValues,
                referencePath,
                options.referenceValue
            );

            if (missingLines.length === 0) {
                console.log(
                    `\n${pc.green("✓ Nothing to fix. Target is already synchronized.")}`
                );
                return;
            }

            console.log(`\n${pc.yellow("Variables to add:")}`);

            missingLines.forEach((line) => {
                const equalIndex = line.indexOf("=");

                const variableName =
                    equalIndex === -1
                        ? line
                        : line.slice(0, equalIndex);

                console.log(`+ ${variableName}`);
            });

            if (options.dryRun) {
                console.log(
                    `\n${pc.blue("ℹ  Dry run: no files were modified.")}`
                );
                return;
            }

            appendLines(
                targetPath,
                missingLines
            );

            console.log(
                `\n${pc.green("✓ Successfully added")} ${missingLines.length} ${pc.green(
                    missingLines.length === 1
                        ? "variable"
                        : "variables"
                )}.`
            );
        });
}