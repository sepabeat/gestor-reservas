document.addEventListener("DOMContentLoaded", () => {
    // --- Inicialización de elementos del DOM y obtención del token ---
    // Se obtienen referencias a elementos HTML como la tabla de reservas del usuario,
    // el nombre del usuario, el botón de cierre de sesión y el contenedor para el enlace de administración.
    // También se recupera el token JWT del almacenamiento local.

    const tablaReservas = document.getElementById('tabla-reservas').getElementsByTagName('tbody')[0];
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');

    // --- Verificación y manejo del token de autenticación ---
    // Se verifica si existe un token. Si existe, se realiza una petición al servidor para obtener
    // la información del usuario y se actualiza la interfaz mostrando su nombre y configurando
    // la funcionalidad de cierre de sesión. También se verifica si el usuario tiene rol de administrador
    // para mostrar el enlace a la gestión de reservas. Si no hay token, se redirige al usuario a la página de login.

    if (token) {
        // --- Obtención de la información del usuario autenticado ---
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

        // --- Obtención y visualización de las reservas del usuario ---
        // Se realiza una petición al servidor para obtener la lista de reservas del usuario autenticado.
        // Luego, se itera sobre cada reserva para crear una nueva fila en la tabla HTML
        // con los detalles de la reserva y un botón para cancelar (si el estado no es 'cancelada').
        fetch('http://localhost:3000/api/reservas/usuario', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(reservas => {
            reservas.forEach(reserva => {
                let row = tablaReservas.insertRow();
                let cellFechaHora = row.insertCell(0);
                let cellServicios = row.insertCell(1);
                let cellEstado = row.insertCell(2);
                let cellAcciones = row.insertCell(3);

                cellFechaHora.textContent = new Date(reserva.fecha_hora).toLocaleString();
                cellFechaHora.classList.add('fecha-hora');
                cellServicios.textContent = reserva.servicios;
                cellServicios.classList.add('servicios');
                cellEstado.textContent = reserva.estado;
                cellEstado.classList.add('estado');

                // Botón de cancelar condicional
                if (reserva.estado !== 'cancelada') {
                    let btnCancelar = document.createElement('button');
                    btnCancelar.textContent = 'Cancelar';
                    btnCancelar.classList.add('cancelar-btn');
                    btnCancelar.addEventListener('click', () => cancelarReserva(reserva.id_reserva, row));
                    cellAcciones.appendChild(btnCancelar);
                } else {
                    cellAcciones.textContent = 'Cancelada';
                }
                cellAcciones.classList.add('acciones');
            });
        })
        .catch(error => {
            console.error('Error al obtener las reservas:', error);
            tablaReservas.innerHTML = '<tr><td colspan="4">No se pudieron cargar las reservas.</td></tr>';
        });
    } else {
        // --- Redirección si no hay token ---
        window.location.href = 'login.html';
    }

    // --- Función para cancelar una reserva del usuario ---
    // Esta función se llama al hacer clic en el botón "Cancelar" de una reserva específica.
    // Muestra una confirmación al usuario y luego realiza una petición PUT al servidor
    // para actualizar el estado de la reserva a 'cancelada'. Finalmente, actualiza la interfaz.
    function cancelarReserva(idReserva, row) {
        if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
            fetch(`http://localhost:3000/api/reservas/${idReserva}`, {
                method: 'PUT',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cancelar la reserva');
                }
                return response.text();
            })
            .then(message => {
                alert(message);
                row.cells[2].textContent = 'cancelada';
                row.cells[3].innerHTML = 'Cancelada';
            })
            .catch(error => {
                console.error('Error al cancelar la reserva:', error);
                alert('Hubo un error al cancelar la reserva.');
            });
        }
    }
});