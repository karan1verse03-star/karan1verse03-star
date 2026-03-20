const fs = require("fs");
const path = require("path");

const baseAssetsDir = path.join(__dirname, "../assets");

function collectGifPaths(directory) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let gifPaths = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      gifPaths = gifPaths.concat(collectGifPaths(fullPath));
    } else if (entry.name.toLowerCase().endsWith(".gif")) {
      const relativePath = path
        .relative(path.join(__dirname, ".."), fullPath)
        .split(path.sep)
        .join("/");

      gifPaths.push(`/${relativePath}`);
    }
  }

  return gifPaths;
}

module.exports = (req, res) => {
  try {
    const { type } = req.query;

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

    const randomGif = gifPaths[Math.floor(Math.random() * gifPaths.length)];

    const cacheBuster = Date.now();

    res.statusCode = 307;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Location", `${randomGif}?t=${cacheBuster}`);
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end("Error loading GIFs");
  }
};
