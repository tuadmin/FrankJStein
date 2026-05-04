import { describe, expect, test } from "bun:test";
import { TuDiscovery } from "../dist/frankjstein.js";

/**
 * @description Suite de integración para Service Discovery y patrón Hub.
 * @standards Protocolo de Testing Soberano v1.0
 */
describe("TuDiscovery: Service Discovery", () => {
    test("Register and resolve services via Hub Proxy", async () => {
        /** @rationale FrankJStein v0.5.5 usa el patrón estático TuDiscovery.create con un mapa de imports. */
        const Hub = TuDiscovery.create({
            auth: async () => ({ login: async () => true }),
            config: async () => ({ getVersion: () => "1.0.0" })
        });

        /** @rationale El acceso es asíncrono vía Proxy. */
        const auth = await Hub.auth;
        const version = await (await Hub.config).getVersion();

        expect(await auth.login()).toBe(true);
        expect(version).toBe("1.0.0");
    });

    test("Service Verification", async () => {
        const Hub = TuDiscovery.create({
            exists: async () => ({ ok: true })
        });

        /** @rationale Permite auditorías de salud del grafo de dependencias. */
        const results = await Hub.$verify();
        expect(results.exists).toContain("Resolved");
    });
});
