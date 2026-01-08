# Design System: Modern Heritage v1.1

**Concepto:** Estética clásica (papel/tinta) con rendimiento moderno.
**Regla de Oro:** Ante cualquier duda de implementación, consultar la documentación oficial de Astro, Svelte y Tailwind para aplicar las mejores prácticas vigentes y evitar deuda técnica.

---

## 1. Paleta de Colores (OKLCH)

| Token | Light Mode (Paper) | Dark Mode (Ink) | Uso |
| :--- | :--- | :--- | :--- |
| `--bg-base` | `oklch(98% 0.01 70)` | `oklch(15% 0.02 250)` | Fondo principal. |
| `--bg-surface` | `oklch(94% 0.02 70)` | `oklch(20% 0.03 250)` | Cards y secciones. |
| `--text-main` | `oklch(25% 0.02 250)` | `oklch(95% 0.01 70)` | Cuerpo de texto. |
| `--brand-ink` | `oklch(45% 0.12 250)` | `oklch(70% 0.10 250)` | Títulos y marca. |
| `--accent-gold` | `oklch(75% 0.15 80)` | `oklch(80% 0.12 85)` | Destacados y CTAs. |

---

## 2. Sistema de Grilla y Espaciado (Layout)

* **Contenedor Máximo:** `1280px`.
* **Escala Rítmica (Múltiplos de 4px):**
    * `space-xs`: 4px | `space-sm`: 8px | `space-md`: 16px | `space-lg`: 24px | `space-xl`: 32px.
* **Uso:** Evitar valores arbitrarios (ej. `mt-[13px]`). Usar siempre la escala definida.

---

## 3. Estados de Interacción (Action Tokens)

* **Hover:** Aumento/Disminución de Luminosidad (L) en un 5% mediante utilidades de Tailwind v4.
* **Focus:** Anillo de `2px` sólido `--color-accent-gold` con `offset-2`. **Obligatorio para accesibilidad.**
* **Disabled:** Opacidad al 40% y `pointer-events-none`. Los libros agotados aplican `grayscale(100%)` a la portada.

---

## 4. Tipografía y Componentes

* **Títulos:** Serif (Playfair Display / Lora).
* **Cuerpo:** Sans (Inter / Geist).
* **BookCard:** Aspect ratio `2/3`, radio de borde mínimo (`rounded-sm`).
* **Micro-interacciones:** Uso de Svelte Transitions (`fly`, `fade`) y View
* Transitions API (`ClientRouter`) para el morphing de portadas.

---

## 5. Mejoras Continuas y Estándares
* **Documentación:** Es imperativo revisar la documentación de **Astro**, **Svelte** y **Tailwind** antes de cada fase para asegurar el uso de *Runes*, *Server Islands* y *Oxide Engine* según las últimas recomendaciones.
* **A11y:** Mantener contraste WCAG AA y etiquetas ARIA en islas interactivas (Carrito/Buscador).

---

## 6. Protocolo de Accesibilidad Radical (A11y)

Para cumplir con **WCAG 2.1 AA**, cada componente debe seguir estas reglas:

* **Reducción de Movimiento:**
    * Todas las transiciones de Svelte y el `ClientRouter` deben envolverse en una comprobación de `prefers-reduced-motion`. Si está activo, el movimiento se sustituye por un `fade` simple o desaparición instantánea.
* **Gestión de Foco en Islas:**
    * **Cart & Search:** Al abrirse, el foco debe saltar al primer elemento interactivo. Se debe implementar *Focus Trapping* mediante librerías livianas o lógica nativa.
    * Al cerrar, el foco debe volver al botón que originó la acción.
* **Semántica y Lectores de Pantalla:**
    * **Imágenes:** Las portadas de libros deben tener un `alt` descriptivo: `Portada del libro [Título] de [Autor]`.
    * **Estados Dinámicos:** El contador del carrito debe usar `aria-live="polite"` para anunciar cuando se suma un ítem.
* **Formularios:**
    * El buscador debe tener un `<label>` asociado (aunque sea oculto visualmente con `sr-only`) para que los lectores de pantalla identifiquen el propósito del input.

---

