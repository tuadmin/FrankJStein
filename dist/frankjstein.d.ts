/*!
 * Author: @tuadmin (Victor Choque)
 * Copyright 2025 Victor Choque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference lib="dom" />

/**
 * Describe el tipo de la función retornada por `repeatCall`.
 * Es una función que, al ser llamada, se devuelve a sí misma.
 * @internal - Este tipo es un detalle de implementación y no debe ser usado directamente.
 */
type Repeatable<F extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<F>): Repeatable<F>;
};
/**
 * @version 1.0.0
 */
declare class TUtils {
  /**
   * Creates a cached async function that executes only once, returning the same result on subsequent calls.
   * Ideal for lazy-loading resources (dynamic imports, fetch calls, etc.) that should be singleton-like.
   *
   * @template T - The type of the resolved promise value
   * @param {(...args: unknown[]) => Promise<T>} asyncFn - The async function to cache
   * @returns {(...args: unknown[]) => Promise<T>} A function with the same signature that caches the result
   *
   * @example // Dynamic import
   * //// @ type {(id: string) => Promise<{ name: string }>}
   * const loadLib = TUtils.cachedAsync(() => import('heavy-library'));
   * const lib = await loadLib(); // Executes once
   *
   * @example // API Fetch
   * const fetchData = TUtils.cachedAsync(() => fetch('/data').then(r => r.json()));
   */
  static cachedAsync<T>(asyncFn: (...args: unknown[]) => Promise<T>): (...args: unknown[]) => Promise<T>;
  /**
   * Creates a cached async function that stores results by argument signature.
   *
   * @template T - Return type of the async function
   * @template {unknown[]} Args - Array type for the arguments (must be array-like)
   * @param {(...args: Args) => Promise<T>} asyncFn - Async function to cache
   * @param {(...args: unknown[]) => string} [keyFn] - Optional function to generate cache keys
   * @returns {(...args: Args) => Promise<T>} Memoized function
   * @example
   *
   * const fetchPokemon = TUtils.cachedAsyncByArgs(
   *   ////@ type {(id: number) => Promise<{ name: string }>}
   *   (id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json()),
   *   ([id]) => `pokemon_${id}` // Cache key basada en el ID
   *   );

   *   // Solo una llamada real por ID
   *   const pikachu = await fetchPokemon(25);
   *   const pikachuCached = await fetchPokemon(25); // ⚡ Usa caché
   */
  static cachedAsyncByArgs<T, Args extends unknown[]>(asyncFn: (...args: Args) => Promise<T>, keyFn?: (...args: unknown[]) => string): (...args: Args) => Promise<T>;
  /**
   * Ejecuta un callback de forma asíncrona, priorizando microtareas.
   *
   * @param {Function} callback - La función que se desea ejecutar.
   * @param {boolean} [isMacroTask] - use true to force a macrotask(setTimeout) instead queueMicrotask
   * una macrotarea (setTimeout) en lugar de una microtarea (queueMicrotask).
   * Útil para tareas de baja prioridad que no deben bloquear el renderizado.
   */
  static scheduleTask(callback: () => void, isMacroTask?: boolean): void;
  /**
   * Transforma una función en una versión que puede ser llamada consecutivamente.
   * Cada llamada ejecuta la función original y devuelve a sí misma para permitir la siguiente invocación.
   *
   * @template F El tipo de la función que se va a hacer repetible.
   * @param fn La función a ejecutar en cada llamada.
   * @returns Una nueva función que puede ser llamada en cadena.
   */
  static repeatCall<F extends (...args: unknown[]) => unknown>(fn: F): Repeatable<F>;

  /**
  * Define una propiedad 'lazy' en un objeto. Su valor es calculado solo al ser accedido por primera vez.
  * @param {object} obj - El objeto en el que se definirá la propiedad.
  * @param {string} key - El nombre de la propiedad.
  * @param {function} getterFn - La función que retorna el valor final de la propiedad.
  */
  static defineLazyPropertyGetter(obj: object, key: string, getterFn: () => unknown): void;
  /**
   * Crea una pausa asíncrona que puede ser cancelada inmediatamente mediante un AbortSignal.
   * @param {number} ms - Tiempo de espera en milisegundos.
   * @param {AbortSignal} [signal] - Señal opcional para abortar la espera.
   * @returns {Promise<void>} Se resuelve cuando el tiempo expira o se rechaza si se aborta.
   * @throws {DOMException} Rechaza con un "AbortError" si la señal se dispara.
   * @example
   * // Uso básico
   * await sleepAsync(1000);
   * @example
   * // Uso con cancelación (se detiene a los 500ms)
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 500);
   * try {
   *     await sleepAsync(2000, controller.signal);
   * } catch (e) {
   *     console.log("Espera cancelada");
   * }
   */
  static sleepAsync(ms: number, signal?: AbortSignal): Promise<void>;
  /**
   * Convierte cualquier Promesa en una tupla [error, data].
   */
  static safe<T, E = unknown>(
    promise: Promise<T>
  ): Promise<[E, null] | [null, T]>;
}

/**
 * El objeto enriquecido que devuelve un constructor de plantillas tipadas.
 * @template TSlotMap El tipo del mapa de slots, usado para tipar la propiedad `slots`.
 */
type TypedTemplate<TSlotMap extends Record<string, string>> = {
    root: HTMLElement | DocumentFragment;
    /** Un objeto con referencias directas a los elementos marcados como slots. */
    slots: { [K in keyof TSlotMap]: HTMLElement };
};
interface ForEachAsyncResult {
    /** Cantidad de elementos procesados. */
    processed: number;
    /** Total de elementos en la colección original. */
    total: number;
    /** True si se procesó toda la lista, false si hubo un `break`. */
    completed: boolean;
    /** Tiempo total de ejecución en milisegundos. */
    elapsedTime: number;
}
interface ForEachAsyncOptions<T> {
    /** 
     * Es más seguro. Si el usuario procesa 1,000 archivos y el primero falla por falta de permisos, lo más probable es que los otros 999 también fallen. Detenerse ahorra recursos y evita logs infinitos de errores.
     * @default true 
     */
    stopOnError?: boolean;
    /** * Cantidad de elementos a procesar antes de ceder el hilo al navegador.
     * @default 10 
     */
    batchSize?: number;
    /** Señal para cancelar la ejecución de forma externa. */
    signal?: AbortSignal;
    /** Callback que se dispara al finalizar cada lote, ideal para barras de progreso. */
    onBatchComplete?: (index: number, total: number, percentage: number) => void;
    /** Se ejecuta cada vez que un ítem falla, permitiendo auditoría o logs. */
    onItemError?: (error: unknown, item: T, index: number) => void;
    /** * Si es true, utiliza `requestIdleCallback` para procesar solo cuando el navegador esté libre.
     * @default false 
     */
    useIdle?: boolean;
}
/**
 * Error enriquecido que contiene el estado de la iteración en el momento del fallo.
 */
declare class ForEachAsyncError extends Error {
    /** El estado capturado justo antes de lanzar la excepción. */
    state: ForEachAsyncResult;
    /** El error original que causó la interrupción. */
    cause?: unknown;
    constructor(message: string, state: ForEachAsyncResult, cause?: unknown);
}

/**
 * Tupla de retorno para el patrón Safe (Error-First).
 * Si hay error, el segundo elemento es null. Si hay éxito, el primero es null.
 */
type SafeForEachAsyncResult =
    | [null, ForEachAsyncResult]
    | [ForEachAsyncError, null];


/**
 * Función procesadora para cada ítem de la colección.
 * Puede ser síncrona o asíncrona.
 * @returns Opcionalmente una función de "limpieza" o "efecto" que se ejecutará 
 * en el siguiente frame de renderizado (requestAnimationFrame).
 * - `void`: Continúa con el siguiente elemento.
 * - `false`: Detiene la ejecución de la colección inmediatamente (Break).
 * - `() => void`: Función de efecto/limpieza que se ejecutará en el siguiente `requestAnimationFrame`. 
 */
type ItemProcessor<T> = (
    item: T,
    index: number
) => void | false | Promise<void | false> | (() => void) | Promise<(() => void)>;


/**
 * Opciones para el comportamiento del estrangulamiento (throttle).
 */
interface ThrottleOptions {
    /** * Ejecutar la función inmediatamente en el primer disparo.
     * @default true 
     */
    leading?: boolean;
    /** * Ejecutar una última vez tras el último disparo si el delay ya pasó.
     * @default true 
     */
    trailing?: boolean;
}

declare namespace TuWebUtils {
    /**
     * Observa un elemento HTML hasta que sea visible por primera vez.
     * Devuelve una Promise que se resuelve cuando el elemento es montado y visible.
     * @param {HTMLElement} element El elemento a observar.
     * @returns {Promise<HTMLElement>}
     */
    function whenVisibleAsync(element: HTMLElement): Promise<HTMLElement>;
    /**
     * Compila un string de HTML en un constructor de plantillas de alto rendimiento,
     * proporcionando seguridad de tipos y validación para los slots definidos.
     *
     * @template TSlotMap Un tipo que extiende un objeto de strings.
     * @param slotMap Un objeto que define el contrato de los slots.
     * La clave es el nombre que se usará en JS, el valor es el nombre en `data-slot`.
     * @param htmlString La estructura HTML a usar como plantilla.
     * @returns {() => TypedTemplate<TSlotMap>} Una función constructora tipada.
     */
    function createTemplate<TSlotMap extends Record<string, string>>(
        slotMap: TSlotMap,
        htmlString: string
    ): () => TypedTemplate<TSlotMap>;
    /**
     * Extrae los datos de un formulario a un objeto JSON,
     * respetando el formato de array (name="campo[]").
     * Antes de serializar, fuerza la validación nativa del formulario.
     * @param {HTMLFormElement} formElement El elemento del formulario a serializar.
     * @returns {object | null} El objeto JSON con los datos del formulario, o null si la validación falla.
     */
    function formToObject<T extends object>(formElement: HTMLFormElement, storeIn?: T): T | null;

    /**
     * Procesa colecciones masivas mediante Time Slicing sin bloquear la UI.
     * Soporta cualquier iterable (Array, Set, Map) o ArrayLike.
     * @throws {ForEachAsyncError}
     * @example
     * // Sobrecarga 1: Uso estándar (Ideal para lógica corta)
     * await forEachAsync(myItems, (item, i) => {
     *    console.log(`Procesando ${item.id}`);
     * }, { batchSize: 50 });
     * 
     * @example
     * // Sobrecarga 3: Uso de Idle (Ideal para tareas de fondo no urgentes)
     * // Úsalo para procesar logs, analíticas o pre-cargar datos sin afectar el scroll o animaciones.
     * await forEachAsync(hugeCollection, (data) => {
     *    backgroundProcess(data);
     *    if(data.id==='id5') return false;
     * }, { 
     *    useIdle: true, 
     *    batchSize: 500 
     * });
     */
    function forEachAsync<T>(
        collection: Iterable<T> | ArrayLike<T>,
        callback: ItemProcessor<T>,
        options?: ForEachAsyncOptions<T>
    ): Promise<ForEachAsyncResult>;

    /**
     * Procesa colecciones masivas mediante Time Slicing sin bloquear la UI (Firma invertida).
     * Soporta cualquier iterable (Array, Set, Map) o ArrayLike.
     * @throws {ForEachAsyncError}
     * @example
     * // Sobrecarga 2: Configuración primero (Ideal para callbacks extensos)
     * await forEachAsync(myItems, { batchSize: 100, signal }, async (item) => {
     * const extraData = await fetch(`./api/${item.id}`);
     *     renderRow(item, extraData);
     * });
     */
    function forEachAsync<T>(
        collection: Iterable<T> | ArrayLike<T>,
        options: ForEachAsyncOptions<T>,
        callback: ItemProcessor<T>
    ): Promise<ForEachAsyncResult>;

    /**
     * Ejecuta forEachAsync garantizando que no lanzará excepciones.
     * @see forEachAsync - Para ver la documentación detallada de los parámetros.
     */
    function safeForEachAsync<T>(
        collection: Iterable<T> | ArrayLike<T>,
        callback: ItemProcessor<T>,
        options?: ForEachAsyncOptions<T>
    ): Promise<SafeForEachAsyncResult>;

    function safeForEachAsync<T>(
        collection: Iterable<T> | ArrayLike<T>,
        options: ForEachAsyncOptions<T>,
        callback: ItemProcessor<T>
    ): Promise<SafeForEachAsyncResult>;
    /**
     * Crea una versión de la función que, al ser invocada repetidamente, 
     * solo ejecuta la original como máximo una vez cada 'wait' milisegundos.
     * * @example
     * // Actualizar scroll con alto rendimiento
     * const onScroll = throttle((e) => {
     *    console.log("Posición:", window.scrollY);
     * }, 100);
     * window.addEventListener('scroll', onScroll);
     * @template T - El tipo de la función original.
     * @param fn - Función a la que se le aplicará el throttle.
     * @param wait - Tiempo de espera en milisegundos.
     * @param options - Configuración de leading/trailing.
     * @returns  Una función con la misma firma que la original.
     * 
     */
    function throttle<T extends (...args: unknown[]) => unknown>(
        fn: T,
        wait: number,
        options?: ThrottleOptions
    ): (...args: Parameters<T>) => void;


    /**
     * Crea una versión de la función que retrasa su ejecución hasta que hayan pasado
     * 'wait' milisegundos desde la última vez que fue invocada.
     * * @example
     * // Filtrar una lista masiva solo cuando el usuario deja de escribir
     * const search = debounce((query: string) => {
     *    console.log("Buscando:", query);
     * }, 300);
     * input.oninput = (e) => search(e.target.value);
     * @template T - Tipo de la función original.
     * @param fn - Función a de-rebotar.
     * @param wait - Tiempo de espera en milisegundos.
     * @param immediate - Si es true, dispara la función al inicio de la ráfaga.
     * @returns Una función con la misma firma que la original pero con lógica de rebote.
     */
    function debounce<T extends (...args: unknown[]) => unknown>(
        fn: T,
        wait: number,
        immediate?: boolean
    ): (...args: Parameters<T>) => void;

    /**
     * Convierte cualquier Promesa en una tupla [error, data].
     */
    function safe<T, E = unknown>(
        promise: Promise<T>
    ): Promise<[E, null] | [null, T]>;
}

// === Utility Types ===
type FunctionGeneric$3 = (...args: unknown[]) => unknown
type ObjectGeneric$2 = { [key: string]: unknown };
/**
 * Represents a function that can be called to cancel a subscription.
 */
type UnsubscribeFunction$1 = () => void;

/**
 * A utility type that extracts the keys of T whose values are not functions.
 */
type KeysWithoutFunctions$2<T> = {
  [K in keyof T]: T[K] extends FunctionGeneric$3 ? never : K
}[keyof T];

/**
 * Obtiene una unión de todas las claves de un tipo `T` cuyas propiedades NO son una función.
 */
type KeysWithoutFunctions$1<T> = {
    [K in keyof T]: T[K] extends FunctionGeneric$3 ? never : K
}[keyof T];
declare namespace KageBunshin {
    export type IsAliveCallback = () => boolean;
    export type ListenerCallback = (...args: unknown[]) => void
    export type UnsubscribeFunction = () => void;
    export type SubscriberAPI = {
        /**
         * Listen Event
         * @param {ListenerCallback} callback - La función a ser llamada cuando se dispare el evento.
         * @returns {UnsubscribeFunction} Una función para eliminar el listener.
         */
        on: (callback: ListenerCallback) => UnsubscribeFunction;
        /**
         * Listen Once
         * @param {ListenerCallback} callback - La función a ser llamada cuando se dispare el evento.
         * @returns {UnsubscribeFunction} Una función para eliminar el listener.
         */
        once: (callback: ListenerCallback) => UnsubscribeFunction;
    }
    export type Ninjutso<T extends object> = {
        createShadow: (isAliveCallback: IsAliveCallback) => KageBunshinNoJutsu<T>;
        subscribe: (callback: (data: T) => void, isOneTime?: boolean) => UnsubscribeFunction;
    }
    export type KageBunshinNoJutsu<T extends object> = {
        // [K in keyof T & string as `$${K}`]: (
        //     callback: (newValue: T[K], oldValue: T[K]) => void
        // ) => UnsubscribeFunction;
        [K in KeysWithoutFunctions$1<T> & string as `$${K}`]: ((
            callback: (newValue: T[K], oldValue: T[K]) => void,
        ) => UnsubscribeFunction) & {
            subscribe: (callback: (newValue: T[K], oldValue: T[K]) => void,) => UnsubscribeFunction;
            once: (callback: (newValue: T[K], oldValue: T[K]) => void,) => UnsubscribeFunction
        };
    } & T & {
        //(callback: (data: T) => void, isOneTime?: boolean): UnsubscribeFunction;
        (callback: (data: T) => void): UnsubscribeFunction;
    } & Ninjutso<T>

    export type createKageBunshinObject = <T extends object>(obj: T, isAliveCallback?: IsAliveCallback) => KageBunshinNoJutsu<T>;
}
/**
 * Creates a reactive Proxy "Clone" of an object (Kage Bunshin No Jutsu).
 * All clones share experience (state) in real-time with the original source.
 * Each property is accessible via a '$' prefixed node (Signal) for granular 
 * observation and seamless UI reactivity.
 * 
 * @es Crea un Proxy reactivo "Clon" de un objeto (Kage Bunshin No Jutsu).
 * Todos los clones comparten experiencia (estado) en tiempo real con la fuente original.
 * Cada propiedad es accesible vía un nodo con prefijo '$' (Signal) para 
 * observación granular y reactividad fluida con la UI.
 * 
 * @template {object} T
 * @param {T} obj - The base object to be cloned. / El objeto base a ser clonado.
 * @returns {KageBunshinNoJutsu<T>} The reactive clone. / El clon reactivo.
 * 
 * @example
 * const naruto = { power: 10 };
 * const clon1 = createKageBunshinObject(naruto);
 * 
 * // --- UI REACTIVITY (TuJsHtml) ---
 * // ✅ REACTIVE: Binds the Signal. UI updates automatically.
 * // ✅ REACTIVO: Vincula el Signal. La UI se actualiza automáticamente.
 * tags.p`Power: ${clon1.$power}`; 
 * 
 * // ❌ STATIC: Snapshot only. UI will NOT update.
 * // ❌ ESTÁTICO: Solo una captura. La UI NO se actualizará.
 * tags.p`Power: ${clon1.power}`; 
 * 
 * // --- OBSERVATION ---
 * // Property Hook ($ prefix): Observe specific changes.
 * // Hook de Propiedad (prefijo $): Observa cambios específicos.
 * clon1.$power((val, old) => console.log(`Power: ${old} -> ${val}`));
 * 
 * // One-time Hook: Second parameter 'true' makes it auto-destroy after first run.
 * // Hook de un solo uso: El segundo parámetro 'true' hace que se auto-destruya tras la primera ejecución.
 * clon1.$power((val) => console.log("First hit!"), true);
 * 
 * // Batch Hook (Callable): Observe any change in the entire object.
 * // Hook en Lote (Llamable): Observa cualquier cambio en todo el objeto.
 * clon1((data) => console.log("State updated:", data));
 * 
 * // Mutation: Synchronizes all instances immediately.
 * // Mutación: Sincroniza todas las instancias inmediatamente.
 * clon1.power = 20; 
 */
declare const createKageBunshinObject: KageBunshin.createKageBunshinObject;

/**
 * A utility function to be called to unsubscribe from a property's changes.
 */
type UnsubscribeFunction = () => void;
type FunctionGeneric$2 = (...args: unknown[]) => unknown;
/**
 * A utility type that extracts the keys of T whose values are not functions.
 */
type KeysWithoutFunctions<T> = {
  [K in keyof T]: T[K] extends FunctionGeneric$2 ? never : K
}[keyof T];

/**
 * Represents a reactive property within the draft.
 * It is a callable function as a shortcut for `subscribe`, but also has explicit methods.
 * @template V The type of the property value.
 */
type ReactiveProperty<V> = {
  /**
   * Subscribes to changes for this specific property.
   * @param callback The function to call when the value changes.
   * @returns A function to call to unsubscribe.
   */
  (callback: (newValue: V, oldValue: V) => void): UnsubscribeFunction;

  /**
   * Subscribes to changes for this specific property.
   * @param callback The function to call when the value changes.
   * @returns A function to call to unsubscribe.
   */
  subscribe(callback: (newValue: V, oldValue: V) => void): UnsubscribeFunction;

  /**
   * Subscribes to only the next change for this property.
   * The subscription is automatically removed after the first call.
   * @param callback The function to call when the value changes.
   */
  once(callback: (newValue: V, oldValue: V) => void): void;
};

/**
 * Represents the shape of the `props` object within a ReactiveDraft.
 * It includes the original data properties of T, plus a special `$`-prefixed
 * property for each data property to handle reactivity.
 */
type ReactiveDraftProps<T extends object> =
  Pick<T, KeysWithoutFunctions<T>> &
  {
    [K in KeysWithoutFunctions<T> & string as `$${K}`]: ReactiveProperty<T[K]>;
  };

/**
 * A robust class for creating isolated, reactive drafts of an object.
 * Ideal for managing form state without mutating the original object until explicitly committed.
 */
declare class ReactiveDraft<T extends object> {
  /**
   * The reactive properties of the draft.
   * Interact with this object to get, set, and subscribe to changes.
   */
  public props: ReactiveDraftProps<T>;

  /**
   * Creates an instance of a reactive draft.
   * @param originalObject The source object to create a draft from. It should be an object with data properties.
   * @param commitTrigger The name of a method on the original object to call after a successful update.
   */
  constructor(originalObject: T, commitTrigger?: string);

  /**
   * A factory method to create a new ReactiveDraft instance without using the `new` keyword.
   * @param originalObject The source object.
   * @param commitTrigger The name of a method on the original object to call after an update.
   */
  static create<T extends object>(originalObject: T, commitTrigger?: string): ReactiveDraft<T>;

  /**
   * Checks if the draft has any uncommitted changes.
   * @returns `true` if any property value is different from its initial state.
   */
  public readonly isDirty: boolean;

  /**
   * Checks if the original source object has changed since the draft was created.
   * This is useful for detecting concurrent modifications.
   * @returns `true` if the source object has been modified externally.
   */
  public readonly isStale: boolean;

  /**
   * Commits the changes from the draft back to the original object.
   * If a `commitTrigger` was provided, its method will be called.
   * @returns `true` if an update was performed, `false` otherwise.
   */
  public update(): boolean;

  /**
   * Reverts all changes in the draft back to the state when it was first created.
   */
  public reset(): void;

  /**
   * Discards all local changes and updates the draft with the latest values from the original object.
   */
  public resync(): void;

  /**
   * Cleans up all subscriptions and internal references to prevent memory leaks.
   * Call this method when the draft is no longer needed.
   */
  public destroy(): void;
}

// === Utility Types ===




// === Plugin System Contract ===

/**
 * The context object passed to every plugin function.
 */
interface PluginContext$1<T extends object = object> {
    key: keyof T;
    oldValue: unknown;
    newValue: unknown;
    draft: ObservableDraft<T>;
}

/**
 * The signature of a plugin function.
 */
type PluginFunction$1<T extends object = object> = (context: PluginContext$1<T>, next: () => void) => void;

/**
 * A central map of all built-in events and their callback signatures.
 * This interface can be augmented via declaration merging to add custom middleware events.
 */
interface ObservableDraftEventMap<T extends object> {
    'dirtychange': (isDirty: boolean) => void;
    'stalechange': (isStale: boolean) => void;
    'change': (payload: { key: keyof T, value: unknown }) => void;
    'commit': () => void;
    'rollback': () => void;
    'pull': () => void;
    'destroy': () => void;
}

/**
 * Describes the reactive tools for a single property.
 */
type PropertyTools<V> = {
    /** Subscribes to changes for this property. */
    subscribe(callback: (newValue: V) => void): UnsubscribeFunction$1;
    /** Subscribes to the next change for this property. */
    once(callback: (newValue: V) => void): UnsubscribeFunction$1;
};
/**
 * A central map of all built-in events and their callback signatures.
 * This interface can be augmented via declaration merging to add custom middleware events.
 */
type ObservableDraftProps<T extends object> =
    Pick<T, KeysWithoutFunctions$2<T>> &
    {
        [K in KeysWithoutFunctions$2<T> & string as `$${K}`]: PropertyTools<T[K]>;
    };

// === UNIFIED EVENT MAP (For perfect autocompletion) ===
/**
 * A comprehensive map of all possible events that an ObservableDraft instance can emit.
 * This combines base events, property-specific events (`$`), and middleware events (`use:`).
 */
type AllObservableDraftEvents<T extends object> =
    ObservableDraftEventMap<T> &
    { [K in KeysWithoutFunctions$2<T> & string as `$${K}`]: (newValue: T[K]) => void }
// ya no se usan los use por que eso ya depende de los PLUGINS
//& { [K in KeysWithoutFunctions<T> & string as `use:${K}`]: (payload: MiddlewareEventPayload) => void };


// === Main Class Definition ===

declare class ObservableDraft<T extends object, E extends object = ObjectGeneric$2> {
    /**
     * The reactive properties of the draft.
     * This type is simplified here; the real magic is in the event autocompletion.
     */
    public props: ObservableDraftProps<T>;

    constructor(originalObject: T, commitTrigger?: string, scheduler?: { asap: (cb: () => void) => void; defer: (cb: () => void) => number; cancelDefer: (handle: number) => void; });

    static create<T extends object>(originalObject: T, commitTrigger?: string, scheduler?: unknown): ObservableDraft<T>;

    public readonly isDirty: boolean;

    public readonly isStale: boolean;

    /**
     * Subscribes to an event. Provides strong typing and autocomplete for all known events.
     */
    public on<K extends keyof (AllObservableDraftEvents<T> & E)>(
        event: K,
        callback: (AllObservableDraftEvents<T> & E)[K]
    ): UnsubscribeFunction$1;

    /**
     * Subscribes to an event for a single emission.
     */
    public once<K extends keyof (AllObservableDraftEvents<T> & E)>(
        event: K,
        callback: (AllObservableDraftEvents<T> & E)[K]
    ): UnsubscribeFunction$1;

    /**
     * Registers middleware functions for a specific property.
     */
    //public use<K extends KeysWithoutFunctions<T> & string>(key: K, ...middlewares: MiddlewareFunction<T>[]): this;

    /**
   * Registers plugin functions for a specific property.
   */
    public usePlugins<K extends KeysWithoutFunctions$2<T> & string>(key: K, ...plugins: PluginFunction$1<T>[]): this;

    /**
     * Checks the stale status and emits a `stalechange` event if the status has changed.
     */
    public checkStale(): void;

    /**
     * Commits the changes from the draft back to the original object.
     */
    public commit(): boolean;

    /**
     * Reverts all changes in the draft back to the state when it was first created.
     */
    public rollback(): void;

    /**
     * Discards all local changes and updates the draft with the latest values from the original object.
     */
    public pull(): void;

    /**
     * Cleans up all subscriptions and internal references to prevent memory leaks.
     */
    public destroy(): void;
    public emit(event: string, payload: unknown): void;
}

// signal.d.ts
declare namespace MySignal {
  /**
   * Representa la función para desuscribirse de un Signal.
   */
  export type Unsubscribe = () => void;

  /**
   * Representa la función de un listener que se suscribe a los cambios de un Signal.
   * @template T El tipo de valor que maneja el Signal.
   * @param {T} newValue El nuevo valor del Signal después del cambio.
   * @param {T} oldValue El valor del Signal antes de que comenzara el lote de cambios.
   */
  export type Listener<T> = (newValue: T, oldValue: T) => void;

  /**
   * Un objeto Signal es una función para suscribirse, pero también contiene
   * métodos para interactuar con el estado que maneja.
   * @template T El tipo de valor que maneja el Signal.
   */
  export type Signal<T> = {
    /**
     * Obtiene el valor actual del Signal.
     * @returns {T} El valor actual.
     */
    get(): T;
    /**
     * Obtiene el valor actual del Signal.
     * @returns {T} El valor actual.
     */
    value: T;
    /**
     * Establece un nuevo valor para el Signal. Las notificaciones a los listeners
     * se agrupan y se ejecutan en un microtask.
     * @param {T} newValue El nuevo valor.
     */
    set(newValue: T): void;

    /**
     * Suscribe una función (listener) a los cambios del Signal.
     * @param {Listener<T>} listener La función que se ejecutará en cada cambio.
     * @returns {Unsubscribe} Una función para desuscribirse.
     */
    subscribe(listener: Listener<T>): Unsubscribe;

    /**
     * Desuscribe a todos los listeners a la vez.
     */
    unsubscribeAll(): void;

    /**
     * Proporciona una tupla inmutable [getter, setter] para una desestructuración
     * ergonómica, similar a los hooks de React.
     * 
     */
    readonly asTuple: readonly [() => T, (newValue: T) => void] & { (): never };
    /**
     * Permite la coerción de tipo del Signal a un primitivo, devolviendo su valor actual.
     */
    [Symbol.toPrimitive](): T;

    /**
     * Permite iterar sobre los valores del Signal de forma asíncrona a medida que cambian,
     * usando un bucle `for await...of`.
     */
    [Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>;

  } & ((listener: Listener<T>) => Unsubscribe); // Esto define al Signal como una función llamable.
}
/**
 * Crea un Signal, una unidad de estado reactivo.
 * @template T El tipo de valor que manejará el Signal.
 * @param {T} initialValue El valor inicial del Signal.
 * @returns {MySignal.Signal<T>} Una nueva instancia de Signal.
 */
declare function createSignal<T>(initialValue: T): MySignal.Signal<T>;

/**
 * Crea un Signal computado, basado en otros Signals.
 * @template T El tipo de valor que manejará el Signal computado.
 * @param {...MySignal.Signal<T>} args Los Signals de entrada.
 * @param {(values: T[]) => R} computed La función de computación.
 * @returns {MySignal.Signal<R>} Una nueva instancia de Signal computado.
 */
declare function createComputedSignal<T, R>(...args: [...MySignal.Signal<T>[], (values: T[]) => R]): MySignal.Signal<R>;

/**
 * A plugin factory that creates a debouncing effect.
 * This plugin emits a custom event after the specified delay.
 *
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {PluginFunction }
 */
declare function debounce(delay: number): PluginFunction;
/**
 * A synchronous plugin that trims whitespace from a string value.
 * @param {PluginContext} context
 * @param {() => void} next
 */
declare function trim(context: PluginContext, next: () => void): void;
/**
 * A plugin factory that validates the length of a string.
 * Emits validation success or error events.
 * @param {{min?: number, max?: number}} options
 * @returns {PluginFunction }
 */
declare function textSize({ min, max }: {
    min?: number;
    max?: number;
}): PluginFunction;
declare namespace debounceEvents {
    function debounced(propKey: string): string;
}
declare namespace textSizeEvents {
    function validationSuccess(propKey: string): string;
    function validationError(propKey: string): string;
}
type PluginContext = PluginContext$1;
type PluginFunction = PluginFunction$1;

/**
 * Cualquier elemento HTML puede ser utilizado como utilidad.
 * @example
 * const div = document.createElement('div');
 * div[ELEMENT_UTIL]
 */
declare const ELEMENT_UTIL : unique symbol;

/**
 * @fileoverview A function to make an object's property reactive.
 * This file contains the type declarations for the makeReactive function.
 */
type ObjectGeneric$1 = { [key: string]: unknown };
/**
 * funcion para hacer una propiedad reactiva en un objeto
 * @example
 * // 1. Autocompletado para propiedades existentes:
 * // Escribe `data.`, y tu editor sugerirá 'name' y 'age'.
 * const data = { name: 'Alice', age: 30 };
 * const reactiveData = makeReactive(data, 'name');
 *
 * // 2. Autocompletado para nuevas propiedades con valor inicial:
 * // 'newProperty' ahora es una propiedad válida en el objeto reactiveData
 * const newData = makeReactive({}, 'newProperty', 'initial value');
 *
 * newData.set('Another value');
 */
declare function makeReactive<T extends object, K extends keyof T>(
    obj: T,
    property: K
): T & ReactiveProperties<K, T[K]>;

declare function makeReactive<T extends object, K extends string, V>(
    obj: T,
    property: K,
    defaultValue: V
): T & { [P in K]: V } & ReactiveProperties<K, V>;

// --- Type Definitions ---

/**
 * The type of the reactive properties added to the object.
 * @template K The name of the reactive property.
 * @template V The type of the value.
 */
type ReactiveProperties<K extends string | number | symbol, V> = {
    /**
     * A getter function to retrieve the current value of the reactive property.
     * @returns The current value.
     */
    get: () => V;
    /**
     * A setter function to update the value of the reactive property.
     * Subscribers will be notified of the change.
     * @param value The new value to set.
     * @returns A boolean indicating success.
     */
    set: (value: V) => boolean;
    /**
     * A function to subscribe to changes in the reactive property.
     * @param callback A function to be called with the new value on each change.
     * @returns A function to unsubscribe.
     */
    subscribe: (callback: (value: V) => void) => () => void;
} & (K extends 'value' ? ObjectGeneric$1 : {
    /**
     * A convenient getter/setter for the reactive property, providing direct access to its value.
     */
    value: V;
});

// ==========================================
// --- common.d.ts ---
// ==========================================

type EventOff = () => void;
type ExecuteAfterRender = () => void;
type FunctionGeneric$1 = (...args: unknown[]) => unknown;

/*
 * 🪤 POISON PILL (Strict Excess Property Check):
 * Intercepts invalid DOM properties and forces a literal string error.
 * Prevents TypeScript from collapsing the callback inference to 'any'.
 */
// export type CatchExcessProps<TConfig, TValid> = {
//     [K in keyof TConfig]: string extends K
//     ? unknown // 👈 EL SALVAVIDAS: Si TS infiere 'string' genérico (por culpa de JS), ignora la validación para no romper todo.
//     : K extends keyof TValid
//     ? TConfig[K]
//     : `🛑 Invalid DOM property '${K & string}'. Use 'data-${K & string}' or assign it inside the callback.`;
// };
// export type CatchExcessProps<TProvided, TExpected> = {
//     [K in keyof TProvided]: K extends keyof TExpected
//     ? unknown
//     : `🛑 Invalid DOM property '${K & string}'. Use 'data-${K & string}' or assign it inside the callback.`;
// };

// Y tu ValidatedConfig queda así:
//export type ValidatedConfig<TConfig, TElement> = ConfigureAttributes<TElement> & CatchExcessProps<TConfig, ConfigureAttributes<TElement>>;
/**
 * Genera dinámicamente las firmas para selectores tipo Emmet.
 * Soporta: 
 * - Clases: .clase
 * - IDs: #id
 * - Atributos: [attr="val"]
 * - Texto interno: {texto} (Sí, funciona para <text> en SVG y <mi> en Math)
 * @template TContext El diccionario original (ej. TuJsHtml_Tags, TuJsHtml_MathContext)
 * @template TKeys Las llaves válidas (ignorando métodos nativos de JS)
 */
type CustomEmmetSelectors<TContext, TKeys extends keyof TContext> = {
    [Tag in TKeys as Tag extends string
    ? `${Tag}${'.' | '#' | '[' | '{'}${string}` // ¡Añadimos '{' para soportar texto!
    : never
    ]: TContext[Tag];
};

// importante para forzar los tipos del DOM 
/// <reference lib="dom" />
type HtmlInputType =
    | "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
declare class HTMLInputElementExtended extends HTMLInputElement{
    type: HtmlInputType  ;
    /**
     * Patrón de validación para el input.
     * @example
     * // Patrón para validar un email
     * pattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
     */
}
declare class HTMLElementExtended extends HTMLElement{
    inputMode: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
}
declare global {

}

/**
 * Define la firma para un callback que recibe los argumentos que le preceden.
 * @template T El tipo de los argumentos.
 */
type Callback<T> = (...data: T[]) => void;

/**
 * Define la firma para un callback que recibe los argumentos que le preceden.
 * @template T,T2 El tipo de los argumentos.
 */
type CallbackWithReturn<T,T2> = (...data: T[]) => T2;
/**
 * Define la firma para un callback que se ejecuta cuando se desactiva un listener.
 */
type CallbackOffOnchange = () => void;
/**
 * 
 */
declare class TuSignal<T>{
    /**
     * 
     */
    constructor(value: T);
    /**
     * 
     */
    get value(): T;
    /**
     * 
     */
    set value(value: T);
    get(): T;
    set(value: T): void;
    /**
     * 
     */
    onChange(callback: Callback<T>): CallbackOffOnchange;

    //static State<T>(value: T): {
    //    new(): TuSignalNs.State<T>;
    //    (value: T): TuSignalNs.State<T>;
    //}
    //static Computed<T,T2>(callback: CallbackWithReturn<T,T2>|Callback<T>): TuSignalNs.Computed<T,T2>;
}
/**/
declare namespace TuSignal{
    export class State<T>{
        constructor(value: T);
        get value(): T;
        set value(value: T);
        onChange(callback: Callback<T>): CallbackOffOnchange;
        subscribe(callback: Callback<T>): CallbackOffOnchange;
    }
    export class Computed<T,T2>{
        constructor(callback: CallbackWithReturn<T,T2>|Callback<T>);
        get value(): T2;
        onChange(callback: Callback<T2>): CallbackOffOnchange;
        subscribe(callback: Callback<T2>): CallbackOffOnchange;
        static fromTemplate<T>(template: Computed<T,string>): Computed<T,string>;
    }
    
}/*
 */

// ============================================================================
// --- html-attributes.d.ts ---
// ============================================================================



// ============================================================================
// 🌐 1. GLOBAL ATTRIBUTES (Available on all HTML tags)
// ============================================================================

interface GlobalHtmlAttributes {
    /**
     * CSS classes of the element. Use standard HTML nomenclature ('class').
     * @es Clases CSS del elemento. Usa nomenclatura HTML pura ('class', no 'className').
     * @example class: "flex items-center justify-center"
     */
    'class'?: SignalOr<string>;

    /**
     * Unique identifier for the element.
     * @es Identificador único del elemento en el DOM.
     */
    id?: SignalOr<string>;

    /**
     * Inline CSS styles. (Prefer the dedicated `style` object from ConfigureAttributes for better DX).
     * @es Estilos en línea. (Prefiere el objeto `style` del ConfigureAttributes para mejor DX).
     */
    style?: SignalOr<string>;

    /**
     * Indicates if the element is hidden.
     * - `hidden` (boolean): Hides the element entirely.
     * - `"until-found"`: Hidden but accessible to find-in-page features.
     * @es Indica si el elemento está oculto.
     * - `hidden` (booleano): Oculta el elemento por completo.
     * - `"until-found"`: Oculto pero accesible para la búsqueda en página (Ctrl+F).
     */
    hidden?: SignalOr<boolean | 'until-found' | string>;

    tabindex?: SignalOr<number | string>;
    contenteditable?: SignalOr<boolean | 'true' | 'false'>;
    draggable?: SignalOr<boolean | 'true' | 'false'>;
    translate?: SignalOr<'yes' | 'no'>;
    spellcheck?: SignalOr<'true' | 'false'>;
    dir?: SignalOr<'ltr' | 'rtl' | 'auto'>;
    lang?: SignalOr<string>;
    title?: SignalOr<string>;
}

// ============================================================================
// 🔗 2. SPECIFIC ATTRIBUTES
// ============================================================================

/** * <a>, <area>
 */
interface AnchorAttributes {
    /**
     * Forces the browser to download the linked resource instead of navigating.
     * If a string is provided, it acts as the default filename.
     * @es 📥 Fuerza la descarga del recurso en lugar de navegar hacia él.
     * Si pasas un string, será el nombre sugerido del archivo.
     * @example download: "report_2026.pdf"
     */
    download?: SignalOr<string | boolean>;

    href?: SignalOr<string>;

    /**
     * Browsing context for the linked resource.
     * - `_blank`: Opens in a new tab/window.
     * - `_self`: Opens in the current frame (default).
     * - `_parent`: Opens in the parent frame.
     * - `_top`: Opens in the top-level frame.
     * @es Dónde abrir el recurso enlazado.
     */
    target?: SignalOr<'_blank' | '_self' | '_parent' | '_top' | string>;

    rel?: SignalOr<string>;
}

/** * <img>
 */
interface ImageAttributes {
    src?: SignalOr<string>;
    alt?: SignalOr<string>;

    /**
     * Native image loading strategy.
     * - `lazy`: Defers loading until it reaches a calculated distance from the viewport.
     * - `eager`: Loads the image immediately.
     * @es 🚀 Estrategia de carga nativa de la imagen.
     * - `lazy`: Retrasa la carga hasta que el usuario hace scroll cerca de la imagen (Mejora el rendimiento).
     * - `eager`: Carga la imagen inmediatamente.
     */
    loading?: SignalOr<'lazy' | 'eager'>;

    /**
     * Provides a hint of the relative priority to fetch the image.
     * - `high`: You consider this image vital (e.g., LCP image).
     * - `low`: You consider this image low priority.
     * @es ⚡ Sugiere al navegador la prioridad de descarga.
     * - `high`: Úsalo para la imagen principal visible arriba del pliegue (LCP).
     */
    fetchpriority?: SignalOr<'high' | 'low' | 'auto'>;

    decoding?: SignalOr<'sync' | 'async' | 'auto'>;
}

/** * <script>
 */
interface ScriptAttributes {
    src?: SignalOr<string>;

    /**
     * Represents the type of the script.
     * - `module`: The script is an ES module (allows import/export).
     * - `importmap`: Defines a JSON map for bare module specifiers.
     * - `text/javascript`: Default legacy script.
     * @es Define la naturaleza del script.
     * - `module`: El script es un módulo moderno (permite import/export).
     * - `importmap`: Permite definir un mapa JSON para resolver importaciones como `import Vue from 'vue'`.
     */
    type?: SignalOr<'module' | 'importmap' | 'text/javascript' | string>;

    /**
     * If true, the browser will download the script asynchronously without blocking the HTML parser.
     * @es Si es true, descarga el script sin bloquear la construcción del DOM.
     */
    async?: SignalOr<boolean>;

    /**
     * If true, delays the execution of the script until the HTML parser has finished.
     * @es Si es true, retrasa la ejecución hasta que el HTML termine de cargar.
     */
    defer?: SignalOr<boolean>;

    crossorigin?: SignalOr<'anonymous' | 'use-credentials' | ''>;
}

/** * <input>
 */
interface InputAttributes {
    /**
     * Type of form control.
     * @es Tipo de control de formulario.
     */
    type?: SignalOr<'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio' | 'file' | 'date' | 'color' | 'range' | 'hidden' | string>;

    value?: SignalOr<string | number>;
    checked?: SignalOr<boolean>;
    placeholder?: SignalOr<string>;
    disabled?: SignalOr<boolean>;
    readonly?: SignalOr<boolean>;
    required?: SignalOr<boolean>;

    /**
     * Form element ID that owns this input.
     * @es ID del `<form>` al que pertenece, permitiendo que el input esté fuera de la etiqueta form.
     */
    form?: SignalOr<string>;

    name?: SignalOr<string>;
    min?: SignalOr<string | number>;
    max?: SignalOr<string | number>;
    step?: SignalOr<string | number>;
    maxlength?: SignalOr<number>;
    autocomplete?: SignalOr<'on' | 'off' | 'new-password' | 'current-password' | 'email' | 'username' | string>;
}

/** * <button>
 */
interface ButtonAttributes {
    /**
     * Default behavior of the button.
     * - `submit`: Submits the form data to the server (Default in HTML).
     * - `button`: Has no default behavior. Ideal for custom JS actions.
     * - `reset`: Resets all the controls to their initial values.
     * @es Comportamiento del botón.
     * - `submit`: Envía el formulario (Es el valor por defecto si no se especifica).
     * - `button`: No hace nada por defecto. Úsalo cuando el botón solo dispara eventos JS.
     */
    type?: SignalOr<'submit' | 'button' | 'reset'>;

    disabled?: SignalOr<boolean>;
    form?: SignalOr<string>;
    name?: SignalOr<string>;
    value?: SignalOr<string | number>;
}

/** * <label>, <output>
 */
interface LabelAttributes {
    /**
     * The ID of the input element that this label is bound to.
     * @es El ID del `<input>` al que está vinculado este label (reemplaza a `htmlFor` de JS).
     */
    for?: SignalOr<string>;
}

/** * <form>
 */
interface FormAttributes$1 {
    action?: SignalOr<string>;

    /**
     * HTTP method to submit the form.
     * - `dialog`: Special value for `<dialog>` tags to close the modal.
     * @es Método HTTP.
     * - `dialog`: Cierra un `<dialog>` padre nativamente sin JS.
     */
    method?: SignalOr<'GET' | 'POST' | 'dialog' | string>;

    enctype?: SignalOr<'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'>;
    target?: SignalOr<string>;
    novalidate?: SignalOr<boolean>;
}

/** * <video>, <audio>
 */
interface MediaAttributes$1 {
    src?: SignalOr<string>;
    controls?: SignalOr<boolean>;
    autoplay?: SignalOr<boolean>;
    loop?: SignalOr<boolean>;
    muted?: SignalOr<boolean>;

    /**
     * Optimization hint for buffering.
     * - `none`: Don't load anything until play.
     * - `metadata`: Load only duration and dimensions.
     * - `auto`: Load the whole file.
     * @es Sugerencia de precarga.
     * - `metadata`: Ideal para ahorrar datos, solo carga la duración.
     */
    preload?: SignalOr<'none' | 'metadata' | 'auto'>;

    /** @es (Solo Video) URL de la imagen de portada antes de reproducir. */
    poster?: SignalOr<string>;
}

/**
 * <iframe>
 */
interface IframeAttributes {
    src?: SignalOr<string>;

    /**
     * Raw HTML to embed, overriding the `src` attribute.
     * @es HTML crudo a renderizar, tiene prioridad sobre `src`.
     * @example srcdoc: "<h1>Hola Mundo</h1>"
     */
    srcdoc?: SignalOr<string>;

    loading?: SignalOr<'lazy' | 'eager'>;
    allow?: SignalOr<string>;
    allowfullscreen?: SignalOr<boolean>;

    /**
     * Security restrictions for the iframe content.
     * @es Restricciones de seguridad (ej. 'allow-scripts allow-same-origin').
     */
    sandbox?: SignalOr<string>;
}

/**
 * <meta>
 */
interface MetaAttributes {
    name?: SignalOr<string>;
    content?: SignalOr<string>;
    charset?: SignalOr<string>;
    'http-equiv'?: SignalOr<string>;
}

/**
 * <link>
 */
interface LinkAttributes$1 {
    href?: SignalOr<string>;
    rel?: SignalOr<string>;
    type?: SignalOr<string>;

    /**
     * Defines when a preloaded resource should be fetched.
     * @es Define qué tipo de recurso se va a precargar para optimizar la red.
     */
    as?: SignalOr<'fetch' | 'font' | 'image' | 'script' | 'style' | 'track' | string>;
    crossorigin?: SignalOr<'anonymous' | 'use-credentials' | ''>;
}

// ============================================================================
// 🚀 3. THE SMART ROUTER (O(1) Performance)
// ============================================================================

/**
 * Directs the correct specific attributes based on the exact DOM Element.
 * @es Asigna los atributos correctos según el elemento exacto.
 */
type SpecificHtmlAttributes<TElement> =
    TElement extends HTMLAnchorElement ? AnchorAttributes :
    TElement extends HTMLImageElement ? ImageAttributes :
    TElement extends HTMLScriptElement ? ScriptAttributes :
    TElement extends HTMLInputElement ? InputAttributes :
    TElement extends HTMLButtonElement ? ButtonAttributes :
    TElement extends HTMLLabelElement | HTMLOutputElement ? LabelAttributes :
    TElement extends HTMLFormElement ? FormAttributes$1 :
    TElement extends HTMLVideoElement | HTMLAudioElement ? MediaAttributes$1 :
    TElement extends HTMLIFrameElement ? IframeAttributes :
    TElement extends HTMLMetaElement ? MetaAttributes :
    TElement extends HTMLLinkElement ? LinkAttributes$1 :
    {}; // Fallback for <div>, <span>, <section>, etc.

// ============================================================================
// 📦 4. FINAL EXPORT (@attrs payload)
// ============================================================================

/**
 * The final composition for HTML tags in `@attrs`.
 * @es La composición final que se inyectará en `@attrs` para elementos HTML.
 */
type GetHtmlRawAttributes<TElement> =
    GlobalHtmlAttributes &
    SpecificHtmlAttributes<TElement>;

// ============================================================================
// --- svg-attributes.d.ts ---
// ============================================================================



// ============================================================================
// 🌐 1. GLOBAL & PRESENTATION ATTRIBUTES (The Core)
// ============================================================================

interface GlobalSvgAttributes {
    /**
     * Standard CSS classes.
     * @es Clases CSS estándar.
     */
    'class'?: SignalOr<string>;

    /**
     * Unique identifier for the element.
     * @es Identificador único del elemento.
     */
    id?: SignalOr<string>;

    style?: SignalOr<string>;
    tabindex?: SignalOr<number | string>;
    lang?: SignalOr<string>;
}
/**
 * <use>
 * Reutiliza elementos SVG existentes.
 */
interface SvgUseAttributes {
    href?: SignalOr<string>;
    x?: SignalOr<string | number>;
    y?: SignalOr<string | number>;
    width?: SignalOr<string | number>;
    height?: SignalOr<string | number>;
}

/** 
 * <foreignObject>
 * Permite incrustar HTML normal (como un <div> o <p>) dentro de un SVG.
 */
interface ForeignObjectAttributes {
    x?: SignalOr<string | number>;
    y?: SignalOr<string | number>;
    width?: SignalOr<string | number>;
    height?: SignalOr<string | number>;
}

// ============================================================================
// 📐 2. SPECIFIC GEOMETRY ATTRIBUTES
// ============================================================================

/** * <svg> (Root Container)
 */
interface SvgRootAttributes {
    /**
     * The displayed width of the SVG canvas.
     * @es El ancho visual del lienzo SVG.
     */
    width?: SignalOr<string | number>;

    /**
     * The displayed height of the SVG canvas.
     * @es El alto visual del lienzo SVG.
     */
    height?: SignalOr<string | number>;

    /**
     * Defines the internal coordinate system and aspect ratio.
     * Format: "min-x min-y width height"
     * @es Define el sistema de coordenadas interno (El lienzo).
     * Formato: "x-min y-min ancho alto"
     * @example viewBox: "0 0 100 100"
     */
    viewBox?: SignalOr<string>;

    /**
     * Indicates how an image should be scaled if aspect ratios don't match.
     * @es Indica cómo debe encajar el SVG si su `viewBox` no coincide con su `width`/`height`.
     */
    preserveAspectRatio?: SignalOr<'none' | 'xMidYMid meet' | 'xMinYMin slice' | string>;

    xmlns?: SignalOr<string>;
}

/** * <circle>
 */
interface CircleAttributes {
    /**
     * The X-coordinate of the center of the circle.
     * @es Coordenada X del centro del círculo.
     */
    cx?: SignalOr<string | number>;

    /**
     * The Y-coordinate of the center of the circle.
     * @es Coordenada Y del centro del círculo.
     */
    cy?: SignalOr<string | number>;

    /**
     * The radius of the circle.
     * @es Radio del círculo.
     */
    r?: SignalOr<string | number>;
}

/** * <ellipse>
 */
interface EllipseAttributes {
    /**
     * The X-coordinate of the center of the ellipse.
     * @es Coordenada X del centro de la elipse.
     */
    cx?: SignalOr<string | number>;

    /**
     * The Y-coordinate of the center of the ellipse.
     * @es Coordenada Y del centro de la elipse.
     */
    cy?: SignalOr<string | number>;

    /**
     * The horizontal radius of the ellipse.
     * @es Radio horizontal de la elipse.
     */
    rx?: SignalOr<string | number>;

    /**
     * The vertical radius of the ellipse.
     * @es Radio vertical de la elipse.
     */
    ry?: SignalOr<string | number>;
}

/** * <rect>
 */
interface RectAttributes {
    /**
     * The X-coordinate of the top-left corner of the rectangle.
     * @es Coordenada X de la esquina superior izquierda del rectángulo.
     */
    x?: SignalOr<string | number>;

    /**
     * The Y-coordinate of the top-left corner of the rectangle.
     * @es Coordenada Y de la esquina superior izquierda del rectángulo.
     */
    y?: SignalOr<string | number>;

    /**
     * The width of the rectangle.
     * @es El ancho del rectángulo.
     */
    width?: SignalOr<string | number>;

    /**
     * The height of the rectangle.
     * @es El alto del rectángulo.
     */
    height?: SignalOr<string | number>;

    /**
     * The horizontal corner radius (for rounded rectangles).
     * @es Radio de curvatura horizontal (para esquinas redondeadas).
     */
    rx?: SignalOr<string | number>;

    /**
     * The vertical corner radius (for rounded rectangles).
     * @es Radio de curvatura vertical (para esquinas redondeadas).
     */
    ry?: SignalOr<string | number>;
}

/** * <line>
 */
interface LineAttributes {
    /**
     * The X-coordinate of the starting point.
     * @es Coordenada X del punto de inicio.
     */
    x1?: SignalOr<string | number>;

    /**
     * The Y-coordinate of the starting point.
     * @es Coordenada Y del punto de inicio.
     */
    y1?: SignalOr<string | number>;

    /**
     * The X-coordinate of the ending point.
     * @es Coordenada X del punto final.
     */
    x2?: SignalOr<string | number>;

    /**
     * The Y-coordinate of the ending point.
     * @es Coordenada Y del punto final.
     */
    y2?: SignalOr<string | number>;
}

/** * <polygon>, <polyline>
 */
interface PolyAttributes {
    /**
     * List of points to draw the shape.
     * @es Lista de coordenadas (x,y) separadas por comas o espacios.
     * @example points: "0,100 50,25 50,75 100,0"
     */
    points?: SignalOr<string>;
}

/** * <path>
 */
interface PathAttributes {
    /**
     * The definition of the outline of a shape. (M = Move, L = Line, C = Curve, Z = Close).
     * @es La ruta matemática que dibuja la figura geométrica compleja.
     * @example d: "M 10 10 L 90 90 V 10 H 50 Z"
     */
    d?: SignalOr<string>;

    /**
     * Lets the author specify the total length for the path, useful for CSS dash animations.
     * @es Permite forzar la longitud total de la ruta (ideal para animaciones de dibujo).
     */
    pathLength?: SignalOr<string | number>;
}

/** * <text>, <tspan>
 */
interface TextAttributes {
    /**
     * The X-coordinate for the text position.
     * @es Coordenada X para la posición del texto.
     */
    x?: SignalOr<string | number>;

    /**
     * The Y-coordinate for the text position.
     * @es Coordenada Y para la posición del texto.
     */
    y?: SignalOr<string | number>;

    /**
     * Shifts the text position horizontally from its current position.
     * @es Desplaza la posición del texto horizontalmente desde su punto actual.
     */
    dx?: SignalOr<string | number>;

    /**
     * Shifts the text position vertically from its current position.
     * @es Desplaza la posición del texto verticalmente desde su punto actual.
     */
    dy?: SignalOr<string | number>;

    /**
     * Determines the alignment of the text relative to the X coordinate.
     * @es Alineación del texto respecto a su coordenada X.
     */
    'text-anchor'?: SignalOr<'start' | 'middle' | 'end' | string>;

    /**
     * Determines the vertical alignment of the text.
     * @es Alineación vertical (ideal para centrar texto verticalmente).
     */
    'dominant-baseline'?: SignalOr<'auto' | 'middle' | 'central' | 'hanging' | string>;

    'font-family'?: SignalOr<string>;
    'font-size'?: SignalOr<string | number>;
    'font-weight'?: SignalOr<'normal' | 'bold' | 'bolder' | 'lighter' | number | string>;
}

/** * <image> (Inside SVG)
 */
interface SvgImageAttributes {
    x?: SignalOr<string | number>;
    y?: SignalOr<string | number>;
    width?: SignalOr<string | number>;
    height?: SignalOr<string | number>;
    href?: SignalOr<string>;
    preserveAspectRatio?: SignalOr<string>;
}

// ============================================================================
// 🚀 3. THE SMART ROUTER (O(1) Performance)
// ============================================================================

/**
 * Directs the correct specific geometry attributes based on the exact SVG Element.
 * @es Asigna los atributos geométricos correctos según la figura.
 */
type SpecificSvgAttributes<TElement> =
    TElement extends SVGSVGElement ? SvgRootAttributes :
    TElement extends SVGCircleElement ? CircleAttributes :
    TElement extends SVGEllipseElement ? EllipseAttributes :
    TElement extends SVGRectElement ? RectAttributes :
    TElement extends SVGLineElement ? LineAttributes :
    TElement extends SVGPolygonElement | SVGPolylineElement ? PolyAttributes :
    TElement extends SVGPathElement ? PathAttributes :
    TElement extends SVGTextElement | SVGTSpanElement ? TextAttributes :
    TElement extends SVGImageElement ? SvgImageAttributes :
    TElement extends SVGUseElement ? SvgUseAttributes :
    TElement extends SVGForeignObjectElement ? ForeignObjectAttributes :
    {}; // Fallback for <g>, <defs>, etc.

// ============================================================================
// 📦 4. FINAL EXPORT (@attrs payload)
// ============================================================================

/**
 * The final composition for SVG tags in `@attrs`.
 * Combines Global, Presentation (colors/strokes), and Specific Geometry.
 * @es La composición final que se inyectará en `@attrs` para elementos SVG.
 */
type GetSvgRawAttributes<TElement> =
    GlobalSvgAttributes &
    //SvgPresentationAttributes &
    SpecificSvgAttributes<TElement>;

// ============================================================================
// --- math-attributes.d.ts ---
// ============================================================================



// ============================================================================
// 🌐 1. GLOBAL MATH ATTRIBUTES (Available on all MathML tags)
// ============================================================================

interface GlobalMathAttributes {
    /**
     * Standard CSS classes.
     * @es Clases CSS estándar.
     * @example class: "math-formula highlight"
     */
    'class'?: SignalOr<string>;

    /**
     * Unique identifier for the element.
     * @es Identificador único del elemento.
     */
    id?: SignalOr<string>;

    style?: SignalOr<string>;
    dir?: SignalOr<'ltr' | 'rtl'>;
    href?: SignalOr<string>;

    /**
     * The text color of the mathematical element.
     * @es El color del texto de la fórmula o elemento.
     * @example mathcolor: "#FF0000"
     */
    mathcolor?: SignalOr<string>;

    /**
     * The background color of the mathematical element.
     * @es El color de fondo del elemento.
     * @example mathbackground: "rgba(255, 255, 0, 0.3)"
     */
    mathbackground?: SignalOr<string>;

    /**
     * Specifies the size of the mathematical element.
     * @es Tamaño de la fuente matemática.
     * @example mathsize: "1.5em"
     */
    mathsize?: SignalOr<'small' | 'normal' | 'big' | string>;
}

// ============================================================================
// 📐 2. SPECIFIC PRESENTATION & SEMANTIC ATTRIBUTES
// ============================================================================

interface SpecificMathAttributes {
    // --- <math> (Root Element) ---
    /**
     * How the math should be rendered.
     * - `block`: Displayed in its own block, usually centered.
     * - `inline`: Displayed inside the current line of text.
     * @es Cómo se debe renderizar la ecuación.
     * - `block`: En su propio bloque (como un párrafo centrado).
     * - `inline`: En línea con el texto actual.
     */
    display?: SignalOr<'block' | 'inline'>;
    /**
     * Overrides the display style. If true, forces block-style rendering (larger operators, vertical limits).
     * @es Fuerza el estilo de renderizado. Si es 'true', las fracciones y sumatorias se dibujan en formato grande.
     * @example displaystyle: "true"
     */
    displaystyle?: SignalOr<'true' | 'false' | boolean>;

    /**
     * Controls the font size implicitly by setting the script level. 
     * Higher levels mean smaller text (like inside a fraction of a fraction).
     * @es Controla el nivel de anidamiento matemático (afecta el tamaño de fuente).
     * @example scriptlevel: "+1" // Reduce el tamaño de fuente un nivel
     */
    scriptlevel?: SignalOr<string | number>;
    // --- <mi>, <mn>, <mo>, <mtext> (Tokens) ---
    /**
     * The typographic style of the text.
     * @es Estilo tipográfico matemático. Útil para vectores (bold) o conjuntos (double-struck).
     * @example mathvariant: "double-struck" // For Real Numbers symbol (ℝ)
     */
    mathvariant?: SignalOr<
        | 'normal'
        | 'italic'
        | 'bold'
        | 'bold-italic'
        | 'double-struck'
        | 'script'
        | 'fraktur'
        | 'sans-serif'
        | string
    >;

    // --- <mo> (Operators) ---
    /**
     * Indicates the role of the operator.
     * - `prefix`: Operator before the operand (e.g., -x).
     * - `infix`: Operator between operands (e.g., x + y).
     * - `postfix`: Operator after the operand (e.g., x!).
     * @es Indica el rol o posición del operador.
     */
    form?: SignalOr<'prefix' | 'infix' | 'postfix'>;

    /**
     * Space added before the operator.
     * @es Espacio visual añadido antes del operador.
     * @example lspace: "thickmathspace" // Or "0.27em"
     */
    lspace?: SignalOr<string | number>;

    /**
     * Space added after the operator.
     * @es Espacio visual añadido después del operador.
     * @example rspace: "0.27em"
     */
    rspace?: SignalOr<string | number>;

    /**
     * If true, the operator stretches to the size of adjacent elements (e.g., large brackets).
     * @es Si es 'true', el operador (como un paréntesis o llave) se estirará para cubrir a sus hermanos.
     */
    stretchy?: SignalOr<'true' | 'false' | boolean>;

    /**
     * If true, the operator is drawn larger when in display="block" mode (like Integrals or Sums).
     * @es Si es 'true', el operador (como ∑ o ∫) se dibujará más grande en modo bloque.
     */
    largeop?: SignalOr<'true' | 'false' | boolean>;

    /**
     * If true, attached scripts are moved to under/over positions in display mode.
     * @es Mueve los subíndices y superíndices arriba y abajo del operador (ej. límites de suma).
     */
    movablelimits?: SignalOr<'true' | 'false' | boolean>;

    /**
     * Whether the operator should be vertically symmetric around the math axis.
     * @es Si el operador debe ser verticalmente simétrico respecto al eje matemático.
     */
    symmetric?: SignalOr<'true' | 'false' | boolean>;

    /**
     * Indicates if the operator is a fence (such as parentheses).
     * @es Indica si el operador actúa como un delimitador (ej. paréntesis).
     */
    fence?: SignalOr<'true' | 'false' | boolean>;

    /**
     * Indicates if the operator is a separator (such as a comma).
     * @es Indica si el operador actúa como un separador (ej. coma).
     */
    separator?: SignalOr<'true' | 'false' | boolean>;

    /**
     * Indicates if the operator should be treated as an accent (drawn closer to the base).
     * @es Indica si el operador se comporta como un acento (se dibuja más cerca de la base).
     */
    accent?: SignalOr<'true' | 'false' | boolean>;

    /**
     * The maximum size a stretchy operator is allowed to grow to.
     * @es El tamaño máximo al que puede crecer un operador estirable.
     * @example maxsize: "3em"
     */
    maxsize?: SignalOr<string | number>;

    /**
     * The minimum size a stretchy operator is allowed to shrink to.
     * @es El tamaño mínimo al que puede reducirse un operador estirable.
     * @example minsize: "1.2em"
     */
    minsize?: SignalOr<string | number>;

    // --- <mspace> (Space) ---
    /**
     * The width of the space.
     * @es Ancho del espacio en blanco.
     * @example width: "2em"
     */
    width?: SignalOr<string | number>;

    /**
     * The height of the space above the baseline.
     * @es Altura del espacio sobre la línea base.
     */
    height?: SignalOr<string | number>;

    /**
     * The depth of the space below the baseline.
     * @es Profundidad del espacio por debajo de la línea base.
     */
    depth?: SignalOr<string | number>;

    // --- <mfrac> (Fractions) ---
    /**
     * The thickness of the fraction line.
     * - `0`: No line (useful for binomial coefficients).
     * @es Grosor de la línea fraccionaria. Usa `0` para ocultarla (ej. combinatoria).
     * @example linethickness: "2px" // Or "0" for binomials
     */
    linethickness?: SignalOr<string | number>;

    // --- <menclose> (Enclosures) ---
    /**
     * The type of notation to enclose the element with.
     * @es El tipo de notación para encerrar el elemento (ej. división larga, tachado).
     * @example notation: "longdiv" // Also: "actuarial", "radical", "box", "strike"
     */
    notation?: SignalOr<
        | 'longdiv'
        | 'actuarial'
        | 'radical'
        | 'box'
        | 'roundedbox'
        | 'circle'
        | 'left'
        | 'right'
        | 'top'
        | 'bottom'
        | 'updiagonalstrike'
        | 'downdiagonalstrike'
        | 'verticalstrike'
        | 'horizontalstrike'
        | string
    >;

    // --- <mfenced> (Fenced - Deprecated but common) ---
    /**
     * The opening delimiter string.
     * @es Carácter o cadena de apertura.
     * @example open: "["
     */
    open?: SignalOr<string>;

    /**
     * The closing delimiter string.
     * @es Carácter o cadena de cierre.
     * @example close: "]"
     */
    close?: SignalOr<string>;

    /**
     * The characters used to separate the children elements.
     * @es Caracteres separadores entre los elementos hijos.
     * @example separators: ",;"
     */
    separators?: SignalOr<string>;

    // --- <mtable>, <mtr>, <mtd> (Matrices & Tables) ---
    /**
     * Horizontal alignment of the cells.
     * @es Alineación horizontal de las celdas.
     * @example columnalign: "center"
     */
    columnalign?: SignalOr<'left' | 'center' | 'right' | string>;

    /**
     * Vertical alignment of the cells.
     * @es Alineación vertical de las celdas.
     * @example rowalign: "baseline"
     */
    rowalign?: SignalOr<'top' | 'bottom' | 'center' | 'baseline' | 'axis' | string>;

    /**
     * Border lines between columns.
     * @es Líneas de borde entre columnas.
     */
    columnlines?: SignalOr<'none' | 'solid' | 'dashed' | string>;

    /**
     * Border lines between rows.
     * @es Líneas de borde entre filas.
     */
    rowlines?: SignalOr<'none' | 'solid' | 'dashed' | string>;

    /**
     * Border frame around the entire table.
     * @es Marco exterior alrededor de la matriz/tabla.
     * @example frame: "solid"
     */
    frame?: SignalOr<'none' | 'solid' | 'dashed' | string>;

    /**
     * Space between the frame and the table.
     * @es Espaciado entre el marco y el contenido de la tabla.
     * @example framespacing: "0.4em 0.5ex"
     */
    framespacing?: SignalOr<string>;

    /**
     * Number of columns the cell spans across.
     * @es Número de columnas que abarca la celda (equivalente a colspan en HTML).
     * @example columnspan: 2
     */
    columnspan?: SignalOr<number | string>;

    /**
     * Number of rows the cell spans across.
     * @es Número de filas que abarca la celda (equivalente a rowspan en HTML).
     * @example rowspan: 2
     */
    rowspan?: SignalOr<number | string>;

    // --- <munderover>, <munder> ---
    /**
     * Specifies if the underscript should be treated as an accent (drawn closer to the base expression).
     * @es Especifica si el texto inferior debe tratarse como un acento (dibujado más cerca de la base).
     */
    accentunder?: SignalOr<'true' | 'false' | boolean>;
}

// ============================================================================
// 📦 3. FINAL EXPORT (@attrs payload)
// ============================================================================

/**
 * The final composition for MathML tags in `@attrs`.
 * Since TypeScript's DOM library uses a generic `MathMLElement` for all tags,
 * we provide a unified dictionary of all possible MathML attributes.
 * @es La composición final que se inyectará en `@attrs` para MathML.
 * Al no existir interfaces específicas en TS (como MathMLFractionElement),
 * unificamos todos los atributos en un solo diccionario ultra-rápido de O(1).
 */
type GetMathRawAttributes<TElement> =
    GlobalMathAttributes &
    SpecificMathAttributes;

// ==========================================
// --- attributes.d.ts ---
// ==========================================


//type AnyFunction = Function | { (...args: any[]): any } | { new(...args: any[]): any };

interface Subscribable<T> {
  subscribe(onValue: (value: T) => void): void;
  subscribe(onValue: (value: T, oldValue: T) => void): void;
}

/**
 * Indicates that a value can be static, a signal, or a subscribable.
 * @es Indica que un valor puede ser estático, una señal o un subscribable.
 */
type SignalOr<T> = T | TuSignal<T> | Subscribable<T> | number;

// =========================================================================
// 1. ESTILOS Y CLASES (O(1) PERFORMANCE)
// =========================================================================

type CSSKeys = Exclude<
  keyof CSSStyleDeclaration,
  number | symbol | 'length' | 'parentRule' | 'getPropertyPriority' |
  'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty'
>;

type StyleObject = {
  [K in CSSKeys]?: SignalOr<string | number>;
} & {
  [customProperty: `--${string}`]: SignalOr<string | number>;
};

type ClassToggleMap = {
  [className: string]: SignalOr<boolean>;
};

// =========================================================================
// 2. 🚦 EL ENRUTADOR DE EVENTOS (LA CLAVE DE LA ESCALABILIDAD)
// =========================================================================

/**
 * 🧠 METADATA ELEMENTS:
 * Elements that shouldn't have UI events (like 'click' or 'hover').
 * @es Elementos de metadatos que por error del DOM heredan eventos de interfaz.
 */
type MetadataElements =
  | HTMLScriptElement | HTMLLinkElement | HTMLMetaElement
  | HTMLStyleElement | HTMLTitleElement | HTMLBaseElement | HTMLTemplateElement;

/**
 * Strict lifecycle event map for metadata.
 * @es Mapa estricto de eventos de carga para scripts, links, etc.
 */
interface ResourceEventMap {
  "load": Event;
  "error": ErrorEvent;
  "abort": Event;
}

/**
 * 🚀 EVENT ROUTER: 
 * Determines which EventMap belongs to which Element.
 * If you find new special tags in the future, add them here!
 * @es Enrutador de eventos. Asigna el mapa correcto según el elemento.
 * ¡Añade aquí futuras etiquetas con tratos especiales!
 */
type GetEventMap<T> =
  T extends MetadataElements ? ResourceEventMap : // Interceptor de Metadatos
  T extends SVGElement ? SVGElementEventMap :     // Interceptor SVG
  T extends MathMLElement ? HTMLElementEventMap : // Interceptor MathML
  HTMLElementEventMap;                            // Fallback estándar (div, button, etc)

/**
 * Regenerates native DOM events (on*) strictly from our custom Event Router.
 * @es Regenera los eventos nativos (on*) de forma estricta desde nuestro enrutador.
 */
type NativeEventAttributes<TElement extends Element> = {
  [K in keyof GetEventMap<TElement> as `on${K & string}`]?: (this: TElement, event: GetEventMap<TElement>[K]) => unknown;
};

// =========================================================================
// 3. DIRECTIVAS REACTIVAS ESPECIALES (`@`)
// =========================================================================
/**
 * Sobreescribe el evento nativo de TS para inyectar el elemento exacto 
 * en el `target` y `currentTarget`, evitando errores ts(2339).
 */
type TuJsEvent<TElement extends EventTarget, TEvent extends Event = Event> =
  Omit<TEvent, 'target' | 'currentTarget'> & {
    readonly target: TElement;
    readonly currentTarget: TElement;
  };
// export type EventListenerMap<TElement extends Element> = {
//   [EventType in keyof GetEventMap<TElement>]?: (event: GetEventMap<TElement>[EventType]) => void;
// };
type EventListenerMap<TElement extends Element> = {
  // 1. Mapea todos los eventos oficiales del DOM (click, change, input...)
  [K in keyof GlobalEventHandlersEventMap]?: (
    e: TuJsEvent<TElement, GlobalEventHandlersEventMap[K]>
  ) => void;
} & {
  // 2. Fallback para Custom Events o eventos no estándar
  [customEvent: string]: Function
  //[customEvent: string]: (e: TuJsEvent<TElement, unknown>) => void; //<-- error en js strict
};
type FormStateObject = { [key: string]: unknown; };

/**
 * 🚀 ENRUTADOR DE ATRIBUTOS: 
 * Decide qué mapa de atributos mostrar en @attrs dependiendo del elemento actual.
 */
type GetRawAttributesMap<TElement> =
  TElement extends SVGElement ? GetSvgRawAttributes<TElement> :
  TElement extends MathMLElement ? GetMathRawAttributes<TElement> : // (Hasta que hagamos math-attributes)
  GetHtmlRawAttributes<TElement>;


type DirectiveAttributes<TElement extends Element> = {

  "@classToggle"?: ClassToggleMap;
  "@addClass"?: SignalOr<string>;
  "@attrs"?: GetRawAttributesMap<TElement> &
  Record<`data-${string}`, SignalOr<string | number | boolean>> &
  Record<`aria-${string}`, SignalOr<string | boolean>>
  "@on"?: EventListenerMap<TElement>;
  "@one"?: EventListenerMap<TElement>;
  "@once"?: EventListenerMap<TElement>;
  "@bind:value"?: SignalOr<string | number | string[]>;
  "@bind:checked"?: SignalOr<boolean>;
  "@innerHTML"?: SignalOr<string>;
  /**
   * [DIRECTIVA] Captura los datos de un formulario en el evento de envío,
   * los convierte en un objeto y los guarda en la señal proporcionada.
   * Previene el envío tradicional del formulario.
   */
  "@bind:form"?: SignalOr<FormStateObject>;

};

// =========================================================================
// 4. LA GRAN MURALLA (PURGA DE PROPIEDADES NATIVAS)
// =========================================================================

/**
 * @OmitList
 * List of native DOM properties that are either read-only, methods, or 
 * internal properties that pollute the Developer Experience.
 * @es Lista negra de propiedades inútiles, read-only o internas que ensucian el autocompletado.
 */
type SpecialExclusionsProps =
  // 🧱 1. Constantes del Sistema (Node Constants)
  | 'ATTRIBUTE_NODE' | 'CDATA_SECTION_NODE' | 'COMMENT_NODE' | 'DOCUMENT_FRAGMENT_NODE'
  | 'DOCUMENT_NODE' | 'DOCUMENT_POSITION_CONTAINED_BY' | 'DOCUMENT_POSITION_CONTAINS'
  | 'DOCUMENT_POSITION_DISCONNECTED' | 'DOCUMENT_POSITION_FOLLOWING'
  | 'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC' | 'DOCUMENT_POSITION_PRECEDING'
  | 'DOCUMENT_TYPE_NODE' | 'ELEMENT_NODE' | 'ENTITY_NODE' | 'ENTITY_REFERENCE_NODE'
  | 'NOTATION_NODE' | 'PROCESSING_INSTRUCTION_NODE' | 'TEXT_NODE'

  // 🧭 2. Navegación y Jerarquía del DOM (Readonly getters)
  | 'childNodes' | 'children' | 'firstChild' | 'firstElementChild' | 'lastChild'
  | 'lastElementChild' | 'nextElementSibling' | 'nextSibling' | 'ownerDocument'
  | 'parentElement' | 'parentNode' | 'previousElementSibling' | 'previousSibling'
  | 'isConnected' | 'baseURI' | 'localName' | 'namespaceURI' | 'nodeName' | 'nodeType'
  | 'prefix' | 'tagName' | 'shadowRoot' | 'assignedSlot' | 'part'

  // 📏 3. Dimensiones, Posición y Scroll (Readonly o manejados por CSS)
  | 'clientHeight' | 'clientLeft' | 'clientTop' | 'clientWidth'
  | 'offsetHeight' | 'offsetLeft' | 'offsetParent' | 'offsetTop' | 'offsetWidth'
  | 'scrollHeight' | 'scrollLeft' | 'scrollTop' | 'scrollWidth'
  // | 'x' | 'y' // son porta de algunos SVG

  // 📝 4. Inserción de Contenido (Manejado por las directivas del Framework)
  | 'innerHTML' | 'outerHTML' | 'textContent' | 'nodeValue'

  // 🎨 5. Atributos Complejos y Mapas de Estilo (Manejados por ConfigureAttributes)
  | 'classList' //| 'dataset' | 'style' 
  | 'attributeStyleMap' | 'attributes'

  // 🖼️ 6. Ruido Específico de SVG y MathML
  | 'ownerSVGElement' | 'viewportElement' | 'nearestViewportElement'
  | 'farthestViewportElement' | 'animatedPathSegList' | 'pathSegList'
  | 'ownerMathElement'

  // 🛡️ 7. Estados de Validación y Formularios (Readonly getters)
  | 'validity' | 'validationMessage' | 'willValidate' | 'labels' | 'form' | 'list'
  | 'control'

  // ♿ 8. Object Models de Accesibilidad (Evitamos camelCase y forzamos el uso de aria-*)
  | 'ariaAtomic' | 'ariaAutoComplete' | 'ariaBusy' | 'ariaChecked' | 'ariaColCount'
  | 'ariaColIndex' | 'ariaColSpan' | 'ariaCurrent' | 'ariaDisabled' | 'ariaExpanded'
  | 'ariaHasPopup' | 'ariaHidden' | 'ariaInvalid' | 'ariaKeyShortcuts' | 'ariaLabel'
  | 'ariaLevel' | 'ariaLive' | 'ariaModal' | 'ariaMultiLine' | 'ariaMultiSelectable'
  | 'ariaOrientation' | 'ariaPlaceholder' | 'ariaPosInSet' | 'ariaPressed' | 'ariaReadOnly'
  | 'ariaRequired' | 'ariaRoleDescription' | 'ariaRowCount' | 'ariaRowIndex' | 'ariaRowSpan'
  | 'ariaSelected' | 'ariaSetSize' | 'ariaSort' | 'ariaValueMax' | 'ariaValueMin'
  | 'ariaValueNow' | 'ariaValueText' | 'role'

  // ⚙️ 9. Otras propiedades nativas ruidosas
  | 'enterKeyHint' | 'childElementCount' | 'currentCSSZoom' | 'elementTiming';

/**
 * SVG Magic: Unpacks `SVGAnimatedLength` to allow string/number assignments.
 */
type DomPropType<T> = T extends { baseVal: infer U } ? U | string | number : T | string | number;

/**
 * 🚀 THE MASTER FILTER:
 * Removes native methods, the blacklist, 'style', 'class', and ALL native 'on*' events.
 * @es El filtro maestro. Borra métodos, lista negra, y TODOS los eventos nativos originales.
 */
type ValidBaseKeys<T> = {
  //[K in keyof T]-?: NonNullable<T[K]> extends AnyFunction ? never :
  [K in keyof T]-?: NonNullable<T[K]> extends FunctionGeneric$1 ? never :
  K extends SpecialExclusionsProps | 'dataset' | 'style' | 'class' | 'className' ? never :
  K extends `on${string}` ? never : K // <- ¡Borra los eventos nativos del DOM!
}[keyof T];

/**
 * Converts valid properties to their reactive version (`SignalOr`).
 */
type BaseProps<TElement extends Element> = {
  [K in ValidBaseKeys<TElement>]?: SignalOr<DomPropType<TElement[K]>>;
};

// =========================================================================
// 5. TIPO FINAL: ConfigureAttributes
// =========================================================================

/**
 * @es Objeto de configuración unificado.
 * El núcleo de la Arquitectura: Reconstruye el elemento fusionando nuestras 
 * directivas, nuestros propios eventos (purificados) y los atributos limpios.
 */
type ConfigureAttributes<TElement extends Element = HTMLElement> =
  // 1. Data Properties (limpias de métodos y eventos viejos)
  BaseProps<TElement> &

  // 2. Eventos Reconstruidos (solo los válidos para el elemento)
  NativeEventAttributes<TElement> &

  // 3. Clases y Estilos Optimizados
  {
    style?: StyleObject | SignalOr<string>;
    dataset?: Record<string, SignalOr<string | number | boolean | null | undefined>>;
    //className?: SignalOr<string>;
  } &
  (TElement extends HTMLElement ? { className?: SignalOr<string> } : {}) & // <-- ¡AQUÍ ESTÁ LA MAGIA!

  // 4. Directivas Avanzadas de TuJsHtml (@)
  DirectiveAttributes<TElement> &

  // 5. Soporte para data-* y atributos sin tipar
  Record<`data-${string}`, string | number | boolean | undefined>;


/**
* 🪤 POISON PILL (Strict Excess Property Check):
* Intercepts invalid DOM properties and forces a literal string error.
* Prevents TypeScript from collapsing the callback inference to 'any'.
*/
type CatchExcessProps<TConfig, TValid> = {
  [K in keyof TConfig]: string extends K
  ? unknown // 👈 EL SALVAVIDAS: Si TS infiere 'string' genérico (por culpa de JS), ignora la validación para no romper todo.
  : K extends keyof TValid
  ? TConfig[K]
  : `🛑 Invalid DOM property '${K & string}'. Use 'data-${K & string}' or assign it inside the callback.`;
};
// export type CatchExcessProps<TProvided, TExpected> = {
//   [K in keyof TProvided]: K extends keyof TExpected
//   ? unknown
//   : `🛑 Invalid DOM property '${K & string}'. Use 'data-${K & string}' or assign it inside the callback.`;
// };
/**
 * 🛡️ VALIDATED CONFIGURATION (El Envoltorio Limpio):
 * Combina la configuración permitida con la trampa de propiedades.
 * Esto limpia dramáticamente las firmas de las funciones.
 */
type ValidatedConfig<TConfig, TElement> = ConfigureAttributes<TElement> & CatchExcessProps<TConfig, ConfigureAttributes<TElement>>;

/// <reference lib="dom" />
// webview.d.ts
/**
 * Definición de TypeScript para la etiqueta <webview> en Chrome Apps.
 * Proporciona tipado completo para propiedades, métodos y eventos.
 */
interface Window {
    chrome?: {
        webview?: WebViewElement;
    };
}
// declare global {
//     export interface Window {
//         chrome?: {
//             webview?: WebViewElement;
//         };
//     }
// }
//export type ChromeWebViewElement = ChromeWebViewElement;
/**
 * Interfaz principal para el elemento <webview>
 */
interface WebViewElement extends HTMLElement {
    /**
     * Atributos de la etiqueta <webview>
     */
    src: string;
    partition?: string;
    allowtransparency?: boolean;
    autosize?: string; // "on" o undefined
    minwidth?: string;
    minheight?: string;
    maxwidth?: string;
    maxheight?: string;
    name?: string;

    /**
     * Propiedades de solo lectura
     */
    readonly contentWindow: ContentWindow | null;
    readonly request: WebRequestEventInterface;
    readonly contextMenus: ContextMenus;

    /**
     * Métodos
     */
    getAudioState(callback: (isPlaying: boolean) => void): void;
    setAudioMuted(mute: boolean): void;
    isAudioMuted(callback: (muted: boolean) => void): void;
    captureVisibleRegion(options?: { mimeType?: string; quality?: number }, callback?: (dataUrl: string) => void): void;
    addContentScripts(contentScriptList: ContentScriptDetails[]): void;
    back(callback?: () => void): void;
    canGoBack(): boolean;
    canGoForward(): boolean;
    clearData(options: ClearDataOptions, types: ClearDataTypeSet, callback: () => void): void;
    executeScript(details: InjectDetails, callback?: (results: unknown[]) => void): void;
    find(searchText: string, options?: FindOptions, callback?: (result: FindCallbackResults) => void): void;
    forward(callback?: () => void): void;
    getProcessId(): number;
    getUserAgent(): string;
    getZoom(callback: (zoomFactor: number) => void): void;
    getZoomMode(callback: (zoomMode: ZoomMode) => void): void;
    go(relativeIndex: number, callback?: () => void): void;
    insertCSS(details: InjectDetails, callback?: () => void): void;
    isUserAgentOverridden(): boolean;
    print(): void;
    reload(): void;
    removeContentScripts(scriptNameList: string[]): void;
    setUserAgentOverride(userAgent: string): void;
    setZoom(zoomFactor: number, callback?: () => void): void;
    setZoomMode(mode: ZoomMode, callback?: () => void): void;
    stop(): void;
    stopFinding(action: 'clear' | 'keep' | 'activate'): void;
    loadDataWithBaseUrl(dataUrl: string, baseUrl: string, virtualUrl?: string): void;
    setSpatialNavigationEnabled(enabled: boolean): void;
    isSpatialNavigationEnabled(callback: (enabled: boolean) => void): void;
    terminate(): void;

    /**
     * Eventos
     */
    addEventListener(type: 'close', listener: (this: WebViewElement, ev: Event) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'consolemessage', listener: (this: WebViewElement, ev: AppendEvent<ConsoleMessageEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'contentload', listener: (this: WebViewElement, ev: Event) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'dialog', listener: (this: WebViewElement, ev: AppendEvent<DialogController>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'exit', listener: (this: WebViewElement, ev: AppendEvent<ExitEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'findupdate', listener: (this: WebViewElement, ev: AppendEvent<FindCallbackResults>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadabort', listener: (this: WebViewElement, ev: AppendEvent<LoadAbortEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadcommit', listener: (this: WebViewElement, ev: AppendEvent<LoadCommitEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadredirect', listener: (this: WebViewElement, ev: AppendEvent<LoadRedirectEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadstart', listener: (this: WebViewElement, ev: AppendEvent<LoadStartEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    /**
     * Se activa cuando se completan todas las cargas a nivel del fotograma en una página secundaria (incluidos todos sus subfotogramas). Esto incluye la navegación dentro del documento actual y las cargas a nivel del documento de subframes, pero no incluye las cargas de recursos asíncronas. Este evento se activa cada vez que la cantidad de cargas a nivel del documento pasa de una (o más) a cero. Por ejemplo, si una página ya terminó de cargarse (es decir, loadstop ya se activó una vez) crea un iframe nuevo que carga una página y, luego, se activará un segundo loadstop cuando se complete la carga de la página del iframe. Este patrón se observa comúnmente en las páginas que cargan anuncios.
     * Nota: Cuando se anula una carga confirmada, un evento loadstop seguirá a un evento loadabort, incluso si se anularon todas las cargas confirmadas desde el último evento loadstop (si hubo alguno).
     */
    addEventListener(type: 'loadstop', listener: (this: WebViewElement, ev: Event) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'newwindow', listener: (this: WebViewElement, ev: AppendEvent<NewWindow>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'permissionrequest', listener: (this: WebViewElement, ev: AppendEvent<PermissionRequest>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'responsive', listener: (this: WebViewElement, ev: Event) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'sizechanged', listener: (this: WebViewElement, ev: AppendEvent<SizeChangedEvent>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'unresponsive', listener: (this: WebViewElement, ev: Event) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'zoomchange', listener: (this: WebViewElement, ev: AppendEvent<ZoomChange>) => unknown, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}
interface ChromeWebViewElement extends WebViewElement {
    // Extiende la interfaz WebViewElement para incluir propiedades específicas de Chrome
}
type AppendEvent<T> = Event & T;
/**
 * Tipos auxiliares
 */
interface ContentWindow extends Window {
    // Representa la ventana del contenido incrustado
}

interface WebRequestEventInterface {
    // Interfaz para eventos de red
    [key: string]: unknown;
}

interface ContextMenus {
    create(properties: ContextMenuCreateProperties, callback?: () => void): string;
    update(id: string, properties: ContextMenuUpdateProperties, callback?: () => void): void;
    remove(id: string, callback?: () => void): void;
    removeAll(callback?: () => void): void;
}

interface ClearDataOptions {
    since?: number; // timestamp en milisegundos
}

interface ClearDataTypeSet {
    appcache?: boolean;
    cache?: boolean;
    cookies?: boolean;
    fileSystems?: boolean;
    indexedDB?: boolean;
    localStorage?: boolean;
    webSQL?: boolean;
}

interface InjectDetails {
    code?: string;
    file?: string;
    runAt?: 'document_start' | 'document_end' | 'document_idle';
}

interface ContentScriptDetails {
    name: string;
    matches: string[];
    css?: string[];
    js?: string[];
    runAt?: 'document_start' | 'document_end' | 'document_idle';
}

interface ContextMenuCreateProperties {
    type?: ContextType;
    title?: string;
    contexts?: string[];
    parentId?: string;
    documentUrlPatterns?: string[];
    targetUrlPatterns?: string[];
    visible?: boolean;
    onclick?: (info: unknown, tab: unknown) => void;
}

interface ContextMenuUpdateProperties {
    type?: ContextType;
    title?: string;
    contexts?: string[];
    parentId?: string;
    documentUrlPatterns?: string[];
    targetUrlPatterns?: string[];
    visible?: boolean;
}

type ContextType = 'all' | 'page' | 'frame' | 'selection' | 'link' | 'editable' | 'image' | 'video' | 'audio' | 'launcher' | 'browser_action' | 'page_action';

interface FindOptions {
    forward?: boolean;
    matchCase?: boolean;
    findNext?: boolean;
}

interface FindCallbackResults {
    numberOfMatches: number;
    activeMatchOrdinal: number;
    selectionRect: SelectionRect;
    status?: string;
}

interface SelectionRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface NewWindow {
    targetUrl: string;
    window: WebViewElement;
}

interface PermissionRequest {
    url: string;
    type: string;
    requestMethod?: string;
    callback: (allow: boolean) => void;
}

interface LoadAbortEvent {
    url: string;
    isTopLevel: boolean;
    reason: "ERR_ABORTED" | "ERR_INVALID_URL" | "ERR_DISALLOWED_URL_SCHEME" | "ERR_BLOCKED_BY_CLIENT" | "ERR_ADDRESS_UNREACHABLE" | "ERR_EMPTY_RESPONSE" | "ERR_FILE_NOT_FOUND" | "ERR_UNKNOWN_URL_SCHEME" | string;
}
interface LoadStartEvent {
    url: string;
    isTopLevel: boolean;
}
interface LoadCommitEvent extends LoadStartEvent {
}


interface LoadRedirectEvent {
    oldUrl: string;
    newUrl: string;
    isTopLevel: boolean;
}

interface ExitEvent {
    reason: 'abnormal' | 'crash' | 'kill' | 'normal' | 'out-of-memory' | 'launch-failed';
    processId: number;
}

interface SizeChangedEvent {
    oldWidth: number;
    oldHeight: number;
    newWidth: number;
    newHeight: number;
}

interface ZoomChange {
    oldZoomFactor: number;
    newZoomFactor: number;
}

type ZoomMode = 'per-origin' | 'per-view';

interface ConsoleMessageEvent {
    level: number;
    message: string;
    line: number;
    sourceId: string;
}
interface DialogController {
    cancel(): void;
    ok(response?: string): void;
}

// ==========================================
// --- html-tags.d.ts ---
// ==========================================
/// <reference lib="dom" />



/**
 * Official dictionary of HTML5 tags supported by TuJsHtml.
 * Extensively documented to guide developers on HTML5 best practices.
 * @es Diccionario oficial de etiquetas HTML5 soportadas por TuJsHtml.
 * Documentado exhaustivamente para guiar en las mejores prácticas de HTML5.
 */
interface TuJsHtml_NativeTags {
    // ==========================================================================
    // 🧩 WEB COMPONENTS & SHADOW DOM
    // ==========================================================================

    /**
     * 🧩 **Web Component Slot**: `<slot/>`
     * A placeholder inside a web component that you can fill with your own markup.
     * @es 🧩 **Espacio para Web Component**: `<slot/>`
     * Punto de inserción dentro de un Shadow DOM donde se proyectan los elementos hijos.
     * @example
     * tags.slot({ name: "titulo" }, "Título por defecto");
     */
    slot: SpecificTagFunction<HTMLSlotElement>;
    // ==========================================================================
    // 🧠 DOCUMENT METADATA (METADATOS DEL DOCUMENTO)
    // Ideales para Server-Side Rendering (SSR) y SEO
    // ==========================================================================

    /**
     * 🧠 **Metadata Element (Void)**: `<meta/>`
     * Defines metadata about an HTML document (e.g., SEO keywords, viewport, charset).
     * 🛑 **Structure Warning**: This element is void and cannot contain children.
     * @es 🧠 **Elemento de Metadatos (Vacío)**: `<meta/>`
     * Define metadatos sobre el documento HTML (ej. palabras clave SEO, viewport).
     * 🛑 **Advertencia de Estructura**: Este elemento es vacío y no admite hijos.
     * @example
     * tags.meta({ name: "description", content: "Mejor framework de UI" });
     * tags.meta({ charSet: "UTF-8" });
     */
    meta: VoidMetadataTagFunction<HTMLMetaElement>;

    /**
     * 🧠 **Document Base URL (Void)**: `<base/>`
     * Specifies the base URL/target for all relative URLs in a document.
     * @es 🧠 **URL Base del Documento (Vacío)**: `<base/>`
     * Especifica la URL base para todas las URLs relativas del documento.
     * @example
     * tags.base({ href: "https://midominio.com/", target: "_blank" });
     */
    base: VoidMetadataTagFunction<HTMLBaseElement>;

    /**
     * 🧠 **External Resource Link (Void)**: `<link/>`
     * Specifies relationships between the current document and an external resource (like CSS).
     * @es 🧠 **Enlace a Recurso Externo (Vacío)**: `<link/>`
     * Especifica la relación entre el documento actual y recursos externos (como CSS).
     * @example
     * tags.link({ rel: "stylesheet", href: "styles.css" });
     */
    link: VoidMetadataTagFunction<HTMLLinkElement>;

    /**
     * 🧠 **Document Title**: `<title/>`
     * Defines the document's title that is shown in a browser's title bar or a page's tab.
     * @es 🧠 **Título del Documento**: `<title/>`
     * Define el título del documento que se muestra en la pestaña del navegador.
     * @example
     * tags.title("Página de Inicio | Mi App");
     */
    title: MetadataTagFunction<HTMLTitleElement>;

    /**
     * 🧠 **Style Information**: `<style/>`
     * Contains style information (CSS) for a document, or part of a document.
     * @es 🧠 **Información de Estilo**: `<style/>`
     * Contiene reglas CSS para el documento.
     * @example
     * tags.style(`body { background: #000; }`);
     */
    style: MetadataTagFunction<HTMLStyleElement>;

    /**
     * 🧠 **Executable Script**: `<script/>`
     * Used to embed or reference executable code.
     * @es 🧠 **Script Ejecutable**: `<script/>`
     * Usado para incrustar o referenciar código JavaScript.
     * @example
     * tags.script({ type: "module", src: "/app.js" });
     */
    script: MetadataTagFunction<HTMLScriptElement>;

    /**
     * 🧠 **Template**: `<template/>`
     * A mechanism for holding HTML that is not to be rendered immediately.
     * @es 🧠 **Plantilla**: `<template/>`
     * Mecanismo para contener HTML que no se renderiza inmediatamente, sino que se instancia vía JS.
     */
    template: MetadataTagFunction<HTMLTemplateElement>;

    /**
     * 🧠 **No-Script**: `<noscript/>`
     * Alternate content for users that have disabled scripts in their browser.
     * @es 🧠 **Sin-Script**: `<noscript/>`
     * Contenido alternativo para usuarios con JavaScript deshabilitado.
     */
    noscript: MetadataTagFunction<HTMLElement>;

    // ==========================================================================
    // 🧱 SECTIONING & STRUCTURE (ESTRUCTURA Y SECCIONES)
    // ==========================================================================

    /**
     * 🧱 **HTML Document Root**: `<html/>`
     * Represents the root of an HTML document.
     * @es 🧱 **Raíz del Documento HTML**: `<html/>`
     * Representa el elemento raíz de un documento HTML.
     */
    html: SpecificTagFunction<HTMLHtmlElement>;

    /**
     * 🧱 **Document Head**: `<head/>`
     * Machine-readable information about the document, like its title, scripts, and style sheets.
     * @es 🧱 **Cabecera del Documento**: `<head/>`
     * Información legible por máquina sobre el documento (SEO, scripts, estilos).
     */
    head: SpecificTagFunction<HTMLHeadElement>;

    /**
     * 🧱 **Document Body**: `<body/>`
     * Represents the content of an HTML document.
     * @es 🧱 **Cuerpo del Documento**: `<body/>`
     * Representa el contenido visual de un documento HTML.
     */
    body: SpecificTagFunction<HTMLBodyElement>;

    /**
     * 🧱 **Main Content**: `<main/>`
     * Represents the dominant content of the body of a document.
     * @es 🧱 **Contenido Principal**: `<main/>`
     * Representa el contenido principal y único del documento. No debe haber más de un <main> visible.
     */
    main: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Article**: `<article/>`
     * Represents a self-contained composition in a document (e.g., a blog post).
     * @es 🧱 **Artículo**: `<article/>`
     * Representa una composición independiente y reutilizable (ej. un post de blog, un comentario).
     */
    article: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Section**: `<section/>`
     * Represents a generic standalone section of a document.
     * @es 🧱 **Sección**: `<section/>`
     * Representa una sección genérica temática del documento. Suele incluir un encabezado.
     */
    section: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Navigation**: `<nav/>`
     * Represents a section of a page whose purpose is to provide navigation links.
     * @es 🧱 **Navegación**: `<nav/>`
     * Representa una sección destinada a enlaces de navegación principales.
     */
    nav: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Header**: `<header/>`
     * Represents introductory content, typically a group of introductory or navigational aids.
     * @es 🧱 **Cabecera**: `<header/>`
     * Representa contenido introductorio o un conjunto de enlaces de navegación superiores.
     */
    header: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Footer**: `<footer/>`
     * Represents a footer for its nearest sectioning content or sectioning root element.
     * @es 🧱 **Pie de página**: `<footer/>`
     * Representa el pie de página de la sección o documento actual.
     */
    footer: SpecificTagFunction<HTMLElement>;

    /**
     * 🧱 **Heading Level 1**: `<h1/>`
     * Represents the main heading of the page. Should ideally be used only once per page.
     * @es 🧱 **Encabezado Nivel 1**: `<h1/>`
     * Representa el título principal de la página. Idealmente debe usarse solo una vez por página por SEO.
     */
    h1: SpecificTagFunction<HTMLHeadingElement>;

    /**
     * 🧱 **Heading Level 2**: `<h2/>`
     * Secondary heading used to separate major sections.
     * @es 🧱 **Encabezado Nivel 2**: `<h2/>`
     * Título secundario usado para separar secciones principales.
     */
    h2: SpecificTagFunction<HTMLHeadingElement>;

    /**
     * 🧱 **Heading Level 3**: `<h3/>`
     * Tertiary heading used for subsections.
     * @es 🧱 **Encabezado Nivel 3**: `<h3/>`
     * Título terciario usado para subsecciones.
     */
    h3: SpecificTagFunction<HTMLHeadingElement>;

    /**
     * 🧱 **Heading Levels 4, 5, 6**: `<h4/>` - `<h6/>`
     * Lower-level headings for deeply nested sections.
     * @es 🧱 **Encabezados Niveles 4, 5, 6**: `<h4/>` - `<h6/>`
     * Títulos de menor nivel para secciones profundamente anidadas.
     */
    h4: SpecificTagFunction<HTMLHeadingElement>;
    h5: SpecificTagFunction<HTMLHeadingElement>;
    h6: SpecificTagFunction<HTMLHeadingElement>;
    /**
     * 🧱 **Contact Address**: `<address/>`
     * Indicates that the enclosed HTML provides contact information for a person or people.
     * @es 🧱 **Dirección de Contacto**: `<address/>`
     * Proporciona información de contacto para el artículo más cercano o el cuerpo del documento.
     */
    address: SpecificTagFunction<HTMLElement>;

    // ==========================================================================
    // 📦 BLOCK-LEVEL CONTAINERS (CONTENEDORES DE BLOQUE)
    // ==========================================================================

    /**
     * 📦 **Generic Block Container**: `<div/>`
     * The generic container for flow content. It has no effect on the content or layout until styled.
     * @es 📦 **Contenedor Genérico de Bloque**: `<div/>`
     * Contenedor genérico para contenido de flujo. Úsalo cuando no haya una etiqueta semántica mejor.
     * @example
     * tags.div({ className: "card-body" }, ctx => ctx.p("Texto"));
     */
    div: SpecificTagFunction<HTMLDivElement>;

    /**
     * 📦 **Paragraph**: `<p/>`
     * Represents a paragraph.
     * ⚠️ **Do not nest block elements (like div) inside a p tag!**
     * @es 📦 **Párrafo**: `<p/>`
     * Representa un párrafo de texto.
     * ⚠️ **¡No anides elementos de bloque (como div) dentro de un p!**
     */
    p: SpecificTagFunction<HTMLParagraphElement>;

    /**
     * 🛑 **Horizontal Rule (Void)**: `<hr/>`
     * Represents a thematic break between paragraph-level elements.
     * @es 🛑 **Línea Horizontal (Vacío)**: `<hr/>`
     * Representa una ruptura temática visual (línea). No admite hijos.
     */
    hr: VoidTagFunction<HTMLHRElement>;

    /**
     * 📦 **Preformatted Text**: `<pre/>`
     * Represents preformatted text which is to be presented exactly as written in the HTML file.
     * @es 📦 **Texto Preformateado**: `<pre/>`
     * Muestra el texto exactamente como fue escrito, respetando espacios y saltos de línea.
     */
    pre: SpecificTagFunction<HTMLPreElement>;

    /**
     * 📦 **Blockquote**: `<blockquote/>`
     * Indicates that the enclosed text is an extended quotation.
     * @es 📦 **Cita en Bloque**: `<blockquote/>`
     * Indica que el texto interior es una cita extensa.
     */
    blockquote: SpecificTagFunction<HTMLElementExtended>; // Using your extended type

    /**
     * 📦 **Unordered List**: `<ul/>`
     * Represents a list of items, where the order of the items is not important.
     * @es 📦 **Lista Desordenada**: `<ul/>`
     * Representa una lista de elementos sin orden estricto (viñetas).
     */
    ul: SpecificTagFunction<HTMLUListElement>;

    /**
     * 📦 **Ordered List**: `<ol/>`
     * Represents a list of items, where the items have been intentionally ordered.
     * @es 📦 **Lista Ordenada**: `<ol/>`
     * Representa una lista numerada.
     */
    ol: SpecificTagFunction<HTMLOListElement>;

    /**
     * 📦 **List Item**: `<li/>`
     * Represents an item in a list. Must be contained in a parent `<ul>`, `<ol>`, or `<menu>`.
     * @es 📦 **Elemento de Lista**: `<li/>`
     * Representa un ítem dentro de una lista (`ul` u `ol`).
     */
    li: SpecificTagFunction<HTMLLIElement>;

    /**
     * 📦 **Description List**: `<dl/>`
     * Encloses a list of groups of terms and descriptions.
     * @es 📦 **Lista de Descripciones**: `<dl/>`
     * Contenedor para una lista de términos y sus descripciones.
     */
    dl: SpecificTagFunction<HTMLDListElement>;

    /**
     * 📦 **Description Term**: `<dt/>`
     * Specifies a term in a description or definition list.
     * @es 📦 **Término de Descripción**: `<dt/>`
     * Especifica el término a definir dentro de un `<dl>`.
     */
    dt: SpecificTagFunction<HTMLElement>;

    /**
     * 📦 **Description Details**: `<dd/>`
     * Provides the details or the definition of the preceding term (`<dt>`).
     * @es 📦 **Detalle de Descripción**: `<dd/>`
     * Proporciona la definición del término que lo precede.
     */
    dd: SpecificTagFunction<HTMLElement>;

    /**
     * 📦 **Figure**: `<figure/>`
     * Represents self-contained content, frequently with a caption (`<figcaption>`).
     * @es 📦 **Figura**: `<figure/>`
     * Representa contenido independiente, generalmente con una leyenda (`<figcaption>`).
     */
    figure: SpecificTagFunction<HTMLElement>;

    /**
     * 📦 **Figure Caption**: `<figcaption/>`
     * Represents a caption or legend for the rest of the contents of the `<figure>`.
     * @es 📦 **Leyenda de Figura**: `<figcaption/>`
     * Representa la leyenda de los contenidos de un elemento `<figure>`.
     */
    figcaption: SpecificTagFunction<HTMLElement>;


    // ==========================================================================
    // 📝 INLINE TEXT SEMANTICS (SEMÁNTICA DE TEXTO EN LÍNEA)
    // ==========================================================================

    /**
     * 📝 **Anchor / Hyperlink**: `<a/>`
     * Creates a hyperlink to web pages, files, email addresses, etc.
     * @es 📝 **Enlace / Hipervínculo**: `<a/>`
     * Crea un enlace interactivo hacia otra URL.
     */
    a: SpecificTagFunction<HTMLAnchorElement>;

    /**
     * 📝 **Generic Inline Container**: `<span/>`
     * A generic inline container for phrasing content.
     * @es 📝 **Contenedor Genérico en Línea**: `<span/>`
     * Agrupa texto sin aportar significado semántico adicional. Ideal para aplicar CSS.
     */
    span: SpecificTagFunction<HTMLSpanElement>;

    /**
     * 🛑 **Line Break (Void)**: `<br/>`
     * Produces a line break in text (carriage-return).
     * @es 🛑 **Salto de Línea (Vacío)**: `<br/>`
     * Fuerza un salto de línea en el texto.
     */
    br: VoidTagFunction<HTMLBRElement>;

    /**
     * 🛑 **Word Break Opportunity (Void)**: `<wbr/>`
     * Represents a word break opportunity for the browser.
     * @es 🛑 **Oportunidad de Salto (Vacío)**: `<wbr/>`
     * Indica al navegador un lugar seguro para romper una palabra larga si es necesario.
     */
    wbr: VoidTagFunction<HTMLElement>;

    /**
     * 📝 **Strong Importance**: `<strong/>`
     * Indicates that its contents have strong importance (usually rendered bold).
     * @es 📝 **Importancia Fuerte**: `<strong/>`
     * Indica texto con gran importancia o urgencia.
     */
    strong: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Bring Attention To**: `<b/>`
     * Used to draw the reader's attention (rendered bold) without extra semantic importance.
     * @es 📝 **Llamar la Atención**: `<b/>`
     * Texto estilizado en negrita por propósitos utilitarios.
     */
    b: SpecificTagFunction<HTMLElementExtended>;

    /**
     * 📝 **Emphasis**: `<em/>`
     * Marks text that has stress emphasis (usually rendered italic).
     * @es 📝 **Énfasis**: `<em/>`
     * Marca texto con énfasis verbal.
     */
    em: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Idiomatic Text**: `<i/>`
     * Represents a range of text set off from normal text (like technical terms or icons).
     * @es 📝 **Texto Idiomático**: `<i/>`
     * Texto itálico para términos técnicos, extranjerismos o iconos (ej. FontAwesome).
     */
    i: SpecificTagFunction<HTMLElementExtended>;

    /**
     * 📝 **Code Fragment**: `<code/>`
     * Displays a short fragment of computer code.
     * @es 📝 **Fragmento de Código**: `<code/>`
     * Muestra código fuente (usualmente monoespaciado).
     */
    code: SpecificTagFunction<HTMLElementExtended>;

    /**
     * 📝 **Mark/Highlight Text**: `<mark/>`
     * Represents text which is marked or highlighted for reference.
     * @es 📝 **Texto Resaltado**: `<mark/>`
     * Representa texto resaltado o marcado como referencia.
     */
    mark: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Time**: `<time/>`
     * Represents a specific period in time. Use the `datetime` attribute.
     * @es 📝 **Tiempo**: `<time/>`
     * Representa un periodo de tiempo específico (fecha/hora).
     */
    time: SpecificTagFunction<HTMLTimeElement>;

    /**
     * 📝 **Small Text**: `<small/>`
     * Represents side-comments and small print, like copyright and legal text.
     * @es 📝 **Texto Pequeño**: `<small/>`
     * Representa comentarios laterales o letra pequeña (copyright, legal).
     */
    small: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Strikethrough (Incorrect)**: `<s/>`
     * Renders text with a strikethrough. Use to represent things that are no longer relevant.
     * @es 📝 **Texto Tachado**: `<s/>`
     * Representa cosas que ya no son relevantes o precisas.
     */
    s: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Underline**: `<u/>`
     * Represents text with an unarticulated annotation (usually underlined).
     * @es 📝 **Subrayado**: `<u/>`
     * Texto subrayado (usar con precaución para no confundir con enlaces).
     */
    u: SpecificTagFunction<HTMLElementExtended>;

    /**
     * 📝 **Inline Quotation**: `<q/>`
     * Indicates that the enclosed text is a short inline quotation.
     * @es 📝 **Cita en Línea**: `<q/>`
     * Indica una cita corta dentro de la misma línea (el navegador añade comillas automáticamente).
     */
    q: SpecificTagFunction<HTMLQuoteElement>;

    /**
     * 📝 **Abbreviation**: `<abbr/>`
     * Represents an abbreviation or acronym (use `title` for the full string).
     * @es 📝 **Abreviatura**: `<abbr/>`
     * Representa un acrónimo o abreviatura.
     */
    abbr: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Citation**: `<cite/>`
     * Represents a reference to a creative work.
     * @es 📝 **Cita de Obra**: `<cite/>`
     * Referencia el título de una obra creativa (libro, película, canción).
     */
    cite: SpecificTagFunction<HTMLElement>;
    /**
     * 📝 **Subscript**: `<sub/>`
     * Specifies inline text which should be displayed as subscript for solely typographical reasons.
     * @es 📝 **Subíndice**: `<sub/>`
     * Texto tipográfico más pequeño situado debajo de la línea base (ej. fórmulas químicas como H₂O).
     */
    sub: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Superscript**: `<sup/>`
     * Specifies inline text which is to be displayed as superscript for solely typographical reasons.
     * @es 📝 **Superíndice**: `<sup/>`
     * Texto tipográfico más pequeño situado por encima de la línea base (ej. x² o notas al pie).
     */
    sup: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Keyboard Input**: `<kbd/>`
     * Represents a span of inline text denoting textual user input from a keyboard.
     * @es 📝 **Entrada de Teclado**: `<kbd/>`
     * Representa una entrada de teclado del usuario (ej. presiona <kbd>Ctrl</kbd> + <kbd>C</kbd>).
     */
    kbd: SpecificTagFunction<HTMLElement>;

    /**
     * 📝 **Machine-Readable Data**: `<data/>`
     * Links a given piece of content with a machine-readable translation.
     * @es 📝 **Dato Legible por Máquina**: `<data/>`
     * Asocia un valor legible por humanos con un valor legible por máquinas (usando el atributo `value`).
     */
    data: SpecificTagFunction<HTMLDataElement>;

    // ==========================================================================
    // 🖼️ MEDIA & EMBEDDED CONTENT (CONTENIDO MULTIMEDIA)
    // ==========================================================================

    /**
     * 🛑 **Image (Void)**: `<img/>`
     * Embeds an image into the document.
     * @es 🛑 **Imagen (Vacío)**: `<img/>`
     * Incrusta una imagen. No admite hijos.
     * @example
     * tags.img({ src: "logo.png", alt: "Logotipo" });
     */
    img: VoidTagFunction<HTMLImageElement>;

    /**
     * 🖼️ **Video Player**: `<video/>`
     * Embeds a media player which supports video playback.
     * @es 🖼️ **Reproductor de Video**: `<video/>`
     * Incrusta un reproductor de video.
     */
    video: SpecificTagFunction<HTMLVideoElement>;

    /**
     * 🖼️ **Audio Player**: `<audio/>`
     * Embeds sound content in documents.
     * @es 🖼️ **Reproductor de Audio**: `<audio/>`
     * Incrusta un reproductor de audio.
     */
    audio: SpecificTagFunction<HTMLAudioElement>;

    /**
     * 🛑 **Media Source (Void)**: `<source/>`
     * Specifies multiple media resources for `<picture>`, `<audio>`, and `<video>`.
     * @es 🛑 **Fuente de Medios (Vacío)**: `<source/>`
     * Especifica múltiples archivos para elementos multimedia.
     */
    source: VoidTagFunction<HTMLSourceElement>;

    /**
     * 🛑 **Text Track (Void)**: `<track/>`
     * Specifies timed text tracks (subtitles) for media elements.
     * @es 🛑 **Pista de Texto (Vacío)**: `<track/>`
     * Especifica subtítulos o descripciones para video/audio.
     */
    track: VoidTagFunction<HTMLTrackElement>;

    /**
     * 🖼️ **Picture**: `<picture/>`
     * Contains `<source>` elements and one `<img>` to offer alternative image versions.
     * @es 🖼️ **Imagen Responsiva**: `<picture/>`
     * Contenedor para imágenes responsivas y modernas.
     */
    picture: SpecificTagFunction<HTMLPictureElement>;

    /**
     * 🛑 **Embed External Content (Void)**: `<embed/>`
     * Embeds external content at the specified point in the document.
     * @es 🛑 **Incrustar Contenido Externo (Vacío)**: `<embed/>`
     * Incrusta plugins interactivos externos.
     */
    embed: VoidTagFunction<HTMLEmbedElement>;

    /**
     * 🖼️ **Object**: `<object/>`
     * Represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.
     * @es 🖼️ **Objeto Externo**: `<object/>`
     * Incrusta recursos externos (PDFs, SVGs interactivos).
     */
    object: SpecificTagFunction<HTMLObjectElement>;

    /**
     * 🛑 **Image Map Area (Void)**: `<area/>`
     * Defines a hot-spot region on an image, and optionally associates it with a hyperlink.
     * @es 🛑 **Área de Mapa de Imagen (Vacío)**: `<area/>`
     * Define un área clicable dentro de un mapa de imagen (`<map>`).
     */
    area: VoidTagFunction<HTMLAreaElement>;

    /**
     * 🖼️ **Image Map**: `<map/>`
     * Used with `<area>` elements to define an image map.
     * @es 🖼️ **Mapa de Imagen**: `<map/>`
     * Contenedor para definir áreas clicables sobre una imagen.
     */
    map: SpecificTagFunction<HTMLMapElement>;

    /**
     * 🖼️ **Inline Frame**: `<iframe/>`
     * Represents a nested browsing context (embedding another HTML page).
     * @es 🖼️ **Marco en Línea**: `<iframe/>`
     * Incrusta una página web externa dentro de la actual.
     */
    iframe: SpecificTagFunction<HTMLIFrameElement>;

    /**
     * 🖼️ **Canvas**: `<canvas/>`
     * Used to draw graphics, on the fly, via scripting (usually JavaScript).
     * @es 🖼️ **Lienzo Gráfico**: `<canvas/>`
     * Área para dibujar gráficos dinámicos 2D/3D mediante JavaScript.
     */
    canvas: SpecificTagFunction<HTMLCanvasElement>;


    // ==========================================================================
    // 📊 TABLE ELEMENTS (ELEMENTOS DE TABLA)
    // ==========================================================================

    /**
     * 📊 **Table**: `<table/>`
     * Represents tabular data (information presented in a two-dimensional table).
     * @es 📊 **Tabla**: `<table/>`
     * Representa datos tabulares en filas y columnas.
     */
    table: SpecificTagFunction<HTMLTableElement>;

    /**
     * 📊 **Table Caption**: `<caption/>`
     * Specifies the caption (or title) of a table. Must be the first child of a `<table>`.
     * @es 📊 **Título de la Tabla**: `<caption/>`
     * Especifica el título o leyenda de la tabla.
     */
    caption: SpecificTagFunction<HTMLTableCaptionElement>;

    /**
     * 📊 **Table Header Group**: `<thead/>`
     * Defines a set of rows defining the head of the columns of the table.
     * @es 📊 **Cabecera de Tabla**: `<thead/>`
     * Agrupa las filas de encabezado de una tabla.
     */
    thead: SpecificTagFunction<HTMLTableSectionElement>;

    /**
     * 📊 **Table Body Group**: `<tbody/>`
     * Encapsulates a set of table rows (`<tr>`), indicating that they comprise the body of the table.
     * @es 📊 **Cuerpo de Tabla**: `<tbody/>`
     * Agrupa las filas de datos principales de la tabla.
     */
    tbody: SpecificTagFunction<HTMLTableSectionElement>;

    /**
     * 📊 **Table Footer Group**: `<tfoot/>`
     * Defines a set of rows summarizing the columns of the table.
     * @es 📊 **Pie de Tabla**: `<tfoot/>`
     * Agrupa las filas de resumen en la parte inferior de la tabla.
     */
    tfoot: SpecificTagFunction<HTMLTableSectionElement>;

    /**
     * 📊 **Table Row**: `<tr/>`
     * Defines a row of cells in a table.
     * @es 📊 **Fila de Tabla**: `<tr/>`
     * Define una fila dentro de la tabla (contiene `<th>` o `<td>`).
     */
    tr: SpecificTagFunction<HTMLTableRowElement>;

    /**
     * 📊 **Table Data Cell**: `<td/>`
     * Defines a cell of a table that contains data.
     * @es 📊 **Celda de Datos**: `<td/>`
     * Define una celda estándar dentro de una fila.
     */
    td: SpecificTagFunction<HTMLTableCellElement>;

    /**
     * 📊 **Table Header Cell**: `<th/>`
     * Defines a cell as header of a group of table cells.
     * @es 📊 **Celda de Encabezado**: `<th/>`
     * Define una celda de título (se muestra en negrita y centrada por defecto).
     */
    th: SpecificTagFunction<HTMLTableCellElement>;

    /**
     * 📊 **Column Group**: `<colgroup/>`
     * Defines a group of columns within a table.
     * @es 📊 **Grupo de Columnas**: `<colgroup/>`
     * Agrupa elementos `<col>` para aplicar estilos o configuraciones comunes.
     */
    colgroup: SpecificTagFunction<HTMLTableColElement>;

    /**
     * 🛑 **Column Definition (Void)**: `<col/>`
     * Defines column properties for each column within a `<colgroup>`.
     * @es 🛑 **Definición de Columna (Vacío)**: `<col/>`
     * Define propiedades para columnas específicas. No admite hijos.
     */
    col: VoidTagFunction<HTMLTableColElement>;


    // ==========================================================================
    // 📝 FORMS & INTERACTIVE (FORMULARIOS E INTERACTIVIDAD)
    // ==========================================================================

    /**
     * 📝 **Form**: `<form/>`
     * Represents a document section containing interactive controls for submitting information.
     * @es 📝 **Formulario**: `<form/>`
     * Contenedor principal para controles interactivos y envío de datos.
     */
    form: SpecificTagFunction<HTMLFormElement>;

    /**
     * 🛑 **Input Control (Void)**: `<input/>`
     * Used to create interactive controls for web-based forms.
     * @es 🛑 **Control de Entrada (Vacío)**: `<input/>`
     * Campo de entrada de texto, checkbox, radio, etc. ¡No admite hijos!
     */
    input: VoidTagFunction<HTMLInputElementExtended>;

    /**
     * 📝 **Button**: `<button/>`
     * An interactive element activated by a user with a mouse, keyboard, etc.
     * @es 📝 **Botón**: `<button/>`
     * Botón interactivo que puede contener iconos y texto.
     */
    button: SpecificTagFunction<HTMLButtonElement>;

    /**
     * 📝 **Text Area**: `<textarea/>`
     * Represents a multi-line plain-text editing control.
     * @es 📝 **Área de Texto**: `<textarea/>`
     * Control de entrada de texto de múltiples líneas.
     */
    textarea: SpecificTagFunction<HTMLTextAreaElement>;

    /**
     * 📝 **Select Dropdown**: `<select/>`
     * Represents a control that provides a menu of options.
     * @es 📝 **Menú Desplegable**: `<select/>`
     * Control que ofrece múltiples opciones (requiere hijos `<option>`).
     */
    select: SpecificTagFunction<HTMLSelectElement>;

    /**
     * 📝 **Option**: `<option/>`
     * Used to define an item contained in a `<select>`, `<optgroup>`, or `<datalist>`.
     * @es 📝 **Opción**: `<option/>`
     * Elemento individual dentro de un menú desplegable.
     */
    option: SpecificTagFunction<HTMLOptionElement>;

    /**
     * 📝 **Option Group**: `<optgroup/>`
     * Creates a grouping of options within a `<select>` element.
     * @es 📝 **Grupo de Opciones**: `<optgroup/>`
     * Agrupa elementos `<option>` de manera lógica bajo un mismo título.
     */
    optgroup: SpecificTagFunction<HTMLOptGroupElement>;

    /**
     * 📝 **Input Label**: `<label/>`
     * Represents a caption for an item in a user interface.
     * @es 📝 **Etiqueta de Control**: `<label/>`
     * Texto descriptivo asociado a un input (mejora la accesibilidad).
     */
    label: SpecificTagFunction<HTMLLabelElement>;

    /**
     * 📝 **Field Set**: `<fieldset/>`
     * Used to group several controls as well as labels (`<legend>`) within a web form.
     * @es 📝 **Agrupación de Campos**: `<fieldset/>`
     * Agrupa controles interactivos y etiquetas dentro de un formulario.
     */
    fieldset: SpecificTagFunction<HTMLFieldSetElement>;

    /**
     * 📝 **Legend**: `<legend/>`
     * Represents a caption for the content of its parent `<fieldset>`.
     * @es 📝 **Leyenda de Campo**: `<legend/>`
     * Representa el título o leyenda para un `<fieldset>`.
     */
    legend: SpecificTagFunction<HTMLLegendElement>;

    /**
     * 📝 **Data List**: `<datalist/>`
     * Contains a set of `<option>` elements that represent the permissible or recommended options available for an `<input>`.
     * @es 📝 **Lista de Datos**: `<datalist/>`
     * Proporciona sugerencias de autocompletado para un `<input>`.
     */
    datalist: SpecificTagFunction<HTMLDataListElement>;

    /**
     * 📝 **Output**: `<output/>`
     * Container element into which a site or app can inject the results of a calculation or the outcome of a user action.
     * @es 📝 **Salida Calculada**: `<output/>`
     * Muestra el resultado de un cálculo o acción del usuario en un formulario.
     */
    output: SpecificTagFunction<HTMLOutputElement>;

    /**
     * 📝 **Progress Indicator**: `<progress/>`
     * Displays an indicator showing the completion progress of a task.
     * @es 📝 **Barra de Progreso**: `<progress/>`
     * Muestra el progreso de finalización de una tarea.
     */
    progress: SpecificTagFunction<HTMLProgressElement>;

    /**
     * 📝 **Meter**: `<meter/>`
     * Represents a scalar value within a known range, or a fractional value (e.g., disk usage).
     * @es 📝 **Medidor Escalar**: `<meter/>`
     * Representa un valor dentro de un rango conocido (ej. uso de disco). No confundir con progreso.
     */
    meter: SpecificTagFunction<HTMLMeterElement>;

    /**
     * 🖱️ **Details Disclosure**: `<details/>`
     * Creates a disclosure widget in which information is visible only when the widget is toggled into an "open" state.
     * @es 🖱️ **Desplegable de Detalles**: `<details/>`
     * Widget nativo que oculta información hasta que el usuario lo expande.
     */
    details: SpecificTagFunction<HTMLDetailsElement>;

    /**
     * 🖱️ **Details Summary**: `<summary/>`
     * Specifies a summary, caption, or legend for a `<details>` element's disclosure box.
     * @es 🖱️ **Resumen de Detalles**: `<summary/>`
     * El título visible o pestaña clicable de un elemento `<details>`.
     */
    summary: SpecificTagFunction<HTMLElement>;

    /**
     * 🖱️ **Dialog Box**: `<dialog/>`
     * Represents a dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
     * @es 🖱️ **Cuadro de Diálogo**: `<dialog/>`
     * Modal nativo, alerta interactiva o ventana emergente.
     */
    dialog: SpecificTagFunction<HTMLDialogElement>;


    // ==========================================================================
    // 💀 OBSOLETE ELEMENTS (OBSOLETOS - NO USAR)
    // ==========================================================================

    /**
     * 💀 **OBSOLETE**: `<marquee/>`
     * @deprecated 🚨 ¡NO USAR! This tag was removed from the HTML5 standard. 
     * @es 💀 **OBSOLETO**: `<marquee/>`
     * @deprecated 🚨 ¡NO USAR! Etiqueta eliminada de HTML5. Usa animaciones CSS.
     */
    marquee: SpecificTagFunction<HTMLMarqueeElement>;

    /**
     * 💀 **OBSOLETE**: `<center/>`
     * @deprecated 🚨 ¡NO USAR! Use CSS `text-align: center` or Flexbox instead.
     * @es 💀 **OBSOLETO**: `<center/>`
     * @deprecated 🚨 ¡NO USAR! Usa CSS para centrar elementos.
     */
    center: SpecificTagFunction<HTMLElement>;

    /**
     * 💀 **OBSOLETE**: `<font/>`
     * @deprecated 🚨 ¡NO USAR! Use CSS properties like `color` or `font-size`.
     * @es 💀 **OBSOLETO**: `<font/>`
     * @deprecated 🚨 ¡NO USAR! Etiqueta eliminada. Usa clases CSS.
     */
    font: SpecificTagFunction<HTMLElement>;
    // ==========================================================================
    // ✍️ EDITS & TRACK CHANGES (EDICIONES DE TEXTO)
    // ==========================================================================

    /**
     * ✍️ **Deleted Text**: `<del/>`
     * Represents a range of text that has been deleted from a document.
     * @es ✍️ **Texto Eliminado**: `<del/>`
     * Representa texto que ha sido borrado (suele renderizarse tachado). Usado para control de cambios.
     */
    del: SpecificTagFunction<HTMLModElement>;

    /**
     * ✍️ **Inserted Text**: `<ins/>`
     * Represents a range of text that has been added to a document.
     * @es ✍️ **Texto Insertado**: `<ins/>`
     * Representa texto que ha sido añadido (suele renderizarse subrayado). Usado junto a `<del>`.
     */
    ins: SpecificTagFunction<HTMLModElement>;
}

// ==========================================
// --- svg-tags.d.ts ---
// ==========================================
/// <reference lib="dom" />

// 1. Limpiamos las propiedades nativas de JS
type ValidSvgTags = keyof Omit<TuJsHtml_SvgContext,
    'prototype' | 'apply' | 'call' | 'bind' | 'length' | 'name' | 'arguments' | 'caller' | 'toString'>;
// ==========================================================================
// 🎨 CORE DEL ECOSISTEMA SVG (Ultrastricto)
// ==========================================================================

/**
 * Nodos recursivos para contenedores SVG puros.
 * 🛑 ¡ATENCIÓN!: Se han eliminado `string` y `number`. 
 * En SVG, el texto solo es válido dentro de la etiqueta `<text>`.
 * @es Previene inyectar texto huérfano dentro de etiquetas como `<g>` o `<svg>`.
 */
type SvgRecursiveNode<TRoot extends SVGElement = SVGElement> =
    | Node
    | SuperElementClass<SVGElement>
    | TuJsHtml_SvgCallback<TRoot>;

/**
 * Callback estricto para entornos SVG.
 */
type TuJsHtml_SvgCallback<TRoot extends SVGElement = SVGElement> = (
    //svg: TuJsHtml_SvgContext<TRoot>,
    svg: TuJsHtml_SvgProxy<TRoot>,
    currentElement: SuperElementClass<TRoot>
) => unknown;

/**
 * 1. 📦 FÁBRICA CONTENEDORA (Container Tag)
 * Admite hijos (nodos, callbacks), pero NO admite texto primitivo (strings/numbers).
 */
interface SvgContainerTagFunction<TElement extends SVGElement> {
    //(config: ConfigureAttributes<TElement>, ...args: SvgRecursiveNode<TElement>[]): SuperElementClass<TElement>;
    <TConfig extends Record<string, unknown>>(
        config: ValidatedConfig<TConfig, TElement>,
        ...args: SvgTextRecursiveNode<TElement>[]
    ): SuperElementClass<TElement>;
    (...args: SvgRecursiveNode<TElement>[]): SuperElementClass<TElement>;
}

/**
 * 2. 🛑 FÁBRICA VACÍA (Void Tag)
 * Elementos de dibujo vectorial puro. NO admiten hijos de ningún tipo.
 * Solo aceptan su objeto de configuración.
 */
interface SvgVoidTagFunction<TElement extends SVGElement> {
    //(config?: ConfigureAttributes<TElement>): SuperElementClass<TElement>;
    <TConfig extends Record<string, unknown>>(
        config?: ValidatedConfig<TConfig, TElement>
    ): SuperElementClass<TElement>;
}
/**
 * Nodos permitidos en elementos de texto.
 * Hereda los nodos normales de SVG y le suma permisos para strings/numbers.
 */
type SvgTextRecursiveNode<TRoot extends SVGElement = SVGElement> =
    | SvgRecursiveNode<TRoot>
    | string
    | number;
/**
 * 3. 📝 FÁBRICA DE TEXTO (Text Tag)
 * Las ÚNICAS etiquetas de SVG que tienen permiso para recibir strings, numbers y Template Literals.
 */
// export interface SvgTextTagFunction<TElement extends SVGElement> {
//     // (config: ConfigureAttributes<TElement>, ...args: (SvgRecursiveNode<TElement> | string | number)[]): SuperElementClass<TElement>;
//     // (...args: (SvgRecursiveNode<TElement> | string | number)[]): SuperElementClass<TElement>;
//     // (template: TemplateStringsArray, ...values: unknown[]): SuperElementClass<TElement>;
//     //(config: ConfigureAttributes<TElement>, ...args: SvgTextRecursiveNode<TElement>[]): SuperElementClass<TElement>;
//     <TConfig extends Record<string, unknown>>(
//         config: ValidatedConfig<TConfig, TElement>,
//         ...args: SvgTextRecursiveNode<TElement>[]
//     ): SuperElementClass<TElement>;
//     (...args: SvgTextRecursiveNode<TElement>[]): SuperElementClass<TElement>;
//     (template: TemplateStringsArray, ...values: unknown[]): SuperElementClass<TElement>;
// }
// =========================================================================
// 🧹 ALIAS LOCALES (Shorthands para no ensuciar el código)
// =========================================================================
//type TuConfig = unknown;
type Cfg<C, T extends Element = SVGElement> = ValidatedConfig<C, T>;
type NodosTxt<T extends SVGElement> = SvgTextRecursiveNode<T>[];
type Ret<T extends SVGElement> = SuperElementClass<T>;
// ==========================================================================
// 🎨 DICCIONARIO DE ETIQUETAS SVG (CONTEXTO AISLADO)
// ==========================================================================

// export type SvgTextValidArgs<TElement extends SVGElement, TConfig> =
//     | [config: ValidatedConfig<TConfig, TElement>, ...nodes: SvgTextRecursiveNode<TElement>[]]
//     | [...nodes: SvgTextRecursiveNode<TElement>[]]
//     | [template: TemplateStringsArray, ...values: unknown[]];
// 2. Definimos el mensaje estandarizado para esta etiqueta

interface SvgTextTagFunction<TEl extends SVGElement> {
    /**
     * 📝 **Fábrica de Texto SVG**
     * @example
     * svg.text({ "@attrs": { x: 10,fill:"red"  } }, "Hola")
     * svg.tspan({ "@attrs": { x: 10 } }, "hello"," ",1)
     */
    <C>(config: Cfg<C, TEl>, ...args: NodosTxt<TEl>): Ret<TEl>;
    /**
     * 📝 **Fábrica de Texto SVG (Directo)**
     * @example
     * svg.text("Mundo")
     * svg.tspan("hello World"," ",varname_1," ",1}
     */
    (...args: NodosTxt<TEl>): Ret<TEl>;
    /**
     * 📝 **Fábrica de Texto SVG (Template)**
     * @example 
     * svg.text`Hola Mundo`
     * svg.tspan`hello World ${varname_1}`
     */
    (template: TemplateStringsArray, ...values: unknown[]): Ret<TEl>;
    /**
     * 📝 **Fábrica de Texto SVG**
     * @example text({ x: 10, y: 20 }, "Hola")
     * @example text("Mundo")
     * @example text`Hola Mundo`
     */
    // <TConfig extends Record<string, unknown>, TArgs extends unknown[]>(
    //     ...args: ValidateFunctionArgs<TArgs, SvgTextValidArgs<TElement, TConfig>, TextErrorMsg>
    // ): SuperElementClass<TElement>;
    // <TConfig extends Record<string, any>, TArgs extends any[]>(
    //     ...args: TArgs extends SvgTextValidArgs<TElement, TConfig>
    //         ? TArgs // ✅ Si es válido, déjalo pasar
    //         : [error: "🛑 ARGUMENTOS INVÁLIDOS: Esperaba un objeto de configuración {@attrs}, nodos de texto, o un template string."] // ❌ Si es inválido, inyecta el veneno
    // ): SuperElementClass<TElement>;
}
/**
 * 🎨 **Contexto de Etiquetas SVG (Proxy SVG)**
 * Expone etiquetas con un control semántico absoluto sobre lo que pueden contener.
 */
interface TuJsHtml_SvgContext<TRoot extends SVGElement = SVGElement> {

    /** Permite anidar elementos al root actual, prohibiendo texto flotante */
    (...args: SvgRecursiveNode<TRoot>[]): TRoot;
    // =========================================================================
    // 🛑 LIMPIEZA DE AUTOCOMPLETADO (FUNCTION SHADOWING)
    // =========================================================================
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    prototype: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    apply: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    call: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    bind: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    length: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    name: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    arguments: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    caller: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    toString: never;
    // ----------------------------------------------------------------------
    // 🛑 ELEMENTOS DE DIBUJO (VACÍOS / VOID)
    // ----------------------------------------------------------------------

    /**
     * 🛑 **SVG Path (Void)**: `<path/>`
     * The most powerful drawing element. Cannot have children.
     * @es 🛑 **Ruta SVG (Vacío)**: `<path/>`
     * El elemento de dibujo vectorial más potente. ¡No admite hijos!
     * @example
     * svg.path({ d: "M20 60 L120 20", stroke: "green", fill: "transparent" });
     */
    path: SvgVoidTagFunction<SVGPathElement>;

    /**
     * 🛑 **SVG Circle (Void)**: `<circle/>`
     * @es 🛑 **Círculo SVG (Vacío)**: `<circle/>`
     * @example
     * svg.circle({ cx: 50, cy: 50, r: 40, fill: "blue" });
     */
    circle: SvgVoidTagFunction<SVGCircleElement>;

    /**
     * 🛑 **SVG Rectangle (Void)**: `<rect/>`
     * @es 🛑 **Rectángulo SVG (Vacío)**: `<rect/>`
     * @example
     * svg.rect({ x: 10, y: 10, width: 100, height: 50, rx: 5 });
     */
    rect: SvgVoidTagFunction<SVGRectElement>;

    /**
     * 🛑 **SVG Line (Void)**: `<line/>`
     * @es 🛑 **Línea SVG (Vacío)**: `<line/>`
     */
    line: SvgVoidTagFunction<SVGLineElement>;

    /**
     * 🛑 **SVG Polygon (Void)**: `<polygon/>`
     * @es 🛑 **Polígono SVG (Vacío)**: `<polygon/>`
     * @example
     * svg.polygon({ points: "50,15 100,100 0,100", fill: "gold" });
     */
    polygon: SvgVoidTagFunction<SVGPolygonElement>;

    /**
     * 🛑 **SVG Ellipse (Void)**: `<ellipse/>`
     * @es 🛑 **Elipse SVG (Vacío)**: `<ellipse/>`
     */
    ellipse: SvgVoidTagFunction<SVGEllipseElement>;

    /**
     * 🛑 **SVG Use (Void)**: `<use/>`
     * Clones nodes from within the SVG. Cannot have direct children.
     * @es 🛑 **Reutilizar SVG (Vacío)**: `<use/>`
     * Clona y dibuja un elemento referenciado. ¡No admite hijos!
     * @example
     * svg.use({ href: "#miPatron", x: 50, y: 50 });
     */
    use: SvgVoidTagFunction<SVGUseElement>;


    // ----------------------------------------------------------------------
    // 📦 ELEMENTOS CONTENEDORES (SIN TEXTO)
    // ----------------------------------------------------------------------

    /**
     * 📦 **SVG Group (Container)**: `<g/>`
     * Groups SVG elements. Rejects raw strings/numbers.
     * @es 📦 **Grupo SVG (Contenedor)**: `<g/>`
     * Agrupa elementos SVG. 🚫 Rechaza strings y numbers huérfanos.
     * @example
     * svg.g({ transform: "translate(50, 50)" }, gCtx => {
     * gCtx.circle({ r: 20 });
     * // gCtx("Hola") -> ❌ Error de TypeScript: Texto no permitido aquí.
     * });
     */
    g: SvgContainerTagFunction<SVGGElement>;

    /**
     * 📦 **SVG Definitions (Container)**: `<defs/>`
     * Stores graphical objects.
     * @es 📦 **Definiciones SVG (Contenedor)**: `<defs/>`
     * Almacena elementos gráficos ocultos (gradientes, máscaras).
     */
    defs: SvgContainerTagFunction<SVGDefsElement>;

    /**
     * 🌉 **SVG Foreign Object (Container)**: `<foreignObject/>`
     * @es 🌉 **Objeto Foráneo SVG**: `<foreignObject/>`
     * Permite incrustar un entorno HTML. No admite texto directo, requiere nodos.
     */
    foreignObject: SvgContainerTagFunction<SVGForeignObjectElement>;


    // ----------------------------------------------------------------------
    // 📝 ELEMENTOS DE TEXTO (LOS ÚNICOS QUE ADMITEN STRINGS/NUMBERS)
    // ----------------------------------------------------------------------

    /**
     * 📝 **SVG Text**: `<text/>`
     * The ONLY base SVG element that should accept text nodes.
     * @es 📝 **Texto SVG**: `<text/>`
     * El ÚNICO elemento base de SVG que acepta libremente `string` o `number`.
     * @example
     * svg.text({ x: 10, y: 40, fill: "black" }, "Hola SVG: ", 2026);
     * svg.text`Usando Template Literals directamente!`;
     */
    //text: SvgTextTagFunction<SVGTextElement>;
    text: SvgTextTagFunction<TRoot>
    /**
     * 📝 **SVG Text Span**: `<tspan/>`
     * Used to format individual pieces of text inside a `<text>` element.
     * @es 📝 **Tramo de Texto SVG**: `<tspan/>`
     * Se usa dentro de `<text>` para estilizar partes del texto de forma individual.
     * @example
     * svg.text( tCtx => {
     *   tCtx.tspan({ fill: "red" }, "Rojo ");
     *   tCtx.tspan({ fill: "blue" }, "Azul");
     * });
     */
    tspan: SvgTextTagFunction<SVGTSpanElement>;
}

/**
 * 🎨 CONTEXTO FINAL SVG (Estricto)
 * Combina las etiquetas limpias con la magia de desestructuración Emmet.
 * 🛑 SIN FALLBACK: Garantiza que solo se usen etiquetas válidas de la W3C.
 */
type TuJsHtml_SvgProxy<TRoot extends SVGElement = SVGElement> =
    TuJsHtml_SvgContext<TRoot> & CustomEmmetSelectors<TuJsHtml_SvgContext<TRoot>, ValidSvgTags>;

// ==========================================
// --- math-tags.d.ts ---
// ==========================================
/// <reference lib="dom" />

// 1. Limpiamos las propiedades nativas de JS
type ValidMathTags = keyof Omit<TuJsHtml_MathContext,
    'prototype' | 'apply' | 'call' | 'bind' | 'length' | 'name' | 'arguments' | 'caller' | 'toString'>;
// ==========================================================================
// 📐 CORE DEL ECOSISTEMA MATHML (Ultrastricto)
// ==========================================================================

/**
 * Recursive nodes strictly permitted within a MathML context.
 * 🛑 WARNING: Raw strings and numbers are removed here.
 * In MathML, text must be inside Token elements like `<mi>`, `<mn>`, or `<mo>`.
 * @es Nodos recursivos para contenedores MathML puros.
 * 🛑 ¡ATENCIÓN!: Se previenen strings/numbers huérfanos dentro de `<math>` o `<mrow>`.
 */
type MathRecursiveNode<TRoot extends MathMLElement = MathMLElement> =
    | Node
    | SuperElementClass<MathMLElement>
    | TuJsHtml_MathCallback<TRoot>;

/**
 * Inherits normal nodes and adds permissions for strings/numbers.
 * Unique for Token tags (mi, mn, mo, mtext, ms).
 * @es Hereda los nodos normales y le suma permisos para strings/numbers.
 * Único para las etiquetas de Token.
 */
type MathTextRecursiveNode<TRoot extends MathMLElement = MathMLElement> =
    | MathRecursiveNode<TRoot>
    | string
    | number;

/**
 * Strict callback for MathML environments.
 * @es Callback estricto para entornos MathML.
 */
type TuJsHtml_MathCallback<TRoot extends MathMLElement = MathMLElement> = (
    //math: TuJsHtml_MathContext<TRoot>,
    math: TuJsHtml_MathProxy<TRoot>,
    currentElement: SuperElementClass<TRoot>
) => unknown;

// ------------------------------------------------------------------------
// LAS FÁBRICAS DE ETIQUETAS
// ------------------------------------------------------------------------

/**
 * 📦 **Math Container Element Factory**
 * Defines layout elements (e.g., mrow, mfrac, msqrt, mtable).
 * 🛑 STRICT RULE: Raw strings/numbers are NOT allowed as direct children. Text must be wrapped in Token tags (mi, mn, mo).
 *
 * 🤖 **AI INSTRUCTION (DESIGN PHILOSOPHY):**
 * - Use for structural grouping and complex mathematical layouts.
 * - ALWAYS wrap text in token tags (e.g., `mrow( mi\`x\` )`, NEVER `mrow("x")`).
 * - Use callbacks (`ctx => ...`) for deep nesting like matrices or limits to maintain readability.
 *
 * @es 📦 **Fábrica Contenedora MathML**
 * Define elementos de diseño o agrupación (ej. mrow, mfrac).
 * 🛑 REGLA ESTRICTA: No admite texto crudo. El texto debe ir dentro de Tokens (mi, mn, mo).
 */
interface MathContainerTagFunction<TElement extends MathMLElement> {
    /**
     * 🎨 **Render with Configuration / Renderiza con Configuración**
     * @usage 🤖 AI Hint: Use when the container requires specific attributes (e.g., linethickness in fractions).
     * @es Úsalo cuando el contenedor necesite atributos específicos de presentación.
     * @example
     * // 🤖 COMPLEX USE CASE: Binomial coefficient (Fraction without line)
     * // <mfrac linethickness="0"> ... </mfrac>
     * mfrac({ "@attrs": { linethickness: "0" } }, mi`n`, mi`k`)
     */
    <TConfig extends Record<string, unknown>>(
        config: ValidatedConfig<TConfig, TElement>,
        ...args: MathRecursiveNode<TElement>[]
    ): SuperElementClass<TElement>;
    /**
     * 🎨 **Direct Composition & Callbacks / Composición Directa**
     * @usage 🤖 AI Hint: PREFER THIS for standard grouping (`mrow`) where no attributes are needed.
     * @es Omite la configuración. Ideal para agrupar elementos rápidamente.
     * @example
     * // 🤖 STRUCTURAL USE CASE:
     * // <mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow>
     * mrow( mi`x`, mo`+`, mi`y` )
     */
    (...args: MathRecursiveNode<TElement>[]): SuperElementClass<TElement>;
}

/**
 * 📝 **Math Token Element Factory**
 * Defines token elements that hold text, numbers, or symbols (e.g., mi, mn, mo, mtext).
 * 🔓 PERMISSIVE: Allows raw strings and numbers.
 *
 * 🤖 **AI INSTRUCTION (DESIGN PHILOSOPHY):**
 * - Use Template Literals (``) for simple variables, operators, and numbers.
 * - Use Configuration when styling tokens (e.g., mathvariant, mathcolor).
 *
 * @es 📝 **Fábrica de Tokens MathML**
 * Define elementos que contienen texto real o símbolos (ej. mi, mn, mo).
 * 🔓 PERMISIVO: Admite strings y números directamente en la función.
 */
interface MathTokenTagFunction<TElement extends MathMLElement> {
    /**
     * 🎨 **Render with Configuration / Renderiza con Configuración**
     * @usage 🤖 AI Hint: Use to modify typographic styles or add colors to specific tokens.
     * @es Úsalo para modificar estilos tipográficos (ej. negritas, colores) en el token.
     * * @example
     * // 🤖 STYLING USE CASE: Real numbers set symbol (ℝ)
     * // <mi mathvariant="double-struck">R</mi>
     * mi({ "@attrs": { mathvariant: "double-struck" } }, "R")
     */
    <TConfig extends Record<string, unknown>>(
        config: ValidatedConfig<TConfig, TElement>,
        ...args: MathTextRecursiveNode<TElement>[]
    ): SuperElementClass<TElement>;
    /**
     * 🎨 **Direct Composition / Composición Directa**
     * @usage 🤖 AI Hint: Use when dynamically mapping arrays of strings/numbers.
     * @es Úsalo al mapear arrays o pasar variables que ya son strings/números.
     * @example
     * mn("3.1415")
     */
    (...args: MathTextRecursiveNode<TElement>[]): SuperElementClass<TElement>;
    /**
     * 🎨 **Template Literal Syntax / Sintaxis de Template Literals**
     * @usage 🤖 AI Hint: PREFER THIS syntax for standard math sketching. It keeps formulas highly readable.
     * @es PREFIERE esta sintaxis para escribir fórmulas rápidamente como bocetos legibles.
     * @example
     * // 🤖 SKETCH USE CASE: Quadratic Equation snippet
     * mrow( mi`b`, mo`²`, mo`-`, mn`4`, mi`a`, mi`c` )
     */
    (template: TemplateStringsArray, ...values: unknown[]): SuperElementClass<TElement>;
}

/**
 * 🛑 **Math Void Element Factory**
 * Defines elements that DO NOT accept children, used for spacing or structural markers (e.g., mspace, mprescripts, none).
 *
 * 🤖 **AI INSTRUCTION (DESIGN PHILOSOPHY):**
 * - Never attempt to pass children or text to these functions.
 * - Use `mspace` with config for visual adjustments.
 * - Use `mprescripts` and `none` without config as separators in tensors.
 *
 * @es 🛑 **Fábrica Vacía MathML (Void)**
 * Define elementos sin hijos, usados para espaciado o marcadores tensores (ej. mspace, mprescripts).
 */
interface MathVoidTagFunction<TElement extends MathMLElement> {
    /**
     * 🎨 **Render with Configuration / Renderiza con Configuración**
     * @usage 🤖 AI Hint: Pass an object for sizing (`mspace`), or call empty for markers (`none()`).
     * @es Pasa un objeto de configuración para tamaño (`mspace`), o llámala vacía para marcadores.
     * @example
     * // Configured space: <mspace width="2em" />
     * mspace({ "@attrs": { width: "2em" } })
     * @example
     * // Empty marker in tensors: <none />
     * none()
     */
    <TConfig extends Record<string, unknown>>(
        config?: ValidatedConfig<TConfig, TElement>
    ): SuperElementClass<TElement>;
}


// ==========================================================================
// 📐 DICCIONARIO DE ETIQUETAS MATHML (CONTEXTO AISLADO)
// ==========================================================================

/**
 * 📐 **MathML Tags Context (Math Proxy)**
 * Exposes tags with absolute semantic control over mathematical expressions.
 * @es **Contexto de Etiquetas MathML (Proxy Math)**
 * Expone etiquetas con control semántico absoluto sobre fórmulas matemáticas.
 */
interface TuJsHtml_MathContext<TRoot extends MathMLElement = MathMLElement> {

    /**
     * ⚙️ **Root Appender (Direct Nesting) / Anexador Raíz (Anidamiento Directo)**
     * Appends valid MathML nodes directly to the current root element of this context.
     * 🛑 STRICT RULE: Raw text/numbers are strictly forbidden. Use Tokens (mi, mn, mo).
     *
     * 🤖 **AI INSTRUCTION (DESIGN PHILOSOPHY):**
     * - USE THIS to attach multiple child nodes directly to the parent element without wrapping them in an extra `<mrow>`.
     * - NEVER pass strings directly into this function.
     * @es Permite anidar elementos matemáticos válidos directamente al root actual, prohibiendo texto flotante.
     * @example
     * // 🤖 DIRECT ATTACHMENT USE CASE (Anidamiento Directo):
     * // Assuming we are inside a `<math>` or `<mrow>` callback:
     * math( ctx => {
     * // This appends exactly 3 nodes directly to the `<math>` root
     *   ctx( 
     *     ctx.mi`f`, 
     *     ctx.mo`=`, 
     *     ctx.mi`m` 
     *   );
     * })
     */
    (...args: MathRecursiveNode<TRoot>[]): TRoot;

    // =========================================================================
    // 🛑 LIMPIEZA DE AUTOCOMPLETADO (FUNCTION SHADOWING)
    // =========================================================================
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    prototype: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    apply: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    call: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    bind: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    length: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    name: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    arguments: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    caller: never;
    /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
    toString: never;

    // ----------------------------------------------------------------------
    // 📝 ELEMENTOS DE TOKEN (ADMITEN TEXTO / NÚMEROS)
    // ----------------------------------------------------------------------

    /**
     * 📝 **Math Identifier**: `<mi/>`
     * Indicates that the content should be rendered as an identifier (variables, function names).
     * @es 📝 **Identificador Matemático**: `<mi/>`
     * Variables o nombres de funciones (ej. x, y, sin, cos).
     * @example math.mi("x");
     */
    mi: MathTokenTagFunction<MathMLElement>;

    /**
     * 📝 **Math Number**: `<mn/>`
     * Indicates that the content should be rendered as a numeric literal.
     * @es 📝 **Número Matemático**: `<mn/>`
     * @example math.mn("3.14");
     */
    mn: MathTokenTagFunction<MathMLElement>;

    /**
     * 📝 **Math Operator**: `<mo/>`
     * Indicates that the content should be rendered as an operator, fence, or separator.
     * @es 📝 **Operador Matemático**: `<mo/>`
     * @example math.mo("+");
     */
    mo: MathTokenTagFunction<MathMLElement>;

    /**
     * 📝 **Math Text**: `<mtext/>`
     * Renders arbitrary text with no mathematical meaning.
     * @es 📝 **Texto Arbitrario**: `<mtext/>`
     * Texto normal dentro de una fórmula.
     */
    mtext: MathTokenTagFunction<MathMLElement>;

    /**
     * 📝 **Math String Literal**: `<ms/>`
     * Represents a string literal meant to be interpreted by a programming language.
     * @es 📝 **Literal de Cadena**: `<ms/>`
     */
    ms: MathTokenTagFunction<MathMLElement>;

    // ----------------------------------------------------------------------
    // 📦 ELEMENTOS DE DISEÑO (CONTENEDORES SIN TEXTO)
    // ----------------------------------------------------------------------

    /**
     * 📦 **Math Row**: `<mrow/>`
     * Groups sub-expressions, usually forming a single entity.
     * @es 📦 **Fila Matemática**: `<mrow/>`
     * Agrupa subexpresiones. Esencial para delimitar numeradores, denominadores o bases.
     */
    mrow: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Fraction**: `<mfrac/>`
     * Creates a fraction from two sub-expressions (numerator and denominator).
     * @es 📦 **Fracción**: `<mfrac/>`
     * @example
     * // a / b
     * math.mfrac( mCtx => {
     *   mCtx.mi("a"); // Numerator
     *   mCtx.mi("b"); // Denominator
     * });
     */
    mfrac: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Square Root**: `<msqrt/>`
     * Renders a square root.
     * @es 📦 **Raíz Cuadrada**: `<msqrt/>`
     */
    msqrt: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Root**: `<mroot/>`
     * Renders a root with a specified index.
     * @es 📦 **Raíz con Índice**: `<mroot/>`
     * Espera dos hijos: la base y el índice.
     * @example
     * // Raíz cúbica de x (∛x)
     * math.mroot(math.mi("x"),math.mn("3"))
     * // or
     * math.mroot( mCtx => {
     *   mCtx.mi`x`; // Base
     *   mCtx.mn`3`; // Index
     * });
     * 
     */
    mroot: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Fenced**: `<mfenced/>` (Deprecated in HTML5, use mrow+mo)
     * Adds custom delimiters (like parentheses) around its content.
     * @es 📦 **Delimitadores**: `<mfenced/>` (Obsoleto en HTML5)
     * @deprecated HTML5 recomienda usar `<mrow>` con `<mo>` para los paréntesis.
     */
    mfenced: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Error**: `<merror/>`
     * Displays its contents as an error message.
     * @es 📦 **Mensaje de Error**: `<merror/>`
     */
    merror: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Enclose**: `<menclose/>`
     * Renders its content inside an enclosing notation (e.g., long division).
     * @es 📦 **Notación de Cierre**: `<menclose/>`
     * @example
     * // División larga
     * math.menclose({ "@attrs": { notation: "longdiv" } }, math.mn`12345`)
     * // or
     * math.menclose({ "@attrs": { notation: "longdiv" } }, mCtx => {
     *   mCtx.mn("12345");
     * });
     */
    menclose: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Phantom**: `<mphantom/>`
     * Renders invisibly, but reserves the same space as if it were visible.
     * @es 📦 **Elemento Fantasma**: `<mphantom/>`
     * Es invisible, pero ocupa exactamente el mismo espacio que su contenido (útil para alineación).
     */
    mphantom: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Padded**: `<mpadded/>`
     * Adjusts the bounding box of its content (adding padding).
     * @es 📦 **Relleno Matemático**: `<mpadded/>`
     * Ajusta el tamaño de la caja contenedora (añade padding o ajusta márgenes).
     */
    mpadded: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Action**: `<maction/>`
     * Allows binding actions to sub-expressions (e.g., tooltips or toggles).
     * @es 📦 **Acción Matemática**: `<maction/>`
     * Permite interactividad, como alternar entre expresiones o mostrar tooltips.
     */
    maction: MathContainerTagFunction<MathMLElement>;
    // ----------------------------------------------------------------------
    // 🎨 ESTILOS GENERALES
    // ----------------------------------------------------------------------

    /**
     * 📦 **Math Style**: `<mstyle/>`
     * Allows style changes (like mathcolor, mathsize, displaystyle) to apply to all its children.
     * @es 📦 **Estilo Matemático**: `<mstyle/>`
     * Aplica atributos de estilo a todos sus hijos simultáneamente.
     */
    mstyle: MathContainerTagFunction<MathMLElement>;

    // ----------------------------------------------------------------------
    // ⚛️ TENSORES Y MÚLTIPLES ÍNDICES
    // ----------------------------------------------------------------------

    /**
     * 📦 **Math Multiscripts**: `<mmultiscripts/>`
     * Attaches multiple subscripts and superscripts to a base object (used for tensors).
     * @es 📦 **Múltiples Índices (Tensores)**: `<mmultiscripts/>`
     * Permite colocar subíndices y superíndices tanto a la derecha como a la izquierda de la base.
     * @example
     * // Tensor:  _3^4 X _1^2
     * math.mmultiscripts( mCtx => {
     *   mCtx.mi`X`;              // 1. Base
     *   mCtx.mn`1`;              // 2. Post-subscript
     *   mCtx.mn`2`;              // 3. Post-superscript
     *   mCtx.mprescripts();      // 4. Separator
     *   mCtx.mn("3");            // 5. Pre-subscript
     *   mCtx.mn("4");            // 6. Pre-superscript
     * });
     */
    mmultiscripts: MathContainerTagFunction<MathMLElement>;

    /**
     * 🛑 **Math Prescripts**: `<mprescripts/>`
     * Separator used inside `<mmultiscripts>` to denote the start of pre-scripts (left-side).
     * @es 🛑 **Separador de Pre-índices**: `<mprescripts/>`
     * Etiqueta vacía usada dentro de `<mmultiscripts>` para indicar que los siguientes índices van a la izquierda.
     */
    mprescripts: MathVoidTagFunction<MathMLElement>;

    /**
     * 🛑 **Math None**: `<none/>`
     * Represents an empty slot in `<mmultiscripts>` (e.g., a superscript without a subscript).
     * @es 🛑 **Espacio Vacío**: `<none/>`
     * Marcador de posición vacío usado dentro de `<mmultiscripts>` para alinear índices asimétricos.
     */
    none: MathVoidTagFunction<MathMLElement>;
    // ----------------------------------------------------------------------
    // 📦 ÍNDICES, POTENCIAS Y LÍMITES (SCRIPTS)
    // ----------------------------------------------------------------------

    /**
     * 📦 **Math Superscript**: `<msup/>`
     * Attaches a superscript to a base.
     * @es 📦 **Superíndice (Potencia)**: `<msup/>`
     */
    msup: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Subscript**: `<msub/>`
     * Attaches a subscript to a base.
     * @es 📦 **Subíndice**: `<msub/>`
     */
    msub: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Subscript & Superscript**: `<msubsup/>`
     * Attaches both a subscript and a superscript to a base.
     * @es 📦 **Subíndice y Superíndice simultáneos**: `<msubsup/>`
     */
    msubsup: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Overscript**: `<mover/>`
     * Attaches an overscript (like a limit or vector arrow) to a base.
     * @es 📦 **Texto Superior**: `<mover/>`
     */
    mover: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Underscript**: `<munder/>`
     * Attaches an underscript (like a limit) to a base.
     * @es 📦 **Texto Inferior**: `<munder/>`
     */
    munder: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Under & Overscript**: `<munderover/>`
     * @es 📦 **Texto Inferior y Superior**: `<munderover/>`
     * Ideal para límites de sumatorias (∑) e integrales (∫). El orden es: Base, Under, Over.
     * @example
     * // Sumatoria desde i=0 hasta n
     * math.munderover( mCtx => {
     *   mCtx.mo("∑"); // Base
     *   mCtx.mrow( rCtx => {  // Under (i=0)
     *     rCtx.mi`i`; rCtx.mo`=`; rCtx.mn`0`;
     *   });
     *   mCtx.mi("n"); // Over (n)
     * });
     */
    munderover: MathContainerTagFunction<MathMLElement>;

    // ----------------------------------------------------------------------
    // 📊 MATRICES Y TABLAS MATEMÁTICAS
    // ----------------------------------------------------------------------

    /**
     * 📦 **Math Table**: `<mtable/>`
     * Creates a table or matrix.
     * @es 📦 **Tabla Matemática**: `<mtable/>`
     * @example
     * // Matriz Identidad 2x2
     * // [ 1  0 ]
     * // [ 0  1 ]
     * math.mtable( mCtx => {
     *   mCtx.mtr( rCtx => {
     *     rCtx.mtd( dCtx => dCtx.mn("1") );
     *     rCtx.mtd( dCtx => dCtx.mn("0") );
     *   });
     *   mCtx.mtr( rCtx => {
     *     rCtx.mtd( dCtx => dCtx.mn("0") );
     *     rCtx.mtd( dCtx => dCtx.mn("1") );
     *   });
     * });
     * // or short style
     * math.mtable( ({mtr:myRow,mtd:myCol,mn}) => {
     *   myRow( 
     *     myCol( mn`1` ),
     *     myCol( mn`0` )
     *   );
     *   myRow( 
     *     myCol( mn`0` ),
     *     myCol( mn`1` )
     *   );
     * });
     */
    mtable: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Table Row**: `<mtr/>`
     * @es 📦 **Fila de Tabla Matemática**: `<mtr/>`
     */
    mtr: MathContainerTagFunction<MathMLElement>;

    /**
     * 📦 **Math Table Data**: `<mtd/>`
     * @es 📦 **Celda de Tabla Matemática**: `<mtd/>`
     */
    mtd: MathContainerTagFunction<MathMLElement>;

    // ----------------------------------------------------------------------
    // 🧠 SEMÁNTICA (METADATOS AVANZADOS)
    // ----------------------------------------------------------------------

    /**
     * 🧠 **Math Semantics**: `<semantics/>`
     * Associates mathematical presentation with its semantic meaning.
     * @es 🧠 **Semántica Matemática**: `<semantics/>`
     * Asocia la presentación visual con su significado semántico o código fuente (ej. LaTeX).
     * @example
     * math.semantics( mCtx => {
     *   // 1. Presentación visual
     *   mCtx.mrow( rCtx => { rCtx.mi("x"); rCtx.mo("+"); rCtx.mi("y"); }); 
     *   // 2. Significado semántico oculto
     *   mCtx.annotation({ "@attrs": { encoding: "application/x-tex" } }, "x + y"); 
     * });
     * // or short style
     * math.semantics( ({mrow,'annotation[enconding="application/x-tex"]':myAnnotation,mi,mo})=>{
     *   // 1. Presentation visual
     *   mrow(
     *     mi`x`, mo`+`, mi`y`
     *   )
     *   // 2. Hidden semantic meaning
     *   myAnnotation`x + y`;
     * })
     */
    semantics: MathContainerTagFunction<MathMLElement>;

    /**
     * 🧠 **Math Annotation**: `<annotation/>`
     * Holds semantic data (usually plain text) for a semantics element.
     * @es 🧠 **Anotación**: `<annotation/>`
     * Contiene texto plano semántico dentro de un tag `<semantics>`.
     */
    annotation: MathTokenTagFunction<MathMLElement>;

    /**
     * 🧠 **Math XML Annotation**: `<annotation-xml/>`
     * Holds XML semantic data for a semantics element.
     * @es 🧠 **Anotación XML**: `<annotation-xml/>`
     */
    'annotation-xml': MathContainerTagFunction<MathMLElement>;

    // ----------------------------------------------------------------------
    // 🛑 ESPACIADO (VOID)
    // ----------------------------------------------------------------------

    /**
     * 🛑 **Math Space (Void)**: `<mspace/>`
     * Displays a blank space, whose size is set by its attributes.
     * @es 🛑 **Espacio Matemático (Vacío)**: `<mspace/>`
     * Inserta un espacio en blanco de tamaño configurable. No admite hijos.
     * @example math.mspace({ width: "10px" });
     */
    mspace: MathVoidTagFunction<MathMLElement>;
}
/**
 * 📐 CONTEXTO FINAL MATHML (Estricto)
 * Combina las etiquetas limpias con la magia de desestructuración Emmet.
 * 🛑 SIN FALLBACK: Previene errores tipográficos (typos) en el ecosistema cerrado de MathML.
 */
type TuJsHtml_MathProxy<TRoot extends MathMLElement = MathMLElement> =
    TuJsHtml_MathContext<TRoot> & CustomEmmetSelectors<TuJsHtml_MathContext<TRoot>, ValidMathTags>;

// ==========================================
// --- TuJsHtml.d.ts ---
// ==========================================



// ============================================
// 1. BASE TYPES & UTILITIES / TIPOS BASE Y UTILIDADES
// ============================================

// export type EventOff = () => void;
// export type ExecuteAfterRender = () => void;



// /**
//  * Interface that structurally resembles a DOM Node.
//  * @es Interfaz que se asemeja estructuralmente a un Nodo del DOM.
//  */
// export interface InstanceNode {
//   readonly ATTRIBUTE_NODE: number;
// }

// export declare class ElementUtil$<TBaseElement extends HTMLElement = HTMLElement> {
//   on(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => unknown): EventOff;
//   one(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => unknown): EventOff;
//   off(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => unknown): this;
//   configure(configureObject: ConfigureAttributes<TBaseElement>): this;
//   tags: TuJsHtml_Tags<TBaseElement>;
// }
declare class ElementUtil$<TBaseElement extends HTMLElement | SVGElement | MathMLElement = HTMLElement> {
  /**
   * Adjunta un event listener al elemento.
   * @param type El tipo de evento (ej. 'click', 'input')
   * @param listener El callback fuertemente tipado según el evento.
   */
  on<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: TBaseElement, ev: HTMLElementEventMap[K]) => unknown
  ): EventOff;

  /**
   * Adjunta un event listener que se ejecuta una sola vez.
   */
  one<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: TBaseElement, ev: HTMLElementEventMap[K]) => unknown
  ): EventOff;

  /**
   * Remueve un event listener del elemento.
   */
  off<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: TBaseElement, ev: HTMLElementEventMap[K]) => unknown
  ): this;

  configure(configureObject: ConfigureAttributes<TBaseElement>): this;
  tags: TuJsHtml_Tags<TBaseElement>;
}

declare global {
  interface SuperElementProperties {
    [ELEMENT_UTIL]: ElementUtil$;
  }
}

/**
 * Base class for all DOM elements extended by the framework.
 * Ensures every element has access to framework utilities like `[ELEMENT_UTIL]`.
 * @es Clase base para todos los elementos DOM extendidos por el framework.
 * Garantiza que cada elemento tenga acceso a las utilidades del framework.
 */
type SuperElementClass<TBaseElement extends HTMLElement | SVGElement | MathMLElement> = TBaseElement & SuperElementProperties;

// ============================================
// 2. RECURSIVE CONTEXT / CONTEXTO RECURSIVO (TRoot)
// ============================================

/**
 * Represents unknown valid node/argument that can be passed inside a tag function.
 * Carries the `TRoot` context down to callbacks to prevent losing the parent context in deeply nested structures.
 * @es Representa cualquier nodo/argumento válido dentro de una función de etiqueta.
 * Transporta el contexto `TRoot` hacia abajo para evitar perder el contexto padre en anidamientos profundos.
 */
type RecursiveNode$1<TRoot extends HTMLElement | DocumentFragment | SVGElement | MathMLElement = HTMLElement> =
  | Node
  | SuperElementClass<HTMLElement>
  | TuJsHtml_Callback<TRoot>
  | string
  | number;

type DynamicNodes = ChildNode[];

/**
 * Utility type to map argument types to their actual DOM Node representation.
 * @es Tipo utilitario para mapear los tipos de argumentos a su representación real en el DOM.
 */
type MapToDOMNode<T> =
  T extends SuperElementClass<infer E> ? E :
  T extends (...args: unknown[]) => unknown ? DynamicNodes :
  T extends Node ? T :
  T extends string | number ? Text :
  Node;

/**
 * Flattening engine for arrays and nested nodes during insertion.
 * @es Motor de aplanamiento para arrays y nodos anidados durante la inserción.
 */
type Flatten<T extends unknown[]> = T extends [infer First, ...infer Rest]
  ? First extends unknown[]
  ? [...First, ...Flatten<Rest>]
  : [MapToDOMNode<First>, ...Flatten<Rest>]
  : [];

interface StoreObject {
  [key: string]: unknown;
}
type StoreProperty = StoreObject;

// ============================================
// 3. CORE TAGS ARCHITECTURE / ARQUITECTURA CORE DE ETIQUETAS
// ============================================

/**
 * ⚙️ **TuJsHtml Context Invoker (The Callable Context / "Promiscuous Proxy")**
 * Defines the behavior of the current context object (commonly named `ctx` or `_`).
 * Acts as a factory, a direct appender, or a clean logic organizer.
 *
 * 🤖 **AI INSTRUCTION (ARCHITECTURE & ASYNC RULES):**
 * - ⚡ PERFORMANCE (The Promiscuous Proxy): To save memory, this `ctx` object is heavily recycled across the DOM tree. It is only guaranteed to point to the correct element DURING SYNCHRONOUS execution.
 * - 🛑 ASYNC DANGER: NEVER invoke `ctx()` inside `setTimeout`, `setInterval`, or Promises if you opened the block with an arrow function `() => {}`. The proxy will have moved on to another element!
 * - ✅ ASYNC SOLUTION 1 (Native Hatch): Use the second parameter `parent` to modify the DOM natively (e.g., `parent.style.color = 'red'`).
 * - ✅ ASYNC SOLUTION 2 (Isolated World): Open the block with `function(ctx) {}` instead of an arrow function. The framework detects this and creates a dedicated, isolated proxy just for this block, making `ctx()` safe for async use.
 *
 * @es ⚙️ **Invocador de Contexto TuJsHtml (El Proxy "Promiscuo")**
 * Define el comportamiento del contexto actual. 
 * ⚠️ REGLA DE ARQUITECTURA: Por rendimiento, este proxy se recicla. ¡NO lo invoques dentro de temporizadores o promesas si usaste una función flecha! Para asincronía segura, usa el parámetro `parent` o declara el bloque con `function(ctx) {}`.
 */
interface TuJsHtml_TagsCallable<TRoot extends HTMLElement | DocumentFragment | SVGElement | MathMLElement = HTMLElement> {
  /**
   * 🎨 **Late Configuration / Configuración Tardía**
   * Appends nodes while modifying the root's attributes (Only valid if TRoot is HTMLElement).
   * @es Anexa nodos y simultáneamente inyecta o modifica atributos al contenedor raíz actual.
   * @example
   * // 🤖 EXAMPLE 1: Conditional Styling (Estilos Condicionales)
   * tags.div( ctx => {
   *   // Si hay error, muta el contenedor padre antes de inyectar el hijo
   *   if (hasError) ctx({ style: {border: "1px solid red"} });
   *   ctx.span("Verifique sus datos");
   * });
   * @example
   * // 🤖 EXAMPLE 2: Dynamic ARIA/Attributes (Atributos Dinámicos)
   * tags.button( ctx => {
   *   const isLoading = checkStatus();
   *   // Inyecta el atributo 'disabled' al vuelo según la lógica
   *   ctx({ disabled: isLoading, "aria-busy": isLoading }, 
   *      isLoading ? "Cargando..." : "Enviar"
   *   );
   * });
   */
  (
    config: TRoot extends HTMLElement ? ConfigureAttributes<TRoot> : never,
    ...args: RecursiveNode$1<TRoot>[]
  ): TRoot;

  /**
   * 🎨 **Logic Organizer & Async Sandbox / Organizador Lógico y Sandbox Asíncrono**
   * Structure complex logic, loops, and handle async mutations based on how you declare the function.
   * @es Estructura lógica compleja y maneja mutaciones asíncronas dependiendo de cómo declares el callback.
   * @example
   * // 🤖 EXAMPLE 1: Async Mutation (The Native Hatch)
   * tags.p( (ctx, parent) => {
   *   ctx.span("Cargando...");
   *   // ✅ GOOD: Using the native parent is always safe with arrow functions
   *   setTimeout(() => parent.style.color = "green", 3000);
   * });
   * @example
   * // 🤖 EXAMPLE 2: Async Mutation (The Isolated World)
   * tags.p( function(ctx) {
   *   ctx.span("Procesando datos...");
   *   // ✅ GOOD: Standard 'function' forces a unique, safe proxy instance
   *   setTimeout(() => ctx({ style: "border: 2px solid green" }), 3000);
   * });
   * @example
   * // 🤖 EXAMPLE 3: Clean Synchronous Logic (Evitando Espagueti)
   * tags.ul( ctx => {
   *   for (const user of users) {
   *     ctx.li({ className: "user-item" }, user.name);
   *   }
   * });
   */
  (...args: RecursiveNode$1<TRoot>[]): TRoot;

  /**
   * 🎨 **Direct Template Appender / Anexador Directo por Template Literal**
   * Instantly appends a text node to the current context.
   * @es Anexa instantáneamente un nodo de texto al contexto actual.
   * @example
   * // 🤖 EXAMPLE: Fluent Text Appending
   * tags.p( ctx => {
   *   ctx.strong("Aviso: ");
   *   ctx`Este texto se añade directamente al párrafo.`;
   * });
   */
  (template: TemplateStringsArray, ...values: unknown[]): TRoot;
  // =========================================================================
  // 🛑 LIMPIEZA DE AUTOCOMPLETADO (FUNCTION SHADOWING)
  // =========================================================================
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  prototype: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  apply: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  call: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  bind: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  length: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  name: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  arguments: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  caller: never;
  /** @deprecated 🛑 Propiedad nativa de JavaScript. Ignorar. */
  toString: never;
}

/**
 * 📝 **Metadata Element Factory (With Children)**
 * Defines `<head>` tags that accept internal content (e.g., script, style, title).
 * Supports configuration objects, direct text strings, or template literals.
 * @es 📝 **Fábrica de Metadatos (Con Hijos)**
 * Define etiquetas del `<head>` que admiten contenido interno (ej. script, style, title).
 * Soporta objetos de configuración, texto directo, o template literals.
 */
interface MetadataTagFunction<TElement extends HTMLElement> {

  //(config: OmitUIEvents<ConfigureAttributes<TElement>>, ...args: RecursiveNode<TElement>[]): SuperElementClass<TElement>;
  /**
   * 🎨 **Render with Configuration / Renderiza con Configuración**
   * @example
   * // <script type="module">console.log("ok")</script>
   * script({ type: "module" }, "console.log('ok')")
   */
  <TConfig extends Record<string, unknown>>(
    config: ValidatedConfig<TConfig, TElement>,
    ...args: RecursiveNode$1<TElement>[]
  ): SuperElementClass<TElement>;
  /**
   * 🎨 **Render Content Directly / Renderiza Contenido Directamente**
   * @example
   * title("Welcome ",2,`TuJsHtml`)
   */
  (...args: RecursiveNode$1<TElement>[]): SuperElementClass<TElement>;
  /**
   * 🎨 **Render with Template Literals / Renderiza con Template Literals**
   * @example
   * style`
   *   body { background: #000; color: #fff; }
   *   .btn { padding: 10px; }
   * `
   */
  (template: TemplateStringsArray, ...values: unknown[]): SuperElementClass<TElement>;
}

/**
 * 🛑 **Void Metadata Element Factory**
 * Function for metadata tags that DO NOT accept children under any circumstances (e.g., meta, link, base).
 * @es 🛑 **Fábrica de Metadatos Vacíos (Void)**
 * Función para etiquetas de Metadatos que NO admiten hijos bajo ninguna circunstancia (ej. meta, link, base).
 */
interface VoidMetadataTagFunction<TElement extends HTMLElement> {
  //(config?: OmitUIEvents<ConfigureAttributes<TElement>>): SuperElementClass<TElement>;
  /**
   * 🎨 **Render with Configuration / Renderiza con Configuración**
   * @example
   * meta({ name: "viewport", content: "width=device-width, initial-scale=1" })
   * @example
   * link({ rel: "stylesheet", href: "/assets/main.css" })
   */
  <TConfig extends Record<string, unknown>>(
    config?: ValidatedConfig<TConfig, TElement>
  ): SuperElementClass<TElement>;
}

/**
 * 📦 **Specific HTML Element Factory**
 * Defines the behavior of standard HTML tags (e.g., div, p, section, button).
 * Notice it DOES NOT inherit TRoot, as each tag creates its own fresh context for its children.
 * @es 📦 **Fábrica de Elementos HTML Específicos**
 * Define el comportamiento de etiquetas HTML estándar (ej. div, p, a, button).
 * Nota que NO hereda TRoot, ya que cada etiqueta crea su propio contexto limpio para sus hijos.
 */
interface SpecificTagFunction<TElement extends HTMLElement> {
  //(config: ConfigureAttributes<TElement>, ...args: RecursiveNode<TElement>[]): SuperElementClass<TElement>;
  // <TConfig extends Record<string, unknown>>(
  //   config: ConfigureAttributes<TElement> & CatchExcessProps<TConfig, ConfigureAttributes<TElement>>,
  //   ...args: RecursiveNode<TElement>[]
  // ): TElement;
  /**
   * 🎨 **Advanced Composition (Config + Children) / Composición Avanzada**
   * Mix attributes, directives, plain text, nested tags, and template literals in a single call.
   * @es Mezcla atributos, directivas, texto plano, etiquetas anidadas y template literals en una sola llamada.
   * @example
   * // Deep mixing example:
   * p({ className: "card-text" }, 
   *   b`Warning: `, 
   *   "Please click ", 
   *   a({ href: "/docs", target: "_blank" }, "here"), 
   *   " to read the rules."
   * )
   */
  <TConfig extends Record<string, unknown>>(
    config: ValidatedConfig<TConfig, TElement>,
    ...args: RecursiveNode$1<TElement>[]
  ): SuperElementClass<TElement>;
  /**
   * 🎨 **Direct Composition & Callbacks / Composición Directa y Callbacks**
   * Skip configuration and deeply nest nodes, strings, or use scoped contexts.
   * @es Omite la configuración y anida nodos, strings o usa contextos anidados.
   * @example
   * // Scoped Context (Builder pattern):
   * section( ({h2,ul,li}) => {
   *   h2("User List");
   *   ul(
   *     li( _=> _.img({ src: "avatar1.png" }), " Alice" ),
   *     li( _=> _.img({ src: "avatar2.png" }), " Bob" )
   *   );
   * })
   * @example
   * // Direct inline nesting:
   * div( h1`Title`, "Description text", hr() )
   */
  (...args: RecursiveNode$1<TElement>[]): SuperElementClass<TElement>;
  /**
   * 🎨 **Template Literal Syntax / Sintaxis de Template Literals**
   * Ultra-compact syntax for text-only nodes.
   * @es Sintaxis ultracompacta para nodos que solo contienen texto.
   * @example
   * h1`Hello World`
   * button`Submit Form`
   * html.p` short mode ${button("click here")} ${html.i("italic")} `
   */
  (template: TemplateStringsArray, ...values: unknown[]): SuperElementClass<TElement>;
}
/**
 * Void Tag Function (Para etiquetas como input, img, br, hr que NO admiten hijos).
 * Solo aceptan un objeto de configuración.
 * @es Función para etiquetas vacías que NO admiten hijos ni texto.
 */
interface VoidTagFunction<TElement extends HTMLElement> {
  // Acepta atributos, pero NO acepta ...args (hijos)
  (config?: ConfigureAttributes<TElement>): SuperElementClass<TElement>;
}


interface TuJsHtml_TagsSpecials {
  /**
   * Creates a render block linked to the reactivity of an object or Signal.
   * Auto-re-renders when properties change.
   * @es Crea un bloque de renderizado vinculado a la reactividad de un objeto o Signal.
   * Se re-renderiza automáticamente cuando cambian las propiedades.
   * @example 
   * const block = tags.$block(mySignal, tags => tags.h1("Dynamic"));
   */
  $block: (
    variable: object | null | string | number,
    callback: (tags: TuJsHtml_Tags<DocumentFragment>) => void,
    fallback?: (tags: TuJsHtml_Tags<DocumentFragment>) => void | ExecuteAfterRender
  ) => TuJsHtml;

  /**
   * Creates a reactive fragment with asynchronous rendering support.
   * Ideal for fetching data before showing content.
   * @es Crea un fragmento reactivo con soporte asíncrono. Ideal para Fetch.
   * @example 
   * const frag = tags.$fragment(async tags => { 
   * await fetch(...); 
   * tags.p("Done"); 
   * });
   */
  $fragment: (
    callback: (tags: TuJsHtml_Tags<DocumentFragment>) => void | Promise<void>,
    fallback?: (tags: TuJsHtml_Tags<DocumentFragment>) => void | ExecuteAfterRender
  ) => TuJsHtml;

  /** 
   * Alias for $fragment 
   * @es Alias de $fragment 
   */
  $f: TuJsHtml_TagsSpecials['$fragment'];

  /**
   * Generates a static template in an independent DocumentFragment.
   * @es Genera una plantilla estática en un DocumentFragment independiente.
   */
  $tpl: (
    callback: (tags: TuJsHtml_Tags<DocumentFragment>) => void
  ) => DocumentFragment;

  /**
   * Inserts elements and returns a tuple with the exact processed types.
   * @es Inserta elementos y devuelve una tupla con los tipos exactos procesados.
   */
  $insert: <T extends unknown[]>(...args: T) => Flatten<T>;

  /**
   * Persistent local storage linked to the element's lifecycle.
   * @es Almacenamiento local persistente vinculado al ciclo de vida del elemento.
   * @example tags.div(({p, $store}) => { $store.count = 0; });
   */
  $store: StoreProperty;
  [key: `$store:${string}`]: StoreProperty;

  /**
   * Overload 1: Dynamically registers a Custom Element by passing its class.
   * @es Sobrecarga 1: Registra un Custom Element pasando su clase dinámicamente.
   * @example const myTag = tags.$custom("custom-el.class", CustomEl);
   */
  $custom<T extends HTMLElement = HTMLElement>(
    selector: string,
    elementClass?: new () => T
  ): SpecificTagFunction<T>;

  /**
   * Overload 2: Registers a Custom Element using its static TAG property.
   * @es Sobrecarga 2: Registra un Custom Element usando su propiedad estática TAG.
   * @example const myTag = tags.$custom(CustomEl); // CustomEl.TAG must be defined
   */
  $custom<T extends HTMLElement>(
    elementClass: (new () => T) & { TAG: string }
  ): SpecificTagFunction<T>;

  /**
   * Overload 3: Registers a Custom Element from an existing instance (will be cloned).
   * @es Sobrecarga 3: Registra un Custom Element desde una instancia existente (será clonada).
   * @example const myTag = tags.$custom(myCustomInstance);
   */
  $custom<T extends HTMLElement>(
    elementInstance: T
  ): SpecificTagFunction<T>;

  /**
   * 🎨 **Portal a SVG (Contexto Aislado)**: `$svg`
   * Crea un lienzo `<svg>` y entra en un contexto estricto de dibujo vectorial.
   * Dentro de este callback, el objeto inyectado SOLO contiene etiquetas SVG.
   * @es Crea un espacio de nombres SVG (`createElementNS`).
   * @experimental ⚠️ Está en pañales, solo para uso interno o testers muy valientes
   * @example
   * tags.div( ctx => {
   *   ctx.$svg({ viewBox: "0 0 100 100" }, svg => {
   *     // 'svg' es TuJsHtml_SvgContext. ¡Aquí no existe svg.div ni svg.$block!
   *     svg.circle({ cx: 50, cy: 50, r: 40 });
   *   });
   * });
   */
  $svg: SvgContainerTagFunction<SVGSVGElement>;
  /**
   * 📐 **Portal a MathML (Contexto Aislado)**: `$math`
   * Crea un contenedor `<math>` e inyecta un ecosistema estricto de notación matemática.
   * Dentro de su callback, el objeto inyectado SOLO contiene etiquetas de MathML.
   * @es 🌉 Puente principal hacia el entorno de ecuaciones matemáticas.
   * @experimental ⚠️ Está en pañales, solo para uso interno o testers muy valientes
   * @example
   * // Fórmula: x² + y² = z²
   * tags.div({ className: "formula-box" }, ctx => {
   *   ctx.$math({ display: "block" }, math => {
   *     math.msup( m => { m.mi("x"); m.mn("2"); });
   *     math.mo("+");
   *     math.msup( m => { m.mi("y"); m.mn("2"); });
   *     math.mo("=");
   *     math.msup( ({mi,mn}) => { mi`z`; mn`2`; });
   *   });
   * });
   */
  $math: MathContainerTagFunction<MathMLElement>;
}




/**
 * 💡 EXTENSION POINT (HOOK):
 * Empty interface designed for end-users to extend in their own projects via Declaration Merging.
 * @es Interfaz vacía diseñada para que el usuario final la extienda mediante Declaration Merging.
 * @example 
 * // In a global 'globals.d.ts' file:
 * declare module './TuJsHtml.d.ts' { 
 * export interface TuJsHtml_CustomTags { "my-el": TuJsHtml.Types.CustomTag<MyEl> } 
 * }
 */
interface TuJsHtml_CustomTags { }

/**
 * Safe core interface combining callable traits, specials, standard HTML5, and overrides.
 * @es Interfaz base segura que combina propiedades llamables, especiales, HTML5 y overrides.
 */
interface TuJsHtml_TagsSafe<TRoot extends HTMLElement | DocumentFragment | SVGElement | MathMLElement = HTMLElement>
  extends TuJsHtml_TagsCallable<TRoot>,
  TuJsHtml_TagsSpecials,
  //TuJsHtml_SvgContext,
  //HtmlTagsMapped,
  TuJsHtml_NativeTags,
  TuJsHtml_CustomTags {
  // Aquí puedes dejar solo los elementos que son Exclusivos de Electron/Framework 
  // que no pertenecen al HTML estándar:
  /**
   * Only for Electron/NwJs
   * @es Solo para Electron/NwJs
   */
  webview: VoidTagFunction<ChromeWebViewElement>;
}

// ============================================
// 5. EMMET MAGIC & FINAL EXPORT
// ============================================

type SelectorPrefix = '.' | '#' | '[' | '{';

/**
 * Maps Emmet patterns for native tags (e.g., "div.container", "p#main").
 * @es Mapea patrones Emmet para etiquetas nativas (ej. "div.container").
 */
type EmmetStandardTags = {
  [Tag in keyof HTMLElementTagNameMap as `${Tag}${SelectorPrefix}${string}`]: SpecificTagFunction<HTMLElementTagNameMap[Tag]>;
};

/**
 * Maps Emmet patterns for Overridden/Extended tags.
 * @es Mapea patrones Emmet para etiquetas Extendidas/Sobrescritas.
 */
type EmmetSpecialTags = {
  [Tag in 'webview' as `${Tag}${SelectorPrefix}${string}`]: SpecificTagFunction<ChromeWebViewElement>;
} & {
  [Tag in 'input' as `${Tag}${SelectorPrefix}${string}`]: SpecificTagFunction<HTMLInputElementExtended>;
};

/**
 * FINAL TYPE: TuJsHtml_Tags
 * Intersection allowing Emmet and dynamic fallback without crashing TS Server.
 * @es TIPO FINAL: TuJsHtml_Tags. Intersección que permite Emmet y fallbacks sin romper el TS Server.
 */
type TuJsHtml_Tags<TRoot extends HTMLElement | DocumentFragment | SVGElement | MathMLElement = HTMLElement> =
  TuJsHtml_TagsSafe<TRoot> &
  EmmetStandardTags &
  EmmetSpecialTags & {
    /**
     * STRICT FALLBACK: Unmapped strings default to HTMLElementExtended.
     * Prevents TS from marking dynamic components as 'unknown' or breaking autocompletion.
     * @es FALLBACK ESTRICTO: Strings no mapeados devuelven HTMLElementExtended.
     * Evita que TS marque componentes dinámicos como 'unknown' o rompa el autocompletado.
     */
    [dynamicSelector: string]: SpecificTagFunction<HTMLElementExtended>;
  };

// ============================================
// 6. CALLBACKS & MAIN CLASS
// ============================================

/**
 * 🫀 **Core Builder Callback (El Corazón Recursivo)**
 * The fundamental callback that powers the nested builder pattern in TuJsHtml.
 * It provides the proxy to build children, and the native DOM element for direct manipulation.
 *
 * 🤖 **AI INSTRUCTION (DESIGN PHILOSOPHY & PARAMETERS):**
 * - `Param 1 (tags / ctx)`: The recursive proxy. USE THIS to append children safely. 
 * *Note: Highly optimized. Do NOT use inside async closures (like setTimeout) if using an arrow function.*
 * - `Param 2 (currentElement)`: The "Native Escape Hatch". USE THIS when you need raw DOM access (e.g., `element.style`, `element.addEventListener`) or safe asynchronous mutations.
 * - `Param 3 (...extraArgs)`: Forgiving rest parameter. Ensures pure JS users don't face execution crashes if they pass unexpected arguments.
 *
 * @es 🫀 **Callback Constructor Principal**
 * El callback fundamental que impulsa el patrón recursivo.
 * Acepta argumentos extra (rest) para que los usuarios JS no obtengan errores al omitir o añadir parámetros.
 */
type TuJsHtml_Callback<TRoot extends HTMLElement | DocumentFragment | SVGElement | MathMLElement = HTMLElement> = (
  tags: TuJsHtml_Tags<TRoot>,
  currentElement: TRoot extends HTMLElement ? SuperElementClass<TRoot> : DocumentFragment,
  ...extraArgs: unknown[]
) => unknown;
/**
 * 🔒 **Strict HTML Extended Callback**
 * A non-generic, strict version of the core callback, specifically locked to HTML elements.
 * 🤖 **AI INSTRUCTION:**
 * - Use this typing for custom plugins, internal HTML extensions, or strict components that MUST NOT be used inside SVG or MathML contexts.
 * @es 🔒 **Callback Extendido Estricto (Solo HTML)**
 * Versión estricta y no genérica bloqueada a elementos HTML. 
 * Útil para crear plugins o directivas que no deben ejecutarse en SVG/MathML.
 */
type TuJsHtml_CallbackExtended = (tags: TuJsHtml_Tags, currentElement: HTMLElement) => void;

/**
 * Template Literal Node Builder.
 * @es Constructor de fragmentos vía Template Literal nativo.
 * @example AnyNode`hola ${mundo}`;
 */
declare function AnyNode(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment;

/**
 * Fluid HTML Element Factory.
 * @es Fábrica de elementos HTML fluida. Lienzo donde se dibuja el HTML.
 * @version 4.9.3
 * @example
 * const demo = new TuJsHtml(tags => {
 *   tags.main(ctx => {
 *     ctx.h1`Title`;
 *     ctx.p("Content");
 *   });
 * });
 * document.body.append(demo)
 */
declare class TuJsHtml extends DocumentFragment {
  static TYPE_TAGS: TuJsHtml_Tags<DocumentFragment>;

  /**
   * Constructor for TuJsHtml rendering engine.
   * @es Constructor para el motor de renderizado TuJsHtml.
   * @param callback Main render callback / Render principal.
   * @param callbackFallback Fallback if async / Fallback (solo útil si el render es asíncrono).
   */
  constructor(
    callback: (tags: TuJsHtml_Tags<HTMLElement | DocumentFragment>) => void | Promise<void>,
    callbackFallback?: (tags: TuJsHtml_Tags<HTMLElement | DocumentFragment>) => void | ExecuteAfterRender
  );

  /** @deprecated */
  set(name: string, callback: TuJsHtml_CallbackExtended): this;

  /** Resets the TuJsHtml object state (triggers a re-render).
   * @es Restablece el estado del objeto TuJsHtml (dispara un re-render).
   */
  reset(): void;

  /** Removes all DOM content attached to this instance.
   * @es Elimina todo el contenido DOM adjunto a esta instancia.
   */
  remove(): void;

  get tag(): TuJsHtml_Tags<HTMLElement | DocumentFragment>;
  get isConnected(): boolean;
}

/**
 * Namespace housing all core TuJsHtml types.
 * @es Espacio de nombres que alberga los tipos core de TuJsHtml.
 */
declare namespace TuJsHtml {
  export namespace Types {
    export type Tags<TRoot extends HTMLElement | DocumentFragment = HTMLElement> = TuJsHtml_Tags<TRoot>;
    export type Element<TElement extends HTMLElement = HTMLElement> = SuperElementClass<TElement>;
    export type Callback<TElement extends HTMLElement | DocumentFragment = HTMLElement> = TuJsHtml_Callback<TElement>;

    /**
     * Helper type intended for JSDoc casting in pure JS files.
     * @es Tipo de ayuda diseñado para castear Custom Elements en archivos JS puros vía JSDoc.
     * @example 
     * const { "my-el": el = /** @type {TuJsHtml.Types.CustomTag<MyEl>} *\/ (null) } = tags;
     */
    export type CustomTag<TElement extends HTMLElement> = SpecificTagFunction<TElement>;
    /**
     * Helper type exposing the configuration object interface for building reusable templates/props.
     * @es Tipo de ayuda que expone la interfaz de configuración (atributos) para tipar plantillas/props reutilizables.
     * @example
     * // * @ type {TuJsHtml.Types.Attributes<HTMLButtonElement>} * /
     * const btnConfig = { className: "btn-primary", onclick: () => {} };
     */
    export type Attributes<TElement extends HTMLElement = HTMLElement> = ConfigureAttributes<TElement>;
  }
}

declare class TuTemplateHtml {
    /**
     * @template T
     * @param {HTMLElement|DocumentFragment} rootElement
     * @param {T} slotMap
     * @param {(slotMap:{[K in keyof T]: string}) => string} cbHtmlString
     * @returns {T}
     */
    static createTemplate<T>(rootElement: HTMLElement | DocumentFragment, slotMap: T, cbHtmlString: (slotMap: { [K in keyof T]: string; }) => string): T;
    static Types: {
        /**
         * @returns {HTMLElement}
         */
        ElementParent: () => HTMLElement;
        /** @returns {Text} */
        Text: (defaultText?: string) => Text;
        /**
         * @returns {HTMLElement|HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|HTMLButtonElement}
         */
        ElementNext: () => HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement;
    };
}

// importante para forzar los tipos del DOM 
/// <reference lib="dom" />

type FunctionGeneric = (...args: unknown[]) => unknown;
interface ObjectGeneric {
    // aquí tus propiedades mínimas
    [key: string]: unknown;
}
// Global Attributes
type GlobalAttributes = {
    id?: string;
    class?: string;
    style?: string;
    title?: string;
    // Data attributes are handled by a string index signature
};

// Event Attributes
type EventAttributes = {
    onclick?: string;
    onfocus?: string;
    oninput?: string;
    onload?: string;
    onsubmit?: string;
    onmouseover?: string;
    // Add more event attributes here as needed
};

// Form Attributes
type FormAttributes = {
    action?: string;
    method?: 'GET' | 'POST';
    name?: string;
    value?: string | number;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
};

// ARIA Attributes
type AriaAttributes = {
    role?: string;
    'aria-label'?: string;
    'aria-hidden'?: 'true' | 'false';
    'aria-live'?: 'polite' | 'assertive' | 'off';
    // Add more ARIA attributes here as needed
};

// Multimedia Attributes
type MediaAttributes = {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
};

// Link Attributes
type LinkAttributes = {
    href?: string;
    target?: '_self' | '_blank' | '_parent' | '_top';
    rel?: string;
};

// Combine all attribute groups into a single, comprehensive type.
// The string index signature acts as a catch-all for custom attributes (e.g., data-*)
type HtmlAttributes = GlobalAttributes & EventAttributes & FormAttributes & AriaAttributes & MediaAttributes & LinkAttributes & {
    [key: string]: string | number | boolean | null | undefined;
};

/**
 * Tipo que define los nodos posibles que pueden ser pasados a las funciones de tags.
 * Pueden ser elementos HTML, nodos de texto, o funciones.
 */
type RecursiveNode = Node | FunctionGeneric | ObjectGeneric | Builder_Callback;
//export type RecursiveNode = Node | Function | Object | Builder_Callback | TuadminHtmlElement;

/**
 * Función recursiva que puede ser utilizada para crear etiquetas HTML.
 * Puede tomar nodos o funciones y devolver más funciones recursivas.
 */
// export interface RecursiveTag {
//   (firstArg:ReactiveAttributes | RecursiveNode ,...args: RecursiveNode[]): TuadminHtmlElement;
//   //(): HTMLElement; // Para finalizar y devolver un elemento HTML
// }
type RecursiveTag = (firstArg: HtmlAttributes | RecursiveNode, ...args: RecursiveNode[]) => HTMLElement;
type Builder_Callback = (tags: Builder_Tags, currentTag: HTMLElement) => HTMLElement | void;
type CustomTagPattern = `${string}-${string}`;
type CustomTagPattern2 = `${string}`;
type AllElementTags = keyof HTMLElementTagNameMap | CustomTagPattern | CustomTagPattern2;

type Builder_Tags = {
    [K in AllElementTags]: RecursiveTag;
    //[key: string]: RecursiveTag;
}
type BuilderTemplate = {
    (element: HTMLElement): HTMLElement;
    (strings: TemplateStringsArray, ...values: unknown[]): HTMLElement | DocumentFragment;
    (defineRoot: HTMLElement | string): HTMLElement | DocumentFragment;
    (builder: Builder_Callback): HTMLElement | DocumentFragment;
};
// Define un tipo que extienda HTMLElement con una propiedad dinámica.
type HtmlElementOrFragmentWithProp<T, K extends string> = (HTMLElement | DocumentFragment) & {
    [P in K]: T;
};

/**
 * A factory function that creates a template instance builder.
 * It's designed to be flexible, supporting various template creation methods.
 *
 * @template T The type of the object containing the references (refs). This type is inferred from the return value of the template builder function.
 *
 * @example
 * // Example 1: Declarative builder with inferred refs
 * const fabrica1 = createTemplateHtml((root) => {
 *   let label; // The root builder will handle DOM creation.
 *   root(tags => {
 *     // Using tags to build the DOM
 *     tags.div(tags.span(node => (label = node.textNode("Hello"))));
 *   });
 *   return { "data": label }; // The type of 'data' is now inferred
 * });
 *
 * // The returned function has autocompletion for `data`
 * const [root1, refs1] = fabrica1();
 * refs1.data.set("New value"); // Autocomplete for 'data' works. 
 * // The returned function has autocompletion for `data`
 * const [root1Clon, refsClon] = fabrica1();
 * refsClon.data.set("New clon value"); // Autocomplete for 'data' works.
 * document.body.appendChild(root1,root1Clon);
 *
 * @example
 * // Example 2: Tagged template literal with inferred refs
 * const fabrica2 = createTemplateHtml((root) => {
 *   const dom = root`<div><span>{label}</span></div>`;
 *   return { "label": dom.querySelector('span') }; // 'label' is inferred here
 * });
 *
 * // The returned function has autocompletion for `label`
 * const [root2, refs2] = fabrica2();
 * refs2.label.textContent = "New text"; // Autocomplete for 'label' works.
 * @example 3 complex 
 * ```js
 * 
 * const templateLi = createTemplateHtml((root) => {
 *   const texto = document.createTextNode("texto inicial");
 *   root(
 *       ({ li, span, b, i }) =>
 *           li(_ => {
 *               i('italic ')
 *               b(texto)
 *               span(' span')
 *           })
 *   );
 *   return { texto };
 * });
 * const ul = document.createElement("ul");
 * for (let i = 0; i < 3; i++) {
 *    //const [li, refs] = templateLi.cloneAsTuple();
 *    //refs.texto.textContent = `texto ${i}`;
 *    //ul.appendChild(li);
 *    const li = templateLi.clone();
 *    ul.appendChild(li);
 *    li.refs.texto.textContent = `texto ${i}`;
 * }
 * document.body.appendChild(ul);
 * ul.firstElementChild.nextElementSibling.refs.texto.textContent = `i am middle`;
 * ```
 * ## result
 * ```html
 * <ul>
 *    <li><i>italic </i><b>texto 0</b><span> span</span></li>
 *    <li><i>italic </i><b>i am middle</b><span> span</span></li>
 *    <li><i>italic </i><b>texto 2</b><span> span</span></li>
 * </ul>
 * ```
 */
declare function createTemplateHtml<T>(
    /**
     * The builder function that creates the template and returns an object with exposed references.
     * @param rootBuilder A function or template tag to build the template's root element.
     * @returns An object whose properties are the exposed references.
     */
    builderFn: (rootBuilder: BuilderTemplate) => T
): {

    /**
     * Modifies the original template's exposed nodes.
     * @param modifierFn A function that receives an object with references to the original template's exposed nodes.
     */
    cloneAsTuple(modifierFn: (refs: T) => void): [HTMLElement | DocumentFragment, T];
    /**
     * Clones the template and adds the references as a property to the cloned element.
     * @param nameOfProp The name of the property to add to the cloned element. Defaults to 'refs'.
     * @returns {HtmlElementOrFragmentWithProp<T, N>} The cloned root element with a new property containing the references.
     */
    clone<N extends string = 'refs'>(modifierFn?: (refs: T) => void, nameOfProp?: N): HtmlElementOrFragmentWithProp<T, N>;
};

/**
 * RemoteModuleCore - High-performance Web Worker Bridge
 * Optimized for Bundled Services, Shared States, and Micro-threads.
 * @author Victor Choque (tuadmin)
 * @package Threading
 * @version 2.1.2
 */

/** Extracts literal values from an object constants */
type ValueOf<T> = T[keyof T];

/**
 * **EN:** Internal management interface for the Remote Module.
 * Access it via the `$control` property on your linked instance.
 *
 * **ES:** Interfaz de gestión interna del Remote Module.
 * Accédela mediante la propiedad `$control` en tu instancia vinculada.
 */
interface RemoteControl<E = undefined> {
    /**
     * **EN:** Subscribe to worker-emitted events via Pub/Sub protocol.
     *
     * **ES:** Suscríbete a eventos emitidos por el worker mediante el protocolo Pub/Sub.
     * @param eventName - Value from the exported Events object.
     * @param callback - Function to handle the payload.
     */
    on(eventName: E extends undefined ? string : ValueOf<E>, callback: (payload: unknown) => void): void;

    /**
     * **EN:** Returns true if the worker is idle and ready for new tasks.
     *
     * **ES:** Retorna true si el worker está libre para recibir tareas.
     */
    isReady(): boolean;

    /**
     * **EN:** Returns true if the connection has been finalized (locally or globally).
     *
     * **ES:** Retorna true si la conexión ha sido finalizada (local o globalmente).
     */
    isClosed(): boolean;

    /**
     * **EN:** Performs a real-time check (Handshake Pong) to see if the thread is responsive.
     *
     * **ES:** Realiza una comprobación en tiempo real (Handshake Pong) para ver si el hilo responde.
     */
    isAlive(): Promise<boolean>;

    /**
     * **EN:** Closes the current connection port.
     * - In Simple/Local: Terminates the dedicated thread.
     * - In Shared/Global: Closes only the local port (other tabs remain connected).
     *
     * **ES:** Cierra el puerto de conexión actual.
     * - En Simple/Local: Finaliza el hilo dedicado.
     * - En Shared/Global: Cierra solo el puerto local (otras pestañas siguen conectadas).
     */
    disconnect(): void;

    /**
     * **EN:** Alias for `disconnect()`. For compatibility with native Worker interface.
     *
     * **ES:** Alias de `disconnect()`. Por compatibilidad con la interfaz nativa de Worker.
     * @deprecated Use disconnect() instead.
     */
    terminate(): void;

    /**
     * **EN:** **DANGEROUS**: Forces the specific service (PID) to stop in the worker.
     * If it's the last service in the thread, the entire Worker (self) will close,
     * sending a "death cry" to all other connected tabs.
     *
     * **ES:** **PELIGROSO**: Fuerza al servicio específico (PID) a detenerse en el worker.
     * Si es el último servicio en el hilo, el Worker completo (self) se cerrará,
     * enviando un "grito de muerte" a todas las demás pestañas conectadas.
     */
    kill(): Promise<void>;
}

interface CrashContext {
    /** Total crashes detected in the current session. */
    retryCount: number;
    /** Error message or stack trace provided by the worker. */
    msg?: string;
    /** Whether the crash is terminal (max retries reached). */
    fatal: boolean;
    /** Triggers a page reload to attempt restoration of the environment. */
    reconnect: () => void;
}

interface ConnectOptions {
    /**
     * **EN:** Debug name for the worker thread.
     *
     * **ES:** Nombre de depuración para el hilo.
     */
    name?: string;
    /**
     * **EN:** Enables SharedWorker (multi-tab support).
     *
     * **ES:** Habilita SharedWorker (soporte multi-pestaña).
     */
    shared?: boolean;
    /**
     * **EN:** Reuses same connection for the same URL/Name.
     * 
     * **ES:** Reutiliza la misma conexión para la misma URL/Nombre.
     */
    singleton?: boolean;
    /** 
     * **EN:** Handshake timeout (ms) before triggering a retry.
     * 
     * **ES:** Tiempo de espera del handshake (ms) antes de activar un reintento. 
     * @default 3000 
     */
    timeout?: number;
    /** 
     * **EN:** Max physical connection retries before failing. 
     * 
     * **ES:** Número máximo de reintentos de conexión física antes de fallar. 
     * 
     * @default 3 
     */
    maxRetries?: number;
    /** 
     * **EN:** Disaster recovery callback. 
     * 
     * **ES:** Callback de recuperación de errores. 
     */
    onCrash?: (ctx: CrashContext) => void;
    /** 
     * **EN:** Process ID for routing in bundled workers. 
     * 
     * **ES:** ID de proceso para ruteo en workers empaquetados. 
     */
    pid?: string;
}

/**
 * RemoteModule - High-performance Web Worker Bridge
 * Optimized for Bundled Services, Shared States, and Micro-threads.
 * @version 2.1.2
 * @author Victor Choque (tuadmin)
 * @package Threading
 */






/** 
 * **EN:** The "Mirror" of the Service in the Client.
 * Methods become Promises and management is moved to `$control`.
 * 
 * **ES:** El "Espejo" del Servicio en el Cliente.
 * Los métodos se vuelven Promesas y la gestión se mueve a `$control`.
 */
type RemoteLink<T, E = undefined> = {
    // 1. Mapeo de métodos originales (Promisificados)
    readonly [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K];
} & {
    /**
     * **EN:** Management property to avoid method collision with your class.
     * **ES:** Propiedad de gestión para evitar colisiones de métodos con tu clase.
     */
    readonly $control: RemoteControl<E>;
};

/**
 * ### RemoteModule (Base)
 * **EN:** Standard Worker bridge. Each `connect()` creates a fresh, isolated instance.
 * 
 * **ES:** Puente de Worker estándar. Cada `connect()` crea una instancia nueva y aislada.
 * @version 2.1
 */
declare class RemoteModule {
    /** 
     * **EN:** Starts hosting the service logic inside the Worker thread.
     * 
     * **ES:** Inicia el hosting de la lógica del servicio dentro del hilo del Worker.
     * @param meta - Pass `import.meta` to automatically detect the worker script URL.
     */
    static register(meta: ImportMeta | string): void;

    /**
     * **EN:** Connects to the Worker and returns a Promisified Proxy.
     * 
     * **ES:** Conecta con el Worker y devuelve un Proxy asíncrono.
     */
    static connect<T extends typeof RemoteModule, E = undefined>(
        this: T,
        options?: ConnectOptions
    ): Promise<RemoteLink<InstanceType<T>, E>>;

    /** 
     * **EN:** Sends a private event to the clients of THIS instance.
     * 
     * **ES:** Envía un evento privado a los clientes de ESTA instancia.
     */
    protected publish(event: string, payload?: unknown): void;

    /**
     * **EN:** Broadcasts an event to ALL services in this Worker thread.
     * 
     * **ES:** Envía un evento a TODOS los servicios en este hilo del Worker.
     */
    protected broadcast(event: string, payload?: unknown): void;
}

/**
 * ### RemoteLocalModule (Tab Singleton)
 * **EN:** Shared instance within the CURRENT TAB (SPA).
 * 
 * **ES:** Instancia compartida dentro de la PESTAÑA ACTUAL (SPA).
 */
declare class RemoteLocalModule extends RemoteModule {
    static connect<T extends typeof RemoteLocalModule, E = undefined>(
        this: T,
        options?: Omit<ConnectOptions, 'singleton'>
    ): Promise<RemoteLink<InstanceType<T>, E>>;
}

/**
 * ### RemoteSharedModule (Multi-Tab / SharedWorker)
 * **EN:** Shared across multiple tabs/windows via SharedWorker.
 * 
 * **ES:** Compartido entre múltiples pestañas/ventanas vía SharedWorker.
 */
declare class RemoteSharedModule extends RemoteModule {
    static connect<T extends typeof RemoteSharedModule, E = undefined>(
        this: T,
        options?: Omit<ConnectOptions, 'shared'>
    ): Promise<RemoteLink<InstanceType<T>, E>>;
}

/**
 * ### RemoteGlobalModule (Browser Singleton)
 * **EN:** One single instance for the entire browser session.
 * 
 * **ES:** Una única instancia para toda la sesión del navegador.
 */
declare class RemoteGlobalModule extends RemoteModule {
    static connect<T extends typeof RemoteGlobalModule, E = undefined>(
        this: T,
        options?: Omit<ConnectOptions, 'shared' | 'singleton' | 'name'>
    ): Promise<RemoteLink<InstanceType<T>, E>>;
}

/**
 * **EN:** Namespace to access all Remote Module variants.
 * 
 * **ES:** Namespace para acceder a todas las variantes de Remote Module.
 */
declare const Remote: {
    readonly Simple: typeof RemoteModule;
    readonly Local: typeof RemoteLocalModule;
    readonly Shared: typeof RemoteSharedModule;
    readonly Global: typeof RemoteGlobalModule;
};

/**
 * FrankJStein: TuDiscovery Type Definitions
 * 
 * Functional Service Locator and Module Discovery Hub.
 * Alternative to Import Map Aliases, ideal for environments with restricted resolution (Workers).
 * 
 * @es Localizador de Servicios Funcional y Hub de Descubrimiento de Módulos.
 * Alternativa a los Import Map Aliases, ideal para entornos con resolución restringida (Workers).
 */

/**
 * @template T
 * A discovery node represents a module that can be resolved lazily.
 * 
 * @es Un nodo de descubrimiento representa un módulo que puede resolverse de forma perezosa.
 */
type DiscoveryNode<T> = {
    /** 
     * Call as a function with an optional callback to use the module once resolved.
     * @es Llamar como función con un callback opcional para usar el módulo una vez resuelto.
     * 
     * @example 
     * Hub.math(m => m.sum(1, 2));
     */
    (cb?: (module: T) => void): Promise<T>;
} & Promise<T>;

/**
 * Registry of module loaders.
 * @es Registro de cargadores de módulos.
 */
type DiscoveryRegistry = Record<string, () => Promise<any>>;

/**
 * Map of discovery nodes based on the registry.
 * @es Mapa de nodos de descubrimiento basado en el registro.
 */
type TuDiscoveryMap<T extends DiscoveryRegistry> = {
    [K in keyof T]: DiscoveryNode<Awaited<ReturnType<T[K]>>>;
} & {
    /** 
     * Run a smoke test on all registered modules to ensure they are resolvable.
     * @es Ejecuta una prueba de humo en todos los módulos registrados para asegurar que son resolubles.
     */
    "$verify"(): Promise<void>;
};

declare class TuDiscovery {
    /**
     * Creates a discovery hub that lazily loads modules and provides dual-usage (Promise/Callback).
     * Ideal for maintaining absolute paths and avoiding "Alias Infection" in Workers.
     * 
     * @es Crea un hub de descubrimiento que carga módulos de forma perezosa y provee uso dual (Promesa/Callback).
     * Ideal para mantener rutas absolutas/relativas y evitar la "Infección de Alias" en Workers.
     * 
     * @template T
     * @param registry - Object mapping keys to import() loaders.
     * 
     * @example
     * const Hub = TuDiscovery.create({
     *   math: () => import("./math.js"),
     *   auth: () => import("./auth.js")
     * });
     * 
     * // Use as Promise
     * const m = await Hub.math;
     * 
     * // Use as Callback
     * Hub.math(m => m.sum(1, 2));
     */
    static create<T extends DiscoveryRegistry>(registry: T): TuDiscoveryMap<T>;
}

/**
 * @file TuContainer.d.ts
 * @description Type definitions for the Sovereign DI Kernel.
 * @es Definiciones de tipos para el Núcleo de Inyección Soberano.
 */

/**
 * @class TuScope
 * @description Manages a local cache of instances and hierarchical resolution.
 * @es Gestiona un caché local de instancias y la resolución jerárquica.
 */
declare class TuScope {
    private _cache: Map<unknown, unknown>;
    private _parent: TuScope | null;
    private _disposed: boolean;

    constructor(parent?: TuScope | null);

    /**
     * Resolves a dependency by searching the hierarchy.
     * @es Resuelve una dependencia buscando en la jerarquía.
     * @param token The class or token to resolve. /es La clase o token a resolver.
     * @returns The resolved instance. /es La instancia resuelta.
     */
    resolve<T>(token: Token<T>): T;

    /**
     * Disposes the scope and clears its cache.
     * @es Dispone el scope y limpia su caché.
     */
    dispose(): void;
}

//export type Constructor<T = unknown> = new (...args: unknown[]) => T;
// 1. Cambiamos 'new' por 'abstract new'
type Constructor<T = unknown> = abstract new (...args: unknown[]) => T;
// 2. El Token automáticamente heredará la capacidad de ser una clase abstracta
type Token<T = unknown> = Constructor<T> | string | symbol;
type Factory<T = unknown> = (ctx: TuScope) => T;

/**
 * @class TuContainer
 * @description Central registry for all dependencies and root scope.
 * @es Registro central para todas las dependencias y scope raíz.
 */
declare class TuContainer {
    static root: TuScope;

    /**
     * Registers a singleton dependency (One instance for the entire app).
     * @es Registra una dependencia tipo singleton (Una instancia para toda la app).
     * @example
     * TuContainer.addSingleton(AppConfig);
     * TuContainer.addSingleton(IService, (ctx) => new MyService("apiKey", ctx.resolve(ILogger)));
     */
    static addSingleton<T>(token: Token<T>, factory: Factory<T>): void;
    static addSingleton<T>(token: Token<T>, provider?: Constructor<T>): void;

    /**
     * Registers a transient dependency (New instance every time).
     * @es Registra una dependencia tipo transient (Instancia nueva cada vez).
     */
    static addTransient<T>(token: Token<T>, factory: Factory<T>): void;
    static addTransient<T>(token: Token<T>, provider?: Constructor<T>): void;

    /**
     * Registers a scoped dependency (One instance per Scope hierarchy).
     * @es Registra una dependencia tipo scope (Una instancia por jerarquía de Scope).
     */
    static addScope<T>(token: Token<T>, factory: Factory<T>): void;
    static addScope<T>(token: Token<T>, provider?: Constructor<T>): void;

    /**
     * Creates a new child scope.
     * @es Crea un nuevo scope hijo.
     * @param callback Optional callback with the new scope. /es Callback opcional con el nuevo scope.
     * @param parent Custom parent scope. /es Scope padre personalizado.
     */
    static createScope(callback?: (scope: TuScope) => unknown, parent?: TuScope | null): TuScope;
    /**
     * Checks if a token is registered.
     * @es Verifica si un token está registrado.
     */
    static hasRegistration(token: Token): boolean;
    /**
     * Resolves a dependency from the root scope.
     * @es Resuelve una dependencia desde el scope raíz.
     */
    static resolve<T>(token: Token<T>): T;
}

/**
 * Lazily injects a dependency. Captured at instantiation time.
 * @es Inyecta una dependencia de forma diferida (perezosa). Capturado al instanciar.
 */
declare function TuLazyInject<T>(tokenProvider: () => Token<T>): T;

/**
 * Synchronously injects a dependency.
 * @es Inyecta una dependencia de forma sincrónica.
 */
declare function TuInject<T>(token: Token<T>): T;

/**
 * @namespace DI
 * @description Grouped access to the DI system.
 * @es Acceso agrupado al sistema de inyección.
 */
declare const DI: {
    readonly Container: typeof TuContainer;
    readonly Scope: typeof TuScope;
    readonly Inject: typeof TuInject;
    readonly LazyInject: typeof TuLazyInject;
};

export { AnyNode, DI, ELEMENT_UTIL, ObservableDraft, ReactiveDraft, Remote, RemoteGlobalModule, RemoteLocalModule, RemoteModule, RemoteSharedModule, TUtils, TuContainer, TuDiscovery, TuInject, TuJsHtml, TuLazyInject, TuScope, TuTemplateHtml, TuWebUtils, createComputedSignal, createKageBunshinObject, createSignal, createTemplateHtml, debounce, debounceEvents, makeReactive, textSize, textSizeEvents, trim };
