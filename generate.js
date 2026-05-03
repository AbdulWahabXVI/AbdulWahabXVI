const axios = require("axios");
const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME;

function badge(lang, color) {
  const label = encodeURIComponent(lang);
  return `https://img.shields.io/badge/${label}-${color}?style=flat-square`;
}

const COLORS = {
  JavaScript: "f1e05a",
  Python: "3572A5",
  HTML: "e34c26",
  CSS: "563d7c",
  Cpp: "f34b7d",
  TypeScript: "3178c6"
};

async function getRepos() {
  const res = await axios.get(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100`
  );
  return res.data;
}

async function getLang(url) {
  const res = await axios.get(url);
  return res.data;
}

async function main() {
  const repos = await getRepos();

  const totals = {};

  for (const repo of repos) {
    const langs = await getLang(repo.languages_url);

    for (const [lang, val] of Object.entries(langs)) {
      const key = lang.replace("C++", "Cpp");
      totals[key] = (totals[key] || 0) + val;
    }
  }

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const max = sorted[0][1];

  let output = `## 📊 Languages\n\n<p>\n`;

  sorted.forEach(([lang, val]) => {
    const pct = Math.round((val / max) * 100);
    const color = COLORS[lang] || "888888";

    output += `
<img src="${badge(lang, color)}" />

<span style="display:inline-block;width:200px;height:6px;background:#1f2937;border-radius:999px;">
  <span style="display:block;width:${pct}%;height:100%;background:#${color};border-radius:999px;"></span>
</span>

<br/>
`;
  });

  output += `\n</p>\n`;

  fs.writeFileSync("README.md", output);
}

main();
