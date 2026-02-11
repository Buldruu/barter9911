import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { all, get, run } from "../db.js";
import { auth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const safe =
      Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, safe);
  },
});
const upload = multer({ storage });

// Admin: list all listings (any status)
router.get("/listings", auth, requireAdmin, async (req, res) => {
  const rows = await all(
    "SELECT * FROM listings ORDER BY datetime(created_at) DESC",
  );
  res.json(rows);
});

// Admin: create listing
router.post(
  "/listings",
  auth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const { title, category, trade, cash, trade_pct, description, status } =
      req.body || {};
    if (!title || !category)
      return res.status(400).json({ error: "title/category required" });

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const r = await run(
      `INSERT INTO listings (title, category, trade, cash, trade_pct, description, image_url, status)
     VALUES (?,?,?,?,?,?,?,?)`,
      [
        title,
        category,
        parseInt(trade || 0, 10),
        parseInt(cash || 0, 10),
        parseInt(trade_pct || 0, 10),
        description || "",
        image_url,
        status || "open",
      ],
    );

    const created = await get("SELECT * FROM listings WHERE id = ?", [r.id]);

    // realtime broadcast
    req.io.emit("listing:created", created);

    res.json(created);
  },
);

// Admin: update listing
router.put(
  "/listings/:id",
  auth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const id = req.params.id;
    const existing = await get("SELECT * FROM listings WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const next = {
      title: req.body.title ?? existing.title,
      category: req.body.category ?? existing.category,
      trade:
        req.body.trade !== undefined
          ? parseInt(req.body.trade, 10)
          : existing.trade,
      cash:
        req.body.cash !== undefined
          ? parseInt(req.body.cash, 10)
          : existing.cash,
      trade_pct:
        req.body.trade_pct !== undefined
          ? parseInt(req.body.trade_pct, 10)
          : existing.trade_pct,
      description: req.body.description ?? existing.description,
      status: req.body.status ?? existing.status,
      image_url: req.file
        ? `/uploads/${req.file.filename}`
        : existing.image_url,
    };

    await run(
      `UPDATE listings SET title=?, category=?, trade=?, cash=?, trade_pct=?, description=?, status=?, image_url=?
     WHERE id=?`,
      [
        next.title,
        next.category,
        next.trade,
        next.cash,
        next.trade_pct,
        next.description,
        next.status,
        next.image_url,
        id,
      ],
    );

    const updated = await get("SELECT * FROM listings WHERE id = ?", [id]);
    req.io.emit("listing:updated", updated);
    res.json(updated);
  },
);

// Admin: delete listing
router.delete("/listings/:id", auth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const existing = await get("SELECT * FROM listings WHERE id = ?", [id]);
  if (!existing) return res.status(404).json({ error: "Not found" });

  await run("DELETE FROM listings WHERE id = ?", [id]);
  req.io.emit("listing:deleted", { id: Number(id) });
  res.json({ ok: true });
});

export default router;
