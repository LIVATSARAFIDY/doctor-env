export function compareSets(env, example) {
    const missing = [...example].filter(key => !env.has(key));
    const unused = [...env].filter(key => !example.has(key));
    return {
        missing,
        unused
    };
}
//# sourceMappingURL=compare.js.map