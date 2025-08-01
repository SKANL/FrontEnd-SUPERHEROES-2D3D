// API para villanos con fallback para desarrollo
import { getToken, getUserIdFromToken } from '../auth/utils.js';

const API_BASE_URL = 'https://api-superheroes-production.up.railway.app';
const DEVELOPMENT_MODE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Base de datos local para desarrollo
let localVillains = JSON.parse(localStorage.getItem('villains-dev') || '[]');

// Función para generar ID único
function generateId() {
    return 'villain-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Guardar en almacenamiento local
function saveLocalVillains() {
    localStorage.setItem('villains-dev', JSON.stringify(localVillains));
}

// Crear un villano con datos de personaje del juego asociado
export async function createVillain(villainData) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Creando villano:', villainData);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(villainData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[VillainAPI] Villano creado exitosamente:', result);
            return result;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        const errorText = await response.text();
        throw new Error(`Error al crear villano: ${response.status} - ${errorText}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Usando almacenamiento local');
            
            const newVillain = {
                _id: generateId(),
                ...villainData,
                ownerId: getUserIdFromToken(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            localVillains.push(newVillain);
            saveLocalVillains();
            
            console.log('[VillainAPI] Villano creado en modo desarrollo:', newVillain);
            return newVillain;
        }

        throw apiError;
    }
}

// Obtener villanos con información de personajes del juego
export async function getVillains() {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Obteniendo villanos...');

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const villains = await response.json();
            console.log('[VillainAPI] Villanos obtenidos de la API:', villains);
            return villains;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener villanos: ${response.status}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Usando almacenamiento local');
            const userId = getUserIdFromToken();
            
            // En desarrollo, mostrar todos los villanos si es admin, solo los propios si es user
            const userRole = await import('../auth/utils.js').then(m => m.getUserRoleFromTokenAsync());
            const filteredVillains = userRole === 'admin' 
                ? localVillains 
                : localVillains.filter(villain => villain.ownerId === userId);
            
            console.log('[VillainAPI] Villanos del almacenamiento local:', filteredVillains);
            return filteredVillains;
        }

        throw apiError;
    }
}

// Obtener villanos por ciudad
export async function getVillainsByCity(city) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Obteniendo villanos por ciudad:', city);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains/city/${encodeURIComponent(city)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const villains = await response.json();
            console.log('[VillainAPI] Villanos obtenidos por ciudad:', villains);
            return villains;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener villanos por ciudad: ${response.status}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Filtrando por ciudad en almacenamiento local');
            const userId = getUserIdFromToken();
            const userRole = await import('../auth/utils.js').then(m => m.getUserRoleFromTokenAsync());
            
            let filteredVillains = userRole === 'admin' 
                ? localVillains 
                : localVillains.filter(villain => villain.ownerId === userId);
                
            filteredVillains = filteredVillains.filter(villain => 
                villain.city && villain.city.toLowerCase().includes(city.toLowerCase())
            );
            
            console.log('[VillainAPI] Villanos filtrados por ciudad:', filteredVillains);
            return filteredVillains;
        }

        throw apiError;
    }
}

// Obtener villano por ID
export async function getVillainById(id) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Obteniendo villano por ID:', id);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const villain = await response.json();
            console.log('[VillainAPI] Villano obtenido por ID:', villain);
            return villain;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener villano: ${response.status}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Buscando en almacenamiento local');
            const villain = localVillains.find(v => v._id === id);
            
            if (!villain) {
                throw new Error('Villano no encontrado');
            }
            
            console.log('[VillainAPI] Villano encontrado en local:', villain);
            return villain;
        }

        throw apiError;
    }
}

// Actualizar villano
export async function updateVillain(id, updateData) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Actualizando villano:', id, updateData);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[VillainAPI] Villano actualizado exitosamente:', result);
            return result;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        const errorText = await response.text();
        throw new Error(`Error al actualizar villano: ${response.status} - ${errorText}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Actualizando en almacenamiento local');
            
            const villainIndex = localVillains.findIndex(v => v._id === id);
            if (villainIndex === -1) {
                throw new Error('Villano no encontrado');
            }

            localVillains[villainIndex] = {
                ...localVillains[villainIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            saveLocalVillains();
            
            console.log('[VillainAPI] Villano actualizado en modo desarrollo:', localVillains[villainIndex]);
            return localVillains[villainIndex];
        }

        throw apiError;
    }
}

// Eliminar villano
export async function deleteVillain(id) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[VillainAPI] Eliminando villano:', id);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/villains/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('[VillainAPI] Villano eliminado exitosamente');
            return { success: true };
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al eliminar villano: ${response.status}`);

    } catch (apiError) {
        console.warn('[VillainAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[VillainAPI] Eliminando de almacenamiento local');
            
            const villainIndex = localVillains.findIndex(v => v._id === id);
            if (villainIndex === -1) {
                throw new Error('Villano no encontrado');
            }

            localVillains.splice(villainIndex, 1);
            saveLocalVillains();
            
            console.log('[VillainAPI] Villano eliminado en modo desarrollo');
            return { success: true };
        }

        throw apiError;
    }
}
