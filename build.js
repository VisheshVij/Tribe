const fs = require("fs");
const path = require("path");
const https = require("https");

const JSX_PATH = path.join(__dirname, "assets/app.jsx");
const JS_PATH = path.join(__dirname, "assets/app.js");
const GITHUB_SERVICE_PATH = path.join(__dirname, "assets/services/githubService.js");
const INDEX_HTML_PATH = path.join(__dirname, "index.html");
const BABEL_CACHE = path.join(__dirname, ".babel-cache.js");

function getBabel() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(BABEL_CACHE)) {
      try {
        return resolve(require(BABEL_CACHE));
      } catch (_) {}
    }
    const scratch = path.join(__dirname, "scratch_babel.js");
    if (fs.existsSync(scratch)) {
      try {
        return resolve(require(scratch));
      } catch (_) {}
    }
    console.log("Downloading Babel Standalone for compilation...");
    https.get("https://unpkg.com/@babel/standalone@7.25.6/babel.min.js", (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          fs.writeFileSync(BABEL_CACHE, data, "utf8");
          resolve(require(BABEL_CACHE));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function compile() {
  const Babel = await getBabel();
  const src = fs.readFileSync(JSX_PATH, "utf8");
  console.log("Compiling assets/app.jsx -> assets/app.js...");
  const result = Babel.transform(src, {
    presets: [["react", { runtime: "classic" }]],
    filename: "app.jsx"
  });
  fs.writeFileSync(JS_PATH, result.code, "utf8");
  console.log(`assets/app.js written (${result.code.length} bytes).`);

  const githubService = fs.readFileSync(GITHUB_SERVICE_PATH, "utf8");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>TRIBE — Swipe Right on Talent</title>
<meta name="description" content="TRIBE — evidence-based talent matching for hackathon teams." />

<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1/es2022/react.mjs",
    "react/": "https://esm.sh/react@18.3.1/es2022/",
    "react/jsx-runtime": "https://esm.sh/react@18.3.1/es2022/jsx-runtime.mjs",
    "react-dom": "https://esm.sh/react-dom@18.3.1/es2022/react-dom.mjs",
    "react-dom/": "https://esm.sh/react-dom@18.3.1/es2022/",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/es2022/client.mjs",
    "lucide-react": "https://esm.sh/lucide-react@0.383.0/X-ZXJlYWN0/es2022/lucide-react.mjs"
  }
}
</script>

<style>
  html, body { margin: 0; padding: 0; background: #0B0E12; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  #root-loading {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 14px; color: #A6ADBB;
    text-align: center; padding: 24px; box-sizing: border-box;
  }
  #root-loading .spinner {
    width: 32px; height: 32px; border-radius: 50%;
    border: 3px solid #232A36; border-top-color: #FF2E7E;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  noscript {
    display: block; padding: 40px; text-align: center; color: #EDEFF3;
    font-family: sans-serif; background: #0B0E12;
  }
</style>
</head>
<body>

<noscript>TRIBE requires JavaScript to run. Please enable it and reload the page.</noscript>

<div id="root">
  <div id="root-loading">
    <div class="spinner"></div>
    <div style="font-weight:600;font-size:15px;color:#EDEFF3;letter-spacing:-0.01em;">Loading TRIBE…</div>
    <div style="font-size:12px;color:#6E7686;max-width:320px;line-height:1.5;">
      Connecting to talent matching engine…
    </div>
  </div>
</div>

<script>
  window.__tribe_errors = [];
  window.addEventListener("error", function(event) {
    var detail = (event.error ? event.error.stack || event.error.message : event.message) || "Error";
    window.__tribe_errors.push(detail);
    console.error("[TRIBE Warning]", event.message, event.filename, event.lineno);
  });
  window.addEventListener("unhandledrejection", function(event) {
    var detail = (event.reason ? event.reason.stack || event.reason.message : String(event.reason)) || "Rejection";
    window.__tribe_errors.push(detail);
    console.error("[TRIBE Rejection]", event.reason);
  });

  setTimeout(function() {
    var loadingEl = document.getElementById("root-loading");
    if (loadingEl && loadingEl.parentNode) {
      var errInfo = window.__tribe_errors.length > 0 ?
        "<div style=\\"color:#FF6B6B;background:#181D26;padding:10px;border-radius:8px;font-family:monospace;font-size:11px;text-align:left;max-height:120px;overflow:auto;margin-bottom:12px;\\">" +
        window.__tribe_errors.join("<br>") + "</div>" : "";

      loadingEl.innerHTML =
        "<div style=\\"color:#FF6B6B;font-weight:700;font-size:18px;margin-bottom:8px;\\">Startup Notice</div>" +
        "<div style=\\"color:#EDEFF3;font-size:13px;max-width:440px;line-height:1.6;margin-bottom:16px;\\">" +
        "Initial resource loading is taking longer than usual. If this persists, try reloading or clearing the local demo cache." +
        "</div>" + errInfo +
        "<div style=\\"display:flex;gap:10px;justify-content:center;flex-wrap:wrap;\\">" +
        "<button style=\\"background:#FF2E7E;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;\\" onclick=\\"location.reload()\\">Reload Page</button>" +
        "<button style=\\"background:#232A36;color:#EDEFF3;border:1px solid #353E4F;padding:10px 18px;border-radius:8px;font-weight:600;cursor:pointer;\\" onclick=\\"localStorage.clear();location.reload()\\">Clear Cache & Reload</button>" +
        "</div>";
    }
  }, 10000);
</script>

<!-- GitHub service -->
<script>
${githubService}
</script>

<!-- Main App -->
<script type="module">
${result.code}
</script>

</body>
</html>
`;
  fs.writeFileSync(INDEX_HTML_PATH, html, "utf8");
  console.log(`Self-contained index.html written (${html.length} bytes).`);
}

compile().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
