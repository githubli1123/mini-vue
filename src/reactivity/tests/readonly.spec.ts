import { readonly } from '../reactive';

describe('readonly', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
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