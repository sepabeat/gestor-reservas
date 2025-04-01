-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 22-03-2025 a las 14:03:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestor_reservas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id_horario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id_horario`, `fecha`, `hora`, `disponible`) VALUES
(1, '2025-03-10', '10:00:00', 1),
(2, '2025-03-10', '11:00:00', 1),
(3, '2025-03-10', '12:00:00', 1),
(4, '2025-03-11', '15:00:00', 1),
(5, '2025-03-11', '16:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `id_usuario`, `fecha_hora`, `estado`) VALUES
(4, 1, '2025-05-02 10:00:00', 'confirmada'),
(5, 2, '2025-05-03 12:00:00', 'confirmada'),
(6, 3, '2025-05-04 11:30:00', 'confirmada'),
(7, 4, '2025-05-05 11:00:00', 'confirmada'),
(8, 5, '2025-05-06 14:00:00', 'confirmada'),
(9, 6, '2025-05-07 10:30:00', 'pendiente'),
(10, 7, '2025-05-08 16:00:00', 'pendiente'),
(11, 8, '2025-05-09 15:00:00', 'pendiente'),
(12, 9, '2025-05-10 09:00:00', 'pendiente'),
(13, 10, '2025-05-11 13:00:00', 'pendiente'),
(14, 11, '2025-05-12 11:30:00', 'pendiente'),
(15, 12, '2025-05-13 14:30:00', 'pendiente'),
(16, 13, '2025-05-14 09:00:00', 'pendiente'),
(17, 14, '2025-05-15 16:30:00', 'pendiente'),
(18, 15, '2025-06-01 10:00:00', 'pendiente'),
(19, 16, '2025-06-02 12:00:00', 'pendiente'),
(20, 17, '2025-06-03 14:00:00', 'pendiente'),
(21, 18, '2025-06-04 11:00:00', 'pendiente'),
(22, 19, '2025-06-05 15:00:00', 'pendiente'),
(23, 20, '2025-06-06 16:30:00', 'pendiente'),
(25, 1, '2025-03-23 10:00:00', 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva_servicio`
--

CREATE TABLE `reserva_servicio` (
  `id_reserva` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva_servicio`
--

INSERT INTO `reserva_servicio` (`id_reserva`, `id_servicio`) VALUES
(4, 1),
(4, 2),
(5, 3),
(5, 4),
(6, 1),
(6, 2),
(7, 6),
(7, 7),
(8, 8),
(9, 9),
(9, 10),
(10, 11),
(11, 12),
(11, 13),
(12, 14),
(13, 1),
(13, 2),
(14, 3),
(14, 4),
(15, 5),
(16, 6),
(16, 7),
(17, 8),
(18, 9),
(18, 10),
(19, 11),
(20, 12),
(20, 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id_servicio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `duracion` int(11) NOT NULL COMMENT 'Duración en minutos',
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id_servicio`, `nombre`, `duracion`, `precio`, `categoria`) VALUES
(1, 'Corte de pelo', 30, 15.00, 'salon_belleza'),
(2, 'Tinte', 45, 25.00, 'salon_belleza'),
(3, 'Manicura', 40, 18.00, 'salon_belleza'),
(4, 'Pedicura', 40, 20.00, 'salon_belleza'),
(5, 'Masaje capilar', 25, 12.00, 'salon_belleza'),
(6, 'Permanente', 60, 30.00, 'salon_belleza'),
(7, 'Secado', 30, 12.00, 'salon_belleza'),
(8, 'Peinado para eventos', 60, 35.00, 'salon_belleza'),
(9, 'Tratamiento facial', 50, 22.00, 'salon_belleza'),
(10, 'Extensiones de cabello', 120, 75.00, 'salon_belleza'),
(11, 'Corte de pelo canino', 30, 20.00, 'peluqueria_canina'),
(12, 'Baño y corte', 45, 25.00, 'peluqueria_canina'),
(13, 'Corte de uñas', 15, 10.00, 'peluqueria_canina'),
(14, 'Limpieza de oídos', 20, 12.00, 'peluqueria_canina'),
(15, 'Cepillado de pelo', 30, 15.00, 'peluqueria_canina'),
(16, 'Desparacitación', 20, 18.00, 'peluqueria_canina'),
(17, 'Tratamiento antialérgico', 30, 22.00, 'peluqueria_canina');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('cliente','admin') NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `password_hash`, `rol`) VALUES
(1, 'Juan Pérez', 'juan@example.com', '123456', 'cliente'),
(2, 'Admin', 'admin@example.com', 'admin123', 'admin'),
(3, 'Luis García', 'luis.garcia@example.com', 'contraseña123', 'cliente'),
(4, 'Marta Sánchez', 'marta.sanchez@example.com', 'abc1234', 'cliente'),
(5, 'José Martínez', 'jose.martinez@example.com', 'qwerty2025', 'cliente'),
(6, 'Lucía Pérez', 'lucia.perez@example.com', 'perez123', 'cliente'),
(7, 'Carlos Fernández', 'carlos.fernandez@example.com', 'carlos5678', 'admin'),
(8, 'Ana López', 'ana.lopez@example.com', 'ana9876', 'cliente'),
(9, 'David Rodríguez', 'david.rodriguez@example.com', 'davidpass1', 'cliente'),
(10, 'Elena Díaz', 'elena.diaz@example.com', 'elenapass!2025', 'cliente'),
(11, 'Antonio Romero', 'antonio.romero@example.com', 'antonio1234', 'admin'),
(12, 'Isabel Torres', 'isabel.torres@example.com', 'isabel5678', 'cliente'),
(13, 'Juan Pérez', 'juan.perez@example.com', 'juansuper123', 'cliente'),
(14, 'Beatriz Gómez', 'beatriz.gomez@example.com', 'beatriz!234', 'cliente'),
(15, 'Francisco Ruiz', 'francisco.ruiz@example.com', 'fran7890', 'cliente'),
(16, 'Sofia Jiménez', 'sofia.jimenez@example.com', 'sofia3210', 'cliente'),
(17, 'Miguel González', 'miguel.gonzalez@example.com', 'miguel2025pass', 'cliente'),
(18, 'Patricia Sánchez', 'patricia.sanchez@example.com', 'patricia!2024', 'cliente'),
(19, 'Ricardo Castro', 'ricardo.castro@example.com', 'ricardopass21', 'admin'),
(20, 'Carmen Hernández', 'carmen.hernandez@example.com', 'carmen2025!', 'cliente'),
(21, 'Raúl Morales', 'raul.morales@example.com', 'raul@2025', 'cliente'),
(22, 'Cristina Navarro', 'cristina.navarro@example.com', 'cristina4567', 'cliente');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id_horario`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `reserva_servicio`
--
ALTER TABLE `reserva_servicio`
  ADD PRIMARY KEY (`id_reserva`,`id_servicio`),
  ADD KEY `id_servicio` (`id_servicio`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id_servicio`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reserva_servicio`
--
ALTER TABLE `reserva_servicio`
  ADD CONSTRAINT `reserva_servicio_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reservas` (`id_reserva`) ON DELETE CASCADE,
  ADD CONSTRAINT `reserva_servicio_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
