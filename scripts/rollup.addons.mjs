import { dts } from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import strip from "@rollup/plugin-strip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 1. Obtiene la ruta del directorio del archivo de configuración actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../src");

/**
 * Escanea la carpeta `src` y extrae todos los archivos que terminen en `.entry.js`.
 * Retorna un array de objetos con el nombre del addon y sus rutas absolutas.
 */
const discoverAddons = () => {
    return fs
        .readdirSync(srcDir)
        .filter((file) => file.endsWith(".entry.js"))
        .map((file) => {
            const name = file.replace(".entry.js", "");
            return {
                name,
                jsInput: path.join(srcDir, file),
                dtsInput: path.join(srcDir, `${name}.entry.d.ts`)
            };
        });
};

/**
 * Construye la configuración de Rollup dinámicamente.
 */
const createRollupConfig = () => {
    const addons = discoverAddons();
    const configs = [];

    for (const addon of addons) {
        // --- CONFIGURACIÓN #1: PARA EL BUNDLE DE JAVASCRIPT ---
        configs.push({
            input: { [addon.name]: addon.jsInput },
            // IMPORTANTE: external como función directa, NO en un array, para que evalúe correctamente
            external: (id) => id.includes("frankjstein"),
            output: {
                dir: "dist",
                format: "es",
                entryFileNames: "[name].js",
                //compact: true,
                // Reescribimos la ruta relativa para que apunte a './frankjstein.js'
                paths: (id) => {
                    if (id.includes("frankjstein")) return "./frankjstein.js";
                    return id;
                }
            },
            plugins: [
                // Eliminamos console.logs para evitar ruido
                strip({
                    functions: ["console.log"]
                }),
                // Minificamos y preservamos ES6 nativo
                terser({
                    ecma: 2020,
                    compress: {
                        passes: 2,
                        keep_classnames: true,
                        keep_fnames: true
                    },
                    mangle: {
                        keep_classnames: true,
                        keep_fnames: true
                    }, // Evita ofuscar los nombres exportados pero reduce las variables internas
                    format: {
                        comments: false
                    }
                })
            ]
        });

        // --- CONFIGURACIÓN #2: PARA LAS DEFINICIONES DE TIPOS (.d.ts) ---
        if (fs.existsSync(addon.dtsInput)) {
            configs.push({
                input: { [addon.name]: addon.dtsInput },
                external: (id) => id.includes("frankjstein"),
                output: {
                    dir: "dist",
                    format: "es",
                    entryFileNames: "[name].d.ts",
                    paths: (id) => {
                        if (id.includes("frankjstein")) return "./frankjstein.js";
                        return id;
                    }
                },
                plugins: [
                    dts() // Combina todos los interfaces y clases en un solo archivo plano
                ]
            });
        }
    }

    return configs;
};

// Exportamos el array dinámico de configuraciones
export default createRollupConfig();
