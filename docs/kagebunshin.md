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

### Sincronización Bidireccional
Por defecto, la reactividad es **de salida** (Signal -> DOM). Para habilitar la sincronización bidireccional (DOM -> Signal), FrankJStein utiliza directivas en el motor de renderizado. Consulta la documentación de [TuJsHtml: Directivas @bind](./tujshtml/README.md#directivas-especiales-) para más detalles.

## Trampas de Reactividad (Identidad Referencial)

KageBunshin compara los valores de los Signals mediante **identidad estricta (`===`)** por razones de rendimiento. Si actualizas un Signal con la **misma referencia de memoria** de un array u objeto, el motor asume que no hubo cambios y **no actualizará la UI**, aunque hayas mutado sus propiedades internas.

```javascript
const itemsSignal = createSignal([]);

// ❌ ERROR: Mutar el array original y asignarlo de nuevo
const data = itemsSignal.value;
data.push("Nuevo item");
itemsSignal.value = data; // Kagebunshin dice: data === data -> SKIPS UPDATE

// ✅ SOLUCIÓN: Forzar una nueva referencia (Spread)
itemsSignal.value = [...data];
```
*(Nota: Para evitar el costo de memoria de clonar arrays gigantes, considera usar el patrón `Version Signal` donde solo incrementas un contador cuando la data subyacente muta).*


## Objetos Reactivos (`createKageBunshinObject`)

Cuando tienes un objeto grande o complejo y no quieres crear un Signal por cada propiedad, `createKageBunshinObject` crea un clon Proxy que sincroniza todas las instancias en tiempo real.

### El Patrón de Nodo Reactivo ($)

Para mantener el rendimiento y la claridad, las propiedades de un objeto Bunshin se dividen en dos:
1.  **`clon.power`**: Devuelve el valor primitivo (Snapshot). **NO** es reactivo en la UI.
2.  **`clon.$power`**: Devuelve un **Nodo de Suscripción (Subscribable)**. Es un objeto que posee un método `.subscribe()` y `.once()`. 

> [!IMPORTANT]
> **Diferencia con Signals**: A diferencia de un Signal estándar, los nodos `$` **NO tienen la propiedad `.value`**. Son conductos de eventos reactivos optimizados para ser pasados directamente a `TuJsHtml`.

```javascript
import { createKageBunshinObject } from "frankjstein";

const naruto = { name: "Naruto", power: 10 };
const clon = createKageBunshinObject(naruto);

// ✅ Correcto: Pasa el nodo directamente a la UI
tags.p`Poder actual: ${clon.$power}`;

// ❌ ERROR: Los nodos '$' no tienen .value
// console.log(clon.$power.value); 

// ✅ DISPARADOR DE REACTIVIDAD (Trigger): 
// La mutación SIEMPRE debe hacerse sobre el clon. Al asignar un valor, 
// el motor detecta el cambio y dispara automáticamente los nodos '$'.
clon.power = 9000; 

// ❌ ERROR: Mutar el objeto raíz no dispara la reactividad.
// naruto.power = 9000; 
```

## Borradores e Inmutabilidad (`ReactiveDraft`)

Basado en la misma tecnología de Proxies, `ReactiveDraft` permite crear una copia aislada de un objeto para edición (como un formulario). Los cambios permanecen en el "clon de sombra" y solo viajan al objeto original cuando se llama explícitamente a `.update()`.

*(Esta implementación es el precursor de la convergencia de estado en arquitecturas complejas).*

> [!CAUTION]
> **Advertencia Arquitectónica**: Los Signals de FrankJStein **NO SON** iguales a los de React, SolidJS o la propuesta actual de TC39. **No poseen implicit watchers ni `effect()` automáticos**. 
> Si vienes de otros frameworks, evita el error de intentar usar reactividad implícita. Aquí todo es explícito y granular para garantizar el máximo rendimiento y control total sobre el Event Loop.

## La Trampa del Proxy (MANDATORIO)
Casi todas las herramientas de KageBunshin (`createKageBunshinObject`, `TuLazyInject`, etc.) devuelven un **Proxy**. 
- **Regla**: El Proxy se comporta como el objeto real para accesos a propiedades y llamadas a métodos.
- **Limitación CRÍTICA**: Los chequeos de identidad como `instanceof` **fallarán**. 
    - *Prueba Empírica*: Un objeto creado con `createKageBunshinObject(realUser)` devolverá `false` al hacer `instanceof User`.
    - *Razón*: El Proxy es una entidad distinta que no preserva la cadena de prototipos nativa para el operador `instanceof`. 
- **Solución**: Si necesitas validación de tipos estricta, usa propiedades de marca o el constructor directamente (`obj.constructor === User`).
