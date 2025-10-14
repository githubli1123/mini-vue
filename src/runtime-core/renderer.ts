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
    // processElement(vnode, container);
    
    porcessComponent(vnode, container);
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
    const subTree = instance.render();

    // vnode -> patch
    // vnode -> element -> mountElement

    patch(subTree, container);
}