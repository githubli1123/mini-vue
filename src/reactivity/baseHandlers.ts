import { track, trigger } from "./effect";
import { reactive, readonly, ReactiveFlags } from "./reactive";
import { extend, isObject } from "../shared";

// ⚡ 优化： 缓存 getter 和 setter 函数，避免每次调用都重新创建
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);

        if (shallow) {
            return res;
        }

        // 递归地将所有嵌套的对象转换为响应式对象
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

        if (!isReadonly) {
            track(target, key);
        }
        return res;
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    }
}

export const mutableHandlers = {
    get,
    set,
};
export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${String(key)} , fail to set ${value} . Becase target is readonly`, target);
        return true;
    },
};
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: createGetter(true, true)
});