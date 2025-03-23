// Capturamos el evento submit del formulario
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();  // Evitar el comportamiento por defecto del formulario

  // Recoger los datos del formulario
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Enviar los datos al servidor para la autenticación
  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email, password: password }),
  })
  .then(response => {
    if (!response.ok) {  // Verificar si la respuesta no fue OK
      throw new Error('Error en la autenticación');
    }
    return response.json();
  })
  .then(data => {
    if (data.token) {
      // Almacenar el token JWT en el localStorage o sessionStorage
      localStorage.setItem('jwtToken', data.token);
      alert('Inicio de sesión exitoso');
      // Redirigir a una página de inicio o dashboard
      window.location.href = 'index.html';  // Redirigir a la página correspondiente
    } else {
      alert('Credenciales incorrectas');
    }
  })
  .catch(error => {
    console.error('Error al hacer login:', error);
    alert('Error en el servidor');
  });
});
