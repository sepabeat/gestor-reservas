document.addEventListener("DOMContentLoaded", () => {
    // --- Inicialización de elementos del DOM ---
    // Se obtienen referencias a elementos HTML como la tabla de reservas, el nombre del usuario,
    // el botón de cierre de sesión y el contenedor para el enlace de administración.

    const tablaAdminReservas = document.getElementById('tabla-admin-reservas').getElementsByTagName('tbody')[0];
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');

    // --- Verificación del token de autenticación ---
    // Se recupera el token JWT del almacenamiento local para verificar si el usuario está autenticado.
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // --- Obtención de la información del usuario autenticado ---
        // Si se encuentra un token, se realiza una petición al servidor para obtener los datos del usuario
        // y se actualiza la interfaz mostrando su nombre y configurando la funcionalidad de cierre de sesión.
        // También se verifica si el usuario tiene rol de administrador para mostrar el enlace a la gestión de reservas.
        fetch('http://localhost:3000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            userNameElement.textContent = `Bienvenido, Administrador ${user.nombre}`;
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

        // --- Obtención y visualización de las reservas pendientes (solo para administradores) ---
        // Se realiza una petición al servidor para obtener la lista de reservas pendientes.
        // Luego, se itera sobre cada reserva para crear una nueva fila en la tabla HTML
        // con los detalles de la reserva y los botones para aprobar o cancelar.
        fetch('http://localhost:3000/api/admin/reservas/pendientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(reservas => {
            reservas.forEach(reserva => {
                let row = tablaAdminReservas.insertRow();
                let cellUsuario = row.insertCell(0);
                let cellFechaHora = row.insertCell(1);
                let cellServicios = row.insertCell(2);
                let cellEstado = row.insertCell(3);
                let cellAcciones = row.insertCell(4);

                cellUsuario.textContent = reserva.nombre_usuario;
                cellFechaHora.textContent = new Date(reserva.fecha_hora).toLocaleString();
                cellFechaHora.classList.add('fecha-hora');
                cellServicios.textContent = reserva.servicios;
                cellServicios.classList.add('servicios');
                cellEstado.textContent = reserva.estado;
                cellEstado.classList.add('estado');

                let btnAprobar = document.createElement('button');
                btnAprobar.textContent = 'Aprobar';
                btnAprobar.classList.add('aprobar-btn');
                btnAprobar.addEventListener('click', () => aprobarReserva(reserva.id_reserva, row));
                cellAcciones.appendChild(btnAprobar);

                let btnCancelar = document.createElement('button');
                btnCancelar.textContent = 'Cancelar';
                btnCancelar.classList.add('cancelar-btn');
                btnCancelar.addEventListener('click', () => cancelarReserva(reserva.id_reserva, row));
                cellAcciones.appendChild(btnCancelar);

                cellAcciones.classList.add('acciones');
            });
        })
        .catch(error => {
            console.error('Error al obtener las reservas pendientes:', error);
            tablaAdminReservas.innerHTML = '<tr><td colspan="5">No se pudieron cargar las reservas pendientes.</td></tr>';
        });
    } else {
        // --- Redirección si no hay token ---
        // Si no se encuentra un token en el almacenamiento local, se redirige al usuario a la página de inicio de sesión.
        window.location.href = 'login.html';
    }

    // --- Funciones para actualizar el estado de las reservas ---
    // Estas funciones se llaman al hacer clic en los botones de "Aprobar" o "Cancelar" de cada reserva.
    // Muestran una confirmación al usuario y luego llaman a la función 'actualizarReserva' para enviar la petición al servidor.

    function aprobarReserva(idReserva, row) {
        if (confirm('¿Seguro que quieres aprobar esta reserva?')) {
            actualizarReserva(idReserva, 'confirmada', row, 'aprobada');
        }
    }

    function cancelarReserva(idReserva, row) {
        if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
            actualizarReserva(idReserva, 'cancelada', row, 'cancelada');
        }
    }

    // --- Función genérica para enviar la actualización del estado de la reserva al servidor ---
    // Realiza una petición PUT al endpoint correspondiente para modificar el estado de la reserva en la base de datos.
    // Actualiza la interfaz de usuario después de una respuesta exitosa o muestra un mensaje de error si falla.
    function actualizarReserva(idReserva, nuevoEstado, row, accion) {
        fetch(`http://localhost:3000/api/reservas/${idReserva}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al ${accion} la reserva`);
            }
            return response.text();
        })
        .then(message => {
            alert(`Reserva ${accion} con éxito`);
            row.cells[3].textContent = nuevoEstado;
            row.cells[4].innerHTML = nuevoEstado;
        })
        .catch(error => {
            console.error(`Error al ${accion} la reserva:`, error);
            alert(`Hubo un error al ${accion} la reserva.`);
        });
     }
});