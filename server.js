// Importar dependencias
const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const app = express();
const bcrypt = require('bcryptjs'); // Para la encriptación de contraseñas
const jwt = require('jsonwebtoken');  // Para generar y verificar JWT
const port = 3000;

// Middleware para procesar el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Conexión con la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',              // Usuario de MySQL (cambiar si es necesario)
  password: '',              // Contraseña de MySQL (cambiar si es necesario)
  database: 'gestor_reservas',
  port: 3307                // MySQL de mi pc está en el puerto 3307
});

// Conexión a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL.');
});

// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');  // El token se espera en el encabezado 'Authorization'

  if (!token) {
    return res.status(403).send('Acceso denegado. No se ha proporcionado un token');
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;  // Almacenar la información del usuario en la solicitud
    next();
  } catch (err) {
    console.error('Error al verificar el token:', err);
    res.status(400).send('Token no válido');
  }
};

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Ruta para obtener todos los servicios disponibles
app.get('/api/servicios', (req, res) => {
  db.query('SELECT * FROM servicios', (err, results) => {
    if (err) {
      console.error('Error al obtener los servicios:', err);
      res.status(500).send('Error al obtener los servicios');
    } else {
      res.json(results);
    }
  });
});

// **2. Ruta para crear una nueva reserva**
app.post('/api/reservas', verificarToken, (req, res) => {
  const { id_usuario, fecha_hora, servicios } = req.body;

  // Insertar la reserva principal
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

// **3. Ruta para obtener todas las reservas**
app.get('/api/reservas', verificarToken, (req, res) => {
  db.query('SELECT * FROM reservas', (err, results) => {
    if (err) {
      console.error('Error al obtener las reservas:', err);
      res.status(500).send('Error al obtener las reservas');
    } else {
      res.json(results);
    }
  });
});

// **4. Ruta para actualizar una reserva**
app.put('/api/reservas/:id_reserva', verificarToken, (req, res) => {
  const { id_reserva } = req.params;
  const { fecha_hora, servicios } = req.body;

  // Actualizar la fecha y hora de la reserva
  const queryActualizarReserva = 'UPDATE reservas SET fecha_hora = ? WHERE id_reserva = ?';
  db.query(queryActualizarReserva, [fecha_hora, id_reserva], (err, result) => {
    if (err) {
      console.error('Error al actualizar la reserva:', err);
      return res.status(500).send('Error al actualizar la reserva');
    }

    // Eliminar los servicios existentes de la reserva
    const queryEliminarServicios = 'DELETE FROM reserva_servicio WHERE id_reserva = ?';
    db.query(queryEliminarServicios, [id_reserva], (err) => {
      if (err) {
        console.error('Error al eliminar los servicios existentes:', err);
        return res.status(500).send('Error al eliminar los servicios');
      }

      // Insertar los nuevos servicios
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

// **5. Ruta para eliminar una reserva**
app.delete('/api/reservas/:id_reserva', verificarToken, (req, res) => {
  const { id_reserva } = req.params;

  // Eliminar la reserva
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

// Ruta para obtener todas las reservas de un usuario específico
app.get('/api/reservas/:id_usuario', verificarToken, (req, res) => {
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

// **6. Ruta de registro de usuario (encriptación de contraseñas)**
app.post('/api/register', async (req, res) => {
  const { nombre_usuario, password, email } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 es el número de salt rounds

    // Consulta para insertar el usuario en la base de datos
    const query = 'INSERT INTO usuarios (nombre_usuario, password_hash, email) VALUES (?, ?, ?)';
    db.query(query, [nombre_usuario, hashedPassword, email], (err, result) => {
      if (err) {
        console.error('Error al registrar el usuario:', err);
        return res.status(500).send('Error al registrar el usuario');
      }

      res.status(201).send('Usuario registrado correctamente');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la contraseña');
  }
});

// **7. Ruta de login para el usuario (comparar contraseñas y generar JWT)**
app.post('/api/login', (req, res) => {
  const { nombre_usuario, password } = req.body;

  // Consulta para obtener el usuario de la base de datos
  const query = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
  db.query(query, [nombre_usuario], async (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).send('Error al buscar el usuario');
    }

    if (results.length === 0) {
      return res.status(400).send('Usuario no encontrado');
    }

    const usuario = results[0];

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!isMatch) {
      return res.status(400).send('Contraseña incorrecta');
    }

    // Generar el token JWT
    const token = jwt.sign({ id_usuario: usuario.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
