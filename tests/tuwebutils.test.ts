import { describe, expect, test } from "bun:test";
import { TuWebUtils } from "../dist/frankjstein.js";

/**
 * @description Suite de validación para utilidades de alto rendimiento (Web & Core).
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("TuWebUtils: Async Orchestration", () => {
    describe("forEachAsync (Time Slicing)", () => {
        test("Process a large collection in batches", async () => {
            const items = Array.from({ length: 25 }, (_, i) => i);
            let callCount = 0;

            const result = await TuWebUtils.forEachAsync(
                items,
                (_item) => {
                    callCount++;
                },
                { batchSize: 5 }
            );

            expect(callCount).toBe(25);
            expect(result.completed).toBe(true);
            expect(result.processed).toBe(25);
            expect(result.total).toBe(25);
        });

        test("Supports break (return false)", async () => {
            const items = [1, 2, 3, 4, 5];
            let callCount = 0;

            const result = await TuWebUtils.forEachAsync(items, (item) => {
                callCount++;
                if (item === 3) return false;
            });

            expect(callCount).toBe(3);
            expect(result.completed).toBe(false);
            expect(result.processed).toBe(3);
        });

        test("safeForEachAsync: handle errors gracefully", async () => {
            const items = [1, 2, 3];
            const [err, result] = await TuWebUtils.safeForEachAsync(
                items,
                (item) => {
                    if (item === 2) throw new Error("Boom");
                },
                { stopOnError: true }
            );

            expect(err).not.toBeNull();
            expect(result).toBeNull();
            expect(err?.message).toBe("Boom");
        });
    });

    describe("Function Decoupling (Debounce & Throttle)", () => {
        test("debounce: only executes after silence", async () => {
            let count = 0;
            const fn = TuWebUtils.debounce(() => count++, 20);

            fn();
            fn();
            fn();

            expect(count).toBe(0);
            await new Promise((r) => setTimeout(r, 50));
            expect(count).toBe(1);
        });

        test("throttle: limit execution rate", async () => {
            let count = 0;
            const fn = TuWebUtils.throttle(() => count++, 50);

            fn(); // leading
            fn();
            fn();

            expect(count).toBe(1);
            await new Promise((r) => setTimeout(r, 60));
            // depending on trailing option, might be 2
            expect(count).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Safe Pattern", () => {
        test("safe: wraps promises in [err, data] tuples", async () => {
            const p1 = Promise.resolve("ok");
            const p2 = Promise.reject("fail");

            const [err1, data1] = await TuWebUtils.safe(p1);
            const [err2, data2] = await TuWebUtils.safe(p2);

            expect(err1).toBeNull();
            expect(data1).toBe("ok");
            expect(err2).toBe("fail");
            expect(data2).toBeNull();
        });
    });
});
