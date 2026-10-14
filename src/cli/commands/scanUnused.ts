
import { Command } from "commander";
import fs from "node:fs";
import pc from "picocolors";

import { parseEnv } from "../../env/parser.js";
import { scanSource } from "../../scanner/sourceScanner.js";

import type {
    ScanUnusedVarsResult,
    ScanUnusedVarsFixResult,
} from "../../core/types.js";

import { removeVariables } from "../../env/writer.js";

export function registerScanUnusedCommand(
    program: Command
): void {
    program
        .command("scan-unused-vars")
        .description(
            "Detect environment variables defined in a .env file but never used in the source code"
        )
        .option(
            "--src <paths>",
            "Directories to scan eg: src,tests,scripts",
            "./src"
        )
        .option(
            "--env <file>",
            "Environment file used as reference eg: .env,.env.dev",
            "./.env"
        )
        .requiredOption(
            "--extensions <extensions>",
            "Comma-separated list of file extensions eg: \".js, .ts\""
        )
        .option(
            "--fix",
            "Remove unused variables from the environment file",
            false
        )
        .option(
            "--dry-run",
            "Show what would be changed without modifying the .env file"
        )
        .option(
            "--json",
            "Output results as JSON"
        )
        .action((options) => {
            const srcDirs: string[] = options.src
                ? options.src.split(",")
                : ["./src"];

            const envFile = options.env || "./.env";

            const extensions: string[] = options.extensions
                .split(",")
                .map((extension: string) => {
                    const trimmed = extension.trim();

                    return trimmed.startsWith(".")
                        ? trimmed
                        : `.${trimmed}`;
                });

            const fix = options.fix || false;
            const dryRun = options.dryRun || false;
            const json = options.json || false;

            if (!fs.existsSync(envFile)) {
                if (json) {
                    console.error(
                        JSON.stringify({
                            error: "Environment file not found",
                            envFile,
                        })
                    );
                } else {
                    console.error(
                        `${pc.red(
                            "❌ Error: Environment file not found:"
                        )} ${envFile}`
                    );
                }

                process.exit(1);
            }

            const envVars = parseEnv(envFile);
            const envVarsArray = Array.from(envVars.keys());

            if (!json) {
                console.log(
                    `Scanning for unused variables in: ${envFile}`
                );

                console.log(
                    `Source directories: ${srcDirs.join(", ")}`
                );

                console.log(
                    `File extensions: ${extensions.join(", ")}`
                );
            }

            let scanResult;

            try {
                scanResult = scanSource(
                    srcDirs,
                    extensions,
                    new Set(envVars.keys())
                );
            } catch (error) {
                if (json) {
                    console.error(
                        JSON.stringify({
                            error: "Failed to scan source directories",
                            message:
                                error instanceof Error
                                    ? error.message
                                    : "Unknown error",
                        })
                    );
                } else {
                    console.error(
                        `${pc.red("❌ Error:")} ${error instanceof Error
                            ? error.message
                            : "Failed to scan source directories."
                        }`
                    );
                }

                process.exit(1);
            }

            if (scanResult.filesScanned === 0) {
                if (json) {
                    console.error(
                        JSON.stringify({
                            error: "No files found matching the requested extensions",
                            extensions,
                        })
                    );
                } else {
                    console.error(
                        `${pc.red(
                            "❌ Error:"
                        )} No files found matching the requested extensions.`
                    );
                }

                process.exit(1);
            }

            const usedVars = scanResult.usedVars;

            if (
                scanResult.filesFailed.length > 0 &&
                !json
            ) {
                console.log(
                    `\n${pc.yellow(
                        "⚠ Warning: Some files could not be read:"
                    )}`
                );

                scanResult.filesFailed.forEach((filePath) => {
                    console.log(`- ${filePath}`);
                });
            }

            const unusedVars = envVarsArray.filter(
                (varName) => !usedVars.has(varName)
            );

            const fixResult: ScanUnusedVarsFixResult = {
                requested: fix,
                applied: false,
                dryRun,
            };

            /*
             * Fix
             */
            if (fix && unusedVars.length > 0) {
                if (scanResult.filesFailed.length > 0) {
                    if (!json) {
                        console.log(
                            `\n${pc.yellow(
                                "⚠ Fix skipped because some source files could not be scanned."
                            )}`
                        );
                    }
                } else if (dryRun) {
                    if (!json) {
                        console.log(
                            `\n${pc.cyan(
                                "ℹ Dry run: no files were modified."
                            )}`
                        );

                        console.log(
                            `${pc.cyan(
                                "Variables that would be removed:"
                            )}`
                        );

                        unusedVars.forEach((variable) => {
                            console.log(`- ${variable}`);
                        });
                    }
                } else {
                    try {
                        removeVariables(
                            envFile,
                            unusedVars
                        );

                        fixResult.applied = true;

                        if (!json) {
                            console.log(
                                `${pc.green(
                                    "✓ Successfully removed"
                                )} ${unusedVars.length} ${unusedVars.length === 1
                                    ? "unused variable"
                                    : "unused variables"
                                }.`
                            );
                        }
                    } catch (error) {
                        if (json) {
                            console.error(
                                JSON.stringify({
                                    error: "Failed to modify environment file",
                                    message:
                                        error instanceof Error
                                            ? error.message
                                            : "Unknown error",
                                })
                            );
                        } else {
                            console.error(
                                `${pc.red(
                                    "❌ Error: Failed to modify environment file:"
                                )} ${error instanceof Error
                                    ? error.message
                                    : "Unknown error"
                                }`
                            );
                        }

                        process.exit(1);
                    }
                }
            }

            /*
             * JSON output
             */
            const result: ScanUnusedVarsResult = {
                command: "scan-unused-vars",
                envFile,
                filesScanned: scanResult.filesScanned,
                filesFailed: scanResult.filesFailed,
                used: Array.from(usedVars),
                unused: unusedVars,
                fix: fixResult,
            };

            if (json) {
                printJson(result);
                return;
            }

            /*
             * Human-readable output
             */
            console.log(
                `\n${pc.blue("🔍 Scan Results:")}`
            );

            console.log(
                `\n${pc.green("✓ Used variables:")}`
            );

            if (usedVars.size === 0) {
                console.log("None");
            } else {
                usedVars.forEach((varName) => {
                    console.log(`- ${varName}`);
                });
            }

            console.log(
                `\n${pc.red("✗ Unused variables:")}`
            );

            if (unusedVars.length === 0) {
                console.log("None");
            } else {
                unusedVars.forEach((varName) => {
                    console.log(`- ${varName}`);
                });
            }

            console.log(
                `\n${pc.blue("Summary:")}`
            );

            console.log(
                `${pc.green("✓")} ${usedVars.size} used`
            );

            console.log(
                `${pc.red("✗")} ${unusedVars.length} unused`
            );

            console.log(
                `${pc.blue("📁")} ${scanResult.filesScanned
                } ${scanResult.filesScanned === 1
                    ? "file"
                    : "files"
                } scanned`
            );
        });
}

function printJson(
    result: ScanUnusedVarsResult
): void {
    console.log(
        JSON.stringify(result, null, 2)
    );
}

