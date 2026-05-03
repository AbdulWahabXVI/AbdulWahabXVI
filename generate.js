const axios = require("axios");
const fs = require("fs");

const USERNAME = process.env.GITHUB_USERNAME;

/* ---------- CONFIG ---------- */

const COLORS = {
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Cpp: "#f34b7d",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  TypeScript: "#3178c6"
};

const ICONS = {
  JavaScript:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/javascript/javascript-original.svg",
  Python:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/python/python-original.svg",
  Cpp:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/cplusplus/cplusplus-original.svg",
  Java:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/java/java-original.svg",
  HTML:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/html/html-original.svg",
  CSS:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/css/css-original.svg",
  TypeScript:
    "https://raw.githubusercontent.com/offensive-vk/Icons/master/typescript/typescript-original.svg"
};

/* ---------- NORMALIZE ---------- */

function normalize(lang) {
  const map = {
    "C++": "Cpp",
    "C#": "Csharp"
  };
  return map[lang] || lang;
}

/* ---------- FETCH ---------- */

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

/* ---------- MAIN ---------- */

async function main() {
  const repos = await getRepos();

  const totals = {};

  for (const repo of repos) {
    if (!repo.languages_url) continue;

    const langs = await getLang(repo.languages_url);

    for (const [lang, val] of Object.entries(langs)) {
      const key = normalize(lang);
      totals[key] = (totals[key] || 0) + val;
    }
  }

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const max = sorted[0]?.[1] || 1;

  let svg = "";

  sorted.forEach(([lang, val], i) => {
    const width = (val / max) * 240;

    svg += `
<g transform="translate(0,${i * 32})">

  <!-- icon -->
  <image href="${ICONS[lang] || ""}"
         x="10" y="10"
         width="16" height="16"
         style="pointer-events:none;" />

  <!-- name -->
  <text x="35" y="22"
        fill="#e5e7eb"
        font-size="12">
    ${lang}
  </text>

  <!-- background -->
  <rect x="120" y="12"
        width="240" height="6"
        rx="3"
        fill="#1f2937" />

  <!-- fill -->
  <rect x="120" y="12"
        width="${width}"
        height="6"
        rx="3"
        fill="${COLORS[lang] || "#888"}" />

</g>
`;
  });

  const finalSVG = `
<svg width="420" height="220" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0b0f19"/>

  <text x="10" y="20" fill="#9ca3af" font-size="12">
    Languages I use
  </text>

  ${svg}
</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/lang.svg", finalSVG);
}

main();
