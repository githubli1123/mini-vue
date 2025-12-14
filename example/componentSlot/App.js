import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App Component");
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => h("p", {}, "header " + age), // 函数传参依赖于 Foo 内部中 renderSlot 的参数
        footer: () => h("p", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {};
  },
};
