// js/home.js
import { db } from "./firebase.js";
import { optimizeCloudinaryUrl } from "./cloudinary.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (q, el = document) => el.querySelector(q);

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-show");
  setTimeout(() => el.classList.remove("is-show"), 1800);
}
function fmtMNT(n) {
  return new Intl.NumberFormat("mn-MN").format(Number(n || 0)) + " ₮";
}
function fmtDate(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date();
  return d.toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let latestItems = [];

function renderFeatured(items) {
  const box = $("#featured");
  if (!items.length) {
    box.innerHTML = `<div class="muted">Онцлох зар алга байна.</div>`;
    return;
  }
  box.innerHTML = items
    .map((x) => {
      const img = x.images?.[0] ? optimizeCloudinaryUrl(x.images[0]) : "";
      return `
      <div class="panel" style="margin:10px 0; border-radius:18px; overflow:hidden; cursor:pointer" data-id="${x.id}">
        <div style="height:140px; background:rgba(0,0,0,.18)">
          ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;display:block" alt="">` : ""}
        </div>
        <div style="padding:12px">
          <div class="row" style="justify-content:space-between">
            <span class="tag">${esc(x.category || "Бусад")}</span>
            <span class="muted" style="font-size:12px">${fmtDate(x.createdAt)}</span>
          </div>
          <b style="display:block;margin-top:8px">${esc(x.title || "")}</b>
          <div class="muted" style="margin-top:6px;font-size:12px">
            Бартер: <b>${fmtMNT(x.barterPrice)}</b> · Бэлэн: <b>${fmtMNT(x.cashPrice)}</b>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  box.onclick = (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    const item = items.find((x) => x.id === card.dataset.id);
    if (item) openModal(item);
  };
}

function renderGrid(items) {
  latestItems = items;
  $("#statTotal").textContent = `${items.length} зар`;
  const grid = $("#grid");

  grid.innerHTML = items
    .map((x) => {
      const img = x.images?.[0] ? optimizeCloudinaryUrl(x.images[0]) : "";
      return `
      <article class="card" data-id="${x.id}">
        <div class="card__img">${img ? `<img loading="lazy" src="${img}" alt="${esc(x.title)}">` : ""}</div>
        <div class="card__body">
          <div class="card__top">
            <span class="tag">${esc(x.category || "Бусад")}</span>
            <span class="muted">${fmtDate(x.createdAt)}</span>
          </div>
          <h3 class="card__title">${esc(x.title || "")}</h3>
          <p class="card__desc">${esc(x.description || "")}</p>
          <div class="card__prices">
            <div class="miniPrice"><span>Бартер</span><b>${fmtMNT(x.barterPrice)}</b></div>
            <div class="miniPrice"><span>Бэлэн</span><b>${fmtMNT(x.cashPrice)}</b></div>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  grid.onclick = (e) => {
    const c = e.target.closest(".card");
    if (!c) return;
    const item = items.find((x) => x.id === c.dataset.id);
    if (item) openModal(item);
  };
}

function openModal(item) {
  const img = item.images?.[0] ? optimizeCloudinaryUrl(item.images[0]) : "";
  $("#mImg").src = img;
  $("#mTitle").textContent = item.title || "";
  $("#mDesc").textContent = item.description || "";
  $("#mCat").textContent = item.category || "Бусад";
  $("#mDate").textContent = fmtDate(item.createdAt);
  $("#mBarter").textContent = fmtMNT(item.barterPrice);
  $("#mCash").textContent = fmtMNT(item.cashPrice);

  const phone = (item.phone || "").trim();
  const call = $("#mCall");
  call.href = phone ? `tel:${phone}` : "#";
  call.textContent = phone
    ? `Холбоо барих: ${phone}`
    : "Холбоо барих мэдээлэлгүй";

  $("#modal").classList.add("is-open");
  $("#modal").setAttribute("aria-hidden", "false");
}
function closeModal() {
  $("#modal").classList.remove("is-open");
  $("#modal").setAttribute("aria-hidden", "true");
}

$("#modal").addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// 🔥 LIVE listeners
try {
  const col = collection(db, "listings");

  // Featured (up to 3)
  onSnapshot(
    query(
      col,
      where("featured", "==", true),
      orderBy("createdAt", "desc"),
      limit(3),
    ),
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderFeatured(items);
    },
  );

  // Latest (up to 9)
  onSnapshot(query(col, orderBy("createdAt", "desc"), limit(9)), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderGrid(items);
  });
} catch (e) {
  console.error(e);
  toast("Firestore холболт шалгаарай.");
}
