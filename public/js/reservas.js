document.addEventListener("DOMContentLoaded", () => {
    const tipoPeluqueria = document.getElementById("tipo");
    const servicioSelect = document.getElementById("servicio");
    const reservaForm = document.getElementById("reservaForm");
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');
    const id_usuario = localStorage.getItem('id_usuario');

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

    if (!token || !id_usuario) {
        alert('Debes iniciar sesión para realizar una reserva.');
        window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
        return; // Detener la ejecución del resto del código
    }

    // Función para cargar los servicios según el tipo de peluquería seleccionado
    tipoPeluqueria.addEventListener("change", (event) => {
        const tipoSeleccionado = event.target.value;
        console.log("Tipo seleccionado:", tipoSeleccionado);

        servicioSelect.innerHTML = "";

        if (tipoSeleccionado) {
            console.log(`Haciendo solicitud a: http://localhost:3000/api/servicios/${tipoSeleccionado}`);

            fetch(`http://localhost:3000/api/servicios/${tipoSeleccionado}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al cargar los servicios');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.length > 0) {
                        data.forEach(servicio => {
                            let option = document.createElement("option");
                            option.value = servicio.nombre;
                            option.textContent = `${servicio.nombre} - $${servicio.precio}`;
                            servicioSelect.appendChild(option);
                        });
                    } else {
                        servicioSelect.innerHTML = '<option value="">No hay servicios disponibles</option>';
                    }
                })
                .catch(error => {
                    console.error("Error al cargar los servicios:", error);
                    servicioSelect.innerHTML = '<option value="">Error al cargar servicios</option>';
                });
        } else {
            servicioSelect.innerHTML = '<option value="">Selecciona un tipo de peluquería primero</option>';
        }
    });

    // Manejar el formulario de reserva
    reservaForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const tipo = tipoPeluqueria.value;
        const servicio = servicioSelect.value;
        const fecha = document.getElementById("fecha").value;

        if (!tipo || !servicio || !fecha || !id_usuario) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const fechaLocal = new Date(fecha);
        const fechaISO = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000).toISOString();

        console.log("Enviando reserva con los siguientes datos:", { id_usuario, tipo, servicio, fechaISO });

        fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_usuario, tipo, servicio, fecha: fechaISO })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al realizar la reserva');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            reservaForm.reset();
        })
        .catch(error => {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva.");
        });
    });
});