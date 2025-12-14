import { createVNode, Fragment } from "./vnode";


export function renderSlots(slots, name, props) {
    const slot = slots[name];   // get named slot
    if (slot) {
        if (typeof slot === "function") {   // scoped slot
            // slots vnode children 不可以是 array，
            // 所以用 Fragment 包裹，不再使用 div 
            return createVNode(Fragment, {}, slot(props));
        }
    }
}