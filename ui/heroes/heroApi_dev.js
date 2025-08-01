// API para héroes con fallback para desarrollo
import { getToken, getUserIdFromToken } from '../auth/utils.js';

const API_BASE_URL = 'https://api-superheroes-production.up.railway.app';
const DEVELOPMENT_MODE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Base de datos local para desarrollo
let localHeroes = JSON.parse(localStorage.getItem('heroes-dev') || '[]');

// Función para generar ID único
function generateId() {
    return 'hero-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Guardar en almacenamiento local
function saveLocalHeroes() {
    localStorage.setItem('heroes-dev', JSON.stringify(localHeroes));
}

// Crear un héroe con datos de personaje del juego asociado
export async function createHero(heroData) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Creando héroe:', heroData);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(heroData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[HeroAPI] Héroe creado exitosamente:', result);
            return result;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        const errorText = await response.text();
        throw new Error(`Error al crear héroe: ${response.status} - ${errorText}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Usando almacenamiento local');
            
            const newHero = {
                _id: generateId(),
                ...heroData,
                ownerId: getUserIdFromToken(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            localHeroes.push(newHero);
            saveLocalHeroes();
            
            console.log('[HeroAPI] Héroe creado en modo desarrollo:', newHero);
            return newHero;
        }

        throw apiError;
    }
}

// Obtener héroes con información de personajes del juego
export async function getHeroes() {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Obteniendo héroes...');

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const heroes = await response.json();
            console.log('[HeroAPI] Héroes obtenidos de la API:', heroes);
            return heroes;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener héroes: ${response.status}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Usando almacenamiento local');
            const userId = getUserIdFromToken();
            
            // En desarrollo, mostrar todos los héroes si es admin, solo los propios si es user
            const userRole = await import('../auth/utils.js').then(m => m.getUserRoleFromTokenAsync());
            const filteredHeroes = userRole === 'admin' 
                ? localHeroes 
                : localHeroes.filter(hero => hero.ownerId === userId);
            
            console.log('[HeroAPI] Héroes del almacenamiento local:', filteredHeroes);
            return filteredHeroes;
        }

        throw apiError;
    }
}

// Obtener héroes por ciudad con datos de personajes del juego
export async function getHeroesByCity(city) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Obteniendo héroes por ciudad:', city);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes/city/${encodeURIComponent(city)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const heroes = await response.json();
            console.log('[HeroAPI] Héroes obtenidos por ciudad:', heroes);
            return heroes;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener héroes por ciudad: ${response.status}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Filtrando por ciudad en almacenamiento local');
            const userId = getUserIdFromToken();
            const userRole = await import('../auth/utils.js').then(m => m.getUserRoleFromTokenAsync());
            
            let filteredHeroes = userRole === 'admin' 
                ? localHeroes 
                : localHeroes.filter(hero => hero.ownerId === userId);
                
            filteredHeroes = filteredHeroes.filter(hero => 
                hero.city && hero.city.toLowerCase().includes(city.toLowerCase())
            );
            
            console.log('[HeroAPI] Héroes filtrados por ciudad:', filteredHeroes);
            return filteredHeroes;
        }

        throw apiError;
    }
}

// Obtener héroe por ID
export async function getHeroById(id) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Obteniendo héroe por ID:', id);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const hero = await response.json();
            console.log('[HeroAPI] Héroe obtenido por ID:', hero);
            return hero;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al obtener héroe: ${response.status}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Buscando en almacenamiento local');
            const hero = localHeroes.find(h => h._id === id);
            
            if (!hero) {
                throw new Error('Héroe no encontrado');
            }
            
            console.log('[HeroAPI] Héroe encontrado en local:', hero);
            return hero;
        }

        throw apiError;
    }
}

// Actualizar héroe
export async function updateHero(id, updateData) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Actualizando héroe:', id, updateData);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[HeroAPI] Héroe actualizado exitosamente:', result);
            return result;
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        const errorText = await response.text();
        throw new Error(`Error al actualizar héroe: ${response.status} - ${errorText}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Actualizando en almacenamiento local');
            
            const heroIndex = localHeroes.findIndex(h => h._id === id);
            if (heroIndex === -1) {
                throw new Error('Héroe no encontrado');
            }

            localHeroes[heroIndex] = {
                ...localHeroes[heroIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            saveLocalHeroes();
            
            console.log('[HeroAPI] Héroe actualizado en modo desarrollo:', localHeroes[heroIndex]);
            return localHeroes[heroIndex];
        }

        throw apiError;
    }
}

// Eliminar héroe
export async function deleteHero(id) {
    const token = getToken();
    if (!token) {
        throw new Error('Token no encontrado');
    }

    console.log('[HeroAPI] Eliminando héroe:', id);

    try {
        // Intentar con la API real primero
        const response = await fetch(`${API_BASE_URL}/api/heroes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('[HeroAPI] Héroe eliminado exitosamente');
            return { success: true };
        }

        // Si falla la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando fallback');
        }

        throw new Error(`Error al eliminar héroe: ${response.status}`);

    } catch (apiError) {
        console.warn('[HeroAPI] Error de API:', apiError);

        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[HeroAPI] Eliminando de almacenamiento local');
            
            const heroIndex = localHeroes.findIndex(h => h._id === id);
            if (heroIndex === -1) {
                throw new Error('Héroe no encontrado');
            }

            localHeroes.splice(heroIndex, 1);
            saveLocalHeroes();
            
            console.log('[HeroAPI] Héroe eliminado en modo desarrollo');
            return { success: true };
        }

        throw apiError;
    }
}
