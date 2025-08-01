// api.js
// Lógica de comunicación con la API (mock para ejemplo)


export async function login(email, password) {
    try {
        console.log('[API][login] Request:', { email });
        const res = await fetch('https://api-superheroes-production.up.railway.app/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log('[API][login] Response:', data);
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            return { success: true, message: '¡Bienvenido! Has iniciado sesión correctamente.' };
        } else {
            return { success: false, message: data.message || 'Usuario o contraseña incorrectos.' };
        }
    } catch (err) {
        console.error('[API][login] Error:', err);
        return { success: false, message: 'Error de red o servidor.' };
    }
}

export async function register(username, email, password, role = 'user') {
    try {
        console.log('[API][register] Request:', { username, email, role });
        const res = await fetch('https://api-superheroes-production.up.railway.app/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });
        const data = await res.json();
        console.log('[API][register] Response:', data);
        if (res.ok && data.message) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || 'Error en el registro. Verifica los datos.' };
        }
    } catch (err) {
        console.error('[API][register] Error:', err);
        return { success: false, message: 'Error de red o servidor.' };
    }
}
