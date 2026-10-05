import { pool } from "../config/pg.js";
import { transaction } from "../helpers/transaction.js";
const createClaim = async (req, res) => {
  const savedClaim = await transaction(async (client) => {
    const { answer, message } = req.body;
    const itemResult = await client.query("SELECT id, user_id, type, status, secret_answer FROM items WHERE id = $1 FOR UPDATE", [req.params.id]);
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
    if (item.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Yopilgan e'longa da'vo yuborib bo'lmaydi",
        errors: [],
      });
    }
    const oldClaim = await client.query("SELECT id FROM claims WHERE item_id = $1 AND user_id = $2 AND status = 'pending'", [item.id, req.user.id]);
    if (oldClaim.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Siz allaqachon da'vo yuborgansiz",
        errors: [],
      });
    }
    const isCorrect = Boolean(item.secret_answer) &&
      item.secret_answer.toLowerCase() === answer.toLowerCase();
    const result = await client.query(`INSERT INTO claims (item_id, user_id, answer, message, is_correct, status)
  VALUES ($1, $2, $3, $4, $5, 'pending')
  RETURNING id, item_id, user_id, answer, message, is_correct, status, created_at`, [item.id, req.user.id, answer, message || null, isCorrect]);
    return result.rows[0];
  });
  if (!res.headersSent)
    res.status(201).json({ success: true, claim: savedClaim });
};
const getMyClaims = async (req, res) => {
  const result = await pool.query(`SELECT c.id, c.item_id, c.answer, c.message, c.is_correct, c.status, c.created_at,
      i.title, i.type
  FROM claims c
  JOIN items i ON i.id = c.item_id
  WHERE c.user_id = $1
  ORDER BY c.created_at DESC`, [req.user.id]);
  res.json({ success: true, claims: result.rows });
};
const getItemClaims = async (req, res) => {
  const itemId = req.params.id;
  const item = await pool.query("SELECT id FROM items WHERE id = $1 AND user_id = $2", [itemId, req.user.id]);
  if (item.rows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "Bu e'lonning da'volarini ko'rish huquqingiz yo'q",
      errors: [],
    });
  }
  const result = await pool.query(`SELECT c.id, c.item_id, c.user_id, c.answer, c.message, c.is_correct, c.status, c.created_at,
      u.full_name, u.email, u.phone
  FROM claims c
  JOIN users u ON u.id = c.user_id
  WHERE c.item_id = $1
  ORDER BY c.created_at DESC`, [itemId]);
  res.json({ success: true, claims: result.rows });
};
const updateClaim = async (req, res) => {
  const savedClaim = await transaction(async (client) => {
    const claimId = req.params.id;
    const { status } = req.body;
    await client.query("SELECT id FROM items WHERE id = (SELECT item_id FROM claims WHERE id = $1) FOR UPDATE", [claimId]);
    const claimResult = await client.query(`SELECT c.id, c.item_id, c.status, i.user_id AS owner_id, i.status AS item_status
  FROM claims c
  JOIN items i ON i.id = c.item_id
  WHERE c.id = $1`, [claimId]);
    if (claimResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Da'vo topilmadi", errors: [] });
    }
    const claim = claimResult.rows[0];
    if (claim.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bu da'voni o'zgartirish huquqingiz yo'q",
        errors: [],
      });
    }
    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Bu da'vo allaqachon ko'rib chiqilgan",
        errors: [],
      });
    }
    if (claim.item_status !== "active") {
      return res.status(400).json({
        success: false,
        message: "E'lon allaqachon yopilgan",
        errors: [],
      });
    }
    if (status === "accepted") {
      await client.query("UPDATE claims SET status = 'rejected' WHERE item_id = $1 AND id != $2 AND status = 'pending'", [claim.item_id, claimId]);
      await client.query("UPDATE items SET status = 'closed' WHERE id = $1", [
        claim.item_id,
      ]);
    }
    const result = await client.query("UPDATE claims SET status = $1 WHERE id = $2 RETURNING id, item_id, user_id, status", [status, claimId]);
    return result.rows[0];
  });
  if (!res.headersSent)
    res.json({ success: true, claim: savedClaim });
};
export { createClaim, getMyClaims, getItemClaims, updateClaim };
