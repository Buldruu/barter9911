const $ = (s) => document.querySelector(s);

$("#year").textContent = new Date().getFullYear();

const products = [
  {
    id: "p1",
    title: "Бараа 1 (жишээ)",
    price: 1500000,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "p2",
    title: "Бараа 2 (жишээ)",
    price: 2500000,
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "p3",
    title: "Бараа 3 (жишээ)",
    price: 600000,
    createdAt: Date.now() - 1000 * 60 * 60 * 60,
  },
];

function formatMoney(mnt) {
  return String(mnt).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₮";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Fill product select
const productSelect = $("#productSelect");
productSelect.innerHTML = products
  .map(
    (p) =>
      `<option value="${p.id}">${escapeHtml(p.title)} — ${formatMoney(p.price)}</option>`,
  )
  .join("");

// Render products
const elProducts = $("#products");
const elEmpty = $("#emptyProducts");
const elQ = $("#q");
const elSort = $("#sort");

function renderProducts(list) {
  elProducts.innerHTML = "";
  if (!list.length) {
    elEmpty.classList.remove("hidden");
    return;
  }
  elEmpty.classList.add("hidden");

  for (const p of list) {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <div class="product__top">
        <div class="product__title">${escapeHtml(p.title)}</div>
        <div class="badge">Бартер/Санал авч үзнэ</div>
      </div>
      <div class="price">Үнэ: ${formatMoney(p.price)}</div>
      <div class="actions">
        <button class="btn btn--ghost" data-buy="${p.id}">Худалдаж авах</button>
        <button class="btn" data-offer="${p.id}">Санал илгээх</button>
      </div>
    `;
    elProducts.appendChild(div);
  }

  elProducts.querySelectorAll("button[data-offer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.offer;
      $("#offer").scrollIntoView({ behavior: "smooth" });
      productSelect.value = id;
    });
  });

  elProducts.querySelectorAll("button[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#offer").scrollIntoView({ behavior: "smooth" });
      document.querySelector('[name="barterType"]').value = "cash";
    });
  });
}

function applyProducts() {
  const q = (elQ.value || "").trim().toLowerCase();
  let list = products.filter((p) => p.title.toLowerCase().includes(q));

  const s = elSort.value;
  list.sort((a, b) => {
    if (s === "new") return b.createdAt - a.createdAt;
    if (s === "price_desc") return b.price - a.price;
    if (s === "price_asc") return a.price - b.price;
    return 0;
  });

  renderProducts(list);
}

elQ.addEventListener("input", applyProducts);
elSort.addEventListener("change", applyProducts);
applyProducts();

// Scroll buttons
$("#openOffer").addEventListener("click", () =>
  $("#offer").scrollIntoView({ behavior: "smooth" }),
);
$("#openOffer2").addEventListener("click", () =>
  $("#offer").scrollIntoView({ behavior: "smooth" }),
);

// Preview + reset
const form = $("#offerForm");
const sendBtn = $("#sendBtn");
const statusEl = $("#formStatus");
const preview = $("#imgPreview");
const fileInput = $("#offerImage");

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) {
    preview.textContent = "Зураг сонгоогүй";
    return;
  }
  if (!file.type.startsWith("image/")) {
    preview.textContent = "Зөвхөн зураг файл сонгоно уу.";
    fileInput.value = "";
    return;
  }
  // optional size cap (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Зураг хэт том байна (5MB-с их). Жижиг зураг сонгоно уу.");
    fileInput.value = "";
    preview.textContent = "Зураг сонгоогүй";
    return;
  }

  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img src="${url}" alt="preview">`;
});

$("#resetForm").addEventListener("click", () => {
  form.reset();
  preview.textContent = "Зураг сонгоогүй";
  statusEl.textContent = "";
});

// ✅ Netlify AJAX submit (refreshгүй)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  sendBtn.disabled = true;
  sendBtn.textContent = "Илгээж байна...";

  try {
    const formData = new FormData(form);

    const res = await fetch("/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error(`Submit failed: ${res.status}`);

    statusEl.textContent = "Амжилттай илгээлээ. Баярлалаа!";
    form.reset();
    preview.textContent = "Зураг сонгоогүй";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Алдаа гарлаа. Дахин оролдоно уу.";
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Илгээх";
  }
});
