# 📚 High-Performance Bookstore Engine

Este repositorio contiene la arquitectura, base de datos y lógica de negocio para una librería de alto rendimiento optimizada para el mercado paraguayo.

## 🚀 Filosofía del Proyecto
Diseñado bajo el estándar de **Zero-JS by default** usando Astro 5, Svelte 5 y una arquitectura de islas granular para garantizar un **Lighthouse Score de 100/100**.

### Módulos Implementados
* **🛒 Catálogo Reactivo:** Filtrado instantáneo por precio, autor, idioma y categoría usando **Svelte 5 Runes** (`$state`, `$derived`) sin recargas de página.
* **⚙️ Backoffice (Admin):** Panel de gestión completo con **CRUD de productos**, control de stock rápido y gestión de imágenes.
* **📦 Logística Visual:** Sistema de semáforo para pedidos: *Pendiente* ➝ *Pagado* ➝ *Por Enviar/Retirar* ➝ *Completado*.
* **📲 WhatsApp Engine:** Generación de leads con validación de stock en tiempo real y detección de modo "Regalo" 🎁.

---

## 📖 Fuente Única de la Verdad (SSOT)
Para evitar ambigüedades y discrepancias, el proyecto se rige estrictamente por la siguiente documentación técnica:

1.  **[Ideación](./docs/ideacion.md):** Visión de negocio, objetivos de conversión y stack tecnológico.
2.  **[Blueprint](./docs/blueprint.md):** Arquitectura técnica, estándares de Svelte 5 (Runes) y diseño (Tailwind v4).
3.  **[Roadmap](./docs/roadmap.md):** Plan de ejecución y estado actual del desarrollo.
4.  **[Design System](./docs/design_system.md):** Tokens de color (OKLCH), tipografía y guías de accesibilidad.
5.  **[Visibilidad](./docs/visibility.md):** Estrategia de SEO, Local SEO (GEO) y optimización para IA (AIO).
6.  **[Base de Datos](./docs/db_schema.sql):** Esquema oficial **v5.5** (PostgreSQL/Supabase) con RLS Policies y Enums.
7.  **[Datos Semilla](./docs/seed.sql):** Datos iniciales y catálogo de prueba.
8.  **[Manual Administrativo](./docs/admin.md):** Guía operativa para usuarios no técnicos (incluye gestión de estados).

---

## 🛠 Stack Tecnológico
* **Orquestador:** Astro 5 (Hybrid Mode + ClientRouter).
* **Interactividad:** Svelte 5 (Runes Mode) para islas complejas (`CatalogFilter`, `AdminPanel`).
* **Estilos:** Tailwind v4 (OKLCH, CSS-first).
* **Backend:** Supabase (PostgreSQL + Auth + Storage).
* **Estado Cliente:** Nano Stores (Persistencia en Carrito).
* **Validación:** Zod (Astro Actions).

---

## 📋 Reglas de Oro para Desarrolladores
* **Rendimiento:** Ninguna isla de Svelte debe cargarse (`client:load`) si el contenido puede ser HTML estático, salvo el Buscador y el Admin.
* **Integridad:** Las validaciones de stock y creación de pedidos deben ocurrir exclusivamente en **Astro Actions** (Server-Side).
* **UX:** Prohibido el Cumulative Layout Shift (CLS); usar Skeletons para cada Server Island.
* **Semántica:** El estado del pedido (`order_status`) respeta estrictamente los ENUMs de la base de datos.

---

## ⚡ Inicio Rápido
1.  `npm install -g pnpm` (si no lo tienes).
2.  `pnpm install`
3.  Configurar `.env` con las claves de Supabase.
4.  `pnpm run dev`
