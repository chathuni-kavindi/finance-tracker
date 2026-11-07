
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(50) NOT NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uniq_category
  ON categories (COALESCE(user_id, 0), LOWER(name), type);

CREATE TABLE transactions (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id      INT NOT NULL REFERENCES categories(id),
  type             VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  description      VARCHAR(150) NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL,
  payment_method   VARCHAR(30) NOT NULL DEFAULT 'Cash',
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date
  ON transactions (user_id, transaction_date DESC);

CREATE TABLE budgets (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  INT NOT NULL REFERENCES categories(id),
  amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year  INT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, category_id, period_month, period_year)
);

INSERT INTO categories (user_id, name, type) VALUES
  (NULL, 'Salary', 'income'),
  (NULL, 'Freelance', 'income'),
  (NULL, 'Business', 'income'),
  (NULL, 'Scholarship', 'income'),
  (NULL, 'Gift', 'income'),
  (NULL, 'Other', 'income'),
  (NULL, 'Food', 'expense'),
  (NULL, 'Transport', 'expense'),
  (NULL, 'Education', 'expense'),
  (NULL, 'Housing', 'expense'),
  (NULL, 'Bills', 'expense'),
  (NULL, 'Healthcare', 'expense'),
  (NULL, 'Shopping', 'expense'),
  (NULL, 'Entertainment', 'expense'),
  (NULL, 'Other', 'expense');