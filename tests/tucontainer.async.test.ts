import { expect, test, describe, beforeEach } from "bun:test";
import { TuContainer, TuScope, TuLazyInject, TuInject, DI, TUtils } from "../dist/frankjstein.js";

// --- DUMMY SERVICES FOR TESTING ---
abstract class IDummyService {
    abstract id: number;
    abstract disposed: boolean;
    abstract dispose(): void;
}
class DummyService implements IDummyService {
    id = Math.random();
    disposed = false;
    dispose() {
        this.disposed = true;
    }
}

abstract class ISingletonToken {
    abstract id: number;
    abstract transient: ITransientToken;
}
class AppSingleton implements ISingletonToken {
    id = Math.random();
    transient = TuLazyInject(ITransientToken);
}

abstract class ITransientToken {
    abstract id: number;
    abstract scoped: IScopedToken;
}
class WorkerTransient implements ITransientToken {
    id = Math.random();
    scoped = TuLazyInject(IScopedToken);
}

abstract class IScopedToken {
    abstract id: number;
    abstract disposed: boolean;
    abstract dispose(): void;
}
class SessionScoped implements IScopedToken {
    id = Math.random();
    disposed = false;
    dispose() {
        this.disposed = true;
    }
}

abstract class ICircularA {
    abstract b: ICircularB;
    abstract name: string;
}
class CircularA implements ICircularA {
    name = "I am A";
    b = TuLazyInject(ICircularB);
}

abstract class ICircularB {
    abstract a: ICircularA;
    abstract name: string;
}
class CircularB implements ICircularB {
    name = "I am B";
    a = TuLazyInject(ICircularA);
}

describe("TuContainer: Async Stress Tests and Scope Leaks", () => {
    beforeEach(() => {
        // Reset the Root container to avoid contamination between tests
        TuContainer.root = new TuScope();
        // @ts-ignore protected property
        TuContainer._registry.clear();

        // Factory usage: The scope must be explicitly injected if using arguments
        TuContainer.addScope(IDummyService, (_scope) => new DummyService());

        // Direct usage: When no extra arguments, pass the implementing class
        TuContainer.addSingleton(ISingletonToken, AppSingleton);
        TuContainer.addTransient(ITransientToken, WorkerTransient);
        TuContainer.addScope(IScopedToken, SessionScoped);

        TuContainer.addSingleton(ICircularA, CircularA);
        TuContainer.addSingleton(ICircularB, CircularB);
    });

    describe("Lifecycle Architecture (Lifetimes)", () => {
        test("A. Correct Hierarchical Resolution (Scope -> Transient -> Scope)", () => {
            const scopeA = TuContainer.createScope();
            const scopeB = TuContainer.createScope();

            // Resolve a Transient from ScopeA
            const transientA1 = scopeA.resolve(ITransientToken);
            const transientA2 = scopeA.resolve(ITransientToken);

            // Transient always creates a new instance
            expect(transientA1.id).not.toBe(transientA2.id);

            // But both 'scoped' dependencies of those transients must be the SAME in ScopeA
            expect(transientA1.scoped.id).toBe(transientA2.scoped.id);

            // Resolve a Transient from ScopeB
            const transientB = scopeB.resolve(ITransientToken);

            // The 'scoped' dependency in ScopeB must be DIFFERENT from the one in ScopeA
            expect(transientB.scoped.id).not.toBe(transientA1.scoped.id);
        });

        test("B. Anti-Pattern: Captive Dependency (Singleton -> Scoped)", () => {
            const scopeA = TuContainer.createScope();

            // Someone innocently resolves the Singleton from a Child Scope
            const singletonA = scopeA.resolve(ISingletonToken);

            // Being a Singleton, TuContainer RESOLVES IT IN THE ROOT SCOPE
            // This means its dependencies (transient and scoped) are resolved under the Root context
            const scopedIdFromSingleton = singletonA.transient.scoped.id;

            // Verify that the Singleton is stored in the Root cache
            expect(TuContainer.root._cache.has(ISingletonToken)).toBe(true);

            // Verify that the nested Scoped ended up in the Root cache
            expect(TuContainer.root._cache.has(IScopedToken)).toBe(true);

            const scopeB = TuContainer.createScope();
            const singletonB = scopeB.resolve(ISingletonToken);

            // Since SingletonA and SingletonB are the same object (Root cache)
            expect(singletonA.id).toBe(singletonB.id);

            // The internal Scoped will be the SAME for all (it became a Global Singleton)
            expect(singletonB.transient.scoped.id).toBe(scopedIdFromSingleton);
        });

        test("C. Edge Case: Circular Dependencies with LazyInject", () => {
            const scope = TuContainer.createScope();

            // This would usually cause a Maximum Call Stack Exceeded in classic DI containers.
            // But TuLazyInject uses Proxies, so instantiation is deferred.
            const a = scope.resolve(ICircularA);

            // We can access property A pointing to B, and B's property pointing back to A.
            expect(a.name).toBe("I am A");
            expect(a.b.name).toBe("I am B");
            expect(a.b.a.name).toBe("I am A");

            // Verify that the Singleton is the SAME in the circular loop
            expect(a.b.a.name).toBe(a.name);
        });

        test("D. Edge Case: Poison Pill Hijacking (Poison Reassignment)", () => {
            const poisonPill = {};
            const scopeA = TuContainer.createScope((scope) => TuContainer.link(poisonPill, scope));

            // Inject into Scope A
            const instanceA = TuLazyInject(IDummyService, { context: poisonPill });

            // Now someone comes and reuses the DOM Element / context for a new scope
            const scopeB = TuContainer.createScope((scope) => TuContainer.link(poisonPill, scope));

            // Inject again using the SAME poison
            const instanceB = TuLazyInject(IDummyService, { context: poisonPill });

            // Verify: What happens with the injections?
            // When doing TuLazyInject, a WeakRef to the scope is captured at that exact moment.
            // Even if the poison is reassigned to scopeB, instanceA already has a WeakRef pointing to scopeA.

            // Force property access to instantiate (here it evaluates the proxy)
            let _ignoreThis = instanceB.id != instanceA.id;

            // TuContainer is super robust! instanceA is instantiated in scopeA, and instanceB in scopeB.
            // Reassigning the context (DOM element) does not break previously created proxies.
            expect(scopeB._cache.has(IDummyService)).toBe(true);
            expect(scopeA._cache.has(IDummyService)).toBe(true);
        });
    });

    test("1. Synchronous Behavior: The scope is implicit", () => {
        class MyController {
            service = TuLazyInject(IDummyService);
        }
        TuContainer.addTransient(MyController, MyController);

        const myScope = TuContainer.createScope();
        // When resolving, currentScope becomes 'myScope' internally
        const ctrl = myScope.resolve(MyController);

        expect(ctrl.service.id).toBeDefined();
        expect(myScope._cache.has(IDummyService)).toBe(true);
        expect(TuContainer.root._cache.has(IDummyService)).toBe(false);
    });

    test("2. Async Hijacking (Bug Reproduction): Scope Loss", async () => {
        let asyncInstance: IDummyService | null = null;
        let _rootInstance = null;

        const myScope = TuContainer.createScope((_scope) => {
            // Simulate "await import" or async event.
            setTimeout(() => {
                // This happens OUTSIDE the synchronous cycle of createScope.
                // Without options, it should fall back to Root (current behavior).
                asyncInstance = TuLazyInject(IDummyService);

                // Force instantiation by accessing a property
                const _id = asyncInstance?.id;
            }, 10);
        });

        // Wait for the setTimeout to complete
        await TUtils.sleepAsync(20);

        // BUG VERIFICATION:
        // 1. The local scope does NOT have the instance
        expect(myScope._cache.has(IDummyService)).toBe(false);
        // 2. The ROOT was contaminated! It became a global Singleton.
        expect(TuContainer.root._cache.has(IDummyService)).toBe(true);
    });

    test("3. Safe Hybridization (The Standard): Using the Poison Pill", async () => {
        const poisonPill = {}; // Context object (e.g., params)
        let asyncInstance: IDummyService | null = null;

        const myScope = TuContainer.createScope((scope) => {
            // Poison the object by linking it to the current scope
            TuContainer.link(poisonPill, scope);

            // Simulate the async event
            setTimeout(() => {
                // Pass the poison to reconnect
                asyncInstance = TuLazyInject(IDummyService, { context: poisonPill });
                const sameObject = TuInject<IDummyService>(IDummyService, { context: poisonPill });
                const _id = asyncInstance?.id;
                if (sameObject.id !== asyncInstance.id) throw new Error("Not Equals");
            }, 10);
        });

        await TUtils.sleepAsync(20);

        // VERIFICATION:
        // 1. The local scope HAS the instance
        expect(myScope._cache.has(IDummyService)).toBe(true);
        // 2. The Root remained clean
        expect(TuContainer.root._cache.has(IDummyService)).toBe(false);
    });

    test("4. Zombification: Fail when using a disposed context", async () => {
        const poisonPill = {};
        let asyncInstance: IDummyService | null = null;
        let error: any = null;

        const myScope = TuContainer.createScope((scope) => {
            TuContainer.link(poisonPill, scope);
        });

        // Simulate the Scope being destroyed by a route change (like in init())
        myScope.dispose();

        await TUtils.sleepAsync(10);

        try {
            // Attempt to use the router after its world has been destroyed
            asyncInstance = DI.LazyInject(IDummyService, { context: poisonPill });
            const _id = asyncInstance.id; // Force getInstance()
        } catch (err) {
            error = err;
        }

        // VERIFICATION:
        expect(error).not.toBeNull();
        expect(error.message).toContain("[TuDI] Error");
    });

    test("5. Garbage Collection (GC) in linked Scopes", async () => {
        // In Bun, we can force the Garbage Collector to verify that WeakRef works.
        let poisonPill: any = {};

        const myScope = TuContainer.createScope((scope) => {
            TuContainer.link(poisonPill, scope);
        });

        const router = myScope.resolve(IDummyService);
        expect(router.disposed).toBe(false);

        // Dispose of the scope explicitly
        myScope.dispose();

        expect(router.disposed).toBe(true);

        // Release the poison reference
        poisonPill = null;

        // Force the garbage collector (Bun-specific)
        Bun.gc(true);

        // At this point, there are no variables keeping myScope alive.
        // TuContainer.js only uses a WeakMap internally for the _ScopeRegistry.
        // Everything should be clean.
        expect(myScope.isDisposed).toBe(true);
    });
});
