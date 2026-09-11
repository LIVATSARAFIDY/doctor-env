import { Command } from "commander";
import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";

import { parseEnv } from "../../env/parser.js";
import { fixContent } from "../../env/writer.js";

export function registerFixCommand(program: Command): void {
    program
        .command("fix")
        .description(
            "automatically adds to the target file the properties from the reference file that does not yet exist"
        )
        .argument("[projectPath]", "project path", ".")
        .requiredOption("-t, --target <file>", "file target")
        .requiredOption("-r, --reference <file>", "file reference")
        .option(
            "--no-reference-value",
            "use empty values instead of reference values"
        )
        .action((projectPath, options) => {
            const targetPath = path.join(
                projectPath || ".",
                options.target
            );

            const referencePath = path.join(
                projectPath || ".",
                options.reference
            );

            if (!fs.existsSync(targetPath)) {
                console.error(
                    `${pc.red("❌ Error: Target file not found:")} ${targetPath}`
                );
                process.exit(1);
            }

            if (!fs.existsSync(referencePath)) {
                console.error(
                    `${pc.red("❌ Error: Reference file not found:")} ${referencePath}`
                );
                process.exit(1);
            }

            console.log(`Target: ${targetPath}`);
            console.log(`Reference: ${referencePath}`);

            const targetVars = parseEnv(targetPath);

            fixContent(
                targetVars,
                targetPath,
                referencePath,
                true
            );

            console.log(
                `${pc.green("Fixing")} ${pc.green(
                    `${options.target} file successfuly`
                )} `
            );
        });
}