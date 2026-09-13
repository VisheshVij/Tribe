/* ==================================================================
   TRIBE — GitHub verification service
   --------------------------------------------------------------
   Talks to the real, public GitHub REST API (no auth token, no
   server required — api.github.com allows unauthenticated CORS
   reads of public data). Used to turn a claimed skill into
   evidence: real repo counts, languages, stars, and recent push
   activity for a given username.

   Every exported function degrades gracefully. On a network
   failure, a 404, or a rate limit (60 req/hr unauthenticated), it
   returns clearly-labeled fallback/demo data (`fallback: true`)
   instead of throwing — the UI is responsible for showing a
   "simulated for local demo" banner whenever that flag is set.
   ================================================================== */

(function (global) {
  "use strict";

const API = "https://api.github.com";

// Keyword heuristic used to flag a repo as "ML-related" from its
// public metadata (description / topics / primary language) only —
// this is a best-effort signal, not a guarantee.
const ML_HINTS = [
  "machine-learning", "machine learning", "deep-learning", "deep learning",
  "pytorch", "tensorflow", "scikit-learn", "sklearn", "keras", "nlp",
  "computer-vision", "computer vision", "neural-network", "neural network",
  "artificial-intelligence", "artificial intelligence", "llm", "transformer",
  "cnn", "opencv", " ai-", "-ai", " ai ",
];

/** Parses "github.com/owner/repo", "owner/repo", "@owner", or a bare "owner" string. */
function parseGithubInput(input) {
  if (!input) return null;
  const s = String(input).trim();
  let m = s.match(/github\.com\/([^/\s?#]+)\/?([^/\s?#]+)?/i);
  if (!m) m = s.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (!m) m = s.match(/^@?([A-Za-z0-9-]+)$/);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2] ? m[2].replace(/\.git$/, "") : null;
  return { owner, repo };
}

function looksLikeML(repo) {
  const hay = ` ${repo.description || ""} ${(repo.topics || []).join(" ")} ${repo.language || ""} `.toLowerCase();
  return ML_HINTS.some(h => hay.includes(h));
}

/** Human-friendly "12 days ago" style relative time from an ISO date string. */
function relativeTime(dateStr) {
  if (!dateStr) return "unknown";
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "unknown";
  const diffMs = Date.now() - then;
  const day = 86400000;
  if (diffMs < day) return "today";
  const days = Math.floor(diffMs / day);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function buildEvidence(repo) {
  const activeRecently = repo.updatedAt && (Date.now() - new Date(repo.updatedAt).getTime()) < 120 * 86400000;
  const hasTech = !!repo.language;
  const hasDescription = !!(repo.description && repo.description.trim().length > 8);
  return [
    { ok: true, label: "Repository exists" },
    { ok: !!activeRecently, label: activeRecently ? "Code activity detected" : "No recent push activity" },
    { ok: hasTech, label: hasTech ? `Relevant technology detected (${repo.language})` : "No primary language detected" },
    { ok: hasDescription, label: hasDescription ? "Project description present" : "No description provided" },
  ];
}

/* ---------------------------------------------------------------- */
/*  Fallback / demo data — used only when the live API can't be     */
/*  reached (offline, rate-limited, or an unparseable input).       */
/* ---------------------------------------------------------------- */

function fallbackRepoEvidence(input) {
  return {
    ok: true, fallback: true, url: input,
    summary: "Repository evidence recorded (offline demo data — GitHub API unreachable or rate-limited).",
    stars: 20 + Math.floor(Math.random() * 180),
    language: "TypeScript",
    lastActivity: "within the last week",
  };
}

function fallbackAnalysis(usernameOrUrl, summary) {
  const username = parseGithubInput(usernameOrUrl)?.owner || String(usernameOrUrl || "demo-user").replace(/^@/, "");
  const now = Date.now();
  const demoRepos = [
    { name: "crop-disease-classifier", description: "CNN-based crop disease detector trained on the PlantVillage dataset.", language: "Python", stars: 42, forks: 9, updatedAt: new Date(now - 12 * 86400000).toISOString(), topics: ["machine-learning", "pytorch", "computer-vision"], url: `https://github.com/${username}/crop-disease-classifier`, languages: { Python: 82, Jupyter: 12, JavaScript: 6 } },
    { name: "realtime-chat-api", description: "WebSocket chat backend with Redis pub/sub for presence and delivery.", language: "JavaScript", stars: 15, forks: 3, updatedAt: new Date(now - 40 * 86400000).toISOString(), topics: ["nodejs", "websocket"], url: `https://github.com/${username}/realtime-chat-api`, languages: { JavaScript: 88, Dockerfile: 12 } },
    { name: "portfolio-site", description: "Personal portfolio and case studies, built with React.", language: "TypeScript", stars: 6, forks: 1, updatedAt: new Date(now - 5 * 86400000).toISOString(), topics: ["react", "portfolio"], url: `https://github.com/${username}/portfolio-site`, languages: { TypeScript: 70, CSS: 30 } },
  ];
  const topRepos = demoRepos.map(r => ({ ...r, isML: looksLikeML(r), evidence: buildEvidence(r) }));
  return {
    ok: true, fallback: true, username,
    summary: summary || "GitHub connection simulated for local demo — live API unreachable or rate-limited.",
    profile: {
      name: username, avatarUrl: null, bio: "Demo profile — live GitHub data unavailable.",
      followers: 12, following: 8, publicRepos: demoRepos.length, createdAt: null,
      htmlUrl: `https://github.com/${username}`,
    },
    stats: {
      totalRepos: demoRepos.length,
      totalStars: demoRepos.reduce((s, r) => s + r.stars, 0),
      totalForks: demoRepos.reduce((s, r) => s + r.forks, 0),
      languageCounts: { Python: 1, JavaScript: 1, TypeScript: 1 },
      mlRepoCount: topRepos.filter(r => r.isML).length,
      activeProjectsCount: 3,
      recentActivityEstimate: 0,
    },
    topRepos,
    generatedAt: new Date().toISOString(),
  };
}

/* ---------------------------------------------------------------- */
/*  Public API                                                       */
/* ---------------------------------------------------------------- */

/** Quick single repo/user evidence check — used when linking one repo as proof for one skill. */
async function fetchRepoEvidence(input) {
  const parsed = parseGithubInput(input);
  if (!parsed) return fallbackRepoEvidence(input);
  try {
    if (parsed.repo) {
      const res = await fetch(`${API}/repos/${parsed.owner}/${parsed.repo}`);
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const data = await res.json();
      return {
        ok: true, fallback: false, url: input,
        summary: `Verified via GitHub API — ${data.full_name}, ${data.stargazers_count} stars.`,
        stars: data.stargazers_count, language: data.language || "Multiple",
        lastActivity: data.pushed_at ? new Date(data.pushed_at).toLocaleDateString() : "unknown",
      };
    }
    const res = await fetch(`${API}/users/${parsed.owner}`);
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    const reposRes = await fetch(`${API}/users/${parsed.owner}/repos?sort=updated&per_page=5`);
    const repos = reposRes.ok ? await reposRes.json() : [];
    return {
      ok: true, fallback: false, url: input,
      summary: `Verified via GitHub API — ${data.public_repos} public repos, ${data.followers} followers.`,
      stars: repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
      language: repos[0]?.language || "Multiple",
      lastActivity: repos[0]?.pushed_at ? new Date(repos[0].pushed_at).toLocaleDateString() : "unknown",
    };
  } catch (e) {
    return fallbackRepoEvidence(input);
  }
}

function fallbackGithubEvidence(input) {
  return fallbackRepoEvidence(input);
}

/**
 * Full account analysis for the GitHub Analysis dashboard: profile summary,
 * aggregate stats (repo/star/fork counts, language mix, ML-related repo
 * count, recently-active project count, a recent-activity estimate from
 * public push events), and evidence-annotated cards for the top repos.
 *
 * Falls back to clearly-labeled demo data on any failure (network error,
 * rate limit, or user not found) so the dashboard never dead-ends.
 */
async function analyzeGithubUser(usernameOrUrl) {
  const parsed = parseGithubInput(usernameOrUrl);
  const username = parsed?.owner;
  if (!username) return fallbackAnalysis(usernameOrUrl, "Couldn't parse a GitHub username from that input — showing labeled demo data instead.");

  try {
    const userRes = await fetch(`${API}/users/${username}`);
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return fallbackAnalysis(username, `No public GitHub user "${username}" was found — showing labeled demo data instead.`);
      }
      if (userRes.status === 403) {
        return fallbackAnalysis(username, "GitHub API rate limit reached for this network — showing labeled demo data instead.");
      }
      throw new Error(`GitHub API ${userRes.status}`);
    }
    const user = await userRes.json();

    const reposRes = await fetch(`${API}/users/${username}/repos?per_page=100&sort=updated`);
    if (!reposRes.ok) throw new Error(`GitHub API ${reposRes.status}`);
    const repos = await reposRes.json();

    // Recent public activity, used only as an *estimate* of commit-level
    // activity. GitHub's REST API has no cheap "total commit count"
    // endpoint short of walking every repo's commit history, which would
    // blow through the unauthenticated rate limit — so this is explicitly
    // an estimate from recent public PushEvents, never an exact total.
    let recentActivityEstimate = 0;
    try {
      const eventsRes = await fetch(`${API}/users/${username}/events/public?per_page=100`);
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        recentActivityEstimate = events
          .filter(e => e.type === "PushEvent")
          .reduce((sum, e) => sum + (e.payload?.size || 0), 0);
      }
    } catch (_) { /* non-fatal — activity estimate just stays 0 */ }

    const languageCounts = {};
    repos.forEach(r => { if (r.language) languageCounts[r.language] = (languageCounts[r.language] || 0) + 1; });

    const activeProjectsCount = repos.filter(r => r.pushed_at && (Date.now() - new Date(r.pushed_at).getTime()) < 90 * 86400000).length;
    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

    // Fetch a per-language byte breakdown for only the top few repos (by
    // stars, then recency) to stay well inside the ~60 req/hr limit.
    const topCandidates = [...repos]
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
      .slice(0, 6);

    const topRepos = await Promise.all(topCandidates.map(async (r) => {
      let languages = null;
      try {
        const langRes = await fetch(r.languages_url);
        if (langRes.ok) {
          const raw = await langRes.json();
          const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
          languages = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.round((v / total) * 100)]));
        }
      } catch (_) { /* per-repo language breakdown is a nice-to-have, not required */ }
      const repoObj = {
        name: r.name, description: r.description, language: r.language,
        stars: r.stargazers_count, forks: r.forks_count, updatedAt: r.pushed_at,
        topics: r.topics || [], url: r.html_url, languages,
      };
      return { ...repoObj, isML: looksLikeML(repoObj), evidence: buildEvidence(repoObj) };
    }));

    const mlRepoCount = repos.filter(looksLikeML).length;

    return {
      ok: true, fallback: false, username,
      profile: {
        name: user.name || user.login, avatarUrl: user.avatar_url, bio: user.bio,
        followers: user.followers, following: user.following, publicRepos: user.public_repos,
        createdAt: user.created_at, htmlUrl: user.html_url,
      },
      stats: { totalRepos: repos.length, totalStars, totalForks, languageCounts, mlRepoCount, activeProjectsCount, recentActivityEstimate },
      topRepos,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    return fallbackAnalysis(username, "Live GitHub lookup failed (network error or rate limit) — showing labeled demo data instead.");
  }
}

  global.TribeGithub = {
    parseGithubInput,
    relativeTime,
    fetchRepoEvidence,
    fallbackGithubEvidence,
    analyzeGithubUser,
  };
})(window);
