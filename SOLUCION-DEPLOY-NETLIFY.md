# 🚨 SOLUCIÓN: Error "crypto.hash is not a function" en Netlify

## ❌ Problema Original
```
[vite:build-html] crypto.hash is not a function
```

## ✅ Soluciones Implementadas

### 1. **Downgrade de Vite**
- **Antes**: Vite v7.0.6 (beta/inestable)
- **Después**: Vite v5.4.2 (estable y compatible)

### 2. **Configuración de Node.js**
- **Versión específica**: Node.js 18.18.0
- **Archivo `.nvmrc`**: Garantiza versión consistente
- **Engines en package.json**: Especifica compatibilidad

### 3. **Scripts de Build Alternativos**
- **Comando principal**: `npm run build` (Vite)
- **Comando backup**: `npm run build:manual` (sin Vite)
- **Netlify config**: Usa backup si falla el principal

### 4. **Configuración CommonJS**
- Convertido script de sincronización a CommonJS
- Removido `"type": "module"` del package.json
- Mayor compatibilidad con Netlify

### 5. **Optimizaciones Netlify**
```toml
[build.environment]
  NODE_VERSION = "18.18.0"
  NPM_FLAGS = "--legacy-peer-deps"
  NODE_OPTIONS = "--max-old-space-size=4096"
```

## 🔧 Comandos de Build Netlify

### Comando Principal (con fallback):
```bash
npm run build || npm run build:manual
```

### Si el principal falla, usar:
```bash
npm run build:manual
```

## 📁 Archivos Modificados

1. **package.json** - Downgrade Vite + engines
2. **netlify.toml** - Node.js específico + fallback command  
3. **vite.config.js** - Configuración compatible
4. **.nvmrc** - Versión Node.js fija
5. **scripts/syncToPublic.js** - CommonJS
6. **scripts/manualBuild.js** - Build alternativo

## ✅ Verificación Local

### Build con Vite:
```bash
npm run build
# ✅ Funciona correctamente
```

### Build manual:
```bash
npm run build:manual  
# ✅ Funciona como backup
```

## 🚀 Deploy en Netlify

### Configuración automática:
- **Build command**: `npm run build || npm run build:manual`
- **Publish directory**: `dist`
- **Node version**: 18.18.0

### En caso de fallo, usar manualmente:
- **Build command**: `npm run build:manual`

## 🎯 Resultado Esperado

Con estas modificaciones, el deploy en Netlify debería:
1. ✅ Usar Node.js 18.18.0 (estable)
2. ✅ Usar Vite 5.4.2 (compatible)  
3. ✅ Ejecutar build alternativo si Vite falla
4. ✅ Generar dist/ correctamente
5. ✅ Desplegar sin errores
