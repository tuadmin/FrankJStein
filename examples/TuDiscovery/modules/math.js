/**
 * Un módulo pesado simulado que el Hub cargará bajo demanda.
 * Este archivo NO usa alias, solo JS puro.
 */
export const sum = (a, b) => a + b;
export const PI = 3.14159;
export const calculateHeavy = (n) => {
    let result = 0;
    for (let i = 0; i < n; i++) result += Math.sqrt(i);
    return result;
};
