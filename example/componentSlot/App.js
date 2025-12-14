import { h, createTextVNode } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App Component");
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          // 函数传参依赖于 Foo 内部中 renderSlot 的参数
          h("p", {}, "header " + age), // 这个使用数组的话，会只显示最后一个节点
          createTextVNode("这是一个单纯的 TEXT 节点"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {};
  },
};
