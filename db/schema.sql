-- Database and tables for Snap-a-Book
CREATE DATABASE IF NOT EXISTS snapabook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE snapabook;

DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS rare_books;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT NULL,
  availability VARCHAR(64) NOT NULL DEFAULT 'available',
  INDEX (title)
);

CREATE TABLE assets (
  asset_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) DEFAULT NULL,
  usage_info TEXT
);

CREATE TABLE rare_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  abstract TEXT,
  pdf_file_path VARCHAR(512)
);

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_title VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(64),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

