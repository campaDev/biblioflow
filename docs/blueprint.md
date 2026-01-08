# Architecture Blueprint v2.2 (Svelte + Astro 5 Edition)

**Estado:** En Desarrollo
**Stack:** Astro 5 (Node Adapter), Svelte 5, Tailwind v4, Nano Stores, Supabase.

---

## 1. Mapa de Componentes e Islas

Arquitectura híbrida: Shell estático + Islas interactivas + Islas de Servidor.

| Componente | Archivo | Tipo | Hidratación | Estrategia |
| :--- | :--- | :--- | :--- | :--- |
| **Layout Base** | `BaseLayout.astro` | Estático | N/A | View Transitions |
| **Buscador** | `Search.svelte` | Isla | `client:idle` | Fetch a demanda |
| **Precio y Stock** | `PriceStatus.astro` | Server Island | `server:defer` | Datos frescos (No-JS) |
| **Botón Compra** | `AddButton.svelte` | Isla | `client:visible` | Interacción local |
| **Carrito** | `CartDrawer.svelte` | Isla | `client:only` | Persistencia Local |
| **Admin Panel** | `AdminPanel.svelte` | Isla | `client:load` | SPA dentro de Astro |

---

## 2. Gestión de Estado Global (Nano Stores)

Ubicación: `src/lib/stores.ts`

* **`$cartItems` (persistentAtom):** Array de productos en `localStorage`.
* **`$isCartOpen` (atom):** Booleano para abrir/cerrar el Drawer.
* **`$user` (atom):** Sesión del Admin (Middleware).

---

## 3. Acciones del Servidor (Astro Actions)

Ubicación: `src/actions/index.ts`

1. **`searchProducts`**: Búsqueda Full Text Search (FTS) usando índices `gin` de Postgres.
2. **`createOrder`**:
   - Valida stock en tiempo real.
   - Crea registro en `orders_leads`.
   - Soporta flag `is_gift` para logística.
3. **`createProduct`**:
   - Generación automática de `slug`.
   - Validación Zod estricta (incluye `language` y `description`/sinopsis).

---

## 4. Diseño y Estética (Tailwind v4 + OKLCH)

Ubicación: `src/styles/global.css`

Utilizaremos la configuración nativa de CSS para Tailwind v4:

```css
@import "tailwindcss";

@theme {
  /* Paleta basada en OKLCH para consistencia visual */
  --color-brand-primary: oklch(55% 0.15 250); /* Azul tinta */
  --color-brand-accent: oklch(80% 0.12 70);   /* Dorado/Papel viejo */
  
  /* Superficies */
  --color-surface-base: oklch(98% 0.01 250);
  --color-surface-dark: oklch(25% 0.02 250);
}

/* Transiciones de Client Router API */
::view-transition-old(book-cover),
::view-transition-new(book-cover) {
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
}
```
## 5. Estructura de Archivos (Directorio)
```plaintext
/
├── src/
│   ├── actions/        # Lógica de servidor (Astro Actions)
│   ├── components/
│   │   ├── ui/         # Componentes Astro (Botones, Inputs)
│   │   ├── server/     # Server Islands (PriceStatus.astro)
│   │   └── islands/    # Componentes Svelte (CartDrawer, AdminPanel)
│   ├── layouts/        # BaseLayout con View Transitions (<ClientRouter/>)
│   ├── lib/            # supabase.ts, stores.ts, utils.ts
│   ├── pages/          # Rutas (index, libros/[slug], admin)
│   └── styles/         # global.css (Tailwind v4)
├── public/             # Assets estáticos
└── astro.config.mjs    # Integración Svelte, Tailwind y Node Adapter

```

## 6. Estándar de Componentes (Svelte 5 Runes)
Para garantizar el máximo rendimiento y tipado:

* **Props:** Uso estricto de `$props()` -> `let { item, active } = $props();`
* **Estado local:** Uso de `$state()` en lugar de variables simples para reactividad.
* **Derivados:** Uso de `$derived()` para cálculos automáticos (ej. total del carrito).
* **Efectos:** Minimizar el uso de `$effect()`, priorizando lógica derivada.

## 7. Estrategia de Carga y Fallbacks (UX)
Todos los componentes con `server:defer` deben incluir un slot de fallback:

* **PriceStatus.astro:** Renderizar un Skeleton (bloque gris con `animate-pulse`) que replique exactamente las dimensiones del precio final para evitar CLS.

## 8. Accesibilidad (A11y)
* **Adaptador:** `@astrojs/node` instalado para soporte de `server:defer`.
* **Roles ARIA:** `CartDrawer` usa un `div` con `role="dialog"`, gestión de foco atrapado y cierre con tecla `Escape`.
* **Botones Iconográficos:** Todos incluyen `aria-label` explícito.
