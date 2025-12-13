# Backend: Endpoints para Imágenes de Productos

## Resumen

Esta implementación usa **base64** para subir imágenes sin necesidad de `python-multipart`. Los endpoints están separados para mejor escalabilidad y mantenimiento.

---

## 1. Configuración Inicial

### En tu archivo principal de FastAPI (main.py o app.py):

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Crear directorio de imágenes si no existe
IMAGES_DIR = "/home/breightend/imagenes-productos"
os.makedirs(IMAGES_DIR, exist_ok=True)

# Servir imágenes estáticamente
app.mount(
    "/static/productos",
    StaticFiles(directory=IMAGES_DIR),
    name="productos"
)
```

---

## 2. Modelos Pydantic (agregar al archivo de models)

```python
from pydantic import BaseModel
from typing import Optional

class ImageUpload(BaseModel):
    """Modelo para subir imagen en base64"""
    image_data: str  # Base64 encoded image
    filename: str    # Original filename

class ImageResponse(BaseModel):
    """Respuesta con datos de imagen"""
    id: int
    image_url: str
```

---

## 3. Endpoints en tu router de productos

### Endpoint: POST /products/{product_id}/images

**Subir una imagen a un producto**

```python
import base64
import os
import uuid
from fastapi import HTTPException, status, Depends
from datetime import datetime

# Configuración
IMAGES_DIR = "/home/breightend/imagenes-productos"
IMAGES_BASE_URL = "/static/productos"

@router.post("/{product_id}/images", response_model=ImageResponse)
async def add_product_image(
    product_id: int,
    image: ImageUpload,
    current_user: dict = Depends(require_admin)
):
    """
    Agrega una imagen a un producto.

    - **product_id**: ID del producto
    - **image_data**: Imagen codificada en base64
    - **filename**: Nombre original del archivo

    Returns: Objeto con id e image_url
    """
    try:
        # Verificar que el producto existe
        product = await db.fetch_one(
            "SELECT id FROM products WHERE id = $1", product_id
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {product_id} no encontrado"
            )

        # Decodificar base64
        try:
            image_bytes = base64.b64decode(image.image_data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imagen base64 inválida"
            )

        # Validar tamaño (opcional, máximo 5MB)
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imagen muy grande (máximo 5MB)"
            )

        # Generar nombre único para la imagen
        file_extension = os.path.splitext(image.filename)[1].lower()
        # Validar extensión
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Extensión no permitida. Use: {', '.join(allowed_extensions)}"
            )

        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(IMAGES_DIR, unique_filename)

        # Crear directorio si no existe
        os.makedirs(IMAGES_DIR, exist_ok=True)

        # Guardar imagen
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        # URL para el frontend
        image_url = f"{IMAGES_BASE_URL}/{unique_filename}"

        # Insertar en la base de datos
        result = await db.fetch_one(
            """
            INSERT INTO images (image_url, product_id, upload_date)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING id, image_url
            """,
            image_url, product_id
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al subir imagen: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la imagen: {str(e)}"
        )
```

---

### Endpoint: DELETE /products/{product_id}/images/{image_id}

**Eliminar una imagen de un producto**

```python
@router.delete("/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int,
    image_id: int,
    current_user: dict = Depends(require_admin)
):
    """
    Elimina una imagen de un producto.

    - **product_id**: ID del producto
    - **image_id**: ID de la imagen a eliminar

    Returns: Mensaje de confirmación
    """
    try:
        # Obtener la imagen
        image = await db.fetch_one(
            """
            SELECT id, image_url FROM images
            WHERE id = $1 AND product_id = $2
            """,
            image_id, product_id
        )

        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imagen no encontrada"
            )

        # Extraer nombre de archivo de la URL
        filename = image["image_url"].split("/")[-1]
        file_path = os.path.join(IMAGES_DIR, filename)

        # Eliminar archivo físico si existe
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"No se pudo eliminar archivo físico: {e}")

        # Eliminar de la base de datos
        await db.execute(
            "DELETE FROM images WHERE id = $1",
            image_id
        )

        return {"message": "Imagen eliminada correctamente"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar imagen: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la imagen: {str(e)}"
        )
```

---

### Endpoint: GET /products/{product_id}/images

**Obtener todas las imágenes de un producto**

```python
@router.get("/{product_id}/images", response_model=list[ImageResponse])
async def get_product_images(product_id: int):
    """
    Obtiene todas las imágenes de un producto.

    - **product_id**: ID del producto

    Returns: Lista de objetos con id e image_url
    """
    try:
        images = await db.fetch_all(
            """
            SELECT id, image_url
            FROM images
            WHERE product_id = $1
            ORDER BY upload_date DESC
            """,
            product_id
        )
        return images
    except Exception as e:
        logger.error(f"Error al obtener imágenes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener imágenes: {str(e)}"
        )
```

---

## 4. Mantener el PUT endpoint actual para actualizar producto

```python
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductUpdate):
    """
    Update an existing product.

    Path Parameters:
    - product_id: The ID of the product to update

    Request Body:
    - ProductUpdate model with fields to update (all optional)
    """
    try:
        # First, check if product exists
        existing = await db.fetch_one("SELECT id FROM products WHERE id = $1", product_id)
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con ID {product_id} no encontrado"
            )

        # Build dynamic update query based on provided fields
        update_fields = []
        params = []
        param_count = 1

        for field, value in product.dict(exclude_unset=True).items():
            update_fields.append(f"{field} = ${param_count}")
            params.append(value)
            param_count += 1

        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se proporcionaron campos para actualizar"
            )

        # Add last_modified_date
        update_fields.append(f"last_modified_date = CURRENT_TIMESTAMP")

        # Add product_id as the last parameter
        params.append(product_id)

        query = f"""
            UPDATE products
            SET {', '.join(update_fields)}
            WHERE id = ${param_count}
            RETURNING id, product_name, description, cost, sale_price, provider_code,
                      group_id, provider_id, brand_id, tax, discount,
                      original_price, discount_percentage, discount_amount,
                      has_discount, comments, state,
                      en_tienda_online, nombre_web, descripcion_web, slug, precio_web,
                      creation_date, last_modified_date
        """

        result = await db.fetch_one(query, *params)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el producto: {str(e)}"
        )
```

---

## 5. Ventajas de esta Implementación

✅ **Sin python-multipart**: Usa base64, evita dependencias adicionales
✅ **Separación de responsabilidades**: Cada endpoint hace una cosa específica
✅ **Escalable**: Fácil agregar validaciones, compresión, optimización de imágenes
✅ **Performance**: El frontend puede subir imágenes en paralelo
✅ **Mantenible**: Código claro y fácil de debuggear
✅ **Seguro**: Validación de tamaño, extensiones, y autenticación admin

---

## 6. Flujo de Actualización Completo

Cuando el usuario edita un producto:

1. **Frontend sube nuevas imágenes** → `POST /products/{id}/images` (una por una o en paralelo)
2. **Frontend elimina imágenes removidas** → `DELETE /products/{id}/images/{image_id}`
3. **Frontend actualiza datos del producto** → `PUT /products/{id}`
4. **Frontend recarga la lista de productos**

---

## 7. Testing

Puedes probar con curl:

```bash
# 1. Convertir imagen a base64
IMAGE_BASE64=$(base64 -w 0 imagen.jpg)

# 2. Subir imagen
curl -X POST "http://localhost:8000/products/1/images" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"image_data\": \"$IMAGE_BASE64\",
    \"filename\": \"imagen.jpg\"
  }"

# 3. Obtener imágenes
curl "http://localhost:8000/products/1/images"

# 4. Eliminar imagen
curl -X DELETE "http://localhost:8000/products/1/images/5" \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 8. Optimizaciones Futuras (Opcional)

- **Compresión de imágenes**: Usar PIL/Pillow para redimensionar
- **Lazy loading**: Paginación de imágenes si hay muchas
- **CDN**: Servir imágenes desde CloudFront/Cloudflare
- **WebP conversion**: Convertir automáticamente a formato más eficiente
- **Thumbnails**: Generar miniaturas para mejor performance

---

¿Todo claro? El frontend ya está listo y funcionando. Solo necesitás implementar estos 3 endpoints en tu backend.
