// Capturamos el evento submit del formulario
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();  // Evitar el comportamiento por defecto del formulario

  // Recoger los datos del formulario
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Enviar los datos al servidor para la autenticación
  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre_usuario: username, password: password }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Almacenar el token JWT en el localStorage o sessionStorage
      localStorage.setItem('jwtToken', data.token);
      alert('Inicio de sesión exitoso');
      // Redirigir o hacer algo con el usuario logueado
      window.location.href = 'dashboard.html';  // Puedes redirigir a una página de inicio o dashboard
    } else {
      alert('Credenciales incorrectas');
    }
  })
  .catch(error => {
    console.error('Error al hacer login:', error);
    alert('Error en el servidor');
  });
});
