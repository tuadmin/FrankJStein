import { describe, expect, test } from "bun:test";
import { ObservableDraft, ReactiveDraft } from "../dist/frankjstein.js";

/**
 * @description Suite de validación para Drafts reactivos.
 * @status EXPERIMENTAL - Sujeto a refactorización de Namespaces (Reactive.Draft).
 * @warning Posible colisión de nombres detectada (debounce).
 */
describe("FrankJStein: Reactive Drafts (EXPERIMENTAL)", () => {
    describe("ObservableDraft: Middleware & Events", () => {
        test("Basic property change and commit", () => {
            const user = { name: "Frank", age: 30 };
            const draft = ObservableDraft.create(user);

            draft.props.name = "Stein";
            expect(draft.isDirty).toBe(true);
            expect(user.name).toBe("Frank"); // No ha mutado el original

            draft.commit();
            expect(user.name).toBe("Stein"); // Ahora sí
            expect(draft.isDirty).toBe(false);
        });

        test("Rollback: reverts changes", () => {
            const user = { name: "Frank" };
            const draft = ObservableDraft.create(user);

            draft.props.name = "Stein";
            draft.rollback();

            expect(draft.props.name).toBe("Frank");
            expect(draft.isDirty).toBe(false);
        });

        test("Events: on('change') and property events ($)", async () => {
            const user = { name: "Frank" };
            const draft = ObservableDraft.create(user);
            let globalChanged = false;
            let nameChanged = false;

            draft.on("change", () => (globalChanged = true));
            // @ts-ignore: Evento de propiedad dinámico
            draft.on("$name", (val) => {
                if (val === "Stein") nameChanged = true;
            });

            draft.props.name = "Stein";

            // Los eventos de Draft son asíncronos por defecto (microtask scheduler)
            await new Promise((r) => queueMicrotask(r));

            expect(globalChanged).toBe(true);
            expect(nameChanged).toBe(true);
        });
    });

    describe("ReactiveDraft: Simple API", () => {
        test("Factory creation and update", () => {
            const data = { val: 1 };
            const draft = new ReactiveDraft(data);

            draft.props.val = 10;
            expect(data.val).toBe(1);

            draft.update();
            expect(data.val).toBe(10);
        });
    });
});
