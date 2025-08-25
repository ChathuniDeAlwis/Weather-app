USE snapabook;

INSERT INTO books (title, author, publisher, price, availability) VALUES
  ('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 10.99, 1),
  ('To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 8.99, 1),
  ('1984', 'George Orwell', 'Secker & Warburg', 7.50, 0),
  ('Moby Dick', 'Herman Melville', 'Harper & Brothers', 12.00, 1);

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
  ('BOOK123', 'Book Display Stand', 25.00, 'Use to display featured books'),
  ('BOOK456', 'Barcode Scanner', 60.00, 'Scan book barcodes for inventory'),
  ('BOOK789', 'Reading Lamp', 35.50, 'Provide focused lighting for reading areas');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
  ('De Revolutionibus Orbium Coelestium', 'Nicolaus Copernicus', 'Seminal work on heliocentrism.', '/pdfs/copernicus.pdf'),
  ('Principia Mathematica', 'Isaac Newton', 'Foundational text in physics and mathematics.', '/pdfs/newton_principia.pdf'),
  ('On the Origin of Species', 'Charles Darwin', 'Theory of evolution by natural selection.', '/pdfs/darwin_origin.pdf');