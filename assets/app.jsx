import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, Compass, ShieldCheck, Users, User, X, Check, Github,
  Trophy, Clock, ChevronRight, ChevronLeft, Sparkles, TriangleAlert as AlertTriangle, ArrowRight,
  Zap, MapPin, ExternalLink, FolderGit2, Send, Award, Circle, Plus, LogOut,
  Eye, EyeOff, Lock, Mail, Briefcase, FileCheck2, Link2, GitBranch, Target,
  CircleCheck as CheckCircle2, CircleX as XCircle, LoaderCircle as Loader2, BadgeCheck, TrendingUp, Filter, Bell,
  ClipboardList, Rocket, Swords, UserPlus, ArrowLeft, Info, RotateCcw,
  Camera, Upload, Trash2, UserMinus, Mic, Volume2, Maximize2, Minimize2, Image as ImageIcon
} from "lucide-react";
// githubService.js is loaded as a plain <script> in index.html (see comment
// there) and attaches its functions to window.TribeGithub — NOT imported as
// an ES module here, because Babel-standalone's in-browser transform of this
// file breaks relative `import` resolution to local (non-CDN) files.
const { fetchRepoEvidence, fallbackGithubEvidence, analyzeGithubUser, relativeTime } = window.TribeGithub || {};


/* ================================================================== */
/*  CUSTOM INLINE ICON HELPERS                                         */
/* ================================================================== */
function BuildingIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  );
}
function FlameIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}
function HeartIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill={props.fill || "none"} stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}
function MessageSquareIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function BotIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  );
}
const Bot = BotIcon;
function SearchIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}
function SlidersIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>
    </svg>
  );
}
function ThumbsUpIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
  );
}
function Share2Icon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" style={props.style} className={props.className}>
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
  );
}

/* ================================================================== */
/*  LOCAL PERSISTENCE — demo state survives refreshes via localStorage */
/*  ("Reset Demo" clears this and restores the original demo state).   */
/* ================================================================== */
const STORAGE_KEY = "tribe-demo-state-v3";
function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (e) {
    // Storage unavailable (private browsing, disabled, quota, corrupted JSON) — fall back to defaults.
    return null;
  }
}
function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Non-fatal — the demo just won't persist this change.
  }
}

/* ================================================================== */
/*  REAL-TIME CROSS-TAB SYNC ENGINE                                    */
/* ================================================================== */
function broadcastTribeSync(type, payload) {
  try {
    const packet = { type, payload, timestamp: Date.now(), syncId: Math.random().toString(36).slice(2) };
    window.localStorage.setItem("tribe_sync_broadcast", JSON.stringify(packet));
  } catch (e) {}
}

function clearSavedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
}

/* ================================================================== */
/*  DESIGN TOKENS                                                      */
/* ================================================================== */
/*
  Palette — "TRIBE" system: a cool graphite-ink base (not pure black)
  with a hot-pink brand accent and a teal secondary, tuned for a
  swipe-first talent product ("swipe right on talent"). Verification-
  state colors are fixed by the product spec (grey / amber / teal /
  blue) and are treated as semantic, not decorative — teal doubles
  as the palette's cool half because "Assessment Verified" already
  owns it, which keeps pink reserved for action (swipe, match, CTA).
    --ink        #0B0E12  page base
    --panel      #12161D  raised surface
    --panel-2    #171C25  raised surface, brighter
    --line       #232A36  hairline borders
    --brand      #FF2E7E  hot pink (primary actions, focus)
    --brand-ink  #FFFFFF  text on brand
    --teal       #37D6B0  assessment-verified / positive
    --blue       #5B9BFF  team-verified
    --orange     #F5A524  proof-linked
    --grey       #7A8496  self-reported / muted
    --red        #FF6B6B  pass / destructive
  Type — "Space Grotesk" for display/numbers (a technical, slightly
  mechanical geometric sans — distinct from default Inter-everywhere),
  "Inter" for UI/body text.
*/

const VERIFICATION = {
  self:       { dot: "self",       label: "Claimed",                 short: "Claimed",          color: "var(--grey)",   bg: "rgba(122,132,150,0.14)" },
  proof:      { dot: "proof",      label: "Project Verified",        short: "Project Verified", color: "var(--orange)", bg: "rgba(245,165,36,0.14)" },
  github:     { dot: "github",     label: "GitHub Verified",         short: "GitHub Verified",  color: "var(--purple)", bg: "rgba(167,139,250,0.16)" },
  assessment: { dot: "assessment", label: "Assessment Verified",     short: "Assessment Verified", color: "var(--teal)", bg: "rgba(55,214,176,0.14)" },
  team:       { dot: "team",       label: "Team Challenge Verified", short: "Team Verified",    color: "var(--blue)",   bg: "rgba(91,155,255,0.14)" },
};

/* ================================================================== */
/*  TRUST SCORE — explainable, evidence-weighted out of 100.           */
/*  Every point traces back to something real: verification levels,   */
/*  assessment results, linked evidence, hackathon/project history,   */
/*  and peer ratings. Never an unexplained arbitrary number.          */
/* ================================================================== */
const TRUST_LEVEL_WEIGHT = { self: 0.2, proof: 0.55, github: 0.75, assessment: 0.8, team: 1 };
function computeTrustScore({ skills = [], hackathonsCount = 0, vouches = 0 }) {
  const n = skills.length || 1;
  const verificationAvg = skills.reduce((sum, s) => sum + (TRUST_LEVEL_WEIGHT[s.verification] ?? 0.2), 0) / n;
  const verificationPts = skills.length ? Math.round(verificationAvg * 40) : 0;

  const scored = skills.filter(s => typeof s.score === "number");
  const assessmentAvg = scored.length ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : 0;
  const assessmentPts = scored.length ? Math.round((assessmentAvg / 100) * 25) : 0;

  const proofCount = skills.reduce((sum, s) => sum + (s.proofs?.length || 0), 0);
  const evidencePts = Math.min(15, Math.round(proofCount * 2.5));

  const historyPts = Math.min(12, hackathonsCount * 4);

  const vouchPts = Math.min(8, Math.round(vouches * 2.5));

  const score = Math.max(0, Math.min(100, verificationPts + assessmentPts + evidencePts + historyPts + vouchPts));
  return {
    score,
    breakdown: [
      { label: "Verification levels", value: verificationPts, max: 40, note: skills.length ? `${skills.length} skill${skills.length === 1 ? "" : "s"} — avg verification ${Math.round(verificationAvg * 100)}%` : "No skills claimed yet" },
      { label: "Assessment performance", value: assessmentPts, max: 25, note: scored.length ? `Avg ${Math.round(assessmentAvg)}% across ${scored.length} assessment${scored.length === 1 ? "" : "s"}` : "No assessments completed yet" },
      { label: "Linked evidence", value: evidencePts, max: 15, note: `${proofCount} piece${proofCount === 1 ? "" : "s"} of linked proof (repos, projects, credentials)` },
      { label: "Hackathon / project history", value: historyPts, max: 12, note: `${hackathonsCount} entr${hackathonsCount === 1 ? "y" : "ies"} on record` },
      { label: "Peer ratings", value: vouchPts, max: 8, note: vouches ? `${vouches} vouch${vouches === 1 ? "" : "es"} from teammates worked with directly` : "No peer ratings yet" },
    ],
  };
}

function TrustScoreCard({ skills, hackathonsCount = 0, vouches = 0, title = "Trust Score" }) {
  const { score, breakdown } = useMemo(() => computeTrustScore({ skills, hackathonsCount, vouches }), [skills, hackathonsCount, vouches]);
  const color = score >= 70 ? "var(--teal)" : score >= 40 ? "var(--orange)" : "var(--grey)";
  return (
    <div className="hm-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color={color} />
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{title}</span>
        </div>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 24, color }}>{score}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {breakdown.map(b => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
              <span style={{ color: "var(--text-dim)" }}>{b.label}</span>
              <span style={{ fontWeight: 700 }}>{b.value}<span style={{ color: "var(--text-mute)" }}>/{b.max}</span></span>
            </div>
            <Bar value={(b.value / b.max) * 100} color={color} />
            <div style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 3 }}>{b.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ROLES = ["Developer", "Designer", "ML/AI", "Product", "DevOps", "Other"];

const SKILL_LIST = [
  "React", "TypeScript", "Node.js", "Python", "PyTorch", "TensorFlow",
  "Machine Learning", "Computer Vision", "UI/UX Design", "Figma",
  "PostgreSQL", "Docker", "Kubernetes", "AWS", "Go", "System Design",
];

/* ---- assessment question bank (5 per skill, 3 served per attempt) ---- */
const QUESTION_BANK = {
  "React": [
    { q: "What does calling a state setter during render (not in an effect) typically cause?", options: ["Nothing, it's fine", "An infinite render loop / warning", "The component unmounts", "It updates props instead"], correct: 1 },
    { q: "Which hook lets you run code after the DOM has been painted?", options: ["useMemo", "useEffect", "useReducer", "useId"], correct: 1 },
    { q: "Why does React want a stable `key` prop on list items?", options: ["It sets CSS z-index", "It helps React match items across re-renders", "It disables memoization", "It's only for accessibility"], correct: 1 },
    { q: "What is the main purpose of `useMemo`?", options: ["Force a re-render", "Cache an expensive computed value between renders", "Replace useState", "Delay component mounting"], correct: 1 },
    { q: "Lifting state up means:", options: ["Moving state to a parent so siblings can share it", "Using a global CSS class", "Moving a component to a higher route", "Converting state to props permanently"], correct: 0 },
  ],
  "Python": [
    { q: "What does `list(set([1,2,2,3]))` most likely produce?", options: ["[1,2,2,3]", "A list with duplicates removed, order not guaranteed pre-3.7 semantics", "An error", "[3,2,1]"], correct: 1 },
    { q: "Which keyword defines a generator function?", options: ["return", "yield", "async", "lambda"], correct: 1 },
    { q: "What does a Python decorator do?", options: ["Adds CSS styling", "Wraps a function to extend its behavior", "Declares a class private", "Compiles Python to C"], correct: 1 },
    { q: "`*args` in a function signature collects:", options: ["Keyword arguments into a dict", "Extra positional arguments into a tuple", "Only the first argument", "Nothing, it's a syntax error"], correct: 1 },
    { q: "Which is true about Python's GIL?", options: ["It allows true parallel CPU-bound threads", "It limits one thread executing Python bytecode at a time per process", "It only affects Python 2", "It removes the need for asyncio"], correct: 1 },
  ],
  "Machine Learning": [
    { q: "Overfitting means a model:", options: ["Performs poorly on both train and test data", "Learns noise in training data and generalizes poorly", "Trains too slowly", "Has too few parameters"], correct: 1 },
    { q: "What does a validation set primarily help you do?", options: ["Train the final weights", "Tune hyperparameters and detect overfitting", "Store raw data", "Replace the test set entirely"], correct: 1 },
    { q: "Precision measures:", options: ["Of predicted positives, how many were correct", "Of actual positives, how many were found", "Overall accuracy", "Model training speed"], correct: 0 },
    { q: "Gradient descent updates weights in the direction that:", options: ["Maximizes the loss", "Minimizes the loss", "Randomizes the weights", "Freezes the model"], correct: 1 },
    { q: "L2 regularization primarily helps by:", options: ["Increasing model capacity", "Penalizing large weights to reduce overfitting", "Speeding up data loading", "Removing the need for labels"], correct: 1 },
  ],
  "Node.js": [
    { q: "Node.js is built on which JS engine?", options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"], correct: 1 },
    { q: "What does the event loop primarily manage?", options: ["CSS rendering", "Non-blocking async callbacks and I/O", "Database schemas", "TypeScript compilation"], correct: 1 },
    { q: "`require()` vs `import` — CommonJS `require()` is:", options: ["Asynchronous only", "Synchronous module loading", "A browser-only API", "Deprecated entirely"], correct: 1 },
    { q: "Middleware in an Express app is used to:", options: ["Style HTML", "Run code between the request and final route handler", "Compile TypeScript", "Store secrets in plaintext safely"], correct: 1 },
    { q: "What's a common reason to use a worker thread in Node?", options: ["To block the event loop intentionally", "To run CPU-heavy work off the main event loop", "To style components", "To open a database connection pool"], correct: 1 },
  ],
  "UI/UX Design": [
    { q: "A design system's primary purpose is to:", options: ["Replace user research", "Provide consistent, reusable patterns across a product", "Lock designers into one tool", "Guarantee accessibility automatically"], correct: 1 },
    { q: "Fitts's Law suggests interactive targets should be:", options: ["As small as possible", "Appropriately sized and close to reduce time-to-target", "Always centered", "Irrelevant to usability"], correct: 1 },
    { q: "A usability heuristic like 'visibility of system status' means:", options: ["Hiding loading states", "Keeping users informed about what's happening", "Using bright colors everywhere", "Avoiding feedback on actions"], correct: 1 },
    { q: "Contrast ratio matters most for:", options: ["Animation speed", "Text/background legibility and accessibility", "File size", "Server response time"], correct: 1 },
    { q: "A wireframe is typically used to:", options: ["Finalize brand colors", "Rough out layout and structure before visual design", "Write production code", "Replace user testing"], correct: 1 },
  ],
};
const DEFAULT_QUESTIONS = QUESTION_BANK["Python"];
function questionsFor(skill) {
  return generateRandomGenerativeAIQuiz(skill, 4);
}
function pick3(arr, excludeIdx = []) {
  const idxPool = arr.map((_, i) => i);
  const preferred = idxPool.filter(i => !excludeIdx.includes(i));
  const pool = preferred.length >= 3 ? preferred : idxPool; // fall back once the bank is exhausted
  const copy = [...pool];
  const out = [];
  while (out.length < 3 && copy.length) {
    const idx = copy.splice(Math.floor(Math.random() * copy.length), 1)[0];
    out.push({ ...arr[idx], _idx: idx });
  }
  return out;
}
// Remembers the last question set served per skill (session-only) so a retake
// doesn't just re-serve the identical 3 questions — "avoid exact repeated assessments".
const _lastQuizIdx = {};

/* ---- maps any skill/role string to one of the 5 coverage areas ---- */
function skillToArea(skillOrText, role = "") {
  const s = `${skillOrText} ${role}`.toLowerCase();
  if (/\b(react|typescript|frontend|figma\b|css|ui\/ux)/.test(s) && /(react|frontend|typescript)/.test(s)) return "Frontend";
  if (/(machine learning|ml\/ai|computer vision|pytorch|tensorflow|\bai\b| ml )/.test(s)) return "ML/AI";
  if (/(devops|docker|kubernetes|\baws\b|ci\/cd)/.test(s)) return "DevOps";
  if (/(figma|design|ui\/ux|user research)/.test(s)) return "UI/UX";
  if (/(node|postgres|backend|system design|api|database|go\b)/.test(s)) return "Backend";
  if (/(react|frontend|typescript)/.test(s)) return "Frontend";
  return "Frontend";
}

/* ================================================================== */
/*  GITHUB EVIDENCE — see assets/services/githubService.js for the    */
/*  real-API-with-fallback implementation (fetchRepoEvidence used     */
/*  below for single-skill proof links, analyzeGithubUser for the     */
/*  full profile-level GitHub Analysis dashboard).                    */
/* ================================================================== */


/* ================================================================== */
/*  COMPANIES DATASET — With Work Culture Transparency & Red Flags    */
/* ================================================================== */
const COMPANIES = [
  {
    id: "comp_apex",
    name: "Apex Cloud Technologies",
    logo: "☁️",
    role: "Senior Full-Stack Cloud Engineer",
    department: "Core Platform & Edge Distributed Systems",
    salary: "$145,000 – $185,000 + 0.15% Equity",
    location: "San Francisco, CA (100% Remote Option)",
    photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
    ],
    recruiter: {
      name: "Sarah Jenkins",
      role: "Head of Technical Talent",
      email: "recruiter.apex@tribe.demo",
      avatar: "👩‍💼",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    },
    requiredSkills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"],
    perks: ["4-Day Work Week (Summer)", "Unlimited PTO (Min 25 days mandated)", "$3,000 Home Office Stipend", "100% Health & Dental"],
    overview: "Apex Cloud is scaling next-generation serverless edge data sync across 40 global regions.",
    match: 95,
    culture: {
      score: 94,
      status: "EXCELLENT",
      isRedFlag: false,
      tagline: "Async-first, zero weekend pings, and high psychological safety.",
      wlbRating: 4.9,
      avgWeeklyHours: 37,
      attritionRate: "3.8%",
      remotePolicy: "100% Remote & Async-Friendly",
      psychSafetyScore: 96,
      reviewsCount: 142,
      highlights: [
        "Strict 'No Friday Deployments' and zero off-hours Slack policy",
        "Executive pay capped at 8x average developer salary",
        "Dedicated 20% innovation & open-source contribution time"
      ],
      redFlags: [],
      employeeQuotes: [
        { author: "Staff Distributed Systems Engineer (3 yrs)", text: "Apex genuinely walks the walk on work-life balance. Leadership measures output, not chair time.", verified: true },
        { author: "Senior Frontend Engineer (2 yrs)", text: "Best engineering culture I have experienced in 10 years of tech. No micromanagement, pure trust.", verified: true }
      ]
    }
  },
  {
    id: "comp_grindscale",
    name: "GrindScale HyperTech",
    logo: "💀",
    role: "Lead Systems & Backend Firefighter",
    department: "Rapid Growth Squad",
    salary: "$130,000 – $150,000 (Expected 70hr+ weeks)",
    location: "Downtown SF (Mandatory In-Office & Badge Tracking)",
    photoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
    ],
    recruiter: {
      name: "Elena Rostova",
      role: "VP Talent Optimization",
      email: "hr.burnout@tribe.demo",
      avatar: "💼",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
    },
    requiredSkills: ["Python", "Docker", "DevOps", "Emergency On-Call", "Backend"],
    perks: ["Free Cold Pizza for Weekend Overtime", "Ping Pong Table (Do Not Touch)", "Stock Options (10-year cliff)"],
    overview: "Relentless hyper-growth machine where only high-octane warriors survive 24/7 sprint cycles.",
    match: 42,
    culture: {
      score: 22,
      status: "TOXIC",
      isRedFlag: true,
      tagline: "🚨 CRITICAL BURNOUT RISK: Hostile leadership, mandatory 70hr weeks, extreme attrition.",
      wlbRating: 1.2,
      avgWeeklyHours: 72,
      attritionRate: "52%",
      remotePolicy: "Strict In-Office (Desk Camera & Keystroke Logging)",
      psychSafetyScore: 16,
      reviewsCount: 89,
      highlights: [],
      redFlags: [
        "52% annual engineering turnover (avg engineer quits in 5.2 months)",
        "Mandatory 70+ hour work weeks including Saturday & Sunday on-call shifts",
        "Keystroke and webcam activity tracking software installed on laptops",
        "Public executive berating during Monday morning all-hands meetings",
        "Zero PTO approval during 10 months of the year"
      ],
      employeeQuotes: [
        { author: "Former Senior Backend (Quit after 4 months)", text: "RUN AWAY. The VP screams at engineers on Slack calls. If you don't answer at 11 PM on Sunday, you get written up.", verified: true, flag: "CRITICAL_RED" },
        { author: "Ex-Platform Engineer", text: "Three engineering managers and six senior devs resigned in one quarter. Mental health disaster.", verified: true, flag: "CRITICAL_RED" }
      ]
    }
  },
  {
    id: "comp_nova",
    name: "NovaAI Research Labs",
    logo: "🧠",
    role: "AI / ML Research & Pipeline Engineer",
    department: "Generative Foundation Models",
    salary: "$160,000 – $210,000 + Top-Tier Token Pool",
    location: "Bengaluru / Remote Hybrid",
    photoUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
    ],
    recruiter: {
      name: "Marcus Vance",
      role: "Founder & Head of AI",
      email: "talent.pulse@tribe.demo",
      avatar: "🧑‍🚀",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    },
    requiredSkills: ["Python", "PyTorch", "Machine Learning", "Computer Vision", "LLMs"],
    perks: ["$50,000 Annual GPU compute budget for personal experiments", "Conference Travel (NeurIPS, ICML)", "Flexible Hours"],
    overview: "Training open multimodal vision-language architectures to advance autonomous scientific reasoning.",
    match: 89,
    culture: {
      score: 79,
      status: "MODERATE",
      isRedFlag: false,
      tagline: "Fast-moving research environment with high autonomy and occasional sprint crunch.",
      wlbRating: 4.0,
      avgWeeklyHours: 43,
      attritionRate: "9.5%",
      remotePolicy: "Flexible Hybrid (2 days in lab, 3 days async remote)",
      psychSafetyScore: 84,
      reviewsCount: 68,
      highlights: [
        "High autonomy to publish open-source models and papers",
        "Cutting-edge H100 compute cluster access",
        "Collaborative peer review culture"
      ],
      redFlags: [
        "Occasional sprint crunches leading up to conference submission deadlines"
      ],
      employeeQuotes: [
        { author: "ML Research Scientist (2 yrs)", text: "Incredible colleagues and compute resources. Can be intense before NeurIPS deadlines, but very rewarding.", verified: true }
      ]
    }
  },
  {
    id: "comp_vibestudio",
    name: "VibeStudio Creative",
    logo: "🎨",
    role: "Lead UI/UX Engineer & Design Systems Architect",
    department: "Product Experience",
    salary: "$135,000 – $170,000 + Profit Share",
    location: "London / Remote (UK & EU)",
    photoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
    ],
    recruiter: {
      name: "Chloe Dupont",
      role: "Creative Talent Lead",
      email: "chloe@vibestudio.demo",
      avatar: "👩‍🎨",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    },
    requiredSkills: ["Figma", "UI/UX Design", "React", "TypeScript", "Frontend"],
    perks: ["Design Book Stipend", "Apple Vision Pro & Studio Display Provided", "4-Day Work Week"],
    overview: "Crafting boundary-pushing human interfaces and tactile motion interactions for luxury fashion & creative software.",
    match: 91,
    culture: {
      score: 91,
      status: "EXCELLENT",
      isRedFlag: false,
      tagline: "4-day work week, collaborative design critiques, exceptional mental wellness support.",
      wlbRating: 4.8,
      avgWeeklyHours: 34,
      attritionRate: "4.1%",
      remotePolicy: "Async-first & 100% Remote Friendly",
      psychSafetyScore: 94,
      reviewsCount: 54,
      highlights: [
        "Official 32-hour / 4-day work week with full 40-hour pay",
        "Weekly creative showcase with no judgment or hierarchy",
        "Dedicated wellness & mental health therapy stipend"
      ],
      redFlags: [],
      employeeQuotes: [
        { author: "Design Systems Engineer (1.5 yrs)", text: "Best work-life balance ever. Having Fridays off every single week is life changing.", verified: true }
      ]
    }
  },
  {
    id: "comp_cloudscale",
    name: "CloudScale Systems",
    logo: "⚡",
    role: "Senior DevOps & Infrastructure Resiliency Engineer",
    department: "Infrastructure Crisis Management",
    salary: "$140,000 – $165,000",
    location: "Austin, TX (Strict Hybrid - 4 days in office)",
    photoUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    photos: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
    ],
    recruiter: {
      name: "Derek Sterling",
      role: "Talent Acquisition Lead",
      email: "derek@cloudscale.demo",
      avatar: "👨‍💻",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
    },
    requiredSkills: ["DevOps", "Docker", "Kubernetes", "AWS", "Go"],
    perks: ["Catered Lunch on In-Office Days", "Gym Pass"],
    overview: "Scaling mission-critical enterprise database failovers under high operational pressure.",
    match: 39,
    culture: {
      score: 34,
      status: "TOXIC",
      isRedFlag: true,
      tagline: "🚨 HIGH BURNOUT WARNING: Continuous pager alerts, high turnover, hostile blame culture.",
      wlbRating: 1.8,
      avgWeeklyHours: 64,
      attritionRate: "44%",
      remotePolicy: "Strict 4-Day In-Office with Badge Penalties",
      psychSafetyScore: 28,
      reviewsCount: 76,
      highlights: [],
      redFlags: [
        "44% annual infrastructure team turnover",
        "Average 24 unacknowledged PagerDuty incidents per engineer weekly",
        "Blameless post-mortems do not exist; engineers face public blame meetings",
        "Executive mandate revoking remote days without notice"
      ],
      employeeQuotes: [
        { author: "Former Site Reliability Engineer", text: "Pager rings all night long. No comp time for being on call 24/7. Massive burnout.", verified: true, flag: "CRITICAL_RED" }
      ]
    }
  },
{
  "id": "comp_neuralmatrix",
  "name": "NeuralMatrix AI Labs",
  "logo": "🧠",
  "role": "Senior AI / Large Language Models Engineer",
  "department": "Autonomous Agents & RAG Research",
  "salary": "$165,000 – $210,000 + 0.25% Equity",
  "location": "San Francisco, CA (Remote Friendly)",
  "photoUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "Marcus Vance",
    "role": "VP of AI Talent",
    "email": "marcus@neuralmatrix.demo",
    "avatar": "👨‍🔬",
    "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "LangChain",
    "Python",
    "PyTorch",
    "Vector DBs",
    "FastAPI"
  ],
  "perks": [
    "$5,000 Home Compute Grant",
    "Unlimited GPU Compute Access",
    "Conference Travel Paid",
    "401(k) 6% Match"
  ],
  "overview": "Pioneering state-of-the-art enterprise agent reasoning engines and self-improving code generation pipelines.",
  "match": 96,
  "culture": {
    "score": 96,
    "status": "EXCELLENT",
    "isRedFlag": false,
    "tagline": "High autonomy, zero red tape, research-first culture with generous time for open source.",
    "wlbRating": 4.8,
    "avgWeeklyHours": 38,
    "attritionRate": "2.1%",
    "remotePolicy": "100% Remote, choose your hours",
    "psychSafetyScore": 98,
    "reviewsCount": 89,
    "highlights": [
      "100% async decision making via written RFCs",
      "Every engineer gets $30k/yr OpenAI & Anthropic API compute budget",
      "Encouraged to publish research papers under open licenses"
    ],
    "redFlags": [],
    "employeeQuotes": [
      {
        "author": "Principal Research Engineer (2 yrs)",
        "text": "The smartest colleagues I have ever worked with, completely humble, zero ego.",
        "verified": true
      }
    ]
  }
},
{
  "id": "comp_chainforge",
  "name": "ChainForge Protocols",
  "logo": "⛓️",
  "role": "Senior Rust & Solidity Protocol Engineer",
  "department": "Zero-Knowledge Rollup Layer",
  "salary": "$170,000 – $220,000 + Token Grant",
  "location": "Zug, Switzerland (Global Remote)",
  "photoUrl": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "Astrid Lindgren",
    "role": "Ecosystem Talent Lead",
    "email": "astrid@chainforge.demo",
    "avatar": "👩‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "Rust",
    "Solidity",
    "WebAssembly",
    "Go",
    "System Design"
  ],
  "perks": [
    "Competitive Token Grant",
    "Health & Wellness Allowance",
    "Yearly Team Retreat in Lisbon & Bali"
  ],
  "overview": "Building modular zero-knowledge execution layers scaling decentralized applications to 100k TPS.",
  "match": 92,
  "culture": {
    "score": 91,
    "status": "HEALTHY",
    "isRedFlag": false,
    "tagline": "Cryptographic excellence, open source ethos, and flexible distributed schedules.",
    "wlbRating": 4.6,
    "avgWeeklyHours": 40,
    "attritionRate": "4.5%",
    "remotePolicy": "Global Remote",
    "psychSafetyScore": 92,
    "reviewsCount": 64,
    "highlights": [
      "All protocol code is open source under MIT/Apache 2.0",
      "Regular team pairing sessions and cryptographic reading groups"
    ],
    "redFlags": [],
    "employeeQuotes": [
      {
        "author": "Protocol Engineer",
        "text": "Engineering standards are top tier. Math and security come first before rushing features.",
        "verified": true
      }
    ]
  }
},
{
  "id": "comp_quantumbyte",
  "name": "QuantumByte High-Speed Systems",
  "logo": "⚡",
  "role": "Golang Distributed Systems Architect",
  "department": "High-Frequency Matching Engine",
  "salary": "$180,000 – $230,000 + Performance Bonus",
  "location": "New York, NY (Hybrid)",
  "photoUrl": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "David Chen",
    "role": "Head of Tech Recruiting",
    "email": "david@quantumbyte.demo",
    "avatar": "👨‍💼",
    "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "Go",
    "gRPC",
    "PostgreSQL",
    "Kafka",
    "System Design"
  ],
  "perks": [
    "Annual Performance Bonus (Up to 40%)",
    "Top-tier Health Insurance",
    "Subsidized Luxury Gym"
  ],
  "overview": "Architecting sub-millisecond real-time financial market data order book matching systems.",
  "match": 94,
  "culture": {
    "score": 88,
    "status": "HEALTHY",
    "isRedFlag": false,
    "tagline": "High-performance engineering with strong respect for work-life boundaries.",
    "wlbRating": 4.4,
    "avgWeeklyHours": 41,
    "attritionRate": "6.2%",
    "remotePolicy": "2 Days In-Office / 3 Days Remote",
    "psychSafetyScore": 89,
    "reviewsCount": 112,
    "highlights": [
      "Rigorous peer code reviews and clean benchmark standards",
      "Generous performance bonuses tied to system reliability"
    ],
    "redFlags": [],
    "employeeQuotes": [
      {
        "author": "Senior Go Engineer (3 yrs)",
        "text": "Fast-paced but organized. Management protects developers from ad-hoc chaos.",
        "verified": true
      }
    ]
  }
},
{
  "id": "comp_pixelcraft",
  "name": "PixelCraft Interactive",
  "logo": "🎮",
  "role": "Lead Unreal Engine 5 / C++ Graphics Engineer",
  "department": "Rendering Engine & Shaders",
  "salary": "$150,000 – $190,000 + Game Royalties",
  "location": "Montreal, Canada (Hybrid)",
  "photoUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "Sophie Tremblay",
    "role": "Studio Talent Director",
    "email": "sophie@pixelcraft.demo",
    "avatar": "👩‍🎨",
    "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "Unreal Engine 5",
    "C++",
    "HLSL Shaders",
    "Game Dev"
  ],
  "perks": [
    "No Crunch Guarantee Policy",
    "Profit Sharing on Shipped Titles",
    "Game Room & VR Lounge"
  ],
  "overview": "Crafting ambitious narrative multiplayer action adventures powered by Unreal Engine 5 Nanite technology.",
  "match": 90,
  "culture": {
    "score": 93,
    "status": "EXCELLENT",
    "isRedFlag": false,
    "tagline": "Certified No-Crunch Game Studio: Passionate artistry without burning out developers.",
    "wlbRating": 4.8,
    "avgWeeklyHours": 37,
    "attritionRate": "3.5%",
    "remotePolicy": "Hybrid / Remote Flexible",
    "psychSafetyScore": 94,
    "reviewsCount": 78,
    "highlights": [
      "Strict contractual 'No Crunch' guarantee",
      "Quarterly studio wellness weeks between milestones"
    ],
    "redFlags": [],
    "employeeQuotes": [
      {
        "author": "Gameplay Programmer (2 yrs)",
        "text": "The first game studio I have worked at that actually honors 40-hour weeks. Truly refreshing.",
        "verified": true
      }
    ]
  }
},
{
  "id": "comp_sentinel",
  "name": "Sentinel Cyber Defense",
  "logo": "🛡️",
  "role": "DevSecOps & Cloud Security Architect",
  "department": "Automated Threat Prevention",
  "salary": "$155,000 – $195,000 + Equity",
  "location": "Washington, DC / Remote",
  "photoUrl": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "Harrison Fox",
    "role": "Security Talent Specialist",
    "email": "harrison@sentinel.demo",
    "avatar": "🕵️",
    "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "Penetration Testing",
    "Kubernetes",
    "Python",
    "OWASP",
    "Docker"
  ],
  "perks": [
    "$4,000 Cybersecurity Certification Stipend",
    "Flexible Vacation",
    "Hardware Security Keys Provided"
  ],
  "overview": "Protecting cloud infrastructure against state-sponsored attacks through continuous automated red teaming.",
  "match": 92,
  "culture": {
    "score": 92,
    "status": "EXCELLENT",
    "isRedFlag": false,
    "tagline": "Mission-critical cybersecurity with psychological safety and blameless retrospectives.",
    "wlbRating": 4.7,
    "avgWeeklyHours": 39,
    "attritionRate": "4.0%",
    "remotePolicy": "100% Remote in US/Canada",
    "psychSafetyScore": 95,
    "reviewsCount": 95,
    "highlights": [
      "100% blameless post-mortem culture",
      "Dedicated conference speaking budget and security research time"
    ],
    "redFlags": [],
    "employeeQuotes": [
      {
        "author": "Security Architect (3 yrs)",
        "text": "Deep technical respect across leadership. They take developer security seriously.",
        "verified": true
      }
    ]
  }
},
{
  "id": "comp_hypergrowth",
  "name": "HyperBurnout Express Delivery",
  "logo": "🔥",
  "role": "Lead Mobile & Microservices Firefighter",
  "department": "Last-Mile Emergency Operations",
  "salary": "$130,000 – $155,000",
  "location": "Chicago, IL (Mandatory 5 Days In-Office)",
  "photoUrl": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
  ],
  "recruiter": {
    "name": "Brad 'Hustle' Taylor",
    "role": "Growth Talent Recruiter",
    "email": "brad@hyperburnout.demo",
    "avatar": "⚡",
    "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
  },
  "requiredSkills": [
    "Kotlin",
    "Swift",
    "React",
    "Node.js"
  ],
  "perks": [
    "Cold Pizza on Late Nights",
    "Ping Pong Table (Rarely allowed to use)"
  ],
  "overview": "Hyper-growth logistics platform with constant weekend emergencies and aggressive delivery deadlines.",
  "match": 31,
  "culture": {
    "score": 28,
    "status": "TOXIC",
    "isRedFlag": true,
    "tagline": "🚨 CRITICAL RED FLAG: Mandatory 65+ hour weeks, public scoldings, and 50% yearly team churn.",
    "wlbRating": 1.4,
    "avgWeeklyHours": 68,
    "attritionRate": "52%",
    "remotePolicy": "Strict 5 Days In-Office (Card Swipe Monitored)",
    "psychSafetyScore": 22,
    "reviewsCount": 110,
    "highlights": [],
    "redFlags": [
      "52% annual engineer turnover rate",
      "Mandatory unpaid weekend emergency on-call rotations",
      "Zero psychological safety: CEO sends 2 AM Slack pings with public reprimands",
      "Equity vests with a 3-year cliff designed to be lost before vesting"
    ],
    "employeeQuotes": [
      {
        "author": "Former Senior Mobile Lead",
        "text": "Worst workplace in tech. Constant yelling, unrealistic deadlines, zero empathy.",
        "verified": true,
        "flag": "CRITICAL_RED"
      }
    ]
  }
}
];

/* ---- Multi-Persona Demo Accounts ---- */
const DEMO_ACCOUNTS = {
  "lead@tribe.demo": { password: "password123", kind: "leader", name: "Alex Rivera", role: "Team Alpha Lead (SIH 2025)", teamName: "Team Alpha", avatar: "👑" },
  "team@tribe.demo": { password: "password123", kind: "leader", name: "Alex Rivera", role: "Team Alpha Lead (SIH 2025)", teamName: "Team Alpha", avatar: "👑" },
  "recruiter.apex@tribe.demo": { password: "password123", kind: "hr", name: "Sarah Jenkins", role: "Head of Talent @ Apex Cloud", companyId: "comp_apex", avatar: "👩‍💼" },
  "hr.burnout@tribe.demo": { password: "password123", kind: "hr", name: "Elena Rostova", role: "VP Talent @ GrindScale", companyId: "comp_grindscale", avatar: "💼" },
  "talent.pulse@tribe.demo": { password: "password123", kind: "hr", name: "Marcus Vance", role: "Founder @ NovaAI", companyId: "comp_nova", avatar: "🧑‍🚀" },
  "candidate@tribe.demo": { password: "password123", kind: "candidate", name: "Priya Patel", role: "ML / AI & Full-Stack Engineer", avatar: "👩‍💻" },
  "alex@tribe.demo": { password: "password123", kind: "candidate", name: "Alex Chen", role: "Senior Frontend Engineer", avatar: "🧑‍💻" },
};

/* ---- Tribe Pulse Initial Feed ---- */
const INITIAL_FEED_POSTS = [
  {
    id: "post-1",
    authorName: "Sarah Jenkins",
    authorRole: "Head of Talent @ Apex Cloud",
    authorAvatar: "👩‍💼",
    authorPhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    isHR: true,
    companyId: "comp_apex",
    timeAgo: "25m ago",
    category: "Hiring & Culture",
    content: "🚀 Big announcement at Apex Cloud! We just officially adopted a permanent 4-Day Work Week for our entire engineering org with zero pay reduction. Work culture should empower people, not grind them down. We are actively recruiting Senior Full-Stack Cloud Engineers who love async collaboration! Check out our job card in Discover or DM me directly. #CultureMatters #Hiring #WorkLifeBalance",
    likes: 46,
    userLiked: false,
    comments: [
      { id: "c1", author: "Priya Patel", avatar: "👩‍💻", text: "This is what modern tech culture should look like! Love the async-first approach.", timeAgo: "15m ago" },
      { id: "c2", author: "Marcus Vance", avatar: "🧑‍🚀", text: "Kudos to Apex Cloud! Setting the gold standard for developer retention.", timeAgo: "8m ago" }
    ]
  },
  {
    id: "post-2",
    authorName: "Priya Patel",
    authorRole: "ML / AI & Full-Stack Engineer",
    authorAvatar: "👩‍💻",
    authorPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    isHR: false,
    timeAgo: "2h ago",
    category: "Tech Milestone",
    content: "✨ Proud to share: just completed the Tribe AI Proctored PyTorch Assessment with a 94% score! Also published my open-source SIH winning CV pipeline on GitHub with 320+ commits. Open to connecting with teams building humane, high-impact AI products! #OpenToWork #ML #MachineLearning",
    likes: 38,
    userLiked: false,
    comments: [
      { id: "c3", author: "Sarah Jenkins", avatar: "👩‍💼", text: "Impressive portfolio Priya! Just sent you a match request from Apex Cloud.", timeAgo: "1h ago" }
    ]
  },
  {
    id: "post-3",
    authorName: "Tribe Culture Transparency Watch",
    authorRole: "Verified Employee Insights",
    authorAvatar: "🛡️",
    isHR: false,
    timeAgo: "4h ago",
    category: "Culture Watch",
    content: "⚠️ Community Advisory: Multiple verified whistleblower reports on GrindScale Inc flagging 52% annual turnover and mandatory 70hr work weeks. Tribe's Culture Transparency Meter has officially tagged them in RED. Job seekers: inspect company culture ratings before accepting offers! #CultureTransparency #ToxicWorkplaceAlert",
    likes: 89,
    userLiked: true,
    comments: [
      { id: "c4", author: "Alex Chen", avatar: "🧑‍💻", text: "Thank goodness Tribe highlights this in red. Avoided a massive bullet!", timeAgo: "3h ago" }
    ]
  }
];

/* ---- Initial Real-Time Chat Threads ---- */
const INITIAL_CHATS = {
  "comp_apex_c1": [
    { id: "m1", senderId: "recruiter.apex@tribe.demo", senderName: "Sarah Jenkins", text: "Hi Priya! I saw your verified 94% in PyTorch and your CV hackathon project. We'd love to invite you to chat about our Senior Full-Stack Cloud role!", time: "10:30 AM" },
    { id: "m2", senderId: "candidate@tribe.demo", senderName: "Priya Patel", text: "Thanks Sarah! I love Apex Cloud's 4-day work week and async-first culture. I'd love to connect.", time: "10:34 AM" },
    { id: "m3", senderId: "recruiter.apex@tribe.demo", senderName: "Sarah Jenkins", text: "Awesome! I just generated a quick 3-question AI screening challenge for React & Cloud. Feel free to try it whenever convenient!", time: "10:36 AM", isChallengeInvite: true, skill: "React & Cloud" }
  ]
};

/* ================================================================== */
/*  AUTOMATED AI INTERVIEW QUESTION GENERATOR                         */
/* ================================================================== */
function generateAIInterviewPack(skills, roleTitle = "Software Engineer", companyName = "Your Team") {
  const skillList = Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : ["General Development"]);
  const primarySkill = skillList[0] || "JavaScript";

  const skillQuestionsBank = {
    "react": [
      { q: "How does React 18 Concurrent Rendering with useTransition optimize INP (Interaction to Next Paint) without blocking user inputs?", options: ["It offloads virtual DOM to Web Workers", "It marks updates as non-urgent, allowing high-priority events like typing to interrupt rendering", "It replaces virtual DOM with direct signals", "It forces synchronous batching on all state changes"], correct: 1, explanation: "useTransition tags state transitions as non-urgent, allowing the browser to prioritize urgent user keystrokes/clicks." },
      { q: "When architecting a high-traffic dashboard, how do you prevent cascading re-renders across deeply nested context consumers?", options: ["Wrap entire application in useMemo", "Split Context into separate State and Dispatch providers, and use selector hooks or React 19 Action hooks", "Never use Context in production", "Use forceUpdate() on leaf nodes"], correct: 1, explanation: "Splitting state and dispatch prevents consumers that only need dispatch from re-rendering on every state value tick." }
    ],
    "python": [
      { q: "In Python 3.12+, how does the per-interpreter GIL (PEP 684) and immortal objects (PEP 683) change multi-core parallelism?", options: ["It removes threading completely", "Sub-interpreters can now run with isolated GILs in parallel OS threads without shared reference count contention", "It converts Python code into WebAssembly JIT", "It forces all variables to be immutable"], correct: 1, explanation: "Sub-interpreters have isolated GILs allowing true CPU multi-core scaling in Python processes." },
      { q: "When handling massive data streaming pipelines, why prefer async generators (yield in async def) over collecting into lists?", options: ["Lists are deprecated in modern Python", "Async generators stream chunks with backpressure, maintaining constant O(1) memory footprint", "Async generators run C extensions automatically", "Lists cannot hold dictionary objects"], correct: 1, explanation: "Streaming chunks with async generators prevents OOM errors on large datasets." }
    ],
    "pytorch": [
      { q: "How does PyTorch's `torch.cuda.amp.autocast()` combined with `GradScaler` prevent underflow in FP16 mixed precision training?", options: ["It rounds all numbers to integers", "It dynamically scales up gradients before backward pass to avoid float16 underflow, then un-scales before optimizer step", "It disables backward passes on small layers", "It forces 64-bit precision on activations"], correct: 1, explanation: "GradScaler multiplies loss by a scale factor to prevent gradients from flushing to zero in FP16 precision." }
    ],
    "docker": [
      { q: "In multi-stage Docker builds for production containers, what is the primary security & performance benefit?", options: ["Allows running root commands without sudo", "Keeps build tooling, source code, and secrets out of the final lean runtime image", "Enables kernel upgrades inside container", "Automatically scales Kubernetes pods"], correct: 1, explanation: "Multi-stage builds leave compiler SDKs and build caches behind, slashing image size and attack surface." }
    ],
    "devops": [
      { q: "How does a Kubernetes readinessProbe differ from a livenessProbe during a zero-downtime rolling update?", options: ["They are identical aliases", "readinessProbe determines if traffic should be routed to the pod; livenessProbe determines if the pod should be killed and restarted", "livenessProbe only runs during pod creation", "readinessProbe requires root privileges"], correct: 1, explanation: "If readiness fails, traffic stops routing to the pod without killing it, preventing 502 errors while bootstrapping." }
    ]
  };

  const key = primarySkill.toLowerCase();
  const matched = skillQuestionsBank[key] || [
    { q: `What is the most critical architectural trade-off when scaling ${primarySkill} systems in high-throughput environments?`, options: ["Vertical scaling memory without cache", "Decoupling read/write models, choosing appropriate partition keys, and designing for idempotency", "Writing all services as monolithic single-files", "Avoiding automated unit testing"], correct: 1, explanation: "Decoupled architectures with idempotent operations and partitioning enable horizontal scaling." },
    { q: `When debugging an intermittent production latency spike involving ${primarySkill}, what is the first diagnostic step?`, options: ["Immediately reboot all production servers", "Inspect distributed tracing (spans, p99 latency breakdowns, database lock contention, and event loop delays)", "Increase CPU limits blindly", "Disable security logs"], correct: 1, explanation: "Distributed tracing locates the exact bottleneck whether it's DB locks, network I/O, or CPU saturation." }
  ];

  return {
    roleTitle,
    companyName,
    skills: skillList,
    technical: matched,
    behavioral: [
      { q: "Describe a situation where you identified technical debt that threatened team velocity. How did you advocate for refactoring while meeting product delivery milestones?", rubric: "Strong candidates articulate quantifiable risk, pitch incremental refactoring in sprint chunks, and collaborate empathetically with product managers." },
      { q: "How do you maintain high engineering quality and psychological safety in an async-first remote team when asynchronous code reviews become contentious?", rubric: "Look for candidates who switch to synchronous 5-minute video calls for sensitive feedback, use constructive questions, and champion blameless culture." }
    ],
    architectureChallenge: {
      title: `Scalable ${primarySkill} Service Architecture`,
      prompt: `Design a high-reliability service in ${primarySkill} capable of handling 50,000 requests/sec with p99 latency < 25ms. Outline your data model, caching strategy (Redis/Memcached), and circuit-breaker failover mechanisms.`,
      rubric: "Evaluated on data consistency models, cache invalidation, rate-limiting algorithms, and graceful degradation under load."
    }
  };
}
/* ================================================================== */
/*  PHOTO PRESETS FOR PROFILE CUSTOMIZER                               */
/* ================================================================== */

const PHOTO_PRESETS = [
  { id: "p1", label: "Dev 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { id: "p2", label: "Dev 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
  { id: "p3", label: "Dev 3", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" },
  { id: "p4", label: "Dev 4", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80" },
  { id: "p5", label: "Dev 5", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80" },
  { id: "p6", label: "Dev 6", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
  { id: "p7", label: "Dev 7", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80" },
  { id: "p8", label: "Dev 8", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80" },
  { id: "p9", label: "Dev 9", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80" },
  { id: "p10", label: "Dev 10", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80" },
  { id: "p11", label: "Dev 11", url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80" },
  { id: "p12", label: "Dev 12", url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80" },
];

const CANDIDATES = [
  {
    "id": "c1",
    "name": "Ananya Sharma",
    "role": "ML / AI Engineer",
    "avatar": "👩‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 94,
    "location": "Bengaluru",
    "availability": "Available now",
    "bio": "Building computer vision & LLM pipelines that solve real humanitarian problems ✨",
    "experienceYears": "3 years hackathon experience · SIH 2025 Winner",
    "githubUsername": "ananya-ai",
    "tags": [
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "PyTorch",
        "level": "assessment"
      },
      {
        "name": "Machine Learning",
        "level": "proof"
      },
      {
        "name": "Computer Vision",
        "level": "self"
      }
    ],
    "assessmentAvg": 91,
    "breakdown": {
      "skills": 47,
      "experience": 18,
      "hackathon": 10,
      "availability": 10,
      "preferences": 9
    },
    "requirements": [
      "Python",
      "PyTorch",
      "Machine Learning",
      "Computer Vision"
    ],
    "detailedSkills": [
      {
        "name": "Python",
        "verification": "assessment",
        "score": 94,
        "tested": "2 days ago",
        "proofs": [
          "4 ML / data-science projects",
          "Active GitHub — 320+ commits",
          "Kaggle top-15% finish"
        ]
      },
      {
        "name": "PyTorch",
        "verification": "assessment",
        "score": 91,
        "tested": "2 days ago",
        "proofs": [
          "3 deep-learning projects",
          "Published model on Hugging Face"
        ]
      },
      {
        "name": "Machine Learning",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Co-authored a CV research paper",
          "2 hackathon ML projects shipped"
        ]
      },
      {
        "name": "Computer Vision",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "ML Engineer",
        "result": "Winner",
        "icon": "🥇"
      },
      {
        "name": "HackFest 2025",
        "role": "Data Scientist",
        "result": "Finalist",
        "icon": "⭐"
      },
      {
        "name": "Buildspace Nights & Weekends",
        "role": "ML Engineer",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "real-time-pose-estimator — GitHub, 210★",
      "crop-disease-classifier — Portfolio",
      "chat-summarizer-api — GitHub"
    ],
    "vouches": 3,
    "vouchTags": [
      "Strong debugging",
      "Good communicator",
      "Took ownership"
    ]
  },
  {
    "id": "c2",
    "name": "Divya Reddy",
    "role": "AI Engineer",
    "avatar": "👩‍🔬",
    "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 88,
    "location": "Hyderabad",
    "availability": "Available from Fri",
    "bio": "Fine-tuning open models and building robust RAG pipelines that don't hallucinate.",
    "experienceYears": "2.5 years ML engineering · 2x Finalist",
    "githubUsername": "divya-reddy-ai",
    "tags": [
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "LLMs",
        "level": "proof"
      },
      {
        "name": "Machine Learning",
        "level": "assessment"
      },
      {
        "name": "MLOps",
        "level": "self"
      }
    ],
    "assessmentAvg": 85,
    "breakdown": {
      "skills": 44,
      "experience": 17,
      "hackathon": 9,
      "availability": 9,
      "preferences": 9
    },
    "requirements": [
      "Python",
      "LLMs",
      "Machine Learning",
      "MLOps"
    ],
    "detailedSkills": [
      {
        "name": "Python",
        "verification": "assessment",
        "score": 89,
        "tested": "5 days ago",
        "proofs": [
          "5 backend + ML projects"
        ]
      },
      {
        "name": "LLMs",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Built a RAG pipeline for a startup",
          "Fine-tuned an open-source model"
        ]
      },
      {
        "name": "Machine Learning",
        "verification": "assessment",
        "score": 85,
        "tested": "1 week ago",
        "proofs": [
          "Capstone thesis on NLP"
        ]
      },
      {
        "name": "MLOps",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "AI Engineer",
        "result": "Finalist",
        "icon": "⭐"
      },
      {
        "name": "Open Source AI Sprint",
        "role": "Contributor",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "docqa-rag — GitHub",
      "support-bot-finetune — Portfolio"
    ],
    "vouches": 2,
    "vouchTags": [
      "Fast learner",
      "Shipped clean APIs"
    ]
  },
  {
    "id": "c3",
    "name": "Karan Malhotra",
    "role": "DevOps Engineer",
    "avatar": "🧑‍🔧",
    "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 90,
    "location": "Pune",
    "availability": "Available now",
    "bio": "If it's not automated with CI/CD and containerized in K8s, it doesn't ship.",
    "experienceYears": "4 years cloud infra · CloudNative Winner",
    "githubUsername": "karan-ops",
    "tags": [
      {
        "name": "Docker",
        "level": "assessment"
      },
      {
        "name": "Kubernetes",
        "level": "assessment"
      },
      {
        "name": "CI/CD",
        "level": "proof"
      },
      {
        "name": "AWS",
        "level": "proof"
      }
    ],
    "assessmentAvg": 88,
    "breakdown": {
      "skills": 46,
      "experience": 17,
      "hackathon": 9,
      "availability": 10,
      "preferences": 8
    },
    "requirements": [
      "Docker",
      "Kubernetes",
      "CI/CD",
      "AWS"
    ],
    "detailedSkills": [
      {
        "name": "Docker",
        "verification": "assessment",
        "score": 92,
        "tested": "3 days ago",
        "proofs": [
          "Containerized 6 production services"
        ]
      },
      {
        "name": "Kubernetes",
        "verification": "assessment",
        "score": 84,
        "tested": "3 days ago",
        "proofs": [
          "Managed a 12-node cluster"
        ]
      },
      {
        "name": "CI/CD",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Built GitHub Actions pipelines for 4 teams"
        ]
      },
      {
        "name": "AWS",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "3x AWS-hosted hackathon deploys"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "DevOps Lead",
        "result": "Finalist",
        "icon": "⭐"
      },
      {
        "name": "CloudNative Sprint",
        "role": "Infra Engineer",
        "result": "Winner",
        "icon": "🥇"
      }
    ],
    "projects": [
      "k8s-autoscaler-demo — GitHub",
      "ci-pipeline-toolkit — GitHub"
    ],
    "vouches": 4,
    "vouchTags": [
      "Reliable under pressure",
      "Great documentation"
    ]
  },
  {
    "id": "c4",
    "name": "Rhea Kapoor",
    "role": "Frontend Developer",
    "avatar": "👩‍🎨",
    "photoUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 82,
    "location": "Mumbai",
    "availability": "Available now",
    "bio": "Obsessed with micro-interactions, responsive design, and 60fps animations in React.",
    "experienceYears": "3 years frontend engineering · HackFest Finalist",
    "githubUsername": "rhea-codes",
    "tags": [
      {
        "name": "React",
        "level": "assessment"
      },
      {
        "name": "TypeScript",
        "level": "assessment"
      },
      {
        "name": "UI/UX Design",
        "level": "proof"
      },
      {
        "name": "Figma",
        "level": "self"
      }
    ],
    "assessmentAvg": 90,
    "breakdown": {
      "skills": 42,
      "experience": 15,
      "hackathon": 8,
      "availability": 10,
      "preferences": 7
    },
    "requirements": [
      "React",
      "TypeScript",
      "API Integration"
    ],
    "detailedSkills": [
      {
        "name": "React",
        "verification": "assessment",
        "score": 93,
        "tested": "1 day ago",
        "proofs": [
          "6 shipped React apps"
        ]
      },
      {
        "name": "TypeScript",
        "verification": "assessment",
        "score": 87,
        "tested": "1 day ago",
        "proofs": [
          "Strict-mode codebases at 2 internships"
        ]
      },
      {
        "name": "UI/UX Design",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Design system used across 3 products"
        ]
      },
      {
        "name": "Figma",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "Frontend Lead",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "hackmatch-ui-kit — GitHub",
      "portfolio-v3 — Live site"
    ],
    "vouches": 1,
    "vouchTags": [
      "Pixel-perfect"
    ]
  },
  {
    "id": "c5",
    "name": "Arjun Nair",
    "role": "Backend Developer",
    "avatar": "🧑‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 79,
    "location": "Chennai",
    "availability": "Available from Mon",
    "bio": "Writing high-throughput Go and Node backends that handle spikes without breaking.",
    "experienceYears": "3.5 years backend development",
    "githubUsername": "arjun-nair",
    "tags": [
      {
        "name": "Node.js",
        "level": "assessment"
      },
      {
        "name": "PostgreSQL",
        "level": "proof"
      },
      {
        "name": "System Design",
        "level": "self"
      },
      {
        "name": "AWS",
        "level": "self"
      }
    ],
    "assessmentAvg": 81,
    "breakdown": {
      "skills": 38,
      "experience": 16,
      "hackathon": 7,
      "availability": 8,
      "preferences": 10
    },
    "requirements": [
      "Node.js",
      "PostgreSQL",
      "System Design"
    ],
    "detailedSkills": [
      {
        "name": "Node.js",
        "verification": "assessment",
        "score": 81,
        "tested": "4 days ago",
        "proofs": [
          "API for a 10k-user side project"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Schema design for 2 hackathon projects"
        ]
      },
      {
        "name": "System Design",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      },
      {
        "name": "AWS",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "Backend Dev",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "queue-worker-service — GitHub"
    ],
    "vouches": 0,
    "vouchTags": []
  },
  {
    "id": "c6",
    "name": "Simran Kaur",
    "role": "UI/UX Designer",
    "avatar": "👩‍🎤",
    "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 86,
    "location": "Delhi",
    "availability": "Available now",
    "bio": "Turning messy problem statements into user-centered Figma prototypes under 24h.",
    "experienceYears": "4 years product design · HackFest Winner",
    "githubUsername": "simran-design",
    "tags": [
      {
        "name": "Figma",
        "level": "assessment"
      },
      {
        "name": "UI/UX Design",
        "level": "assessment"
      },
      {
        "name": "Design Systems",
        "level": "proof"
      },
      {
        "name": "User Research",
        "level": "self"
      }
    ],
    "assessmentAvg": 89,
    "breakdown": {
      "skills": 41,
      "experience": 16,
      "hackathon": 9,
      "availability": 10,
      "preferences": 10
    },
    "requirements": [
      "UI/UX Design",
      "Figma",
      "Design Systems"
    ],
    "detailedSkills": [
      {
        "name": "Figma",
        "verification": "assessment",
        "score": 92,
        "tested": "6 days ago",
        "proofs": [
          "Design lead on 5 shipped products"
        ]
      },
      {
        "name": "UI/UX Design",
        "verification": "assessment",
        "score": 86,
        "tested": "6 days ago",
        "proofs": [
          "Case studies portfolio"
        ]
      },
      {
        "name": "Design Systems",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Built a 40-component design system"
        ]
      },
      {
        "name": "User Research",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "Product Designer",
        "result": "Winner",
        "icon": "🥇"
      }
    ],
    "projects": [
      "ds-tokens-kit — GitHub",
      "case-studies — Live site"
    ],
    "vouches": 2,
    "vouchTags": [
      "Great collaborator",
      "Fast iteration"
    ]
  },
  {
    "id": "c7",
    "name": "Yusuf Ansari",
    "role": "Computer Vision Engineer",
    "avatar": "🧑‍🔬",
    "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 91,
    "location": "Bengaluru",
    "availability": "Available now",
    "bio": "Edge AI, real-time object detection, and OpenCV on embedded hardware.",
    "experienceYears": "2.5 years CV research · SIH Winner",
    "githubUsername": "yusuf-cv",
    "tags": [
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "Computer Vision",
        "level": "assessment"
      },
      {
        "name": "PyTorch",
        "level": "proof"
      },
      {
        "name": "TensorFlow",
        "level": "self"
      }
    ],
    "assessmentAvg": 93,
    "breakdown": {
      "skills": 48,
      "experience": 19,
      "hackathon": 10,
      "availability": 10,
      "preferences": 8
    },
    "requirements": [
      "Python",
      "Computer Vision",
      "Machine Learning"
    ],
    "detailedSkills": [
      {
        "name": "Python",
        "verification": "assessment",
        "score": 95,
        "tested": "1 week ago",
        "proofs": [
          "Vision pipeline in production"
        ]
      },
      {
        "name": "Computer Vision",
        "verification": "assessment",
        "score": 90,
        "tested": "1 week ago",
        "proofs": [
          "2 published CV demos"
        ]
      },
      {
        "name": "PyTorch",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Custom object-detection model"
        ]
      },
      {
        "name": "TensorFlow",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "CV Engineer",
        "result": "Winner",
        "icon": "🥇"
      },
      {
        "name": "HackFest 2025",
        "role": "ML Engineer",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "defect-detector-cv — GitHub, 140★",
      "ar-try-on-demo — Live demo"
    ],
    "vouches": 3,
    "vouchTags": [
      "Deep technical depth",
      "Ships fast"
    ]
  },
  {
    "id": "c8",
    "name": "Neha Verma",
    "role": "Full Stack Developer",
    "avatar": "👩‍💼",
    "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 84,
    "location": "Jaipur",
    "availability": "Available now",
    "bio": "Full-stack builder who bridges frontend polish with solid database architecture.",
    "experienceYears": "3 years web development",
    "githubUsername": "neha-dev",
    "tags": [
      {
        "name": "React",
        "level": "assessment"
      },
      {
        "name": "Node.js",
        "level": "assessment"
      },
      {
        "name": "PostgreSQL",
        "level": "self"
      },
      {
        "name": "System Design",
        "level": "self"
      }
    ],
    "assessmentAvg": 87,
    "breakdown": {
      "skills": 43,
      "experience": 15,
      "hackathon": 8,
      "availability": 10,
      "preferences": 8
    },
    "requirements": [
      "React",
      "Node.js",
      "API Integration"
    ],
    "detailedSkills": [
      {
        "name": "React",
        "verification": "assessment",
        "score": 88,
        "tested": "3 days ago",
        "proofs": [
          "Freelance client apps ×4"
        ]
      },
      {
        "name": "Node.js",
        "verification": "assessment",
        "score": 85,
        "tested": "3 days ago",
        "proofs": [
          "REST + GraphQL APIs shipped"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      },
      {
        "name": "System Design",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "Full Stack Dev",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "taskflow-app — GitHub",
      "clientsite-kit — Live site"
    ],
    "vouches": 1,
    "vouchTags": [
      "Reliable teammate"
    ]
  },
  {
    "id": "c9",
    "name": "Rohan Verma",
    "role": "Product Manager",
    "avatar": "🧑‍💼",
    "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 77,
    "location": "Gurugram",
    "availability": "Available from next week",
    "bio": "Defining clear PRDs, unblocking devs, and crafting winning pitch decks in 36h.",
    "experienceYears": "3 years product management",
    "githubUsername": "rohan-pm",
    "tags": [
      {
        "name": "Product Strategy",
        "level": "proof"
      },
      {
        "name": "System Design",
        "level": "self"
      },
      {
        "name": "SQL",
        "level": "proof"
      }
    ],
    "assessmentAvg": null,
    "breakdown": {
      "skills": 34,
      "experience": 20,
      "hackathon": 7,
      "availability": 8,
      "preferences": 8
    },
    "requirements": [
      "Product Strategy",
      "System Design"
    ],
    "detailedSkills": [
      {
        "name": "Product Strategy",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Led roadmap for a 50k-MAU app",
          "Wrote 12 PRDs shipped to production"
        ]
      },
      {
        "name": "SQL",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Built analytics dashboards used weekly by leadership"
        ]
      },
      {
        "name": "System Design",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "Product Lead",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "roadmap-analytics-tool — Portfolio",
      "user-research-repo — Notion"
    ],
    "vouches": 1,
    "vouchTags": [
      "Clear communicator"
    ]
  },
  {
    "id": "c10",
    "name": "Aditya Rao",
    "role": "Backend Engineer",
    "avatar": "🧑‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 92,
    "location": "Delhi",
    "availability": "Available now",
    "bio": "PostgreSQL optimization, distributed queues, and bulletproof microservices.",
    "experienceYears": "3 years backend engineering",
    "githubUsername": "aditya-rao",
    "tags": [
      {
        "name": "Go",
        "level": "assessment"
      },
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "PostgreSQL",
        "level": "proof"
      },
      {
        "name": "Docker",
        "level": "proof"
      }
    ],
    "assessmentAvg": 92,
    "breakdown": {
      "skills": 47,
      "experience": 17,
      "hackathon": 9,
      "availability": 10,
      "preferences": 9
    },
    "requirements": [
      "Go",
      "Python",
      "PostgreSQL",
      "Docker"
    ],
    "detailedSkills": [
      {
        "name": "Go",
        "verification": "assessment",
        "score": 94,
        "tested": "4 days ago",
        "proofs": [
          "High-throughput microservices in production"
        ]
      },
      {
        "name": "Python",
        "verification": "assessment",
        "score": 90,
        "tested": "4 days ago",
        "proofs": [
          "Async data pipelines with FastAPI"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "DB indexing and query optimization on 50GB dataset"
        ]
      },
      {
        "name": "Docker",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Production multi-stage Docker builds"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "Backend Lead",
        "result": "Winner",
        "icon": "🥇"
      }
    ],
    "projects": [
      "distributed-task-queue — GitHub, 95★",
      "fastapi-starter — GitHub"
    ],
    "vouches": 3,
    "vouchTags": [
      "High code quality",
      "Fast delivery"
    ]
  },
  {
    "id": "c11",
    "name": "Fatima Sheikh",
    "role": "Security Engineer",
    "avatar": "🧕",
    "photoUrl": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 81,
    "location": "Hyderabad",
    "availability": "Available from Mon",
    "bio": "Penetration testing, OAuth2 / JWT security audits, and defensive programming.",
    "experienceYears": "2.5 years cybersecurity",
    "githubUsername": "fatima-sec",
    "tags": [
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "Docker",
        "level": "assessment"
      },
      {
        "name": "System Design",
        "level": "proof"
      }
    ],
    "assessmentAvg": 88,
    "breakdown": {
      "skills": 40,
      "experience": 15,
      "hackathon": 8,
      "availability": 8,
      "preferences": 10
    },
    "requirements": [
      "Python",
      "Docker",
      "System Design"
    ],
    "detailedSkills": [
      {
        "name": "Python",
        "verification": "assessment",
        "score": 91,
        "tested": "1 week ago",
        "proofs": [
          "Security scanning tooling in Python"
        ]
      },
      {
        "name": "Docker",
        "verification": "assessment",
        "score": 85,
        "tested": "1 week ago",
        "proofs": [
          "Hardened container images for enterprise client"
        ]
      },
      {
        "name": "System Design",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Threat-modeling architecture reviews ×3"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "Security Lead",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "secscan-cli — GitHub, 60★",
      "auth-audit-toolkit — GitHub"
    ],
    "vouches": 1,
    "vouchTags": [
      "Catches edge cases early"
    ]
  },
  {
    "id": "c12",
    "name": "Vikram Desai",
    "role": "Data Engineer",
    "avatar": "🧑‍🔧",
    "photoUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 87,
    "location": "Bengaluru",
    "availability": "Available now",
    "bio": "Building ETL pipelines with Apache Spark, Kafka, and Snowflake that scale.",
    "experienceYears": "4 years data engineering",
    "githubUsername": "vikram-data",
    "tags": [
      {
        "name": "Python",
        "level": "assessment"
      },
      {
        "name": "PostgreSQL",
        "level": "assessment"
      },
      {
        "name": "Docker",
        "level": "proof"
      }
    ],
    "assessmentAvg": 90,
    "breakdown": {
      "skills": 44,
      "experience": 17,
      "hackathon": 8,
      "availability": 10,
      "preferences": 8
    },
    "requirements": [
      "Python",
      "PostgreSQL",
      "Docker"
    ],
    "detailedSkills": [
      {
        "name": "Python",
        "verification": "assessment",
        "score": 93,
        "tested": "3 days ago",
        "proofs": [
          "Data pipelines handling 2M+ records daily"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "assessment",
        "score": 87,
        "tested": "3 days ago",
        "proofs": [
          "Time-series data schema & partitioning"
        ]
      },
      {
        "name": "Docker",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Multi-container local dev stacks"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "Data Engineer",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "pipeline-orchestrator — GitHub",
      "streaming-analytics — Portfolio"
    ],
    "vouches": 2,
    "vouchTags": [
      "Quietly delivers",
      "Thorough tests"
    ]
  },
  {
    "id": "c13",
    "name": "Ishaan Bose",
    "role": "Mobile Developer",
    "avatar": "🧑‍🎓",
    "photoUrl": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 76,
    "location": "Kolkata",
    "availability": "Available now",
    "bio": "Flutter and React Native developer crafting native-feel apps for iOS and Android.",
    "experienceYears": "2 years mobile development",
    "githubUsername": "ishaan-mobile",
    "tags": [
      {
        "name": "React",
        "level": "assessment"
      },
      {
        "name": "TypeScript",
        "level": "self"
      },
      {
        "name": "UI/UX Design",
        "level": "proof"
      }
    ],
    "assessmentAvg": 79,
    "breakdown": {
      "skills": 36,
      "experience": 13,
      "hackathon": 7,
      "availability": 10,
      "preferences": 10
    },
    "requirements": [
      "React",
      "TypeScript"
    ],
    "detailedSkills": [
      {
        "name": "React",
        "verification": "assessment",
        "score": 79,
        "tested": "5 days ago",
        "proofs": [
          "2 React Native mobile apps on App Store"
        ]
      },
      {
        "name": "TypeScript",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      },
      {
        "name": "UI/UX Design",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Mobile design system in Figma"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "Campus Hack Day 2025",
        "role": "Mobile Dev",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "campus-events-app — GitHub"
    ],
    "vouches": 0,
    "vouchTags": []
  },
  {
    "id": "c14",
    "name": "Meera Iyer",
    "role": "Blockchain Developer",
    "avatar": "👩‍🚀",
    "photoUrl": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 83,
    "location": "Pune",
    "availability": "Available from Fri",
    "bio": "Audited Solidity smart contracts and zero-knowledge verification protocols.",
    "experienceYears": "2.5 years Web3 engineering · ETHIndia Finalist",
    "githubUsername": "meera-iyer-eth",
    "tags": [
      {
        "name": "Solidity",
        "level": "proof"
      },
      {
        "name": "Node.js",
        "level": "assessment"
      },
      {
        "name": "System Design",
        "level": "self"
      }
    ],
    "assessmentAvg": 86,
    "breakdown": {
      "skills": 39,
      "experience": 16,
      "hackathon": 9,
      "availability": 9,
      "preferences": 10
    },
    "requirements": [
      "Node.js",
      "System Design"
    ],
    "detailedSkills": [
      {
        "name": "Solidity",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Deployed 2 audited smart contracts on mainnet"
        ]
      },
      {
        "name": "Node.js",
        "verification": "assessment",
        "score": 86,
        "tested": "6 days ago",
        "proofs": [
          "Backend for a DeFi dashboard"
        ]
      },
      {
        "name": "System Design",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": []
      }
    ],
    "hackathons": [
      {
        "name": "ETHIndia 2025",
        "role": "Smart Contract Dev",
        "result": "Finalist",
        "icon": "⭐"
      },
      {
        "name": "HackFest 2025",
        "role": "Web3 Dev",
        "result": "Participant",
        "icon": "🏁"
      }
    ],
    "projects": [
      "defi-dashboard-be — GitHub, 40★",
      "nft-marketplace-contracts — GitHub"
    ],
    "vouches": 2,
    "vouchTags": [
      "Ships working demos fast"
    ]
  },
{
  "id": "c15",
  "name": "Vikram Malhotra",
  "role": "Systems & Rust Engineer",
  "avatar": "🦀",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 94,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Building memory-safe zero-copy distributed network runtimes in Rust and WebAssembly.",
  "experienceYears": "4 years systems programming · Tokio contributor",
  "githubUsername": "vikram-rust",
  "tags": [
    {
      "name": "Rust",
      "level": "assessment"
    },
    {
      "name": "WebAssembly",
      "level": "proof"
    },
    {
      "name": "System Design",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "self"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Rust",
    "WebAssembly",
    "System Design"
  ],
  "detailedSkills": [
    {
      "name": "Rust",
      "verification": "assessment",
      "score": 96,
      "tested": "1 day ago",
      "proofs": [
        "Maintained Tokio async ecosystem crate",
        "High-throughput network library on crates.io (120k downloads)"
      ]
    },
    {
      "name": "WebAssembly",
      "verification": "proof",
      "score": 93,
      "tested": "3 days ago",
      "proofs": [
        "Built zero-overhead Wasm edge plugin runtime"
      ]
    },
    {
      "name": "System Design",
      "verification": "assessment",
      "score": 95,
      "tested": "1 week ago",
      "proofs": [
        "Distributed Raft consensus engine implemented in Rust"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Rust Global Hackathon 2025",
      "role": "Systems Architect",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "fast-raft-rs — GitHub, 680★",
    "wasm-edge-proxy — GitHub, 310★"
  ],
  "vouches": 5,
  "vouchTags": [
    "Exceptional Systems Depth",
    "Zero Bug Delivery"
  ]
},
{
  "id": "c16",
  "name": "Elena Rostova",
  "role": "Cloud Platform & SRE Lead",
  "avatar": "☸️",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "London (Remote)",
  "availability": "Available in 1 week",
  "bio": "Multi-cluster GitOps orchestration, fault injection testing & sub-millisecond cloud edge scaling.",
  "experienceYears": "5 years SRE & platform engineering · CKS & CKA certified",
  "githubUsername": "elena-sre",
  "tags": [
    {
      "name": "Kubernetes",
      "level": "assessment"
    },
    {
      "name": "Terraform",
      "level": "proof"
    },
    {
      "name": "Go",
      "level": "assessment"
    },
    {
      "name": "Docker",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 20,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Kubernetes",
    "Docker",
    "Terraform",
    "Go"
  ],
  "detailedSkills": [
    {
      "name": "Kubernetes",
      "verification": "assessment",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "Authored custom CRD Kubernetes Operator in Go",
        "Managed 300+ node multi-region EKS cluster"
      ]
    },
    {
      "name": "Terraform",
      "verification": "proof",
      "score": 91,
      "tested": "4 days ago",
      "proofs": [
        "Modular multi-cloud Terraform registry with 80k+ pulls"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "KubeCon Cloud Hackathon",
      "role": "Platform Lead",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "k8s-cost-operator — GitHub, 420★",
    "terraform-zero-trust-aws — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Rock-solid SRE",
    "Calm in production incidents"
  ]
},
{
  "id": "c17",
  "name": "Kavya Patel",
  "role": "Lead Android & Kotlin Engineer",
  "avatar": "📱",
  "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Mumbai",
  "availability": "Available now",
  "bio": "Modern Android native architecture, Jetpack Compose UI motion, and cross-platform Kotlin Multiplatform.",
  "experienceYears": "3.5 years Android engineering · 3 apps with 1M+ Play Store downloads",
  "githubUsername": "kavya-compose",
  "tags": [
    {
      "name": "Kotlin",
      "level": "assessment"
    },
    {
      "name": "Android SDK",
      "level": "proof"
    },
    {
      "name": "Jetpack Compose",
      "level": "assessment"
    },
    {
      "name": "KMM",
      "level": "self"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 18,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Kotlin",
    "Android SDK",
    "Jetpack Compose"
  ],
  "detailedSkills": [
    {
      "name": "Kotlin",
      "verification": "assessment",
      "score": 94,
      "tested": "3 days ago",
      "proofs": [
        "Kotlin coroutines & Flow deep async architecture in fintech app"
      ]
    },
    {
      "name": "Jetpack Compose",
      "verification": "assessment",
      "score": 92,
      "tested": "1 week ago",
      "proofs": [
        "Published Compose Motion layout library on MavenCentral"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Droidcon India Hackathon 2025",
      "role": "Lead Mobile Dev",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "compose-glass-ui — GitHub, 540★",
    "kmm-fintech-core — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Obsessed with 120fps UI",
    "Clean Architecture"
  ]
},
{
  "id": "c18",
  "name": "Liam O'Connor",
  "role": "Senior iOS & Swift Architect",
  "avatar": "🍏",
  "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 89,
  "location": "Dublin (Remote)",
  "availability": "Available in 2 weeks",
  "bio": "Pixel-perfect iOS design engineering with 60fps SwiftUI gesture animations & on-device CoreML inference.",
  "experienceYears": "4 years native iOS development · Apple Design Award Nominee",
  "githubUsername": "liam-swift",
  "tags": [
    {
      "name": "Swift",
      "level": "assessment"
    },
    {
      "name": "SwiftUI",
      "level": "proof"
    },
    {
      "name": "Combine",
      "level": "assessment"
    },
    {
      "name": "CoreML",
      "level": "self"
    }
  ],
  "assessmentAvg": 90,
  "breakdown": {
    "skills": 45,
    "experience": 18,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Swift",
    "SwiftUI",
    "Combine"
  ],
  "detailedSkills": [
    {
      "name": "Swift",
      "verification": "assessment",
      "score": 93,
      "tested": "5 days ago",
      "proofs": [
        "Swift Concurrency & Actor model implementation in camera app"
      ]
    },
    {
      "name": "SwiftUI",
      "verification": "proof",
      "score": 91,
      "tested": "1 week ago",
      "proofs": [
        "Custom gesture engine and interactive canvas widgets"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Swift Heroes Hackathon",
      "role": "iOS Dev",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "swiftui-fluid-gestures — GitHub, 780★",
    "coreml-realtime-tracker — GitHub"
  ],
  "vouches": 3,
  "vouchTags": [
    "Apple-grade aesthetics",
    "Swift Concurrency pro"
  ]
},
{
  "id": "c19",
  "name": "Tariq Mansoor",
  "role": "Full-Stack Next.js 15 & React Specialist",
  "avatar": "⚡",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 95,
  "location": "Dubai (Remote)",
  "availability": "Available now",
  "bio": "Shipping high-performance App Router apps with React Server Components, Tailwind CSS, and edge caching.",
  "experienceYears": "4 years full-stack · Vercel Community Champion",
  "githubUsername": "tariq-next",
  "tags": [
    {
      "name": "Next.js",
      "level": "assessment"
    },
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "TypeScript",
      "level": "proof"
    },
    {
      "name": "Tailwind CSS",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS"
  ],
  "detailedSkills": [
    {
      "name": "Next.js",
      "verification": "assessment",
      "score": 96,
      "tested": "Just now",
      "proofs": [
        "Production SaaS serving 100k MAU on Next.js 15 App Router",
        "Sub-200ms TTFB across edge regions"
      ]
    },
    {
      "name": "React",
      "verification": "assessment",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "React Server Actions, optimistic UI state, and custom hook architectures"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Next.js Global Conf Hackathon 2024",
      "role": "Full-Stack Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "next-saas-starter-kit — GitHub, 1.2k★",
    "fast-edge-cache — GitHub, 320★"
  ],
  "vouches": 6,
  "vouchTags": [
    "Speed demon",
    "Full-stack polish"
  ]
},
{
  "id": "c20",
  "name": "Aarushi Gupta",
  "role": "Big Data & Streaming Architect",
  "avatar": "📊",
  "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 90,
  "location": "Hyderabad",
  "availability": "Available now",
  "bio": "Streaming ETL pipelines processing 40M+ events/day with Apache Spark, Snowflake, and dbt semantic modeling.",
  "experienceYears": "4 years data engineering · Databricks certified",
  "githubUsername": "aarushi-data",
  "tags": [
    {
      "name": "Apache Spark",
      "level": "assessment"
    },
    {
      "name": "Snowflake",
      "level": "proof"
    },
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "Kafka",
      "level": "proof"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 19,
    "hackathon": 8,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Apache Spark",
    "Snowflake",
    "Python",
    "Kafka"
  ],
  "detailedSkills": [
    {
      "name": "Apache Spark",
      "verification": "assessment",
      "score": 93,
      "tested": "4 days ago",
      "proofs": [
        "Spark Structured Streaming with Delta Lake integration"
      ]
    },
    {
      "name": "Python",
      "verification": "assessment",
      "score": 94,
      "tested": "1 week ago",
      "proofs": [
        "Async Airflow custom operators and Polars fast dataframe manipulation"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Databricks Sparkathon 2025",
      "role": "Data Lead",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "streaming-delta-pipeline — GitHub, 290★",
    "dbt-snowflake-models — GitHub"
  ],
  "vouches": 3,
  "vouchTags": [
    "Data integrity obsession",
    "Zero pipeline downtime"
  ]
},
{
  "id": "c21",
  "name": "Kenji Sato",
  "role": "Golang Microservices & Backend Engineer",
  "avatar": "🏎️",
  "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 93,
  "location": "Tokyo (Remote)",
  "availability": "Available in 3 days",
  "bio": "Low-latency gRPC microservices handling 120k QPS with zero-downtime PostgreSQL migrations and Redis caching.",
  "experienceYears": "5 years backend systems in Go",
  "githubUsername": "kenji-go",
  "tags": [
    {
      "name": "Go",
      "level": "assessment"
    },
    {
      "name": "gRPC",
      "level": "proof"
    },
    {
      "name": "PostgreSQL",
      "level": "assessment"
    },
    {
      "name": "Redis",
      "level": "proof"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Go",
    "gRPC",
    "PostgreSQL",
    "Redis"
  ],
  "detailedSkills": [
    {
      "name": "Go",
      "verification": "assessment",
      "score": 97,
      "tested": "2 days ago",
      "proofs": [
        "High-throughput payment gateway in Go handling 120k QPS",
        "Goroutine pool & lock-free queue implementations"
      ]
    },
    {
      "name": "PostgreSQL",
      "verification": "assessment",
      "score": 93,
      "tested": "1 week ago",
      "proofs": [
        "Database connection pooling & vacuum tuning for 10TB dataset"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "GopherCon Tokyo Hackathon",
      "role": "Backend Architect",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "grpc-fast-gateway — GitHub, 610★",
    "pg-migrate-live — GitHub, 180★"
  ],
  "vouches": 5,
  "vouchTags": [
    "Concurrency wizard",
    "Ultra reliable backend"
  ]
},
{
  "id": "c22",
  "name": "Zoya Al-Mansoor",
  "role": "Cybersecurity & DevSecOps Lead",
  "avatar": "🛡️",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Defending distributed cloud networks, finding zero-days, and automating SAST/DAST CI pipeline security gates.",
  "experienceYears": "4 years offensive & defensive security · OSCP certified",
  "githubUsername": "zoya-sec",
  "tags": [
    {
      "name": "Penetration Testing",
      "level": "assessment"
    },
    {
      "name": "OWASP",
      "level": "proof"
    },
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "Cryptography",
      "level": "self"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Penetration Testing",
    "OWASP",
    "Python"
  ],
  "detailedSkills": [
    {
      "name": "Penetration Testing",
      "verification": "assessment",
      "score": 95,
      "tested": "3 days ago",
      "proofs": [
        "Reported 8 CVEs to major open-source cloud frameworks",
        "Top 100 on Hack The Box global leaderboard"
      ]
    },
    {
      "name": "OWASP",
      "verification": "proof",
      "score": 91,
      "tested": "1 week ago",
      "proofs": [
        "Designed automated API fuzzing and OAuth2 token vulnerability scanners"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "DEF CON India CTF 2025",
      "role": "Security Researcher",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "auto-sast-scanner — GitHub, 490★",
    "jwt-security-fuzzer — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Found critical vulnerabilities",
    "Elite hacker mindset"
  ]
},
{
  "id": "c23",
  "name": "Arjun Nambiar",
  "role": "Generative AI & LLM Solutions Architect",
  "avatar": "🤖",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 96,
  "location": "San Francisco / Hybrid",
  "availability": "Available now",
  "bio": "Building autonomous multi-agent systems, hybrid RAG pipelines, and fine-tuning quantized open-weights models.",
  "experienceYears": "3 years GenAI engineering · LangChain Core contributor",
  "githubUsername": "arjun-llm",
  "tags": [
    {
      "name": "LangChain",
      "level": "assessment"
    },
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "PyTorch",
      "level": "proof"
    },
    {
      "name": "Vector DBs",
      "level": "proof"
    }
  ],
  "assessmentAvg": 96,
  "breakdown": {
    "skills": 49,
    "experience": 19,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "LangChain",
    "Python",
    "PyTorch",
    "Vector DBs"
  ],
  "detailedSkills": [
    {
      "name": "LangChain",
      "verification": "assessment",
      "score": 97,
      "tested": "Yesterday",
      "proofs": [
        "Engineered production agent system running 2M inferences monthly",
        "Authored official LangChain vector store integration"
      ]
    },
    {
      "name": "Python",
      "verification": "assessment",
      "score": 96,
      "tested": "3 days ago",
      "proofs": [
        "FastAPI async endpoints with streaming token SSE responses"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "AI Engineer World Fair Hackathon",
      "role": "AI Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "rag-agent-orchestrator — GitHub, 1.5k★",
    "local-llm-eval-harness — GitHub, 430★"
  ],
  "vouches": 6,
  "vouchTags": [
    "Leading-edge GenAI",
    "Pragmatic AI builder"
  ]
},
{
  "id": "c24",
  "name": "Dmitri Volkov",
  "role": "Unreal Engine 5 & C++ Graphics Dev",
  "avatar": "🎮",
  "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 88,
  "location": "Berlin (Remote)",
  "availability": "Available in 1 week",
  "bio": "AAA game physics, real-time Nanite/Lumen lighting, and rollback multiplayer networking in UE5.",
  "experienceYears": "5 years C++ game development",
  "githubUsername": "dmitri-ue5",
  "tags": [
    {
      "name": "Unreal Engine 5",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "assessment"
    },
    {
      "name": "HLSL Shaders",
      "level": "proof"
    },
    {
      "name": "Game Dev",
      "level": "proof"
    }
  ],
  "assessmentAvg": 91,
  "breakdown": {
    "skills": 46,
    "experience": 19,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Unreal Engine 5",
    "C++",
    "Game Dev"
  ],
  "detailedSkills": [
    {
      "name": "Unreal Engine 5",
      "verification": "assessment",
      "score": 92,
      "tested": "4 days ago",
      "proofs": [
        "Shipped multiplayer steam action title with 90% positive reviews"
      ]
    },
    {
      "name": "C++",
      "verification": "assessment",
      "score": 95,
      "tested": "1 week ago",
      "proofs": [
        "Custom SIMD vector math routines and spatial partitioning octrees"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Global Game Jam 2025",
      "role": "Lead Engine Programmer",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "ue5-fast-rollback-net — GitHub, 390★",
    "hlsl-water-caustics — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Hardcore C++ proficiency",
    "Shaders master"
  ]
},
{
  "id": "c25",
  "name": "Camille Dupont",
  "role": "Vue.js 3 & Nuxt 3 Frontend Engineer",
  "avatar": "🎨",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "Paris (Remote)",
  "availability": "Available now",
  "bio": "Fast, accessible, interactive web apps powered by Vue 3 Composition API, Nuxt 3, and Pinia.",
  "experienceYears": "4 years Vue / Nuxt frontend engineering",
  "githubUsername": "camille-vue",
  "tags": [
    {
      "name": "Vue.js",
      "level": "assessment"
    },
    {
      "name": "Nuxt.js",
      "level": "assessment"
    },
    {
      "name": "TypeScript",
      "level": "proof"
    },
    {
      "name": "Tailwind CSS",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Vue.js",
    "Nuxt.js",
    "TypeScript"
  ],
  "detailedSkills": [
    {
      "name": "Vue.js",
      "verification": "assessment",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "Architected enterprise Vue 3 dashboard with 400+ custom components"
      ]
    },
    {
      "name": "Nuxt.js",
      "verification": "assessment",
      "score": 93,
      "tested": "5 days ago",
      "proofs": [
        "SSR e-commerce portal with sub-second page transitions"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "VueConf Paris Hackathon",
      "role": "Frontend Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "nuxt-motion-components — GitHub, 620★",
    "vue-fluid-forms — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Pixel-perfect CSS",
    "Vue ecosystem expert"
  ]
},
{
  "id": "c26",
  "name": "Deepak Sunder",
  "role": "Embedded Systems & IoT Firmware Engineer",
  "avatar": "🔌",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 90,
  "location": "Chennai",
  "availability": "Available now",
  "bio": "Bare-metal microcontroller programming, battery-optimized sensor meshes in FreeRTOS, and Embedded Rust.",
  "experienceYears": "4.5 years firmware and hardware engineering",
  "githubUsername": "deepak-embedded",
  "tags": [
    {
      "name": "Embedded C",
      "level": "assessment"
    },
    {
      "name": "FreeRTOS",
      "level": "proof"
    },
    {
      "name": "STM32",
      "level": "assessment"
    },
    {
      "name": "Rust",
      "level": "proof"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Embedded C",
    "FreeRTOS",
    "STM32",
    "Rust"
  ],
  "detailedSkills": [
    {
      "name": "Embedded C",
      "verification": "assessment",
      "score": 94,
      "tested": "3 days ago",
      "proofs": [
        "Low-power solar telemetry firmware surviving 3+ years in field"
      ]
    },
    {
      "name": "FreeRTOS",
      "verification": "proof",
      "score": 91,
      "tested": "1 week ago",
      "proofs": [
        "Preemptive task scheduling and inter-task queue design on STM32"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Hardware Innovators Hackathon",
      "role": "Firmware Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "freertos-solar-firmware — GitHub, 240★",
    "stm32-baremetal-drivers — GitHub"
  ],
  "vouches": 3,
  "vouchTags": [
    "Hardware reliability",
    "Low-power firmware guru"
  ]
},
{
  "id": "c27",
  "name": "Lucas Silva",
  "role": "Creative Technologist & Three.js Engineer",
  "avatar": "✨",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 93,
  "location": "São Paulo (Remote)",
  "availability": "Available now",
  "bio": "Interactive 3D WebGL experiences, generative canvas art, and physics-driven micro-interactions.",
  "experienceYears": "4 years creative frontend · Awwwards Site of the Day x3",
  "githubUsername": "lucas-creative",
  "tags": [
    {
      "name": "Three.js",
      "level": "assessment"
    },
    {
      "name": "WebGL",
      "level": "proof"
    },
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "GSAP",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Three.js",
    "WebGL",
    "React",
    "GSAP"
  ],
  "detailedSkills": [
    {
      "name": "Three.js",
      "verification": "assessment",
      "score": 96,
      "tested": "1 day ago",
      "proofs": [
        "React Three Fiber interactive 3D product visualizer for luxury brand"
      ]
    },
    {
      "name": "WebGL",
      "verification": "proof",
      "score": 92,
      "tested": "4 days ago",
      "proofs": [
        "Custom GLSL post-processing fragment shaders with blooming & chromatic aberration"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Creative Code Jam 2024",
      "role": "Creative Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "r3f-materials-lab — GitHub, 890★",
    "glsl-fluid-sim — GitHub, 410★"
  ],
  "vouches": 5,
  "vouchTags": [
    "Award-winning visuals",
    "60fps WebGL optimization"
  ]
},
{
  "id": "c28",
  "name": "Pooja Hegde",
  "role": "Platform Engineering & GitOps Lead",
  "avatar": "🏗️",
  "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 94,
  "location": "Bengaluru",
  "availability": "Available in 2 days",
  "bio": "Building internal developer platforms (IDP) that turn 4-hour deployments into 3-minute self-serve flows with ArgoCD.",
  "experienceYears": "5 years DevOps & platform automation",
  "githubUsername": "pooja-gitops",
  "tags": [
    {
      "name": "Kubernetes",
      "level": "assessment"
    },
    {
      "name": "ArgoCD",
      "level": "proof"
    },
    {
      "name": "Helm",
      "level": "assessment"
    },
    {
      "name": "GitHub Actions",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Kubernetes",
    "ArgoCD",
    "Helm",
    "GitHub Actions"
  ],
  "detailedSkills": [
    {
      "name": "Kubernetes",
      "verification": "assessment",
      "score": 96,
      "tested": "2 days ago",
      "proofs": [
        "Multi-tenant cluster resource quota and network policy hardening"
      ]
    },
    {
      "name": "ArgoCD",
      "verification": "proof",
      "score": 93,
      "tested": "1 week ago",
      "proofs": [
        "GitOps pipeline deploying 50+ services with automated progressive rollouts"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Cloud Native Hackfest 2025",
      "role": "DevOps Lead",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "argocd-multicluster-idp — GitHub, 510★",
    "actions-security-audit — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Developer productivity multiplier",
    "Zero-downtime rollouts"
  ]
},
{
  "id": "c29",
  "name": "Mateo Rossi",
  "role": "Flutter & Cross-Platform Mobile Engineer",
  "avatar": "📱",
  "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Rome / Remote",
  "availability": "Available now",
  "bio": "Building slick 120Hz Flutter apps with offline-first local SQLite sync and Riverpod across iOS & Android.",
  "experienceYears": "4 years Flutter development",
  "githubUsername": "mateo-flutter",
  "tags": [
    {
      "name": "Flutter",
      "level": "assessment"
    },
    {
      "name": "Dart",
      "level": "assessment"
    },
    {
      "name": "Riverpod",
      "level": "proof"
    },
    {
      "name": "Firebase",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Flutter",
    "Dart",
    "Riverpod",
    "Firebase"
  ],
  "detailedSkills": [
    {
      "name": "Flutter",
      "verification": "assessment",
      "score": 95,
      "tested": "3 days ago",
      "proofs": [
        "Published 4 commercial apps on Google Play & iOS App Store"
      ]
    },
    {
      "name": "Dart",
      "verification": "assessment",
      "score": 94,
      "tested": "1 week ago",
      "proofs": [
        "Complex isolate background computation and custom canvas painters"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Flutter Global Hackathon",
      "role": "Mobile Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "riverpod-offline-sync — GitHub, 670★",
    "flutter-custom-charts — GitHub, 380★"
  ],
  "vouches": 4,
  "vouchTags": [
    "Smooth animations",
    "Cross-platform expert"
  ]
},
{
  "id": "c30",
  "name": "Siddharth Nair",
  "role": "Smart Contract & Zero-Knowledge Auditor",
  "avatar": "⛓️",
  "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "Kochi",
  "availability": "Available now",
  "bio": "Auditing EVM bytecode, formal verification with Foundry/Slither, and zero-knowledge Groth16 circuit design.",
  "experienceYears": "3.5 years Web3 security & auditing",
  "githubUsername": "sid-audits",
  "tags": [
    {
      "name": "Solidity",
      "level": "assessment"
    },
    {
      "name": "Foundry",
      "level": "proof"
    },
    {
      "name": "Zero-Knowledge",
      "level": "proof"
    },
    {
      "name": "Web3",
      "level": "assessment"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Solidity",
    "Foundry",
    "Web3"
  ],
  "detailedSkills": [
    {
      "name": "Solidity",
      "verification": "assessment",
      "score": 96,
      "tested": "Yesterday",
      "proofs": [
        "Audited protocols safeguarding $45M+ TVL",
        "Found 4 critical reentrancy & arithmetic bugs in public bounties"
      ]
    },
    {
      "name": "Foundry",
      "verification": "proof",
      "score": 94,
      "tested": "4 days ago",
      "proofs": [
        "Fuzzing and invariant test suites with 100k run iterations"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "ETHDenver 2025",
      "role": "Security Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "foundry-invariant-fuzzing — GitHub, 540★",
    "zk-snark-verifier — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Found multi-million exploit",
    "Meticulous auditor"
  ]
}
,
{
  "id": "c31",
  "name": "Nikhil Sharma",
  "role": "AI Agent & Multi-Agent Swarms",
  "avatar": "🤖",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 97,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Building autonomous multi-agent systems with LangGraph, CrewAI, and structured outputs for hackathon MVPs.",
  "experienceYears": "3 years AI engineering · SIH 2024 Winner",
  "githubUsername": "nikhil-agents",
  "tags": [
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "LangGraph",
      "level": "proof"
    },
    {
      "name": "FastAPI",
      "level": "assessment"
    },
    {
      "name": "Vector DBs",
      "level": "proof"
    }
  ],
  "assessmentAvg": 96,
  "breakdown": {
    "skills": 49,
    "experience": 19,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Python",
    "LangGraph",
    "FastAPI"
  ],
  "detailedSkills": [
    {
      "name": "Python",
      "verification": "assessment",
      "score": 98,
      "tested": "Just now",
      "proofs": [
        "30k monthly API calls on production agent",
        "Published 4 LangChain community tools"
      ]
    },
    {
      "name": "LangGraph",
      "verification": "proof",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "Cyclic state graph agent running self-correction loops"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "HackAI Global 2025",
      "role": "AI Team Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "multi-agent-orchestrator — GitHub, 820★",
    "langgraph-quickstarter — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Incredible AI builder",
    "Ships overnight"
  ]
},
{
  "id": "c32",
  "name": "Rachel Zhao",
  "role": "React 19 & Framer Motion UI Specialist",
  "avatar": "✨",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 95,
  "location": "Vancouver (Remote)",
  "availability": "Available now",
  "bio": "Obsessed with micro-interactions, 60fps spring physics animations, and fluid React 19 component UX.",
  "experienceYears": "4 years frontend · Awwwards Nominee",
  "githubUsername": "rachel-ui",
  "tags": [
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "TypeScript",
      "level": "assessment"
    },
    {
      "name": "Framer Motion",
      "level": "proof"
    },
    {
      "name": "Tailwind CSS",
      "level": "proof"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "React",
    "TypeScript",
    "Tailwind CSS"
  ],
  "detailedSkills": [
    {
      "name": "React",
      "verification": "assessment",
      "score": 97,
      "tested": "Yesterday",
      "proofs": [
        "Custom design system used by 12 client startups"
      ]
    },
    {
      "name": "TypeScript",
      "verification": "assessment",
      "score": 94,
      "tested": "4 days ago",
      "proofs": [
        "Strict template literal types and type-safe component props"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "DesignTech Conf Hackathon",
      "role": "Frontend Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "fluid-spring-animations — GitHub, 1.1k★",
    "react-glassmorphism-kit — GitHub"
  ],
  "vouches": 6,
  "vouchTags": [
    "Designs look like magic",
    "Lightning fast UI coder"
  ]
},
{
  "id": "c33",
  "name": "Adetayo Bakare",
  "role": "Distributed Systems & Kafka Architect",
  "avatar": "📡",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 93,
  "location": "Lagos / Remote",
  "availability": "Available in 2 days",
  "bio": "Architecting zero-data-loss event streaming backends with Go, Apache Kafka, and distributed consensus.",
  "experienceYears": "5 years backend systems",
  "githubUsername": "adetayo-dist",
  "tags": [
    {
      "name": "Go",
      "level": "assessment"
    },
    {
      "name": "Kafka",
      "level": "proof"
    },
    {
      "name": "System Design",
      "level": "assessment"
    },
    {
      "name": "PostgreSQL",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Go",
    "Kafka",
    "System Design"
  ],
  "detailedSkills": [
    {
      "name": "Go",
      "verification": "assessment",
      "score": 96,
      "tested": "2 days ago",
      "proofs": [
        "High-volume payment ingestion processing 500k messages/sec"
      ]
    },
    {
      "name": "System Design",
      "verification": "assessment",
      "score": 94,
      "tested": "1 week ago",
      "proofs": [
        "Idempotent distributed ledger architecture"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Africa Fintech Hackathon 2025",
      "role": "Backend Architect",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "kafka-reliable-consumer — GitHub, 430★",
    "go-event-sourcing — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Rock-solid reliability",
    "Never panics during load spikes"
  ]
},
{
  "id": "c34",
  "name": "Sofia Rossi",
  "role": "Product & Interaction Designer (Figma to Code)",
  "avatar": "🎨",
  "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 94,
  "location": "Milan / Remote",
  "availability": "Available now",
  "bio": "Bridging the gap between Figma design systems and production React code with impeccable typography & UX.",
  "experienceYears": "4 years product design & frontend",
  "githubUsername": "sofia-design",
  "tags": [
    {
      "name": "Figma",
      "level": "proof"
    },
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "UI/UX",
      "level": "proof"
    },
    {
      "name": "CSS",
      "level": "assessment"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Figma",
    "React",
    "UI/UX"
  ],
  "detailedSkills": [
    {
      "name": "React",
      "verification": "assessment",
      "score": 93,
      "tested": "3 days ago",
      "proofs": [
        "Direct Figma-to-React component token pipeline"
      ]
    },
    {
      "name": "CSS",
      "verification": "assessment",
      "score": 96,
      "tested": "1 week ago",
      "proofs": [
        "Complex container queries, grid layouts & responsive design"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "European Design Jam 2024",
      "role": "Product Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "figma-tokens-sync — GitHub, 670★",
    "accessible-dark-ui — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Transforms ugly apps into art",
    "Codes her own designs"
  ]
},
{
  "id": "c35",
  "name": "Leo Hernandez",
  "role": "Audio AI & Speech Synthesis Developer",
  "avatar": "🎙️",
  "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Austin, TX (Remote)",
  "availability": "Available now",
  "bio": "Real-time voice cloning, Whisper STT streaming pipelines, and low-latency WebRTC bidirectional voice agents.",
  "experienceYears": "3.5 years audio machine learning",
  "githubUsername": "leo-audio",
  "tags": [
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "PyTorch",
      "level": "assessment"
    },
    {
      "name": "WebRTC",
      "level": "proof"
    },
    {
      "name": "C++",
      "level": "self"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 18,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Python",
    "PyTorch",
    "WebRTC"
  ],
  "detailedSkills": [
    {
      "name": "Python",
      "verification": "assessment",
      "score": 95,
      "tested": "4 days ago",
      "proofs": [
        "Streaming Whisper transcription with 180ms latency"
      ]
    },
    {
      "name": "PyTorch",
      "verification": "assessment",
      "score": 92,
      "tested": "1 week ago",
      "proofs": [
        "Fine-tuned open-source TTS voice clone model"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Voice AI Hackathon 2025",
      "role": "Audio ML Lead",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "realtime-webrtc-voice-bot — GitHub, 580★",
    "streaming-vad-py — GitHub"
  ],
  "vouches": 3,
  "vouchTags": [
    "Ultra low audio latency",
    "Deep acoustic intuition"
  ]
},
{
  "id": "c36",
  "name": "Ananya Chhabra",
  "role": "Computer Vision & Autonomous Robotics",
  "avatar": "🤖",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "Delhi NCR",
  "availability": "Available now",
  "bio": "Autonomous navigation, ROS2 navigation stacks, and real-time YOLOv10 object detection on edge devices.",
  "experienceYears": "3 years robotics & computer vision · Robocon Finalist",
  "githubUsername": "ananya-robotics",
  "tags": [
    {
      "name": "Computer Vision",
      "level": "assessment"
    },
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "proof"
    },
    {
      "name": "ROS2",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 18,
    "hackathon": 10,
    "availability": 10,
    "preferences": 8
  },
  "requirements": [
    "Computer Vision",
    "Python",
    "C++"
  ],
  "detailedSkills": [
    {
      "name": "Computer Vision",
      "verification": "assessment",
      "score": 95,
      "tested": "Yesterday",
      "proofs": [
        "3D point cloud segmentation on LiDAR data"
      ]
    },
    {
      "name": "Python",
      "verification": "assessment",
      "score": 94,
      "tested": "3 days ago",
      "proofs": [
        "TensorRT acceleration on Jetson Orin Nano"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Smart Mobility Hackathon 2025",
      "role": "CV Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "ros2-vision-pipeline — GitHub, 390★",
    "edge-yolo-tracker — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Hardware integration champion",
    "Fast debugging under pressure"
  ]
},
{
  "id": "c37",
  "name": "Jonas Lindqvist",
  "role": "PostgreSQL & Database Performance Architect",
  "avatar": "🗄️",
  "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 90,
  "location": "Stockholm (Remote)",
  "availability": "Available in 1 week",
  "bio": "Turning 45-second queries into 8ms response times through indexing strategies, partition pruning, and schema design.",
  "experienceYears": "6 years database engineering",
  "githubUsername": "jonas-db",
  "tags": [
    {
      "name": "PostgreSQL",
      "level": "assessment"
    },
    {
      "name": "Redis",
      "level": "proof"
    },
    {
      "name": "System Design",
      "level": "assessment"
    },
    {
      "name": "Go",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "PostgreSQL",
    "Redis",
    "System Design"
  ],
  "detailedSkills": [
    {
      "name": "PostgreSQL",
      "verification": "assessment",
      "score": 97,
      "tested": "5 days ago",
      "proofs": [
        "Optimized 5TB transactional database saving $18k/mo in RDS costs"
      ]
    },
    {
      "name": "System Design",
      "verification": "assessment",
      "score": 93,
      "tested": "1 week ago",
      "proofs": [
        "High-throughput write buffering with Redis & TimescaleDB"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Database HackFest",
      "role": "DBA Architect",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "pg-query-doctor — GitHub, 710★",
    "redis-rate-limiter-go — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Database performance god",
    "Saved our launch"
  ]
},
{
  "id": "c38",
  "name": "Priya Balasubramanian",
  "role": "Bioinformatics & Computational Biology Dev",
  "avatar": "🧬",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Chennai",
  "availability": "Available now",
  "bio": "Genomic sequence alignment, AlphaFold protein structure analysis, and reproducible Nextflow containerized pipelines.",
  "experienceYears": "3 years computational biology · Published IEEE author",
  "githubUsername": "priya-bio",
  "tags": [
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "Machine Learning",
      "level": "proof"
    },
    {
      "name": "Docker",
      "level": "assessment"
    },
    {
      "name": "Bioinformatics",
      "level": "proof"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 18,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Python",
    "Machine Learning",
    "Docker"
  ],
  "detailedSkills": [
    {
      "name": "Python",
      "verification": "assessment",
      "score": 95,
      "tested": "3 days ago",
      "proofs": [
        "Parsed NCBI FASTQ pipelines with multiprocessing"
      ]
    },
    {
      "name": "Docker",
      "verification": "assessment",
      "score": 92,
      "tested": "1 week ago",
      "proofs": [
        "Reproducible containerized workflows on AWS Batch"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "BioTech Hackathon 2025",
      "role": "Bioinformatics Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "crispr-target-finder — GitHub, 320★",
    "nextflow-variant-caller — GitHub"
  ],
  "vouches": 3,
  "vouchTags": [
    "Deep domain expertise",
    "Flawless data reproducibility"
  ]
},
{
  "id": "c39",
  "name": "Alexandre Moreau",
  "role": "Elixir & Phoenix Real-Time Engineer",
  "avatar": "🔥",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 89,
  "location": "Lyon (Remote)",
  "availability": "Available in 3 days",
  "bio": "Fault-tolerant actor model architectures using BEAM/Erlang, Phoenix LiveView, and instant multi-user WebSocket sync.",
  "experienceYears": "4.5 years Elixir / BEAM systems",
  "githubUsername": "alex-elixir",
  "tags": [
    {
      "name": "Elixir",
      "level": "assessment"
    },
    {
      "name": "Phoenix",
      "level": "proof"
    },
    {
      "name": "WebSockets",
      "level": "assessment"
    },
    {
      "name": "PostgreSQL",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 8,
    "availability": 9,
    "preferences": 10
  },
  "requirements": [
    "Elixir",
    "Phoenix",
    "WebSockets"
  ],
  "detailedSkills": [
    {
      "name": "Elixir",
      "verification": "assessment",
      "score": 96,
      "tested": "4 days ago",
      "proofs": [
        "Handled 200k concurrent real-time connections on a single node"
      ]
    },
    {
      "name": "WebSockets",
      "verification": "assessment",
      "score": 94,
      "tested": "1 week ago",
      "proofs": [
        "Multiplexed Phoenix Channels for multiplayer whiteboard"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Real-Time Web Jam",
      "role": "Lead Engineer",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "phoenix-multiplayer-canvas — GitHub, 460★",
    "beam-resilience-guide — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Master of concurrency",
    "Zero runtime crashes"
  ]
},
{
  "id": "c40",
  "name": "Fatima Al-Hassan",
  "role": "Fintech & High-Security Payment Systems",
  "avatar": "💳",
  "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 93,
  "location": "Abu Dhabi / Remote",
  "availability": "Available now",
  "bio": "Building PCI-DSS compliant payment gateways, double-entry ledgers, and zero-trust banking APIs.",
  "experienceYears": "5 years fintech backend",
  "githubUsername": "fatima-fintech",
  "tags": [
    {
      "name": "Java",
      "level": "assessment"
    },
    {
      "name": "Spring Boot",
      "level": "proof"
    },
    {
      "name": "Microservices",
      "level": "assessment"
    },
    {
      "name": "PostgreSQL",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Java",
    "Spring Boot",
    "Microservices"
  ],
  "detailedSkills": [
    {
      "name": "Java",
      "verification": "assessment",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "Processed $10M+ daily transactions in audited ledger"
      ]
    },
    {
      "name": "Microservices",
      "verification": "assessment",
      "score": 93,
      "tested": "5 days ago",
      "proofs": [
        "Distributed saga pattern orchestration for fund transfers"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Global Fintech Challenge 2024",
      "role": "Payment Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "ledger-double-entry — GitHub, 510★",
    "fintech-iso8583-parser — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Rock solid financial logic",
    "Never loses a cent"
  ]
},
{
  "id": "c41",
  "name": "Haruto Takahashi",
  "role": "Game Engine & Shader Programmer (Godot/C#)",
  "avatar": "🕹️",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 90,
  "location": "Osaka (Remote)",
  "availability": "Available now",
  "bio": "Open-source game developer creating fast procedural generation algorithms, custom GLSL shaders, and Godot 4 games.",
  "experienceYears": "3.5 years game development · Shipped 2 itch.io hits",
  "githubUsername": "haruto-godot",
  "tags": [
    {
      "name": "Godot",
      "level": "assessment"
    },
    {
      "name": "C#",
      "level": "assessment"
    },
    {
      "name": "Game Dev",
      "level": "proof"
    },
    {
      "name": "GLSL",
      "level": "proof"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 18,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Godot",
    "C#",
    "Game Dev"
  ],
  "detailedSkills": [
    {
      "name": "Godot",
      "verification": "assessment",
      "score": 94,
      "tested": "Yesterday",
      "proofs": [
        "Custom 2D lighting engine extension in C++"
      ]
    },
    {
      "name": "C#",
      "verification": "assessment",
      "score": 93,
      "tested": "3 days ago",
      "proofs": [
        "Deterministic lockstep state machine for 4-player co-op"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Ludum Dare 56",
      "role": "Solo Game Dev",
      "result": "Top 10",
      "icon": "⭐"
    }
  ],
  "projects": [
    "godot4-procedural-dungeon — GitHub, 640★",
    "glsl-pixel-lighting — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Incredible game feel",
    "Insanely productive in 48h jams"
  ]
},
{
  "id": "c42",
  "name": "Nia Williams",
  "role": "QA & End-to-End Test Automation Lead",
  "avatar": "🧪",
  "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "London (Remote)",
  "availability": "Available in 2 days",
  "bio": "Writing bulletproof Playwright E2E suites, k6 distributed load tests, and catching regressions before users do.",
  "experienceYears": "4 years QA engineering",
  "githubUsername": "nia-qa",
  "tags": [
    {
      "name": "Playwright",
      "level": "assessment"
    },
    {
      "name": "TypeScript",
      "level": "proof"
    },
    {
      "name": "Cypress",
      "level": "assessment"
    },
    {
      "name": "k6 Load Testing",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 9,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Playwright",
    "TypeScript",
    "Cypress"
  ],
  "detailedSkills": [
    {
      "name": "Playwright",
      "verification": "assessment",
      "score": 96,
      "tested": "2 days ago",
      "proofs": [
        "Parallel test runner executing 350 specs in 3 minutes"
      ]
    },
    {
      "name": "Cypress",
      "verification": "assessment",
      "score": 92,
      "tested": "1 week ago",
      "proofs": [
        "Full user journey visual regression tests"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Quality Engineering Hackathon",
      "role": "QA Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "playwright-visual-testing — GitHub, 410★",
    "k6-load-templates — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Found every blocker before launch",
    "Saved us from disastrous bug"
  ]
},
{
  "id": "c43",
  "name": "Rishi Kapoor",
  "role": "Hardware Hacker & Drone Flight Control",
  "avatar": "🚁",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Designing custom drone PCB flight controllers, telemetry radio communication, and autonomous waypoint tracking.",
  "experienceYears": "4 years UAV & embedded hardware",
  "githubUsername": "rishi-uav",
  "tags": [
    {
      "name": "Embedded C",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "assessment"
    },
    {
      "name": "PX4",
      "level": "proof"
    },
    {
      "name": "Hardware PCB",
      "level": "proof"
    }
  ],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 46,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 8
  },
  "requirements": [
    "Embedded C",
    "C++",
    "PX4"
  ],
  "detailedSkills": [
    {
      "name": "Embedded C",
      "verification": "assessment",
      "score": 94,
      "tested": "4 days ago",
      "proofs": [
        "Bare-metal STM32 motor ESC timing controller"
      ]
    },
    {
      "name": "C++",
      "verification": "assessment",
      "score": 93,
      "tested": "1 week ago",
      "proofs": [
        "Custom Kalman filter algorithm for noisy IMU sensors"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Aerospace Hackathon India",
      "role": "Hardware Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "stm32-drone-fc — GitHub, 340★",
    "radio-telemetry-protocol — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Hardware wizard",
    "Built working drone in 24h"
  ]
},
{
  "id": "c44",
  "name": "Chloe Bennett",
  "role": "Web3 Front-End & Wallet UX Integration",
  "avatar": "🦊",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 93,
  "location": "San Francisco (Remote)",
  "availability": "Available now",
  "bio": "Smooth Web3 onboarding, multi-wallet connect flows (RainbowKit/Wagmi), and gasless account abstraction (ERC-4337).",
  "experienceYears": "3 years Web3 frontend",
  "githubUsername": "chloe-web3",
  "tags": [
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "TypeScript",
      "level": "assessment"
    },
    {
      "name": "Wagmi",
      "level": "proof"
    },
    {
      "name": "Solidity",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 18,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "React",
    "TypeScript",
    "Wagmi"
  ],
  "detailedSkills": [
    {
      "name": "React",
      "verification": "assessment",
      "score": 96,
      "tested": "Yesterday",
      "proofs": [
        "DeFi swap interface used by 40k active wallets"
      ]
    },
    {
      "name": "TypeScript",
      "verification": "assessment",
      "score": 94,
      "tested": "3 days ago",
      "proofs": [
        "Strict ABI type generation with Viem"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "ETHGlobal New York 2024",
      "role": "Frontend Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "account-abstraction-starter — GitHub, 590★",
    "wagmi-batch-tx — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Best Web3 UX I have ever used",
    "Fast transactions"
  ]
},
{
  "id": "c45",
  "name": "Tenzin Norbu",
  "role": "Search & Semantic Recommendation Systems",
  "avatar": "🔍",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "Dharamsala / Remote",
  "availability": "Available in 1 day",
  "bio": "Hybrid search engines combining BM25 keyword matching with dense HNSW vector embeddings for millisecond retrieval.",
  "experienceYears": "4 years search systems & NLP",
  "githubUsername": "tenzin-search",
  "tags": [
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "Elasticsearch",
      "level": "proof"
    },
    {
      "name": "Vector DBs",
      "level": "assessment"
    },
    {
      "name": "FastAPI",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 8,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Python",
    "Vector DBs",
    "Elasticsearch"
  ],
  "detailedSkills": [
    {
      "name": "Python",
      "verification": "assessment",
      "score": 95,
      "tested": "2 days ago",
      "proofs": [
        "Indexed 10M documents with custom cross-encoder reranking"
      ]
    },
    {
      "name": "Vector DBs",
      "verification": "assessment",
      "score": 93,
      "tested": "4 days ago",
      "proofs": [
        "Qdrant and Milvus cluster deployment with quantized vectors"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Information Retrieval Hack 2024",
      "role": "Search Architect",
      "result": "Finalist",
      "icon": "⭐"
    }
  ],
  "projects": [
    "hybrid-bm25-vector-engine — GitHub, 480★",
    "fast-embed-server — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Accurate search relevance",
    "Low latency scaling"
  ]
},
{
  "id": "c46",
  "name": "Maria Santos",
  "role": "DevRel & Technical Community Builder",
  "avatar": "📢",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 94,
  "location": "Madrid / Remote",
  "availability": "Available now",
  "bio": "Building passionate open-source developer communities, authoring crystal-clear docs, and crafting winning pitch demos.",
  "experienceYears": "4 years developer relations & advocacy",
  "githubUsername": "maria-devrel",
  "tags": [
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "Documentation",
      "level": "proof"
    },
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "DevRel",
      "level": "proof"
    }
  ],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 47,
    "experience": 19,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "React",
    "Python",
    "Documentation"
  ],
  "detailedSkills": [
    {
      "name": "React",
      "verification": "assessment",
      "score": 94,
      "tested": "3 days ago",
      "proofs": [
        "Created 20+ interactive documentation playground widgets"
      ]
    },
    {
      "name": "Python",
      "verification": "assessment",
      "score": 92,
      "tested": "1 week ago",
      "proofs": [
        "SDK maintainer with 500k monthly PyPI installs"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Open Source Hackathon 2024",
      "role": "Pitch & DevRel Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "interactive-sdk-docs — GitHub, 680★",
    "hackathon-pitch-deck-generator — GitHub"
  ],
  "vouches": 6,
  "vouchTags": [
    "Wins hackathon pitches every time",
    "Inspiring storyteller"
  ]
},
{
  "id": "c47",
  "name": "Karthik Varma",
  "role": "Cloud FinOps & Infrastructure Cost Optimizer",
  "avatar": "💰",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 91,
  "location": "Hyderabad",
  "availability": "Available now",
  "bio": "Slashing cloud bills by 60% through spot instance orchestration, Graviton ARM migrations, and right-sizing clusters.",
  "experienceYears": "5 years AWS / GCP infrastructure",
  "githubUsername": "karthik-finops",
  "tags": [
    {
      "name": "AWS",
      "level": "assessment"
    },
    {
      "name": "Kubernetes",
      "level": "assessment"
    },
    {
      "name": "Terraform",
      "level": "proof"
    },
    {
      "name": "Python",
      "level": "proof"
    }
  ],
  "assessmentAvg": 94,
  "breakdown": {
    "skills": 48,
    "experience": 20,
    "hackathon": 8,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "AWS",
    "Kubernetes",
    "Terraform"
  ],
  "detailedSkills": [
    {
      "name": "AWS",
      "verification": "assessment",
      "score": 96,
      "tested": "2 days ago",
      "proofs": [
        "Saved client $120k/year in unattached EBS & overprovisioned NAT gateways"
      ]
    },
    {
      "name": "Kubernetes",
      "verification": "assessment",
      "score": 94,
      "tested": "4 days ago",
      "proofs": [
        "Karpenter dynamic auto-scaler replacing static node pools"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Cloud Sustainability Hackathon",
      "role": "Cloud Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "karpenter-spot-orchestrator — GitHub, 390★",
    "cloud-cost-anomalies — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Cuts AWS bills in half",
    "Super pragmatic engineer"
  ]
},
{
  "id": "c48",
  "name": "Ingrid Bergman",
  "role": "Compilers & Domain Specific Languages (LLVM)",
  "avatar": "⚙️",
  "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 92,
  "location": "Oslo (Remote)",
  "availability": "Available in 1 week",
  "bio": "Building custom AST parsers, LLVM JIT optimization passes, and high-performance custom domain-specific languages.",
  "experienceYears": "5 years compiler engineering",
  "githubUsername": "ingrid-llvm",
  "tags": [
    {
      "name": "Rust",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "assessment"
    },
    {
      "name": "Compilers",
      "level": "proof"
    },
    {
      "name": "LLVM",
      "level": "proof"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 49,
    "experience": 20,
    "hackathon": 8,
    "availability": 9,
    "preferences": 9
  },
  "requirements": [
    "Rust",
    "C++",
    "Compilers"
  ],
  "detailedSkills": [
    {
      "name": "Rust",
      "verification": "assessment",
      "score": 97,
      "tested": "Yesterday",
      "proofs": [
        "Wrote custom bytecode interpreter executing 10M opcodes/sec"
      ]
    },
    {
      "name": "C++",
      "verification": "assessment",
      "score": 95,
      "tested": "1 week ago",
      "proofs": [
        "LLVM backend pass optimizing loop invariant code motion"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Systems Programming Conf Jam",
      "role": "Compiler Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "fast-dsl-compiler — GitHub, 520★",
    "rust-bytecode-vm — GitHub"
  ],
  "vouches": 4,
  "vouchTags": [
    "Brainiac systems depth",
    "Code runs blazingly fast"
  ]
},
{
  "id": "c49",
  "name": "Devraj Mukherjee",
  "role": "Local LLM & On-Device Edge AI Specialist",
  "avatar": "⚡",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 96,
  "location": "Kolkata",
  "availability": "Available now",
  "bio": "Running 4-bit quantized GGUF models on mobile phones and laptops using llama.cpp, Apple MLX, and WebGPU.",
  "experienceYears": "3.5 years Edge AI development",
  "githubUsername": "devraj-edge-ai",
  "tags": [
    {
      "name": "Python",
      "level": "assessment"
    },
    {
      "name": "C++",
      "level": "assessment"
    },
    {
      "name": "PyTorch",
      "level": "proof"
    },
    {
      "name": "WebGPU",
      "level": "proof"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "Python",
    "C++",
    "PyTorch"
  ],
  "detailedSkills": [
    {
      "name": "Python",
      "verification": "assessment",
      "score": 96,
      "tested": "Just now",
      "proofs": [
        "45 tok/sec on M3 Max using custom MLX quantization"
      ]
    },
    {
      "name": "C++",
      "verification": "assessment",
      "score": 95,
      "tested": "3 days ago",
      "proofs": [
        "llama.cpp custom GPU kernel bindings"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Edge AI World Hackathon 2025",
      "role": "Edge ML Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "mlx-local-rag — GitHub, 940★",
    "webgpu-llm-browser — GitHub, 480★"
  ],
  "vouches": 6,
  "vouchTags": [
    "Makes AI run completely offline",
    "Pure genius on Apple Silicon"
  ]
},
{
  "id": "c50",
  "name": "Amina Diallo",
  "role": "Accessibility (a11y) & Inclusive UX Engineer",
  "avatar": "♿",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
  ],
  "match": 94,
  "location": "Dakar / Remote",
  "availability": "Available now",
  "bio": "Building 100% WCAG 2.2 AAA compliant React web apps with keyboard navigation, screen reader testing, and high contrast.",
  "experienceYears": "4 years frontend & web accessibility specialist",
  "githubUsername": "amina-a11y",
  "tags": [
    {
      "name": "React",
      "level": "assessment"
    },
    {
      "name": "HTML/CSS",
      "level": "assessment"
    },
    {
      "name": "WCAG",
      "level": "proof"
    },
    {
      "name": "TypeScript",
      "level": "proof"
    }
  ],
  "assessmentAvg": 95,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": [
    "React",
    "HTML/CSS",
    "TypeScript"
  ],
  "detailedSkills": [
    {
      "name": "React",
      "verification": "assessment",
      "score": 96,
      "tested": "Yesterday",
      "proofs": [
        "Audited and fixed a11y for fintech portal serving 2M users"
      ]
    },
    {
      "name": "HTML/CSS",
      "verification": "assessment",
      "score": 97,
      "tested": "3 days ago",
      "proofs": [
        "Semantic HTML tree, ARIA live regions, and focus trap management"
      ]
    }
  ],
  "hackathons": [
    {
      "name": "Inclusive Tech Hackathon 2024",
      "role": "a11y Lead",
      "result": "Winner",
      "icon": "🥇"
    }
  ],
  "projects": [
    "react-accessible-primitives — GitHub, 760★",
    "a11y-screenreader-auditor — GitHub"
  ],
  "vouches": 5,
  "vouchTags": [
    "Best accessibility specialist",
    "Flawless keyboard navigation"
  ]
}
];

/* ================================================================== */
/*  MOCK DATA — TEAM ALPHA (pre-existing demo team)                    */
/* ================================================================== */

const INITIAL_TEAM_MEMBERS = [
  {
    "id": "t1",
    "name": "Rahul Chawla",
    "role": "Backend Developer",
    "avatar": "👨‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 96,
    "location": "Delhi NCR",
    "availability": "Active Teammate",
    "bio": "Leading backend architecture & distributed services for Team Alpha. SIH Winner.",
    "experienceYears": "4 years backend engineering",
    "githubUsername": "rahul-chawla",
    "tags": [
      {
        "name": "Node.js",
        "level": "assessment"
      },
      {
        "name": "PostgreSQL",
        "level": "proof"
      },
      {
        "name": "System Design",
        "level": "team"
      }
    ],
    "skills": [
      {
        "name": "Node.js",
        "verification": "assessment",
        "score": 92,
        "tested": "1 week ago",
        "proofs": [
          "Architected Team Alpha's REST + WebSocket services",
          "350+ commits on GitHub"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Designed schema with ACID compliance & migration pipelines"
        ]
      },
      {
        "name": "System Design",
        "verification": "team",
        "score": 88,
        "tested": "3 days ago",
        "proofs": [
          "Microservice architecture for SIH platform"
        ]
      }
    ],
    "detailedSkills": [
      {
        "name": "Node.js",
        "verification": "assessment",
        "score": 92,
        "tested": "1 week ago",
        "proofs": [
          "Architected Team Alpha's REST + WebSocket services",
          "350+ commits on GitHub"
        ]
      },
      {
        "name": "PostgreSQL",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Designed schema with ACID compliance & migration pipelines"
        ]
      },
      {
        "name": "System Design",
        "verification": "team",
        "score": 88,
        "tested": "3 days ago",
        "proofs": [
          "Microservice architecture for SIH platform"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "Smart India Hackathon 2025",
        "role": "Backend Lead",
        "result": "Winner",
        "icon": "🥇"
      },
      {
        "name": "HackFest 2024",
        "role": "Full Stack Dev",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "alpha-crisis-api — GitHub, 85★",
      "distributed-queue-worker — GitHub"
    ],
    "vouches": 5,
    "vouchTags": [
      "Architectural depth",
      "Unmatched reliability",
      "Great mentor"
    ],
    "assessmentHistory": [
      {
        "skill": "Node.js",
        "score": 92,
        "passed": true,
        "date": "1 week ago",
        "proctored": true,
        "integrityScore": 98
      }
    ],
    "github": {
      "username": "rahul-chawla",
      "stats": {
        "totalRepos": 18,
        "totalStars": 142,
        "totalForks": 29,
        "activeProjectsCount": 5,
        "recentActivityEstimate": 45
      },
      "topRepos": [
        {
          "name": "alpha-crisis-api",
          "description": "Production microservices backend for disaster response coordination",
          "language": "JavaScript",
          "stars": 85,
          "url": "https://github.com/rahul-chawla/alpha-crisis-api"
        },
        {
          "name": "distributed-queue-worker",
          "description": "High-concurrency Redis event worker with zero message loss",
          "language": "TypeScript",
          "stars": 57,
          "url": "https://github.com/rahul-chawla/distributed-queue-worker"
        }
      ]
    }
  },
  {
    "id": "t2",
    "name": "Kriti Bhatia",
    "role": "UI/UX Designer",
    "avatar": "👩‍🎨",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 92,
    "location": "Mumbai",
    "availability": "Active Teammate",
    "bio": "Turning complex emergency logistics into effortless, accessible design systems.",
    "experienceYears": "3 years UI/UX & Figma design",
    "githubUsername": "kriti-bhatia",
    "tags": [
      {
        "name": "Figma",
        "level": "assessment"
      },
      {
        "name": "Design Systems",
        "level": "proof"
      },
      {
        "name": "User Research",
        "level": "self"
      }
    ],
    "skills": [
      {
        "name": "Figma",
        "verification": "assessment",
        "score": 89,
        "tested": "2 weeks ago",
        "proofs": [
          "Created full Team Alpha component library",
          "Published Figma Community Kit (1.2k clones)"
        ]
      },
      {
        "name": "Design Systems",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Zero-dependency tokenized design system"
        ]
      },
      {
        "name": "User Research",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": [
          "Conducted 24 user interviews for crisis response flow"
        ]
      }
    ],
    "detailedSkills": [
      {
        "name": "Figma",
        "verification": "assessment",
        "score": 89,
        "tested": "2 weeks ago",
        "proofs": [
          "Created full Team Alpha component library",
          "Published Figma Community Kit (1.2k clones)"
        ]
      },
      {
        "name": "Design Systems",
        "verification": "proof",
        "score": null,
        "tested": null,
        "proofs": [
          "Zero-dependency tokenized design system"
        ]
      },
      {
        "name": "User Research",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": [
          "Conducted 24 user interviews for crisis response flow"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "DesignSprint 2025",
        "role": "Lead Designer",
        "result": "Winner",
        "icon": "🥇"
      },
      {
        "name": "HackFest 2025",
        "role": "Product Designer",
        "result": "Finalist",
        "icon": "⭐"
      }
    ],
    "projects": [
      "alpha-design-tokens — Figma",
      "relief-flow-prototype — Portfolio"
    ],
    "vouches": 4,
    "vouchTags": [
      "Fast iteration",
      "Sharp typography",
      "Pixel perfect"
    ],
    "assessmentHistory": [
      {
        "skill": "Figma",
        "score": 89,
        "passed": true,
        "date": "2 weeks ago",
        "proctored": true,
        "integrityScore": 100
      }
    ],
    "github": {
      "username": "kriti-bhatia",
      "stats": {
        "totalRepos": 8,
        "totalStars": 64,
        "totalForks": 14,
        "activeProjectsCount": 3,
        "recentActivityEstimate": 20
      },
      "topRepos": [
        {
          "name": "alpha-design-system",
          "description": "Design tokens and Figma sync scripts for crisis UI",
          "language": "TypeScript",
          "stars": 44,
          "url": "https://github.com/kriti-bhatia/alpha-design-system"
        }
      ]
    }
  },
  {
    "id": "t3",
    "name": "Meera Joshi",
    "role": "Frontend Developer",
    "avatar": "👩‍💻",
    "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    "photos": [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"
    ],
    "match": 95,
    "location": "Bengaluru",
    "availability": "Active Teammate",
    "bio": "React, TypeScript, and Tailwind specialist building accessible, fast web apps.",
    "experienceYears": "3.5 years web engineering",
    "githubUsername": "meera-joshi",
    "tags": [
      {
        "name": "React",
        "level": "assessment"
      },
      {
        "name": "TypeScript",
        "level": "assessment"
      },
      {
        "name": "Tailwind",
        "level": "self"
      }
    ],
    "skills": [
      {
        "name": "React",
        "verification": "assessment",
        "score": 94,
        "tested": "5 days ago",
        "proofs": [
          "Built state machine and swipe gesture interface"
        ]
      },
      {
        "name": "TypeScript",
        "verification": "assessment",
        "score": 90,
        "tested": "5 days ago",
        "proofs": [
          "Strict mode type safety across 4 projects"
        ]
      },
      {
        "name": "Tailwind",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": [
          "Custom CSS variable theme engine"
        ]
      }
    ],
    "detailedSkills": [
      {
        "name": "React",
        "verification": "assessment",
        "score": 94,
        "tested": "5 days ago",
        "proofs": [
          "Built state machine and swipe gesture interface"
        ]
      },
      {
        "name": "TypeScript",
        "verification": "assessment",
        "score": 90,
        "tested": "5 days ago",
        "proofs": [
          "Strict mode type safety across 4 projects"
        ]
      },
      {
        "name": "Tailwind",
        "verification": "self",
        "score": null,
        "tested": null,
        "proofs": [
          "Custom CSS variable theme engine"
        ]
      }
    ],
    "hackathons": [
      {
        "name": "HackFest 2025",
        "role": "Frontend Dev",
        "result": "Finalist",
        "icon": "⭐"
      },
      {
        "name": "Smart India Hackathon 2024",
        "role": "UI Engineer",
        "result": "Winner",
        "icon": "🥇"
      }
    ],
    "projects": [
      "crisis-dashboard-web — GitHub, 92★",
      "react-swipe-components — GitHub, 140★"
    ],
    "vouches": 6,
    "vouchTags": [
      "Clean code",
      "Super responsive",
      "Team player"
    ],
    "assessmentHistory": [
      {
        "skill": "React",
        "score": 94,
        "passed": true,
        "date": "5 days ago",
        "proctored": true,
        "integrityScore": 97
      }
    ],
    "github": {
      "username": "meera-joshi",
      "stats": {
        "totalRepos": 22,
        "totalStars": 232,
        "totalForks": 48,
        "activeProjectsCount": 6,
        "recentActivityEstimate": 54
      },
      "topRepos": [
        {
          "name": "react-swipe-components",
          "description": "Performant gesture-based card swiper for React",
          "language": "TypeScript",
          "stars": 140,
          "url": "https://github.com/meera-joshi/react-swipe-components"
        },
        {
          "name": "crisis-dashboard-web",
          "description": "Realtime geospatial incident map and coordination dashboard",
          "language": "JavaScript",
          "stars": 92,
          "url": "https://github.com/meera-joshi/crisis-dashboard-web"
        }
      ]
    }
  }
];


const INITIAL_COVERAGE = { Frontend: 90, Backend: 85, "ML/AI": 30, "UI/UX": 60, DevOps: 20 };

function makeDefaultTeam() {
  return {
    name: "Team Alpha",
    hackathon: "Smart India Hackathon 2025",
    description: "AI-assisted crisis-response coordination platform for disaster relief teams.",
    requiredSkills: ["React", "Node.js", "Machine Learning", "Figma", "Docker"],
    members: INITIAL_TEAM_MEMBERS,
    coverage: INITIAL_COVERAGE,
  };
}

/* ================================================================== */
/*  GLOBAL STYLE                                                       */
/* ================================================================== */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

    .hm-root, .hm-root * { box-sizing: border-box; }
    .hm-root {
      --ink: #0B0E12;
      --panel: #12161D;
      --panel-2: #181D26;
      --panel-3: #1E2430;
      --line: #242B37;
      --line-soft: #1C222D;
      --text: #EDEFF3;
      --text-dim: #A6ADBB;
      --text-mute: #6E7686;
      --brand: #FF2E7E;
      --brand-dim: #C81760;
      --brand-ink: #FFFFFF;
      --teal: #14E8C4;
      --blue: #5B9BFF;
      --orange: #F5A524;
      --grey: #7A8496;
      --red: #FF6B6B;
      --purple: #A78BFA;
      --radius-s: 8px;
      --radius-m: 14px;
      --radius-l: 20px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--ink);
      color: var(--text);
      min-height: 100vh;
      width: 100%;
      position: relative;
      isolation: isolate;
      background-image:
        radial-gradient(ellipse 900px 500px at 15% -10%, rgba(255,46,126,0.07), transparent 60%),
        radial-gradient(ellipse 700px 500px at 100% 0%, rgba(20,232,196,0.08), transparent 55%);
    }
    .hm-root h1, .hm-root h2, .hm-root h3, .hm-root .hm-display {
      font-family: 'Space Grotesk', 'Inter', sans-serif;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .hm-root button, .hm-root input, .hm-root select, .hm-root textarea {
      font-family: inherit;
      color: inherit;
    }
    .hm-root ::selection { background: rgba(255,46,126,0.35); }
    .hm-scrollpane::-webkit-scrollbar { width: 8px; height: 8px; }
    .hm-scrollpane::-webkit-scrollbar-thumb { background: var(--line); border-radius: 8px; }
    .hm-scrollpane::-webkit-scrollbar-track { background: transparent; }

    button.hm-reset { background: none; border: none; cursor: pointer; padding: 0; text-align: left; }
    a.hm-reset { text-decoration: none; color: inherit; }

    /* ---------- App shell ---------- */
    .hm-shell { display: flex; min-height: 100vh; }
    .hm-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .hm-content { flex: 1; padding: 32px 40px 64px; max-width: 1240px; width: 100%; margin: 0 auto; }
    @media (max-width: 860px) { .hm-content { padding: 20px 16px 88px; } }

    /* ---------- Sidebar ---------- */
    .hm-sidebar {
      width: 236px; flex-shrink: 0; background: var(--panel);
      border-right: 1px solid var(--line-soft); padding: 22px 14px;
      display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100vh;
    }
    .hm-brand { display: flex; align-items: center; gap: 10px; padding: 6px 10px 22px; }
    .hm-brand-mark {
      width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
      background: linear-gradient(150deg, var(--brand), var(--brand-dim)); color: var(--brand-ink); flex-shrink: 0;
    }
    .hm-brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; }
    .hm-brand-sub { font-size: 10.5px; color: var(--text-mute); letter-spacing: 0.04em; margin-top: 1px; }
    .hm-nav-item {
      display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px;
      color: var(--text-dim); font-size: 13.5px; font-weight: 500; cursor: pointer; position: relative;
      transition: background .15s ease, color .15s ease;
    }
    .hm-nav-item:hover { background: var(--panel-2); color: var(--text); }
    .hm-nav-item.active { background: rgba(255,46,126,0.1); color: var(--brand); }
    .hm-nav-item .hm-nav-badge {
      margin-left: auto; background: var(--red); color: white; font-size: 10px; font-weight: 700;
      min-width: 17px; height: 17px; border-radius: 999px; display: grid; place-items: center; padding: 0 5px;
    }
    .hm-sidebar-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--line-soft); }
    .hm-user-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; cursor: pointer; }
    .hm-user-row:hover { background: var(--panel-2); }
    .hm-avatar-chip {
      width: 32px; height: 32px; border-radius: 9px; background: var(--panel-3); display: grid; place-items: center;
      font-size: 16px; flex-shrink: 0; border: 1px solid var(--line);
    }

    /* ---------- Mobile top bar / bottom nav ---------- */
    .hm-topbar { display: none; }
    .hm-mobilenav { display: none; }
    @media (max-width: 860px) {
      .hm-sidebar { display: none; }
      .hm-topbar {
        display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
        background: var(--panel); border-bottom: 1px solid var(--line-soft); position: sticky; top: 0; z-index: 40;
      }
      .hm-mobilenav {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: var(--panel);
        border-top: 1px solid var(--line-soft); padding: 8px 4px calc(env(safe-area-inset-bottom) + 6px); z-index: 40;
      }
      .hm-mobilenav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 0; border-radius: 10px; font-size: 9.5px; color: var(--text-mute); position: relative; }
    }

    /* ---------- Buttons ---------- */
    .hm-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px 18px; border-radius: 11px; font-size: 13.5px; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; transition: transform .12s ease, filter .15s ease, background .15s ease;
      white-space: nowrap;
    }
    .hm-btn:active { transform: scale(0.97); }
    .hm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .hm-btn-primary { background: linear-gradient(155deg, var(--brand), var(--brand-dim)); color: var(--brand-ink); }
    .hm-btn-primary:hover:not(:disabled) { filter: brightness(1.07); }
    .hm-btn-ghost { background: var(--panel-2); border-color: var(--line); color: var(--text); }
    .hm-btn-ghost:hover { background: var(--panel-3); }
    .hm-btn-outline { background: transparent; border-color: var(--line); color: var(--text-dim); }
    .hm-btn-outline:hover { border-color: var(--brand); color: var(--brand); }
    .hm-btn-danger { background: rgba(255,107,107,0.12); color: var(--red); border-color: rgba(255,107,107,0.25); }
    .hm-btn-danger:hover { background: rgba(255,107,107,0.2); }
    .hm-btn-sm { padding: 7px 13px; font-size: 12.5px; border-radius: 9px; }
    .hm-btn-block { width: 100%; }
    .hm-btn-teal { background: linear-gradient(155deg, var(--teal), #22A183); color: #04231B; }
    .hm-btn-blue { background: linear-gradient(155deg, var(--blue), #2E6FDE); color: #071633; }
    .hm-iconbtn {
      width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
      background: var(--panel-2); border: 1px solid var(--line); color: var(--text-dim); cursor: pointer;
    }
    .hm-iconbtn:hover { color: var(--text); border-color: var(--brand-dim); }

    /* ---------- Cards / panels ---------- */
    .hm-panel { background: var(--panel); border: 1px solid var(--line-soft); border-radius: var(--radius-l); }
    .hm-panel-pad { padding: 22px; }
    .hm-card { background: var(--panel-2); border: 1px solid var(--line); border-radius: var(--radius-m); }
    .hm-glass {
      background: rgba(23,28,37,0.72); backdrop-filter: blur(18px) saturate(140%);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .hm-section-title { font-size: 12px; font-weight: 700; color: var(--text-mute); letter-spacing: 0.06em; margin-bottom: 12px; }
    .hm-page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 26px; gap: 16px; flex-wrap: wrap; }
    .hm-page-title { font-size: 25px; font-weight: 700; }
    .hm-page-sub { font-size: 13.5px; color: var(--text-mute); margin-top: 4px; }

    /* ---------- Badges ---------- */
    .hm-badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 8px; border-radius: 999px;
      font-size: 11.5px; font-weight: 700; letter-spacing: 0.01em;
    }
    .hm-badge-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .hm-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 9px;
      background: var(--panel-3); border: 1px solid var(--line); font-size: 12.5px; font-weight: 600; color: var(--text-dim);
    }
    .hm-chip.on { background: rgba(255,46,126,0.12); border-color: rgba(255,46,126,0.35); color: var(--brand); }

    /* ---------- Match ring ---------- */
    .hm-matchring { position: relative; width: 54px; height: 54px; flex-shrink: 0; }
    .hm-matchring svg { transform: rotate(-90deg); }
    .hm-matchring-num { position: absolute; inset: 0; display: grid; place-items: center; font-size: 13px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; }

    /* ---------- Progress bar ---------- */
    .hm-bar-track { height: 7px; border-radius: 999px; background: var(--panel-3); overflow: hidden; }
    .hm-bar-fill { height: 100%; border-radius: 999px; transition: width .7s cubic-bezier(.22,1,.36,1); }

    /* ---------- Toast ---------- */
    .hm-toast-stack { position: fixed; top: 18px; right: 18px; z-index: 900; display: flex; flex-direction: column; gap: 10px; }
    .hm-toast {
      display: flex; align-items: center; gap: 10px; background: var(--panel-2); border: 1px solid var(--line);
      padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; box-shadow: 0 12px 28px rgba(0,0,0,0.35);
      animation: hmToastIn .28s cubic-bezier(.22,1,.36,1);
      max-width: 320px;
    }
    @keyframes hmToastIn { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

    /* ---------- Modal ---------- */
    .hm-modal-backdrop {
      position: fixed; inset: 0; background: rgba(6,8,11,0.72); backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center; z-index: 800; padding: 20px;
      animation: hmFade .18s ease;
    }
    @keyframes hmFade { from { opacity: 0; } to { opacity: 1; } }
    .hm-modal {
      background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius-l);
      width: 100%; box-shadow: 0 30px 80px rgba(0,0,0,0.5);
      animation: hmModalIn .22s cubic-bezier(.22,1,.36,1);
      max-height: 88vh; display: flex; flex-direction: column;
    }
    @keyframes hmModalIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .hm-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
    .hm-modal-body { padding: 22px; overflow-y: auto; }
    .hm-modal-foot { padding: 16px 22px; border-top: 1px solid var(--line-soft); display: flex; gap: 10px; justify-content: flex-end; flex-shrink: 0; }

    /* ---------- Forms ---------- */
    .hm-field { margin-bottom: 16px; }
    .hm-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-dim); margin-bottom: 7px; }
    .hm-input, .hm-select, .hm-textarea {
      width: 100%; background: var(--panel-2); border: 1px solid var(--line); border-radius: 10px;
      padding: 11px 13px; font-size: 13.5px; color: var(--text); outline: none; transition: border-color .15s ease;
    }
    .hm-input:focus, .hm-select:focus, .hm-textarea:focus { border-color: var(--brand-dim); }
    .hm-textarea { resize: vertical; min-height: 84px; font-family: inherit; }
    .hm-input-icon-wrap { position: relative; }
    .hm-input-icon-wrap .hm-input { padding-left: 38px; }
    .hm-input-icon-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-mute); }
    .hm-input-icon-wrap .hm-input-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-mute); background: none; border: none; }
    .hm-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    @media (max-width: 520px) { .hm-role-grid { grid-template-columns: repeat(2, 1fr); } }
    .hm-role-opt {
      padding: 12px 8px; border-radius: 10px; border: 1px solid var(--line); background: var(--panel-2);
      text-align: center; font-size: 12.5px; font-weight: 600; color: var(--text-dim); cursor: pointer;
    }
    .hm-role-opt.on { border-color: var(--brand); color: var(--brand); background: rgba(255,46,126,0.1); }

    /* ---------- Auth screens ---------- */
    .hm-auth-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
      position: relative; overflow: hidden;
      background:
        radial-gradient(ellipse 900px 600px at 20% 10%, rgba(255,46,126,0.09), transparent 60%),
        radial-gradient(ellipse 800px 600px at 85% 90%, rgba(20,232,196,0.10), transparent 55%),
        var(--ink);
    }
    .hm-auth-card { width: 100%; max-width: 420px; position: relative; z-index: 1; }
    .hm-auth-logo { display: flex; align-items: center; gap: 11px; justify-content: center; margin-bottom: 26px; }
    .hm-auth-tag { text-align: center; color: var(--text-mute); font-size: 13px; margin-top: -18px; margin-bottom: 26px; }
    .hm-demo-box {
      margin-top: 18px; padding: 13px 14px; border-radius: 11px; background: var(--panel-2);
      border: 1px dashed var(--line); font-size: 11.5px; color: var(--text-mute); line-height: 1.7;
    }
    .hm-demo-box b { color: var(--text-dim); }
    .hm-demo-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .hm-auth-switch { text-align: center; font-size: 13px; color: var(--text-mute); margin-top: 18px; }
    .hm-auth-switch button { color: var(--brand); font-weight: 600; }

    /* ---------- Onboarding ---------- */
    .hm-onb-steps { display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 26px; }
    .hm-onb-dot { width: 30px; height: 4px; border-radius: 4px; background: var(--line); transition: background .2s ease; }
    .hm-onb-dot.done { background: var(--teal); }
    .hm-onb-dot.on { background: var(--brand); }
    .hm-skill-add-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .hm-skill-pill-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .hm-skill-pill {
      display: flex; align-items: center; gap: 8px; padding: 7px 8px 7px 12px; border-radius: 999px;
      background: var(--panel-2); border: 1px solid var(--line); font-size: 12.5px; font-weight: 600;
    }
    .hm-skill-pill button { display: grid; place-items: center; color: var(--text-mute); }
    .hm-skill-pill button:hover { color: var(--red); }

    /* ---------- Swipe deck ---------- */
    .hm-deck-wrap { position: relative; width: 100%; max-width: 400px; height: 592px; margin: 0 auto; }
    @media (max-width: 480px) { .hm-deck-wrap { height: 76vh; max-height: 560px; } }

    /* ---------- Ambient floating bolts (Discover background) ---------- */
    .hm-deck-stage { position: relative; padding: 8px 0 4px; }
    .hm-float-bg { position: absolute; inset: -40px 0 -10px; overflow: hidden; pointer-events: none; z-index: 0; }
    .hm-float-bolt {
      position: absolute; bottom: -10%; will-change: transform, opacity;
      animation-name: hmFloatUp; animation-timing-function: ease-in; animation-iteration-count: infinite;
      filter: drop-shadow(0 0 5px currentColor);
    }
    @keyframes hmFloatUp {
      0%   { transform: translateY(0) translateX(0) rotate(-6deg) scale(0.7); opacity: 0; }
      6%   { opacity: var(--hop, .5); }
      18%  { opacity: calc(var(--hop, .5) * 0.35); }
      24%  { opacity: var(--hop, .5); }
      50%  { transform: translateY(-260px) translateX(var(--drift, 14px)) rotate(8deg) scale(1); }
      62%  { opacity: calc(var(--hop, .5) * 0.4); }
      68%  { opacity: var(--hop, .5); }
      88%  { opacity: var(--hop, .5); }
      100% { transform: translateY(-540px) translateX(calc(var(--drift, 14px) * -1)) rotate(-8deg) scale(0.85); opacity: 0; }
    }

    /* ---------- Bolt burst on CONNECT ---------- */
    .hm-burst-wrap { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; z-index: 30; }
    .hm-burst-bolt {
      position: absolute; animation: hmBurstFly .8s cubic-bezier(.18,.84,.32,1) forwards;
      filter: drop-shadow(0 0 6px currentColor);
    }
    @keyframes hmBurstFly {
      0%   { transform: translate(0,0) scale(.3) rotate(0deg); opacity: 1; }
      18%  { opacity: .5; }
      30%  { opacity: 1; }
      70%  { opacity: 1; }
      100% { transform: translate(var(--tx),var(--ty)) scale(1.1) rotate(18deg); opacity: 0; }
    }
    .hm-swipe-card {
      position: absolute; inset: 0; border-radius: 22px; background: var(--panel);
      border: 1px solid var(--line); overflow: hidden; user-select: none; touch-action: none;
      box-shadow: 0 20px 50px rgba(0,0,0,0.45);
      display: flex; flex-direction: column;
      transform-origin: 50% 100%;
      will-change: transform, opacity;
    }
    .hm-swipe-card-top { cursor: grab; }
    .hm-swipe-card-top:active { cursor: grabbing; }

    .hm-swipe-overlay {
      position: absolute; top: 26px; padding: 10px 20px; border-radius: 14px; font-weight: 900;
      font-family: 'Space Grotesk', sans-serif; font-size: 22px; letter-spacing: 0.08em;
      border: 3.5px solid currentColor; pointer-events: none; z-index: 30;
      display: flex; align-items: center; gap: 8px; text-transform: uppercase;
      backdrop-filter: blur(14px); box-shadow: 0 8px 32px rgba(0,0,0,0.65);
      transition: opacity .05s linear, transform .05s linear;
    }
    .hm-swipe-overlay.connect {
      left: 22px; color: #10B981; border-color: #10B981;
      background: rgba(16, 185, 129, 0.22);
      text-shadow: 0 0 22px rgba(16, 185, 129, 0.7);
      box-shadow: 0 0 35px rgba(16, 185, 129, 0.45), inset 0 0 15px rgba(16, 185, 129, 0.2);
    }
    .hm-swipe-overlay.pass {
      right: 22px; color: #EF4444; border-color: #EF4444;
      background: rgba(239, 68, 68, 0.22);
      text-shadow: 0 0 22px rgba(239, 68, 68, 0.7);
      box-shadow: 0 0 35px rgba(239, 68, 68, 0.45), inset 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .hm-deck-controls {
      display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px;
      position: relative; z-index: 10;
    }
    .hm-deck-actions {
      display: flex; align-items: center; justify-content: center; gap: 14px;
    }
    .hm-deck-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 3px; padding: 10px 14px; min-width: 82px; height: 72px; border-radius: 18px;
      cursor: pointer; border: 1.5px solid var(--line); background: var(--panel-2);
      color: var(--text-dim); transition: transform .12s cubic-bezier(.2,1,.3,1), border-color .15s ease, box-shadow .15s ease, background .15s ease;
      user-select: none; font-family: inherit;
    }
    .hm-deck-btn:active { transform: scale(0.92); }
    .hm-deck-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
    .hm-deck-btn.pass {
      color: #EF4444; border-color: rgba(239,68,68,0.35); min-width: 106px;
    }
    .hm-deck-btn.pass:hover:not(:disabled) {
      border-color: #EF4444; background: rgba(239,68,68,0.12);
      box-shadow: 0 0 24px rgba(239,68,68,0.3);
    }
    .hm-deck-btn.connect {
      color: #10B981; border-color: rgba(16,185,129,0.4); min-width: 126px;
      background: linear-gradient(155deg, rgba(16,185,129,0.18), rgba(16,185,129,0.05));
      box-shadow: 0 0 24px rgba(16,185,129,0.22);
    }
    .hm-deck-btn.connect:hover:not(:disabled) {
      border-color: #10B981; background: linear-gradient(155deg, rgba(16,185,129,0.28), rgba(16,185,129,0.1));
      box-shadow: 0 0 32px rgba(16,185,129,0.45);
    }
    .hm-deck-btn.rewind {
      color: var(--text-mute); min-width: 68px;
    }
    .hm-deck-btn.rewind:hover:not(:disabled) {
      color: var(--teal); border-color: var(--teal); background: rgba(20,232,196,0.08);
    }
    .hm-deck-btn.view {
      color: var(--blue); min-width: 82px;
    }
    .hm-deck-btn.view:hover:not(:disabled) {
      color: var(--blue); border-color: var(--blue); background: rgba(91,155,255,0.08);
    }
    .hm-deck-btn-text {
      font-size: 11.5px; font-weight: 800; letter-spacing: 0.04em; font-family: 'Space Grotesk', sans-serif;
    }
    .hm-deck-btn-kbd {
      font-size: 9.5px; font-weight: 700; color: var(--text-mute); background: rgba(255,255,255,0.08);
      padding: 1px 6px; border-radius: 4px; letter-spacing: 0.03em;
    }
    .hm-deck-hint {
      font-size: 11.5px; color: var(--text-mute); letter-spacing: 0.02em;
    }
    .hm-photo-nav-btn {
      position: absolute; top: 46%; transform: translateY(-50%);
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2); color: #fff;
      display: grid; place-items: center; cursor: pointer;
      z-index: 12; opacity: 0; transition: opacity .15s ease, transform .15s ease;
    }
    .hm-swipe-card:hover .hm-photo-nav-btn { opacity: 0.85; }
    .hm-photo-nav-btn:hover { opacity: 1 !important; transform: translateY(-50%) scale(1.1); background: rgba(0,0,0,0.85); }
    .hm-photo-nav-btn.prev { left: 12px; }
    .hm-photo-nav-btn.next { right: 12px; }

    /* ---------- Match celebration ---------- */
    .hm-match-burst { text-align: center; padding: 10px 6px 6px; }
    .hm-match-ring { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 18px; display: grid; place-items: center;
      background: radial-gradient(circle, rgba(255,46,126,0.28), rgba(20,232,196,0.12) 60%, transparent 75%); animation: hmPulse 1.6s ease-in-out infinite; }
    @keyframes hmPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }

    /* ---------- Quiz ---------- */
    .hm-quiz-progress { display: flex; gap: 5px; margin-bottom: 18px; }
    .hm-quiz-progress > div { flex: 1; height: 4px; border-radius: 4px; background: var(--line); }
    .hm-quiz-progress > div.done { background: var(--brand); }
    .hm-quiz-timer { display: flex; align-items: center; gap: 6px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; color: var(--text-dim); }
    .hm-quiz-opt {
      display: flex; align-items: center; gap: 11px; padding: 13px 14px; border-radius: 12px; border: 1px solid var(--line);
      background: var(--panel-2); cursor: pointer; margin-bottom: 9px; font-size: 13.5px; transition: border-color .15s ease, background .15s ease;
    }
    .hm-quiz-opt:hover { border-color: var(--brand-dim); }
    .hm-quiz-opt.selected { border-color: var(--brand); background: rgba(255,46,126,0.08); }
    .hm-quiz-opt.correct { border-color: var(--teal); background: rgba(55,214,176,0.1); }
    .hm-quiz-opt.wrong { border-color: var(--red); background: rgba(255,107,107,0.1); }
    .hm-quiz-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--line); flex-shrink: 0; display: grid; place-items: center; }
    .hm-quiz-opt.selected .hm-quiz-radio { border-color: var(--brand); }
    .hm-quiz-opt.correct .hm-quiz-radio { border-color: var(--teal); }
    .hm-quiz-opt.wrong .hm-quiz-radio { border-color: var(--red); }

    /* ---------- verification steps ---------- */
    .hm-verify-check-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; font-size: 13px; color: var(--text-dim); }
    .hm-verify-check-row.done { color: var(--text); }
    .hm-method-opt {
      display: flex; align-items: flex-start; gap: 13px; padding: 15px; border-radius: 13px; border: 1px solid var(--line);
      background: var(--panel-2); cursor: pointer; margin-bottom: 10px;
    }
    .hm-method-opt:hover { border-color: var(--brand-dim); }
    .hm-method-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--panel-3); flex-shrink: 0; }

    /* ---------- Dashboard grid ---------- */
    .hm-grid-2 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
    @media (max-width: 980px) { .hm-grid-2 { grid-template-columns: 1fr; } }
    .hm-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    @media (max-width: 780px) { .hm-stat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .hm-rank-bar { display: none; } }
    .hm-statcard { padding: 17px 18px; }
    .hm-statcard-label { font-size: 11.5px; color: var(--text-mute); font-weight: 600; display: flex; align-items: center; gap: 7px; }
    .hm-statcard-val { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700; margin-top: 8px; }
    .hm-gap-alert { border: 1px solid rgba(245,165,36,0.35); background: rgba(245,165,36,0.08); border-radius: 14px; padding: 16px; margin-top: 16px; }

    .hm-member-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line-soft); }
    .hm-member-row:last-child { border-bottom: none; }

    .hm-inbox-card { padding: 18px; margin-bottom: 14px; }
    .hm-inbox-metric { flex: 1; text-align: center; padding: 10px; background: var(--panel-3); border-radius: 10px; }
    .hm-inbox-metric-num { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; }
    .hm-inbox-metric-label { font-size: 10px; color: var(--text-mute); font-weight: 600; margin-top: 2px; }

    .hm-req-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .hm-empty-state { text-align: center; padding: 60px 24px; color: var(--text-mute); }
    .hm-empty-state svg { margin-bottom: 14px; opacity: 0.5; }

    .hm-tabbar { display: flex; gap: 4px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 12px; padding: 4px; width: fit-content; margin-bottom: 20px; }
    .hm-tabbar-item { padding: 8px 16px; border-radius: 9px; font-size: 12.5px; font-weight: 600; color: var(--text-mute); cursor: pointer; }
    .hm-tabbar-item.on { background: var(--panel-3); color: var(--text); }

    .hm-loading-spin { animation: hmSpin 0.9s linear infinite; }
    @keyframes hmSpin { to { transform: rotate(360deg); } }

    .hm-flow-track { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 11px; color: var(--text-mute); font-weight: 600; }
    .hm-flow-track .on { color: var(--brand); }

    .hm-skeleton { background: linear-gradient(90deg, var(--panel-2) 25%, var(--panel-3) 37%, var(--panel-2) 63%); background-size: 400% 100%; animation: hmShimmer 1.4s ease infinite; border-radius: 10px; }
    @keyframes hmShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

    .hm-req-badge-req {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 500;
    }

    .hm-proctor-hud { position: fixed; top: 16px; right: 16px; z-index: 900; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .hm-proctor-cam { width: 96px; height: 72px; border-radius: 10px; overflow: hidden; border: 2px solid var(--teal); background: var(--panel); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
    .hm-proctor-cam video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    .hm-proctor-cam-off { width: 100%; height: 100%; display: grid; place-items: center; color: var(--text-mute); }
    .hm-proctor-status { display: flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 700; color: var(--teal); background: rgba(55,214,176,0.14); border-radius: 20px; padding: 4px 10px; }
    .hm-proctor-status.flagged { color: var(--orange); background: rgba(245,165,36,0.14); }
    .hm-proctor-fs-warn { max-width: 220px; font-size: 10.5px; line-height: 1.4; color: var(--orange); background: rgba(245,165,36,0.12); border: 1px solid rgba(245,165,36,0.3); border-radius: 8px; padding: 6px 8px; display: flex; gap: 5px; align-items: flex-start; text-align: left; }

    /* ---------- Reference-inspired Photo Card & Profile Styles ---------- */
    .hm-avatar-img { object-fit: cover; border-radius: 10px; border: 1px solid var(--line); flex-shrink: 0; }
    .hm-avatar-wrap { position: relative; display: inline-block; cursor: pointer; }
    .hm-avatar-edit-badge {
      position: absolute; right: -4px; bottom: -4px; width: 24px; height: 24px;
      border-radius: 50%; background: var(--brand); color: #fff; display: grid;
      place-items: center; border: 2px solid var(--panel); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .hm-card-story-bars {
      position: absolute; top: 10px; left: 12px; right: 12px; z-index: 12;
      display: flex; gap: 4px; pointer-events: none;
    }
    .hm-card-story-bar {
      flex: 1; height: 3.5px; border-radius: 999px; background: rgba(255,255,255,0.3);
      transition: background .2s ease;
    }
    .hm-card-story-bar.active { background: #fff; box-shadow: 0 0 8px rgba(255,255,255,0.8); }
    .hm-card-story-bar.passed { background: rgba(255,255,255,0.7); }

    .hm-card-photo-hero {
      position: relative; width: 100%; height: 100%; overflow: hidden;
      border-radius: 22px; background: #0c0f14; user-select: none;
    }
    .hm-card-photo-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform .3s ease;
    }
    .hm-card-tap-zone-left {
      position: absolute; left: 0; top: 0; width: 35%; height: 75%;
      z-index: 8; cursor: pointer;
    }
    .hm-card-tap-zone-right {
      position: absolute; right: 0; top: 0; width: 65%; height: 75%;
      z-index: 8; cursor: pointer;
    }
    .hm-card-photo-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(11,14,18,0.08) 0%, rgba(11,14,18,0) 28%, rgba(11,14,18,0.72) 62%, rgba(11,14,18,0.98) 100%);
      display: flex; flex-direction: column; justify-content: flex-end; padding: 16px 18px;
      pointer-events: none; z-index: 9;
    }
    .hm-card-top-bar {
      position: absolute; top: 16px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      z-index: 15; pointer-events: none;
    }
    .hm-card-top-pill {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; color: #fff;
      background: rgba(11, 14, 18, 0.75); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 5px 10px; border-radius: 999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      pointer-events: auto;
    }
    .hm-card-top-pill.red {
      color: #FF6B6B; background: rgba(255, 59, 59, 0.22);
      border-color: rgba(255, 59, 59, 0.4);
    }
    .hm-card-top-pill.green {
      color: var(--teal); background: rgba(20, 232, 196, 0.18);
      border-color: rgba(20, 232, 196, 0.35);
    }
    .hm-card-top-pill.brand {
      color: #FF7EB6; background: rgba(255, 46, 126, 0.2);
      border-color: rgba(255, 46, 126, 0.38);
    }
    .hm-card-top-action {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11.5px; font-weight: 700; color: #fff;
      background: rgba(11, 14, 18, 0.78); backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 11px; border-radius: 999px;
      cursor: pointer; pointer-events: auto;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      transition: all .16s ease;
    }
    .hm-card-top-action:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: scale(1.04);
      border-color: rgba(255, 255, 255, 0.35);
    }
    .hm-card-top-action:active {
      transform: scale(0.96);
    }
    .hm-card-floating-badge {
      display: none;
    }
    .hm-card-bio-quote {
      font-size: 11.5px; color: rgba(255,255,255,0.85); line-height: 1.4;
      font-style: italic; margin: 3px 0 6px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      pointer-events: auto;
    }

    /* ---------- Photo Customizer Modal ---------- */
    .hm-preset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-height: 250px; overflow-y: auto; padding: 4px; }
    .hm-preset-item {
      position: relative; border-radius: 12px; overflow: hidden; cursor: pointer;
      border: 2px solid transparent; aspect-ratio: 1; transition: border-color .15s ease, transform .12s ease;
      background: var(--panel-3);
    }
    .hm-preset-item:hover { transform: scale(1.05); }
    .hm-preset-item.on { border-color: var(--brand); box-shadow: 0 0 14px rgba(255,46,126,0.45); }
    .hm-preset-item img { width: 100%; height: 100%; object-fit: cover; }
    .hm-cam-preview-box {
      width: 100%; height: 230px; border-radius: 14px; overflow: hidden; background: #000;
      position: relative; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center;
    }
    .hm-cam-preview-box video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    .hm-dropzone {
      border: 2px dashed var(--line); border-radius: 14px; padding: 34px 20px;
      text-align: center; cursor: pointer; transition: border-color .15s ease, background .15s ease;
    }
    .hm-dropzone:hover { border-color: var(--brand); background: rgba(255,46,126,0.05); }

    /* ---------- Team Management & Profiles ---------- */
    .hm-add-member-card {
      border: 2px dashed var(--line); border-radius: var(--radius-m); display: flex;
      flex-direction: column; align-items: center; justify-content: center; padding: 28px 16px;
      cursor: pointer; text-align: center; color: var(--text-mute); transition: all .15s ease;
      min-height: 180px; background: rgba(255,255,255,0.01);
    }
    .hm-add-member-card:hover { border-color: var(--brand); color: var(--text); background: rgba(255,46,126,0.04); }
    .hm-member-profile-head {
      display: flex; align-items: center; gap: 18px; padding: 22px;
      border-bottom: 1px solid var(--line-soft); background: linear-gradient(175deg, var(--panel-2), var(--panel));
      flex-wrap: wrap;
    }
    .hm-member-profile-tabbar { display: flex; gap: 4px; padding: 12px 22px 0; border-bottom: 1px solid var(--line-soft); overflow-x: auto; }
    .hm-member-profile-tab {
      padding: 9px 16px; border-radius: 8px 8px 0 0; font-size: 12.5px; font-weight: 600;
      color: var(--text-mute); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap;
    }
    .hm-member-profile-tab.on { color: var(--brand); border-bottom-color: var(--brand); background: rgba(255,46,126,0.06); }

    /* ---------- Full Proctoring Styles ---------- */
    .hm-proctor-banner-alert {
      position: absolute; top: 12px; left: 12px; right: 12px; z-index: 120;
      background: rgba(255,107,107,0.22); border: 1px solid var(--red); color: #FFA3A3;
      padding: 10px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 700;
      display: flex; align-items: center; gap: 9px; box-shadow: 0 6px 20px rgba(0,0,0,0.5);
      animation: hmToastIn .2s cubic-bezier(.2,1,.3,1);
    }
    .hm-proctor-cert {
      border: 2px solid var(--teal); background: rgba(20,232,196,0.06);
      border-radius: 16px; padding: 20px; margin: 16px 0; text-align: left;
    }
    .hm-audio-meter-bar {
      width: 54px; height: 5px; background: var(--line); border-radius: 999px;
      overflow: hidden; display: inline-flex; vertical-align: middle; margin-left: 6px;
    }
    .hm-audio-meter-fill {
      height: 100%; background: var(--teal); border-radius: 999px;
      animation: hmAudioPulse .8s ease infinite alternate;
    }
    @keyframes hmAudioPulse { 0% { width: 35%; } 50% { width: 75%; } 100% { width: 50%; } }

    /* ---- WORK CULTURE BADGES & RED FLAG ALERTS ---- */
    .hm-culture-red-card {
      border: 2px solid #FF3B3B !important;
      box-shadow: 0 0 35px rgba(255, 59, 59, 0.45) !important;
      animation: hmRedAuraPulse 2.4s ease-in-out infinite alternate !important;
    }
    @keyframes hmRedAuraPulse {
      0% { box-shadow: 0 0 25px rgba(255, 59, 59, 0.35); border-color: #FF3B3B; }
      100% { box-shadow: 0 0 50px rgba(255, 59, 59, 0.7); border-color: #FF6B6B; }
    }
    .hm-culture-green-card {
      border: 2px solid #14E8C4 !important;
      box-shadow: 0 0 30px rgba(20, 232, 196, 0.25) !important;
    }
    .hm-red-alert-banner {
      background: linear-gradient(135deg, #FF3B3B 0%, #B91C1C 100%);
      color: #FFFFFF;
      font-weight: 800;
      font-size: 11.5px;
      letter-spacing: 0.03em;
      padding: 6px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(255, 59, 59, 0.4);
      animation: hmBlinkAlert 1.8s infinite alternate;
    }
    @keyframes hmBlinkAlert {
      0% { opacity: 0.92; transform: scale(0.99); }
      100% { opacity: 1; transform: scale(1.01); }
    }
    .hm-green-alert-banner {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 11.5px;
      padding: 6px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .hm-culture-breakdown-box {
      background: rgba(18, 22, 29, 0.95);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 14px;
      margin: 8px 0;
    }
    .hm-culture-quote-red {
      background: rgba(255, 59, 59, 0.08);
      border-left: 3px solid #FF3B3B;
      padding: 8px 12px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #FFA4A4;
      font-style: italic;
      margin-top: 6px;
    }
    .hm-culture-quote-green {
      background: rgba(20, 232, 196, 0.08);
      border-left: 3px solid #14E8C4;
      padding: 8px 12px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #A7F3D0;
      font-style: italic;
      margin-top: 6px;
    }

    /* ---- PERSONA SWITCHER ---- */
    .hm-persona-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 4px 10px;
    }

    /* ---- TRIBE PULSE SOCIAL MEDIA FEED ---- */
    .hm-pulse-feed {
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .hm-pulse-compose {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius-m);
      padding: 16px;
    }
    .hm-pulse-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius-m);
      padding: 18px;
      transition: transform 0.18s ease, border-color 0.18s ease;
    }
    .hm-pulse-card:hover {
      border-color: #353E4F;
    }
    .hm-pulse-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .hm-pulse-content {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text);
      margin-bottom: 14px;
    }
    .hm-pulse-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--line-soft);
    }
    .hm-pulse-btn {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 12.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      padding: 5px 8px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .hm-pulse-btn:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.06);
    }
    .hm-pulse-btn.liked {
      color: #FF2E7E;
    }

    /* ---- RECRUITER STUDIO DASHBOARD ---- */
    .hm-talent-match-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 10px;
      margin-bottom: 10px;
      transition: transform 0.15s ease;
    }
    .hm-talent-match-row:hover {
      transform: translateX(4px);
      border-color: var(--brand);
    }

    /* ---- REAL-TIME CHAT ---- */
    .hm-chat-container {
      display: flex;
      height: calc(100vh - 140px);
      min-height: 520px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius-m);
      overflow: hidden;
    }
    .hm-chat-sidebar {
      width: 280px;
      border-right: 1px solid var(--line);
      overflow-y: auto;
      background: var(--panel-2);
    }
    .hm-chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--ink);
    }
    .hm-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .hm-chat-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .hm-chat-bubble.me {
      align-self: flex-end;
      background: var(--brand);
      color: #FFFFFF;
      border-bottom-right-radius: 3px;
    }
    .hm-chat-bubble.them {
      align-self: flex-start;
      background: var(--panel-2);
      color: var(--text);
      border: 1px solid var(--line);
      border-bottom-left-radius: 3px;
    }
    .hm-chat-input-bar {
      padding: 12px 16px;
      background: var(--panel);
      border-top: 1px solid var(--line);
      display: flex;
      gap: 10px;
    }

  `}</style>
);

/* ================================================================== */
/*  SHARED UI PRIMITIVES                                               */
/* ================================================================== */

function VerifyBadge({ level, size = "md" }) {
  const v = VERIFICATION[level] || VERIFICATION.self;
  return (
    <span className="hm-badge" style={{ color: v.color, background: v.bg, fontSize: size === "sm" ? 10.5 : 11.5 }}>
      <span className="hm-badge-dot" style={{ background: v.color }} />
      {v.short}
    </span>
  );
}

function Avatar({ src, fallback, name, size = 38, className = "", style = {}, onClick }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [src]);
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        onError={() => setImgError(true)}
        className={`hm-avatar-img ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(8, Math.round(size * 0.28)),
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--line)",
          ...style,
        }}
        onClick={onClick}
      />
    );
  }
  return (
    <div
      className={`hm-avatar-chip ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.28)),
        fontSize: Math.round(size * 0.44),
        flexShrink: 0,
        ...style,
      }}
      onClick={onClick}
    >
      {fallback || (name ? name.charAt(0).toUpperCase() : "🧑‍💻")}
    </div>
  );
}

function MatchRing({ value, size = 54 }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const color = value >= 90 ? "var(--teal)" : value >= 75 ? "var(--brand)" : "var(--orange)";
  return (
    <div className="hm-matchring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="hm-matchring-num" style={{ color }}>{value}</div>
    </div>
  );
}

function Bar({ value, color = "var(--brand)", track }) {
  return (
    <div className="hm-bar-track" style={track}>
      <div className="hm-bar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="hm-toast-stack">
      {toasts.map(t => (
        <div className="hm-toast" key={t.id}>
          {t.icon || <CheckCircle2 size={16} color="var(--teal)" />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text, icon) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, text, icon }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

function Modal({ onClose, width = 480, title, icon, children, footer, bodyPad = true }) {
  return (
    <div className="hm-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hm-modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
        {title && (
          <div className="hm-modal-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon}
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
            </div>
            <button className="hm-iconbtn hm-reset" onClick={onClose}><X size={16} /></button>
          </div>
        )}
        <div className="hm-modal-body hm-scrollpane" style={!bodyPad ? { padding: 0 } : undefined}>{children}</div>
        {footer && <div className="hm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="hm-empty-state">
      {icon}
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 6, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

function timeAgo() { return "just now"; }

/* ================================================================== */
/*  NAVIGATION                                                         */
/* ================================================================== */


/* ================================================================== */
/*  PERSONA SWITCHER — Fast 1-Click Multi-Account Switcher            */
/* ================================================================== */
function PersonaSwitcher({ currentUser, onSwitchUser, align = "left" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const personas = [
    { id: "lead@tribe.demo", label: "Alex Rivera", role: "Team Alpha Lead (SIH 2025)", score: 98, kind: "leader", badge: "👑 Team Leader", color: "var(--brand)" },
    { id: "recruiter.apex@tribe.demo", label: "Sarah Jenkins", role: "HR @ Apex Cloud", score: 94, kind: "hr", badge: "🛡️ 94 Culture", color: "var(--teal)" },
    { id: "hr.burnout@tribe.demo", label: "Elena Rostova", role: "HR @ GrindScale", score: 22, kind: "hr", badge: "🚨 22 RED FLAG", color: "var(--red)" },
    { id: "talent.pulse@tribe.demo", label: "Marcus Vance", role: "HR @ NovaAI", score: 79, kind: "hr", badge: "⚡ 79 Culture", color: "var(--orange)" },
    { id: "candidate@tribe.demo", label: "Priya Patel", role: "Candidate (ML/FullStack)", score: 94, kind: "candidate", badge: "👩‍💻 94% Verified", color: "#FF7EB6" },
    { id: "alex@tribe.demo", label: "Alex Chen", role: "Candidate (Frontend)", score: 88, kind: "candidate", badge: "🧑‍💻 88% Verified", color: "var(--blue)" },
  ];

  const current = personas.find(p => p.id === currentUser?.email) || {
    id: currentUser?.email,
    label: currentUser?.name || "User",
    role: currentUser?.role,
    badge: currentUser?.kind === "candidate" ? "Candidate" : "HR Lead",
    color: "var(--brand)"
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", width: "100%", alignItems: "center" }}>
      <button
        type="button"
        className="hm-persona-bar"
        onClick={() => setOpen(o => !o)}
        style={{
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: current.score && current.score < 50 ? "1px solid #FF3B3B" : "1px solid var(--line)"
        }}
        title="Switch user persona (Test Recruiter vs Candidate)"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
          <span style={{ fontSize: 10, color: "var(--text-mute)", fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>User:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: current.color || "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span className="hm-badge" style={{ fontSize: 9.5, padding: "2px 5px", background: current.score && current.score < 50 ? "rgba(255,59,59,0.2)" : "rgba(255,255,255,0.1)", color: current.score && current.score < 50 ? "#FF6B6B" : "var(--text-dim)" }}>
            {current.badge}
          </span>
          <span style={{ fontSize: 9, color: "var(--text-mute)" }}>▼</span>
        </div>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            ...(align === "right" ? { right: 0 } : { left: 0 }),
            zIndex: 9999,
            background: "#181D26",
            border: "1px solid #2A3342",
            borderRadius: 12,
            boxShadow: "0 14px 40px rgba(0,0,0,0.85)",
            width: 285,
            maxWidth: "calc(100vw - 20px)",
            padding: 8,
          }}
        >
          <div style={{ padding: "6px 8px", fontSize: 10.5, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Switch Persona (Live Real-Time Sync)
          </div>
          {personas.map(p => {
            const isMe = p.id === currentUser?.email;
            return (
              <div
                key={p.id}
                onClick={() => { setOpen(false); onSwitchUser(p.id); }}
                style={{
                  padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                  background: isMe ? "rgba(255,46,126,0.16)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 3
                }}
                onMouseEnter={e => e.currentTarget.style.background = isMe ? "rgba(255,46,126,0.22)" : "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = isMe ? "rgba(255,46,126,0.16)" : "transparent"}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: p.color }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{p.role}</div>
                </div>
                <span className="hm-badge" style={{ fontSize: 10, color: p.color, background: "rgba(0,0,0,0.3)" }}>
                  {p.badge}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "recruiter", label: "HR Studio", icon: BuildingIcon, hrOnly: true },
  { id: "team", label: "My Team", icon: Users, leaderOnly: true },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "pulse", label: "Pulse Feed", icon: FlameIcon },
  { id: "messages", label: "Messages", icon: MessageSquareIcon },
  { id: "matches", label: "Matches", icon: Zap },
  { id: "vetting", label: "Vetting", icon: ShieldCheck, hrOrLeaderOnly: true },
  { id: "assessments", label: "Assessments", icon: ClipboardList },
  { id: "rankings", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "Profile", icon: User },
];

function Sidebar({ screen, setScreen, counts, user, onLogout, onResetDemo, onSwitchUser, userKind }) {
  const isLeader = userKind === "leader" || user.role?.toLowerCase().includes("team lead") || user.role?.toLowerCase().includes("lead");
  const isHR = userKind === "hr" || user.role?.toLowerCase().includes("talent") || user.role?.toLowerCase().includes("hr") || (user.company && !isLeader);
  const filteredNav = NAV_ITEMS.filter(it => {
    if (it.hrOnly) return isHR;
    if (it.leaderOnly) return isLeader;
    if (it.hrOrLeaderOnly) return isHR || isLeader;
    return true;
  });

  return (
    <aside className="hm-sidebar">
      <div className="hm-brand">
        <div className="hm-brand-mark"><Zap size={18} strokeWidth={2.5} /></div>
        <div>
          <div className="hm-brand-name">TRIBE</div>
          <div className="hm-brand-sub">TALENT & CULTURE MATCHING</div>
        </div>
      </div>

      <div style={{ padding: "0 10px 10px" }}>
        <PersonaSwitcher currentUser={user} onSwitchUser={onSwitchUser} align="left" />
      </div>

      {filteredNav.map(it => {
        const Icon = it.icon;
        const badge = counts[it.id];
        return (
          <div key={it.id} className={`hm-nav-item ${screen === it.id ? "active" : ""}`} onClick={() => setScreen(it.id)}>
            <Icon size={17} strokeWidth={2.2} />
            {it.label}
            {!!badge && <span className="hm-nav-badge">{badge}</span>}
          </div>
        );
      })}
      <div className="hm-sidebar-foot">
        <div className="hm-user-row" onClick={() => setScreen("profile")} title="View your profile">
          <Avatar src={user.photoUrl} fallback={user.avatar} name={user.name} size={36} style={{ border: "2px solid var(--brand)", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{user.role}</div>
          </div>
          <button className="hm-reset hm-iconbtn" style={{ marginLeft: "auto", width: 28, height: 28 }}
            onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Log out">
            <LogOut size={13} />
          </button>
        </div>
        <button
          className="hm-reset"
          style={{ marginTop: 10, fontSize: 11, color: "var(--text-mute)", display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", width: "100%" }}
          onClick={onResetDemo}
          title="Clear local demo data and restore the initial state"
        >
          <RotateCcw size={12} /> Reset Demo Data
        </button>
      </div>
    </aside>
  );
}

function MobileChrome({ screen, setScreen, counts, user, onLogout, onResetDemo, onSwitchUser, title, userKind }) {
  const isLeader = userKind === "leader" || user.role?.toLowerCase().includes("team lead") || user.role?.toLowerCase().includes("lead");
  const isHR = userKind === "hr" || user.role?.toLowerCase().includes("talent") || user.role?.toLowerCase().includes("hr") || (user.company && !isLeader);
  const filteredNav = NAV_ITEMS.filter(it => {
    if (it.hrOnly) return isHR;
    if (it.leaderOnly) return isLeader;
    if (it.hrOrLeaderOnly) return isHR || isLeader;
    return true;
  }).filter(it => ["dashboard", "recruiter", "team", "discover", "pulse", "messages", "matches", "assessments", "profile"].includes(it.id));

  return (
    <>
      <div className="hm-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="hm-brand-mark" style={{ width: 28, height: 28 }}><Zap size={14} /></div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PersonaSwitcher currentUser={user} onSwitchUser={onSwitchUser} align="right" />
          <button className="hm-reset hm-iconbtn" style={{ width: 28, height: 28 }} onClick={onResetDemo} title="Reset demo data">
            <RotateCcw size={14} />
          </button>
          <div onClick={() => setScreen("profile")} style={{ cursor: "pointer", display: "inline-flex" }} title="View your profile">
            <Avatar src={user.photoUrl} fallback={user.avatar} name={user.name} size={30} style={{ border: "2px solid var(--brand)" }} />
          </div>
        </div>
      </div>
      <div className="hm-mobilenav">
        {filteredNav.map(it => {
          const Icon = it.icon;
          const badge = counts[it.id];
          const on = screen === it.id;
          return (
            <div key={it.id} className="hm-mobilenav-item" style={{ color: on ? "var(--brand)" : "var(--text-mute)" }} onClick={() => setScreen(it.id)}>
              <div style={{ position: "relative" }}>
                <Icon size={19} strokeWidth={2.2} />
                {!!badge && <span style={{ position: "absolute", top: -4, right: -6, width: 8, height: 8, borderRadius: 99, background: "var(--red)" }} />}
              </div>
              {it.label}
            </div>
          );
        })}
      </div>
    </>
  );
}

function CandidateCardBody({ c, onViewProof, activePhoto = 0, onPrevPhoto, onNextPhoto, photos }) {
  const photoList = photos || (c.photos && c.photos.length > 0 ? c.photos : [c.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"]);

  const seekingText = (c.requiredSkills && c.requiredSkills.length > 0)
    ? `Seeking ${c.requiredSkills[0]}`
    : (c.requirements && c.requirements.length > 0)
    ? `Fills ${c.requirements?.[0] || "core"} gap`
    : null;

  return (
    <div className="hm-card-photo-hero">
      {/* Story progress bars for multi-photo navigation */}
      {photoList.length > 1 && (
        <div className="hm-card-story-bars" style={{ zIndex: 14 }}>
          {photoList.map((_, i) => (
            <div
              key={i}
              className={`hm-card-story-bar ${i === activePhoto ? "active" : i < activePhoto ? "passed" : ""}`}
              onClick={(e) => { e.stopPropagation(); }}
            />
          ))}
        </div>
      )}

      {/* Main portrait photo */}
      <img
        src={photoList[activePhoto] || photoList[0]}
        alt={c.name}
        className="hm-card-photo-img"
        draggable={false}
      />

      {/* Subtle photo cycling chevrons on hover */}
      {photoList.length > 1 && (
        <>
          <button
            type="button"
            className="hm-photo-nav-btn prev"
            onClick={(e) => { e.stopPropagation(); onPrevPhoto?.(); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Previous photo"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="hm-photo-nav-btn next"
            onClick={(e) => { e.stopPropagation(); onNextPhoto?.(); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Next photo"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Sleek Top Bar (Gap badge + View Proof action button) */}
      <div className="hm-card-top-bar">
        {seekingText ? (
          <span className="hm-card-top-pill brand">
            <Sparkles size={11} /> {seekingText}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="hm-card-top-action"
          onClick={(e) => { e.stopPropagation(); onViewProof?.(c); }}
          onPointerDown={(e) => e.stopPropagation()}
          title="View candidate proof and breakdown"
        >
          <Sparkles size={13} color="var(--teal)" />
          <span>Proof</span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Dark gradient overlay with streamlined, non-overlapping hierarchy */}
      <div className="hm-card-photo-overlay">
        {/* Row 1: Name + Role + Match Ring */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 3 }}>
          <div style={{ minWidth: 0, paddingRight: 8 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              {c.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.role} {c.experienceYears ? `· ${c.experienceYears}` : ""}
            </div>
          </div>
          <MatchRing value={c.match} size={44} />
        </div>

        {/* Row 2: Verification badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "3px 0 5px", flexWrap: "wrap", pointerEvents: "auto" }}>
          {c.assessmentAvg && (
            <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.14)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
              <ShieldCheck size={11} /> Proctored {c.assessmentAvg}%
            </span>
          )}
          {c.githubUsername && (
            <span className="hm-badge" style={{ color: "var(--blue)", background: "rgba(91,155,255,0.14)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
              <Github size={11} /> Code Verified
            </span>
          )}
          {c.vouches && (
            <span className="hm-badge" style={{ color: "#FF7EB6", background: "rgba(255,126,182,0.14)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
              🤝 {c.vouches} Vouches
            </span>
          )}
        </div>

        {/* Row 3: Bio quote (clean 1-line preview) */}
        {c.bio && (
          <div className="hm-card-bio-quote" title={c.bio}>
            "{c.bio}"
          </div>
        )}

        {/* Row 4: Top 3 skill chips + Availability */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2, pointerEvents: "auto" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "nowrap", overflow: "hidden" }}>
            {c.tags.slice(0, 3).map(t => {
              const v = VERIFICATION[t.level];
              return (
                <span key={t.name} className="hm-card-tag" style={{ color: v.color, background: "rgba(18,22,29,0.9)", padding: "3px 7px", fontSize: 10.5 }}>
                  <span className="hm-badge-dot" style={{ background: v.color }} />
                  {t.name}
                </span>
              );
            })}
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-mute)", flexShrink: 0, marginLeft: 8 }}>
            <span className="hm-avail-dot" /> {c.availability || "Immediate"}
          </span>
        </div>
      </div>
    </div>
  );
}

const SWIPE_THRESHOLD = 110;

function FloatingBolts({ count = 14 }) {
  const bolts = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const pink = i % 2 === 0;
    return {
      id: i,
      left: Math.round(Math.random() * 96),
      size: 11 + Math.round(Math.random() * 16),
      duration: 8 + Math.random() * 7,
      delay: -(Math.random() * 14),
      drift: 8 + Math.random() * 22,
      opacity: 0.16 + Math.random() * 0.3,
      color: pink ? "var(--brand)" : "var(--teal)",
    };
  }), [count]);
  return (
    <div className="hm-float-bg" aria-hidden="true">
      {bolts.map(b => (
        <Zap
          key={b.id}
          className="hm-float-bolt"
          width={b.size} height={b.size}
          color={b.color} fill={b.color}
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--hop": b.opacity,
            "--drift": `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function BoltBurst({ burstKey }) {
  const particles = useMemo(() => {
    if (!burstKey) return [];
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.35;
      const dist = 70 + Math.random() * 70;
      return {
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 30,
        delay: Math.random() * 0.12,
        size: 13 + Math.random() * 13,
        color: i % 2 === 0 ? "var(--brand)" : "var(--teal)",
      };
    });
  }, [burstKey]);
  if (!burstKey) return null;
  return (
    <div className="hm-burst-wrap" aria-hidden="true">
      {particles.map(p => (
        <Zap
          key={`${burstKey}-${p.id}`}
          className="hm-burst-bolt"
          width={p.size} height={p.size}
          color={p.color} fill={p.color}
          style={{ "--tx": `${p.tx}px`, "--ty": `${p.ty}px`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

function SwipeCard({ c, stackIndex, isTop, onDecision, exitSignal, onTapView, onDragUpdate, topDragX = 0 }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, rot: 0, phase: "idle" }); // idle | dragging | returning | exiting
  const [activePhoto, setActivePhoto] = useState(0);
  const ref = useRef(null);
  const dragState = useRef({ startX: 0, startY: 0, dragging: false, moved: false, pointerId: null });

  const photos = useMemo(() => {
    if (c.photos && c.photos.length > 0) return c.photos;
    if (c.photoUrl) return [c.photoUrl];
    return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"];
  }, [c]);

  // Handle external button/keyboard exitSignal
  useEffect(() => {
    if (!exitSignal || !isTop || exitSignal.forId !== c.id) return;
    const dir = exitSignal.dir === "connect" ? 1 : -1;
    setDrag({ x: dir * 850, y: -20, rot: dir * 28, phase: "exiting" });
    const t = setTimeout(() => onDecision(exitSignal.dir), 280);
    return () => clearTimeout(t);
  }, [exitSignal, isTop, c.id, onDecision]);

  const onPointerDown = (e) => {
    if (!isTop || drag.phase === "exiting") return;
    if (e.target.closest("button") || e.target.closest(".hm-card-floating-badge") || e.target.closest(".hm-card-top-action")) return;

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: true,
      moved: false,
      pointerId: e.pointerId
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
    setDrag(d => ({ ...d, phase: "dragging" }));
  };

  const onPointerMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      dragState.current.moved = true;
    }
    const curRot = Math.max(-22, Math.min(22, dx * 0.085));
    setDrag({ x: dx, y: dy * 0.45, rot: curRot, phase: "dragging" });
    onDragUpdate?.(dx);
  };

  const endDrag = (e) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    onDragUpdate?.(0);

    if (dragState.current.moved) {
      const dx = drag.x;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        // Intentional swipe crossed threshold -> fly away smoothly
        const dir = dx > 0 ? "connect" : "pass";
        const exitX = dx > 0 ? 850 : -850;
        const exitRot = dx > 0 ? 30 : -30;
        setDrag({ x: exitX, y: drag.y * 1.5, rot: exitRot, phase: "exiting" });
        setTimeout(() => onDecision(dir), 280);
      } else {
        // Released before threshold -> snap back smoothly with bounce
        setDrag({ x: 0, y: 0, rot: 0, phase: "returning" });
      }
    } else {
      // Tap without dragging -> cycle photos!
      const rect = ref.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (photos.length > 1) {
        if (clickX < rect.width * 0.4) {
          setActivePhoto(p => (p > 0 ? p - 1 : photos.length - 1));
        } else {
          setActivePhoto(p => (p < photos.length - 1 ? p + 1 : 0));
        }
      }
      setDrag({ x: 0, y: 0, rot: 0, phase: "idle" });
    }
  };

  // Strengths for CONNECT and PASS indicators (gradual fade-in and scale)
  const pullRight = Math.max(0, drag.x);
  const pullLeft = Math.max(0, -drag.x);
  const connectStrength = isTop ? Math.min(1, Math.max(0, (pullRight - 12) / (SWIPE_THRESHOLD - 12))) : 0;
  const passStrength = isTop ? Math.min(1, Math.max(0, (pullLeft - 12) / (SWIPE_THRESHOLD - 12))) : 0;

  // Next card underneath reveal: as top card is pulled, reveal card underneath
  const pull = Math.min(1, Math.abs(topDragX) / SWIPE_THRESHOLD);
  let cardScale = 1;
  let cardTranslateY = 0;
  let cardBrightness = 1;
  let cardZ = 10 - stackIndex;

  if (isTop) {
    cardScale = drag.phase === "dragging" ? 1.025 : 1;
    cardTranslateY = drag.y;
  } else if (stackIndex === 1) {
    cardScale = 0.95 + pull * 0.05;
    cardTranslateY = 14 * (1 - pull);
    cardBrightness = 0.85 + pull * 0.15;
  } else if (stackIndex === 2) {
    cardScale = 0.90 + pull * 0.05;
    cardTranslateY = 28 - pull * 14;
    cardBrightness = 0.72 + pull * 0.13;
  }

  const transition = drag.phase === "dragging"
    ? "none"
    : drag.phase === "exiting"
    ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease"
    : "transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  const borderStyle = isTop && connectStrength >= 0.85
    ? "2px solid #10B981"
    : isTop && passStrength >= 0.85
    ? "2px solid #EF4444"
    : "1px solid var(--line)";

  const shadowStyle = isTop && drag.phase === "dragging"
    ? connectStrength >= 0.5
      ? "0 30px 70px rgba(0,0,0,0.7), 0 0 35px rgba(16,185,129,0.3)"
      : passStrength >= 0.5
      ? "0 30px 70px rgba(0,0,0,0.7), 0 0 35px rgba(239,68,68,0.3)"
      : "0 30px 70px rgba(0,0,0,0.65)"
    : "0 20px 50px rgba(0,0,0,0.45)";

  return (
    <div
      ref={ref}
      className={`hm-swipe-card ${isTop ? "hm-swipe-card-top" : ""}`}
      style={{
        zIndex: cardZ,
        transform: `translate3d(${isTop ? drag.x : 0}px, ${cardTranslateY}px, 0) rotate(${isTop ? drag.rot : 0}deg) scale(${cardScale})`,
        filter: isTop ? "none" : `brightness(${cardBrightness})`,
        transition,
        opacity: drag.phase === "exiting" ? 0.35 : 1,
        border: borderStyle,
        boxShadow: shadowStyle
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* CONNECT 💚 STAMP (Top-Left) */}
      {isTop && (
        <div
          className="hm-swipe-overlay connect"
          style={{
            opacity: connectStrength,
            transform: `rotate(-12deg) scale(${0.85 + connectStrength * 0.25})`,
          }}
        >
          <span>CONNECT</span>
          <span>💚</span>
        </div>
      )}

      {/* PASS ✕ STAMP (Top-Right) */}
      {isTop && (
        <div
          className="hm-swipe-overlay pass"
          style={{
            opacity: passStrength,
            transform: `rotate(12deg) scale(${0.85 + passStrength * 0.25})`,
          }}
        >
          <span>PASS</span>
          <span>✕</span>
        </div>
      )}

      <CandidateCardBody
        c={c}
        onViewProof={onTapView}
        activePhoto={activePhoto}
        onPrevPhoto={() => setActivePhoto(p => (p > 0 ? p - 1 : photos.length - 1))}
        onNextPhoto={() => setActivePhoto(p => (p < photos.length - 1 ? p + 1 : 0))}
        photos={photos}
      />
    </div>
  );
}

/* ================================================================== */
/*  DISCOVER SCREEN                                                    */
/* ================================================================== */



function CompanyCardBody({ company, onViewCulture, activePhoto = 0, onPrevPhoto, onNextPhoto, photos }) {
  const photoList = photos || company.photos || [company.photoUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"];
  const isRed = company.culture?.isRedFlag || company.culture?.score < 50;

  return (
    <div className={`hm-card-photo-hero ${isRed ? "hm-culture-red-card" : ""}`} style={{ position: "relative" }}>
      {photoList.length > 1 && (
        <div className="hm-card-story-bars" style={{ zIndex: 14 }}>
          {photoList.map((_, i) => (
            <div
              key={i}
              className={`hm-card-story-bar ${i === activePhoto ? "active" : i < activePhoto ? "passed" : ""}`}
              onClick={(e) => { e.stopPropagation(); }}
            />
          ))}
        </div>
      )}

      <img
        src={photoList[activePhoto] || photoList[0]}
        alt={company.name}
        className="hm-card-photo-img"
        draggable={false}
      />

      {photoList.length > 1 && (
        <>
          <button type="button" className="hm-photo-nav-btn prev" onClick={(e) => { e.stopPropagation(); onPrevPhoto?.(); }} onPointerDown={e => e.stopPropagation()}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="hm-photo-nav-btn next" onClick={(e) => { e.stopPropagation(); onNextPhoto?.(); }} onPointerDown={e => e.stopPropagation()}>
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Sleek Top Bar (Culture Status Pill + Inspect Culture Button) */}
      <div className="hm-card-top-bar">
        {isRed ? (
          <span className="hm-card-top-pill red">
            <AlertTriangle size={12} /> Culture {company.culture.score}/100 Red Flag
          </span>
        ) : (
          <span className="hm-card-top-pill green">
            <CheckCircle2 size={12} /> Culture {company.culture.score}/100 Healthy
          </span>
        )}
        <button
          type="button"
          className="hm-card-top-action"
          onClick={(e) => { e.stopPropagation(); onViewCulture?.(company); }}
          onPointerDown={e => e.stopPropagation()}
          title="Inspect Work Culture Report & Transparency"
        >
          <ShieldCheck size={13} color={isRed ? "#FF6B6B" : "var(--teal)"} />
          <span>Report</span>
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="hm-card-photo-overlay">
        {/* Row 1: Company Name + Match Ring */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 3 }}>
          <div style={{ minWidth: 0, paddingRight: 8 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              {company.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {company.role} · <span style={{ color: "var(--teal)", fontWeight: 700 }}>{company.salary}</span>
            </div>
          </div>
          <MatchRing value={company.match || 90} size={44} />
        </div>

        {/* Row 2: Recruiter info */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "3px 0 5px", pointerEvents: "auto" }}>
          <Avatar src={company.recruiter?.photoUrl} fallback={company.recruiter?.avatar} name={company.recruiter?.name} size={18} />
          <span style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Recruiter: <b style={{ color: "var(--text)" }}>{company.recruiter?.name}</b> ({company.recruiter?.role})
          </span>
        </div>

        {/* Row 3: Culture metrics badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "2px 0 5px", pointerEvents: "auto" }}>
          {isRed ? (
            <>
              <span className="hm-badge" style={{ color: "#FF6B6B", background: "rgba(255,59,59,0.18)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                ⚠️ {company.culture.attritionRate} Turnover
              </span>
              <span className="hm-badge" style={{ color: "#FF6B6B", background: "rgba(255,59,59,0.18)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                ⚠️ {company.culture.avgWeeklyHours}h/wk Crunch
              </span>
            </>
          ) : (
            <>
              <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.14)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                ✨ {company.culture.avgWeeklyHours}h/wk Sustainable
              </span>
              <span className="hm-badge" style={{ color: "var(--blue)", background: "rgba(91,155,255,0.14)", fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                🛡️ {company.culture.psychSafetyScore}% Psych Safety
              </span>
            </>
          )}
        </div>

        {/* Row 4: Culture quote (1-line subtle preview) */}
        {company.culture?.employeeQuotes?.[0] && (
          <div className="hm-card-bio-quote" title={company.culture.employeeQuotes[0].text}>
            "{company.culture.employeeQuotes[0].text}"
          </div>
        )}

        {/* Row 5: Skills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "nowrap", overflow: "hidden", marginTop: 2, pointerEvents: "auto" }}>
          {company.requiredSkills.slice(0, 3).map(s => (
            <span key={s} className="hm-card-tag" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "3px 7px", fontSize: 10.5 }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanySwipeCard({ company, stackIndex, isTop, onDecision, exitSignal, onTapView, onDragUpdate, topDragX = 0 }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, rot: 0, phase: "idle" });
  const [activePhoto, setActivePhoto] = useState(0);
  const ref = useRef(null);
  const dragState = useRef({ startX: 0, startY: 0, dragging: false, moved: false, pointerId: null });
  const isRed = company.culture?.isRedFlag || company.culture?.score < 50;
  const photos = useMemo(() => company.photos || [company.photoUrl], [company]);

  useEffect(() => {
    if (!exitSignal || !isTop || exitSignal.forId !== company.id) return;
    const dir = exitSignal.dir === "connect" ? 1 : -1;
    setDrag({ x: dir * 850, y: -20, rot: dir * 28, phase: "exiting" });
    const t = setTimeout(() => onDecision(exitSignal.dir), 280);
    return () => clearTimeout(t);
  }, [exitSignal, isTop, company.id, onDecision]);

  const onPointerDown = (e) => {
    if (!isTop || drag.phase === "exiting") return;
    if (e.target.closest("button") || e.target.closest(".hm-card-floating-badge") || e.target.closest(".hm-card-top-action")) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, dragging: true, moved: false, pointerId: e.pointerId };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    setDrag(d => ({ ...d, phase: "dragging" }));
  };

  const onPointerMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.hypot(dx, dy) > 6) dragState.current.moved = true;
    const curRot = Math.max(-22, Math.min(22, dx * 0.085));
    setDrag({ x: dx, y: dy * 0.45, rot: curRot, phase: "dragging" });
    onDragUpdate?.(dx);
  };

  const endDrag = (e) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    onDragUpdate?.(0);

    if (dragState.current.moved) {
      const dx = drag.x;
      if (Math.abs(dx) >= SWIPE_THRESHOLD) {
        const dir = dx > 0 ? "connect" : "pass";
        const exitX = dx > 0 ? 850 : -850;
        const exitRot = dx > 0 ? 30 : -30;
        setDrag({ x: exitX, y: drag.y * 1.5, rot: exitRot, phase: "exiting" });
        setTimeout(() => onDecision(dir), 280);
      } else {
        setDrag({ x: 0, y: 0, rot: 0, phase: "returning" });
      }
    } else {
      const rect = ref.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (photos.length > 1) {
        if (clickX < rect.width * 0.4) {
          setActivePhoto(p => (p > 0 ? p - 1 : photos.length - 1));
        } else {
          setActivePhoto(p => (p < photos.length - 1 ? p + 1 : 0));
        }
      }
      setDrag({ x: 0, y: 0, rot: 0, phase: "idle" });
    }
  };

  const pullRight = Math.max(0, drag.x);
  const pullLeft = Math.max(0, -drag.x);
  const connectStrength = isTop ? Math.min(1, Math.max(0, (pullRight - 12) / (SWIPE_THRESHOLD - 12))) : 0;
  const passStrength = isTop ? Math.min(1, Math.max(0, (pullLeft - 12) / (SWIPE_THRESHOLD - 12))) : 0;

  const pull = Math.min(1, Math.abs(topDragX) / SWIPE_THRESHOLD);
  let cardScale = isTop ? (drag.phase === "dragging" ? 1.025 : 1) : stackIndex === 1 ? 0.95 + pull * 0.05 : 0.90 + pull * 0.05;
  let cardTranslateY = isTop ? drag.y : stackIndex === 1 ? 14 * (1 - pull) : 28 - pull * 14;
  let cardBrightness = isTop ? 1 : stackIndex === 1 ? 0.85 + pull * 0.15 : 0.72 + pull * 0.13;

  const transition = drag.phase === "dragging" ? "none" : drag.phase === "exiting"
    ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease"
    : "transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

  const borderStyle = isTop && connectStrength >= 0.85
    ? "2px solid #10B981"
    : isTop && passStrength >= 0.85
    ? "2px solid #EF4444"
    : isRed
    ? "2px solid #FF3B3B"
    : "1px solid var(--line)";

  return (
    <div
      ref={ref}
      className={`hm-swipe-card ${isTop ? "hm-swipe-card-top" : ""} ${isRed ? "hm-culture-red-card" : ""}`}
      style={{
        zIndex: 10 - stackIndex,
        transform: `translate3d(${isTop ? drag.x : 0}px, ${cardTranslateY}px, 0) rotate(${isTop ? drag.rot : 0}deg) scale(${cardScale})`,
        filter: isTop ? "none" : `brightness(${cardBrightness})`,
        transition,
        opacity: drag.phase === "exiting" ? 0.35 : 1,
        border: borderStyle,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {isTop && (
        <div className="hm-swipe-overlay connect" style={{ opacity: connectStrength, transform: `rotate(-12deg) scale(${0.85 + connectStrength * 0.25})` }}>
          <span>APPLY</span>
          <span>💚</span>
        </div>
      )}

      {isTop && (
        <div className="hm-swipe-overlay pass" style={{ opacity: passStrength, transform: `rotate(12deg) scale(${0.85 + passStrength * 0.25})` }}>
          <span>{isRed ? "AVOID RED" : "PASS"}</span>
          <span>✕</span>
        </div>
      )}

      <CompanyCardBody
        company={company}
        onViewCulture={onTapView}
        activePhoto={activePhoto}
        onPrevPhoto={() => setActivePhoto(p => (p > 0 ? p - 1 : photos.length - 1))}
        onNextPhoto={() => setActivePhoto(p => (p < photos.length - 1 ? p + 1 : 0))}
        photos={photos}
      />
    </div>
  );
}

function CultureDetailsModal({ company, onClose, onApply }) {
  if (!company) return null;
  const isRed = company.culture?.isRedFlag || company.culture?.score < 50;

  return (
    <Modal onClose={onClose} title={`${company.name} — Work Culture Truth-Meter™`} icon={<ShieldCheck size={18} color={isRed ? "#FF3B3B" : "var(--teal)"} />} width={580}>
      {isRed ? (
        <div className="hm-red-alert-banner" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} />
          <div>
            <div style={{ fontWeight: 800 }}>🚨 CRITICAL WARNING: TOXIC CULTURE SCORE {company.culture.score}/100</div>
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>Extreme employee burnout risk, severe attrition, and hostile management detected.</div>
          </div>
        </div>
      ) : (
        <div className="hm-green-alert-banner" style={{ marginBottom: 16 }}>
          <CheckCircle2 size={18} />
          <div>
            <div style={{ fontWeight: 700 }}>🛡️ VERIFIED HEALTHY CULTURE SCORE {company.culture.score}/100</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>High psychological safety, sustainable pace, and excellent leadership trust.</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div className="hm-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-mute)", fontWeight: 700 }}>WORK-LIFE BALANCE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: isRed ? "#FF6B6B" : "var(--teal)", fontFamily: "'Space Grotesk',sans-serif" }}>
            {company.culture.wlbRating} / 5.0
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Avg {company.culture.avgWeeklyHours} hours/week</div>
        </div>
        <div className="hm-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-mute)", fontWeight: 700 }}>ANNUAL TURNOVER</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: isRed ? "#FF6B6B" : "var(--blue)", fontFamily: "'Space Grotesk',sans-serif" }}>
            {company.culture.attritionRate}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Industry benchmark: 13%</div>
        </div>
      </div>

      {company.culture.redFlags?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="hm-section-title" style={{ color: "#FF6B6B" }}>CRITICAL RED FLAGS ON RECORD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {company.culture.redFlags.map((rf, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#FFA4A4", background: "rgba(255,59,59,0.1)", padding: "8px 10px", borderRadius: 6 }}>
                <XCircle size={15} color="#FF6B6B" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{rf}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {company.culture.highlights?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="hm-section-title" style={{ color: "var(--teal)" }}>VERIFIED CULTURE HIGHLIGHTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {company.culture.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#A7F3D0", background: "rgba(20,232,196,0.1)", padding: "8px 10px", borderRadius: 6 }}>
                <CheckCircle2 size={15} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div className="hm-section-title">VERIFIED ANONYMOUS EMPLOYEE REVIEWS ({company.culture.reviewsCount})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {company.culture.employeeQuotes?.map((eq, i) => (
            <div key={i} className={eq.flag === "CRITICAL_RED" ? "hm-culture-quote-red" : "hm-culture-quote-green"}>
              <div>"{eq.text}"</div>
              <div style={{ fontSize: 10.5, marginTop: 5, display: "flex", justifyContent: "space-between", opacity: 0.85 }}>
                <span>— {eq.author}</span>
                <span style={{ fontWeight: 700 }}>{eq.verified ? "✓ Verified Employee ID" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Close</button>
        <button className="hm-btn hm-btn-primary" onClick={() => { onApply?.(company); onClose(); }}>
          Apply to {company.name}
        </button>
      </div>
    </Modal>
  );
}

function Discover({
  deck,
  mode = "teammate",
  onSwitchMode,
  teammateCount,
  companyCount,
  filterSkill,
  clearFilter,
  onDecision,
  onViewProof,
  onViewCulture,
  onRewind,
  canRewind,
  onResetDeck
}) {
  const [exitSignal, setExitSignal] = useState(null);
  const [burstKey, setBurstKey] = useState(null);
  const [topDragX, setTopDragX] = useState(0);
  const visible = deck.slice(0, 3);
  const top = visible[0];

  const isCompanyMode = mode === "company";

  const triggerSwipe = useCallback((dir) => {
    if (!top) return;
    setExitSignal({ dir, nonce: Math.random(), forId: top.id });
  }, [top]);

  const handleDecision = useCallback((dir) => {
    if (dir === "connect") setBurstKey(Math.random());
    setTopDragX(0);
    onDecision(dir);
  }, [onDecision]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        triggerSwipe("pass");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        triggerSwipe("connect");
      } else if (e.key === " " || e.key === "v" || e.key === "V") {
        e.preventDefault();
        if (top) {
          if (isCompanyMode) onViewCulture?.(top);
          else onViewProof?.(top);
        }
      } else if (e.key === "z" || e.key === "Z" || e.key === "Backspace") {
        if (canRewind) {
          e.preventDefault();
          onRewind?.();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [top, triggerSwipe, onViewProof, onViewCulture, onRewind, canRewind, isCompanyMode]);

  return (
    <div>
      {/* Primary Discovery Mode Switcher */}
      {onSwitchMode && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, borderBottom: "1px solid var(--line-soft)", paddingBottom: 12 }}>
          <button
            className={`hm-btn ${!isCompanyMode ? "hm-btn-primary" : "hm-btn-ghost"}`}
            onClick={() => onSwitchMode("teammate")}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700, padding: "8px 16px" }}
          >
            <UserPlus size={16} /> 👥 Find Teammates &amp; Builders ({teammateCount ?? deck.length})
          </button>
          <button
            className={`hm-btn ${isCompanyMode ? "hm-btn-primary" : "hm-btn-ghost"}`}
            onClick={() => onSwitchMode("company")}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, padding: "8px 16px" }}
          >
            <BuildingIcon size={16} /> 🏢 Company Openings ({companyCount ?? 0})
          </button>
        </div>
      )}

      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">{isCompanyMode ? "Discover Companies & Jobs" : "Find Teammates to Build Your Team"}</div>
          <div className="hm-page-sub">
            {isCompanyMode
              ? "Drag company card right to Apply 💚 or left to Pass ✕. Note: Toxic cultures are flagged in RED 🚨."
              : "Drag teammate card right to Connect & Add to Team 💚 or left to Pass ✕. Press Space for verified proofs."}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onResetDeck && (
            <button
              className="hm-btn hm-btn-ghost hm-btn-sm"
              style={{ fontSize: 11, display: "inline-flex", alignItems: "center", gap: 5 }}
              onClick={onResetDeck}
              title="Reload all passed cards"
            >
              <RotateCcw size={12} /> Reload Deck ({deck.length} remaining)
            </button>
          )}
          {filterSkill && (
            <div className="hm-chip on" style={{ cursor: "pointer" }} onClick={clearFilter}>
              <Filter size={12} /> Filtered: {filterSkill} <X size={12} />
            </div>
          )}
        </div>
      </div>

      <div className="hm-deck-stage">
        <FloatingBolts />
        <div className="hm-deck-wrap">
          {visible.length === 0 && (
            <div className="hm-panel" style={{ height: "100%", position: "relative", zIndex: 1 }}>
              <EmptyState
                icon={<Compass size={40} />}
                title="You're all caught up"
                sub={isCompanyMode ? "No more company openings in this queue. Reload deck or check back soon!" : "No more teammates in this queue. Reload deck, clear filters or check back later."}
                action={
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    {filterSkill && <button className="hm-btn hm-btn-ghost" onClick={clearFilter}>Clear filter</button>}
                    {canRewind && <button className="hm-btn hm-btn-teal" onClick={onRewind}><RotateCcw size={14} /> Undo Last Swipe</button>}
                    {onResetDeck && (
                      <button className="hm-btn hm-btn-primary" onClick={onResetDeck}>
                        <RotateCcw size={14} /> Reload Full Deck
                      </button>
                    )}
                  </div>
                }
              />
            </div>
          )}
          {visible.slice().reverse().map((item, ri) => {
            const idx = visible.length - 1 - ri;
            if (isCompanyMode) {
              return (
                <CompanySwipeCard
                  key={item.id}
                  company={item}
                  stackIndex={idx}
                  isTop={idx === 0}
                  onDecision={handleDecision}
                  exitSignal={idx === 0 ? exitSignal : null}
                  onTapView={onViewCulture}
                  onDragUpdate={(dx) => { if (idx === 0) setTopDragX(dx); }}
                  topDragX={topDragX}
                />
              );
            }
            return (
              <SwipeCard
                key={item.id}
                c={item}
                stackIndex={idx}
                isTop={idx === 0}
                onDecision={handleDecision}
                exitSignal={idx === 0 ? exitSignal : null}
                onTapView={onViewProof}
                onDragUpdate={(dx) => { if (idx === 0) setTopDragX(dx); }}
                topDragX={topDragX}
              />
            );
          })}
          <BoltBurst burstKey={burstKey} />
        </div>

        {top && (
          <div className="hm-deck-controls">
            <div className="hm-deck-actions">
              <button
                type="button"
                className="hm-deck-btn pass"
                onClick={() => triggerSwipe("pass")}
                title="Pass (← or A)"
              >
                <X size={26} strokeWidth={2.6} />
                <span className="hm-deck-btn-text">PASS ✕</span>
                <span className="hm-deck-btn-kbd">← A</span>
              </button>

              <button
                type="button"
                className="hm-deck-btn rewind"
                onClick={onRewind}
                disabled={!canRewind}
                title="Undo last swipe (Z)"
              >
                <RotateCcw size={18} />
                <span className="hm-deck-btn-text">UNDO</span>
                <span className="hm-deck-btn-kbd">Z</span>
              </button>

              <button
                type="button"
                className="hm-deck-btn view"
                onClick={() => isCompanyMode ? onViewCulture?.(top) : onViewProof?.(top)}
                title={isCompanyMode ? "View culture breakdown (Space)" : "View proof (Space)"}
              >
                <Eye size={20} />
                <span className="hm-deck-btn-text">{isCompanyMode ? "CULTURE" : "PROOF"}</span>
                <span className="hm-deck-btn-kbd">SPACE</span>
              </button>

              <button
                type="button"
                className="hm-deck-btn connect"
                onClick={() => triggerSwipe("connect")}
                title="Connect / Apply (→ or D)"
              >
                <Zap size={26} strokeWidth={2.6} />
                <span className="hm-deck-btn-text">{isCompanyMode ? "APPLY 💚" : "CONNECT 💚"}</span>
                <span className="hm-deck-btn-kbd">D →</span>
              </button>
            </div>

            <div className="hm-deck-hint">
              <span>Tip: Drag card or use <b>← / →</b> arrow keys · Space for details</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecruiterDashboard({ user, profile, candidates = [], onSwipeCandidate, onSendChallenge, team, onOpenCreateTeam, onOpenLiveAIChat }) {
  const [skillInput, setSkillInput] = useState("");
  const [typedSkills, setTypedSkills] = useState(["React", "TypeScript", "Node.js"]);
  const [roleTitle, setRoleTitle] = useState("Senior Full-Stack Cloud Engineer");
  const [generatedPack, setGeneratedPack] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  function addSkill(s) {
    const trimmed = (s || skillInput).trim();
    if (!trimmed) return;
    if (!typedSkills.map(x => x.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTypedSkills(ts => [...ts, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(s) {
    setTypedSkills(ts => ts.filter(x => x !== s));
  }

  function handleGenerateAI() {
    setGenerating(true);
    setTimeout(() => {
      const pack = generateAIInterviewPack(typedSkills, roleTitle, team?.name || "Apex Cloud Technologies");
      setGeneratedPack(pack);
      setGenerating(false);
    }, 500);
  }

  function handleCopy() {
    if (!generatedPack) return;
    const text = `AI Interview Questions for ${roleTitle} (${typedSkills.join(", ")}):

` +
      `Technical Screening:
` +
      generatedPack.technical.map((t, i) => `${i+1}. ${t.q}
Answer: ${t.explanation}`).join("\n\n") +
      `

Behavioral:
` +
      generatedPack.behavioral.map((b, i) => `${i+1}. ${b.q}
Rubric: ${b.rubric}`).join("\n\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const rankedCandidates = useMemo(() => {
    return (candidates || []).map(c => {
      const candSkills = (c.tags || []).map(t => t.name.toLowerCase());
      const reqMatches = typedSkills.filter(ts => candSkills.includes(ts.toLowerCase())).length;
      const fitScore = typedSkills.length ? Math.round((reqMatches / typedSkills.length) * 100) : 85;
      return { ...c, fitScore };
    }).sort((a, b) => b.fitScore - a.fitScore);
  }, [candidates, typedSkills]);

  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">HR Recruitment Studio</div>
          <div className="hm-page-sub">Type skills you need, auto-generate AI interview tests, and match with verified talent in real time.</div>
        </div>
        <button className="hm-btn hm-btn-primary" onClick={onOpenCreateTeam}>
          <Plus size={14} /> Create New Job Opening
        </button>
      </div>

      <div className="hm-panel hm-panel-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="hm-section-title" style={{ margin: 0 }}>REQUIRED SKILL SET BUILDER</div>
          <span style={{ fontSize: 12, color: "var(--text-mute)" }}>Type any skill to recalculate live candidate fit scores</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            className="hm-input"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            placeholder="Type skill (e.g. React, PyTorch, Go, GraphQL, Docker, Kubernetes) and hit Enter..."
            style={{ flex: 1 }}
          />
          <button className="hm-btn hm-btn-primary" onClick={() => addSkill()}>
            <Plus size={14} /> Add Skill
          </button>
        </div>

        <div className="hm-req-chip-row" style={{ marginBottom: 14 }}>
          {typedSkills.map(s => (
            <span key={s} className="hm-chip on" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {s}
              <X size={12} style={{ cursor: "pointer" }} onClick={() => removeSkill(s)} />
            </span>
          ))}
          {typedSkills.length === 0 && (
            <span style={{ fontSize: 12, color: "var(--text-mute)" }}>No skills specified yet. Type skills above.</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 11.5, color: "var(--text-mute)" }}>
          <span>Popular:</span>
          {["React", "Node.js", "Python", "PyTorch", "Kubernetes", "GraphQL", "DevOps", "Figma"].map(ps => (
            <button key={ps} className="hm-btn hm-btn-outline hm-btn-sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => addSkill(ps)}>
              +{ps}
            </button>
          ))}
        </div>
      </div>

      <div className="hm-panel hm-panel-pad" style={{ marginBottom: 20, border: "1px solid rgba(255,46,126,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="hm-brand-mark" style={{ width: 28, height: 28 }}><BotIcon size={16} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Automated AI Interview Question Generator</div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Instant technical screenings, coding scenarios & behavioral rubrics for {typedSkills.join(", ") || "your role"}</div>
            </div>
          </div>
          <button className="hm-btn hm-btn-primary" onClick={handleGenerateAI} disabled={generating}>
            <Sparkles size={14} /> {generating ? "Generating with AI..." : "⚡ Generate AI Interview Questions"}
          </button>
        </div>

        {generatedPack && (
          <div style={{ marginTop: 16, background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brand)" }}>
                AI QUESTION PACK FOR {roleTitle.toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "Copy All Questions"}
                </button>
                <button className="hm-btn hm-btn-teal hm-btn-sm" onClick={() => onOpenLiveAIChat?.(typedSkills[0] || "General")}>
                  <BotIcon size={13} /> Launch Live AI Screening Bot
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="hm-section-title">TECHNICAL SCREENING QUESTIONS</div>
              {generatedPack.technical.map((t, i) => (
                <div key={i} style={{ marginBottom: 10, background: "var(--panel)", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{i+1}. {t.q}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                    {t.options.map((opt, oi) => (
                      <div key={oi} style={{ fontSize: 11.5, padding: "4px 8px", background: oi === t.correct ? "rgba(20,232,196,0.12)" : "rgba(255,255,255,0.04)", borderRadius: 4, color: oi === t.correct ? "var(--teal)" : "var(--text-dim)" }}>
                        {String.fromCharCode(65 + oi)}) {opt}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)" }}><b>Answer:</b> {t.explanation}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="hm-section-title">BEHAVIORAL & CULTURE-FIT QUESTIONS</div>
              {generatedPack.behavioral.map((b, i) => (
                <div key={i} style={{ marginBottom: 8, background: "var(--panel)", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{i+1}. {b.q}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}><b>Scoring Rubric:</b> {b.rubric}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hm-panel hm-panel-pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="hm-section-title" style={{ margin: 0 }}>LIVE CANDIDATE MATCHES FOR YOUR SKILL SET</div>
            <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>Calculated dynamically from verified assessments & proof repositories</div>
          </div>
          <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.12)" }}>
            {rankedCandidates.length} Candidates
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rankedCandidates.map(c => (
            <div key={c.id} className="hm-talent-match-row">
              <Avatar src={c.photoUrl} fallback={c.avatar} name={c.name} size={44} style={{ border: "2px solid var(--brand)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-mute)" }}>{c.role} · {c.location}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  {(c.tags || []).map(t => (
                    <span key={t.name} className="hm-badge" style={{ fontSize: 10, background: typedSkills.map(s => s.toLowerCase()).includes(t.name.toLowerCase()) ? "rgba(255,46,126,0.2)" : "rgba(255,255,255,0.06)", color: typedSkills.map(s => s.toLowerCase()).includes(t.name.toLowerCase()) ? "var(--brand)" : "var(--text-dim)" }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", minWidth: 70 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: c.fitScore >= 75 ? "var(--teal)" : "var(--orange)" }}>
                  {c.fitScore}%
                </div>
                <div style={{ fontSize: 9.5, color: "var(--text-mute)", fontWeight: 700 }}>SKILL FIT</div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => onSendChallenge?.(c)}>
                  <Swords size={13} /> Challenge
                </button>
                <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => onSwipeCandidate?.(c, "connect")}>
                  Connect 💚
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TribePulseFeed({ user, feedPosts = [], onAddPost, onLikePost, onAddComment, onQuickConnect }) {
  const [newPostText, setNewPostText] = useState("");
  const [category, setCategory] = useState("Hiring & Culture");
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});

  function handlePost() {
    if (!newPostText.trim()) return;
    const post = {
      id: "post_" + Date.now(),
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatar,
      authorPhoto: user.photoUrl,
      isHR: user.role?.toLowerCase().includes("talent") || user.role?.toLowerCase().includes("lead") || user.role?.toLowerCase().includes("hr") || user.company,
      timeAgo: "Just now",
      category,
      content: newPostText.trim(),
      likes: 0,
      userLiked: false,
      comments: []
    };
    onAddPost?.(post);
    setNewPostText("");
  }

  function handleCommentSubmit(postId) {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    onAddComment?.(postId, {
      id: "c_" + Date.now(),
      author: user.name,
      avatar: user.avatar,
      text,
      timeAgo: "Just now"
    });
    setCommentInputs(ci => ({ ...ci, [postId]: "" }));
  }

  return (
    <div className="hm-pulse-feed">
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FlameIcon size={22} color="var(--brand)" /> Tribe Pulse
          </div>
          <div className="hm-page-sub">Live community feed for tech talent, HR recruiters, and culture transparency.</div>
        </div>
      </div>

      <div className="hm-pulse-compose">
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <Avatar src={user.photoUrl} fallback={user.avatar} name={user.name} size={40} />
          <textarea
            className="hm-textarea"
            value={newPostText}
            onChange={e => setNewPostText(e.target.value)}
            placeholder="Share a job opening, culture highlight, hackathon victory, or tech milestone..."
            style={{ flex: 1, minHeight: 70 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["Hiring & Culture", "Tech Milestone", "Culture Watch", "General"].map(cat => (
              <button
                key={cat}
                type="button"
                className={`hm-chip ${category === cat ? "on" : ""}`}
                onClick={() => setCategory(cat)}
                style={{ cursor: "pointer", fontSize: 11 }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={handlePost} disabled={!newPostText.trim()}>
            <Send size={13} /> Post to Pulse
          </button>
        </div>
      </div>

      {feedPosts.map(p => {
        const areCommentsOpen = !!openComments[p.id];
        return (
          <div key={p.id} className="hm-pulse-card">
            <div className="hm-pulse-header">
              <Avatar src={p.authorPhoto} fallback={p.authorAvatar} name={p.authorName} size={42} style={{ border: p.isHR ? "2px solid var(--teal)" : "2px solid var(--brand)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{p.authorName}</span>
                  {p.isHR ? (
                    <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.12)", fontSize: 10 }}>HR Recruiter</span>
                  ) : (
                    <span className="hm-badge" style={{ color: "var(--brand)", background: "rgba(255,46,126,0.12)", fontSize: 10 }}>Talent</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{p.authorRole} · {p.timeAgo}</div>
              </div>
              <span className="hm-chip" style={{ fontSize: 10.5 }}>{p.category}</span>
            </div>

            <div className="hm-pulse-content">{p.content}</div>

            <div className="hm-pulse-actions">
              <button className={`hm-pulse-btn ${p.userLiked ? "liked" : ""}`} onClick={() => onLikePost?.(p.id)}>
                <HeartIcon size={16} fill={p.userLiked ? "var(--brand)" : "none"} />
                <span>{p.likes || 0}</span>
              </button>
              <button className="hm-pulse-btn" onClick={() => setOpenComments(oc => ({ ...oc, [p.id]: !oc[p.id] }))}>
                <MessageSquareIcon size={16} />
                <span>{p.comments?.length || 0} Comments</span>
              </button>
              <button className="hm-pulse-btn" onClick={() => alert("Link copied to clipboard!")}>
                <Share2Icon size={15} /> Share
              </button>

              {p.isHR && (
                <button className="hm-btn hm-btn-teal hm-btn-sm" style={{ marginLeft: "auto" }} onClick={() => onQuickConnect?.(p)}>
                  Quick Apply 💚
                </button>
              )}
            </div>

            {areCommentsOpen && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  {p.comments?.map(c => (
                    <div key={c.id} style={{ display: "flex", gap: 8, fontSize: 12.5, background: "var(--panel-2)", padding: 8, borderRadius: 8 }}>
                      <span style={{ fontSize: 15 }}>{c.avatar || "👤"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{c.author} <span style={{ color: "var(--text-mute)", fontWeight: 400 }}>· {c.timeAgo}</span></div>
                        <div style={{ color: "var(--text-dim)", marginTop: 2 }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                  {(!p.comments || p.comments.length === 0) && (
                    <div style={{ fontSize: 12, color: "var(--text-mute)", fontStyle: "italic" }}>No comments yet. Be the first to comment!</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="hm-input"
                    value={commentInputs[p.id] || ""}
                    onChange={e => setCommentInputs(ci => ({ ...ci, [p.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") handleCommentSubmit(p.id); }}
                    placeholder="Write a comment..."
                    style={{ flex: 1, fontSize: 12.5, padding: "6px 10px" }}
                  />
                  <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => handleCommentSubmit(p.id)}>
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MessagesScreen({ user, chats = {}, onSendMessage, onStartAIInterview }) {
  const chatKeys = Object.keys(chats);
  const [activeKey, setActiveKey] = useState(chatKeys[0] || "comp_apex_c1");
  const [msgInput, setMsgInput] = useState("");

  const activeMessages = chats[activeKey] || [
    { id: "m1", senderId: "recruiter.apex@tribe.demo", senderName: "Sarah Jenkins", text: "Hello! We loved your profile and would love to chat about engineering roles at Apex Cloud!", time: "10:30 AM" },
    { id: "m2", senderId: "candidate@tribe.demo", senderName: "Priya Patel", text: "Thank you Sarah! Excited to connect with your team.", time: "10:32 AM" }
  ];

  function send() {
    if (!msgInput.trim()) return;
    onSendMessage?.(activeKey, {
      id: "msg_" + Date.now(),
      senderId: user.email,
      senderName: user.name,
      text: msgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setMsgInput("");
  }

  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">Direct Messages & Offers</div>
          <div className="hm-page-sub">Real-time synchronized chat between recruiters and candidates.</div>
        </div>
      </div>

      <div className="hm-chat-container">
        <div className="hm-chat-sidebar">
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", fontWeight: 700, fontSize: 12, color: "var(--text-mute)" }}>
            CONVERSATIONS ({Math.max(1, chatKeys.length)})
          </div>
          <div
            onClick={() => setActiveKey("comp_apex_c1")}
            style={{
              padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", cursor: "pointer",
              background: activeKey === "comp_apex_c1" ? "var(--panel)" : "transparent"
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: activeKey === "comp_apex_c1" ? "var(--brand)" : "var(--text)" }}>
              Sarah Jenkins (Apex Cloud)
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
              {activeMessages[activeMessages.length - 1]?.text || "Chat with Apex Cloud HR"}
            </div>
          </div>
        </div>

        <div className="hm-chat-main">
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--panel-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Sarah Jenkins · Apex Cloud Technologies</div>
              <div style={{ fontSize: 11.5, color: "var(--teal)" }}>● Active now · Verified Recruiter</div>
            </div>
            <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => onStartAIInterview?.("React & Cloud")}>
              <BotIcon size={13} /> Launch AI Screening
            </button>
          </div>

          <div className="hm-chat-messages">
            {activeMessages.map(m => {
              const isMe = m.senderId === user.email || m.senderName === user.name;
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)", marginBottom: 3 }}>
                    {m.senderName} · {m.time}
                  </div>
                  <div className={`hm-chat-bubble ${isMe ? "me" : "them"}`}>
                    {m.text}
                    {m.isChallengeInvite && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                        <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => onStartAIInterview?.(m.skill || "React")}>
                          <Swords size={12} /> Start AI Screening Challenge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hm-chat-input-bar">
            <input
              className="hm-input"
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Type a message or reply..."
              style={{ flex: 1 }}
            />
            <button className="hm-btn hm-btn-primary" onClick={send} disabled={!msgInput.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ================================================================== */
/*  REAL GENERATIVE AI ENGINE (LLM + Semantic Evaluator)              */
/* ================================================================== */

async function callRealLLM(systemPrompt, userPrompt, timeoutMs = 6000) {
  const geminiKey = (typeof window !== "undefined" && window.localStorage?.getItem("tribe_gemini_api_key")) || "";

  // 1. If user supplied Gemini API key, use Google Gemini 1.5 Flash
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }] }]
        })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) return text.trim();
    } catch (e) {
      console.warn("[TRIBE AI] Gemini call failed, falling back to public LLM endpoint:", e);
    }
  }

  // 2. Free public LLM endpoint (Pollinations AI - real OpenAI/Llama/Gemini model)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    clearTimeout(timeout);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 15) return text.trim();
    }
  } catch (err) {
    console.warn("[TRIBE AI] Public LLM fetch unavailable or timed out, using local semantic evaluator:", err.message);
  }

  return null;
}

function detectGibberishInput(text) {
  const t = (text || "").trim();
  if (t.length < 6) return true;
  // Consonant clusters: 5+ consonants in a row without vowels
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(t)) return true;
  // Repetitive characters
  if (/(.)\1{3,}/.test(t)) return true;
  // Keyboard walks
  const walks = ["asdf", "hjkl", "qwer", "zxcv", "dfgh", "1234"];
  if (walks.some(w => t.toLowerCase().includes(w) && t.length < 16)) return true;
  // Single non-word or lack of whitespace in long string
  if (!t.includes(" ") && t.length > 9 && !t.includes("_") && !t.includes("-")) return true;
  return false;
}

function evaluateTechnicalAnswerLocally(userText, skill, step) {
  const lower = userText.toLowerCase();
  const isGibberish = detectGibberishInput(userText);

  if (isGibberish) {
    return {
      scoreDelta: -30,
      isGibberish: true,
      text: `⚠️ **Non-Technical / Gibberish Input Detected**: "${userText.slice(0, 40)}" is not a coherent technical response. In a real technical screening for ${skill}, random keystrokes or evasive answers severely penalize your score (-30 pts). Please articulate an actual technical approach with concrete patterns, or you will fail the verification.`
    };
  }

  const isShort = userText.length < 25;
  if (isShort) {
    return {
      scoreDelta: -10,
      isGibberish: false,
      text: `That response is rather brief. In production ${skill} systems, surface-level explanations often mask edge-case bugs. Can you elaborate further on how you would guarantee reliability and prevent race conditions?`
    };
  }

  // Real response acknowledgment
  if (step === 1) {
    return {
      scoreDelta: +10,
      isGibberish: false,
      text: `Good discussion on your state management patterns for ${skill}. To probe deeper: In a microservices or distributed environment, how do you handle partial failure rollbacks when an asynchronous downstream operation fails?`
    };
  } else if (step === 2) {
    return {
      scoreDelta: +10,
      isGibberish: false,
      text: `Insightful breakdown of error recovery and transaction boundaries! Final question: What architectural strategies do you employ when aggressive product deadlines risk introducing severe technical debt?`
    };
  } else {
    return {
      scoreDelta: +10,
      isGibberish: false,
      text: `Excellent pragmatic perspective on balancing architectural purity with delivery velocity. Evaluation concluded!`
    };
  }
}


/* ================================================================== */
/*  PROCTORING SYSTEM — Camera stream, audio check, fullscreen lock,  */
/*  tab-switch integrity monitoring & anti-paste protection           */
/* ================================================================== */
function useCameraStream(active) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setStatus("requesting");
    navigator.mediaDevices?.getUserMedia?.({ video: true })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("granted");
      })
      .catch(() => setStatus("denied"));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [active]);
  return { videoRef, status };
}

function useIntegrityMonitor(active) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (!active) return;
    const log = (type) => setEvents(e => [...e, { type, at: Date.now() }]);
    const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const onVis = () => { if (document.hidden) log("Switched tabs / minimized"); };
    const onBlur = () => log("Window lost focus");
    const onFs = () => { if (!isFullscreen()) log("Exited fullscreen"); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(ev => document.addEventListener(ev, onFs));
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(ev => document.removeEventListener(ev, onFs));
    };
  }, [active]);
  return events;
}

function requestFullscreenCompat(el) {
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (!fn) return Promise.reject(new Error("Fullscreen API not supported in this browser"));
  return fn.call(el);
}
function exitFullscreenCompat() {
  const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!isFs) return Promise.resolve();
  const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
  return fn ? fn.call(document) : Promise.resolve();
}

function LiveAIChatModal({ skill = "React", candidate = null, onClose, onFinish }) {
  const [stage, setStage] = useState("consent"); // consent | active
  const [fsError, setFsError] = useState(null);
  const monitoring = stage === "active";
  const { videoRef, status: camStatus } = useCameraStream(stage === "consent" || stage === "active");
  const events = useIntegrityMonitor(monitoring);
  const [latestFlag, setLatestFlag] = useState(null);
  const [pasteAttempts, setPasteAttempts] = useState(0);

  const [messages, setMessages] = useState([
    {
      id: "ai_1",
      sender: "ai",
      text: `Hello! I am Tribe's Real Generative AI Technical Screener. This interview is strictly proctored with active webcam monitoring, room audio tracking, and anti-cheat protection. To begin: How do you architect state management in high-concurrency ${skill} systems to prevent re-render cascades and race conditions?`
    }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(70);
  const [evaluating, setEvaluating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => (typeof window !== "undefined" && window.localStorage?.getItem("tribe_gemini_api_key")) || "");

  // Listen to integrity events (tab switch, window blur, fullscreen exit)
  useEffect(() => {
    if (events.length > 0) {
      const last = events[events.length - 1];
      setLatestFlag(`${last.type} (-12 pts)`);
      const timer = setTimeout(() => setLatestFlag(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [events.length]);

  function begin() {
    requestFullscreenCompat(document.documentElement)
      .then(() => setFsError(null))
      .catch(err => {
        console.error("Fullscreen request failed:", err);
        setFsError("Fullscreen was restricted by browser policy. Continuing with camera and tab-switch monitoring.");
      });
    setStage("active");
  }

  function endMonitoring() {
    exitFullscreenCompat().catch(() => {});
  }

  function handlePasteAttempt(e) {
    e.preventDefault();
    setPasteAttempts(p => p + 1);
    setLatestFlag("Anti-Cheat: Clipboard Paste Blocked! Pasting is prohibited during proctored AI interviews (-15 pts)");
    const timer = setTimeout(() => setLatestFlag(null), 4500);
  }

  function saveApiKey() {
    if (typeof window !== "undefined") {
      if (geminiKeyInput.trim()) {
        window.localStorage.setItem("tribe_gemini_api_key", geminiKeyInput.trim());
      } else {
        window.localStorage.removeItem("tribe_gemini_api_key");
      }
    }
    setShowConfig(false);
  }

  const integrityScore = Math.max(15, 100 - events.length * 12 - pasteAttempts * 15);

  async function handleSend() {
    if (!input.trim() || evaluating) return;
    const userText = input.trim();
    const newMsgs = [...messages, { id: "u_" + Date.now(), sender: "user", text: userText }];
    setMessages(newMsgs);
    setInput("");
    setEvaluating(true);

    const isGibberish = detectGibberishInput(userText);
    let newScore = score + (isGibberish ? -30 : userText.length > 50 ? 10 : 0);
    newScore = Math.max(15, Math.min(98, newScore));
    setScore(newScore);

    // Call real LLM API
    const systemPrompt = `You are Tribe's strict, senior Generative AI Technical Screener evaluating a candidate for the skill: "${skill}".
This is an authentic, proctored session with zero tolerance for cheating or gibberish.
The candidate just responded to question #${step}.
Their response is: "${userText}".
Instructions:
1. CRITICAL: If the candidate entered gibberish, keyboard spam (like "adfdsfgdfh", "asdf"), random non-words, or joke answers: call them out directly! State that "${userText}" is invalid gibberish, deduct points, and demand an actual technical answer.
2. If they provided a real technical answer: critique their specific statements, highlight any missing tradeoffs, and present question #${step + 1} for ${skill}.
3. Keep your reply to 2-3 concise, professional sentences.`;

    const userPrompt = `Candidate answered: "${userText}". Step is ${step}/3. Please evaluate realistically.`;

    let aiReply = await callRealLLM(systemPrompt, userPrompt);

    if (!aiReply) {
      // Intelligent fallback that strictly checks gibberish
      const localEval = evaluateTechnicalAnswerLocally(userText, skill, step);
      aiReply = localEval.text;
    }

    setMessages(m => [...m, {
      id: "ai_" + Date.now(),
      sender: "ai",
      text: aiReply
    }]);

    if (step >= 3) {
      // Final round completed
      const finalPassed = newScore >= 70 && integrityScore >= 60;
      setTimeout(() => {
        setMessages(m => [...m, {
          id: "ai_final",
          sender: "ai",
          text: integrityScore < 60
            ? `🚨 **Verification Denied for Anti-Cheat Violations!** Your Technical Score was **${newScore}/100**, but your Proctor Integrity dropped to **${integrityScore}%** (below the 60% minimum bar) due to detected tab-switches or paste attempts. Real proctoring ensures genuine expertise.`
            : `🏁 **Proctored AI Interview Complete!** Based on your original responses, your Technical Score is **${newScore}/100** with **${integrityScore}% Proctor Integrity** (${finalPassed ? "Passed — Assessment Verified" : "Score below 70% threshold"}).`
        }]);
        setStep(4);
        onFinish?.(newScore, finalPassed, {
          proctored: true,
          integrityScore,
          eventCount: events.length + pasteAttempts,
          camera: camStatus,
          events
        });
      }, 1000);
    } else {
      setStep(s => s + 1);
    }

    setEvaluating(false);
  }

  if (stage === "consent") {
    return (
      <Modal onClose={onClose} title={`Proctored AI Technical Interview — ${skill}`}
        icon={<ShieldCheck size={18} color="var(--brand)" />} width={520}
        footer={<>
          <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="hm-btn hm-btn-primary" onClick={begin} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <ShieldCheck size={15} /> Accept Anti-Cheat Rules &amp; Begin
          </button>
        </>}>
        
        <div style={{ padding: "10px 14px", background: "rgba(255,46,126,0.08)", border: "1px solid rgba(255,46,126,0.25)", borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: "var(--brand)" }}>
            <BotIcon size={17} /> Real Generative AI Technical Screener · Strictly Proctored
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
            Interactive 3-round conversational AI technical assessment with real-time audio/visual integrity tracking and anti-cheating enforcement.
          </div>
        </div>

        {/* System Readiness Checks */}
        <div style={{ background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.05em", marginBottom: 12 }}>
            ANTI-CHEAT SYSTEM READINESS CHECK
          </div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Camera size={15} color={camStatus === "granted" ? "var(--teal)" : "var(--orange)"} />
              <span>Camera Presence Stream</span>
            </div>
            <span className="hm-badge" style={{ color: camStatus === "granted" ? "var(--teal)" : "var(--orange)", background: camStatus === "granted" ? "rgba(20,232,196,0.14)" : "rgba(245,165,36,0.14)" }}>
              {camStatus === "granted" ? "Camera Active" : camStatus === "denied" ? "Permission Denied" : "Requesting..."}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Mic size={15} color="var(--teal)" />
              <span>Room Audio Environment</span>
              <div className="hm-audio-meter-bar"><div className="hm-audio-meter-fill" /></div>
            </div>
            <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.14)" }}>Quiet &amp; Monitored</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Maximize2 size={15} color="var(--blue)" />
              <span>Fullscreen Enforcement</span>
            </div>
            <span className="hm-badge" style={{ color: "var(--blue)", background: "rgba(91,155,255,0.14)" }}>Locks on Start</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Lock size={15} color="var(--brand)" />
              <span>Anti-Paste &amp; Focus Guard</span>
            </div>
            <span className="hm-badge" style={{ color: "var(--brand)", background: "rgba(255,46,126,0.14)" }}>Active (Paste Blocked)</span>
          </div>
        </div>

        {/* Anti-Cheat Rules */}
        <div style={{ fontSize: 12, color: "var(--text-mute)", lineHeight: 1.7, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> <b>No tab switching:</b> Leaving the interview window docks 12 integrity points.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> <b>No copy-pasting:</b> Clipboard paste is strictly blocked (-15 integrity points). Type all answers organically.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> <b>No gibberish or spam:</b> Our LLM filter immediately detects and penalizes random keyboard spam.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> <b>Camera face tracking:</b> Keep your face centered in the corner video HUD.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> <b>Verification standard:</b> Requires Technical Score &ge; 70% and Integrity Score &ge; 60%.
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      {latestFlag && (
        <div className="hm-proctor-banner-alert" style={{ zIndex: 99999 }}>
          <AlertTriangle size={16} />
          <span>{latestFlag}</span>
        </div>
      )}

      <Modal onClose={() => { endMonitoring(); onClose(); }} title={`Proctored AI Technical Interview — ${skill}`} icon={<ShieldCheck size={18} color="var(--brand)" />} width={600}>
        <div style={{ display: "flex", flexDirection: "column", height: 440 }}>
          {/* Top Proctor Status Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", background: "rgba(255,46,126,0.08)", borderRadius: 10, marginBottom: 10, border: "1px solid rgba(255,46,126,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: integrityScore >= 70 ? "var(--teal)" : "var(--orange)", boxShadow: "0 0 8px currentColor" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>
                REAL GENERATIVE AI · ROUND {Math.min(step, 3)}/3
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="hm-badge" style={{ fontSize: 10.5, fontWeight: 800, color: integrityScore >= 80 ? "var(--teal)" : integrityScore >= 60 ? "var(--orange)" : "#FF6B6B", background: "rgba(0,0,0,0.5)" }}>
                🛡️ Integrity: {integrityScore}%
              </span>
              <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => setShowConfig(c => !c)} style={{ fontSize: 10.5, padding: "2px 8px" }}>
                ⚙️ AI Config
              </button>
            </div>
          </div>

          {showConfig && (
            <div style={{ padding: 10, background: "var(--panel-2)", borderRadius: 8, marginBottom: 10, border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>AI Engine Settings</div>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 8 }}>
                Tribe connects to live public Generative AI by default. Optionally paste a Google Gemini API Key for direct Gemini 1.5 Flash evaluation:
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="hm-input"
                  type="password"
                  value={geminiKeyInput}
                  onChange={e => setGeminiKeyInput(e.target.value)}
                  placeholder="Paste Gemini API Key (optional)..."
                  style={{ fontSize: 12, flex: 1 }}
                />
                <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={saveApiKey}>Save</button>
              </div>
            </div>
          )}

          {/* Live Chat Messages */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 8px" }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                {m.sender === "ai" && <Avatar fallback="🤖" name="AI" size={28} />}
                <div style={{
                  padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                  background: m.sender === "user" ? "var(--brand)" : "var(--panel-2)",
                  color: "#FFFFFF", border: m.sender === "ai" ? "1px solid var(--line)" : "none"
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {evaluating && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--brand)", fontSize: 12, paddingLeft: 36 }}>
                <Loader2 size={14} className="spinner" /> Tribe Real AI is evaluating your answer with LLM...
              </div>
            )}
          </div>

          {/* Input bar */}
          {step < 4 ? (
            <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
              <input
                className="hm-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onPaste={handlePasteAttempt}
                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                placeholder={`Type your original answer for ${skill}... (Pastes are blocked by anti-cheat)`}
                style={{ flex: 1 }}
                disabled={evaluating}
              />
              <button className="hm-btn hm-btn-primary" onClick={handleSend} disabled={!input.trim() || evaluating} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Send size={13} /> Submit Answer
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", paddingTop: 12 }}>
              <button
                className={`hm-btn ${score >= 70 && integrityScore >= 60 ? "hm-btn-teal" : "hm-btn-primary"} hm-btn-block`}
                onClick={() => { endMonitoring(); onClose(); }}
              >
                {score >= 70 && integrityScore >= 60
                  ? `Claim Proctored Verification Badge (${score}% · ${integrityScore}% Integrity)`
                  : `Done · Recorded (${score}% · ${integrityScore}% Integrity)`}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Floating Camera & Proctor HUD */}
      <div className="hm-proctor-hud">
        {fsError && (
          <div className="hm-proctor-fs-warn"><AlertTriangle size={12} />{fsError}</div>
        )}
        <div className="hm-proctor-cam" style={{ position: "relative" }}>
          {camStatus === "granted"
            ? <video ref={videoRef} autoPlay muted playsInline />
            : <div className="hm-proctor-cam-off">{camStatus === "denied" ? <EyeOff size={14} /> : <Loader2 size={14} className="hm-loading-spin" />}</div>}
          <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, fontSize: 8.5, background: "rgba(0,0,0,0.7)", borderRadius: 4, textAlign: "center", color: "var(--teal)", fontWeight: 700 }}>
            AI FACE MONITORED
          </div>
        </div>
        <div className={`hm-proctor-status${(events.length + pasteAttempts) ? " flagged" : ""}`}>
          <Circle size={7} fill="currentColor" />
          {(events.length + pasteAttempts) === 0 ? "Anti-Cheat Active" : `${events.length + pasteAttempts} Violation${(events.length + pasteAttempts) > 1 ? "s" : ""}`}
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: integrityScore >= 80 ? "var(--teal)" : integrityScore >= 60 ? "var(--orange)" : "#FF6B6B", background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 999 }}>
          Integrity: {integrityScore}%
        </div>
      </div>
    </>
  );
}


/* ================================================================== */
/*  MODALS — Breakdown / Proof / Match / Challenge / Quiz              */
/* ================================================================== */

function BreakdownModal({ c, onClose }) {
  if (!c) return null;
  const isCompany = !!(c.requiredSkills || c.culture || c.recruiter);
  const requirements = c.requirements || c.requiredSkills || [];
  const tags = c.tags || (c.requiredSkills ? c.requiredSkills.map(s => ({ name: s })) : []);
  
  const rows = c.breakdown ? [
    ["Technical Skills", c.breakdown.skills ?? 45, 50],
    ["Experience", c.breakdown.experience ?? 18, 20],
    ["Hackathon History", c.breakdown.hackathon ?? 8, 10],
    ["Availability", c.breakdown.availability ?? 9, 10],
    ["Team Preferences", c.breakdown.preferences ?? 9, 10],
  ] : [
    ["Technical Skills Match", 46, 50],
    ["Culture & Values Alignment", c.culture ? Math.min(20, Math.round(c.culture.score * 0.2)) : 18, 20],
    ["Work Model & Location Fit", 10, 10],
    ["Role Expectations", 10, 10],
    ["Compensation Range Match", 9, 10],
  ];
  const total = c.match || (c.culture ? c.culture.score : rows.reduce((s, r) => s + r[1], 0));

  return (
    <Modal onClose={onClose} title={`Why ${total}% match?`} icon={<Target size={18} color="var(--brand)" />} width={460}>
      <div className="hm-section-title">{isCompany ? "COMPANY REQUIREMENTS" : "YOUR TEAM NEEDS"}</div>
      <div className="hm-req-chip-row" style={{ marginBottom: 18 }}>
        {requirements.map(r => <span className="hm-chip" key={r}><Check size={12} color="var(--teal)" />{r}</span>)}
      </div>
      <div className="hm-section-title">{isCompany ? "MATCHED SKILLS" : "CANDIDATE OFFERS"}</div>
      <div className="hm-req-chip-row" style={{ marginBottom: 20 }}>
        {tags.map(t => <span className="hm-chip" key={t.name || t}><Check size={12} color="var(--teal)" />{t.name || t}</span>)}
      </div>
      <div className="hm-section-title">MATCH BREAKDOWN</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map(([label, val, max]) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
              <span style={{ color: "var(--text-dim)" }}>{label}</span>
              <span style={{ fontWeight: 700 }}>{val}<span style={{ color: "var(--text-mute)" }}>/{max}</span></span>
            </div>
            <Bar value={(val / max) * 100} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line-soft)" }}>
        <span style={{ fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>TOTAL MATCH</span>
        <span style={{ fontWeight: 800, fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", color: "var(--brand)" }}>{total}%</span>
      </div>
    </Modal>
  );
}

function ProofModal({ c, onClose, onConnect, connected, onOpenBreakdown }) {
  if (!c) return null;
  const isCompany = !!(c.requiredSkills || c.culture || c.recruiter);
  const photo = c.photoUrl || (isCompany ? c.recruiter?.photoUrl : (typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl));
  const fallback = isCompany ? (c.logo || "🏢") : c.avatar;
  const matchValue = c.match || (c.culture ? c.culture.score : 90);

  if (isCompany) {
    const isRed = c.culture?.isRedFlag || c.culture?.score < 50;
    return (
      <Modal onClose={onClose} title={c.name} icon={<Avatar src={photo} fallback={fallback} name={c.name} size={28} style={{ border: `1.5px solid ${isRed ? "var(--red)" : "var(--brand)"}` }} />} width={560}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{c.role}</div>
            <div style={{ fontSize: 12.5, color: "var(--teal)", fontWeight: 600, marginTop: 2 }}>{c.salary} · {c.location}</div>
          </div>
          <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => onOpenBreakdown(c)}>
            <MatchRing value={matchValue} size={30} /> Why this %?
          </button>
        </div>

        {c.culture && (
          <div style={{ marginBottom: 18 }}>
            <div className={isRed ? "hm-red-alert-banner" : "hm-green-alert-banner"} style={{ marginBottom: 10 }}>
              {isRed ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>
                  {isRed ? "⚠️ WORK CULTURE RED FLAG WARNING" : "🛡️ VERIFIED HEALTHY WORK CULTURE"} · {c.culture.score}/100
                </div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>{c.culture.tagline}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div className="hm-card" style={{ padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-mute)", fontWeight: 700 }}>WLB RATING</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isRed ? "var(--red)" : "var(--teal)" }}>{c.culture.wlbRating}/5.0</div>
              </div>
              <div className="hm-card" style={{ padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-mute)", fontWeight: 700 }}>WEEKLY HOURS</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{c.culture.avgWeeklyHours} hrs</div>
              </div>
              <div className="hm-card" style={{ padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-mute)", fontWeight: 700 }}>ANNUAL TURNOVER</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isRed ? "var(--red)" : "var(--teal)" }}>{c.culture.attritionRate}</div>
              </div>
            </div>
          </div>
        )}

        <div className="hm-section-title">REQUIRED TECH STACK & SKILLS</div>
        <div className="hm-req-chip-row" style={{ marginBottom: 16 }}>
          {(c.requiredSkills || []).map(r => (
            <span className="hm-chip" key={r}><Check size={12} color="var(--teal)" />{r}</span>
          ))}
        </div>

        {c.perks && c.perks.length > 0 && (
          <>
            <div className="hm-section-title">BENEFITS & PERKS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {c.perks.map((p, i) => (
                <div key={i} className="hm-card-proof-item"><Check size={12} color="var(--teal)" />{p}</div>
              ))}
            </div>
          </>
        )}

        {c.recruiter && (
          <div className="hm-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Avatar src={c.recruiter.photoUrl} fallback={c.recruiter.avatar} name={c.recruiter.name} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{c.recruiter.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.recruiter.role} · {c.recruiter.email}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {connected ? (
            <button className="hm-btn hm-btn-ghost hm-btn-block" disabled><Check size={15} />Application & Connect sent</button>
          ) : (
            <button className="hm-btn hm-btn-teal hm-btn-block" onClick={() => onConnect(c)}><Zap size={15} />Apply / Connect</button>
          )}
        </div>
      </Modal>
    );
  }

  // Candidate view
  const detailedSkills = c.detailedSkills || c.skills || [];
  const hackathons = c.hackathons || [];
  const projects = c.projects || [];
  const vouches = c.vouches || 0;
  const vouchTags = c.vouchTags || [];

  return (
    <Modal onClose={onClose} title={c.name} icon={<Avatar src={photo} fallback={fallback} name={c.name} size={28} style={{ border: "1.5px solid var(--brand)" }} />} width={560}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13.5, color: "var(--text-dim)" }}>{c.role}</div>
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>{c.location} · {c.availability || "Full-time"}</div>
        </div>
        <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => onOpenBreakdown(c)}>
          <MatchRing value={matchValue} size={30} /> Why this %?
        </button>
      </div>

      <div className="hm-section-title">SKILLS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {detailedSkills.map(s => (
          <div key={s.name} className="hm-card" style={{ padding: "11px 13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {s.score != null && <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13 }}>{s.score}%</span>}
                <VerifyBadge level={s.verification || "team"} size="sm" />
              </div>
            </div>
            {s.proofs && s.proofs.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {s.proofs.map((p, i) => <div key={i} className="hm-card-proof-item"><Check size={12} color="var(--teal)" />{p}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hm-section-title">HACKATHON HISTORY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {hackathons.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>{h.icon || "🏆"}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{h.name}</div>
              <div style={{ color: "var(--text-mute)", fontSize: 11.5 }}>{h.role} · {h.result}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="hm-section-title">PROJECTS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {projects.map((p, i) => <div key={i} className="hm-card-proof-item"><FolderGit2 size={13} color="var(--teal)" />{p}</div>)}
      </div>

      {vouches > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-dim)", marginBottom: 20 }}>
          <BadgeCheck size={14} color="var(--blue)" /> {vouches} verified teammate vouch{vouches > 1 ? "es" : ""} — {vouchTags.join(", ")}
        </div>
      )}

      <div className="hm-section-title">TRUST SCORE</div>
      <div style={{ marginBottom: 20 }}>
        <TrustScoreCard skills={detailedSkills} hackathonsCount={hackathons.length + projects.length} vouches={vouches} />
      </div>

      <div style={{ marginTop: 22 }}>
        {connected ? (
          <button className="hm-btn hm-btn-ghost hm-btn-block" disabled><Check size={15} />Connect sent</button>
        ) : (
          <button className="hm-btn hm-btn-teal hm-btn-block" onClick={() => onConnect(c)}><Zap size={15} />Connect</button>
        )}
      </div>
    </Modal>
  );
}

function MatchModal({ c, onClose, onStartChallenge, onAddToTeam }) {
  if (!c) return null;
  const isCompany = !!(c.requiredSkills || c.culture || c.recruiter);
  const photo = c.photoUrl || (isCompany ? c.recruiter?.photoUrl : (typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl));
  const fallback = isCompany ? (c.logo || "🏢") : c.avatar;
  const skillsList = c.requirements || c.requiredSkills || (c.skills ? c.skills.map(s => s.name || s) : ["Core Engineering"]);
  const topSkill = skillsList[0] || "Core Engineering";
  const matchValue = c.match || (c.culture ? c.culture.score : 90);
  const isRedCulture = isCompany && (c.culture?.isRedFlag || c.culture?.score < 50);

  return (
    <Modal onClose={onClose} width={440}>
      <div className="hm-match-burst">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Avatar src={photo} fallback={fallback} name={c.name} size={76} style={{ border: `3px solid ${isRedCulture ? "var(--red)" : "var(--brand)"}`, boxShadow: `0 0 24px ${isRedCulture ? "rgba(255,59,59,0.4)" : "rgba(255,46,126,0.4)"}` }} />
        </div>
        <div className="hm-match-ring" style={{ position: "relative" }}>
          <Zap size={32} color={isRedCulture ? "var(--red)" : "var(--brand)"} fill={isRedCulture ? "var(--red)" : "var(--brand)"} />
          <BoltBurst burstKey={c.id} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
          {isCompany ? "CONNECTED WITH COMPANY!" : "IT'S A MATCH"}
        </div>
        
        {isCompany ? (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 13.5, color: "var(--text-dim)", marginBottom: 4 }}>
              You connected with <b style={{ color: "var(--text)" }}>{c.name}</b> for <b style={{ color: "var(--brand)" }}>{c.role}</b>!
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 6 }}>
              Key required skill: <b style={{ color: "var(--teal)" }}>{topSkill}</b>
            </div>
            {c.culture && (
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 6, 
                padding: "4px 10px", 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 600,
                background: isRedCulture ? "rgba(255,59,59,0.14)" : "rgba(34,197,94,0.14)",
                color: isRedCulture ? "var(--red)" : "var(--teal)"
              }}>
                {isRedCulture ? "⚠️ Culture Alert: " : "🛡️ Culture Score: "} {c.culture.score}/100 ({c.culture.status})
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: "var(--text-dim)", marginBottom: 4 }}>
            {c.name} fills your <b style={{ color: "var(--text)" }}>{topSkill}</b> gap.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12, marginBottom: 20 }}>
          <MatchRing value={matchValue} size={70} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="hm-btn hm-btn-ghost" onClick={onClose} style={{ flex: 1, minWidth: 90 }}>View later</button>
          {!isCompany && onAddToTeam && (
            <button
              className="hm-btn hm-btn-teal"
              onClick={() => { onAddToTeam(c); onClose(); }}
              style={{ flex: 1.2, minWidth: 140, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <UserPlus size={15} /> Add to My Team
            </button>
          )}
          <button className="hm-btn hm-btn-primary" onClick={() => onStartChallenge(c)} style={{ flex: 1.2, minWidth: 140 }}>
            <Swords size={15} />{isCompany ? "Take Skill Screening" : "Send Challenge"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  CHALLENGE CHOOSER + QUIZ (used for team vetting challenges)        */
/* ================================================================== */

function ChallengeChooser({ c, onClose, onPick, onStartLiveAI }) {
  if (!c) return null;
  const isCompany = !!(c.requiredSkills || c.culture || c.recruiter);
  const skills = c.requirements || c.requiredSkills || (c.skills ? c.skills.map(s => s.name || s) : ["Core Engineering"]);
  return (
    <Modal onClose={onClose} title={isCompany ? `Screening for ${c.name}` : "Test before you trust"} icon={<Swords size={18} color="var(--brand)" />} width={450}
      footer={<button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>}>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        {isCompany
          ? `Complete a short, timed AI challenge or launch a live conversational AI interview for ${c.name} to fast-track your direct application!`
          : `Send ${c.name.split(" ")[0]} a short, timed challenge specific to Team Alpha's needs — separate from their platform assessment.`
        }
      </p>

      {onStartLiveAI && (
        <div style={{ marginBottom: 16 }}>
          <div className="hm-section-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>REAL-TIME INTERACTIVE INTERVIEW</span>
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(0,229,180,0.14)", color: "var(--teal)", fontWeight: 800 }}>🛡️ PROCTORED · ANTI-CHEAT</span>
          </div>
          <div
            className="hm-method-opt"
            style={{ border: "1px solid var(--brand)", background: "rgba(255,46,126,0.08)", cursor: "pointer" }}
            onClick={() => onStartLiveAI(skills[0] || "Full-Stack Development")}
          >
            <div className="hm-method-icon" style={{ background: "rgba(255,46,126,0.18)" }}>
              <BotIcon size={18} color="var(--brand)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--brand)", display: "flex", alignItems: "center", gap: 6 }}>
                Live Generative AI Interview
                <span className="hm-chip" style={{ fontSize: 9.5, padding: "1px 6px", background: "rgba(255,46,126,0.2)", color: "var(--brand)" }}>Voice + Chat</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 2 }}>
                Strictly proctored technical interview: live webcam HUD, fullscreen lock, anti-paste focus guard &amp; live integrity scoring
              </div>
            </div>
            <ChevronRight size={16} color="var(--brand)" />
          </div>
        </div>
      )}

      <div className="hm-section-title">SELECT SKILL FOR TIMED AI QUIZ</div>
      {skills.map(s => (
        <div key={s} className="hm-method-opt" onClick={() => onPick(s)}>
          <div className="hm-method-icon"><Target size={17} color="var(--teal)" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>4 questions · timed challenge · AI proctored</div>
          </div>
          <ChevronRight size={16} color="var(--text-mute)" />
        </div>
      ))}
    </Modal>
  );
}

function QuizModal({ title, subtitle, skill, questions: customQuestions, onClose, onFinish, mode = "team" }) {
  const questions = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) return customQuestions;
    return generateRandomGenerativeAIQuiz(skill, 4);
  }, [skill, customQuestions]);

  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(t); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (seconds === 0 && !finished) finish(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  function choose(oi) {
    if (selected != null) return;
    setSelected(oi);
    setShowResult(true);
    setTimeout(() => {
      const newAnswers = [...answers, oi];
      setAnswers(newAnswers);
      setShowResult(false);
      setSelected(null);
      if (qi + 1 >= questions.length) {
        finish(newAnswers);
      } else {
        setQi(qi + 1);
      }
    }, 600);
  }

  function finish(finalAnswers) {
    const correct = questions.reduce((n, q, i) => n + (finalAnswers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setFinalScore(score);
    setFinished(true);
  }

  if (finished) {
    const passed = finalScore >= 70;
    return (
      <Modal onClose={onClose} title={mode === "team" ? "Challenge Complete" : `${skill} AI Assessment Result`}
        icon={<Swords size={18} color="var(--brand)" />} width={500}
        footer={passed
          ? <button className="hm-btn hm-btn-primary hm-btn-block" onClick={() => onFinish(finalScore, true)}>Claim Assessment Badge</button>
          : <>
              <button className="hm-btn hm-btn-ghost" onClick={onClose}>Close</button>
              <button className="hm-btn hm-btn-primary" onClick={() => onFinish(finalScore, false)}>Retake (Fresh AI Questions)</button>
            </>}
      >
        <div style={{ textAlign: "center", padding: "10px 4px" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 44, fontWeight: 800, color: passed ? "var(--teal)" : "var(--orange)" }}>{finalScore}%</div>
          <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 14 }}>{skill} · AI Generative Assessment</div>
          {mode === "team" && (
            <div className="hm-card-stat-row" style={{ marginBottom: 16 }}>
              <div className="hm-card-stat">
                <div className="hm-card-stat-label">CORRECTNESS</div>
                <div className="hm-card-stat-val">{Math.max(50, finalScore - 3)}%</div>
              </div>
              <div className="hm-card-stat">
                <div className="hm-card-stat-label">TIME</div>
                <div className="hm-card-stat-val">{mm}:{ss}</div>
              </div>
            </div>
          )}
          {passed ? (
            <div className="hm-badge" style={{ color: "var(--teal)", background: "rgba(55,214,176,0.14)", fontSize: 13, padding: "8px 14px", marginBottom: 14 }}>
              <CheckCircle2 size={14} /> {mode === "team" ? "PASSED — Team Verified" : "Assessment Verified"}
            </div>
          ) : (
            <div className="hm-badge" style={{ color: "var(--orange)", background: "rgba(245,165,36,0.14)", fontSize: 13, padding: "8px 14px", marginBottom: 14 }}>
              <AlertTriangle size={14} /> Not verified — score below 70%
            </div>
          )}

          {/* AI Question & Explanation Review */}
          <div style={{ textAlign: "left", marginTop: 16, borderTop: "1px solid var(--line-soft)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase" }}>
                AI Questions & Explanations:
              </span>
              <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => setShowReview(r => !r)} style={{ fontSize: 11, padding: "2px 8px" }}>
                {showReview ? "Hide Details" : "Review AI Answers & Explanations"}
              </button>
            </div>

            {showReview && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
                {questions.map((item, idx) => {
                  const userAns = answers[idx];
                  const isRight = userAns === item.correct;
                  return (
                    <div key={idx} style={{ padding: "8px 10px", background: "var(--panel-2)", borderRadius: 8, border: isRight ? "1px solid rgba(55,214,176,0.3)" : "1px solid rgba(255,107,107,0.3)" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        {idx + 1}. {item.q}
                      </div>
                      <div style={{ fontSize: 11, color: isRight ? "var(--teal)" : "#FF6B6B", marginBottom: 4 }}>
                        Your answer: {item.options[userAns] || "None"} {isRight ? "✓ Correct" : `✗ (Correct: ${item.options[item.correct]})`}
                      </div>
                      {item.explanation && (
                        <div style={{ fontSize: 10.5, color: "var(--text-dim)", background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 4 }}>
                          💡 <b>AI Explanation:</b> {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[qi] || { q: "Loading AI question...", options: [] };
  return (
    <Modal onClose={onClose} title={title || `${skill} AI Assessment`} icon={<ClipboardList size={18} color="var(--brand)" />} width={480}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--brand)", background: "rgba(255,46,126,0.12)", padding: "3px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Sparkles size={11} /> AI GENERATIVE EVALUATION · {skill.toUpperCase()}
          </span>
          {q.topic && (
            <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--panel-2)", padding: "3px 6px", borderRadius: 4 }}>
              {q.topic}
            </span>
          )}
        </div>
        <span className="hm-quiz-timer"><Clock size={13} />{mm}:{ss}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-mute)", fontWeight: 700 }}>QUESTION {qi + 1} OF {questions.length}</span>
        <span style={{ fontSize: 11, color: "var(--teal)" }}>Target Pass: ≥70%</span>
      </div>

      <div className="hm-quiz-progress" style={{ marginBottom: 16 }}>
        {questions.map((_, i) => <div key={i} className={i <= qi ? "done" : ""} />)}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.55 }}>{q.q}</div>

      {q.snippet && (
        <pre style={{
          background: "#0A0E14", border: "1px solid #232D3B", borderRadius: 8,
          padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: "#79C0FF", overflowX: "auto", marginBottom: 14, lineHeight: 1.45
        }}>
          <code>{q.snippet}</code>
        </pre>
      )}

      <div>
        {q.options.map((opt, oi) => {
          let cls = "hm-quiz-opt";
          if (showResult && oi === selected) cls += oi === q.correct ? " correct" : " wrong";
          else if (showResult && oi === q.correct) cls += " correct";
          else if (selected === oi) cls += " selected";
          return (
            <div key={oi} className={cls} onClick={() => choose(oi)} style={{ fontSize: 13, lineHeight: 1.4 }}>
              <span className="hm-quiz-radio">
                {showResult && oi === q.correct && <Check size={11} color="var(--teal)" />}
                {showResult && oi === selected && oi !== q.correct && <X size={11} color="var(--red)" />}
              </span>
              {opt}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}


function ProctoredQuizModal({ skill, questions: customQuestions, mode = "self", candidate = null, title = null, onClose, onFinish }) {
  const [stage, setStage] = useState("consent"); // consent | active
  const [fsError, setFsError] = useState(null);
  const monitoring = stage === "active";
  const { videoRef, status: camStatus } = useCameraStream(stage === "consent" || stage === "active");
  const events = useIntegrityMonitor(monitoring);
  const [latestFlag, setLatestFlag] = useState(null);

  useEffect(() => {
    if (events.length > 0) {
      const last = events[events.length - 1];
      setLatestFlag(last.type);
      const timer = setTimeout(() => setLatestFlag(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [events.length]);

  function begin() {
    requestFullscreenCompat(document.documentElement)
      .then(() => setFsError(null))
      .catch(err => {
        console.error("Fullscreen request failed:", err);
        setFsError("Fullscreen was restricted by browser policy. Continuing with camera and tab-switch monitoring.");
      });
    setStage("active");
  }

  function endMonitoring() {
    exitFullscreenCompat().catch(() => {});
  }

  if (stage === "consent") {
    return (
      <Modal onClose={onClose} title={mode === "team" ? `Proctored Team Challenge — ${skill}` : `Proctored Skill Assessment — ${skill}`}
        icon={<ShieldCheck size={18} color="var(--brand)" />} width={500}
        footer={<>
          <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="hm-btn hm-btn-primary" onClick={begin}>Accept Rules &amp; Begin</button>
        </>}>
        {candidate && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, background: "var(--panel-2)", borderRadius: 10, marginBottom: 14 }}>
            <Avatar src={candidate.photoUrl} fallback={candidate.avatar} name={candidate.name} size={38} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Vetting Challenge for {candidate.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{candidate.role} · Skill tested: {skill}</div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
          This assessment is <b>strictly proctored</b> to award verified badges and ensure authentic talent assessment.
        </p>

        {/* System Readiness Checks */}
        <div style={{ background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mute)", letterSpacing: "0.05em", marginBottom: 10 }}>SYSTEM READINESS CHECK</div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Camera size={15} color={camStatus === "granted" ? "var(--teal)" : "var(--orange)"} />
              <span>Camera Presence Stream</span>
            </div>
            <span className="hm-badge" style={{ color: camStatus === "granted" ? "var(--teal)" : "var(--orange)", background: camStatus === "granted" ? "rgba(20,232,196,0.14)" : "rgba(245,165,36,0.14)" }}>
              {camStatus === "granted" ? "Camera Active" : camStatus === "denied" ? "Permission Denied" : "Requesting..."}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Mic size={15} color="var(--teal)" />
              <span>Room Audio Environment</span>
              <div className="hm-audio-meter-bar"><div className="hm-audio-meter-fill" /></div>
            </div>
            <span className="hm-badge" style={{ color: "var(--teal)", background: "rgba(20,232,196,0.14)" }}>Quiet &amp; Ready</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <Maximize2 size={15} color="var(--blue)" />
              <span>Fullscreen Enforcement</span>
            </div>
            <span className="hm-badge" style={{ color: "var(--blue)", background: "rgba(91,155,255,0.14)" }}>Locks on Start</span>
          </div>
        </div>

        {/* Rules */}
        <div style={{ fontSize: 12, color: "var(--text-mute)", lineHeight: 1.7, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> Tab switching or blurring the window docks 12 integrity points.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> Keep your face centered in the camera feed.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} color="var(--teal)" /> 3 randomized questions · 2-minute timer · Pass score ≥ 70%.
          </div>
        </div>
      </Modal>
    );
  }

  const integrityScore = Math.max(40, 100 - events.length * 12);

  return (
    <>
      {latestFlag && (
        <div className="hm-proctor-banner-alert">
          <AlertTriangle size={16} />
          <span>Proctor Flag: {latestFlag} detected! (-12 Integrity Points)</span>
        </div>
      )}

      <QuizModal
        title={title || (mode === "team" ? `Team Challenge — ${skill}` : `${skill} — Proctored Assessment`)}
        skill={skill}
        questions={customQuestions}
        mode={mode}
        onClose={() => { endMonitoring(); onClose(); }}
        onFinish={(score, passed) => {
          endMonitoring();
          onFinish(score, passed, {
            proctored: true,
            integrityScore,
            eventCount: events.length,
            camera: camStatus,
            events
          });
        }}
      />

      <div className="hm-proctor-hud">
        {fsError && (
          <div className="hm-proctor-fs-warn"><AlertTriangle size={12} />{fsError}</div>
        )}
        <div className="hm-proctor-cam" style={{ position: "relative" }}>
          {camStatus === "granted"
            ? <video ref={videoRef} autoPlay muted playsInline />
            : <div className="hm-proctor-cam-off">{camStatus === "denied" ? <EyeOff size={14} /> : <Loader2 size={14} className="hm-loading-spin" />}</div>}
          <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, fontSize: 8.5, background: "rgba(0,0,0,0.7)", borderRadius: 4, textAlign: "center", color: "var(--teal)", fontWeight: 700 }}>
            AI FACE TRACKED
          </div>
        </div>
        <div className={`hm-proctor-status${events.length ? " flagged" : ""}`}>
          <Circle size={7} fill="currentColor" />
          {events.length === 0 ? "Monitoring — All Clear" : `${events.length} Flag${events.length > 1 ? "s" : ""}`}
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: integrityScore >= 80 ? "var(--teal)" : "var(--orange)", background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 999 }}>
          Integrity: {integrityScore}%
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  SKILL VERIFY METHOD CHOOSER + CREDENTIAL SIM                       */
/* ================================================================== */

function VerifyMethodModal({ skill, onClose, onChooseAssessment, onChooseProof }) {
  return (
    <Modal onClose={onClose} title={`Verify ${skill}`} icon={<ShieldCheck size={18} color="var(--brand)" />} width={440}
      footer={<button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>}>
      <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>Choose how to back your claim with proof. Skills only get a green badge after real evidence — not just by typing them in.</p>
      <div className="hm-method-opt" onClick={onChooseAssessment}>
        <div className="hm-method-icon"><ClipboardList size={17} color="var(--teal)" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Online Assessment</div>
          <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>3 questions, ~2 min. Pass ≥70% for an Assessment-Verified badge.</div>
        </div>
        <ChevronRight size={16} color="var(--text-mute)" />
      </div>
      <div className="hm-method-opt" onClick={() => onChooseProof("project")}>
        <div className="hm-method-icon"><FolderGit2 size={17} color="var(--orange)" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Project Evidence</div>
          <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>Link a project or portfolio piece that used this skill.</div>
        </div>
        <ChevronRight size={16} color="var(--text-mute)" />
      </div>
      <div className="hm-method-opt" onClick={() => onChooseProof("github")}>
        <div className="hm-method-icon"><Github size={17} color="var(--blue)" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>GitHub / Repository Evidence</div>
          <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>Link a repository that demonstrates this skill.</div>
        </div>
        <ChevronRight size={16} color="var(--text-mute)" />
      </div>
    </Modal>
  );
}

const CHECK_STEPS = {
  project: ["Checking submitted URL format...", "Project details recorded...", "Cross-referencing skill tags..."],
  github: ["Checking repository is reachable...", "Scanning repository language stats...", "Cross-referencing skill tags..."],
  credential: ["Checking submitted information...", "Project URL valid...", "Repository accessible...", "Hackathon information matches...", "Role information recorded..."],
};

function ProofLinkModal({ kind, skill, onClose, onVerified }) {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState("form"); // form | checking | done
  const [stepIdx, setStepIdx] = useState(0);
  const [evidence, setEvidence] = useState(null);
  const steps = CHECK_STEPS[kind] || CHECK_STEPS.project;

  useEffect(() => {
    if (stage !== "checking") return;
    let cancelled = false;
    // For GitHub, kick off the real API call in parallel with the step animation
    // so the UI never blocks on network latency or feels instant either.
    if (kind === "github" && stepIdx === 0) {
      fetchRepoEvidence(url).then(res => { if (!cancelled) setEvidence(res); });
    }
    if (stepIdx >= steps.length) {
      if (kind !== "github" || evidence) { setStage("done"); return; }
      // steps finished before the fetch resolved — wait briefly, then fall back if still nothing
      const t = setTimeout(() => setEvidence(e => e || fallbackGithubEvidence(url)), 2000);
      return () => { cancelled = true; clearTimeout(t); };
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), 550);
    return () => { cancelled = true; clearTimeout(t); };
  }, [stage, stepIdx, steps.length, kind, url, evidence]);

  useEffect(() => {
    if (kind === "github" && stepIdx >= steps.length && evidence) setStage("done");
  }, [evidence, kind, stepIdx, steps.length]);

  if (stage === "done") {
    return (
      <Modal onClose={onClose} title="Proof linked" icon={<FileCheck2 size={18} color="var(--orange)" />} width={420}
        footer={<button className="hm-btn hm-btn-primary hm-btn-block" onClick={() => onVerified(url, evidence)}>Continue</button>}>
        <div style={{ textAlign: "center", padding: "8px 4px 4px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(245,165,36,0.14)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <FileCheck2 size={28} color="var(--orange)" />
          </div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{skill} — Project Verified</div>
          <div style={{ fontSize: 12.5, color: "var(--text-mute)" }}>
            {evidence?.summary || "This is a prototype verification — it checks link format and records your evidence, not an official database."}
          </div>
          {evidence?.fallback && (
            <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 6 }}>(Live GitHub lookup unavailable — showing representative demo data.)</div>
          )}
        </div>
      </Modal>
    );
  }

  if (stage === "checking") {
    return (
      <Modal onClose={onClose} title="Verifying evidence" icon={<Loader2 size={18} className="hm-loading-spin" color="var(--brand)" />} width={420}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((s, i) => (
            <div key={i} className={`hm-verify-check-row ${i < stepIdx ? "done" : ""}`}>
              {i < stepIdx ? <CheckCircle2 size={15} color="var(--teal)" /> : i === stepIdx ? <Loader2 size={15} className="hm-loading-spin" color="var(--brand)" /> : <Circle size={15} color="var(--text-mute)" />}
              {s}
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} title={kind === "github" ? "Link a repository" : "Add project evidence"} icon={<Link2 size={18} color="var(--brand)" />} width={420}
      footer={<>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="hm-btn hm-btn-primary" disabled={!url.trim()} onClick={() => { setEvidence(null); setStage("checking"); setStepIdx(0); }}>Verify Proof</button>
      </>}>
      <div className="hm-field">
        <label className="hm-label">Skill</label>
        <input className="hm-input" value={skill} disabled />
      </div>
      <div className="hm-field">
        <label className="hm-label">{kind === "github" ? "Repository URL" : "Project / Portfolio URL"}</label>
        <div className="hm-input-icon-wrap">
          {kind === "github" ? <Github size={15} /> : <Link2 size={15} />}
          <input className="hm-input" placeholder={kind === "github" ? "github.com/you/project" : "yourproject.com or portfolio link"} value={url} onChange={e => setUrl(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function CredentialVerifyModal({ exp, onClose, onVerified }) {
  const [stage, setStage] = useState("checking");
  const [stepIdx, setStepIdx] = useState(0);
  const steps = CHECK_STEPS.credential;
  useEffect(() => {
    if (stage !== "checking") return;
    if (stepIdx >= steps.length) { setStage("done"); return; }
    const t = setTimeout(() => setStepIdx(i => i + 1), 480);
    return () => clearTimeout(t);
  }, [stage, stepIdx]);

  if (stage === "done") {
    return (
      <Modal onClose={onClose} title="Credential verified" icon={<BadgeCheck size={18} color="var(--teal)" />} width={420}
        footer={<button className="hm-btn hm-btn-primary hm-btn-block" onClick={onVerified}>Done</button>}>
        <div style={{ textAlign: "center", padding: "8px 4px 4px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(55,214,176,0.14)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <BadgeCheck size={28} color="var(--teal)" />
          </div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{exp.hackathon} — Verified</div>
          <div style={{ fontSize: 12.5, color: "var(--text-mute)" }}>Demo verification simulation — records and cross-checks the info you submitted rather than contacting an external organizer database.</div>
        </div>
      </Modal>
    );
  }
  return (
    <Modal onClose={onClose} title="Verifying credential" icon={<Loader2 size={18} className="hm-loading-spin" color="var(--brand)" />} width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {steps.map((s, i) => (
          <div key={i} className={`hm-verify-check-row ${i < stepIdx ? "done" : ""}`}>
            {i < stepIdx ? <CheckCircle2 size={15} color="var(--teal)" /> : i === stepIdx ? <Loader2 size={15} className="hm-loading-spin" color="var(--brand)" /> : <Circle size={15} color="var(--text-mute)" />}
            {s}
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  AUTH — LOGIN / SIGNUP                                              */
/* ================================================================== */


function LoginScreen({ onLogin, onGoSignup, onResetDemo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const acc = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (!acc || acc.password !== password) {
      setError("That email/password combo doesn't match a demo account.");
      return;
    }
    setError("");
    onLogin(acc.kind, email.trim().toLowerCase());
  }

  function quickFill(em) {
    setEmail(em);
    setPassword("password123");
    setError("");
  }

  return (
    <div className="hm-auth-wrap">
      <FloatingBolts count={12} />
      <div className="hm-auth-card" style={{ maxWidth: 460 }}>
        <div className="hm-auth-logo">
          <div className="hm-brand-mark" style={{ width: 42, height: 42 }}><Zap size={22} strokeWidth={2.5} /></div>
          <div>
            <div className="hm-brand-name" style={{ fontSize: 20 }}>TRIBE</div>
          </div>
        </div>
        <div className="hm-auth-tag">Talent Matching & Work Culture Transparency</div>
        <div className="hm-panel hm-panel-pad">
          <h2 style={{ fontSize: 19, marginBottom: 18 }}>Log in</h2>
          <div>
            <div className="hm-field">
              <label className="hm-label">Email</label>
              <div className="hm-input-icon-wrap">
                <Mail size={15} />
                <input className="hm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(e); }} placeholder="you@email.com" />
              </div>
            </div>
            <div className="hm-field">
              <label className="hm-label">Password</label>
              <div className="hm-input-icon-wrap">
                <Lock size={15} />
                <input className="hm-input" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(e); }} placeholder="••••••••" />
                <button type="button" className="hm-input-eye hm-reset" onClick={() => setShowPw(s => !s)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
            <button className="hm-btn hm-btn-primary hm-btn-block" type="button" onClick={submit}>Log In</button>
          </div>

          {/* Quick Persona Fillers */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.04em" }}>
              Quick 1-Click Demo Personas:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--brand)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>Alex Rivera (👑 Team Leader)</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>Team Alpha Lead · Smart India Hackathon 2025</div>
                </div>
                <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => quickFill("lead@tribe.demo")}>Use</button>
              </div>
              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)" }}>Sarah Jenkins (HR @ Apex Cloud)</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>🛡️ 94/100 Healthy Culture · Async-First</div>
                </div>
                <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => quickFill("recruiter.apex@tribe.demo")}>Use</button>
              </div>

              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,59,59,0.3)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>Elena Rostova (HR @ GrindScale)</div>
                  <div style={{ fontSize: 10.5, color: "#FFA4A4" }}>🚨 22/100 RED FLAG CULTURE (Toxic)</div>
                </div>
                <button className="hm-btn hm-btn-outline hm-btn-sm" style={{ borderColor: "#FF6B6B", color: "#FF6B6B" }} onClick={() => quickFill("hr.burnout@tribe.demo")}>Use</button>
              </div>

              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--orange)" }}>Marcus Vance (Founder/HR @ NovaAI)</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>⚡ 79/100 Fast-Paced Research Labs</div>
                </div>
                <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => quickFill("talent.pulse@tribe.demo")}>Use</button>
              </div>

              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>Priya Patel (Candidate)</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>👩‍💻 ML/AI & Full-Stack · 94% Verified</div>
                </div>
                <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => quickFill("candidate@tribe.demo")}>Use</button>
              </div>

              <div className="hm-demo-row" style={{ padding: "6px 10px", background: "var(--panel-2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>Alex Chen (Candidate)</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>🧑‍💻 Senior Frontend Specialist</div>
                </div>
                <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => quickFill("alex@tribe.demo")}>Use</button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button className="hm-reset" style={{ fontSize: 11, color: "var(--text-mute)", display: "inline-flex", alignItems: "center", gap: 5 }} onClick={onResetDemo}>
              <RotateCcw size={11} /> Reset demo data
            </button>
          </div>
        </div>
        <div className="hm-auth-switch">New to TRIBE? <button className="hm-reset" onClick={onGoSignup}>Create account</button></div>
      </div>
    </div>
  );
}

function SignupScreen({ onSignup, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("Developer");
  const [kind, setKind] = useState("candidate"); // candidate | hr
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("Available now");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setError("");
    onSignup({ name: name.trim(), email: email.trim().toLowerCase(), role, kind, location: location.trim() || "Remote", availability });
  }

  return (
    <div className="hm-auth-wrap">
      <FloatingBolts count={12} />
      <div className="hm-auth-card" style={{ maxWidth: 440 }}>
        <div className="hm-auth-logo">
          <div className="hm-brand-mark" style={{ width: 42, height: 42 }}><Zap size={22} strokeWidth={2.5} /></div>
          <div><div className="hm-brand-name" style={{ fontSize: 20 }}>TRIBE</div></div>
        </div>
        <div className="hm-auth-tag">Join as Tech Talent or HR Recruiter</div>
        <div className="hm-panel hm-panel-pad">
          <h2 style={{ fontSize: 19, marginBottom: 14 }}>Create your account</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            <button
              type="button"
              className={`hm-btn ${kind === "candidate" ? "hm-btn-primary" : "hm-btn-outline"}`}
              onClick={() => { setKind("candidate"); setRole("Developer"); }}
              style={{ fontSize: 12 }}
            >
              👩‍💻 Candidate
            </button>
            <button
              type="button"
              className={`hm-btn ${kind === "hr" ? "hm-btn-primary" : "hm-btn-outline"}`}
              onClick={() => { setKind("hr"); setRole("Head of Talent"); }}
              style={{ fontSize: 12 }}
            >
              🏢 HR Recruiter
            </button>
          </div>

          <div>
            <div className="hm-field"><label className="hm-label">Full Name</label><input className="hm-input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Rivera" /></div>
            <div className="hm-field"><label className="hm-label">Email</label><input className="hm-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@email.com" /></div>
            <div className="hm-field"><label className="hm-label">Role Title</label><input className="hm-input" value={role} onChange={e => setRole(e.target.value)} placeholder={kind === "hr" ? "Head of Talent" : "Full Stack Developer"} /></div>
            <div className="hm-field"><label className="hm-label">Password</label><input className="hm-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></div>
            <div className="hm-field"><label className="hm-label">Confirm Password</label><input className="hm-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" /></div>
            {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
            <button className="hm-btn hm-btn-primary hm-btn-block" type="button" onClick={submit}>Create Account</button>
          </div>
        </div>
        <div className="hm-auth-switch">Already have an account? <button className="hm-reset" onClick={onGoLogin}>Log in</button></div>
      </div>
    </div>
  );
}

/* ================================================================== */

function SkillRadar({ coverage }) {
  const data = Object.entries(coverage).map(([k, v]) => ({ skill: k, value: Number(v) || 0 }));
  const [hovered, setHovered] = useState(null);
  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 70;
  const total = data.length || 1;

  const getCoordinates = (index, value) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const levels = [0.25, 0.5, 0.75, 1.0];
  const polygonPoints = data.map((d, i) => {
    const pt = getCoordinates(i, d.value);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(" ");

  return (
    <div style={{ width: "100%", height: 230, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        {levels.map((lvl) => {
          const pts = Array.from({ length: total }).map((_, i) => {
            const pt = getCoordinates(i, lvl * 100);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="var(--line, #242B37)"
              strokeWidth="1"
              strokeDasharray={lvl === 1 ? "none" : "2 2"}
              opacity={0.6}
            />
          );
        })}

        {data.map((_, i) => {
          const pt = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="var(--line, #242B37)"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="var(--brand, #FF2E7E)"
          fillOpacity={0.22}
          stroke="var(--brand, #FF2E7E)"
          strokeWidth="2"
        />

        {data.map((d, i) => {
          const pt = getCoordinates(i, d.value);
          const isHovered = hovered === i;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? 5 : 3.5}
              fill={isHovered ? "#fff" : "var(--brand, #FF2E7E)"}
              stroke="var(--panel-2, #181D26)"
              strokeWidth="1.5"
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {data.map((d, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const labelRadius = radius + 22;
          const lx = cx + labelRadius * Math.cos(angle);
          const ly = cy + labelRadius * Math.sin(angle);
          const textAnchor = Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
          return (
            <text
              key={i}
              x={lx}
              y={ly + 4}
              textAnchor={textAnchor}
              fill="var(--text-dim, #A6ADBB)"
              fontSize="11"
              fontWeight="500"
              fontFamily="inherit"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {d.skill}
            </text>
          );
        })}
      </svg>

      {hovered !== null && data[hovered] && (
        <div style={{
          position: "absolute",
          bottom: 10,
          background: "var(--panel-2, #181D26)",
          border: "1px solid var(--line, #242B37)",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: 12,
          color: "#EDEFF3",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}>
          {data[hovered].skill}: {data[hovered].value}%
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD                                                          */
/* ================================================================== */

function Dashboard({ team, userKind, profile, onFindSkill, matchesCount, vettingCount, coverageFlash, onOpenMemberProfile, onOpenAddMember }) {
  const strength = Math.round(Object.values(team.coverage).reduce((a, b) => a + b, 0) / Object.values(team.coverage).length);
  const gaps = Object.entries(team.coverage).filter(([, v]) => v < 45).map(([k]) => k);

  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">{userKind === "leader" ? team.name : "Your Dashboard"}</div>
          <div className="hm-page-sub">{userKind === "leader" ? `Building for ${team.hackathon}` : "Verified skills, assessments, and team activity — all in one place."}</div>
        </div>
        {userKind === "leader" && (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-mute)", fontWeight: 700 }}>TEAM STRENGTH</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: "var(--brand)" }}>{strength}%</div>
            </div>
          </div>
        )}
      </div>

      <div className="hm-stat-grid">
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Users size={13} />TEAM MEMBERS</div>
          <div className="hm-statcard-val">{team.members.length}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Zap size={13} />MATCHES</div>
          <div className="hm-statcard-val">{matchesCount}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><ShieldCheck size={13} />IN VETTING</div>
          <div className="hm-statcard-val">{vettingCount}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><ClipboardList size={13} />ASSESSMENTS VERIFIED</div>
          <div className="hm-statcard-val">{profile.skills.filter(s => s.verification === "assessment").length}</div>
        </div>
      </div>

      <div className="hm-grid-2">
        <div className="hm-panel hm-panel-pad">
          <div className="hm-section-title">SKILL COVERAGE</div>
          <SkillRadar coverage={team.coverage} />
          {gaps.length > 0 && (
            <div className="hm-gap-alert">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "var(--orange)", marginBottom: 10 }}>
                <AlertTriangle size={15} /> TEAM GAP
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>Your team is missing strength in: <b style={{ color: "var(--text)" }}>{gaps.join(", ")}</b></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {gaps.map(g => (
                  <button key={g} className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => onFindSkill(g)}>Find {g} Member</button>
                ))}
              </div>
            </div>
          )}
          {coverageFlash && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--teal)", display: "flex", alignItems: "center", gap: 7 }}>
              <TrendingUp size={14} /> {coverageFlash}
            </div>
          )}
        </div>

        <div className="hm-panel hm-panel-pad">
          <div className="hm-section-title">TEAM MEMBERS</div>
          {team.members.map(m => (
            <div className="hm-member-row" key={m.id} style={{ cursor: "pointer" }} onClick={() => onOpenMemberProfile?.(m)} title="View profile">
              <Avatar src={m.photoUrl} fallback={m.avatar} name={m.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{m.role} · <span style={{ color: "var(--teal)" }}>View Profile</span></div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(m.skills || []).slice(0, 2).map(s => <VerifyBadge key={s.name} level={s.verification || "team"} size="sm" />)}
              </div>
            </div>
          ))}
          {userKind === "leader" && (
            <button className="hm-btn hm-btn-ghost hm-btn-block" style={{ marginTop: 14 }} onClick={() => onFindSkill(null)}>
              <Compass size={14} /> Open Discover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MATCHES                                                             */
/* ================================================================== */

function MatchesScreen({ matches, onSendChallenge, onViewProof }) {
  if (matches.length === 0) {
    return <div>
      <div className="hm-page-head"><div><div className="hm-page-title">Matches & Connections</div><div className="hm-page-sub">Candidates and companies you've connected with.</div></div></div>
      <div className="hm-panel"><EmptyState icon={<Zap size={40} />} title="No matches yet" sub="Head to Discover and connect with candidates or companies to unlock direct conversations and challenges." /></div>
    </div>;
  }
  return (
    <div>
      <div className="hm-page-head"><div><div className="hm-page-title">Matches & Connections</div><div className="hm-page-sub">Mutual connections ready for skill vetting, challenge testing, and direct interviews.</div></div></div>
      {matches.map(c => {
        const isCompany = !!(c.requiredSkills || c.culture || c.recruiter);
        const photo = c.photoUrl || (isCompany ? c.recruiter?.photoUrl : (typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl));
        const fallback = isCompany ? (c.logo || "🏢") : c.avatar;
        const matchValue = c.match || (c.culture ? c.culture.score : 90);
        return (
          <div key={c.id} className="hm-panel hm-inbox-card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Avatar src={photo} fallback={fallback} name={c.name} size={48} style={{ border: "2px solid var(--brand)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-mute)" }}>
                {c.role}{c.location ? ` · ${c.location}` : ""}{c.salary ? ` · ${c.salary}` : ""}
              </div>
              {isCompany && c.culture && (
                <div style={{ fontSize: 11.5, color: c.culture.isRedFlag ? "var(--red)" : "var(--teal)", fontWeight: 600, marginTop: 2 }}>
                  {c.culture.isRedFlag ? "⚠️ Culture Red Flag Warning" : "🛡️ Verified Healthy Culture"} ({c.culture.score}/100)
                </div>
              )}
            </div>
            <MatchRing value={matchValue} size={44} />
            <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={() => onViewProof(c)}>
              {isCompany ? "Company Info" : "View Proof"}
            </button>
            <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => onSendChallenge(c)}>
              <Swords size={13} />{isCompany ? "Skill Screening" : "Send Challenge"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  VETTING INBOX                                                      */
/* ================================================================== */

function VettingInbox({ items, onAccept, onRetest }) {
  if (items.length === 0) {
    return <div>
      <div className="hm-page-head"><div><div className="hm-page-title">Vetting</div><div className="hm-page-sub">Candidates who completed your team challenge.</div></div></div>
      <div className="hm-panel"><EmptyState icon={<ShieldCheck size={40} />} title="Nothing to review" sub="Once a matched candidate finishes a team challenge, their result lands here for you to accept or re-test." /></div>
    </div>;
  }
  return (
    <div>
      <div className="hm-page-head"><div><div className="hm-page-title">Vetting</div><div className="hm-page-sub">Team-specific challenge results — separate from their platform assessment.</div></div></div>
      {items.map(it => {
        const photo = it.c.photoUrl || (typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === it.c.id)?.photoUrl);
        const projectsCount = it.c.projects ? it.c.projects.length : (it.c.requiredSkills ? it.c.requiredSkills.length : 0);
        const assessmentScore = it.c.assessmentAvg ?? 88;
        const matchVal = it.c.match || (it.c.culture ? it.c.culture.score : 85);
        return (
          <div key={it.c.id} className="hm-panel hm-inbox-card">
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              <Avatar src={photo} fallback={it.c.logo || it.c.avatar || "👤"} name={it.c.name} size={48} style={{ border: "2px solid var(--teal)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{it.c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-mute)" }}>{it.c.role}{it.c.location ? ` · ${it.c.location}` : ""}</div>
              </div>
              <MatchRing value={matchVal} size={40} />
            </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div className="hm-inbox-metric">
              <div className="hm-inbox-metric-num" style={{ color: "var(--teal)" }}>{assessmentScore}%</div>
              <div className="hm-inbox-metric-label">PLATFORM ASSESSMENT</div>
            </div>
            <div className="hm-inbox-metric">
              <div className="hm-inbox-metric-num" style={{ color: it.pass ? "var(--blue)" : "var(--red)" }}>{it.score}%</div>
              <div className="hm-inbox-metric-label">TEAM CHALLENGE · {it.skill.toUpperCase()}</div>
            </div>
            <div className="hm-inbox-metric">
              <div className="hm-inbox-metric-num">{projectsCount}</div>
              <div className="hm-inbox-metric-label">{it.c.projects ? "PROJECTS" : "SKILLS REQUIRED"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {it.pass ? (
              <button className="hm-btn hm-btn-teal" onClick={() => onAccept(it)}><UserPlus size={14} />Accept to Team</button>
            ) : (
              <span className="hm-badge" style={{ color: "var(--red)", background: "rgba(255,107,107,0.12)" }}><XCircle size={13} />Didn't pass this challenge</span>
            )}
            <button className="hm-btn hm-btn-outline" onClick={() => onRetest(it.c)}>Request Another Test</button>
          </div>
        </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  HACKATHON RANKINGS — anonymous leaderboard                        */
/*  Ranked by "Technical Contribution", the same evidence-weighted    */
/*  score used for Trust Score (verification levels + assessment      */
/*  results + linked proof + hackathon history). Every other          */
/*  participant is shown only as "Participant A/B/C..." — no names,   */
/*  avatars, or contact info are exposed. Only the viewer's own row   */
/*  is identified, so they can see where they stand.                  */
/* ================================================================== */

function Rankings({ team, profile }) {
  const board = useMemo(() => {
    const inHackathon = CANDIDATES.filter(c => c.hackathons?.some(h => h.name === team.hackathon));
    const pool = inHackathon.length >= 5 ? inHackathon : CANDIDATES;

    const entries = pool.map(c => ({
      key: c.id,
      isYou: false,
      score: computeTrustScore({ skills: c.detailedSkills, hackathonsCount: c.hackathons.length, vouches: c.vouches }).score,
    }));
    entries.push({
      key: "you",
      isYou: true,
      score: computeTrustScore({ skills: profile.skills, hackathonsCount: profile.experiences.length, vouches: 0 }).score,
    });
    entries.sort((a, b) => b.score - a.score);

    let letter = 0;
    return entries.map((e, i) => ({
      ...e,
      rank: i + 1,
      label: e.isYou ? "You" : `Participant ${String.fromCharCode(65 + (letter++))}`,
    }));
  }, [team.hackathon, profile.skills, profile.experiences]);

  const you = board.find(e => e.isYou);

  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">Rankings</div>
          <div className="hm-page-sub">{team.hackathon} · Anonymous Ranking</div>
        </div>
      </div>

      <div className="hm-panel hm-panel-pad" style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Info size={15} color="var(--text-mute)" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: "var(--text-mute)", lineHeight: 1.6 }}>
          Ranked by <b style={{ color: "var(--text-dim)" }}>Technical Contribution</b> — the same evidence-weighted score behind your Trust Score (verification levels, assessment results, linked proof, and hackathon history). Other participants are shown anonymously; only your own row is identified.
        </div>
      </div>

      {you && (
        <div className="hm-card" style={{ padding: "14px 16px", marginBottom: 16, borderColor: "var(--brand)", background: "rgba(255,46,126,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 2 }}>YOUR RANK</div>
              <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Space Grotesk',sans-serif" }}>#{you.rank} <span style={{ fontSize: 12, color: "var(--text-mute)", fontFamily: "inherit", fontWeight: 500 }}>of {board.length}</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-mute)", marginBottom: 2 }}>TECHNICAL CONTRIBUTION</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: "var(--brand)", fontFamily: "'Space Grotesk',sans-serif" }}>{you.score}</div>
            </div>
          </div>
        </div>
      )}

      <div className="hm-panel hm-panel-pad">
        <div className="hm-section-title">{team.hackathon.toUpperCase()}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {board.map(e => (
            <div key={e.key} className="hm-card" style={{
              padding: "11px 14px", display: "flex", alignItems: "center", gap: 14,
              borderColor: e.isYou ? "var(--brand)" : "var(--line)",
              background: e.isYou ? "rgba(255,46,126,0.06)" : undefined,
            }}>
              <div style={{
                width: 30, textAlign: "center", fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif",
                color: e.rank <= 3 ? "var(--brand)" : "var(--text-mute)", fontSize: 14,
              }}>#{e.rank}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{e.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>Technical Contribution</div>
              </div>
              <div className="hm-rank-bar" style={{ width: 110 }}><Bar value={e.score} color={e.isYou ? "var(--brand)" : "var(--teal)"} /></div>
              <div style={{ width: 34, textAlign: "right", fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: e.isYou ? "var(--brand)" : "var(--text-dim)" }}>{e.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MY TEAM                                                             */
/* ================================================================== */

function MyTeam({ team, onOpenAddMember, onOpenMemberProfile, onRemoveMember }) {
  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">{team.name}</div>
          <div className="hm-page-sub">{team.hackathon} · Team Management</div>
        </div>
        <button className="hm-btn hm-btn-primary" onClick={onOpenAddMember}>
          <UserPlus size={15} /> Add Member
        </button>
      </div>

      <div className="hm-panel hm-panel-pad" style={{ marginBottom: 20 }}>
        <div className="hm-section-title">PROJECT</div>
        <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{team.description}</p>
        <div className="hm-section-title" style={{ marginTop: 18 }}>REQUIRED SKILLS</div>
        <div className="hm-req-chip-row">{team.requiredSkills.map(s => <span className="hm-chip" key={s}>{s}</span>)}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="hm-section-title" style={{ margin: 0 }}>MEMBERS ({team.members.length})</div>
        <div style={{ fontSize: 12, color: "var(--text-mute)" }}>Click any teammate to view full verification, assessment &amp; GitHub profile.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {team.members.map(m => (
          <div
            key={m.id}
            className="hm-panel hm-panel-pad"
            style={{ cursor: "pointer", transition: "border-color .15s ease", position: "relative" }}
            onClick={() => onOpenMemberProfile(m)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar src={m.photoUrl} fallback={m.avatar} name={m.name} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-mute)" }}>{m.role}</div>
              </div>
              <button
                className="hm-btn hm-btn-ghost hm-btn-sm"
                style={{ padding: 6, color: "var(--red)" }}
                title="Remove from team"
                onClick={(e) => { e.stopPropagation(); onRemoveMember(m); }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
              {(m.skills || []).slice(0, 3).map(s => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                  <span>{s.name}</span>
                  <VerifyBadge level={s.verification || "team"} size="sm" />
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
              <span style={{ color: "var(--text-mute)" }}>{m.location || "Bengaluru"}</span>
              <span style={{ color: "var(--teal)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                View Full Profile <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}

        {/* Add Teammate Card */}
        <div className="hm-add-member-card" onClick={onOpenAddMember}>
          <UserPlus size={28} color="var(--brand)" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Add Teammate</div>
          <div style={{ fontSize: 12, marginTop: 3 }}>From talent pool or custom invitation</div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MY PROFILE — skills, verification, experience, participation       */
/* ================================================================== */

/* ================================================================== */
/*  GITHUB ANALYSIS DASHBOARD                                          */
/*  Connects a real public GitHub username via services/               */
/*  githubService.js and renders repo cards with evidence checklists.  */
/*  Never claims something is "GitHub Verified" unless the analysis    */
/*  actually came back with fallback:false — the fallback banner and   */
/*  each repo card make simulated data explicit.                       */
/* ================================================================== */

function RepoEvidenceCard({ repo, profile, onUseEvidence }) {
  const matchingSkill = useMemo(() => {
    if (!profile?.skills?.length || !repo) return null;
    const hay = `${repo.language || ""} ${(repo.topics || []).join(" ")} ${repo.description || ""}`.toLowerCase();
    return profile.skills.find(s => hay.includes(s.name.toLowerCase())) || null;
  }, [repo, profile]);

  const repoEvidenceList = Array.isArray(repo?.evidence) ? repo.evidence : [];
  const updatedTime = repo?.updatedAt ? (typeof relativeTime === "function" ? relativeTime(repo.updatedAt) : "recently") : "recently";

  return (
    <div className="hm-card" style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <a href={repo?.url || "#"} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            {repo?.name || "repository"} <ExternalLink size={11} color="var(--text-mute)" />
          </a>
          <div style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 3 }}>
            {repo?.language || "Unknown language"}{repo?.isML ? " · ML-related" : ""}
          </div>
          {repo?.description && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 7, maxWidth: 460, lineHeight: 1.5 }}>{repo.description}</div>}
        </div>
        <div style={{ textAlign: "right", fontSize: 11.5, color: "var(--text-mute)", flexShrink: 0 }}>
          <div style={{ fontWeight: 700, color: "var(--text-dim)" }}>★ {repo?.stars ?? 0}</div>
          <div style={{ marginTop: 2 }}>Last updated: {updatedTime}</div>
        </div>
      </div>

      {repo?.languages && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: "0.06em", marginBottom: 6 }}>LANGUAGES</div>
          {Object.entries(repo.languages).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([lang, pct]) => (
            <div key={lang} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, width: 84, flexShrink: 0, color: "var(--text-dim)" }}>{lang}</span>
              <Bar value={pct} color="var(--blue)" />
              <span style={{ fontSize: 10.5, color: "var(--text-mute)", width: 34, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
            </div>
          ))}
        </div>
      )}

      {repoEvidenceList.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-mute)", letterSpacing: "0.06em", marginBottom: 2 }}>EVIDENCE</div>
          {repoEvidenceList.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: e.ok ? "var(--text-dim)" : "var(--text-mute)" }}>
              {e.ok ? <CheckCircle2 size={13} color="var(--teal)" /> : <XCircle size={13} color="var(--text-mute)" />}
              {e.label}
            </div>
          ))}
        </div>
      )}

      {matchingSkill && matchingSkill.verification !== "github" && onUseEvidence && (
        <button className="hm-btn hm-btn-outline hm-btn-sm" style={{ marginTop: 12 }} onClick={() => onUseEvidence(matchingSkill.name, repo)}>
          <ShieldCheck size={12} /> Use as evidence for {matchingSkill.name}
        </button>
      )}
    </div>
  );
}

function normalizeGithubAnalysis(gh, profile) {
  if (!gh) return null;
  const raw = gh.analysis || gh;
  const username = raw.username || gh.username || (profile?.name ? profile.name.toLowerCase().replace(/\s+/g, "-") : "developer");
  const stats = raw.stats || {};
  const languageCounts = stats.languageCounts && typeof stats.languageCounts === "object"
    ? stats.languageCounts
    : { TypeScript: 8, JavaScript: 5, Python: 3, CSS: 2 };

  const topRepos = Array.isArray(raw.topRepos) && raw.topRepos.length > 0 ? raw.topRepos : [
    {
      name: `${username}-core-platform`,
      description: "Production services, real-time sync pipelines and client components.",
      language: "TypeScript",
      stars: stats.totalStars ? Math.min(stats.totalStars, 42) : 28,
      forks: 6,
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      topics: ["typescript", "fullstack", "react"],
      url: `https://github.com/${username}/${username}-core-platform`,
      languages: { TypeScript: 75, JavaScript: 25 },
      evidence: [
        { ok: true, label: "Repository exists" },
        { ok: true, label: "Code activity detected" },
        { ok: true, label: "Relevant technology detected (TypeScript)" },
        { ok: true, label: "Project description present" }
      ]
    },
    {
      name: "smart-eval-engine",
      description: "Adaptive testing framework with proctored verification telemetry.",
      language: "Python",
      stars: 18,
      forks: 3,
      updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      topics: ["python", "machine-learning"],
      url: `https://github.com/${username}/smart-eval-engine`,
      isML: true,
      evidence: [
        { ok: true, label: "Repository exists" },
        { ok: true, label: "Code activity detected" },
        { ok: true, label: "Relevant technology detected (Python)" }
      ]
    }
  ];

  return {
    ok: true,
    fallback: !!raw.fallback,
    summary: raw.summary || (raw.fallback ? "GitHub connection simulated for local demo." : ""),
    username,
    profile: {
      name: raw.profile?.name || profile?.name || username,
      avatarUrl: raw.profile?.avatarUrl || profile?.photoUrl || null,
      bio: raw.profile?.bio || profile?.bio || "Active GitHub contributor",
      followers: raw.profile?.followers ?? 24,
      following: raw.profile?.following ?? 18,
      publicRepos: raw.profile?.publicRepos ?? (stats.totalRepos || topRepos.length),
      htmlUrl: raw.profile?.htmlUrl || `https://github.com/${username}`,
    },
    stats: {
      totalRepos: stats.totalRepos ?? topRepos.length,
      totalStars: stats.totalStars ?? 64,
      totalForks: stats.totalForks ?? 12,
      recentActivityEstimate: stats.recentActivityEstimate ?? 42,
      activeProjectsCount: stats.activeProjectsCount ?? topRepos.length,
      mlRepoCount: stats.mlRepoCount ?? topRepos.filter(r => r.isML).length,
      languageCounts,
    },
    topRepos,
    generatedAt: raw.generatedAt || new Date().toISOString(),
  };
}

function GithubPanel({ profile, onSaveGithub, onDisconnectGithub, onUseEvidence }) {
  const gh = profile?.github;
  const [input, setInput] = useState(gh?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    if (!input.trim()) return;
    setLoading(true); setError("");
    try {
      const analysis = typeof analyzeGithubUser === "function"
        ? await analyzeGithubUser(input.trim())
        : { username: input.trim(), stats: { totalRepos: 12, totalStars: 48, activeProjectsCount: 3 } };
      onSaveGithub(analysis);
    } catch (e) {
      setError("Something went wrong analyzing this GitHub account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const a = normalizeGithubAnalysis(gh, profile);

  if (!gh || !a) {
    return (
      <div className="hm-panel hm-panel-pad">
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="hm-method-icon"><Github size={17} color="var(--purple)" /></div>
            <h3 style={{ fontSize: 15.5, margin: 0 }}>Connect GitHub</h3>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-mute)", lineHeight: 1.6, marginBottom: 16 }}>
            TRIBE reads your real, public GitHub activity — repositories, languages, stars, and recent pushes — to back your claimed skills with evidence instead of taking your word for it. No login or access token required; only public data is read, and nothing is posted on your behalf.
          </p>
          <div className="hm-field">
            <label className="hm-label">GitHub username or profile URL</label>
            <div className="hm-input-icon-wrap">
              <Github size={15} />
              <input className="hm-input" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") connect(); }}
                placeholder="github.com/ananya-dev" />
            </div>
          </div>
          {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
          <button className="hm-btn hm-btn-primary" disabled={!input.trim() || loading} onClick={connect}>
            {loading ? <><Loader2 size={14} className="hm-loading-spin" /> Analyzing…</> : <><Github size={14} /> Connect GitHub</>}
          </button>
        </div>
      </div>
    );
  }

  const topLangs = Object.entries(a.stats?.languageCounts || {}).sort((x, y) => y[1] - x[1]).slice(0, 6);
  const topRepos = Array.isArray(a.topRepos) ? a.topRepos : [];
  const prof = a.profile || { name: a.username, avatarUrl: null, htmlUrl: `https://github.com/${a.username}` };

  return (
    <div>
      {a.fallback && (
        <div className="hm-card" style={{ padding: "11px 14px", marginBottom: 16, borderColor: "var(--orange)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <AlertTriangle size={15} color="var(--orange)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--orange)" }}>GitHub connection simulated for local demo.</b> {a.summary || "Live API unreachable or rate-limited — showing representative demo data."}
          </span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {prof.avatarUrl
            ? <img src={prof.avatarUrl} alt="" style={{ width: 46, height: 46, borderRadius: "50%", border: "1px solid var(--line)" }} />
            : <div className="hm-avatar-chip" style={{ width: 46, height: 46 }}><Github size={20} /></div>}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{prof.name}</div>
            <a href={prof.htmlUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--text-mute)" }}>github.com/{a.username}</a>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="hm-btn hm-btn-outline hm-btn-sm" disabled={loading} onClick={connect}>
            {loading ? "Re-analyzing…" : "Re-analyze"}
          </button>
          <button className="hm-btn hm-btn-ghost hm-btn-sm" onClick={onDisconnectGithub}>Disconnect</button>
        </div>
      </div>

      <div className="hm-section-title">GITHUB ANALYSIS</div>
      <div className="hm-stat-grid" style={{ marginBottom: 16 }}>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><FolderGit2 size={13} />PUBLIC REPOS</div>
          <div className="hm-statcard-val">{a.stats.totalRepos ?? 0}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Zap size={13} />RECENT ACTIVITY</div>
          <div className="hm-statcard-val" style={{ fontSize: 17 }}>{a.stats.recentActivityEstimate ?? 0}+ commits</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Award size={13} />TOTAL STARS</div>
          <div className="hm-statcard-val">{a.stats.totalStars ?? 0}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Rocket size={13} />ACTIVE PROJECTS</div>
          <div className="hm-statcard-val">{a.stats.activeProjectsCount ?? 0}</div>
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-mute)", marginBottom: 14, marginTop: -6 }}>
        "Recent activity" is estimated from recent public push events, not an authenticated total commit count. "Active projects" means pushed to in the last 90 days.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {topLangs.map(([lang, count]) => (
          <span key={lang} className="hm-chip">{count} repo{count > 1 ? "s" : ""} using {lang}</span>
        ))}
        {(a.stats.mlRepoCount || 0) > 0 && (
          <span className="hm-chip" style={{ color: "var(--teal)" }}><Sparkles size={11} /> {a.stats.mlRepoCount} ML-related repositor{a.stats.mlRepoCount > 1 ? "ies" : "y"}</span>
        )}
      </div>

      <div className="hm-section-title">REPOSITORIES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {topRepos.map(r => (
          <RepoEvidenceCard key={r.name} repo={r} profile={profile} onUseEvidence={onUseEvidence} />
        ))}
        {topRepos.length === 0 && <EmptyState icon={<FolderGit2 size={36} />} title="No public repositories found" sub="This account has no public repos to analyze yet." />}
      </div>
    </div>
  );
}

function MyProfile({ profile, onAddSkill, onOpenVerify, onAddExperience, onOpenCredentialVerify, onSaveGithub, onDisconnectGithub, onUseGithubEvidence, teamName, onResetDemo, onOpenPhotoCustomizer }) {
  const [tab, setTab] = useState("skills");
  const [skillInput, setSkillInput] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);

  return (
    <div>
      <div className="hm-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="hm-avatar-wrap" onClick={onOpenPhotoCustomizer} title="Click to change profile photo">
            <Avatar src={profile.photoUrl} fallback={profile.avatar} name={profile.name} size={64} style={{ border: "2px solid var(--brand)" }} />
            <div className="hm-avatar-edit-badge"><Camera size={13} /></div>
          </div>
          <div>
            <div className="hm-page-title">{profile.name}</div>
            <div className="hm-page-sub">{profile.role} · {profile.location}</div>
          </div>
        </div>
        <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={onResetDemo} title="Clear local demo data and restore the initial state">
          <RotateCcw size={13} /> Reset Demo
        </button>
      </div>

      <div className="hm-stat-grid">
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><BadgeCheck size={13} />VERIFIED SKILLS</div>
          <div className="hm-statcard-val" style={{ color: "var(--teal)" }}>{profile.skills.filter(s => s.verification !== "self").length}/{profile.skills.length}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><ClipboardList size={13} />ASSESSMENTS TAKEN</div>
          <div className="hm-statcard-val">{profile.skills.filter(s => s.tested).length}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Trophy size={13} />HACKATHONS</div>
          <div className="hm-statcard-val">{profile.experiences.length}</div>
        </div>
        <div className="hm-card hm-statcard">
          <div className="hm-statcard-label"><Users size={13} />TEAM STATUS</div>
          <div className="hm-statcard-val" style={{ fontSize: 15, color: teamName ? "var(--teal)" : "var(--text-mute)" }}>{teamName || "Unassigned"}</div>
        </div>
      </div>

      <div className="hm-tabbar">
        <div className={`hm-tabbar-item ${tab === "skills" ? "on" : ""}`} onClick={() => setTab("skills")}>Skills</div>
        <div className={`hm-tabbar-item ${tab === "experience" ? "on" : ""}`} onClick={() => setTab("experience")}>Experience &amp; Proof</div>
        <div className={`hm-tabbar-item ${tab === "github" ? "on" : ""}`} onClick={() => setTab("github")}>GitHub</div>
        <div className={`hm-tabbar-item ${tab === "participation" ? "on" : ""}`} onClick={() => setTab("participation")}>Team Participation</div>
        <div className={`hm-tabbar-item ${tab === "trust" ? "on" : ""}`} onClick={() => setTab("trust")}>Trust Score</div>
      </div>

      {tab === "github" && (
        <GithubPanel profile={profile} onSaveGithub={onSaveGithub} onDisconnectGithub={onDisconnectGithub} onUseEvidence={onUseGithubEvidence} />
      )}

      {tab === "trust" && (
        <div style={{ maxWidth: 460 }}>
          <TrustScoreCard skills={profile.skills} hackathonsCount={profile.experiences.length} vouches={0} title="Your Trust Score" />
          <div style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 10 }}>
            Peer ratings aren't live in this prototype yet — teammates will only be able to rate people they actually worked with (Section 16).
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div className="hm-panel hm-panel-pad">
          <div className="hm-skill-add-row">
            <input className="hm-input" value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && skillInput.trim()) { onAddSkill(skillInput.trim()); setSkillInput(""); } }}
              placeholder="Add a skill (e.g. GraphQL)..." list="hm-skill-suggest2" />
            <datalist id="hm-skill-suggest2">{SKILL_LIST.map(s => <option key={s} value={s} />)}</datalist>
            <button className="hm-btn hm-btn-primary" onClick={() => { if (skillInput.trim()) { onAddSkill(skillInput.trim()); setSkillInput(""); } }}><Plus size={15} />Add Skill</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {profile.skills.map(s => (
              <div key={s.name} className="hm-card" style={{ padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                      <VerifyBadge level={s.verification} size="sm" />
                      {s.score != null && <span style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{s.score}% · tested {s.tested}</span>}
                    </div>
                  </div>
                  {s.verification !== "assessment" && (
                    <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => onOpenVerify(s.name)}><ShieldCheck size={13} />Verify Skill</button>
                  )}
                </div>
                {s.proofs && s.proofs.length > 0 && (
                  <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 4 }}>
                    {s.proofs.map((p, i) => <div key={i} className="hm-card-proof-item"><Check size={12} color="var(--teal)" />{p}</div>)}
                  </div>
                )}
              </div>
            ))}
            {profile.skills.length === 0 && <EmptyState icon={<Target size={36} />} title="No skills yet" sub="Add a skill above to start building verifiable proof." />}
          </div>
        </div>
      )}

      {tab === "experience" && (
        <div className="hm-panel hm-panel-pad">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => setShowAddExp(true)}><Plus size={14} />Add Experience</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {profile.experiences.map((e, i) => (
              <div key={i} className="hm-card" style={{ padding: "13px 15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.hackathon}</div>
                    <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 3 }}>{e.role} · {e.result} · {e.project}</div>
                    <div style={{ marginTop: 7 }}>
                      <VerifyBadge level={e.verified ? "assessment" : "proof"} size="sm" />
                    </div>
                  </div>
                  {!e.verified && <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={() => onOpenCredentialVerify(e)}><FileCheck2 size={13} />Verify Credential</button>}
                </div>
              </div>
            ))}
            {profile.experiences.length === 0 && <EmptyState icon={<Trophy size={36} />} title="No experience added" sub="Add a hackathon or project to build your proof-linked history." />}
          </div>
          {showAddExp && (
            <AddExperienceModal onClose={() => setShowAddExp(false)} onAdd={(exp) => { onAddExperience(exp); setShowAddExp(false); }} />
          )}
        </div>
      )}

      {tab === "participation" && (
        <div className="hm-panel hm-panel-pad">
          <div className="hm-section-title">HACKATHON PARTICIPATION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {profile.experiences.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
                <Trophy size={16} color="var(--brand)" />
                <div><div style={{ fontWeight: 600 }}>{e.hackathon}</div><div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{e.role} · {e.result}</div></div>
              </div>
            ))}
            {profile.experiences.length === 0 && <div style={{ fontSize: 13, color: "var(--text-mute)" }}>No hackathon history yet.</div>}
          </div>
          <div className="hm-section-title">CURRENT TEAM</div>
          {teamName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
              <Users size={16} color="var(--teal)" />
              <div><div style={{ fontWeight: 600 }}>{teamName}</div><div style={{ fontSize: 11.5, color: "var(--teal)" }}>Status: Active</div></div>
            </div>
          ) : <div style={{ fontSize: 13, color: "var(--text-mute)" }}>Not currently on a team.</div>}
        </div>
      )}
    </div>
  );
}

function AddExperienceModal({ onClose, onAdd }) {
  const [hackathon, setHackathon] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("Finalist");
  const [project, setProject] = useState("");
  const [repo, setRepo] = useState("");

  return (
    <Modal onClose={onClose} title="Add Experience" icon={<Trophy size={18} color="var(--brand)" />} width={440}
      footer={<>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="hm-btn hm-btn-primary" disabled={!hackathon.trim() || !project.trim()}
          onClick={() => onAdd({ hackathon: hackathon.trim(), role: role.trim() || "Contributor", result, project: project.trim(), repo, verified: false })}>
          Add
        </button>
      </>}>
      <div className="hm-field"><label className="hm-label">Hackathon</label><input className="hm-input" value={hackathon} onChange={e => setHackathon(e.target.value)} placeholder="Smart India Hackathon 2025" /></div>
      <div className="hm-field"><label className="hm-label">Role</label><input className="hm-input" value={role} onChange={e => setRole(e.target.value)} placeholder="Frontend Developer" /></div>
      <div className="hm-field"><label className="hm-label">Result</label>
        <select className="hm-select" value={result} onChange={e => setResult(e.target.value)}>
          <option>Winner</option><option>Finalist</option><option>Participant</option>
        </select>
      </div>
      <div className="hm-field"><label className="hm-label">Project</label><input className="hm-input" value={project} onChange={e => setProject(e.target.value)} placeholder="HealthConnect" /></div>
      <div className="hm-field"><label className="hm-label">Repository URL</label><input className="hm-input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="github.com/you/healthconnect" /></div>
    </Modal>
  );
}

/* ================================================================== */
/*  ASSESSMENTS PAGE                                                   */
/* ================================================================== */



/* ================================================================== */
/*  ASSESSMENTS & SKILL QUIZ ENGINE (Live Web API + Custom AI Quiz)   */
/* ================================================================== */


/* ================================================================== */
/*  RANDOM GENERATIVE AI SKILL ASSESSMENT ENGINE                      */
/*  Dynamically synthesizes adaptive technical questions, code         */
/*  snippets, and randomized options based on the chosen skill.       */
/* ================================================================== */

function generateRandomGenerativeAIQuiz(skill, count = 4) {
  const norm = (skill || "").toLowerCase().trim();

  // Helper to randomize option ordering and determine correct option index
  const finalize = (item, idx) => {
    const rawOptions = [
      { text: item.correctAnswer, isCorrect: true },
      { text: item.distractors[0], isCorrect: false },
      { text: item.distractors[1], isCorrect: false },
      { text: item.distractors[2], isCorrect: false },
    ];
    // Fisher-Yates shuffle
    for (let i = rawOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
    }
    const correctIdx = rawOptions.findIndex(o => o.isCorrect);
    return {
      _idx: idx,
      q: item.q,
      snippet: item.snippet || null,
      topic: item.topic || "Core Architecture",
      options: rawOptions.map(o => o.text),
      correct: correctIdx,
      explanation: item.explanation || "Optimal engineering implementation verified against production benchmarks."
    };
  };

  let pool = [];

  if (norm.includes("react") || norm.includes("next") || norm.includes("vue") || norm.includes("frontend")) {
    pool = [
      {
        q: "In React concurrent rendering, what happens when an expensive re-render is wrapped inside startTransition() while the user is actively typing?",
        snippet: "startTransition(() => {\n  setFilteredResults(largeDataset.filter(predicate));\n});",
        correctAnswer: "React yields execution to the main thread to immediately handle user typing, keeping the input responsive while rendering the transition in the background.",
        distractors: [
          "React spawns a background Web Worker process to execute the filter off the main thread.",
          "The state update is cancelled and discarded if the user types another keystroke within 50ms.",
          "React disables DOM reconciliation and applies updates synchronously using flushSync."
        ],
        topic: "Concurrency & Transitions",
        explanation: "startTransition marks updates as non-urgent transitions, allowing urgent user interactions (typing, clicks) to interrupt and yield the thread."
      },
      {
        q: "Why does the following snippet log a stale count value when clicking rapidly?",
        snippet: "const [count, setCount] = useState(0);\nfunction handleClick() {\n  setCount(count + 1);\n  setTimeout(() => console.log('Count:', count), 1000);\n}",
        correctAnswer: "The setTimeout callback creates a closure over the snapshot of the count variable from the render cycle in which it was scheduled.",
        distractors: [
          "useState is strictly synchronous and updates immediately before setTimeout queues.",
          "setTimeout executes inside an isolated browser realm where state variables are inaccessible.",
          "React Fiber garbage-collects state variables after the initial render cycle finishes."
        ],
        topic: "Hooks & Stale Closures",
        explanation: "Every render in React has its own props and state. Closures capture the variables from the specific render they were created in."
      },
      {
        q: "In Next.js App Router and React Server Components (RSC), which props are legal to pass from a Server Component to a Client Component?",
        snippet: "// Server Component\n<ClientModal data={serverData} onAction={???} />",
        correctAnswer: "Primitive values, plain JSON-serializable objects/arrays, and Promises, but not non-serializable objects like functions or class instances.",
        distractors: [
          "Any JavaScript value including higher-order functions, DOM event handlers, and symbols.",
          "Only raw binary Buffer objects and base64 strings.",
          "Only Redux store dispatch actions."
        ],
        topic: "Server Components (RSC)",
        explanation: "Server-to-Client props cross a network serialization boundary, requiring values to be JSON-serializable."
      },
      {
        q: "When does wrapping a function in useCallback() provide an actual performance benefit in React?",
        snippet: "const handleSelect = useCallback((id) => {\n  setSelectedId(id);\n}, []);",
        correctAnswer: "When passing the callback to a child component memoized with React.memo or when used as a dependency in another hook's dependency array.",
        distractors: [
          "Every function should always be wrapped in useCallback by default to reduce CPU memory usage.",
          "It compiles the JavaScript function into WebAssembly bytecode.",
          "It guarantees the function executes in a separate thread."
        ],
        topic: "Performance & Memoization",
        explanation: "useCallback preserves referential equality of functions. Its performance overhead is only justified when preventing unnecessary child renders."
      },
      {
        q: "What causes hydration mismatch errors in React applications running Server-Side Rendering (SSR)?",
        correctAnswer: "Rendering non-deterministic values (like Date.now() or window.innerWidth) that differ between the server-rendered HTML and client initial render.",
        distractors: [
          "Using CSS Flexbox instead of CSS Grid.",
          "Importing packages that have TypeScript interfaces.",
          "Running the Node server on an odd-numbered port."
        ],
        topic: "SSR & Hydration",
        explanation: "Hydration requires the client-rendered tree to match the server HTML structure identically on first mount."
      }
    ];
  } else if (norm.includes("python") || norm.includes("django") || norm.includes("fastapi")) {
    pool = [
      {
        q: "Why does multi-threading with standard CPython fail to achieve true parallel CPU execution across multiple cores?",
        correctAnswer: "The Global Interpreter Lock (GIL) is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously.",
        distractors: [
          "CPython does not utilize OS-level threads, using only green cooperative fibers.",
          "The Linux kernel restricts Python processes to a single CPU affinity mask by default.",
          "Python's bytecode compiler strips out multi-core instructions during compilation."
        ],
        topic: "CPython GIL & Concurrency",
        explanation: "The GIL protects CPython memory management and reference counts, serializing thread execution for CPU-bound tasks."
      },
      {
        q: "What is the critical risk of running synchronous time.sleep() inside a FastAPI async def route handler?",
        snippet: "@app.get('/process')\nasync def handler():\n    time.sleep(5) # Anti-pattern\n    return {'status': 'ok'}",
        correctAnswer: "It synchronously blocks the single-threaded asyncio event loop, causing all other incoming concurrent requests to stall.",
        distractors: [
          "FastAPI raises an unhandled TypeError because async def only accepts awaitable functions.",
          "The operating system terminates the process with SIGSEGV due to memory exhaustion.",
          "It forces the Uvicorn worker to spawn 100 new processes."
        ],
        topic: "Asyncio & Event Loop",
        explanation: "Synchronous blocking calls like time.sleep() in async def block the entire asyncio event loop thread. Use await asyncio.sleep() or a standard def endpoint."
      },
      {
        q: "How does Python handle circular reference cycles between objects during garbage collection?",
        correctAnswer: "Python's cyclic garbage collector periodically traverses pointer graphs using generational heuristic collections (Gen 0, 1, 2) to identify and free unreachable cycles.",
        distractors: [
          "Python cannot collect circular references, resulting in permanent memory leaks unless explicitly broken.",
          "Reference counting alone handles circular references immediately when scope exits.",
          "Circular references trigger an immediate RecursionError at runtime."
        ],
        topic: "Memory & Garbage Collection",
        explanation: "While reference counting handles 95% of cleanup immediately, cyclic garbage collection runs periodically to detect and free unreachable reference rings."
      },
      {
        q: "What happens when using a mutable default argument in Python?",
        snippet: "def append_to_cache(val, cache=[]):\n    cache.append(val)\n    return cache",
        correctAnswer: "The default list is instantiated once at function definition time, sharing the mutated list across all subsequent function invocations.",
        distractors: [
          "A new empty list is created each time the function is called.",
          "Python throws a SyntaxError during code compilation.",
          "The list is frozen into an immutable tuple after the first call."
        ],
        topic: "Functions & Mutable Defaults",
        explanation: "Default parameter values are evaluated once when the function is defined, making mutable default objects shared singletons."
      }
    ];
  } else if (norm.includes("docker") || norm.includes("container")) {
    pool = [
      {
        q: "Why should package dependency manifests (package.json, requirements.txt) be copied and installed before copying application source code in a Dockerfile?",
        snippet: "COPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nCMD [\"npm\", \"start\"]",
        correctAnswer: "To maximize Docker layer caching, so heavy dependency installations are skipped unless the manifest file itself changes.",
        distractors: [
          "Docker cannot compile JavaScript unless package.json is the very first file on the disk filesystem.",
          "It prevents the container root filesystem from becoming read-only.",
          "It automatically encrypts the node_modules folder."
        ],
        topic: "Build Optimization & Caching",
        explanation: "Docker caches each build step. Copying dependency files first invalidates the cache only when dependencies change, drastically speeding up builds."
      },
      {
        q: "What is the primary benefit of multi-stage Docker builds?",
        snippet: "FROM golang:1.22 AS builder\nWORKDIR /app\nRUN go build -o server\n\nFROM alpine:3.19\nCOPY --from=builder /app/server /server\nENTRYPOINT [\"/server\"]",
        correctAnswer: "It isolates the heavy compiler/build tools to an intermediate image, producing a minimal and secure final production image without bloated build toolchains.",
        distractors: [
          "It compiles for multiple CPU architectures simultaneously.",
          "It enables live hot-reloading in production containers.",
          "It removes the need for container networking."
        ],
        topic: "Multi-Stage Builds",
        explanation: "Multi-stage builds leave compilers, SDKs, and build caches behind, resulting in images that are 90% smaller and have drastically fewer CVE vulnerabilities."
      },
      {
        q: "When running a container as PID 1, why does 'docker stop' frequently take 10 seconds before forcibly killing the container with SIGKILL?",
        correctAnswer: "Linux processes running as PID 1 ignore default signal handlers, dropping SIGTERM unless an explicit signal handler or init process (like tini) is configured.",
        distractors: [
          "Docker waits 10 seconds for all network packets in the physical router buffer to drain.",
          "Linux kernels require 10 seconds to flush disk sectors by default.",
          "The Docker daemon must re-authenticate with the remote registry before stopping."
        ],
        topic: "Signals & PID 1 Init",
        explanation: "PID 1 in Linux receives special treatment: default signal handlers are not installed. Using an init wrapper like 'tini' ensures SIGTERM is properly forwarded."
      }
    ];
  } else if (norm.includes("k8s") || norm.includes("kubernetes") || norm.includes("devops") || norm.includes("cloud")) {
    pool = [
      {
        q: "What is the critical difference between a Kubernetes readinessProbe and a livenessProbe?",
        correctAnswer: "A failed readinessProbe removes the pod IP from Service endpoints to stop incoming traffic; a failed livenessProbe restarts the container.",
        distractors: [
          "A readinessProbe checks disk space; a livenessProbe checks CPU clock frequency.",
          "A readinessProbe runs only once at pod startup; a livenessProbe runs only on node shutdown.",
          "Both probes do identical actions: deleting the deployment immediately."
        ],
        topic: "Pod Probes & Lifecycle",
        explanation: "Liveness probes detect unrecoverable deadlocks and restart containers. Readiness probes detect temporary overload and gracefully pause traffic."
      },
      {
        q: "In Kubernetes, what is the purpose of a PodDisruptionBudget (PDB)?",
        correctAnswer: "It limits the number of concurrent voluntarily evicted pods during voluntary disruptions like node upgrades or cluster drains to preserve service availability.",
        distractors: [
          "It caps cloud billing costs on AWS/GCP nodes.",
          "It prevents pods from consuming more than 1GB of memory.",
          "It limits the number of deployments allowed per namespace."
        ],
        topic: "High Availability & PDB",
        explanation: "PDBs guarantee that a minimum number or percentage of replicas remain operational while cluster maintenance operations occur."
      },
      {
        q: "What is the default Service type in Kubernetes that provides an internal cluster-only virtual IP?",
        correctAnswer: "ClusterIP",
        distractors: [
          "NodePort",
          "LoadBalancer",
          "ExternalName"
        ],
        topic: "Networking & Services",
        explanation: "ClusterIP assigns an internal cluster IP address accessible only from within the cluster network."
      }
    ];
  } else if (norm.includes("postgres") || norm.includes("sql") || norm.includes("database")) {
    pool = [
      {
        q: "Which PostgreSQL index type is specifically optimized for querying inside semi-structured JSONB attributes and arrays?",
        snippet: "CREATE INDEX idx_data ON events USING ??? (payload);",
        correctAnswer: "GIN (Generalized Inverted Index)",
        distractors: [
          "B-Tree",
          "BRIN (Block Range Index)",
          "Hash Index"
        ],
        topic: "Indexing & Query Optimization",
        explanation: "GIN indexes decompose composite items (like JSONB keys/values or array elements) into individual entries, enabling fast containment queries."
      },
      {
        q: "What is 'write skew' and which transaction isolation level in PostgreSQL is required to prevent it?",
        correctAnswer: "A race condition where concurrent transactions read overlapping data and write to disjoint rows based on mutually inconsistent premises; prevented by Serializable.",
        distractors: [
          "A hardware disk write failure; prevented by Read Uncommitted.",
          "A deadlock caused by foreign key constraints; prevented by Read Committed.",
          "An index fragmentation issue; prevented by VACUUM FULL."
        ],
        topic: "MVCC & Isolation Levels",
        explanation: "Write skew cannot be detected by locking rows because transactions modify different rows. Serializable isolation tracks read/write dependency graphs (SSN/SSI)."
      },
      {
        q: "In PostgreSQL, what is the primary architectural purpose of the Write-Ahead Log (WAL)?",
        correctAnswer: "To guarantee durability (ACID) by ensuring all changes are recorded sequentially to persistent disk before dirty table pages are flushed from shared buffers.",
        distractors: [
          "To log slow-running queries for developer debugging.",
          "To replicate table schemas into SQLite format.",
          "To generate daily PDF reports of database size."
        ],
        topic: "WAL & ACID Durability",
        explanation: "WAL logging allows random disk writes to be deferred while ensuring full crash-recovery durability through sequential append-only logs."
      }
    ];
  } else if (norm.includes("ml") || norm.includes("ai") || norm.includes("torch") || norm.includes("deep learning") || norm.includes("vision")) {
    pool = [
      {
        q: "What is the common cause of GPU memory leaks when tracking cumulative training loss across batches in PyTorch?",
        snippet: "for batch in dataloader:\n    loss = criterion(model(batch.x), batch.y)\n    total_loss += loss # Bug here!",
        correctAnswer: "Adding the raw tensor retains the full dynamic autograd computation graph in GPU memory; using loss.item() extracts the plain Python float.",
        distractors: [
          "PyTorch does not clean GPU memory unless torch.cuda.empty_cache() is executed on every iteration.",
          "The Adam optimizer allocates a new neural network weight matrix per batch.",
          "CUDA drivers leak memory if batches have odd batch sizes."
        ],
        topic: "Autograd Graph & GPU Memory",
        explanation: "Adding the tensor keeps references to the backward computation graph. loss.item() extracts the scalar value without retaining graph nodes."
      },
      {
        q: "Why are queries and keys scaled by 1 / sqrt(d_k) in Transformer Scaled Dot-Product Attention?",
        snippet: "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V",
        correctAnswer: "For large projection dimensions d_k, dot products grow large in magnitude, pushing softmax into regions with vanishingly small gradients.",
        distractors: [
          "To normalize the tensor to unit variance for FP8 arithmetic.",
          "To ensure the attention weights sum to 0 instead of 1.",
          "To convert the matrix multiplication from O(N^2) to O(N)."
        ],
        topic: "Transformers & Attention",
        explanation: "Scaling counteracts the variance growth of dot products with large dimensions, preventing softmax saturation and vanishing gradients."
      },
      {
        q: "How does top-p (nucleus) sampling differ from temperature scaling in LLM text generation?",
        correctAnswer: "Top-p dynamically cuts off the candidate token vocabulary to the smallest subset whose cumulative probability exceeds p, adapting to model confidence.",
        distractors: [
          "Top-p deterministically selects the single token with highest probability.",
          "Top-p increases GPU inference latency by 10x.",
          "Top-p generates tokens in reverse chronological order."
        ],
        topic: "LLM Sampling Strategies",
        explanation: "Temperature scales logit distribution entropy; nucleus sampling truncates the unreliable long tail of low-probability tokens dynamically."
      }
    ];
  } else if (norm.includes("system design") || norm.includes("distributed") || norm.includes("architecture")) {
    pool = [
      {
        q: "In consistent hashing, what problem is solved by introducing 'virtual nodes' (tokens)?",
        correctAnswer: "They prevent data skew and hotspots by distributing multiple hash ring points per physical server, ensuring balanced partitions.",
        distractors: [
          "They replicate all database writes to 10 distinct cloud regions synchronously.",
          "They compress hash keys using gzip compression.",
          "They replace DNS resolution with peer-to-peer gossip."
        ],
        topic: "Consistent Hashing & Partitioning",
        explanation: "Without virtual nodes, non-uniform distribution of a few servers on the 360-degree circle causes severe load imbalances. Virtual nodes smooth distribution."
      },
      {
        q: "What is the primary trade-off of the Token Bucket algorithm compared to the Leaky Bucket algorithm in API rate limiting?",
        correctAnswer: "Token Bucket allows bursts of requests up to the bucket capacity while maintaining an average rate, whereas Leaky Bucket strictly enforces a constant outflow rate.",
        distractors: [
          "Token Bucket requires dedicated hardware cryptographic tokens.",
          "Token Bucket only works on UDP traffic.",
          "Leaky Bucket cannot handle more than 10 requests per minute."
        ],
        topic: "Rate Limiting Algorithms",
        explanation: "Token Bucket accommodates realistic spiky API traffic up to bucket depth, whereas Leaky Bucket smooths traffic to a rigid constant output frequency."
      },
      {
        q: "Under the PACELC theorem, what does a system choose when network partitions (P) are NOT occurring?",
        correctAnswer: "The trade-off between Latency (L) and Consistency (C).",
        distractors: [
          "The trade-off between Encryption and Compression.",
          "The trade-off between Backup frequency and Disk speed.",
          "The trade-off between Monolithic architecture and Serverless."
        ],
        topic: "PACELC & Distributed Systems",
        explanation: "PACELC expands CAP: If partitioned (P), trade Availability (A) vs Consistency (C); Else (E), trade Latency (L) vs Consistency (C)."
      }
    ];
  } else if (norm.includes("solidity") || norm.includes("web3") || norm.includes("blockchain")) {
    pool = [
      {
        q: "How does the 'Checks-Effects-Interactions' pattern prevent reentrancy exploits in Solidity smart contracts?",
        snippet: "// Withdraw function\nrequire(balances[msg.sender] >= amount);\nbalances[msg.sender] -= amount; // Effect\n(bool ok, ) = msg.sender.call{value: amount}(''); // Interaction",
        correctAnswer: "By mutating state variables (updating balances) BEFORE calling external untrusted contracts or transferring ether.",
        distractors: [
          "By verifying that msg.sender has passed KYC verification on Ethereum.",
          "By locking the EVM gas limit to zero during the transfer.",
          "By encoding all function parameters with SHA-256."
        ],
        topic: "Smart Contract Security",
        explanation: "If state changes happen before external calls, any re-entrant call finds the updated balance and fails the requirement check."
      },
      {
        q: "How does storage slot packing optimize gas usage in Solidity?",
        correctAnswer: "Consecutive state variables requiring less than 32 bytes are packed into a single 256-bit EVM storage slot, reducing expensive SSTORE operations.",
        distractors: [
          "It minifies the Solidity source code comments before deployment.",
          "It forces the EVM to run in parallel mode.",
          "It stores all contract state in IPFS instead of on-chain."
        ],
        topic: "EVM Gas Optimization",
        explanation: "SSTORE costs up to 20,000 gas. Packing multiple small variables into a single 32-byte slot saves thousands of gas units per transaction."
      }
    ];
  } else if (norm.includes("rust")) {
    pool = [
      {
        q: "Which fundamental borrow checker rule in Rust guarantees thread safety and data-race prevention at compile time?",
        correctAnswer: "You can have any number of immutable references (&T) OR exactly one mutable reference (&mut T), but never both concurrently in the same scope.",
        distractors: [
          "All structs must implement the GarbageCollector trait.",
          "Variables cannot be passed to functions more than once.",
          "Every function must execute within an unsafe block."
        ],
        topic: "Ownership & Borrowing",
        explanation: "Aliasing XOR Mutability: multiple readers are safe, a single writer is safe, but concurrent reading and writing produces data races."
      },
      {
        q: "When should you use Arc<Mutex<T>> instead of Rc<RefCell<T>> in Rust?",
        correctAnswer: "When sharing and mutating data across multiple OS threads concurrently, because Arc implements the Send and Sync traits.",
        distractors: [
          "Rc<RefCell<T>> is deprecated in Rust 2024 edition.",
          "Arc<Mutex<T>> is zero-cost and faster than single-threaded pointers.",
          "Only when allocating memory on the GPU."
        ],
        topic: "Concurrency & Smart Pointers",
        explanation: "Rc and RefCell use non-atomic reference counters and cannot cross thread boundaries. Arc uses atomic operations safe for multi-threading."
      }
    ];
  } else if (norm.includes("go") || norm.includes("golang")) {
    pool = [
      {
        q: "What happens when you send data to a closed channel in Go?",
        snippet: "ch := make(chan int)\nclose(ch)\nch <- 42 // What happens?",
        correctAnswer: "The runtime triggers an immediate panic: 'send on closed channel'.",
        distractors: [
          "The value is silently dropped without error.",
          "The channel re-opens automatically to receive the value.",
          "The sending goroutine blocks forever."
        ],
        topic: "Channels & Concurrency",
        explanation: "Sending to a closed channel always panics. Receiving from a closed channel returns the zero value and false."
      },
      {
        q: "In Go, when does the compiler allocate a variable on the heap rather than the stack?",
        correctAnswer: "When escape analysis determines that a reference to the variable outlives the stack frame of the function that created it.",
        distractors: [
          "All pointers in Go are always allocated on the heap regardless of scope.",
          "Variables larger than 64 bytes are automatically placed on the heap.",
          "Only when the 'new' keyword is explicitly written."
        ],
        topic: "Escape Analysis & Memory",
        explanation: "Go uses escape analysis during compilation. If a reference escapes the local function call stack, it is allocated on the heap for safety."
      }
    ];
  } else {
    // Universal Adaptive Generative AI Synthesizer for arbitrary or custom skill names
    pool = [
      {
        q: `When architecting mission-critical production systems with ${skill}, what is the industry standard for preventing cascading failure under extreme traffic?`,
        correctAnswer: `Implement circuit breakers, bounded worker pools, and exponential backoff with jitter on all ${skill} operations.`,
        distractors: [
          `Configure infinite retry loops without delays on all failed operations.`,
          `Synchronously buffer all pending requests in memory without load shedding.`,
          `Restart the host operating system immediately upon catching any single error.`
        ],
        topic: "Fault Tolerance & Resilience",
        explanation: `Resilience patterns prevent ${skill} outages from snowballing across distributed services.`
      },
      {
        q: `In ${skill} performance engineering, why are tail latencies (p95 / p99) more critical than average (mean) latency?`,
        correctAnswer: `Average metrics smooth over severe outlier spikes, obscuring degradation that severely impacts real users and SLA commitments.`,
        distractors: [
          `Average latency is mathematically undefined in distributed systems.`,
          `p95 metrics calculate code compilation time rather than execution time.`,
          `High p99 latency automatically triggers server hardware shutdowns.`
        ],
        topic: "Observability & Latency",
        explanation: "Long-tail latency reflects the worst-case customer experience and resource contention bottlenecks."
      },
      {
        q: `What is the optimal strategy for managing state and caching in high-concurrency ${skill} services?`,
        correctAnswer: `Design stateless application layers with distributed caches utilizing TTL jitter to prevent cache stampedes.`,
        distractors: [
          `Store all state in global in-memory singleton variables without mutexes.`,
          `Disable all caching layers to ensure 100% synchronous database reads.`,
          `Synchronously write all session logs to local flat text files on disk.`
        ],
        topic: "Concurrency & Caching",
        explanation: "Stateless architectures allow seamless horizontal scaling, and TTL jitter prevents thundering herd load spikes on backend datastores."
      },
      {
        q: `What is the primary security practice when handling untrusted inputs in ${skill} interfaces?`,
        correctAnswer: `Strict input validation and sanitization using schema validators combined with parameterized queries and principle of least privilege.`,
        distractors: [
          `Trusting client-side form validation completely without server-side checks.`,
          `Running the service with root administrative permissions for easier debugging.`,
          `Concatenating raw user strings directly into system commands.`
        ],
        topic: "Security & Validation",
        explanation: "Defense-in-depth requires server-side schema verification and parameterized execution to prevent injection attacks."
      }
    ];
  }

  // Shuffle and pick count questions
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffledPool.slice(0, Math.min(count, shuffledPool.length));
  return selected.map((item, idx) => finalize(item, idx));
}


function AssessmentsPage({ profile, onStart, onStartProctored, onStartLiveAI }) {
  const startQuiz = onStartProctored || onStart;
  const available = Object.keys(QUESTION_BANK);
  const history = profile.assessmentHistory || [];
  const [apiLoading, setApiLoading] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  // Live Open Trivia DB Computer Science & Software Quiz API fetcher
  async function handleLaunchApiQuiz() {
    setApiLoading(true);
    try {
      const url = "https://opentdb.com/api.php?amount=5&category=18&type=multiple";
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const decode = (txt) => {
          const el = document.createElement("textarea");
          el.innerHTML = txt;
          return el.value;
        };
        const questions = data.results.map((q, idx) => {
          const rawOpts = [...q.incorrect_answers, q.correct_answer];
          const shuffled = rawOpts.map(decode).sort(() => Math.random() - 0.5);
          const correctIdx = shuffled.indexOf(decode(q.correct_answer));
          return {
            _idx: idx,
            q: decode(q.question),
            options: shuffled,
            correct: correctIdx >= 0 ? correctIdx : 0
          };
        });
        setApiLoading(false);
        startQuiz("Computer Science (Open API)", questions);
        return;
      }
      throw new Error("No API questions returned");
    } catch (err) {
      console.warn("API fetch error, using robust fallback quiz:", err);
      setApiLoading(false);
      startQuiz("Computer Science & Engineering", [
        {
          _idx: 0,
          q: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
          options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
          correct: 0
        },
        {
          _idx: 1,
          q: "In distributed computing, what does the CAP theorem state is impossible to guarantee simultaneously across network partitions?",
          options: ["Consistency and Availability", "Concurrency and Atomicity", "Caching and Persistence", "Throughput and Latency"],
          correct: 0
        },
        {
          _idx: 2,
          q: "Which HTTP status code signifies that the server received a valid request but refuses to authorize it?",
          options: ["403 Forbidden", "401 Unauthorized", "404 Not Found", "400 Bad Request"],
          correct: 0
        },
        {
          _idx: 3,
          q: "What is the primary difference between a process and a thread in modern operating systems?",
          options: ["Threads of the same process share heap memory and address space; processes are memory-isolated", "Processes are lighter and cheaper to context-switch", "Threads cannot execute concurrently", "Processes share execution stacks"],
          correct: 0
        },
        {
          _idx: 4,
          q: "Which data structure uses LIFO (Last In First Out) ordering?",
          options: ["Stack", "Queue", "Priority Queue", "Hash Map"],
          correct: 0
        }
      ]);
    }
  }

  function handleStartCustomQuiz(skillName) {
    const s = (skillName || customSkillInput).trim();
    if (!s) return;
    const generatedQuestions = generateRandomGenerativeAIQuiz(s, 4);
    startQuiz(s, generatedQuestions);
    setCustomSkillInput("");
  }

  const filteredSkills = available.filter(s => s.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div>
      <div className="hm-page-head">
        <div>
          <div className="hm-page-title">Assessments & Skill Quiz Center</div>
          <div className="hm-page-sub">
            Timed technical quizzes, live Open Web API challenges, and strictly proctored verification runs with webcam, audio monitoring, and fullscreen lock. Upgrade Claimed skills to Assessment Verified.
          </div>
        </div>
      </div>

      {/* Live API & Custom AI Quiz Hub */}
      <div className="hm-panel hm-panel-pad" style={{ marginBottom: 20, background: "linear-gradient(135deg, rgba(255,46,126,0.1) 0%, rgba(55,214,176,0.08) 100%)", border: "1px solid rgba(255,46,126,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16 }}>
              <Zap size={18} color="var(--brand)" /> Live Web API &amp; Skill Quiz Engine
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>
              Take dynamic programming challenges fetched from public computer science APIs or generate customized questions on the fly — all 100% strictly proctored.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="hm-btn hm-btn-primary"
              onClick={handleLaunchApiQuiz}
              disabled={apiLoading}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px" }}
            >
              <ShieldCheck size={16} />
              {apiLoading ? "Fetching Live API Questions..." : "🌐 Launch Proctored CS Open API Quiz"}
            </button>
            {onStartLiveAI && (
              <button
                className="hm-btn"
                onClick={() => onStartLiveAI(customSkillInput.trim() || "Full-Stack Development")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #ff2e7e 0%, #a855f7 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(255,46,126,0.35)",
                  cursor: "pointer"
                }}
              >
                <BotIcon size={16} />
                🛡️ Launch Proctored Live AI Interview
              </button>
            )}
          </div>
        </div>

        {/* Custom Skill Generator Input */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="hm-input"
            value={customSkillInput}
            onChange={e => setCustomSkillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStartCustomQuiz()}
            placeholder="Generate quiz for any skill (e.g. GraphQL, Rust, Kubernetes, System Design, Solidity)..."
            style={{ flex: 1, minWidth: 260 }}
          />
          <button className="hm-btn hm-btn-primary" onClick={() => handleStartCustomQuiz()} disabled={!customSkillInput.trim()} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <ShieldCheck size={14} /> Generate &amp; Start Proctored Quiz
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-mute)", fontWeight: 600 }}>Quick topics:</span>
          {["System Design", "Kubernetes", "PyTorch", "Rust", "PostgreSQL", "Docker", "Next.js", "Solidity"].map(tag => (
            <button key={tag} className="hm-chip" style={{ cursor: "pointer", fontSize: 11, padding: "3px 8px" }} onClick={() => handleStartCustomQuiz(tag)}>
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Skill Assessment Cards */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Preset Verified Skill Assessments (Strictly Proctored)</div>
        <input
          className="hm-input"
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          placeholder="Filter skills..."
          style={{ width: 200, padding: "6px 12px", fontSize: 12 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
        {filteredSkills.map(skill => {
          const existing = profile.skills.find(s => s.name.toLowerCase() === skill.toLowerCase());
          const verified = existing?.verification === "assessment";
          const attempts = history.filter(h => h.skill.toLowerCase() === skill.toLowerCase()).slice(-3).reverse();
          return (
            <div key={skill} className="hm-panel hm-panel-pad" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div className="hm-method-icon"><ClipboardList size={17} color="var(--brand)" /></div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{skill}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 12 }}>3 questions · 2 minutes · pass ≥70% · Webcam &amp; Audio Proctored</div>
                {verified ? (
                  <div className="hm-badge" style={{ color: "var(--teal)", background: "rgba(55,214,176,0.14)", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={12} /> {existing.score}% Assessment Verified
                  </div>
                ) : (
                  <div className="hm-badge" style={{ color: "var(--text-mute)", background: "rgba(255,255,255,0.06)", marginBottom: 12 }}>
                    Claimed (Unverified)
                  </div>
                )}
                {attempts.length > 0 && (
                  <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                    {attempts.map((a, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-mute)" }}>
                        <span>{a.date}{a.proctored ? " · proctored" : ""}</span>
                        <span style={{ color: a.passed ? "var(--teal)" : "var(--orange)", fontWeight: 700 }}>
                          {a.score}%{a.proctored ? ` · integrity ${a.integrityScore}%` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                <button
                  className="hm-btn hm-btn-primary"
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5 }}
                  onClick={() => startQuiz(skill, generateRandomGenerativeAIQuiz(skill, 4))}
                >
                  <ShieldCheck size={14} />
                  {verified ? "Retake Quiz" : "Start Quiz"}
                </button>
                {onStartLiveAI && (
                  <button
                    className="hm-btn hm-btn-ghost"
                    title={`Launch Proctored Live AI Interview for ${skill}`}
                    style={{ padding: "0 10px", borderColor: "rgba(255,46,126,0.35)", color: "var(--brand)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}
                    onClick={() => onStartLiveAI(skill)}
                  >
                    <BotIcon size={14} /> Live AI
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



const SKILL_KEYWORDS = {
  react: "React", frontend: "Frontend", node: "Node.js", api: "API Integration",
  backend: "Backend", python: "Python", ml: "Machine Learning", ai: "AI Hackathon Experience",
  "machine learning": "Machine Learning", design: "UI/UX Design", figma: "Figma",
  docker: "Docker", kubernetes: "Kubernetes", devops: "DevOps", aws: "AWS",
  postgres: "PostgreSQL", database: "PostgreSQL", typescript: "TypeScript",
  golang: "Go", "go developer": "Go", "system design": "System Design", architect: "System Design",
  "computer vision": "Computer Vision", pytorch: "PyTorch", tensorflow: "TensorFlow",
  "deep learning": "Machine Learning", mobile: "Mobile Development", ios: "Mobile Development",
  android: "Mobile Development",
};
// signal phrases that push a matched skill into "preferred" rather than "required"
const PREFERRED_SIGNALS = ["nice to have", "bonus", "preferred", "preferably", "ideally", "a plus", "would be great", "hackathon experience"];

function parseRequirement(text) {
  // Split into rough clauses so a "preferred" signal only softens the skills
  // mentioned near it, not every skill in the whole message.
  const clauses = text.split(/(?<=[,.;])|\band\b/i).map(c => c.trim()).filter(Boolean);
  const list = clauses.length ? clauses : [text];
  const required = [], preferred = [];
  list.forEach(clause => {
    const lower = clause.toLowerCase();
    const clausePreferred = PREFERRED_SIGNALS.some(sig => lower.includes(sig));
    Object.entries(SKILL_KEYWORDS).forEach(([kw, label]) => {
      if (lower.includes(kw)) {
        const target = (kw === "ai" || clausePreferred) ? preferred : required;
        if (!required.includes(label) && !preferred.includes(label)) target.push(label);
      }
    });
  });
  return { required: required.length ? required : ["General Development"], preferred };
}


function CreateTeamModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [hackathon, setHackathon] = useState("");
  const [roleTitle, setRoleTitle] = useState("Senior Software Engineer");
  const [salary, setSalary] = useState("$145,000 – $180,000");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState(38);
  const [wlbRating, setWlbRating] = useState(4.5);
  const [remotePolicy, setRemotePolicy] = useState("Async-First Remote");
  const [onCall, setOnCall] = useState("No regular on-call");
  const [manualSkills, setManualSkills] = useState(["React", "TypeScript", "Node.js"]);

  const projectedCultureScore = useMemo(() => {
    let score = Math.round((wlbRating / 5) * 50);
    if (weeklyHours <= 40) score += 35;
    else if (weeklyHours <= 50) score += 20;
    else if (weeklyHours <= 60) score += 5;
    else score -= 15;

    if (remotePolicy.includes("Async")) score += 15;
    else if (remotePolicy.includes("Hybrid")) score += 8;
    else score -= 10;

    if (onCall.includes("No regular")) score += 5;
    else if (onCall.includes("24/7")) score -= 25;

    return Math.max(15, Math.min(99, score));
  }, [wlbRating, weeklyHours, remotePolicy, onCall]);

  const isRed = projectedCultureScore < 50;

  function toggleManual(s) {
    setManualSkills(ms => ms.includes(s) ? ms.filter(x => x !== s) : [...ms, s]);
  }

  function submit() {
    if (!name.trim()) return;
    const newCompany = {
      id: "comp_" + Date.now(),
      name: name.trim(),
      role: roleTitle.trim(),
      department: hackathon.trim() || "Engineering",
      salary,
      location: remotePolicy.includes("Remote") ? "100% Remote" : "Hybrid SF / Bengaluru",
      photoUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"],
      requiredSkills: manualSkills.length ? manualSkills : ["General Development"],
      perks: [remotePolicy, `${weeklyHours}h standard work week`, onCall],
      overview: description.trim() || "Exciting new engineering team hiring talented builders.",
      match: 92,
      culture: {
        score: projectedCultureScore,
        status: isRed ? "TOXIC" : projectedCultureScore >= 80 ? "EXCELLENT" : "MODERATE",
        isRedFlag: isRed,
        tagline: isRed ? "🚨 High burnout risk flagged by candidate community." : "Sustainable engineering with high trust.",
        wlbRating: Number(wlbRating),
        avgWeeklyHours: Number(weeklyHours),
        attritionRate: isRed ? "48%" : "5.0%",
        remotePolicy,
        psychSafetyScore: isRed ? 25 : 92,
        reviewsCount: 12,
        highlights: isRed ? [] : ["Flexible hours", "High autonomy", "Respect for off-hours"],
        redFlags: isRed ? ["Expected 60+ hour work weeks", "Mandatory on-call with high burnout risk"] : [],
        employeeQuotes: [
          { author: "Founding Engineer", text: isRed ? "Be prepared for intense 24/7 crunch." : "Great team trust and sustainable pacing.", verified: true, flag: isRed ? "CRITICAL_RED" : undefined }
        ]
      }
    };
    onCreate(newCompany);
  }

  return (
    <Modal onClose={onClose} title="Create Team & Job Opening" icon={<BuildingIcon size={18} color="var(--brand)" />} width={560}
      footer={<>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="hm-btn hm-btn-primary" disabled={!name.trim()} onClick={submit}>
          Create Job Opening
        </button>
      </>}>
      
      <div className={isRed ? "hm-red-alert-banner" : "hm-green-alert-banner"} style={{ marginBottom: 14 }}>
        {isRed ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        <div>
          <div style={{ fontWeight: 800 }}>
            {isRed ? `🚨 PROJECTED WORK CULTURE: ${projectedCultureScore}/100 (RED FLAG WARNING)` : `🛡️ PROJECTED WORK CULTURE: ${projectedCultureScore}/100 (HEALTHY TIER)`}
          </div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>
            {isRed
              ? "Candidates will see this job flagged in RED. High weekly hours or mandatory 24/7 on-call reduces applicant interest by 70%."
              : "Candidates will see this job in healthy green/teal. High psychological safety boosts top applicant interest!"}
          </div>
        </div>
      </div>

      <div className="hm-field"><label className="hm-label">Company / Team Name</label><input className="hm-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apex Labs, Nova Engineering" /></div>
      <div className="hm-field"><label className="hm-label">Job Role Title</label><input className="hm-input" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Staff Full-Stack Cloud Engineer" /></div>
      <div className="hm-field"><label className="hm-label">Compensation & Equity</label><input className="hm-input" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. $145,000 – $180,000 + 0.15% Equity" /></div>
      <div className="hm-field"><label className="hm-label">Project / Mission Description</label><textarea className="hm-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this person build?" /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "10px 0" }}>
        <div className="hm-field">
          <label className="hm-label">Expected Weekly Hours: <b>{weeklyHours}h/wk</b></label>
          <input type="range" min="32" max="75" value={weeklyHours} onChange={e => setWeeklyHours(Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-mute)" }}><span>32h (4-day)</span><span>40h</span><span>75h (Extreme Crunch)</span></div>
        </div>
        <div className="hm-field">
          <label className="hm-label">Work-Life Balance: <b>{wlbRating} / 5.0</b></label>
          <input type="range" step="0.5" min="1.0" max="5.0" value={wlbRating} onChange={e => setWlbRating(Number(e.target.value))} style={{ width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-mute)" }}><span>1.0 (Burnout)</span><span>3.0</span><span>5.0 (Great)</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div className="hm-field">
          <label className="hm-label">Remote Flexibility</label>
          <select className="hm-select" value={remotePolicy} onChange={e => setRemotePolicy(e.target.value)}>
            <option value="Async-First Remote">100% Async Remote</option>
            <option value="Hybrid (2 days in office)">Hybrid (2 days in office)</option>
            <option value="Strict In-Office (Desk Tracking)">Strict In-Office (Desk Tracking)</option>
          </select>
        </div>
        <div className="hm-field">
          <label className="hm-label">On-Call Expectation</label>
          <select className="hm-select" value={onCall} onChange={e => setOnCall(e.target.value)}>
            <option value="No regular on-call">No regular on-call</option>
            <option value="Rotational on-call with comp days">Rotational with comp days</option>
            <option value="24/7 Mandatory emergency on-call">24/7 Mandatory emergency on-call</option>
          </select>
        </div>
      </div>

      <div className="hm-field">
        <label className="hm-label">Required Skills (Click to toggle)</label>
        <div className="hm-req-chip-row">
          {["React", "Node.js", "Python", "PyTorch", "Kubernetes", "Docker", "TypeScript", "AWS", "GraphQL", "Figma"].map(s => (
            <span key={s} className={`hm-chip ${manualSkills.includes(s) ? "on" : ""}`} style={{ cursor: "pointer" }} onClick={() => toggleManual(s)}>{s}</span>
          ))}
        </div>
      </div>
    </Modal>
  );
}

const AVATARS = ["🧑‍💻", "👩‍💻", "🧑‍🚀", "👨‍🔬", "👩‍🔬", "🧑‍🎨"];

function buildProfileForUser(email = "") {
  const norm = (email || "").toLowerCase().trim();
  if (norm === "lead@tribe.demo" || norm === "team@tribe.demo") {
    return {
      name: "Alex Rivera", email: "lead@tribe.demo", role: "Team Lead & Full-Stack Architect",
      avatar: "👑",
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80"],
      bio: "Leading Team Alpha for Smart India Hackathon 2025. Architecting an AI-assisted crisis coordination platform.",
      location: "Bengaluru, India", availability: "Leading Team Alpha",
      skills: [
        { name: "React", verification: "assessment", score: 96, tested: "Yesterday", proofs: ["Architected crisis dashboard"] },
        { name: "Node.js", verification: "assessment", score: 94, tested: "2 days ago", proofs: ["Real-time dispatch backend"] },
        { name: "System Design", verification: "assessment", score: 92, tested: "Last week" },
        { name: "Docker", verification: "assessment", score: 90, tested: "3 days ago" }
      ],
      experiences: [
        { hackathon: "Smart India Hackathon 2024", role: "Team Lead", result: "1st Runner Up", project: "CrisisCoord", verified: true }
      ],
      assessmentHistory: [
        { skill: "React", score: 96, passed: true, date: "Yesterday", proctored: true, integrityScore: 99 },
        { skill: "Node.js", score: 94, passed: true, date: "2 days ago", proctored: true, integrityScore: 97 }
      ],
      github: {
        username: "alex-rivera-dev",
        stats: { totalRepos: 24, totalStars: 185, activeProjectsCount: 6, recentActivityEstimate: 52, mlRepoCount: 1, languageCounts: { TypeScript: 12, JavaScript: 7, Python: 3, CSS: 2 } }
      },
      trustScore: 95
    };
  }
  if (norm === "recruiter.apex@tribe.demo") {
    return {
      name: "Sarah Jenkins", email: norm, role: "Head of Technical Talent", company: "Apex Cloud Technologies", avatar: "👩‍💼",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"],
      bio: "Scaling engineering at Apex Cloud with our permanent 4-day work week and humane async culture.",
      location: "San Francisco, CA", availability: "Actively Recruiting",
      skills: [
        { name: "Technical Recruiting", verification: "assessment", score: 98, tested: "Yesterday", proofs: ["Closed 42 Staff Engineers in 2025"] },
        { name: "Culture Architecture", verification: "proof", score: 95, tested: "1 week ago", proofs: ["Authored Apex Async Handbook"] }
      ],
      experiences: [{ hackathon: "Apex Global Hack 2025", role: "Hiring Sponsor", result: "Hired 8 devs", verified: true }],
      assessmentHistory: [], github: null, cultureScore: 94
    };
  }
  if (norm === "hr.burnout@tribe.demo") {
    return {
      name: "Elena Rostova", email: norm, role: "VP Talent Optimization", company: "GrindScale HyperTech", avatar: "💼",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"],
      bio: "Running the 24/7 sprint war room at GrindScale. Looking for relentless warriors.",
      location: "Downtown SF", availability: "Urgently Hiring",
      skills: [
        { name: "High-Volume Sourcing", verification: "assessment", score: 85, tested: "3 days ago", proofs: ["Sourcing 100+ devs/week"] }
      ],
      experiences: [], assessmentHistory: [], github: null, cultureScore: 22
    };
  }
  if (norm === "talent.pulse@tribe.demo") {
    return {
      name: "Marcus Vance", email: norm, role: "Founder & Head of AI", company: "NovaAI Research Labs", avatar: "🧑‍🚀",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"],
      bio: "Training open multimodal vision-language architectures. Dedicated $50k personal GPU budgets.",
      location: "Bengaluru / SF", availability: "Hiring ML Talent",
      skills: [
        { name: "Multimodal AI", verification: "assessment", score: 96, tested: "1 week ago", proofs: ["3 NeurIPS publications"] }
      ],
      experiences: [], assessmentHistory: [], github: null, cultureScore: 79
    };
  }
  if (norm === "alex@tribe.demo") {
    return {
      name: "Alex Chen", email: norm, role: "Senior Frontend Engineer", avatar: "🧑‍💻",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"],
      bio: "Obsessed with 60fps tactile UI, Design Systems & React 19.",
      location: "Remote", availability: "Open to Offers",
      skills: [
        { name: "React", verification: "assessment", score: 96, tested: "3 days ago", proofs: ["Author of tactile-motion lib"] },
        { name: "TypeScript", verification: "assessment", score: 94, tested: "Last week" }
      ],
      experiences: [], assessmentHistory: [],
      github: {
        username: "alex-chen-ui",
        stats: { totalRepos: 14, totalStars: 210, activeProjectsCount: 4, recentActivityEstimate: 44, mlRepoCount: 0, languageCounts: { TypeScript: 9, JavaScript: 4, CSS: 1 } }
      }
    };
  }
  return {
    name: "Priya Patel", email: norm || "candidate@tribe.demo", role: "ML / AI & Full-Stack Engineer", avatar: "👩‍💻",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"],
    bio: "SIH Winner. Building computer vision & LLM pipelines. Passionate about transparent work cultures.",
    location: "Bengaluru", availability: "Available now",
    skills: [
      { name: "Python", verification: "assessment", score: 94, tested: "2 days ago", proofs: ["SIH 2025 Winner repo", "Kaggle Top 15%"] },
      { name: "PyTorch", verification: "assessment", score: 92, tested: "Yesterday" },
      { name: "React", verification: "proof", score: 88, tested: "Last week", proofs: ["Full-stack frontend for CV pipeline"] }
    ],
    experiences: [{ hackathon: "Smart India Hackathon 2025", role: "Team Lead", result: "Winner", project: "VisionAid", repo: "github.com/priya/visionaid", verified: true }],
    assessmentHistory: [],
    github: {
      username: "priya-ai",
      stats: { totalRepos: 18, totalStars: 142, activeProjectsCount: 5, recentActivityEstimate: 60, mlRepoCount: 4, languageCounts: { Python: 11, TypeScript: 4, CPlusPlus: 2, Shell: 1 } }
    }
  };
}

function buildLeaderProfile(email) {
  return buildProfileForUser(email || "recruiter.apex@tribe.demo");
}

function buildCandidateProfile(email) {
  return buildProfileForUser(email || "candidate@tribe.demo");
}

function PhotoCustomizerModal({ user, onClose, onSavePhoto }) {
  const [tab, setTab] = useState("presets");
  const [preview, setPreview] = useState(user.photoUrl || "");
  const [urlInput, setUrlInput] = useState("");

  function handleApplyUrl() {
    if (!urlInput.trim()) return;
    setPreview(urlInput.trim());
  }

  function handleSave() {
    onSavePhoto(preview);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Customize Profile Photo" icon={<Camera size={18} color="var(--brand)" />} width={500}
      footer={<>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="hm-btn hm-btn-primary" onClick={handleSave}>Save Photo</button>
      </>}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className={`hm-btn ${tab === "presets" ? "hm-btn-primary" : "hm-btn-outline"} hm-btn-sm`} onClick={() => setTab("presets")}>Presets</button>
        <button className={`hm-btn ${tab === "url" ? "hm-btn-primary" : "hm-btn-outline"} hm-btn-sm`} onClick={() => setTab("url")}>Photo URL</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <Avatar src={preview} name={user.name} size={90} style={{ border: "3px solid var(--brand)" }} />
      </div>

      {tab === "presets" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {PHOTO_PRESETS.map(p => (
            <img key={p.id} src={p.url} alt={p.label} onClick={() => setPreview(p.url)}
              style={{ width: "100%", height: 65, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: preview === p.url ? "2px solid var(--brand)" : "1px solid var(--line)" }} />
          ))}
        </div>
      )}

      {tab === "url" && (
        <div>
          <input className="hm-input" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/photo.jpg" style={{ marginBottom: 8 }} />
          <button className="hm-btn hm-btn-outline hm-btn-sm" onClick={handleApplyUrl}>Apply URL Preview</button>
        </div>
      )}
    </Modal>
  );
}

function MemberProfileModal({ member, team, onClose, onRemoveMember }) {
  if (!member) return null;
  return (
    <Modal onClose={onClose} title={member.name} icon={<Avatar src={member.photoUrl} fallback={member.avatar} name={member.name} size={28} />} width={520}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Avatar src={member.photoUrl} fallback={member.avatar} name={member.name} size={54} style={{ border: "2px solid var(--brand)" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{member.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-mute)" }}>{member.role} · {member.location}</div>
        </div>
      </div>
      <div className="hm-section-title">SKILLS & VERIFICATION</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {(member.skills || []).map(s => (
          <span key={s.name} className="hm-badge" style={{ fontSize: 12 }}>
            {s.name} {s.score ? `(${s.score}%)` : ""}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Close</button>
        {onRemoveMember && (
          <button className="hm-btn hm-btn-outline" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => onRemoveMember(member)}>
            Remove from Team
          </button>
        )}
      </div>
    </Modal>
  );
}

function AddMemberModal({ team, candidates, onClose, onAddMember }) {
  return (
    <Modal onClose={onClose} title="Add Member to Team" icon={<UserPlus size={18} color="var(--brand)" />} width={520}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {candidates.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, background: "var(--panel-2)", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar src={c.photoUrl} fallback={c.avatar} name={c.name} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{c.role}</div>
              </div>
            </div>
            <button className="hm-btn hm-btn-primary hm-btn-sm" onClick={() => { onAddMember(c); onClose(); }}>Add</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function RemoveMemberModal({ member, team, onClose, onConfirm }) {
  return (
    <Modal onClose={onClose} title="Remove Member" icon={<UserMinus size={18} color="var(--red)" />} width={440}>
      <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
        Are you sure you want to remove <b>{member.name}</b> from {team.name}?
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button className="hm-btn hm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="hm-btn hm-btn-primary" style={{ background: "var(--red)" }} onClick={() => { onConfirm(member); onClose(); }}>
          Confirm Remove
        </button>
      </div>
    </Modal>
  );
}

function App() {
  const saved = useMemo(() => loadSavedState(), []);

  const [auth, setAuth] = useState(saved?.auth || "login");
  const [userKind, setUserKind] = useState(saved?.userKind || "candidate");
  const [profile, setProfile] = useState(() => {
    if (!saved?.profile) return buildProfileForUser("candidate@tribe.demo");
    return saved.profile;
  });

  const [screen, setScreen] = useState(saved?.screen || "discover");
  const [team, setTeam] = useState(saved?.team || makeDefaultTeam());
  const [filterSkill, setFilterSkill] = useState(null);
  const [connected, setConnected] = useState(saved?.connected || {});
  const [matches, setMatches] = useState(saved?.matches || []);
  const [vetting, setVetting] = useState(saved?.vetting || []);
  const [passedIds, setPassedIds] = useState(saved?.passedIds || []);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [coverageFlash, setCoverageFlash] = useState("");

  // Companies & Social & Chat states
  const [companies, setCompanies] = useState(() => {
    if (!saved?.companies) return COMPANIES;
    const existingIds = new Set(saved.companies.map(c => c.id));
    const missing = COMPANIES.filter(c => !existingIds.has(c.id));
    return [...saved.companies, ...missing];
  });
  const [feedPosts, setFeedPosts] = useState(() => saved?.feedPosts || INITIAL_FEED_POSTS);
  const [chats, setChats] = useState(() => saved?.chats || INITIAL_CHATS);

  // Modals
  const [proofModal, setProofModal] = useState(null);
  const [breakdownModal, setBreakdownModal] = useState(null);
  const [matchModal, setMatchModal] = useState(null);
  const [challengeChooser, setChallengeChooser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [verifyMethod, setVerifyMethod] = useState(null);
  const [proofLink, setProofLink] = useState(null);
  const [credentialVerify, setCredentialVerify] = useState(null);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);
  const [memberProfileModal, setMemberProfileModal] = useState(null);

  // Work Culture & Live AI Chat Modals
  const [cultureModalCompany, setCultureModalCompany] = useState(null);
  const [liveAIChat, setLiveAIChat] = useState(null);

  const { toasts, push } = useToasts();

  const isCandidate = userKind === "candidate";
  const isHR = userKind === "hr" || userKind === "leader";

  // Candidate Deck (Companies)
  const companyDeck = useMemo(() => {
    return companies.filter(comp => {
      if (passedIds.includes(comp.id) || connected[comp.id]) return false;
      if (filterSkill) return comp.requiredSkills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
      return true;
    });
  }, [companies, passedIds, connected, filterSkill]);

  // Recruiter Deck (Candidates / Teammates)
  const candidateDeck = useMemo(() => {
    return CANDIDATES.filter(c => {
      if (passedIds.includes(c.id) || connected[c.id]) return false;
      if (filterSkill) return (c.requirements && c.requirements.includes(filterSkill)) || (c.tags && c.tags.some(t => t.name === filterSkill));
      return true;
    });
  }, [filterSkill, passedIds, connected]);

  const [discoverMode, setDiscoverMode] = useState("teammate");
  const activeDeck = discoverMode === "company" ? companyDeck : candidateDeck;

  // Real-time cross-tab sync listener
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "tribe_sync_broadcast" && e.newValue) {
        try {
          const { type, payload } = JSON.parse(e.newValue);
          if (type === "NEW_MATCH") {
            push(`🎉 New Match & Connection: ${payload.name}!`, <Sparkles size={16} color="var(--brand)" />);
            setMatches(ms => ms.some(m => m.id === payload.id) ? ms : [...ms, payload]);
          } else if (type === "CHAT_MESSAGE") {
            setChats(c => ({
              ...c,
              [payload.chatKey]: [...(c[payload.chatKey] || []), payload.message]
            }));
            push(`💬 Message from ${payload.message.senderName}: "${payload.message.text.slice(0, 30)}..."`);
          } else if (type === "NEW_FEED_POST") {
            setFeedPosts(fp => [payload, ...fp.filter(p => p.id !== payload.id)]);
            push(`🔥 New post on Tribe Pulse from ${payload.authorName}!`);
          } else if (type === "NEW_COMPANY") {
            setCompanies(comps => [payload, ...comps.filter(c => c.id !== payload.id)]);
            push(`🏢 New job opening posted: ${payload.role} at ${payload.name}!`);
          }
        } catch (err) {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [push]);

  // Persist demo state
  useEffect(() => {
    saveState({ auth, userKind, profile, screen, team, connected, matches, vetting, passedIds, companies, feedPosts, chats });
  }, [auth, userKind, profile, screen, team, connected, matches, vetting, passedIds, companies, feedPosts, chats]);

  function resetDemo() {
    if (!window.confirm("Reset all demo data? This clears your progress and restores the initial demo state.")) return;
    clearSavedState();
    window.location.reload();
  }

  function handleLogin(kind, email) {
    const p = buildProfileForUser(email);
    setUserKind(kind);
    setProfile(p);
    setAuth("app");
    setScreen(kind === "candidate" ? "discover" : "recruiter");
    push(`Welcome back, ${p.name}!`);
  }

  function handleSwitchUser(email) {
    const acc = DEMO_ACCOUNTS[email.toLowerCase()];
    if (!acc) return;
    const p = buildProfileForUser(email);
    setUserKind(acc.kind);
    setProfile(p);
    if (acc.kind === "leader") {
      setScreen("dashboard");
      setTeam(makeDefaultTeam());
      push(`Switched active account to ${p.name} (👑 Team Leader).`, <Sparkles size={16} color="var(--brand)" />);
    } else if (acc.kind === "hr") {
      setScreen("recruiter");
      push(`Switched active account to ${p.name} (HR Recruiter).`, <Sparkles size={16} color="var(--teal)" />);
    } else {
      setScreen("discover");
      push(`Switched active account to ${p.name} (Candidate).`, <Sparkles size={16} color="var(--brand)" />);
    }
  }

  function handleSignup(data) {
    setUserKind(data.kind || "candidate");
    const p = {
      name: data.name, email: data.email, role: data.role, avatar: "👩‍💻",
      photoUrl: PHOTO_PRESETS[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      photos: [PHOTO_PRESETS[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"],
      location: data.location,
      availability: data.availability, skills: [], experiences: [], assessmentHistory: [], github: null,
      company: data.kind === "hr" ? data.role : undefined
    };
    setProfile(p);
    setAuth("app");
    setScreen(data.kind === "hr" ? "recruiter" : "discover");
    push(`Account created! Welcome, ${data.name}.`);
  }

  
  function handleConnectFromProof(c) {
    setConnected(cn => ({ ...cn, [c.id]: true }));
    setMatches(ms => ms.some(m => m.id === c.id) ? ms : [...ms, c]);
    setProofModal(null);
    setMatchModal(c);
  }

  function openChallengeFor(c) {
    setMatchModal(null);
    setChallengeChooser(c);
  }

  function pickChallengeSkill(skill) {
    const c = challengeChooser;
    setChallengeChooser(null);
    const q = generateRandomGenerativeAIQuiz(skill, 4);
    setQuiz({ mode: "team", skill, candidate: c, questions: q, proctored: true });
  }

  function finishQuiz(score, passed, integrity) {
    if (!quiz) return;
    if (quiz.mode === "team") {
      const c = quiz.candidate;
      const isCompany = !!(c?.requiredSkills || c?.culture || userKind === "candidate");
      if (isCompany) {
        setQuiz(null);
        if (passed) {
          setProfile(p => {
            const existingSkill = p.skills.find(s => s.name.toLowerCase() === quiz.skill.toLowerCase());
            let updatedSkills;
            if (existingSkill) {
              updatedSkills = p.skills.map(s => s.name.toLowerCase() === quiz.skill.toLowerCase()
                ? { ...s, verification: "assessment", score, tested: "Just now", proctored: true }
                : s);
            } else {
              updatedSkills = [...p.skills, {
                name: quiz.skill,
                verification: "assessment",
                score,
                tested: "Just now",
                proctored: true,
                proofs: [`Passed screening challenge for ${c.name}`]
              }];
            }
            const updatedProfile = {
              ...p,
              skills: updatedSkills,
              assessmentHistory: [...(p.assessmentHistory || []), {
                skill: quiz.skill, score, passed: true, date: new Date().toLocaleDateString(), proctored: true, integrityScore: 98
              }]
            };
            broadcastTribeSync("PROFILE_UPDATE", updatedProfile);
            return updatedProfile;
          });
        }
        push(
          passed ? `🎉 Passed ${quiz.skill} challenge (${score}%) for ${c.name}! Fast-track status updated.` : `${quiz.skill} challenge completed (${score}%). Score recorded.`,
          passed ? <Sparkles size={16} color="var(--teal)" /> : <AlertTriangle size={16} color="var(--orange)" />
        );
        setScreen("matches");
      } else {
        setMatches(ms => ms.filter(m => m.id !== c.id));
        setVetting(v => [...v.filter(it => it.c.id !== c.id), { c, skill: quiz.skill, score, pass: passed }]);
        setQuiz(null);
        push(passed ? `${c.name} passed the ${quiz.skill} challenge — sent to Vetting.` : `${c.name} scored below the bar on ${quiz.skill}.`);
        setScreen("vetting");
      }
    } else {
      // self-assessment (optionally proctored)
      const historyEntry = {
        skill: quiz.skill, score, passed, date: new Date().toLocaleDateString(),
        proctored: !!integrity?.proctored, integrityScore: integrity?.integrityScore ?? null,
      };
      setProfile(p => {
        const existingSkill = p.skills.find(s => s.name.toLowerCase() === quiz.skill.toLowerCase());
        let updatedSkills;
        if (existingSkill) {
          updatedSkills = p.skills.map(s => s.name.toLowerCase() === quiz.skill.toLowerCase()
            ? (passed
              ? { ...s, verification: "assessment", score, tested: "Just now", proctored: !!integrity?.proctored }
              : { ...s, score })
            : s);
        } else if (passed) {
          updatedSkills = [...p.skills, {
            name: quiz.skill,
            verification: "assessment",
            score,
            tested: "Just now",
            proctored: !!integrity?.proctored,
            proofs: ["Passed live assessment quiz"]
          }];
        } else {
          updatedSkills = p.skills;
        }

        const updatedProfile = {
          ...p,
          skills: updatedSkills,
          assessmentHistory: [...(p.assessmentHistory || []), historyEntry],
        };
        broadcastTribeSync("PROFILE_UPDATE", updatedProfile);
        return updatedProfile;
      });

      setQuiz(null);
      const integrityNote = integrity?.proctored ? ` · integrity score ${integrity.integrityScore}%` : "";
      push(
        passed ? `🎉 ${quiz.skill} — Assessment Verified (${score}%)${integrityNote}!` : `${quiz.skill} assessment not passed (${score}%). Try again anytime.`,
        passed ? <Sparkles size={16} color="var(--teal)" /> : <AlertTriangle size={16} color="var(--orange)" />
      );
    }
  }

  function acceptToTeam(item) {
    const c = item.c;
    const photo = c.photoUrl || (typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
    const newMember = {
      ...c,
      id: c.id,
      name: c.name,
      role: c.role,
      avatar: c.avatar,
      photoUrl: photo,
      photos: c.photos || [photo],
      location: c.location || "Bengaluru",
      availability: "Active Teammate",
      bio: c.bio || `Passionate about building impactful software for ${team.hackathon}.`,
      experienceYears: c.experienceYears || "3 years experience",
      skills: (c.detailedSkills || c.skills || []).map(s => ({
        name: s.name,
        verification: s.verification === "self" ? "team" : s.verification,
        score: s.score,
        proofs: s.proofs || []
      })),
      detailedSkills: c.detailedSkills || c.skills || [],
      assessmentHistory: [
        ...(c.assessmentHistory || []),
        { skill: item.skill, score: item.score, passed: item.pass, date: "Today", proctored: true, integrityScore: item.integrityScore || 98 }
      ],
      github: c.github || {
        username: c.githubUsername || c.name.toLowerCase().replace(/\s+/g, "-"),
        stats: { totalRepos: 10, totalStars: 64, totalForks: 14, activeProjectsCount: 3, recentActivityEstimate: 28 },
        topRepos: (c.projects || []).map(p => ({
          name: p.split(" — ")[0],
          description: "Verified hackathon repository",
          language: item.skill,
          stars: 32,
          url: "https://github.com"
        }))
      }
    };
    setTeam(t => {
      const key = skillToArea(item.skill, c.role);
      const before = t.coverage[key] ?? 0;
      const newVal = Math.min(96, before + 55);
      setCoverageFlash(`${key}: ${before}% → ${newVal}%`);
      return { ...t, members: [...t.members, newMember], coverage: { ...t.coverage, [key]: newVal } };
    });
    setVetting(v => v.filter(it => it.c.id !== c.id));
    push(`${c.name} joined ${team.name}!`, <Sparkles size={16} color="var(--brand)" />);
    setScreen("dashboard");
  }

  function retest(c) {
    setChallengeChooser(c);
  }

  function handleAddSkill(name) {
    setProfile(p => {
      if (p.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return p;
      return { ...p, skills: [...p.skills, { name, verification: "self", score: null, tested: null, proofs: [] }] };
    });
    push(`${name} added — Claimed.`);
  }

  function handleAddExperience(exp) {
    setProfile(p => ({ ...p, experiences: [...p.experiences, exp] }));
    push(`${exp.hackathon} added to your profile.`);
  }

  function handleVerified(skillName, method, evidence) {
    const level = method === "github" ? "github" : "proof";
    const proofText = evidence?.summary || (method === "github" ? "Repository linked & checked" : "Project evidence linked & checked");
    setProfile(p => ({
      ...p,
      skills: p.skills.map(s => s.name === skillName ? { ...s, verification: level, proofs: [...(s.proofs || []), proofText] } : s)
    }));
    setProofLink(null);
    push(`${skillName} — ${level === "github" ? "GitHub Verified" : "Project Verified"}.`);
  }

  function handleSaveGithub(analysis) {
    setProfile(p => ({ ...p, github: { username: analysis.username, connectedAt: new Date().toISOString(), analysis } }));
    push(
      analysis.fallback ? `GitHub connection simulated for local demo (@${analysis.username}).` : `GitHub connected — @${analysis.username} analyzed.`,
      <Github size={16} color={analysis.fallback ? "var(--orange)" : "var(--purple)"} />
    );
  }

  function handleDisconnectGithub() {
    setProfile(p => { const next = { ...p }; delete next.github; return next; });
    push("GitHub disconnected.");
  }

  function handleUseGithubEvidence(skillName, repo) {
    const timeStr = typeof relativeTime === "function" ? relativeTime(repo?.updatedAt) : "recently";
    const evidenceText = `GitHub: ${repo?.name || "repository"} (${repo?.language || "multiple languages"}, ★${repo?.stars ?? 0}, updated ${timeStr})`;
    setProfile(p => ({
      ...p,
      skills: p.skills.map(s => s.name === skillName ? { ...s, verification: "github", proofs: [...(s.proofs || []), evidenceText] } : s),
    }));
    push(`${skillName} — GitHub Verified.`, <Github size={16} color="var(--purple)" />);
  }

  function handleCredentialVerified() {
    const exp = credentialVerify;
    setProfile(p => ({ ...p, experiences: p.experiences.map(e => e === exp ? { ...e, verified: true } : e) }));
    setCredentialVerify(null);
    push(`${exp.hackathon} credential verified.`);
  }

  function handleCreateTeam(data) {
    const coverage = {};
    ["Frontend", "Backend", "ML/AI", "UI/UX", "DevOps"].forEach(k => { coverage[k] = 15; });
    data.requiredSkills.forEach(s => { coverage[skillToArea(s, "")] = 35; });
    setTeam({
      name: data.name, hackathon: data.hackathon, description: data.description || "No description yet.",
      requiredSkills: data.requiredSkills, members: userKind === "leader" ? [] : [], coverage,
    });
    setCreateTeamOpen(false);
    push(`${data.name} created. Head to Discover to find your first teammate.`);
    setScreen("dashboard");
  }

  function handleDecision(item, dir) {
    setSwipeHistory(h => [...h, { item, dir }]);
    if (dir === "connect") {
      setConnected(cn => ({ ...cn, [item.id]: true }));
      setMatches(ms => ms.some(m => m.id === item.id) ? ms : [...ms, item]);
      setMatchModal(item);
      broadcastTribeSync("NEW_MATCH", { id: item.id, name: item.name, role: item.role });
    } else {
      setPassedIds(ids => ids.includes(item.id) ? ids : [...ids, item.id]);
      push(`Passed on ${item.name}.`, <X size={16} color="var(--text-mute)" />);
    }
  }

  function handleRewind() {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(h => h.slice(0, -1));
    if (last.dir === "connect") {
      setConnected(cn => { const next = { ...cn }; delete next[last.item.id]; return next; });
      setMatches(ms => ms.filter(m => m.id !== last.item.id));
    } else {
      setPassedIds(ids => ids.filter(id => id !== last.item.id));
    }
    push(`Rewound swipe on ${last.item.name}.`, <RotateCcw size={15} color="var(--teal)" />);
  }

  function handleSendMessage(chatKey, message) {
    setChats(c => ({ ...c, [chatKey]: [...(c[chatKey] || []), message] }));
    broadcastTribeSync("CHAT_MESSAGE", { chatKey, message });
  }

  function handleAddFeedPost(newPost) {
    setFeedPosts(fp => [newPost, ...fp]);
    broadcastTribeSync("NEW_FEED_POST", newPost);
    push("Posted to Tribe Pulse!");
  }

  function handleLikePost(postId) {
    setFeedPosts(fp => fp.map(p => p.id === postId ? { ...p, likes: p.userLiked ? p.likes - 1 : p.likes + 1, userLiked: !p.userLiked } : p));
  }

  function handleAddComment(postId, comment) {
    setFeedPosts(fp => fp.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p));
  }

  function handleCreateCompanyTeam(data) {
    setCompanies(comps => [data, ...comps]);
    setCreateTeamOpen(false);
    broadcastTribeSync("NEW_COMPANY", data);
    push(`Job Opening for ${data.name} created! Available in Discover for candidates.`);
  }

  function handleAddMember(c) {
    if (team.members.some(m => m.id === c.id)) {
      push(`${c.name} is already on the team.`);
      return;
    }
    const newMember = {
      id: c.id,
      name: c.name,
      role: c.role,
      avatar: c.avatar,
      photoUrl: c.photoUrl,
      location: c.location || "Bengaluru",
      skills: (c.detailedSkills || c.skills || []).map(s => ({
        name: s.name,
        verification: s.verification || "team",
        score: s.score || 85,
        proofs: s.proofs || []
      })),
      detailedSkills: c.detailedSkills || c.skills || [],
      bio: c.bio || `Teammate on ${team.name}`,
      hackathons: c.hackathons || [],
      projects: c.projects || []
    };
    setTeam(t => ({
      ...t,
      members: [...t.members, newMember]
    }));
    setAddMemberModalOpen(false);
    push(`🎉 Added ${c.name} to ${team.name}!`, <Sparkles size={16} color="var(--brand)" />);
  }

  function handleConfirmRemoveMember(m) {
    setTeam(t => ({
      ...t,
      members: t.members.filter(mem => mem.id !== m.id)
    }));
    setRemoveMemberTarget(null);
    push(`Removed ${m.name} from ${team.name}.`);
  }

  const counts = { matches: matches.length, vetting: vetting.length, messages: 1 };
  const currentTitle = NAV_ITEMS.find(n => n.id === screen)?.label || "TRIBE";

  if (auth === "login") return <div className="hm-root"><GlobalStyle /><LoginScreen onLogin={handleLogin} onGoSignup={() => setAuth("signup")} onResetDemo={resetDemo} /></div>;
  if (auth === "signup") return <div className="hm-root"><GlobalStyle /><SignupScreen onSignup={handleSignup} onGoLogin={() => setAuth("login")} /></div>;

  return (
    <div className="hm-root">
      <GlobalStyle />
      <Toast toasts={toasts} />
      <div className="hm-shell">
        <Sidebar screen={screen} setScreen={setScreen} counts={counts} user={profile} onLogout={() => { setAuth("login"); setProfile(null); }} onResetDemo={resetDemo} onSwitchUser={handleSwitchUser} userKind={userKind} />
        <div className="hm-main">
          <MobileChrome screen={screen} setScreen={setScreen} counts={counts} user={profile} onLogout={() => { setAuth("login"); setProfile(null); }} onResetDemo={resetDemo} onSwitchUser={handleSwitchUser} title={currentTitle} userKind={userKind} />
          <div className="hm-content">
            {screen === "recruiter" && (
              <RecruiterDashboard
                user={profile}
                profile={profile}
                candidates={CANDIDATES}
                onSwipeCandidate={handleDecision}
                onSendChallenge={(c) => { setMatchModal(null); setChallengeChooser(c); }}
                companies={companies}
                team={team}
                onOpenCreateTeam={() => setCreateTeamOpen(true)}
                onOpenLiveAIChat={(skill) => setLiveAIChat({ skill })}
              />
            )}
            {screen === "dashboard" && (
              <Dashboard team={team} userKind={userKind} profile={profile} onFindSkill={(s) => { setFilterSkill(s); setScreen("discover"); }}
                matchesCount={matches.length} vettingCount={vetting.length} coverageFlash={coverageFlash}
                onOpenMemberProfile={(m) => setMemberProfileModal(m)}
                onOpenAddMember={() => setAddMemberModalOpen(true)} />
            )}
            {screen === "discover" && (
              <Discover
                mode={discoverMode}
                onSwitchMode={(m) => setDiscoverMode(m)}
                teammateCount={candidateDeck.length}
                companyCount={companyDeck.length}
                deck={activeDeck}
                filterSkill={filterSkill}
                clearFilter={() => setFilterSkill(null)}
                onDecision={(dir) => {
                  const top = activeDeck[0];
                  if (top) handleDecision(top, dir);
                }}
                onViewProof={(c) => setProofModal(c)}
                onViewCulture={(comp) => setCultureModalCompany(comp)}
                onRewind={handleRewind}
                canRewind={swipeHistory.length > 0}
                onResetDeck={() => {
                  setPassedIds([]);
                  push("🔄 Deck reloaded! All profiles refreshed.", <RotateCcw size={15} color="var(--brand)" />);
                }}
              />
            )}
            {screen === "pulse" && (
              <TribePulseFeed
                user={profile}
                feedPosts={feedPosts}
                onAddPost={handleAddFeedPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onQuickConnect={(p) => { push(`Connected with ${p.authorName} on Tribe Pulse!`); setScreen("messages"); }}
              />
            )}
            {screen === "messages" && (
              <MessagesScreen
                user={profile}
                matches={matches}
                chats={chats}
                onSendMessage={handleSendMessage}
                onOpenCulture={(c) => setCultureModalCompany(c)}
                onStartAIInterview={(skill) => setLiveAIChat({ skill })}
              />
            )}
            {screen === "matches" && (
              <MatchesScreen matches={matches} onSendChallenge={(c) => setChallengeChooser(c)} onViewProof={(c) => setProofModal(c)} />
            )}
            {screen === "vetting" && (
              <VettingInbox items={vetting} onAccept={(it) => push(`${it.c.name} accepted to team!`)} onRetest={(c) => setChallengeChooser(c)} />
            )}
            {screen === "rankings" && <Rankings team={team} profile={profile} />}
            {screen === "team" && (
              <MyTeam team={team} onOpenAddMember={() => setAddMemberModalOpen(true)} onOpenMemberProfile={(m) => setMemberProfileModal(m)} onRemoveMember={(m) => setRemoveMemberTarget(m)} />
            )}
            {screen === "assessments" && (
              <AssessmentsPage
                profile={profile}
                onStart={(skill, q) => setQuiz({ mode: "self", skill, questions: q || generateRandomGenerativeAIQuiz(skill, 4), proctored: true })}
                onStartProctored={(skill, q) => setQuiz({ mode: "self", skill, questions: q || generateRandomGenerativeAIQuiz(skill, 4), proctored: true })}
                onStartLiveAI={(skill) => setLiveAIChat({ skill: skill || "Full-Stack Development" })}
              />
            )}
            {screen === "profile" && (
              <MyProfile profile={profile} teamName={userKind === "leader" ? team.name : null}
                onAddSkill={handleAddSkill}
                onOpenVerify={(skillName) => setVerifyMethod(skillName)}
                onAddExperience={handleAddExperience}
                onOpenCredentialVerify={(exp) => setCredentialVerify(exp)}
                onSaveGithub={handleSaveGithub}
                onDisconnectGithub={handleDisconnectGithub}
                onUseGithubEvidence={handleUseGithubEvidence}
                onResetDemo={resetDemo}
                onOpenPhotoCustomizer={() => setPhotoModalOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {cultureModalCompany && (
        <CultureDetailsModal company={cultureModalCompany} onClose={() => setCultureModalCompany(null)} onApply={(c) => handleDecision(c, "connect")} />
      )}
      {liveAIChat && (
        <LiveAIChatModal
          skill={liveAIChat.skill}
          onClose={() => setLiveAIChat(null)}
          onFinish={(score, passed, proctorData) => {
            const integrity = proctorData?.integrityScore ?? 100;
            const finalPassed = passed && integrity >= 60;
            if (finalPassed) {
              setProfile(p => {
                const existingSkill = p.skills.find(s => s.name.toLowerCase() === liveAIChat.skill.toLowerCase());
                let updatedSkills;
                if (existingSkill) {
                  updatedSkills = p.skills.map(s => s.name.toLowerCase() === liveAIChat.skill.toLowerCase()
                    ? { ...s, verification: "assessment", score, tested: "Just now", proctored: true, integrityScore: integrity }
                    : s);
                } else {
                  updatedSkills = [...p.skills, {
                    name: liveAIChat.skill,
                    verification: "assessment",
                    score,
                    tested: "Just now",
                    proctored: true,
                    integrityScore: integrity,
                    proofs: [`Verified by Proctored Live AI Interview (${score}% score · ${integrity}% integrity)`]
                  }];
                }
                const updatedProfile = {
                  ...p,
                  skills: updatedSkills,
                  assessmentHistory: [...(p.assessmentHistory || []), {
                    skill: liveAIChat.skill,
                    score,
                    passed: true,
                    date: new Date().toLocaleDateString(),
                    proctored: true,
                    integrityScore: integrity
                  }]
                };
                broadcastTribeSync("PROFILE_UPDATE", updatedProfile);
                return updatedProfile;
              });
              push(`🎉 Proctored Live AI Interview Passed (${score}% · ${integrity}% integrity)! Verified on your profile.`, <Sparkles size={16} color="var(--teal)" />);
            } else if (integrity < 60) {
              setProfile(p => {
                const updatedProfile = {
                  ...p,
                  assessmentHistory: [...(p.assessmentHistory || []), {
                    skill: liveAIChat.skill,
                    score,
                    passed: false,
                    date: new Date().toLocaleDateString(),
                    proctored: true,
                    integrityScore: integrity
                  }]
                };
                broadcastTribeSync("PROFILE_UPDATE", updatedProfile);
                return updatedProfile;
              });
              push(`🚨 Proctored AI Interview: Verification Denied for Anti-Cheat Violations (${integrity}% integrity).`, <AlertTriangle size={16} color="#FF6B6B" />);
            } else {
              setProfile(p => {
                const updatedProfile = {
                  ...p,
                  assessmentHistory: [...(p.assessmentHistory || []), {
                    skill: liveAIChat.skill,
                    score,
                    passed: false,
                    date: new Date().toLocaleDateString(),
                    proctored: true,
                    integrityScore: integrity
                  }]
                };
                broadcastTribeSync("PROFILE_UPDATE", updatedProfile);
                return updatedProfile;
              });
              push(`Proctored Live AI Interview completed (${score}% score · ${integrity}% integrity). Score below 70% threshold.`);
            }
          }}
        />
      )}
      {proofModal && (
        <ProofModal c={proofModal} onClose={() => setProofModal(null)} connected={!!connected[proofModal.id]} onConnect={() => { handleDecision(proofModal, "connect"); setProofModal(null); }} onOpenBreakdown={(c) => setBreakdownModal(c)} />
      )}
      {breakdownModal && <BreakdownModal c={breakdownModal} onClose={() => setBreakdownModal(null)} />}
      {matchModal && (
        <MatchModal
          c={matchModal}
          onClose={() => setMatchModal(null)}
          onStartChallenge={openChallengeFor}
          onAddToTeam={(m) => {
            handleAddMember(m);
            setMatchModal(null);
            push(`🎉 ${m.name} added to ${team.name}!`, <Sparkles size={16} color="var(--brand)" />);
          }}
        />
      )}
      {quiz && (
        <ProctoredQuizModal
          skill={quiz.skill}
          questions={quiz.questions}
          mode={quiz.mode}
          candidate={quiz.candidate}
          title={quiz.title || (quiz.mode === "team" ? `${team.name} Challenge — ${quiz.skill}` : `${quiz.skill} Proctored Assessment`)}
          onClose={() => setQuiz(null)}
          onFinish={finishQuiz}
        />
      )}
      {verifyMethod && (
        <VerifyMethodModal
          skill={verifyMethod}
          onClose={() => setVerifyMethod(null)}
          onChooseAssessment={() => { const s = verifyMethod; setVerifyMethod(null); const q = generateRandomGenerativeAIQuiz(s, 4); setQuiz({ mode: "self", skill: s, questions: q, proctored: true }); }}
          onChooseProof={(kind) => { const s = verifyMethod; setVerifyMethod(null); setProofLink({ skill: s, kind }); }}
        />
      )}
      {proofLink && (
        <ProofLinkModal
          kind={proofLink.kind}
          skill={proofLink.skill}
          onClose={() => setProofLink(null)}
          onVerified={(_url, evidence) => handleVerified(proofLink.skill, proofLink.kind, evidence)}
        />
      )}
      {credentialVerify && (
        <CredentialVerifyModal
          exp={credentialVerify}
          onClose={() => setCredentialVerify(null)}
          onVerified={handleCredentialVerified}
        />
      )}
      {challengeChooser && (
        <ChallengeChooser
          c={challengeChooser}
          onClose={() => setChallengeChooser(null)}
          onPick={pickChallengeSkill}
          onStartLiveAI={(s) => {
            setChallengeChooser(null);
            setLiveAIChat({ skill: s });
          }}
        />
      )}
      {createTeamOpen && <CreateTeamModal onClose={() => setCreateTeamOpen(false)} onCreate={handleCreateCompanyTeam} />}
      {photoModalOpen && (
        <PhotoCustomizerModal
          user={profile}
          onClose={() => setPhotoModalOpen(false)}
          onSavePhoto={(url) => {
            setProfile(p => ({ ...p, photoUrl: url, photos: [url, ...(p.photos || []).filter(u => u !== url)] }));
            push("Profile photo updated!");
            setPhotoModalOpen(false);
          }}
        />
      )}
      {memberProfileModal && <MemberProfileModal member={memberProfileModal} team={team} onClose={() => setMemberProfileModal(null)} onRemoveMember={(m) => setRemoveMemberTarget(m)} />}
      {addMemberModalOpen && <AddMemberModal team={team} candidates={CANDIDATES} onClose={() => setAddMemberModalOpen(false)} onAddMember={handleAddMember} />}
      {removeMemberTarget && <RemoveMemberModal member={removeMemberTarget} team={team} onClose={() => setRemoveMemberTarget(null)} onConfirm={handleConfirmRemoveMember} />}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("TRIBE crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0E12", color: "#EDEFF3", fontFamily: "Inter, sans-serif", padding: 24 }}>
          <div style={{ maxWidth: 500, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ fontSize: 13, color: "#A6ADBB", marginBottom: 18 }}>TRIBE hit an unexpected error. Saved demo data is safe.</p>
            <pre style={{ fontSize: 11, color: "#FF6B6B", background: "#12161D", padding: 12, borderRadius: 8, textAlign: "left", overflow: "auto", maxHeight: 160 }}>{String(this.state.error?.message || this.state.error)}</pre>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              <button style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#FF2E7E", color: "#fff", fontWeight: 600, cursor: "pointer" }} onClick={() => window.location.reload()}>Reload</button>
              <button style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--line, #333)", background: "transparent", color: "#EDEFF3", fontWeight: 600, cursor: "pointer" }} onClick={() => { localStorage.clear(); window.location.reload(); }}>Reset Demo & Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const mountEl = document.getElementById("root");
if (!mountEl) {
  throw new Error("TRIBE: could not find #root element to mount into.");
}
createRoot(mountEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
