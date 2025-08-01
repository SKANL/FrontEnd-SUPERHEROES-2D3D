// Configuración centralizada de la API
export const API_CONFIG = {
    // Detectar si estamos en desarrollo o producción
    DEVELOPMENT_MODE: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost',
    
    // En producción usar rutas relativas para aprovechar el proxy de Netlify
    // En desarrollo usar la URL completa
    getBaseUrl() {
        return this.DEVELOPMENT_MODE 
            ? 'https://api-superheroes-production.up.railway.app' 
            : '';
    },
    
    // Configuración de headers por defecto
    getDefaultHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (includeAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    // Crear URL completa para endpoints
    createUrl(endpoint) {
        const baseUrl = this.getBaseUrl();
        // Asegurar que el endpoint comience con /
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }
};

// Helper para hacer llamadas a la API
export async function apiCall(endpoint, options = {}) {
    const url = API_CONFIG.createUrl(endpoint);
    const config = {
        ...options,
        headers: {
            ...API_CONFIG.getDefaultHeaders(),
            ...options.headers
        }
    };
    
    console.log(`[API] Llamada a: ${url}`);
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error(`[API] Error en ${url}:`, error);
        throw error;
    }
}
