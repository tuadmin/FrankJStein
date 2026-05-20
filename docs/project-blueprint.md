# FrankJStein: Project Blueprint & Architectural Map

Este documento actúa como el **Mapa Estelar** de FrankJStein. Su propósito es guiar a futuros arquitectos (humanos o IAs) a través de la estructura del repositorio, explicando no solo qué hay en cada carpeta, sino el **porqué** de su existencia.

## 🎯 Filosofía del Repositorio
FrankJStein es un proyecto **Dev-Centric con Gobernanza AI-Augmented**. Esto significa que el framework está diseñado primordialmente para la legibilidad, el rendimiento y la cordura del desarrollador humano. Sin embargo, su estructura está optimizada para que los agentes de IA puedan asistir en el mantenimiento y la evolución del código sin violar la integridad arquitectónica, gracias a contratos estrictos y validaciones automáticas.

---

## 🗺 Mapa de Directorios

### 🧠 `.agents/` (The Brain)
Aquí residen las **AI Skills**. Son instrucciones especializadas y granulares que enseñan a la IA cómo manejar diferentes pilares del framework (Reactividad, DI, Workers). 
- **Política**: Siguen una estrategia "Blue-Green" (versionado inmutable) para evitar que cambios accidentales rompan el conocimiento de la IA.

### 📜 `.atl/` (The Registry)
Contiene el **Skill Registry**, el manifiesto que dicta qué reglas se aplican a cada parte del código y en qué orden de importancia. Es la "conciencia" del sistema de orquestación.

### 📦 `dist/` (The Body)
El código compilado y listo para producción. 
- **Independencia**: FrankJStein se distribuye como un único archivo `.js` para maximizar la compatibilidad y simplicidad, acompañado de su `.d.ts`.

### 🧩 `src/addons/` (The Extensions)
El ecosistema de módulos opcionales. Aquí habitan piezas clave como `TuRouter`, las cuales mantienen una arquitectura desacoplada y se compilan independientemente del núcleo principal para mantener el tamaño final al mínimo.

### 📚 `docs/` (The Knowledge Base)
Documentación técnica profunda en español. A diferencia de las skills (que son reglas para la IA), los docs son guías conceptuales para el entendimiento humano y el contexto de alto nivel de las IAs. Cubre desde el núcleo de UI hasta utilidades de alto rendimiento (`TUtils`, `TuWebUtils`).

### 🧪 `examples/` (The Proof of Life)
Implementaciones de referencia. Cada ejemplo es una prueba viviente de que el framework funciona de forma nativa en el navegador sin herramientas de construcción complejas.

### ⚙️ `tests/` (The Reliability Core)
La suite principal de pruebas unitarias y de integración escritas en TypeScript y ejecutadas con Bun. Validan el núcleo reactivo, inyección de dependencias, utilidades y enrutamiento avanzado.

### 🔬 `tests-ia/` (The Calibration Suite)
La "Cámara de Pruebas" de IA. Contiene exámenes de calibración bajo una política de **Examen Ciego** (especificaciones en `.md` visibles, resultados en `.test.ts` ignorados por Git). Sirve para validar que un agente es capaz de razonar y escribir código idiomático de FrankJStein desde cero.

### ⚡ `benchmarks/` (The Performance Vault)
Aquí se almacenan los micro-benchmarks oficiales del framework. Sirven para medir y asegurar el máximo rendimiento de partes críticas (como el enrutamiento o el sistema de reactividad) bajo millones de iteraciones concurrentes, previniendo regresiones de performance.

### 🎨 `assets/` (The Visual Identity)
Recursos estáticos, logotipos y media que definen la marca visual y la estética del proyecto.

### 🛠 `scripts/` (The Automation Engine)
Aquí vive el motor de auditoría y las herramientas de mantenimiento.
- **Arquitectura**: Los scripts están construidos usando el mismo kernel de IoC de FrankJStein. Es la "víbora que se come a sí misma": el framework se usa para auditar su propia integridad.

---

## 🔑 Archivos Críticos

### 📄 `AGENTS.md` (El Manifiesto)
Es el punto de entrada para cualquier IA. Define la personalidad (Senior Architect), las reglas de oro y el índice de integridad. **Es la ley suprema del repositorio.**

### 📦 `package.json` (The Meta-Configuration)
Define el empaquetado del framework y los subpath exports (como `./turouter`), comandos de pruebas, dependencias de desarrollo y linting. Es el mapa de dependencias y construcción de todo el proyecto.

### 📜 `dist/frankjstein.js` (The Final Build)
El núcleo entero de FrankJStein minificado y listo para ser importado nativamente. Todo el código base del framework se consolida aquí de forma agnóstica.

### 📘 `dist/frankjstein.d.ts` (Source of Truth)
Este archivo define el contrato técnico total. Es el validador último de que el código propuesto es válido dentro del ecosistema.

### ⚙️ `tsconfig.json` (The Policy)
Configurado para **ESNext** y **Bun**. Refleja nuestra apuesta por el rendimiento moderno y el uso de TypeScript como linter estricto más que como compilador pesado.

---

## 🐍 El Ciclo de Integridad
Cualquier cambio estructural debe pasar por los scripts de auditoría (`bun scripts/verify-agents.ts`). Si un cambio rompe el **Blueprint** o el **Registry**, el sistema se bloquea. Esto garantiza que FrankJStein mantenga su integridad a través de los años, sin importar quién (o qué) lo esté editando.

> "En FrankJStein, la arquitectura no es una sugerencia; es el código mismo validándose."
