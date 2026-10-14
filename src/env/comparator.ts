import type { CompareResult } from "../core/types.js";

export function compareEnvs(
    target: Map<string, string>,
    reference: Map<string, string>
): CompareResult {
    const missing: string[] = [];
    const extra: string[] = [];
    const different: string[] = [];
    const matching: string[] = [];

    for (const [key, referenceValue] of reference) {
        if (!target.has(key)) {
            missing.push(key);
            continue;
        }

        const targetValue = target.get(key);

        if (targetValue !== referenceValue) {
            different.push(key);
        } else {
            matching.push(key);
        }
    }

    for (const key of target.keys()) {
        if (!reference.has(key)) {
            extra.push(key);
        }
    }

    return {
        missing,
        extra,
        different,
        matching,
    };
}