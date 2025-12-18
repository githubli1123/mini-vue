import { createRenderer } from "../runtime-core";
import { createAppAPI } from "../runtime-core/createApp";


function createElement(type) {
    return document.createElement(type);
}

function patchProp(el, key, value) {
    // 具体的 click -> 通用
    // on + EventName
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    } else {
        el.setAttribute(key, value);
    }
}


function insert(el, parent) {
    parent.append(el);
}



const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert
});

export function createApp(...args) {
    return renderer.createApp(...args);
}
export * from "../runtime-core";