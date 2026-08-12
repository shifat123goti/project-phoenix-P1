require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

const adminOnly = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (e) {
    res.status(503).json({ ok: false, database: "offline" });
  }
});

app.get("/api/users", adminOnly, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, level, coins, xp, created_at FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load users" });
  }
});

app.post("/api/users", adminOnly, async (req, res) => {
  const { name, level = 1, coins = 0, xp = 0 } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO users(name, level, coins, xp) VALUES($1,$2,$3,$4) RETURNING *",
      [String(name).trim(), Math.max(1, Number(level)), Math.max(0, Number(coins)), Math.max(0, Number(xp))]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.delete("/api/users/:id", adminOnly, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ deleted: result.rowCount });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.get("/api/missions", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, description, target, reward, active FROM missions ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load missions" });
  }
});

app.post("/api/missions", adminOnly, async (req, res) => {
  const { name, description = "", target = 1, reward = 0 } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Mission name is required" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO missions(name, description, target, reward) VALUES($1,$2,$3,$4) RETURNING *",
      [String(name).trim(), String(description), Math.max(1, Number(target)), Math.max(0, Number(reward))]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to create mission" });
  }
});

app.delete("/api/missions/:id", adminOnly, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM missions WHERE id=$1", [req.params.id]);
    res.json({ deleted: result.rowCount });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete mission" });
  }
});

app.post("/api/rewards/give", adminOnly, async (req, res) => {
  const { userId, coins } = req.body;
  const amount = Number(coins);
  if (!userId || !(amount > 0)) {
    return res.status(400).json({ error: "Valid userId and coins are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "UPDATE users SET coins=coins+$1, total_coins=total_coins+$1 WHERE id=$2 RETURNING *",
      [amount, userId]
    );
    if (!result.rowCount) throw new Error("User not found");
    await client.query(
      "INSERT INTO reward_logs(user_id, coins, reason) VALUES($1,$2,$3)",
      [userId, amount, "admin"]
    );
    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.get("/api/stats", adminOnly, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        COALESCE((SELECT SUM(coins) FROM users),0) AS coins,
        COALESCE((SELECT SUM(coins) FROM reward_logs),0) AS rewards,
        COALESCE((SELECT SUM(referrals) FROM users),0) AS referrals
    `);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(port, () => console.log(`Phoenix API running on port ${port}`));

