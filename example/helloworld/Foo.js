import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup(props) {
    // props.count 是父组件传递过来的属性
    // 特性 : 1. 从 setup 的参数中获取 props    2. props 可以按 key 访问    3. shallow readonly
    console.log("foo setup props: ", props);
    props.count++;
    console.log("props.count++ , foo setup props: ", props);
  },
  render() {
    return h("div", {}, "foo: " + this.count);
  },
};
