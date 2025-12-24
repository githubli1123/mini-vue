import { createRenderer } from "../runtime-core";
import { createAppAPI } from "../runtime-core/createApp";


function createElement(type) {
    return document.createElement(type);
}

function patchProp(el, key, preVal, nextVal) {
    // 具体的 click -> 通用
    // on + EventName
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    } else {
        if (nextVal === null || nextVal === undefined) {
            el.removeAttribute(key);
        } else {
            el.setAttribute(key, nextVal);
        }
    }
}


function insert(el, parent) {
    parent.append(el);
}

function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}

function setElementText(el, text) {
    el.textContent = text;
}
const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});

export function createApp(...args) {
    return renderer.createApp(...args);
}
export * from "../runtime-core";