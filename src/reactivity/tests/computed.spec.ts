import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
    it("happy path", () => {
        const val = reactive({
            foo: 1,
        });
        const cval = computed(() => {
            return val.foo;
        });
        expect(cval.value).toBe(1);
        val.foo = 2;
        expect(cval.value).toBe(2);
    });

    it("should compute lazily", () => {
        const val = reactive({
            foo: 1,
        });
        const getter = jest.fn(() => {
            return val.foo;
        });
        const cval = computed(getter);
        // lazy
        expect(getter).not.toHaveBeenCalled();
        expect(cval.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1);

        // should not compute again
        cval.value; // get
        expect(getter).toHaveBeenCalledTimes(1);
        
        // should not compute until needed
        val.foo = 2; // trigger -> effect -> get 重新执行了 。 使用 scheduler 控制 get 的重新计算
        expect(getter).toHaveBeenCalledTimes(1);

        // now it should compute
        expect(cval.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);
        // should not compute again
        cval.value;
        expect(getter).toHaveBeenCalledTimes(2);
    });
})