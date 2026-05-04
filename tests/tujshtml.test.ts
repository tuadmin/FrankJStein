import { describe, expect, test } from "bun:test";
import { TuJsHtml } from "../dist/frankjstein.js";

/**
 * @description Suite de integración para el motor de renderizado TuJsHtml.
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("TuJsHtml: DOM Construction", () => {
    test("Basic element creation with Tagged Templates", () => {
        /** @rationale FrankJStein v0.5.5 prefiere obtener los tags vía constructor o ELEMENT_UTIL. */
        new TuJsHtml((tags) => {
            const { h1 } = tags;
            const el = h1`Hola Mundo`;

            expect(el).toBeInstanceOf(HTMLElement);
            expect(el.tagName).toBe("H1");
            expect(el.textContent).toBe("Hola Mundo");
        });
    });

    test("Nested elements with configuration object", () => {
        new TuJsHtml((tags) => {
            const { div, p, span } = tags;

            /** @rationale
             * FrankJStein mapea 'className' directamente.
             * Los hijos DEBEN pasarse como argumentos individuales, no en un array.
             */
            const el = div(
                { className: "container" },
                p`Párrafo 1`,
                span({ id: "tag" }, "Texto en span")
            );

            expect(el.className).toBe("container");
            expect(el.children.length).toBe(2);
            expect(el.querySelector("#tag")?.textContent).toBe("Texto en span");
        });
    });

    test("Event binding", () => {
        new TuJsHtml((tags) => {
            const { button } = tags;
            let clicked = false;

            /** @rationale Verifica que los handlers 'on' se vinculen correctamente al DOM nativo. */
            const btn = button({ onclick: () => (clicked = true) }, "Click me");
            btn.click();

            expect(clicked).toBe(true);
        });
    });

    describe("The Nesting Rule (Golden Rule)", () => {
        test("Accepts Function for children", () => {
            new TuJsHtml((tags) => {
                const el = tags.div({}, (ctx) => {
                    ctx.h2`Título`;
                });
                expect(el.querySelector("h2")?.textContent).toBe("Título");
            });
        });

        test("Accepts Tagged Template for children", () => {
            new TuJsHtml((tags) => {
                // ✅ BIEN: div sin argumentos, usado como Tagged Template
                const el = tags.div`Contenido`;
                expect(el.textContent).toBe("Contenido");
            });
        });

        test("Accepts multiple arguments for children", () => {
            new TuJsHtml((tags) => {
                const { div, h2 } = tags;
                // ✅ BIEN: Pasar elementos como argumentos individuales
                const el = div({}, h2`1`, h2`2`);
                expect(el.querySelectorAll("h2").length).toBe(2);
            });
        });
    });
});
