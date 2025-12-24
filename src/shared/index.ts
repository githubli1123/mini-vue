export const extend = Object.assign;

export const EMPTY_OBJ = Object.freeze({});

export function isObject(value): boolean {
    return value !== null && typeof value === 'object';
}

export function hasChanged(prevValue, nextValue) {
    return !Object.is(prevValue, nextValue);
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

// add-foo -> addFoo
export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : '';
    });
};
// add -> Add
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
export const toHandlerKey = (str: string) => str ? 'on' + capitalize(str) : '';
