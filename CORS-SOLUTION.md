# CONFIGURACIONES PARA RESOLVER CORS

## 🔧 CAMBIOS REALIZADOS

### 1. **Configuración del API Base URL**
- **Desarrollo**: URL completa de Railway
- **Producción**: URL relativa para usar proxy de Netlify

### 2. **Archivo `_redirects` Optimizado**
```
# Proxy para API (DEBE IR PRIMERO)
/api/* https://api-superheroes-production.up.railway.app/:splat 200
/auth/* https://api-superheroes-production.up.railway.app/auth/:splat 200

# Fallback SPA
/* /index.html 200
```

### 3. **Headers CORS Mejorados en `netlify.toml`**
- Agregados headers específicos para `/api/*`
- Incluidos todos los headers necesarios
- Configurado `Access-Control-Allow-Credentials`

### 4. **Configuración Centralizada (`src/utils/apiConfig.js`)**
- Helper para manejar URLs automáticamente
- Detección automática de entorno
- Headers estandarizados

## 📋 PASOS ADICIONALES RECOMENDADOS

### 1. **Actualizar archivos API existentes**
Cambiar todas las referencias de URL directa por el helper:

```javascript
// ANTES:
const response = await fetch('https://api-superheroes-production.up.railway.app/api/heroes', options);

// DESPUÉS:
import { apiCall } from '../utils/apiConfig.js';
const data = await apiCall('/api/heroes', { method: 'GET' });
```

### 2. **Verificar en Railway**
- Asegurar que el origen de Netlify esté en la lista blanca
- Verificar configuración de CORS en el backend

### 3. **Deploy y Test**
- Hacer deploy en Netlify
- Probar todas las funciones de la aplicación
- Verificar logs de la consola

## 🚨 NOTAS IMPORTANTES

1. **Orden en `_redirects`**: Los proxies deben ir ANTES que las reglas SPA
2. **URLs relativas**: En producción, usar `/api/` en lugar de URL completa
3. **Headers**: Asegurar que el backend acepta todos los headers configurados

## 🔍 TROUBLESHOOTING

Si persiste el error CORS:
1. Verificar logs de Netlify Functions
2. Comprobar la configuración del backend en Railway
3. Revisar si las URLs están siendo reescritas correctamente
