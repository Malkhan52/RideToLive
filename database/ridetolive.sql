-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 07, 2019 at 01:36 AM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ridetolive`
--

-- --------------------------------------------------------

--
-- Table structure for table `registration`
--

CREATE TABLE `registration` (
  `Id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `age` int(3) DEFAULT NULL,
  `twoWheelerType` varchar(200) DEFAULT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `registration`
--

INSERT INTO `registration` (`Id`, `name`, `age`, `twoWheelerType`, `date`) VALUES
(1, 'Malkhan Singh', 22, 'Standard', '2019-12-05 12:16:49'),
(2, 'Hello Hey', 22, 'Street', '2019-12-06 11:45:11'),
(3, 'Hello Hey', 22, 'Street', '2019-12-06 11:47:46'),
(4, 'Bittu Singh', 22, 'Standard', '2019-12-06 11:59:07'),
(5, 'Nidhi Saini', 21, 'Scooter', '2019-12-06 14:20:08'),
(6, 'Nidhi Saini', 21, 'Dual Sports Motorcycle', '2019-12-06 14:20:20'),
(7, 'Nidhi Saini', 21, 'Dual Sports Motorcycle', '2019-12-06 14:25:01'),
(8, 'Sejal Saini', 16, 'Bicycle', '2019-12-06 15:04:10'),
(9, 'Sejal Saini', 17, 'Bicycle', '2019-12-06 15:08:02'),
(10, 'Mrinal', 22, 'Standard Motorcycle', '2019-12-07 00:10:11'),
(11, 'Malkhan Singh', 22, 'Bicycle', '2019-12-07 00:18:26');

-- --------------------------------------------------------

--
-- Table structure for table `ride_record`
--

CREATE TABLE `ride_record` (
  `Id` int(11) NOT NULL,
  `driverID` int(11) DEFAULT NULL,
  `reactionTime` float NOT NULL DEFAULT '0',
  `alertType` varchar(20) DEFAULT NULL,
  `selectedLane` varchar(12) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ride_record`
--

INSERT INTO `ride_record` (`Id`, `driverID`, `reactionTime`, `alertType`, `selectedLane`) VALUES
(2, 4, 1.65, 'a', NULL),
(3, 4, 1.65, 'a', NULL),
(4, 4, 1.65, 'light', 'a'),
(5, 4, 1.65, 'light', 'a'),
(6, 4, 1.65, 'light', 'a'),
(7, 4, 1.31306, 'light', 'a'),
(8, 4, 0.609272, 'light', 'b'),
(9, 4, 1.65, 'sound', 'a'),
(10, 9, 1.65, 'sound', 'a'),
(11, 9, 0.29722, 'sound', 'b'),
(12, 9, 0.947715, 'light', 'b'),
(13, 10, 1.38401, 'sound', 'b'),
(14, 10, 0.3012, 'light', 'b'),
(15, 11, 0.0741704, 'sound', 'b'),
(16, 11, 0.303075, 'light', 'b');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `registration`
--
ALTER TABLE `registration`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `ride_record`
--
ALTER TABLE `ride_record`
  ADD PRIMARY KEY (`Id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `registration`
--
ALTER TABLE `registration`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `ride_record`
--
ALTER TABLE `ride_record`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
