# Japan JLPT Level Check

Free checker: which JLPT level do you need in Japan? Enter N1–N5 (and your total score) plus optional BJT score / Japanese schooling, and see which visa and status Japanese-language rules it meets — HSP points, the 2025-10-16 Business Manager B2 rule, Designated Activities 46, Specified Skilled Worker, 育成就労, the B1 permanent-residence factor from 2027-04-01 — with JLPT's official CEFR reference.

Live: https://japan-jlpt-check.vercel.app

- API: `GET /api/check?level=n2&score=115` (keyless, CORS), `/api/rules`, `/openapi.json`, `/llms.txt`
- MCP: `japan_jlpt_level_check` on https://free-agent-tools.vercel.app/mcp

Sources: JLPT Advantages page and CEFR reference; ISA HSP points table, 特定活動46号, 経営・管理 revision, 特定技能 field pages, 育成就労 Japanese page, 永住許可ガイドライン (2026-10-01). Rules as of 2026-11-09.

**Disclaimer:** educational, not legal advice, not affiliated with the Immigration Services Agency of Japan or the JLPT organisers. ISA decides.

Dev: `npm ci && npm test && npm run build`
