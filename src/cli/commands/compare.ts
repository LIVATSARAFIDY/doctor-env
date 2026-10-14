import { Command } from "commander";
import fs from "node:fs";
import pc from "picocolors";

import { parseEnv } from "../../env/parser.js";
import { compareEnvs } from "../../env/comparator.js";

export function registerCompareCommand(program: Command): void {
    program
        .command("compare")
        .description("Compare two .env files")
        .requiredOption("-t, --target <file>", "file target")
        .requiredOption("-r, --reference <file>", "file reference")
        .action((options) => {
            const targetPath = options.target;
            const referencePath = options.reference;

            if (!fs.existsSync(targetPath)) {
                console.error(
                    `${pc.red("❌ Error: targetPath file not found:")} ${targetPath}`
                );
                process.exit(1);
            }

            if (!fs.statSync(targetPath).isFile()) {
                console.error(
                    `${pc.red("❌ Error: targetPath path is not a file:")} ${targetPath}`
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

            const envTarget = parseEnv(targetPath);
            const envReference = parseEnv(referencePath);

            const targetValues = new Map(
                Array.from(envTarget, ([key, variable]) => [
                    key,
                    variable.value,
                ])
            );

            const referenceValues = new Map(
                Array.from(envReference, ([key, variable]) => [
                    key,
                    variable.value,
                ])
            );

            const result = compareEnvs(
                targetValues,
                referenceValues
            );

            console.log(`\n${pc.blue("Environment comparison:")}`);

            console.log(`\n${pc.green("✓ Matching variables:")}`);

            if (result.matching.length === 0) {
                console.log("None");
            } else {
                result.matching.forEach((variable) => {
                    console.log(`- ${variable}`);
                });
            }

            console.log(`\n${pc.yellow("⚠ Different values:")}`);

            if (result.different.length === 0) {
                console.log("None");
            } else {
                result.different.forEach((variable) => {
                    console.log(`- ${variable}`);
                });
            }

            console.log(`\n${pc.red("✖ Missing variables:")}`);

            if (result.missing.length === 0) {
                console.log("None");
            } else {
                result.missing.forEach((variable) => {
                    console.log(`- ${variable}`);
                });
            }

            console.log(`\n${pc.magenta("+ Extra variables:")}`);

            if (result.extra.length === 0) {
                console.log("None");
            } else {
                result.extra.forEach((variable) => {
                    console.log(`- ${variable}`);
                });
            }
        });
}