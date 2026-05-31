import { describe, expect, test, beforeEach } from "bun:test";
import {
    TuRouterWeb,
    HashAdapter,
    TuRouterCore,
    TuPathfinder,
    type ITuRouter,
    RouterAdapter
} from "../src/turouter.entry.js";
type HandlerCallback = () => string;
describe("TuRouter: Web Routing Integration", () => {
    let router: TuRouterWeb;

    beforeEach(() => {
        router = new TuRouterWeb();
    });

    test("Initializes with current window path (History Mode)", () => {
        expect(router.currentPath.get()).toBe(window.location.pathname || "/");
    });

    test("Dynamic routing with params", async () => {
        router.add("/users/{id}", () => "UserPage");

        // WebRouter updates its Signals only when navigating
        await router.navigate("/users/456");

        expect(router.currentPath.get()).toBe("/users/456");
        expect(router.params.get().id).toBe("456");
    });

    test("Wildcard routing", async () => {
        router.add("/pages/*", () => "WildcardMatched");

        await router.navigate("/pages/any/sub/path");

        expect(router.currentPath.get()).toBe("/pages/any/sub/path");
        expect(router.params.get()["*"]).toBe("any/sub/path");
    });

    test("Hash mode toggle via Adapter", async () => {
        const hashRouter = new TuRouterWeb({ adapters: [new HashAdapter()] });
        hashRouter.add("/hash-path", () => "HashMatched");

        // When navigating, the hash adapter must update window.location
        await hashRouter.navigate("/hash-path");

        expect(hashRouter.currentPath.get()).toBe("/hash-path");
        expect(window.location.hash).toBe("#/hash-path");
    });

    test("beforeEach guard can redirect to another path", async () => {
        router.add("/new", () => "NewPage");

        // Guard that redirects
        router.beforeEach(async (to) => (to === "/old" ? "/new" : true));

        await router.navigate("/old");

        expect(router.currentPath.get()).toBe("/new");
    });

    test("Group routing with GroupUrl integration", async () => {
        const { createGroupUrl } = await import("../src/addons/turouter/GroupUrl.js");

        const URL_USER = createGroupUrl("/user/{user_id}", {
            SETTINGS: () => "/config",
            POST: ({ post_id = "{post_id}" } = {}) => `/posts/${post_id}`
        });

        router.group(URL_USER, (add) => {
            add(URL_USER.SETTINGS, () => "SettingsPage");
            add(URL_USER.POST, () => "PostPage");
            add("avatar", () => "AvatarPage");
        });

        await router.navigate("/user/123/config");
        expect(router.currentPath.get()).toBe("/user/123/config");
        expect(router.params.get().user_id).toBe("123");

        await router.navigate("/user/123/posts/abc");
        expect(router.currentPath.get()).toBe("/user/123/posts/abc");
        expect(router.params.get().user_id).toBe("123");
        expect(router.params.get().post_id).toBe("abc");

        await router.navigate("/user/123/avatar");
        expect(router.currentPath.get()).toBe("/user/123/avatar");
        expect(router.params.get().user_id).toBe("123");
    });

    test("Cleans and respects base path with filename in TuRouterWeb", () => {
        class MockAdapter extends RouterAdapter {
            constructor() {
                super("/");
            }
            getCurrentPath() {
                return "/my-app/index.html/users/abc";
            }
            updateUrl(_path: string) { }
        }

        const mockRouter = new TuRouterWeb({
            base: "/my-app/index.html",
            adapters: [new MockAdapter()]
        });

        expect(mockRouter.base).toBe("/my-app");

        expect(mockRouter.currentPath.get()).toBe("/users/abc");
    });

    test("Populates params on initial resolution of current path", () => {
        class InitialMockAdapter extends RouterAdapter {
            constructor() {
                super("/");
            }
            getCurrentPath() {
                return "/users/123";
            }
            updateUrl(_path: string) { }
        }

        const mockRouter = new TuRouterWeb({
            adapters: [new InitialMockAdapter()]
        });

        mockRouter.add("/users/{id}", () => "UserMatched");

        expect(mockRouter.currentPath.get()).toBe("/users/123");
        expect(mockRouter.params.get()).toEqual({});

        const match = mockRouter.resolve(mockRouter.currentPath.get());
        expect(match).not.toBeNull();

        expect(mockRouter.params.get().id).toBe("123");
        expect(mockRouter.currentParams().id).toBe("123");
    });
});

describe("TuRouter: Decoupled Core Architecture (Pathfinder + Core)", () => {
    let router: ITuRouter;

    beforeEach(() => {
        // High-performance decoupled routing engine
        const pathfinder = new TuPathfinder();
        router = new TuRouterCore(pathfinder);
    });

    test("Resolves static routes (Fast-path)", async () => {
        router.add("/home", () => "HomeComponent");
        const match = await router.resolve("/home");
        expect((match?.handler as HandlerCallback)()).toBe("HomeComponent");
    });

    test("Resolves dynamic parameters {id}", async () => {
        router.add("/user/{id}/profile", () => "UserProfile");
        const match = await router.resolve("/user/123/profile");
        expect((match?.handler as HandlerCallback)()).toBe("UserProfile");
        expect(match!.params.id).toBe("123");
    });

    test("Synchronous Lazy Hydration of Groups", async () => {
        let hydrated = false;

        router.group("/admin", (add) => {
            hydrated = true;
            add("/settings", () => "AdminSettings");
        });

        // Not hydrated initially
        expect(hydrated).toBe(false);

        // Hydrates on-demand upon route resolution
        const match = await router.resolve("/admin/settings");
        expect(hydrated).toBe(true);
        expect((match?.handler as HandlerCallback)()).toBe("AdminSettings");
    });

    test("Asynchronous Lazy Hydration (Promises / Imports)", async () => {
        let hydrated = false;

        router.group("/dashboard", async (add) => {
            // Simulate async import
            await new Promise((r) => setTimeout(r, 10));
            hydrated = true;
            add("/stats", () => "DashboardStats");
        });

        expect(hydrated).toBe(false);

        const match = await router.resolve("/dashboard/stats");
        expect(hydrated).toBe(true);
        expect((match?.handler as HandlerCallback)()).toBe("DashboardStats");
    });

    test("Wildcard Routing *", async () => {
        router.add("/files/*", () => "FileHandler");
        const match = await router.resolve("/files/images/vacaciones/foto.jpg");
        expect((match?.handler as HandlerCallback)()).toBe("FileHandler");
        expect(match!.params["*"]).toBe("images/vacaciones/foto.jpg");
    });

    test("404 when route does not exist", async () => {
        const match = await router.resolve("/non-existent");
        expect(match).toBeNull();
    });

    test("Asynchronous Lazy Hydration with AbortSignal (Cancellation)", async () => {
        router.group("/aborted", async (add, _options) => {
            await new Promise((r) => setTimeout(r, 10));
            add("/page", () => "AbortedPage");
        });

        const controller = new AbortController();
        const promise = router.resolve("/aborted/page", { signal: controller.signal });

        // Abort immediately
        controller.abort();

        try {
            await promise;
            expect(true).toBe(false); // Should not reach here
        } catch (e: any) {
            expect(e.name).toBe("AbortError");
        }
    });

    test("Race Condition: Multiple concurrent resolutions to the same Lazy Loader", async () => {
        let loadCount = 0;
        router.group("/race", async (add) => {
            loadCount++;
            await new Promise((r) => setTimeout(r, 20));
            add("/1", () => "Race1");
            add("/2", () => "Race2");
        });

        // Trigger concurrent resolutions without awaiting in-between
        const [match1, match2] = await Promise.all([
            router.resolve("/race/1"),
            router.resolve("/race/2")
        ]);

        expect(loadCount).toBe(1); // Loader executed only once
        expect((match1!.handler as HandlerCallback)()).toBe("Race1");
        expect((match2!.handler as HandlerCallback)()).toBe("Race2");
    });
});
