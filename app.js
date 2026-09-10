/* ================= persistence ================= */

function loadFromStorage(key, fallback) {
 try {
 const raw = localStorage.getItem(key);
 if (!raw) return fallback;
 const parsed = JSON.parse(raw);
 return Array.isArray(parsed) && parsed.length ? parsed : fallback;
 } catch (e) { return fallback; }
}
function saveToStorage(key, value) {
 try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

/* ================= data ================= */

const SEED_COMPANIES = [
 { id:"nova", name:"NovaData Analytics", booth:"A-12", role:"Data Analyst", industry:"Data Analytics",
 description:"Looking for a data-curious fresher to help turn raw sales and product data into dashboards the whole company can use.",
 skills:["Python","SQL","Power BI","Excel"], qualAccepts:["B.Tech","BCA","MCA","B.Sc"],
 experienceAccepts:["Fresher","0-1 years"], crowd:38, crowdLevel:"green" },
 { id:"bluewave", name:"Bluewave Software", booth:"B-07", role:"Junior Software Developer", industry:"IT",
 description:"Join a small product team building internal tooling. You'll ship real features in your first month, with a senior engineer reviewing your work.",
 skills:["Python","SQL","Java","Programming"], qualAccepts:["B.Tech","BCA","MCA"],
 experienceAccepts:["Fresher"], crowd:71, crowdLevel:"amber" },
 { id:"orbit", name:"Orbit Consulting", booth:"C-03", role:"Business Analyst", industry:"Business Analytics",
 description:"Work alongside client-facing consultants to gather requirements, model processes, and turn findings into clear recommendations.",
 skills:["Excel","SQL","Power BI","Communication"], qualAccepts:["B.Tech","B.Com","BCA","MCA"],
 experienceAccepts:["Fresher","1-3 years"], crowd:94, crowdLevel:"red" },
 { id:"vector", name:"Vector Labs", booth:"D-15", role:"ML Engineer", industry:"/ML",
 description:"Support the applied-ML team with data preparation, model evaluation, and experiment tracking on real production models.",
 skills:["Python","Machine Learning","Statistics","SQL"], qualAccepts:["B.Tech","M.Tech"],
 experienceAccepts:["Fresher","0-1 years"], crowd:22, crowdLevel:"green" },
 { id:"fintrack", name:"Fintrack Systems", booth:"E-09", role:"Backend Developer", industry:"FinTech",
 description:"Build and maintain APIs behind a payments platform used by thousands of merchants. Strong fundamentals matter more than years of experience.",
 skills:["Java","SQL","Spring","APIs"], qualAccepts:["B.Tech","MCA"],
 experienceAccepts:["Fresher","0-1 years"], crowd:55, crowdLevel:"amber" },
 { id:"harbor", name:"Harbor Cloud", booth:"F-04", role:"Cloud Support Engineer", industry:"Cloud",
 description:"Help customers troubleshoot infrastructure issues and keep uptime high. Good place to learn cloud fundamentals on the job.",
 skills:["Linux","Networking","AWS","SQL"], qualAccepts:["B.Tech","BCA","Diploma"],
 experienceAccepts:["Fresher"], crowd:17, crowdLevel:"green" },
];
const COMPANIES = loadFromStorage("fm_companies", SEED_COMPANIES);

const DEGREES = ["B.Tech Computer Science","B.Tech IT","B.Sc Computer Science","BCA","MCA","B.Com","Diploma","Other"];
const EXPERIENCE = ["Fresher","0-1 years","1-3 years","3-5 years","5+ years"];
function currentRoles() { return [...new Set(COMPANIES.map(c => c.role))]; }
function currentIndustries() { return [...new Set(COMPANIES.map(c => c.industry))]; }

const SAMPLE_PROFILE = {
 fullName:"Arun Kumar", email:"arun.kumar@example.com", phone:"98765 43210",
 college:"Sri Venkateswara College of Engineering", degree:"B.Tech Computer Science",
 gradYear:"2027", skills:"Python, SQL, Power BI, Excel", experience:"Fresher",
 preferredRole:"Data Analyst", preferredIndustry:"Data Analytics",
 location:"Chennai, Tamil Nadu", resumeName:""
};
const EMPTY_PROFILE = {
 fullName:"", email:"", phone:"",
 college:"", degree:"",
 gradYear:"", skills:"", experience:"",
 preferredRole:"", preferredIndustry:"",
 location:"", resumeName:""
};

const SLOTS = ["10:30 AM \u2013 11:00 AM", "11:00 AM \u2013 11:30 AM", "12:00 PM \u2013 12:30 PM"];

const SEED_CANDIDATES = [
 { email:"arun.kumar@example.com", name:"Arun Kumar", skills:"Python, SQL, Power BI", qual:"B.Tech CSE", match:92, status:"Shortlisted" },
 { email:"priya.subramaniam@example.com", name:"Priya Subramaniam", skills:"Java, React, SQL", qual:"B.Tech IT", match:88, status:"Reviewing" },
 { email:"rahul.krishnan@example.com", name:"Rahul Krishnan", skills:"Python, ML, Statistics", qual:"B.Tech CSE", match:85, status:"Shortlisted" },
 { email:"divya.menon@example.com", name:"Divya Menon", skills:"Excel, SQL, Communication", qual:"B.Com", match:79, status:"Reviewing" },
 { email:"karthik.raja@example.com", name:"Karthik Raja", skills:"Java, Spring, APIs", qual:"MCA", match:74, status:"New" },
 { email:"sneha.iyer@example.com", name:"Sneha Iyer", skills:"AWS, Linux, Networking", qual:"BCA", match:68, status:"New" },
];
const CANDIDATE_TABLE = loadFromStorage("fm_candidates", SEED_CANDIDATES);

/* ================= firebase candidate sync ================= */

function mapFirebaseCandidateToRow(fc) {
 return {
 id: fc.id,
 email: fc.email || "",
 name: fc.name || "",
 skills: fc.skills || "",
 qual: fc.qualification || "",
 match: typeof fc.matchScore === "number" ? fc.matchScore : 0,
 status: fc.status || "New"
 };
}

/*
 * Called by the Firebase module script (bottom of page) every time the
 * candidates/ node changes in Realtime Database — including registrations
 * submitted from other devices. This keeps CANDIDATE_TABLE, which the
 * Recruiter and Admin dashboards read from, in sync with the live
 * database instead of only this device's localStorage copy.
 */
window.onFirebaseCandidatesUpdate = function (firebaseCandidates) {
 const liveRows = firebaseCandidates.map(mapFirebaseCandidateToRow);
 const liveEmails = new Set(liveRows.map(r => r.email).filter(Boolean));
 const seedRows = SEED_CANDIDATES.filter(s => !liveEmails.has(s.email));
 const merged = seedRows.concat(liveRows);

 CANDIDATE_TABLE.length = 0;
 merged.forEach(r => CANDIDATE_TABLE.push(r));
 saveToStorage("fm_candidates", CANDIDATE_TABLE);

 // Refresh whichever dashboard is currently open so new registrations
 // from other devices show up without needing a manual page reload.
 if (State.view === "recruiter" || State.view === "admin") {
 render();
 }
};

const SKILL_DIST = [["Python",410],["SQL",365],["Java",290],["Excel",250],["Power BI",195],["ML",150]];
const MATCH_DIST = [["90\u2013100%",120],["75\u201389%",210],["60\u201374%",98],["<60%",58]];
const REG_OVER_TIME = [["Wk 1",140],["Wk 2",260],["Wk 3",410],["Wk 4",620],["Wk 5",890],["Wk 6",1240],["Wk 7",1870],["Wk 8",2450]];

/* ================= state ================= */

const State = { view:"landing", profile: Object.assign({}, EMPTY_PROFILE) };
let recruiterCharts = [];

/* ================= auth (demo) ================= */

const ADMIN_CREDENTIALS = { user:"admin", pass:"admin123" };
const RECRUITER_CREDENTIALS = { user:"recruiter", pass:"recruiter123" };
let adminAuthed = sessionStorage.getItem("fm_admin_auth") === "1";
let recruiterAuthed = sessionStorage.getItem("fm_recruiter_auth") === "1";


function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }

/* ================= small svg helpers ================= */

function iconSvg(name, size, color) {
 size = size || 16; color = color || "currentColor";
 const paths = {
 check: '<path d="M4 12l5 5L20 6" stroke="'+color+'" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 clock: '<circle cx="12" cy="12" r="8.5" stroke="'+color+'" stroke-width="1.8" fill="none"/><path d="M12 7.5V12l3.2 2" stroke="'+color+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
 pin: '<path d="M12 21s7-6.2 7-11.6A7 7 0 0 0 5 9.4C5 14.8 12 21 12 21z" stroke="'+color+'" stroke-width="1.8" fill="none"/><circle cx="12" cy="9.3" r="2.4" stroke="'+color+'" stroke-width="1.8" fill="none"/>',
 sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="'+color+'"/>',
 upload: '<path d="M7 17a4 4 0 0 1-.8-7.9A5 5 0 0 1 16.3 7.4 4.2 4.2 0 0 1 16 17" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 21v-7m0 0l-2.6 2.6M12 14l2.6 2.6" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 shield: '<path d="M12 3l7 3v5.5c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-3z" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linejoin="round"/><path d="M9 12l2 2 4-4.2" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 alert: '<path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linejoin="round"/><path d="M12 10v4.2" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="'+color+'"/>',
 filter: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5L4 5z" stroke="'+color+'" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
 trend: '<path d="M4 17l5-6 4 3 7-9" stroke="'+color+'" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 chevron: '<path d="M9 5l7 7-7 7" stroke="'+color+'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 menu: '<path d="M4 6h16M4 12h16M4 18h16" stroke="'+color+'" stroke-width="1.9" stroke-linecap="round"/>',
 close: '<path d="M6 6l12 12M18 6L6 18" stroke="'+color+'" stroke-width="1.9" stroke-linecap="round"/>',
 users: '<circle cx="9" cy="8" r="3" stroke="'+color+'" stroke-width="1.7" fill="none"/><path d="M3.5 19c.6-3 3-4.6 5.5-4.6s4.9 1.6 5.5 4.6" stroke="'+color+'" stroke-width="1.7" fill="none" stroke-linecap="round"/><circle cx="16.5" cy="9" r="2.3" stroke="'+color+'" stroke-width="1.6" fill="none"/><path d="M15 14.6c1.9.2 3.7 1.5 4.3 4.2" stroke="'+color+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
 doc: '<path d="M7 3h7l4 4v14H7V3z" stroke="'+color+'" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M14 3v4h4" stroke="'+color+'" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M9.5 13h5M9.5 16h5" stroke="'+color+'" stroke-width="1.4" stroke-linecap="round"/>',
 grid: '<rect x="4" y="4" width="7" height="7" rx="1.4" stroke="'+color+'" stroke-width="1.6" fill="none"/><rect x="13" y="4" width="7" height="7" rx="1.4" stroke="'+color+'" stroke-width="1.6" fill="none"/><rect x="4" y="13" width="7" height="7" rx="1.4" stroke="'+color+'" stroke-width="1.6" fill="none"/><rect x="13" y="13" width="7" height="7" rx="1.4" stroke="'+color+'" stroke-width="1.6" fill="none"/>',
 brief: '<rect x="4" y="8" width="16" height="11" rx="1.6" stroke="'+color+'" stroke-width="1.6" fill="none"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="'+color+'" stroke-width="1.6" fill="none"/>'
 };
 return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24">'+paths[name]+'</svg>';
}

function scoreRingSvg(score, size, stroke) {
 size = size || 96; stroke = stroke || 8;
 const r = (size - stroke) / 2, c = 2 * Math.PI * r;
 const color = tierOf(score).color;
 const off = c - (score/100) * c;
 return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'
 + '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="'+stroke+'"/>'
 + '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+stroke+'" stroke-dasharray="'+c+'" stroke-dashoffset="'+off+'" stroke-linecap="round" transform="rotate(-90 '+size/2+' '+size/2+')"/>'
 + '<text x="50%" y="47%" text-anchor="middle" font-family="Space Grotesk" font-size="'+size*0.24+'" fill="var(--ink)" font-weight="600">'+score+'</text>'
 + '<text x="50%" y="65%" text-anchor="middle" font-family="Inter" font-size="'+size*0.1+'" fill="var(--ink-dim)">percent</text>'
 + '</svg>';
}

function pseudoQrSvg(seed) {
 let s = 0;
 for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 97;
 const n = 7, cell = 10, rects = [];
 for (let y = 0; y < n; y++) {
 for (let x = 0; x < n; x++) {
 s = (s * 13 + 7) % 97;
 const isFinder = (x < 2 && y < 2) || (x > n-3 && y < 2) || (x < 2 && y > n-3);
 const on = isFinder ? ((x + y) % 2 === 0 || x === 0 || y === 0) : (s % 2 === 0);
 if (on) rects.push('<rect x="'+x*cell+'" y="'+y*cell+'" width="'+cell+'" height="'+cell+'" fill="#0B0F1C"/>');
 }
 }
 return '<svg width="'+n*cell+'" height="'+n*cell+'" style="background:#fff;border-radius:6px;">'+rects.join("")+'</svg>';
}

/* ================= nav ================= */

function renderNav() {
 const items = [["landing","Home"],["register","Candidate"],["recruiter","Recruiter"],["admin","Admin"]];
 const links = items.map(([id,label]) =>
 '<button class="nav-link '+(State.view===id?"active":"")+'" onclick="setView(\''+id+'\')">'+label+'</button>'
 ).join("");
 document.getElementById("nav-root").innerHTML = `
 <header class="nav">
 <div class="nav-inner">
 <button class="brand" onclick="setView('landing')">
 <svg width="26" height="26" viewBox="0 0 26 26">
 <circle cx="8" cy="13" r="5.5" fill="var(--blue)" opacity="0.9"/>
 <circle cx="17" cy="8" r="4" fill="var(--teal)" opacity="0.9"/>
 <circle cx="17.5" cy="18" r="3.4" fill="var(--violet)" opacity="0.9"/>
 </svg>
 <span>FairMatch</span>
 </button>
 <nav class="nav-links">${links}</nav>
 <button class="btn btn-primary nav-cta" onclick="setView('register')">Get started</button>
 <button class="nav-burger" onclick="toggleMobileNav()">${iconSvg("menu",22)}</button>
 </div>
 <div class="nav-mobile" id="nav-mobile">
 ${links}
 <button class="btn btn-primary" onclick="setView('register')">Get started</button>
 </div>
 </header>
 `;
}
function toggleMobileNav() { document.getElementById("nav-mobile").classList.toggle("open"); }

/* ================= landing ================= */

function renderLanding() {
 const steps = [
 ["01","Register","Create a candidate profile with your skills, qualification and preferred roles.","users"],
 ["02","Upload your resume","Add a PDF or Word file so the system has something to read besides the form.","upload"],
 ["03","Profile processing","Skills, education and experience are pulled out and turned into a structured profile.","sparkle"],
 ["04","Smart matching","Your profile is scored against every open role at the fair, not just the ones you searched for.","grid"],
 ["05","Get recommendations","See ranked companies and roles, each with a match score and the reasoning behind it.","brief"],
 ["06","Smart scheduling","A visiting time and booth are assigned so you're not standing in every queue at once.","clock"],
 ];
 const howCards = steps.map(([n,t,body,icon]) =>
 `<div class="how-card"><div class="how-num">${n}</div>${iconSvg(icon,20,"var(--teal)")}<h3>${t}</h3><p>${body}</p></div>`
 ).join("");
 const avgMatch = CANDIDATE_TABLE.length
 ? Math.round(CANDIDATE_TABLE.reduce((sum, c) => sum + c.match, 0) / CANDIDATE_TABLE.length)
 : 0;
 const stripItems = [
 [CANDIDATE_TABLE.length.toLocaleString(), "candidates registered"],
 [COMPANIES.length.toLocaleString(), "companies at the fair"],
 [avgMatch + "%", "average match score"],
 [String(SCORING_SIGNALS.length), "Matching signals"]
 ].map(([n,l]) => `<div class="strip-item"><span class="strip-num">${n}</span><span class="strip-label">${l}</span></div>`).join("");

 return `
 <section class="hero">
 <div class="hero-copy">
 <span class="pill pill-blue">${iconSvg("sparkle",13)} Smart job fairs</span>
 <h1>Know your match before you stand in line.</h1>
 <p class="lede">FairMatch FairMatch processes your resume, scores you against every booth at the fair, and hands you a schedule \u2014 so you spend the day meeting recruiters instead of waiting for them.</p>
 <div class="hero-actions">
 <button class="btn btn-primary" onclick="setView('register')">Register as a candidate</button>
 <button class="btn btn-outline" onclick="setView('recruiter')">Recruiter login</button>
 </div>
 <button class="hero-link" onclick="document.getElementById('how-it-works').scrollIntoView({behavior:'smooth'})">See how it works</button>
 </div>
 <div class="hero-visual">
 <div class="hero-card">
 <div class="hero-card-top"><span>Data Analyst \u00b7 NovaData Analytics</span><span class="pill pill-green">Strong match</span></div>
 <div class="hero-card-mid">
 ${scoreRingSvg(92)}
 <ul class="hero-card-skills">
 <li>${iconSvg("check",14,"var(--green)")} Python</li>
 <li>${iconSvg("check",14,"var(--green)")} SQL</li>
 <li>${iconSvg("check",14,"var(--green)")} Power BI</li>
 <li>${iconSvg("check",14,"var(--green)")} Excel</li>
 </ul>
 </div>
 <div class="hero-card-foot">${iconSvg("clock",14)} 10:30 AM \u2013 11:00 AM <span class="dot"></span> Booth A-12</div>
 </div>
 <div class="hero-card hero-card-back"></div>
 </div>
 </section>

 <section class="strip">${stripItems}</section>

 <section id="how-it-works" class="how">
 <h2>How it works</h2>
 <p class="section-lede">Six steps between opening your laptop and walking up to the right booth first.</p>
 <div class="how-grid">${howCards}</div>
 </section>

 <section class="compare">
 <div class="compare-col">
 <h3>A traditional job fair</h3>
 <ol>
 <li>Hundreds of candidates arrive at once</li>
 <li>Long queues form at popular booths</li>
 <li>Recruiters screen resumes manually, on the spot</li>
 <li>Most of the day is spent waiting</li>
 </ol>
 </div>
 <div class="compare-arrow">${iconSvg("chevron",22)}</div>
 <div class="compare-col compare-col-highlight">
 <h3>With FairMatch</h3>
 <ol>
 <li>Candidates register and upload resumes in advance</li>
 <li>The system evaluates skills, education and experience</li>
 <li>Everyone gets a ranked list of the best-fit booths</li>
 <li>Visits are scheduled to spread out the crowd</li>
 </ol>
 </div>
 </section>

 <section class="cta-band">
 <h2>Ready to see your matches?</h2>
 <p>It takes about two minutes to register and get your first set of recommendations.</p>
 <button class="btn btn-primary" onclick="setView('register')">Register as a candidate</button>
 </section>
 `;
}

/* ================= candidate: register ================= */

function fieldHtml(id, label, inputHtml, full) {
 return `<label class="field ${full?"field-full":""}"><span class="field-label">${label}</span>${inputHtml}</label>`;
}
function optionsHtml(list, selected, placeholder) {
 const opts = list.map(v => `<option ${v===selected?"selected":""}>${esc(v)}</option>`).join("");
 return placeholder ? `<option value="" ${!selected?"selected":""} disabled>${esc(placeholder)}</option>${opts}` : opts;
}

function renderRegister() {
 const p = State.profile;
 return `
 <section class="form-page">
 <div class="form-head">
 <span class="pill pill-blue">Candidate registration</span>
 <h1>Create your profile</h1>
 <p class="section-lede">This is what the will read to find your matches, so the more accurate, the better.</p>
 </div>
 <div class="form-card">
 <div class="form-grid">
 ${fieldHtml("", "Full name", `<input id="reg-fullName" value="${esc(p.fullName)}" placeholder="e.g. Arun Kumar"/>`)}
 ${fieldHtml("", "Email", `<input id="reg-email" value="${esc(p.email)}" placeholder="you@example.com"/>`)}
 ${fieldHtml("", "Phone number", `<input id="reg-phone" value="${esc(p.phone)}" placeholder="98765 43210"/>`)}
 ${fieldHtml("", "College / university", `<input id="reg-college" value="${esc(p.college)}" placeholder="Your institution"/>`)}
 ${fieldHtml("", "Degree", `<select id="reg-degree">${optionsHtml(DEGREES, p.degree, "Select your degree")}</select>`)}
 ${fieldHtml("", "Graduation year", `<input id="reg-gradYear" value="${esc(p.gradYear)}" placeholder="2027"/>`)}
 ${fieldHtml("", "Skills", `<input id="reg-skills" value="${esc(p.skills)}" placeholder="Python, SQL, Power BI, Excel"/>`, true)}
 ${fieldHtml("", "Experience level", `<select id="reg-experience">${optionsHtml(EXPERIENCE, p.experience, "Select your experience")}</select>`)}
 ${fieldHtml("", "Preferred job role", `<select id="reg-preferredRole">${optionsHtml(currentRoles(), p.preferredRole, "Select a preferred role")}</select>`)}
 ${fieldHtml("", "Preferred industry", `<select id="reg-preferredIndustry">${optionsHtml(currentIndustries(), p.preferredIndustry, "Select a preferred industry")}</select>`)}
 ${fieldHtml("", "Location", `<input id="reg-location" value="${esc(p.location)}" placeholder="City, State"/>`)}
 ${fieldHtml("", "Resume", `
 <label class="upload-box">
 ${iconSvg("upload",18)}
 <span id="resume-label">${p.resumeName ? esc(p.resumeName) : "Upload PDF, DOC or DOCX"}</span>
 <input type="file" accept=".pdf,.doc,.docx" style="display:none" onchange="onResumeChange(this)"/>
 </label>`, true)}
 </div>
 <div class="form-foot">
 <span class="muted-small" id="reg-error" style="color:var(--rose);display:none"></span>
 <button class="btn btn-primary" id="reg-submit" onclick="submitRegister()">Submit and analyse profile</button>
 </div>
 </div>
 </section>
 `;
}

function onResumeChange(input) {
 const name = input.files && input.files[0] ? input.files[0].name : "";
 State.profile.resumeName = name;
 document.getElementById("resume-label").textContent = name || "Upload PDF, DOC or DOCX";
}

function collectProfileFromForm() {
 const g = id => document.getElementById(id);
 State.profile = {
 fullName: g("reg-fullName").value.trim(),
 email: g("reg-email").value.trim(),
 phone: g("reg-phone").value.trim(),
 college: g("reg-college").value.trim(),
 degree: g("reg-degree").value,
 gradYear: g("reg-gradYear").value.trim(),
 skills: g("reg-skills").value.trim(),
 experience: g("reg-experience").value,
 preferredRole: g("reg-preferredRole").value,
 preferredIndustry: g("reg-preferredIndustry").value,
 location: g("reg-location").value.trim(),
 resumeName: State.profile.resumeName || ""
 };
}

async function submitRegister() {
 collectProfileFromForm();
 const p = State.profile;
 const missing = [];
 if (!p.fullName) missing.push("full name");
 if (!p.email) missing.push("email");
 if (!p.degree) missing.push("degree");
 if (!p.skills) missing.push("skills");
 if (!p.experience) missing.push("experience level");
 if (!p.preferredRole) missing.push("preferred job role");
 if (!p.preferredIndustry) missing.push("preferred industry");

 const errEl = document.getElementById("reg-error");
 if (missing.length) {
 errEl.textContent = `Please fill in: ${missing.join(", ")}.`;
 errEl.style.display = "flex";
 return;
 }
 errEl.style.display = "none";

 /* ---- Firebase: save this candidate under candidates/<uniquePushId> ---- */
 const submitBtn = document.getElementById("reg-submit");
 const originalBtnLabel = submitBtn ? submitBtn.textContent : "";
 if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Saving..."; }

 try {
 if (typeof window.saveCandidateToFirebase !== "function") {
 throw new Error("Firebase is not connected. Paste your Firebase config into the <script type=\"module\"> block near the bottom of preview.html.");
 }
 const best = rankedMatches(p)[0];
 const matchScore = best ? best.score : 0;
 await window.saveCandidateToFirebase({
 name: p.fullName,
 email: p.email,
 phone: p.phone,
 skills: p.skills,
 qualification: p.degree,
 interest: p.preferredRole,
 preferredIndustry: p.preferredIndustry,
 college: p.college,
 gradYear: p.gradYear,
 location: p.location,
 matchScore: matchScore,
 registeredAt: new Date().toISOString()
 });
 } catch (err) {
 console.error("Firebase save failed:", err);
 errEl.textContent = "Could not save your registration to the server (" + (err && err.message ? err.message : "unknown error") + "). Please check your connection and try again.";
 errEl.style.display = "flex";
 if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnLabel; }
 return;
 }

 if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnLabel; }

 registerCandidateInTable(p);
 setView("analysis");
}

function registerCandidateInTable(p) {
 const best = rankedMatches(p)[0];
 const match = best ? best.score : 0;
 const row = {
 email: p.email,
 name: p.fullName,
 skills: p.skills,
 qual: p.degree,
 match,
 status: "New"
 };
 const existingIdx = CANDIDATE_TABLE.findIndex(c => c.email && c.email === p.email);
 if (existingIdx >= 0) CANDIDATE_TABLE[existingIdx] = row;
 else CANDIDATE_TABLE.push(row);
 saveToStorage("fm_candidates", CANDIDATE_TABLE);
}

/* ================= candidate: analysis ================= */

function renderAnalysis() {
 setTimeout(() => {
 const container = document.getElementById("analysis-container");
 if (container) container.innerHTML = analysisResultsHtml();
 }, 1300);
 return `
 <section class="analysis-page" id="analysis-container">
 <div class="analysis-loading">
 <div class="spinner"></div>
 <h2>Reading your resume\u2026</h2>
 <p class="section-lede">Extracting skills, qualification, experience and career interests.</p>
 </div>
 </section>
 `;
}

function analysisResultsHtml() {
 const p = State.profile;
 const skills = (p.skills || SAMPLE_PROFILE.skills).split(",").map(s => s.trim()).filter(Boolean);
 const strength = Math.min(96, 58 + skills.length * 8);
 const chips = skills.map(s => `<span class="chip">${esc(s)}</span>`).join("");
 return `
 <span class="pill pill-violet">${iconSvg("sparkle",13)} resume analysis</span>
 <h1>Here's what we found, ${esc(p.fullName || "there")}</h1>
 <div class="analysis-grid">
 <div class="panel"><h3>Skills detected</h3><div class="chip-row">${chips}</div></div>
 <div class="panel">
 <h3>Qualification</h3><p class="big-line">${esc(p.degree || SAMPLE_PROFILE.degree)}</p>
 <h3 style="margin-top:16px">Experience</h3><p class="big-line">${esc(p.experience)}</p>
 </div>
 <div class="panel"><h3>Career interest</h3><p class="big-line">${esc(p.preferredRole)} \u00b7 ${esc(p.preferredIndustry)}</p></div>
 <div class="panel panel-center">
 <h3>Profile strength</h3>
 ${scoreRingSvg(strength,112)}
 <p class="muted-small">Based on how complete and specific your profile is.</p>
 </div>
 </div>
 <div class="form-foot"><button class="btn btn-primary" onclick="setView('matches')">See my company matches</button></div>
 `;
}

/* ================= candidate: matches ================= */

function renderMatches() {
 const ranked = rankedMatches(State.profile);
 const rows = ranked.map(({company, score, matched}) => {
 const tier = tierOf(score);
 const chips = company.skills.map(s => {
 const on = matched.includes(s);
 return `<span class="chip ${on?"chip-on":"chip-off"}">${esc(s)}${on?" \u2713":""}</span>`;
 }).join("");
 return `
 <div class="match-row">
 <div class="match-row-left">
 ${scoreRingSvg(score,64,6)}
 <div>
 <h3>${esc(company.role)}</h3>
 <p class="muted-small">${esc(company.name)} \u00b7 Booth ${esc(company.booth)}</p>
 <div class="chip-row">${chips}</div>
 </div>
 </div>
 <div><span class="tier-tag" style="color:${tier.color};border-color:${tier.color}">${tier.label}</span></div>
 </div>`;
 }).join("");
 return `
 <section class="matches-page">
 <span class="pill pill-blue">Your top matches</span>
 <h1>Ranked for ${esc(State.profile.fullName || "your")} profile</h1>
 <p class="section-lede">Weighted from skills (50%), qualification (20%), experience (15%) and role fit (15%).</p>
 <div class="match-list">${rows}</div>
 <div class="form-foot"><button class="btn btn-primary" onclick="setView('schedule')">Build my visit schedule</button></div>
 </section>
 `;
}

/* ================= candidate: schedule ================= */

function renderSchedule() {
 const top3 = rankedMatches(State.profile).slice(0,3);
 const rows = top3.map(({company, score}, i) => {
 const tone = score>=90?"green":score>=75?"blue":"amber";
 return `
 <div class="schedule-row">
 <div class="schedule-time">${iconSvg("clock",16)} ${SLOTS[i]}</div>
 <div class="schedule-mid"><h3>${esc(company.name)}</h3><p class="muted-small">${esc(company.role)} \u00b7 ${esc(company.industry)}</p></div>
 <div class="schedule-right">
 <span class="pill pill-${tone}">${score}% match</span>
 <span class="muted-small">${iconSvg("pin",12)} Booth ${esc(company.booth)}</span>
 </div>
 </div>`;
 }).join("");
 return `
 <section class="schedule-page">
 <span class="pill pill-teal">${iconSvg("shield",13)} Smart crowd filtering</span>
 <h1>Your visit schedule</h1>
 <p class="section-lede">Spaced out across the morning so you're never queuing at two booths at once, and so no single booth gets flooded.</p>
 <div class="schedule-list">${rows}</div>
 <div class="note-band">Your visit schedule has been optimised to reduce waiting time and spread out booth crowding.</div>
 <div class="form-foot"><button class="btn btn-primary" onclick="setView('pass')">Generate my job fair pass</button></div>
 </section>
 `;
}

/* ================= candidate: pass ================= */

function renderPass() {
 const top3 = rankedMatches(State.profile).slice(0,3);
 const name = State.profile.fullName || SAMPLE_PROFILE.fullName;
 let h = 7;
 for (let i=0;i<name.length;i++) h = (h*31 + name.charCodeAt(i)) % 1000000;
 const id = "FMA-" + String(Math.abs(h)).padStart(6,"0").slice(0,6);
 const rows = top3.map(({company}, i) =>
 `<div class="pass-company-row"><span>${esc(company.name)}</span><span class="muted-small">${SLOTS[i]} \u00b7 Booth ${esc(company.booth)}</span></div>`
 ).join("");
 return `
 <section class="pass-page">
 <h1>Your digital job fair pass</h1>
 <div class="pass-card">
 <div class="pass-top"><span>Job Fair 2026</span><span class="pass-verified">${iconSvg("check",14,"var(--green)")} Verified candidate</span></div>
 <div class="pass-body">
 <div class="pass-info">
 <p class="pass-name">${esc(name)}</p>
 <p class="muted-small">Candidate ID ${id}</p>
 <div class="pass-companies">${rows}</div>
 </div>
 <div class="pass-qr">${pseudoQrSvg(id)}<span class="muted-small">${id}</span></div>
 </div>
 </div>
 </section>
 `;
}

/* ================= role login (demo) ================= */

function roleLoginHtml(opts) {
 return `
 <section class="form-page login-page">
 <div class="form-head" style="text-align:center">
 <span class="pill ${opts.pillClass}" style="margin:0 auto">${iconSvg(opts.icon,13)} ${opts.pillLabel}</span>
 <h1>${opts.title}</h1>
 <p class="section-lede" style="margin-left:auto;margin-right:auto">${opts.lede}</p>
 </div>
 <div class="form-card login-card">
 <div class="field">
 <span class="field-label">Username</span>
 <input id="${opts.prefix}-login-user" placeholder="${opts.userHint}" onkeydown="if(event.key==='Enter')${opts.submitFn}()"/>
 </div>
 <div class="field" style="margin-top:14px">
 <span class="field-label">Password</span>
 <input id="${opts.prefix}-login-pass" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" onkeydown="if(event.key==='Enter')${opts.submitFn}()"/>
 </div>
 <p class="muted-small" id="${opts.prefix}-login-error" style="color:var(--rose);display:none;margin-top:12px"></p>
 <div class="form-foot" style="justify-content:flex-end">
 <button class="btn btn-primary" onclick="${opts.submitFn}()">Log in</button>
 </div>
 </div>
 </section>`;
}

function renderRecruiterLogin() {
 return roleLoginHtml({
 prefix:"recruiter", pillClass:"pill-teal", icon:"shield", pillLabel:"Recruiter access",
 title:"Recruiter sign in", lede:"Sign in to see candidates matched to your open roles.",
 userHint:"recruiter", submitFn:"attemptRecruiterLogin",
 demoUser: RECRUITER_CREDENTIALS.user, demoPass: RECRUITER_CREDENTIALS.pass
 });
}

function renderAdminLogin() {
 return roleLoginHtml({
 prefix:"admin", pillClass:"pill-violet", icon:"shield", pillLabel:"Admin access",
 title:"Admin sign in", lede:"Sign in to manage companies, booths and crowd levels.",
 userHint:"admin", submitFn:"attemptAdminLogin",
 demoUser: ADMIN_CREDENTIALS.user, demoPass: ADMIN_CREDENTIALS.pass
 });
}

function attemptRecruiterLogin() {
 const u = document.getElementById("recruiter-login-user").value.trim();
 const pw = document.getElementById("recruiter-login-pass").value;
 const errEl = document.getElementById("recruiter-login-error");
 if (u === RECRUITER_CREDENTIALS.user && pw === RECRUITER_CREDENTIALS.pass) {
 recruiterAuthed = true;
 sessionStorage.setItem("fm_recruiter_auth", "1");
 render();
 } else {
 errEl.textContent = "Incorrect username or password.";
 errEl.style.display = "block";
 }
}

function attemptAdminLogin() {
 const u = document.getElementById("admin-login-user").value.trim();
 const pw = document.getElementById("admin-login-pass").value;
 const errEl = document.getElementById("admin-login-error");
 if (u === ADMIN_CREDENTIALS.user && pw === ADMIN_CREDENTIALS.pass) {
 adminAuthed = true;
 sessionStorage.setItem("fm_admin_auth", "1");
 render();
 } else {
 errEl.textContent = "Incorrect username or password.";
 errEl.style.display = "block";
 }
}

function logoutRecruiter() {
 recruiterAuthed = false;
 sessionStorage.removeItem("fm_recruiter_auth");
 setView("landing");
}

function logoutAdmin() {
 adminAuthed = false;
 sessionStorage.removeItem("fm_admin_auth");
 setView("landing");
}

/* ================= recruiter dashboard ================= */

let recruiterFilters = { skill:"All", status:"All" };

function renderRecruiter() {
 const skills = ["All", ...new Set(CANDIDATE_TABLE.flatMap(c => c.skills.split(", ")))];
 const statuses = ["All","Shortlisted","Reviewing","New"];
 const total = CANDIDATE_TABLE.length;
 const aiMatched = CANDIDATE_TABLE.filter(c => c.match >= 60).length;
 const shortlisted = CANDIDATE_TABLE.filter(c => c.status === "Shortlisted").length;
 return `
 <section class="dash-page">
 <div class="dash-page-head">
 <span class="pill pill-teal">Recruiter dashboard</span>
 <button class="btn btn-ghost" onclick="logoutRecruiter()">Log out</button>
 </div>
 <h1>Candidates for your open roles</h1>
 <div class="stat-row">
 <div class="stat-card">${iconSvg("users",18,"var(--teal)")}<span class="stat-num">${total}</span><span class="stat-label">Total candidates</span></div>
 <div class="stat-card">${iconSvg("sparkle",18,"var(--teal)")}<span class="stat-num">${aiMatched}</span><span class="stat-label">Matched candidates</span></div>
 <div class="stat-card">${iconSvg("check",18,"var(--teal)")}<span class="stat-num">${shortlisted}</span><span class="stat-label">Shortlisted</span></div>
 <div class="stat-card">${iconSvg("doc",18,"var(--teal)")}<span class="stat-num">${total}</span><span class="stat-label">Applications</span></div>
 </div>
 <div class="chart-grid">
 <div class="panel"><h3>Candidates by skill</h3><div class="chart-box"><canvas id="chart-skills"></canvas></div></div>
 <div class="panel"><h3>Match score distribution</h3><div class="chart-box"><canvas id="chart-match"></canvas></div></div>
 <div class="panel panel-wide"><h3>Registrations over time</h3><div class="chart-box"><canvas id="chart-reg"></canvas></div></div>
 </div>
 <div class="panel">
 <div class="table-head">
 <h3>Candidate list</h3>
 <div class="filter-row">
 ${iconSvg("filter",14,"var(--ink-dim)")}
 <select id="filter-skill" onchange="updateRecruiterTable()">${skills.map(s=>`<option ${s===recruiterFilters.skill?"selected":""}>${s}</option>`).join("")}</select>
 <select id="filter-status" onchange="updateRecruiterTable()">${statuses.map(s=>`<option ${s===recruiterFilters.status?"selected":""}>${s}</option>`).join("")}</select>
 </div>
 </div>
 <table class="table">
 <thead><tr><th>Candidate</th><th>Skills</th><th>Qualification</th><th>Match</th><th>Status</th></tr></thead>
 <tbody id="candidate-tbody">${candidateRowsHtml()}</tbody>
 </table>
 </div>
 </section>
 `;
}

function candidateRowsHtml() {
 const rows = CANDIDATE_TABLE.filter(c =>
 (recruiterFilters.skill==="All" || c.skills.includes(recruiterFilters.skill)) &&
 (recruiterFilters.status==="All" || c.status===recruiterFilters.status)
 );
 if (!rows.length) return `<tr><td colspan="5" class="muted-small">No candidates match these filters.</td></tr>`;
 return rows.map(r => `
 <tr>
 <td>${esc(r.name)}</td>
 <td class="muted-small">${esc(r.skills)}</td>
 <td class="muted-small">${esc(r.qual)}</td>
 <td><span style="color:${tierOf(r.match).color};font-family:'Space Grotesk'">${r.match}%</span></td>
 <td><span class="status status-${r.status.toLowerCase()}">${r.status}</span></td>
 </tr>`).join("");
}

function updateRecruiterTable() {
 recruiterFilters.skill = document.getElementById("filter-skill").value;
 recruiterFilters.status = document.getElementById("filter-status").value;
 document.getElementById("candidate-tbody").innerHTML = candidateRowsHtml();
}

function destroyRecruiterCharts() {
 recruiterCharts.forEach(c => c.destroy());
 recruiterCharts = [];
}

function initRecruiterCharts() {
 destroyRecruiterCharts();
 const gridColor = "#2A3350", inkDim = "#93A0C4";
 const commonScales = {
 x: { ticks: { color: inkDim, font: { size: 11 } }, grid: { color: "transparent" } },
 y: { ticks: { color: inkDim, font: { size: 11 } }, grid: { color: gridColor } }
 };
 const c1 = new Chart(document.getElementById("chart-skills"), {
 type: "bar",
 data: { labels: SKILL_DIST.map(d=>d[0]), datasets: [{ data: SKILL_DIST.map(d=>d[1]), backgroundColor: "#2DD4C8", borderRadius: 4 }] },
 options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales: commonScales }
 });
 const c2 = new Chart(document.getElementById("chart-match"), {
 type: "bar",
 data: { labels: MATCH_DIST.map(d=>d[0]), datasets: [{ data: MATCH_DIST.map(d=>d[1]), backgroundColor: "#5B7CFA", borderRadius: 4 }] },
 options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales: commonScales }
 });
 const c3 = new Chart(document.getElementById("chart-reg"), {
 type: "line",
 data: { labels: REG_OVER_TIME.map(d=>d[0]), datasets: [{ data: REG_OVER_TIME.map(d=>d[1]), borderColor:"#A78BFA", backgroundColor:"transparent", tension:0.35, pointRadius:0, borderWidth:2.5 }] },
 options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales: commonScales }
 });
 recruiterCharts = [c1,c2,c3];
}

/* ================= admin dashboard ================= */

let adminEditingId = null;
let adminTab = "overview";
let adminAddingNew = false;
const CROWD_LEVEL_COLOR = { green:"var(--green)", amber:"var(--amber)", red:"var(--rose)" };
const CROWD_LEVEL_LABEL = { green:"Low crowd", amber:"Moderate crowd", red:"High crowd" };

function setAdminTab(tab) {
 adminTab = tab;
 adminEditingId = null;
 adminAddingNew = false;
 render();
}

function renderAdmin() {
 const overcrowded = COMPANIES.find(c => c.crowdLevel === "red");
 const boothCards = COMPANIES.map(c => c.id === adminEditingId ? editBoothCardHtml(c) : boothCardHtml(c)).join("");

 const registeredCount = CANDIDATE_TABLE.length;
 const scheduledCount = CANDIDATE_TABLE.filter(c => c.match >= 60).length;
 const avgCrowd = COMPANIES.length
 ? Math.round(COMPANIES.reduce((sum, c) => sum + c.crowd, 0) / COMPANIES.length)
 : 0;
 const avgMatch = registeredCount
 ? Math.round(CANDIDATE_TABLE.reduce((sum, c) => sum + c.match, 0) / registeredCount)
 : 0;

 const statRow = [
 [registeredCount.toLocaleString(), "Registered candidates"],
 [COMPANIES.length.toLocaleString(), "Companies"],
 [scheduledCount.toLocaleString(), "Candidates scheduled"],
 [avgCrowd + "%", "Current crowd"],
 [avgMatch + "%", "Average match score"]
 ].map(([n,l]) => `<div class="stat-card">${iconSvg("trend",18,"var(--violet)")}<span class="stat-num">${n}</span><span class="stat-label">${l}</span></div>`).join("");

 const tabs = [["overview","Overview","grid"],["booths","Companies & booths","brief"]];
 const tabBar = `
 <div class="admin-tabbar">
 ${tabs.map(([id,label,icon]) => `
 <button class="admin-tab ${adminTab===id?"active":""}" onclick="setAdminTab('${id}')">
 ${iconSvg(icon,16)}<span>${label}</span>
 </button>`).join("")}
 </div>`;

 const overviewPanel = `
 <div class="stat-row">${statRow}</div>
 <p class="muted-small" style="margin-top:10px">Scheduled = candidates with a 60%+ match to at least one booth \u00b7 Current crowd = average booth fill level across all companies.</p>
 ${overcrowded ? `<div class="alert-band">${iconSvg("alert",18)} High crowd detected at ${esc(overcrowded.name)} (Booth ${esc(overcrowded.booth)}). Candidates are being redirected to alternative time slots.</div>` : ""}
 <div class="panel">
 <h3>Crowd snapshot</h3>
 <p class="muted-small" style="margin-top:2px">Live booth crowd levels across the venue \u2014 switch to Companies &amp; booths to manage each listing.</p>
 <div class="booth-list">${COMPANIES.map(c => `
 <div class="crowd-mini-row">
 <span class="booth-dot" style="background:${CROWD_LEVEL_COLOR[c.crowdLevel]}"></span>
 <span class="crowd-mini-name">${esc(c.name)} <span class="muted-small" style="display:inline">Booth ${esc(c.booth)}</span></span>
 <div class="booth-bar-track" style="max-width:160px"><div class="booth-bar-fill" style="width:${c.crowd}%;background:${CROWD_LEVEL_COLOR[c.crowdLevel]}"></div></div>
 <span class="muted-small" style="min-width:110px;text-align:right">${CROWD_LEVEL_LABEL[c.crowdLevel]}</span>
 </div>`).join("")}</div>
 </div>`;

 const boothsPanel = `
 <div class="panel">
 <div class="table-head">
 <div>
 <h3>Companies &amp; booths</h3>
 <p class="muted-small" style="margin-top:4px">Edit a company's name, job description or eligibility criteria \u2014 changes apply immediately to candidate matching.</p>
 </div>
 ${!adminAddingNew ? `<button class="btn btn-primary" onclick="startAddBooth()">${iconSvg("sparkle",14)} Add company</button>` : ""}
 </div>
 <div class="booth-list">
 ${adminAddingNew ? newBoothFormHtml() : ""}
 ${boothCards}
 </div>
 </div>`;

 return `
 <section class="dash-page">
 <div class="dash-page-head">
 <span class="pill pill-violet">Admin \u00b7 crowd management</span>
 <button class="btn btn-ghost" onclick="logoutAdmin()">Log out</button>
 </div>
 <h1>Event overview</h1>
 ${tabBar}
 ${adminTab === "booths" ? boothsPanel : overviewPanel}
 </section>
 `;
}

function boothCardHtml(c) {
 const color = CROWD_LEVEL_COLOR[c.crowdLevel];
 return `
 <div class="booth-card">
 <div class="booth-card-head">
 <span class="booth-dot" style="background:${color}"></span>
 <div class="booth-card-title">
 <span class="booth-name">${esc(c.name)}</span>
 <span class="muted-small">Booth ${esc(c.booth)} \u00b7 ${esc(c.role)}</span>
 </div>
 <button class="btn btn-ghost booth-edit-btn" onclick="startEditBooth('${c.id}')">Edit</button>
 </div>
 <p class="booth-desc">${esc(c.description || "No job description added yet.")}</p>
 <div class="booth-elig-row">
 <span class="elig-chip"><span class="elig-chip-label">Qualification</span>${esc(c.qualAccepts.join(", "))}</span>
 <span class="elig-chip"><span class="elig-chip-label">Experience</span>${esc(c.experienceAccepts.join(", "))}</span>
 <span class="elig-chip"><span class="elig-chip-label">Skills</span>${esc(c.skills.join(", "))}</span>
 </div>
 <div class="booth-crowd-row">
 <div class="booth-bar-track"><div class="booth-bar-fill" style="width:${c.crowd}%;background:${color}"></div></div>
 <span class="muted-small" style="min-width:110px;text-align:right">${CROWD_LEVEL_LABEL[c.crowdLevel]}</span>
 </div>
 </div>`;
}

function editBoothCardHtml(c) {
 return `
 <div class="booth-card">
 <div class="booth-card-head">
 <span class="booth-dot" style="background:${CROWD_LEVEL_COLOR[c.crowdLevel]}"></span>
 <div class="booth-card-title"><span class="booth-name">Editing ${esc(c.name)}</span><span class="muted-small">Booth ${esc(c.booth)}</span></div>
 </div>
 <div class="edit-form" style="margin-top:14px">
 ${fieldHtml("", "Company name", `<input id="edit-name-${c.id}" value="${esc(c.name)}"/>`)}
 ${fieldHtml("", "Job description", `<textarea id="edit-desc-${c.id}">${esc(c.description || "")}</textarea>`)}
 <div class="edit-form-grid">
 <label class="field">
 <span class="field-label">Eligible qualifications</span>
 <input id="edit-qual-${c.id}" value="${esc(c.qualAccepts.join(", "))}"/>
 <span class="field-hint">Comma-separated, e.g. B.Tech, BCA, MCA</span>
 </label>
 <label class="field">
 <span class="field-label">Eligible experience levels</span>
 <input id="edit-exp-${c.id}" value="${esc(c.experienceAccepts.join(", "))}"/>
 <span class="field-hint">Comma-separated, e.g. Fresher, 0-1 years</span>
 </label>
 </div>
 <label class="field">
 <span class="field-label">Required skills</span>
 <input id="edit-skills-${c.id}" value="${esc(c.skills.join(", "))}"/>
 <span class="field-hint">Comma-separated, used to score candidate matches</span>
 </label>
 <div class="edit-form-actions">
 <button class="btn btn-outline" onclick="cancelEditBooth()">Cancel</button>
 <button class="btn btn-primary" onclick="saveEditBooth('${c.id}')">Save changes</button>
 </div>
 </div>
 </div>`;
}

function startEditBooth(id) {
 adminEditingId = id;
 adminAddingNew = false;
 render();
}

function cancelEditBooth() {
 adminEditingId = null;
 render();
}

function saveEditBooth(id) {
 const company = COMPANIES.find(c => c.id === id);
 if (!company) return;
 const g = key => document.getElementById(`edit-${key}-${id}`).value;
 const name = g("name").trim();
 const skills = g("skills").split(",").map(s => s.trim()).filter(Boolean);
 const qualAccepts = g("qual").split(",").map(s => s.trim()).filter(Boolean);
 const experienceAccepts = g("exp").split(",").map(s => s.trim()).filter(Boolean);
 company.name = name || company.name;
 company.description = g("desc").trim();
 if (skills.length) company.skills = skills;
 if (qualAccepts.length) company.qualAccepts = qualAccepts;
 if (experienceAccepts.length) company.experienceAccepts = experienceAccepts;
 saveToStorage("fm_companies", COMPANIES);
 adminEditingId = null;
 render();
}

function newBoothFormHtml() {
 return `
 <div class="booth-card booth-card-new">
 <div class="booth-card-head">
 <span class="booth-dot" style="background:var(--blue)"></span>
 <div class="booth-card-title"><span class="booth-name">Add a new company</span><span class="muted-small">Appears in candidate matching immediately after saving</span></div>
 </div>
 <div class="edit-form" style="margin-top:14px">
 <div class="edit-form-grid">
 <label class="field">
 <span class="field-label">Company name</span>
 <input id="new-name" placeholder="e.g. Skyline Robotics"/>
 </label>
 <label class="field">
 <span class="field-label">Booth number</span>
 <input id="new-booth" placeholder="e.g. G-21"/>
 </label>
 </div>
 <div class="edit-form-grid">
 <label class="field">
 <span class="field-label">Job role</span>
 <input id="new-role" placeholder="e.g. QA Engineer"/>
 </label>
 <label class="field">
 <span class="field-label">Industry</span>
 <input id="new-industry" placeholder="e.g. IT"/>
 </label>
 </div>
 ${fieldHtml("", "Job description", `<textarea id="new-desc" placeholder="What will this candidate actually do in the role?"></textarea>`)}
 <div class="edit-form-grid">
 <label class="field">
 <span class="field-label">Eligible qualifications</span>
 <input id="new-qual" placeholder="B.Tech, BCA, MCA"/>
 <span class="field-hint">Comma-separated, e.g. B.Tech, BCA, MCA</span>
 </label>
 <label class="field">
 <span class="field-label">Eligible experience levels</span>
 <input id="new-exp" placeholder="Fresher, 0-1 years"/>
 <span class="field-hint">Comma-separated, e.g. Fresher, 0-1 years</span>
 </label>
 </div>
 <div class="edit-form-grid">
 <label class="field">
 <span class="field-label">Required skills</span>
 <input id="new-skills" placeholder="Python, SQL, Excel"/>
 <span class="field-hint">Comma-separated, used to score candidate matches</span>
 </label>
 <label class="field">
 <span class="field-label">Starting crowd level</span>
 <select id="new-crowdLevel">
 <option value="green">Low crowd</option>
 <option value="amber">Moderate crowd</option>
 <option value="red">High crowd</option>
 </select>
 </label>
 </div>
 <span class="muted-small" id="new-booth-error" style="color:var(--rose);display:none"></span>
 <div class="edit-form-actions">
 <button class="btn btn-outline" onclick="cancelAddBooth()">Cancel</button>
 <button class="btn btn-primary" onclick="saveNewBooth()">Add company</button>
 </div>
 </div>
 </div>`;
}

function startAddBooth() {
 adminAddingNew = true;
 adminEditingId = null;
 render();
}

function cancelAddBooth() {
 adminAddingNew = false;
 render();
}

function saveNewBooth() {
 const g = id => document.getElementById(id).value.trim();
 const name = g("new-name");
 const booth = g("new-booth");
 const role = g("new-role");
 const industry = g("new-industry");
 const skills = g("new-skills").split(",").map(s => s.trim()).filter(Boolean);
 const qualAccepts = g("new-qual").split(",").map(s => s.trim()).filter(Boolean);
 const experienceAccepts = g("new-exp").split(",").map(s => s.trim()).filter(Boolean);
 const crowdLevel = document.getElementById("new-crowdLevel").value;

 const errEl = document.getElementById("new-booth-error");
 const missing = [];
 if (!name) missing.push("company name");
 if (!booth) missing.push("booth number");
 if (!role) missing.push("job role");
 if (!industry) missing.push("industry");
 if (!skills.length) missing.push("required skills");
 if (!qualAccepts.length) missing.push("eligible qualifications");
 if (!experienceAccepts.length) missing.push("eligible experience levels");
 if (missing.length) {
 errEl.textContent = `Please fill in: ${missing.join(", ")}.`;
 errEl.style.display = "block";
 return;
 }

 let id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company";
 if (COMPANIES.some(c => c.id === id)) id = id + "-" + Math.random().toString(36).slice(2, 6);

 const crowd = crowdLevel === "red" ? 90 : crowdLevel === "amber" ? 60 : 25;

 COMPANIES.push({
 id, name, booth, role, industry,
 description: g("new-desc"),
 skills, qualAccepts, experienceAccepts,
 crowd, crowdLevel
 });
 saveToStorage("fm_companies", COMPANIES);

 adminAddingNew = false;
 render();
}

/* ================= router ================= */

function setView(view) {
 State.view = view;
 render();
 window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function render() {
 renderNav();
 const app = document.getElementById("app");
 destroyRecruiterCharts();
 switch (State.view) {
 case "landing": app.innerHTML = renderLanding(); break;
 case "register": app.innerHTML = renderRegister(); break;
 case "analysis": app.innerHTML = renderAnalysis(); break;
 case "matches": app.innerHTML = renderMatches(); break;
 case "schedule": app.innerHTML = renderSchedule(); break;
 case "pass": app.innerHTML = renderPass(); break;
 case "recruiter":
 if (recruiterAuthed) { app.innerHTML = renderRecruiter(); setTimeout(initRecruiterCharts, 0); }
 else app.innerHTML = renderRecruiterLogin();
 break;
 case "admin":
 app.innerHTML = adminAuthed ? renderAdmin() : renderAdminLogin();
 break;
 default: app.innerHTML = renderLanding();
 }
}

render();
