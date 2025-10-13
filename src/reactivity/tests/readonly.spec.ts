import { readonly } from '../reactive';
import { isReadonly } from '../reactive';

describe('readonly', () => {
    it('should make nested values readonly', () => {
        const original = { foo: 1 }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original)
        expect(wrapped.foo).toBe(1)
        expect(isReadonly(wrapped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
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