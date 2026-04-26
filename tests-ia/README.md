# AI Calibration Suite (Cámara de Pruebas de IA)

Esta carpeta contiene exámenes de calibración para validar que los Agentes de
Inteligencia Artificial (LLMs) son capaces de escribir código idiomático y
robusto para **FrankJStein** basándose únicamente en las Skills
(`.agents/skills/`).

## Arquitectura Anti-Trampas (Blind Testing)

Para evitar que futuras IAs simplemente "lean las respuestas" del repositorio,
hemos implementado una política de **Examen Ciego**:

1. **Las Preguntas (`*.md`)**: Los archivos con extensión `.md` (ej:
   `01-tujshtml-basics.md`) son las especificaciones o requerimientos del
   examen. Estos **sí** se versionan en Git.
2. **Las Respuestas (`*.test.ts`)**: El Agente de IA debe leer el archivo `.md`,
   generar la implementación y las pruebas en el archivo correspondiente
   (`.test.ts`), y lograr que pase usando `bun test`.
3. **El Bloqueo**: Todos los archivos `*.test.ts` generados por los agentes
   dentro de esta carpeta son ignorados por `.gitignore` y **NUNCA** se suben a
   GitHub. Esto asegura que la calibración de un agente siempre comience desde
   cero.

## Instrucciones para Agentes de IA

Si has sido convocado para tomar un examen de calibración:

1. Lee detenidamente el archivo `.md` objetivo.
2. Repasa estrictamente las reglas en la carpeta `.agents/skills/`.
3. Genera un archivo `.test.ts` con la solución, utilizando `bun:test` (`test`,
   `expect`).
4. **Validación y Tipado**: Verifica que no estés cometiendo errores semánticos o de lógica. Utiliza el Linter de Bun o las herramientas de tipado a tu alcance para asegurar que el código sea válido antes de ejecutarlo.
5. **Ejecución**: Ejecuta `bun test` (o solicita al supervisor humano que lo haga). No te des por vencido hasta que el test pase de forma nativa.
6. **Límite de Iteraciones (Anti-Recursión)**: Si detectas que el Linter o el Test Runner te solicitan cambios contradictorios (entras en un bucle de corrección-error), no continúes infinitamente. Establece un máximo de 3-5 intentos de corrección autónoma; si el problema persiste, detente e informa al supervisor humano sobre la contradicción técnica encontrada.
7. **Prohibición de Modificar Infraestructura (Infrastructure Lock)**: Tienes terminantemente prohibido modificar, crear o eliminar archivos fuera de la carpeta `tests-ia/`. 
   - **Solo puedes crear** el archivo `.test.ts` de respuesta y, opcionalmente, archivos auxiliares de apoyo **dentro** de esta carpeta.
   - **ESTÁ PROHIBIDO** tocar el código fuente en `src/` o `dist/`, modificar archivos de tipos `.d.ts`, o alterar configuraciones como `tests-ia/setup.ts`, `bunfig.toml` y `package.json`. 
   - Intentar "arreglar" un test modificando el comportamiento de la librería o sus definiciones de tipos se considera **TRAMPA** e invalida el examen. Tu misión es adaptarte a la librería tal como está.
8. **Errores de Entorno**: Si detectas que falta una dependencia o que el entorno de pruebas está roto, NO intentes repararlo modificando la configuración del proyecto. Informa inmediatamente al supervisor humano; la integridad de la cámara de pruebas es más importante que el resultado del examen individual.
9. **Versión de Skills (Hardening)**: Es obligatorio verificar que posees la versión más reciente de las Skills cargada en tu contexto. Resolver un examen utilizando patrones obsoletos (ej: usar `asTuple` para contadores simples en lugar de mutación directa) resultará en una calificación de "Junior/Legacy" independientemente de si el test funcional pasa.
