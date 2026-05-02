-- GetReach Database — MySQL Schema

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                ENUM('user','admin') DEFAULT 'user',
    balance             DECIMAL(10,2) DEFAULT 0.00,
    reset_token         VARCHAR(100) DEFAULT NULL,
    reset_token_expiry  DATETIME DEFAULT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    service_id      VARCHAR(50) NOT NULL,
    service_name    VARCHAR(255) DEFAULT '',
    link            VARCHAR(2000) NOT NULL,
    quantity        INT NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    api_cost        DECIMAL(10,6) DEFAULT 0,
    api_order_id    VARCHAR(100) DEFAULT '',
    status          VARCHAR(50) DEFAULT 'pending',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    status          VARCHAR(50) DEFAULT 'Open',
    admin_reply     TEXT DEFAULT '',
    replied_at      DATETIME DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TICKET MESSAGES (chat thread)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id   INT NOT NULL,
    sender      ENUM('user','admin') NOT NULL,
    text        TEXT NOT NULL,
    sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- 5. FUND REQUESTS
CREATE TABLE IF NOT EXISTS fund_requests (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    method      VARCHAR(50) NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    tid         VARCHAR(100) NOT NULL UNIQUE,
    status      ENUM('pending','approved','rejected') DEFAULT 'pending',
    note        TEXT DEFAULT '',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. SERVICE OVERRIDES
CREATE TABLE IF NOT EXISTS service_overrides (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    service_id  VARCHAR(50) NOT NULL UNIQUE,
    name        VARCHAR(255) DEFAULT NULL,
    category    VARCHAR(100) DEFAULT NULL,
    rate        DECIMAL(10,4) DEFAULT NULL,
    min_qty     INT DEFAULT NULL,
    max_qty     INT DEFAULT NULL,
    hidden      TINYINT(1) DEFAULT 0,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
