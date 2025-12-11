import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";

export function render(vnode, container) {
    // patch
    patch(vnode, container);
}

function patch(vnode, container) {
    // 区分是 element 还是 component 类型
    // shapeFlag
    // vnode -> flag
    // element | component
    const shapeFlag = vnode.shapeFlag;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        porcessComponent(vnode, container);
    }
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

function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);

    setupComponent(instance);

    setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // subTree is vnode
    const subTree = instance.render.call(proxy);

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container);

    // element -> mount to container
    initialVNode.el = subTree.el;
}