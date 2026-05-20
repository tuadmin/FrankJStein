# Disposable (Gestión de Memoria)

Para aplicaciones robustas y de largo aliento (como SPAs pesadas o procesos en segundo plano), la gestión de memoria y el "cleanup" (limpieza de recursos) es un aspecto crítico.

FrankJStein provee una arquitectura estandarizada de gestión de memoria basada en el patrón `IDisposable` y el reciente estándar nativo de JavaScript `Symbol.dispose` a través del módulo central `TuCore/v1/Disposable.js`.

## ¿Por qué usar Disposable?

Cuando creás servicios, controladores o componentes UI que:
1. Registran Listeners de eventos en el DOM (ej. `window.addEventListener`).
2. Tienen ciclos recursivos como `setInterval` o `requestAnimationFrame`.
3. Instancian sub-componentes u otras clases complejas.
4. Establecen conexiones Websocket.

Si esos componentes son destruidos (ej. el usuario cambia de ruta en el Router), **sus eventos o timers seguirán vivos en memoria**, causando memory leaks severos (Zombis).

## La Clase Abstracta `Disposable`

Extendiendo la clase base `Disposable`, podés vincular todos los sub-recursos al ciclo de vida principal de tu clase, garantizando que se limpien en cascada de forma automática.

```javascript
import { Disposable } from "frankjstein";

class MyController extends Disposable {
    constructor() {
        super();
        
        // 1. Registrando otro componente Disposable
        this.socket = this._register(new WebSocketService());

        // 2. Registrando un timer o función manual
        const interval = setInterval(() => this.tick(), 1000);
        this._register({ dispose: () => clearInterval(interval) });
    }

    tick() {
        // Buena práctica asíncrona: abortar si ya fue destruido
        if (this.isDisposed) return;
        console.log("Tick!");
    }
}
```

### Limpieza (El método `dispose`)

Cuando necesites matar a tu controlador, simplemente llamas a `.dispose()`.
El controlador cambiará `this.isDisposed` a `true` y llamará en cascada al `dispose()` (o `[DISPOSE]()`) de **todos** los recursos que hayas registrado previamente mediante `_register()`.

```javascript
const controller = new MyController();

// Más tarde, cuando el controlador ya no se usa:
controller.dispose();
// ¡Automáticamente se limpia el WebSocketService y el setInterval!
```

## `DisposableStore` (El Coleccionista)

Si no puedes heredar de la clase `Disposable` (porque ya heredas de otra), puedes usar el motor interno directamente: el `DisposableStore`.

```javascript
import { DisposableStore, DISPOSE } from "frankjstein";

class LegacyClass extends AnotherFramework {
    #disposables = new DisposableStore();

    init() {
        this.#disposables.add(new SomeSubComponent());
        this.#disposables.add({ dispose: () => console.log("Limpio!") });
    }

    destroy() {
        // Ejecuta la limpieza de todos los recursos almacenados
        this.#disposables.dispose(); // O equivalentemente this.#disposables[DISPOSE]()
    }
}
```

## Compatibilidad e Idempotencia

- **Soporte Nativo y Fallback (`DISPOSE`)**: El símbolo exportado `DISPOSE` actúa como un puente de compatibilidad. Internamente usa `Symbol.dispose` nativo (introducido en el nuevo estándar ECMAScript de Resource Management). Si el entorno (como navegadores antiguos) no lo soporta, genera un símbolo de fallback (`Symbol.for("Symbol.dispose")`). Esto permite modernizar tu código hoy sin romper entornos viejos.
- **Idempotencia**: Llamar a `dispose()` múltiples veces sobre la misma instancia es 100% seguro. Sólo se ejecutará la rutina de limpieza la primera vez.
- **Fail-Fast**: La función `add` (y `_register`) valida en tiempo real si el objeto que pasaste tiene un método de limpieza válido (`dispose` o `[DISPOSE]`). Si le pasas algo inválido, explotará inmediatamente, evitando bugs silenciosos.
- **Tolerancia a Fallos**: Cuando se destruye una colección de recursos, si uno de ellos explota y tira un `Error`, la clase `Disposable` lo atrapa y continúa destruyendo al resto de sus hermanos.

### Integración con TuScope

Todos los `TuScope` creados por el framework de Inyección de Dependencias de FrankJStein son por naturaleza `Disposable`. Cuando destruís un Scope (e.g. `routerScope.dispose()`), el Scope limpiará sus dependencias y vaciará su caché.
