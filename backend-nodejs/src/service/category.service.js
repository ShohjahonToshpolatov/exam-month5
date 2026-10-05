import { pool } from "../config/pg.js";
const getCategories = async (req, res) => {
  const result = await pool.query("SELECT id, name, created_at FROM categories ORDER BY id DESC");
  res.json({ success: true, categories: result.rows });
};
const getCategoryById = async (req, res) => {
  const result = await pool.query("SELECT id, name, created_at FROM categories WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Kategoriya topilmadi", errors: [] });
  }
  res.json({ success: true, category: result.rows[0] });
};
const createCategory = async (req, res) => {
  const { name } = req.body;
  const old = await pool.query("SELECT id FROM categories WHERE LOWER(name) = LOWER($1)", [name]);
  if (old.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Bu kategoriya allaqachon mavjud",
      errors: [],
    });
  }
  const result = await pool.query("INSERT INTO categories (name) VALUES ($1) RETURNING id, name, created_at", [name]);
  res.status(201).json({ success: true, category: result.rows[0] });
};
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await pool.query("SELECT id FROM categories WHERE id = $1", [
    id,
  ]);
  if (category.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Kategoriya topilmadi", errors: [] });
  }
  const old = await pool.query("SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2", [name, id]);
  if (old.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Bu kategoriya allaqachon mavjud",
      errors: [],
    });
  }
  const result = await pool.query("UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, created_at", [name, id]);
  res.json({ success: true, category: result.rows[0] });
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await pool.query("SELECT id FROM categories WHERE id = $1", [
    id,
  ]);
  if (category.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Kategoriya topilmadi", errors: [] });
  }
  const items = await pool.query("SELECT id FROM items WHERE category_id = $1 LIMIT 1", [id]);
  if (items.rows.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Bu kategoriyada e'lonlar mavjud",
      errors: [],
    });
  }
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  res.json({ success: true, message: "Kategoriya o'chirildi" });
};
export { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, };
