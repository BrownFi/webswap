type StubType = "hook" | "component" | "utils";

export function createStubs<T extends Record<string, any>>(source: T, type: StubType): T {
    const stubs = Object.fromEntries(
        Object.keys(source).map((key) => {
            const stub = type === "hook" ? () => ({}) : () => null;
            return [key, stub];
        })
    );
    return stubs as T;
}

export function createSafeModule<H extends Record<string, any>, C extends Record<string, any>, U extends Record<string, any>>(
    enabled: boolean,
    hooks: H,
    components: C,
    utils?: U
) {
    return {
        hooks: enabled ? hooks : createStubs(hooks, "hook"),
        components: enabled ? components : createStubs(components, "component"),
        utils: enabled && utils ? utils : utils && createStubs(utils, "utils"),
    };
}
