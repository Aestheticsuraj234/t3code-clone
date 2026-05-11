const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  cts: "typescript",
  mts: "typescript",
  js: "javascript",
  jsx: "jsx",
  cjs: "javascript",
  mjs: "javascript",
  json: "json",
  jsonc: "jsonc",
  css: "css",
  scss: "scss",
  html: "html",
  md: "markdown",
  mdx: "mdx",
  prisma: "prisma",
  py: "python",
  rs: "rust",
  go: "go",
  sh: "shell",
  bash: "shell",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  sql: "sql",
  svg: "xml",
  xml: "xml",
};

const NAME_TO_LANG: Record<string, string> = {
  ".env": "dotenv",
  ".env.example": "dotenv",
  ".env.local": "dotenv",
  ".env.development": "dotenv",
  ".env.production": "dotenv",
  ".gitignore": "gitignore",
  ".dockerignore": "gitignore",
  ".npmrc": "ini",
  ".editorconfig": "ini",
  Dockerfile: "docker",
};

const FALLBACK_LANG = "text";

export function langFromPath(path: string): string {
  const name = path.split("/").pop() ?? path;
  if (NAME_TO_LANG[name]) return NAME_TO_LANG[name];
  if (name.startsWith(".env")) return "dotenv";

  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return FALLBACK_LANG;
  const ext = name.slice(lastDot + 1).toLowerCase();
  return EXT_TO_LANG[ext] ?? FALLBACK_LANG;
}

export const SHIKI_THEME = "vesper";
export const SHIKI_FALLBACK_LANG = FALLBACK_LANG;
