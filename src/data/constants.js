export const CATEGORIES = [
  { id: "bair",   label: "Байр",         icon: "🏢", color: "#FF6B35" },
  { id: "mashin", label: "Машин",         icon: "🚗", color: "#4ECDC4" },
  { id: "hashaa", label: "Хашаа байшин", icon: "🏡", color: "#45B7D1" },
  { id: "busad",  label: "Бусад",         icon: "📦", color: "#96CEB4" },
];

export const SAMPLE_USERS = [
  { id: 1, name: "Болд Баатар",  email: "bold@gmail.com",  password: "1234", phone: "99112233" },
  { id: 2, name: "Номин Цэцэг", email: "nomin@gmail.com", password: "1234", phone: "88223344" },
];

const ph = (e, bg = "#1a2035") =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${bg}"/><text x="200" y="170" font-size="100" text-anchor="middle" dominant-baseline="middle">${e}</text></svg>`)}`;

export const SAMPLE_LISTINGS = [
  { id:1, userId:1, category:"bair",   title:"2 өрөө байр солилцоно",           description:"БЗД 3-р хороо, 9 давхрын 5 давхарт 2 өрөө байр. Ремонттой, цонх нь шинэ. 40кв/м.", wantedItem:"Хан-Уул дүүрэгт 2-3 өрөө байр",         price:"85,000,000₮", images:[ph("🏢","#12202f"),ph("🛋️","#12202f"),ph("🚿","#12202f")], phone:"99112233", email:"bold@gmail.com",  featured:true,  featuredUntil:Date.now()+5*86400000, createdAt:Date.now()-2*86400000, views:342 },
  { id:2, userId:2, category:"mashin", title:"Toyota Camry 2018 солилцоно",      description:"Toyota Camry 2018 он, 2.5 литр, автомат. Яваасан 78,000 км. Цагаан өнгө.",          wantedItem:"Жижиг хэмжээний машин + мөнгөн зөрүү", price:"45,000,000₮", images:[ph("🚗","#0d1e1e"),ph("🛞","#0d1e1e"),ph("⚙️","#0d1e1e")], phone:"88223344", email:"nomin@gmail.com", featured:true,  featuredUntil:Date.now()+6*86400000, createdAt:Date.now()-86400000,   views:218 },
  { id:3, userId:1, category:"hashaa", title:"Налайх дахь хашаа байшин",         description:"Налайх дүүрэг, 4 өрөө байшин, 5 сотых газар. Гараж, худаг бий.",                    wantedItem:"Нийслэлд орон сууцтай солилцоно",      price:"120,000,000₮",images:[ph("🏡","#0d1a12"),ph("🌳","#0d1a12")],                        phone:"99112233", email:"bold@gmail.com",  featured:false, createdAt:Date.now()-5*86400000,  views:89  },
  { id:4, userId:2, category:"busad",  title:"iPhone 15 Pro - MacBook солилцоно",description:"iPhone 15 Pro 256GB, Titanium Black. Ашигласан 6 сар.",                              wantedItem:"MacBook Air M2 эсвэл M3",               price:"3,200,000₮",  images:[ph("📱","#1a1220"),ph("💻","#1a1220")],                         phone:"88223344", email:"nomin@gmail.com", featured:false, createdAt:Date.now()-3*86400000,  views:156 },
];

export const formatDate = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
};
export const daysLeft = (ts) => Math.max(0, Math.ceil((ts - Date.now()) / 86400000));
export const parsePrice = (s) => s ? parseInt(s.replace(/[^0-9]/g, "")) || 0 : 0;
