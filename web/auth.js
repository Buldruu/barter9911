// js/auth.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

export const ADMIN_EMAILS = ["admin@barter9911.mn"];

export function isAllowedAdmin(user) {
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
}

export async function adminLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!isAllowedAdmin(cred.user)) {
    await signOut(auth);
    throw new Error("Админы эрхгүй хэрэглэгч байна.");
  }
  return cred;
}

export async function adminLogout() {
  await signOut(auth);
}

export function requireAdmin(redirectTo = "login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user || !isAllowedAdmin(user)) window.location.href = redirectTo;
  });
}

export function watchAuth(cb) {
  onAuthStateChanged(auth, cb);
}
