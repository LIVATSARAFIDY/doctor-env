import fs from "node:fs"

export function compareSets(
    target: Set<string>,
    reference: Set<string>
) {
    const missing = [...reference].filter(
        key => !target.has(key)
    );

    return {
        missing,
    };
}

export function fixContent(
    targetVars: Set<string>,
    targetPath: string,
    referencePath: string,
    referenceValue: boolean
): string[] {

    const missingLines: string[] = [];
    const referenceContent = fs.readFileSync(referencePath, "utf8");

    for (const line of referenceContent.split(/\r?\n/)) {

        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) continue;

        const equalIndex = trimmed.indexOf("=");

        if (equalIndex === -1) continue;

        const key = trimmed.slice(0, equalIndex);

        if (!targetVars.has(key)) {
            referenceValue ? missingLines.push(line) : missingLines.push(`${key}=`)
        }
    }

    if (missingLines.length > 0) {
        fs.appendFileSync(
            targetPath,
            "\n\n# Added by env-doctor\n" +
            missingLines.join("\n") +
            "\n"
        );
    }
    return missingLines;

}