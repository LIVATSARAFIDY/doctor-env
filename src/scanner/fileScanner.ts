import fs from "node:fs";
import path from "node:path";

export function scanFiles(
    directories: string[],
    extensions: string[]
): string[] {
    const files: string[] = [];

    function scanDirectory(directory: string): void {
        const entries = fs.readdirSync(directory);

        entries.forEach((entry) => {
            const filePath = path.join(directory, entry);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
                return;
            }

            const fileExt = path.extname(entry);

            if (extensions.includes(fileExt)) {
                files.push(filePath);
            }
        });
    }

    directories.forEach((directory) => {
        if (!fs.existsSync(directory)) {
            throw new Error(
                `Source directory not found: ${directory}`
            );
        }

        if (!fs.statSync(directory).isDirectory()) {
            throw new Error(
                `Source path is not a directory: ${directory}`
            );
        }

        scanDirectory(directory);
    });

    return files;
}