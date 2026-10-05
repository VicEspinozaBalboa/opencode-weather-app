# AGENTS.md — 02-weather

## What this is right now

Bare Bun scaffold. The only code is `index.ts` (`console.log("Hello via Bun!")`) — **the app does not exist yet**.
`README.md` is the real spec: build a Spanish-language console weather CLI on Bun + OpenMeteo.
Read it before designing anything; it lists the exact target menu (options 1–5, 8, 9) and both API URLs.

## Commands

`package.json` has **no `scripts` block** — there is no `npm run build/lint/test`. Run things directly:

| Task | Command |
|---|---|
| Run | `bun run index.ts` (entrypoint declared as `module: "index.ts"`) |
| Typecheck | `bunx tsc --noEmit` (TS 7.0.2 via peer dep; exits 0 today) |
| Install deps | `bun install` — use `bun add`, never `npm`/`pnpm` (keeps `bun.lock` authoritative) |

No linter, formatter, test runner, CI, or pre-commit hooks are configured. If tests are added, use Bun's built-in `bun test` + `bun:test` imports rather than adding a framework dependency.

Final artifact is meant to be a compiled binary (README), so prefer Bun-native APIs (`Bun.argv`, `Bun.file`, `Bun.write`) that survive `bun build --compile`. No build script exists yet — don't invent npm-style tooling.

## Stack facts that bite

- **No API keys.** OpenMeteo geocoding + forecast are public and keyless. `.env` is gitignored but nothing reads it — don't add env plumbing.
- **Two-step data flow** (from README): geocoding API resolves city name → lat/lon → forecast API. Don't call the forecast API with a city name.
- **Spanish is the product language.** README, menu labels, prompts, and output must be in Spanish; the ASCII banner in README is the intended look.

## tsconfig gotchas (`tsconfig.json`)

- `verbatimModuleSyntax: true` → type-only imports must be `import type { X } from ...`, else typecheck fails.
- `noUncheckedIndexedAccess: true` → indexing arrays/records yields `T | undefined`; guard or use `.at()`/destructuring with checks. This is the most common surprise here.
- `types: ["bun"]` and `lib: ["ESNext"]` only → no DOM and no Node globals. Use `fetch` (typed by `bun-types`) and Bun APIs; don't reach for DOM types or `require`.
- `strict`, `noImplicitOverride`, `noFallthroughCasesInSwitch` are on; `noEmit` means `tsc` never writes build output.

## Scope

- `02-weather` is an independent Bun project, not a workspace member (see `bun.lock` `workspaces`). Sibling course folders (`../01-demo`) are separate projects — don't hoist shared config to the parent.
- `opencode.json` / other instruction files: none exist; this file is the only source of repo-specific rules.