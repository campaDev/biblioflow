-- =============================================================================
-- SEED DATA: LIBRERÍA HIGH-PERFORMANCE (FINAL VERSION)
-- OBJETIVO: Estructura comercial completa + Casos de prueba técnicos.
-- =============================================================================

BEGIN;

-- 1. CATEGORÍAS (ORGANIZACIÓN OPTIMIZADA)
-- Separamos "Fe" de "Autoayuda" para mejorar la conversión.
INSERT INTO public.categories (name, slug) VALUES
('Desarrollo Personal', 'desarrollo-personal'),     -- Productividad, Liderazgo
('Espiritualidad y Religión', 'espiritualidad-religion'), -- Biblias, Teología
('Negocios y Finanzas', 'negocios-finanzas'),       -- Inversiones, Marketing, Economía
('Ficción y Fantasía', 'ficcion-fantasia'),         -- Sci-Fi, Épica, Realismo Mágico
('Thriller y Misterio', 'thriller-misterio'),       -- Policial, Terror, Crimen, Suspenso
('Manga y Cómics', 'manga-comics'),                 -- Anime, Marvel/DC, Novelas gráficas
('Infantil', 'infantil'),                           -- Cuentos, Primeras lecturas (0-12 años)
('Programación y Tech', 'programacion'),            -- Desarrollo Web, IA, Software
('Romance y Drama', 'romance-drama'),               -- Para Colleen Hoover, Bridgerton
('Historia y No Ficción', 'historia-no-ficcion'),   -- Para Sapiens, Historia de Py
('Gastronomía y Cocina', 'gastronomia-cocina'),     -- Recetas, Asado, Vinos
('Salud y Bienestar', 'salud-bienestar'),           -- Yoga, Fitness, Nutrición (Diferente a Autoayuda)
('Ciencia y Naturaleza', 'ciencia-naturaleza'),     -- Biología, Astronomía, Física, Medio Ambiente
('Arte y Diseño', 'arte-diseno'),                   -- Arquitectura, Pintura, Diseño Gráfico, Fotografía
('Biografías y Memorias', 'biografias-memorias'),   -- Vidas de famosos, Líderes, Historias reales
('Educación e Idiomas', 'educacion-idiomas'),       -- Diccionarios, Libros de texto, Aprender Inglés/Guaraní
('Juvenil', 'juvenil'),                             -- Young Adult, Adolescentes (+13 años)
('Viajes y Turismo', 'viajes-turismo'),             -- Guías de viaje, Mapas, Crónicas
('Política y Actualidad', 'politica-actualidad'),   -- Ensayos, Sociología, Derecho
('Otros', 'otros')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUCTOS (CATÁLOGO REALISTA)

-- [NICHO: ESPIRITUALIDAD Y RELIGIÓN]
-- Caso: Biblia (Producto High-Ticket y específico)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description, specs)
VALUES (
    'Biblia de Estudio Reina Valera 1960', 
    'biblia-estudio-rv1960', 
    'Varios Autores', 
    280000, 
    40, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'espiritualidad-religion'), 
    'https://images.unsplash.com/photo-1505527339706-e0e64032d1e2?auto=format&fit=crop&w=800&q=80',
    'Ideal para el estudio profundo de las escrituras con mapas y concordancias.',
    '{"tapa": "Cuero", "idioma": "Español", "editorial": "Holman"}'
);

-- Caso: Best Seller Cristiano
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'Una Vida con Propósito', 
    'una-vida-con-proposito', 
    'Rick Warren', 
    110000, 
    25, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'espiritualidad-religion'), 
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
);

-- [NICHO: DESARROLLO PERSONAL]
-- Caso: Producto AGOTADO (Prueba de lógica "Avísame")
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Hábitos Atómicos', 
    'habitos-atomicos', 
    'James Clear', 
    120000, 
    0, -- STOCK CERO
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'desarrollo-personal'), 
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    'Un método sencillo y comprobado para desarrollar buenos hábitos.'
);

INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'El Club de las 5 de la mañana', 
    'club-5-amanana', 
    'Robin Sharma', 
    130000, 
    30, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'desarrollo-personal'), 
    'https://images.unsplash.com/photo-1515658323406-25d61c141a6e?auto=format&fit=crop&w=800&q=80'
);

-- [NICHO: PROGRAMACIÓN]
-- Caso: Producto en OFERTA (Badge de descuento)
INSERT INTO public.products (title, slug, author, price, promotional_price, stock_qty, status, category_id, cover_image, description, specs)
VALUES (
    'Clean Code', 
    'clean-code', 
    'Robert C. Martin', 
    200000, 
    150000, -- 25% OFF
    20, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'programacion'), 
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    'Reglas y recomendaciones para escribir código limpio y mantenible.',
    '{"paginas": 464, "idioma": "Español", "editorial": "Anaya"}'
);

INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Refactoring UI', 
    'refactoring-ui', 
    'Adam Wathan', 
    250000, 
    50, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'programacion'), 
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'Aprende a diseñar interfaces de usuario hermosas sin ser diseñador.'
);

-- [NICHO: MANGA Y CÓMICS]
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'One Piece Vol. 100', 
    'one-piece-100', 
    'Eiichiro Oda', 
    55000, 
    200, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'manga-comics'), 
    'https://images.unsplash.com/photo-1612152605347-f93296cb657d?auto=format&fit=crop&w=800&q=80'
);

-- [NICHO: FICCIÓN]
-- Caso: Prueba de Búsqueda Fuzzy (Acentos)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'Crónica de una Muerte Anunciada', 
    'cronica-muerte-anunciada', 
    'Gabriel García Márquez', 
    90000, 
    30, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'ficcion-fantasia'), 
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80'
);

-- [NICHO: NEGOCIOS]
-- Caso: Pre-Venta (Botón "Reservar")
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'La Psicología del Dinero (Edición Limitada)', 
    'psicologia-dinero-limitada', 
    'Morgan Housel', 
    180000, 
    100, 
    'preorder', 
    (SELECT id FROM public.categories WHERE slug = 'negocios-finanzas'), 
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    'Edición especial de tapa dura que llegará el próximo mes.'
);
-- [NICHO: ROMANCE] (Alta rotación en público joven/adulto)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Romper el Círculo (It Ends with Us)', 
    'romper-el-circulo', 
    'Colleen Hoover', 
    135000, 
    60, -- Stock alto, se vende mucho
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'romance-drama'), 
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', -- Placeholder floral
    'La novela más vendida del momento sobre el amor y la resiliencia.'
);

-- [NICHO: HISTORIA / NO FICCIÓN] (Regalos y cultura general)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Sapiens: De animales a dioses', 
    'sapiens', 
    'Yuval Noah Harari', 
    160000, 
    25, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'historia-biografias'), 
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    'Una breve historia de la humanidad.'
);
-- [NICHO: COCINA] (Regalo clásico Día del Padre/Madre)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Locos por el Asado', 
    'locos-por-el-asado', 
    'El Laucha', 
    180000, 
    40, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'gastronomia-cocina'), 
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', -- Foto de carne/parrilla
    'La guía definitiva para dominar la parrilla y el fuego.'
);

-- [NICHO: BIENESTAR / SALUD] (Diferente a productividad)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Cerebro de Pan', 
    'cerebro-de-pan', 
    'David Perlmutter', 
    110000, 
    20, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'salud-bienestar'), 
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    'La verdad sobre el trigo, el azúcar y los carbohidratos.'
);
-- [EDUACIÓN E IDIOMAS] - Útil para probar SEO local (Guaraní)
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image, description)
VALUES (
    'Diccionario Castellano-Guaraní Premium', 
    'diccionario-guarani', 
    'Feliciano Acosta', 
    150000, 
    15, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'educacion-idiomas'), 
    'https://images.unsplash.com/photo-1544640805-3536bc23b3bb?auto=format&fit=crop&w=800&q=80',
    'La herramienta definitiva para el estudio del idioma Guaraní.'
);

-- [CIENCIA Y NATURALEZA]
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'Cosmos', 
    'cosmos-carl-sagan', 
    'Carl Sagan', 
    185000, 
    10, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'ciencia-naturaleza'), 
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80'
);

-- [JUVENIL] - El motor de ventas de redes sociales
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'Heartstopper Vol. 1', 
    'heartstopper-1', 
    'Alice Oseman', 
    115000, 
    45, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'juvenil'), 
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
);

-- [BIOGRAFÍAS] - Diferente de Historia
INSERT INTO public.products (title, slug, author, price, stock_qty, status, category_id, cover_image)
VALUES (
    'Steve Jobs', 
    'steve-jobs-bio', 
    'Walter Isaacson', 
    175000, 
    12, 
    'active', 
    (SELECT id FROM public.categories WHERE slug = 'biografias-memorias'), 
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80'
);
-- 3. COMBOS (BUNDLES)

-- CASO A: Combo DISPONIBLE
-- Pack Developer: Refactoring UI + Clean Code
INSERT INTO public.bundles (title, slug, price, description, cover_image, is_active)
VALUES (
    'Pack Senior Developer',
    'pack-senior-developer',
    350000, 
    'El kit definitivo para mejorar tu código y tu diseño.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    true
);

INSERT INTO public.bundle_items (bundle_id, product_id, quantity) VALUES 
((SELECT id FROM public.bundles WHERE slug = 'pack-senior-developer'), (SELECT id FROM public.products WHERE slug = 'refactoring-ui'), 1),
((SELECT id FROM public.bundles WHERE slug = 'pack-senior-developer'), (SELECT id FROM public.products WHERE slug = 'clean-code'), 1);

-- CASO B: Combo NO DISPONIBLE (Stock 0 en componente)
-- Pack Crecimiento: Hábitos Atómicos (Stock 0) + Club 5 AM
INSERT INTO public.bundles (title, slug, price, description, cover_image, is_active)
VALUES (
    'Pack Crecimiento Personal',
    'pack-crecimiento',
    200000,
    'Transfórmate por dentro y por fuera.',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=800&q=80',
    true
);

INSERT INTO public.bundle_items (bundle_id, product_id, quantity) VALUES 
((SELECT id FROM public.bundles WHERE slug = 'pack-crecimiento'), (SELECT id FROM public.products WHERE slug = 'habitos-atomicos'), 1),
((SELECT id FROM public.bundles WHERE slug = 'pack-crecimiento'), (SELECT id FROM public.products WHERE slug = 'club-5-amanana'), 1);

COMMIT;
