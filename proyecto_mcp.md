Esta es una evolución lógica muy necesaria. Lo que estás pidiendo es un patrón
de **"Stale-While-Revalidate"** o **Caché con Resiliencia**. Esto permite que el
desarrollador trabaje en un avión, en el campo o con una conexión inestable sin
que la IA se quede "muda".

He ajustado la especificación para incluir un sistema de persistencia en disco
que maneja el **TTL (Time To Live)** y la **recuperación ante fallos de red**.

Aquí tienes la especificación actualizada para el Agente de IA:

---

````markdown
# ESPECIFICACIÓN DE INGENIERÍA: Servidor MCP con Caché Resiliente (Frankjstein Oracle)

## 1. CONTEXTO Y ROL

**Rol:** Ingeniero de Software Senior (Deno/Bun). **Objetivo:** Desarrollar un
Servidor MCP Local via `stdio` que consulte una base de conocimientos remota
(Git) pero que implemente una **Capa de Persistencia Local (Caché)** para
permitir el funcionamiento Offline o con red inestable.

## 2. ESTRATEGIA DE CACHÉ (Hybrid Cloud-Local)

El servidor debe seguir este flujo de decisión para cada consulta:

1. **Validación de Caché:** Buscar el archivo de caché local (ej.
   `.frank_cache.json`).
2. **Chequeo de Vigencia:** - Si el archivo existe y tiene menos de **24 horas**
   (configurable via ENV), usar los datos locales inmediatamente.
   - Si el archivo NO existe o ha expirado: **Intentar Fetch Remoto**.
3. **Resiliencia (Fallback):**
   - Si el Fetch remoto tiene éxito: Actualizar la caché local con el nuevo
     contenido y timestamp.
   - Si el Fetch remoto FALLA (offline): Si existe una caché (aunque esté
     expirada), **usar la caché antigua** e informar al cliente que se está
     trabajando con datos locales por falta de conexión.
   - Si no hay ni red ni caché: Retornar error.

## 3. STACK Y PERMISOS

- **Runtime:** Deno (Recomendado).
- **Permisos requeridos:** `--allow-net` (GitHub), `--allow-read` y
  `--allow-write` (para el archivo de caché en el sistema de archivos).
- **Almacenamiento:** El archivo de caché debe guardarse en el directorio
  temporal del sistema o en el directorio de ejecución como `.frank_cache.json`.

## 4. ESQUEMA DEL ARCHIVO DE CACHÉ

El archivo de persistencia debe tener esta estructura:

```json
{
  "last_updated": 1712345678900, 
  "manifest": { ... },
  "files": {
    "docs/table.md": "contenido del archivo...",
    "docs/select.js": "..."
  }
}
```
````

## 5. ESPECIFICACIÓN DE LA HERRAMIENTA MCP

- **Nombre:** `search_frankjstein_docs`
- **Lógica Interna:**
  1. El servidor recibe el `query`.
  2. Antes de buscar, resuelve el estado de la base de datos (Local vs Remote)
     basándose en el TTL de 24h.
  3. Una vez resuelto el contenido (desde memoria o disco), aplica `Fuse.js`
     para encontrar la mejor coincidencia.
  4. Retorna el contenido del archivo encontrado.

## 6. ESQUELETO LÓGICO (Deno / TypeScript)

```typescript
import { McpServer } from "npm:@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk/server/stdio.js";
import Fuse from "npm:fuse.js";

const CACHE_FILE = "./.frank_cache.json";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 Horas
const REPO_URL =
    "[https://raw.githubusercontent.com/](https://raw.githubusercontent.com/)...";

// 1. Función de Sincronización (Orquestador de Caché)
async function getOrUpdateData() {
    let cache = null;
    try {
        const data = await Deno.readTextFile(CACHE_FILE);
        cache = JSON.parse(data);
    } catch { /* No hay caché */ }

    const isExpired = !cache || (Date.now() - cache.last_updated > TTL_MS);

    if (isExpired) {
        try {
            console.error("Intentando actualizar desde la nube...");
            // Lógica para descargar manifest y archivos...
            // const freshData = { last_updated: Date.now(), manifest, files };
            // await Deno.writeTextFile(CACHE_FILE, JSON.stringify(freshData));
            // return freshData;
        } catch (err) {
            if (cache) {
                console.error(
                    "Sin conexión. Usando caché expirada (Modo Resiliencia).",
                );
                return cache;
            }
            throw new Error("Sin conexión y sin caché local.");
        }
    }
    return cache;
}

// 2. Inicializar Servidor y Registrar Tool
const server = new McpServer({
    name: "frank-oracle-resilient",
    version: "1.0.0",
});

server.tool(
    "search_frankjstein_docs",
    { query: { type: "string" } },
    async ({ query }) => {
        const db = await getOrUpdateData();
        const fuse = new Fuse(Object.keys(db.manifest));
        // ... búsqueda y retorno
    },
);

// 3. Iniciar Transporte
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Instrucción Final para la IA:** Genera el código completo integrando la lógica
de persistencia en disco de Deno. Asegúrate de que todas las funciones de
archivos sean asíncronas (`Deno.readTextFile`) y maneja con elegancia el caso
donde el usuario no tiene conexión a internet.

```
***

### Por qué esto es mejor para el usuario:
1.  **Velocidad Rayo:** Si la caché es válida, el MCP responde en milisegundos porque no hay tráfico de red. La IA se siente mucho más ágil.
2.  **Modo Avión:** El usuario puede seguir programando con tu framework aunque no tenga internet, siempre que lo haya usado al menos una vez en las últimas 24 horas.
3.  **Ahorro de API:** No saturas la API de GitHub con cada mínima pregunta de la IA.
```
