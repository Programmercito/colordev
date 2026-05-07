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
 * Acepta tintes independientes para dark y light para mayor variedad.
 */
function autoForeground(h, s, l, darkTint = h, lightTint = h) {
  const lum = getLuminance(h, s, l);
  // Pequeña variación adicional al hue para que no sea EXACTAMENTE el mismo siempre
  const finalDarkTint = normHue(darkTint + rand(-15, 15));
  const finalLightTint = normHue(lightTint + rand(-10, 10));
  
  return lum > 0.179
    ? { h: finalDarkTint, s: rand(15, 45), l: rand(2, 12) }   // Fondo claro → oscuro teñido
    : { h: finalLightTint, s: rand(5, 25), l: rand(92, 98) };  // Fondo oscuro → claro teñido
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
    const offset1 = rand(20, 50) * direction;
    const offset2 = rand(40, 80) * direction;
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
    const secondaryOffset = rand(-35, 35);
    return {
      secondaryHue: normHue(baseHue + secondaryOffset),
      accentHue:    normHue(baseHue + 180 + rand(-20, 20)), // Complementario ± variación
    };
  },

  /**
   * TRIÁDICA: 3 colores a 120° de distancia.
   */
  triadic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 120 + rand(-20, 20)),
      accentHue:    normHue(baseHue + 240 + rand(-20, 20)),
    };
  },

  /**
   * SPLIT-COMPLEMENTARIA: Los vecinos del complementario.
   */
  splitComplementary(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 150 + rand(-15, 15)),
      accentHue:    normHue(baseHue + 210 + rand(-15, 15)),
    };
  },

  /**
   * TETRÁDICA: 4 colores (secundario a 90, acento a 270).
   */
  tetradic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 90 + rand(-15, 15)),
      accentHue:    normHue(baseHue + 270 + rand(-15, 15)),
    };
  },

  /**
   * CHAOTIC: Completamente aleatorio para romper la monotonía ("secuencias repetidas").
   */
  chaotic(baseHue) {
    return {
      secondaryHue: rand(0, 360),
      accentHue:    rand(0, 360),
    };
  }
};

/**
 * Elige una estrategia de armonía al azar.
 * 🎛️ VIBECODING: Cambia los pesos para favorecer estrategias más suaves o contrastantes.
 */
function pickHarmonyStrategy() {
  const roll = Math.random();
  if (roll < 0.25) return 'analogous';
  if (roll < 0.45) return 'complementary';
  if (roll < 0.65) return 'triadic';
  if (roll < 0.80) return 'splitComplementary';
  if (roll < 0.90) return 'tetradic';
  return 'chaotic';
}

// =============================================================================
// MOODS DE PALETA (Intensidad y Personalidad)
// =============================================================================

/**
 * Los "moods" controlan la saturación y luminosidad de los colores generados.
 * Cada mood define rangos [min, max] para cada tipo de color.
 *
 * SIN moods: todas las paletas salen "chillantes" porque la saturación
 * siempre está en 55-90%. CON moods: hay variedad real.
 *
 * 🎛️ VIBECODING:
 * Cada mood tiene estas propiedades:
 *   - primaryS:    [min, max] saturación del color primario
 *   - primaryL:    [min, max] luminosidad del color primario
 *   - secondaryS:  [min, max] saturación del secundario
 *   - secondaryL:  [min, max] luminosidad del secundario
 *   - accentS:     [min, max] saturación del acento
 *   - accentL:     [min, max] luminosidad del acento
 *   - bgTintS:     [min, max] saturación del tinte en fondos (background/muted/border)
 *
 * Para crear un mood nuevo: copia uno existente, cámbiale los rangos, y
 * añádelo al array PALETTE_MOODS.
 */
const PALETTE_MOODS = {
  bold: {
    name: 'bold',
    primaryS: [55, 80], primaryL: [42, 58],
    secondaryS: [25, 50], secondaryL: [42, 60],
    accentS: [45, 75], accentL: [45, 62],
    bgTintS: [8, 25],
    bgLightL: [95, 99], bgDarkL: [5, 12],
    mutedLightL: [89, 95], mutedDarkL: [12, 22],
  },
  soft: {
    name: 'soft',
    primaryS: [30, 55], primaryL: [55, 72],
    secondaryS: [20, 40], secondaryL: [55, 70],
    accentS: [30, 55], accentL: [55, 70],
    bgTintS: [5, 18],
    bgLightL: [96, 99], bgDarkL: [8, 15],
    mutedLightL: [90, 96], mutedDarkL: [15, 24],
  },
  muted: {
    name: 'muted',
    primaryS: [18, 42], primaryL: [35, 55],
    secondaryS: [12, 30], secondaryL: [40, 58],
    accentS: [20, 45], accentL: [40, 58],
    bgTintS: [3, 12],
    bgLightL: [94, 98], bgDarkL: [10, 18],
    mutedLightL: [88, 93], mutedDarkL: [18, 28],
  },
  deep: {
    name: 'deep',
    primaryS: [45, 75], primaryL: [30, 48],
    secondaryS: [25, 50], secondaryL: [32, 50],
    accentS: [40, 70], accentL: [35, 55],
    bgTintS: [15, 30],
    bgLightL: [92, 97], bgDarkL: [2, 8],
    mutedLightL: [85, 92], mutedDarkL: [8, 16],
  },
  vibrant: {
    name: 'vibrant',
    primaryS: [72, 95], primaryL: [48, 62],
    secondaryS: [45, 70], secondaryL: [48, 65],
    accentS: [65, 95], accentL: [48, 65],
    bgTintS: [10, 30],
    bgLightL: [95, 99], bgDarkL: [4, 12],
    mutedLightL: [88, 94], mutedDarkL: [12, 20],
  },
  earthy: {
    name: 'earthy',
    primaryS: [15, 35], primaryL: [30, 50],
    secondaryS: [10, 25], secondaryL: [35, 55],
    accentS: [20, 40], accentL: [35, 55],
    bgTintS: [10, 25],
    bgLightL: [90, 95], bgDarkL: [12, 20],
    mutedLightL: [82, 88], mutedDarkL: [20, 30],
  },
  pastel: {
    name: 'pastel',
    primaryS: [40, 70], primaryL: [70, 85],
    secondaryS: [30, 60], secondaryL: [70, 85],
    accentS: [40, 75], accentL: [70, 85],
    bgTintS: [15, 35],
    bgLightL: [96, 99], bgDarkL: [15, 25],
    mutedLightL: [90, 95], mutedDarkL: [25, 35],
  },
  midnight: {
    name: 'midnight',
    primaryS: [50, 80], primaryL: [50, 70],
    secondaryS: [30, 60], secondaryL: [40, 60],
    accentS: [60, 90], accentL: [50, 70],
    bgTintS: [25, 45],
    bgLightL: [94, 98], bgDarkL: [3, 9], 
    mutedLightL: [86, 92], mutedDarkL: [9, 16],
  }
};

/**
 * Elige un mood al azar para la paleta.
 *
 * 🎛️ VIBECODING: Ajusta estos pesos para cambiar la frecuencia.
 * Actualmente:
 *   - bold:    25% (el más "estándar")
 *   - soft:    25% (pasteles elegantes)
 *   - muted:   20% (corporativo/luxury)
 *   - deep:    15% (premium oscuro)
 *   - vibrant: 15% (energético)
 */
function pickMood() {
  const roll = Math.random();
  if (roll < 0.25) return PALETTE_MOODS.bold;
  if (roll < 0.50) return PALETTE_MOODS.soft;
  if (roll < 0.70) return PALETTE_MOODS.muted;
  if (roll < 0.85) return PALETTE_MOODS.deep;
  return PALETTE_MOODS.vibrant;
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
export function generateTheme(options = {}) {
  // ── Paso 1: Hue base (Filtro Anti-Verde-Tóxico) ─────────────────────────
  let baseHue = options.baseHue !== undefined ? options.baseHue : rand(0, 360);
  // Si el hue es aleatorio y cae en la zona del "verde chillón feo" (90-140),
  // lo empujamos hacia un verde menta/turquesa elegante (150-170) o amarillo/lima (60-80).
  // Solo lo aplicamos un 70% de las veces para permitir también colores crudos y más variados.
  if (options.baseHue === undefined && baseHue > 90 && baseHue < 140 && Math.random() > 0.3) {
    baseHue = Math.random() > 0.5 ? rand(150, 170) : rand(50, 80);
  }

  // ── Paso 2: Estrategia de armonía ───────────────────────────────────────
  const strategyName = options.strategyName || pickHarmonyStrategy();
  const strategy = HARMONY_STRATEGIES[strategyName];
  const { secondaryHue, accentHue } = strategy(baseHue);

  // ── Paso 2.5: MOOD de la paleta ─────────────────────────────────────────
  const mood = options.moodName ? PALETTE_MOODS[options.moodName] : pickMood();

  // ── Paso 3: Generar PRIMARY según el mood ───────────────────────────────
  const primary = {
    h: baseHue,
    s: rand(mood.primaryS[0], mood.primaryS[1]),
    l: rand(mood.primaryL[0], mood.primaryL[1]),
  };

  // ── Paso 6: Generar DESTRUCTIVE ─────────────────────────────────────────
  // Para variedad, puede ser desde magenta/rosado (330) hasta naranja (30)
  const destructiveHue = Math.random() > 0.5 ? rand(330, 360) : rand(0, 30);
  const destructive = {
    h: destructiveHue,
    s: rand(Math.min(90, mood.primaryS[0] + 15), 98),
    l: rand(Math.max(35, mood.primaryL[0] - 10), Math.min(65, mood.primaryL[1] + 10)),
  };

  // ── Paso 4: Generar SECONDARY ───────────────────────────────────────────
  const secondaryBase = {
    h: secondaryHue,
    s: rand(mood.secondaryS[0], mood.secondaryS[1]),
    l: rand(mood.secondaryL[0], mood.secondaryL[1]),
  };
  const secondaryLight = {
    h: secondaryHue,
    s: rand(mood.bgTintS[0], mood.bgTintS[1]),
    l: rand(Math.max(80, mood.mutedLightL[0] - 5), mood.mutedLightL[1]),
  };
  const secondaryDark = {
    h: secondaryHue,
    s: rand(mood.bgTintS[0], mood.bgTintS[1]),
    l: rand(mood.mutedDarkL[0], Math.min(40, mood.mutedDarkL[1] + 5)),
  };

  // ── Paso 5: Generar ACCENT ──────────────────────────────────────────────
  const accent = {
    h: accentHue,
    s: rand(mood.accentS[0], mood.accentS[1]),
    l: rand(mood.accentL[0], mood.accentL[1]),
  };
  const accentLight = {
    h: accentHue,
    s: rand(mood.bgTintS[0] + 10, mood.bgTintS[1] + 10),
    l: rand(Math.max(80, mood.mutedLightL[0] - 5), mood.mutedLightL[1]),
  };
  const accentDark = {
    h: accentHue,
    s: rand(mood.bgTintS[0] + 10, mood.bgTintS[1] + 10),
    l: rand(mood.mutedDarkL[0], Math.min(40, mood.mutedDarkL[1] + 5)),
  };

  // ── NUEVO: Tintes para fondos y texto (variedad en oscuros) ────────────
  // Los colores oscuros pueden ser azul negro, verde oscuro, o el baseHue.
  const darkTintCandidates = [baseHue, secondaryHue, accentHue, rand(200, 260), rand(140, 180)];
  const darkTintHue = Math.random() > 0.35 ? darkTintCandidates[randInt(0, darkTintCandidates.length - 1)] : baseHue;
  const lightTintHue = Math.random() > 0.6 ? secondaryHue : baseHue;

  // ── Paso 7: Generar BACKGROUNDS (Light Mode) ───────────────────────────
  const bgLight = {
    h: lightTintHue,
    s: rand(mood.bgTintS[0], mood.bgTintS[1]),
    l: rand(mood.bgLightL[0], mood.bgLightL[1]),
  };

  // ── Paso 8: Generar BACKGROUNDS (Dark Mode) ────────────────────────────
  const bgDark = {
    h: darkTintHue,
    s: rand(mood.bgTintS[0] + 5, mood.bgTintS[1] + 15),
    l: rand(mood.bgDarkL[0], mood.bgDarkL[1]),
  };

  // ── Paso 9: Generar MUTED (fondos de segunda capa) ─────────────────────
  const mutedLight = {
    h: lightTintHue,
    s: rand(mood.bgTintS[0], mood.bgTintS[1] + 5),
    l: rand(mood.mutedLightL[0], mood.mutedLightL[1]),
  };
  const mutedDark = {
    h: darkTintHue,
    s: rand(mood.bgTintS[0] + 5, mood.bgTintS[1] + 15),
    l: rand(mood.mutedDarkL[0], mood.mutedDarkL[1]),
  };

  // ── Paso 10: Generar BORDER ────────────────────────────────────────────
  const borderLight = {
    h: lightTintHue,
    s: rand(mood.bgTintS[0], mood.bgTintS[1]),
    l: rand(Math.max(75, mood.mutedLightL[0] - 8), mood.mutedLightL[0]),
  };
  const borderDark = {
    h: darkTintHue,
    s: rand(mood.bgTintS[0] + 5, mood.bgTintS[1] + 15),
    l: rand(mood.mutedDarkL[1], Math.min(45, mood.mutedDarkL[1] + 12)),
  };

  // ── Paso 11: RING (foco de teclado) = usa accentHue para variedad ─────
  const ring = {
    h: accentHue,
    s: rand(mood.accentS[0], mood.accentS[1]),
    l: rand(mood.accentL[0], mood.accentL[1]),
  };

  // ── Paso 12: FOREGROUNDS automáticos por contraste ─────────────────────
  // Ahora usamos darkTintHue y lightTintHue para mayor riqueza cromática en textos
  const fgLight           = autoForeground(bgLight.h, bgLight.s, bgLight.l, darkTintHue, lightTintHue);
  const fgDark            = autoForeground(bgDark.h, bgDark.s, bgDark.l, darkTintHue, lightTintHue);
  const primaryFg         = autoForeground(primary.h, primary.s, primary.l, darkTintHue, lightTintHue);
  const secondaryFgLight  = autoForeground(secondaryLight.h, secondaryLight.s, secondaryLight.l, darkTintHue, lightTintHue);
  const secondaryFgDark   = autoForeground(secondaryDark.h, secondaryDark.s, secondaryDark.l, darkTintHue, lightTintHue);
  const accentFgLight     = autoForeground(accentLight.h, accentLight.s, accentLight.l, darkTintHue, lightTintHue);
  const accentFgDark      = autoForeground(accentDark.h, accentDark.s, accentDark.l, darkTintHue, lightTintHue);
  const destructiveFg     = autoForeground(destructive.h, destructive.s, destructive.l, darkTintHue, lightTintHue);

  // Muted foreground: tinted using darkTint/lightTint
  const mutedFgLight = { h: darkTintHue, s: rand(mood.bgTintS[0], Math.min(mood.bgTintS[1] + 15, 30)), l: rand(35, 50) };
  const mutedFgDark  = { h: lightTintHue, s: rand(mood.bgTintS[0], Math.min(mood.bgTintS[1] + 15, 30)), l: rand(55, 70) };

  // ── Helper: convierte {h,s,l} a HEX ───────────────────────────────────
  const hex = ({ h, s, l }) => hslToHex(h, s, l);

  // ── Construimos el tema final ──────────────────────────────────────────
  return {
    name: generateThemeName(),
    id: `theme_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    harmony: strategyName,
    mood: mood.name,          // Metadata: qué mood se usó (bold, soft, muted, deep, vibrant)
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
  'Midnight', 'Electric', 'Mystic', 'Solar', 'Lunar', 'Crystal',
  'Pearl', 'Abyssal', 'Radiant', 'Lucid', 'Vivid', 'Silent', 'Dynamic',
  'Fluid', 'Aero', 'Stellar', 'Digital', 'Quantum', 'Serene', 'Wild',
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
