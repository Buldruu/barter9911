import { useEffect } from "react";

export default function Lightbox({ images, idx, onClose, onPrev, onNext }) {
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext]);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(10px)" }}>
      <button onClick={onClose} style={{ position:"fixed", top:18, right:18, width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)", color:"white", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:201 }}>✕</button>
      <div style={{ position:"fixed", top:22, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.6)", borderRadius:20, padding:"6px 18px", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", zIndex:201 }}>{idx+1} / {images.length}</div>
      <img src={images[idx]} alt="" onClick={e=>e.stopPropagation()} style={{ maxWidth:"88vw", maxHeight:"85vh", objectFit:"contain", borderRadius:12, boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }} />
      {images.length > 1 && <>
        <button onClick={e=>{e.stopPropagation();onPrev();}} style={{ position:"fixed", left:18, top:"50%", transform:"translateY(-50%)", width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)", color:"white", fontSize:26, cursor:"pointer", zIndex:201 }}>‹</button>
        <button onClick={e=>{e.stopPropagation();onNext();}} style={{ position:"fixed", right:18, top:"50%", transform:"translateY(-50%)", width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.2)", color:"white", fontSize:26, cursor:"pointer", zIndex:201 }}>›</button>
      </>}
      {images.length > 1 && (
        <div onClick={e=>e.stopPropagation()} style={{ position:"fixed", bottom:18, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:201, background:"rgba(0,0,0,0.55)", padding:"8px 12px", borderRadius:14, maxWidth:"88vw", overflowX:"auto" }}>
          {images.map((src,i) => (
            <img key={i} src={src} alt="" style={{ width:56, height:42, objectFit:"cover", borderRadius:7, border:`2px solid ${i===idx?"#FF6B35":"transparent"}`, cursor:"pointer", opacity:i===idx?1:0.5, flexShrink:0 }} />
          ))}
        </div>
      )}
    </div>
  );
}
