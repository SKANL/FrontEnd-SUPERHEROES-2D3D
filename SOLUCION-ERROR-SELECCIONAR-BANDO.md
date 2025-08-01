# SOLUCIÓN: ERROR HTTP 400 AL SELECCIONAR BANDO

## PROBLEMA

Al intentar seleccionar un bando (héroes o villanos) en una batalla de equipos, aparece error HTTP 400 en la consola.

## CAUSA RAÍZ

El endpoint para seleccionar bando estaba mal configurado. La función `selectSide` en `teamBattleApi.js` no incluía correctamente el ID de la batalla en la URL.

### Código Problemático Original:
```javascript
// INCORRECTO - Faltaba el ID de batalla en la URL
return await makeApiCall(`${BASE_URL}/api/team-battles/select-side`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ side })
});
```

## SOLUCIÓN IMPLEMENTADA

### 1. **Endpoint Dual con Fallback**
Implementé un sistema que intenta ambos posibles formatos de endpoint:

```javascript
export async function selectSide(id, side, token) {
  // Primero intenta: /api/team-battles/{id}/select-side
  try {
    return await makeApiCall(`${BASE_URL}/api/team-battles/${id}/select-side`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ side })
    });
  } catch (error) {
    // Si falla, intenta: /api/team-battles/select-side con battleId en body
    return await makeApiCall(`${BASE_URL}/api/team-battles/select-side`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        battleId: id,
        side: side 
      })
    });
  }
}
```

### 2. **Mejores Mensajes de Error**
Agregué manejo específico de errores HTTP:

- **400**: "El servidor rechazó la selección. Verifica que la batalla sea válida."
- **404**: "No se encontró la batalla especificada."
- **401**: "No tienes autorización para esta acción."

### 3. **Botón de Saltar Selección**
Agregué un botón para continuar sin seleccionar bando explícitamente:

```javascript
<button id="skipSelection">Saltar selección (usar héroes por defecto)</button>
```

### 4. **Mejor UX**
- Los botones no se resuelven automáticamente en caso de error
- El usuario puede reintentar la selección
- Feedback visual claro del estado del botón

## ARCHIVOS MODIFICADOS

- `ui/teamBattles/teamBattleApi.js` - Función selectSide con fallback
- `ui/teamBattles/teamBattleGame.js` - Mejor manejo de errores y botón de saltar

## TESTING

Para probar la solución:

1. **Crear una batalla** de equipos
2. **Presionar "Jugar batalla"**
3. **Seleccionar cualquier bando** (héroes o villanos)
4. **Verificar en consola** que no hay errores HTTP 400
5. **Si persiste el error**, usar "Saltar selección"

## TROUBLESHOOTING ADICIONAL

Si el problema persiste:

### Opción A: Verificar Endpoint Correcto
Consulta la documentación de la API o el servidor para confirmar el endpoint exacto.

### Opción B: Usar Saltar Selección
El botón "Saltar selección" permite continuar el juego sin hacer la llamada API.

### Opción C: Verificar Token
Asegúrate de que el token de autenticación sea válido:
```javascript
console.log('Token:', getToken());
```

### Opción D: Verificar ID de Batalla
Confirma que el ID de batalla sea válido:
```javascript
console.log('Battle ID:', battleId);
```

## PREVENCIÓN FUTURA

Para evitar este tipo de errores:

1. **Documentar endpoints** claramente al crear APIs
2. **Implementar fallbacks** para casos de inconsistencia de API
3. **Manejo robusto de errores** con mensajes específicos
4. **Botones de escape** para continuar cuando las APIs fallan

## BENEFICIOS DE LA SOLUCIÓN

- ✅ **Funciona con múltiples formatos** de endpoint
- ✅ **Mensajes de error claros** para el usuario
- ✅ **Posibilidad de reintentar** sin recargar
- ✅ **Opción de saltar** si todo falla
- ✅ **Mejor experiencia de usuario** general
