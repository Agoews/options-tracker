-- Create Users table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE OpenTrades (
    TradeID SERIAL PRIMARY KEY,
    UserID INT REFERENCES Users(UserID),
    Ticker VARCHAR(255) NOT NULL,
    Strike DECIMAL NOT NULL,
    CurrentPrice DECIMAL NOT NULL,
    OpenQuantity INT NOT NULL,
    OptionPrice DECIMAL NOT NULL,
    Actions VARCHAR(255) NOT NULL,
    Strategy VARCHAR(255),
    ExpirationDate DATE NOT NULL,
    isClosed BOOLEAN,
    CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE ClosedTrades (
    ClosedTradeID SERIAL PRIMARY KEY,
    TradeID INT REFERENCES OpenTrades(TradeID) ON DELETE CASCADE,
    ClosingPrice DECIMAL,
    CompletionDate DATE,
    ClosedQuantity INT
);

CREATE TABLE CurrentHoldings (
    CurrentHoldingsID SERIAL PRIMARY KEY,
    Ticker VARCHAR(255) NOT NULL,

)


-- Insert dummy data into Users table
INSERT INTO Users (Email, Name) VALUES
('john.doe@example.com', 'John Doe'),
('jane.doe@example.com', 'Jane Doe'),
('alex.smith@example.com', 'Alex Smith');

-- Insert dummy data into Trades table
INSERT INTO Trades (UserID, Ticker, Actions, Strategy, Strike, OpenQuantity, RemainingQuantity, OptionPrice, ClosingPrice, ExpirationDate, Open, CreationDate, CompletionDate) VALUES
(1, 'AAPL', 'COVERED CALL', 'WHEEL', 150.00, 2, 3, 1.21, NULL, '2023-12-31', TRUE, CURRENT_TIMESTAMP, NULL),
(1, 'GOOGL', 'CALL', NULL, 1800.00, 1, 0, 2.34, 2.82, '2023-12-31', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'MSFT', 'PUT', NULL, 300.00, 2, 2, 1.22, NULL, '2024-01-15', TRUE, CURRENT_TIMESTAMP, NULL),
(2, 'MSFT', 'PUT', NULL, 300.00, 3, 4, 1.22, NULL, '2024-01-15', TRUE, CURRENT_TIMESTAMP, NULL),
(1, 'TSLA', 'CASH SECURED PUT', 'WHEEL', 700.00, 0, 1, 1.00, NULL, '2024-02-01', TRUE, CURRENT_TIMESTAMP, NULL);

INSERT INTO OpenTrades (UserID, Ticker, Actions, Strategy, Strike, OpenQuantity, OptionPrice, isClosed, ExpirationDate) VALUES
(1, 'AAPL', 'CALL', '', 150.00, 10, 5.50, FALSE, '2024-06-15'),
(1, 'TSLA', 'CASH SECURED PUT', 'WHEEL', 900.00, 5, 30.00, FALSE, '2024-07-20'),
(1, 'MSFT', 'PUT', '', 200.00, 8, 10.00, FALSE, '2024-08-30'),
(1, 'GOOGL', 'CALL', '', 1800.00, 6, 45.00, FALSE, '2024-09-10');

INSERT INTO ClosedTrades (TradeID, ClosingPrice, CompletionDate, ClosedQuantity) VALUES
(1, 6.00, '2024-06-01', 5),
(1, 6.50, '2024-06-03', 5),
(1, 28.00, '2024-07-15', 5),
(1, 9.50, '2024-08-25', 8);
