// js/add.js
import { db } from "./firebase.js";
import { uploadToCloudinary } from "./cloudinary.js";
import { requireAdmin, watchAuth, isAllowedAdmin } from "./auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

requireAdmin();

const $ = (q, el = document) => el.querySelector(q);

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-show");
  setTimeout(() => el.classList.remove("is-show"), 1800);
}
function safeNum(v) {
  return Number(v || 0);
}

watchAuth((user) => {
  $("#who").textContent =
    user && isAllowedAdmin(user) ? `Админ: ${user.email}` : "—";
});

const form = $("#form");
const preview = $("#preview");
const pText = $("#pText");
const fileInput = form.image;

fileInput.addEventListener("change", () => {
  const f = fileInput.files?.[0];
  if (!f) {
    preview.removeAttribute("src");
    pText.textContent = "Зураг сонгоогүй байна.";
    return;
  }
  preview.src = URL.createObjectURL(f);
  pText.textContent = `${f.name} — ${(f.size / 1024 / 1024).toFixed(2)}MB`;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#btnSubmit");
  btn.disabled = true;
  btn.textContent = "Upload хийж байна...";

  try {
    const file = fileInput.files?.[0];
    if (!file) throw new Error("Зураг сонгоогүй.");

    const imageUrl = await uploadToCloudinary(file);

    const payload = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      category: form.category.value,
      phone: form.phone.value.trim(),
      barterPrice: safeNum(form.barterPrice.value),
      cashPrice: safeNum(form.cashPrice.value),
      images: [imageUrl],
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "listings"), payload);
    toast("Амжилттай нэмлээ ✅");
    form.reset();
    preview.removeAttribute("src");
    pText.textContent = "Зураг сонгоогүй байна.";
  } catch (err) {
    console.error(err);
    toast(err.message || "Алдаа гарлаа");
  } finally {
    btn.disabled = false;
    btn.textContent = "Нэмэх";
  }
});
