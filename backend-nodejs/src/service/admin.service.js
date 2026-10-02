import { pool } from "../config/pg.js";

const getStats = async (req, res) => {
  const users = await pool.query(`
    SELECT COUNT(*) AS users,
           COUNT(*) FILTER (WHERE role = 'admin') AS admins
    FROM users`);

  const items = await pool.query(`
    SELECT COUNT(*) AS items,
           COUNT(*) FILTER (WHERE type = 'lost') AS lost_items,
           COUNT(*) FILTER (WHERE type = 'found') AS found_items
    FROM items`);

  const claims = await pool.query(`
    SELECT COUNT(*) AS claims,
           COUNT(*) FILTER (WHERE status = 'pending') AS pending_claims
    FROM claims`);

  const stats = { ...users.rows[0], ...items.rows[0], ...claims.rows[0] };

  res.json({ success: true, stats });
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT id, full_name, email, phone, role, is_verified, created_at
     FROM users
     WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset],
  );

  res.json({ success: true, users: result.rows });
};

const updateUserRole = async (req, res) => {
  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, full_name, email, phone, role, is_verified`,
    [req.body.role, req.params.id],
  );

  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Foydalanuvchi topilmadi", errors: [] });
  }

  res.json({ success: true, user: result.rows[0] });
};

const deleteUser = async (req, res) => {
  if (Number(req.params.id) === Number(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "O'zingizni o'chira olmaysiz",
      errors: [],
    });
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [req.params.id],
  );

  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Foydalanuvchi topilmadi", errors: [] });
  }

  res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
};

export { getStats, getUsers, updateUserRole, deleteUser };
