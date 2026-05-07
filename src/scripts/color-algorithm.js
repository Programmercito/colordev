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
  /** Colores vecinos — suave y elegante. */
  analogous(baseHue) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    return {
      secondaryHue: normHue(baseHue + rand(18, 55) * dir),
      accentHue:    normHue(baseHue + rand(38, 85) * dir),
    };
  },

  /** Color opuesto +180°. */
  complementary(baseHue) {
    return {
      secondaryHue: normHue(baseHue + rand(-40, 40)),
      accentHue:    normHue(baseHue + 180 + rand(-25, 25)),
    };
  },

  /** 3 colores a 120° de distancia. */
  triadic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 120 + rand(-25, 25)),
      accentHue:    normHue(baseHue + 240 + rand(-25, 25)),
    };
  },

  /** Los vecinos del complementario. */
  splitComplementary(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 150 + rand(-20, 20)),
      accentHue:    normHue(baseHue + 210 + rand(-20, 20)),
    };
  },

  /** Cuadrado en la rueda: 90° y 270°. */
  tetradic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 90 + rand(-18, 18)),
      accentHue:    normHue(baseHue + 270 + rand(-18, 18)),
    };
  },

  /** Colores completamente libres — máxima sorpresa. */
  chaotic(_baseHue) {
    return {
      secondaryHue: rand(0, 360),
      accentHue:    rand(0, 360),
    };
  },

  /** Análoga amplia: segunda capa lejana (±60-100°) — sofisticada. */
  wideAnalogous(baseHue) {
    const dir = Math.random() > 0.5 ? 1 : -1;
    return {
      secondaryHue: normHue(baseHue + rand(55, 100) * dir),
      accentHue:    normHue(baseHue + rand(100, 160) * dir),
    };
  },

  /** Doble-split: ambos lados del complementario. */
  doubleSplit(baseHue) {
    return {
      secondaryHue: normHue(baseHue + 150 + rand(-30, 30)),
      accentHue:    normHue(baseHue - 150 + rand(-30, 30)),
    };
  },

  /** Monocromático: mismo hue, muy poca variación — elegancia máxima. */
  monochromatic(baseHue) {
    return {
      secondaryHue: normHue(baseHue + rand(-12, 12)),
      accentHue:    normHue(baseHue + rand(-18, 18)),
    };
  },
};

/**
 * Elige una estrategia al azar — distribución uniforme entre todas.
 */
function pickHarmonyStrategy() {
  const names = Object.keys(HARMONY_STRATEGIES);
  return names[randInt(0, names.length - 1)];
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
  // ── Clásicos ────────────────────────────────────────────────────────────
  bold: {
    name: 'bold',
    primaryS: [52, 82], primaryL: [38, 60],
    secondaryS: [22, 52], secondaryL: [40, 62],
    accentS: [42, 78], accentL: [42, 64],
    bgTintS: [6, 26],
    bgLightL: [94, 99], bgDarkL: [4, 13],
    mutedLightL: [87, 94], mutedDarkL: [11, 23],
  },
  soft: {
    name: 'soft',
    primaryS: [28, 58], primaryL: [52, 74],
    secondaryS: [18, 44], secondaryL: [52, 72],
    accentS: [28, 58], accentL: [52, 72],
    bgTintS: [4, 20],
    bgLightL: [95, 99], bgDarkL: [7, 16],
    mutedLightL: [89, 96], mutedDarkL: [14, 26],
  },
  muted: {
    name: 'muted',
    primaryS: [12, 40], primaryL: [30, 58],
    secondaryS: [8, 28], secondaryL: [36, 60],
    accentS: [14, 42], accentL: [36, 60],
    bgTintS: [2, 14],
    bgLightL: [93, 99], bgDarkL: [9, 20],
    mutedLightL: [86, 94], mutedDarkL: [17, 30],
  },
  deep: {
    name: 'deep',
    primaryS: [42, 78], primaryL: [22, 46],
    secondaryS: [22, 52], secondaryL: [26, 50],
    accentS: [38, 72], accentL: [28, 52],
    bgTintS: [12, 32],
    bgLightL: [90, 97], bgDarkL: [2, 9],
    mutedLightL: [83, 91], mutedDarkL: [7, 17],
  },
  vibrant: {
    name: 'vibrant',
    primaryS: [74, 100], primaryL: [44, 64],
    secondaryS: [48, 74], secondaryL: [46, 67],
    accentS: [68, 100], accentL: [46, 66],
    bgTintS: [8, 32],
    bgLightL: [94, 99], bgDarkL: [3, 12],
    mutedLightL: [86, 94], mutedDarkL: [11, 21],
  },
  earthy: {
    name: 'earthy',
    primaryS: [12, 38], primaryL: [26, 52],
    secondaryS: [8, 24], secondaryL: [32, 56],
    accentS: [16, 42], accentL: [32, 56],
    bgTintS: [8, 28],
    bgLightL: [88, 95], bgDarkL: [10, 22],
    mutedLightL: [80, 89], mutedDarkL: [19, 32],
  },
  pastel: {
    name: 'pastel',
    primaryS: [38, 72], primaryL: [68, 87],
    secondaryS: [28, 62], secondaryL: [68, 86],
    accentS: [38, 76], accentL: [68, 87],
    bgTintS: [12, 36],
    bgLightL: [95, 99], bgDarkL: [14, 26],
    mutedLightL: [89, 96], mutedDarkL: [24, 36],
  },
  midnight: {
    name: 'midnight',
    primaryS: [48, 82], primaryL: [48, 72],
    secondaryS: [28, 62], secondaryL: [38, 62],
    accentS: [58, 92], accentL: [48, 72],
    bgTintS: [22, 48],
    bgLightL: [93, 98], bgDarkL: [2, 10],
    mutedLightL: [84, 92], mutedDarkL: [8, 18],
  },

  // ── Nuevos ──────────────────────────────────────────────────────────────
  neon: {
    // Saturaciones extremas, fondos muy oscuros / muy blancos
    name: 'neon',
    primaryS: [88, 100], primaryL: [52, 68],
    secondaryS: [62, 88], secondaryL: [52, 70],
    accentS: [82, 100], accentL: [52, 70],
    bgTintS: [14, 38],
    bgLightL: [96, 99], bgDarkL: [2, 8],
    mutedLightL: [88, 95], mutedDarkL: [8, 16],
  },
  jewel: {
    // Saturación muy alta, luminosidad baja → colores gema (esmeralda, zafiro, rubí)
    name: 'jewel',
    primaryS: [62, 92], primaryL: [22, 42],
    secondaryS: [40, 72], secondaryL: [24, 44],
    accentS: [58, 90], accentL: [24, 44],
    bgTintS: [16, 40],
    bgLightL: [90, 96], bgDarkL: [4, 12],
    mutedLightL: [82, 90], mutedDarkL: [10, 20],
  },
  candy: {
    // Pasteles pero saturados, luminosos y dulces
    name: 'candy',
    primaryS: [58, 88], primaryL: [62, 82],
    secondaryS: [44, 74], secondaryL: [62, 82],
    accentS: [58, 90], accentL: [64, 84],
    bgTintS: [20, 46],
    bgLightL: [96, 99], bgDarkL: [10, 20],
    mutedLightL: [90, 96], mutedDarkL: [20, 32],
  },
  retro: {
    // Saturación media-alta, luminosidad media → paleta de los 70-80s
    name: 'retro',
    primaryS: [44, 72], primaryL: [42, 62],
    secondaryS: [32, 58], secondaryL: [44, 64],
    accentS: [38, 68], accentL: [44, 64],
    bgTintS: [12, 30],
    bgLightL: [88, 95], bgDarkL: [8, 18],
    mutedLightL: [80, 88], mutedDarkL: [16, 28],
  },
  mono: {
    // Saturación muy baja → casi escala de grises con tinte sutil
    name: 'mono',
    primaryS: [4, 18], primaryL: [18, 52],
    secondaryS: [2, 12], secondaryL: [30, 60],
    accentS: [6, 20], accentL: [30, 58],
    bgTintS: [1, 8],
    bgLightL: [94, 99], bgDarkL: [6, 18],
    mutedLightL: [87, 94], mutedDarkL: [16, 28],
  },
  ice: {
    // Azules fríos y blancos cristalinos, saturación baja-media
    name: 'ice',
    primaryS: [30, 65], primaryL: [55, 78],
    secondaryS: [20, 48], secondaryL: [58, 80],
    accentS: [32, 68], accentL: [56, 78],
    bgTintS: [8, 28],
    bgLightL: [95, 99], bgDarkL: [6, 16],
    mutedLightL: [89, 96], mutedDarkL: [14, 24],
  },
  fire: {
    // Rojizos, naranjas, amarillos saturados y cálidos
    name: 'fire',
    primaryS: [68, 100], primaryL: [44, 62],
    secondaryS: [48, 80], secondaryL: [46, 65],
    accentS: [62, 98], accentL: [48, 68],
    bgTintS: [10, 32],
    bgLightL: [93, 98], bgDarkL: [4, 12],
    mutedLightL: [85, 93], mutedDarkL: [10, 20],
  },
  corporate: {
    // Muy bajo contraste, profesional, conservador
    name: 'corporate',
    primaryS: [22, 52], primaryL: [26, 50],
    secondaryS: [10, 28], secondaryL: [36, 58],
    accentS: [24, 52], accentL: [34, 56],
    bgTintS: [2, 10],
    bgLightL: [96, 99], bgDarkL: [8, 16],
    mutedLightL: [90, 96], mutedDarkL: [16, 26],
  },
  aurora: {
    // Teñidos de verde/turquesa/magenta, muy saturados, fondo oscuro
    name: 'aurora',
    primaryS: [70, 100], primaryL: [50, 70],
    secondaryS: [52, 82], secondaryL: [48, 68],
    accentS: [72, 100], accentL: [50, 72],
    bgTintS: [28, 55],
    bgLightL: [92, 97], bgDarkL: [3, 10],
    mutedLightL: [83, 91], mutedDarkL: [8, 17],
  },
  chalk: {
    // Apagados, tiza, muy suaves, baja saturación + alta luminosidad
    name: 'chalk',
    primaryS: [8, 32], primaryL: [58, 78],
    secondaryS: [6, 24], secondaryL: [60, 80],
    accentS: [10, 34], accentL: [58, 78],
    bgTintS: [3, 14],
    bgLightL: [95, 99], bgDarkL: [12, 24],
    mutedLightL: [89, 96], mutedDarkL: [22, 34],
  },
};

/**
 * Elige un mood al azar para la paleta — distribución uniforme entre todos.
 * 🎛️ VIBECODING: Ajusta los pesos para favorecer estilos concretos.
 */
function pickMood() {
  const names = Object.keys(PALETTE_MOODS);
  return PALETTE_MOODS[names[randInt(0, names.length - 1)]];
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
  // ── Paso 1: Hue base ────────────────────────────────────────────────────
  // El filtro anti-verde ya NO bloquea colores — solo redirige el verde
  // tóxico chartreuse (95-130°) el 25% de las veces para mayor variedad.
  let baseHue = options.baseHue !== undefined ? options.baseHue : rand(0, 360);
  if (options.baseHue === undefined && baseHue > 95 && baseHue < 130 && Math.random() < 0.25) {
    baseHue = Math.random() > 0.5 ? rand(148, 175) : rand(52, 82);
  }

  // ── Micro-variación global ───────────────────────────────────────────────
  // Multiplicador aleatorio que amplifica o reduce la saturación de TODA la paleta
  // Rango: 0.70 (apagado) ↔ 1.35 (potenciado) — produce paletas muy distintas
  // con los MISMOS parámetros de mood.
  const satTwist = rand(0.72, 1.32);
  const litTwist = rand(0.92, 1.08); // pequeña variación de luminosidad global
  /** Aplica micro-variación a un valor de saturación clampado a [1, 100]. */
  const twistS = (s) => Math.min(100, Math.max(1, s * satTwist));
  const twistL = (l) => Math.min(98, Math.max(2, l * litTwist));

  // ── Paso 2: Estrategia de armonía ───────────────────────────────────────
  const strategyName = options.strategyName || pickHarmonyStrategy();
  const strategy = HARMONY_STRATEGIES[strategyName];
  const { secondaryHue, accentHue } = strategy(baseHue);

  // ── Paso 2.5: MOOD de la paleta ─────────────────────────────────────────
  const mood = options.moodName ? PALETTE_MOODS[options.moodName] : pickMood();

  // ── Paso 3: Generar PRIMARY según el mood ───────────────────────────────
  const primary = {
    h: baseHue,
    s: twistS(rand(mood.primaryS[0], mood.primaryS[1])),
    l: twistL(rand(mood.primaryL[0], mood.primaryL[1])),
  };

  // ── Paso 6: Generar DESTRUCTIVE ─────────────────────────────────────────
  const destructiveHue = Math.random() > 0.5 ? rand(330, 360) : rand(0, 30);
  const destructive = {
    h: destructiveHue,
    s: rand(Math.min(90, mood.primaryS[0] + 15), 100),
    l: rand(Math.max(35, mood.primaryL[0] - 10), Math.min(65, mood.primaryL[1] + 10)),
  };

  // ── Paso 4: Generar SECONDARY ───────────────────────────────────────────
  const secondaryBase = {
    h: secondaryHue,
    s: twistS(rand(mood.secondaryS[0], mood.secondaryS[1])),
    l: twistL(rand(mood.secondaryL[0], mood.secondaryL[1])),
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
    s: twistS(rand(mood.accentS[0], mood.accentS[1])),
    l: twistL(rand(mood.accentL[0], mood.accentL[1])),
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

  // ── Tintes para fondos y texto ──────────────────────────────────────────
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
  'Obsidian', 'Neon', 'Infrared', 'Ultraviolet', 'Prismatic', 'Halcyon',
  'Cobalt', 'Crimson', 'Amber', 'Jade', 'Ivory', 'Onyx', 'Ash',
  'Twilight', 'Galactic', 'Nebula', 'Phantom', 'Spectral', 'Holo',
  'Savage', 'Raw', 'Deep', 'Pale', 'Vivid', 'Dim', 'Lush', 'Burnt',
  'Chrome', 'Matte', 'Gloss', 'Satin', 'Cyber', 'Retro', 'Pastel',
  'Noire', 'Sepia', 'Monochrome', 'Candy', 'Toxic', 'Acid', 'Ghost',
  'Prism', 'Opal', 'Blaze', 'Frost', 'Storm', 'Wave', 'Drift',
];

const NOUNS = [
  'Dawn', 'Wave', 'Pulse', 'Storm', 'Bloom', 'Drift', 'Glow', 'Spark',
  'Echo', 'Haze', 'Tide', 'Flare', 'Shade', 'Crest', 'Veil', 'Mist',
  'Peak', 'Void', 'Aura', 'Flux', 'Core', 'Edge', 'Depth', 'Trace',
  'Beam', 'Rift', 'Surge', 'Blaze', 'Flow', 'Dust',
  'Signal', 'Layer', 'Portal', 'Orbit', 'Canvas', 'Prism', 'Spectrum',
  'Horizon', 'Zenith', 'Nadir', 'Apex', 'Root', 'Branch', 'Leaf',
  'Stone', 'Sand', 'Glass', 'Wire', 'Grid', 'Node', 'Link', 'Arc',
  'Dusk', 'Noon', 'Ember', 'Ash', 'Frost', 'Rain', 'Snow', 'Wind',
  'Sea', 'Sky', 'Earth', 'Fire', 'Ice', 'Lava', 'Fog', 'Hue',
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
