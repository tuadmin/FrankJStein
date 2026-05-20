import { TuRouterCore, TuPathfinder } from "../src/turouter.entry.js";

const pathfinder = new TuPathfinder();
const router = new TuRouterCore(pathfinder);

console.log("🚀 Iniciando Benchmark de TuRouter (Pathfinder Edition)...");

// 1. REGISTRO DE RUTAS MASIVO
console.log("📦 Registrando 5,000 rutas...");
const startTimeRegister = performance.now();

for (let i = 0; i < 2000; i++) {
    router.add(`/static/route/number/${i}`, `Handler${i}`);
}

for (let i = 0; i < 2000; i++) {
    router.add(`/user/{id}/post/${i}`, `PostHandler${i}`);
}

for (let i = 0; i < 1000; i++) {
    router.add(`/category/{name}/product/{pid}/detail/${i}`, `ProductHandler${i}`);
}

const endTimeRegister = performance.now();
console.log(`✅ Registro completado en ${(endTimeRegister - startTimeRegister).toFixed(2)}ms`);

// 2. BENCHMARK DE RESOLUCIÓN
const ITERATIONS = 100_000;

async function bench(name, path) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        await router.resolve(path);
    }
    const end = performance.now();
    const total = end - start;
    const opPerSec = Math.floor((ITERATIONS / total) * 1000);
    console.log(
        `🔹 ${name.padEnd(25)} | ${total.toFixed(2)}ms | ${opPerSec.toLocaleString()} ops/sec`
    );
}

async function run() {
    console.log(`\n🏃 Ejecutando ${ITERATIONS.toLocaleString()} iteraciones por caso:`);
    console.log("".padEnd(60, "-"));

    await bench("Static Route (Fast-Path)", "/static/route/number/1999");
    await bench("Param Route (Deep)", "/user/nameUser/post/1999");
    await bench("Param Route (Complex)", "/category/electro/product/999/detail/500");
    await bench("404 (Worst Case)", "/this/path/does/not/exist/at/all/in/the/tree");

    console.log("".padEnd(60, "-"));
    console.log("🏁 Benchmark finalizado.\n");
}

run();
