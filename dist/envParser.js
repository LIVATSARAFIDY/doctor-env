import fs from "fs";
export function parseEnv(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const vars = new Set();
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        if (trimmed.startsWith("#"))
            continue;
        const equalIndex = trimmed.indexOf("=");
        if (equalIndex === -1)
            continue;
        vars.add(trimmed.slice(0, equalIndex));
    }
    return vars;
}
//# sourceMappingURL=envParser.js.map