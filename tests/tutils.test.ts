import { describe, expect, test } from "bun:test";
import { TUtils } from "../dist/frankjstein.js";

/**
 * @description Suite de validación para utilidades de núcleo (Core Engine).
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("TUtils: Core Engine Utilities", () => {
    test("cachedAsync: executes once and shares result", async () => {
        let callCount = 0;
        const loader = TUtils.cachedAsync(async () => {
            callCount++;
            return { data: "ok" };
        });

        const [res1, res2] = await Promise.all([loader(), loader()]);

        expect(callCount).toBe(1);
        expect(res1).toBe(res2);
        expect(res1.data).toBe("ok");
    });

    test("cachedAsyncByArgs: memoization by arguments", async () => {
        let callCount = 0;
        const fetcher = TUtils.cachedAsyncByArgs(
            async (id: number) => {
                callCount++;
                return `data_${id}`;
            },
            (id) => `key_${id}`
        );

        const res1 = await fetcher(1);
        const res1_again = await fetcher(1);
        const res2 = await fetcher(2);

        expect(callCount).toBe(2);
        expect(res1_again).toBe(res1);
        expect(res2).toBe("data_2");
    });

    test("repeatCall: creates a chainable function", () => {
        let result = "";
        const logger = TUtils.repeatCall((msg: string) => (result += msg));

        // Chainable call
        logger("F")("R")("A")("N")("K");
        expect(result).toBe("FRANK");
    });

    test("defineLazyPropertyGetter: defers execution until access", () => {
        const target = {};
        let counter = 0;

        TUtils.defineLazyPropertyGetter(target, "test", () => {
            counter++;
            return "resolved";
        });

        expect(counter).toBe(0);
        // @ts-ignore
        expect(target.test).toBe("resolved");
        expect(counter).toBe(1);
        // @ts-ignore
        expect(target.test).toBe("resolved");
        expect(counter).toBe(1); // Memoized
    });

    test("sleepAsync: wait with AbortSignal support", async () => {
        const start = performance.now();
        await TUtils.sleepAsync(50);
        const elapsed = performance.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(45);
    });

    test("safe: Error-First pattern for promises", async () => {
        const [err, data] = await TUtils.safe(Promise.resolve("value"));
        expect(err).toBeNull();
        expect(data).toBe("value");
    });
});
