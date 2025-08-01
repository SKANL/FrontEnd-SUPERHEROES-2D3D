# Deploy Instructions for Netlify

## ✅ Problema Solucionado
El proyecto tenía un problema donde Netlify no podía encontrar los archivos necesarios porque solo se generaba `index.html` en el build, pero faltaban todas las carpetas y archivos que necesita la aplicación.

## 🏗️ Estructura del Proyecto

### Carpetas Principales:
```
proyecto/
├── src/                    ← 📝 ARCHIVOS FUENTE (editar aquí)
│   ├── ui/                 ← Interfaces de usuario
│   ├── characters/         ← Lógica de personajes  
│   ├── core/              ← Core del juego
│   ├── render/            ← Sistema de renderizado
│   └── input/             ← Sistema de controles
├── public/                ← 🔄 AUTO-GENERADO (no editar)
├── dist/                  ← 📦 BUILD FINAL
├── sprites/               ← 🎨 Assets estáticos
├── music/                 ← 🎵 Archivos de audio
└── scripts/               ← 🛠️ Scripts de automatización
```

### ⚠️ IMPORTANTE:
- **✅ Editar solo en `src/`** - Aquí están los archivos fuente
- **❌ NO editar `public/`** - Se regenera automáticamente
- **❌ NO versionar `public/`** - Está en `.gitignore`

## 🔄 Sistema de Sincronización

### Script Automático:
El script `scripts/syncToPublic.js` copia automáticamente:
- `src/` → `public/` (código fuente)
- Archivos HTML adicionales
- CSS, JS y manifests

### Comandos Actualizados:
```bash
# Desarrollo (sincroniza + inicia dev server)
npm run dev

# Build (sincroniza + genera dist)  
npm run build

# Solo sincronizar
npm run sync

# Preview del build
npm run preview
```

## 🚀 Deploy en Netlify

### 1. Configuración Automática:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

### 2. Archivos de Configuración:
- `netlify.toml` - Configuración principal
- `_redirects` - Manejo de rutas SPA

## 🔧 Workflow de Desarrollo

### Para hacer cambios:
1. **Editar archivos en `src/`** ✅
2. **Ejecutar `npm run dev`** para development
3. **Ejecutar `npm run build`** para build de producción
4. **Commit y push** (solo `src/` se versiona)

### ❌ NO hacer:
- Editar archivos en `public/` (se sobrescriben)
- Versionar la carpeta `public/`
- Olvidar ejecutar `npm run sync` antes del build

## 📁 Estructura Final en Producción
```
dist/
├── index.html (página principal)
├── _redirects (configuración de rutas)
├── ui/
│   ├── auth/
│   │   └── index.html
│   ├── dashboard/
│   ├── heroes/
│   └── ...
├── sprites/
├── characters/
├── core/
├── render/
├── input/
├── music/
└── ...
```

## Verificación
El servidor de preview debe mostrar:
- ✅ `index.html` carga correctamente
- ✅ Redirección a `./ui/auth/index.html` funciona
- ✅ Todos los assets (imágenes, audio, etc.) se cargan correctamente
- ✅ No hay errores 404 en la consola del navegador

## URLs del Deploy
Una vez deployado en Netlify, las siguientes rutas deben funcionar:
- `/` - Página principal (redirige al login)
- `/ui/auth/` - Sistema de autenticación  
- `/ui/dashboard/` - Dashboard
- `/ui/heroes/` - Selección de héroes
- `/ui/villains/` - Selección de villanos
- `/ui/battle/` - Sistema de batalla
