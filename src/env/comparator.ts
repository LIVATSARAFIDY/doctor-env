export function compareSets(
    target: Set<string>,
    reference: Set<string>
) {
    const missing = [...reference].filter(
        (key) => !target.has(key)
    );

    return {
        missing,
    };
}