import { reactive } from '../reactive'
import { effect } from '../effect'

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        });
        let nextAge;
        effect(() => {
            // 将 user 这个响应式数据与 nextAge 进行关联
            nextAge = user.age + 1;
        });
        expect(nextAge).toBe(11);
        // update
        user.age = user.age + 1;
        expect(nextAge).toBe(12);
    });

    it('should return runner when call effect', () => {
        // effect(fn) -> function(runner) -> fn -> return
        let foo = 10;
        const runner = effect(() => {
            foo++;
            return "foo";
        });
        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");
    });

    it ('scheduler', () => {
        // 通过 effect 的第二个参数给定的 一个 scheduler 的 fn
        // effect 第一次执行的时候 还会执行 scheduler
        // 个人感受： effect 执行后会先执行一次传参函数，然后返回一个可以调用传参函数的对象，
        // 函数中的 getter 收集依赖，将函数与数据绑定；set 行为会触发 effect 中的函数调用一次（ setter 触发依赖 ）。
        // 但是现在对 effect 进行改造，希望中断这个 setter 触发依赖的调用（也就是第一个传参函数不调用，第二个调用），
        // 此时，
        let dummy;
        let run: any;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        const obj = reactive({ foo: 1 });
        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler });
        expect(dummy).toBe(1);
        expect(scheduler).not.toHaveBeenCalled();
        // ------------------------------------------- //
        // should be called on first trigger
        obj.foo++;
        expect(dummy).toBe(1); // should not run yet
        expect(scheduler).toHaveBeenCalledTimes(1);
        // ------------------------------------------- //
        // manually run
        run();
        expect(dummy).toBe(2); // should have run
    });
});