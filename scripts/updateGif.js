const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const assetsDir = path.join(repoRoot, "assets");
const readmePath = path.join(repoRoot, "README.md");

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectGifFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const gifFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      gifFiles.push(...collectGifFiles(fullPath));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".gif") {
      gifFiles.push(normalizePath(path.relative(repoRoot, fullPath)));
    }
  }

  return gifFiles;
}

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function updateReadme() {
  const gifFiles = collectGifFiles(assetsDir);

  if (gifFiles.length === 0 || !fs.existsSync(readmePath)) {
    return;
  }

  const readme = fs.readFileSync(readmePath, "utf8");
  const imageTagPattern = /<img\b[^>]*\bsrc=(["'])(\.\/)?assets\/[^"']+\1[^>]*\/?>/gi;
  const matches = [...readme.matchAll(imageTagPattern)];

  if (matches.length === 0) {
    return;
  }

  let pool = shuffle(gifFiles);
  let poolIndex = 0;

  const updatedReadme = readme.replace(imageTagPattern, (tag) => {
    if (poolIndex >= pool.length) {
      pool = shuffle(gifFiles);
      poolIndex = 0;
    }

    const nextGif = pool[poolIndex];
    poolIndex += 1;

    return tag.replace(/\bsrc=(["'])([^"']+)\1/i, `src="${
      nextGif.startsWith("assets/") ? nextGif : `assets/${nextGif}`
    }"`);
  });

  if (updatedReadme !== readme) {
    fs.writeFileSync(readmePath, updatedReadme);
  }
}

updateReadme();
