-- ============================================================
-- PERSONAL FINANCE APPLICATION - DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS finance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance_db;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    avatar      VARCHAR(500) NULL,
    role        ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TRANSACTION CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NULL,
    name        VARCHAR(100) NOT NULL,
    type        ENUM('income', 'expense', 'both') NOT NULL DEFAULT 'both',
    icon        VARCHAR(100) NOT NULL DEFAULT 'mdi-tag',
    color       VARCHAR(20)  NOT NULL DEFAULT '#C9A84C',
    is_default  TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cat_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    category_id     INT UNSIGNED NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    type            ENUM('income', 'expense') NOT NULL,
    payment_method  ENUM('cash','card','bank_transfer','e_wallet','other') NOT NULL DEFAULT 'cash',
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL DEFAULT '00:00:00',
    note            TEXT NULL,
    status          ENUM('completed','pending','cancelled') NOT NULL DEFAULT 'completed',
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tx_cat  FOREIGN KEY (category_id) REFERENCES transaction_categories (id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_date (transaction_date),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- UPLOADED SLIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_slips (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id  INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    filename        VARCHAR(500) NOT NULL,
    original_name   VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       INT UNSIGNED NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_slip_tx   FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
    CONSTRAINT fk_slip_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        ENUM('daily','weekly','monthly','bill','expense','income','system') NOT NULL DEFAULT 'system',
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                 INT UNSIGNED NOT NULL UNIQUE,
    theme                   ENUM('dark', 'light') NOT NULL DEFAULT 'dark',
    currency                VARCHAR(10) NOT NULL DEFAULT 'USD',
    currency_symbol         VARCHAR(5) NOT NULL DEFAULT '$',
    language                VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone                VARCHAR(60) NOT NULL DEFAULT 'UTC',
    notify_daily            TINYINT(1) NOT NULL DEFAULT 1,
    notify_weekly           TINYINT(1) NOT NULL DEFAULT 1,
    notify_monthly          TINYINT(1) NOT NULL DEFAULT 1,
    notify_bill             TINYINT(1) NOT NULL DEFAULT 1,
    notify_expense          TINYINT(1) NOT NULL DEFAULT 1,
    notify_income           TINYINT(1) NOT NULL DEFAULT 1,
    monthly_budget          DECIMAL(15,2) NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    action      VARCHAR(100) NOT NULL,
    description TEXT NULL,
    ip_address  VARCHAR(45) NULL,
    user_agent  TEXT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- DEFAULT CATEGORIES (system-wide, user_id = NULL)
-- ============================================================
INSERT INTO transaction_categories (user_id, name, type, icon, color, is_default) VALUES
(NULL, 'Salary',        'income',  'mdi-cash-multiple',      '#4CAF50', 1),
(NULL, 'Freelance',     'income',  'mdi-laptop',             '#8BC34A', 1),
(NULL, 'Investment',    'income',  'mdi-trending-up',        '#C9A84C', 1),
(NULL, 'Gift',          'income',  'mdi-gift',               '#E91E63', 1),
(NULL, 'Bonus',         'income',  'mdi-star-circle',        '#FF9800', 1),
(NULL, 'Other Income',  'income',  'mdi-plus-circle',        '#9C27B0', 1),
(NULL, 'Food',          'expense', 'mdi-food',               '#F44336', 1),
(NULL, 'Transport',     'expense', 'mdi-car',                '#FF5722', 1),
(NULL, 'Shopping',      'expense', 'mdi-shopping',           '#E91E63', 1),
(NULL, 'Bills',         'expense', 'mdi-receipt',            '#9C27B0', 1),
(NULL, 'Healthcare',    'expense', 'mdi-hospital-box',       '#2196F3', 1),
(NULL, 'Education',     'expense', 'mdi-school',             '#3F51B5', 1),
(NULL, 'Entertainment', 'expense', 'mdi-gamepad-variant',    '#00BCD4', 1),
(NULL, 'Housing',       'expense', 'mdi-home',               '#607D8B', 1),
(NULL, 'Insurance',     'expense', 'mdi-shield-check',       '#795548', 1),
(NULL, 'Other Expense', 'expense', 'mdi-minus-circle',       '#9E9E9E', 1);
