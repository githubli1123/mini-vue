import { createVNode } from "./vnode";


export function renderSlots(slots, name, props) {
    const slot = slots[name];   // get named slot
    if (slot) {
        if (typeof slot === "function") {   // scoped slot
            return createVNode("div", {}, slot(props));
        }
    }
}