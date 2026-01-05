# Guía de Integración de Pagos - Frontend

## 📦 Archivos Creados/Modificados

### ✅ Archivos Creados:

1. **`PaymentConfirmation.jsx`** - Página principal de confirmación de pago
2. **`MercadoPagoButton.jsx`** - Componente para integración con MercadoPago
3. Esta guía de integración

### ✅ Archivos Modificados:

1. **`purchaseService.js`** - Agregados endpoints `confirmPayment()` y `cancelOrder()`
2. **`CheckOut.jsx`** - Redirige a `/payment/:orderId` después de crear pedido
3. **`main.jsx`** - Agregada ruta `/payment/:orderId`

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno (.env)

Agregar al archivo `.env`:

```env
# MercadoPago Configuration
VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui
```

### 2. Agregar SDK de MercadoPago

En `index.html`, agregar antes del cierre de `</body>`:

```html
<!-- MercadoPago SDK -->
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

---

## 🎯 Flujo de Pago Completo

```
1. Usuario completa checkout
   ↓
2. POST /api/purchases/create-order
   → Crea pedido con status "Pendiente"
   → NO envía notificaciones
   → Reserva stock (30 min)
   ↓
3. Redirige a /payment/:orderId
   ↓
4. Usuario selecciona método de pago:

   OPCIÓN A: Transferencia
   ├─ Muestra datos bancarios
   ├─ Usuario sube comprobante (base64)
   └─ POST /api/purchases/:orderId/confirm-payment

   OPCIÓN B: MercadoPago
   ├─ POST /api/payments/create-preference
   ├─ Redirige a checkout de MercadoPago
   ├─ Webhook confirma pago automático
   └─ Actualiza pedido a "Completada"

   OPCIÓN C: Efectivo (solo retiro)
   ├─ Confirma que pagará en sucursal
   └─ POST /api/purchases/:orderId/confirm-payment

   ↓
5. Backend confirma pago:
   → Status: "Pendiente" → "Completada"
   → Descuenta stock definitivamente
   → Envía notificaciones (email)
   → Crea primer tracking
   ↓
6. Redirige a /order-tracking/:orderId
```

---

## 🔌 Endpoints del Backend a Implementar

### 1. Modificar Endpoint Existente

**Endpoint:** `POST /api/purchases/create-order`

**Cambios requeridos:**

```python
# ANTES (incorrecto)
- Crear pedido con status "Completada"
- Descontar stock inmediatamente
- Enviar notificaciones inmediatamente

# AHORA (correcto)
- Crear pedido con status "Pendiente"
- NO descontar stock
- NO enviar notificaciones
- Reservar stock temporalmente (30 min)
- Agregar campo: payment_status = "pending"
```

**Response esperado:**

```json
{
  "message": "Pedido creado. Pendiente de pago.",
  "order_id": 123,
  "status": "Pendiente",
  "payment_required": true,
  "payment_expiration": "2026-01-03T13:30:00",
  "order_details": {
    "id": 123,
    "total": 15500.0,
    "status": "Pendiente",
    "payment_status": "pending"
  }
}
```

---

### 2. Nuevo Endpoint: Confirmar Pago

**Endpoint:** `POST /api/purchases/{order_id}/confirm-payment`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "payment_method": "transferencia | mercadopago | efectivo",
  "payment_proof": "base64_image_data", // Solo para transferencia
  "transaction_id": "MP-123456", // Solo para mercadopago
  "notes": "Opcional: notas adicionales"
}
```

**Lógica del Backend:**

```python
1. Validar que el pedido existe y está "Pendiente"
2. Validar que el stock sigue disponible
3. Si payment_method == "transferencia":
   - Guardar comprobante en base64
   - Requiere aprobación manual del admin
   - Status → "Pendiente de verificación"
4. Si payment_method == "mercadopago":
   - Verificar transaction_id con API de MercadoPago
   - Si es válido → Status "Completada"
5. Si payment_method == "efectivo":
   - Solo si delivery_type == "retiro"
   - Status → "Pendiente de pago en sucursal"
6. Descontar stock definitivamente
7. Enviar emails de confirmación
8. Crear primer tracking entry: "Pedido confirmado - Pago recibido"
```

**Response esperado:**

```json
{
  "message": "Pago confirmado exitosamente",
  "order_id": 123,
  "status": "Completada",
  "payment_status": "confirmed",
  "stock_updated": true,
  "notifications_sent": true,
  "tracking_created": true
}
```

---

### 3. Nuevo Endpoint: Cancelar Pedido

**Endpoint:** `POST /api/purchases/{order_id}/cancel`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Cancelado por el usuario"
}
```

**Lógica del Backend:**

```python
1. Validar que el pedido está "Pendiente"
2. Liberar stock reservado
3. Actualizar status → "Cancelada"
4. Registrar razón de cancelación
5. NO enviar notificaciones (opcional)
```

**Response esperado:**

```json
{
  "message": "Pedido cancelado exitosamente",
  "order_id": 123,
  "status": "Cancelada",
  "stock_released": true
}
```

---

### 4. Nuevo Endpoint: Crear Preferencia de MercadoPago

**Endpoint:** `POST /api/payments/create-preference`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "order_id": 123,
  "amount": 15500.0,
  "description": "Pedido #123 - Mykonos Boutique"
}
```

**Lógica del Backend:**

```python
import mercadopago

sdk = mercadopago.SDK("YOUR_ACCESS_TOKEN")

preference_data = {
    "items": [
        {
            "title": description,
            "quantity": 1,
            "unit_price": amount
        }
    ],
    "back_urls": {
        "success": "https://tudominio.com/payment-success",
        "failure": "https://tudominio.com/payment-failure",
        "pending": "https://tudominio.com/payment-pending"
    },
    "auto_return": "approved",
    "external_reference": str(order_id),
    "notification_url": "https://tudominio.com/api/payments/webhook"
}

preference_response = sdk.preference().create(preference_data)
preference_id = preference_response["response"]["id"]
```

**Response esperado:**

```json
{
  "preference_id": "123456789-abcd-1234-5678-123456789abc",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

---

### 5. Webhook de MercadoPago

**Endpoint:** `POST /api/payments/webhook`

**Request Body (enviado por MercadoPago):**

```json
{
  "action": "payment.created",
  "data": {
    "id": "123456789"
  },
  "type": "payment"
}
```

**Lógica del Backend:**

```python
1. Recibir notificación de MercadoPago
2. Consultar detalles del pago con payment_id
3. Obtener external_reference (order_id)
4. Si status == "approved":
   - Llamar a confirm-payment automáticamente
   - Actualizar pedido a "Completada"
5. Si status == "rejected":
   - Notificar al usuario del rechazo
6. Si status == "pending":
   - Mantener en "Pendiente"
```

---

## 🔐 Configuración de MercadoPago

### Paso 1: Obtener Credenciales

1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una aplicación
3. Obtener:
   - **Public Key** (para frontend) → `VITE_MERCADOPAGO_PUBLIC_KEY`
   - **Access Token** (para backend) → Guardar en backend

### Paso 2: Configurar Webhooks

1. En el panel de MercadoPago → Webhooks
2. Agregar URL: `https://api.tudominio.com/api/payments/webhook`
3. Seleccionar eventos: `payment`

---

## 🎨 Componentes del Frontend

### PaymentConfirmation.jsx

**Características:**

- ✅ Muestra resumen del pedido
- ✅ Timer de expiración (30 min)
- ✅ Opciones de pago: MercadoPago, Transferencia, Efectivo
- ✅ Upload de comprobante (base64)
- ✅ Validación de imágenes (max 5MB)
- ✅ Botón de cancelar pedido
- ✅ Redirige a tracking después del pago

### MercadoPagoButton.jsx

**Características:**

- ✅ Inicializa SDK de MercadoPago
- ✅ Crea preferencia de pago
- ✅ Abre checkout modal
- ✅ Maneja callbacks de éxito/error

---

## 🧪 Testing del Flujo

### Test Manual:

1. **Crear Pedido:**

   ```
   - Agregar productos al carrito
   - Ir a checkout
   - Completar datos de envío
   - Confirmar pedido
   - Verificar redirección a /payment/:orderId
   ```

2. **Pagar con Transferencia:**

   ```
   - Seleccionar "Transferencia Bancaria"
   - Verificar que muestra datos bancarios
   - Subir imagen de comprobante
   - Confirmar pago
   - Verificar redirección a tracking
   ```

3. **Pagar con Efectivo (solo retiro):**

   ```
   - Crear pedido con delivery_type = "retiro"
   - Seleccionar "Efectivo al Retirar"
   - Confirmar
   - Verificar que el pedido queda reservado
   ```

4. **Cancelar Pedido:**
   ```
   - Ir a página de pago
   - Click en "Cancelar Pedido"
   - Confirmar cancelación
   - Verificar redirección a mis compras
   ```

---

## 📊 Estados del Sistema

### Estados de Pedido (status):

- **Pendiente** → Esperando pago
- **Completada** → Pago confirmado
- **Cancelada** → Cancelado por usuario/admin
- **Reembolsada** → Reembolso procesado

### Estados de Pago (payment_status):

- **pending** → Sin pagar
- **confirmed** → Pago confirmado
- **verification_required** → Transferencia pendiente de verificación
- **rejected** → Pago rechazado

### Estados de Envío (shipping_status):

- **pendiente** → Pedido creado
- **preparando** → En preparación
- **despachado** → Enviado
- **en_transito** → En camino
- **entregado** → Entregado
- **cancelado** → Cancelado

---

## ⚠️ Consideraciones Importantes

### Seguridad:

1. ✅ Validar tokens de autenticación en todos los endpoints
2. ✅ Verificar que el usuario es dueño del pedido
3. ✅ Validar webhook signature de MercadoPago
4. ✅ Sanitizar comprobantes de pago (base64)
5. ✅ Rate limiting en endpoints de pago

### Stock:

1. ✅ Reservar stock temporalmente (30 min)
2. ✅ Implementar job/cron para liberar stock expirado
3. ✅ Validar disponibilidad antes de confirmar pago
4. ✅ Descontar solo al confirmar pago

### Notificaciones:

1. ❌ NO enviar emails al crear pedido
2. ✅ Enviar email solo al confirmar pago
3. ✅ Incluir en el email:
   - Confirmación de pago
   - Detalles del pedido
   - Link de tracking
   - Fecha estimada de entrega

---

## 🚀 Próximos Pasos

### Fase 1: Backend (Urgente)

- [ ] Modificar `/api/purchases/create-order`
- [ ] Crear `/api/purchases/{id}/confirm-payment`
- [ ] Crear `/api/purchases/{id}/cancel`
- [ ] Crear `/api/payments/create-preference`
- [ ] Implementar webhook de MercadoPago
- [ ] Crear job para liberar stock expirado

### Fase 2: Testing

- [ ] Test de flujo completo transferencia
- [ ] Test de flujo completo MercadoPago
- [ ] Test de flujo completo efectivo
- [ ] Test de cancelación de pedido
- [ ] Test de expiración de stock

### Fase 3: Optimizaciones

- [ ] Agregar timer visual en PaymentConfirmation
- [ ] Notificaciones push para admin (pedido pendiente)
- [ ] Dashboard de pagos pendientes para admin
- [ ] Reportes de pagos

---

## 💡 Tips para el Backend

### Estructura de BD recomendada:

```sql
-- Tabla de pedidos
ALTER TABLE sales ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE sales ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE sales ADD COLUMN payment_proof TEXT; -- Base64
ALTER TABLE sales ADD COLUMN transaction_id VARCHAR(255);
ALTER TABLE sales ADD COLUMN stock_reserved_until TIMESTAMP;

-- Tabla de reservas de stock (opcional)
CREATE TABLE stock_reservations (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    variant_id INTEGER REFERENCES product_variants(id),
    quantity INTEGER,
    reserved_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    released BOOLEAN DEFAULT FALSE
);
```

### Cron Job para Liberar Stock:

```python
# Ejecutar cada 5 minutos
def release_expired_stock():
    expired_reservations = db.query("""
        SELECT * FROM stock_reservations
        WHERE expires_at < NOW()
        AND released = FALSE
    """)

    for reservation in expired_reservations:
        # Devolver stock
        variant = get_variant(reservation.variant_id)
        variant.stock += reservation.quantity

        # Marcar como liberado
        reservation.released = True

        # Cancelar pedido
        sale = get_sale(reservation.sale_id)
        if sale.status == "Pendiente":
            sale.status = "Cancelada"
            sale.notes = "Cancelado automáticamente por falta de pago"
```

---

## 📞 Contacto y Soporte

Si tienes dudas sobre la implementación:

1. Revisar esta guía
2. Verificar logs del backend
3. Probar en ambiente de testing de MercadoPago

¡Éxito con la integración! 🎉
