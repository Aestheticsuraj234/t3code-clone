export type FsNode =
  | { kind: "dir"; name: string; children: FsNode[] }
  | { kind: "file"; name: string; path: string };

const dir = (name: string, children: FsNode[]): FsNode => ({ kind: "dir", name, children });
const file = (name: string, path: string): FsNode => ({ kind: "file", name, path });

export const MOCK_FILE_TREE: FsNode = dir("t3code-clone", [
  dir(".agents", [file("README.md", ".agents/README.md")]),
  dir(".cursor", []),
  dir(".next", []),
  dir("generated", []),
  dir("node_modules", []),
  dir("prisma", [file("schema.prisma", "prisma/schema.prisma")]),
  dir("public", [
    file("next.svg", "public/next.svg"),
    file("favicon.ico", "public/favicon.ico"),
  ]),
  dir("src", [
    dir("app", [
      dir("(app)", [
        file("layout.tsx", "src/app/(app)/layout.tsx"),
        file("page.tsx", "src/app/(app)/page.tsx"),
      ]),
      dir("api", []),
      dir("login", [file("page.tsx", "src/app/login/page.tsx")]),
      file("layout.tsx", "src/app/layout.tsx"),
      file("globals.css", "src/app/globals.css"),
    ]),
    dir("components", []),
    dir("features", []),
    dir("hooks", []),
    dir("lib", [file("utils.ts", "src/lib/utils.ts")]),
    file("proxy.ts", "src/proxy.ts"),
  ]),
  file(".env", ".env"),
  file(".env.example", ".env.example"),
  file(".gitignore", ".gitignore"),
  file("AGENTS.md", "AGENTS.md"),
  file("CLAUDE.md", "CLAUDE.md"),
  file("components.json", "components.json"),
  file("eslint.config.mjs", "eslint.config.mjs"),
  file("next-env.d.ts", "next-env.d.ts"),
  file("next.config.ts", "next.config.ts"),
  file("package-lock.json", "package-lock.json"),
  file("package.json", "package.json"),
  file("postcss.config.mjs", "postcss.config.mjs"),
  file("prisma.config.ts", "prisma.config.ts"),
  file("README.md", "README.md"),
  file("tsconfig.json", "tsconfig.json"),
]);

export const MOCK_SOURCES: Record<string, string> = {
  "src/app/(app)/layout.tsx": `export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-svh flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
`,
  "src/app/(app)/page.tsx": `import { WorkspaceIde } from "@/features/workspace-shell/components/workspace-ide";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <WorkspaceIde />
    </div>
  );
}
`,
  "src/app/login/page.tsx": `import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <LoginForm />;
}
`,
  "src/app/layout.tsx": `import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "t3code-clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`,
  "src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  "src/proxy.ts": `export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
`,
  "prisma/schema.prisma": `generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    String  @id @default(cuid())
  email String  @unique
  name  String?
}
`,
  "package.json": `{
  "name": "t3code-clone",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
`,
  "src/app/globals.css": `@import "tailwindcss";
@import "tw-animate-css";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
`,
  ".env": `DATABASE_URL="postgresql://user:password@localhost:5432/t3code"
BETTER_AUTH_SECRET="change-me"
BETTER_AUTH_URL="http://localhost:3000"
`,
  ".env.example": `DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
`,
  ".gitignore": `node_modules
.next
.env*.local
generated
*.log
.DS_Store
`,
  "AGENTS.md": `<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. Read the relevant guide in
\`node_modules/next/dist/docs/\` before writing code.
<!-- END:nextjs-agent-rules -->
`,
  "CLAUDE.md": `@AGENTS.md
`,
  "README.md": `# t3code-clone

A Cursor-style IDE shell built on Next.js 16, shadcn/ui, Shiki and CodeMirror.

## Getting started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`
`,
  "components.json": `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
`,
  "eslint.config.mjs": `import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
`,
  "next-env.d.ts": `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited.
`,
  "next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
`,
  "postcss.config.mjs": `const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
`,
  "prisma.config.ts": `import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
});
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
`,
  "package-lock.json": `{
  "name": "t3code-clone",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {}
}
`,
  "public/next.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 394 80">
  <path fill="#000" d="M..."/>
</svg>
`,
  "public/favicon.ico": "(binary file)\n",
  ".agents/README.md": `# Agents

Configuration and skills for AI agents working in this repo.
`,
};

export const DEFAULT_OPEN_FILE = "src/app/(app)/layout.tsx";
