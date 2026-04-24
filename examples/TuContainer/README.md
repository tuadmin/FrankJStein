# TuContainer: Lógica de Negocio y Arquitectura

Esta carpeta documenta y demuestra el patrón de **Inyección de Dependencias** del framework utilizando el módulo `TuContainer`.

## Intención del Diseño (Para Desarrolladores e IA)

El propósito principal de este patrón y de esta separación es evitar construir componentes de UI "gordos" que estén fuertemente acoplados a la lógica de negocio o llenos de llamadas a la red. `TuContainer` es el Kernel que resuelve el ciclo de vida de cada pieza del engranaje.

### 1. Desacoplamiento (Clean Code)
Observá el archivo `services.js`: las clases de dominio (`AuthService`, `ApiService`) son agnósticas a la Vista. No importan nada de `TuJsHtml` ni mutan nodos del DOM. Son testeables nativamente en NodeJS si hiciera falta.

### 2. Ciclo de Vida Explícito
- `AuthService` fue registrado como **Singleton** (`TuContainer.addSingleton`). Cuando el usuario hace login, modifica su estado interno. Cualquier otro lugar de la aplicación que pida este servicio recibirá **exactamente la misma instancia**.
- `ApiService` fue registrado como **Transient** (`TuContainer.addTransient`). Cuando el controlador o la UI pide esta clase, se crea una instancia *nueva* para evitar arrastrar basura, pero internamente...

### 3. Inyección Limpia y Silenciosa
...internamente en `ApiService`, para saber quién está logueado, pide a `AuthService` usando `TuInject()`. No hace falta pasarle el servicio por constructor de forma aburrida ni pasarlo desde la UI hacia abajo capa por capa (prop drilling). `TuInject` rastrea la dependencia y te la sirve en bandeja.

---

> **📌 Guía para IAs y Asistentes**: 
> Cuando te pidan "agregar un estado global", "conectar a una base de datos", "crear un manejador de WebSocket" o cualquier tarea puramente de datos en FrankJStein, **tu obligación** es aislar ese bloque en una clase estándar de ECMAScript, registrarla en el `TuContainer` correspondiente y resolverla en la Vista usando `.resolve()`. **NO metas lógica pesada adentro del árbol de renderizado del DOM**.
