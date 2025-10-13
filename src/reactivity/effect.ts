import { extend } from "../shared";

let activeEffect;
let shouldTrack: boolean;
export class ReactiveEffect {
    private _fn;
    public deps = [];
    public scheduler;
    public onStop?: () => void;
    private active = true; // 作用：⚡ 优化，多次 stop，只清空一次， false 表示已经 stop 了
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) { // 如果已经 stop 了，就直接执行函数，不收集依赖。 
            // 解决：测试代码中 get 一次 reactive 对象的属性值后会重新依赖收集，导致清空的依赖依然会在 set 操作后触发。
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
            if (this.onStop) this.onStop();
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

const targetMap = new Map();
export function track(target, key) {
    // target -> key -> dep
    // 对象 -> 属性 -> 相关依赖（函数）
    if (!isTracking()) return;

    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }

    trackEffects(dep);
}
export function trackEffects(dep) {
    // 已经在 dep 中了，不需要再收集了
    if (dep.has(activeEffect)) return;

    dep.add(activeEffect); // 从属性找到这个 effect
    activeEffect.deps.push(dep); // 从 effect 找到 dep 
}


/**
 * 是否应该收集依赖
 * 1. 必须要有 activeEffect
 * 2. shouldTrack 必须为 true
 */
export function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}


export function trigger(target, key) {
    // target       : { prop: 1}
    // key          : prop

    // targetMap    : { [target]: { [key]: [effect] } }
    // depsMap      : { [key]: [effect] }
    // dep          : [effect]
    let depsMap = targetMap.get(target);
    if (!depsMap) return;
    let dep = depsMap.get(key);
    if (!dep) return;
    triggerEffects(dep);
}
export function triggerEffects(dep) {
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}


export function effect(fn, options?) {
    const _effect = new ReactiveEffect(fn, options?.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner: any = _effect.run.bind(_effect); // ❓ why bind?
    runner.effect = _effect; // 返回的 runner 上挂载一个 effect 属性，指向这个 ReactiveEffect 实例
    return runner;
}

export function stop(runner) {
    runner.effect.stop();
}