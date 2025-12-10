import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
    // patch
    patch(vnode, container);
}

function patch(vnode, container) {
    // 处理组件

    // TODO 判断 vnode 是不是一个 element
    // 是 element 那么就处理 element
    // 思考: 如何区分是 element 还是 component 类型?
    if(typeof vnode.type === 'string') {
        processElement(vnode, container);
    } else if (isObject(vnode.type)) {
        porcessComponent(vnode, container);
    }
}

function processElement(vnode, container) {
    mountElement(vnode, container);
}

function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);

    // string | array
    const { children } = vnode;

    if (typeof children === 'string') {
        el.textContent = children;
    }else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    if (props) {
        for (const key in props) {
            const value = props[key];
            el.setAttribute(key, value);
        }
    }

    container.append(el);
}

function mountChildren(vnode, container) {
    vnode.children.forEach((child) => {
        patch(child, container);
    });
}

function porcessComponent(vnode, container) {
    mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);

    setupComponent(instance);

    setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container);
}