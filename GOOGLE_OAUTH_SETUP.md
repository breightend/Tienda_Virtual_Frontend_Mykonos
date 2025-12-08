# Configuración de Google OAuth para Login

Esta guía te ayudará a configurar Google OAuth para permitir que los usuarios inicien sesión con su cuenta de Google.

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre descriptivo (ej: "Mykonos Tienda Virtual")

## Paso 2: Habilitar Google+ API

1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca "Google+ API"
3. Haz clic en **Enable**

## Paso 3: Configurar OAuth Consent Screen

1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** (para usuarios fuera de tu organización)
3. Completa la información requerida:
   - **App name**: Mykonos
   - **User support email**: tu email
   - **Developer contact**: tu email
4. En **Scopes**, agrega:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Guarda y continúa

## Paso 4: Crear Credenciales OAuth 2.0

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **Create Credentials** → **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Mykonos Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desarrollo)
     - `https://tudominio.com` (producción)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback` (desarrollo)
     - `https://tudominio.com/auth/google/callback` (producción)
5. Haz clic en **Create**
6. Copia el **Client ID** (lo necesitarás después)

## Paso 5: Configurar Variables de Entorno

Actualiza el archivo `.env` en el frontend:

```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
```

## Paso 6: Instalar React Google Login

```bash
npm install @react-oauth/google
```

## Paso 7: Configurar en el Frontend

### 7.1 Actualizar main.jsx

Envuelve la app con GoogleOAuthProvider:

```jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        {/* resto de la app */}
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
```

### 7.2 Actualizar Login.jsx

Reemplaza el botón de Google con:

```jsx
import { GoogleLogin } from '@react-oauth/google';

// En el componente:
<GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      // Enviar el token al backend
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      setUser(response.user);
      setIsAuthenticated(true);
      setLocation("/");
    } catch (error) {
      setLoginError("Error al iniciar sesión con Google");
    }
  }}
  onError={() => {
    setLoginError("Error al iniciar sesión con Google");
  }}
  useOneTap
/>
```

## Paso 8: Implementar en el Backend

### 8.1 Instalar Dependencias

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### 8.2 Actualizar user.py

Descomenta y completa el endpoint de Google OAuth:

```python
from google.oauth2 import id_token
from google.auth.transport import requests

@router.post("/auth/google")
async def google_auth(google_token: str):
    """Authenticate with Google OAuth."""
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        # Extract user info
        email = idinfo['email']
        google_id = idinfo['sub']
        name = idinfo.get('name', '')
        
        pool = await DatabaseManager.get_pool()
        
        async with pool.acquire() as conn:
            # Check if user exists
            user = await conn.fetchrow(
                "SELECT * FROM web_users WHERE google_id = $1 OR email = $2",
                google_id, email
            )
            
            if user:
                # User exists, login
                session_token = generate_session_token()
                await conn.execute(
                    "UPDATE web_users SET session_token = $1, google_id = $2 WHERE id = $3",
                    session_token, google_id, user['id']
                )
            else:
                # Create new user
                session_token = generate_session_token()
                user = await conn.fetchrow(
                    """
                    INSERT INTO web_users 
                    (username, fullname, email, google_id, role, status, 
                     session_token, email_verified)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id, username, fullname, email, role, status, 
                              email_verified, google_id, created_at
                    """,
                    email.split('@')[0],  # username from email
                    name,
                    email,
                    google_id,
                    "customer",
                    "active",
                    session_token,
                    True  # Google emails are pre-verified
                )
            
            user_response = UserResponse(**dict(user))
            return TokenResponse(
                token=session_token,
                user=user_response,
                message="Google login successful"
            )
            
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
```

### 8.3 Actualizar authService.js

Descomenta la función `loginWithGoogle`:

```javascript
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google`, {
      token: googleToken
    });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error during Google login:", error);
    throw error.response?.data || error;
  }
};
```

## Paso 9: Actualizar Base de Datos

Asegúrate de que la tabla `web_users` tenga las columnas necesarias:

```sql
ALTER TABLE web_users 
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

## Notas de Seguridad

- **Nunca expongas el Client Secret** en el frontend
- **Valida siempre el token** en el backend
- **Usa HTTPS** en producción
- **Configura correctamente los redirect URIs**

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que el redirect URI en Google Console coincida exactamente con el de tu app

### Error: "invalid_client"
- Verifica que el Client ID sea correcto
- Asegúrate de que el proyecto de Google Cloud esté activo

### El botón no aparece
- Verifica que el Client ID esté configurado en .env
- Revisa la consola del navegador para errores

## Testing

1. Prueba en modo desarrollo primero
2. Usa una cuenta de Google de prueba
3. Verifica que se cree el usuario correctamente en la BD
4. Verifica que el login funcione en sesiones posteriores
