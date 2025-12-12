import { camelize, toHandlerKey } from "../shared/index";


export function emit(instance, event, ...args) {
    // instance.props -> event
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为 -> 重构为通用行为

    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}