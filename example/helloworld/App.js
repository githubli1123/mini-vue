import { h } from "../../lib/mini-vue.esm.js";

export const App = {
  // .vue
  // <template></template>
  // reder

  // 必须写 render
  render() {
    return h("div", "hi, " + this.msg);
  },

  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
