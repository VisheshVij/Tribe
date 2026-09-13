import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { LayoutDashboard, Compass, ShieldCheck, Users, User, X, Check, Github, Trophy, Clock, ChevronRight, ChevronLeft, Sparkles, AlertTriangle, ArrowRight, Zap, MapPin, ExternalLink, FolderGit2, Send, Award, Circle, Plus, LogOut, Eye, EyeOff, Lock, Mail, Briefcase, FileCheck2, Link2, GitBranch, Target, CheckCircle2, XCircle, Loader2, BadgeCheck, TrendingUp, Filter, Bell, ClipboardList, Rocket, Swords, UserPlus, ArrowLeft, Info, RotateCcw, Camera, Upload, Trash2, UserMinus, Mic, Volume2, Maximize2, Minimize2, Image as ImageIcon } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
// githubService.js is loaded as a plain <script> in index.html (see comment
// there) and attaches its functions to window.TribeGithub — NOT imported as
// an ES module here, because Babel-standalone's in-browser transform of this
// file breaks relative `import` resolution to local (non-CDN) files.
const {
  fetchRepoEvidence,
  fallbackGithubEvidence,
  analyzeGithubUser,
  relativeTime
} = window.TribeGithub || {};

/* ================================================================== */
/*  LOCAL PERSISTENCE — demo state survives refreshes via localStorage */
/*  ("Reset Demo" clears this and restores the original demo state).   */
/* ================================================================== */
const STORAGE_KEY = "tribe-demo-state-v2";
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
function clearSavedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {/* ignore */}
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
  self: {
    dot: "self",
    label: "Claimed",
    short: "Claimed",
    color: "var(--grey)",
    bg: "rgba(122,132,150,0.14)"
  },
  proof: {
    dot: "proof",
    label: "Project Verified",
    short: "Project Verified",
    color: "var(--orange)",
    bg: "rgba(245,165,36,0.14)"
  },
  github: {
    dot: "github",
    label: "GitHub Verified",
    short: "GitHub Verified",
    color: "var(--purple)",
    bg: "rgba(167,139,250,0.16)"
  },
  assessment: {
    dot: "assessment",
    label: "Assessment Verified",
    short: "Assessment Verified",
    color: "var(--teal)",
    bg: "rgba(55,214,176,0.14)"
  },
  team: {
    dot: "team",
    label: "Team Challenge Verified",
    short: "Team Verified",
    color: "var(--blue)",
    bg: "rgba(91,155,255,0.14)"
  }
};

/* ================================================================== */
/*  TRUST SCORE — explainable, evidence-weighted out of 100.           */
/*  Every point traces back to something real: verification levels,   */
/*  assessment results, linked evidence, hackathon/project history,   */
/*  and peer ratings. Never an unexplained arbitrary number.          */
/* ================================================================== */
const TRUST_LEVEL_WEIGHT = {
  self: 0.2,
  proof: 0.55,
  github: 0.75,
  assessment: 0.8,
  team: 1
};
function computeTrustScore({
  skills = [],
  hackathonsCount = 0,
  vouches = 0
}) {
  const n = skills.length || 1;
  const verificationAvg = skills.reduce((sum, s) => sum + (TRUST_LEVEL_WEIGHT[s.verification] ?? 0.2), 0) / n;
  const verificationPts = skills.length ? Math.round(verificationAvg * 40) : 0;
  const scored = skills.filter(s => typeof s.score === "number");
  const assessmentAvg = scored.length ? scored.reduce((sum, s) => sum + s.score, 0) / scored.length : 0;
  const assessmentPts = scored.length ? Math.round(assessmentAvg / 100 * 25) : 0;
  const proofCount = skills.reduce((sum, s) => sum + (s.proofs?.length || 0), 0);
  const evidencePts = Math.min(15, Math.round(proofCount * 2.5));
  const historyPts = Math.min(12, hackathonsCount * 4);
  const vouchPts = Math.min(8, Math.round(vouches * 2.5));
  const score = Math.max(0, Math.min(100, verificationPts + assessmentPts + evidencePts + historyPts + vouchPts));
  return {
    score,
    breakdown: [{
      label: "Verification levels",
      value: verificationPts,
      max: 40,
      note: skills.length ? `${skills.length} skill${skills.length === 1 ? "" : "s"} — avg verification ${Math.round(verificationAvg * 100)}%` : "No skills claimed yet"
    }, {
      label: "Assessment performance",
      value: assessmentPts,
      max: 25,
      note: scored.length ? `Avg ${Math.round(assessmentAvg)}% across ${scored.length} assessment${scored.length === 1 ? "" : "s"}` : "No assessments completed yet"
    }, {
      label: "Linked evidence",
      value: evidencePts,
      max: 15,
      note: `${proofCount} piece${proofCount === 1 ? "" : "s"} of linked proof (repos, projects, credentials)`
    }, {
      label: "Hackathon / project history",
      value: historyPts,
      max: 12,
      note: `${hackathonsCount} entr${hackathonsCount === 1 ? "y" : "ies"} on record`
    }, {
      label: "Peer ratings",
      value: vouchPts,
      max: 8,
      note: vouches ? `${vouches} vouch${vouches === 1 ? "" : "es"} from teammates worked with directly` : "No peer ratings yet"
    }]
  };
}
function TrustScoreCard({
  skills,
  hackathonsCount = 0,
  vouches = 0,
  title = "Trust Score"
}) {
  const {
    score,
    breakdown
  } = useMemo(() => computeTrustScore({
    skills,
    hackathonsCount,
    vouches
  }), [skills, hackathonsCount, vouches]);
  const color = score >= 70 ? "var(--teal)" : score >= 40 ? "var(--orange)" : "var(--grey)";
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-card",
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 16,
    color: color
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, title)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk',sans-serif",
      fontWeight: 800,
      fontSize: 24,
      color
    }
  }, score)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 11
    }
  }, breakdown.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11.5,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-dim)"
    }
  }, b.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, b.value, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-mute)"
    }
  }, "/", b.max))), /*#__PURE__*/React.createElement(Bar, {
    value: b.value / b.max * 100,
    color: color
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)",
      marginTop: 3
    }
  }, b.note)))));
}
const ROLES = ["Developer", "Designer", "ML/AI", "Product", "DevOps", "Other"];
const SKILL_LIST = ["React", "TypeScript", "Node.js", "Python", "PyTorch", "TensorFlow", "Machine Learning", "Computer Vision", "UI/UX Design", "Figma", "PostgreSQL", "Docker", "Kubernetes", "AWS", "Go", "System Design"];

/* ---- assessment question bank (5 per skill, 3 served per attempt) ---- */
const QUESTION_BANK = {
  "React": [{
    q: "What does calling a state setter during render (not in an effect) typically cause?",
    options: ["Nothing, it's fine", "An infinite render loop / warning", "The component unmounts", "It updates props instead"],
    correct: 1
  }, {
    q: "Which hook lets you run code after the DOM has been painted?",
    options: ["useMemo", "useEffect", "useReducer", "useId"],
    correct: 1
  }, {
    q: "Why does React want a stable `key` prop on list items?",
    options: ["It sets CSS z-index", "It helps React match items across re-renders", "It disables memoization", "It's only for accessibility"],
    correct: 1
  }, {
    q: "What is the main purpose of `useMemo`?",
    options: ["Force a re-render", "Cache an expensive computed value between renders", "Replace useState", "Delay component mounting"],
    correct: 1
  }, {
    q: "Lifting state up means:",
    options: ["Moving state to a parent so siblings can share it", "Using a global CSS class", "Moving a component to a higher route", "Converting state to props permanently"],
    correct: 0
  }],
  "Python": [{
    q: "What does `list(set([1,2,2,3]))` most likely produce?",
    options: ["[1,2,2,3]", "A list with duplicates removed, order not guaranteed pre-3.7 semantics", "An error", "[3,2,1]"],
    correct: 1
  }, {
    q: "Which keyword defines a generator function?",
    options: ["return", "yield", "async", "lambda"],
    correct: 1
  }, {
    q: "What does a Python decorator do?",
    options: ["Adds CSS styling", "Wraps a function to extend its behavior", "Declares a class private", "Compiles Python to C"],
    correct: 1
  }, {
    q: "`*args` in a function signature collects:",
    options: ["Keyword arguments into a dict", "Extra positional arguments into a tuple", "Only the first argument", "Nothing, it's a syntax error"],
    correct: 1
  }, {
    q: "Which is true about Python's GIL?",
    options: ["It allows true parallel CPU-bound threads", "It limits one thread executing Python bytecode at a time per process", "It only affects Python 2", "It removes the need for asyncio"],
    correct: 1
  }],
  "Machine Learning": [{
    q: "Overfitting means a model:",
    options: ["Performs poorly on both train and test data", "Learns noise in training data and generalizes poorly", "Trains too slowly", "Has too few parameters"],
    correct: 1
  }, {
    q: "What does a validation set primarily help you do?",
    options: ["Train the final weights", "Tune hyperparameters and detect overfitting", "Store raw data", "Replace the test set entirely"],
    correct: 1
  }, {
    q: "Precision measures:",
    options: ["Of predicted positives, how many were correct", "Of actual positives, how many were found", "Overall accuracy", "Model training speed"],
    correct: 0
  }, {
    q: "Gradient descent updates weights in the direction that:",
    options: ["Maximizes the loss", "Minimizes the loss", "Randomizes the weights", "Freezes the model"],
    correct: 1
  }, {
    q: "L2 regularization primarily helps by:",
    options: ["Increasing model capacity", "Penalizing large weights to reduce overfitting", "Speeding up data loading", "Removing the need for labels"],
    correct: 1
  }],
  "Node.js": [{
    q: "Node.js is built on which JS engine?",
    options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"],
    correct: 1
  }, {
    q: "What does the event loop primarily manage?",
    options: ["CSS rendering", "Non-blocking async callbacks and I/O", "Database schemas", "TypeScript compilation"],
    correct: 1
  }, {
    q: "`require()` vs `import` — CommonJS `require()` is:",
    options: ["Asynchronous only", "Synchronous module loading", "A browser-only API", "Deprecated entirely"],
    correct: 1
  }, {
    q: "Middleware in an Express app is used to:",
    options: ["Style HTML", "Run code between the request and final route handler", "Compile TypeScript", "Store secrets in plaintext safely"],
    correct: 1
  }, {
    q: "What's a common reason to use a worker thread in Node?",
    options: ["To block the event loop intentionally", "To run CPU-heavy work off the main event loop", "To style components", "To open a database connection pool"],
    correct: 1
  }],
  "UI/UX Design": [{
    q: "A design system's primary purpose is to:",
    options: ["Replace user research", "Provide consistent, reusable patterns across a product", "Lock designers into one tool", "Guarantee accessibility automatically"],
    correct: 1
  }, {
    q: "Fitts's Law suggests interactive targets should be:",
    options: ["As small as possible", "Appropriately sized and close to reduce time-to-target", "Always centered", "Irrelevant to usability"],
    correct: 1
  }, {
    q: "A usability heuristic like 'visibility of system status' means:",
    options: ["Hiding loading states", "Keeping users informed about what's happening", "Using bright colors everywhere", "Avoiding feedback on actions"],
    correct: 1
  }, {
    q: "Contrast ratio matters most for:",
    options: ["Animation speed", "Text/background legibility and accessibility", "File size", "Server response time"],
    correct: 1
  }, {
    q: "A wireframe is typically used to:",
    options: ["Finalize brand colors", "Rough out layout and structure before visual design", "Write production code", "Replace user testing"],
    correct: 1
  }]
};
const DEFAULT_QUESTIONS = QUESTION_BANK["Python"];
function questionsFor(skill) {
  return QUESTION_BANK[skill] || DEFAULT_QUESTIONS;
}
function pick3(arr, excludeIdx = []) {
  const idxPool = arr.map((_, i) => i);
  const preferred = idxPool.filter(i => !excludeIdx.includes(i));
  const pool = preferred.length >= 3 ? preferred : idxPool; // fall back once the bank is exhausted
  const copy = [...pool];
  const out = [];
  while (out.length < 3 && copy.length) {
    const idx = copy.splice(Math.floor(Math.random() * copy.length), 1)[0];
    out.push({
      ...arr[idx],
      _idx: idx
    });
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

/* ---- demo accounts ---- */
const DEMO_ACCOUNTS = {
  "team@tribe.demo": {
    password: "password123",
    kind: "leader"
  },
  "candidate@tribe.demo": {
    password: "password123",
    kind: "candidate"
  }
};

/* ================================================================== */
/*  PHOTO PRESETS FOR PROFILE CUSTOMIZER                               */
/* ================================================================== */

const PHOTO_PRESETS = [{
  id: "p1",
  label: "Dev 1",
  url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p2",
  label: "Dev 2",
  url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p3",
  label: "Dev 3",
  url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p4",
  label: "Dev 4",
  url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p5",
  label: "Dev 5",
  url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p6",
  label: "Dev 6",
  url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p7",
  label: "Dev 7",
  url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p8",
  label: "Dev 8",
  url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p9",
  label: "Dev 9",
  url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p10",
  label: "Dev 10",
  url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p11",
  label: "Dev 11",
  url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80"
}, {
  id: "p12",
  label: "Dev 12",
  url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80"
}];
const CANDIDATES = [{
  "id": "c1",
  "name": "Ananya Sharma",
  "role": "ML / AI Engineer",
  "avatar": "👩‍💻",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
  "match": 94,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Building computer vision & LLM pipelines that solve real humanitarian problems ✨",
  "experienceYears": "3 years hackathon experience · SIH 2025 Winner",
  "githubUsername": "ananya-ai",
  "tags": [{
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "PyTorch",
    "level": "assessment"
  }, {
    "name": "Machine Learning",
    "level": "proof"
  }, {
    "name": "Computer Vision",
    "level": "self"
  }],
  "assessmentAvg": 91,
  "breakdown": {
    "skills": 47,
    "experience": 18,
    "hackathon": 10,
    "availability": 10,
    "preferences": 9
  },
  "requirements": ["Python", "PyTorch", "Machine Learning", "Computer Vision"],
  "detailedSkills": [{
    "name": "Python",
    "verification": "assessment",
    "score": 94,
    "tested": "2 days ago",
    "proofs": ["4 ML / data-science projects", "Active GitHub — 320+ commits", "Kaggle top-15% finish"]
  }, {
    "name": "PyTorch",
    "verification": "assessment",
    "score": 91,
    "tested": "2 days ago",
    "proofs": ["3 deep-learning projects", "Published model on Hugging Face"]
  }, {
    "name": "Machine Learning",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Co-authored a CV research paper", "2 hackathon ML projects shipped"]
  }, {
    "name": "Computer Vision",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "ML Engineer",
    "result": "Winner",
    "icon": "🥇"
  }, {
    "name": "HackFest 2025",
    "role": "Data Scientist",
    "result": "Finalist",
    "icon": "⭐"
  }, {
    "name": "Buildspace Nights & Weekends",
    "role": "ML Engineer",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["real-time-pose-estimator — GitHub, 210★", "crop-disease-classifier — Portfolio", "chat-summarizer-api — GitHub"],
  "vouches": 3,
  "vouchTags": ["Strong debugging", "Good communicator", "Took ownership"]
}, {
  "id": "c2",
  "name": "Divya Reddy",
  "role": "AI Engineer",
  "avatar": "👩‍🔬",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"],
  "match": 88,
  "location": "Hyderabad",
  "availability": "Available from Fri",
  "bio": "Fine-tuning open models and building robust RAG pipelines that don't hallucinate.",
  "experienceYears": "2.5 years ML engineering · 2x Finalist",
  "githubUsername": "divya-reddy-ai",
  "tags": [{
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "LLMs",
    "level": "proof"
  }, {
    "name": "Machine Learning",
    "level": "assessment"
  }, {
    "name": "MLOps",
    "level": "self"
  }],
  "assessmentAvg": 85,
  "breakdown": {
    "skills": 44,
    "experience": 17,
    "hackathon": 9,
    "availability": 9,
    "preferences": 9
  },
  "requirements": ["Python", "LLMs", "Machine Learning", "MLOps"],
  "detailedSkills": [{
    "name": "Python",
    "verification": "assessment",
    "score": 89,
    "tested": "5 days ago",
    "proofs": ["5 backend + ML projects"]
  }, {
    "name": "LLMs",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Built a RAG pipeline for a startup", "Fine-tuned an open-source model"]
  }, {
    "name": "Machine Learning",
    "verification": "assessment",
    "score": 85,
    "tested": "1 week ago",
    "proofs": ["Capstone thesis on NLP"]
  }, {
    "name": "MLOps",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "AI Engineer",
    "result": "Finalist",
    "icon": "⭐"
  }, {
    "name": "Open Source AI Sprint",
    "role": "Contributor",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["docqa-rag — GitHub", "support-bot-finetune — Portfolio"],
  "vouches": 2,
  "vouchTags": ["Fast learner", "Shipped clean APIs"]
}, {
  "id": "c3",
  "name": "Karan Malhotra",
  "role": "DevOps Engineer",
  "avatar": "🧑‍🔧",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
  "match": 90,
  "location": "Pune",
  "availability": "Available now",
  "bio": "If it's not automated with CI/CD and containerized in K8s, it doesn't ship.",
  "experienceYears": "4 years cloud infra · CloudNative Winner",
  "githubUsername": "karan-ops",
  "tags": [{
    "name": "Docker",
    "level": "assessment"
  }, {
    "name": "Kubernetes",
    "level": "assessment"
  }, {
    "name": "CI/CD",
    "level": "proof"
  }, {
    "name": "AWS",
    "level": "proof"
  }],
  "assessmentAvg": 88,
  "breakdown": {
    "skills": 46,
    "experience": 17,
    "hackathon": 9,
    "availability": 10,
    "preferences": 8
  },
  "requirements": ["Docker", "Kubernetes", "CI/CD", "AWS"],
  "detailedSkills": [{
    "name": "Docker",
    "verification": "assessment",
    "score": 92,
    "tested": "3 days ago",
    "proofs": ["Containerized 6 production services"]
  }, {
    "name": "Kubernetes",
    "verification": "assessment",
    "score": 84,
    "tested": "3 days ago",
    "proofs": ["Managed a 12-node cluster"]
  }, {
    "name": "CI/CD",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Built GitHub Actions pipelines for 4 teams"]
  }, {
    "name": "AWS",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["3x AWS-hosted hackathon deploys"]
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "DevOps Lead",
    "result": "Finalist",
    "icon": "⭐"
  }, {
    "name": "CloudNative Sprint",
    "role": "Infra Engineer",
    "result": "Winner",
    "icon": "🥇"
  }],
  "projects": ["k8s-autoscaler-demo — GitHub", "ci-pipeline-toolkit — GitHub"],
  "vouches": 4,
  "vouchTags": ["Reliable under pressure", "Great documentation"]
}, {
  "id": "c4",
  "name": "Rhea Kapoor",
  "role": "Frontend Developer",
  "avatar": "👩‍🎨",
  "photoUrl": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"],
  "match": 82,
  "location": "Mumbai",
  "availability": "Available now",
  "bio": "Obsessed with micro-interactions, responsive design, and 60fps animations in React.",
  "experienceYears": "3 years frontend engineering · HackFest Finalist",
  "githubUsername": "rhea-codes",
  "tags": [{
    "name": "React",
    "level": "assessment"
  }, {
    "name": "TypeScript",
    "level": "assessment"
  }, {
    "name": "UI/UX Design",
    "level": "proof"
  }, {
    "name": "Figma",
    "level": "self"
  }],
  "assessmentAvg": 90,
  "breakdown": {
    "skills": 42,
    "experience": 15,
    "hackathon": 8,
    "availability": 10,
    "preferences": 7
  },
  "requirements": ["React", "TypeScript", "API Integration"],
  "detailedSkills": [{
    "name": "React",
    "verification": "assessment",
    "score": 93,
    "tested": "1 day ago",
    "proofs": ["6 shipped React apps"]
  }, {
    "name": "TypeScript",
    "verification": "assessment",
    "score": 87,
    "tested": "1 day ago",
    "proofs": ["Strict-mode codebases at 2 internships"]
  }, {
    "name": "UI/UX Design",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Design system used across 3 products"]
  }, {
    "name": "Figma",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "Frontend Lead",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["hackmatch-ui-kit — GitHub", "portfolio-v3 — Live site"],
  "vouches": 1,
  "vouchTags": ["Pixel-perfect"]
}, {
  "id": "c5",
  "name": "Arjun Nair",
  "role": "Backend Developer",
  "avatar": "🧑‍💻",
  "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80"],
  "match": 79,
  "location": "Chennai",
  "availability": "Available from Mon",
  "bio": "Writing high-throughput Go and Node backends that handle spikes without breaking.",
  "experienceYears": "3.5 years backend development",
  "githubUsername": "arjun-nair",
  "tags": [{
    "name": "Node.js",
    "level": "assessment"
  }, {
    "name": "PostgreSQL",
    "level": "proof"
  }, {
    "name": "System Design",
    "level": "self"
  }, {
    "name": "AWS",
    "level": "self"
  }],
  "assessmentAvg": 81,
  "breakdown": {
    "skills": 38,
    "experience": 16,
    "hackathon": 7,
    "availability": 8,
    "preferences": 10
  },
  "requirements": ["Node.js", "PostgreSQL", "System Design"],
  "detailedSkills": [{
    "name": "Node.js",
    "verification": "assessment",
    "score": 81,
    "tested": "4 days ago",
    "proofs": ["API for a 10k-user side project"]
  }, {
    "name": "PostgreSQL",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Schema design for 2 hackathon projects"]
  }, {
    "name": "System Design",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }, {
    "name": "AWS",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "Backend Dev",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["queue-worker-service — GitHub"],
  "vouches": 0,
  "vouchTags": []
}, {
  "id": "c6",
  "name": "Simran Kaur",
  "role": "UI/UX Designer",
  "avatar": "👩‍🎤",
  "photoUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80"],
  "match": 86,
  "location": "Delhi",
  "availability": "Available now",
  "bio": "Turning messy problem statements into user-centered Figma prototypes under 24h.",
  "experienceYears": "4 years product design · HackFest Winner",
  "githubUsername": "simran-design",
  "tags": [{
    "name": "Figma",
    "level": "assessment"
  }, {
    "name": "UI/UX Design",
    "level": "assessment"
  }, {
    "name": "Design Systems",
    "level": "proof"
  }, {
    "name": "User Research",
    "level": "self"
  }],
  "assessmentAvg": 89,
  "breakdown": {
    "skills": 41,
    "experience": 16,
    "hackathon": 9,
    "availability": 10,
    "preferences": 10
  },
  "requirements": ["UI/UX Design", "Figma", "Design Systems"],
  "detailedSkills": [{
    "name": "Figma",
    "verification": "assessment",
    "score": 92,
    "tested": "6 days ago",
    "proofs": ["Design lead on 5 shipped products"]
  }, {
    "name": "UI/UX Design",
    "verification": "assessment",
    "score": 86,
    "tested": "6 days ago",
    "proofs": ["Case studies portfolio"]
  }, {
    "name": "Design Systems",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Built a 40-component design system"]
  }, {
    "name": "User Research",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "Product Designer",
    "result": "Winner",
    "icon": "🥇"
  }],
  "projects": ["ds-tokens-kit — GitHub", "case-studies — Live site"],
  "vouches": 2,
  "vouchTags": ["Great collaborator", "Fast iteration"]
}, {
  "id": "c7",
  "name": "Yusuf Ansari",
  "role": "Computer Vision Engineer",
  "avatar": "🧑‍🔬",
  "photoUrl": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"],
  "match": 91,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Edge AI, real-time object detection, and OpenCV on embedded hardware.",
  "experienceYears": "2.5 years CV research · SIH Winner",
  "githubUsername": "yusuf-cv",
  "tags": [{
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "Computer Vision",
    "level": "assessment"
  }, {
    "name": "PyTorch",
    "level": "proof"
  }, {
    "name": "TensorFlow",
    "level": "self"
  }],
  "assessmentAvg": 93,
  "breakdown": {
    "skills": 48,
    "experience": 19,
    "hackathon": 10,
    "availability": 10,
    "preferences": 8
  },
  "requirements": ["Python", "Computer Vision", "Machine Learning"],
  "detailedSkills": [{
    "name": "Python",
    "verification": "assessment",
    "score": 95,
    "tested": "1 week ago",
    "proofs": ["Vision pipeline in production"]
  }, {
    "name": "Computer Vision",
    "verification": "assessment",
    "score": 90,
    "tested": "1 week ago",
    "proofs": ["2 published CV demos"]
  }, {
    "name": "PyTorch",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Custom object-detection model"]
  }, {
    "name": "TensorFlow",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "CV Engineer",
    "result": "Winner",
    "icon": "🥇"
  }, {
    "name": "HackFest 2025",
    "role": "ML Engineer",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["defect-detector-cv — GitHub, 140★", "ar-try-on-demo — Live demo"],
  "vouches": 3,
  "vouchTags": ["Deep technical depth", "Ships fast"]
}, {
  "id": "c8",
  "name": "Neha Verma",
  "role": "Full Stack Developer",
  "avatar": "👩‍💼",
  "photoUrl": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"],
  "match": 84,
  "location": "Jaipur",
  "availability": "Available now",
  "bio": "Full-stack builder who bridges frontend polish with solid database architecture.",
  "experienceYears": "3 years web development",
  "githubUsername": "neha-dev",
  "tags": [{
    "name": "React",
    "level": "assessment"
  }, {
    "name": "Node.js",
    "level": "assessment"
  }, {
    "name": "PostgreSQL",
    "level": "self"
  }, {
    "name": "System Design",
    "level": "self"
  }],
  "assessmentAvg": 87,
  "breakdown": {
    "skills": 43,
    "experience": 15,
    "hackathon": 8,
    "availability": 10,
    "preferences": 8
  },
  "requirements": ["React", "Node.js", "API Integration"],
  "detailedSkills": [{
    "name": "React",
    "verification": "assessment",
    "score": 88,
    "tested": "3 days ago",
    "proofs": ["Freelance client apps ×4"]
  }, {
    "name": "Node.js",
    "verification": "assessment",
    "score": 85,
    "tested": "3 days ago",
    "proofs": ["REST + GraphQL APIs shipped"]
  }, {
    "name": "PostgreSQL",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }, {
    "name": "System Design",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "Full Stack Dev",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["taskflow-app — GitHub", "clientsite-kit — Live site"],
  "vouches": 1,
  "vouchTags": ["Reliable teammate"]
}, {
  "id": "c9",
  "name": "Rohan Verma",
  "role": "Product Manager",
  "avatar": "🧑‍💼",
  "photoUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"],
  "match": 77,
  "location": "Gurugram",
  "availability": "Available from next week",
  "bio": "Defining clear PRDs, unblocking devs, and crafting winning pitch decks in 36h.",
  "experienceYears": "3 years product management",
  "githubUsername": "rohan-pm",
  "tags": [{
    "name": "Product Strategy",
    "level": "proof"
  }, {
    "name": "System Design",
    "level": "self"
  }, {
    "name": "SQL",
    "level": "proof"
  }],
  "assessmentAvg": null,
  "breakdown": {
    "skills": 34,
    "experience": 20,
    "hackathon": 7,
    "availability": 8,
    "preferences": 8
  },
  "requirements": ["Product Strategy", "System Design"],
  "detailedSkills": [{
    "name": "Product Strategy",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Led roadmap for a 50k-MAU app", "Wrote 12 PRDs shipped to production"]
  }, {
    "name": "SQL",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Built analytics dashboards used weekly by leadership"]
  }, {
    "name": "System Design",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "Product Lead",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["roadmap-analytics-tool — Portfolio", "user-research-repo — Notion"],
  "vouches": 1,
  "vouchTags": ["Clear communicator"]
}, {
  "id": "c10",
  "name": "Aditya Rao",
  "role": "Backend Engineer",
  "avatar": "🧑‍💻",
  "photoUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"],
  "match": 92,
  "location": "Delhi",
  "availability": "Available now",
  "bio": "PostgreSQL optimization, distributed queues, and bulletproof microservices.",
  "experienceYears": "3 years backend engineering",
  "githubUsername": "aditya-rao",
  "tags": [{
    "name": "Go",
    "level": "assessment"
  }, {
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "PostgreSQL",
    "level": "proof"
  }, {
    "name": "Docker",
    "level": "proof"
  }],
  "assessmentAvg": 92,
  "breakdown": {
    "skills": 47,
    "experience": 17,
    "hackathon": 9,
    "availability": 10,
    "preferences": 9
  },
  "requirements": ["Go", "Python", "PostgreSQL", "Docker"],
  "detailedSkills": [{
    "name": "Go",
    "verification": "assessment",
    "score": 94,
    "tested": "4 days ago",
    "proofs": ["High-throughput microservices in production"]
  }, {
    "name": "Python",
    "verification": "assessment",
    "score": 90,
    "tested": "4 days ago",
    "proofs": ["Async data pipelines with FastAPI"]
  }, {
    "name": "PostgreSQL",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["DB indexing and query optimization on 50GB dataset"]
  }, {
    "name": "Docker",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Production multi-stage Docker builds"]
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "Backend Lead",
    "result": "Winner",
    "icon": "🥇"
  }],
  "projects": ["distributed-task-queue — GitHub, 95★", "fastapi-starter — GitHub"],
  "vouches": 3,
  "vouchTags": ["High code quality", "Fast delivery"]
}, {
  "id": "c11",
  "name": "Fatima Sheikh",
  "role": "Security Engineer",
  "avatar": "🧕",
  "photoUrl": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"],
  "match": 81,
  "location": "Hyderabad",
  "availability": "Available from Mon",
  "bio": "Penetration testing, OAuth2 / JWT security audits, and defensive programming.",
  "experienceYears": "2.5 years cybersecurity",
  "githubUsername": "fatima-sec",
  "tags": [{
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "Docker",
    "level": "assessment"
  }, {
    "name": "System Design",
    "level": "proof"
  }],
  "assessmentAvg": 88,
  "breakdown": {
    "skills": 40,
    "experience": 15,
    "hackathon": 8,
    "availability": 8,
    "preferences": 10
  },
  "requirements": ["Python", "Docker", "System Design"],
  "detailedSkills": [{
    "name": "Python",
    "verification": "assessment",
    "score": 91,
    "tested": "1 week ago",
    "proofs": ["Security scanning tooling in Python"]
  }, {
    "name": "Docker",
    "verification": "assessment",
    "score": 85,
    "tested": "1 week ago",
    "proofs": ["Hardened container images for enterprise client"]
  }, {
    "name": "System Design",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Threat-modeling architecture reviews ×3"]
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "Security Lead",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["secscan-cli — GitHub, 60★", "auth-audit-toolkit — GitHub"],
  "vouches": 1,
  "vouchTags": ["Catches edge cases early"]
}, {
  "id": "c12",
  "name": "Vikram Desai",
  "role": "Data Engineer",
  "avatar": "🧑‍🔧",
  "photoUrl": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
  "match": 87,
  "location": "Bengaluru",
  "availability": "Available now",
  "bio": "Building ETL pipelines with Apache Spark, Kafka, and Snowflake that scale.",
  "experienceYears": "4 years data engineering",
  "githubUsername": "vikram-data",
  "tags": [{
    "name": "Python",
    "level": "assessment"
  }, {
    "name": "PostgreSQL",
    "level": "assessment"
  }, {
    "name": "Docker",
    "level": "proof"
  }],
  "assessmentAvg": 90,
  "breakdown": {
    "skills": 44,
    "experience": 17,
    "hackathon": 8,
    "availability": 10,
    "preferences": 8
  },
  "requirements": ["Python", "PostgreSQL", "Docker"],
  "detailedSkills": [{
    "name": "Python",
    "verification": "assessment",
    "score": 93,
    "tested": "3 days ago",
    "proofs": ["Data pipelines handling 2M+ records daily"]
  }, {
    "name": "PostgreSQL",
    "verification": "assessment",
    "score": 87,
    "tested": "3 days ago",
    "proofs": ["Time-series data schema & partitioning"]
  }, {
    "name": "Docker",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Multi-container local dev stacks"]
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "Data Engineer",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["pipeline-orchestrator — GitHub", "streaming-analytics — Portfolio"],
  "vouches": 2,
  "vouchTags": ["Quietly delivers", "Thorough tests"]
}, {
  "id": "c13",
  "name": "Ishaan Bose",
  "role": "Mobile Developer",
  "avatar": "🧑‍🎓",
  "photoUrl": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"],
  "match": 76,
  "location": "Kolkata",
  "availability": "Available now",
  "bio": "Flutter and React Native developer crafting native-feel apps for iOS and Android.",
  "experienceYears": "2 years mobile development",
  "githubUsername": "ishaan-mobile",
  "tags": [{
    "name": "React",
    "level": "assessment"
  }, {
    "name": "TypeScript",
    "level": "self"
  }, {
    "name": "UI/UX Design",
    "level": "proof"
  }],
  "assessmentAvg": 79,
  "breakdown": {
    "skills": 36,
    "experience": 13,
    "hackathon": 7,
    "availability": 10,
    "preferences": 10
  },
  "requirements": ["React", "TypeScript"],
  "detailedSkills": [{
    "name": "React",
    "verification": "assessment",
    "score": 79,
    "tested": "5 days ago",
    "proofs": ["2 React Native mobile apps on App Store"]
  }, {
    "name": "TypeScript",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }, {
    "name": "UI/UX Design",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Mobile design system in Figma"]
  }],
  "hackathons": [{
    "name": "Campus Hack Day 2025",
    "role": "Mobile Dev",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["campus-events-app — GitHub"],
  "vouches": 0,
  "vouchTags": []
}, {
  "id": "c14",
  "name": "Meera Iyer",
  "role": "Blockchain Developer",
  "avatar": "👩‍🚀",
  "photoUrl": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
  "match": 83,
  "location": "Pune",
  "availability": "Available from Fri",
  "bio": "Audited Solidity smart contracts and zero-knowledge verification protocols.",
  "experienceYears": "2.5 years Web3 engineering · ETHIndia Finalist",
  "githubUsername": "meera-iyer-eth",
  "tags": [{
    "name": "Solidity",
    "level": "proof"
  }, {
    "name": "Node.js",
    "level": "assessment"
  }, {
    "name": "System Design",
    "level": "self"
  }],
  "assessmentAvg": 86,
  "breakdown": {
    "skills": 39,
    "experience": 16,
    "hackathon": 9,
    "availability": 9,
    "preferences": 10
  },
  "requirements": ["Node.js", "System Design"],
  "detailedSkills": [{
    "name": "Solidity",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Deployed 2 audited smart contracts on mainnet"]
  }, {
    "name": "Node.js",
    "verification": "assessment",
    "score": 86,
    "tested": "6 days ago",
    "proofs": ["Backend for a DeFi dashboard"]
  }, {
    "name": "System Design",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": []
  }],
  "hackathons": [{
    "name": "ETHIndia 2025",
    "role": "Smart Contract Dev",
    "result": "Finalist",
    "icon": "⭐"
  }, {
    "name": "HackFest 2025",
    "role": "Web3 Dev",
    "result": "Participant",
    "icon": "🏁"
  }],
  "projects": ["defi-dashboard-be — GitHub, 40★", "nft-marketplace-contracts — GitHub"],
  "vouches": 2,
  "vouchTags": ["Ships working demos fast"]
}];

/* ================================================================== */
/*  MOCK DATA — TEAM ALPHA (pre-existing demo team)                    */
/* ================================================================== */

const INITIAL_TEAM_MEMBERS = [{
  "id": "t1",
  "name": "Rahul Chawla",
  "role": "Backend Developer",
  "avatar": "👨‍💻",
  "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
  "match": 96,
  "location": "Delhi NCR",
  "availability": "Active Teammate",
  "bio": "Leading backend architecture & distributed services for Team Alpha. SIH Winner.",
  "experienceYears": "4 years backend engineering",
  "githubUsername": "rahul-chawla",
  "tags": [{
    "name": "Node.js",
    "level": "assessment"
  }, {
    "name": "PostgreSQL",
    "level": "proof"
  }, {
    "name": "System Design",
    "level": "team"
  }],
  "skills": [{
    "name": "Node.js",
    "verification": "assessment",
    "score": 92,
    "tested": "1 week ago",
    "proofs": ["Architected Team Alpha's REST + WebSocket services", "350+ commits on GitHub"]
  }, {
    "name": "PostgreSQL",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Designed schema with ACID compliance & migration pipelines"]
  }, {
    "name": "System Design",
    "verification": "team",
    "score": 88,
    "tested": "3 days ago",
    "proofs": ["Microservice architecture for SIH platform"]
  }],
  "detailedSkills": [{
    "name": "Node.js",
    "verification": "assessment",
    "score": 92,
    "tested": "1 week ago",
    "proofs": ["Architected Team Alpha's REST + WebSocket services", "350+ commits on GitHub"]
  }, {
    "name": "PostgreSQL",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Designed schema with ACID compliance & migration pipelines"]
  }, {
    "name": "System Design",
    "verification": "team",
    "score": 88,
    "tested": "3 days ago",
    "proofs": ["Microservice architecture for SIH platform"]
  }],
  "hackathons": [{
    "name": "Smart India Hackathon 2025",
    "role": "Backend Lead",
    "result": "Winner",
    "icon": "🥇"
  }, {
    "name": "HackFest 2024",
    "role": "Full Stack Dev",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["alpha-crisis-api — GitHub, 85★", "distributed-queue-worker — GitHub"],
  "vouches": 5,
  "vouchTags": ["Architectural depth", "Unmatched reliability", "Great mentor"],
  "assessmentHistory": [{
    "skill": "Node.js",
    "score": 92,
    "passed": true,
    "date": "1 week ago",
    "proctored": true,
    "integrityScore": 98
  }],
  "github": {
    "username": "rahul-chawla",
    "stats": {
      "totalRepos": 18,
      "totalStars": 142,
      "totalForks": 29,
      "activeProjectsCount": 5,
      "recentActivityEstimate": 45
    },
    "topRepos": [{
      "name": "alpha-crisis-api",
      "description": "Production microservices backend for disaster response coordination",
      "language": "JavaScript",
      "stars": 85,
      "url": "https://github.com/rahul-chawla/alpha-crisis-api"
    }, {
      "name": "distributed-queue-worker",
      "description": "High-concurrency Redis event worker with zero message loss",
      "language": "TypeScript",
      "stars": 57,
      "url": "https://github.com/rahul-chawla/distributed-queue-worker"
    }]
  }
}, {
  "id": "t2",
  "name": "Kriti Bhatia",
  "role": "UI/UX Designer",
  "avatar": "👩‍🎨",
  "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"],
  "match": 92,
  "location": "Mumbai",
  "availability": "Active Teammate",
  "bio": "Turning complex emergency logistics into effortless, accessible design systems.",
  "experienceYears": "3 years UI/UX & Figma design",
  "githubUsername": "kriti-bhatia",
  "tags": [{
    "name": "Figma",
    "level": "assessment"
  }, {
    "name": "Design Systems",
    "level": "proof"
  }, {
    "name": "User Research",
    "level": "self"
  }],
  "skills": [{
    "name": "Figma",
    "verification": "assessment",
    "score": 89,
    "tested": "2 weeks ago",
    "proofs": ["Created full Team Alpha component library", "Published Figma Community Kit (1.2k clones)"]
  }, {
    "name": "Design Systems",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Zero-dependency tokenized design system"]
  }, {
    "name": "User Research",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": ["Conducted 24 user interviews for crisis response flow"]
  }],
  "detailedSkills": [{
    "name": "Figma",
    "verification": "assessment",
    "score": 89,
    "tested": "2 weeks ago",
    "proofs": ["Created full Team Alpha component library", "Published Figma Community Kit (1.2k clones)"]
  }, {
    "name": "Design Systems",
    "verification": "proof",
    "score": null,
    "tested": null,
    "proofs": ["Zero-dependency tokenized design system"]
  }, {
    "name": "User Research",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": ["Conducted 24 user interviews for crisis response flow"]
  }],
  "hackathons": [{
    "name": "DesignSprint 2025",
    "role": "Lead Designer",
    "result": "Winner",
    "icon": "🥇"
  }, {
    "name": "HackFest 2025",
    "role": "Product Designer",
    "result": "Finalist",
    "icon": "⭐"
  }],
  "projects": ["alpha-design-tokens — Figma", "relief-flow-prototype — Portfolio"],
  "vouches": 4,
  "vouchTags": ["Fast iteration", "Sharp typography", "Pixel perfect"],
  "assessmentHistory": [{
    "skill": "Figma",
    "score": 89,
    "passed": true,
    "date": "2 weeks ago",
    "proctored": true,
    "integrityScore": 100
  }],
  "github": {
    "username": "kriti-bhatia",
    "stats": {
      "totalRepos": 8,
      "totalStars": 64,
      "totalForks": 14,
      "activeProjectsCount": 3,
      "recentActivityEstimate": 20
    },
    "topRepos": [{
      "name": "alpha-design-system",
      "description": "Design tokens and Figma sync scripts for crisis UI",
      "language": "TypeScript",
      "stars": 44,
      "url": "https://github.com/kriti-bhatia/alpha-design-system"
    }]
  }
}, {
  "id": "t3",
  "name": "Meera Joshi",
  "role": "Frontend Developer",
  "avatar": "👩‍💻",
  "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "photos": ["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80"],
  "match": 95,
  "location": "Bengaluru",
  "availability": "Active Teammate",
  "bio": "React, TypeScript, and Tailwind specialist building accessible, fast web apps.",
  "experienceYears": "3.5 years web engineering",
  "githubUsername": "meera-joshi",
  "tags": [{
    "name": "React",
    "level": "assessment"
  }, {
    "name": "TypeScript",
    "level": "assessment"
  }, {
    "name": "Tailwind",
    "level": "self"
  }],
  "skills": [{
    "name": "React",
    "verification": "assessment",
    "score": 94,
    "tested": "5 days ago",
    "proofs": ["Built state machine and swipe gesture interface"]
  }, {
    "name": "TypeScript",
    "verification": "assessment",
    "score": 90,
    "tested": "5 days ago",
    "proofs": ["Strict mode type safety across 4 projects"]
  }, {
    "name": "Tailwind",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": ["Custom CSS variable theme engine"]
  }],
  "detailedSkills": [{
    "name": "React",
    "verification": "assessment",
    "score": 94,
    "tested": "5 days ago",
    "proofs": ["Built state machine and swipe gesture interface"]
  }, {
    "name": "TypeScript",
    "verification": "assessment",
    "score": 90,
    "tested": "5 days ago",
    "proofs": ["Strict mode type safety across 4 projects"]
  }, {
    "name": "Tailwind",
    "verification": "self",
    "score": null,
    "tested": null,
    "proofs": ["Custom CSS variable theme engine"]
  }],
  "hackathons": [{
    "name": "HackFest 2025",
    "role": "Frontend Dev",
    "result": "Finalist",
    "icon": "⭐"
  }, {
    "name": "Smart India Hackathon 2024",
    "role": "UI Engineer",
    "result": "Winner",
    "icon": "🥇"
  }],
  "projects": ["crisis-dashboard-web — GitHub, 92★", "react-swipe-components — GitHub, 140★"],
  "vouches": 6,
  "vouchTags": ["Clean code", "Super responsive", "Team player"],
  "assessmentHistory": [{
    "skill": "React",
    "score": 94,
    "passed": true,
    "date": "5 days ago",
    "proctored": true,
    "integrityScore": 97
  }],
  "github": {
    "username": "meera-joshi",
    "stats": {
      "totalRepos": 22,
      "totalStars": 232,
      "totalForks": 48,
      "activeProjectsCount": 6,
      "recentActivityEstimate": 54
    },
    "topRepos": [{
      "name": "react-swipe-components",
      "description": "Performant gesture-based card swiper for React",
      "language": "TypeScript",
      "stars": 140,
      "url": "https://github.com/meera-joshi/react-swipe-components"
    }, {
      "name": "crisis-dashboard-web",
      "description": "Realtime geospatial incident map and coordination dashboard",
      "language": "JavaScript",
      "stars": 92,
      "url": "https://github.com/meera-joshi/crisis-dashboard-web"
    }]
  }
}];
const INITIAL_COVERAGE = {
  Frontend: 90,
  Backend: 85,
  "ML/AI": 30,
  "UI/UX": 60,
  DevOps: 20
};
function makeDefaultTeam() {
  return {
    name: "Team Alpha",
    hackathon: "Smart India Hackathon 2025",
    description: "AI-assisted crisis-response coordination platform for disaster relief teams.",
    requiredSkills: ["React", "Node.js", "Machine Learning", "Figma", "Docker"],
    members: INITIAL_TEAM_MEMBERS,
    coverage: INITIAL_COVERAGE
  };
}

/* ================================================================== */
/*  GLOBAL STYLE                                                       */
/* ================================================================== */

const GlobalStyle = () => /*#__PURE__*/React.createElement("style", null, `
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
      background: linear-gradient(180deg, rgba(11,14,18,0.2) 0%, rgba(11,14,18,0) 24%, rgba(11,14,18,0.74) 55%, rgba(11,14,18,0.98) 100%);
      display: flex; flex-direction: column; justify-content: flex-end; padding: 18px 20px;
      pointer-events: none; z-index: 9;
    }
    .hm-card-floating-badge {
      position: absolute; right: 18px; bottom: 154px; width: 44px; height: 44px; border-radius: 50%;
      background: #D4FF00; color: #07090C; display: grid; place-items: center;
      box-shadow: 0 4px 22px rgba(212,255,0,0.5); z-index: 11; cursor: pointer;
      pointer-events: auto; transition: transform .18s cubic-bezier(.2,1,.3,1);
    }
    .hm-card-floating-badge:hover { transform: scale(1.12); }
    .hm-card-floating-badge:active { transform: scale(0.94); }
    .hm-card-bio-quote {
      font-size: 12px; color: #EDEFF3; line-height: 1.45; margin: 6px 0 10px;
      background: rgba(0,0,0,0.48); backdrop-filter: blur(10px);
      padding: 7px 11px; border-radius: 9px; border-left: 3px solid #D4FF00;
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
  `);

/* ================================================================== */
/*  SHARED UI PRIMITIVES                                               */
/* ================================================================== */

function VerifyBadge({
  level,
  size = "md"
}) {
  const v = VERIFICATION[level] || VERIFICATION.self;
  return /*#__PURE__*/React.createElement("span", {
    className: "hm-badge",
    style: {
      color: v.color,
      background: v.bg,
      fontSize: size === "sm" ? 10.5 : 11.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-badge-dot",
    style: {
      background: v.color
    }
  }), v.short);
}
function Avatar({
  src,
  fallback,
  name,
  size = 38,
  className = "",
  style = {},
  onClick
}) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [src]);
  if (src && !imgError) {
    return /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: name || "Avatar",
      onError: () => setImgError(true),
      className: `hm-avatar-img ${className}`,
      style: {
        width: size,
        height: size,
        borderRadius: Math.max(8, Math.round(size * 0.28)),
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid var(--line)",
        ...style
      },
      onClick: onClick
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: `hm-avatar-chip ${className}`,
    style: {
      width: size,
      height: size,
      borderRadius: Math.max(8, Math.round(size * 0.28)),
      fontSize: Math.round(size * 0.44),
      flexShrink: 0,
      ...style
    },
    onClick: onClick
  }, fallback || (name ? name.charAt(0).toUpperCase() : "🧑‍💻"));
}
function MatchRing({
  value,
  size = 54
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - value / 100 * c;
  const color = value >= 90 ? "var(--teal)" : value >= 75 ? "var(--brand)" : "var(--orange)";
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-matchring",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    stroke: "var(--line)",
    strokeWidth: "4",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    stroke: color,
    strokeWidth: "4",
    fill: "none",
    strokeDasharray: c,
    strokeDashoffset: off,
    strokeLinecap: "round",
    style: {
      transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-matchring-num",
    style: {
      color
    }
  }, value));
}
function Bar({
  value,
  color = "var(--brand)",
  track
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-bar-track",
    style: track
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-bar-fill",
    style: {
      width: `${Math.max(0, Math.min(100, value))}%`,
      background: color
    }
  }));
}
function Toast({
  toasts
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-toast-stack"
  }, toasts.map(t => /*#__PURE__*/React.createElement("div", {
    className: "hm-toast",
    key: t.id
  }, t.icon || /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 16,
    color: "var(--teal)"
  }), /*#__PURE__*/React.createElement("span", null, t.text))));
}
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text, icon) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, {
      id,
      text,
      icon
    }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
  }, []);
  return {
    toasts,
    push
  };
}
function Modal({
  onClose,
  width = 480,
  title,
  icon,
  children,
  footer,
  bodyPad = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-modal-backdrop",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-modal",
    style: {
      maxWidth: width
    },
    onMouseDown: e => e.stopPropagation()
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "hm-modal-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, icon, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, title)), /*#__PURE__*/React.createElement("button", {
    className: "hm-iconbtn hm-reset",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(X, {
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-modal-body hm-scrollpane",
    style: !bodyPad ? {
      padding: 0
    } : undefined
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "hm-modal-foot"
  }, footer)));
}
function EmptyState({
  icon,
  title,
  sub,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-empty-state"
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--text)"
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6,
      maxWidth: 320,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, sub), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, action));
}
function timeAgo() {
  return "just now";
}

/* ================================================================== */
/*  NAVIGATION                                                         */
/* ================================================================== */

const NAV_ITEMS = [{
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  id: "discover",
  label: "Discover",
  icon: Compass
}, {
  id: "matches",
  label: "Matches",
  icon: Zap
}, {
  id: "vetting",
  label: "Vetting",
  icon: ShieldCheck
}, {
  id: "rankings",
  label: "Rankings",
  icon: Trophy
}, {
  id: "team",
  label: "My Team",
  icon: Users
}, {
  id: "assessments",
  label: "Assessments",
  icon: ClipboardList
}, {
  id: "profile",
  label: "Profile",
  icon: User
}];
function Sidebar({
  screen,
  setScreen,
  counts,
  user,
  onLogout,
  onResetDemo
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "hm-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-mark"
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 18,
    strokeWidth: 2.5
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-name"
  }, "TRIBE"), /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-sub"
  }, "SWIPE RIGHT ON TALENT"))), NAV_ITEMS.map(it => {
    const Icon = it.icon;
    const badge = counts[it.id];
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      className: `hm-nav-item ${screen === it.id ? "active" : ""}`,
      onClick: () => setScreen(it.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 17,
      strokeWidth: 2.2
    }), it.label, !!badge && /*#__PURE__*/React.createElement("span", {
      className: "hm-nav-badge"
    }, badge));
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-sidebar-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-user-row",
    onClick: () => setScreen("profile"),
    title: "View your profile"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: user.photoUrl,
    fallback: user.avatar,
    name: user.name,
    size: 36,
    style: {
      border: "2px solid var(--brand)",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, user.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)"
    }
  }, user.role)), /*#__PURE__*/React.createElement("button", {
    className: "hm-reset hm-iconbtn",
    style: {
      marginLeft: "auto",
      width: 28,
      height: 28
    },
    onClick: e => {
      e.stopPropagation();
      onLogout();
    },
    title: "Log out"
  }, /*#__PURE__*/React.createElement(LogOut, {
    size: 13
  }))), /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    style: {
      marginTop: 10,
      fontSize: 11,
      color: "var(--text-mute)",
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      width: "100%"
    },
    onClick: onResetDemo,
    title: "Clear local demo data and restore the initial state"
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 12
  }), " Reset Demo Data")));
}
function MobileChrome({
  screen,
  setScreen,
  counts,
  user,
  onLogout,
  onResetDemo,
  title
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "hm-topbar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-mark",
    style: {
      width: 28,
      height: 28
    }
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk',sans-serif",
      fontWeight: 700,
      fontSize: 15
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-reset hm-iconbtn",
    style: {
      width: 28,
      height: 28
    },
    onClick: onResetDemo,
    title: "Reset demo data"
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    onClick: () => setScreen("profile"),
    style: {
      cursor: "pointer",
      display: "inline-flex"
    },
    title: "View your profile"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: user.photoUrl,
    fallback: user.avatar,
    name: user.name,
    size: 32,
    style: {
      border: "2px solid var(--brand)"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hm-mobilenav"
  }, NAV_ITEMS.filter(it => ["dashboard", "discover", "matches", "vetting", "rankings", "profile"].includes(it.id)).map(it => {
    const Icon = it.icon;
    const badge = counts[it.id];
    const on = screen === it.id;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      className: "hm-mobilenav-item",
      style: {
        color: on ? "var(--brand)" : "var(--text-mute)"
      },
      onClick: () => setScreen(it.id)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 19,
      strokeWidth: 2.2
    }), !!badge && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -4,
        right: -6,
        width: 8,
        height: 8,
        borderRadius: 99,
        background: "var(--red)"
      }
    })), it.label);
  })));
}

/* ================================================================== */
/*  SWIPE DECK — custom pointer-driven physics (no external lib)       */
/* ================================================================== */

function CandidateCardBody({
  c,
  onViewProof,
  activePhoto = 0,
  onPrevPhoto,
  onNextPhoto,
  photos
}) {
  const photoList = photos || (c.photos && c.photos.length > 0 ? c.photos : [c.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"]);
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-card-photo-hero"
  }, photoList.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "hm-card-story-bars",
    style: {
      zIndex: 14
    }
  }, photoList.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `hm-card-story-bar ${i === activePhoto ? "active" : i < activePhoto ? "passed" : ""}`,
    onClick: e => {
      e.stopPropagation();
    }
  }))), /*#__PURE__*/React.createElement("img", {
    src: photoList[activePhoto] || photoList[0],
    alt: c.name,
    className: "hm-card-photo-img",
    draggable: false
  }), photoList.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-photo-nav-btn prev",
    onClick: e => {
      e.stopPropagation();
      onPrevPhoto?.();
    },
    onPointerDown: e => e.stopPropagation(),
    title: "Previous photo"
  }, /*#__PURE__*/React.createElement(ChevronLeft, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-photo-nav-btn next",
    onClick: e => {
      e.stopPropagation();
      onNextPhoto?.();
    },
    onPointerDown: e => e.stopPropagation(),
    title: "Next photo"
  }, /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-card-floating-badge",
    onClick: e => {
      e.stopPropagation();
      onViewProof?.(c);
    },
    onPointerDown: e => e.stopPropagation(),
    title: "View evidence & breakdown"
  }, /*#__PURE__*/React.createElement(Sparkles, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-card-photo-overlay"
  }, c.requirements && c.requirements.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      color: "var(--brand)",
      background: "rgba(255,46,126,0.18)",
      padding: "3px 9px",
      borderRadius: 6,
      fontWeight: 700,
      marginBottom: 5,
      alignSelf: "flex-start",
      pointerEvents: "auto"
    }
  }, /*#__PURE__*/React.createElement(Sparkles, {
    size: 11
  }), " Fills your ", c.requirements[0], " gap"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: "#fff",
      letterSpacing: "-0.01em"
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      marginTop: 2,
      fontWeight: 500
    }
  }, c.role, " ", c.experienceYears ? `· ${c.experienceYears}` : "")), /*#__PURE__*/React.createElement(MatchRing, {
    value: c.match,
    size: 46
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      margin: "2px 0 6px",
      pointerEvents: "auto"
    }
  }, c.assessmentAvg && /*#__PURE__*/React.createElement("span", {
    className: "hm-badge",
    style: {
      color: "var(--teal)",
      background: "rgba(20,232,196,0.16)",
      fontSize: 10.5,
      fontWeight: 700,
      padding: "2px 7px"
    }
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 11
  }), " Proctored ", c.assessmentAvg, "%"), c.githubUsername && /*#__PURE__*/React.createElement("span", {
    className: "hm-badge",
    style: {
      color: "var(--blue)",
      background: "rgba(91,155,255,0.16)",
      fontSize: 10.5,
      fontWeight: 700,
      padding: "2px 7px"
    }
  }, /*#__PURE__*/React.createElement(Github, {
    size: 11
  }), " Code Verified")), c.bio && /*#__PURE__*/React.createElement("div", {
    className: "hm-card-bio-quote",
    style: {
      pointerEvents: "auto"
    }
  }, "\"", c.bio, "\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      margin: "2px 0 8px",
      pointerEvents: "auto"
    }
  }, c.tags.slice(0, 4).map(t => {
    const v = VERIFICATION[t.level];
    return /*#__PURE__*/React.createElement("span", {
      key: t.name,
      className: "hm-card-tag",
      style: {
        color: v.color,
        background: "rgba(18,22,29,0.85)",
        padding: "4px 8px",
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "hm-badge-dot",
      style: {
        background: v.color
      }
    }), t.name);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 11.5,
      color: "var(--text-mute)",
      pointerEvents: "auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "var(--text-dim)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-avail-dot"
  }), " ", c.availability, " \xB7 ", c.location), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-reset",
    style: {
      color: "var(--teal)",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 3,
      cursor: "pointer"
    },
    onClick: e => {
      e.stopPropagation();
      onViewProof?.(c);
    },
    onPointerDown: e => e.stopPropagation()
  }, "View Proof ", /*#__PURE__*/React.createElement(ChevronRight, {
    size: 13
  })))));
}
const SWIPE_THRESHOLD = 110;
function FloatingBolts({
  count = 14
}) {
  const bolts = useMemo(() => Array.from({
    length: count
  }).map((_, i) => {
    const pink = i % 2 === 0;
    return {
      id: i,
      left: Math.round(Math.random() * 96),
      size: 11 + Math.round(Math.random() * 16),
      duration: 8 + Math.random() * 7,
      delay: -(Math.random() * 14),
      drift: 8 + Math.random() * 22,
      opacity: 0.16 + Math.random() * 0.3,
      color: pink ? "var(--brand)" : "var(--teal)"
    };
  }), [count]);
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-float-bg",
    "aria-hidden": "true"
  }, bolts.map(b => /*#__PURE__*/React.createElement(Zap, {
    key: b.id,
    className: "hm-float-bolt",
    width: b.size,
    height: b.size,
    color: b.color,
    fill: b.color,
    style: {
      left: `${b.left}%`,
      animationDuration: `${b.duration}s`,
      animationDelay: `${b.delay}s`,
      "--hop": b.opacity,
      "--drift": `${b.drift}px`
    }
  })));
}
function BoltBurst({
  burstKey
}) {
  const particles = useMemo(() => {
    if (!burstKey) return [];
    return Array.from({
      length: 12
    }).map((_, i) => {
      const angle = Math.PI * 2 * i / 12 + Math.random() * 0.35;
      const dist = 70 + Math.random() * 70;
      return {
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 30,
        delay: Math.random() * 0.12,
        size: 13 + Math.random() * 13,
        color: i % 2 === 0 ? "var(--brand)" : "var(--teal)"
      };
    });
  }, [burstKey]);
  if (!burstKey) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-burst-wrap",
    "aria-hidden": "true"
  }, particles.map(p => /*#__PURE__*/React.createElement(Zap, {
    key: `${burstKey}-${p.id}`,
    className: "hm-burst-bolt",
    width: p.size,
    height: p.size,
    color: p.color,
    fill: p.color,
    style: {
      "--tx": `${p.tx}px`,
      "--ty": `${p.ty}px`,
      animationDelay: `${p.delay}s`
    }
  })));
}
function SwipeCard({
  c,
  stackIndex,
  isTop,
  onDecision,
  exitSignal,
  onTapView,
  onDragUpdate,
  topDragX = 0
}) {
  const [drag, setDrag] = useState({
    x: 0,
    y: 0,
    rot: 0,
    phase: "idle"
  }); // idle | dragging | returning | exiting
  const [activePhoto, setActivePhoto] = useState(0);
  const ref = useRef(null);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    dragging: false,
    moved: false,
    pointerId: null
  });
  const photos = useMemo(() => {
    if (c.photos && c.photos.length > 0) return c.photos;
    if (c.photoUrl) return [c.photoUrl];
    return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"];
  }, [c]);

  // Handle external button/keyboard exitSignal
  useEffect(() => {
    if (!exitSignal || !isTop || exitSignal.forId !== c.id) return;
    const dir = exitSignal.dir === "connect" ? 1 : -1;
    setDrag({
      x: dir * 850,
      y: -20,
      rot: dir * 28,
      phase: "exiting"
    });
    const t = setTimeout(() => onDecision(exitSignal.dir), 280);
    return () => clearTimeout(t);
  }, [exitSignal, isTop, c.id, onDecision]);
  const onPointerDown = e => {
    if (!isTop || drag.phase === "exiting") return;
    if (e.target.closest("button") || e.target.closest(".hm-card-floating-badge")) return;
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
    setDrag(d => ({
      ...d,
      phase: "dragging"
    }));
  };
  const onPointerMove = e => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      dragState.current.moved = true;
    }
    const curRot = Math.max(-22, Math.min(22, dx * 0.085));
    setDrag({
      x: dx,
      y: dy * 0.45,
      rot: curRot,
      phase: "dragging"
    });
    onDragUpdate?.(dx);
  };
  const endDrag = e => {
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
        setDrag({
          x: exitX,
          y: drag.y * 1.5,
          rot: exitRot,
          phase: "exiting"
        });
        setTimeout(() => onDecision(dir), 280);
      } else {
        // Released before threshold -> snap back smoothly with bounce
        setDrag({
          x: 0,
          y: 0,
          rot: 0,
          phase: "returning"
        });
      }
    } else {
      // Tap without dragging -> cycle photos!
      const rect = ref.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (photos.length > 1) {
        if (clickX < rect.width * 0.4) {
          setActivePhoto(p => p > 0 ? p - 1 : photos.length - 1);
        } else {
          setActivePhoto(p => p < photos.length - 1 ? p + 1 : 0);
        }
      }
      setDrag({
        x: 0,
        y: 0,
        rot: 0,
        phase: "idle"
      });
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
  const transition = drag.phase === "dragging" ? "none" : drag.phase === "exiting" ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease" : "transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  const borderStyle = isTop && connectStrength >= 0.85 ? "2px solid #10B981" : isTop && passStrength >= 0.85 ? "2px solid #EF4444" : "1px solid var(--line)";
  const shadowStyle = isTop && drag.phase === "dragging" ? connectStrength >= 0.5 ? "0 30px 70px rgba(0,0,0,0.7), 0 0 35px rgba(16,185,129,0.3)" : passStrength >= 0.5 ? "0 30px 70px rgba(0,0,0,0.7), 0 0 35px rgba(239,68,68,0.3)" : "0 30px 70px rgba(0,0,0,0.65)" : "0 20px 50px rgba(0,0,0,0.45)";
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: `hm-swipe-card ${isTop ? "hm-swipe-card-top" : ""}`,
    style: {
      zIndex: cardZ,
      transform: `translate3d(${isTop ? drag.x : 0}px, ${cardTranslateY}px, 0) rotate(${isTop ? drag.rot : 0}deg) scale(${cardScale})`,
      filter: isTop ? "none" : `brightness(${cardBrightness})`,
      transition,
      opacity: drag.phase === "exiting" ? 0.35 : 1,
      border: borderStyle,
      boxShadow: shadowStyle
    },
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag
  }, isTop && /*#__PURE__*/React.createElement("div", {
    className: "hm-swipe-overlay connect",
    style: {
      opacity: connectStrength,
      transform: `rotate(-12deg) scale(${0.85 + connectStrength * 0.25})`
    }
  }, /*#__PURE__*/React.createElement("span", null, "CONNECT"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC9A")), isTop && /*#__PURE__*/React.createElement("div", {
    className: "hm-swipe-overlay pass",
    style: {
      opacity: passStrength,
      transform: `rotate(12deg) scale(${0.85 + passStrength * 0.25})`
    }
  }, /*#__PURE__*/React.createElement("span", null, "PASS"), /*#__PURE__*/React.createElement("span", null, "\u2715")), /*#__PURE__*/React.createElement(CandidateCardBody, {
    c: c,
    onViewProof: onTapView,
    activePhoto: activePhoto,
    onPrevPhoto: () => setActivePhoto(p => p > 0 ? p - 1 : photos.length - 1),
    onNextPhoto: () => setActivePhoto(p => p < photos.length - 1 ? p + 1 : 0),
    photos: photos
  }));
}

/* ================================================================== */
/*  DISCOVER SCREEN                                                    */
/* ================================================================== */

function Discover({
  deck,
  filterSkill,
  clearFilter,
  onDecision,
  onViewProof,
  onRewind,
  canRewind
}) {
  const [exitSignal, setExitSignal] = useState(null);
  const [burstKey, setBurstKey] = useState(null);
  const [topDragX, setTopDragX] = useState(0);
  const visible = deck.slice(0, 3);
  const top = visible[0];
  const triggerSwipe = useCallback(dir => {
    if (!top) return;
    setExitSignal({
      dir,
      nonce: Math.random(),
      forId: top.id
    });
  }, [top]);
  const handleDecision = useCallback(dir => {
    if (dir === "connect") setBurstKey(Math.random());
    setTopDragX(0);
    onDecision(dir);
  }, [onDecision]);

  // Keyboard controls: ArrowLeft/A for pass, ArrowRight/D for connect, Space for proof, Z for undo
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
        if (top) onViewProof(top);
      } else if (e.key === "z" || e.key === "Z" || e.key === "Backspace") {
        if (canRewind) {
          e.preventDefault();
          onRewind?.();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [top, triggerSwipe, onViewProof, onRewind, canRewind]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, "Discover"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, "Drag candidate card right to ", /*#__PURE__*/React.createElement("b", null, "Connect \uD83D\uDC9A"), " or left to ", /*#__PURE__*/React.createElement("b", null, "Pass \u2715"), ".")), filterSkill && /*#__PURE__*/React.createElement("div", {
    className: "hm-chip on",
    style: {
      cursor: "pointer"
    },
    onClick: clearFilter
  }, /*#__PURE__*/React.createElement(Filter, {
    size: 12
  }), " Filtered: ", filterSkill, " ", /*#__PURE__*/React.createElement(X, {
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-deck-stage"
  }, /*#__PURE__*/React.createElement(FloatingBolts, null), /*#__PURE__*/React.createElement("div", {
    className: "hm-deck-wrap"
  }, visible.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "hm-panel",
    style: {
      height: "100%",
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Compass, {
      size: 40
    }),
    title: "You're all caught up",
    sub: "No more candidates in this queue. Clear filters or check back after your team's requirements change.",
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, filterSkill && /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: clearFilter
    }, "Clear filter"), canRewind && /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-teal",
      onClick: onRewind
    }, /*#__PURE__*/React.createElement(RotateCcw, {
      size: 14
    }), " Undo Last Swipe"))
  })), visible.slice().reverse().map((c, ri) => {
    const idx = visible.length - 1 - ri;
    return /*#__PURE__*/React.createElement(SwipeCard, {
      key: c.id,
      c: c,
      stackIndex: idx,
      isTop: idx === 0,
      onDecision: handleDecision,
      exitSignal: idx === 0 ? exitSignal : null,
      onTapView: onViewProof,
      onDragUpdate: dx => {
        if (idx === 0) setTopDragX(dx);
      },
      topDragX: topDragX
    });
  }), /*#__PURE__*/React.createElement(BoltBurst, {
    burstKey: burstKey
  })), top && /*#__PURE__*/React.createElement("div", {
    className: "hm-deck-controls"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-deck-actions"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-deck-btn pass",
    onClick: () => triggerSwipe("pass"),
    title: "Pass candidate (\u2190 or A)"
  }, /*#__PURE__*/React.createElement(X, {
    size: 26,
    strokeWidth: 2.6
  }), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-text"
  }, "PASS \u2715"), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-kbd"
  }, "\u2190 A")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-deck-btn rewind",
    onClick: onRewind,
    disabled: !canRewind,
    title: "Undo last swipe (Z)"
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-text"
  }, "UNDO"), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-kbd"
  }, "Z")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-deck-btn view",
    onClick: () => onViewProof(top),
    title: "View verified proof & breakdown (Space)"
  }, /*#__PURE__*/React.createElement(Eye, {
    size: 20
  }), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-text"
  }, "PROOF"), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-kbd"
  }, "SPACE")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-deck-btn connect",
    onClick: () => triggerSwipe("connect"),
    title: "Connect with candidate (\u2192 or D)"
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 26,
    strokeWidth: 2.6
  }), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-text"
  }, "CONNECT \uD83D\uDC9A"), /*#__PURE__*/React.createElement("span", {
    className: "hm-deck-btn-kbd"
  }, "D \u2192"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-deck-hint"
  }, /*#__PURE__*/React.createElement("span", null, "Tip: Drag card or use ", /*#__PURE__*/React.createElement("b", null, "\u2190 / \u2192"), " arrow keys")))));
}

/* ================================================================== */
/*  MODALS — Breakdown / Proof / Match / Challenge / Quiz              */
/* ================================================================== */

function BreakdownModal({
  c,
  onClose
}) {
  const rows = [["Technical Skills", c.breakdown.skills, 50], ["Experience", c.breakdown.experience, 20], ["Hackathon History", c.breakdown.hackathon, 10], ["Availability", c.breakdown.availability, 10], ["Team Preferences", c.breakdown.preferences, 10]];
  const total = rows.reduce((s, r) => s + r[1], 0);
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: `Why ${c.match}% match?`,
    icon: /*#__PURE__*/React.createElement(Target, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 460
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "YOUR TEAM NEEDS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row",
    style: {
      marginBottom: 18
    }
  }, c.requirements.map(r => /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    key: r
  }, /*#__PURE__*/React.createElement(Check, {
    size: 12,
    color: "var(--teal)"
  }), r))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "CANDIDATE OFFERS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row",
    style: {
      marginBottom: 20
    }
  }, c.tags.map(t => /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    key: t.name
  }, /*#__PURE__*/React.createElement(Check, {
    size: 12,
    color: "var(--teal)"
  }), t.name))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "MATCH BREAKDOWN"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, rows.map(([label, val, max]) => /*#__PURE__*/React.createElement("div", {
    key: label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12.5,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-dim)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, val, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-mute)"
    }
  }, "/", max))), /*#__PURE__*/React.createElement(Bar, {
    value: val / max * 100
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      paddingTop: 16,
      borderTop: "1px solid var(--line-soft)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontFamily: "'Space Grotesk',sans-serif"
    }
  }, "TOTAL MATCH"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 22,
      fontFamily: "'Space Grotesk',sans-serif",
      color: "var(--brand)"
    }
  }, total, "%")));
}
function ProofModal({
  c,
  onClose,
  onConnect,
  connected,
  onOpenBreakdown
}) {
  const photo = c.photoUrl || typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: c.name,
    icon: /*#__PURE__*/React.createElement(Avatar, {
      src: photo,
      fallback: c.avatar,
      name: c.name,
      size: 28,
      style: {
        border: "1.5px solid var(--brand)"
      }
    }),
    width: 560
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-dim)"
    }
  }, c.role), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginTop: 2
    }
  }, c.location, " \xB7 ", c.availability)), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-sm",
    onClick: () => onOpenBreakdown(c)
  }, /*#__PURE__*/React.createElement(MatchRing, {
    value: c.match,
    size: 30
  }), " Why this %?")), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "SKILLS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 20
    }
  }, c.detailedSkills.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    className: "hm-card",
    style: {
      padding: "11px 13px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, s.score != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk',sans-serif",
      fontWeight: 700,
      fontSize: 13
    }
  }, s.score, "%"), /*#__PURE__*/React.createElement(VerifyBadge, {
    level: s.verification,
    size: "sm"
  }))), s.proofs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, s.proofs.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card-proof-item"
  }, /*#__PURE__*/React.createElement(Check, {
    size: 12,
    color: "var(--teal)"
  }), p)))))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "HACKATHON HISTORY"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 20
    }
  }, c.hackathons.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, h.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, h.name), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-mute)",
      fontSize: 11.5
    }
  }, h.role, " \xB7 ", h.result))))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "PROJECTS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 20
    }
  }, c.projects.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card-proof-item"
  }, /*#__PURE__*/React.createElement(FolderGit2, {
    size: 13,
    color: "var(--teal)"
  }), p))), c.vouches > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12.5,
      color: "var(--text-dim)",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(BadgeCheck, {
    size: 14,
    color: "var(--blue)"
  }), " ", c.vouches, " verified teammate vouch", c.vouches > 1 ? "es" : "", " \u2014 ", c.vouchTags.join(", ")), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "TRUST SCORE"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(TrustScoreCard, {
    skills: c.detailedSkills,
    hackathonsCount: c.hackathons.length + c.projects.length,
    vouches: c.vouches || 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, connected ? /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-block",
    disabled: true
  }, /*#__PURE__*/React.createElement(Check, {
    size: 15
  }), "Connect sent") : /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-teal hm-btn-block",
    onClick: () => onConnect(c)
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 15
  }), "Connect")));
}
function MatchModal({
  c,
  onClose,
  onStartChallenge
}) {
  const photo = c.photoUrl || typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-match-burst"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: photo,
    fallback: c.avatar,
    name: c.name,
    size: 76,
    style: {
      border: "3px solid var(--brand)",
      boxShadow: "0 0 24px rgba(255,46,126,0.4)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-match-ring",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 32,
    color: "var(--brand)",
    fill: "var(--brand)"
  }), /*#__PURE__*/React.createElement(BoltBurst, {
    burstKey: c.id
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk',sans-serif",
      fontWeight: 800,
      fontSize: 22,
      marginBottom: 6
    }
  }, "IT'S A MATCH"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-dim)",
      marginBottom: 4
    }
  }, c.name, " fills your ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text)"
    }
  }, c.requirements[0]), " gap."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(MatchRing, {
    value: c.match,
    size: 70
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-block",
    onClick: onClose
  }, "View later"), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    onClick: () => onStartChallenge(c)
  }, /*#__PURE__*/React.createElement(Swords, {
    size: 15
  }), "Send Challenge"))));
}

/* ================================================================== */
/*  CHALLENGE CHOOSER + QUIZ (used for team vetting challenges)        */
/* ================================================================== */

function ChallengeChooser({
  c,
  onClose,
  onPick
}) {
  const skills = c.requirements;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Test before you trust",
    icon: /*#__PURE__*/React.createElement(Swords, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 440,
    footer: /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel")
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      marginBottom: 16
    }
  }, "Send ", c.name.split(" ")[0], " a short, timed challenge specific to Team Alpha's needs \u2014 separate from their platform assessment."), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "WHAT WOULD YOU LIKE TO TEST?"), skills.map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    className: "hm-method-opt",
    onClick: () => onPick(s)
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-method-icon"
  }, /*#__PURE__*/React.createElement(Target, {
    size: 17,
    color: "var(--brand)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, s), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "3 questions \xB7 2 minutes \xB7 team-specific")), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16,
    color: "var(--text-mute)"
  }))));
}
function QuizModal({
  title,
  subtitle,
  skill,
  onClose,
  onFinish,
  mode = "team"
}) {
  const questions = useMemo(() => {
    const picked = pick3(questionsFor(skill), _lastQuizIdx[skill] || []);
    _lastQuizIdx[skill] = picked.map(p => p._idx);
    return picked;
  }, [skill]);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [seconds, setSeconds] = useState(120);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds(s => {
      if (s <= 1) {
        clearInterval(t);
        return 0;
      }
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
    }, 650);
  }
  function finish(finalAnswers) {
    const correct = questions.reduce((n, q, i) => n + (finalAnswers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round(correct / questions.length * 100);
    setFinalScore(score);
    setFinished(true);
  }
  if (finished) {
    const passed = finalScore >= 70;
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: onClose,
      title: mode === "team" ? "Challenge Complete" : "Assessment Complete",
      icon: /*#__PURE__*/React.createElement(Swords, {
        size: 18,
        color: "var(--brand)"
      }),
      width: 420,
      footer: passed ? /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-primary hm-btn-block",
        onClick: () => onFinish(finalScore, true)
      }, "Continue") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-ghost",
        onClick: onClose
      }, "Close"), /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-primary",
        onClick: () => onFinish(finalScore, false)
      }, "Try Again"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "10px 4px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Space Grotesk',sans-serif",
        fontSize: 44,
        fontWeight: 800,
        color: passed ? "var(--teal)" : "var(--orange)"
      }
    }, finalScore, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--text-mute)",
        marginBottom: 18
      }
    }, skill, " ", mode === "team" ? "team challenge" : "assessment"), mode === "team" && /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat-row",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat-label"
    }, "CORRECTNESS"), /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat-val"
    }, Math.max(50, finalScore - 3), "%")), /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat-label"
    }, "TIME"), /*#__PURE__*/React.createElement("div", {
      className: "hm-card-stat-val"
    }, mm, ":", ss))), passed ? /*#__PURE__*/React.createElement("div", {
      className: "hm-badge",
      style: {
        color: "var(--teal)",
        background: "rgba(55,214,176,0.14)",
        fontSize: 13,
        padding: "8px 14px"
      }
    }, /*#__PURE__*/React.createElement(CheckCircle2, {
      size: 14
    }), " ", mode === "team" ? "PASSED — Team Verified" : "Assessment Verified") : /*#__PURE__*/React.createElement("div", {
      className: "hm-badge",
      style: {
        color: "var(--orange)",
        background: "rgba(245,165,36,0.14)",
        fontSize: 13,
        padding: "8px 14px"
      }
    }, /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 14
    }), " Not verified \u2014 score below 70%")));
  }
  const q = questions[qi];
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: title || `${skill} Assessment`,
    icon: /*#__PURE__*/React.createElement(ClipboardList, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 460
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      fontWeight: 700
    }
  }, "QUESTION ", qi + 1, "/", questions.length), /*#__PURE__*/React.createElement("span", {
    className: "hm-quiz-timer"
  }, /*#__PURE__*/React.createElement(Clock, {
    size: 13
  }), mm, ":", ss)), /*#__PURE__*/React.createElement("div", {
    className: "hm-quiz-progress"
  }, questions.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: i <= qi ? "done" : ""
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      marginBottom: 16,
      lineHeight: 1.5
    }
  }, q.q), /*#__PURE__*/React.createElement("div", null, q.options.map((opt, oi) => {
    let cls = "hm-quiz-opt";
    if (showResult && oi === selected) cls += oi === q.correct ? " correct" : " wrong";else if (showResult && oi === q.correct) cls += " correct";else if (selected === oi) cls += " selected";
    return /*#__PURE__*/React.createElement("div", {
      key: oi,
      className: cls,
      onClick: () => choose(oi)
    }, /*#__PURE__*/React.createElement("span", {
      className: "hm-quiz-radio"
    }, showResult && oi === q.correct && /*#__PURE__*/React.createElement(Check, {
      size: 11,
      color: "var(--teal)"
    }), showResult && oi === selected && oi !== q.correct && /*#__PURE__*/React.createElement(X, {
      size: 11,
      color: "var(--red)"
    })), opt);
  })));
}

/* ================================================================== */
/*  PROCTORING — consent, camera presence check, fullscreen + focus/   */
/*  tab integrity monitoring. Browser-only: this CANNOT see other      */
/*  desktop apps (terminal, IDE, etc.) — that needs a future desktop   */
/*  companion agent. Face/object detection is left as an architected   */
/*  extension point rather than faked.                                 */
/* ================================================================== */
function useCameraStream(active) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setStatus("requesting");
    navigator.mediaDevices?.getUserMedia?.({
      video: true
    }).then(stream => {
      if (cancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("granted");
    }).catch(() => setStatus("denied"));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [active]);
  return {
    videoRef,
    status
  };
}
function useIntegrityMonitor(active) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (!active) return;
    const log = type => setEvents(e => [...e, {
      type,
      at: Date.now()
    }]);
    const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const onVis = () => {
      if (document.hidden) log("Switched tabs / minimized");
    };
    const onBlur = () => log("Window lost focus");
    const onFs = () => {
      if (!isFullscreen()) log("Exited fullscreen");
    };
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
function ProctoredQuizModal({
  skill,
  mode = "self",
  candidate = null,
  title = null,
  onClose,
  onFinish
}) {
  const [stage, setStage] = useState("consent"); // consent | active
  const [fsError, setFsError] = useState(null);
  const monitoring = stage === "active";
  const {
    videoRef,
    status: camStatus
  } = useCameraStream(stage === "consent" || stage === "active");
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
    requestFullscreenCompat(document.documentElement).then(() => setFsError(null)).catch(err => {
      console.error("Fullscreen request failed:", err);
      setFsError("Fullscreen was restricted by browser policy. Continuing with camera and tab-switch monitoring.");
    });
    setStage("active");
  }
  function endMonitoring() {
    exitFullscreenCompat().catch(() => {});
  }
  if (stage === "consent") {
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: onClose,
      title: mode === "team" ? `Proctored Team Challenge — ${skill}` : `Proctored Skill Assessment — ${skill}`,
      icon: /*#__PURE__*/React.createElement(ShieldCheck, {
        size: 18,
        color: "var(--brand)"
      }),
      width: 500,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-ghost",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-primary",
        onClick: begin
      }, "Accept Rules & Begin"))
    }, candidate && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 10,
        background: "var(--panel-2)",
        borderRadius: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: candidate.photoUrl,
      fallback: candidate.avatar,
      name: candidate.name,
      size: 38
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, "Vetting Challenge for ", candidate.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--text-mute)"
      }
    }, candidate.role, " \xB7 Skill tested: ", skill))), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13,
        color: "var(--text-dim)",
        marginBottom: 14
      }
    }, "This assessment is ", /*#__PURE__*/React.createElement("b", null, "strictly proctored"), " to award verified badges and ensure authentic talent assessment."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--panel-2)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-mute)",
        letterSpacing: "0.05em",
        marginBottom: 10
      }
    }, "SYSTEM READINESS CHECK"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5
      }
    }, /*#__PURE__*/React.createElement(Camera, {
      size: 15,
      color: camStatus === "granted" ? "var(--teal)" : "var(--orange)"
    }), /*#__PURE__*/React.createElement("span", null, "Camera Presence Stream")), /*#__PURE__*/React.createElement("span", {
      className: "hm-badge",
      style: {
        color: camStatus === "granted" ? "var(--teal)" : "var(--orange)",
        background: camStatus === "granted" ? "rgba(20,232,196,0.14)" : "rgba(245,165,36,0.14)"
      }
    }, camStatus === "granted" ? "Camera Active" : camStatus === "denied" ? "Permission Denied" : "Requesting...")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5
      }
    }, /*#__PURE__*/React.createElement(Mic, {
      size: 15,
      color: "var(--teal)"
    }), /*#__PURE__*/React.createElement("span", null, "Room Audio Environment"), /*#__PURE__*/React.createElement("div", {
      className: "hm-audio-meter-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-audio-meter-fill"
    }))), /*#__PURE__*/React.createElement("span", {
      className: "hm-badge",
      style: {
        color: "var(--teal)",
        background: "rgba(20,232,196,0.14)"
      }
    }, "Quiet & Ready")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5
      }
    }, /*#__PURE__*/React.createElement(Maximize2, {
      size: 15,
      color: "var(--blue)"
    }), /*#__PURE__*/React.createElement("span", null, "Fullscreen Enforcement")), /*#__PURE__*/React.createElement("span", {
      className: "hm-badge",
      style: {
        color: "var(--blue)",
        background: "rgba(91,155,255,0.14)"
      }
    }, "Locks on Start"))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mute)",
        lineHeight: 1.7,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Check, {
      size: 13,
      color: "var(--teal)"
    }), " Tab switching or blurring the window docks 12 integrity points."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Check, {
      size: 13,
      color: "var(--teal)"
    }), " Keep your face centered in the camera feed."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Check, {
      size: 13,
      color: "var(--teal)"
    }), " 3 randomized questions \xB7 2-minute timer \xB7 Pass score \u2265 70%.")));
  }
  const integrityScore = Math.max(40, 100 - events.length * 12);
  return /*#__PURE__*/React.createElement(React.Fragment, null, latestFlag && /*#__PURE__*/React.createElement("div", {
    className: "hm-proctor-banner-alert"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Proctor Flag: ", latestFlag, " detected! (-12 Integrity Points)")), /*#__PURE__*/React.createElement(QuizModal, {
    title: title || (mode === "team" ? `Team Challenge — ${skill}` : `${skill} — Proctored Assessment`),
    skill: skill,
    mode: mode,
    onClose: () => {
      endMonitoring();
      onClose();
    },
    onFinish: (score, passed) => {
      endMonitoring();
      onFinish(score, passed, {
        proctored: true,
        integrityScore,
        eventCount: events.length,
        camera: camStatus,
        events
      });
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-proctor-hud"
  }, fsError && /*#__PURE__*/React.createElement("div", {
    className: "hm-proctor-fs-warn"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 12
  }), fsError), /*#__PURE__*/React.createElement("div", {
    className: "hm-proctor-cam",
    style: {
      position: "relative"
    }
  }, camStatus === "granted" ? /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    muted: true,
    playsInline: true
  }) : /*#__PURE__*/React.createElement("div", {
    className: "hm-proctor-cam-off"
  }, camStatus === "denied" ? /*#__PURE__*/React.createElement(EyeOff, {
    size: 14
  }) : /*#__PURE__*/React.createElement(Loader2, {
    size: 14,
    className: "hm-loading-spin"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      fontSize: 8.5,
      background: "rgba(0,0,0,0.7)",
      borderRadius: 4,
      textAlign: "center",
      color: "var(--teal)",
      fontWeight: 700
    }
  }, "AI FACE TRACKED")), /*#__PURE__*/React.createElement("div", {
    className: `hm-proctor-status${events.length ? " flagged" : ""}`
  }, /*#__PURE__*/React.createElement(Circle, {
    size: 7,
    fill: "currentColor"
  }), events.length === 0 ? "Monitoring — All Clear" : `${events.length} Flag${events.length > 1 ? "s" : ""}`), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 800,
      color: integrityScore >= 80 ? "var(--teal)" : "var(--orange)",
      background: "rgba(0,0,0,0.6)",
      padding: "2px 8px",
      borderRadius: 999
    }
  }, "Integrity: ", integrityScore, "%")));
}

/* ================================================================== */
/*  SKILL VERIFY METHOD CHOOSER + CREDENTIAL SIM                       */
/* ================================================================== */

function VerifyMethodModal({
  skill,
  onClose,
  onChooseAssessment,
  onChooseProof
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: `Verify ${skill}`,
    icon: /*#__PURE__*/React.createElement(ShieldCheck, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 440,
    footer: /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel")
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      marginBottom: 16
    }
  }, "Choose how to back your claim with proof. Skills only get a green badge after real evidence \u2014 not just by typing them in."), /*#__PURE__*/React.createElement("div", {
    className: "hm-method-opt",
    onClick: onChooseAssessment
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-method-icon"
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 17,
    color: "var(--teal)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, "Online Assessment"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "3 questions, ~2 min. Pass \u226570% for an Assessment-Verified badge.")), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16,
    color: "var(--text-mute)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-method-opt",
    onClick: () => onChooseProof("project")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-method-icon"
  }, /*#__PURE__*/React.createElement(FolderGit2, {
    size: 17,
    color: "var(--orange)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, "Project Evidence"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "Link a project or portfolio piece that used this skill.")), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16,
    color: "var(--text-mute)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-method-opt",
    onClick: () => onChooseProof("github")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-method-icon"
  }, /*#__PURE__*/React.createElement(Github, {
    size: 17,
    color: "var(--blue)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, "GitHub / Repository Evidence"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "Link a repository that demonstrates this skill.")), /*#__PURE__*/React.createElement(ChevronRight, {
    size: 16,
    color: "var(--text-mute)"
  })));
}
const CHECK_STEPS = {
  project: ["Checking submitted URL format...", "Project details recorded...", "Cross-referencing skill tags..."],
  github: ["Checking repository is reachable...", "Scanning repository language stats...", "Cross-referencing skill tags..."],
  credential: ["Checking submitted information...", "Project URL valid...", "Repository accessible...", "Hackathon information matches...", "Role information recorded..."]
};
function ProofLinkModal({
  kind,
  skill,
  onClose,
  onVerified
}) {
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
      fetchRepoEvidence(url).then(res => {
        if (!cancelled) setEvidence(res);
      });
    }
    if (stepIdx >= steps.length) {
      if (kind !== "github" || evidence) {
        setStage("done");
        return;
      }
      // steps finished before the fetch resolved — wait briefly, then fall back if still nothing
      const t = setTimeout(() => setEvidence(e => e || fallbackGithubEvidence(url)), 2000);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), 550);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [stage, stepIdx, steps.length, kind, url, evidence]);
  useEffect(() => {
    if (kind === "github" && stepIdx >= steps.length && evidence) setStage("done");
  }, [evidence, kind, stepIdx, steps.length]);
  if (stage === "done") {
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: onClose,
      title: "Proof linked",
      icon: /*#__PURE__*/React.createElement(FileCheck2, {
        size: 18,
        color: "var(--orange)"
      }),
      width: 420,
      footer: /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-primary hm-btn-block",
        onClick: () => onVerified(url, evidence)
      }, "Continue")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "8px 4px 4px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "rgba(245,165,36,0.14)",
        display: "grid",
        placeItems: "center",
        margin: "0 auto 16px"
      }
    }, /*#__PURE__*/React.createElement(FileCheck2, {
      size: 28,
      color: "var(--orange)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: 6
      }
    }, skill, " \u2014 Project Verified"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--text-mute)"
      }
    }, evidence?.summary || "This is a prototype verification — it checks link format and records your evidence, not an official database."), evidence?.fallback && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--text-mute)",
        marginTop: 6
      }
    }, "(Live GitHub lookup unavailable \u2014 showing representative demo data.)")));
  }
  if (stage === "checking") {
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: onClose,
      title: "Verifying evidence",
      icon: /*#__PURE__*/React.createElement(Loader2, {
        size: 18,
        className: "hm-loading-spin",
        color: "var(--brand)"
      }),
      width: 420
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `hm-verify-check-row ${i < stepIdx ? "done" : ""}`
    }, i < stepIdx ? /*#__PURE__*/React.createElement(CheckCircle2, {
      size: 15,
      color: "var(--teal)"
    }) : i === stepIdx ? /*#__PURE__*/React.createElement(Loader2, {
      size: 15,
      className: "hm-loading-spin",
      color: "var(--brand)"
    }) : /*#__PURE__*/React.createElement(Circle, {
      size: 15,
      color: "var(--text-mute)"
    }), s))));
  }
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: kind === "github" ? "Link a repository" : "Add project evidence",
    icon: /*#__PURE__*/React.createElement(Link2, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 420,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      disabled: !url.trim(),
      onClick: () => {
        setEvidence(null);
        setStage("checking");
        setStepIdx(0);
      }
    }, "Verify Proof"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Skill"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: skill,
    disabled: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, kind === "github" ? "Repository URL" : "Project / Portfolio URL"), /*#__PURE__*/React.createElement("div", {
    className: "hm-input-icon-wrap"
  }, kind === "github" ? /*#__PURE__*/React.createElement(Github, {
    size: 15
  }) : /*#__PURE__*/React.createElement(Link2, {
    size: 15
  }), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: kind === "github" ? "github.com/you/project" : "yourproject.com or portfolio link",
    value: url,
    onChange: e => setUrl(e.target.value)
  }))));
}
function CredentialVerifyModal({
  exp,
  onClose,
  onVerified
}) {
  const [stage, setStage] = useState("checking");
  const [stepIdx, setStepIdx] = useState(0);
  const steps = CHECK_STEPS.credential;
  useEffect(() => {
    if (stage !== "checking") return;
    if (stepIdx >= steps.length) {
      setStage("done");
      return;
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), 480);
    return () => clearTimeout(t);
  }, [stage, stepIdx]);
  if (stage === "done") {
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: onClose,
      title: "Credential verified",
      icon: /*#__PURE__*/React.createElement(BadgeCheck, {
        size: 18,
        color: "var(--teal)"
      }),
      width: 420,
      footer: /*#__PURE__*/React.createElement("button", {
        className: "hm-btn hm-btn-primary hm-btn-block",
        onClick: onVerified
      }, "Done")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "8px 4px 4px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "rgba(55,214,176,0.14)",
        display: "grid",
        placeItems: "center",
        margin: "0 auto 16px"
      }
    }, /*#__PURE__*/React.createElement(BadgeCheck, {
      size: 28,
      color: "var(--teal)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        marginBottom: 6
      }
    }, exp.hackathon, " \u2014 Verified"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: "var(--text-mute)"
      }
    }, "Demo verification simulation \u2014 records and cross-checks the info you submitted rather than contacting an external organizer database.")));
  }
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Verifying credential",
    icon: /*#__PURE__*/React.createElement(Loader2, {
      size: 18,
      className: "hm-loading-spin",
      color: "var(--brand)"
    }),
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `hm-verify-check-row ${i < stepIdx ? "done" : ""}`
  }, i < stepIdx ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 15,
    color: "var(--teal)"
  }) : i === stepIdx ? /*#__PURE__*/React.createElement(Loader2, {
    size: 15,
    className: "hm-loading-spin",
    color: "var(--brand)"
  }) : /*#__PURE__*/React.createElement(Circle, {
    size: 15,
    color: "var(--text-mute)"
  }), s))));
}

/* ================================================================== */
/*  AUTH — LOGIN / SIGNUP                                              */
/* ================================================================== */

function LoginScreen({
  onLogin,
  onGoSignup,
  onResetDemo
}) {
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
  function quickFill(kind) {
    if (kind === "leader") {
      setEmail("team@tribe.demo");
      setPassword("password123");
    } else {
      setEmail("candidate@tribe.demo");
      setPassword("password123");
    }
    setError("");
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-wrap"
  }, /*#__PURE__*/React.createElement(FloatingBolts, {
    count: 12
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-mark",
    style: {
      width: 42,
      height: 42
    }
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 22,
    strokeWidth: 2.5
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-name",
    style: {
      fontSize: 20
    }
  }, "TRIBE"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-tag"
  }, "Swipe right on talent."), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      marginBottom: 18
    }
  }, "Log in"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Email"), /*#__PURE__*/React.createElement("div", {
    className: "hm-input-icon-wrap"
  }, /*#__PURE__*/React.createElement(Mail, {
    size: 15
  }), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") submit(e);
    },
    placeholder: "you@email.com"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Password"), /*#__PURE__*/React.createElement("div", {
    className: "hm-input-icon-wrap"
  }, /*#__PURE__*/React.createElement(Lock, {
    size: 15
  }), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    type: showPw ? "text" : "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") submit(e);
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "hm-input-eye hm-reset",
    onClick: () => setShowPw(s => !s)
  }, showPw ? /*#__PURE__*/React.createElement(EyeOff, {
    size: 15
  }) : /*#__PURE__*/React.createElement(Eye, {
    size: 15
  })))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--red)",
      fontSize: 12.5,
      marginBottom: 12
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    type: "button",
    onClick: submit
  }, "Log In")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    style: {
      fontSize: 12.5,
      color: "var(--text-mute)"
    },
    onClick: () => setError("Password reset is simulated in this demo — use a demo account below instead.")
  }, "Forgot password")), /*#__PURE__*/React.createElement("div", {
    className: "hm-demo-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-demo-row"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Team Leader"), " \u2014 team@tribe.demo / password123"), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: () => quickFill("leader")
  }, "Use")), /*#__PURE__*/React.createElement("div", {
    className: "hm-demo-row",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Candidate"), " \u2014 candidate@tribe.demo / password123"), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: () => quickFill("candidate")
  }, "Use"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    style: {
      fontSize: 11,
      color: "var(--text-mute)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    },
    onClick: onResetDemo
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 11
  }), " Reset demo data"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-switch"
  }, "New to TRIBE? ", /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    onClick: onGoSignup
  }, "Create account"))));
}
function SignupScreen({
  onSignup,
  onGoLogin
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("Developer");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("Available now");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    onSignup({
      name: name.trim(),
      email: email.trim(),
      role,
      location: location.trim() || "Not specified",
      availability
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-wrap"
  }, /*#__PURE__*/React.createElement(FloatingBolts, {
    count: 12
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-card",
    style: {
      maxWidth: 460
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-logo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-mark",
    style: {
      width: 42,
      height: 42
    }
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 22,
    strokeWidth: 2.5
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-brand-name",
    style: {
      fontSize: 20
    }
  }, "TRIBE")), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      marginBottom: 18
    }
  }, "Create account"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Your full name"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@email.com"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Confirm"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    type: "password",
    value: confirm,
    onChange: e => setConfirm(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") submit(e);
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Role"), /*#__PURE__*/React.createElement("div", {
    className: "hm-role-grid"
  }, ROLES.map(r => /*#__PURE__*/React.createElement("div", {
    key: r,
    className: `hm-role-opt ${role === r ? "on" : ""}`,
    onClick: () => setRole(r)
  }, r)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Location"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: location,
    onChange: e => setLocation(e.target.value),
    placeholder: "City"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Availability"), /*#__PURE__*/React.createElement("select", {
    className: "hm-select",
    value: availability,
    onChange: e => setAvailability(e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Available now"), /*#__PURE__*/React.createElement("option", null, "Available this weekend"), /*#__PURE__*/React.createElement("option", null, "Available next week")))), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--red)",
      fontSize: 12.5,
      marginBottom: 12
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    type: "button",
    onClick: submit
  }, "Create Account"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-switch"
  }, "Already have an account? ", /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    onClick: onGoLogin
  }, "Log in"))));
}

/* ================================================================== */
/*  ONBOARDING                                                         */
/* ================================================================== */

function Onboarding({
  profile,
  onComplete
}) {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  function addSkill(name) {
    const n = name.trim();
    if (!n || skills.some(s => s.name.toLowerCase() === n.toLowerCase())) return;
    setSkills(s => [...s, {
      name: n,
      verification: "self",
      score: null,
      tested: null,
      proofs: []
    }]);
    setSkillInput("");
  }
  function removeSkill(name) {
    setSkills(s => s.filter(x => x.name !== name));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-wrap"
  }, /*#__PURE__*/React.createElement(FloatingBolts, {
    count: 10
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-auth-card",
    style: {
      maxWidth: 480
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-onb-steps"
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `hm-onb-dot ${i < step ? "done" : i === step ? "on" : ""}`
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, step === 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      marginBottom: 4
    }
  }, "Build your profile"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: "var(--text-mute)",
      marginBottom: 18
    }
  }, "This is what teams see before they invite you to prove your skills."), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: profile.name,
    disabled: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Role"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: profile.role,
    disabled: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Bio"), /*#__PURE__*/React.createElement("textarea", {
    className: "hm-textarea",
    value: bio,
    onChange: e => setBio(e.target.value),
    placeholder: "Two lines about what you build and what you're looking for..."
  })), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    onClick: () => setStep(1)
  }, "Continue")), step === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      marginBottom: 4
    }
  }, "Your skills"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: "var(--text-mute)",
      marginBottom: 18
    }
  }, "Add skills you know. Every skill starts ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-dim)"
    }
  }, "Claimed"), " \u2014 you'll verify them next, on your profile."), /*#__PURE__*/React.createElement("div", {
    className: "hm-skill-add-row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: skillInput,
    onChange: e => setSkillInput(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSkill(skillInput);
      }
    },
    placeholder: "e.g. React, Python, Figma...",
    list: "hm-skill-suggest"
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "hm-skill-suggest"
  }, SKILL_LIST.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }))), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost",
    onClick: () => addSkill(skillInput)
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-skill-pill-list",
    style: {
      marginBottom: 8
    }
  }, SKILL_LIST.filter(s => !skills.some(k => k.name === s)).slice(0, 6).map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: "hm-chip hm-reset",
    style: {
      cursor: "pointer"
    },
    onClick: () => addSkill(s)
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 11
  }), s))), skills.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "hm-skill-pill-list",
    style: {
      margin: "14px 0"
    }
  }, skills.map(s => /*#__PURE__*/React.createElement("div", {
    className: "hm-skill-pill",
    key: s.name
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-badge-dot",
    style: {
      background: "var(--grey)"
    }
  }), s.name, /*#__PURE__*/React.createElement("button", {
    className: "hm-reset",
    onClick: () => removeSkill(s.name)
  }, /*#__PURE__*/React.createElement(X, {
    size: 13
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost",
    onClick: () => setStep(0)
  }, /*#__PURE__*/React.createElement(ArrowLeft, {
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    onClick: () => setStep(2),
    disabled: skills.length === 0
  }, "Continue"))), step === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "rgba(255,46,126,0.14)",
      display: "grid",
      placeItems: "center",
      margin: "0 auto 16px"
    }
  }, /*#__PURE__*/React.createElement(Rocket, {
    size: 28,
    color: "var(--brand)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 19,
      marginBottom: 8
    }
  }, "You're in, ", profile.name.split(" ")[0]), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      marginBottom: 22,
      lineHeight: 1.6
    }
  }, "Your ", skills.length, " skill", skills.length > 1 ? "s are" : " is", " saved as Claimed. Head to your profile to verify them with an assessment, GitHub evidence, or a project link \u2014 verified skills are what get you matched."), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    onClick: () => onComplete({
      bio,
      skills
    })
  }, "Go to Dashboard"))))));
}

/* ================================================================== */
/*  SKILL RADAR                                                        */
/* ================================================================== */

function SkillRadar({
  coverage
}) {
  const data = Object.entries(coverage).map(([k, v]) => ({
    skill: k,
    value: v
  }));
  return /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: 230
  }, /*#__PURE__*/React.createElement(RadarChart, {
    data: data,
    outerRadius: "72%"
  }, /*#__PURE__*/React.createElement(PolarGrid, {
    stroke: "var(--line)"
  }), /*#__PURE__*/React.createElement(PolarAngleAxis, {
    dataKey: "skill",
    tick: {
      fill: "var(--text-dim)",
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement(PolarRadiusAxis, {
    tick: false,
    axisLine: false,
    domain: [0, 100]
  }), /*#__PURE__*/React.createElement(Radar, {
    dataKey: "value",
    stroke: "var(--brand)",
    fill: "var(--brand)",
    fillOpacity: 0.22,
    strokeWidth: 2
  }), /*#__PURE__*/React.createElement(RTooltip, {
    contentStyle: {
      background: "var(--panel-2)",
      border: "1px solid var(--line)",
      borderRadius: 10,
      fontSize: 12
    }
  })));
}

/* ================================================================== */
/*  DASHBOARD                                                          */
/* ================================================================== */

function Dashboard({
  team,
  userKind,
  profile,
  onFindSkill,
  matchesCount,
  vettingCount,
  coverageFlash,
  onOpenMemberProfile,
  onOpenAddMember
}) {
  const strength = Math.round(Object.values(team.coverage).reduce((a, b) => a + b, 0) / Object.values(team.coverage).length);
  const gaps = Object.entries(team.coverage).filter(([, v]) => v < 45).map(([k]) => k);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, userKind === "leader" ? team.name : "Your Dashboard"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, userKind === "leader" ? `Building for ${team.hackathon}` : "Verified skills, assessments, and team activity — all in one place.")), userKind === "leader" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)",
      fontWeight: 700
    }
  }, "TEAM STRENGTH"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk',sans-serif",
      fontSize: 24,
      fontWeight: 800,
      color: "var(--brand)"
    }
  }, strength, "%")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Users, {
    size: 13
  }), "TEAM MEMBERS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, team.members.length)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 13
  }), "MATCHES"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, matchesCount)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 13
  }), "IN VETTING"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, vettingCount)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 13
  }), "ASSESSMENTS VERIFIED"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, profile.skills.filter(s => s.verification === "assessment").length))), /*#__PURE__*/React.createElement("div", {
    className: "hm-grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "SKILL COVERAGE"), /*#__PURE__*/React.createElement(SkillRadar, {
    coverage: team.coverage
  }), gaps.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "hm-gap-alert"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 700,
      fontSize: 13,
      color: "var(--orange)",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 15
  }), " TEAM GAP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-dim)",
      marginBottom: 12
    }
  }, "Your team is missing strength in: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text)"
    }
  }, gaps.join(", "))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, gaps.map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: () => onFindSkill(g)
  }, "Find ", g, " Member")))), coverageFlash && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 12.5,
      color: "var(--teal)",
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(TrendingUp, {
    size: 14
  }), " ", coverageFlash)), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "TEAM MEMBERS"), team.members.map(m => /*#__PURE__*/React.createElement("div", {
    className: "hm-member-row",
    key: m.id,
    style: {
      cursor: "pointer"
    },
    onClick: () => onOpenMemberProfile?.(m),
    title: "View profile"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: m.photoUrl,
    fallback: m.avatar,
    name: m.name,
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, m.role, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)"
    }
  }, "View Profile"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, (m.skills || []).slice(0, 2).map(s => /*#__PURE__*/React.createElement(VerifyBadge, {
    key: s.name,
    level: s.verification || "team",
    size: "sm"
  }))))), userKind === "leader" && /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-block",
    style: {
      marginTop: 14
    },
    onClick: () => onFindSkill(null)
  }, /*#__PURE__*/React.createElement(Compass, {
    size: 14
  }), " Open Discover"))));
}

/* ================================================================== */
/*  MATCHES                                                             */
/* ================================================================== */

function MatchesScreen({
  matches,
  onSendChallenge,
  onViewProof
}) {
  if (matches.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "hm-page-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "hm-page-title"
    }, "Matches"), /*#__PURE__*/React.createElement("div", {
      className: "hm-page-sub"
    }, "Candidates who matched with your team, ready for vetting."))), /*#__PURE__*/React.createElement("div", {
      className: "hm-panel"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Zap, {
        size: 40
      }),
      title: "No matches yet",
      sub: "Head to Discover and connect with a candidate whose proof fits what your team needs."
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, "Matches"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, "Mutual interest \u2014 next step is a team-specific challenge before anyone joins."))), matches.map(c => {
    const photo = c.photoUrl || typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl;
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      className: "hm-panel hm-inbox-card",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: photo,
      fallback: c.avatar,
      name: c.name,
      size: 48,
      style: {
        border: "2px solid var(--brand)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 160
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mute)"
      }
    }, c.role, c.location ? ` · ${c.location}` : "")), /*#__PURE__*/React.createElement(MatchRing, {
      value: c.match,
      size: 44
    }), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost hm-btn-sm",
      onClick: () => onViewProof(c)
    }, "View Proof"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary hm-btn-sm",
      onClick: () => onSendChallenge(c)
    }, /*#__PURE__*/React.createElement(Swords, {
      size: 13
    }), "Send Challenge"));
  }));
}

/* ================================================================== */
/*  VETTING INBOX                                                      */
/* ================================================================== */

function VettingInbox({
  items,
  onAccept,
  onRetest
}) {
  if (items.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "hm-page-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "hm-page-title"
    }, "Vetting"), /*#__PURE__*/React.createElement("div", {
      className: "hm-page-sub"
    }, "Candidates who completed your team challenge."))), /*#__PURE__*/React.createElement("div", {
      className: "hm-panel"
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(ShieldCheck, {
        size: 40
      }),
      title: "Nothing to review",
      sub: "Once a matched candidate finishes a team challenge, their result lands here for you to accept or re-test."
    })));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, "Vetting"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, "Team-specific challenge results \u2014 separate from their platform assessment."))), items.map(it => {
    const photo = it.c.photoUrl || typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === it.c.id)?.photoUrl;
    return /*#__PURE__*/React.createElement("div", {
      key: it.c.id,
      className: "hm-panel hm-inbox-card"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 14,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: photo,
      fallback: it.c.avatar,
      name: it.c.name,
      size: 48,
      style: {
        border: "2px solid var(--teal)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 140
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, it.c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mute)"
      }
    }, it.c.role, it.c.location ? ` · ${it.c.location}` : "")), /*#__PURE__*/React.createElement(MatchRing, {
      value: it.c.match,
      size: 40
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 14,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-num",
      style: {
        color: "var(--teal)"
      }
    }, it.c.assessmentAvg, "%"), /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-label"
    }, "PLATFORM ASSESSMENT")), /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-num",
      style: {
        color: it.pass ? "var(--blue)" : "var(--red)"
      }
    }, it.score, "%"), /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-label"
    }, "TEAM CHALLENGE \xB7 ", it.skill.toUpperCase())), /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-num"
    }, it.c.projects.length), /*#__PURE__*/React.createElement("div", {
      className: "hm-inbox-metric-label"
    }, "PROJECTS"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }
    }, it.pass ? /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-teal",
      onClick: () => onAccept(it)
    }, /*#__PURE__*/React.createElement(UserPlus, {
      size: 14
    }), "Accept to Team") : /*#__PURE__*/React.createElement("span", {
      className: "hm-badge",
      style: {
        color: "var(--red)",
        background: "rgba(255,107,107,0.12)"
      }
    }, /*#__PURE__*/React.createElement(XCircle, {
      size: 13
    }), "Didn't pass this challenge"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-outline",
      onClick: () => onRetest(it.c)
    }, "Request Another Test")));
  }));
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

function Rankings({
  team,
  profile
}) {
  const board = useMemo(() => {
    const inHackathon = CANDIDATES.filter(c => c.hackathons?.some(h => h.name === team.hackathon));
    const pool = inHackathon.length >= 5 ? inHackathon : CANDIDATES;
    const entries = pool.map(c => ({
      key: c.id,
      isYou: false,
      score: computeTrustScore({
        skills: c.detailedSkills,
        hackathonsCount: c.hackathons.length,
        vouches: c.vouches
      }).score
    }));
    entries.push({
      key: "you",
      isYou: true,
      score: computeTrustScore({
        skills: profile.skills,
        hackathonsCount: profile.experiences.length,
        vouches: 0
      }).score
    });
    entries.sort((a, b) => b.score - a.score);
    let letter = 0;
    return entries.map((e, i) => ({
      ...e,
      rank: i + 1,
      label: e.isYou ? "You" : `Participant ${String.fromCharCode(65 + letter++)}`
    }));
  }, [team.hackathon, profile.skills, profile.experiences]);
  const you = board.find(e => e.isYou);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, "Rankings"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, team.hackathon, " \xB7 Anonymous Ranking"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad",
    style: {
      marginBottom: 16,
      display: "flex",
      gap: 10,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Info, {
    size: 15,
    color: "var(--text-mute)",
    style: {
      marginTop: 1,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      lineHeight: 1.6
    }
  }, "Ranked by ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-dim)"
    }
  }, "Technical Contribution"), " \u2014 the same evidence-weighted score behind your Trust Score (verification levels, assessment results, linked proof, and hackathon history). Other participants are shown anonymously; only your own row is identified.")), you && /*#__PURE__*/React.createElement("div", {
    className: "hm-card",
    style: {
      padding: "14px 16px",
      marginBottom: 16,
      borderColor: "var(--brand)",
      background: "rgba(255,46,126,0.06)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-mute)",
      marginBottom: 2
    }
  }, "YOUR RANK"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18,
      fontFamily: "'Space Grotesk',sans-serif"
    }
  }, "#", you.rank, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      fontFamily: "inherit",
      fontWeight: 500
    }
  }, "of ", board.length))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-mute)",
      marginBottom: 2
    }
  }, "TECHNICAL CONTRIBUTION"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 22,
      color: "var(--brand)",
      fontFamily: "'Space Grotesk',sans-serif"
    }
  }, you.score)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, team.hackathon.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, board.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.key,
    className: "hm-card",
    style: {
      padding: "11px 14px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      borderColor: e.isYou ? "var(--brand)" : "var(--line)",
      background: e.isYou ? "rgba(255,46,126,0.06)" : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      textAlign: "center",
      fontWeight: 800,
      fontFamily: "'Space Grotesk',sans-serif",
      color: e.rank <= 3 ? "var(--brand)" : "var(--text-mute)",
      fontSize: 14
    }
  }, "#", e.rank), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, e.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)"
    }
  }, "Technical Contribution")), /*#__PURE__*/React.createElement("div", {
    className: "hm-rank-bar",
    style: {
      width: 110
    }
  }, /*#__PURE__*/React.createElement(Bar, {
    value: e.score,
    color: e.isYou ? "var(--brand)" : "var(--teal)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      textAlign: "right",
      fontWeight: 800,
      fontFamily: "'Space Grotesk',sans-serif",
      color: e.isYou ? "var(--brand)" : "var(--text-dim)"
    }
  }, e.score))))));
}

/* ================================================================== */
/*  MY TEAM                                                             */
/* ================================================================== */

function MyTeam({
  team,
  onOpenAddMember,
  onOpenMemberProfile,
  onRemoveMember
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, team.name), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, team.hackathon, " \xB7 Team Management")), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary",
    onClick: onOpenAddMember
  }, /*#__PURE__*/React.createElement(UserPlus, {
    size: 15
  }), " Add Member")), /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "PROJECT"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: "var(--text-dim)",
      lineHeight: 1.6
    }
  }, team.description), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title",
    style: {
      marginTop: 18
    }
  }, "REQUIRED SKILLS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row"
  }, team.requiredSkills.map(s => /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    key: s
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title",
    style: {
      margin: 0
    }
  }, "MEMBERS (", team.members.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)"
    }
  }, "Click any teammate to view full verification, assessment & GitHub profile.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
      gap: 14
    }
  }, team.members.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "hm-panel hm-panel-pad",
    style: {
      cursor: "pointer",
      transition: "border-color .15s ease",
      position: "relative"
    },
    onClick: () => onOpenMemberProfile(m)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: m.photoUrl,
    fallback: m.avatar,
    name: m.name,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)"
    }
  }, m.role)), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-sm",
    style: {
      padding: 6,
      color: "var(--red)"
    },
    title: "Remove from team",
    onClick: e => {
      e.stopPropagation();
      onRemoveMember(m);
    }
  }, /*#__PURE__*/React.createElement(Trash2, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      marginBottom: 14
    }
  }, (m.skills || []).slice(0, 3).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", null, s.name), /*#__PURE__*/React.createElement(VerifyBadge, {
    level: s.verification || "team",
    size: "sm"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--line-soft)",
      paddingTop: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 11.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-mute)"
    }
  }, m.location || "Bengaluru"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--teal)",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 3
    }
  }, "View Full Profile ", /*#__PURE__*/React.createElement(ChevronRight, {
    size: 12
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "hm-add-member-card",
    onClick: onOpenAddMember
  }, /*#__PURE__*/React.createElement(UserPlus, {
    size: 28,
    color: "var(--brand)",
    style: {
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "var(--text)"
    }
  }, "Add Teammate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      marginTop: 3
    }
  }, "From talent pool or custom invitation"))));
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

function RepoEvidenceCard({
  repo,
  profile,
  onUseEvidence
}) {
  const matchingSkill = useMemo(() => {
    if (!profile?.skills?.length) return null;
    const hay = `${repo.language || ""} ${(repo.topics || []).join(" ")} ${repo.description || ""}`.toLowerCase();
    return profile.skills.find(s => hay.includes(s.name.toLowerCase())) || null;
  }, [repo, profile]);
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-card",
    style: {
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: repo.url,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: "var(--text)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, repo.name, " ", /*#__PURE__*/React.createElement(ExternalLink, {
    size: 11,
    color: "var(--text-mute)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)",
      marginTop: 3
    }
  }, repo.language || "Unknown language", repo.isML ? " · ML-related" : ""), repo.description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-dim)",
      marginTop: 7,
      maxWidth: 460,
      lineHeight: 1.5
    }
  }, repo.description)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 11.5,
      color: "var(--text-mute)",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--text-dim)"
    }
  }, "\u2605 ", repo.stars ?? 0), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, "Last updated: ", relativeTime(repo.updatedAt)))), repo.languages && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--text-mute)",
      letterSpacing: "0.06em",
      marginBottom: 6
    }
  }, "LANGUAGES"), Object.entries(repo.languages).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([lang, pct]) => /*#__PURE__*/React.createElement("div", {
    key: lang,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      width: 84,
      flexShrink: 0,
      color: "var(--text-dim)"
    }
  }, lang), /*#__PURE__*/React.createElement(Bar, {
    value: pct,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)",
      width: 34,
      textAlign: "right",
      flexShrink: 0
    }
  }, pct, "%")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--text-mute)",
      letterSpacing: "0.06em",
      marginBottom: 2
    }
  }, "EVIDENCE"), repo.evidence.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 11.5,
      color: e.ok ? "var(--text-dim)" : "var(--text-mute)"
    }
  }, e.ok ? /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 13,
    color: "var(--teal)"
  }) : /*#__PURE__*/React.createElement(XCircle, {
    size: 13,
    color: "var(--text-mute)"
  }), e.label))), matchingSkill && matchingSkill.verification !== "github" && onUseEvidence && /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    style: {
      marginTop: 12
    },
    onClick: () => onUseEvidence(matchingSkill.name, repo)
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 12
  }), " Use as evidence for ", matchingSkill.name));
}
function GithubPanel({
  profile,
  onSaveGithub,
  onDisconnectGithub,
  onUseEvidence
}) {
  const gh = profile.github;
  const [input, setInput] = useState(gh?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function connect() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const analysis = await analyzeGithubUser(input.trim());
      onSaveGithub(analysis);
    } catch (e) {
      setError("Something went wrong analyzing this GitHub account. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  if (!gh) {
    return /*#__PURE__*/React.createElement("div", {
      className: "hm-panel hm-panel-pad"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 440
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-method-icon"
    }, /*#__PURE__*/React.createElement(Github, {
      size: 17,
      color: "var(--purple)"
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 15.5,
        margin: 0
      }
    }, "Connect GitHub")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12.5,
        color: "var(--text-mute)",
        lineHeight: 1.6,
        marginBottom: 16
      }
    }, "TRIBE reads your real, public GitHub activity \u2014 repositories, languages, stars, and recent pushes \u2014 to back your claimed skills with evidence instead of taking your word for it. No login or access token required; only public data is read, and nothing is posted on your behalf."), /*#__PURE__*/React.createElement("div", {
      className: "hm-field"
    }, /*#__PURE__*/React.createElement("label", {
      className: "hm-label"
    }, "GitHub username or profile URL"), /*#__PURE__*/React.createElement("div", {
      className: "hm-input-icon-wrap"
    }, /*#__PURE__*/React.createElement(Github, {
      size: 15
    }), /*#__PURE__*/React.createElement("input", {
      className: "hm-input",
      value: input,
      onChange: e => setInput(e.target.value),
      onKeyDown: e => {
        if (e.key === "Enter") connect();
      },
      placeholder: "github.com/ananya-dev"
    }))), error && /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--red)",
        fontSize: 12.5,
        marginBottom: 10
      }
    }, error), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      disabled: !input.trim() || loading,
      onClick: connect
    }, loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Loader2, {
      size: 14,
      className: "hm-loading-spin"
    }), " Analyzing\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Github, {
      size: 14
    }), " Connect GitHub"))));
  }
  const a = gh.analysis;
  const topLangs = Object.entries(a.stats.languageCounts).sort((x, y) => y[1] - x[1]).slice(0, 6);
  return /*#__PURE__*/React.createElement("div", null, a.fallback && /*#__PURE__*/React.createElement("div", {
    className: "hm-card",
    style: {
      padding: "11px 14px",
      marginBottom: 16,
      borderColor: "var(--orange)",
      display: "flex",
      gap: 9,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    size: 15,
    color: "var(--orange)",
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-dim)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--orange)"
    }
  }, "GitHub connection simulated for local demo."), " ", a.summary || "Live API unreachable or rate-limited — showing representative demo data.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, a.profile.avatarUrl ? /*#__PURE__*/React.createElement("img", {
    src: a.profile.avatarUrl,
    alt: "",
    style: {
      width: 46,
      height: 46,
      borderRadius: "50%",
      border: "1px solid var(--line)"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "hm-avatar-chip",
    style: {
      width: 46,
      height: 46
    }
  }, /*#__PURE__*/React.createElement(Github, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, a.profile.name), /*#__PURE__*/React.createElement("a", {
    href: a.profile.htmlUrl,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "github.com/", a.username))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    disabled: loading,
    onClick: connect
  }, loading ? "Re-analyzing…" : "Re-analyze"), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-sm",
    onClick: onDisconnectGithub
  }, "Disconnect"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "GITHUB ANALYSIS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-grid",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(FolderGit2, {
    size: 13
  }), "PUBLIC REPOS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, a.stats.totalRepos)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 13
  }), "RECENT ACTIVITY"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 17
    }
  }, a.stats.recentActivityEstimate, "+ commits")), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Award, {
    size: 13
  }), "TOTAL STARS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, a.stats.totalStars)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Rocket, {
    size: 13
  }), "ACTIVE PROJECTS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, a.stats.activeProjectsCount))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)",
      marginBottom: 14,
      marginTop: -6
    }
  }, "\"Recent activity\" is estimated from recent public push events, not an authenticated total commit count. \"Active projects\" means pushed to in the last 90 days."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 22
    }
  }, topLangs.map(([lang, count]) => /*#__PURE__*/React.createElement("span", {
    key: lang,
    className: "hm-chip"
  }, count, " repo", count > 1 ? "s" : "", " using ", lang)), a.stats.mlRepoCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    style: {
      color: "var(--teal)"
    }
  }, /*#__PURE__*/React.createElement(Sparkles, {
    size: 11
  }), " ", a.stats.mlRepoCount, " ML-related repositor", a.stats.mlRepoCount > 1 ? "ies" : "y")), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "REPOSITORIES"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, a.topRepos.map(r => /*#__PURE__*/React.createElement(RepoEvidenceCard, {
    key: r.name,
    repo: r,
    profile: profile,
    onUseEvidence: onUseEvidence
  })), a.topRepos.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(FolderGit2, {
      size: 36
    }),
    title: "No public repositories found",
    sub: "This account has no public repos to analyze yet."
  })));
}
function MyProfile({
  profile,
  onAddSkill,
  onOpenVerify,
  onAddExperience,
  onOpenCredentialVerify,
  onSaveGithub,
  onDisconnectGithub,
  onUseGithubEvidence,
  teamName,
  onResetDemo,
  onOpenPhotoCustomizer
}) {
  const [tab, setTab] = useState("skills");
  const [skillInput, setSkillInput] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-avatar-wrap",
    onClick: onOpenPhotoCustomizer,
    title: "Click to change profile photo"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: profile.photoUrl,
    fallback: profile.avatar,
    name: profile.name,
    size: 64,
    style: {
      border: "2px solid var(--brand)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-avatar-edit-badge"
  }, /*#__PURE__*/React.createElement(Camera, {
    size: 13
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, profile.name), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, profile.role, " \xB7 ", profile.location))), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: onResetDemo,
    title: "Clear local demo data and restore the initial state"
  }, /*#__PURE__*/React.createElement(RotateCcw, {
    size: 13
  }), " Reset Demo")), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(BadgeCheck, {
    size: 13
  }), "VERIFIED SKILLS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      color: "var(--teal)"
    }
  }, profile.skills.filter(s => s.verification !== "self").length, "/", profile.skills.length)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(ClipboardList, {
    size: 13
  }), "ASSESSMENTS TAKEN"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, profile.skills.filter(s => s.tested).length)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Trophy, {
    size: 13
  }), "HACKATHONS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val"
  }, profile.experiences.length)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Users, {
    size: 13
  }), "TEAM STATUS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 15,
      color: teamName ? "var(--teal)" : "var(--text-mute)"
    }
  }, teamName || "Unassigned"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-tabbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "skills" ? "on" : ""}`,
    onClick: () => setTab("skills")
  }, "Skills"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "experience" ? "on" : ""}`,
    onClick: () => setTab("experience")
  }, "Experience & Proof"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "github" ? "on" : ""}`,
    onClick: () => setTab("github")
  }, "GitHub"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "participation" ? "on" : ""}`,
    onClick: () => setTab("participation")
  }, "Team Participation"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "trust" ? "on" : ""}`,
    onClick: () => setTab("trust")
  }, "Trust Score")), tab === "github" && /*#__PURE__*/React.createElement(GithubPanel, {
    profile: profile,
    onSaveGithub: onSaveGithub,
    onDisconnectGithub: onDisconnectGithub,
    onUseEvidence: onUseGithubEvidence
  }), tab === "trust" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 460
    }
  }, /*#__PURE__*/React.createElement(TrustScoreCard, {
    skills: profile.skills,
    hackathonsCount: profile.experiences.length,
    vouches: 0,
    title: "Your Trust Score"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)",
      marginTop: 10
    }
  }, "Peer ratings aren't live in this prototype yet \u2014 teammates will only be able to rate people they actually worked with (Section 16).")), tab === "skills" && /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-skill-add-row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: skillInput,
    onChange: e => setSkillInput(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && skillInput.trim()) {
        onAddSkill(skillInput.trim());
        setSkillInput("");
      }
    },
    placeholder: "Add a skill (e.g. GraphQL)...",
    list: "hm-skill-suggest2"
  }), /*#__PURE__*/React.createElement("datalist", {
    id: "hm-skill-suggest2"
  }, SKILL_LIST.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }))), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary",
    onClick: () => {
      if (skillInput.trim()) {
        onAddSkill(skillInput.trim());
        setSkillInput("");
      }
    }
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 15
  }), "Add Skill")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginTop: 6
    }
  }, profile.skills.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    className: "hm-card",
    style: {
      padding: "13px 15px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement(VerifyBadge, {
    level: s.verification,
    size: "sm"
  }), s.score != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, s.score, "% \xB7 tested ", s.tested))), s.verification !== "assessment" && /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: () => onOpenVerify(s.name)
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 13
  }), "Verify Skill")), s.proofs && s.proofs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, s.proofs.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card-proof-item"
  }, /*#__PURE__*/React.createElement(Check, {
    size: 12,
    color: "var(--teal)"
  }), p))))), profile.skills.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Target, {
      size: 36
    }),
    title: "No skills yet",
    sub: "Add a skill above to start building verifiable proof."
  }))), tab === "experience" && /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-sm",
    onClick: () => setShowAddExp(true)
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 14
  }), "Add Experience")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, profile.experiences.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card",
    style: {
      padding: "13px 15px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, e.hackathon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginTop: 3
    }
  }, e.role, " \xB7 ", e.result, " \xB7 ", e.project), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7
    }
  }, /*#__PURE__*/React.createElement(VerifyBadge, {
    level: e.verified ? "assessment" : "proof",
    size: "sm"
  }))), !e.verified && /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    onClick: () => onOpenCredentialVerify(e)
  }, /*#__PURE__*/React.createElement(FileCheck2, {
    size: 13
  }), "Verify Credential")))), profile.experiences.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Trophy, {
      size: 36
    }),
    title: "No experience added",
    sub: "Add a hackathon or project to build your proof-linked history."
  })), showAddExp && /*#__PURE__*/React.createElement(AddExperienceModal, {
    onClose: () => setShowAddExp(false),
    onAdd: exp => {
      onAddExperience(exp);
      setShowAddExp(false);
    }
  })), tab === "participation" && /*#__PURE__*/React.createElement("div", {
    className: "hm-panel hm-panel-pad"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "HACKATHON PARTICIPATION"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 20
    }
  }, profile.experiences.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Trophy, {
    size: 16,
    color: "var(--brand)"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, e.hackathon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, e.role, " \xB7 ", e.result)))), profile.experiences.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-mute)"
    }
  }, "No hackathon history yet.")), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "CURRENT TEAM"), teamName ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Users, {
    size: 16,
    color: "var(--teal)"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, teamName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--teal)"
    }
  }, "Status: Active"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-mute)"
    }
  }, "Not currently on a team.")));
}
function AddExperienceModal({
  onClose,
  onAdd
}) {
  const [hackathon, setHackathon] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("Finalist");
  const [project, setProject] = useState("");
  const [repo, setRepo] = useState("");
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Add Experience",
    icon: /*#__PURE__*/React.createElement(Trophy, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 440,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      disabled: !hackathon.trim() || !project.trim(),
      onClick: () => onAdd({
        hackathon: hackathon.trim(),
        role: role.trim() || "Contributor",
        result,
        project: project.trim(),
        repo,
        verified: false
      })
    }, "Add"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Hackathon"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: hackathon,
    onChange: e => setHackathon(e.target.value),
    placeholder: "Smart India Hackathon 2025"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Role"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: role,
    onChange: e => setRole(e.target.value),
    placeholder: "Frontend Developer"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Result"), /*#__PURE__*/React.createElement("select", {
    className: "hm-select",
    value: result,
    onChange: e => setResult(e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Winner"), /*#__PURE__*/React.createElement("option", null, "Finalist"), /*#__PURE__*/React.createElement("option", null, "Participant"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Project"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: project,
    onChange: e => setProject(e.target.value),
    placeholder: "HealthConnect"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Repository URL"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: repo,
    onChange: e => setRepo(e.target.value),
    placeholder: "github.com/you/healthconnect"
  })));
}

/* ================================================================== */
/*  ASSESSMENTS PAGE                                                   */
/* ================================================================== */

function AssessmentsPage({
  profile,
  onStart,
  onStartProctored
}) {
  const available = Object.keys(QUESTION_BANK);
  const history = profile.assessmentHistory || [];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-page-title"
  }, "Assessments"), /*#__PURE__*/React.createElement("div", {
    className: "hm-page-sub"
  }, "Timed technical quizzes that upgrade a Claimed skill to Assessment Verified. Proctored runs carry more weight."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
      gap: 14
    }
  }, available.map(skill => {
    const existing = profile.skills.find(s => s.name === skill);
    const verified = existing?.verification === "assessment";
    const attempts = history.filter(h => h.skill === skill).slice(-3).reverse();
    return /*#__PURE__*/React.createElement("div", {
      key: skill,
      className: "hm-panel hm-panel-pad"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-method-icon"
    }, /*#__PURE__*/React.createElement(ClipboardList, {
      size: 17,
      color: "var(--brand)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, skill)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-mute)",
        marginBottom: 14
      }
    }, "3 questions (randomized) \xB7 2 minutes \xB7 pass \u226570%"), verified ? /*#__PURE__*/React.createElement("div", {
      className: "hm-badge",
      style: {
        color: "var(--teal)",
        background: "rgba(55,214,176,0.14)",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(CheckCircle2, {
      size: 12
    }), existing.score, "% Verified") : null, attempts.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, attempts.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "var(--text-mute)"
      }
    }, /*#__PURE__*/React.createElement("span", null, a.date, a.proctored ? " · proctored" : ""), /*#__PURE__*/React.createElement("span", {
      style: {
        color: a.passed ? "var(--teal)" : "var(--orange)",
        fontWeight: 700
      }
    }, a.score, "%", a.proctored ? ` · integrity ${a.integrityScore}` : "")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-outline",
      style: {
        flex: 1
      },
      onClick: () => onStart(skill)
    }, verified ? "Retake" : "Start"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      style: {
        flex: 1
      },
      onClick: () => onStartProctored(skill)
    }, /*#__PURE__*/React.createElement(ShieldCheck, {
      size: 13
    }), "Proctored")));
  })));
}

/* ================================================================== */
/*  CREATE / EDIT TEAM — with mock "describe what you need" parsing    */
/* ================================================================== */

const SKILL_KEYWORDS = {
  react: "React",
  frontend: "Frontend",
  node: "Node.js",
  api: "API Integration",
  backend: "Backend",
  python: "Python",
  ml: "Machine Learning",
  ai: "AI Hackathon Experience",
  "machine learning": "Machine Learning",
  design: "UI/UX Design",
  figma: "Figma",
  docker: "Docker",
  kubernetes: "Kubernetes",
  devops: "DevOps",
  aws: "AWS",
  postgres: "PostgreSQL",
  database: "PostgreSQL",
  typescript: "TypeScript",
  golang: "Go",
  "go developer": "Go",
  "system design": "System Design",
  architect: "System Design",
  "computer vision": "Computer Vision",
  pytorch: "PyTorch",
  tensorflow: "TensorFlow",
  "deep learning": "Machine Learning",
  mobile: "Mobile Development",
  ios: "Mobile Development",
  android: "Mobile Development"
};
// signal phrases that push a matched skill into "preferred" rather than "required"
const PREFERRED_SIGNALS = ["nice to have", "bonus", "preferred", "preferably", "ideally", "a plus", "would be great", "hackathon experience"];
function parseRequirement(text) {
  // Split into rough clauses so a "preferred" signal only softens the skills
  // mentioned near it, not every skill in the whole message.
  const clauses = text.split(/(?<=[,.;])|\band\b/i).map(c => c.trim()).filter(Boolean);
  const list = clauses.length ? clauses : [text];
  const required = [],
    preferred = [];
  list.forEach(clause => {
    const lower = clause.toLowerCase();
    const clausePreferred = PREFERRED_SIGNALS.some(sig => lower.includes(sig));
    Object.entries(SKILL_KEYWORDS).forEach(([kw, label]) => {
      if (lower.includes(kw)) {
        const target = kw === "ai" || clausePreferred ? preferred : required;
        if (!required.includes(label) && !preferred.includes(label)) target.push(label);
      }
    });
  });
  return {
    required: required.length ? required : ["General Development"],
    preferred
  };
}
function CreateTeamModal({
  onClose,
  onCreate
}) {
  const [name, setName] = useState("");
  const [hackathon, setHackathon] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState(4);
  const [need, setNeed] = useState("");
  const [parsed, setParsed] = useState(null);
  const [manualSkills, setManualSkills] = useState([]);
  function toggleManual(s) {
    setManualSkills(ms => ms.includes(s) ? ms.filter(x => x !== s) : [...ms, s]);
  }
  function runParse() {
    if (!need.trim()) return;
    setParsed(parseRequirement(need));
  }
  const allRequired = Array.from(new Set([...(parsed?.required || []), ...manualSkills]));
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Create Team",
    icon: /*#__PURE__*/React.createElement(Users, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      disabled: !name.trim(),
      onClick: () => onCreate({
        name: name.trim(),
        hackathon: hackathon.trim() || "Untitled Hackathon",
        description: description.trim(),
        size,
        requiredSkills: allRequired.length ? allRequired : ["General Development"]
      })
    }, "Create Team"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Team Name"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Team Nova"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Hackathon"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    value: hackathon,
    onChange: e => setHackathon(e.target.value),
    placeholder: "HackFest 2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Project Description"), /*#__PURE__*/React.createElement("textarea", {
    className: "hm-textarea",
    value: description,
    onChange: e => setDescription(e.target.value),
    placeholder: "What are you building?"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Team Size"), /*#__PURE__*/React.createElement("select", {
    className: "hm-select",
    value: size,
    onChange: e => setSize(Number(e.target.value))
  }, [2, 3, 4, 5, 6].map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n, " people")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Required Skills"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row"
  }, ["React", "Node.js", "Python", "Machine Learning", "Figma", "Docker", "PostgreSQL"].map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    className: `hm-chip ${manualSkills.includes(s) ? "on" : ""}`,
    style: {
      cursor: "pointer"
    },
    onClick: () => toggleManual(s)
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Or describe what you need"), /*#__PURE__*/React.createElement("textarea", {
    className: "hm-textarea",
    value: need,
    onChange: e => setNeed(e.target.value),
    placeholder: "I need someone who can build the frontend in React, connect APIs and has AI hackathon experience."
  }), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-outline hm-btn-sm",
    style: {
      marginTop: 8
    },
    onClick: runParse
  }, /*#__PURE__*/React.createElement(Sparkles, {
    size: 13
  }), "Parse Requirement")), parsed && /*#__PURE__*/React.createElement("div", {
    className: "hm-card",
    style: {
      padding: 14,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: "var(--brand)",
      marginBottom: 10,
      letterSpacing: "0.04em"
    }
  }, "AI UNDERSTOOD YOUR REQUIREMENT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginBottom: 6
    }
  }, "Required"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row",
    style: {
      marginBottom: 10
    }
  }, parsed.required.map(s => /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    key: s
  }, /*#__PURE__*/React.createElement(Check, {
    size: 11,
    color: "var(--teal)"
  }), s))), parsed.preferred.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginBottom: 6
    }
  }, "Preferred"), /*#__PURE__*/React.createElement("div", {
    className: "hm-req-chip-row"
  }, parsed.preferred.map(s => /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    key: s
  }, /*#__PURE__*/React.createElement(Check, {
    size: 11,
    color: "var(--orange)"
  }), s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-mute)",
      marginTop: 10
    }
  }, "Local keyword parsing for this demo \u2014 not a live AI backend.")));
}

/* ================================================================== */
/*  APP — top-level state machine                                      */
/* ================================================================== */

const AVATARS = ["🧑‍💻", "👩‍💻", "🧑‍🚀", "👨‍🔬", "👩‍🔬", "🧑‍🎨"];
function buildLeaderProfile(email) {
  return {
    name: "You (Team Alpha Lead)",
    email,
    role: "Full Stack Developer",
    avatar: "🧑‍💼",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80"],
    bio: "Building mission-critical platforms with React, TypeScript & Node.js",
    experienceYears: "4 years hackathon experience",
    location: "Bengaluru",
    availability: "Available now",
    skills: [{
      name: "React",
      verification: "assessment",
      score: 88,
      tested: "2 weeks ago",
      proofs: ["Leading frontend on Team Alpha"]
    }, {
      name: "System Design",
      verification: "proof",
      score: null,
      tested: null,
      proofs: ["Architected Team Alpha's service layer"]
    }, {
      name: "Node.js",
      verification: "self",
      score: null,
      tested: null,
      proofs: []
    }],
    experiences: [{
      hackathon: "Smart India Hackathon 2025",
      role: "Team Lead",
      result: "Finalist",
      project: "HackMatch",
      repo: "github.com/you/hackmatch",
      verified: true
    }],
    assessmentHistory: [],
    github: null
  };
}
function buildCandidateProfile(email) {
  return {
    name: "Priya Menon",
    email,
    role: "Backend Developer",
    avatar: "👩‍💻",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    photos: ["https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80"],
    bio: "Passionate about PostgreSQL indexing, Redis caching & clean API design",
    experienceYears: "2.5 years backend development",
    location: "Kochi",
    availability: "Available now",
    skills: [{
      name: "Node.js",
      verification: "self",
      score: null,
      tested: null,
      proofs: []
    }, {
      name: "PostgreSQL",
      verification: "self",
      score: null,
      tested: null,
      proofs: []
    }],
    experiences: [],
    assessmentHistory: [],
    github: null
  };
}

/* ================================================================== */
/*  PHOTO CUSTOMIZER MODAL                                             */
/* ================================================================== */

function PhotoCustomizerModal({
  user,
  onClose,
  onSavePhoto
}) {
  const [tab, setTab] = useState("presets"); // presets | upload | camera | url
  const [preview, setPreview] = useState(user.photoUrl || "");
  const [urlInput, setUrlInput] = useState("");
  const [camStatus, setCamStatus] = useState("idle");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    if (tab === "camera") {
      setCamStatus("starting");
      navigator.mediaDevices?.getUserMedia?.({
        video: {
          width: 400,
          height: 400
        }
      }).then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCamStatus("active");
      }).catch(() => setCamStatus("error"));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCamStatus("idle");
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [tab]);
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }
  function handleSnap() {
    if (!videoRef.current) return;
    try {
      const v = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      const size = Math.min(v.videoWidth, v.videoHeight);
      const sx = (v.videoWidth - size) / 2;
      const sy = (v.videoHeight - size) / 2;
      ctx.drawImage(v, sx, sy, size, size, 0, 0, 400, 400);
      const data = canvas.toDataURL("image/jpeg", 0.9);
      setPreview(data);
    } catch (e) {
      console.error("Snapshot failed:", e);
    }
  }
  function handleApplyUrl() {
    if (urlInput.trim()) {
      setPreview(urlInput.trim());
    }
  }
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Customize Profile Photo",
    icon: /*#__PURE__*/React.createElement(Camera, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: () => {
        onSavePhoto(null);
        onClose();
      }
    }, "Reset to Default"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary",
      onClick: () => {
        onSavePhoto(preview);
        onClose();
      },
      disabled: !preview
    }, "Save Photo"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
      padding: 14,
      background: "var(--panel-2)",
      borderRadius: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: preview,
    fallback: user.avatar,
    name: user.name,
    size: 64,
    style: {
      border: "2px solid var(--brand)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, user.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)"
    }
  }, "This photo appears across TRIBE: your card, team roster, and profile."))), /*#__PURE__*/React.createElement("div", {
    className: "hm-tabbar",
    style: {
      width: "100%",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "presets" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("presets")
  }, "Presets"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "upload" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("upload")
  }, "Upload"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "camera" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("camera")
  }, "Webcam"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "url" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("url")
  }, "Image URL")), tab === "presets" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginBottom: 10
    }
  }, "Select a professional developer portrait:"), /*#__PURE__*/React.createElement("div", {
    className: "hm-preset-grid"
  }, PHOTO_PRESETS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: `hm-preset-item ${preview === p.url ? "on" : ""}`,
    onClick: () => setPreview(p.url)
  }, /*#__PURE__*/React.createElement("img", {
    src: p.url,
    alt: p.label
  }))))), tab === "upload" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "hm-dropzone",
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement(Upload, {
    size: 28,
    color: "var(--brand)",
    style: {
      margin: "0 auto 10px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 4
    }
  }, "Click to upload an image from your device"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "Supports PNG, JPG, WebP"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: "none"
    },
    onChange: handleFileSelect
  }))), tab === "camera" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-cam-preview-box"
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    muted: true,
    playsInline: true
  }), camStatus !== "active" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      color: "var(--text-mute)",
      background: "rgba(0,0,0,0.6)"
    }
  }, camStatus === "starting" ? /*#__PURE__*/React.createElement("span", null, "Starting camera\u2026") : /*#__PURE__*/React.createElement("span", null, "Camera unavailable or permission denied."))), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    style: {
      marginTop: 12
    },
    disabled: camStatus !== "active",
    onClick: handleSnap
  }, /*#__PURE__*/React.createElement(Camera, {
    size: 15
  }), " Capture Photo")), tab === "url" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Paste Image URL"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "https://example.com/photo.jpg",
    value: urlInput,
    onChange: e => setUrlInput(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary",
    onClick: handleApplyUrl
  }, "Preview")))));
}

/* ================================================================== */
/*  ADD MEMBER MODAL                                                   */
/* ================================================================== */

function AddMemberModal({
  team,
  candidates,
  onClose,
  onAddMember
}) {
  const [tab, setTab] = useState("pool"); // pool | custom
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const existingIds = new Set(team.members.map(m => m.id));
  const availableCandidates = candidates.filter(c => !existingIds.has(c.id));
  const filtered = availableCandidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.tags.some(t => t.name.toLowerCase().includes(q));
  });
  function handleAddFromPool(c) {
    const member = {
      id: c.id,
      name: c.name,
      role: c.role,
      avatar: c.avatar,
      photoUrl: c.photoUrl,
      photos: c.photos,
      location: c.location,
      availability: "Active Teammate",
      bio: c.bio,
      experienceYears: c.experienceYears,
      githubUsername: c.githubUsername,
      match: c.match,
      tags: c.tags,
      skills: c.detailedSkills.map(s => ({
        name: s.name,
        verification: s.verification === "self" ? "team" : s.verification,
        score: s.score,
        proofs: s.proofs || []
      })),
      detailedSkills: c.detailedSkills,
      hackathons: c.hackathons || [],
      projects: c.projects || [],
      vouches: c.vouches || 0,
      vouchTags: c.vouchTags || [],
      assessmentHistory: [{
        skill: c.tags[0]?.name || "Core",
        score: c.assessmentAvg || 88,
        passed: true,
        date: "Recently",
        proctored: true,
        integrityScore: 98
      }],
      github: {
        username: c.githubUsername || c.name.toLowerCase().replace(/\s+/g, "-"),
        stats: {
          totalRepos: 12,
          totalStars: 84,
          totalForks: 18,
          activeProjectsCount: 4,
          recentActivityEstimate: 35
        },
        topRepos: (c.projects || []).map(p => ({
          name: p.split(" — ")[0],
          description: "Production hackathon repository",
          language: c.tags[0]?.name || "Code",
          stars: 42,
          url: "https://github.com"
        }))
      }
    };
    onAddMember(member);
    onClose();
  }
  function handleAddCustom() {
    if (!name.trim()) return;
    const skillList = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    const member = {
      id: "m-" + Date.now(),
      name: name.trim(),
      role: role.trim() || "Teammate",
      avatar: "🧑‍💻",
      photoUrl: photoUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      photos: [photoUrl.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"],
      location: location.trim() || "Remote",
      availability: "Active Teammate",
      bio: "Joined " + team.name + " to build for " + team.hackathon,
      experienceYears: "2+ years experience",
      githubUsername: name.trim().toLowerCase().replace(/\s+/g, "-"),
      match: 92,
      tags: skillList.map(s => ({
        name: s,
        level: "team"
      })),
      skills: skillList.map(s => ({
        name: s,
        verification: "team",
        score: 90,
        proofs: ["Invited to team"]
      })),
      detailedSkills: skillList.map(s => ({
        name: s,
        verification: "team",
        score: 90,
        proofs: ["Invited to team"]
      })),
      hackathons: [{
        name: team.hackathon,
        role: role.trim() || "Teammate",
        result: "Active",
        icon: "🚀"
      }],
      projects: ["team-contribution — GitHub"],
      vouches: 1,
      vouchTags: ["Team invite"],
      assessmentHistory: [],
      github: {
        username: name.trim().toLowerCase().replace(/\s+/g, "-"),
        stats: {
          totalRepos: 6,
          totalStars: 24,
          totalForks: 5,
          activeProjectsCount: 2,
          recentActivityEstimate: 15
        },
        topRepos: []
      }
    };
    onAddMember(member);
    onClose();
  }
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: `Add Member to ${team.name}`,
    icon: /*#__PURE__*/React.createElement(UserPlus, {
      size: 18,
      color: "var(--brand)"
    }),
    width: 560,
    footer: /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-tabbar",
    style: {
      width: "100%",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "pool" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("pool")
  }, "From Talent Pool (", availableCandidates.length, ")"), /*#__PURE__*/React.createElement("div", {
    className: `hm-tabbar-item ${tab === "custom" ? "on" : ""}`,
    style: {
      flex: 1,
      textAlign: "center"
    },
    onClick: () => setTab("custom")
  }, "Custom Teammate")), tab === "pool" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "Search by name, role, or skill...",
    value: search,
    onChange: e => setSearch(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 340,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, filtered.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "hm-card",
    style: {
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: c.photoUrl,
    fallback: c.avatar,
    name: c.name,
    size: 42
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, c.role, " \xB7 ", c.location), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 4,
      flexWrap: "wrap"
    }
  }, c.tags.slice(0, 3).map(t => /*#__PURE__*/React.createElement("span", {
    key: t.name,
    className: "hm-chip",
    style: {
      fontSize: 10.5,
      padding: "2px 6px"
    }
  }, t.name)))), /*#__PURE__*/React.createElement(MatchRing, {
    value: c.match,
    size: 38
  }), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-sm",
    onClick: () => handleAddFromPool(c)
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 13
  }), " Add"))), filtered.length === 0 && /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Users, {
      size: 32
    }),
    title: "No candidates found",
    sub: "All candidates are already in the team or match the search query."
  }))), tab === "custom" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Full Name"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "e.g. Sanya Gupta",
    value: name,
    onChange: e => setName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Role"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "e.g. Full Stack Developer",
    value: role,
    onChange: e => setRole(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Location"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "e.g. Bengaluru",
    value: location,
    onChange: e => setLocation(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Skills (comma-separated)"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "React, Python, Docker",
    value: skillsStr,
    onChange: e => setSkillsStr(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-field"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-label"
  }, "Profile Photo URL (optional)"), /*#__PURE__*/React.createElement("input", {
    className: "hm-input",
    placeholder: "https://images.unsplash.com/...",
    value: photoUrl,
    onChange: e => setPhotoUrl(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-primary hm-btn-block",
    disabled: !name.trim(),
    onClick: handleAddCustom
  }, /*#__PURE__*/React.createElement(UserPlus, {
    size: 14
  }), " Add Teammate")));
}

/* ================================================================== */
/*  REMOVE MEMBER MODAL                                                */
/* ================================================================== */

function RemoveMemberModal({
  member,
  team,
  onClose,
  onConfirm
}) {
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "Remove Member",
    icon: /*#__PURE__*/React.createElement(AlertTriangle, {
      size: 18,
      color: "var(--red)"
    }),
    width: 440,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-danger",
      onClick: () => {
        onConfirm(member);
        onClose();
      }
    }, /*#__PURE__*/React.createElement(UserMinus, {
      size: 14
    }), " Remove Member"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: member.photoUrl,
    fallback: member.avatar,
    name: member.name,
    size: 50
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, member.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)"
    }
  }, member.role))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      lineHeight: 1.6
    }
  }, "Are you sure you want to remove ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text)"
    }
  }, member.name), " from ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--brand)"
    }
  }, team.name), "? Their skill coverage contributions will be recalculated."));
}

/* ================================================================== */
/*  MEMBER FULL PROFILE MODAL                                          */
/* ================================================================== */

function MemberProfileModal({
  member,
  team,
  onClose,
  onRemoveMember
}) {
  const [tab, setTab] = useState("skills"); // skills | assessments | github | experience | vouches

  const trust = useMemo(() => {
    return computeTrustScore({
      skills: member.detailedSkills || member.skills || [],
      hackathonsCount: (member.hackathons?.length || 0) + (member.projects?.length || 0),
      vouches: member.vouches || 0
    });
  }, [member]);
  const gh = member.github;
  return /*#__PURE__*/React.createElement(Modal, {
    onClose: onClose,
    title: "",
    width: 680,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, onRemoveMember && /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-danger hm-btn-sm",
      onClick: () => {
        onRemoveMember(member);
      }
    }, /*#__PURE__*/React.createElement(UserMinus, {
      size: 13
    }), " Remove from Team"), /*#__PURE__*/React.createElement("button", {
      className: "hm-btn hm-btn-primary hm-btn-sm",
      onClick: onClose
    }, "Close Profile"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-member-profile-head"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: member.photoUrl,
    fallback: member.avatar,
    name: member.name,
    size: 70,
    style: {
      border: "2px solid var(--brand)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 180
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 22,
      fontWeight: 700
    }
  }, member.name), /*#__PURE__*/React.createElement("span", {
    className: "hm-badge",
    style: {
      color: "var(--teal)",
      background: "rgba(20,232,196,0.14)"
    }
  }, /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 12
  }), " Active Teammate")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-dim)",
      marginTop: 2
    }
  }, member.role, " \xB7 ", member.location || "Bengaluru"), member.experienceYears && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginTop: 2
    }
  }, member.experienceYears)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-mute)",
      fontWeight: 700
    }
  }, "TRUST SCORE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: 26,
      fontWeight: 800,
      color: "var(--brand)"
    }
  }, trust.score))), member.bio && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 22px",
      background: "rgba(255,255,255,0.02)",
      borderBottom: "1px solid var(--line-soft)",
      fontSize: 12.5,
      fontStyle: "italic",
      color: "var(--text-dim)"
    }
  }, "\"", member.bio, "\""), /*#__PURE__*/React.createElement("div", {
    className: "hm-member-profile-tabbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: `hm-member-profile-tab ${tab === "skills" ? "on" : ""}`,
    onClick: () => setTab("skills")
  }, "Skills (", member.skills?.length || 0, ")"), /*#__PURE__*/React.createElement("div", {
    className: `hm-member-profile-tab ${tab === "assessments" ? "on" : ""}`,
    onClick: () => setTab("assessments")
  }, "Proctored Tests (", member.assessmentHistory?.length || 0, ")"), /*#__PURE__*/React.createElement("div", {
    className: `hm-member-profile-tab ${tab === "github" ? "on" : ""}`,
    onClick: () => setTab("github")
  }, "GitHub & Repos"), /*#__PURE__*/React.createElement("div", {
    className: `hm-member-profile-tab ${tab === "experience" ? "on" : ""}`,
    onClick: () => setTab("experience")
  }, "Hackathons & Projects"), /*#__PURE__*/React.createElement("div", {
    className: `hm-member-profile-tab ${tab === "vouches" ? "on" : ""}`,
    onClick: () => setTab("vouches")
  }, "Vouches (", member.vouches || 0, ")")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 22px"
    }
  }, tab === "skills" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, (member.detailedSkills || member.skills || []).map((s, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    className: "hm-card",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, s.name), s.score != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)",
      marginLeft: 8
    }
  }, "\xB7 ", s.score, "% score")), /*#__PURE__*/React.createElement(VerifyBadge, {
    level: s.verification || "team",
    size: "sm"
  })), s.proofs && s.proofs.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, s.proofs.map((p, pi) => /*#__PURE__*/React.createElement("div", {
    key: pi,
    className: "hm-card-proof-item",
    style: {
      fontSize: 11.5
    }
  }, /*#__PURE__*/React.createElement(Check, {
    size: 12,
    color: "var(--teal)"
  }), " ", p)))))), tab === "assessments" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, (member.assessmentHistory || []).map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card",
    style: {
      padding: "12px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5
    }
  }, a.skill, " Assessment"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)",
      marginTop: 2
    }
  }, "Taken: ", a.date, " \xB7 Status: ", a.passed ? "Passed" : "Did not pass")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 800,
      fontSize: 16,
      color: a.passed ? "var(--teal)" : "var(--orange)"
    }
  }, a.score, "%"), /*#__PURE__*/React.createElement("span", {
    className: "hm-badge",
    style: {
      color: "var(--teal)",
      background: "rgba(20,232,196,0.12)",
      fontSize: 10.5,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(ShieldCheck, {
    size: 11
  }), " Proctor-Verified (Integrity ", a.integrityScore || 98, "%)")))), (!member.assessmentHistory || member.assessmentHistory.length === 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "28px 10px",
      color: "var(--text-mute)",
      fontSize: 13
    }
  }, "No proctored assessments taken yet."))), tab === "github" && /*#__PURE__*/React.createElement("div", null, gh ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-grid",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(FolderGit2, {
    size: 12
  }), " REPOS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 20
    }
  }, gh.stats.totalRepos)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Zap, {
    size: 12
  }), " COMMITS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 20
    }
  }, gh.stats.recentActivityEstimate, "+")), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Award, {
    size: 12
  }), " STARS"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 20
    }
  }, gh.stats.totalStars)), /*#__PURE__*/React.createElement("div", {
    className: "hm-card hm-statcard",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-label"
  }, /*#__PURE__*/React.createElement(Rocket, {
    size: 12
  }), " ACTIVE"), /*#__PURE__*/React.createElement("div", {
    className: "hm-statcard-val",
    style: {
      fontSize: 20
    }
  }, gh.stats.activeProjectsCount))), /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "FEATURED REPOSITORIES"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, gh.topRepos.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.name,
    className: "hm-card",
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: r.url,
    target: "_blank",
    rel: "noreferrer",
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: "var(--text)",
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, r.name, " ", /*#__PURE__*/React.createElement(ExternalLink, {
    size: 11,
    color: "var(--text-mute)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)",
      marginTop: 2
    }
  }, r.language), r.description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-dim)",
      marginTop: 4
    }
  }, r.description)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      color: "var(--text-dim)"
    }
  }, "\u2605 ", r.stars)))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "28px 10px",
      color: "var(--text-mute)",
      fontSize: 13
    }
  }, "No GitHub account connected yet.")), tab === "experience" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "HACKATHONS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, (member.hackathons || []).map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card",
    style: {
      padding: "10px 14px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, h.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-mute)"
    }
  }, "Role: ", h.role)), /*#__PURE__*/React.createElement("span", {
    className: "hm-chip",
    style: {
      color: h.result === "Winner" ? "var(--teal)" : "var(--brand)"
    }
  }, h.icon || "⭐", " ", h.result))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-section-title"
  }, "PROJECTS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, (member.projects || []).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-card",
    style: {
      padding: "10px 14px",
      fontSize: 12.5,
      color: "var(--text-dim)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(FolderGit2, {
    size: 13,
    color: "var(--teal)"
  }), " ", p))))), tab === "vouches" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "rgba(255,46,126,0.12)",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Award, {
    size: 22,
    color: "var(--brand)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 16
    }
  }, member.vouches || 0, " Peer Endorsements"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-mute)"
    }
  }, "Verified teammates who confirmed technical ownership."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, (member.vouchTags || []).map((vt, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "hm-badge",
    style: {
      color: "var(--teal)",
      background: "rgba(20,232,196,0.12)",
      padding: "6px 12px",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(CheckCircle2, {
    size: 13
  }), " ", vt))))));
}
function App() {
  // One-time read of any saved demo session (survives refreshes). Reset Demo clears this.
  const saved = useMemo(() => loadSavedState(), []);
  const [auth, setAuth] = useState(saved?.auth || "login"); // login | signup | onboarding | app
  const [userKind, setUserKind] = useState(saved?.userKind || "leader");
  const [profile, setProfile] = useState(() => {
    if (!saved?.profile) return null;
    const p = {
      ...saved.profile
    };
    if (!p.photoUrl) {
      p.photoUrl = p.role?.toLowerCase().includes("lead") || p.name?.toLowerCase().includes("lead") ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80";
    }
    if (!p.photos || p.photos.length === 0) {
      p.photos = [p.photoUrl];
    }
    return p;
  });
  const [pendingSignup, setPendingSignup] = useState(null);
  const [screen, setScreen] = useState(saved?.screen || "dashboard");
  const [team, setTeam] = useState(saved?.team || makeDefaultTeam());
  const [filterSkill, setFilterSkill] = useState(null);
  const [connected, setConnected] = useState(saved?.connected || {});
  const [matches, setMatches] = useState(saved?.matches || []);
  const [vetting, setVetting] = useState(saved?.vetting || []);
  // IDs the user has already passed on, so a refresh doesn't re-serve them in Discover.
  const [passedIds, setPassedIds] = useState(saved?.passedIds || []);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [coverageFlash, setCoverageFlash] = useState("");
  const [proofModal, setProofModal] = useState(null);
  const [breakdownModal, setBreakdownModal] = useState(null);
  const [matchModal, setMatchModal] = useState(null);
  const [challengeChooser, setChallengeChooser] = useState(null);
  const [quiz, setQuiz] = useState(null); // {mode:'team'|'self', skill, candidate?}
  const [verifyMethod, setVerifyMethod] = useState(null);
  const [proofLink, setProofLink] = useState(null);
  const [credentialVerify, setCredentialVerify] = useState(null);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);
  const [memberProfileModal, setMemberProfileModal] = useState(null);
  const {
    toasts,
    push
  } = useToasts();

  // Deck is derived, not stored directly — excludes anyone already passed on or
  // connected with, so a refresh (restored from localStorage) doesn't re-serve them.
  const deck = useMemo(() => {
    return CANDIDATES.filter(c => {
      if (passedIds.includes(c.id) || connected[c.id]) return false;
      if (filterSkill) return c.requirements.includes(filterSkill) || c.tags.some(t => t.name === filterSkill);
      return true;
    });
  }, [filterSkill, passedIds, connected]);

  // Persist the important demo state on every change. Toasts and transient UI
  // (modals, coverage-flash) are intentionally excluded — only durable progress
  // is saved, so a refresh restores skills, verification, team, and matches.
  useEffect(() => {
    saveState({
      auth,
      userKind,
      profile,
      screen,
      team,
      connected,
      matches,
      vetting,
      passedIds
    });
  }, [auth, userKind, profile, screen, team, connected, matches, vetting, passedIds]);
  function resetDemo() {
    if (!window.confirm("Reset all demo data? This clears your progress and restores the initial demo state.")) return;
    clearSavedState();
    window.location.reload();
  }
  function handleLogin(kind, email) {
    setUserKind(kind);
    setProfile(kind === "leader" ? buildLeaderProfile(email) : buildCandidateProfile(email));
    setAuth("app");
    setScreen("dashboard");
    push(`Welcome back, ${kind === "leader" ? "Team Lead" : "Priya"}.`);
  }
  function handleSignup(data) {
    setUserKind("candidate");
    setPendingSignup(data);
    setProfile({
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      photoUrl: PHOTO_PRESETS[Math.floor(Math.random() * PHOTO_PRESETS.length)].url,
      photos: [PHOTO_PRESETS[Math.floor(Math.random() * PHOTO_PRESETS.length)].url],
      location: data.location,
      availability: data.availability,
      skills: [],
      experiences: [],
      assessmentHistory: [],
      github: null
    });
    setAuth("onboarding");
  }
  function handleOnboardingComplete({
    bio,
    skills
  }) {
    setProfile(p => ({
      ...p,
      bio,
      skills
    }));
    setAuth("app");
    setScreen("dashboard");
    push("Profile created. Verify your skills to start matching.");
  }
  function handleSavePhoto(newUrl) {
    setProfile(p => ({
      ...p,
      photoUrl: newUrl,
      photos: newUrl ? [newUrl] : []
    }));
    push(newUrl ? "Profile photo updated!" : "Profile photo reset to default.");
  }
  function handleAddMember(newMember) {
    setTeam(t => {
      const key = skillToArea(newMember.tags?.[0]?.name || "Backend", newMember.role);
      const before = t.coverage[key] ?? 30;
      const newVal = Math.min(98, before + 35);
      setCoverageFlash(`${key}: ${before}% → ${newVal}%`);
      return {
        ...t,
        members: [...t.members, newMember],
        coverage: {
          ...t.coverage,
          [key]: newVal
        }
      };
    });
    push(`${newMember.name} joined ${team.name}!`, /*#__PURE__*/React.createElement(Sparkles, {
      size: 16,
      color: "var(--brand)"
    }));
  }
  function handleConfirmRemoveMember(member) {
    setTeam(t => {
      const key = skillToArea(member.tags?.[0]?.name || "Backend", member.role);
      const before = t.coverage[key] ?? 60;
      const newVal = Math.max(20, before - 25);
      setCoverageFlash(`${key}: ${before}% → ${newVal}%`);
      return {
        ...t,
        members: t.members.filter(m => m.id !== member.id),
        coverage: {
          ...t.coverage,
          [key]: newVal
        }
      };
    });
    push(`${member.name} removed from ${team.name}.`);
  }
  function handleLogout() {
    setAuth("login");
    setProfile(null);
    setScreen("dashboard");
  }
  function findSkill(skill) {
    setFilterSkill(skill);
    setScreen("discover");
  }
  function handleDecision(c, dir) {
    setSwipeHistory(h => [...h, {
      candidate: c,
      dir
    }]);
    if (dir === "connect") {
      setConnected(cn => ({
        ...cn,
        [c.id]: true
      }));
      setMatches(ms => ms.some(m => m.id === c.id) ? ms : [...ms, c]);
      setMatchModal(c);
    } else {
      setPassedIds(ids => ids.includes(c.id) ? ids : [...ids, c.id]);
      push(`Passed on ${c.name}.`, /*#__PURE__*/React.createElement(X, {
        size: 16,
        color: "var(--text-mute)"
      }));
    }
  }
  function handleRewind() {
    if (swipeHistory.length === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(h => h.slice(0, -1));
    if (last.dir === "connect") {
      setConnected(cn => {
        const next = {
          ...cn
        };
        delete next[last.candidate.id];
        return next;
      });
      setMatches(ms => ms.filter(m => m.id !== last.candidate.id));
    } else {
      setPassedIds(ids => ids.filter(id => id !== last.candidate.id));
    }
    push(`Rewound swipe on ${last.candidate.name}.`, /*#__PURE__*/React.createElement(RotateCcw, {
      size: 15,
      color: "var(--teal)"
    }));
  }
  function handleConnectFromProof(c) {
    setConnected(cn => ({
      ...cn,
      [c.id]: true
    }));
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
    setQuiz({
      mode: "team",
      skill,
      candidate: c,
      proctored: true
    });
  }
  function finishQuiz(score, passed, integrity) {
    if (quiz.mode === "team") {
      const c = quiz.candidate;
      setMatches(ms => ms.filter(m => m.id !== c.id));
      setVetting(v => [...v.filter(it => it.c.id !== c.id), {
        c,
        skill: quiz.skill,
        score,
        pass: passed
      }]);
      setQuiz(null);
      push(passed ? `${c.name} passed the ${quiz.skill} challenge — sent to Vetting.` : `${c.name} scored below the bar on ${quiz.skill}.`);
      setScreen("vetting");
    } else {
      // self-assessment (optionally proctored)
      const historyEntry = {
        skill: quiz.skill,
        score,
        passed,
        date: new Date().toLocaleDateString(),
        proctored: !!integrity?.proctored,
        integrityScore: integrity?.integrityScore ?? null
      };
      setProfile(p => ({
        ...p,
        skills: p.skills.map(s => s.name === quiz.skill ? passed ? {
          ...s,
          verification: "assessment",
          score,
          tested: "just now",
          proctored: !!integrity?.proctored
        } : {
          ...s,
          score
        } : s),
        assessmentHistory: [...(p.assessmentHistory || []), historyEntry]
      }));
      setQuiz(null);
      const integrityNote = integrity?.proctored ? ` · integrity score ${integrity.integrityScore}${integrity.eventCount ? ` (${integrity.eventCount} flag${integrity.eventCount > 1 ? "s" : ""})` : ""}` : "";
      push(passed ? `${quiz.skill} — Assessment Verified (${score}%)${integrityNote}.` : `${quiz.skill} assessment not passed (${score}%)${integrityNote}. Try again anytime.`, passed ? undefined : /*#__PURE__*/React.createElement(AlertTriangle, {
        size: 16,
        color: "var(--orange)"
      }));
    }
  }
  function acceptToTeam(item) {
    const c = item.c;
    const photo = c.photoUrl || typeof CANDIDATES !== "undefined" && CANDIDATES.find(cand => cand.id === c.id)?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
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
      assessmentHistory: [...(c.assessmentHistory || []), {
        skill: item.skill,
        score: item.score,
        passed: item.pass,
        date: "Today",
        proctored: true,
        integrityScore: item.integrityScore || 98
      }],
      github: c.github || {
        username: c.githubUsername || c.name.toLowerCase().replace(/\s+/g, "-"),
        stats: {
          totalRepos: 10,
          totalStars: 64,
          totalForks: 14,
          activeProjectsCount: 3,
          recentActivityEstimate: 28
        },
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
      return {
        ...t,
        members: [...t.members, newMember],
        coverage: {
          ...t.coverage,
          [key]: newVal
        }
      };
    });
    setVetting(v => v.filter(it => it.c.id !== c.id));
    push(`${c.name} joined ${team.name}!`, /*#__PURE__*/React.createElement(Sparkles, {
      size: 16,
      color: "var(--brand)"
    }));
    setScreen("dashboard");
  }
  function retest(c) {
    setChallengeChooser(c);
  }
  function handleAddSkill(name) {
    setProfile(p => {
      if (p.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return p;
      return {
        ...p,
        skills: [...p.skills, {
          name,
          verification: "self",
          score: null,
          tested: null,
          proofs: []
        }]
      };
    });
    push(`${name} added — Claimed.`);
  }
  function handleAddExperience(exp) {
    setProfile(p => ({
      ...p,
      experiences: [...p.experiences, exp]
    }));
    push(`${exp.hackathon} added to your profile.`);
  }
  function handleVerified(skillName, method, evidence) {
    const level = method === "github" ? "github" : "proof";
    const proofText = evidence?.summary || (method === "github" ? "Repository linked & checked" : "Project evidence linked & checked");
    setProfile(p => ({
      ...p,
      skills: p.skills.map(s => s.name === skillName ? {
        ...s,
        verification: level,
        proofs: [...(s.proofs || []), proofText]
      } : s)
    }));
    setProofLink(null);
    push(`${skillName} — ${level === "github" ? "GitHub Verified" : "Project Verified"}.`);
  }
  function handleSaveGithub(analysis) {
    setProfile(p => ({
      ...p,
      github: {
        username: analysis.username,
        connectedAt: new Date().toISOString(),
        analysis
      }
    }));
    push(analysis.fallback ? `GitHub connection simulated for local demo (@${analysis.username}).` : `GitHub connected — @${analysis.username} analyzed.`, /*#__PURE__*/React.createElement(Github, {
      size: 16,
      color: analysis.fallback ? "var(--orange)" : "var(--purple)"
    }));
  }
  function handleDisconnectGithub() {
    setProfile(p => {
      const next = {
        ...p
      };
      delete next.github;
      return next;
    });
    push("GitHub disconnected.");
  }
  function handleUseGithubEvidence(skillName, repo) {
    const evidenceText = `GitHub: ${repo.name} (${repo.language || "multiple languages"}, ★${repo.stars ?? 0}, updated ${relativeTime(repo.updatedAt)})`;
    setProfile(p => ({
      ...p,
      skills: p.skills.map(s => s.name === skillName ? {
        ...s,
        verification: "github",
        proofs: [...(s.proofs || []), evidenceText]
      } : s)
    }));
    push(`${skillName} — GitHub Verified.`, /*#__PURE__*/React.createElement(Github, {
      size: 16,
      color: "var(--purple)"
    }));
  }
  function handleCredentialVerified() {
    const exp = credentialVerify;
    setProfile(p => ({
      ...p,
      experiences: p.experiences.map(e => e === exp ? {
        ...e,
        verified: true
      } : e)
    }));
    setCredentialVerify(null);
    push(`${exp.hackathon} credential verified.`);
  }
  function handleCreateTeam(data) {
    const coverage = {};
    ["Frontend", "Backend", "ML/AI", "UI/UX", "DevOps"].forEach(k => {
      coverage[k] = 15;
    });
    data.requiredSkills.forEach(s => {
      coverage[skillToArea(s, "")] = 35;
    });
    setTeam({
      name: data.name,
      hackathon: data.hackathon,
      description: data.description || "No description yet.",
      requiredSkills: data.requiredSkills,
      members: userKind === "leader" ? [] : [],
      coverage
    });
    setCreateTeamOpen(false);
    setMatches([]);
    setVetting([]);
    push(`${data.name} created. Head to Discover to find your first teammate.`);
    setScreen("dashboard");
  }
  const counts = {
    matches: matches.length,
    vetting: vetting.length
  };
  if (auth === "login") return /*#__PURE__*/React.createElement("div", {
    className: "hm-root"
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: handleLogin,
    onGoSignup: () => setAuth("signup"),
    onResetDemo: resetDemo
  }));
  if (auth === "signup") return /*#__PURE__*/React.createElement("div", {
    className: "hm-root"
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(SignupScreen, {
    onSignup: handleSignup,
    onGoLogin: () => setAuth("login")
  }));
  if (auth === "onboarding") return /*#__PURE__*/React.createElement("div", {
    className: "hm-root"
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(Onboarding, {
    profile: profile,
    onComplete: handleOnboardingComplete
  }));
  const currentTitle = NAV_ITEMS.find(n => n.id === screen)?.label || "TRIBE";
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-root"
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(Toast, {
    toasts: toasts
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-shell"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    screen: screen,
    setScreen: setScreen,
    counts: counts,
    user: profile,
    onLogout: handleLogout,
    onResetDemo: resetDemo
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-main"
  }, /*#__PURE__*/React.createElement(MobileChrome, {
    screen: screen,
    setScreen: setScreen,
    counts: counts,
    user: profile,
    onLogout: handleLogout,
    onResetDemo: resetDemo,
    title: currentTitle
  }), /*#__PURE__*/React.createElement("div", {
    className: "hm-content"
  }, screen === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    team: team,
    userKind: userKind,
    profile: profile,
    onFindSkill: findSkill,
    matchesCount: matches.length,
    vettingCount: vetting.length,
    coverageFlash: coverageFlash,
    onOpenMemberProfile: m => setMemberProfileModal(m),
    onOpenAddMember: () => setAddMemberModalOpen(true)
  }), screen === "discover" && /*#__PURE__*/React.createElement(Discover, {
    deck: deck,
    filterSkill: filterSkill,
    clearFilter: () => setFilterSkill(null),
    onDecision: dir => {
      const c = deck[0];
      if (c) handleDecision(c, dir);
    },
    onViewProof: c => setProofModal(c),
    onRewind: handleRewind,
    canRewind: swipeHistory.length > 0
  }), screen === "matches" && /*#__PURE__*/React.createElement(MatchesScreen, {
    matches: matches,
    onSendChallenge: openChallengeFor,
    onViewProof: c => setProofModal(c)
  }), screen === "vetting" && /*#__PURE__*/React.createElement(VettingInbox, {
    items: vetting,
    onAccept: acceptToTeam,
    onRetest: retest
  }), screen === "rankings" && /*#__PURE__*/React.createElement(Rankings, {
    team: team,
    profile: profile
  }), screen === "team" && /*#__PURE__*/React.createElement(MyTeam, {
    team: team,
    onOpenAddMember: () => setAddMemberModalOpen(true),
    onOpenMemberProfile: m => setMemberProfileModal(m),
    onRemoveMember: m => setRemoveMemberTarget(m)
  }), screen === "assessments" && /*#__PURE__*/React.createElement(AssessmentsPage, {
    profile: profile,
    onStart: skill => setQuiz({
      mode: "self",
      skill,
      proctored: true
    }),
    onStartProctored: skill => setQuiz({
      mode: "self",
      skill,
      proctored: true
    })
  }), screen === "profile" && /*#__PURE__*/React.createElement(MyProfile, {
    profile: profile,
    teamName: userKind === "leader" ? team.name : null,
    onAddSkill: handleAddSkill,
    onOpenVerify: skillName => setVerifyMethod(skillName),
    onAddExperience: handleAddExperience,
    onOpenCredentialVerify: exp => setCredentialVerify(exp),
    onSaveGithub: handleSaveGithub,
    onDisconnectGithub: handleDisconnectGithub,
    onUseGithubEvidence: handleUseGithubEvidence,
    onResetDemo: resetDemo,
    onOpenPhotoCustomizer: () => setPhotoModalOpen(true)
  }), userKind === "leader" && screen === "dashboard" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hm-btn hm-btn-ghost hm-btn-sm",
    onClick: () => setCreateTeamOpen(true)
  }, /*#__PURE__*/React.createElement(Plus, {
    size: 13
  }), "New Team"))))), proofModal && /*#__PURE__*/React.createElement(ProofModal, {
    c: proofModal,
    onClose: () => setProofModal(null),
    connected: !!connected[proofModal.id],
    onConnect: handleConnectFromProof,
    onOpenBreakdown: c => {
      setBreakdownModal(c);
    }
  }), breakdownModal && /*#__PURE__*/React.createElement(BreakdownModal, {
    c: breakdownModal,
    onClose: () => setBreakdownModal(null)
  }), matchModal && /*#__PURE__*/React.createElement(MatchModal, {
    c: matchModal,
    onClose: () => setMatchModal(null),
    onStartChallenge: openChallengeFor
  }), challengeChooser && /*#__PURE__*/React.createElement(ChallengeChooser, {
    c: challengeChooser,
    onClose: () => setChallengeChooser(null),
    onPick: pickChallengeSkill
  }), quiz && quiz.proctored && /*#__PURE__*/React.createElement(ProctoredQuizModal, {
    skill: quiz.skill,
    mode: quiz.mode,
    candidate: quiz.candidate,
    title: quiz.mode === "team" ? `${team.name} Challenge — ${quiz.skill}` : `${quiz.skill} Assessment`,
    onClose: () => setQuiz(null),
    onFinish: finishQuiz
  }), quiz && !quiz.proctored && /*#__PURE__*/React.createElement(QuizModal, {
    title: quiz.mode === "team" ? `${team.name} Challenge — ${quiz.skill}` : `${quiz.skill} Assessment`,
    skill: quiz.skill,
    mode: quiz.mode,
    onClose: () => setQuiz(null),
    onFinish: finishQuiz
  }), verifyMethod && /*#__PURE__*/React.createElement(VerifyMethodModal, {
    skill: verifyMethod,
    onClose: () => setVerifyMethod(null),
    onChooseAssessment: () => {
      const s = verifyMethod;
      setVerifyMethod(null);
      setQuiz({
        mode: "self",
        skill: s,
        proctored: true
      });
    },
    onChooseProof: kind => {
      const s = verifyMethod;
      setVerifyMethod(null);
      setProofLink({
        skill: s,
        kind
      });
    }
  }), proofLink && /*#__PURE__*/React.createElement(ProofLinkModal, {
    kind: proofLink.kind,
    skill: proofLink.skill,
    onClose: () => setProofLink(null),
    onVerified: (_url, evidence) => handleVerified(proofLink.skill, proofLink.kind, evidence)
  }), credentialVerify && /*#__PURE__*/React.createElement(CredentialVerifyModal, {
    exp: credentialVerify,
    onClose: () => setCredentialVerify(null),
    onVerified: handleCredentialVerified
  }), createTeamOpen && /*#__PURE__*/React.createElement(CreateTeamModal, {
    onClose: () => setCreateTeamOpen(false),
    onCreate: handleCreateTeam
  }), photoModalOpen && /*#__PURE__*/React.createElement(PhotoCustomizerModal, {
    user: profile,
    onClose: () => setPhotoModalOpen(false),
    onSavePhoto: handleSavePhoto
  }), memberProfileModal && /*#__PURE__*/React.createElement(MemberProfileModal, {
    member: memberProfileModal,
    team: team,
    onClose: () => setMemberProfileModal(null),
    onRemoveMember: m => {
      setMemberProfileModal(null);
      setRemoveMemberTarget(m);
    }
  }), addMemberModalOpen && /*#__PURE__*/React.createElement(AddMemberModal, {
    team: team,
    candidates: CANDIDATES,
    onClose: () => setAddMemberModalOpen(false),
    onAddMember: handleAddMember
  }), removeMemberTarget && /*#__PURE__*/React.createElement(RemoveMemberModal, {
    member: removeMemberTarget,
    team: team,
    onClose: () => setRemoveMemberTarget(null),
    onConfirm: handleConfirmRemoveMember
  }));
}

/* ================================================================== */
/*  MOUNT — plain ReactDOM.createRoot, no build step required.         */
/*  A small error boundary keeps one bad render from producing a       */
/*  blank white screen with no explanation during the live demo.       */
/* ================================================================== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidCatch(error, info) {
    console.error("TRIBE crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E12",
          color: "#EDEFF3",
          fontFamily: "Inter, sans-serif",
          padding: 24
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          maxWidth: 480,
          textAlign: "center"
        }
      }, /*#__PURE__*/React.createElement("h1", {
        style: {
          fontSize: 20,
          marginBottom: 12
        }
      }, "Something went wrong"), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: 13,
          color: "#A6ADBB",
          marginBottom: 18,
          lineHeight: 1.6
        }
      }, "TRIBE hit an unexpected error. Your saved demo data (if any) is untouched. Try reloading \u2014 if it keeps happening, use Reset Demo Data from the login screen."), /*#__PURE__*/React.createElement("pre", {
        style: {
          fontSize: 11,
          color: "#FF6B6B",
          background: "#12161D",
          padding: 12,
          borderRadius: 8,
          textAlign: "left",
          overflow: "auto",
          maxHeight: 160
        }
      }, String(this.state.error?.message || this.state.error)), /*#__PURE__*/React.createElement("button", {
        style: {
          marginTop: 18,
          padding: "10px 18px",
          borderRadius: 10,
          border: "none",
          background: "#FF2E7E",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer"
        },
        onClick: () => window.location.reload()
      }, "Reload")));
    }
    return this.props.children;
  }
}
const mountEl = document.getElementById("root");
if (!mountEl) {
  throw new Error("TRIBE: could not find #root element to mount into.");
}
createRoot(mountEl).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));