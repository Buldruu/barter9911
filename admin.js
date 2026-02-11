// js/admin.js
import { db } from "./web/firebase.js";
import {
  requireAdmin,
  watchAuth,
  isAllowedAdmin,
  adminLogout,
} from "./web/auth.js";
import { uploadToCloudinary, optimizeCloudinaryUrl } from "./web/cloudinary.js";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

requireAdmin();

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

const state = {
  items: [],
  lastDoc: null,
  loading: false,
  pageSize: 10,
  cat: "",
  q: "",
  editing: null,
};

watchAuth((user) => {
  $("#who").textContent =
    user && isAllowedAdmin(user) ? `Админ: ${user.email}` : "—";
});

$("#btnLogout").addEventListener("click", async () => {
  await adminLogout();
  window.location.href = "login.html";
});

function buildQuery({ reset = false }) {
  const base = collection(db, "listings");
  let qy;

  if (state.cat) {
    qy = query(
      base,
      where("category", "==", state.cat),
      orderBy("createdAt", "desc"),
      limit(state.pageSize),
    );
  } else {
    qy = query(base, orderBy("createdAt", "desc"), limit(state.pageSize));
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
  const btn = $("#btnMore");
  btn.disabled = true;
  btn.textContent = "Уншиж байна...";

  try {
    if (reset) {
      state.items = [];
      state.lastDoc = null;
      $("#tbody").innerHTML = "";
    }
    const qy = buildQuery({ reset });
    const snap = await getDocs(qy);

    if (snap.empty) {
      btn.disabled = true;
      btn.textContent = "Дууслаа";
      render();
      return;
    }

    state.lastDoc = snap.docs[snap.docs.length - 1];
    const newItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    state.items.push(...newItems);

    render();
    btn.disabled = false;
    btn.textContent = "Дараагийн хуудас";
  } catch (e) {
    console.error(e);
    toast("Алдаа гарлаа");
    btn.disabled = false;
    btn.textContent = "Дахин оролдох";
  } finally {
    state.loading = false;
  }
}

function applyClientSearch(items) {
  const q = state.q.trim().toLowerCase();
  if (!q) return items;
  return items.filter((x) =>
    `${x.title || ""} ${x.description || ""} ${x.category || ""}`
      .toLowerCase()
      .includes(q),
  );
}

function render() {
  const tbody = $("#tbody");
  const shown = applyClientSearch(state.items);

  $("#count").textContent = String(shown.length);

  tbody.innerHTML = shown
    .map((x) => {
      const img = x.images?.[0] ? optimizeCloudinaryUrl(x.images[0]) : "";
      return `
      <tr data-id="${x.id}">
        <td>${img ? `<img class="thumb" src="${img}" alt="">` : ""}</td>
        <td>
          <b>${escapeHtml(x.title || "")}</b>
          <div class="muted">${escapeHtml((x.description || "").slice(0, 90))}${(x.description || "").length > 90 ? "…" : ""}</div>
        </td>
        <td>${escapeHtml(x.category || "")}</td>
        <td>
          <div class="muted">Бартер</div><b>${fmtMNT(x.barterPrice)}</b>
          <div class="muted" style="margin-top:6px">Бэлэн</div><b>${fmtMNT(x.cashPrice)}</b>
        </td>
        <td>
          <b>${escapeHtml(x.phone || "")}</b>
        </td>
        <td>
          <div class="actions">
            <button class="btn btn--ghost" data-act="edit">Засах</button>
            <button class="btn btn--danger" data-act="del">Устгах</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  tbody.onclick = async (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    const act = e.target.closest("button")?.dataset.act;
    if (!act) return;

    const item = state.items.find((x) => x.id === id);
    if (!item) return;

    if (act === "edit") openEdit(item);
    if (act === "del") await doDelete(item);
  };
}

function openEdit(item) {
  state.editing = { ...item, images: [...(item.images || [])] };
  $("#eId").textContent = item.id;

  const main = state.editing.images?.[0]
    ? optimizeCloudinaryUrl(state.editing.images[0])
    : "";
  $("#eImg").src = main;

  const f = $("#editForm");
  f.title.value = item.title || "";
  f.description.value = item.description || "";
  f.category.value = item.category || "Бусад";
  f.phone.value = item.phone || "";
  f.barterPrice.value = Number(item.barterPrice || 0);
  f.cashPrice.value = Number(item.cashPrice || 0);
  f.featured.checked = !!item.featured;
  f.image.value = "";

  renderGallery();
  $("#editModal").classList.add("is-open");
  $("#editModal").setAttribute("aria-hidden", "false");
}


function closeEdit() {
  $("#editModal").classList.remove("is-open");
  $("#editModal").setAttribute("aria-hidden", "true");
  state.editing = null;
}

async function doDelete(item) {
  const ok = confirm(`Устгах уу?\n\n${item.title}`);
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "listings", item.id));
    toast("Устгалаа ✅");
    // local remove
    state.items = state.items.filter((x) => x.id !== item.id);
    render();
  } catch (e) {
    console.error(e);
    toast("Устгах үед алдаа гарлаа");
  }
}

$("#editModal").addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeEdit();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeEdit();
});

$("#editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const item = state.editing;
  if (!item) return;

  const btn = $("#btnSave");
  btn.disabled = true;
  btn.textContent = "Хадгалж байна...";

  try {
    const f = e.target;
    const append = document.getElementById("appendImgs")?.checked ?? true;

    let images = [...(item.images || [])];

    const newFiles = [...(f.image.files || [])].slice(0, 8);
    if (newFiles.length) {
      const newUrls = await Promise.all(
        newFiles.map((file) => uploadToCloudinary(file)),
      );
      images = append ? [...images, ...newUrls] : [...newUrls];
      // primary image = first
    }

    // limit хамгаалалт
    images = images.slice(0, 12); // хүсвэл 20 болго

    const patch = {
      title: f.title.value.trim(),
      description: f.description.value.trim(),
      category: f.category.value,
      phone: f.phone.value.trim(),
      barterPrice: Number(f.barterPrice.value || 0),
      cashPrice: Number(f.cashPrice.value || 0),
      featured: !!f.featured.checked,
      images,
    };

    await updateDoc(doc(db, "listings", item.id), patch);

    state.items = state.items.map((x) =>
      x.id === item.id ? { ...x, ...patch } : x,
    );
    render();
    toast("Хадгаллаа ✅");
    closeEdit();
  } catch (err) {
    console.error(err);
    toast(err.message || "Алдаа гарлаа");
  } finally {
    btn.disabled = false;
    btn.textContent = "Хадгалах";
  }
});

function renderGallery() {
  const box = document.getElementById("gallery");
  if (!box || !state.editing) return;

  const imgs = state.editing.images || [];
  if (!imgs.length) {
    box.innerHTML = `<div class="muted">Зураггүй</div>`;
    return;
  }

  box.innerHTML = imgs
    .map(
      (u, idx) => `
    <div style="position:relative">
      <img class="thumb" src="${optimizeCloudinaryUrl(u)}" style="width:92px;height:72px;border-radius:14px">
      <button type="button" data-rm="${idx}"
        class="btn btn--ghost"
        style="position:absolute;right:-6px;top:-6px;padding:6px 8px;border-radius:12px;font-weight:900">
        ✕
      </button>
      <button type="button" data-main="${idx}"
        class="btn btn--ghost"
        style="margin-top:6px;padding:6px 10px;border-radius:12px;font-size:12px">
        Гол болгох
      </button>
    </div>
  `,
    )
    .join("");

  box.onclick = (e) => {
    const rm = e.target.closest("[data-rm]")?.dataset.rm;
    const main = e.target.closest("[data-main]")?.dataset.main;

    if (rm !== undefined) {
      state.editing.images.splice(Number(rm), 1);
      const first = state.editing.images?.[0]
        ? optimizeCloudinaryUrl(state.editing.images[0])
        : "";
      document.getElementById("eImg").src = first;
      renderGallery();
    }

    if (main !== undefined) {
      const i = Number(main);
      const arr = state.editing.images;
      if (arr[i]) {
        const picked = arr.splice(i, 1)[0];
        arr.unshift(picked); // move to front as primary
        document.getElementById("eImg").src = optimizeCloudinaryUrl(arr[0]);
        renderGallery();
      }
    }
  };
}

$("#btnMore").addEventListener("click", () => fetchPage({ reset: false }));

$("#btnRefresh").addEventListener("click", () => {
  state.q = $("#q").value;
  state.cat = $("#cat").value;
  fetchPage({ reset: true });
});

$("#q").addEventListener("input", () => {
  state.q = $("#q").value;
  render();
});
$("#cat").addEventListener("change", () => {
  state.cat = $("#cat").value;
  fetchPage({ reset: true });
});

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

fetchPage({ reset: true });
