import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("Foo emitAdd fn");
      emit("add", 1, 2);
      emit("add-foo");
    };
    return {
      emitAdd,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        // 如果使用普通函数，this.emitAdd 是 undefined
        // 如果使用箭头函数，this.emitAdd 可以获取到
        onClick: () => {
          console.log("click btn");
          this.emitAdd();
        },
      },
      "emitAdd button"
    );
    const foo = h("p", {}, "Foo component");
    return h("div", {}, [foo, btn]);
  },
};
