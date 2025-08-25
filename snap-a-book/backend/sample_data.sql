-- Create database and tables
CREATE DATABASE IF NOT EXISTS snapabook DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE snapabook;

DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS rare_books;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	author VARCHAR(255),
	publisher VARCHAR(255),
	price DECIMAL(10,2),
	availability VARCHAR(64)
);

CREATE TABLE assets (
	asset_id VARCHAR(64) PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	price DECIMAL(10,2),
	usage_info TEXT
);

CREATE TABLE rare_books (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	author VARCHAR(255),
	abstract TEXT,
	pdf_file_path VARCHAR(255)
);

CREATE TABLE donations (
	id INT AUTO_INCREMENT PRIMARY KEY,
	book_title VARCHAR(255) NOT NULL,
	donor_name VARCHAR(255) NOT NULL,
	contact_number VARCHAR(64) NOT NULL,
	email VARCHAR(255) NOT NULL
);

-- Seed data
INSERT INTO books (title, author, publisher, price, availability) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 10.99, 'In Stock'),
('To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 8.99, 'In Stock'),
('1984', 'George Orwell', 'Secker & Warburg', 9.99, 'Out of Stock'),
('Moby Dick', 'Herman Melville', 'Harper & Brothers', 12.50, 'In Stock');

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
('BOOK123', 'Handheld Scanner', 199.99, 'Use for quick book scanning'),
('BOOK456', 'Library Card Printer', 499.00, 'Print new library cards'),
('BOOK789', 'Barcode Label Sheet', 14.99, 'For labeling books');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
('De revolutionibus orbium coelestium', 'Nicolaus Copernicus', 'Seminal work on heliocentrism.', '/pdfs/copernicus.pdf'),
('Principia Mathematica', 'Isaac Newton', 'Foundational text in physics and mathematics.', '/pdfs/newton-principia.pdf'),
('Dialogo sopra i due massimi sistemi del mondo', 'Galileo Galilei', 'Dialogue comparing heliocentric and geocentric systems.', '/pdfs/galileo-dialogue.pdf');