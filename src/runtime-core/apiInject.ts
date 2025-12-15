import { getCurrentInstance } from './component';


export function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();

    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;

        // init provides
        // 初始化 provides：子组件默认继承父组件的 provides
        // 后续会检查，再次初始化：子组件需要提供新值时才创建自己的空间，否则通过原型链复用父值
        // 本质是 Copy-on-Write(写时复制)模式 + 原型链继承 的完美结合，既保证隔离性又极致高效。
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides); // VIP 原型链
        }

        provides[key] = value;
    }
}

export function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();

    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}


// provides 的两次初始化设计非常巧妙：
// 零成本优化：对于没有使用 provide 的组件，避免了不必要的对象创建
// 按需隔离：只有真正需要提供新值的组件，才会创建自己的 provides 对象
// 内存高效：通过原型链共享，而不是深拷贝整个父级对象
// 查找高效：JS 引擎对原型链查找有高度优化