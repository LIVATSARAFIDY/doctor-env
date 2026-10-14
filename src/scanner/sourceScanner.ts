import fs from "node:fs";

import { scanFiles } from "./fileScanner.js";
import { detectVariables } from "./variableDetector.js";

export interface SourceScanResult {
    usedVars: Set<string>;
    filesScanned: number;
    filesFailed: string[];
}

export function scanSource(
    directories: string[],
    extensions: string[],
    envVars: Set<string>
): SourceScanResult {
    const usedVars = new Set<string>();
    const filesFailed: string[] = [];

    const files = scanFiles(
        directories,
        extensions
    );

    files.forEach((filePath) => {
        try {
            const content = fs.readFileSync(
                filePath,
                "utf8"
            );

            const variables = detectVariables(
                content,
                envVars
            );

            variables.forEach((variable) => {
                usedVars.add(variable);
            });
        } catch {
            filesFailed.push(filePath);
        }
    });

    return {
        usedVars,
        filesScanned: files.length,
        filesFailed,
    };
}