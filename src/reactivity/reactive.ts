import { mutableHandlers, readonlyHandlers } from './baseHandlers';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}

export function isReactive(value): boolean {
    return !!value[ReactiveFlags.IS_REACTIVE]; // 📌 !! 转布尔值, 类型转换
}

export function isReadonly(value): boolean {
    return !!value[ReactiveFlags.IS_READONLY];
}

function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}