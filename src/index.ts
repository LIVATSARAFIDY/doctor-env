#!/usr/bin/env node
import { Command } from "commander";
import { parseEnv } from "./envParser.js";
import { compareSets, fixContent } from "./action.js";

import path from "path";
import pc from "picocolors";
import fs from "node:fs";

const program = new Command();

program
    .name('env-doctor')
    .description('Synchronize and validate .env files as a team')
    .version('1.0.0')

program
    .command("compare")
    .description("Compare two .env files")
    .argument("[projectPath]", "project path", ".")
    .requiredOption("-t, --target <file>", "file target")
    .requiredOption("-r, --reference <file>", "file reference")
    .action((projectPath, options) => {
        const targetPath = path.join(projectPath || ".", options.target);
        const referencePath = path.join(projectPath || ".", options.reference);

        if (!fs.existsSync(targetPath)) {
            console.error(`${pc.red("❌ Error: Target file not found:")} ${targetPath}`);
            process.exit(1);
        }

        if (!fs.existsSync(referencePath)) {
            console.error(`${pc.red("❌ Error: Reference file not found:")} ${referencePath}`);
            process.exit(1);
        }

        console.log(`Target: ${targetPath}`);
        console.log(`Reference: ${referencePath}`);

        const envTarget = parseEnv(targetPath);
        const envReference = parseEnv(referencePath);
        const result = compareSets(envTarget, envReference);

        console.log(`\n${pc.red('✖  Missing variables:')}`);

        if (result.missing.length === 0) {
            console.log("✓ None");
        } else {
            result.missing.forEach(variable => {
                console.log(`- ${variable}`);
            });
        }

    });

program
    .command("fix")
    .description("automatically adds to the target file the properties from the reference file that does not yet exist")
    .argument("[projectPath]", "project path", ".")
    .requiredOption("-t, --target <file>", "file target")
    .requiredOption("-r, --reference <file>", "file reference")
    .option("--no-reference-value", "use empty values instead of reference values")
    .action((projectPath, options) => {
        const targetPath = path.join(projectPath || ".", options.target);
        const referencePath = path.join(projectPath || ".", options.reference);

        if (!fs.existsSync(targetPath)) {
            console.error(`${pc.red("❌ Error: Target file not found:")} ${targetPath}`);
            process.exit(1);
        }

        if (!fs.existsSync(referencePath)) {
            console.error(`${pc.red("❌ Error: Reference file not found:")} ${referencePath}`);
            process.exit(1);
        }

        console.log(`Target: ${targetPath}`);
        console.log(`Reference: ${referencePath}`);

        const targetVars = parseEnv(targetPath);
        const result = fixContent(targetVars, targetPath, referencePath, true);

        console.log(`${pc.green("Fixing")} ${pc.green(`${options.target} file successfuly`)} `);

    })

program
    .command("scan-unused-vars")
    .description("Detect environment variables defined in a .env file but never used in the source code")
    .option('--src <paths>', 'Directories to scan eg: src,tests,scripts', './src')
    .option('--env-file <file>', 'Environment file used as reference eg: .env,.env.dev', './.env')
    .requiredOption('--extensions <extensions> ', 'Comma-separated list of file extensions eg: .js, .ts')
    .option('--fix', 'Remove unused variables from the environment file', false)
    .action((options) => {
        const srcDirs: string[] = options.src ? options.src.split(',') : ['./src'];
        const envFile = options.envFile || './.env';
        const extensions: string[] = options.extensions.split(',');
        const fix = options.fix || false;

        // Parse environment variables
        if (!fs.existsSync(envFile)) {
            console.error(`${pc.red("❌ Error: Environment file not found:")} ${envFile}`);
            process.exit(1);
        }

        const envVars = parseEnv(envFile);
        const envVarsArray = Array.from(envVars);

        console.log(`Scanning for unused variables in: ${envFile}`);
        console.log(`Source directories: ${srcDirs.join(', ')}`);
        console.log(`File extensions: ${extensions.join(', ')}`);

        // Scan source files for variable usage
        const usedVars = new Set<string>();
        const regexPatterns = [
            // Process.env.VAR_NAME
            /process\.env\.([A-Z0-9_]+)/g,
            // dotenv style: ${VAR_NAME}
            /\$\{([A-Z0-9_]+)\}/g,
            // dotenv style: $VAR_NAME (with word boundaries)
            /\$([A-Z0-9_]+)\b/g,
        ];

        srcDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                console.warn(`${pc.yellow("⚠ Warning: Directory not found:")} ${dir}`);
                return;
            }

            function scanDirectory(directory: string) {
                const files = fs.readdirSync(directory);

                files.forEach(file => {
                    const filePath = path.join(directory, file);
                    const stat = fs.statSync(filePath);

                    if (stat.isDirectory()) {
                        scanDirectory(filePath);
                    } else {
                        const fileExt = path.extname(file);
                        if (extensions.includes(fileExt)) {
                            try {
                                const content = fs.readFileSync(filePath, 'utf8');

                                regexPatterns.forEach(pattern => {
                                    let match;
                                    while ((match = pattern.exec(content)) !== null) {
                                        const varName = match[1];
                                        if (varName && envVars.has(varName)) {
                                            usedVars.add(varName);
                                        }
                                    }
                                });
                            } catch (error) {
                                console.warn(`${pc.yellow("⚠ Warning: Could not read file:")} ${filePath}`);
                            }
                        }
                    }
                });
            }

            scanDirectory(dir);
        });

        // Find unused variables
        const unusedVars = envVarsArray.filter(varName => !usedVars.has(varName));

        console.log(`\n${pc.blue('🔍 Scan Results:')}`);
        console.log(`${pc.green('✓ Used variables:')} ${usedVars.size}`);
        console.log(`${pc.red('✗ Unused variables:')} ${unusedVars.length}`);

        if (unusedVars.length > 0) {
            console.log(`\n${pc.red('-unused variables:')}`);
            unusedVars.forEach(varName => {
                console.log(`- ${varName}`);
            });

            if (fix) {
                console.log(`\n${pc.yellow('🔧 Fixing: Removing unused variables from')} ${envFile}`);

                try {
                    const envContent = fs.readFileSync(envFile, 'utf8');
                    const lines = envContent.split(/\r?\n/);
                    const filteredLines = lines.filter(line => {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.startsWith('#')) return true;

                        const equalIndex = trimmed.indexOf('=');
                        if (equalIndex === -1) return true;

                        const varName = trimmed.slice(0, equalIndex);
                        return !unusedVars.includes(varName);
                    });

                    fs.writeFileSync(envFile, filteredLines.join('\n'));
                    console.log(`${pc.green('✓ Successfully removed')} ${unusedVars.length} ${pc.green('unused variables')}`);
                } catch (error) {
                    console.error(`${pc.red("❌ Error: Failed to modify environment file:")}`, error);
                    process.exit(1);
                }
            }
        } else {
            console.log(`\n${pc.green('✓ All environment variables are used!')}`);
        }
    })

program.parse();

if (!process.argv.slice(2).length) {
    program.help();
}
