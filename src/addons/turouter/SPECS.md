# FrankJStein: Arquitectura TuRouter (SPECS v2.0)

Este documento define la arquitectura del sistema de enrutamiento para FrankJStein, diseñado para ser agnóstico, de alto rendimiento y extensible.

## 1. Filosofía Agnostica (Core-First)
El motor de enrutamiento no debe depender de `window` o `history` por defecto. Se divide en capas bien definidas:

1.  **`ITuRouter` (Abstracción Core)**: Define el contrato agnóstico (navegar, resolver, registrar, guards).
2.  **`ITuRouterWeb` (Abstracción Reactiva)**: Extiende del Core y define el contrato para Single Page Applications (gestión de `currentPath`, `params` como Signals y `currentParams` global).
3.  **`TuRouterCore` (Motor)**: Lógica pura de matching, gestión de grupos, guards y parámetros. Puede correr en Bun, Node o el Browser. Delega el matching a `TuPathfinder`.
4.  **`TuPathfinder` (Explorador de Rutas)**: Estructura de datos Trie. Agnóstico al 100%. Expone `insert`, `insertLazy`, y `find`.
5.  **`TuRouterWeb` (Implementación DOM)**: Adapta la lógica al entorno del navegador. Gestiona `popstate`, `hashchange` y la sincronización de Signals mediante adaptadores de modo.

## 2. El Motor: Trie Dinámico y Lazy Loading
Para soportar miles de rutas sin penalización de performance:
- **Estructura de Datos**: Un **Trie (Árbol de Prefijos)**. Cada nodo representa un segmento de la URL.
- **Fast-Path**: Las rutas estáticas (sin parámetros dinámicos) se almacenan en un `staticCache` (Map) para lookup $O(1)$ instantáneo.
- **Lazy Registration**: Los grupos (`router.group`) registran sus rutas de forma diferida. Si el usuario nunca accede a `/admin/*`, las rutas de administración nunca se procesan ni se inyectan en el grafo.
- **Matching Eficiente**: La búsqueda es $O(L)$ donde $L$ es el número de segmentos, no el número de rutas totales.
- **Race Condition Safety**: El `TuPathfinder` implementa `node.pendingLoad` para evitar que múltiples resoluciones concurrentes disparen el mismo lazy-loader más de una vez.
- **AbortSignal**: Los métodos `resolve` y `navigate` aceptan un `AbortSignal` opcional para cancelar resoluciones asíncronas en curso.

## 3. Adaptabilidad Híbrida (Adapters)
Soporte nativo para diferentes "sabores" de URL mediante la arquitectura de adaptadores:
- `HistoryAdapter`: URLs limpias (`/users/1`).
- `HashAdapter`: Compatibilidad SPA clásica (`#!/users/1`).
- `QueryAdapter`: Entornos restrictivos o PHP/Legacy (`?r=/users/1`).

`TuRouterWeb` acepta un array de adaptadores en orden de prioridad. El primero que detecte una ruta válida en la URL actual gana. Esto permite el patrón híbrido: el servidor PHP redirige vía `?r=...` y el cliente usa History puro de ahí en adelante.

```javascript
const router = new TuRouterWeb({
    adapters: [
        new HistoryAdapter(),
        new QueryAdapter('r') // Detecta ?r=/ruta en la carga inicial
    ]
});
```

## 4. Definición de Rutas: Funciones Generadoras y `GroupUrl`
Existen dos formas de definir rutas, ambas sirven como **tokens de tipo** para la inferencia del IDE.

### Funciones Generadoras (Manual)
Para rutas simples e independientes:
```javascript
/** @param {{ id?: string }} [p] */
export const URL_USER = ({ id = '{id}' } = {}) => `/user/${id}`;

// Registro (la función sin args retorna el path con placeholders)
router.add(URL_USER, () => import('./UserProfile.js'));

// Generación de link (0 overhead en runtime, autocompletado estricto)
tags.a({ href: URL_USER({ id: 'abc-123' }) }, "Ver Perfil");
```

### `createGroupUrl` (Recomendado para grupos jerárquicos)
Para rutas anidadas que comparten un prefijo dinámico. Pre-compila los templates en construcción para máxima velocidad en caliente:
```javascript
import { createGroupUrl } from "frankjstein/turouter";

export const URL_USER = createGroupUrl("/user/{user_id}", {
    SETTINGS: "/config",
    POST: "/posts/{post_id}"
});

// Registro del grupo y sus sub-rutas
router.group(URL_USER, (add) => {
    add(URL_USER.SETTINGS, () => "SettingsView");
    add(URL_USER.POST, () => "PostDetailView");
});

// Generación bi-direccional con inferencia completa de tipos en el IDE
const url = URL_USER.POST({ user_id: "123", post_id: "456" });
// => "/user/123/posts/456"
```

## 5. El Patrón Scaffold (UI Contextual)
El router en la web no solo resuelve un componente, sino que orquesta el **Scaffold** de la aplicación mediante Slots Reactivos:
- **Main Slot**: Contenido principal de la página.
- **Context Slots**: FAB (Floating Action Button), Breadcrumbs, Title, etc.

Cada página tiene el poder de "colonizar" estos slots durante su ciclo de vida usando `$block(router.currentPath, ...)`.

## 6. Middlewares y Ciclo de Vida (Guards)
El motor expone interceptores secuenciales (`beforeEach`) para controlar la navegación lógica:
- **Abortar**: Si el guard devuelve `false`, la navegación se cancela y se revierte el estado visual.
- **Redireccionar**: Si devuelve un `string` (ej. `'/login'`), la navegación se aborta y redirige automáticamente.
- **Autorizar**: Si devuelve `true`, prosigue con el siguiente guard o ejecuta el renderizado.

```javascript
router.beforeEach((to, from) => {
    if (to.startsWith('/admin') && !user.isAdmin) {
        return '/login';
    }
    return true;
});
```

## 7. Integración con Inyección de Dependencias (IoC)
El router se registra en el `TuContainer` como un Singleton mediante su contrato (`ITuRouter`):

```javascript
import { TuContainer } from "frankjstein";
import { ITuRouter, TuRouterWeb } from "frankjstein/turouter";

const router = new TuRouterWeb();
TuContainer.addSingleton(ITuRouter, () => router);
```

El `TuPathfinder` expone los parámetros de ruta en un objeto plano (`{ handler, params }`). Para mantener la pureza arquitectónica, la inyección en los componentes sigue dos patrones:

- **Paso por Argumento (Props) — Recomendado**: El Orquestador ejecuta el `handler` inyectándole los `params` directamente. El componente ignora al enrutador y se vuelve una función pura.
- **Obtención Contextual (Contexto Profundo)**: Para componentes profundamente anidados. Se resuelve `ITuRouterWeb` del contenedor y se usa `currentParams()` con el token de la ruta para obtener el snapshot de parámetros sin overhead reactivo.

```javascript
export function ComponenteProfundo() {
    // Al usar la función generadora como token, el IDE infiere el tipo de los params
    const params = TuContainer.resolve(ITuRouterWeb).currentParams(URL_USER);
    console.log(params.user_id); // Autocompletado perfecto
}
```

*Nota: `currentParams()` devuelve un snapshot plano aislando la lectura de cualquier overhead de tracking reactivo.*

## 8. Extensibilidad: Implementaciones Propias (e.g. `TuBunRouter`)

> [!NOTE]
> Esta sección documenta un **punto de extensión de la arquitectura**. FrankJStein no provee una implementación server-side oficial, pero la arquitectura está diseñada explícitamente para soportarla.

Dado que `TuRouterCore` es completamente agnóstico al entorno, cualquier desarrollador puede crear su propia implementación server-side extendiendo el core y registrándola contra el mismo contrato `ITuRouter`:

```javascript
// TuBunRouter.js (implementación hipotética para Bun/Node HTTP)
import { TuRouterCore } from "frankjstein/turouter";

export class TuBunRouter extends TuRouterCore {
    /**
     * Entry point para el servidor HTTP de Bun.
     * @param {Request} request
     * @returns {Promise<Response>}
     */
    async handle(request) {
        const url = new URL(request.url);
        const match = await this.resolve(url.pathname);
        if (!match) return new Response("404 Not Found", { status: 404 });
        return match.handler(request, match.params);
    }
}
```

Y se registra en el contenedor exactamente igual:

```javascript
import { TuContainer } from "frankjstein";
import { ITuRouter } from "frankjstein/turouter";

const router = new TuBunRouter();
TuContainer.addSingleton(ITuRouter, () => router);

// El mismo mapa de rutas funciona en cliente y servidor
router.add(URL_HOME, (req, params) => new Response("Home"));
router.add(URL_USER, (req, params) => new Response(`User: ${params.user_id}`));
```

Lo que garantiza esto: el `TuPathfinder` (Trie, lazy groups, guards, AbortSignal) funciona sin modificar una sola línea. Solo cambia quién consulta el mapa.

---
*Propósito: Crear un flujo donde el código sea el mapa y el router el explorador, sin pisotear la lógica y manteniendo la performance en grafos dinámicos.*
