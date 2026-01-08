# Roadmap de Implementación: Librería High-Performance v1.0

## Fase 1: Entorno y Cimientos (Día 1)
* [X] **Init & Config:**
* [X] Ejecutar `pnpm create astro@latest` (Empty, TS Strict).
    * [X] Instalar integraciones: `pnpm astro add svelte tailwind`.
    * [X] Instalar dependencias adicionales: `pnpm add nanostores @nanostores/persistent`.
* [X] **Database Setup:**
    * [X] Correr `db_schema.sql` en el Dashboard de Supabase.
    * [X] Correr `seed.sql` para tener datos de prueba.
* [X] **Design Tokens (Tailwind v4):**
    * [X] Configurar `@theme` en `src/styles/global.css` con variables OKLCH.
    * [X] Importar tipografías (Google Fonts o locales).

## Fase 2: Estructura Estática y Resiliencia (Día 2-3)
* [X] **Layout & Core UI:**
    * [X] Crear BaseLayout.astro con el componente <ClientRouter /> importado de astro:transitions.
    * [X] Crear `BookCover.astro`: implementar lógica de fallback (si no hay imagen, generar SVG con gradiente y título).
* [X] **Data Fetching:**
    * [X] Crear `src/lib/supabase.ts` para el cliente de BD.
    * [X] Implementar `getStaticPaths` en `src/pages/libros/[slug].astro` (Detalle de Producto).
    * [X] Implementar `getStaticPaths` en `src/pages/categorias/[slug].astro` (Listado por Categoría).

* [ ] **SEO & Metadata:**
    * [X] Crear componente `SEO.astro` para inyectar JSON-LD (`Book`, `Product`).
    * [ ] Configurar endpoint de API para Dynamic OG Images (Satori).

## Fase 3: Islas e Interactividad (Día 4-5)
* [X] **Estado Global:**
    * [X] Crear `src/lib/stores.ts` con `$cart` y `$uiState`.
* [X] **Componentes Svelte 5 (Runes):**
    * [X] `AddButton.svelte`: Feedback reactivo.
    * [X] `CartButton.svelte` & `CartDrawer.svelte`: Drawer, cálculos y persistencia.
    * [X] `Search.svelte`: Input con debounce y Astro Actions.
* [X] **Backend Actions:**
    * [X] Implementar `actions.searchProducts` con validación Zod y consulta FTS a Supabase.

* [ ] **Performance (Server Islands):**
    * [X] Crear `PriceStatus.svelte` con `server:defer`.
    * [ ] Crear Skeletons CSS en `global.css` para el `slot="fallback"`.

## Fase 4: Lógica de Negocio y Conversión (Día 6)
* [X] **Astro Actions:**
    * [X] Implementar `processWhatsAppOrder`: Validar stock en Supabase y crear registro en `orders_leads`.
    * [X] Configurar RLS/Permisos en Supabase para permitir inserts públicos.
    * [] Añadir Rate Limiting básico para evitar spam de pedidos.
* [X] **WhatsApp Engine:**
    * [X] Crear utilidad para generar el link de WA: `https://wa.me/...&text=Hola, quiero [Lista de Libros]...`.
    * [X] Añadir lógica de "Modo Regalo" (🎁) al texto final.

## Fase 5: Admin y Lanzamiento (Día 7)
* [X] **Seguridad:**
    * [X] Crear `src/middleware.ts` para proteger la ruta `/admin`.
    * [X] Fix RLS Policies: "Authenticated users can read profiles".
* [X] **Admin Dash:**
    * [X] `AdminPanel.svelte`: Tabla de pedidos con cambio de estados (Logística).
    * [X] **CRUD Productos:** Crear, Editar y Eliminar (Soft Delete/Archivado).
    * [X] **Modal de Pedidos:** Visualización de detalle y link a WhatsApp.
    * [X] **Gestión de Estados:** Pendiente -> Pagado -> Enviado -> Completado.
## Fase 6: QA y Lanzamiento
* [ ] **Final QA:**
  * [ ] **Auditoría:**
    * [ ] Probar View Transitions entre listado y detalle.
    * [ ] Correr auditoría Lighthouse (Objetivo: 100/100 en Performance/SEO).
  * [ ] **Rate Limiting:**
    * [ ] Agregar protección básica contra spam en `createOrder`.
