document.addEventListener("DOMContentLoaded", () => {
    const tablaAdminReservas = document.getElementById('tabla-admin-reservas').getElementsByTagName('tbody')[0];
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container'); // Obtener el contenedor del enlace de admin

    const token = localStorage.getItem('jwtToken');

    if (token) {
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

        // Obtener todas las reservas pendientes (solo para administradores)
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

                // Botones de Aceptar y Cancelar
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
        window.location.href = 'login.html'; // Redirigir si no hay token
    }

    // Función para aprobar una reserva
    function aprobarReserva(idReserva, row) {
        if (confirm('¿Seguro que quieres aprobar esta reserva?')) {
            actualizarReserva(idReserva, 'confirmada', row, 'aprobada'); // Mensaje personalizado
        }
    }

    // Función para cancelar una reserva
    function cancelarReserva(idReserva, row) {
        if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
            actualizarReserva(idReserva, 'cancelada', row, 'cancelada'); // Mensaje personalizado
        }
    }

    // Función genérica para actualizar el estado de la reserva
    function actualizarReserva(idReserva, nuevoEstado, row, accion) {
        fetch(`http://localhost:3000/api/reservas/${idReserva}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Importante: Enviar el token
            },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al ${accion} la reserva`); // Usar la acción personalizada
            }
            return response.text();
        })
        .then(message => {
            alert(`Reserva ${accion} con éxito`); // Usar la acción personalizada
            row.cells[3].textContent = nuevoEstado; // Actualizar el estado en la tabla
            row.cells[4].innerHTML = nuevoEstado; // Actualizar la celda de acciones
        })
        .catch(error => {
            console.error(`Error al ${accion} la reserva:`, error); // Usar la acción personalizada
            alert(`Hubo un error al ${accion} la reserva.`);
        });
     }
});