import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { app } from "../src/app.js";
import { pool } from "../src/config/pg.js";
import { uploadsPath } from "../src/config/paths.js";

process.env.SMTP_HOST = "";
process.env.NODE_ENV = "test";

const server = app.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
const base = "http://127.0.0.1:" + server.address().port + "/api";
const marker = "test" + Date.now();
const users = [];
const files = [];
let categoryId;
let checks = 0;

async function request(path, method = "GET", body, token, status = 200) {
  const headers = {};
  if (token) headers.Authorization = "Bearer " + token;
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const response = await fetch(base + path, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  assert.equal(response.status, status, method + " " + path + " " + JSON.stringify(data));
  checks++;
  return data;
}

async function account(suffix) {
  const email = marker + suffix + "@example.com";
  const result = await request("/auth/register", "POST", { full_name: "Test User", email, phone: "+998901234567", password: "Password123" }, null, 201);
  users.push(result.user.id);
  await request("/auth/verify", "POST", { email, code: result.otp });
  return { ...await request("/auth/login", "POST", { email, password: "Password123" }), email };
}

function itemBody(type = "found") {
  const body = new FormData();
  for (const [key, value] of Object.entries({ type, title: "Test buyum", description: "Bu sinov uchun buyum tavsifi", location: "Toshkent", category_id: String(categoryId), event_date: "2026-01-01" })) body.append(key, value);
  if (type === "found") { body.append("secret_question", "Buyumning rangi qanday?"); body.append("secret_answer", "yashil"); }
  return body;
}

test("API registration, ownership, claims, uploads, filters and admin flows", async () => {
  try {
    await request("/items?limit=0", "GET", null, null, 400);
    await request("/items/no-id", "GET", null, null, 400);
    await request("/items/999999999999", "GET", null, null, 400);
    await request("/items?category_id=999999999999", "GET", null, null, 400);
    await request("/claims/item/no-id", "GET", null, null, 401);
    const owner = await account("owner");
    const claimant = await account("claimant");
    const other = await account("other");
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [owner.user.id]);
    const category = await request("/categories", "POST", { name: marker }, owner.token, 201);
    categoryId = category.category.id;
    await request("/categories/" + categoryId, "PATCH", { name: marker + "new" }, owner.token);
    const created = await request("/items", "POST", itemBody(), owner.token, 201);
    const item = created.item;
    assert.equal(item.secret_answer, undefined);
    assert.equal(item.owner_name, "Test User");
    const list = await request("/items?limit=1&search=Test");
    assert.equal(list.items.length, 1);
    assert.equal(list.items[0].secret_answer, undefined);
    const own = await request("/items/my", "GET", null, owner.token);
    assert.ok(own.items.some(x => x.id === item.id));
    await request("/items/" + item.id, "PATCH", { title: "Other title" }, claimant.token, 403);
    await request("/items/" + item.id + "/close", "PATCH", {}, claimant.token, 403);
    await request("/claims/item/" + item.id, "GET", null, claimant.token, 403);
    await request("/claims/item/abc", "GET", null, claimant.token, 400);
    await request("/items/" + item.id, "PATCH", { title: "Updated title" }, owner.token);
    await request("/claims/item/" + item.id, "POST", { answer: "yashil" }, owner.token, 400);
    const claim = await request("/claims/item/" + item.id, "POST", { answer: "YASHIL", message: "Meniki" }, claimant.token, 201);
    assert.equal(claim.claim.is_correct, true);
    await request("/claims/item/" + item.id, "POST", { answer: "yashil" }, claimant.token, 409);
    const second = await request("/claims/item/" + item.id, "POST", { answer: "qora" }, other.token, 201);
    await request("/claims/" + claim.claim.id, "PATCH", { status: "accepted" }, other.token, 403);
    await request("/claims/" + claim.claim.id, "PATCH", { status: "accepted" }, owner.token);
    const finished = await request("/items/" + item.id);
    assert.equal(finished.item.status, "closed");
    const claims = await request("/claims/item/" + item.id, "GET", null, owner.token);
    assert.equal(claims.claims.find(x => x.id === second.claim.id).status, "rejected");
    await request("/claims/item/" + item.id, "POST", { answer: "yashil" }, other.token, 400);
    await request("/items/" + item.id, "PATCH", { title: "Closed title" }, owner.token, 400);
    await request("/categories/" + categoryId, "DELETE", null, owner.token, 400);
    const lost = await request("/items", "POST", itemBody("lost"), owner.token, 201);
    const report = await request("/claims/item/" + lost.item.id, "POST", { answer: "Men topdim", message: "Parkda topdim" }, claimant.token, 201);
    await request("/items/" + lost.item.id + "/close", "PATCH", {}, owner.token);
    const my = await request("/claims/my", "GET", null, claimant.token);
    assert.equal(my.claims.find(x => x.id === report.claim.id).status, "rejected");
    const before = (await fs.readdir(uploadsPath)).sort();
    const invalid = itemBody();
    invalid.set("title", "x");
    invalid.append("images", new Blob(["test"], { type: "image/png" }), "invalid.png");
    await request("/items", "POST", invalid, owner.token, 400);
    assert.deepEqual((await fs.readdir(uploadsPath)).sort(), before);
    const image = itemBody();
    image.append("images", new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/r3sAAAAASUVORK5CYII=", "base64")], { type: "image/png" }), "photo.png");
    const withImage = await request("/items", "POST", image, owner.token, 201);
    files.push(...withImage.item.images.map(x => x.image_url.split("/").pop()));
    const imageResponse = await fetch(base.replace("/api", "") + withImage.item.images[0].image_url);
    assert.equal(imageResponse.status, 200);
    await request("/admin/users/" + owner.user.id, "DELETE", null, owner.token, 400);
    await request("/admin/users/" + owner.user.id + "/role", "PATCH", { role: "user" }, owner.token, 400);
    await request("/admin/users?search=" + marker, "GET", null, owner.token);
    const stats = await request("/admin/stats", "GET", null, owner.token);
    assert.ok(Number(stats.stats.categories) > 0);
    await pool.query("UPDATE users SET role = 'user' WHERE id = $1", [owner.user.id]);
    await request("/admin/stats", "GET", null, owner.token, 403);
    const reset = await request("/auth/forgot-password", "POST", { email: claimant.email });
    await request("/auth/reset-password", "POST", { email: claimant.email, code: reset.otp, newPassword: "NewPassword123" });
    await request("/auth/reset-password", "POST", { email: claimant.email, code: reset.otp, newPassword: "NewPassword456" }, null, 400);
    await request("/auth/login", "POST", { email: claimant.email, password: "Password123" }, null, 401);
    await request("/auth/login", "POST", { email: claimant.email, password: "NewPassword123" });
    await pool.query("DELETE FROM users WHERE id = $1", [other.user.id]);
    await request("/auth/me", "GET", null, other.token, 401);
    console.log(checks + " HTTP checks passed");
  } finally {
    await pool.query("DELETE FROM users WHERE id = ANY($1::int[])", [users]);
    if (categoryId) await pool.query("DELETE FROM categories WHERE id = $1", [categoryId]);
    for (const name of files) await fs.unlink(uploadsPath + "/" + name);
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
