export const extend = Object.assign;

export function isObject(value): boolean {
    return value !== null && typeof value === 'object';
}