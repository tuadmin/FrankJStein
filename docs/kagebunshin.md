# KageBunshin (Signals & Reactividad)

`KageBunshin` es el nombre en código para el subsistema de reactividad en FrankJStein. Está basado fuertemente en el concepto moderno de **Signals**, proveyendo reactividad granular pura (Fine-grained reactivity) que aniquila la necesidad del ciclo de reconciliación de un Virtual DOM.

## El Concepto de Reactividad Granular
Cuando un Signal cambia, no "re-renderiza un componente". Simplemente muta directamente el atributo HTML específico o el nodo de texto (TextNode) con el que fue linkeado en el DOM. Esto resulta en operaciones de costo `O(1)` en tiempo real.

## Uso Básico

### Creación (`createSignal`)
```javascript
import { createSignal } from "frankjstein";
const contador = createSignal(0);
```

### Mutación Directa vs Tuplas
Puedes mutar el valor usando la propiedad `.value`:
```javascript
contador.value = 1;
```
O puedes desestructurarlo para conseguir inmutabilidad referencial a través de la propiedad nativa `.asTuple` (útil si prefieres el estilo setter clásico):
```javascript
const [getContador, setContador] = contador.asTuple;
setContador(getContador() + 1);
```

## Computados (`createComputedSignal`)
A diferencia de React, Vue o las propuestas actuales de TC39 donde los computed tienen "watchers automáticos mágicos", en FrankJStein **las dependencias deben declararse explícitamente como argumentos antes del callback**. 

Esto tiene dos beneficios brutales:
1. **Rendimiento O(1)**: El motor sabe exactamente a qué suscribirse sin escaneo profundo de dependencias implícitas (que es costoso).
2. **Conciencia del Linter**: Autocompletado y validación perfecta de los valores inyectados en el callback.

```javascript
const sig1 = createSignal(10);
const sig2 = createSignal(20);

// Declaración explícita -> Inyección en el callback
const total = createComputedSignal(sig1, sig2, (v1, v2) => v1 + v2);
```

## La Frontera Signal-UI (Sin Effects)
A diferencia de otros frameworks, los Signals de FrankJStein **no tienen una función `effect()`** genérica por diseño. La reactividad se consume de dos formas:

1. **Inyección en el DOM (Vía TuJsHtml)**: Al pasar un Signal a un Tagged Template (ej: `` tags.p`${count}` ``), el framework crea automáticamente un vínculo granular.
2. **Suscripción Manual**: Para efectos secundarios no-visuales (logs, sincronización externa), usa `.subscribe()`.

```javascript
// ✅ Correcto para UI (Granular y Automático)
tags.p`Contador: ${count}`;

// ✅ Correcto para efectos secundarios (Manual)
count.subscribe(val => console.log("Cambió a:", val));
```

## Objetos Reactivos (`createKageBunshinObject`)

Cuando tienes un objeto grande o complejo y no quieres crear un Signal por cada propiedad, `createKageBunshinObject` crea un clon Proxy que sincroniza todas las instancias en tiempo real.

### El Patrón de Nodo Reactivo ($)

Para mantener el rendimiento y la claridad, las propiedades de un objeto Bunshin se dividen en dos:
1.  **`clon.power`**: Devuelve el valor primitivo (Snapshot). **NO** es reactivo en la UI.
2.  **`clon.$power`**: Devuelve un **Signal** vinculado a esa propiedad. Es lo que debes usar en `TuJsHtml` para que la UI se actualice sola.

```javascript
import { createKageBunshinObject } from "frankjstein";

const naruto = { name: "Naruto", power: 10 };
const clon = createKageBunshinObject(naruto);

// ✅ Reactivo: Se actualizará solo cuando cambie el poder
tags.p`Poder actual: ${clon.$power}`;

// Mutación sincronizada (DEBE hacerse siempre en el clon)
// Esto dispara los signals y actualiza el objeto raíz 'naruto'
clon.power = 9000; 
```

## Borradores e Inmutabilidad (`ReactiveDraft`)

Basado en la misma tecnología de Proxies, `ReactiveDraft` permite crear una copia aislada de un objeto para edición (como un formulario). Los cambios permanecen en el "clon de sombra" y solo viajan al objeto original cuando se llama explícitamente a `.update()`.

*(Esta implementación es el precursor de la convergencia de estado en arquitecturas complejas).*

> [!CAUTION]
> **Advertencia Arquitectónica**: Los Signals de FrankJStein **NO SON** iguales a los de React, SolidJS o la propuesta actual de TC39. **No poseen implicit watchers ni `effect()` automáticos**. 
> Si vienes de otros frameworks, evita el error de intentar usar reactividad implícita. Aquí todo es explícito y granular para garantizar el máximo rendimiento y control total sobre el Event Loop.
