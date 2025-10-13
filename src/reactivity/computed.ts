import { ReactiveEffect } from './effect';

class ComputedRefImpl {
    private _getter: any;
    private _dirty = true; // 标记是否需要重新计算 | true 代表“脏”，需要计算
    private _value: any;
    private _effect: any;
    constructor(getter) {
        this._getter = getter;
        this._effect = new ReactiveEffect(
            getter,
            // 依赖的响应式数据变化, 这里会将 _dirty 重新设置为 true , 使得下次访问 value 时可以重新计算
            () => {
                if (!this._dirty) {
                    this._dirty = true;
                }
            }
        );
    }
    get value() { // get
        if (this._dirty) {
            // get , 计算 , 标记为不需要重新计算
            // 何时再次计算的时机： 依赖的响应式数据变化。 需要将 _dirty 重新设置为 true 
            this._dirty = false; // 标记
            this._value = this._effect.run(); // 计算
        }

        return this._value;
    }
}

export function computed(getter) {
    const computedRef = new ComputedRefImpl(getter);
    return computedRef;
}