document.addEventListener("DOMContentLoaded", () => {
    const btnReservar = document.getElementById("btnReservar");
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');

    if (btnReservar) {
        btnReservar.addEventListener("click", () => {
            window.location.href = "reservas.html";
        });
    }

    const token = localStorage.getItem('jwtToken');

    if (token) {
        fetch('http://localhost:3000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            userNameElement.textContent = `Bienvenido, ${user.nombre}`;
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('id_usuario');
                window.location.href = 'login.html';
            });
        })
        .catch(error => {
            console.error('Error al obtener la información del usuario:', error);
            userNameElement.textContent = 'Usuario no autenticado';
            logoutButton.style.display = 'none'; // Ocultar el botón de cerrar sesión
        });
    } else {
        userNameElement.textContent = 'Usuario no autenticado';
        logoutButton.style.display = 'none'; // Ocultar el botón de cerrar sesión
    }
});