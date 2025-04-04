document.addEventListener("DOMContentLoaded", () => {
    const tipoServiciosContainer = document.getElementById("tipo-servicios-container");
    const serviciosContainer = document.getElementById("servicios-container");
    const reservaForm = document.getElementById("reservaForm");
    const fechaInput = document.getElementById("fecha");
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const token = localStorage.getItem('jwtToken');
    const id_usuario = localStorage.getItem('id_usuario');

    let tipoSeleccionado = null;
    let servicioSeleccionado = null;
    let servicioSeleccionadoBoton = null; // Variable para almacenar el botón seleccionado

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
        window.location.href = 'login.html';
        return;
    }

    // Event listeners para los botones de tipo de servicio
    tipoServiciosContainer.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON") {
            tipoSeleccionado = event.target.value;
            console.log("Tipo seleccionado:", tipoSeleccionado);
            cargarServicios(tipoSeleccionado);
            serviciosContainer.style.display = "flex"; // Mostrar el contenedor de servicios
        }
    });

    // Función para cargar los servicios según el tipo seleccionado
    function cargarServicios(tipo) {
        serviciosContainer.innerHTML = ""; // Limpiar los botones anteriores
        servicioSeleccionado = null; // Resetear el servicio seleccionado
        servicioSeleccionadoBoton = null; // Resetear el botón seleccionado

        fetch(`http://localhost:3000/api/servicios/${tipo}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los servicios');
                }
                return response.json();
            })
            .then(data => {
                if (data.length > 0) {
                    data.forEach(servicio => {
                        let btnServicio = document.createElement("button");
                        btnServicio.type = "button";
                        btnServicio.value = servicio.nombre;
                        btnServicio.textContent = `${servicio.nombre} - $${servicio.precio}`;
                        btnServicio.classList.add('servicio-btn'); // Añadir clase para estilo
                        btnServicio.addEventListener("click", () => {
                            if (servicioSeleccionadoBoton) {
                                servicioSeleccionadoBoton.classList.remove('servicio-btn-seleccionado'); // Deseleccionar el anterior
                            }
                            servicioSeleccionado = servicio.nombre;
                            servicioSeleccionadoBoton = btnServicio;
                            servicioSeleccionadoBoton.classList.add('servicio-btn-seleccionado'); // Seleccionar el actual
                            console.log("Servicio seleccionado:", servicioSeleccionado);
                        });
                        serviciosContainer.appendChild(btnServicio);
                    });
                } else {
                    serviciosContainer.innerHTML = '<p>No hay servicios disponibles</p>';
                }
            })
            .catch(error => {
                console.error("Error al cargar los servicios:", error);
                serviciosContainer.innerHTML = '<p>Error al cargar servicios</p>';
            });
    }

    // Manejar el formulario de reserva
    reservaForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fecha = fechaInput.value;

        if (!tipoSeleccionado || !servicioSeleccionado || !fecha || !id_usuario) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const fechaLocal = new Date(fecha);
        const fechaISO = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000).toISOString();

        console.log("Enviando reserva con los siguientes datos:", { id_usuario, tipo: tipoSeleccionado, servicio: servicioSeleccionado, fecha: fechaISO });

        fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_usuario, tipo: tipoSeleccionado, servicio: servicioSeleccionado, fecha: fechaISO })
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
            serviciosContainer.innerHTML = ""; // Limpiar los botones de servicio
            serviciosContainer.style.display = "none"; // Ocultar el contenedor de servicios
            tipoSeleccionado = null;
            servicioSeleccionado = null;
            if (servicioSeleccionadoBoton) {
                servicioSeleccionadoBoton.classList.remove('servicio-btn-seleccionado');
                servicioSeleccionadoBoton = null;
            }
        })
        .catch(error => {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva.");
        });
    });
});