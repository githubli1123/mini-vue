import { h, provide, inject } from "../../lib/mini-vue.esm.js";

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooValue");
    provide("bar", "barValue");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider Component"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooValueTwo");
    const foo = inject("foo");
    return { foo };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo Component foo: ${this.foo}`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // const baz = inject("baz", "bazDefaultValue");
    const baz = inject("baz", () => "bazDefaultValue");
    return { foo, bar, baz };
  },
  render() {
    return h(
      "div",
      {},
      `Consumer Component: ${this.foo} - ${this.bar} - ${this.baz}`
    );
  },
};

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "apiInject demo"), h(Provider)]);
  },
  setup() {},
};
