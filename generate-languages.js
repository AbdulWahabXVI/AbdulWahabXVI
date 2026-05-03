const axios = require("axios");
const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;

async function getRepos() {
  const res = await axios.get(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
    {
      headers: {
        Authorization: `token ${TOKEN}`
      }
    }
  );
  return res.data;
}

async function getLanguages(repo) {
  const res = await axios.get(repo.languages_url, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });
  return res.data;
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

  // sort
  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = sorted.map(x => x[0]);
  const values = sorted.map(x => x[1]);

  // create simple SVG bar chart
  const width = 800;
  const height = 400;
  const barWidth = width / labels.length;

  let bars = "";

  const max = Math.max(...values);

  values.forEach((v, i) => {
    const barHeight = (v / max) * 300;

    bars += `
      <rect x="${i * barWidth + 20}"
            y="${350 - barHeight}"
            width="${barWidth - 30}"
            height="${barHeight}"
            fill="#00ffaa" />
      <text x="${i * barWidth + 20}"
            y="380"
            font-size="12"
            fill="white">${labels[i]}</text>
    `;
  });

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117"/>
  ${bars}
</svg>
  `;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/languages-bar.svg", svg);
}

main();
