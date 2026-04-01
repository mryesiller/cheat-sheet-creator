-- API rate limit counters (per user + route key)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_key       TEXT NOT NULL,
  window_start    TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count   INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_key)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user ON api_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated ON api_rate_limits(updated_at);

DROP TRIGGER IF EXISTS set_api_rate_limits_updated_at ON api_rate_limits;
CREATE TRIGGER set_api_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner full access on api rate limits" ON api_rate_limits;
CREATE POLICY "Owner full access on api rate limits" ON api_rate_limits
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
