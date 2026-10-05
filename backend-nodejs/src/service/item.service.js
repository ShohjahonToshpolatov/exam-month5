import { pool } from "../config/pg.js";
import { deleteFiles } from "../helpers/deleteFiles.js";
import { transaction } from "../helpers/transaction.js";
const findItem = async (id) => {
  const result = await pool.query(`SELECT
   i.id, i.user_id, i.type, i.title, i.description, i.location,
   i.category_id, c.name AS category_name, i.event_date,
   i.secret_question, i.status, i.created_at, u.full_name AS owner_name
  FROM items i
  JOIN categories c ON c.id = i.category_id
  JOIN users u ON u.id = i.user_id
  WHERE i.id = $1`, [id]);
  if (result.rows.length === 0)
    return null;
  const item = result.rows[0];
  const images = await pool.query("SELECT id, image_url FROM item_images WHERE item_id = $1 ORDER BY id", [id]);
  item.images = images.rows;
  return item;
};
const createItem = async (req, res) => {
  const { type, title, description, location, category_id, event_date, secret_question, secret_answer, } = req.body;
  const removeUploaded = () => deleteFiles((req.files || []).map((file) => file.filename));
  let saved = false;
  try {
    const category = await pool.query("SELECT id FROM categories WHERE id = $1", [category_id]);
    if (category.rows.length === 0) {
      await removeUploaded();
      return res
        .status(404)
        .json({ success: false, message: "Kategoriya topilmadi", errors: [] });
    }
    const itemId = await transaction(async (client) => {
      const result = await client.query(`INSERT INTO items
    (user_id, type, title, description, location, category_id, event_date, secret_question, secret_answer)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING id`, [
        req.user.id,
        type,
        title,
        description,
        location,
        category_id,
        event_date,
        secret_question || null,
        secret_answer || null,
      ]);
      const itemId = result.rows[0].id;
      for (const image of req.files || []) {
        await client.query("INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)", [itemId, `/uploads/${image.filename}`]);
      }
      return itemId;
    });
    saved = true;
    const item = await findItem(itemId);
    res.status(201).json({ success: true, item });
  }
  catch (error) {
    if (!saved)
      await removeUploaded();
    throw error;
  }
};
const getItems = async (req, res) => {
  const { type, category_id, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const result = await pool.query(`SELECT
   i.id, i.type, i.title, i.description, i.location,
   i.category_id, c.name AS category_name, i.event_date,
   i.status, i.created_at,
   (SELECT image_url FROM item_images WHERE item_id = i.id ORDER BY id LIMIT 1) AS image_url
  FROM items i
  JOIN categories c ON c.id = i.category_id
  WHERE ($1::text IS NULL OR i.type = $1)
   AND ($2::int IS NULL OR i.category_id = $2)
   AND ($3::text IS NULL
      OR i.title ILIKE $3 OR i.description ILIKE $3 OR i.location ILIKE $3)
  ORDER BY i.created_at DESC
  LIMIT $4 OFFSET $5`, [
    type || null,
    category_id || null,
    search ? `%${search}%` : null,
    Number(limit) + 1,
    offset,
  ]);
  res.json({ success: true, items: result.rows.slice(0, Number(limit)), hasMore: result.rows.length > Number(limit) });
};
const getMyItems = async (req, res) => {
  const result = await pool.query("SELECT id, title, type, location, status, created_at FROM items WHERE user_id = $1 ORDER BY created_at DESC, id DESC", [req.user.id]);
  res.json({ success: true, items: result.rows });
};
const getItemById = async (req, res) => {
  const item = await findItem(req.params.id);
  if (!item) {
    return res
      .status(404)
      .json({ success: false, message: "E'lon topilmadi", errors: [] });
  }
  res.json({ success: true, item });
};
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, category_id } = req.body;
  const found = await pool.query("SELECT id, user_id, status FROM items WHERE id = $1", [id]);
  if (found.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "E'lon topilmadi", errors: [] });
  }
  const item = found.rows[0];
  if (item.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Bu e'lonni o'zgartira olmaysiz",
      errors: [],
    });
  }
  if (item.status !== "active") {
    return res.status(400).json({
      success: false,
      message: "Yopilgan e'lonni o'zgartirib bo'lmaydi",
      errors: [],
    });
  }
  if (category_id !== undefined) {
    const category = await pool.query("SELECT id FROM categories WHERE id = $1", [category_id]);
    if (category.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kategoriya topilmadi", errors: [] });
    }
  }
  await pool.query(`UPDATE items
  SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    location = COALESCE($3, location),
    category_id = COALESCE($4, category_id)
  WHERE id = $5`, [
    title ?? null,
    description ?? null,
    location ?? null,
    category_id ?? null,
    id,
  ]);
  res.json({ success: true, item: await findItem(id) });
};
const closeItem = async (req, res) => {
  const { id } = req.params;
  const found = await pool.query("SELECT id, user_id, status FROM items WHERE id = $1", [id]);
  if (found.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "E'lon topilmadi", errors: [] });
  }
  const item = found.rows[0];
  if (item.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Bu e'lonni yopish huquqingiz yo'q",
      errors: [],
    });
  }
  if (item.status !== "active") {
    return res.status(400).json({
      success: false,
      message: "E'lon allaqachon yopilgan",
      errors: [],
    });
  }
  await transaction(async (client) => {
    await client.query("SELECT id FROM items WHERE id = $1 FOR UPDATE", [id]);
    await client.query("UPDATE items SET status = 'closed' WHERE id = $1", [id]);
    await client.query("UPDATE claims SET status = 'rejected' WHERE item_id = $1 AND status = 'pending'", [id]);
  });
  res.json({ success: true, message: "E'lon yopildi" });
};
export { createItem, getItems, getMyItems, getItemById, updateItem, closeItem };
