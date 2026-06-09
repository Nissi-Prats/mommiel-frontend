// Función para cerrar sesión en cualquier página
function cerrarSesionMommiel() {
    localStorage.removeItem('token_mommiel');
    localStorage.removeItem('user_rol');
    localStorage.removeItem('user_nombre');
    alert('✿ Sesión cerrada correctamente. ¡Vuelve pronto!');
    window.location.href = 'login.html';
}

// Función para verificar si un usuario común está logueado 
function verificarSesionCliente() {
    const token = localStorage.getItem('token_mommiel');
    if (!token) {
        alert('Debes iniciar sesión para acceder a esta sección.');
        window.location.href = 'login.html';
    }
}