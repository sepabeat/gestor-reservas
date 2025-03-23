// 0 Importar dependencias
const express = require('express');
const cors = require('cors'); // Importamos paquete cors
const mysql = require('mysql2');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const path = require('path');

// Habilitar CORS
app.use(cors());  // Esto permite solicitudes de cualquier origen, pero también puedes restringirlo a ciertos orígenes si es necesario

// Middleware para procesar el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, 'public')));

// 1 Conexión con la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',              // Usuario de MySQL (cambiar si es necesario)
  password: '',              // Contraseña de MySQL (cambiar si es necesario)
  database: 'gestor_reservas',
  port: 3307                 // MySQL de mi pc está en el puerto 3307
});

// 1.1 Conexión a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL.');
});

// 2 Ruta de inicio
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// 2.1 Ruta para obtener los servicios según el tipo de peluquería**
app.get('/api/servicios/:categoria', (req, res) => {
  const { categoria } = req.params;

  // Validar que el tipo sea correcto
  if (categoria !== 'salon_belleza' && categoria !== 'peluqueria_canina') {
    return res.status(400).send('Tipo de peluquería no válido');
  }

  const query = `
    SELECT id_servicio, nombre, precio
    FROM servicios
    WHERE categoria = ?
  `;

  db.query(query, [categoria], (err, results) => {
    if (err) {
      console.error('Error al obtener servicios:', err);
      return res.status(500).send('Error al obtener servicios');
    }
    res.json(results);
  });
});

// 3. Ruta para crear una nueva reserva**
app.post('/api/reservas', (req, res) => {
  const { id_usuario, fecha_hora, servicios } = req.body;

  // 3.1 Insertar la reserva principal
  const queryReserva = 'INSERT INTO reservas (id_usuario, fecha_hora, estado) VALUES (?, ?, ?)';
  db.query(queryReserva, [id_usuario, fecha_hora, 'pendiente'], (err, result) => {
    if (err) {
      console.error('Error al crear la reserva:', err);
      return res.status(500).send('Error al crear la reserva');
    }

    // Obtener el ID de la reserva recién creada
    const id_reserva = result.insertId;

    // Insertar los servicios relacionados con la reserva
    const queryReservaServicio = 'INSERT INTO reserva_servicio (id_reserva, id_servicio) VALUES ?';
    const serviciosData = servicios.map(servicioId => [id_reserva, servicioId]);

    db.query(queryReservaServicio, [serviciosData], (err) => {
      if (err) {
        console.error('Error al asociar los servicios con la reserva:', err);
        return res.status(500).send('Error al asociar los servicios con la reserva');
      }

      res.status(201).send('Reserva creada con éxito');
    });
  });
});

// 3.2 Ruta para obtener todas las reservas**
app.get('/api/reservas', (req, res) => {
  db.query('SELECT * FROM reservas', (err, results) => {
    if (err) {
      console.error('Error al obtener las reservas:', err);
      res.status(500).send('Error al obtener las reservas');
    } else {
      res.json(results);
    }
  });
});

// 3.3. Ruta para actualizar una reserva**
app.put('/api/reservas/:id_reserva', (req, res) => {
  const { id_reserva } = req.params;
  const { fecha_hora, servicios } = req.body;

  // 3.4 Actualizar la fecha y hora de la reserva
  const queryActualizarReserva = 'UPDATE reservas SET fecha_hora = ? WHERE id_reserva = ?';
  db.query(queryActualizarReserva, [fecha_hora, id_reserva], (err, result) => {
    if (err) {
      console.error('Error al actualizar la reserva:', err);
      return res.status(500).send('Error al actualizar la reserva');
    }

    // 3.5 Eliminar los servicios existentes de la reserva
    const queryEliminarServicios = 'DELETE FROM reserva_servicio WHERE id_reserva = ?';
    db.query(queryEliminarServicios, [id_reserva], (err) => {
      if (err) {
        console.error('Error al eliminar los servicios existentes:', err);
        return res.status(500).send('Error al eliminar los servicios');
      }

      // 4 Insertar los nuevos servicios
      const queryInsertarServicios = 'INSERT INTO reserva_servicio (id_reserva, id_servicio) VALUES ?';
      const serviciosData = servicios.map(servicioId => [id_reserva, servicioId]);

      db.query(queryInsertarServicios, [serviciosData], (err) => {
        if (err) {
          console.error('Error al asociar los servicios con la reserva:', err);
          return res.status(500).send('Error al asociar los servicios con la reserva');
        }

        res.status(200).send('Reserva actualizada con éxito');
      });
    });
  });
});

// 3.6 Ruta para eliminar una reserva**
app.delete('/api/reservas/:id_reserva', (req, res) => {
  const { id_reserva } = req.params;

  // 3.7 Eliminar la reserva
  const query = 'DELETE FROM reservas WHERE id_reserva = ?';

  db.query(query, [id_reserva], (err, result) => {
    if (err) {
      console.error('Error al eliminar la reserva:', err);
      return res.status(500).send('Error al eliminar la reserva');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Reserva no encontrada');
    }

    res.status(200).send('Reserva eliminada con éxito');
  });
});

// 3.8 Ruta para obtener todas las reservas de un usuario específico**
app.get('/api/reservas/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  const query = `
    SELECT reservas.id_reserva, reservas.fecha_hora, reservas.estado,
           GROUP_CONCAT(servicios.nombre SEPARATOR ', ') AS servicios
    FROM reservas
    JOIN reserva_servicio ON reservas.id_reserva = reserva_servicio.id_reserva
    JOIN servicios ON reserva_servicio.id_servicio = servicios.id_servicio
    WHERE reservas.id_usuario = ?
    GROUP BY reservas.id_reserva;
  `;

  db.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error('Error al obtener reservas del usuario:', err);
      res.status(500).send('Error al obtener reservas del usuario');
    } else {
      // Convertir la fecha_hora a un formato más legible
      results.forEach(reserva => {
        const date = new Date(reserva.fecha_hora);  // Crear objeto Date
        reserva.fecha_hora = date.toISOString().slice(0, 19).replace('T', ' ');  // Formato YYYY-MM-DD HH:mm
      });

      res.json(results);  // Devolver las reservas con la fecha convertida
    }
  });
});

// 5. Ruta de login para el usuario (comparar contraseñas y generar JWT)**
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Consulta para obtener el usuario de la base de datos
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).send('Error al buscar el usuario');
    }

    if (results.length === 0) {
      return res.status(400).send('Usuario no encontrado');
    }

    const user = results[0];  // El primer resultado (solo debería haber uno)

    // Comparar la contraseña ingresada con la almacenada (sin encriptación)
    if (password === user.password_hash) {
      // Generar el JWT
      const token = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, {
        expiresIn: '1h',  // El token expirará en 1 hora
      });

      // Devolver el token al cliente
      res.json({ token });
    } else {
      res.status(400).send('Credenciales incorrectas');
    }
  });
});

// 6. Escuchar el servidor en el puerto 3000
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
