-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 01-12-2022 a las 18:02:30
-- Versión del servidor: 10.4.21-MariaDB
-- Versión de PHP: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `Tasks Manager`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('kiRKSPQr9hCb530Ufdqk_7IkV39zW4cV', 1670000516, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"aitor.tilla@ucm.es\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tags`
--

CREATE TABLE `Tags` (
  `Id` int(11) NOT NULL,
  `Text` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `Tags`
--

INSERT INTO `Tags` (`Id`, `Text`) VALUES
(46, 'Personal'),
(47, 'Universidad'),
(48, 'Profesor'),
(49, 'TP'),
(50, 'Congreso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tasks`
--

CREATE TABLE `Tasks` (
  `Id` int(11) NOT NULL,
  `Text` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `Tasks`
--

INSERT INTO `Tasks` (`Id`, `Text`) VALUES
(47, 'Ir al supermercado'),
(48, 'Hablar con el profesor '),
(49, 'Mirar fechas congreso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TasksTags`
--

CREATE TABLE `TasksTags` (
  `IdTask` int(10) NOT NULL,
  `IdTag` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `TasksTags`
--

INSERT INTO `TasksTags` (`IdTask`, `IdTag`) VALUES
(47, 46),
(48, 47),
(48, 48),
(48, 49),
(49, 50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Users`
--

CREATE TABLE `Users` (
  `Id` int(11) NOT NULL,
  `Email` varchar(25) NOT NULL,
  `Password` varchar(25) NOT NULL,
  `Img` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `Users`
--

INSERT INTO `Users` (`Id`, `Email`, `Password`, `Img`) VALUES
(10, 'aitor.tilla@ucm.es', 'aitor', 'aitor.png'),
(11, 'filipe.lotas@ucm.es', 'felipe', 'lotas.png'),
(12, 'bill.puertas@ucm.es', 'bill', 'bill.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UsersTasks`
--

CREATE TABLE `UsersTasks` (
  `IdUser` int(10) NOT NULL,
  `IdTask` int(10) NOT NULL,
  `Done` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `UsersTasks`
--

INSERT INTO `UsersTasks` (`IdUser`, `IdTask`, `Done`) VALUES
(10, 47, 0),
(10, 48, 0),
(10, 49, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `Tags`
--
ALTER TABLE `Tags`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `Tasks`
--
ALTER TABLE `Tasks`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `TasksTags`
--
ALTER TABLE `TasksTags`
  ADD PRIMARY KEY (`IdTask`,`IdTag`),
  ADD KEY `IdTag` (`IdTag`);

--
-- Indices de la tabla `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`Id`);

--
-- Indices de la tabla `UsersTasks`
--
ALTER TABLE `UsersTasks`
  ADD PRIMARY KEY (`IdUser`,`IdTask`),
  ADD KEY `IdTask` (`IdTask`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Tags`
--
ALTER TABLE `Tags`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `Tasks`
--
ALTER TABLE `Tasks`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `Users`
--
ALTER TABLE `Users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `TasksTags`
--
ALTER TABLE `TasksTags`
  ADD CONSTRAINT `taskstags_ibfk_1` FOREIGN KEY (`IdTask`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taskstags_ibfk_2` FOREIGN KEY (`IdTag`) REFERENCES `Tags` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `UsersTasks`
--
ALTER TABLE `UsersTasks`
  ADD CONSTRAINT `userstasks_ibfk_1` FOREIGN KEY (`IdUser`) REFERENCES `Users` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `userstasks_ibfk_2` FOREIGN KEY (`IdTask`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
