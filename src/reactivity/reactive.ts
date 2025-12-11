import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';
import { isObject } from '../shared/index';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
}

export function reactive(raw) {
    return createRectiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
    return createRectiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw) {
    return createRectiveObject(raw, shallowReadonlyHandlers);
}

export function isReactive(value): boolean {
    return !!value[ReactiveFlags.IS_REACTIVE]; // 📌 !! 转布尔值, 类型转换
}

export function isReadonly(value): boolean {
    return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value): boolean {
    return isReactive(value) || isReadonly(value);
}

function createRectiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`value ${raw} should be an object`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}