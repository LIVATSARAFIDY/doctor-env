import fs from "node:fs";

import type { EnvVariable } from "../core/types.js";

export function parseEnv(
    filePath: string
): Map<string, EnvVariable> {
    const content = fs.readFileSync(filePath, "utf8");

    const vars = new Map<string, EnvVariable>();

    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) return;
        if (trimmed.startsWith("#")) return;

        const equalIndex = trimmed.indexOf("=");

        if (equalIndex === -1) return;

        const key = trimmed
            .slice(0, equalIndex)
            .trim();

        let value = trimmed
            .slice(equalIndex + 1);

        let quoted = false;

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            quoted = true;
            value = value.slice(1, -1);
        }

        vars.set(key, {
            key,
            value,
            line: index + 1,
            quoted,
        });
    });

    return vars;
}