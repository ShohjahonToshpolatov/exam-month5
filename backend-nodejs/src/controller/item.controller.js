import { pool } from "../config/pg.js";
import { deleteFiles } from "../helpers/deleteFiles.js";

const findItem = async (id) => {
  const result = await pool.query(
    `SELECT i.*, c.name AS category_name FROM items i JOIN categories c ON c.id = i.category_id WHERE i.id = $1`,
    [id],
  );
  if (result.rows.length === 0) return null;
  const item = result.rows[0];
  const images = await pool.query(
    "SELECT id, image_url FROM item_images WHERE item_id = $1",
    [id],
  );
  item.images = images.rows;
  return item;
};

const createItem = async (req, res) => {
  const {
    type,
    title,
    description,
    location,
    category_id,
    event_date,
    secret_question,
    secret_answer,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, type, title, description, location, category_id, event_date, secret_question, secret_answer) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        req.user.id,
        type,
        title,
        description,
        location,
        category_id,
        event_date,
        secret_question || null,
        secret_answer || null,
      ],
    );
    const itemId = result.rows[0].id;

    if (req.files) {
      for (const image of req.files) {
        await pool.query(
          "INSERT INTO item_images (item_id, image_url) VALUES ($1, $2)",
          [itemId, `/uploads/${image.filename}`],
        );
      }
    }

    const item = await findItem(itemId);
    res.status(201).json({ success: true, item });
  } catch (error) {
    if (req.files) {
      await deleteFiles(req.files.map((file) => file.filename));
    }
    throw error;
  }
};

const getItems = async (req, res) => {
  const { type, category_id, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT i.*, c.name AS category_name FROM items i JOIN categories c ON c.id = i.category_id 
     WHERE ($1::text IS NULL OR i.type = $1) 
     AND ($2::int IS NULL OR i.category_id = $2) 
     AND ($3::text IS NULL OR i.title ILIKE $3 OR i.description ILIKE $3) 
     ORDER BY i.created_at DESC LIMIT $4 OFFSET $5`,
    [
      type || null,
      category_id || null,
      search ? `%${search}%` : null,
      limit,
      offset,
    ],
  );

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

  await pool.query(
    `UPDATE items SET title = COALESCE($1, title), description = COALESCE($2, description), location = COALESCE($3, location), category_id = COALESCE($4, category_id) WHERE id = $5`,
    [
      title ?? null,
      description ?? null,
      location ?? null,
      category_id ?? null,
      id,
    ],
  );

  res.json({ success: true, item: await findItem(id) });
};

const closeItem = async (req, res) => {
  await pool.query("UPDATE items SET status = 'closed' WHERE id = $1", [
    req.params.id,
  ]);
  res.json({ success: true, message: "E'lon yopildi" });
};

export { createItem, getItems, getItemById, updateItem, closeItem };
