 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
 import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
 import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

 /* ============================================================
    PASTE YOUR FIREBASE WEB APP CONFIG HERE.
    Firebase Console -> Project settings -> General -> Your apps
    -> SDK setup and configuration -> "Config"
    ============================================================ */
 const firebaseConfig = {
 apiKey: "AIzaSyBmwEJ1I0dF43FZS5zHZCaFbAggftOfwqg",
 authDomain: "fairmatchai-217cc.firebaseapp.com",
 databaseURL: "https://fairmatchai-217cc-default-rtdb.firebaseio.com",
 projectId: "fairmatchai-217cc",
 storageBucket: "fairmatchai-217cc.firebasestorage.app",
 messagingSenderId: "554803364134",
 appId: "1:554803364134:web:d12a066f012962d431c1e7"
 };
 /* ============================================================ */

 /* Single Firebase app/db/auth instance for the whole page. */
 const firebaseApp = initializeApp(firebaseConfig);
 const db = getDatabase(firebaseApp);
 const auth = getAuth(firebaseApp);

 /* ---- Anonymous auth: kicked off once, reused by every save ---- */
 let authReadyPromise = null;

 function ensureAnonymousAuth() {
 if (authReadyPromise) return authReadyPromise;

 authReadyPromise = new Promise((resolve, reject) => {
 const unsubscribe = onAuthStateChanged(
 auth,
 (user) => {
 if (user) {
 unsubscribe();
 resolve(user);
 }
 },
 (err) => {
 unsubscribe();
 reject(err);
 }
 );

 // Trigger anonymous sign-in. onAuthStateChanged above will
 // fire with the resulting user (no password is ever created
 // or stored — Firebase issues an anonymous UID only).
 signInAnonymously(auth).catch((err) => {
 unsubscribe();
 reject(err);
 });
 });

 return authReadyPromise;
 }

 // Start signing the visitor in as soon as the page loads, so it's
 // usually already done by the time they submit the form.
 ensureAnonymousAuth().catch((err) => {
 console.error("Anonymous sign-in failed:", err);
 });

 /**
  * Saves one candidate under candidates/<uniquePushId> using push(),
  * so simultaneous registrations from different devices each get
  * their own unique key and never overwrite one another.
  * Waits for anonymous authentication to complete first, since the
  * database rules require an authenticated (even anonymous) user.
  * Exposed on window so the existing (non-module) app script,
  * loaded above, can call it from submitRegister().
  */
 window.saveCandidateToFirebase = async function (candidate) {
 await ensureAnonymousAuth();
 const candidatesRef = ref(db, "candidates");
 const newCandidateRef = push(candidatesRef);
 await set(newCandidateRef, candidate);
 return newCandidateRef.key;
 };

 /**
  * Live-syncs the candidates/ node in real time, so every device
  * (Recruiter dashboard, Admin dashboard) sees registrations from
  * every other device, instead of only this device's localStorage.
  * Firebase's onValue fires immediately with current data, then again
  * on every future change, so this stays continuously up to date.
  */
 function startCandidatesSync() {
 const candidatesRef = ref(db, "candidates");
 onValue(
 candidatesRef,
 (snapshot) => {
 const val = snapshot.val() || {};
 const list = Object.keys(val).map((key) => Object.assign({ id: key }, val[key]));
 if (typeof window.onFirebaseCandidatesUpdate === "function") {
 window.onFirebaseCandidatesUpdate(list);
 }
 },
 (err) => {
 console.error("Failed to read candidates from Firebase:", err);
 }
 );
 }

 // Database rules require an authenticated (anonymous is fine) user to
 // read candidates/, same as to write it, so wait for sign-in first.
 ensureAnonymousAuth()
 .then(startCandidatesSync)
