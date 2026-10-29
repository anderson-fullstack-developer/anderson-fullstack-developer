// Generates the stats and languages cards shown in the profile README.
// Runs daily in GitHub Actions with the workflow's GITHUB_TOKEN; no external services.
//
// Usage: GITHUB_TOKEN=... node scripts/generate-stats.mjs
//        node scripts/generate-stats.mjs --sample   (renders sample data, for local previews)

import { mkdir, writeFile } from "node:fs/promises";

const USER = process.env.PROFILE_USER ?? "anderson-fullstack-developer";
const OUT_DIR = new URL("../assets/", import.meta.url);

// Languages that describe tooling rather than code written by hand.
const IGNORED_LANGUAGES = new Set(["Dockerfile", "Shell", "Batchfile", "Mako", "Procfile", "PowerShell"]);

const THEMES = {
  dark: {
    bg: "#0d1117",
    border: "#30363d",
    title: "#e6edf3",
    text: "#9198a1",
    value: "#e6edf3",
    accent: "#7c83ff",
    track: "#21262d",
  },
  light: {
    bg: "#ffffff",
    border: "#d1d9e0",
    title: "#1f2328",
    text: "#59636e",
    value: "#1f2328",
    accent: "#4f46e5",
    track: "#eff2f5",
  },
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

async function graphql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`GitHub API error: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

async function fetchStats() {
  const { user } = await graphql(
    `query ($login: String!) {
      user(login: $login) {
        createdAt
        repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
          totalCount
          nodes {
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks { contributionDays { contributionCount } }
          }
        }
      }
    }`,
    { login: USER },
  );

  // contributionsCollection covers at most one year, so the all-time total is summed year by year.
  let allTime = 0;
  const firstYear = new Date(user.createdAt).getUTCFullYear();
  const thisYear = new Date().getUTCFullYear();
  const now = new Date().toISOString();
  for (let year = firstYear; year <= thisYear; year++) {
    const yearEnd = `${year}-12-31T23:59:59Z`;
    const data = await graphql(
      `query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar { totalContributions }
          }
        }
      }`,
      { login: USER, from: `${year}-01-01T00:00:00Z`, to: year === thisYear ? now : yearEnd },
    );
    allTime += data.user.contributionsCollection.contributionCalendar.totalContributions;
  }

  const languages = new Map();
  for (const repo of user.repositories.nodes) {
    for (const { size, node } of repo.languages.edges) {
      if (IGNORED_LANGUAGES.has(node.name)) continue;
      const current = languages.get(node.name) ?? { size: 0, color: node.color ?? "#8b949e" };
      current.size += size;
      languages.set(node.name, current);
    }
  }

  const c = user.contributionsCollection;
  return {
    allTime,
    lastYear: c.contributionCalendar.totalContributions,
    commits: c.totalCommitContributions + c.restrictedContributionsCount,
    activeDays: c.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .filter((day) => day.contributionCount > 0).length,
    repos: user.repositories.totalCount,
    languages: [...languages.entries()]
      .map(([name, { size, color }]) => ({ name, size, color }))
      .sort((a, b) => b.size - a.size),
  };
}

const SAMPLE = {
  allTime: 1007,
  lastYear: 940,
  commits: 812,
  activeDays: 160,
  repos: 11,
  languages: [
    { name: "TypeScript", size: 900, color: "#3178c6" },
    { name: "PHP", size: 300, color: "#4F5D95" },
    { name: "Python", size: 200, color: "#3572A5" },
    { name: "JavaScript", size: 150, color: "#f1e05a" },
    { name: "CSS", size: 120, color: "#663399" },
    { name: "HTML", size: 100, color: "#e34c26" },
    { name: "Other", size: 30, color: "#8b949e" },
  ],
};

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const format = (n) => n.toLocaleString("en-US");

function card(theme, width, height, title, body) {
  const t = THEMES[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(title)}">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${t.bg}" stroke="${t.border}"/>
  <text x="24" y="38" font-family="${FONT}" font-size="16" font-weight="600" fill="${t.title}">${escape(title)}</text>
${body}
</svg>
`;
}

function statsCard(stats, theme) {
  const t = THEMES[theme];
  const rows = [
    ["Contributions (all time)", stats.allTime],
    ["Contributions (last 12 months)", stats.lastYear],
    ["Commits (last 12 months)", stats.commits],
    ["Days with contributions (last 12 months)", stats.activeDays],
    ["Public repositories", stats.repos],
  ];
  const body = rows
    .map(([label, value], i) => {
      const y = 74 + i * 26;
      return `  <circle cx="30" cy="${y - 5}" r="4" fill="${t.accent}"/>
  <text x="44" y="${y}" font-family="${FONT}" font-size="14" fill="${t.text}">${escape(label)}</text>
  <text x="471" y="${y}" font-family="${FONT}" font-size="14" font-weight="600" fill="${t.value}" text-anchor="end">${format(value)}</text>`;
    })
    .join("\n");
  return card(theme, 495, 195, "GitHub activity", body);
}

function languagesCard(stats, theme) {
  const t = THEMES[theme];
  const top = stats.languages.slice(0, 6);
  const total = top.reduce((sum, l) => sum + l.size, 0) || 1;

  // Stacked bar, clipped to rounded ends.
  let x = 0;
  const barWidth = 447;
  const segments = top
    .map((l) => {
      const w = (l.size / total) * barWidth;
      const rect = `<rect x="${(24 + x).toFixed(2)}" y="56" width="${w.toFixed(2)}" height="10" fill="${l.color}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const legend = top
    .map((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const lx = 24 + col * 228;
      const ly = 100 + row * 30;
      const pct = ((l.size / total) * 100).toFixed(1);
      return `  <circle cx="${lx + 6}" cy="${ly - 5}" r="6" fill="${l.color}"/>
  <text x="${lx + 20}" y="${ly}" font-family="${FONT}" font-size="14" fill="${t.value}">${escape(l.name)}</text>
  <text x="${lx + 200}" y="${ly}" font-family="${FONT}" font-size="14" fill="${t.text}" text-anchor="end">${pct}%</text>`;
    })
    .join("\n");

  const body = `  <clipPath id="bar"><rect x="24" y="56" width="${barWidth}" height="10" rx="5"/></clipPath>
  <rect x="24" y="56" width="${barWidth}" height="10" rx="5" fill="${t.track}"/>
  <g clip-path="url(#bar)">${segments}</g>
${legend}`;
  return card(theme, 495, 195, "Most used languages (public repositories)", body);
}

const stats = process.argv.includes("--sample") ? SAMPLE : await fetchStats();
await mkdir(OUT_DIR, { recursive: true });
for (const theme of Object.keys(THEMES)) {
  await writeFile(new URL(`stats-${theme}.svg`, OUT_DIR), statsCard(stats, theme));
  await writeFile(new URL(`languages-${theme}.svg`, OUT_DIR), languagesCard(stats, theme));
}
console.log(`Cards written: ${stats.allTime} contributions, ${stats.languages.length} languages`);
