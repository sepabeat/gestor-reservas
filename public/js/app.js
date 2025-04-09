document.addEventListener("DOMContentLoaded", () => {
    // --- Inicialización de elementos del DOM y obtención del token ---
    // Se obtienen referencias a elementos HTML como el botón de reservar, el nombre del usuario,
    // el botón de cierre de sesión y el contenedor para el enlace de administración.
    // También se recupera el token JWT del almacenamiento local.

    const btnReservar = document.getElementById("btnReservar");
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');

    // --- Verificación y manejo del token de autenticación ---
    // Se verifica si existe un token. Si existe, se realiza una petición al servidor para obtener
    // la información del usuario. Se actualiza la interfaz con el nombre del usuario,
    // se configura la funcionalidad del botón de cierre de sesión y se muestra el enlace
    // de administración si el usuario tiene el rol de administrador. Si no hay token,
    // se indica que el usuario no está autenticado.

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

            if (user.rol === 'admin') {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin-reservas.html';
                adminLink.textContent = 'Admin Reservas';
                const adminLi = document.createElement('li');
                adminLi.appendChild(adminLink);
                adminLinkContainer.appendChild(adminLi);
            }
        })
        .catch(error => {
            console.error('Error al obtener la información del usuario:', error);
            userNameElement.textContent = 'Usuario no autenticado';
            logoutButton.style.display = 'none';
        });
    } else {
        userNameElement.textContent = 'Usuario no autenticado';
        logoutButton.style.display = 'none';
    }

    // --- Evento para el botón de reservar ---
    // Si el botón de reservar existe en el DOM, se añade un event listener para redirigir
    // al usuario a la página de reservas cuando se hace clic en él.

    if (btnReservar) {
        btnReservar.addEventListener("click", () => {
            window.location.href = "reservas.html";
        });
    }
});