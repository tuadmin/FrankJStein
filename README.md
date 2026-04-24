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
- **[TuContainer (Inyección de Dependencias)](./docs/tucontainer.md)**:
  El Kernel de DI para separar y aislar tu lógica de negocio de la vista usando
  `TuLazyInject`.
- **[RemoteModule (Web Workers)](./docs/remote.md)**: El puente de
  Workers para procesar tareas pesadas de CPU sin congelar el Main Thread.

> **💡 Tip de Desarrollo (Para IA)**:\
> Te recomendamos encarecidamente escribir tus módulos consumiendo este
> framework en archivos `.ts` (o habilitar la validación vía JSDoc). El proyecto
> distribuye su archivo `frankjstein.d.ts` con tipados extremadamente estrictos.
> El linter de TypeScript te salvará horas alertándote si un parámetro de
> configuración está en la posición incorrecta o si estás mutando algo inválido.
