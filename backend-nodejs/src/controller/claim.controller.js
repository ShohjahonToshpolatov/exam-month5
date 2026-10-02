import { pool } from "../config/pg.js";

const createClaim = async (req, res) => {
  const { answer, message } = req.body;
  const itemResult = await pool.query(
    "SELECT id, user_id, type, status, secret_answer FROM items WHERE id = $1",
    [req.params.id],
  );

  if (itemResult.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "E'lon topilmadi", errors: [] });
  }

  const item = itemResult.rows[0];
  if (item.user_id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: "O'z e'loningizga da'vo yubora olmaysiz",
      errors: [],
    });
  }

  const isCorrect =
    Boolean(item.secret_answer) &&
    item.secret_answer.toLowerCase() === (answer || "").toLowerCase();

  const result = await pool.query(
    `INSERT INTO claims (item_id, user_id, answer, message, is_correct, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
    [item.id, req.user.id, answer, message || null, isCorrect],
  );

  res.status(201).json({ success: true, claim: result.rows[0] });
};

const getMyClaims = async (req, res) => {
  const result = await pool.query(
    `SELECT c.*, i.title, i.type FROM claims c JOIN items i ON i.id = c.item_id WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
    [req.user.id],
  );
  res.json({ success: true, claims: result.rows });
};

const getItemClaims = async (req, res) => {
  const result = await pool.query(
    `SELECT c.*, u.full_name, u.email, u.phone FROM claims c JOIN users u ON u.id = c.user_id WHERE c.item_id = $1 ORDER BY c.created_at DESC`,
    [req.params.itemId || req.params.id],
  );
  res.json({ success: true, claims: result.rows });
};

const updateClaim = async (req, res) => {
  const { claimId } = req.params;
  const { status } = req.body;

  const result = await pool.query(
    "UPDATE claims SET status = $1 WHERE id = $2 RETURNING *",
    [status, claimId],
  );
  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Da'vo topilmadi", errors: [] });
  }

  res.json({ success: true, claim: result.rows[0] });
};

export { createClaim, getMyClaims, getItemClaims, updateClaim };
