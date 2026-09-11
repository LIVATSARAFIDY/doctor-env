import { Command } from "commander";
import fs from "node:fs";
import pc from "picocolors";

import { parseEnv } from "../../env/parser.js";
import { scanSource } from "../../scanner/sourceScanner.js";

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
            "--env-file <file>",
            "Environment file used as reference eg: .env,.env.dev",
            "./.env"
        )
        .requiredOption(
            "--extensions <extensions>",
            "Comma-separated list of file extensions eg: .js, .ts"
        )
        .option(
            "--fix",
            "Remove unused variables from the environment file",
            false
        )
        .action((options) => {
            const srcDirs: string[] = options.src
                ? options.src.split(",")
                : ["./src"];

            const envFile = options.envFile || "./.env";

            const extensions: string[] =
                options.extensions.split(",");

            const fix = options.fix || false;

            if (!fs.existsSync(envFile)) {
                console.error(
                    `${pc.red(
                        "❌ Error: Environment file not found:"
                    )} ${envFile}`
                );

                process.exit(1);
            }

            const envVars = parseEnv(envFile);
            const envVarsArray = Array.from(envVars);

            console.log(
                `Scanning for unused variables in: ${envFile}`
            );

            console.log(
                `Source directories: ${srcDirs.join(", ")}`
            );

            console.log(
                `File extensions: ${extensions.join(", ")}`
            );

            const usedVars = scanSource(
                srcDirs,
                extensions,
                envVars
            );

            const unusedVars = envVarsArray.filter(
                (varName) => !usedVars.has(varName)
            );

            console.log(`\n${pc.blue("🔍 Scan Results:")}`);

            console.log(
                `${pc.green("✓ Used variables:")} ${usedVars.size}`
            );

            console.log(
                `${pc.red("✗ Unused variables:")} ${unusedVars.length}`
            );

            if (unusedVars.length > 0) {
                console.log(
                    `\n${pc.red("-unused variables:")}`
                );

                unusedVars.forEach((varName) => {
                    console.log(`- ${varName}`);
                });

                if (fix) {
                    removeUnusedVariables(
                        envFile,
                        unusedVars
                    );
                }
            } else {
                console.log(
                    `\n${pc.green(
                        "✓ All environment variables are used!"
                    )}`
                );
            }
        });
}
function removeUnusedVariables(
    envFile: string,
    unusedVars: string[]
): void {
    console.log(
        `\n${pc.yellow(
            "🔧 Fixing: Removing unused variables from"
        )} ${envFile}`
    );

    try {
        const envContent = fs.readFileSync(
            envFile,
            "utf8"
        );

        const lines = envContent.split(/\r?\n/);

        const filteredLines = lines.filter((line) => {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) {
                return true;
            }

            const equalIndex = trimmed.indexOf("=");

            if (equalIndex === -1) {
                return true;
            }

            const varName = trimmed.slice(
                0,
                equalIndex
            );

            return !unusedVars.includes(varName);
        });

        fs.writeFileSync(
            envFile,
            filteredLines.join("\n")
        );

        console.log(
            `${pc.green("✓ Successfully removed")} ${unusedVars.length
            } ${pc.green("unused variables")}`
        );
    } catch (error) {
        console.error(
            `${pc.red(
                "❌ Error: Failed to modify environment file:"
            )}`,
            error
        );

        process.exit(1);
    }
}