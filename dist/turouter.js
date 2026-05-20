import { createSignal as t } from "./frankjstein.js";
class ITuRouter {
    add(t, e) {
        throw new Error("Not implemented");
    }
    group(t, e) {
        throw new Error("Not implemented");
    }
    resolve(t, e) {
        throw new Error("Not implemented");
    }
    beforeEach(t) {
        throw new Error("Not implemented");
    }
    navigate(t, e) {
        throw new Error("Not implemented");
    }
}
class ITuRouterWeb extends ITuRouter {
    get currentPath() {
        throw new Error("Not implemented");
    }
    currentParams(t) {
        throw new Error("Not implemented");
    }
    getSlot(t, e) {
        throw new Error("Not implemented");
    }
    static [Symbol.hasInstance](t) {
        return (
            !!t &&
            (!!ITuRouterWeb.prototype.isPrototypeOf(t) ||
                (t instanceof ITuRouter && "currentPath" in t && "currentParams" in t))
        );
    }
}
class Node {
    constructor(t = "") {
        (this.segment = t),
            (this.staticChildren = new Map()),
            (this.paramChildren = new Map()),
            (this.wildcardChild = null),
            (this.handler = null),
            (this.lazyLoader = null),
            (this.pendingLoad = null),
            (this.singleParamName = null),
            (this.singleParamNode = null),
            (this.lazyPrefixSegments = null);
    }
}
class TuPathfinder {
    constructor() {
        (this.root = new Node()), (this.staticCache = new Map());
    }
    insert(t, e) {
        if (!t.includes("{") && !t.includes("*"))
            return void this.staticCache.set(t, { handler: e, params: {} });
        const r = this.#t(t);
        let s = this.root;
        for (const t of r) s = this.#e(s, t);
        s.handler = e;
    }
    insertLazy(t, e) {
        const r = "function" == typeof t?.toString ? t.toString() : t,
            s = this.#t(r);
        let a = this.root;
        for (const t of s) a = this.#e(a, t);
        (a.lazyLoader = e), (a.lazyPrefixSegments = s);
    }
    find(t, e = {}) {
        const r = this.staticCache.get(t);
        if (r) return r;
        const s = this.#t(t);
        return this.#r(this.root, s, 0, {}, e);
    }
    #r(t, e, r, s, a) {
        if (a?.signal?.aborted) {
            const t = new Error("AbortError");
            throw ((t.name = "AbortError"), t);
        }
        if (t.lazyLoader) {
            const n = t.lazyLoader;
            t.lazyLoader = null;
            try {
                const i = n((e, r) => {
                    let s = "function" == typeof e ? e() : e;
                    const a = t.lazyPrefixSegments;
                    if (a && a.length > 0) {
                        const t = this.#t(s);
                        let e = !0;
                        if (t.length >= a.length) {
                            for (let r = 0; r < a.length; r++)
                                if (t[r] !== a[r]) {
                                    e = !1;
                                    break;
                                }
                        } else e = !1;
                        e && (s = "/" + t.slice(a.length).join("/"));
                    }
                    this.#s(t, s, r);
                }, a);
                if (i && "function" == typeof i.then) {
                    const o = i
                        .catch((e) => {
                            throw ((t.lazyLoader = n), e);
                        })
                        .finally(() => {
                            t.pendingLoad = null;
                        });
                    return (t.pendingLoad = o), o.then(() => this.#r(t, e, r, s, a));
                }
            } catch (e) {
                throw ((t.lazyLoader = n), e);
            }
        }
        const n = t.pendingLoad;
        if (n) return n.then(() => this.#r(t, e, r, s, a));
        if (r === e.length) return t.handler ? { handler: t.handler, params: s } : null;
        const i = e[r],
            o = t.staticChildren.get(i);
        if (o) {
            const n = this.#r(o, e, r + 1, s, a);
            if (n && "function" == typeof n.then) return n.then((n) => n || this.#a(t, e, r, s, a));
            if (n) return n;
        }
        return this.#a(t, e, r, s, a);
    }
    #a(t, e, r, s, a) {
        const n = e[r];
        if (t.singleParamNode) {
            const i = t.singleParamName;
            s[i] = n;
            const o = this.#r(t.singleParamNode, e, r + 1, s, a);
            if (o && "function" == typeof o.then)
                return o.then((n) => n || (delete s[i], this.#n(t, e, r, s, a)));
            if (o) return o;
            delete s[i];
        } else if (t.paramChildren.size > 0) {
            const n = Array.from(t.paramChildren.entries());
            return this.#i(t, e, r, s, n, 0, a);
        }
        return this.#n(t, e, r, s, a);
    }
    #i(t, e, r, s, a, n, i) {
        if (n >= a.length) return this.#n(t, e, r, s, i);
        const [o, h] = a[n],
            l = e[r];
        s[o] = l;
        const c = this.#r(h, e, r + 1, s, i);
        return c && "function" == typeof c.then
            ? c.then((h) => h || (delete s[o], this.#i(t, e, r, s, a, n + 1, i)))
            : c || (delete s[o], this.#i(t, e, r, s, a, n + 1, i));
    }
    #n(t, e, r, s, a) {
        if (t.wildcardChild) {
            s["*"] = e.slice(r).join("/");
            const n = this.#r(t.wildcardChild, e, e.length, s, a);
            if (n && "function" == typeof n.then) return n.then((t) => t || (delete s["*"], null));
            if (n) return n;
            delete s["*"];
        }
        return null;
    }
    #t(t) {
        return t.split("/").filter((t) => t.length > 0);
    }
    #e(t, e) {
        const r = e.match(/^\{(.+)\}$/) || e.match(/^:(.+)$/);
        if (r) {
            const s = r[1];
            t.paramChildren.has(s) || t.paramChildren.set(s, new Node(e));
            const a = t.paramChildren.get(s);
            return (
                1 === t.paramChildren.size
                    ? ((t.singleParamName = s), (t.singleParamNode = a))
                    : ((t.singleParamName = null), (t.singleParamNode = null)),
                a
            );
        }
        return "*" === e
            ? (t.wildcardChild || (t.wildcardChild = new Node(e)), t.wildcardChild)
            : (t.staticChildren.has(e) || t.staticChildren.set(e, new Node(e)),
              t.staticChildren.get(e));
    }
    #s(t, e, r) {
        const s = "function" == typeof e ? e() : e,
            a = this.#t(s);
        let n = t;
        for (const t of a) n = this.#e(n, t);
        n.handler = r;
    }
    dispose() {
        this.staticCache.clear();
    }
}
class TuRouterCore extends ITuRouter {
    #o = [];
    constructor(t = new TuPathfinder()) {
        super(), (this.pathfinder = t);
    }
    add(t, e) {
        const r = "function" == typeof t ? t() : t;
        this.pathfinder.insert(r, e);
    }
    group(t, e) {
        this.pathfinder.insertLazy(t, e);
    }
    resolve(t, e = {}) {
        return this.pathfinder.find(t, e);
    }
    beforeEach(t) {
        this.#o.push(t);
    }
    async runGuards(t, e) {
        for (const r of this.#o) {
            const s = await r(t, e);
            if (!1 === s) return !1;
            if ("string" == typeof s) return s;
        }
        return !0;
    }
}
class RouterAdapter {
    constructor(t) {
        this.prefix = t;
    }
    matches(t) {
        return t.startsWith(this.prefix);
    }
    getCurrentPath() {
        throw new Error("Method not implemented");
    }
    updateUrl(t) {
        throw new Error("Method not implemented");
    }
    replaceUrl(t) {
        throw new Error("Method not implemented");
    }
}
class HistoryAdapter extends RouterAdapter {
    constructor(t = "/") {
        super(t);
    }
    getCurrentPath() {
        return window.location.pathname;
    }
    updateUrl(t) {
        window.history.pushState(null, "", t);
    }
    replaceUrl(t) {
        window.history.replaceState(null, "", t);
    }
}
class HashAdapter extends RouterAdapter {
    constructor(t = "#/") {
        super(t);
    }
    getCurrentPath() {
        const t = window.location.hash;
        return t.startsWith(this.prefix) ? t.slice(this.prefix.length - 1) : "/";
    }
    updateUrl(t) {
        window.location.hash = (t.startsWith("/") ? "#" : "#/") + t;
    }
    replaceUrl(t) {
        window.location.replace((t.startsWith("/") ? "#" : "#/") + t);
    }
}
class QueryAdapter extends RouterAdapter {
    constructor(t = "route") {
        super(`?${t}=`), (this.paramName = t);
    }
    getCurrentPath() {
        return new URLSearchParams(window.location.search).get(this.paramName) || "/";
    }
    updateUrl(t) {
        const e = new URL(window.location);
        e.searchParams.set(this.paramName, t), window.history.pushState(null, "", e.toString());
    }
    replaceUrl(t) {
        const e = new URL(window.location);
        e.searchParams.set(this.paramName, t), window.history.replaceState(null, "", e.toString());
    }
}
class TuRouterWeb extends TuRouterCore {
    #h = new Map();
    #l = new Set();
    #c;
    #u;
    #d = null;
    #p = {};
    #m = !1;
    #f = !1;
    constructor(e = {}) {
        super(e.pathfinder);
        let r = e.base || "";
        /\/[^/]+\.[^/]+$/.test(r) && (r = r.replace(/\/[^/]+\.[^/]+$/, "")),
            (this.base = r.replace(/\/$/, "")),
            (this.adapters = e.adapters || [new HistoryAdapter()]),
            (this.currentPath = t(this.#w().split("?")[0])),
            (this.params = t({})),
            (this.#c = () => this.#g()),
            (this.#u = () => this.#g()),
            window.addEventListener("popstate", this.#c),
            window.addEventListener("hashchange", this.#u);
    }
    dispose() {
        window.removeEventListener("popstate", this.#c),
            window.removeEventListener("hashchange", this.#u),
            this.#h.forEach((t) => t.set(null)),
            this.#h.clear(),
            this.#l.clear(),
            this.currentPath.unsubscribeAll(),
            this.params.unsubscribeAll(),
            (this.#m = !0);
    }
    getSlot(e, r = { persistent: !1 }) {
        return (
            this.#h.has(e) || this.#h.set(e, t(null)),
            r.persistent && this.#l.add(e),
            this.#h.get(e)
        );
    }
    resolve(t, e = {}) {
        const r = super.resolve(t, e);
        return (
            !this.#f &&
                r &&
                t === this.currentPath.value &&
                ((this.#f = !0), (this.#p = r.params || {}), this.params.set(this.#p)),
            r
        );
    }
    async navigate(t, e = {}) {
        const r = this.#P(t) || this.adapters[0],
            s = this.currentPath.value || "/",
            a = await this.runGuards(t, s);
        if (!1 === a) return;
        if ("string" == typeof a) return this.navigate(a, { ...e, force: !0 });
        this.#d && this.#d.abort("New navigation started"), (this.#d = new AbortController());
        const n = this.#d.signal,
            [i, o] = t.split("?");
        let h;
        try {
            h = await this.resolve(i, { signal: n });
        } catch (t) {
            if ("AbortError" === t.name) return;
            throw new Error(`[TuRouterWeb] Failed to resolve route ${i}: ${t.message}`, {
                cause: t
            });
        }
        if (!n.aborted) {
            if (!h && !e.force) throw new Error(`[TuRouterWeb] Route not found: ${i}`);
            this.#h.forEach((t, e) => {
                this.#l.has(e) || t.set(null);
            }),
                r.updateUrl(this.base + t),
                await this.#g(t, h);
        }
    }
    #w() {
        for (const t of this.adapters) {
            let e = t.getCurrentPath();
            if (
                (this.base && e.startsWith(this.base) && (e = e.slice(this.base.length) || "/"),
                "/index.html" === e || "/index.php" === e || "/main.html" === e
                    ? (e = "/")
                    : (e.startsWith("/index.html/") ||
                          e.startsWith("/index.php/") ||
                          e.startsWith("/main.html/")) &&
                      (e = e.replace(/^\/(?:index\.html|index\.php|main\.html)/, "")),
                e && "/" !== e)
            )
                return e;
        }
        return "/";
    }
    #P(t) {
        return this.adapters.find((e) => e.matches(t));
    }
    async #g(t = null, e = null) {
        if (this.#m) throw new TypeError("[TuRouterWeb] Router has been disposed");
        const r = t || this.#w(),
            [s, a] = r.split("?");
        let n,
            i = e;
        if (e) n = this.#d?.signal;
        else {
            const e = this.currentPath.value || "/";
            if (!t) {
                const t = await this.runGuards(r, e);
                if (!1 === t) return void (this.#P(e) || this.adapters[0]).replaceUrl(e);
                if ("string" == typeof t)
                    return (
                        (this.#P(e) || this.adapters[0]).replaceUrl(e),
                        this.navigate(t, { force: !0 })
                    );
            }
            this.#d && this.#d.abort("New navigation started via history sync"),
                (this.#d = new AbortController()),
                (n = this.#d.signal);
            try {
                i = await this.resolve(s, { signal: n });
            } catch (t) {
                if ("AbortError" === t.name) return;
                throw new Error(`[TuRouterWeb] Failed to sync route ${s}: ${t.message}`, {
                    cause: t
                });
            }
        }
        n?.aborted ||
            (i
                ? ((this.#f = !0),
                  (this.#p = i.params || {}),
                  this.params.set(i.params),
                  this.currentPath.set(s))
                : t &&
                  ((this.#f = !0), (this.#p = {}), this.params.set({}), this.currentPath.set(s)));
    }
    currentParams(t) {
        return this.#p;
    }
}
function compileTemplate(t) {
    const e = [];
    let r = 0;
    return (
        t.replace(
            /\{([^}]+)\}/g,
            (s, a, n) => (
                n > r && e.push(t.slice(r, n)), e.push({ param: a }), (r = n + s.length), s
            )
        ),
        r < t.length && e.push(t.slice(r)),
        (t) => {
            let r = "";
            for (let s = 0; s < e.length; s++) {
                const a = e[s];
                if ("string" == typeof a) r += a;
                else {
                    const e = t[a.param];
                    r += void 0 !== e ? e : `{${a.param}}`;
                }
            }
            return r;
        }
    );
}
class GroupUrl {
    constructor(t, e) {
        (this.prefix = t), (this.subRoutes = e);
        const r = compileTemplate(t);
        for (const [s, a] of Object.entries(e))
            if ("string" == typeof a) {
                const e = t.endsWith("/"),
                    r = a.startsWith("/");
                let n;
                n = e && r ? t + a.slice(1) : e || r ? t + a : t + "/" + a;
                const i = compileTemplate(n);
                this[s] = (t = {}) => i(t);
            } else
                this[s] = (t = {}) => {
                    const e = r(t),
                        s = a(t),
                        n = e.endsWith("/"),
                        i = s.startsWith("/");
                    return n && i ? e + s.slice(1) : n || i ? e + s : e + "/" + s;
                };
    }
    toString() {
        return this.prefix;
    }
}
function createGroupUrl(t, e) {
    return new GroupUrl(t, e);
}
export {
    GroupUrl,
    HashAdapter,
    HistoryAdapter,
    ITuRouter,
    ITuRouterWeb,
    QueryAdapter,
    RouterAdapter,
    TuPathfinder,
    TuRouterCore,
    TuRouterWeb,
    createGroupUrl
};
