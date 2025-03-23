document.addEventListener("DOMContentLoaded", () => {
    const btnReservar = document.getElementById("btnReservar");

    if (btnReservar) {  // Verifica si el botón existe antes de usarlo
        btnReservar.addEventListener("click", () => {
            window.location.href = "reservas.html";
        });
    }
});
