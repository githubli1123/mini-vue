import { createVNode } from "./vnode";

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                if (typeof rootContainer === 'string') {
                    rootContainer = document.querySelector(rootContainer);
                }
                // 先 vnode
                // component -> vnode
                // 所有的逻辑操作 都基于 vnode 做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        }
    }
}