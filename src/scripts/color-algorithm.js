/**
 * =============================================================================
 * ARMONIC THEMES — Color Generation Algorithm v2
 * =============================================================================
 *
 * PRINCIPIO FUNDAMENTAL:
 * En lugar de generar cada color de forma independiente (lo que crea paletas
 * caóticas y feas), este algoritmo:
 *
 *   1. Elige UN solo Hue base aleatorio (0-360°) → este define la "personalidad"
 *   2. Elige UNA estrategia de armonía al azar:
 *      - Análoga:             hues cercanos (±30°)  → paletas suaves y elegantes
 *      - Complementaria:      hue opuesto (+180°)   → paletas contrastantes y vibrantes
 *      - Triádica:            3 hues a 120° entre sí → paletas ricas y balanceadas
 *      - Split-complementaria: opuesto ± 30°         → contraste con más variedad
 *   3. TODOS los colores de la paleta se derivan del hue base y sus hues armónicos
 *   4. Los fondos (background, muted) usan el hue base con saturación MUY baja
 *   5. Los foregrounds se calculan por contraste automático (WCAG)
 *
 * RESULTADO: Cada paleta generada se siente coherente y profesional,
 * no importa qué color base toque.
 *
 * 🎛️ VIBECODING:
 * - Para paletas más "locas": sube los rangos de saturación
 * - Para paletas más "corporativas": baja la saturación y reduce los offsets de hue
 * - Para forzar un tipo de armonía: cambia la función pickHarmonyStrategy()
 * =============================================================================
 */

// =============================================================================
// UTILIDADES BÁSICAS
// =============================================================================

/**
 * Genera un número aleatorio flotante entre min y max.
 * 🎛️ VIBECODING: Reemplaza Math.random() por un PRNG con semilla para
 * poder reproducir paletas exactas.
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Normaliza un hue para que siempre esté en el rango 0-360.
 * Ej: -30 → 330, 400 → 40
 */
function normHue(h) {
  return ((h % 360) + 360) % 360;
}

// =============================================================================
// CONVERSIONES DE COLOR
// =============================================================================

/**
 * HSL a string CSS: "hsl(h, s%, l%)"
 */
export function hslToString(h, s, l) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * HSL a HEX (#rrggbb).
 * Usa la fórmula estándar de conversión directa HSL → RGB → HEX.
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
 * HEX (#rrggbb) a un objeto { h, s, l }.
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
// CONTRASTE Y ACCESIBILIDAD (WCAG 2.1)
// =============================================================================

/**
 * Luminancia relativa de un color HSL (según WCAG 2.1).
 * Mide cuánta "luz" percibe el ojo humano de un color.
 * Rango: 0 (negro absoluto) a 1 (blanco absoluto).
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
 * Dado un color de fondo, devuelve un foreground que garantice contraste legible.
 * Devuelve casi-negro o casi-blanco dependiendo de la luminancia del fondo.
 *
 * 🎛️ VIBECODING:
 * - Umbral 0.179 = el punto medio estándar de la percepción humana
 * - Subir el umbral (ej. 0.3) = usa blanco más a menudo
 * - Bajarlo (ej. 0.1) = usa negro más a menudo
 */
function autoForeground(h, s, l) {
  const lum = getLuminance(h, s, l);
  return lum > 0.179
    ? { h: 0, s: 0, l: 8 }   // Fondo claro → texto casi negro
    : { h: 0, s: 0, l: 96 }; // Fondo oscuro → texto casi blanco
}

// =============================================================================
// ESTRATEGIAS DE ARMONÍA DE COLOR
// =============================================================================

/**
 * Cada estrategia recibe el hue base y devuelve un objeto con los hues
 * derivados para secondary, accent, y destructive.
 *
 * ANALOGOUS (Análoga):
 *   Usa colores vecinos en la rueda de color (±15° a ±45°).
 *   Resultado: Paletas muy suaves, elegantes, "de diseñador".
 *   Ejemplo: Si base=azul(220°), secondary≈200°, accent≈250°
 *
 * COMPLEMENTARY (Complementaria):
 *   Usa el color opuesto en la rueda (+180°).
 *   Resultado: Paletas con mucho contraste y energía.
 *   Ejemplo: Si base=azul(220°), accent≈40° (naranja)
 *
 * TRIADIC (Triádica):
 *   Usa 3 colores equidistantes en la rueda (cada 120°).
 *   Resultado: Paletas ricas, coloridas pero equilibradas.
 *   Ejemplo: Si base=azul(220°), secondary≈340°, accent≈100°
 *
 * SPLIT_COMPLEMENTARY (Split-complementaria):
 *   Usa los dos colores adyacentes al complementario (+150° y +210°).
 *   Resultado: Similar a complementaria pero menos agresiva.
 *   Ejemplo: Si base=azul(220°), secondary≈10°, accent≈70°
 *
 * 🎛️ VIBECODING:
 * - Para SOLO paletas suaves: retorna siempre 'analogous'
 * - Para SOLO paletas vibrantes: retorna siempre 'complementary'
 * - Ajusta los offsets de cada estrategia para variaciones
 */
const HARMONY_STRATEGIES = {
  /**
   * ANÁLOGA: Colores vecinos. El resultado más "safe" y armonioso.
   * 🎛️ offset1: ±15 a ±45 (cuánto se separa el secondary del base)
   * 🎛️ offset2: ±25 a ±60 (cuánto se separa el accent del base)
   */
  analogous(baseHue) {
    const direction = Math.random() > 0.5 ? 1 : -1; // Hacia la izquierda o derecha de la rueda
    const offset1 = rand(20, 45) * direction;
    const offset2 = rand(35, 65) * direction;
    return {
      secondaryHue: normHue(baseHue + offset1),
      accentHue:    normHue(baseHue + offset2),
    };
  },

  /**
   * COMPLEMENTARIA: Color opuesto (+180°).
   * 🎛️ El secondary se mantiene cerca del base (±20°) para que no sea
   * demasiado caótico. Solo el accent salta al otro lado.
   */
  complementary(baseHue) {
    const secondaryOffset = rand(-25, 25);
    return {
      secondaryHue: normHue(baseHue + secondaryOffset),
      accentHue:    normHue(baseHue + 180 + rand(-15, 15)), // Complementario ± variación
    };
  },

  /**
   * TRIÁDICA: 3 colores a 120° de distancia.
   */
  triadic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 120 + rand(-15, 15)),
      accentHue:    normHue(baseHue + 240 + rand(-15, 15)),
    };
  },

  /**
   * SPLIT-COMPLEMENTARIA: Los vecinos del complementario.
   */
  splitComplementary(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 150 + rand(-10, 10)),
      accentHue:    normHue(baseHue + 210 + rand(-10, 10)),
    };
  },
};

/**
 * Elige una estrategia de armonía al azar.
 * 🎛️ VIBECODING: Cambia los pesos para favorecer estrategias más suaves o contrastantes.
 * Actualmente: 30% análoga, 25% complementaria, 25% triádica, 20% split-complementaria
 */
function pickHarmonyStrategy() {
  const roll = Math.random();
  if (roll < 0.30) return 'analogous';
  if (roll < 0.55) return 'complementary';
  if (roll < 0.80) return 'triadic';
  return 'splitComplementary';
}

// =============================================================================
// FUNCIÓN PRINCIPAL DE GENERACIÓN
// =============================================================================

/**
 * Genera una paleta de colores semántica completa y ARMÓNICA,
 * con variantes para Light Mode y Dark Mode.
 *
 * FLUJO DEL ALGORITMO:
 *  1. Escoge un HUE BASE al azar (0-360°)
 *  2. Escoge una ESTRATEGIA DE ARMONÍA al azar
 *  3. Calcula los hues secundarios según la estrategia
 *  4. Genera los fondos usando el hue base con saturación MUY baja (tinte sutil)
 *  5. Genera primary, secondary, accent con los hues armónicos
 *  6. Genera destructive en la zona de rojos (0-15°) siempre
 *  7. Calcula automáticamente los foregrounds por contraste WCAG
 *  8. Genera la variante dark invirtiendo los niveles de lightness
 *
 * @returns {Object} Tema completo con light, dark, swatches y metadata
 */
export function generateTheme() {
  // ── Paso 1: Hue base aleatorio ──────────────────────────────────────────
  const baseHue = rand(0, 360);

  // ── Paso 2: Estrategia de armonía ───────────────────────────────────────
  const strategyName = pickHarmonyStrategy();
  const strategy = HARMONY_STRATEGIES[strategyName];
  const { secondaryHue, accentHue } = strategy(baseHue);

  // ── Paso 3: Generar PRIMARY ─────────────────────────────────────────────
  // El primary SIEMPRE usa el hue base, es el "color de marca"
  // 🎛️ VIBECODING:
  //   - Saturación 55-90: más bajo = más elegante, más alto = más vibrante
  //   - Lightness 40-60: controla qué tan oscuro/claro es el color primario
  const primary = {
    h: baseHue,
    s: rand(55, 90),
    l: rand(42, 60),
  };

  // ── Paso 4: Generar SECONDARY ───────────────────────────────────────────
  // Usa el hue derivado de la estrategia de armonía.
  // En Light mode, secondary se usa frecuentemente como fondo de secciones,
  // así que generamos DOS variantes: una saturada para dark y una pálida para light.
  // 🎛️ VIBECODING: Saturación más baja que primary para que no compita
  const secondaryBase = {
    h: secondaryHue,
    s: rand(30, 60),
    l: rand(45, 60),
  };
  // Versión light: alta luminosidad, baja saturación → fondo suave
  const secondaryLight = {
    h: secondaryHue,
    s: rand(15, 40),
    l: rand(88, 95),
  };
  // Versión dark: saturación moderada, luminosidad media-baja
  const secondaryDark = {
    h: secondaryHue,
    s: rand(25, 50),
    l: rand(18, 28),
  };

  // ── Paso 5: Generar ACCENT ──────────────────────────────────────────────
  // El accent es el "toque de color" más expresivo.
  // En light mode se usa como fondo de highlight, en dark mode como color fuerte.
  // 🎛️ VIBECODING: Sube la saturación para más "pop"
  const accent = {
    h: accentHue,
    s: rand(50, 85),
    l: rand(48, 65),
  };
  // Versión light: pálida para fondos de highlight
  const accentLight = {
    h: accentHue,
    s: rand(20, 45),
    l: rand(88, 95),
  };
  // Versión dark: saturada para fondos de highlight en dark
  const accentDark = {
    h: accentHue,
    s: rand(25, 50),
    l: rand(18, 28),
  };

  // ── Paso 6: Generar DESTRUCTIVE ─────────────────────────────────────────
  // Siempre en la zona roja/naranja para que se interprete como "peligro"
  // 🎛️ VIBECODING:
  //   - Hue 0-15: rojo puro
  //   - Hue 15-30: rojo-naranja (más suave)
  //   - Hue 350-360: rojo-rosado
  const destructive = {
    h: rand(0, 12),
    s: rand(70, 92),
    l: rand(40, 55),
  };

  // ── Paso 7: Generar BACKGROUNDS (Light Mode) ───────────────────────────
  // Usa el MISMO hue base pero con saturación bajísima → crea un tinte
  // sutil coherente con toda la paleta. Esta es la clave de la armonía.
  // 🎛️ VIBECODING:
  //   - S 2-10: tinte apenas perceptible (recomendado)
  //   - S 10-20: tinte notable (se siente "coloreado")
  //   - S 0: gris puro sin tinte
  const bgLight = {
    h: baseHue,
    s: rand(3, 12),     // 🎛️ Tinte muy sutil del hue base
    l: rand(95, 99),    // 🎛️ Casi blanco
  };

  // ── Paso 8: Generar BACKGROUNDS (Dark Mode) ────────────────────────────
  const bgDark = {
    h: baseHue,
    s: rand(4, 15),     // 🎛️ Un poco más de tinte en dark mode
    l: rand(5, 14),     // 🎛️ Casi negro con tinte
  };

  // ── Paso 9: Generar MUTED (fondos de segunda capa) ─────────────────────
  // También usa el hue base para coherencia
  const mutedLight = {
    h: baseHue,
    s: rand(5, 18),
    l: rand(90, 96),    // 🎛️ Ligeramente más oscuro que el background
  };
  const mutedDark = {
    h: baseHue,
    s: rand(5, 15),
    l: rand(14, 24),    // 🎛️ Ligeramente más claro que el background dark
  };

  // ── Paso 10: Generar BORDER ────────────────────────────────────────────
  const borderLight = {
    h: baseHue,
    s: rand(3, 15),
    l: rand(82, 92),    // 🎛️ Entre el muted y el background
  };
  const borderDark = {
    h: baseHue,
    s: rand(3, 12),
    l: rand(20, 32),
  };

  // ── Paso 11: RING (foco de teclado) = misma familia que primary ────────
  const ring = {
    h: baseHue,
    s: rand(60, 90),
    l: rand(45, 60),
  };

  // ── Paso 12: FOREGROUNDS automáticos por contraste ─────────────────────
  const fgLight           = autoForeground(bgLight.h, bgLight.s, bgLight.l);
  const fgDark            = autoForeground(bgDark.h, bgDark.s, bgDark.l);
  const primaryFg         = autoForeground(primary.h, primary.s, primary.l);
  const secondaryFgLight  = autoForeground(secondaryLight.h, secondaryLight.s, secondaryLight.l);
  const secondaryFgDark   = autoForeground(secondaryDark.h, secondaryDark.s, secondaryDark.l);
  const accentFgLight     = autoForeground(accentLight.h, accentLight.s, accentLight.l);
  const accentFgDark      = autoForeground(accentDark.h, accentDark.s, accentDark.l);
  const destructiveFg     = autoForeground(destructive.h, destructive.s, destructive.l);

  // Muted foreground: texto gris medio/suave, usa el hue base para coherencia
  const mutedFgLight = { h: baseHue, s: rand(5, 15), l: rand(35, 50) };
  const mutedFgDark  = { h: baseHue, s: rand(5, 15), l: rand(55, 70) };

  // ── Helper: convierte {h,s,l} a HEX ───────────────────────────────────
  const hex = ({ h, s, l }) => hslToHex(h, s, l);

  // ── Construimos el tema final ──────────────────────────────────────────
  return {
    name: generateThemeName(),
    id: `theme_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    harmony: strategyName, // Metadata: qué estrategia se usó
    baseHue: Math.round(baseHue),
    light: {
      'background':            hex(bgLight),
      'foreground':            hex(fgLight),
      'primary':               hex(primary),
      'primary-foreground':    hex(primaryFg),
      'secondary':             hex(secondaryLight),
      'secondary-foreground':  hex(secondaryFgLight),
      'muted':                 hex(mutedLight),
      'muted-foreground':      hex(mutedFgLight),
      'accent':                hex(accentLight),
      'accent-foreground':     hex(accentFgLight),
      'destructive':           hex(destructive),
      'destructive-foreground': hex(destructiveFg),
      'border':                hex(borderLight),
      'ring':                  hex(ring),
    },
    dark: {
      'background':            hex(bgDark),
      'foreground':            hex(fgDark),
      'primary':               hex(primary),
      'primary-foreground':    hex(primaryFg),
      'secondary':             hex(secondaryDark),
      'secondary-foreground':  hex(secondaryFgDark),
      'muted':                 hex(mutedDark),
      'muted-foreground':      hex(mutedFgDark),
      'accent':                hex(accentDark),
      'accent-foreground':     hex(accentFgDark),
      'destructive':           hex(destructive),
      'destructive-foreground': hex(destructiveFg),
      'border':                hex(borderDark),
      'ring':                  hex(ring),
    },
    swatches: [
      hex(bgLight),
      hex(primary),
      hex(secondaryBase),
      hex(accent),
      hex(destructive),
      hex(mutedLight),
    ],
  };
}

// =============================================================================
// NOMBRES DE TEMAS
// =============================================================================

const ADJECTIVES = [
  'Arctic', 'Velvet', 'Neon', 'Cosmic', 'Ember', 'Frosted', 'Golden',
  'Midnight', 'Crimson', 'Electric', 'Mystic', 'Solar', 'Lunar', 'Obsidian',
  'Pearl', 'Jade', 'Copper', 'Indigo', 'Sage', 'Slate', 'Rust', 'Ivory',
  'Cobalt', 'Amber', 'Violet', 'Teal', 'Scarlet', 'Onyx', 'Silver', 'Citrus',
];

const NOUNS = [
  'Dawn', 'Wave', 'Pulse', 'Storm', 'Bloom', 'Drift', 'Glow', 'Spark',
  'Echo', 'Haze', 'Tide', 'Flare', 'Shade', 'Crest', 'Veil', 'Mist',
  'Peak', 'Void', 'Aura', 'Flux', 'Core', 'Edge', 'Depth', 'Trace',
  'Beam', 'Rift', 'Surge', 'Blaze', 'Flow', 'Dust',
];

function generateThemeName() {
  const adj = ADJECTIVES[randInt(0, ADJECTIVES.length - 1)];
  const noun = NOUNS[randInt(0, NOUNS.length - 1)];
  return `${adj} ${noun}`;
}

// =============================================================================
// EXPORTACIÓN DE CÓDIGO
// =============================================================================

export function exportTailwindV4(theme) {
  const { light, dark } = theme;
  const themeVars = Object.entries(light)
    .map(([key]) => `  --color-${key}: var(--${key});`)
    .join('\n');
  const lightTokens = Object.entries(light)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');
  const darkTokens = Object.entries(dark)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  return `/* ${theme.name} — Armonic Themes (${theme.harmony}) */

@import "tailwindcss";

@theme {
${themeVars}
}

:root {
${lightTokens}
}

[data-theme="dark"] {
${darkTokens}
}`;
}

export function exportCSSVariables(theme) {
  const { light, dark } = theme;
  const lightTokens = Object.entries(light)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');
  const darkTokens = Object.entries(dark)
    .map(([key, val]) => `  --${key}: ${val};`)
    .join('\n');

  return `/* ${theme.name} — Armonic Themes (${theme.harmony}) */

:root {
${lightTokens}
}

[data-theme="dark"] {
${darkTokens}
}`;
}

export function exportTailwindV3(theme) {
  const { light } = theme;
  const colorEntries = Object.entries(light)
    .map(([key]) => `      '${key}': 'var(--${key})',`)
    .join('\n');
  const lightTokens = Object.entries(light)
    .map(([key, val]) => `    '--${key}': '${val}',`)
    .join('\n');
  const darkTokens = Object.entries(theme.dark)
    .map(([key, val]) => `      '--${key}': '${val}',`)
    .join('\n');

  return `// ${theme.name} — Armonic Themes (${theme.harmony})

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
