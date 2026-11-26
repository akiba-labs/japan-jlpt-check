# Japan JLPT Level Check

Free checker: which JLPT level do you need in Japan? Enter N1–N5 (and your total score) plus optional BJT score / Japanese schooling, and see which visa and status Japanese-language rules it meets — HSP points, the 2025-10-16 Business Manager B2 rule, Designated Activities 46, Specified Skilled Worker, 育成就労, the B1 permanent-residence factor from 2027-04-01 — with JLPT's official CEFR reference.

- Full app and API (Vercel): https://japan-jlpt-check.vercel.app
- Checker (GitHub Pages): https://akiba-labs.github.io/japan-jlpt-check/

- API: `GET /api/check?level=n2&score=115` (keyless, CORS), `/api/rules`, `/openapi.json`, `/llms.txt`
- MCP: `japan_jlpt_level_check` on https://free-agent-tools.vercel.app/mcp

Sources: JLPT Advantages page and CEFR reference; ISA HSP points table, 特定活動46号, 経営・管理 revision, 特定技能 field pages, 育成就労 Japanese page, 永住許可ガイドライン (2026-10-01). Rules as of 2026-11-09.

**Disclaimer:** educational, not legal advice, not affiliated with the Immigration Services Agency of Japan or the JLPT organisers. ISA decides.

Dev:

```
npm ci
npm test
npm run build
npm run build:pages
```

`npm run build` is the Vercel app (checker, JSON API, share pages). `npm run build:pages` writes a static `out/` for GitHub Pages and checks that internal links and assets resolve under `/japan-jlpt-check`. Server routes stay in the repo; the Pages script only moves them aside for that build.

GitHub settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Pushes to `main` deploy with `.github/workflows/pages.yml`. The copy-paste steps for the other tool repos are at the top of `scripts/build-pages.mjs`.
