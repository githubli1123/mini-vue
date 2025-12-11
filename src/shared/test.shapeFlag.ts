const ShapeFlags = {
    ELEMENT: 0,
    STATEFUL_COMPONENT: 0,
    TEXT_CHILDREN: 0,
    ARRAY_CHILDREN: 0,
};

// vnode -> stateful_component ->
// 1. 可以设置 修改
ShapeFlags.STATEFUL_COMPONENT = 1;
ShapeFlags.ARRAY_CHILDREN = 1;

// 2. 查找
// if(ShapeFlag.ELEMENT)
// if(ShapeFlags.STATEFUL_COMPONENT)



// 不够高效 -> 位运算解决
// 0000
// 0001 -> element
// 0010 -> stateful_component
// 0100 -> text_children
// 1000 -> array_children


// 1010 -> stateful_component + array_children


// | -> 或运算 -> 两位都为0 则为0，否则为1
// & -> 与运算 -> 两位都为1 则为1，否则为0

// 修改
//     0000
// |   0001
// ——————————
//     0001

// 查找
//     0001
// &   0001
// ——————————
//     0001