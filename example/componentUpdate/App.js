import { h, ref } from "../../lib/mini-vue.esm.js";
import Child from "./Child.js";

export default {
  name: "App",
  setup() {
    const msg = ref("123");
    const count = ref(0);
    window.msg = msg;

    const changeChildProps = () => {
      msg.value = `${Math.random()}`;
    };

    const changeCount = () => {
      count.value++;
    };

    return { msg, changeChildProps, count, changeCount };
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change child props"
      ),
      h(Child, { msg: this.msg }),
      h("button", { onClick: this.changeCount }, "change count"),
      h("div", {}, "count: " + this.count),
    ]);
  },
};
