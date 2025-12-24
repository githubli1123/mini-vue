import { EMPTY_OBJ } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "../shared/ShapeFlags";
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";
import { effect } from "../reactivity/effect";

export function createRenderer(options) {

    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options;

    function render(vnode, container) {
        // patch
        patch(null, vnode, container, undefined);
    }

    // n1 -> oldVNode
    // n2 -> newVNode
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        // 区分是 element 还是 component 类型
        // shapeFlag
        // vnode -> flag
        // element | component
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;

            case Text:
                processText(n1, n2, container);
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    porcessComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }

    function processText(n1, n2, container) {
        const { children } = n2;
        const text = (n2.el = document.createTextNode(children));
        container.append(text);
    }

    function processFragment(n1, n2, container, parentComponent) {
        // Implementation for processing Fragment
        mountChildren(n2.children, container, parentComponent);
    }

    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        } else {
            patchElement(n1, n2, container, parentComponent);
        }
    }

    function patchElement(n1, n2, container, parentComponent) {
        console.log('patchElement');
        console.log(n1);
        console.log(n2);

        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);  // important : reuse the old element
        patchChildren(n1, n2, el, parentComponent);
        patchProps(oldProps, newProps, el);
    }

    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapeFlag = n1.shapeFlag;
        const newShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;

        if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 1. 把老的 children 清空
                unmountChildren(c1);
                // 2. 设置新的 text
                hostSetElementText(container, c2);
            } else {
                // 老的就是 text
                if (c1 !== c2) {
                    hostSetElementText(container, c2);
                }
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                // 老的 children 是 text 
                // 新的 children 是 array
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent);
            }
        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove
            hostRemove(el);
        }
    }

    function patchProps(oldProps, newProps, el) {
        if (oldProps === newProps) {
            return;
        }

        for (const key in newProps) {
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if (prevProp !== nextProp) {
                hostPatchProp(el, key, prevProp, nextProp);
            }
        }

        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }

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
            mountChildren(vnode.children, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, null, value);
        }

        hostInsert(el, container);
    }

    /**
     * 
     * @param children 组件的 children
     * @param container 挂载到的 element 位置
     * @param parentComponent 维护组件的父子关系，涉及到 provide/inject
     */
    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent);
        });
    }

    function porcessComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }

    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);

        setupComponent(instance);

        setupRenderEffect(instance, initialVNode, container);
    }

    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                // subTree is vnode ; render function can get setupState/props through proxy
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log('subTree', subTree);
                // vnode -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance);
                // element -> mount to container
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            } else {
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;

                console.log('prevSubTree', prevSubTree);
                console.log('subTree', subTree);

                patch(prevSubTree, subTree, container, instance);
                instance.subTree = subTree;
            }

        });
    }

    return {
        createApp: createAppAPI(render)
    }
}