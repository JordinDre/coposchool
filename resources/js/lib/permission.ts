// src/lib/permissions.ts
export function buildAbility(perms: string[] = []) {
    const set = new Set(perms.map((p) => p.toLowerCase()));
    const hasOne = (required: string | string[]) =>
        Array.isArray(required) ? required.some((r) => set.has(r.toLowerCase())) : set.has(required.toLowerCase());

    return {
        can: hasOne, // alguno de los requeridos
        canAll: (all: string[]) => all.every((r) => set.has(r.toLowerCase())), // todos
    };
}
