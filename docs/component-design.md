# Diseño de Componentes en FrankJStein

FrankJStein no impone un sistema de componentes rígido. En su lugar, promueve un enfoque funcional basado en **Composición de Contextos** y **Soberanía del DOM**.

## 1. El Átomo Funcional (Pure Function)
La forma más eficiente de crear componentes reutilizables es mediante funciones puras que reciben el constructor `tags`.

### Estándar de Tipado (Clean JSDoc)
Para mantener el código elegante, define los tipos al inicio del archivo.

```javascript
/** @typedef {import("frankjstein").TuJsHtml.Types.Tags} Tags */

/**
 * @param {Tags} tags
 * @param {string} label
 */
export function MyButton(tags, label) {
    return tags.button({ className: "btn-primary" }, label);
}

/**
 * @param {Tags} tags
 * @param {string} label
 * @return {HTMLButtonElement}
 */
export function MyButtonDefault({'button.btn.btn-default':btn}, label) {
    return btn(label);
}
```

## 2. Componentes Inteligentes (Smart Components)
Cuando un componente necesita lógica de negocio, inyectamos servicios desde el `TuContainer` (DI) y usamos `Signals` para el estado local.

```javascript
import { createSignal, TuLazyInject } from "frankjstein";
import { IAuthService } from "../services/auth.js";

export function UserProfile(tags) {
    //ts : auth = TuLazyInject<IAuthService>(()=>IAuthService);
    const auth = TuLazyInject(()=>IAuthService);
    const user = createSignal(auth.currentUser);

    return tags.div({ className: "profile" }, (ctx) => {
        ctx.h2`Bienvenido, ${user}`;
        ctx.button({ "@on": { click: () => auth.logout() } }, "Salir");
    });
}
```

## 3. Matriz de Decisión: ¿Qué usar?

| Tipo | Herramienta | Cuándo usarlo |
| :--- | :--- | :--- |
| **UI Básica** | Función + `tags` | Botones, inputs, layouts simples. Máximo rendimiento. |
| **Estado Local** | Función + `Signals` | Contadores, formularios, toggles. |
| **Encapsulación** | `CustomElements` | Si necesitas Shadow DOM o interoperabilidad con otros frameworks. |
| **Lógica Global** | `TuContainer` | Autenticación, API Clients, State Stores compartidos. |

## 4. Custom Elements (Nativos)
FrankJStein se integra perfectamente con la API de Web Components. Puedes usar `TuJsHtml` dentro del `connectedCallback` de un elemento nativo.

```javascript
import { TuJsHtml } from "frankjstein";

class MyWidget extends HTMLElement {
    connectedCallback() {
        this.append(new TuJsHtml((tags) => {
            tags.p`Soy un Web Component nativo`;
        })); // Inyectamos el componente en 'this'
    }
}
customElements.define("my-widget", MyWidget);
```

## 5. Reglas de Oro para Componentes
1. **Propiedad de Contexto**: Siempre usa el `ctx` inyectado en los callbacks hijos para evitar corromper la jerarquía del DOM.
2. **Silo de Reactividad**: No mezcles lógica de red o de base de datos dentro del renderizado. Para eso están los **Servicios** en `TuContainer`.
3. **Inmutabilidad de Tags**: No intentes modificar el objeto `tags` global; úsalo solo para construir.

---
*FrankJStein: Arquitectura para el rendimiento, libertad para el desarrollador.*
