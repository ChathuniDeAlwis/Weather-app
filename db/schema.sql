-- Snap-a-Book MySQL schema and seed data

DROP DATABASE IF EXISTS snapabook;
CREATE DATABASE snapabook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE snapabook;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255),
  price DECIMAL(10,2),
  availability VARCHAR(50) DEFAULT 'available'
);

CREATE TABLE assets (
  asset_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  usage_info TEXT
);

CREATE TABLE rare_books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  abstract TEXT,
  pdf_file_path VARCHAR(1024)
);

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_title VARCHAR(255) NOT NULL,
  donor_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO books (title, author, publisher, price, availability) VALUES
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 39.99, 'available'),
('The Pragmatic Programmer', 'Andrew Hunt, David Thomas', 'Addison-Wesley', 42.50, 'available'),
('Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 89.00, 'unavailable');

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
('BOOK123', '3D Printer Manual', 0.00, 'Use for operating the 3D printer safely.'),
('BOOK456', 'Laptop Charger', 25.00, 'For student loaners only.'),
('BOOK789', 'Noise Cancelling Headphones', 99.99, 'Use in quiet study areas.');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
('De revolutionibus orbium coelestium', 'Nicolaus Copernicus', 'A seminal work on heliocentrism.', '/workspace/assets/rare/copernicus.pdf'),
('Philosophiae Naturalis Principia Mathematica', 'Isaac Newton', 'The foundations of classical mechanics.', '/workspace/assets/rare/newton_principia.pdf'),
('On the Origin of Species', 'Charles Darwin', 'Evolution by natural selection.', '/workspace/assets/rare/darwin_origin.pdf');

