/**
 * =============================================================================
 * ARMONIC THEMES — Theme Store (Historial y Favoritos)
 * =============================================================================
 *
 * Este módulo maneja el estado de los temas generados:
 *
 * 1. HISTORIAL (en memoria):
 *    - Los temas generados en esta sesión se guardan en un array.
 *    - Se pierden al recargar la página. Máximo 30 temas.
 *
 * 2. FAVORITOS (en localStorage):
 *    - Los temas que el usuario guarda explícitamente persisten en el navegador.
 *    - Se mantienen entre sesiones hasta que el usuario los borra.
 *    - ⚠️ ADVERTENCIA: Son temporales. Se borran si se limpia el historial del navegador.
 *
 * 🎛️ VIBECODING:
 * - MAX_HISTORY: Cambia el máximo de temas en el historial de sesión.
 * - STORAGE_KEY: El nombre de la clave en localStorage.
 * =============================================================================
 */

// 🎛️ VIBECODING: Ajusta estos valores para cambiar el comportamiento
const MAX_HISTORY = 30;          // Máximo de temas en el historial de sesión
const STORAGE_KEY = 'armonic_favorites'; // Clave en localStorage

// =============================================================================
// HISTORIAL DE SESIÓN
// =============================================================================

/** Array en memoria. Se pierde al recargar. */
let sessionHistory = [];

/**
 * Añade un tema al historial de la sesión.
 * Si se supera MAX_HISTORY, elimina el más antiguo.
 * @param {Object} theme - Objeto de tema generado por generateTheme()
 */
export function addToHistory(theme) {
  sessionHistory.unshift(theme); // Inserta al inicio (más reciente primero)
  if (sessionHistory.length > MAX_HISTORY) {
    sessionHistory.pop();        // Elimina el más antiguo
  }
}

/**
 * Devuelve todos los temas del historial de la sesión.
 * @returns {Object[]}
 */
export function getHistory() {
  return [...sessionHistory]; // Devuelve una copia para no mutar el original
}

/**
 * Limpia todo el historial de sesión.
 */
export function clearHistory() {
  sessionHistory = [];
}

// =============================================================================
// FAVORITOS (localStorage)
// =============================================================================

/**
 * Carga los favoritos desde localStorage.
 * Si no hay datos o hay un error, devuelve un array vacío.
 * @returns {Object[]}
 */
export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[Armonic] Error al leer favoritos de localStorage:', e);
    return [];
  }
}

/**
 * Guarda un tema en favoritos.
 * Si el tema ya existe (mismo ID), no lo duplica.
 * @param {Object} theme - Objeto de tema a guardar
 * @returns {boolean} - true si se guardó, false si ya existía
 */
export function saveFavorite(theme) {
  try {
    const favorites = getFavorites();
    const exists = favorites.some((f) => f.id === theme.id);
    if (exists) return false;
    favorites.unshift(theme); // Más reciente primero
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch (e) {
    console.warn('[Armonic] Error al guardar en localStorage:', e);
    return false;
  }
}

/**
 * Elimina un tema guardado por su ID.
 * @param {string} themeId - ID del tema a eliminar
 */
export function deleteFavorite(themeId) {
  try {
    const favorites = getFavorites().filter((f) => f.id !== themeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn('[Armonic] Error al eliminar de localStorage:', e);
  }
}

/**
 * Elimina TODOS los temas guardados en favoritos.
 * ⚠️ Esta operación no se puede deshacer.
 */
export function clearAllFavorites() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[Armonic] Error al limpiar localStorage:', e);
  }
}

/**
 * Verifica si un tema ya está guardado en favoritos.
 * @param {string} themeId
 * @returns {boolean}
 */
export function isFavorite(themeId) {
  return getFavorites().some((f) => f.id === themeId);
}
