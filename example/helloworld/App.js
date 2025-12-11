import { h } from "../../lib/mini-vue.esm.js";

export const App = {
  // .vue
  // <template></template>
  // render

  // 必须写 render
  render() {
    // 看到这里，其实大致就可以理解为什么推荐 Vue 的 template 中先写一个 div 包裹所有内容
    // 这里的 h("div", ... , ...) 函数其实就相当于 template 中的 div
    return h(
      "div", 
      {
        id : "root",
        class : ["red", "hard"],
      },
      // 1. string
      // "hi, mini-vue",
      // 2. Array
      // 使用 h 函数以及 Array 的意思是 : 声明 vnode 和 vnode 之间的父子关系
      // 给到 mini-vue 后会调用 h 函数生成 vnode ， 然后交给 patch 做拆包处理
      // [
      //   h("div", {class: "blue"}, "hi, "), 
      //   h("p", {class: "red"}, "mini-vue")
      // ]
      // [
      //   h("p", {class: "blue"}, "hi, "), 
      //   h("div", {class: "red"}, 
      //     [
      //       h("p", null, "mini-vue"),
      //     ]
      //   )
      // ]
      // 3. setupState
      // 常规： 直接把 setup 的返回值绑定到 render 的 this 上
      // 实际： 给 component 实例上做了一个代理 proxy 
      `hi, ${this.msg}`, 
      // this.$el -> get root element
    );
  },

  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
