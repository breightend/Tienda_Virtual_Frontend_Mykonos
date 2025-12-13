-- ============================================================================
-- Script para arreglar productos sin precio en el carrito
-- Ejecutar este script en tu base de datos PostgreSQL
-- ============================================================================

-- 1. Ver productos en el carrito que tienen precio NULL o 0
SELECT 
    wci.id as cart_item_id,
    wci.cart_id,
    wci.product_id,
    p.nombre_web,
    p.precio_web,
    p.sale_price,
    p.en_tienda_online,
    wci.quantity,
    wci.variant_id
FROM web_cart_items wci
INNER JOIN products p ON wci.product_id = p.id
WHERE p.precio_web IS NULL 
   OR p.precio_web = 0 
   OR p.precio_web < 0
ORDER BY wci.cart_id, wci.id;

-- 2. Ver estadísticas de productos problemáticos
SELECT 
    COUNT(*) as total_items_problematicos,
    COUNT(DISTINCT wci.cart_id) as carritos_afectados,
    COUNT(DISTINCT wci.product_id) as productos_unicos_problematicos
FROM web_cart_items wci
INNER JOIN products p ON wci.product_id = p.id
WHERE p.precio_web IS NULL 
   OR p.precio_web = 0 
   OR p.precio_web < 0;

-- 3. Actualizar precio_web desde sale_price para productos que lo tengan
-- CUIDADO: Esto modifica datos
UPDATE products 
SET precio_web = sale_price,
    last_modified_date = CURRENT_TIMESTAMP
WHERE en_tienda_online = TRUE 
  AND (precio_web IS NULL OR precio_web = 0)
  AND sale_price IS NOT NULL 
  AND sale_price > 0;

-- Ver resultado de la actualización
SELECT 
    id,
    nombre_web,
    precio_web,
    sale_price,
    en_tienda_online
FROM products
WHERE en_tienda_online = TRUE
  AND precio_web IS NOT NULL
  AND precio_web > 0
ORDER BY id;

-- 4. Desactivar productos de tienda online que no tienen ningún precio válido
-- CUIDADO: Esto modifica datos
UPDATE products 
SET en_tienda_online = FALSE,
    last_modified_date = CURRENT_TIMESTAMP
WHERE en_tienda_online = TRUE 
  AND (precio_web IS NULL OR precio_web <= 0)
  AND (sale_price IS NULL OR sale_price <= 0);

-- 5. Eliminar items del carrito que corresponden a productos sin precio válido
-- CUIDADO: Esto elimina datos del carrito
-- Ejecutar solo DESPUÉS de intentar arreglar los precios
DELETE FROM web_cart_items 
WHERE product_id IN (
    SELECT id 
    FROM products 
    WHERE (precio_web IS NULL OR precio_web <= 0)
      AND (sale_price IS NULL OR sale_price <= 0)
);

-- 6. Verificar que no queden productos problemáticos en el carrito
SELECT 
    'VERIFICA ESTO' as mensaje,
    COUNT(*) as items_sin_precio_en_carrito
FROM web_cart_items wci
INNER JOIN products p ON wci.product_id = p.id
WHERE p.precio_web IS NULL 
   OR p.precio_web <= 0;

-- 7. Ver todos los productos en tienda online y sus precios
SELECT 
    id,
    nombre_web,
    precio_web,
    sale_price,
    cost,
    en_tienda_online,
    state
FROM products
WHERE en_tienda_online = TRUE
ORDER BY 
    CASE 
        WHEN precio_web IS NULL OR precio_web <= 0 THEN 0
        ELSE 1 
    END,
    id;

-- ============================================================================
-- INSTRUCCIONES DE USO:
-- ============================================================================
-- 1. Ejecuta la consulta #1 para ver qué productos tienen problemas
-- 2. Ejecuta la consulta #2 para ver estadísticas
-- 3. Si quieres copiar sale_price a precio_web, ejecuta el UPDATE #3
-- 4. Si quieres desactivar productos sin precio, ejecuta el UPDATE #4
-- 5. Si quieres eliminar items problemáticos del carrito, ejecuta el DELETE #5
-- 6. Ejecuta la verificación #6 para confirmar
-- 7. Ejecuta la consulta #7 para ver el estado final
-- ============================================================================
