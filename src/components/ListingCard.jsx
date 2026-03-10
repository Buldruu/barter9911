import { CATEGORIES, formatDate } from "../data/constants";

export default function ListingCard({ listing, featured, currentUser, onOpen, onEdit, onDelete, onFeature }) {
  const cat = CATEGORIES.find(c => c.id === listing.category);
  const isOwner = currentUser?.id === listing.userId;

  return (
    <div className={`card ${featured ? "fc" : ""}`} onClick={() => onOpen(listing)}>
      <div style={{ height:190, overflow:"hidden", position:"relative", background:"#0D1220" }}>
        {listing.images?.[0]
          ? <img src={listing.images[0]} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64 }}>{cat?.icon}</div>
        }
        {featured && <div style={{ position:"absolute", top:10, left:10 }}><span className="badge" style={{ background:"rgba(0,0,0,0.75)", color:"#FFB347", border:"1px solid rgba(255,179,71,0.4)", backdropFilter:"blur(4px)" }}>⭐ ОНЦЛОХ</span></div>}
        {(listing.images?.length||0)>1 && <div style={{ position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,0.65)", borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700, color:"white" }}>📷 {listing.images.length}</div>}
      </div>
      <div style={{ padding:16 }}>
        <div style={{ marginBottom:8 }}><span className="badge" style={{ background:`${cat?.color}18`, color:cat?.color, border:`1px solid ${cat?.color}30` }}>{cat?.icon} {cat?.label}</span></div>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6, lineHeight:1.35 }}>{listing.title}</h3>
        <p style={{ fontSize:13, color:"#8892A4", marginBottom:10, lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{listing.description}</p>
        {listing.wantedItem && <div style={{ background:"#0D1220", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:12 }}><span style={{ color:"#8892A4" }}>🔄 </span><span style={{ color:"#4ECDC4", fontWeight:600 }}>{listing.wantedItem}</span></div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:17, fontWeight:800, color:"#FF6B35" }}>{listing.price||"Тохиролцоогоор"}</span>
          <div style={{ display:"flex", gap:10, fontSize:12, color:"#8892A4" }}><span>👁 {listing.views}</span><span>{formatDate(listing.createdAt)}</span></div>
        </div>
        {isOwner && (
          <div style={{ display:"flex", gap:6, marginTop:12, paddingTop:12, borderTop:"1px solid #1E2A42" }} onClick={e=>e.stopPropagation()}>
            {!(listing.featured&&listing.featuredUntil>Date.now()) && <button className="btn-s" style={{ flex:1, padding:"7px 0", fontSize:11, color:"#FFB347", borderColor:"#FFB347" }} onClick={()=>onFeature(listing)}>⭐</button>}
            <button className="btn-s" style={{ flex:2, padding:"7px 0", fontSize:12 }} onClick={()=>onEdit(listing)}>✏️ Засах</button>
            <button className="btn-d" style={{ flex:1, padding:"7px 0", fontSize:12 }} onClick={()=>onDelete(listing.id)}>🗑</button>
          </div>
        )}
      </div>
    </div>
  );
}
