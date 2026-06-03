-- Database Schema for DAB Enterprise LTD HRMS

CREATE DATABASE IF NOT EXISTS HRMS;
USE HRMS;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Department Table
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS department;
CREATE TABLE department (
    d_id INT AUTO_INCREMENT PRIMARY KEY,
    d_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Position Table
DROP TABLE IF EXISTS `position`;
CREATE TABLE `position` (
    pos_id INT AUTO_INCREMENT PRIMARY KEY,
    posname VARCHAR(100) UNIQUE NOT NULL,
    required_qualification TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Employee Table
CREATE TABLE employee (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    empfname VARCHAR(50) NOT NULL,
    emplname VARCHAR(50) NOT NULL,
    empgender ENUM('Male', 'Female') NOT NULL,
    empdob DATE NOT NULL,
    empemail VARCHAR(100) UNIQUE NOT NULL,
    emptelephone VARCHAR(20) NOT NULL,
    empaddress VARCHAR(255) NOT NULL,
    emphiredate DATE NOT NULL,
    empstatus ENUM('On Leave', 'Left', 'Blacklisted', 'Deceased', 'On Mission') DEFAULT 'On Mission',
    d_id INT,
    pos_id INT,
    FOREIGN KEY (d_id) REFERENCES department(d_id) ON DELETE SET NULL,
    FOREIGN KEY (pos_id) REFERENCES `position`(pos_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') DEFAULT 'Admin',
    emp_id INT NULL,
    FOREIGN KEY (emp_id) REFERENCES employee(emp_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

