document.addEventListener("DOMContentLoaded", () => {
    const tablaReservas = document.getElementById('tabla-reservas').getElementsByTagName('tbody')[0];
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // Obtener información del usuario
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

        // Obtener las reservas del usuario
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

                // Botón de cancelar (solo si el estado no es "cancelada")
                if (reserva.estado !== 'cancelada') {
                    let btnCancelar = document.createElement('button');
                    btnCancelar.textContent = 'Cancelar';
                    btnCancelar.classList.add('cancelar-btn');
                    btnCancelar.addEventListener('click', () => cancelarReserva(reserva.id_reserva, row));
                    cellAcciones.appendChild(btnCancelar);
                } else {
                    cellAcciones.textContent = 'Cancelada'; // Mostrar texto en lugar del botón
                }
                cellAcciones.classList.add('acciones');
            });
        })
        .catch(error => {
            console.error('Error al obtener las reservas:', error);
            tablaReservas.innerHTML = '<tr><td colspan="4">No se pudieron cargar las reservas.</td></tr>';
        });
    } else {
        window.location.href = 'login.html'; // Redirigir si no hay token
    }

    // Función para cancelar la reserva
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
                row.cells[2].textContent = 'cancelada'; // Actualizar el estado en la tabla
                row.cells[3].innerHTML = 'Cancelada'; // Actualizar la celda de acciones
            })
            .catch(error => {
                console.error('Error al cancelar la reserva:', error);
                alert('Hubo un error al cancelar la reserva.');
            });
        }
    }
});