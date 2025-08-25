USE snapabook;

INSERT INTO books (title, author, publisher, price, availability) VALUES
  ('Clean Code', 'Robert C. Martin', 'Prentice Hall', 34.99, 'available'),
  ('The Pragmatic Programmer', 'Andrew Hunt; David Thomas', 'Addison-Wesley', 39.99, 'available'),
  ('Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 89.99, 'unavailable');

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
  ('BOOK123', 'High-Precision Scanner', 1999.00, 'Used for digitizing rare books'),
  ('BOOK200', 'Library RFID Tag', 1.50, 'Attach to book spine for tracking');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
  ('Liber Chronicarum', 'Hartmann Schedel', 'A 15th-century illustrated encyclopedia, also known as the Nuremberg Chronicle.', '/pdfs/liber_chronicarum.pdf'),
  ('Hypnerotomachia Poliphili', 'Francesco Colonna', 'Renowned incunabulum with exquisite woodcuts and mysterious narrative.', '/pdfs/hypnerotomachia.pdf');

