INSERT INTO books (title, author, publisher, price, availability) VALUES
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 29.99, 'In Stock'),
('The Pragmatic Programmer', 'Andrew Hunt; David Thomas', 'Addison-Wesley', 39.99, 'In Stock'),
('Design Patterns', 'Erich Gamma et al.', 'Addison-Wesley', 49.99, 'Out of Stock');

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
('BOOK123', 'Clean Code Book Asset', 29.99, 'For software craftsmanship learning'),
('BOOK456', 'Pragmatic Programmer Asset', 39.99, 'Career-long tips');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
('First Folio', 'William Shakespeare', 'Collection of plays published in 1623', '/pdfs/first_folio.pdf'),
('Principia Mathematica', 'Isaac Newton', 'Groundwork for classical mechanics', '/pdfs/principia.pdf');