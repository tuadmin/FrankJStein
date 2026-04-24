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

FrankJStein se compone de módulos hiper-optimizados que puedes usar en conjunto
o por separado. Aquí tienes un ejemplo de cómo se ve la construcción de UI
usando `TuJsHtml`:

```javascript
import { createSignal, ELEMENT_UTIL as $, TuJsHtml } from "frankjstein";

const app = new TuJsHtml(function (tags) {
  const { div, h1, p, button } = tags;
  const contador = createSignal(0);

  div(() => {
    h1`Hola FrankJStein`;
    p`Clicks: ${contador}`;
    // Funciona pero no recomiendo
    /*button("Sumar", (_) => _().style = "margin-top: 10px;")[$].on(
            "click",
            () => contador.value++,
        );/**/
    button`sumar`.addEventListener("click", (e) => contador.value++);
    //button({style:{marginTop:"10px"}},'click')[$].on("click",e=>contador.value++)
  });
});

document.body.append(app);
```

## 📚 Documentación y Arquitectura (Hub)

Para mantener este archivo limpio, la documentación técnica exhaustiva, patrones
de arquitectura y guías se encuentran divididas por módulos. En un futuro, estos
archivos alimentarán nuestro GitHub Pages.

Además, te invitamos a explorar la carpeta `examples/` para ver el framework en
acción.

### Módulos y Subsistemas

- **[TuJsHtml (DOM Builder & UI)](./docs/tujshtml.md)**: Construcción de
  interfaces nativas, uso de Template Literals y manipulación de nodos de alto
  rendimiento.
- **[KageBunshin (Signals & Reactividad)](./docs/kagebunshin.md)**: Reactividad
  granular extrema, `createSignal` y tuplas mutables.
- **[TuContainer (Inyección de Dependencias)](./docs/tucontainer.md)**: El
  Kernel de DI para separar y aislar tu lógica de negocio de la vista usando
  `TuLazyInject`.
- **[RemoteModule (Web Workers)](./docs/remote.md)**: El puente de Workers para
  procesar tareas pesadas de CPU sin congelar el Main Thread.

> Te recomendamos encarecidamente escribir tus módulos consumiendo este
> framework en archivos `.ts` (o habilitar la validación vía JSDoc). El proyecto
> distribuye su archivo `frankjstein.d.ts` con tipados extremadamente estrictos.
> El linter de TypeScript te salvará horas alertándote si un parámetro de
> configuración está en la posición incorrecta o si estás mutando algo inválido.

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

## ❤️ Apoya el proyecto

Si FrankJStein te ha sido útil, considera apoyar su desarrollo. ¡Cada pequeña
contribución ayuda a mantener al monstruo con vida!

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor_me-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/tuadmin)
