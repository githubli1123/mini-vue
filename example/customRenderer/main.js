// vue3
console.log("run in", new Date().toLocaleString("zh-CN"));
import { createRenderer } from "../../lib/mini-vue.esm.js";
import { App } from "./App.js";
console.log(PIXI);

const game = new PIXI.Application({
  width: 600,
  height: 600,
});

document.body.appendChild(game.view);

const renderer = createRenderer({
  createElement(type) {
    if (type === "rect") {
      const element = new PIXI.Graphics();
      element.beginFill(0xff0000);
      element.drawRect(0, 0, 200, 200);
      element.endFill();
      return element;
    }
  },
  patchProp(el, key, val) {
    el[key] = val;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});

renderer.createApp(App).mount(game.stage);

// const rootContainer = document.querySelector("#app");
// createApp(App).mount(rootContainer);
