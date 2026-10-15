# exam-cv — frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 single-page app for the
[AI Resume Analyzer](../README.md) backend.

Public pages:

- **Landing** (`/`) — hero, how-it-works, AI section, live template gallery, trust note
- **Login** (`/login`), **Register** (`/register`)
- **Privacy** (`/privacy`), **Terms** (`/terms`), **Contact** (`/contact`) — linked from the footer

Signed-in workspace under `/app/*` (redirects to `/login` when the session
expires):

- **Analyze** (`/app/analyze`) — upload a PDF + optional job description → ATS
  score, reporting, and JD-match
- **Rewrite** (`/app/rewrite`) — pick a template → download the generated PDF
- **History** (`/app/history`) — past analyses and rewrites, with re-downloads

Anything else is a 404 page.

See **[FRONTEND_NOTES.md](./FRONTEND_NOTES.md)** for the API contract, the
`pages → hooks → api` layering rule, design conventions, the auth-expiry flow,
and the `dist` gotcha.

## Quick start

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL, defaults to http://127.0.0.1:8000
npm run dev               # http://localhost:5173
```

| Script | Does |
|--------|------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run lint` | `eslint .` |
| `npm run test` | Vitest run (once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run preview` | Serve the built `dist/` locally |

There is no standalone `typecheck` script; type checking runs as the first half
of `npm run build`. Test files under `tests/` are covered by Vitest but are
outside the `tsc -b` graph, so they are not type-checked by the build.

> The backend (`app.py`) serves the **built** `dist/` at `/`. Rebuild after
> changing `src/`, or run `npm run dev` and use port 5173 for hot reloading.

## Layout

```
src/
├── api/          # the only place URLs + request/response shapes live
├── hooks/        # React Query hooks — components never call api/ directly
├── lib/          # axios instance + getErrorMessage, account cache keys
├── context/      # Auth (tokens, expiry) and Theme (light/dark, persisted)
├── components/   # ui/ primitives, layout/, auth/, guards/, rewrite/, FileDropzone
├── pages/        # Landing, Login, Register, Privacy, Terms, Contact, Analyze, Rewrite, History, NotFound
└── types/        # hand-written mirrors of the API response shapes
tests/             # Vitest + Testing Library suites, testUtils + probes helpers
```

Styling tokens live in `src/index.css` under Tailwind v4's `@theme`; there is no
`tailwind.config.js`. Dark mode is the `.dark` class toggled by `ThemeContext`.