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
    Strategy VARCHAR(255) NOT NULL,
    Strike DECIMAL NOT NULL,
    ClosingPrice DECIMAL,
    ExpirationDate DATE NOT NULL,
    Open  BOOLEAN
);

-- Insert dummy data into Users table
INSERT INTO Users (Email, Name) VALUES
('john.doe@example.com', 'John Doe'),
('jane.doe@example.com', 'Jane Doe'),
('alex.smith@example.com', 'Alex Smith');

-- Insert dummy data into Trades table
-- Note: Assumes UserIDs from the Users table. Adjust UserIDs based on actual values in your Users table.
INSERT INTO Trades (UserID, Ticker, Strategy, Strike, ClosingPrice, ExpirationDate, Open) VALUES
(1, 'AAPL', 'Covered Call', 150.00, 151.50, '2023-12-31', TRUE),
(1, 'GOOGL', 'Call', 1800.00, 1820.25, '2023-12-31', FALSE),
(2, 'MSFT', 'Put', 300.00, 301.75, '2024-01-15', TRUE),
(3, 'TSLA', 'Cash Secured Put', 700.00, 710.50, '2024-02-01', FALSE);
