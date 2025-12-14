import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "Foo Component");

    // Foo .vnode .children -> vnode -> h() => renderSlots()
    // 怎么设计 slot ?  类比 $el
    // renderSlots(this.$slots)
    // 具名插槽
    // 1. 获取要渲染的元素
    // 2. 获取要渲染的位置
    // 作用域插槽
    // App 只是告诉 Foo 具体内容， Foo 具体怎么渲染由 Foo 自己决定
    // 源码上看， 渲染 vnode 的逻辑是在 Foo 组件内部开始的
    const age = 18;
    return h("div", {}, [
      renderSlots(this.$slots, "header", {
        age,
      }),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
