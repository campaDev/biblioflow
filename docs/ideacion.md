# Technical Spec: Proyecto Librería High-Performance

**Versión:** 5.1
**Fecha:** 07-01-2026
**Autor:** Hugo (Lead Engineer)
**Stack:** Astro 5 (Server Islands) + Tailwind v4 + Supabase
**Estándares:** OKLCH Colors | Semantic HTML5 | WCAG 2.1 AA | Lighthouse 100
**Diferenciales:** View Transitions | Dynamic OG Images | Stock Recovery

---

## 1. Visión del Producto & Filosofía Técnica
Desarrollar una plataforma de comercio electrónico que redefina la experiencia de compra de libros en Paraguay.
* **Velocidad:** Latencia de interacción cercana a cero (Edge Computing).
* **Deleite (Delight):** Transiciones fluidas tipo App nativa y feedback visual inmediato.
* **Conversión:** Embudo optimizado hacia WhatsApp con validación de stock en tiempo real y generación dinámica de assets sociales.

---

## 2. Arquitectura de Software

### 2.1 Frontend: Astro 5 + Svelte 5 (Runes Mode)
* **Reactivity:** Uso de Svelte 5 para islas de interactividad ultra-ligeras.
* **State Management:** Nano Stores para persistencia (Carrito) y `$state/$derived` para lógica local de componentes.
* **CSS:** Tailwind v4 (Oxide engine) configurado mediante variables CSS/OKLCH.

### 2.2 UX Motion & Transitions
* **API:** `astro:transitions` (Componente: ClientRouter).
* **Implementación:** Animaciones de "morph" compartidas entre la portada del listado y la ficha del producto. Persistencia de scroll al navegar.

### 2.3 Sistema de Diseño (Tailwind v4)
* **CSS-First:** Configuración vía `@theme`.
* **Colorimetría:** Uso exclusivo de espacio de color **OKLCH** para gamas perceptualmente uniformes y adaptación automática a Dark Mode.
* **Carga Progresiva:** Implementación de **BlurHash** para placeholders de imágenes.

### 2.4 Social Selling Engine
* **Tecnología:** Satori + Resvg.
* **Endpoint:** `/og/[slug].png`.
* **Función:** Genera imágenes para compartir en WhatsApp que incluyen dinámicamente: Portada + Precio Actual + Badge de Oferta.

### 2.5 Observabilidad & Analítica
* **Vercel Analytics:** Activado para métricas de tráfico y Web Vitals en tiempo real sin impacto en performance.
* **Error Boundary:** Captura de errores en componentes críticos (ej: si falla la carga del precio) para mostrar UI de fallback suave en lugar de romper la página.
### 2.6. Stack Tecnológico Principal
* **Orquestador:** Astro 5 (Server Islands + Actions).
* **Interactividad:** Svelte 5 (Runes).
* **Base de Datos & Auth:** Supabase.
* **Estilos:** Tailwind v4 (OKLCH Colors).

---

## 3. Modelo de Datos (Schema Supabase/Postgres)

### A. Catálogo Core & Metadatos
* **`products`**:
    * `id`, `isbn`, `slug` (indexado), `title`, `author`.
    * `price` (int), `promotional_price` (int, nullable).
    * `stock_qty` (int).
    * `status`: 'active', 'draft', 'preorder', 'archived'.
    * `blurhash` (string): Hash visual para carga inmediata.
    * `specs` (JSONB): Detalles técnicos (páginas, editorial, idioma).
* **`product_images`**: Galerías adicionales.

### B. Estrategia de Combos (Virtual Bundles)
* **`bundles`**: Definición del combo (Título, Precio Oferta). **Sin stock físico.**
* **`bundle_items`**: Relación de composición (`bundle_id`, `product_id`, `qty`).
    * *Lógica:* Stock Combo = `Min(Stock Componentes)`.

### C. Gestión de Leads y Operaciones
* **`orders_leads`**:
    * `id`, `created_at`.
    * `customer_data` (JSON): { nombre, ciudad, telefono }.
    * `cart_snapshot` (JSONB): Evidencia de precios al momento del click.
    * `is_gift` (bool): Flag para logística.
    * `shipping_method`: 'pickup', 'delivery'.
    * `status`: 'pending_whatsapp', 'confirmed', 'cancelled'.
* **`restock_requests`**:
    * `id`, `product_id`, `customer_contact`.
    * *Uso:* Inteligencia de negocio para reposición de inventario.

### D. Seguridad & Roles (Auth)
* **`profiles`**: Tabla vinculada a `auth.users` de Supabase.
    * `id`, `role`: 'admin' | 'customer'.
* **RLS Policies:**
    * `products`: Public Read / Admin Write.
    * `orders_leads`: Admin Read-Only (desde el dashboard).

---

## 4. Solución a Escenarios de Negocio (Business Logic)

### 4.1 Validación de Stock "Just-in-Time" (Concurrency)
1.  **Navegación:** El usuario agrega al carrito (Local).
2.  **Checkout:** Al intentar generar el WhatsApp, se dispara una *Server Action*.
3.  **Check:** Verifica si `stock_qty >= cantidad_solicitada`.
    * *Éxito:* Crea el registro en `orders_leads` y permite el envío.
    * *Fallo:* Muestra Toast de error y sugiere unirse a la lista de espera (`restock_requests`).

### 4.2 Lógica de Promociones
* Frontend compara `price` vs `promotional_price`.
* Si hay descuento, calcula y muestra badge: `Math.round((1 - promo/price) * 100) + '% OFF'`.

### 4.3 Experiencia de Regalo & Pre-venta
* **Regalo:** Checkbox en checkout agrega "🎁 PARA REGALO" al script de WhatsApp.
* **Pre-venta:** Si `status === 'preorder'`, el botón cambia a "Reservar" y permite comprar sin validar stock positivo (o valida contra un cupo límite).

### 4.4 Búsqueda Fuzzy
* Implementación de búsqueda en Postgres (`websearch_to_tsquery` o `pg_trgm`) para tolerar errores tipográficos ("Harry Poter").

### 4.5 UX Desktop: Fallback de WhatsApp
* Detectar User Agent. Si es Desktop, mostrar junto al botón de WhatsApp un botón secundario (icono de copiar): **"Copiar detalles del pedido"**.
* Esto permite al usuario pegar el texto en WhatsApp Web manualmente si la redirección automática falla o molesta.

### 4.6 SEO Técnico & Rich Snippets
* **Schema.org:** Implementación de esquemas JSON-LD de tipo `Book` y `Product` en las fichas de libros.
* **Dynamic Metadata:** Gracias a las **Server Islands**, los motores de búsqueda indexarán el precio real y la disponibilidad (`InStock` / `OutOfStock`) directamente desde los datos frescos de Supabase.
---
## 5. Módulo de Administración (Backoffice)
**Nueva Sección Crítica.** El dueño no debe tocar la base de datos directamente.

* **Ruta:** `/admin` (Protegida por Middleware de Astro + Supabase Auth).
* **Features del Dashboard:**
    1.  **Gestión de Pedidos (Tabla Interactiva):**
        * Visualización tabular con ordenamiento cronológico.
        * **Badges de Estado:** Sistema visual de semáforo (Pendiente, Pagado, Envíos, Retiros).
        * **Modal de Detalle:** Vista rápida del cliente, lista de productos y botón directo a WhatsApp pre-configurado.
    2.  **Inventario CRUD Completo:**
        * **Create/Edit:** Modal unificado para crear libros o editar existentes (incluyendo estados: Borrador/Archivado).
        * **Quick Stock:** Botones `[+] [-]` en la lista para ajustes rápidos de inventario físico.
        * **Validación:** Protección contra borrado de productos que tienen pedidos históricos asociados (Integridad Referencial).

---

## 6. Accesibilidad (A11y) & Semántica
* **HTML:** Uso estricto de `<main>`, `<article>`, `<section>`, `<aside>`, `<dl>`.
* **Imágenes:** Atributos `alt` descriptivos obligatorios.
* **Navegación:** Focus Trap en modales y carrito. Skip Links presentes.
* **Testing:** Auditoría con Lighthouse y lectores de pantalla (NVDA/VoiceOver).

---

## 7. Hoja de Ruta de Implementación (Roadmap)

1.  **Foundation:** Init Astro 5 + Tailwind 4. Configurar ESLint (A11y plugin).
2.  **Design System:** Definir variables OKLCH y tipografía.
3.  **Backend:** Setup Supabase, tablas SQL y Policies (RLS).
4.  **Core UI:** Layouts, Tarjetas de Producto (con View Transitions).
5.  **Logic:**
    * Integración de Nano Stores (Carrito).
    * Server Islands (Precios/Stock).
    * Cálculo de Combos Virtuales.
6.  **Advanced Features:**
    * Generador de WhatsApp Script.
    * OG Image Generation (Satori).
    * Buscador Fuzzy.
7.  **QA & Launch:** Lighthouse 100/100, Deploy en Vercel.

---

## 8. Anexo: Seguridad y Operaciones (Infraestructura)

### 8.1 Extensiones de Base de Datos (Postgres)
Para garantizar la búsqueda insensible a acentos en español:
* Activar `CREATE EXTENSION unaccent;`.
* Activar `CREATE EXTENSION pg_trgm;`.
* *Query de Búsqueda:* `WHERE unaccent(title) ILIKE unaccent('%termino%')`.

### 8.2 Protección de API (Security)
* **Rate Limiting:** Implementar límite de peticiones en las Server Actions de checkout (máx 5 intentos/min por IP) para evitar ataques de fuerza bruta al inventario.
* **Storage Policies:** Configurar buckets de Supabase como "Public Read" pero "Authenticated Write Only" (solo el admin puede subir).

### 8.3 Optimización y Resiliencia de Assets
* **Client-side Compression:** Compresión en el navegador antes de la subida (WebP, 80% calidad, max-width 1200px).
* **Fallback Visual (Anti-Pattern de Imagen Rota):** En caso de error 404 en la URL de la portada, el componente `<Image />` de Astro disparará un respaldo dinámico.
* **Generación Dinámica:** El fallback renderizará una portada CSS/SVG con un gradiente basado en la categoría y el título del libro en texto real, manteniendo la estética premium aunque falte el archivo físico.

### 8.4 Legal & Trust
* Incluir páginas estáticas básicas: `/privacidad` y `/terminos`. Aunque sea un negocio pequeño, es necesario para cumplir normativas si en el futuro activamos pagos online.

### 8.5 Resiliencia de Catálogo
* **Dynamic Fallbacks:** Implementación de un generador de portadas CSS para productos sin imagen definida, asegurando una UI pulida en el 100% de los casos.
* **Server Island Fallbacks:** Uso de Skeletons nativos de Astro (`slot="fallback"`) para evitar Cumulative Layout Shift (CLS) durante la hidratación de precios.
