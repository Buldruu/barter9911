import { useState } from "react";
import {
  CATEGORIES,
  SAMPLE_USERS,
  SAMPLE_LISTINGS,
  parsePrice,
} from "./data/constants";
import ImageUploader from "./components/ImageUploader";
import ListingCard from "./components/ListingCard";
import DetailPage from "./components/DetailPage";

export default function App() {
  const [listings, setListings] = useState(SAMPLE_LISTINGS);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("home");
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showFeatured, setShowFeatured] = useState(null);
  const [toast, setToast] = useState(null);
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [form, setForm] = useState({
    title: "",
    category: "bair",
    description: "",
    wantedItem: "",
    price: "",
    phone: "",
    email: "",
  });
  const [imgs, setImgs] = useState([]);
  const [nextId, setNextId] = useState(10);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const login = () => {
    const u = SAMPLE_USERS.find(
      (u) => u.email === authForm.email && u.password === authForm.password,
    );
    if (u) {
      setCurrentUser(u);
      setShowAuth(false);
      setAuthForm({ email: "", password: "", name: "", phone: "" });
      toast$(`Тавтай морил, ${u.name}!`);
    } else toast$("Имэйл эсвэл нууц үг буруу!", "error");
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      title: "",
      category: "bair",
      description: "",
      wantedItem: "",
      price: "",
      phone: currentUser.phone,
      email: currentUser.email,
    });
    setImgs([]);
    setShowModal(true);
  };

  const create = () => {
    if (!form.title.trim()) {
      toast$("Гарчиг оруулна уу!", "error");
      return;
    }
    if (!form.description.trim()) {
      toast$("Тайлбар оруулна уу!", "error");
      return;
    }
    if (imgs.length === 0) {
      toast$("Дор хаяж 1 зураг оруулна уу!", "error");
      return;
    }
    setListings((p) => [
      {
        id: nextId,
        userId: currentUser.id,
        ...form,
        images: imgs,
        featured: false,
        createdAt: Date.now(),
        views: 0,
      },
      ...p,
    ]);
    setNextId((n) => n + 1);
    setShowModal(false);
    toast$("Зар амжилттай нийтлэгдлээ!");
  };

  const update = () => {
    if (!form.title.trim()) {
      toast$("Гарчиг оруулна уу!", "error");
      return;
    }
    if (imgs.length === 0) {
      toast$("Дор хаяж 1 зураг оруулна уу!", "error");
      return;
    }
    setListings((p) =>
      p.map((l) => (l.id === editing.id ? { ...l, ...form, images: imgs } : l)),
    );
    if (selected?.id === editing.id)
      setSelected((s) => ({ ...s, ...form, images: imgs }));
    setEditing(null);
    setShowModal(false);
    toast$("Зар шинэчлэгдлээ!");
  };

  const del = (id) => {
    setListings((p) => p.filter((l) => l.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setPage("home");
    }
    toast$("Зар устгагдлаа!");
  };

  const feature = (l) => {
    const u = {
      ...l,
      featured: true,
      featuredUntil: Date.now() + 7 * 86400000,
    };
    setListings((p) => p.map((x) => (x.id === l.id ? u : x)));
    if (selected?.id === l.id) setSelected((s) => ({ ...s, ...u }));
    setShowFeatured(null);
    toast$("Онцлох зар идэвхжлээ!");
  };

  const openEdit = (l) => {
    setForm({
      title: l.title,
      category: l.category,
      description: l.description,
      wantedItem: l.wantedItem,
      price: l.price,
      phone: l.phone,
      email: l.email,
    });
    setImgs(l.images || []);
    setEditing(l);
    setShowModal(true);
  };
  const openL = (l) => {
    setListings((p) =>
      p.map((x) => (x.id === l.id ? { ...x, views: x.views + 1 } : x)),
    );
    setSelected({ ...l, views: l.views + 1 });
    setPage("detail");
  };

  const featured$ = listings.filter(
    (l) => l.featured && l.featuredUntil > Date.now(),
  );
  const regular$ = listings.filter(
    (l) => !l.featured || l.featuredUntil <= Date.now(),
  );
  const sort$ = (arr) => {
    if (sortOrder === "price_asc")
      return [...arr].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortOrder === "price_desc")
      return [...arr].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return [...arr].sort((a, b) => b.createdAt - a.createdAt);
  };
  const filtered$ = sort$(
    (filterCat === "all"
      ? regular$
      : regular$.filter((l) => l.category === filterCat)
    ).filter(
      (l) =>
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const myL = currentUser
    ? listings.filter((l) => l.userId === currentUser.id)
    : [];

  return (
    <div
      style={{
        fontFamily: "'Noto Sans','Segoe UI',sans-serif",
        minHeight: "100vh",
        background: "#0A0E1A",
        color: "#E8EAF0",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#0D1220",
          borderBottom: "1px solid #1E2A42",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Desktop + Mobile top bar */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 60,
          }}
        >
          {/* Logo */}
          <div
            onClick={() => {
              setPage("home");
              setFilterCat("all");
              setSearch("");
              setMenuOpen(false);
            }}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg,#FF6B35,#FF8C42)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              ♻️
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 19,
                background: "linear-gradient(135deg,#FF6B35,#FFB347)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              barter9911
            </span>
          </div>

          {/* Search — desktop дээр харагдана */}
          <div
            style={{
              flex: 1,
              maxWidth: 400,
              display: "var(--search-display, flex)",
            }}
            className="search-desktop"
          >
            <input
              className="inp"
              placeholder="🔍  Зар хайх..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage("home");
              }}
              style={{ padding: "9px 14px", fontSize: 13 }}
            />
          </div>

          {/* Desktop nav + buttons */}
          <nav
            style={{
              display: "var(--nav-display, flex)",
              gap: 4,
              marginLeft: "auto",
            }}
            className="nav-desktop"
          >
            <span
              className={`nl ${page === "home" ? "act" : ""}`}
              onClick={() => {
                setPage("home");
                setFilterCat("all");
              }}
            >
              Нүүр
            </span>
            {currentUser && (
              <span
                className={`nl ${page === "mylistings" ? "act" : ""}`}
                onClick={() => setPage("mylistings")}
              >
                Миний зар
              </span>
            )}
          </nav>
          <div
            style={{ display: "var(--auth-display, flex)", gap: 8 }}
            className="auth-desktop"
          >
            {currentUser ? (
              <>
                <button
                  className="btn-p"
                  style={{ padding: "8px 14px", fontSize: 13 }}
                  onClick={openNew}
                >
                  + Зар нэмэх
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#131929",
                    border: "1px solid #1E2A42",
                    borderRadius: 10,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCurrentUser(null);
                    setPage("home");
                    toast$("Гарлаа!");
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: "linear-gradient(135deg,#FF6B35,#FF8C42)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {currentUser.name[0]}
                  </div>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#B0BAC8" }}
                  >
                    Гарах
                  </span>
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn-s"
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                  }}
                >
                  Нэвтрэх
                </button>
                <button
                  className="btn-p"
                  onClick={() => {
                    setAuthMode("register");
                    setShowAuth(true);
                  }}
                >
                  Бүртгүүлэх
                </button>
              </>
            )}
          </div>

          {/* Hamburger — mobile дээр харагдана */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: "none",
              flexDirection: "column",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: menuOpen ? "#FF6B35" : "#E8EAF0",
                borderRadius: 2,
                transition: "all .25s",
                transform: menuOpen
                  ? "rotate(45deg) translate(5px,5px)"
                  : "none",
              }}
            ></span>
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: menuOpen ? "transparent" : "#E8EAF0",
                borderRadius: 2,
                transition: "all .25s",
              }}
            ></span>
            <span
              style={{
                display: "block",
                width: 22,
                height: 2,
                background: menuOpen ? "#FF6B35" : "#E8EAF0",
                borderRadius: 2,
                transition: "all .25s",
                transform: menuOpen
                  ? "rotate(-45deg) translate(5px,-5px)"
                  : "none",
              }}
            ></span>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            style={{
              background: "#0D1220",
              borderTop: "1px solid #1E2A42",
              padding: "12px 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <input
              className="inp"
              placeholder="🔍  Зар хайх..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage("home");
              }}
              style={{ padding: "10px 14px", fontSize: 14 }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingTop: 4,
              }}
            >
              <span
                className={`nl ${page === "home" ? "act" : ""}`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #1E2A42",
                }}
                onClick={() => {
                  setPage("home");
                  setFilterCat("all");
                  setMenuOpen(false);
                }}
              >
                🏠 Нүүр
              </span>
              {currentUser && (
                <span
                  className={`nl ${page === "mylistings" ? "act" : ""}`}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #1E2A42",
                  }}
                  onClick={() => {
                    setPage("mylistings");
                    setMenuOpen(false);
                  }}
                >
                  📋 Миний зар
                </span>
              )}
            </div>
            {currentUser ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="btn-p"
                  style={{ padding: "12px 0", fontSize: 14, width: "100%" }}
                  onClick={() => {
                    openNew();
                    setMenuOpen(false);
                  }}
                >
                  + Зар нэмэх
                </button>
                <button
                  className="btn-s"
                  style={{ padding: "11px 0", fontSize: 14, width: "100%" }}
                  onClick={() => {
                    setCurrentUser(null);
                    setPage("home");
                    setMenuOpen(false);
                    toast$("Гарлаа!");
                  }}
                >
                  {currentUser.name[0]} · Гарах
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-s"
                  style={{ flex: 1, padding: "12px 0" }}
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                    setMenuOpen(false);
                  }}
                >
                  Нэвтрэх
                </button>
                <button
                  className="btn-p"
                  style={{ flex: 1, padding: "12px 0" }}
                  onClick={() => {
                    setAuthMode("register");
                    setShowAuth(true);
                    setMenuOpen(false);
                  }}
                >
                  Бүртгүүлэх
                </button>
              </div>
            )}
          </div>
        )}

        <style>{`
          @media (max-width: 640px) {
            .search-desktop { display: none !important; }
            .nav-desktop { display: none !important; }
            .auth-desktop { display: none !important; }
            .hamburger { display: flex !important; }
          }
        `}</style>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {page === "home" && (
          <>
            {!search && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 40,
                  padding: "40px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FF6B35",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Монголын #1 Бартер Платформ
                </div>
                <h1
                  style={{
                    fontSize: 46,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    marginBottom: 16,
                  }}
                >
                  Холио солио
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg,#FF6B35,#FFB347)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    хийе
                  </span>
                </h1>
                <p
                  style={{
                    color: "#8892A4",
                    fontSize: 16,
                    maxWidth: 480,
                    margin: "0 auto 28px",
                  }}
                >
                  Байр, машин, хашаа байшин болон бусад эд зүйлсээ мөнгөгүйгээр
                  солилцоорой
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setFilterCat(c.id)}
                      style={{
                        background: "#131929",
                        border: `1.5px solid ${filterCat === c.id ? c.color : "#1E2A42"}`,
                        borderRadius: 14,
                        padding: "16px 24px",
                        cursor: "pointer",
                        transition: "all .2s",
                        minWidth: 110,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>
                        {c.icon}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: filterCat === c.id ? c.color : "#8892A4",
                        }}
                      >
                        {c.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                className={`cb ${filterCat === "all" ? "act" : ""}`}
                onClick={() => setFilterCat("all")}
              >
                🔥 Бүгд
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`cb ${filterCat === c.id ? "act" : ""}`}
                  onClick={() => setFilterCat(c.id)}
                >
                  {c.icon} {c.label}
                </button>
              ))}
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{ fontSize: 12, color: "#8892A4", fontWeight: 600 }}
                >
                  Эрэмбэлэх:
                </span>
                <select
                  className="sort-sel"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">🕐 Шинэ эхэлсэн</option>
                  <option value="price_asc">💰 Хямдаас үнэтэй рүү</option>
                  <option value="price_desc">💎 Үнэтээс хямд руу</option>
                </select>
              </div>
            </div>

            {featured$.length > 0 && filterCat === "all" && !search && (
              <section style={{ marginBottom: 36 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 20 }}>⭐</span>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                    Онцлох зарууд
                  </h2>
                  <span
                    className="badge"
                    style={{
                      background: "#2A1A00",
                      color: "#FFB347",
                      border: "1px solid rgba(255,179,71,.3)",
                    }}
                  >
                    ДЭЭР
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                    gap: 16,
                  }}
                >
                  {featured$.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      featured
                      currentUser={currentUser}
                      onOpen={openL}
                      onEdit={openEdit}
                      onDelete={del}
                      onFeature={() => setShowFeatured(l)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>
                  {search
                    ? `"${search}" хайлтын үр дүн`
                    : filterCat === "all"
                      ? "Сүүлийн зарууд"
                      : CATEGORIES.find((c) => c.id === filterCat)?.label}
                </h2>
                <span
                  style={{ fontSize: 13, color: "#8892A4", fontWeight: 600 }}
                >
                  {filtered$.length} зар
                </span>
              </div>
              {filtered$.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#8892A4",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    Зар олдсонгүй
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                    gap: 16,
                  }}
                >
                  {filtered$.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      currentUser={currentUser}
                      onOpen={openL}
                      onEdit={openEdit}
                      onDelete={del}
                      onFeature={() => setShowFeatured(l)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {page === "detail" && selected && (
          <DetailPage
            listing={selected}
            currentUser={currentUser}
            onBack={() => setPage("home")}
            onEdit={openEdit}
            onDelete={del}
            onFeature={() => setShowFeatured(selected)}
          />
        )}

        {page === "mylistings" && currentUser && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>
                Миний зарууд ({myL.length})
              </h2>
              <button className="btn-p" onClick={openNew}>
                + Зар нэмэх
              </button>
            </div>
            {myL.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#8892A4",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <div
                  style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}
                >
                  Одоогоор зар байхгүй байна
                </div>
                <button className="btn-p" onClick={openNew}>
                  Зар нэмэх
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                  gap: 16,
                }}
              >
                {myL.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    featured={l.featured && l.featuredUntil > Date.now()}
                    currentUser={currentUser}
                    onOpen={openL}
                    onEdit={openEdit}
                    onDelete={del}
                    onFeature={() => setShowFeatured(l)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="ov" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                background: "#0D1220",
                borderRadius: 10,
                padding: 4,
                marginBottom: 24,
              }}
            >
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => setAuthMode(m)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    background:
                      authMode === m
                        ? "linear-gradient(135deg,#FF6B35,#FF8C42)"
                        : "transparent",
                    color: authMode === m ? "white" : "#8892A4",
                    fontFamily: "inherit",
                  }}
                >
                  {m === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {authMode === "register" && (
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#8892A4",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    НЭР
                  </label>
                  <input
                    className="inp"
                    placeholder="Таны нэр"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
              )}
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  ИМЭЙЛ
                </label>
                <input
                  className="inp"
                  type="email"
                  placeholder="email@gmail.com"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  НУУЦ ҮГ
                </label>
                <input
                  className="inp"
                  type="password"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              {authMode === "register" && (
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#8892A4",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    УТАС
                  </label>
                  <input
                    className="inp"
                    placeholder="9911 XXXX"
                    value={authForm.phone}
                    onChange={(e) =>
                      setAuthForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
              )}
              <button
                className="btn-p"
                style={{ marginTop: 4, padding: "13px 0", width: "100%" }}
                onClick={
                  authMode === "login"
                    ? login
                    : () => {
                        toast$("Бүртгэл амжилттай!");
                        setShowAuth(false);
                      }
                }
              >
                {authMode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LISTING MODAL */}
      {showModal && (
        <div className="ov" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
              {editing ? "Зар засварлах" : "Шинэ зар нэмэх"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ImageUploader images={imgs} onChange={setImgs} />
              <div className="divider" style={{ margin: "2px 0" }} />
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  АНГИЛАЛ
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                      style={{
                        border: `1.5px solid ${form.category === c.id ? c.color : "#1E2A42"}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background:
                          form.category === c.id
                            ? "rgba(255,107,53,.06)"
                            : "#0D1220",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{c.icon}</span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: form.category === c.id ? c.color : "#8892A4",
                        }}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  ГАРЧИГ *
                </label>
                <input
                  className="inp"
                  placeholder="Зарын гарчиг"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  ТАЙЛБАР *
                </label>
                <textarea
                  className="inp"
                  placeholder="Дэлгэрэнгүй тайлбар..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  ХҮСЭЛ
                </label>
                <input
                  className="inp"
                  placeholder="Юутай солилцохыг хүсэж байна?"
                  value={form.wantedItem}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, wantedItem: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#8892A4",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    ҮНЭ
                  </label>
                  <input
                    className="inp"
                    placeholder="0₮"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#8892A4",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    УТАС
                  </label>
                  <input
                    className="inp"
                    placeholder="9911 XXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "#8892A4",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  ИМЭЙЛ
                </label>
                <input
                  className="inp"
                  type="email"
                  placeholder="email@gmail.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  className="btn-s"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Болих
                </button>
                <button
                  className="btn-p"
                  style={{ flex: 2 }}
                  onClick={editing ? update : create}
                >
                  {editing ? "Шинэчлэх" : "Зар нийтлэх"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURED MODAL */}
      {showFeatured && (
        <div className="ov" onClick={() => setShowFeatured(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400, textAlign: "center" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Онцлох зар болгох
            </h3>
            <p
              style={{
                color: "#8892A4",
                fontSize: 14,
                marginBottom: 24,
                lineHeight: 1.7,
              }}
            >
              Таны зар <b style={{ color: "#FFB347" }}>7 хоногийн</b> турш бүх
              зарын дээр харагдах болно.
            </p>
            <div
              style={{
                background: "linear-gradient(135deg,#1A1200,#1F1500)",
                border: "1.5px solid #FFB347",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 13, color: "#8892A4", marginBottom: 6 }}>
                НЭГ УДААГИЙН ТӨЛБӨР
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#FF6B35,#FFB347)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                5,000₮
              </div>
              <div style={{ fontSize: 12, color: "#8892A4", marginTop: 4 }}>
                7 хоног • Бүх зарын дээр
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-s"
                style={{ flex: 1 }}
                onClick={() => setShowFeatured(null)}
              >
                Болих
              </button>
              <button
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg,#FF8C00,#FFB347)",
                  color: "white",
                  border: "none",
                  padding: "12px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
                onClick={() => feature(showFeatured)}
              >
                Идэвхжүүлэх
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="toast"
          style={{
            background: toast.type === "error" ? "#2A0A0A" : "#0A2A0D",
            border: `1px solid ${toast.type === "error" ? "#FF4444" : "#44FF77"}`,
            color: toast.type === "error" ? "#FF6666" : "#66FF88",
          }}
        >
          {toast.type === "error" ? "❌ " : "✅ "}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
