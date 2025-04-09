document.addEventListener("DOMContentLoaded", () => {
    // --- Inicialización de elementos del DOM y variables ---
    // Se obtienen referencias a los contenedores de tipos de servicios y servicios,
    // el formulario de reserva, el input de fecha, elementos para la información del usuario
    // y se recuperan el token y el ID del usuario del almacenamiento local.
    // También se inicializan variables para almacenar el tipo y servicio seleccionado.

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
    let servicioSeleccionadoBoton = null; // Para gestionar la selección visual del botón de servicio

    // --- Verificación y manejo del token de autenticación (similar a otras páginas) ---
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

    // --- Redirección si no hay token o ID de usuario ---
    // Si no se encuentra el token o el ID del usuario, se alerta al usuario y se redirige a la página de login.
    if (!token || !id_usuario) {
        alert('Debes iniciar sesión para realizar una reserva.');
        window.location.href = 'login.html';
        return;
    }

    // --- Evento para la selección del tipo de servicio ---
    // Se añade un listener al contenedor de los botones de tipo de servicio.
    // Cuando se hace clic en un botón, se almacena el tipo seleccionado y se cargan los servicios correspondientes.
    tipoServiciosContainer.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON") {
            tipoSeleccionado = event.target.value;
            console.log("Tipo seleccionado:", tipoSeleccionado);
            cargarServicios(tipoSeleccionado);
            serviciosContainer.style.display = "flex"; // Mostrar el contenedor de servicios
        }
    });

    // --- Función para cargar dinámicamente los servicios según el tipo ---
    // Realiza una petición al servidor para obtener los servicios filtrados por el tipo seleccionado.
    // Crea botones para cada servicio y permite la selección de uno de ellos.
    function cargarServicios(tipo) {
        serviciosContainer.innerHTML = ""; // Limpiar los botones de servicio anteriores
        servicioSeleccionado = null; // Resetear el servicio seleccionado
        servicioSeleccionadoBoton = null; // Resetear la selección visual del botón

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
                        btnServicio.classList.add('servicio-btn'); // Clase para estilos
                        btnServicio.addEventListener("click", () => {
                            // Lógica para manejar la selección visual de los botones de servicio
                            if (servicioSeleccionadoBoton) {
                                servicioSeleccionadoBoton.classList.remove('servicio-btn-seleccionado');
                            }
                            servicioSeleccionado = servicio.nombre;
                            servicioSeleccionadoBoton = btnServicio;
                            servicioSeleccionadoBoton.classList.add('servicio-btn-seleccionado');
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

    // --- Manejo del envío del formulario de reserva ---
    // Se añade un listener al formulario de reserva. Cuando se envía, se recogen los datos
    // del tipo, servicio, fecha y ID del usuario, y se envían al servidor para crear la reserva.
    reservaForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const fecha = fechaInput.value;

        // Validación de campos obligatorios
        if (!tipoSeleccionado || !servicioSeleccionado || !fecha || !id_usuario) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Formatear la fecha a ISO para el envío al servidor
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
            // Mostrar mensaje de éxito y resetear el formulario y la selección de servicios
            alert(data.message);
            reservaForm.reset();
            serviciosContainer.innerHTML = "";
            serviciosContainer.style.display = "none";
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