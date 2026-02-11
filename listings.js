// js/listings.js
import { db } from "./firebase.js";
import { optimizeCloudinaryUrl } from "./cloudinary.js";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

const state = {
  docs: [],
  items: [],
  lastDoc: null,
  loading: false,
  pageSize: 9,

  q: "",
  cat: "",
  sort: "new",
};

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  setTimeout(() => el.classList.remove("is-show"), 1800);
}

function fmtMNT(n) {
  const v = Number(n || 0);
  return new Intl.NumberFormat("mn-MN").format(v) + " ₮";
}
function fmtDate(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date(ts || Date.now());
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

function buildQuery({ reset = false }) {
  const base = collection(db, "listings");

  // Firestore дээр sort: new бол createdAt desc
  // бусад sort-уудыг client-side (loaded items дээр) хийнэ
  let qy = query(base, orderBy("createdAt", "desc"), limit(state.pageSize));

  if (state.cat) {
    // category filter = Firestore where
    qy = query(
      base,
      where("category", "==", state.cat),
      orderBy("createdAt", "desc"),
      limit(state.pageSize),
    );
  }

  if (!reset && state.lastDoc) {
    if (state.cat)
      qy = query(
        base,
        where("category", "==", state.cat),
        orderBy("createdAt", "desc"),
        startAfter(state.lastDoc),
        limit(state.pageSize),
      );
    else
      qy = query(
        base,
        orderBy("createdAt", "desc"),
        startAfter(state.lastDoc),
        limit(state.pageSize),
      );
  }
  return qy;
}

async function fetchPage({ reset = false } = {}) {
  if (state.loading) return;
  state.loading = true;

  const btnMore = $("#btnMore");
  btnMore &&
    ((btnMore.disabled = true), (btnMore.textContent = "Уншиж байна..."));

  try {
    if (reset) {
      state.docs = [];
      state.items = [];
      state.lastDoc = null;
      $("#grid").innerHTML = "";
    }

    const qy = buildQuery({ reset });
    const snap = await getDocs(qy);

    if (snap.empty) {
      btnMore && ((btnMore.disabled = true), (btnMore.textContent = "Дууслаа"));
      render(); // update count
      return;
    }

    snap.docs.forEach((d) => state.docs.push(d));
    state.lastDoc = snap.docs[snap.docs.length - 1];

    const newItems = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    state.items.push(...newItems);

    render();

    btnMore &&
      ((btnMore.disabled = false), (btnMore.textContent = "Дараагийн хуудас"));
  } catch (e) {
    console.error(e);
    toast("Алдаа гарлаа. Console шалга.");
    btnMore &&
      ((btnMore.disabled = false), (btnMore.textContent = "Дахин оролдох"));
  } finally {
    state.loading = false;
  }
}

function applyClientFilters(items) {
  let out = [...items];
  const q = state.q.trim().toLowerCase();

  if (q) {
    out = out.filter((x) => {
      const blob =
        `${x.title || ""} ${x.description || ""} ${x.category || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  // client-side sort
  if (state.sort === "barterHigh")
    out.sort((a, b) => (b.barterPrice || 0) - (a.barterPrice || 0));
  if (state.sort === "barterLow")
    out.sort((a, b) => (a.barterPrice || 0) - (b.barterPrice || 0));
  if (state.sort === "cashHigh")
    out.sort((a, b) => (b.cashPrice || 0) - (a.cashPrice || 0));
  if (state.sort === "cashLow")
    out.sort((a, b) => (a.cashPrice || 0) - (b.cashPrice || 0));
  // new default already sorted by createdAt desc

  return out;
}

function render() {
  const grid = $("#grid");
  const filtered = applyClientFilters(state.items);

  $("#countBadge").textContent = `${filtered.length} үр дүн`;

  grid.innerHTML = filtered
    .map((x) => {
      const img = x.images?.[0] ? optimizeCloudinaryUrl(x.images[0]) : "";
      return `
      <article class="card" data-id="${x.id}">
        <div class="card__img">
          ${img ? `<img loading="lazy" src="${img}" alt="${esc(x.title)}">` : ``}
        </div>
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
    const card = e.target.closest(".card");
    if (!card) return;
    const item = state.items.find((x) => x.id === card.dataset.id);
    if (!item) return;
    openModal(item);
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

function bind() {
  $("#btnMore").addEventListener("click", () => fetchPage({ reset: false }));
  $("#btnApply").addEventListener("click", () => {
    state.q = $("#q").value;
    state.cat = $("#cat").value;
    state.sort = $("#sort").value;
    fetchPage({ reset: true });
  });
  $("#btnReset").addEventListener("click", () => {
    $("#q").value = "";
    $("#cat").value = "";
    $("#sort").value = "new";
    state.q = "";
    state.cat = "";
    state.sort = "new";
    fetchPage({ reset: true });
  });

  $("#modal").addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

bind();
fetchPage({ reset: true });
