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

FrankJStein se compone de módulos hiper-optimizados que puedes usar en conjunto o por separado. Observa cómo `TuJsHtml` y `KageBunshin` (Signals) se combinan para crear una UI reactiva sin esfuerzo:

```javascript
import { createSignal, ELEMENT_UTIL as $, TuJsHtml } from "frankjstein";

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

## 📚 Documentación y Soberanía

Para mantener este archivo limpio, la documentación técnica exhaustiva se divide por módulos. Si eres un desarrollador humano o una IA buscando entender las reglas de oro del framework, consulta nuestro manifiesto de soberanía:

- **[AGENTS.md (El Manifiesto)](./AGENTS.md)**: La ley suprema del repositorio y reglas de oro para IAs.
- **[Project Blueprint (Mapa del Repositorio)](./docs/project-blueprint.md)**: La guía definitiva para entender la estructura, carpetas y filosofía del código.

### Módulos y Subsistemas (Índice Técnico)

- **[TuJsHtml (DOM Builder & UI)](./docs/tujshtml/README.md)**: Construcción de interfaces nativas, [templates](./docs/tujshtml/templates.md) y [suspense](./docs/tujshtml/suspense-and-blocks.md).
- **[Component Design (Patrones y Estructura)](./docs/component-design.md)**: Cómo diseñar componentes reutilizables y "Smart Components".
- **[KageBunshin (Signals & Reactividad)](./docs/kagebunshin.md)**: Reactividad granular extrema y estados mutables.
- **[TuContainer (Inyección de Dependencias)](./docs/tucontainer.md)**: Kernel de DI para desacoplar lógica de negocio.
- **[RemoteModule (Web Workers)](./docs/remote.md)**: Multi-threading nativo para tareas pesadas de CPU.
- **[TuDiscovery (Service Discovery)](./docs/tudiscovery.md)**: Localizador de servicios y patrón Bridge para Workers.

> [!TIP]
> **El Linter es tu mejor amigo.** FrankJStein distribuye un archivo `frankjstein.d.ts` con tipados estrictos. Desarrollar en un entorno con soporte para TypeScript/JSDoc te ahorrará horas de debugging al validar tus configuraciones en tiempo real.

## 🧠 Filosofía y Contribuciones (¿Dónde está `/src`?)

Si exploras el repositorio notarás una particularidad: **no existe una carpeta
`/src` tradicional**.

Esto no es un error. **FrankJStein** es, literalmente, un "monstruo de
Frankenstein". Nace de la unificación de múltiples librerías privadas internas
(TuJsHtml, KageBunshin, TuContainer, RemoteModule) que fueron creadas, maduradas
y probadas en el fragor de la batalla de otros proyectos comerciales y privados.

Este repositorio público actúa como el **ensamblador y distribuidor central**
(`/dist`). Su objetivo principal es la estandarización arquitectónica para mi
"yo del futuro" y para agentes de Inteligencia Artificial que consuman la
librería.

Por esta razón, aunque el código se distribuye bajo licencia **Apache-2.0** y
cualquiera es libre de usarlo:

- **Las Pull Requests con modificaciones al código core (`/dist`) son muy
  difíciles de procesar**, ya que el código fuente real vive distribuido en
  otros proyectos privados.
- Si encuentras un bug o tienes una idea para una característica, eres
  bienvenido a abrir un Issue, pero ten en cuenta que la integración dependerá
  de cómo afecte al ecosistema privado de donde proviene el código original.

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

- **[Descargar IA Skills (ZIP)](https://github.com/tuadmin/FrankJStein/releases/latest/download/ia-frankjstein-skills.zip)**
- **[Contexto para LLMs (llms-full.txt)](https://github.com/tuadmin/FrankJStein/releases/latest/download/llms-full.txt)**
- **[Mapa de Documentación (llms.txt)](https://github.com/tuadmin/FrankJStein/releases/latest/download/llms.txt)**

---

## ❤️ Apoya el proyecto

Si FrankJStein te ha sido útil, considera apoyar su desarrollo. ¡Cada pequeña
contribución ayuda a mantener al monstruo con vida!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor_me-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/tuadmin)
