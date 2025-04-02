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
  if (categoria !== 'salon_belleza' && categoria !== 'peluqueria_canina') {
    return res.status(400).send('Tipo de peluquería no válido');
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

  const fechaFormateada = new Date(fecha).toISOString().slice(0, 19).replace('T', ' ');
  console.log("Fecha formateada:", fechaFormateada);

  const queryReserva = 'INSERT INTO reservas (id_usuario, fecha_hora, estado) VALUES (?, ?, ?)';
  console.log("Consulta reserva:", queryReserva); // Log de la consulta
  db.query(queryReserva, [id_usuario, fechaFormateada, 'pendiente'], (err, result) => {
    if (err) {
      console.error('Error al crear la reserva:', err);
      return res.status(500).send('Error al crear la reserva');
    }
    console.log("Resultado reserva:", result); // Log del resultado
    const id_reserva = result.insertId;
    const queryServicio = 'SELECT id_servicio FROM servicios WHERE nombre = ? AND categoria = ?';
    console.log("Consulta servicio:", queryServicio); // Log de la consulta
    db.query(queryServicio, [servicio, tipo], (err, results) => {
      if (err) {
        console.error('Error al obtener el servicio:', err);
        return res.status(500).send('Error al obtener el servicio');
      }
      console.log("Resultado servicio:", results); // Log del resultado
      if (results.length === 0) {
        return res.status(400).send('Servicio no encontrado o no corresponde a la categoría');
      }
      const id_servicio = results[0].id_servicio;
      const queryReservaServicio = 'INSERT INTO reserva_servicio (id_reserva, id_servicio) VALUES (?, ?)';
      console.log("Consulta reserva_servicio:", queryReservaServicio); // Log de la consulta
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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});