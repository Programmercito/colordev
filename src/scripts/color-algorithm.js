/**
 * =============================================================================
 * ARMONIC THEMES — Color Generation Algorithm
 * =============================================================================
 *
 * Este módulo es el corazón matemático de Armonic Themes.
 * Genera paletas de colores semánticas completamente aleatorias usando el
 * espacio de color HSL (Hue, Saturation, Lightness).
 *
 * GUÍA DE VIBECODING:
 * Cada función está documentada con sus rangos numéricos.
 * Puedes ajustar cualquier rango para cambiar la "personalidad" del generador.
 * Busca los comentarios "🎛️ VIBECODING:" para encontrar los parámetros clave.
 *
 * CONCEPTOS CLAVE:
 *   H (Hue):        0–360  → El color "puro" (rojo, verde, azul, etc.)
 *   S (Saturation): 0–100% → Qué tan vívido/gris es el color
 *   L (Lightness):  0–100% → Qué tan oscuro (0=negro) o claro (100=blanco)
 * =============================================================================
 */

// =============================================================================
// UTILIDADES BÁSICAS
// =============================================================================

/**
 * Genera un número aleatorio flotante entre min y max.
 * Es el bloque más básico de todo el algoritmo.
 *
 * 🎛️ VIBECODING: Esta función la usan TODAS las demás.
 * Si quisieras añadir una "semilla" fija para reproducibilidad,
 * reemplaza Math.random() por un generador de números pseudoaleatorios (PRNG).
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Genera un entero aleatorio entre min y max (inclusive).
 */
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Convierte un color HSL a su representación de string para CSS.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - String CSS: "hsl(h, s%, l%)"
 */
export function hslToString(h, s, l) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * Convierte HSL a formato HEX (#RRGGBB).
 * Útil para exportar los colores en formatos estándar.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - String HEX: "#rrggbb"
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Convierte un string HEX a un objeto {h, s, l}.
 */
export function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// =============================================================================
// CONTRASTE Y ACCESIBILIDAD (WCAG)
// =============================================================================

/**
 * Calcula la luminancia relativa de un color HSL.
 * La luminancia es la "luminosidad perceptual" de un color según el ojo humano.
 * Usado para calcular la proporción de contraste WCAG.
 */
function getLuminance(h, s, l) {
  const hex = hslToHex(h, s, l);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calcula la proporción de contraste entre dos colores HSL.
 * El estándar WCAG AA requiere ≥ 4.5:1 para texto normal.
 * El estándar WCAG AAA requiere ≥ 7:1.
 * @returns {number} - Proporción de contraste (1:1 = sin contraste, 21:1 = máximo)
 */
function getContrastRatio(h1, s1, l1, h2, s2, l2) {
  const lum1 = getLuminance(h1, s1, l1);
  const lum2 = getLuminance(h2, s2, l2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Dado un color de fondo (background), genera el color de texto (foreground)
 * que maximice la legibilidad. Siempre devuelve o blanco o negro.
 *
 * 🎛️ VIBECODING: Para cambiar el umbral de decisión blanco/negro,
 * ajusta el valor 0.179. Más alto = usa blanco en más casos. Más bajo = usa negro más.
 */
function getForegroundForBackground(h, s, l) {
  const lum = getLuminance(h, s, l);
  // Si la luminancia es mayor a ~0.179, el fondo es suficientemente claro → texto oscuro
  return lum > 0.179 ? { h: 0, s: 0, l: 10 } : { h: 0, s: 0, l: 96 };
}

// =============================================================================
// GENERACIÓN DE COLORES INDIVIDUALES
// =============================================================================

/**
 * Genera los colores de background y foreground para modo LIGHT.
 *
 * 🎛️ VIBECODING:
 * - S (saturation) baja → fondos más grises y neutrales
 * - S alta → fondos con tinte de color (puede verse muy saturado)
 * - L alta (85-98) → fondos muy claros y limpios
 * - L más baja (70-85) → fondos tipo "pastel"
 */
function generateBackground_Light() {
  const h = rand(0, 360);   // Hue completamente aleatorio
  const s = rand(0, 15);    // 🎛️ Saturación baja = fondos neutros y elegantes
  const l = rand(90, 99);   // 🎛️ Luminosidad muy alta = fondos casi blancos
  return { h, s, l };
}

/**
 * Genera los colores de background y foreground para modo DARK.
 *
 * 🎛️ VIBECODING:
 * - L baja (4-18) → fondos muy oscuros tipo "Negro profundo"
 * - L más alta (18-30) → fondos oscuros tipo "Pizarra"
 * - S (2-12) → permite fondos con tinte sutil de color
 */
function generateBackground_Dark() {
  const h = rand(0, 360);
  const s = rand(2, 12);    // 🎛️ Un poco más de saturación para fondos oscuros
  const l = rand(4, 18);    // 🎛️ Luminosidad baja = fondos oscuros profundos
  return { h, s, l };
}

/**
 * Genera el color "Primary" — el color principal de acento de la marca.
 * Este es el color más importante y vibrante de la paleta.
 *
 * 🎛️ VIBECODING:
 * - S alta (60-95) → colores muy vívidos y llamativos
 * - S baja (20-50) → tonos más apagados y sofisticados
 * - L media (35-65) → colores que funcionan bien en ambos contextos
 */
function generatePrimary() {
  const h = rand(0, 360);    // 🎛️ Hue totalmente libre = cualquier color puede ser primary
  const s = rand(60, 95);    // 🎛️ Alta saturación = colores vibrantes y de acción
  const l = rand(35, 65);    // 🎛️ Luminosidad media para versatilidad
  return { h, s, l };
}

/**
 * Genera el color "Secondary" — un color complementario al Primary.
 * Suele ser más suave y menos llamativo.
 *
 * 🎛️ VIBECODING:
 * - Actualmente es aleatorio (independiente del primary).
 * - Para hacerlo "armónico": usa (primary.h + 30) % 360 como hue base (color análogo)
 * - Para complementario: usa (primary.h + 180) % 360
 */
function generateSecondary() {
  const h = rand(0, 360);    // 🎛️ Libre. Para relacionarlo al primary, usa el hue del primary ± offset
  const s = rand(15, 50);    // 🎛️ Saturación media-baja = más discreto que el primary
  const l = rand(40, 70);
  return { h, s, l };
}

/**
 * Genera el color "Muted" — muy suave, para fondos de segunda capa o texto secundario.
 *
 * 🎛️ VIBECODING:
 * - S muy baja (0-20) → más gris y neutro (ideal para fondos de tarjetas)
 * - L alta (75-90) → para modo light
 */
function generateMuted_Light() {
  const h = rand(0, 360);
  const s = rand(0, 20);     // 🎛️ Casi sin saturación = el más neutro de todos
  const l = rand(88, 96);    // 🎛️ Muy claro pero diferente al background
  return { h, s, l };
}

function generateMuted_Dark() {
  const h = rand(0, 360);
  const s = rand(0, 15);
  const l = rand(18, 30);    // 🎛️ Un poco más claro que el background dark
  return { h, s, l };
}

/**
 * Genera el color "Accent" — para hovers, highlights y elementos interactivos.
 * Puede ser vivaz o sutil.
 *
 * 🎛️ VIBECODING:
 * - Para que sea parecido al primary: usa primary.h ± rand(20, 60)
 * - S y L similares al primary pero ligeramente diferentes
 */
function generateAccent() {
  const h = rand(0, 360);
  const s = rand(50, 90);    // 🎛️ Bastante saturado pero puede variar
  const l = rand(45, 70);
  return { h, s, l };
}

/**
 * Genera el color "Destructive" — para errores, alertas y acciones peligrosas.
 * Casi siempre rojo, pero con variaciones.
 *
 * 🎛️ VIBECODING:
 * - H en rango 0-20 o 340-360 = rojos puros
 * - H en 20-40 = naranjas (más agresivos en dark mode)
 * - Para NUNCA ser rojo: usa H en 30-60 (naranjas/amarillos de advertencia)
 */
function generateDestructive() {
  // 🎛️ Elegimos aleatoriamente entre rojo puro o naranja-rojo
  const useOrange = Math.random() > 0.7; // 30% de veces usa naranja en vez de rojo
  const h = useOrange ? rand(20, 38) : rand(0, 12);
  const s = rand(75, 95);    // 🎛️ Alta saturación = alerta clara
  const l = rand(38, 58);
  return { h, s, l };
}

/**
 * Genera el color "Border" — para líneas divisorias y bordes de elementos.
 * Suele ser muy sutil.
 */
function generateBorder_Light() {
  const h = rand(0, 360);
  const s = rand(0, 15);
  const l = rand(78, 90);    // 🎛️ Ligeramente más oscuro que el muted
  return { h, s, l };
}

function generateBorder_Dark() {
  const h = rand(0, 360);
  const s = rand(0, 12);
  const l = rand(22, 35);    // 🎛️ Un poco más claro que el muted dark
  return { h, s, l };
}

/**
 * Genera el color "Ring" — anillo de enfoque (outline al hacer focus con teclado).
 * Normalmente es igual o similar al primary para coherencia visual.
 *
 * 🎛️ VIBECODING:
 * - Para que siempre sea el primary: return { ...primary }
 * - Para que sea su complementario: usa (primary.h + 180) % 360
 */
function generateRing() {
  const h = rand(0, 360);
  const s = rand(60, 100);   // 🎛️ Bien saturado para ser visible al hacer foco
  const l = rand(40, 60);
  return { h, s, l };
}

// =============================================================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN
// =============================================================================

/**
 * Genera una paleta de colores semántica completa, totalmente aleatoria,
 * con variantes para Light Mode y Dark Mode.
 *
 * @returns {Object} - Objeto con todas las variables de color del tema
 *
 * ESTRUCTURA DEL OBJETO DEVUELTO:
 * {
 *   name: string          → Nombre autogenerado del tema
 *   id: string            → ID único basado en timestamp
 *   light: {              → Colores para modo claro
 *     background: string,
 *     foreground: string,
 *     primary: string,
 *     "primary-foreground": string,
 *     secondary: string,
 *     "secondary-foreground": string,
 *     muted: string,
 *     "muted-foreground": string,
 *     accent: string,
 *     "accent-foreground": string,
 *     destructive: string,
 *     "destructive-foreground": string,
 *     border: string,
 *     ring: string,
 *   },
 *   dark: { ...same keys }
 *   swatches: string[]    → Array de colores hex para la vista previa rápida
 * }
 */
export function generateTheme() {
  // --- Generamos los colores base en HSL ---
  const bgLight  = generateBackground_Light();
  const bgDark   = generateBackground_Dark();
  const primary  = generatePrimary();
  const secondary = generateSecondary();
  const mutedLight = generateMuted_Light();
  const mutedDark  = generateMuted_Dark();
  const accent   = generateAccent();
  const destructive = generateDestructive();
  const borderLight = generateBorder_Light();
  const borderDark  = generateBorder_Dark();
  const ring     = generateRing();

  // --- Calculamos los foregrounds automáticamente (blanco o negro por contraste) ---
  const fgLight      = getForegroundForBackground(bgLight.h, bgLight.s, bgLight.l);
  const fgDark       = getForegroundForBackground(bgDark.h, bgDark.s, bgDark.l);
  const primaryFg    = getForegroundForBackground(primary.h, primary.s, primary.l);
  const secondaryFg  = getForegroundForBackground(secondary.h, secondary.s, secondary.l);
  const mutedFgLight = { h: bgLight.h, s: rand(5, 25), l: rand(35, 55) };  // Texto gris medio
  const mutedFgDark  = { h: bgDark.h,  s: rand(5, 20), l: rand(55, 72) };  // Texto gris claro
  const accentFg     = getForegroundForBackground(accent.h, accent.s, accent.l);
  const destFg       = getForegroundForBackground(destructive.h, destructive.s, destructive.l);

  // --- Función helper para convertir un objeto {h, s, l} a string HEX ---
  const hex = ({ h, s, l }) => hslToHex(h, s, l);

  // --- Construimos el objeto final ---
  const theme = {
    name: generateThemeName(),
    id: `theme_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    light: {
      'background':            hex(bgLight),
      'foreground':            hex(fgLight),
      'primary':               hex(primary),
      'primary-foreground':    hex(primaryFg),
      'secondary':             hex(secondary),
      'secondary-foreground':  hex(secondaryFg),
      'muted':                 hex(mutedLight),
      'muted-foreground':      hex(mutedFgLight),
      'accent':                hex(accent),
      'accent-foreground':     hex(accentFg),
      'destructive':           hex(destructive),
      'destructive-foreground': hex(destFg),
      'border':                hex(borderLight),
      'ring':                  hex(ring),
    },
    dark: {
      'background':            hex(bgDark),
      'foreground':            hex(fgDark),
      'primary':               hex(primary),          // Primary se mantiene en ambos modos
      'primary-foreground':    hex(primaryFg),
      'secondary':             hex(secondary),
      'secondary-foreground':  hex(secondaryFg),
      'muted':                 hex(mutedDark),
      'muted-foreground':      hex(mutedFgDark),
      'accent':                hex(accent),
      'accent-foreground':     hex(accentFg),
      'destructive':           hex(destructive),
      'destructive-foreground': hex(destFg),
      'border':                hex(borderDark),
      'ring':                  hex(ring),
    },
    // Swatches: colores representativos para la tarjeta de historial
    swatches: [
      hex(bgLight),
      hex(primary),
      hex(secondary),
      hex(accent),
      hex(destructive),
      hex(mutedLight),
    ],
  };

  return theme;
}

// =============================================================================
// GENERADOR DE NOMBRES DE TEMAS
// =============================================================================

/**
 * Genera nombres aleatorios poéticos para los temas.
 * Combina un adjetivo + un sustantivo para crear nombres únicos y evocadores.
 *
 * 🎛️ VIBECODING: Añade o modifica las listas de adjetivos/sustantivos
 * para cambiar el "vocabulario" de nombres generados.
 */
const ADJECTIVES = [
  'Arctic', 'Velvet', 'Neon', 'Cosmic', 'Ember', 'Frosted', 'Golden',
  'Midnight', 'Crimson', 'Electric', 'Mystic', 'Solar', 'Lunar', 'Obsidian',
  'Pearl', 'Jade', 'Copper', 'Indigo', 'Sage', 'Slate', 'Rust', 'Ivory',
  'Cobalt', 'Amber', 'Violet', 'Teal', 'Scarlet', 'Onyx', 'Silver', 'Citrus'
];

const NOUNS = [
  'Dawn', 'Wave', 'Pulse', 'Storm', 'Bloom', 'Drift', 'Glow', 'Spark',
  'Echo', 'Haze', 'Tide', 'Flare', 'Shade', 'Crest', 'Veil', 'Mist',
  'Peak', 'Void', 'Aura', 'Flux', 'Core', 'Edge', 'Depth', 'Trace',
  'Beam', 'Rift', 'Surge', 'Blaze', 'Flow', 'Dust'
];

function generateThemeName() {
  const adj = ADJECTIVES[randInt(0, ADJECTIVES.length - 1)];
  const noun = NOUNS[randInt(0, NOUNS.length - 1)];
  return `${adj} ${noun}`;
}

// =============================================================================
// EXPORTACIÓN DE CÓDIGO
// =============================================================================

/**
 * Genera el código CSS para Tailwind v4 (@theme block).
 * @param {Object} theme - Objeto de tema generado por generateTheme()
 * @returns {string} - Código CSS listo para pegar en global.css
 */
export function exportTailwindV4(theme) {
  const { light, dark } = theme;

  const lightVars = Object.entries(light)
    .map(([key, val]) => `  --color-${key}: var(--${key});`)
    .join('\n');

  const lightTokens = Object.entries(light)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  const darkTokens = Object.entries(dark)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  return `/* Theme: ${theme.name} — Generated by Armonic Themes */
/* Paste this in your global.css */

@import "tailwindcss";

@theme {
${lightVars}
}

:root {
${lightTokens}
}

[data-theme="dark"] {
${darkTokens}
}`;
}

/**
 * Genera variables CSS puras (sin Tailwind).
 * @param {Object} theme - Objeto de tema generado por generateTheme()
 * @returns {string} - Código CSS con variables CSS nativas
 */
export function exportCSSVariables(theme) {
  const { light, dark } = theme;

  const lightTokens = Object.entries(light)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  const darkTokens = Object.entries(dark)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  return `/* Theme: ${theme.name} — Generated by Armonic Themes */

:root {
${lightTokens}
}

[data-theme="dark"] {
${darkTokens}
}`;
}

/**
 * Genera la configuración para Tailwind CSS v3 (tailwind.config.js).
 * @param {Object} theme - Objeto de tema generado por generateTheme()
 * @returns {string} - Código JS para tailwind.config.js
 */
export function exportTailwindV3(theme) {
  const { light } = theme;

  const colorEntries = Object.entries(light)
    .map(([key, val]) => `      '${key}': 'var(--${key})',`)
    .join('\n');

  const lightTokens = Object.entries(light)
    .map(([key, val]) => `    '--${key}': '${val}',`)
    .join('\n');

  const darkTokens = Object.entries(theme.dark)
    .map(([key, val]) => `      '--${key}': '${val}',`)
    .join('\n');

  return `// Theme: ${theme.name} — Generated by Armonic Themes
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        ':root': {
${lightTokens}
        },
        '[data-theme="dark"]': {
${darkTokens}
        },
      });
    },
  ],
};`;
}
