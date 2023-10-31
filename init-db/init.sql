-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 31, 2023 at 08:40 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taca_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(15) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `department` varchar(50) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `tel`, `fname`, `lname`, `department`, `gender`, `password`, `profile_img`, `created_at`, `updated_at`) VALUES
(18, 'admin@gmail.com', '55555555', 'Admin', 'Admin', 'Administrator', NULL, '$2b$10$QP0.AO7gL9YrbxgCVlDCH.V1MJSWr.XYIC3gWnJsAdIy9WavzhQDK', NULL, '2023-10-10 07:18:17', '2023-10-17 02:10:20'),
(24, 'jojo@gmail.com', '99999999', 'Jojo', 'JJJ', 'backend developer', NULL, '$2b$10$IkUoF6q4p9053YuVsXjGruO7I4LZoidZgiiu4Z.EmFxWnjJwe0mES', NULL, '2023-10-16 04:06:56', '2023-10-16 04:06:56'),
(25, 'kim@gmail.com', '99999991', 'Kim', 'KKK', 'frontend developer', NULL, '$2b$10$8eHSN1AK7P/GHpgoU00LtOj/kHlDfnvmRN1lX3trkNA/PhLEAhdd.', NULL, '2023-10-16 04:07:32', '2023-10-16 04:07:32'),
(26, 'john@gmail.com', '99999992', 'John', 'JJJJ', 'designer', NULL, '$2b$10$a3XkNjaEkCssaOJkHPy97.vX6DLaNIJkQ4nMNwrC8IRLcocz89R.W', NULL, '2023-10-16 04:15:07', '2023-10-16 04:15:07'),
(31, 'john99@gmail.com', '9999999299', 'John', 'JJJJ', 'designer', NULL, '$2b$10$pX8JcBJ0JG1Ffaz7iH1DpOFJAN7vGrs/AoINh1LHPtmhgM5DJIbj.', NULL, '2023-10-17 06:19:08', '2023-10-17 06:19:08');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(10) NOT NULL,
  `product_id` int(10) NOT NULL,
  `customer_id` int(10) NOT NULL,
  `size` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL,
  `quantity` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `product_id`, `customer_id`, `size`, `color`, `quantity`) VALUES
(3, 8, 27, '10', 'Black', 2),
(5, 5, 27, 'Free size', 'White', 1),
(6, 5, 40, 'Free size', 'White', 2);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Clothes'),
(2, 'Electronic devices'),
(3, 'Computer'),
(4, 'Cosmetic');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tel` varchar(15) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `email`, `tel`, `fname`, `lname`, `gender`, `dob`, `password`, `profile_img`, `created_at`, `updated_at`) VALUES
(27, 'john@gmail.com', '99999992', 'John', 'JJJJ', NULL, NULL, '$2b$10$ja6zjHKNSmARVEE9FH9k.OkY3novptsjCVfZDsEB3ihiaLzyFH84.', NULL, '2023-10-16 06:36:36', '2023-10-16 06:36:36'),
(40, 'test@gmail.com', '55555551', 'test', 'ttt', NULL, NULL, '$2b$10$7Ik3Rhm2vk.ymVyC9AIHLexypJhZaJVnNXdg5F2FBr.9HewQGiPJC', NULL, '2023-10-16 08:29:47', '2023-10-16 08:29:47');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) NOT NULL,
  `cat_id` int(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(10) NOT NULL,
  `size` varchar(100) NOT NULL,
  `color` varchar(100) NOT NULL,
  `descriptions` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `cat_id`, `name`, `price`, `size`, `color`, `descriptions`, `image`) VALUES
(5, 1, 'Square neck Padded bralette/bra top/wireless bra/yoga bra/sleeping', 80000, 'Free size', 'Black, White', 'uytgiyiitrfgyiu6yfughrryktjdhb', 'images_dress22.png'),
(6, 1, 'Eireen Cardigan Crop Premium| Nacara Outer Cardigan Women 7 GAUGE Special', 95000, 'M L XL', 'Black, White, Gray, Dark Blue', 'uytgiyiitrfgyiu6yfughreghwertgfdgnjtui;lryktjdhb;lryktjdhb', 'images_dress1.png'),
(7, 1, 'Eireen Cardigan Crop Premium| Nacara Outer Cardigan Women 7 GAUGE Special', 85000, 'Free size', 'Black, White, Gray, Dark Blue', 'uytgiyiitrfgyiu6yfughreghwertgfdgnjtui;lryktjdhb', 'images_dress1.png'),
(8, 2, 'Xiaomi Wifi Amplifier Pro / WiFi Amplifier /300Mbps wifi extender', 130000, '10x13 cm', 'Black', 'uytgiyiitrfgyiu6yfughreghwertgfdgnjtui;lryktjdhb', 'images_wifi1.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`,`customer_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cat_id` (`cat_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`cat_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
