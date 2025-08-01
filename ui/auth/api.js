// api.js
// Lógica de comunicación con la API con fallback para desarrollo

// Configuración de la API
const API_BASE_URL = 'https://api-superheroes-production.up.railway.app';
const DEVELOPMENT_MODE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

// Datos de prueba para desarrollo
const DEMO_USERS = {
    'admin@superheroes.com': { password: 'admin123', role: 'admin', username: 'Admin', id: 'admin-001' },
    'user@superheroes.com': { password: 'user123', role: 'user', username: 'Usuario', id: 'user-001' },
    'demo@demo.com': { password: 'demo', role: 'user', username: 'Demo', id: 'demo-001' }
};

// Función para crear token de desarrollo
function createDevelopmentToken(user) {
    const payload = {
        id: user.id,
        email: user.email || Object.keys(DEMO_USERS).find(email => DEMO_USERS[email] === user),
        role: user.role,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
    // Token simulado (en producción sería un JWT real)
    return 'dev-token-' + btoa(JSON.stringify(payload));
}

export async function login(email, password) {
    console.log('[API][login] Intentando login para:', email);
    
    // Intentar primero con la API real
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log('[API][login] API Response:', data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user || { email, role: 'user' }));
                return { success: true, message: '¡Bienvenido! Has iniciado sesión correctamente.' };
            }
        }
        
        // Si no funciona la API, usar fallback en desarrollo
        if (DEVELOPMENT_MODE) {
            throw new Error('API no disponible, usando modo desarrollo');
        }
        
        const data = await res.json();
        return { success: false, message: data.message || 'Usuario o contraseña incorrectos.' };
        
    } catch (apiError) {
        console.warn('[API][login] Error de API:', apiError);
        
        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[API][login] Usando modo desarrollo');
            
            // Verificar usuarios demo primero
            let user = DEMO_USERS[email];
            
            // Si no está en demo users, verificar usuarios registrados
            if (!user) {
                const registeredUsers = JSON.parse(localStorage.getItem('dev_registered_users') || '{}');
                user = registeredUsers[email];
            }
            
            if (user && user.password === password) {
                const token = createDevelopmentToken(user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({ 
                    email, 
                    role: user.role, 
                    username: user.username,
                    id: user.id
                }));
                console.log('[API][login] Login exitoso en modo desarrollo');
                return { success: true, message: `¡Bienvenido ${user.username}! (Modo desarrollo)` };
            } else {
                return { 
                    success: false, 
                    message: 'Credenciales incorrectas. Verifica tu email y contraseña, o regístrate si no tienes cuenta.' 
                };
            }
        }
        
        return { success: false, message: 'Error de conexión con el servidor.' };
    }
}

export async function register(username, email, password, role = 'user') {
    console.log('[API][register] Intentando registro para:', { username, email, role });
    
    // Validaciones básicas
    if (!username || !email || !password) {
        return { success: false, message: 'Todos los campos son requeridos' };
    }
    
    if (password.length < 4) {
        return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });
        
        if (res.ok) {
            const data = await res.json();
            console.log('[API][register] API Response:', data);
            return { 
                success: true, 
                message: data.message || `¡Registro exitoso! Bienvenido ${username}. Ahora puedes iniciar sesión.` 
            };
        }
        
        // Si hay error en la API, intentar obtener el mensaje
        try {
            const errorData = await res.json();
            if (DEVELOPMENT_MODE) {
                throw new Error('API no disponible, usando modo desarrollo');
            }
            return { 
                success: false, 
                message: errorData.message || 'Error en el registro. Por favor, intenta nuevamente.' 
            };
        } catch (parseError) {
            if (DEVELOPMENT_MODE) {
                throw new Error('API no disponible, usando modo desarrollo');
            }
            return { success: false, message: 'Error en el servidor. Por favor, intenta más tarde.' };
        }
        
    } catch (apiError) {
        console.warn('[API][register] Error de API:', apiError);
        
        // Fallback para desarrollo
        if (DEVELOPMENT_MODE) {
            console.log('[API][register] Usando modo desarrollo');
            
            // Verificar si el email ya existe en demo users
            if (DEMO_USERS[email]) {
                return { 
                    success: false, 
                    message: 'Este correo electrónico ya está registrado. Intenta con otro email.' 
                };
            }
            
            // Simular registro exitoso
            if (email && password && username) {
                const newUser = {
                    id: 'dev-' + Date.now(),
                    username,
                    email,
                    role,
                    password
                };
                
                // Guardar en localStorage para simular persistencia
                const registeredUsers = JSON.parse(localStorage.getItem('dev_registered_users') || '{}');
                registeredUsers[email] = newUser;
                localStorage.setItem('dev_registered_users', JSON.stringify(registeredUsers));
                
                console.log('[API][register] Registro simulado exitoso para:', username);
                return { 
                    success: true, 
                    message: `¡Registro exitoso! Bienvenido ${username}. Ahora puedes iniciar sesión. (Modo desarrollo)` 
                };
            } else {
                return { success: false, message: 'Todos los campos son requeridos' };
            }
        }
        
        return { success: false, message: 'Error de conexión con el servidor. Verifica tu conexión a internet.' };
    }
}
