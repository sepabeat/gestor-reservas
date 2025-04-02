document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al registrar el usuario');
        }
        return response.text(); // o response.json() si el servidor envía JSON
    })
    .then(data => {
        alert(data); // Mostrar mensaje del servidor
        window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
    })
    .catch(error => {
        console.error('Error al registrar el usuario:', error);
        alert('Error en el registro');
    });
});