document.addEventListener("DOMContentLoaded", () => {
    const tipoPeluqueria = document.getElementById("tipo");
    const servicioSelect = document.getElementById("servicio");

    // Función para cargar los servicios según el tipo de peluquería seleccionado
    tipoPeluqueria.addEventListener("change", (event) => {
        const tipoSeleccionado = event.target.value;
        console.log("Tipo seleccionado:", tipoSeleccionado); // Añadir esta línea para verificar el valor

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
            // Si no se selecciona un tipo de peluquería, se resetean las opciones de servicio
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

        // Validar que todos los campos estén completos
        if (!tipo || !servicio || !fecha) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Aquí puedes realizar la solicitud POST para guardar la reserva en el backend
        // Ejemplo: envío de datos a la API para reservar la cita
        fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tipo, servicio, fecha })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al realizar la reserva');
            }
            return response.json();
        })
        .then(data => {
            // Mostrar mensaje de éxito si la reserva se realizó correctamente
            alert("Reserva realizada con éxito");
            // Opcional: Limpiar el formulario después de hacer la reserva
            document.getElementById("reservaForm").reset();
        })
        .catch(error => {
            console.error("Error al realizar la reserva:", error);
            alert("Hubo un problema al realizar la reserva.");
        });
    });
});
