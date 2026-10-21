ALTER TABLE ai_daily_budgets ADD COLUMN estimated_cost DECIMAL(20,10) NOT NULL DEFAULT 0;
ALTER TABLE ai_requests ADD COLUMN model VARCHAR(200);
ALTER TABLE ai_requests ADD COLUMN latency_ms BIGINT;
