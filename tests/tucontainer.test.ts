import { describe, expect, test } from "bun:test";
import { DI, TuContainer, TuLazyInject } from "../dist/frankjstein.js";

/**
 * @description Suite de integración para el motor de Inyección de Dependencias (DI).
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("TuContainer: Dependency Injection", () => {
    // Clases de prueba
    class Logger {
        log(msg: string) {
            return msg;
        }
    }

    class ApiService {
        constructor(public logger = DI.Inject<Logger>(Logger)) {}
    }

    describe("Basic Registration & Resolution", () => {
        test("Singleton registration", () => {
            TuContainer.addSingleton(Logger);

            const instance1 = TuContainer.resolve<Logger>(Logger);
            const instance2 = TuContainer.resolve<Logger>(Logger);

            /** @rationale Un Singleton debe devolver siempre la misma instancia física. */
            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(Logger);
        });

        test("Transient registration", () => {
            const Token = "TransientService";
            TuContainer.addTransient(Token, () => ({ id: Math.random() }));

            const instance1 = TuContainer.resolve<{ id: number }>(Token);
            const instance2 = TuContainer.resolve<{ id: number }>(Token);

            /** @rationale Un Transient debe generar una nueva instancia en cada llamada. */
            expect(instance1.id).not.toBe(instance2.id);
        });
    });

    describe("Hierarchical Scopes", () => {
        test("Scoped dependencies stay within their hierarchy", () => {
            class RequestContext {
                id = Math.random();
            }
            TuContainer.addScope(RequestContext);

            const scopeA = TuContainer.createScope();
            const scopeB = TuContainer.createScope();

            const reqA1 = scopeA.resolve<RequestContext>(RequestContext);
            const reqA2 = scopeA.resolve<RequestContext>(RequestContext);
            const reqB1 = scopeB.resolve<RequestContext>(RequestContext);

            /** @rationale Scoped: misma instancia en el mismo scope, distinta en otros. */
            expect(reqA1).toBe(reqA2);
            expect(reqA1).not.toBe(reqB1);
        });
    });

    describe("Lazy Injection", () => {
        test("TuLazyInject defers resolution", () => {
            /**
             * @trap TS(7022) - Inferencia Circular Intencional
             * Forzamos al compilador al límite para validar que FrankJStein
             * resuelve el ciclo mediante Proxies en tiempo de ejecución.
             */

            class CircularB {
                // @ts-ignore: VSCode marcará error de inferencia, pero el test validará el Runtime
                constructor(public a: CircularA = TuLazyInject<CircularA>(() => CircularA)) {}
            }

            class CircularA {
                // @ts-ignore: TSC no puede seguir el rastro circular en el inicializador
                constructor(public b: CircularB = TuLazyInject<CircularB>(() => CircularB)) {}
            }
            // @ts-ignore: TSC no puede seguir el rastro circular en el inicializador
            TuContainer.addSingleton(CircularA);
            // @ts-ignore: TSC no puede seguir el rastro circular en el inicializador
            TuContainer.addSingleton(CircularB);

            // @ts-ignore: El editor puede marcar la resolución como inestable por la circularidad
            const a = TuContainer.resolve<CircularA>(CircularA);

            /** @rationale
             * Validamos vía constructor para evitar el trap de identidad de los Proxies.
             * Si llegamos acá, el motor de DI superó la prueba de fuego.
             */
            expect(a.b.constructor).toBe(CircularB);
            expect(a.b.a.constructor).toBe(CircularA);
        });
    });
});
