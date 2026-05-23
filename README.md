<p align="center">
  <img src="./assets/logo-full.svg" alt="FrankJStein Framework Logo" width="500" />
</p>

# 🧟‍♂️ FrankJStein

> **F**ragment **R**eactive **A**sync **N**ode **K**it **J**avaScript
> **S**uspense **T**ree **E**ngine **I**ntegrated **N**atively

**Frank J. Stein** es un motor de renderizado y framework UI para JavaScript
nativo. Construye interfaces de usuario asíncronas, reactivas y ultrarrápidas
sin necesidad de transpiladores, Virtual DOM complejos o configuraciones
pesadas.

_Escríbelo en JS, córrelo en el navegador. Así de simple._

## 📦 Instalación

```bash
npm install frankjstein
```

Y luego impórtalo en tu proyecto:

```javascript
import { createSignal, ELEMENT_UTIL as $, TuJsHtml } from "frankjstein";
```

## ✨ Un Vistazo Rápido

FrankJStein se adapta a tu estilo de código. El mismo counter reactivo, dos formas de escribirlo:

**Estilo anidado** — estructura jerárquica explícita con callbacks:
```javascript
import { createSignal, TuJsHtml } from "frankjstein";

/** @param {import("frankjstein").TuJsHtml.Types.Tags} tags */
const app = new TuJsHtml((tags) => {
  const contador = createSignal(0);

  tags.div({ className: "counter-card" }, (ctx) => {
    ctx.h1`Hola FrankJStein`;
    ctx.p`Clicks actuales: ${contador}`;
    
    ctx.button({ 
      style: { marginTop: "10px" },
      "@on": { click: () => contador.value++ }
    }, "Incrementar");
  });
});

document.body.append(app);
```
**Estilo declarativo** — destructuring de elementos, más expresivo y compacto:
```javascript
import { createSignal, ELEMENT_UTIL as $, TuJsHtml } from "https://esm.sh/frankjstein@0.6.4";


const app = new TuJsHtml( tags => {
  const contador = createSignal(0);
  const {
    "div.counter-card":Box,
    h1:Title,
    p,
    "button[style=margin-top:10px]":Btn
  } = tags;
  Box(
    Title`Hola FrankJStein`,
    p`Clicks actuales: ${contador}`,
    _ => {
      // [$] wraps the element with framework helpers (autocomplete-friendly)
      // equivalent to: Btn`Incrementar`.addEventListener("click", ...)
      Btn`Incrementar`[$].on("click", () => contador.value++)
    }
  )
});
document.body.append(app);
```

> `ELEMENT_UTIL` (importado como `$`) es un helper de conveniencia con soporte completo de autocompletado para eventos, estilos y más.


## 📚 Documentación y Arquitectura

Para mantener este archivo limpio, la documentación técnica exhaustiva se divide por módulos. Si eres un desarrollador humano o una IA buscando entender las reglas y convenciones del framework, consultá los documentos de referencia:

- **[AGENTS.md (El Manifiesto)](./AGENTS.md)**: La ley suprema del repositorio y reglas de oro para IAs.
- **[Project Blueprint (Mapa del Repositorio)](./docs/project-blueprint.md)**: La guía definitiva para entender la estructura, carpetas y filosofía del código.

### 📦 Módulos Core (Núcleo Principal)

Estos módulos forman parte del núcleo principal del framework y están disponibles importando directamente desde `"frankjstein"`.

- **[TuJsHtml (DOM Builder & UI)](./docs/tujshtml/README.md)**: Construcción de interfaces nativas, [templates](./docs/tujshtml/templates.md) y [suspense](./docs/tujshtml/suspense-and-blocks.md).
- **[Component Design (Patrones y Estructura)](./docs/component-design.md)**: Cómo diseñar componentes reutilizables y "Smart Components".
- **[KageBunshin (Signals & Reactividad)](./docs/kagebunshin.md)**: Reactividad granular extrema y estados mutables.
- **[TuContainer (Inyección de Dependencias)](./docs/tucontainer.md)**: Kernel de DI para desacoplar lógica de negocio y gestionar dependencias de forma segura.
- **[Disposable (Gestión de Recursos)](./docs/disposable.md)**: Ciclo de vida y liberación determinista de memoria mediante patrones descartables.
- **[RemoteModule (Web Workers)](./docs/remote.md)**: Multi-threading nativo y RPC para delegar tareas pesadas a hilos de ejecución secundarios.
- **[TuDiscovery (Service Discovery)](./docs/tudiscovery.md)**: Localizador de servicios centralizado y patrón Bridge para comunicación asíncrona entre Workers.
- **[TUtils (Utilidades Core)](./docs/tutils.md)**: Utilidades del núcleo para caché asíncrona, control de tiempos y robustez general.
- **[TuWebUtils (Utilidades Web)](./docs/tuwebutils.md)**: Utilidades de alto rendimiento para el navegador (time-slicing para colecciones gigantes, formularios y observadores).

### 🧩 Addons (Módulos de Extensión Opcionales)

Módulos desacoplados que extienden el framework. Para mantener el core ultra ligero, se importan por separado utilizando subpath exports.

- **[TuRouter (Enrutamiento Avanzado)](./docs/turouter.md)**: Enrutador desacoplado agnóstico con trie de prefijos ultra rápido ($O(L)$) y adaptadores de navegación multi-modo (`History`, `Hash`, `Query`). Se importa desde `"frankjstein/turouter"`.


> [!TIP]
> **El Linter es tu mejor amigo.** FrankJStein distribuye un archivo `frankjstein.d.ts` con tipados estrictos. Desarrollar en un entorno con soporte para TypeScript/JSDoc te ahorrará horas de debugging al validar tus configuraciones en tiempo real.

## 🧠 Filosofía y Contribuciones

**FrankJStein** es, literalmente, un "monstruo de Frankenstein". Su **core**
(TuJsHtml, KageBunshin, TuContainer, RemoteModule) nace de la unificación de
múltiples librerías privadas internas, creadas y maduradas en proyectos
comerciales reales. Por eso, el código fuente del core **no vive en este repo**
— `/dist` es el artefacto compilado y distribuido desde esas fuentes privadas.

Los **Addons** son diferentes: módulos de extensión opcionales como `TuRouter`
que se desarrollan abiertamente en `/src/addons/`. Estos sí aceptan
contribuciones directas de código.

En resumen:

| Parte | Dónde vive | ¿Acepta PRs de código? |
|-------|-----------|----------------------|
| Core (`TuJsHtml`, `KageBunshin`, `TuContainer`, etc.) | Privado → compilado a `/dist` | Issues bienvenidos · PRs de código no |
| Addons (`TuRouter`, futuros addons) | `/src/addons/` | Sí |
| Documentación, ejemplos, tests | Este repo | Sí |

> Consultá [CONTRIBUTING.md](./CONTRIBUTING.md) para los detalles sobre cómo contribuir.

> [!WARNING]
> **Estado del Proyecto: Alpha** La arquitectura central es funcional, pero
> muchas de las guías y directrices para Inteligencia Artificial (AI Skills) son
> experimentales y no han sido sometidas a pruebas de estrés en producción.
> Úsalo bajo tu propio riesgo y espera posibles cambios

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0 - mira el archivo LICENSE para
más detalles.

## 📜 Créditos y Reconocimientos

**Skeleton UI**: Los estilos de carga utilizados en los ejemplos de Suspense
provienen de
[Skeleton Screen CSS](https://github.com/nullilac/skeleton-screen-css) por
nullilac (Licencia MIT).

**Agent Teams Lite (Gentle AI)**: La estructura, estandarización de Skills y
directrices para agentes de Inteligencia Artificial de este proyecto están
fuertemente inspiradas e impulsadas por el framework de
[Gentleman Programming (gentle-ai)](https://github.com/Gentleman-Programming/gentle-ai).
**Gemini Antigravity**: Reconocimiento a la IA de Google (Antigravity) por su
colaboración como Arquitecto de Software en la redacción, formalización de la
documentación y estandarización del ecosistema de Skills de FrankJStein.

## 🤖 Soporte para Agentes de IA (LLMs)

FrankJStein es una librería pensada para humanos, pero construida con una arquitectura clara que facilita la asistencia por Inteligencia Artificial. Si utilizas un Agente de IA para programar, puedes descargar nuestro **Pack de Skills** oficial para que el modelo comprenda instantáneamente los patrones, reglas y convenciones del framework.

### Instalación vía CLI (Recomendado)
Puedes instalar e inyectar todas las skills directamente en tu entorno de desarrollo usando el ecosistema de [skills.sh](https://skills.sh/):
```bash
npx skills add tuadmin/FrankJStein
```

### Descargas Directas
- **[Descargar IA Skills (ZIP)](https://github.com/tuadmin/FrankJStein/releases/latest/download/ia-frankjstein-skills.zip)**
- **[Contexto para LLMs (llms-full.txt)](https://github.com/tuadmin/FrankJStein/releases/latest/download/llms-full.txt)**
- **[Mapa de Documentación (llms.txt)](https://github.com/tuadmin/FrankJStein/releases/latest/download/llms.txt)**

---

## ❤️ Apoya el proyecto

Si FrankJStein te ha sido útil, considera apoyar su desarrollo. ¡Cada pequeña
contribución ayuda a mantener al monstruo con vida!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor_me-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/tuadmin)
