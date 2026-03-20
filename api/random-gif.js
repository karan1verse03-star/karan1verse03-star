const fs = require("fs");
const path = require("path");

const baseAssetsDir = path.join(__dirname, "../assets");

// 🔁 Collect all GIF paths recursively
function collectGifPaths(directory) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let gifPaths = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      gifPaths = gifPaths.concat(collectGifPaths(fullPath));
    } else if (entry.name.toLowerCase().endsWith(".gif")) {
      gifPaths.push(fullPath);
    }
  }

  return gifPaths;
}

module.exports = (req, res) => {
  try {
    const { type, slot } = req.query;

    // 🎯 Select folder based on type
    let targetDir = baseAssetsDir;

    if (type === "naruto") {
      targetDir = path.join(baseAssetsDir, "naruto-gifs");
    } else if (type === "onepiece") {
      targetDir = path.join(baseAssetsDir, "one-piece-gifs");
    } else if (type === "demonslayer") {
      targetDir = path.join(baseAssetsDir, "demon-slayer-gifs");
    }

    const gifPaths = collectGifPaths(targetDir);

    if (gifPaths.length === 0) {
      res.statusCode = 404;
      return res.end("No GIFs found");
    }

    // 🎲 Better randomness (avoids collision between slots)
    const seed = parseInt(slot || 0) + Date.now();
    const index = seed % gifPaths.length;
    const selectedGif = gifPaths[index];

    // 📦 Read and send actual GIF (NO REDIRECT)
    const gifBuffer = fs.readFileSync(selectedGif);

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/gif");
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.end(gifBuffer);
  } catch (err) {
    res.statusCode = 500;
    res.end("Error loading GIF");
  }
};
