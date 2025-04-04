const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestor_reservas',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL.');
});

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

app.get('/api/servicios/:categoria', (req, res) => {
    const { categoria } = req.params;
    if (categoria !== 'salon_belleza' && categoria !== 'peluqueria_canina' && categoria !== 'clinica_veterinaria' && categoria !== 'restaurantes') {
        return res.status(400).send('Tipo de servicio no válido');
    }

    const query = 'SELECT id_servicio, nombre, precio FROM servicios WHERE categoria = ?';
    db.query(query, [categoria], (err, results) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            return res.status(500).send('Error al obtener servicios');
        }
        res.json(results);
    });
});

app.post('/api/reservas', (req, res) => {
    console.log("Datos recibidos:", req.body);
    const { id_usuario, fecha, servicio, tipo } = req.body;
    if (!id_usuario || !fecha || !servicio || !tipo) {
        return res.status(400).send('Faltan datos requeridos');
    }

    // Verificar si el usuario existe (¡importante!)
    const checkUserQuery = 'SELECT id_usuario FROM usuarios WHERE id_usuario = ?';
    db.query(checkUserQuery, [id_usuario], (err, results) => {
        if (err) {
            console.error('Error al verificar el usuario:', err);
            return res.status(500).send('Error al verificar el usuario');
        }

        if (results.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        // Si el usuario existe, proceder con la creación de la reserva
        const fechaFormateada = new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');
        console.log("Fecha formateada:", fechaFormateada);

        const queryReserva = 'INSERT INTO reservas (id_usuario, fecha_hora, estado) VALUES (?, ?, ?)';
        console.log("Consulta reserva:", queryReserva);
        db.query(queryReserva, [id_usuario, fechaFormateada, 'pendiente'], (err, result) => {
            if (err) {
                console.error('Error al crear la reserva:', err);
                return res.status(500).send('Error al crear la reserva');
            }
            console.log("Resultado reserva:", result);
            const id_reserva = result.insertId;
            const queryServicio = 'SELECT id_servicio FROM servicios WHERE nombre = ? AND categoria = ?';
            console.log("Consulta servicio:", queryServicio);
            db.query(queryServicio, [servicio, tipo], (err, results) => {
                if (err) {
                    console.error('Error al obtener el servicio:', err);
                    return res.status(500).send('Error al obtener el servicio');
                }
                console.log("Resultado servicio:", results);
                if (results.length === 0) {
                    return res.status(400).send('Servicio no encontrado o no corresponde a la categoría');
                }
                const id_servicio = results[0].id_servicio;
                const queryReservaServicio = 'INSERT INTO reserva_servicio (id_reserva, id_servicio) VALUES (?, ?)';
                console.log("Consulta reserva_servicio:", queryReservaServicio);
                db.query(queryReservaServicio, [id_reserva, id_servicio], (err) => {
                    if (err) {
                        console.error('Error al asociar el servicio con la reserva:', err);
                        return res.status(500).send('Error al asociar el servicio con la reserva');
                    }
                    console.log("Reserva creada con éxito");
                    res.status(201).json({ message: 'Reserva creada con éxito' });
                });
            });
        });
    });
});

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

// Nueva ruta para obtener las reservas del usuario autenticado
app.get('/api/reservas/usuario', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('No hay token proporcionado');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token inválido');
        }

        const userId = decoded.id_usuario;

        const query = `
            SELECT
                r.id_reserva,
                r.fecha_hora,
                r.estado,
                GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios
            FROM reservas r
            JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
            JOIN servicios s ON rs.id_servicio = s.id_servicio
            WHERE r.id_usuario = ?
            GROUP BY r.id_reserva
            ORDER BY r.fecha_hora DESC
        `;

        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener las reservas del usuario:', err);
                return res.status(500).send('Error al obtener las reservas del usuario');
            }

            res.json(results);
        });
    });
});

// Nueva ruta para cancelar una reserva
app.put('/api/reservas/:id', (req, res) => {
    const { id } = req.params;

    const query = 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
    db.query(query, ['cancelada', id], (err, result) => {
        if (err) {
            console.error('Error al cancelar la reserva:', err);
            return res.status(500).send('Error al cancelar la reserva');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Reserva no encontrada');
        }

        console.log(`Reserva con ID ${id} cancelada con éxito`);
        res.send('Reserva cancelada con éxito');
    });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).send('Error al buscar el usuario');
    }
    if (results.length === 0) {
      return res.status(400).send('Usuario no encontrado');
    }
    const user = results[0];
    if (password === user.password_hash) {
      const token = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ token, id_usuario: user.id_usuario });
    } else {
      res.status(400).send('Credenciales incorrectas');
    }
  });
});

app.get('/api/admin/reservas/pendientes', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('No hay token proporcionado');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token inválido');
        }

        const userId = decoded.id_usuario;

        // Verificar si el usuario es administrador
        const checkAdminQuery = 'SELECT rol FROM usuarios WHERE id_usuario = ?';
        db.query(checkAdminQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error al verificar el rol del usuario:', err);
                return res.status(500).send('Error al verificar el rol del usuario');
            }

            if (results.length === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            if (results[0].rol !== 'admin') {
                return res.status(403).send('Acceso no autorizado'); // 403 Forbidden
            }

            // Si el usuario es administrador, obtener todas las reservas pendientes
            const query = `
                SELECT
                    r.id_reserva,
                    r.fecha_hora,
                    r.estado,
                    GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios,
                    u.nombre AS nombre_usuario
                FROM reservas r
                JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
                JOIN servicios s ON rs.id_servicio = s.id_servicio
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.estado = 'pendiente'
                GROUP BY r.id_reserva
                ORDER BY r.fecha_hora ASC
            `;

            db.query(query, (err, results) => {
                if (err) {
                    console.error('Error al obtener las reservas pendientes:', err);
                    return res.status(500).send('Error al obtener las reservas pendientes');
                }

                res.json(results);
            });
        });
    });
});

// Ruta para cancelar o aprobar una reserva (solo para administradores)
app.put('/api/reservas/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // Obtener el nuevo estado del cuerpo de la solicitud

    if (estado !== 'cancelada' && estado !== 'confirmada') {
        return res.status(400).send('Estado no válido');
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('No hay token proporcionado');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token inválido');
        }

        const userId = decoded.id_usuario;

        // Verificar si el usuario es administrador
        const checkAdminQuery = 'SELECT rol FROM usuarios WHERE id_usuario = ?';
        db.query(checkAdminQuery, [userId], (err, results) => {
            if (err) {
                console.error('Error al verificar el rol del usuario:', err);
                return res.status(500).send('Error al verificar el rol del usuario');
            }

            if (results.length === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            if (results[0].rol !== 'admin') {
                return res.status(403).send('Acceso no autorizado');
            }

            const query = 'UPDATE reservas SET estado = ? WHERE id_reserva = ?';
            db.query(query, [estado, id], (err, result) => {
                if (err) {
                    console.error('Error al actualizar la reserva:', err);
                    return res.status(500).send('Error al actualizar la reserva');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).send('Reserva no encontrada');
                }

                console.log(`Reserva con ID ${id} actualizada a estado ${estado} con éxito`);
                res.send(`Reserva actualizada a estado ${estado} con éxito`);
            });
        });
    });
});

// Nueva ruta para obtener la información del usuario
app.get('/api/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del encabezado

  if (!token) {
    return res.status(401).send('No hay token proporcionado');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Token inválido');
    }

    const userId = decoded.id_usuario;

    const query = 'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE id_usuario = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error al obtener la información del usuario:', err);
        return res.status(500).send('Error al obtener la información del usuario');
      }

      if (results.length === 0) {
        return res.status(404).send('Usuario no encontrado');
      }

      const user = results[0];
      res.json({ id_usuario: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol }); // Enviar solo la información necesaria
    });
  });
});

// Nueva ruta para registrar un usuario
app.post('/api/register', (req, res) => {
    const { nombre, email, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!nombre || !email || !password) {
        return res.status(400).send('Faltan datos para el registro');
    }

    // Validar que el email no exista ya (opcional, pero recomendable)
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el email:', err);
            return res.status(500).send('Error al verificar el email');
        }

        if (results.length > 0) {
            return res.status(400).send('El email ya está registrado');
        }

        // Insertar el nuevo usuario en la base de datos
        const insertUserQuery = 'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [nombre, email, password], (err, result) => {  //Usamos la contraseña sin encriptar
            if (err) {
                console.error('Error al registrar el usuario:', err);
                return res.status(500).send('Error al registrar el usuario');
            }

            console.log('Usuario registrado con éxito');
            res.status(201).send('Usuario registrado con éxito');
        });
    });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});