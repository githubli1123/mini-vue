import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };
    return {
      count,
      onClick,
    };
  },
  render() {
    // this.count -> this.count.value -> proxyRefs
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [
        h("div", {}, `count: ${this.count}`), // 依赖收集
        h(
          "button",
          {
            onClick: this.onClick,
          },
          "click me to +1"
        ),
      ]
    );
  },
};
