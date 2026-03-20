const fs = require("fs");
const path = require("path");

const baseAssetsDir = path.join(__dirname, "../assets");

// 🔁 Recursively collect GIF file paths
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

    // 🎯 Select target folder
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

    // 🎲 Stable randomness (prevents collisions across tiles)
    const seed = parseInt(slot || "0") + Date.now();
    const index = seed % gifPaths.length;
    const selectedGif = gifPaths[index];

    // 📦 Read file safely
    const gifBuffer = fs.readFileSync(selectedGif);

    // ✅ Clean headers for GitHub camo compatibility
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Length", gifBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");

    res.end(gifBuffer);
  } catch (err) {
    res.statusCode = 500;
    res.end("Error loading GIF");
  }
};
