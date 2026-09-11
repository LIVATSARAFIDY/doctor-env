import fs from "node:fs";

import { scanFiles } from "./fileScanner.js";
import { detectVariables } from "./variableDetector.js";

export function scanSource(
    directories: string[],
    extensions: string[],
    envVars: Set<string>
): Set<string> {
    const usedVars = new Set<string>();

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
            // The caller will handle read errors later.
        }
    });

    return usedVars;
}