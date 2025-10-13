import { readonly, isReadonly, isProxy } from '../reactive';

describe('readonly', () => {
    it('should make nested values readonly', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
        // nested
        // expect(isReadonly(wrapped.foo)).toBe(true) // TODO 这个测试目前不会通过，因为 foo 是 number 类型，不是对象
        expect(isReadonly(wrapped.bar)).toBe(true)
        expect(isReadonly(original.bar)).toBe(false)
        expect(isProxy(wrapped)).toBe(true)
    })

    it('warn then call set', () => {
        // jest.fn() 创建一个 mock 函数
        console.warn = jest.fn()
        const user = readonly({
            age: 10
        })
        user.age = 11
        expect(console.warn).toHaveBeenCalled()
        expect(user.age).toBe(10)
    })
})