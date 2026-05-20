/**
 * @file turouter.entry.js
 * @description Punto de entrada (Barrel) para compilar el Addon TuRouter.
 * Este archivo consolida todas las exportaciones del enrutador para que el bundler (Rollup/ESBuild)
 * pueda empaquetarlo en `dist/turouter.js`.
 */

export * from "./addons/turouter/ITuRouter.js";
export * from "./addons/turouter/ITuRouterWeb.js";
export * from "./addons/turouter/TuPathfinder.js";
export * from "./addons/turouter/TuRouterCore.js";
export * from "./addons/turouter/TuRouterWeb.js";
export * from "./addons/turouter/GroupUrl.js";
