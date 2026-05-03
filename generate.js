const axios = require("axios");
const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME;

// simple color map (flat, no gradients)
const COLORS = {
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Cpp: "#f34b7d",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  TypeScript: "#3178c6"
};

// logo mapping (offensive-vk icons)
const ICONS = {
  JavaScript:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/javascript/javascript-line.svg",
  Python:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/python/python-line.svg",
  Cpp:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/cplusplus/cplusplus-line.svg",
  Java:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/java/java-line.svg",
  HTML:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/html/html-line.svg",
  CSS:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/css/css-line.svg"
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
      totals[lang] = (totals[lang] || 0) + val;
    }
  }

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const max = sorted[0][1];

  let svg = "";

  sorted.forEach(([lang, val], i) => {
    const width = (val / max) * 260;

    svg += `
    <g transform="translate(0,${i * 30})">

      <!-- icon -->
      <image href="${ICONS[lang] || ""}"
             x="10" y="10"
             width="16" height="16" />

      <!-- name -->
      <text x="35" y="22"
            fill="#e5e7eb"
            font-size="12">
        ${lang}
      </text>

      <!-- background bar -->
      <rect x="120" y="12"
            width="260" height="8"
            rx="4"
            fill="#1f2937" />

      <!-- value bar -->
      <rect x="120" y="12"
            width="${width}"
            height="8"
            rx="4"
            fill="${COLORS[lang] || "#888"}" />

    </g>`;
  });

  const finalSVG = `
<svg width="420" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0b0f19"/>
  ${svg}
</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/lang.svg", finalSVG);
}

main();
