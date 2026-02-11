// js/login.js
import { adminLogin, watchAuth, isAllowedAdmin } from "./auth.js";

const $ = (q, el = document) => el.querySelector(q);

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-show");
  setTimeout(() => el.classList.remove("is-show"), 1800);
}

watchAuth((user) => {
  $("#status").textContent =
    user && isAllowedAdmin(user) ? `Нэвтэрсэн: ${user.email}` : "Нэвтрээгүй";
  if (user && isAllowedAdmin(user)) {
    // already logged in
    setTimeout(() => (window.location.href = "admin.html"), 350);
  }
});

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("#btnLogin");
  btn.disabled = true;
  btn.textContent = "Шалгаж байна...";

  try {
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    await adminLogin(email, password);
    toast("Амжилттай нэвтэрлээ ✅");
    window.location.href = "admin.html";
  } catch (err) {
    console.error(err);
    toast(err.message || "Нэвтрэлт амжилтгүй");
  } finally {
    btn.disabled = false;
    btn.textContent = "Нэвтрэх";
  }
});
