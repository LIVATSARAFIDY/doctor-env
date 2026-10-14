import fs from "node:fs";

export function getMissingLines(
    targetVars: Map<string, string>,
    referencePath: string,
    useReferenceValues: boolean
): string[] {
    const missingLines: string[] = [];

    const referenceContent = fs.readFileSync(
        referencePath,
        "utf8"
    );

    for (const line of referenceContent.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const equalIndex = trimmed.indexOf("=");

        if (equalIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, equalIndex);

        if (!targetVars.has(key)) {
            missingLines.push(
                useReferenceValues
                    ? line
                    : `${key}=`
            );
        }
    }

    return missingLines;
}

export function appendLines(
    targetPath: string,
    lines: string[]
): void {
    if (lines.length === 0) {
        return;
    }

    fs.appendFileSync(
        targetPath,
        "\n\n# Added by env-doctor\n" +
        lines.join("\n") +
        "\n"
    );
}

export function removeVariables(
    envFile: string,
    variablesToRemove: string[]
): void {
    const envContent = fs.readFileSync(
        envFile,
        "utf8"
    );

    const lineEnding = envContent.includes("\r\n")
        ? "\r\n"
        : "\n";

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

        const variableName = trimmed
            .slice(0, equalIndex)
            .trim();

        return !variablesToRemove.includes(variableName);
    });

    fs.writeFileSync(
        envFile,
        filteredLines.join(lineEnding)
    );
}