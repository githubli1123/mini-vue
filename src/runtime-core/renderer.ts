import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
    // patch
    patch(vnode, container);
}

function patch(vnode, container) {
    const { type, shapeFlag } = vnode;
    // 区分是 element 还是 component 类型
    // shapeFlag
    // vnode -> flag
    // element | component
    // Fragment -> 只渲染 children
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;

        case Text:
            processText(vnode, container);
            break;

        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                porcessComponent(vnode, container);
            }
            break;
    }
}

function processText(vnode, container) {
    const { children } = vnode;
    const text = (vnode.el = document.createTextNode(children));
    container.append(text);
}

function processFragment(vnode, container) {
    // Implementation for processing Fragment
    mountChildren(vnode, container);
}

function processElement(vnode, container) {
    mountElement(vnode, container);
}

function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));

    // string | array
    const { children, shapeFlag } = vnode;

    // children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // text_children
        el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // array_children
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
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

function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);

    setupComponent(instance);

    setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // subTree is vnode ; render function can get setupState/props through proxy
    const subTree = instance.render.call(proxy);

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container);

    // element -> mount to container
    initialVNode.el = subTree.el;
}