import { trackEffects, triggerEffects, isTracking } from "./effect";
import { hasChanged, isObject } from "../shared";
import { reactive } from "./reactive";

// Proxy 无法拦截对基本类型值的操作
// 需要通过一个对象来包裹这个值
// 这个对象就是 RefImpl， 这就是为什么会需要 ref 这个 API

class RefImpl {
    private _value;
    public dep = new Set();
    private _rawValue;
    private __v_isRef = true;
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 对比的时候，需要用原始值对比
        if (!hasChanged(this._rawValue, newValue)) return;
        this._rawValue = newValue;
        // 一定要先去修改值，再去触发依赖
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}


export function ref(value) {
    const refImpl = new RefImpl(value);
    return refImpl;
}

export function isRef(value) {
    return !!value?.__v_isRef;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
    // 当访问属性时，如果是 ref 类型，就返回 .value
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }else {
                return Reflect.set(target, key, value);
            }
        }
    });
}