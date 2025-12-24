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
        patch(null, vnode, container, null);
    }

    /**
     * n1 不存在的时候，初次渲染， patch 递归调用就是在不断将一个嵌套关系的 vnode 转换成真实的 DOM 元素。
     * 
     * n1 存在的时候，更新渲染， patch 递归调用就是在不断比对新旧 vnode（对象嵌套） 的差异，并更新到真实的 DOM 上。
     * 
     * 🔄️ 调用一次 patch 方法就是在处理一个 vnode 对象，但是这个 vnode 的 children 可能是一个数组，
     * 所以 patch 方法内部会递归调用自己，直到处理完所有的 vnode。
     * 
     * @param n1 oldVNode
     * @param n2 newVNode
     * @param container mounted element
     * @param parentComponent 保持组件实例的上下文关系
     * @param anchor 锚点元素
     */
    function patch(n1, n2, container, parentComponent, anchor = null) {
        const { type, shapeFlag } = n2;
        // 区分是 element 还是 component 类型
        // shapeFlag
        // vnode -> flag
        // element | component
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;

            case Text:
                processText(n1, n2, container);
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }

    function processText(n1, n2, container) {
        const { children } = n2;
        const text = (n2.el = document.createTextNode(children));
        container.append(text);
    }

    function processFragment(n1, n2, container, parentComponent, anchor) {
        // Implementation for processing Fragment
        mountChildren(n2.children, container, parentComponent, anchor);
    }

    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        } else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patchElement');
        console.log(n1);
        console.log(n2);

        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);  // important : reuse the old element
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(oldProps, newProps, el);
    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {
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
                mountChildren(c2, container, parentComponent, anchor);
            } else {
                // array -> array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;

        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }

        // 1. 从左侧开始对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            } else {
                break;
            }
            i++;
        }

        // 2. 从右侧开始对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            } else {
                break;
            }
            e1--;
            e2--;
        }

        console.log('i, e1, e2', i, e1, e2);

        // 新的比老的长
        if (i > e1) {
            // 左侧相同 创建后放在右侧
            // 右侧相同 创建后放在左侧
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        // 老的比新的长 
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        // 中间对比
        else {
            let s1 = i;
            let s2 = i;

            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const keyToNewIndexMap = new Map();
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }

                let newIndex;
                // 查看当前老节点在新的 children 中是否存在
                if (prevChild.key != null) {
                    // 使用优化的查找方式
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                } else {
                    // 没有 key 值，使用暴力查找
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                // 当前老节点在新的 children 中不存在，直接删除
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                } else {
                    patch(prevChild, c2[newIndex], container, parentComponent, parentAnchor);
                    patched++;
                }
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

    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));

        // string | array
        const { children, shapeFlag } = vnode;

        // children
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // text_children
            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // array_children
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, null, value);
        }

        hostInsert(el, container, anchor);
    }

    /**
     * 当前组件的 children 全部挂载到容器中
     * @param children 组件的 children
     * @param container 挂载到的 element 位置
     * @param parentComponent 维护组件的父子关系，涉及到 provide/inject
     */
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent, anchor);
        });
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }

    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent);

        setupComponent(instance);

        setupRenderEffect(instance, initialVNode, container, anchor);
    }

    function setupRenderEffect(instance, initialVNode, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                const { proxy } = instance;
                // subTree is vnode ; render function can get setupState/props through proxy
                const subTree = (instance.subTree = instance.render.call(proxy));
                console.log('subTree', subTree);
                // vnode -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
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

                patch(prevSubTree, subTree, container, instance, anchor);
                instance.subTree = subTree;
            }

        });
    }

    return {
        createApp: createAppAPI(render)
    }
}