import express from "express";
import { all, get } from "../db.js";

const router = express.Router();

// Public: listings list
router.get("/", async (req, res) => {
  const {
    q = "",
    category = "all",
    status = "open",
    sort = "new",
    page = "1",
    pageSize = "12",
    minTrade = "0",
    minTradePct = "0",
    maxCash = "",
  } = req.query;

  const p = Math.max(1, parseInt(page, 10));
  const ps = Math.min(60, Math.max(1, parseInt(pageSize, 10)));

  const where = [];
  const params = [];

  if (q.trim()) {
    where.push("(title LIKE ? OR description LIKE ?)");
    params.push(`%${q.trim()}%`, `%${q.trim()}%`);
  }
  if (category !== "all") {
    where.push("category = ?");
    params.push(category);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  where.push("trade >= ?");
  params.push(parseInt(minTrade, 10) || 0);

  where.push("trade_pct >= ?");
  params.push(parseInt(minTradePct, 10) || 0);

  if (maxCash !== "") {
    where.push("cash <= ?");
    params.push(parseInt(maxCash, 10) || 0);
  }

  const orderBy =
    sort === "price_desc"
      ? "(trade + cash) DESC"
      : sort === "price_asc"
        ? "(trade + cash) ASC"
        : sort === "trade_desc"
          ? "trade_pct DESC"
          : "datetime(created_at) DESC";

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const totalRow = await get(
    `SELECT COUNT(*) as c FROM listings ${whereSql}`,
    params,
  );
  const total = totalRow?.c || 0;

  const rows = await all(
    `SELECT * FROM listings ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, ps, (p - 1) * ps],
  );

  res.json({ items: rows, total, page: p, pageSize: ps });
});

// Public: single listing
router.get("/:id", async (req, res) => {
  const row = await get("SELECT * FROM listings WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

export default router;
