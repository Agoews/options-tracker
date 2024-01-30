-- Create Users table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL
);

-- Create Trades table
CREATE TABLE Trades (
    TradeID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    Ticker VARCHAR(255) NOT NULL,
    Actions VARCHAR(255) NOT NULL,
    Strategy VARCHAR(255),
    Strike DECIMAL NOT NULL,
    OptionPrice DECIMAL NOT NULL,
    ClosingPrice DECIMAL,
    ExpirationDate DATE NOT NULL,
    Open BOOLEAN,
    CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CompletionDate DATE
);


-- Insert dummy data into Users table
INSERT INTO Users (Email, Name) VALUES
('john.doe@example.com', 'John Doe'),
('jane.doe@example.com', 'Jane Doe'),
('alex.smith@example.com', 'Alex Smith');

-- Insert dummy data into Trades table
-- Note: Assumes UserIDs from the Users table. Adjust UserIDs based on actual values in your Users table.
INSERT INTO Trades (UserID, Ticker, Actions, Strategy, Strike, OptionPrice, ClosingPrice, ExpirationDate, Open, CreationDate, CompletionDate) VALUES
(1, 'AAPL', 'COVERED CALL', 'WHEEL', 150.00, 1.21, NULL, '2023-12-31', TRUE, CURRENT_TIMESTAMP, NULL),
(1, 'GOOGL', 'CALL', NULL, 1800.00, 2.34, 2.82, '2023-12-31', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'MSFT', 'PUT', NULL, 300.00, 1.22, NULL, '2024-01-15', TRUE, CURRENT_TIMESTAMP, NULL),
(2, 'MSFT', 'PUT', NULL, 300.00, 1.22, NULL, '2024-01-15', TRUE, CURRENT_TIMESTAMP, NULL),
(1, 'TSLA', 'CASH SECURED PUT', 'WHEEL', 700.00, 1.00, NULL, '2024-02-01', TRUE, CURRENT_TIMESTAMP, NULL);
