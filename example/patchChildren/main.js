console.log("run in", new Date().toLocaleString("zh-CN"));
import { createApp } from "../../lib/mini-vue.esm.js";
import App from "./App.js";

const rootContainer = document.querySelector("#root");
createApp(App).mount(rootContainer);
