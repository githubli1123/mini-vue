export const extend = Object.assign;

export function isObject(value): boolean {
    return value !== null && typeof value === 'object';
}

export function hasChanged(prevValue, nextValue) {
    return !Object.is(prevValue, nextValue);
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
