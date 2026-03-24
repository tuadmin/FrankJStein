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
type Repeatable<F extends (...args: any[]) => any> = {
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
     * @param {(...args: any[]) => Promise<T>} asyncFn - The async function to cache
     * @returns {(...args: any[]) => Promise<T>} A function with the same signature that caches the result
     *
     * @example // Dynamic import
     * //// @ type {(id: string) => Promise<{ name: string }>}
     * const loadLib = TUtils.cachedAsync(() => import('heavy-library'));
     * const lib = await loadLib(); // Executes once
     *
     * @example // API Fetch
     * const fetchData = TUtils.cachedAsync(() => fetch('/data').then(r => r.json()));
     */
    static cachedAsync<T>(asyncFn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T>;
    /**
     * Creates a cached async function that stores results by argument signature.
     *
     * @template T - Return type of the async function
     * @template {any[]} Args - Array type for the arguments (must be array-like)
     * @param {(...args: Args) => Promise<T>} asyncFn - Async function to cache
     * @param {(...args: any[]) => string} [keyFn] - Optional function to generate cache keys
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
    static cachedAsyncByArgs<T, Args extends any[]>(asyncFn: (...args: Args) => Promise<T>, keyFn?: (...args: any[]) => string): (...args: Args) => Promise<T>;
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
    static repeatCall<F extends (...args: any[]) => any>(fn: F): Repeatable<F>;

    /**
    * Define una propiedad 'lazy' en un objeto. Su valor es calculado solo al ser accedido por primera vez.
    * @param {object} obj - El objeto en el que se definirá la propiedad.
    * @param {string} key - El nombre de la propiedad.
    * @param {function} getterFn - La función que retorna el valor final de la propiedad.
    */
    static defineLazyPropertyGetter(obj:object, key:string, getterFn:()=>any):void ;
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
    static safe<T, E = any>(
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
    onItemError?: (error: any, item: T, index: number) => void;
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
    cause?: any;
    constructor(message: string, state: ForEachAsyncResult, cause?: any);
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
    function throttle<T extends (...args: any[]) => any>(
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
    function debounce<T extends (...args: any[]) => any>(
        fn: T,
        wait: number,
        immediate?: boolean
    ): (...args: Parameters<T>) => void;

    /**
     * Convierte cualquier Promesa en una tupla [error, data].
     */
    function safe<T, E = any>(
        promise: Promise<T>
    ): Promise<[E, null] | [null, T]>;
}

/**
 * Obtiene una unión de todas las claves de un tipo `T` cuyas propiedades NO son una función.
 */
type KeysWithoutFunctions$2<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];
declare namespace KageBunshin {
    export type IsAliveCallback = () => boolean;
    export type ListenerCallback = (...args: any[]) => void
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
        [K in KeysWithoutFunctions$2<T> & string as `$${K}`]: ((
            callback: (newValue: T[K], oldValue: T[K]) => void,            
        ) => UnsubscribeFunction )& {
            subscribe: (callback: (newValue: T[K], oldValue: T[K]) => void, ) => UnsubscribeFunction;
            once: (callback: (newValue: T[K], oldValue: T[K]) => void, ) => UnsubscribeFunction};
    } & T & {
        (callback: (data: T) => void, isOneTime?: boolean): UnsubscribeFunction;
    } & Ninjutso<T>

    export type createKageBunshinObject = <T extends object>(obj: T, isAliveCallback?: IsAliveCallback) => KageBunshinNoJutsu<T>;
}
declare const createKageBunshinObject: KageBunshin.createKageBunshinObject;

/**
 * A utility function to be called to unsubscribe from a property's changes.
 */
type UnsubscribeFunction$1 = () => void;

/**
 * A utility type that extracts the keys of T whose values are not functions.
 */
type KeysWithoutFunctions$1<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
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
  (callback: (newValue: V, oldValue: V) => void): UnsubscribeFunction$1;

  /**
   * Subscribes to changes for this specific property.
   * @param callback The function to call when the value changes.
   * @returns A function to call to unsubscribe.
   */
  subscribe(callback: (newValue: V, oldValue: V) => void): UnsubscribeFunction$1;
  
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
  Pick<T, KeysWithoutFunctions$1<T>> & 
  {
    [K in KeysWithoutFunctions$1<T> & string as `$${K}`]: ReactiveProperty<T[K]>;
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

/**
 * Represents a function that can be called to cancel a subscription.
 */
type UnsubscribeFunction = () => void;

/**
 * A utility type that extracts the keys of T whose values are not functions.
 */
type KeysWithoutFunctions<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];

// === Utility Types ===



// === Plugin System Contract ===

/**
 * The context object passed to every plugin function.
 */
interface PluginContext$1<T extends object = object> {
    key: keyof T;
    oldValue: any;
    newValue: any;
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
    'change': (payload: { key: keyof T, value: any }) => void;
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
    subscribe(callback: (newValue: V) => void): UnsubscribeFunction;
    /** Subscribes to the next change for this property. */
    once(callback: (newValue: V) => void): UnsubscribeFunction;
};
/**
 * A central map of all built-in events and their callback signatures.
 * This interface can be augmented via declaration merging to add custom middleware events.
 */
type ObservableDraftProps<T extends object> =
    Pick<T, KeysWithoutFunctions<T>> &
    {
        [K in KeysWithoutFunctions<T> & string as `$${K}`]: PropertyTools<T[K]>;
    };

// === UNIFIED EVENT MAP (For perfect autocompletion) ===
/**
 * A comprehensive map of all possible events that an ObservableDraft instance can emit.
 * This combines base events, property-specific events (`$`), and middleware events (`use:`).
 */
type AllObservableDraftEvents<T extends object> = 
    ObservableDraftEventMap<T> &
    { [K in KeysWithoutFunctions<T> & string as `$${K}`]: (newValue: T[K]) => void } 
    // ya no se usan los use por que eso ya depende de los PLUGINS
    //& { [K in KeysWithoutFunctions<T> & string as `use:${K}`]: (payload: MiddlewareEventPayload) => void };


// === Main Class Definition ===

declare class ObservableDraft<T extends object, E extends object = {}> {
  /**
   * The reactive properties of the draft.
   * This type is simplified here; the real magic is in the event autocompletion.
   */
  public props: ObservableDraftProps<T>; 

  constructor(originalObject: T, commitTrigger?: string, scheduler?: { asap: (cb: () => void) => void; defer: (cb: () => void) => number; cancelDefer: (handle: number) => void; });

  static create<T extends object>(originalObject: T, commitTrigger?: string, scheduler?: any): ObservableDraft<T>;

  public readonly isDirty: boolean;

  public readonly isStale: boolean;

  /**
   * Subscribes to an event. Provides strong typing and autocomplete for all known events.
   */
  public on<K extends keyof (AllObservableDraftEvents<T> & E)>(
      event: K, 
      callback: (AllObservableDraftEvents<T> & E)[K]
  ): UnsubscribeFunction;
  
  /**
   * Subscribes to an event for a single emission.
   */
  public once<K extends keyof (AllObservableDraftEvents<T> & E)>(
      event: K, 
      callback: (AllObservableDraftEvents<T> & E)[K]
  ): UnsubscribeFunction;
  
  /**
   * Registers middleware functions for a specific property.
   */
  //public use<K extends KeysWithoutFunctions<T> & string>(key: K, ...middlewares: MiddlewareFunction<T>[]): this;

    /**
   * Registers plugin functions for a specific property.
   */
  public usePlugins<K extends KeysWithoutFunctions<T> & string>(key: K, ...plugins: PluginFunction$1<T>[]): this;

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
  public emit(event: string, payload: any): void;
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
     */
    readonly asTuple: readonly [() => T, (newValue: T) => void];

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
} & (K extends 'value' ? {} : {
    /**
     * A convenient getter/setter for the reactive property, providing direct access to its value.
     */
    value: V;
});

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

// importante para forzar los tipos del DOM 
/// <reference lib="dom" />


//import type {IS_CONFIG_OBJECT} from "./constantes.d.ts";
//export declare const IS_CONFIG_OBJECT : unique symbol;

// --- TIPO DE AYUDA GENÉRICO ---
interface Subscribable<T> {
  subscribe(onValue: (value: T) => void): void;
  subscribe(onValue: (value: T, oldValue: T) => void): void;

}
/**
 * Un tipo de ayuda que indica que un valor puede ser estático o una señal.
 * @template T El tipo del valor.
 */
type SignalOr<T> = T | TuSignal<T> | Subscribable<T> | number;

/** Un mapa de nombres de clase a una condición booleana para el `toggle`. */
type ClassToggleMap = {
  [className: string]: SignalOr<boolean>;
};

/** Un mapa de tipos de evento a su función manejadora (listener). */
type EventListenerMap = {
  [EventType in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[EventType]) => void;
};
/**
 * Interfaz exhaustiva de los atributos Globales del DOM, usando la nomenclatura
 * de atributos HTML (minúsculas) tal como se requiere para setAttribute().
 *
 * NOTA: Los valores deben ser SignalOr<string | number | boolean>, ya que setAttribute
 * serializa todo a string.
 */
interface GlobalSetAttributes {
  // === Atributos Globales Clave (Nomenclatura HTML) ===
  id?: SignalOr<string>;
  'class'?: SignalOr<string>; // <-- ¡Usar 'class' en lugar de className!
  style?: SignalOr<string>;       // Permite un objeto de estilo o un string
  title?: SignalOr<string>;
  dir?: SignalOr<'ltr' | 'rtl' | 'auto' | string>;
  lang?: SignalOr<string>;
  hidden?: SignalOr<boolean | string>;

  // === Accesibilidad y Comportamiento ===
  role?: SignalOr<string>;
  tabindex?: SignalOr<number | string>; // <-- Usar 'tabindex' en minúsculas
  contenteditable?: SignalOr<boolean | string>;
  draggable?: SignalOr<boolean | string>;
  translate?: SignalOr<'yes' | 'no' | string>;

  // === Atributos de Recursos Comunes ===
  href?: SignalOr<string>;
  src?: SignalOr<string>;
  alt?: SignalOr<string>;
  type?: SignalOr<string>;

  // === Atributos de Formularios Comunes ===
  disabled?: SignalOr<boolean | string>;
  placeholder?: SignalOr<string>;
  value?: SignalOr<string | number>;
  name?: SignalOr<string>;

  // === Aria Attributes (Ejemplos) ===
  'aria-label'?: SignalOr<string>;
  'aria-hidden'?: SignalOr<boolean | string>;
  // ... cualquier otro atributo aria-*

  // === Index Signature para data-* y Atributos Personalizados ===
  // Permite que cualquier otro atributo, como 'data-nombre' o 'custom-attr', sea válido.
  [attribute: string]: SignalOr<any> | undefined;
  //[key: string]: SignalOr<any>;
}
/**
 * Un objeto JavaScript estándar que representa los datos de un formulario.
 * Sus claves son los atributos `name` de los campos, y sus valores son
 * los valores de dichos campos. Puede contener arrays para campos múltiples.
 */
type FormStateObject = {
  [key: string]: any; // O más estrictamente: FormDataEntryValue | FormDataEntryValue[]
};

// --- GRUPO 2: DIRECTIVAS REACTIVAS ESPECIALES (`@`) ---

/**
 * Contiene las "directivas" especiales que proveen lógica reactiva avanzada,
 * identificadas por el prefijo `@`.
 */
type DirectiveAttributes = {
  /**
   * @example
   * "@classToggle": {
   *   "classN": signalVar<boolean>,  
   *   "class1": true,
   *   "class2": false,
   * }
   */
  "@classToggle"?: ClassToggleMap;
  "@addClass"?: SignalOr<string>;
  "@on"?: EventListenerMap;
  "@one"?: EventListenerMap;
  "@once"?: EventListenerMap;
  "@bind:value"?: SignalOr<string | number | string[]>;
  "@bind:checked"?: SignalOr<boolean>;
  "@innerHTML"?: SignalOr<string>;
  "@attrs"?: GlobalSetAttributes & {
    [key: string]: SignalOr<any> | undefined;
  };
  /**
   * [DIRECTIVA] Captura los datos de un formulario en el evento de envío,
   * los convierte en un objeto y los guarda en la señal proporcionada.
   * Previene el envío tradicional del formulario.
   */
  "@bind:form"?: SignalOr<FormStateObject>;
};
/**
 * @OmitList (Cubriendo Octubre de 2025)
 * Lista ampliada de propiedades de solo lectura o de objeto que no deben estar 
 * disponibles para la configuración directa para un DX (Developer Experience) óptimo.
 */
type SpecialExclusionsPropsInHtmlElement =
  // Constantes Estáticas (Nodos, Posición)
  'ATTRIBUTE_NODE' | 'ATTRIBUTE_NODE' |
  'NODE_TYPE' | 'ELEMENT_NODE' | 'ATTRIBUTE_NODE' | 'TEXT_NODE' |
  'CDATA_SECTION_NODE' | 'ENTITY_REFERENCE_NODE' | 'ENTITY_NODE' |
  'PROCESSING_INSTRUCTION_NODE' | 'COMMENT_NODE' | 'DOCUMENT_NODE' |
  'DOCUMENT_TYPE_NODE' | 'DOCUMENT_FRAGMENT_NODE' | 'NOTATION_NODE' |
  'DOCUMENT_POSITION_DISCONNECTED' | 'DOCUMENT_POSITION_PRECEDING' |
  'DOCUMENT_POSITION_FOLLOWING' | 'DOCUMENT_POSITION_CONTAINS' |
  'DOCUMENT_POSITION_CONTAINED_BY' | 'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC' |
  //  Propieades NODO
  'firstElementChild' | 'lastElementChild' | 'attributeStyleMap' | 'nextElementSibling' |
  'nodeType' | 'enterKeyHin' | 'childElementCount' |

  // especiales o de solo lectura
  'style' | 'classList' | 'dataset' |
  'offsetWidth' | 'offsetHeight' | 'offsetLeft' | 'offsetTop' | 'offsetParent' |
  'clientWidth' | 'clientHeight' | 'clientLeft' | 'clientTop' |
  'scrollWidth' | 'scrollHeight' |
  'scrollLeft' | 'scrollTop' |
  'children' | 'childNodes' | 'parentElement' | 'parentNode' |
  'firstChild' | 'lastChild' | 'nextElementSibling' | 'previousElementSibling' |
  'nextSibling' | 'previousSibling' |
  'localName' | 'namespaceURI' | 'prefix' | 'tagName' | 'nodeName' |
  'nodeType' | 'ownerDocument' | 'baseURI' | 'isConnected' |
  'isContentEditable' | 'shadowRoot'
  | 'currentCSSZoom' | 'childElementCount'
  ;
// // Vamos a usar una combinación de tipos que TS pueda inferir como más específico.
// // Un objeto que tiene al menos una propiedad de ConfigureAttributes
// type ObjectWithSomeConfigProps<TElement extends HTMLElement> =
//     Partial<ConfigureAttributes<TElement>> & HasAnyPropertyFromKeys<ConfigureAttributes<TElement>, keyof ConfigureAttributes<TElement>>;
// 1. Tipo Auxiliar: Selecciona solo las claves de las propiedades que NO son funciones
type DataPropertyKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
// 2. Definición Modificada de SignalifyProperties
/**
 * Transforma un tipo de objeto T, haciendo que cada una de sus propiedades sea
 * del tipo SignalOr<OriginalPropertyType>.
 * Excluye las propiedades que ya son manejadores de eventos (funciones),
 * a menos que quieras que un manejador de eventos en sí mismo pueda ser una Signal.
 * (Aquí se asume que los manejadores de eventos no son Signals, solo sus valores).
 */
type SignalifyDataProperties<T> = {
  // Usamos 'Pick' para obtener SOLO las propiedades de datos
  [K in DataPropertyKeys<T>]?: SignalOr<T[K]>;
};
type SignalifyProperties<T> = {
  [K in keyof T]: T[K] extends Function // Si es una función (manejador de eventos), no lo Signalifiques
  ? T[K]
  : SignalOr<T[K]>; // De lo contrario, hazlo SignalOr<OriginalType>
};
/**
 * Representa el objeto de configuración para un elemento HTML específico.
 * Es la intersección de tus propiedades configurables fijas y las propiedades de datos del elemento.
 * El resultado será una lista reducida y controlada de sugerencias en el DX.
 * @template TElement - El tipo específico de HTMLElement (ej. HTMLImageElement, HTMLDivElement).
 */
// export type ConfigureAttributesOLD<TElement extends HTMLElement = HTMLElement> =
//     Partial<Pick<ConfigurableHtmlProps, keyof ConfigurableHtmlProps & keyof DataPropertiesOnly<TElement>>> &
//     Record<`data-${string}`, string | number | boolean>;
//type NodeLikeProperties = 'call' | 'nodeName' | 'childNodes' | 'parentElement' | 'ownerDocument' | 'tagName' | 'children' | 'hasChildNodes';

type ConfigureAttributes<TElement extends HTMLElement = HTMLElement> =
  SignalifyDataProperties< // ¡Aplicamos SignalifyProperties aquí!
    Omit<TElement, SpecialExclusionsPropsInHtmlElement>
  > &
  {
    style?: SignalifyProperties<Partial<CSSStyleDeclaration>>
    //style?: SignalifyProperties< Partial< Omit<CSSStyleDeclaration, 'Unknow'>>>
  } &
  // SignalifyProperties< // ¡Aplicamos SignalifyProperties aquí!
  //   Partial<
  //     Omit<TElement, 'style' | 'classList'>
  //   // Pick<
  //   //   TElement, keyof TElement      
  //   // >
  //   >
  // > &
  // {
  //   style?: SignalifyProperties< // ¡Aplicamos SignalifyProperties aquí!
  //     Partial<
  //       Omit<CSSStyleDeclaration, 'Unknow'>
  //     // Pick<
  //     //   TElement, keyof TElement      
  //     // >
  //     >
  //   >
  // } &
  DirectiveAttributes &
  //HtmlGlobalAttributes & // Propiedades y atributos globales
  // Propiedades específicas del elemento (src, alt, value, href, etc.), todas opcionales
  Record<`data-${string}`, string | number | boolean>  // Soporte para data-* arbitrarios como `data-id`
  //&  { readonly [IS_CONFIG_OBJECT]: true; } // <<<=== AÑADIMOS ESTO ===>>>

  ;

/// <reference lib="dom" />
// webview.d.ts
/**
 * Definición de TypeScript para la etiqueta <webview> en Chrome Apps.
 * Proporciona tipado completo para propiedades, métodos y eventos.
 */

declare global {
    export interface Window {
        chrome?: {
            webview?: WebViewElement;
        };
    }
}
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
    executeScript(details: InjectDetails, callback?: (results: any[]) => void): void;
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
    addEventListener(type: 'close', listener: (this: WebViewElement, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'consolemessage', listener: (this: WebViewElement, ev: AppendEvent<ConsoleMessageEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'contentload', listener: (this: WebViewElement, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'dialog', listener: (this: WebViewElement, ev: AppendEvent<DialogController>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'exit', listener: (this: WebViewElement, ev: AppendEvent<ExitEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'findupdate', listener: (this: WebViewElement, ev: AppendEvent<FindCallbackResults>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadabort', listener: (this: WebViewElement, ev: AppendEvent<LoadAbortEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadcommit', listener: (this: WebViewElement, ev: AppendEvent<LoadCommitEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadredirect', listener: (this: WebViewElement, ev: AppendEvent<LoadRedirectEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'loadstart', listener: (this: WebViewElement, ev: AppendEvent<LoadStartEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Se activa cuando se completan todas las cargas a nivel del fotograma en una página secundaria (incluidos todos sus subfotogramas). Esto incluye la navegación dentro del documento actual y las cargas a nivel del documento de subframes, pero no incluye las cargas de recursos asíncronas. Este evento se activa cada vez que la cantidad de cargas a nivel del documento pasa de una (o más) a cero. Por ejemplo, si una página ya terminó de cargarse (es decir, loadstop ya se activó una vez) crea un iframe nuevo que carga una página y, luego, se activará un segundo loadstop cuando se complete la carga de la página del iframe. Este patrón se observa comúnmente en las páginas que cargan anuncios.
     * Nota: Cuando se anula una carga confirmada, un evento loadstop seguirá a un evento loadabort, incluso si se anularon todas las cargas confirmadas desde el último evento loadstop (si hubo alguno).
     */
    addEventListener(type: 'loadstop', listener: (this: WebViewElement, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'newwindow', listener: (this: WebViewElement, ev: AppendEvent<NewWindow>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'permissionrequest', listener: (this: WebViewElement, ev: AppendEvent<PermissionRequest>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'responsive', listener: (this: WebViewElement, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'sizechanged', listener: (this: WebViewElement, ev: AppendEvent<SizeChangedEvent>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'unresponsive', listener: (this: WebViewElement, ev: Event) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'zoomchange', listener: (this: WebViewElement, ev: AppendEvent<ZoomChange>) => any, options?: boolean | AddEventListenerOptions): void;
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
    onclick?: (info: any, tab: any) => void;
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
    reason: "ERR_ABORTED"|"ERR_INVALID_URL"|"ERR_DISALLOWED_URL_SCHEME"|"ERR_BLOCKED_BY_CLIENT"|"ERR_ADDRESS_UNREACHABLE"|"ERR_EMPTY_RESPONSE"|"ERR_FILE_NOT_FOUND"|"ERR_UNKNOWN_URL_SCHEME"|string;
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

interface ConsoleMessageEvent{
    level: number;
    message: string;
    line: number;
    sourceId: string;
}
interface DialogController{
    cancel():void;
    ok(response?:string):void;
}

//import './overloadGlobal.d.ts';
// importante para forzar los tipos del DOM 
/// <reference lib="dom" />

// --- TuJsHtml.d.ts ---
type EventOff = () => void;
// Solo declaraciones de la clase y sus métodos (sin implementación)
// export declare class TuadminHtmlElement extends HTMLElement {
//   // Definir la firma del método `on`
//   on(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): EventOff;

//   // Definir la firma del método `one`
//   one(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): EventOff;

//   // Definir la firma del método `off`
//   off(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): this;
// }


declare class ElementUtil$<TBaseElement extends HTMLElement = HTMLElement> {
  // Definir la firma del método `on`
  on(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): EventOff;

  // Definir la firma del método `one`
  one(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): EventOff;

  // Definir la firma del método `off`
  off(type: keyof HTMLElementEventMap, listener: (ev: Event | UIEvent | AnimationEvent | CustomEvent | WheelEvent) => any): this;
  configure(configureObject: ConfigureAttributes<TBaseElement>): this;
  tags: TuJsHtml_Tags;
}
declare global {
  interface SuperElementProperties {
    [ELEMENT_UTIL]: ElementUtil$;
    // ... cualquier otra cosa que añada tu framework a cada elemento
  }
}

/**
 * Clase base para todos los elementos DOM extendidos por tu framework.
 * @template TBaseElement - El tipo de elemento HTML nativo que esta clase envuelve o extiende (ej. HTMLDivElement, HTMLSpanElement).
 * Por defecto, si no se especifica, será HTMLElement.
 */
type SuperElementClass<TBaseElement extends HTMLElement> = TBaseElement & SuperElementProperties;






/**
 * Cremoas interfaces para que el atucompeltado discrimine y no nos haga un MIXED
 * 
 */
/**
 * Tipo que representa un objeto que estructuralmente se parece a una Function
 * por tener un método 'call' y 'apply'.
 * Esto ayuda a TypeScript a discriminar.
 */
interface FunctionLike {
  call(...args: any[]): any;
  apply(thisArg: any, args?: any): any;
  (...args: any[]): any; // Para que sea llamable
}
/**
 * Tipo que representa un objeto que estructuralmente se parece a un Node
 * por tener propiedades como 'nodeType' y 'childNodes'.
 */
interface InstanceNode {
  readonly ATTRIBUTE_NODE: number;
  //readonly childNodes: NodeListOf<Node>;
  // Puedes añadir más propiedades distintivas aquí si lo necesitas,
  // ej: 'ownerDocument', 'tagName', 'parentElement'
}


//Node.ATTRIBUTE_NODE

/**
 * Tipo que define los nodos posibles que pueden ser pasados a las funciones de tags.
 * Pueden ser elementos HTML, nodos de texto, o funciones.
 */
type RecursiveNode$1 = Node | Function | TuJsHtml_Callback | SuperElementClass<HTMLElement> | string | number;                                      // Fallback genérico



// type MapToDOMNode<T> = 
//     T extends SuperElementClass<infer E> ? E : 
//     T extends (...args: any[]) => any ? DynamicNodes : // Si es callback, advertimos que son varios
//     T extends Node ? T :
//     T extends string | number ? Text :
//     Node;
type DynamicNodes = ChildNode[];
/**
 * El motor de aplanamiento (Flatten).
 * Recorre la tupla T y si un elemento es un array, lo expande.
 */
type Flatten<T extends any[]> = T extends [infer First, ...infer Rest]
    ? First extends any[] 
        ? [...First, ...Flatten<Rest>] // Si es array (como DynamicNodes), lo esparcimos
        : [MapToDOMNode<First>, ...Flatten<Rest>] // Si es simple, lo mapeamos y seguimos
    : [];

/**
 * Mapeo base (el mismo que ya tenías)
 */
type MapToDOMNode<T> = 
    T extends SuperElementClass<infer E> ? E : 
    T extends (...args: any[]) => any ? DynamicNodes : // Marcamos los callbacks como arrays
    T extends Node ? T :
    T extends string | number ? Text :
    Node;
/**
 * Interfaz para tu clase que contiene el método $insert
 */
// export interface MyClassInstance {
//     /**
//      * Inserta elementos y devuelve una tupla con los tipos exactos procesados.
//      * @param args Elementos, strings o instancias de SuperElementClass.
//      */
//     $insert<T extends any[]>(
//         ...args: T
//     ): { [K in keyof T]: MapToDOMNode<T[K]> };
// }

// // Ejemplo de cómo declararías tu variable global o instancia
// export const _: MyClassInstance;


/**
 * Función recursiva que puede ser utilizada para crear etiquetas HTML.
 * Puede tomar nodos o funciones y devolver más funciones recursivas.
 * @template TElement - El tipo de elemento HTML que se espera que la función retorne.
 */
// export interface RecursiveTag<TElement extends HTMLElement = HTMLElement> {
//     // Firma 0: Objeto de configuración (más específica en cuanto a su estructura de objeto)
//     (fakeArg : undefined,firstArg:  ConfigureAttributes<TElement>): SuperElementClass<TElement>;
//     (firstArg:  ConfigureAttributes<TElement>,secondArg:null): SuperElementClass<TElement>;
//     (firstArg:  ConfigureAttributes<TElement>): SuperElementClass<TElement>;
//     // Firma 1: Objeto de configuración (más específica en cuanto a su estructura de objeto)
//     (firstArg: ConfigureAttributes<TElement>, ...args: RecursiveNode[]): SuperElementClass<TElement>;

//     // Firma 2: Otro tipo de nodo (más general para tipos que no son objetos de configuración)
//     (nodeArg: Node ,...args: RecursiveNode[]): SuperElementClass<TElement>;
//     (functionArg: Function ,...args: RecursiveNode[]): SuperElementClass<TElement>;
//     (TuJsHtmlCallbackArg: TuJsHtml_Callback ,...args: RecursiveNode[]): SuperElementClass<TElement>;
//     (SuperElementClassArg: SuperElementClass<HTMLElement>,...args: RecursiveNode[]): SuperElementClass<TElement>;
//     //(firstArg: ConfigureAttributes<TElement>): SuperElementClass<TElement>;
// }
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(configArg: ConfigureAttributes<TElement>, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(tuJsHtmlInstance?: TuJsHtml_Callback<TElement>, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(element?: SuperElementClass<HTMLElement>, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(nodeElement?: InstanceNode, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(callback?: FunctionLike, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(templateStringLiteral: TemplateStringsArray, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(configArg: ConfigureAttributes<TElement>): SuperElementClass<TElement>;
declare function RecursiveTag$1<TElement extends HTMLElement = HTMLElement>(firstArg?: string | number, ...args: RecursiveNode$1[]): SuperElementClass<TElement>;


type RecursiveTagFunction<TElement extends HTMLElement> = typeof RecursiveTag$1<TElement>;


//export function RecursiveTagArray<TElement extends HTMLElement = HTMLElement>(tuJsHtmlInstance?: TuJsHtml_Callback<TElement>, ...args: RecursiveNode[]): Node[];
// export function RecursiveTagArray<TElement extends Node = Node>(firstArg?: TElement): TElement[];
// export function RecursiveTagArray<TElement extends Node = Node>(element?: SuperElementClass<HTMLElement>, ...args: RecursiveNode[]): Node[];
// export function RecursiveTagArray<TElement extends Node = Node>(nodeElement?: InstanceNode, ...args: RecursiveNode[]): Node[];
// export function RecursiveTagArray<TElement extends Node = Node>(callback?: FunctionLike, ...args: RecursiveNode[]): Node[];
// export function RecursiveTagArray<TElement extends Node = Node>(firstArg?: Node, ...args: RecursiveNode[]): Node[];

// type RecursiveTagFunctionArray<TElement extends Node> = typeof RecursiveTagArray<TElement>;




/**
 * Propiedad especial que, cuando se desestructura en un callback de tag,
 * proporciona un objeto de almacenamiento local para el elemento actual.
 * Por defecto, usa un Symbol como clave interna para el padre11.
 *
 * @example
 * tags.div(({p, $store}) => { $store.count = 0; p`${$store.count}`; });
 * const root = tags.div(({p, "$store:__customVar":vars}) => { vars.count = 0; p`${root.__customVars.count}`; });
 */
interface StoreObject {
  /**
   * @example
   * tags.div(({p, $store}) => { $store.count = 0; p`${$store.count}`; });
   * const root = tags.div(
   *             ({p, "$store:__customVar":vars}) 
   *             => { vars.count = 0; p`${root.__customVars.count}`; 
   * });
   */
  [key: string]: any;
}
// export type RecursiveTag<TElement extends HTMLElement = HTMLElement> =
//     (firstArg: ConfigureAttributes<TElement> | RecursiveNode, ...args: RecursiveNode[]) => SuperElementClass<TElement>;

// type RestrictedInterface = {
//   [key: string]:typeof RecursiveTag | Function;
// } & {
//   // El '?' hace que estas propiedades no sean obligatorias.
//   // La clave es que SI existen, su tipo DEBE ser 'never'.
//   [K in ForbiddenKeys]?: never;
// };
/**
 * ssdsdsd
 */
type StoreProperty = StoreObject;
// 2. Definición del Tipo Mapeado
// type TagDefinitions = {
//     [Tag in keyof HTMLElementTagNameMap]: RecursiveTagFunction<HTMLElementTagNameMap[Tag]>;
// };

// 1. Tipos de Prefijos y Clases de Elementos
type SelectorPrefix = '.' | '#' | '[' | '{';
// inspirado en Emmet
type DynamicTagPatterns_emmet = {
  [key: `input${SelectorPrefix}${string}`]: RecursiveTagFunction<HTMLInputElementExtended>;
}
  & {
  // K es la clave final generada (por ejemplo, 'div.clase', 'a#id')
  [Tag in keyof HTMLElementTagNameMap as
  // Itera sobre el nombre del tag (P)
  Tag extends Tag ? // Truco para forzar la distribución de la unión de claves
  // Genera las claves de patrón: TagName + Prefix + string
  `${Tag}${SelectorPrefix}${string}`
  : never
  ]: RecursiveTagFunction<HTMLElementTagNameMap[Tag]>;
}
type ExecuteAfterRender = () => void;
/**
 * Interfaz para representar las etiquetas HTML5 extendidas.
 * Esta interfaz incluye etiquetas HTML5 comunes, como div, p, h1, pre, code, etc.,
 * con descripciones sobre sus características y comportamiento.
 */
type TuJsHtml_Tags = {
  /**
   * Proporciona acceso a un objeto de almacenamiento local persistente vinculado al elemento.
   * El almacén se inicializa como un objeto puro (`Object.create(null)`), lo que garantiza 
   * que no existan propiedades heredadas del prototipo que puedan colisionar con tus datos.
   * Los datos en el `$store` sobreviven a los ciclos de re-renderizado del bloque o fragmento,
   * permitiendo mantener el estado interno (contadores, flags, caches) de forma privada.
   * @returns {StoreObject} Un objeto JavaScript plano vinculado internamente al elemento mediante un Symbol.
   * @example 
   * tags.div(({p, $store}) => { $store.count = 0; p`${$store.count}`; });
   * const root = tags.div(({p, "$store:__customVar":vars}) => { vars.count = 0; p`${root.__customVars.count}`; });
   * 
   * @example 
   * // Uso básico: $store comparte el almacenamiento por defecto del elemento.
   * tags.div(({p, $store}) => { 
   * $store.count ??= 0; // Inicialización persistente
   * tags.button({ onclick: () => $store.count++ }, "Incrementar");
   * p`Contador local: ${$store.count}`; 
   * });
   * @example
   * // Uso avanzado con prefijos: permite separar diferentes contextos de datos (Namespacing).
   * tags.div(({p, "$store:config": conf, "$store:stats": stats}) => { 
   * conf.theme = 'dark';
   * stats.views = (stats.views || 0) + 1;
   * p`Vistas de este nodo: ${stats.views}`;
   * });
   * @example
   * // Uso con espacios de nombres (Namespacing) para organizar múltiples estados.
   * tags.section(({ "$store:ui": ui, "$store:data": data }) => { 
   * ui.collapsed = true;
   * data.items = [...];
   * });
   */
  $store: StoreProperty;
  /**
   * Acceso dinámico a almacenes con nombre específico.
   * Permite segmentar la lógica de persistencia dentro de un mismo elemento.
   * @example 
   * tags.div(({p, $store}) => { $store.count = 0; p`${$store.count}`; });
   * const root = tags.div(({p, "$store:__customVar":vars}) => { vars.count = 0; p`${root.__customVars.count}`; });
   */
  [key: `$store:${string}`]: StoreProperty;

  /**
   * Crea un fragmento reactivo con soporte para renderizado asíncrono.
   * Ideal para envolver lógica que requiere `await` (como peticiones Fetch).
   * 
   * @param {(tags: TuJsHtml_Tags) => (void | Promise<void>)} callbackRender - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * @param {(tags: TuJsHtml_Tags)=> void|ExecuteAfterRender} callbackRenderFallback - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * 
   * @returns {TuJsHtml}
   * 
   * @example
   * const bloque = tags.$fragment(async  function (tags) {
   *     tags.h3`Ejemplo de título dinámico`;
   *     await new Promise(finish=>setTimeout(finish,1000))
   *     tags.p`Contenido dinámico: ${new Date()}`;
   * },function fallbackView(tags){
   *    tags.h3`Esperando....`;
   * });
   * 
   */
  $fragment: (
    callbackRender: (tags: TuJsHtml_Tags) => (void | Promise<void>),
    callbackRenderFallback?: (tags: TuJsHtml_Tags) => void | ExecuteAfterRender
  ) => TuJsHtml;
  /**
   * Alias de {@link $fragment}
   * Crea un fragmento reactivo con soporte para renderizado asíncrono.
   * Ideal para envolver lógica que requiere `await` (como peticiones Fetch).
   * 
   * @param {(tags: TuJsHtml_Tags) => (void | Promise<void>)} callbackRender - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * @param {(tags: TuJsHtml_Tags)=> void|ExecuteAfterRender} callbackRenderFallback - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * 
   * @returns {TuJsHtml}
   * 
   * @example
   * const bloque = tags.$fragment(async  function (tags) {
   *     tags.h3`Ejemplo de título dinámico`;
   *     await new Promise(finish=>setTimeout(finish,1000))
   *     tags.p`Contenido dinámico: ${new Date()}`;
   * },function fallbackView(tags){
   *    tags.h3`Esperando....`;
   * });
   * 
   */
  $f: (
    callbackRender: (tags: TuJsHtml_Tags) => (void | Promise<void>),
    callbackRenderFallback?: (tags: TuJsHtml_Tags) => void | ExecuteAfterRender
  ) => TuJsHtml;

  /**
   * Crea un bloque de renderizado vinculado a la reactividad de un objeto o Signal.
   * El contenido se re-renderiza automáticamente cuando las propiedades del objeto cambian.
   * 
   * @param {object} variable - El objeto que será observado para detectar cambios.
   * @param {(tags: TuJsHtml_Tags) => void} callbackRender - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * @param {(tags: TuJsHtml_Tags)=> void|ExecuteAfterRender} callbackRenderFallback - Función que define el contenido a renderizar.
   *        Recibe como argumento el conjunto de etiquetas extendidas (`tags`).
   * 
   * @returns {TuJsHtml}
   * 
   * @example
   * const bloque = tags.block(variableSignal, function (tags) {
   *     tags.h3`Ejemplo de título dinámico`;
   *     tags.p`Contenido dinámico: ${new Date()}`;
   * });
   * 
   * // Re-renderiza automáticamente cada 1 segundo
   * setInterval(() => {
   *     bloque.reset();
   * }, 1000);
   * 
   * // O cambia directamente el objeto observado para re-renderizar
   * setTimeout(() => {
   *     variable.title = 'Nuevo título dinámico';
   * }, 2000);
   */
  $block: (variable: object | null,
    callbackRender: (tags: TuJsHtml_Tags) => void,
    callbackRenderFallback?: (tags: TuJsHtml_Tags) => void | ExecuteAfterRender
  ) => TuJsHtml;
  /**
   * 
   * Genera una plantilla estática en un DocumentFragment independiente.
   * A diferencia de `$block` o `$fragment`, este contenido no se enlaza al ciclo de vida reactivo del root; 
   * simplemente devuelve los nodos para ser insertados manualmente.
   * @param {(tags: TuJsHtml_Tags) => void} callbackRender - Función que define el contenido a renderizar.
   * @returns {DocumentFragment} Un fragmento de DOM nativo y estático (ligero).
   * @example 
   * const miMolde = tags.$tpl( ({h1}) => {
   *     h1`Elemento de plantilla estático`;
   * });
   * document.body.appendChild(miMolde);
   */
  $tpl: (
    callbackRender: (tags: TuJsHtml_Tags) => void
  ) => DocumentFragment;
  
  /**
     * Inserta elementos y devuelve una tupla con los tipos exactos procesados.
     * @param args Elementos, strings o instancias de SuperElementClass.
     */
  $insert<T extends any[]>(
        ...args: T
    ): Flatten<T>;
  // $insert<T extends any[]>(
  //     ...args: T
  // ): { [K in keyof T]: MapToDOMNode<T[K]> };
  /**
   * Representa cualquier etiqueta o nodo genérico que pueda ser usado
   * dentro de la función recursiva. Puede aceptar cualquier tipo de argumento.
   * Esta es la etiqueta genérica y flexible.
   */

  //[key: string]: RecursiveTag | Function;
  /* *
   * Este es un documentFragment y su contenido no se agregar automaticamente, sino que devolver el documentFragment para ser insertado en otro Elemento
   * @deprecated use TuJsHtml.$block or document.createDocumentFragment()[ELEMENT_UTIL].append((...args:RecursiveNode[]) => void)
   * @example
   * const tpl = fragment( function({p,h1}) {
   *     h1`Template`
   *     p`This is inside a div`;
   * });
   */
  //fragment: (...args: RecursiveNode[]) => DocumentFragment;

  /**
   * Representa una etiqueta `<div>`. Las etiquetas div son contenedores de bloque
   * que se utilizan para agrupar contenido. Pueden contener otras etiquetas de bloque
   * o en línea y pueden tener atributos como `className`, `id`, `style`, etc.
   * 
   * @example
   * div({ className: 'example' }, () => {
   *     p`This is inside a div`;
   * });
   */
  div: RecursiveTagFunction<HTMLDivElement>;

  /**
   * Representa una etiqueta `<p>`. Las etiquetas `p` se usan para crear párrafos
   * de texto. Generalmente, contienen texto o elementos en línea, y son elementos
   * de bloque. El navegador genera un espacio alrededor de los párrafos.
   * 
   * @example
   * p`This is a paragraph with some text.`;
   */
  p: RecursiveTagFunction<HTMLParagraphElement>;
  /**
   * Representa una etiqueta `<h1>`. Las etiquetas `h1` son utilizadas para crear
   * encabezados principales en una página. Son elementos de bloque y suelen tener
   * un tamaño de fuente más grande por defecto. `h1` es el nivel más alto de encabezado.
   * 
   * @example
   * h1`Main Header`;
   */
  h1: RecursiveTagFunction<HTMLHeadingElement>;

  /**
   * Representa una etiqueta `<h2>`. Las etiquetas `h2` se usan para crear subtítulos
   * y son de menor importancia que los encabezados `h1`. Son también elementos de bloque.
   * 
   * @example
   * h2`Sub Header`;
   */
  h2: RecursiveTagFunction<HTMLHeadingElement>;
  /**
   * Representa una etiqueta `<h3>`. Similar a `h2`, pero de menor importancia y tamaño.
   * 
   * @example
   * h3`Sub-sub Header`;
   */
  h3: RecursiveTagFunction<HTMLHeadingElement>;
  /**
   * Representa una etiqueta `<h4>`. Similar a `h3`, pero de menor importancia y tamaño.
   * 
   * @example
   * h4`Sub-sub Header`;
   */
  h4: RecursiveTagFunction<HTMLHeadingElement>;
  /**
   * Representa una etiqueta `<h5>`. Similar a `h4`, pero de menor importancia y tamaño.
   * 
   * @example
   * h5`Sub-sub Header`;
   */
  h5: RecursiveTagFunction<HTMLHeadingElement>;
  /**
   * Representa una etiqueta `<h6>`. Similar a `h5`, pero de menor importancia y tamaño.
   * 
   * @example
   * h6`Sub-sub Header`;
   */
  h6: RecursiveTagFunction<HTMLHeadingElement>;
  /**
   * Representa una etiqueta `<pre>`. Las etiquetas `pre` se utilizan para representar texto
   * preformateado. El texto dentro de `pre` se muestra con un formato de fuente monoespaciado
   * y se preservan los saltos de línea y los espacios en blanco.
   * 
   * @example
   * pre`This is preformatted text.   Spaces and\nnew lines are preserved.`;
   */
  pre: RecursiveTagFunction<HTMLPreElement>;

  /**
   * Representa una etiqueta `<code>`. Las etiquetas `code` se usan para representar fragmentos
   * de código fuente. Generalmente se utiliza dentro de otras etiquetas como `pre` o `p`.
   * 
   * @example
   * code`console.log('Hello World');`;
   */
  code: RecursiveTagFunction<HTMLElementExtended>;

  /**
   * Representa una etiqueta `<ul>`. Las etiquetas `ul` crean listas no ordenadas,
   * donde los elementos de la lista están marcados con un bullet point por defecto.
   * 
   * @example
   * ul(() => {
   *   li`Item 1`;
   *   li`Item 2`;
   * });
   */
  ul: RecursiveTagFunction<HTMLUListElement>;

  /**
   * Representa una etiqueta `<ol>`. Las etiquetas `ol` crean listas ordenadas,
   * donde los elementos están numerados por defecto.
   * 
   * @example
   * ol(() => {
   *   li`Item 1`;
   *   li`Item 2`;
   * });
   */
  ol: RecursiveTagFunction<HTMLOListElement>;

  /**
   * Representa una etiqueta `<li>`. Las etiquetas `li` son elementos de lista que
   * se usan dentro de `ul` o `ol` para definir elementos individuales en las listas.
   * 
   * @example
   * li`Item in a list`;
   */
  li: RecursiveTagFunction<HTMLLIElement>;

  /**
   * Representa una etiqueta `<a>`. Las etiquetas `a` se usan para definir enlaces de
   * anclaje, los cuales permiten la navegación hacia otras páginas, secciones o recursos.
   * Aceptan atributos como `href` para la URL de destino.
   * 
   * @example
   * a({ href: 'https://www.example.com' })`Go to Example`;
   */
  a: RecursiveTagFunction<HTMLAnchorElement>;

  /**
   * Representa una etiqueta `<img>`. Las etiquetas `img` se usan para insertar imágenes
   * en una página web. Aceptan atributos como `src` para la URL de la imagen y `alt` para
   * el texto alternativo.
   * 
   * @example
   * img({ src: 'image.jpg', alt: 'An image' });
   */
  img: RecursiveTagFunction<HTMLImageElement>;

  /**
   * Representa una etiqueta `<button>`. Las etiquetas `button` se utilizan para crear botones
   * interactivos en la interfaz de usuario.
   * 
   * @example
   * button`Click Me!`;
   */
  button: RecursiveTagFunction<HTMLButtonElement>;

  /**
   * Representa una etiqueta `<form>`. Las etiquetas `form` se utilizan para definir formularios
   * de entrada de datos. Dentro de los formularios se pueden agregar elementos como `input`,
   * `select`, `textarea`, entre otros.
   * 
   * @example
   * form(() => {
   *   input({ type: 'text', placeholder: 'Enter text' });
   *   button`Submit`;
   * });
   */
  form: RecursiveTagFunction<HTMLFormElement>;

  /**
   * Representa una etiqueta `<input>`. Las etiquetas `input` se usan para crear campos de
   * entrada de datos. Pueden tener varios tipos como `text`, `password`, `checkbox`, etc.
   * 
   * @example
   * input({ type: 'text', placeholder: 'Enter text' });
   */
  input: RecursiveTagFunction<HTMLInputElementExtended>;
  //input:RecursiveTagFunction<HTMLInputElement>;

  /**
   * Representa una etiqueta `<select>`. Las etiquetas `select` se usan para crear menús
   * desplegables con opciones dentro de un formulario.
   * 
   * @example
   * select(() => {
   *   option({ value: '1' })`Option 1`;
   *   option({ value: '2' })`Option 2`;
   * });
   */
  select: RecursiveTagFunction<HTMLSelectElement>;

  /**
   * Representa una etiqueta `<textarea>`. Las etiquetas `textarea` se usan para crear áreas
   * de texto multilínea dentro de formularios.
   * 
   * @example
   * textarea`Enter multi-line text here.`;
   */
  textarea: RecursiveTagFunction<HTMLTextAreaElement>;

  /**
   * Representa una etiqueta `<span>`. Las etiquetas `span` se usan para agrupar elementos
   * en línea y aplicarlos con estilos específicos. Son elementos en línea.
   * 
   * @example
   * span`Inline text`;
   */
  span: RecursiveTagFunction<HTMLSpanElement>;
  b: RecursiveTagFunction<HTMLElementExtended>;
  i: RecursiveTagFunction<HTMLElementExtended>;
  u: RecursiveTagFunction<HTMLElementExtended>;
  strike: RecursiveTagFunction<HTMLElementExtended>;
  blockquote: RecursiveTagFunction<HTMLElementExtended>;
  br: RecursiveTagFunction<HTMLElementExtended>;
  hr: RecursiveTagFunction<HTMLElementExtended>;
  dialog: RecursiveTagFunction<HTMLDialogElement>;
  details: RecursiveTagFunction<HTMLDetailsElement>;
  summary: RecursiveTagFunction<HTMLElementExtended>;
  table: RecursiveTagFunction<HTMLTableElement>;
  tbody: RecursiveTagFunction<HTMLElementExtended>;
  tr: RecursiveTagFunction<HTMLTableRowElement>;
  td: RecursiveTagFunction<HTMLTableCellElement>;
  th: RecursiveTagFunction<HTMLTableCellElement>;
  thead: RecursiveTagFunction<HTMLElementExtended>;
  tfoot: RecursiveTagFunction<HTMLElementExtended>;
  colgroup: RecursiveTagFunction<HTMLElementExtended>;
  col: RecursiveTagFunction<HTMLElementExtended>;
  legend: RecursiveTagFunction<HTMLLegendElement>;
  fieldset: RecursiveTagFunction<HTMLFieldSetElement>;
  label: RecursiveTagFunction<HTMLLabelElement>;
  option: RecursiveTagFunction<HTMLOptionElement>;
  link: RecursiveTagFunction<HTMLLinkElement>;
  script: RecursiveTagFunction<HTMLScriptElement>;
  style: RecursiveTagFunction<HTMLStyleElement>;
  main: RecursiveTagFunction<HTMLElement>;
  header: RecursiveTagFunction<HTMLElement>;
  footer: RecursiveTagFunction<HTMLElement>;
  article: RecursiveTagFunction<HTMLElement>;
  section: RecursiveTagFunction<HTMLElement>;
  aside: RecursiveTagFunction<HTMLElement>;
  nav: RecursiveTagFunction<HTMLElement>;

  /**
   * Representa una etiqueta `<webview>`. Las etiquetas `webview` se usan para incrustar
   * contenido web dentro de una página. Aceptan atributos como `src` para la URL de la webview.
   * Solo para Electron y NW.js.
   * @example
   * webview({ src: 'https://www.example.com' });
   */
  webview: RecursiveTagFunction<ChromeWebViewElement>;
  //webview:RecursiveTagFunction;
  //webview<TElement extends HTMLElement = HTMLElement>:RecursiveTagFunction<TElement>;
}
  // & {
  //   // El '?' hace que estas propiedades no sean obligatorias.
  //   // La clave es que SI existen, su tipo DEBE ser 'never'.
  //   [K in ForbiddenKeys]?: never;
  // }

  & {
  [Tag in keyof HTMLElementTagNameMap]: RecursiveTagFunction<HTMLElementTagNameMap[Tag]>;
}
  & DynamicTagPatterns_emmet
  & {
    //[K in SelectorPrefix as `${TagName}${K}${string}`]: RecursiveTagFunction<HTMLElementTagNameMap[TagName]>;
    [key: string]: RecursiveTagFunction<HTMLElementExtended>;
  }
  ;




/**
* Interfaz que representa el callback que se pasa a la clase TuJsHtml.
* Este callback es el que permite la recursividad, usando las etiquetas
* definidas en `Tags`.
* 
* @param tags - El objeto que contiene las funciones recursivas para crear etiquetas HTML.
* 
* @example
* const tujs = new TuJsHtml((tags: TuJsHtml_Tags) => {
*   const { div, p, h1 } = tags;
*   h1`Header One ${new Date().toISOString()}`;
*   p`Text inside paragraph`;
*   div({ className: 'nested' }, () => {
*     h1`Nested Header`;
*     p`Nested paragraph`;
*   });
*   tags["DIV#id.clase1.clase2[title=Es tes algo simple]"]`Contendo`;
* });
*/
type TuJsHtml_Callback<TElement extends HTMLElement = HTMLElement> = {
  (tags: TuJsHtml_Tags, currentElement?: SuperElementClass<TElement>): SuperElementClass<TElement> | void;
  //(tags: TuJsHtml_Tags) : SuperElementClass<TElement> | void;
}
//export type TuJsHtml_Callback = (tags: TuJsHtml_Tags, currentElement: SuperElementClass) => SuperElementClass | void;
type TuJsHtml_CallbackExtended = (tags: TuJsHtml_Tags, currentElement: HTMLElement) => void;

/**
 * Sobrecarga 1: Para uso como Tagged Template Literal (ej: AnyNode`hola ${mundo}`)
 * 
 * @example
 * AnyNode`hola ${mundo}`;
 * AnyNode`hola ${signalVar}`;
 */
declare function AnyNode(strings: TemplateStringsArray, ...values: any[]): DocumentFragment;

/**
 * @version 4.0.1
 */
declare class TuJsHtml extends DocumentFragment {
  /** @type {TuJsHtml_Tags} */
  static TYPE_TAGS: TuJsHtml_Tags;
  /**
   * 
   * @param callback 
   * @param callbackFallback Only works if callback== AsyncFunction
   */
  constructor(callback: TuJsHtml_Callback, callbackFallback?: TuJsHtml_Callback);
  /**
   * @deprecated
   * @param name 
   * @param callback 
   */
  set(name: string, callback: TuJsHtml_CallbackExtended): this;
  /**
   * Restablece el estado del objeto TuJsHtml, igual a reRender.
   */
  reset(): void;
  /**
   * elimina todo el contenido dom 
   */
  remove(): void;
  /**
   * Re-renderiza el contenido dom
   */
  get tag():TuJsHtml_Tags;
  /**
   * verifica si es parte del DOM
   */
  get isConnected(): boolean;
  
}

// /**
//  * Sobrecarga 2: Para uso con múltiples argumentos (ej: TextNode("hola", "mundo"))
//  * 
//  * @example
//  * TextNode("hellow", "world");
//  * TextNode("hellow", signalVar);
//  */
//export function TextNode(arg1: any, arg2: any, ...rest: any[]): DocumentFragment;

// /**
//  * 
//  * @example
//  * TextNode("hellow");
//  * TextNode(signalVar);
//  */
// export function TextNode(arg1: any|SignalOr<string>): Node;

declare namespace TuJsHtml {
  export namespace Types {
    export type Tags = TuJsHtml_Tags;
    export type Element<TElement extends HTMLElement = HTMLElement> = SuperElementClass<TElement>;
    export type CustomTag<TElement extends HTMLElement = HTMLElement> = typeof RecursiveTag$1<TElement>;
    export type Callback<TElement extends HTMLElement = HTMLElement> = (tags: TuJsHtml_Tags, currentElement?: SuperElementClass<TElement>) => SuperElementClass<TElement> | void;
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
type RecursiveNode = Node | Function | Object | Builder_Callback ;
//export type RecursiveNode = Node | Function | Object | Builder_Callback | TuadminHtmlElement;

/**
 * Función recursiva que puede ser utilizada para crear etiquetas HTML.
 * Puede tomar nodos o funciones y devolver más funciones recursivas.
 */
// export interface RecursiveTag {
//   (firstArg:ReactiveAttributes | RecursiveNode ,...args: RecursiveNode[]): TuadminHtmlElement;
//   //(): HTMLElement; // Para finalizar y devolver un elemento HTML
// }
type RecursiveTag = (firstArg:HtmlAttributes | RecursiveNode ,...args: RecursiveNode[]) => HTMLElement;
type Builder_Callback = (tags: Builder_Tags,currentTag:HTMLElement) => HTMLElement | void;
type CustomTagPattern = `${string}-${string}`;
type CustomTagPattern2 = `${string}`;
type AllElementTags = keyof HTMLElementTagNameMap | CustomTagPattern | CustomTagPattern2;

type Builder_Tags = {
    [K in AllElementTags]:RecursiveTag;
    //[key: string]: RecursiveTag;
}
type BuilderTemplate = {
    (element: HTMLElement): HTMLElement;
    (strings: TemplateStringsArray, ...values: any[]): HTMLElement | DocumentFragment;
    (defineRoot: HTMLElement | string): HTMLElement | DocumentFragment;
    (builder: Builder_Callback ): HTMLElement | DocumentFragment;
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
 * let label; // The root builder will handle DOM creation.
 * root(tags => {
 * // Using tags to build the DOM
 * tags.div(tags.span(node => (label = node.textNode("Hello"))));
 * });
 * return { "data": label }; // The type of 'data' is now inferred
 * });
 *
 * // The returned function has autocompletion for `data`
 * const [root1, refs1] = fabrica1();
 * refs1.data.set("New value"); // Autocomplete for 'data' works.
 *
 * @example
 * // Example 2: Tagged template literal with inferred refs
 * const fabrica2 = createTemplateHtml((root) => {
 * const dom = root`<div><span>{label}</span></div>`;
 * return { "label": dom.querySelector('span') }; // 'label' is inferred here
 * });
 *
 * // The returned function has autocompletion for `label`
 * const [root2, refs2] = fabrica2();
 * refs2.label.textContent = "New text"; // Autocomplete for 'label' works.
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
    cloneAsTuple(modifierFn: (refs: T) => void): [HTMLElement|DocumentFragment, T];
    /**
     * Clones the template and adds the references as a property to the cloned element.
     * @param nameOfProp The name of the property to add to the cloned element. Defaults to 'refs'.
     * @returns {HtmlElementOrFragmentWithProp<T, N>} The cloned root element with a new property containing the references.
     */
    clone<N extends string = 'refs'>(modifierFn?:(refs: T) => void,nameOfProp?: N): HtmlElementOrFragmentWithProp<T, N>;
};

export { AnyNode, ELEMENT_UTIL, ObservableDraft, ReactiveDraft, TUtils, TuJsHtml, TuTemplateHtml, TuWebUtils, createComputedSignal, createKageBunshinObject, createSignal, createTemplateHtml, debounce, debounceEvents, makeReactive, textSize, textSizeEvents, trim };
