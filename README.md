# 🎨 Armonic Themes

**Armonic Themes** es un generador inteligente de sistemas de color enfocado en el desarrollo Frontend y el diseño UI/UX. 

En lugar de generar solo colores base aleatorios, esta herramienta construye una **paleta semántica completa de 14 colores** (Primary, Secondary, Accent, Destructive, Muted, Backgrounds, etc.) garantizando siempre una armonía visual premium y un contraste accesible según las normativas **WCAG**.

🌐 **Demo en vivo:** [https://themes.devcito.org](https://themes.devcito.org)

---

## ✨ ¿Qué hace este sistema a detalle?

El núcleo de la aplicación es un algoritmo matemático basado en el espacio de color **HSL (Hue, Saturation, Lightness)** que realiza lo siguiente:

1. **Generación de Semántica de UI:** Crea de forma inteligente las 14 variables esenciales que todo Design System moderno requiere.
2. **Armonía Científica:** Utiliza relaciones de la teoría del color (Análoga, Complementaria, Triádica, Tetrádica, etc.) para garantizar combinaciones estéticas y evitar choques visuales o tonos "tóxicos".
3. **Contraste Accesible (WCAG):** Cada color de fondo (`background`, `primary`, `destructive`, etc.) calcula automáticamente su contraparte de texto (`foreground`) garantizando siempre legibilidad (ej: si el `primary` es muy claro, su texto será oscuro).
4. **Dark Mode Premium Desacoplado:** A diferencia de una simple inversión de colores, el algoritmo de Dark Mode genera tonos oscuros profundamente ricos al teñir ligeramente los grises con el color principal del tema. 
5. **Exportación Lista para Producción:** El sistema traduce la paleta generada a código nativo que puedes copiar y pegar. Soporta:
   - **Tailwind CSS v4** (Nuevo formato integrado en `@theme`)
   - **Tailwind CSS v3** (Configuración tradicional en `tailwind.config.js`)
   - **CSS Nativas** (Variables `--var` en un pseudo-selector `:root`)
6. **Persistencia Local:** Puedes guardar tus paletas favoritas en el navegador (`localStorage`) para recuperarlas en futuras sesiones.

---

## 🚀 Tecnologías

Este proyecto está construido priorizando el rendimiento, el SEO y la velocidad de carga (0 dependencias de cliente pesadas):
- **[Astro](https://astro.build/)**: Framework web hiper-optimizado para sitios estáticos.
- **Vanilla JavaScript**: Toda la lógica matemática del color y la interactividad del DOM.
- **CSS Moderno**: Glassmorphism avanzado, animaciones fluidas y layouts complejos en grid/flex.

---

## 🛠️ Instrucciones de Compilación y Ejecución

Para ejecutar o compilar este proyecto localmente, necesitas tener instalado [Node.js](https://nodejs.org/) y el gestor de paquetes **pnpm** (o npm/yarn/bun).

### 1. Clonar e Instalar dependencias
Abre tu terminal, ubícate en la raíz del proyecto y ejecuta:

```bash
pnpm install
```

### 2. Desarrollo Local
Para iniciar un servidor de desarrollo con recarga rápida (Hot-Reloading):

```bash
pnpm run dev
```
La aplicación estará disponible en `http://localhost:4321`.

### 3. Compilación para Producción (Build)
El proyecto está configurado para generar un sitio estático súper optimizado. En lugar del directorio `/dist` por defecto de Astro, **el build se exportará a la carpeta `/docs`** (esta configuración es ideal para alojarlo directamente desde la rama `main` en **GitHub Pages**).

```bash
pnpm run build
```
Al finalizar, el bundler (Vite) agrupará el HTML, CSS y JavaScript minificado dentro de la carpeta `/docs`.

### 4. Previsualizar el Build
Si quieres probar localmente lo que se acaba de compilar en la carpeta `/docs` (simulando un servidor en producción real):

```bash
pnpm run preview
```

---

## 👨‍💻 Autor
Creado con ♥ por **[Devcito](https://devcito.org)**.
