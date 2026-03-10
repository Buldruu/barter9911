import { useState } from "react";
import { CATEGORIES, formatDate, daysLeft } from "../data/constants";
import Lightbox from "./Lightbox";

export default function DetailPage({ listing, currentUser, onBack, onEdit, onDelete, onFeature }) {
  const cat = CATEGORIES.find(c => c.id === listing.category);
  const isOwner = currentUser?.id === listing.userId;
  const [idx, setIdx] = useState(0);
  const [lb, setLb] = useState(false);
  const imgs = listing.images || [];
  const prev = () => setIdx(i => (i-1+imgs.length)%imgs.length);
  const next = () => setIdx(i => (i+1)%imgs.length);

  return (
    <div>
      <button onClick={onBack} className="btn-s" style={{ marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>← Буцах</button>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }}>
        <div>
          <div onClick={()=>imgs.length>0&&setLb(true)} style={{ borderRadius:16, overflow:"hidden", border:"1px solid #1E2A42", background:"#0D1220", marginBottom:12, position:"relative", cursor:imgs.length>0?"zoom-in":"default" }}>
            {imgs[idx] ? <img src={imgs[idx]} alt="" style={{ width:"100%", height:400, objectFit:"cover", display:"block" }} /> : <div style={{ height:400, display:"flex", alignItems:"center", justifyContent:"center", fontSize:96 }}>{cat?.icon}</div>}
            {imgs.length>0 && <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(0,0,0,0.55)", borderRadius:8, padding:"5px 10px", fontSize:12, color:"rgba(255,255,255,0.8)" }}>🔍 Томруулж харах</div>}
            {imgs.length>1 && <>
              <button onClick={e=>{e.stopPropagation();prev();}} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, borderRadius:"50%", background:"rgba(0,0,0,0.65)", border:"none", color:"white", fontSize:18, cursor:"pointer" }}>‹</button>
              <button onClick={e=>{e.stopPropagation();next();}} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", width:38, height:38, borderRadius:"50%", background:"rgba(0,0,0,0.65)", border:"none", color:"white", fontSize:18, cursor:"pointer" }}>›</button>
              <div style={{ position:"absolute", bottom:12, right:12, background:"rgba(0,0,0,0.65)", borderRadius:8, padding:"4px 10px", fontSize:12, fontWeight:700, color:"white" }}>{idx+1}/{imgs.length}</div>
            </>}
          </div>
          {imgs.length>1 && (
            <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {imgs.map((src,i) => (
                <div key={i} onClick={()=>setIdx(i)} style={{ flexShrink:0, width:80, height:60, borderRadius:8, overflow:"hidden", border:`2px solid ${i===idx?"#FF6B35":"#1E2A42"}`, cursor:"pointer" }}>
                  <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ background:"#131929", border:"1px solid #1E2A42", borderRadius:16, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              {listing.featured&&listing.featuredUntil>Date.now() && <span className="badge" style={{ background:"#2A1A00", color:"#FFB347", border:"1px solid rgba(255,179,71,0.3)" }}>⭐ ОНЦЛОХ • {daysLeft(listing.featuredUntil)} хоног</span>}
              <span className="badge" style={{ background:`${cat?.color}18`, color:cat?.color, border:`1px solid ${cat?.color}30` }}>{cat?.icon} {cat?.label}</span>
            </div>
            <h1 style={{ fontSize:26, fontWeight:800, marginBottom:8, lineHeight:1.3 }}>{listing.title}</h1>
            <div style={{ display:"flex", gap:16, marginBottom:20, fontSize:13, color:"#8892A4" }}><span>👁 {listing.views} үзсэн</span><span>📅 {formatDate(listing.createdAt)}</span></div>
            <div className="divider" />
            <div style={{ fontSize:13, fontWeight:700, color:"#8892A4", marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Тайлбар</div>
            <p style={{ fontSize:15, lineHeight:1.75, color:"#C4CAD8" }}>{listing.description}</p>
            {listing.wantedItem && <>
              <div className="divider" />
              <div style={{ fontSize:13, fontWeight:700, color:"#8892A4", marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Солилцох хүсэл</div>
              <div style={{ background:"#0D1220", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:20 }}>🔄</span><span style={{ fontSize:15, color:"#4ECDC4", fontWeight:600 }}>{listing.wantedItem}</span></div>
            </>}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#131929", border:"1px solid #1E2A42", borderRadius:16, padding:24 }}>
            <div style={{ fontSize:12, color:"#8892A4", fontWeight:600, marginBottom:6 }}>ҮНЭ</div>
            <div style={{ fontSize:30, fontWeight:800, color:"#FF6B35", marginBottom:16 }}>{listing.price||"Тохиролцоогоор"}</div>
            <a href={`tel:${listing.phone}`} style={{ display:"block" }}><button className="btn-p" style={{ width:"100%", padding:"12px 0" }}>📞 Залгах</button></a>
          </div>
          <div style={{ background:"#131929", border:"1px solid #1E2A42", borderRadius:16, padding:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#8892A4", marginBottom:16, textTransform:"uppercase", letterSpacing:1 }}>Холбоо барих</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"#0D1220", borderRadius:10, padding:"12px 14px" }}><span style={{ fontSize:20 }}>📞</span><div><div style={{ fontSize:11, color:"#8892A4", fontWeight:600 }}>УТАС</div><div style={{ fontSize:16, fontWeight:700 }}>{listing.phone}</div></div></div>
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"#0D1220", borderRadius:10, padding:"12px 14px" }}><span style={{ fontSize:20 }}>✉️</span><div style={{ overflow:"hidden" }}><div style={{ fontSize:11, color:"#8892A4", fontWeight:600 }}>ИМЭЙЛ</div><div style={{ fontSize:13, fontWeight:700, color:"#4ECDC4", wordBreak:"break-all" }}>{listing.email}</div></div></div>
            </div>
          </div>
          {isOwner && (
            <div style={{ background:"#131929", border:"1px solid #1E2A42", borderRadius:16, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#8892A4", marginBottom:14, textTransform:"uppercase", letterSpacing:1 }}>Зар удирдах</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {!(listing.featured&&listing.featuredUntil>Date.now()) && <button style={{ background:"linear-gradient(135deg,#2A1A00,#1F1500)", border:"1.5px solid #FFB347", borderRadius:10, padding:"11px 0", color:"#FFB347", cursor:"pointer", fontWeight:700, fontSize:13, width:"100%", fontFamily:"inherit" }} onClick={onFeature}>⭐ Онцлох болгох — 5,000₮</button>}
                {listing.featured&&listing.featuredUntil>Date.now() && <div style={{ background:"#0D1220", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#FFB347", textAlign:"center", fontWeight:600 }}>⭐ Идэвхтэй • {daysLeft(listing.featuredUntil)} хоног</div>}
                <button className="btn-s" style={{ width:"100%", padding:"11px 0" }} onClick={()=>onEdit(listing)}>✏️ Зар засварлах</button>
                <button className="btn-d" style={{ width:"100%", padding:"11px 0" }} onClick={()=>onDelete(listing.id)}>🗑 Зар устгах</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {lb && <Lightbox images={imgs} idx={idx} onClose={()=>setLb(false)} onPrev={prev} onNext={next} />}
    </div>
  );
}
