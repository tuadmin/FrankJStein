# TuDiscovery: Localizador de Servicios Funcional

`TuDiscovery` es una utilidad liviana basada en Proxies diseñada para centralizar las importaciones de módulos y proporcionar carga perezosa (lazy loading) con resolución en modo dual (Promesa/Callback).

## El "Por qué" (Contexto Arquitectónico)

La razón principal de la existencia de `TuDiscovery` NO es suplantar a los Import Map Aliases (`#/`, `@/`) en tu aplicación principal, sino resolver la **"Infección de Alias"** en Web Workers y entornos multihilo.

### El Problema: Aislamiento del Contexto del Worker
Los Web Workers se ejecutan en un contexto de ejecución separado. En muchos entornos (navegadores nativos, ciertos runtimes), el Worker **no hereda el Import Map** definido en el documento HTML principal. Si tu código o cualquiera de sus dependencias usa un alias como `#utils/math.js`, el Worker fallará al intentar resolverlo.

## La Regla del "Grafo sin Alias" (CRITICO)

Al usar `TuDiscovery` para proveer módulos a un **Worker/RemoteModule**, debes seguir esta regla:

> **Todo el grafo de dependencias de un módulo registrado en un hub de TuDiscovery destinado a un Worker DEBE estar libre de Import Map Aliases.**

## El Patrón "Bridge" (Hub como punto de entrada único)

Para maximizar la seguridad en Workers, se recomienda que el archivo donde defines el `Hub` actúe como un puente, re-exportando las utilidades de `FrankJStein` necesarias. De esta forma, el Worker solo importa el Hub y nada más.

### 1. Definir el Hub y el Bridge
```javascript
// src/core/hub.js
// Importamos usando rutas RELATIVAS reales
import { TuDiscovery, Remote } from "./frankjstein.js"; 

export const Hub = TuDiscovery.create({
    math: () => import("../utils/math.js"),
    auth: () => import("../services/auth.js")
});

// Re-exportamos utilidades para que el Worker no tenga que buscarlas
export { Remote };
```

### 2. Consumo Simplificado en el Worker
```javascript
// src/workers/heavy-task.js
// El Worker SOLO importa el Hub. Sin alias, sin dependencias externas.
import { Hub, Remote } from "../core/hub.js";

export class HeavyTask extends Remote.Simple {
    async run() {
        // Resolución segura y aislada
        const math = await Hub.math;
        return math.complexCalc();
    }
}
HeavyTask.register(import.meta);
```

## Modos de Consumo

- **Promesa (Awaitable)**: `const m = await Hub.math;`
- **Callback (Lazy)**: `Hub.math(m => m.doSomething());`
- **Verificación**: `await Hub.$verify();` (Úsalo durante el desarrollo para validar que todas las rutas del grafo sean resolubles).

## ¿Cuándo usarlo?

| Caso de Uso | Recomendación |
| :--- | :--- |
| **Hilo Principal (UI)** | Usa **Import Map Aliases** (#/@) normalmente. |
| **Workers / RemoteModule** | **Obligatorio** usar `TuDiscovery` y el patrón Bridge. |
| **Módulos Críticos** | Recomendado para módulos que requieran pruebas de humo (`.$verify()`). |

---

*FrankJStein: El rendimiento es lo primero, la arquitectura es la base.*
