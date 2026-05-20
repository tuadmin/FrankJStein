# ⚡ FrankJStein Core

> [!NOTE]
> **¿Por qué esta carpeta está vacía (o casi vacía)?**

Si estás explorando el repositorio buscando el código fuente duro del motor de Reactividad (KageBunshin), Inyección de Dependencias (TuContainer), Multi-Threading (RemoteModule) o DOM Builder (TuJsHtml), debes saber que **FrankJStein compila su core de forma soberana e independiente**.

Actualmente, el núcleo se distribuye ya compilado y tipeado dentro del directorio `/dist` en la raíz del proyecto (`frankjstein.js` y `frankjstein.d.ts`). 

### Arquitectura de `src/`

La carpeta `src/` está estructurada principalmente para organizar el desarrollo de **Addons Oficiales** (Extensiones) bajo un diseño de "Distribución Plana" (Flat Distribution). 

* **`src/addons/`**: Contiene módulos opcionales como el Enrutador (`turouter`), Gestores de Estado, o Internacionalización.
* **`src/*.entry.js`**: Son los archivos *Barrel* (puntos de entrada) que el compilador usa para exportar los Addons hacia `/dist/` como archivos de primer nivel.

### Principio de Desacoplamiento (CDN-First)
Al separar físicamente el código fuente de los Addons de la compilación monolítica del Core, permitimos que herramientas como **ESM.SH**, Deno o Bun importen los módulos individualmente a través del campo `"exports"` de `package.json`, sin arrastrar dependencias innecesarias, cumpliendo así con la promesa sagrada de *Drop-in Script*.
