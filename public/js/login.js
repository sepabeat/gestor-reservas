// Capturamos el evento submit del formulario
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Evitar el comportamiento por defecto del formulario

  // Recoger los datos del formulario
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Enviar los datos al servidor para la autenticación
  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la autenticación');
    }
    return response.json();
  })
  .then(data => {
    console.log("Respuesta del servidor:", data); // Depuración

    if (data.token && data.id_usuario) {
      // Almacenar token JWT y ID del usuario en localStorage
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('id_usuario', data.id_usuario);

      alert('Inicio de sesión exitoso');

      // Redirigir a la página de inicio o dashboard
      window.location.href = 'index.html';
    } else {
      alert('Credenciales incorrectas o falta de datos en la respuesta');
    }
  })
  .catch(error => {
    console.error('Error al hacer login:', error);
    alert('Error en el servidor');
  });
});
