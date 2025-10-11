## setup 环境 - 集成 jest 做单元测试

1 创建 package.json

```bash
pnpm i
```

2 创建 src 目录，reactivity 目录，test 目录，创建 index.spec.ts 文件

```tsx
it("init", () => {
  expect(true).toBe(true);
});
```

3 安装 ts

```bash
pnpm i -D typescript
```

4 初始化 tsconfig.json

```bash
npx tsc --init
```

5 IDE 显示报错：找不到名称 "it"。是否需要安装测试运行器的类型定义?

使用 `npm i --save-dev jest @types/jest` 或 `npm i --save-dev @types/mocha`。

6 使用 ESM 模块的时候出现的问题

测试套件代码中使用 ESM 模块导入的方法的时候，是不可以正确运行的
jest 运行的环境是 nodejs 环境，在 nodejs 下运行的是 cmj 规范，需要把测试代码进行一个转换
可以在 jest 的官方网站中找到对应的 命令和配置 。

7 jest 测试

```bash
pnpm run test
```

## 实现 effect & reactive & track & trigger & 更多增强

vue3 响应式核心到底是解决什么以往的开发问题或者说需求：
Vue3 的响应式系统，是为了解决「数据变化与视图更新之间的手动同步问题」。——它让你专注于「数据逻辑」，而不是「更新 DOM」。

Vue3 的响应式系统做的事：

- 监视状态变化；
- 找出依赖这个状态的副作用（比如模板渲染、计算属性）；
- 自动执行更新逻辑；
- 自动依赖收集，不用手动绑定监听。

Vue3 响应式系统具体解决的问题
| 问题 | Vue3 响应式的解决方式 |
| --------------- | --------------------------------- |
| **数据与视图同步困难** | 自动依赖收集（`track`）与自动触发更新（`trigger`） |
| **多个状态依赖的计算复杂** | 用 `computed()` 自动追踪依赖 |
| **性能浪费** | 精准更新（只触发与变更数据相关的 effect） |
| **状态共享麻烦** | 响应式对象可跨组件共享（`reactive`, `ref`） |
| **开发心智负担大** | 声明式写法让开发者关注“结果”，不用操心“过程” |

Vue3 中最主要的部分就是对于数据的响应式处理，如何使用 JavaScript 实现的：一句话总结， Vue 3 的响应式系统核心是基于 Proxy 的依赖收集（track）与触发（trigger）机制。

它是由四个关键模块组成的：
reactive、effect、track、trigger
也可以理解成：对象代理 → 副作用收集 → 数据变动通知 → 副作用重新执行

核心思想（一句话讲透）：当数据被读取时，记录“谁用了它”；当数据变化时，通知“谁重新运行”。

依赖图示

```vbnet
targetMap
└── obj1 (Proxy 对象)
    ├── key: "count"
    │    └── effects: [effect1, effect2]
    ├── key: "title"
         └── effects: [effect3]
```


Vue 3 内部还有更多增强

Vue 3 的真实实现比上面复杂得多，但核心思想完全一样。
主要增强包括：

| 模块/特性                                    | 功能             | 目的                   |
| ---------------------------------------- | -------------- | -------------------- |
| **Ref & reactive 分层设计**                  | 支持对象响应式和原始值响应式 | 让任意类型都能响应化           |
| **Computed (计算属性)**                      | 基于依赖的自动缓存计算    | 避免重复计算               |
| **Scheduler (调度器)**                      | 控制 effect 执行时机 | 性能优化（批处理、异步刷新）       |
| **Stop / onStop**                        | 停止追踪 effect    | 生命周期管理               |
| **Lazy effect**                          | 延迟执行副作用        | 用于 computed 等        |
| **嵌套 effect 栈**                          | 支持 effect 嵌套   | 正确建立依赖关系             |
| **WeakMap + Map + Set 结构**               | 存储依赖关系         | 精确追踪 + 垃圾回收友好        |
| **Readonly / Shallow / ShallowReadonly** | 只读或浅层代理        | 安全控制、性能优化            |
| **TrackOpTypes / TriggerOpTypes**        | 标记操作类型         | 精准更新、调试工具支持          |
| **Ref unwrapping（解包）**                   | `ref` 自动在模板中解包 | 开发体验优化               |
| **ReactiveEffect 类化封装**                  | Effect 对象化     | 支持 stop、scheduler、嵌套 |

它从一个 “响应式数据demo” 升级成了一个：可缓存、可调度、可停止、可嵌套、可复用的完整依赖追踪模块。







（1）从使用者角度看，当你使用 reactive 的时候，就是把数据交给 Vue 来管理了，方便的地方在于，比如说页面中使用了这个数据的地方会随数据改变而更新。

在源码开发者角度上，就是返回一个 代理对象，使用者的大多数操作都会被 vue 给发现（拦截），然后 vue 给你做一些事情。

我们目前再写的 effect 有一种需要考虑的情况就是页面中使用了这个数据的地方会随数据改变而更新，不过这个东西可以抽象为  **“副作用函数（effect）依赖数据，并在数据改变时自动执行”** 。



（2）activeEffect ：记录当前正在运行的 effect（ReactiveEffect 实例）。指向当前正在执行的副作用函数，用于在 Proxy 中 getter 的依赖收集。



（3）返回 runner：使用者角度上看就是返回了 effect 的传参函数。



（4）scheduler 传参给 effect ：

`jest.fn(() => { run = runner })` 是一个 **带可追踪的调度函数**，
 当响应式依赖触发时，Vue 不直接执行副作用函数，而调用这个调度器。
 调度器在测试中把 `runner` 暂存下来，供我们手动执行，从而测试 scheduler 机制是否生效。



（5）stop：提供一个 API，让我们可以 **手动停止副作用函数（effect）**，使它不再响应数据变化。





> 响应式对象是一个东西，proxy 中会使用 effect 的 track 和 trigger ，一个 effect 的传参函数（runner）中可能有多个响应式对象的 get 操作，那么 effect 的 runner （依赖）就会被收集起来。
>
> track：需要知道这些信息：哪个对象的哪个key（借助 proxy）、依赖是什么（借助 effect API，开发者手动告知）
>
> trigger：需要有的信息：哪个对象的哪个key（借助 proxy）、依赖有哪些（借助 effect API，开发者手动告知后存储在的deps变量中，具体怎么找到 deps 是借助 Map 的）

