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
1. Permite un autocompletado y tipado perfecto en TypeScript, dándole conciencia plena al linter.
2. Evita la pérdida de rendimiento masiva que genera el escaneo profundo de dependencias implícitas.

```javascript
const sig1 = createSignal(10);
const sig2 = createSignal(20);

// Se declaran explícitamente y se inyectan en el callback al final
const total = createComputedSignal(sig1, sig2, (v1, v2) => v1 + v2);
```

## Funcionalidades Avanzadas y Origen del Nombre
El sistema recibe el nombre de **KageBunshin** (Clones de Sombra) debido a cómo maneja sus abstracciones experimentales: **`ReactiveDraft`** y **`ObservableDraft`**. 

La analogía es directa: permiten crear clones reactivos de estado que comparten la "experiencia" con la raíz, controlando estrictamente la memoria para evitar que queden estados huérfanos dando vueltas, y convergiendo todo de vuelta a la fuente de la verdad.
*(Estas implementaciones experimentales se encuentran en la definición `.d.ts` pero su uso en producción está a la espera de documentación madura).*

> **⚠️ Advertencia Arquitectónica**: Los Signals de FrankJStein **NO SON** iguales a los de React, SolidJS o TC39. **No poseen implicit watchers ni `effect()`**. Esto es por diseño para mantener el rendimiento al máximo.
