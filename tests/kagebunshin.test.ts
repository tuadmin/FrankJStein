import { describe, expect, test } from "bun:test";
import {
    createComputedSignal,
    createKageBunshinObject,
    createSignal
} from "../dist/frankjstein.js";

describe("KageBunshin Integration", () => {
    test("createSignal basic reactivity", () => {
        const sig = createSignal(10);
        expect(sig.value).toBe(10);

        sig.value = 20;
        expect(sig.value).toBe(20);
    });

    describe("Identity Traps (Proxy)", () => {
        class User {
            constructor(public name: string) { }
            sayHi() {
                return `Hi ${this.name}`;
            }
        }

        test("Proxy breaks instanceof (The Trap)", () => {
            const user = new User("Frank");
            const reactiveUser = createKageBunshinObject(user);

            // This is the documented trap: it SHOULD fail
            expect(reactiveUser instanceof User).toBe(false);

            // This is the recommended fix
            expect(reactiveUser.constructor).toBe(User);
        });

        test("Proxy preserves methods and data", () => {
            const user = new User("Frank");
            const reactiveUser = createKageBunshinObject(user);

            expect(reactiveUser.name).toBe("Frank");
            expect(reactiveUser.sayHi()).toBe("Hi Frank");

            reactiveUser.name = "Stein";
            expect(reactiveUser.name).toBe("Stein");
        });
    });

    describe("Advanced Reactivity", () => {
        test("createComputedSignal (Explicit Dependencies)", async () => {
            const a = createSignal(1);
            const b = createSignal(2);

            /** @rationale FrankJStein usa tracking explícito por diseño. */
            const sum = createComputedSignal(a, b, (valA, valB) => valA + valB);

            expect(sum.value).toBe(3);

            a.value = 10;
            // Esperamos al siguiente microtask para la actualización asíncrona
            await new Promise((r) => queueMicrotask(r));
            expect(sum.value).toBe(12);
        });

        test("ReactiveDraft (Immutability pattern)", async () => {
            const user = { name: "Frank", age: 30 };

            const { ReactiveDraft } = await import("../dist/frankjstein.js");
            const draft = ReactiveDraft.create(user);

            draft.props.name = "Stein";
            expect(draft.isDirty).toBe(true);
            expect(user.name).toBe("Frank"); // Original intacto

            draft.update(); // Commit
            expect(user.name).toBe("Stein");
            expect(draft.isDirty).toBe(false);
        });
    });
});
