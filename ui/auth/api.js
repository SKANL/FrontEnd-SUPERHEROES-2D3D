// api.js
// Lógica de comunicación con la API (mock para ejemplo)


export async function login(username, password) {
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 500));
    // Aquí puedes integrar tu API real
    if (username === 'admin' && password === '1234') {
        return { success: true, message: '¡Bienvenido! Has iniciado sesión correctamente.' };
    }
    return { success: false, message: 'Usuario o contraseña incorrectos.' };
}

export async function register(username, email, password) {
    // Simulación de llamada a API
    await new Promise(resolve => setTimeout(resolve, 700));
    // Aquí puedes integrar tu API real
    if (username && email && password) {
        return { success: true, message: '¡Registro exitoso! Bienvenido a la aventura.' };
    }
    return { success: false, message: 'Error en el registro. Verifica los datos.' };
}
