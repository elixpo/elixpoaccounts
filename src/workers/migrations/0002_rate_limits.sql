-- Rate Limiting Table for Login, Register, and Password Reset
CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL, -- 'login', 'register', 'password_reset'
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  window_reset_at DATETIME NOT NULL, -- When the rate limit window resets
  is_blocked BOOLEAN DEFAULT 0,
  blocked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ip_address, endpoint)
);

-- Indexes for efficient rate limit lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_reset ON rate_limits(window_reset_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON rate_limits(blocked_until);
CREATE INDEX IF NOT EXISTS idx_rate_limits_is_blocked ON rate_limits(is_blocked);
