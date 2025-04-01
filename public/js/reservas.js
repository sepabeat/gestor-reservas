document.addEventListener("DOMContentLoaded", () => {
    const tipoPeluqueria = document.getElementById("tipo");
    const servicioSelect = document.getElementById("servicio");

    // Función para cargar los servicios según el tipo de peluquería seleccionado
    tipoPeluqueria.addEventListener("change", (event) => {
        const tipoSeleccionado = event.target.value;
        console.log("Tipo seleccionado:", tipoSeleccionado); // Ver qué tipo se selecciona

        servicioSelect.innerHTML = ""; // Limpiar las opciones anteriores

        if (tipoSeleccionado) {
            console.log(`Haciendo solicitud a: http://localhost:3000/api/servicios/${tipoSeleccionado}`);

            // Hacer la solicitud al backend para obtener los servicios
            fetch(`http://localhost:3000/api/servicios/${tipoSeleccionado}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al cargar los servicios');
                    }
                    return response.json();
                })
                .then(data => {
                    // Si hay servicios, agregar las opciones al select
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
    document.getElementById("reservaForm").addEventListener("submit", (event) => {
        event.preventDefault();

        // Obtener los valores del formulario
        const tipo = tipoPeluqueria.value;
        const servicio = servicioSelect.value;
        const fecha = document.getElementById("fecha").value;
        const id_usuario = localStorage.getItem("id_usuario"); // Obtener id_usuario del localStorage

        // Validar que todos los campos estén completos
        console.log("Valores capturados:", { id_usuario, tipo, servicio, fecha });
        if (!tipo || !servicio || !fecha || !id_usuario) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Convertir la fecha local al formato ISO (ajustada a la zona horaria local)
        const fechaLocal = new Date(fecha);
        const fechaISO = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000).toISOString();

        // Mostrar datos antes de enviar la solicitud para depuración
        console.log("Enviando reserva con los siguientes datos:", { id_usuario, tipo, servicio, fechaISO });

        // Enviar la solicitud al backend
        fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_usuario, tipo, servicio, fecha: fechaISO }) // Asegurarse que el campo sea 'fecha' en vez de 'fecha_hora'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al realizar la reserva');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            document.getElementById("reservaForm").reset(); // Limpiar el formulario
        })
        .catch(error => {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva.");
        });
    });
});
