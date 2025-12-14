import { shallowReadonly } from "../reactivity/reactive";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initProps } from "./componentProps";
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";


export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: null,
        props: {},
        slots: {},
        emit: () => { },
    };

    component.emit = emit.bind(null, component);

    return component;
}


export function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
    const Component = instance.type;

    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

    const { setup } = Component;

    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });

        handleSetupResult(instance, setupResult);
    }
}

function handleSetupResult(instance, setupResult) {
    // setup 方法返回一个对象 : setup(){ return {msg: 'hello'} }
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    } else if (typeof setupResult === 'function') { // TODO
        instance.render = setupResult;
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
    const Component = instance.type;

    instance.render = Component.render;

}