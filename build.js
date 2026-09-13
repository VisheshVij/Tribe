const fs = require("fs");
const path = require("path");
const https = require("https");

const JSX_PATH = path.join(__dirname, "assets/app.jsx");
const JS_PATH = path.join(__dirname, "assets/app.js");
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
  console.log(`Build complete! assets/app.js written (${result.code.length} bytes).`);
}

compile().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
