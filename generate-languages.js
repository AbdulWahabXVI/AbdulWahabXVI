const axios = require("axios");
const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;

async function getRepos() {
  const res = await axios.get(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
    {
      headers: { Authorization: `token ${TOKEN}` }
    }
  );
  return res.data;
}

async function getLanguages(repo) {
  const res = await axios.get(repo.languages_url, {
    headers: { Authorization: `token ${TOKEN}` }
  });
  return res.data;
}

function percentify(data) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  return Object.entries(data)
    .map(([lang, val]) => ({
      lang,
      pct: val / total
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
}

async function main() {
  const repos = await getRepos();

  const totals = {};

  for (const repo of repos) {
    const langs = await getLanguages(repo);

    for (const [lang, bytes] of Object.entries(langs)) {
      totals[lang] = (totals[lang] || 0) + bytes;
    }
  }

  const data = percentify(totals);

  const width = 600;
  const height = 220;

  let bars = "";

  data.forEach((d, i) => {
    const y = 30 + i * 30;
    const barWidth = 400 * d.pct;

    // background track
    bars += `
      <rect x="160" y="${y - 10}" width="400" height="10" rx="5" fill="#1f2937"/>
      
      <rect x="160" y="${y - 10}" width="${barWidth}" height="10" rx="5"
        fill="url(#grad)" />

      <text x="20" y="${y}" fill="#e5e7eb" font-size="12">
        ${d.lang}
      </text>
    `;
  });

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="#0b0f19"/>

  ${bars}
</svg>
  `;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/languages.svg", svg);
}

main();
