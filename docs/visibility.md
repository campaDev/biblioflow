# Estrategia de Visibilidad (SEO, GEO, AIO)

**Objetivo:** Maximizar el alcance orgánico y la relevancia en búsquedas locales y asistidas por IA.

---

## 1. SEO Semántico y Técnico
* **Rutas Amigables:** `/libros/[categoria]/[slug]` (La categoría en la URL mejora el contexto).
* **Componente SEO.astro:** Un componente único que gestione:
    * `Canonical tags` para evitar contenido duplicado.
    * `Open Graph` y `Twitter Cards` dinámicos.
    * `JSON-LD (Schema.org)` de tipo `Book` y `Product`.
* **Sitemaps:** Generación automática vía `@astrojs/sitemap`.

---

## 2. GEO: Estrategia Local (Paraguay)
* **Local Business Schema:** Definir coordenadas, dirección (si aplica) y área de servicio (Paraguay completo).
* **Palabras Clave Geográficas:** Inclusión natural de "Librería en Paraguay", "Envíos a todo el país" en los metadatos de la Home.
* **Integración Google My Business:** Vincular la web con el perfil local para aparecer en el "Local Pack".

---

## 3. AIO: Optimización para Motores de IA
* **Estructura Predictiva:** Mantener un HTML 100% semántico (`<article>`, `<section>`, `<aside>`). Las IAs prefieren HTML limpio sobre divs anidados.
* **FAQ Schema:** Implementar preguntas frecuentes en las fichas de libros (ej. "¿Hacen envíos a Ciudad del Este?") para capturar búsquedas conversacionales.
* **Veracidad de Datos:** Uso de Server Islands para asegurar que la IA lea precios y stock **reales**, no cacheados.

---

## 4. Estrategia de Imágenes Dinámicas (Social SEO)
* **Dynamic OG:** Generación automática de imágenes de previsualización para redes sociales que incluyan:
    * Portada del libro.
    * Precio actual.
    * Badge de "Envío Gratis" o "En Stock".

---

## 5. Rendimiento y Crawling (Técnico)
* **Robots.txt:** Configurar para permitir el indexado de `/libros/*` y `/categorias/*`, pero bloquear estrictamente `/admin/*` y rutas con parámetros de filtrado duplicado.
* **Cache de OG Images:** Las imágenes dinámicas generadas tendrán un TTL (Time To Live) de 1 mes en Edge Cache para garantizar una previsualización inmediata en redes sociales.
* **Priority Hints:** El componente SEO aplicará `fetchpriority="high"` a la imagen de portada en la página de detalle para optimizar el LCP.
---
## 6. Sincronización AIO (LLM-Ready)
* **Semantic Consistency:** Asegurar que los nombres de los autores y títulos en los microdatos coincidan exactamente con el texto visible, para que los modelos de lenguaje (como GPT-4 o Perplexity) no encuentren discrepancias al indexar el sitio mediante navegación.
