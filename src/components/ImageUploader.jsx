import { useRef, useCallback, useState } from "react";

export default function ImageUploader({ images, onChange }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const process = useCallback(files => {
    const rem = 10 - images.length;
    if (rem <= 0) return;
    Array.from(files).slice(0, rem).forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = e => onChange(p => [...p, e.target.result]);
      r.readAsDataURL(f);
    });
  }, [images.length, onChange]);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:12, color:"#8892A4", fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>ЗУРАГНУУД <span style={{ color:"#FF6B35" }}>*</span></span>
        <span style={{ fontSize:12, color:images.length>=10?"#FF6B35":"#8892A4", fontWeight:600 }}>{images.length}/10</span>
      </div>
      {images.length < 10 && (
        <div
          onDragOver={e=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files);}}
          onClick={()=>ref.current.click()}
          style={{ border:`2px dashed ${drag?"#FF6B35":"#2A3A5A"}`, borderRadius:12, padding:"20px 16px", textAlign:"center", cursor:"pointer", background:drag?"rgba(255,107,53,0.06)":"#0D1220", marginBottom:images.length>0?12:0 }}
        >
          <div style={{ fontSize:28, marginBottom:6 }}>📷</div>
          <div style={{ fontWeight:700, fontSize:14, color:"#C4CAD8", marginBottom:4 }}>Зураг оруулах</div>
          <div style={{ fontSize:12, color:"#8892A4" }}>Дарж сонгох эсвэл чирж оруулах • 1–10 зураг</div>
          <input ref={ref} type="file" accept="image/*" multiple hidden onChange={e=>{process(e.target.files);e.target.value="";}} />
        </div>
      )}
      {images.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
          {images.map((src,i) => (
            <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:10, overflow:"hidden", border:i===0?"2px solid #FF6B35":"2px solid #1E2A42" }}>
              <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              {i===0 && <div style={{ position:"absolute", top:3, left:3, background:"#FF6B35", color:"white", fontSize:8, fontWeight:800, padding:"2px 5px", borderRadius:4 }}>ҮНДСЭН</div>}
              <button onClick={e=>{e.stopPropagation();onChange(p=>p.filter((_,j)=>j!==i));}} style={{ position:"absolute", top:3, right:3, width:18, height:18, borderRadius:"50%", background:"rgba(0,0,0,0.8)", border:"none", color:"white", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              {i>0 && <button onClick={e=>{e.stopPropagation();onChange(p=>{const a=[...p];const[x]=a.splice(i,1);a.splice(i-1,0,x);return a;});}} style={{ position:"absolute", bottom:3, left:3, width:18, height:18, borderRadius:4, background:"rgba(0,0,0,0.8)", border:"none", color:"white", fontSize:10, cursor:"pointer" }}>←</button>}
              {i<images.length-1 && <button onClick={e=>{e.stopPropagation();onChange(p=>{const a=[...p];const[x]=a.splice(i,1);a.splice(i+1,0,x);return a;});}} style={{ position:"absolute", bottom:3, right:3, width:18, height:18, borderRadius:4, background:"rgba(0,0,0,0.8)", border:"none", color:"white", fontSize:10, cursor:"pointer" }}>→</button>}
            </div>
          ))}
          {images.length<10 && <div onClick={()=>ref.current.click()} style={{ aspectRatio:"1", borderRadius:10, border:"2px dashed #2A3A5A", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:22, color:"#4A5A7A", background:"#0D1220" }}>+</div>}
        </div>
      )}
      {images.length===0 && <div style={{ fontSize:12, color:"#FF6B35", marginTop:6, fontWeight:600 }}>⚠ Дор хаяж 1 зураг оруулна уу</div>}
    </div>
  );
}
