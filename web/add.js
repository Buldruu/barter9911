// js/add.js (multi-image)
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
  const files = [...(fileInput.files || [])];
  if (!files.length) {
    preview.removeAttribute("src");
    pText.textContent = "Зураг сонгоогүй байна.";
    return;
  }
  preview.src = URL.createObjectURL(files[0]);
  pText.textContent = `${files.length} зураг сонгосон`;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#btnSubmit");
  btn.disabled = true;
  btn.textContent = "Upload хийж байна...";

  try {
    const files = [...(fileInput.files || [])].slice(0, 8);
    if (!files.length) throw new Error("Зураг сонгоогүй.");

    // parallel upload
    const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));

    const payload = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      category: form.category.value,
      phone: form.phone.value.trim(),
      barterPrice: safeNum(form.barterPrice.value),
      cashPrice: safeNum(form.cashPrice.value),
      images: urls, // ✅ gallery
      featured: false, // ✅ default (admin дээр асаана)
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
