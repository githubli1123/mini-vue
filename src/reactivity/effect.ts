import { extend } from "../shared";
class ReactiveEffect {
    private _fn;
    public deps = [];
    public scheduler;
    public onStop?: () => void;
    private active = true; // ⚡ 优化，多次 stop，只清空一次
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        activeEffect = this;
        return this._fn();
    }
    stop(){
        if(this.active){
            cleanupEffect(this);
            this.active = false;
            if(this.onStop) this.onStop();
        }
    }
}

function cleanupEffect(effect){
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    })
}

const targetMap = new Map();
export function track(target, key) {
    // target -> key -> dep
    // 对象 -> 属性 -> 相关依赖（函数）
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
    if(!activeEffect) return;
    dep.add(activeEffect); // 让属性记住这个 effect
    activeEffect.deps.push(dep); // 让 effect 记录有哪些 dep 依赖它
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
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

let activeEffect;
export function effect(fn, options?) {
    const _effect = new ReactiveEffect(fn, options?.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner:any = _effect.run.bind(_effect); // ❓ why bind?
    runner.effect = _effect; // 返回的 runner 上挂载一个 effect 属性，指向这个 ReactiveEffect 实例
    return runner;
}

export function stop(runner){
    runner.effect.stop();
}