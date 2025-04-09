// --- Manejo del envío del formulario de registro ---
// Se añade un listener al evento 'submit' del formulario de registro.
// Cuando el formulario se envía, se evita el comportamiento por defecto del navegador
// y se recogen los datos del nombre, email y contraseña ingresados por el usuario.
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar la recarga de la página

    // Recoger los valores de los campos del formulario de registro.
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // --- Envío de los datos al servidor para el registro ---
    // Se realiza una petición POST al endpoint de registro del servidor, enviando los datos
    // del nombre, email y contraseña en formato JSON para crear una nueva cuenta de usuario.
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
    })
    .then(response => {
        // Se verifica si la respuesta del servidor indica un error en el registro.
        if (!response.ok) {
            throw new Error('Error al registrar el usuario');
        }
        return response.text(); // Se espera una respuesta de texto del servidor (podría ser JSON también).
    })
    .then(data => {
        // Si el registro es exitoso, se muestra un mensaje del servidor al usuario.
        alert(data);
        // Después de mostrar el mensaje, se redirige al usuario a la página de inicio de sesión.
        window.location.href = 'login.html';
    })
    .catch(error => {
        // --- Manejo de errores durante la petición de registro ---
        // Si ocurre algún error durante la comunicación con el servidor o en la respuesta,
        // se muestra un mensaje de error en la consola y una alerta al usuario.
        console.error('Error al registrar el usuario:', error);
        alert('Error en el registro');
    });
});

// --- Verificación del token al cargar la página (similar a otras páginas) ---
// Se ejecuta cuando el DOM está completamente cargado para verificar si ya existe un token JWT
// en el almacenamiento local. Si existe, se intenta obtener la información del usuario
// para personalizar la interfaz (mostrar nombre, enlace de admin, botón de logout).
// Este bloque de código es común en varias páginas para mantener la sesión del usuario.
document.addEventListener("DOMContentLoaded", () => {
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // --- Obtención de la información del usuario si hay un token ---
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
});