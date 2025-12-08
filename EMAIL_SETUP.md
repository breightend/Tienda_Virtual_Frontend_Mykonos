# Configuración de EmailJS para Verificación de Email

Esta guía te ayudará a configurar EmailJS para enviar emails de verificación a los usuarios después del registro.

## Paso 1: Crear Cuenta en EmailJS

1. Ve a [EmailJS](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)
3. Verifica tu email

## Paso 2: Configurar Servicio de Email

1. En el dashboard, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Copia el **Service ID** (lo necesitarás después)

## Paso 3: Crear Template de Verificación

1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Usa el siguiente template:

```
Asunto: Verifica tu cuenta en Mykonos

Hola {{to_name}},

¡Gracias por registrarte en Mykonos!

Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:

{{verification_link}}

Este enlace expirará en 24 horas.

Si no creaste esta cuenta, puedes ignorar este email.

Saludos,
El equipo de Mykonos
```

4. Guarda el template y copia el **Template ID**

## Paso 4: Obtener Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key**

## Paso 5: Configurar Variables de Entorno

Actualiza el archivo `.env` en el frontend:

```env
VITE_EMAILJS_SERVICE_ID=tu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=tu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
```

## Paso 6: Instalar EmailJS en el Frontend

```bash
npm install @emailjs/browser
```

## Paso 7: Implementar en el Código

El código ya está preparado en `Register.jsx`. Solo necesitas descomentar y ajustar:

```javascript
import emailjs from '@emailjs/browser';

// En la función handleSubmit, después del registro exitoso:
emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  {
    to_email: formData.email,
    to_name: formData.fullname || formData.username,
    verification_link: `${window.location.origin}/verify-email?token=${response.verification_token}`
  },
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY
);
```

## Paso 8: Crear Página de Verificación

Crea el componente `EmailVerification.jsx` (ya está preparado en el plan) y agrégalo a las rutas en `main.jsx`:

```jsx
<Route path="/verify-email" component={EmailVerification} />
```

## Notas Importantes

- **Límite gratuito**: 200 emails/mes
- **Seguridad**: No expongas tus keys en el código público
- **Testing**: Usa emails de prueba antes de producción
- **Spam**: Asegúrate de que tus emails no caigan en spam configurando SPF/DKIM

## Troubleshooting

### Los emails no llegan
- Verifica que el Service ID, Template ID y Public Key sean correctos
- Revisa la carpeta de spam
- Verifica que el servicio de email esté conectado correctamente

### Error de CORS
- EmailJS maneja CORS automáticamente, pero asegúrate de usar la versión correcta del SDK

### Límite excedido
- Considera actualizar a un plan pago
- O implementa un sistema de rate limiting en el backend
