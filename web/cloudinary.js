// js/cloudinary.js
const CLOUD_NAME = "dgmpun05z";
const UPLOAD_PRESET = "barter9911";

export async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error("Зураг upload амжилтгүй.");
  const data = await res.json();
  return data.secure_url;
}

// Optional: чанар + формат авто (Cloudinary URL дээр ажиллана)
export function optimizeCloudinaryUrl(url) {
  // .../upload/... -> .../upload/q_auto,f_auto/...
  return url.replace("/upload/", "/upload/q_auto,f_auto/");
}
