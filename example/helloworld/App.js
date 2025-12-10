import { h } from "../../lib/mini-vue.esm.js";

export const App = {
  // .vue
  // <template></template>
  // render

  // 必须写 render
  render() {
    return h(
      "div", 
      {
        id : "root",
        class : ["red", "hard"],
      },
      // 1. string
      // "hi, mini-vue",
      // 2. Array
      // [
      //   h("div", {class: "blue"}, "hi, "), 
      //   h("p", {class: "red"}, "mini-vue")
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
