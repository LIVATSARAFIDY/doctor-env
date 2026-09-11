export function detectVariables(
    content: string,
    envVars: Set<string>
): Set<string> {
    const usedVars = new Set<string>();

    const regexPatterns = [
        /process\.env\.([A-Z0-9_]+)/g,
        /\$\{([A-Z0-9_]+)\}/g,
        /\$([A-Z0-9_]+)\b/g,
    ];

    regexPatterns.forEach((pattern) => {
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(content)) !== null) {
            const varName = match[1];

            if (varName && envVars.has(varName)) {
                usedVars.add(varName);
            }
        }
    });

    return usedVars;
}