# 🧭 TuRouter: Enrutamiento Avanzado para FrankJStein

El sistema de enrutamiento de **FrankJStein** no es el típico router pegado con cinta que encontrás en otros frameworks. Está diseñado bajo una arquitectura de **Arquitectura Desacoplada**: es agnóstico, multi-entorno y ridículamente rápido.

## 🏗️ Arquitectura de Tres Capas

Para que no te hagas un lío, el router está dividido para que cada parte haga lo que tiene que hacer:

1.  **`TuPathfinder` (El Explorador)**: Lógica pura de matching. Usa un **Trie (Árbol de Prefijos)** para que resolver una ruta entre 10.000 sea instantáneo ($O(L)$). No sabe qué es un browser ni le importa.
2.  **`TuRouterCore` (El Orquestador)**: Gestiona el registro de rutas, middlewares (guards) y grupos. Es el cerebro agnóstico que podés correr en Bun, Node o el Browser.
3.  **`TuRouterWeb` (El Adaptador DOM)**: La implementación específica para la web. Gestiona el `history`, el `hash`, y sincroniza el estado con **Signals** para que tu UI reaccione sola.

---

## 🚀 Uso Rápido

### 1. Definir Rutas (Con Type-Safety)
Olvidate de escribir strings a mano como un principiante. Usamos funciones generadoras que sirven de tokens:

```javascript
// routes.js
/** @param {{ id?: string }} [p] */
export const URL_USER = ({ id = '{id}' } = {}) => `/user/${id}`;

export const URL_HOME = () => '/';
```

### 2. Registrar e Instanciar
En tu entry point, configurás el contenedor de dependencias (DI):

```javascript
import { TuContainer } from "frankjstein";
import { ITuRouter, TuRouterWeb } from "frankjstein/turouter";

// Instanciamos la implementación web
const router = new TuRouterWeb();

// Registramos el router en el contenedor de dependencias
TuContainer.addSingleton(ITuRouter, () => router);

// Agregar rutas
router.add(URL_HOME, () => import("./views/Home.js"));
router.add(URL_USER, () => import("./views/UserProfile.js"));
```

### 🎯 Definición de Rutas Avanzada (`GroupUrl`)

Para evitar tener que escribir funciones generadoras manuales, FrankJStein expone `createGroupUrl`. Esto permite declarar grupos de URLs jerárquicas con parámetros dinámicos, garantizando inferencia de tipos perfecta en el IDE:

```javascript
import { createGroupUrl } from "frankjstein/turouter";

// Define un grupo principal y sus sub-rutas dinámicas
export const URL_USER = createGroupUrl("/user/{user_id}", {
    SETTINGS: "/config",
    POST: "/posts/{post_id}"
});

// 1. Registro en el router
router.add(URL_USER, () => "UserProfile");
router.add(URL_USER.SETTINGS, () => "UserSettings");
router.add(URL_USER.POST, () => "UserPostDetail");

// 2. Generación bi-direccional de URLs con parámetros
// Inferencia automática en el IDE: solicita { user_id } y { post_id }
const userPostUrl = URL_USER.POST({ user_id: "123", post_id: "456" });
console.log(userPostUrl); // "/user/123/posts/456"
```

El motor de `GroupUrl` está altamente optimizado: pre-calcula los resolvedores para que la generación de URLs en caliente sea prácticamente instantánea, logrando millones de ejecuciones por segundo sin sobrecargar el recolector de basura (GC).

---

## 🏎️ Adaptadores (Multimode)
El router es camaleónico. Podés cambiar cómo se ve la URL sin tocar tu lógica de negocio. Ideal para entornos legacy (PHP), SPAs clásicas o PWAs modernas.

- **`HistoryAdapter`**: URLs limpias (`/path`).
- **`HashAdapter`**: Basado en Hash (`#/path`).
- **`QueryAdapter`**: Basado en parámetros (`?ruta=/path`).

> [!TIP]
> Mirá el ejemplo en `examples/router-multimode/` para ver cómo alternar entre estos modos en tiempo de ejecución.


### 3. Navegación
Podés navegar usando el router directamente o mediante componentes:

```javascript
// Programático
router.navigate(URL_USER({ id: 123 }));

// En el HTML (TuJsHtml)
tags.a({ href: URL_USER({ id: 456 }) }, "Ver Perfil");
```

---

## 🛡️ Middlewares y Guards
Podés meter interceptores para que nadie pase si no tiene permiso:

```javascript
router.beforeEach((to, from) => {
    if (to.startsWith('/admin') && !user.isAdmin) {
        return '/login'; // Redirección automática
    }
    return true; // Dale para adelante
});
```

---

## 💉 Inyección de Dependencias (IoC)
Tus componentes no tienen que saber que el router existe. Podés inyectar los parámetros directamente:

```javascript
// UserProfile.js (Smart Component)
export function UserProfile({ params }) {
    // 'params' ya viene inyectado con { id: 123 }
    return tags.div({}, `Viendo al usuario: ${params.id}`);
}
```

Si estás en un componente muy anidado (Dumb Component) y necesitás los params sin pasarlos por props, podés acceder a ellos a través del Router. 

Notarás que al método `currentParams` se le pasa la constante de la ruta (`URL_USER`). Esto no es obligatorio, pero es una **buena práctica vital para el autocompletado del IDE (VSCode)**:

```javascript
const router = TuContainer.resolve(ITuRouterWeb);

// Al pasarle URL_USER, el IDE infiere qué parámetros tiene esa ruta.
// Si URL_USER es "/users/{id}", VSCode sabrá que `params.id` existe.
const params = router.currentParams(URL_USER);

console.log(params.id); // Autocompletado seguro
```

> [!TIP]
> Si el componente se renderiza accidentalmente en una ruta distinta a `URL_USER`, las propiedades como `id` serán `undefined`. Pasar la constante de la ruta actúa como un contrato de expectativas para el desarrollador.
