CREATE TABLE accounts (
 id UUID PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, password_hash VARCHAR(100) NOT NULL,
 display_name VARCHAR(100) NOT NULL, daily_minutes INTEGER NOT NULL DEFAULT 15,
 time_zone VARCHAR(100) NOT NULL DEFAULT 'UTC', retain_history BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE learning_items (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), expression VARCHAR(500) NOT NULL,
 meaning VARCHAR(2000) NOT NULL, context VARCHAR(4000) NOT NULL, example VARCHAR(4000) NOT NULL,
 notes VARCHAR(8000) NOT NULL, tags VARCHAR(1000) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL,
 review_enabled BOOLEAN NOT NULL
);
CREATE INDEX items_owner ON learning_items(owner_id);
CREATE TABLE review_cards (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), learning_item_id UUID NOT NULL UNIQUE REFERENCES learning_items(id) ON DELETE CASCADE,
 due_at TIMESTAMP WITH TIME ZONE NOT NULL, version INTEGER NOT NULL DEFAULT 0,
 repetitions INTEGER NOT NULL DEFAULT 0, interval_days INTEGER NOT NULL DEFAULT 0, ease DOUBLE PRECISION NOT NULL DEFAULT 2.5
);
CREATE TABLE reviews (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), card_id UUID NOT NULL REFERENCES review_cards(id) ON DELETE CASCADE,
 request_id UUID NOT NULL, rating VARCHAR(10) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL,
 response TEXT NOT NULL, UNIQUE(owner_id, request_id)
);
CREATE TABLE conversations (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), title VARCHAR(200) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE messages (
 id UUID PRIMARY KEY, conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
 role VARCHAR(20) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE ai_budget_lock (id INTEGER PRIMARY KEY);
INSERT INTO ai_budget_lock(id) VALUES (1);
CREATE TABLE ai_requests (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES accounts(id), request_id UUID NOT NULL,
 conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
 fingerprint VARCHAR(64) NOT NULL, status VARCHAR(20) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL,
 reserved_tokens BIGINT NOT NULL, input_tokens BIGINT NOT NULL DEFAULT 0, output_tokens BIGINT NOT NULL DEFAULT 0,
 estimated_cost DECIMAL(20,10) NOT NULL DEFAULT 0, response TEXT,
 UNIQUE(owner_id, request_id)
);
CREATE INDEX ai_owner_date ON ai_requests(owner_id, created_at);
CREATE TABLE ai_daily_budgets (
 owner_id UUID NOT NULL REFERENCES accounts(id), budget_date DATE NOT NULL,
 requests BIGINT NOT NULL DEFAULT 0, tokens BIGINT NOT NULL DEFAULT 0,
 PRIMARY KEY(owner_id,budget_date)
);
