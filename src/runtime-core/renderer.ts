import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";

export function createRenderer(options) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;

    function render(vnode, container) {
        // patch
        patch(vnode, container, undefined);
    }

    function patch(vnode, container, parentComponent) {
        const { type, shapeFlag } = vnode;
        // 区分是 element 还是 component 类型
        // shapeFlag
        // vnode -> flag
        // element | component
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;

            case Text:
                processText(vnode, container);
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    porcessComponent(vnode, container, parentComponent);
                }
                break;
        }
    }

    function processText(vnode, container) {
        const { children } = vnode;
        const text = (vnode.el = document.createTextNode(children));
        container.append(text);
    }

    function processFragment(vnode, container, parentComponent) {
        // Implementation for processing Fragment
        mountChildren(vnode, container, parentComponent);
    }

    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }

    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));

        // string | array
        const { children, shapeFlag } = vnode;

        // children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // text_children
            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // array_children
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, value);
        }

        hostInsert(el, container);
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((child) => {
            patch(child, container, parentComponent);
        });
    }

    function porcessComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);

        setupComponent(instance);

        setupRenderEffect(instance, initialVNode, container);
    }

    function setupRenderEffect(instance, initialVNode, container) {
        const { proxy } = instance;
        // subTree is vnode ; render function can get setupState/props through proxy
        const subTree = instance.render.call(proxy);

        // vnode -> patch
        // vnode -> element -> mountElement

        patch(subTree, container, instance);

        // element -> mount to container
        initialVNode.el = subTree.el;
    }

    return {
        createApp: createAppAPI(render)
    }
}