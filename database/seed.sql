USE snapabook;

INSERT INTO books (title, author, publisher, price, availability) VALUES
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 39.99, 'In Stock'),
('Clean Architecture', 'Robert C. Martin', 'Pearson', 44.99, 'Limited'),
('Refactoring', 'Martin Fowler', 'Addison-Wesley', 49.99, 'In Stock');

INSERT INTO assets (asset_id, name, price, usage_info) VALUES
('BOOK123', 'Adjustable Reading Lamp', 19.99, 'Use for night reading, USB powered'),
('BOOK999', 'Hardcover Book Stand', 24.50, 'Great for cookbooks and study');

INSERT INTO rare_books (title, author, abstract, pdf_file_path) VALUES
('The Art of Bookbinding', 'Joseph W. Zaehnsdorf', 'Classic treatise on binding techniques.', '/pdfs/zaehnsdorf_art_of_bookbinding.pdf'),
('A Short History of the Printed Word', 'Warren Chappell', 'Survey of printing history.', '/pdfs/printed_word.pdf');
