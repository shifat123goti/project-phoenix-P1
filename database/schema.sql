-- PROJECT PHOENIX DATABASE FINAL
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    coins BIGINT NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0,
    total_coins BIGINT NOT NULL DEFAULT 0,
    referrals INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    target INTEGER NOT NULL DEFAULT 1,
    reward BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coins BIGINT NOT NULL,
    reason VARCHAR(100) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reward BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins);
CREATE INDEX IF NOT EXISTS idx_reward_logs_user ON reward_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON referrals(inviter_id);

INSERT INTO missions (name, description, target, reward)
SELECT 'First 100 Taps', 'Tap Phoenix 100 times.', 100, 300
WHERE NOT EXISTS (
    SELECT 1 FROM missions WHERE name = 'First 100 Taps'
);

INSERT INTO missions (name, description, target, reward)
SELECT 'Coin Hunter', 'Collect 1000 total coins.', 1000, 200
WHERE NOT EXISTS (
    SELECT 1 FROM missions WHERE name = 'Coin Hunter'
);

INSERT INTO missions (name, description, target, reward)
SELECT 'XP Master', 'Reach 500 XP progress.', 500, 500
WHERE NOT EXISTS (
    SELECT 1 FROM missions WHERE name = 'XP Master'
);

