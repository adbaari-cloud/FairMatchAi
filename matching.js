/* ================= scoring ================= */

const SCORING_SIGNALS = ["Skills match","Qualification fit","Experience fit","Role & industry fit"];

function scoreMatch(candidate, company) {
 const candSkills = candidate.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
 const reqSkills = company.skills.map(s => s.toLowerCase());
 const matched = company.skills.filter(s => candSkills.includes(s.toLowerCase()));
 const skillPct = reqSkills.length ? matched.length / reqSkills.length : 0;
 const qualPct = company.qualAccepts.some(q => candidate.degree.toLowerCase().includes(q.toLowerCase())) ? 1 : 0.5;
 const expPct = company.experienceAccepts.includes(candidate.experience) ? 1 : 0.45;
 const rolePct = candidate.preferredRole === company.role ? 1 : (candidate.preferredIndustry === company.industry ? 0.7 : 0.3);
 const final = skillPct*0.5 + qualPct*0.2 + expPct*0.15 + rolePct*0.15;
 return { score: Math.max(28, Math.round(final*100)), matched };
}

function rankedMatches(profile) {
 const p = profile.skills ? profile : SAMPLE_PROFILE;
 return COMPANIES.map(c => Object.assign({ company:c }, scoreMatch(p, c))).sort((a,b) => b.score - a.score);
}

function tierOf(score) {
 if (score >= 90) return { label:"Strong match", color:"var(--green)" };
 if (score >= 75) return { label:"Good match", color:"var(--blue)" };
 if (score >= 60) return { label:"Fair match", color:"var(--amber)" };
 return { label:"Low match", color:"var(--ink-dim)" };
}
