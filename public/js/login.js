// --- Manejo del envío del formulario de login ---
// Se añade un listener al evento 'submit' del formulario de login.
// Cuando el formulario se envía, se evita el comportamiento por defecto del navegador
// y se recogen los datos del email y la contraseña ingresados por el usuario.
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar la recarga de la página

    // Recoger los valores de los campos de email y contraseña del formulario.
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // --- Envío de los datos al servidor para autenticación ---
    // Se realiza una petición POST al endpoint de login del servidor, enviando los datos
    // de email y contraseña en formato JSON para su verificación.
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        // Se verifica si la respuesta del servidor indica un error en la autenticación.
        if (!response.ok) {
            throw new Error('Error en la autenticación');
        }
        // Si la autenticación es exitosa, se parsea la respuesta JSON.
        return response.json();
    })
    .then(data => {
        console.log("Respuesta del servidor:", data); // Para depuración, muestra la respuesta del servidor.

        // --- Almacenamiento del token y redirección en caso de éxito ---
        // Si la respuesta del servidor contiene un token JWT y un ID de usuario,
        // se almacenan estos datos en el localStorage del navegador.
        // Luego, se muestra una alerta de éxito y se redirige al usuario a la página principal.
        if (data.token && data.id_usuario) {
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('id_usuario', data.id_usuario);

            alert('Inicio de sesión exitoso');
            window.location.href = 'index.html';
        } else {
            // Si la respuesta del servidor no contiene los datos esperados,
            // se muestra una alerta indicando credenciales incorrectas o un problema con la respuesta.
            alert('Credenciales incorrectas o falta de datos en la respuesta');
        }
    })
    .catch(error => {
        // --- Manejo de errores durante la petición de login ---
        // Si ocurre algún error durante la comunicación con el servidor,
        // se muestra un mensaje de error en la consola y una alerta al usuario.
        console.error('Error al hacer login:', error);
        alert('Error en el servidor');
    });
});

// --- Verificación del token al cargar la página ---
// Se ejecuta cuando el DOM está completamente cargado para verificar si ya existe un token JWT
// en el almacenamiento local. Si existe, se intenta obtener la información del usuario
// para personalizar la interfaz (mostrar nombre, enlace de admin, botón de logout).
document.addEventListener("DOMContentLoaded", () => {
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // --- Obtención de la información del usuario si hay un token ---
        // Se realiza una petición al servidor para obtener los datos del usuario utilizando el token.
        // Se actualiza el nombre del usuario en la interfaz, se configura el botón de logout
        // y se muestra el enlace de administración si el usuario tiene el rol adecuado.
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
            // --- Manejo de errores al obtener la información del usuario ---
            // Si ocurre un error al obtener la información del usuario con el token,
            // se muestra un mensaje de error en la consola y se indica que el usuario no está autenticado.
            console.error('Error al obtener la información del usuario:', error);
            userNameElement.textContent = 'Usuario no autenticado';
            logoutButton.style.display = 'none';
        });
    } else {
        // --- Estado si no hay token ---
        // Si no se encuentra un token en el localStorage al cargar la página,
        // se indica que el usuario no está autenticado y se oculta el botón de logout.
        userNameElement.textContent = 'Usuario no autenticado';
        logoutButton.style.display = 'none';
    }
});