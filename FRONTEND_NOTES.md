# Frontend — integration notes

## Run it

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to your FastAPI server
npm run dev               # http://localhost:5173
```

`VITE_API_BASE_URL` is baked in at **build** time, not read at runtime.

| Script | Does |
|--------|------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run lint` | `eslint .` |
| `npm run test` | Vitest run (once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run preview` | Serves the built `dist/` locally |

There is no `typecheck` script — type checking is the first half of `npm run
build`. Tests live in `tests/`, run under Vitest + jsdom + Testing Library, and
are outside the `tsc -b` graph (not type-checked by the build).

> ### ⚠️ `app.py` serves `frontend/dist`
>
> The backend mounts the **built** bundle at `/`:
>
> ```python
> app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
> ```
>
> So if you open `http://127.0.0.1:8000` you are looking at the last
> `npm run build`, **not** the Vite dev server. Editing `src/` and refreshing
> that page shows no change until you rebuild. `npm run dev` (port 5173) is a
> separate origin and does hot-reload; it talks to the same API through
> `VITE_API_BASE_URL`, and CORS already allows `localhost:5173` / `127.0.0.1:5173`.

## The layering rule

```
pages/  →  hooks/  →  api/  →  lib/axios
```

Components never import from `api/` directly; they use the React Query hooks in
`src/hooks/useResume.ts`. `src/api/` is the **only** place that knows a URL or a
request body shape, and `src/types/index.ts` is the only place that mirrors a
response shape. Keep them in step with the backend.

### Response shapes the API actually returns

```jsonc
// POST /analyze_resume
{
  "resume_id": 12,
  "ats_score": 88,
  "feedback": "...",
  "suggestions": "...",
  "job_vs_resume_analysis": "...",   // STRING of prose, not an object
  "analysis_match_score": 69         // top-level sibling, not nested
}
```

`POST /rewrite_resume` returns the same object plus
`new_resume_id`, `pdf_url`, and `preview_img_url`.

Two traps this file exists to prevent:

1. **`job_vs_resume_analysis` is a string.** The analyzer's Pydantic model nests
   `{analysis_match_score, job_analysis_feed_back}`, but `graphs/nodes.py`
   flattens it. Reading `.analysis_match_score` off it yields `undefined`, which
   rendered a permanently blank score gauge.
2. **Use `new_resume_id` for the PDF.** `api/resume.ts`
   (`getGeneratedResumePdf(resumeId: number)`) sends `GET /generated-resumes/{id}/pdf`
   with `responseType: "blob"` and the caller downloads it as a file. The id
   comes from the rewrite response or the history rows — never rebuild the path
   from `resume_id` of an analysis (there is no PDF for an analyze-only row).

### Endpoints the frontend calls

| Endpoint | Status |
|----------|--------|
| `POST /add/user`, `POST /login/user`, `GET /my/profile` | implemented |
| `POST /analyze_resume`, `POST /rewrite_resume` | implemented |
| `GET /templates` | implemented — `{template_id, preview_img, name}` on the Landing gallery |
| `GET /generated-resumes/{id}/pdf` | implemented |
| `GET /analysis-history` | implemented — analysis rows on the History page |
| `GET /rewrite-history` | implemented — rewrite rows on the History page |

`GET /my/profile` returns `{ "user_id": <int> }` only — no name, no email. The
navbar account menu labels the session as `user #<id>` for this reason.

## Auth

Tokens live in `localStorage` (`access_token`, `refresh_token`) and are attached
to every request by the axios interceptor in `src/lib/axios.ts`. `AuthContext`
derives `isAuthenticated` from the token plus the absence of a 401.

**There is no refresh flow** — the backend issues a 5-hour access token and
nothing to extend it, so an expired token is a hard logout:

1. A background request returns 401. The axios interceptor clears the tokens and
   dispatches `window` event `auth:unauthorized` (suppressed for `POST
   /login/user` and `POST /add/user`, whose 401s mean bad credentials).
2. `AuthContext` hears the event, drops the account-scoped query cache
   (`["profile"]`, `["analysis-history"]`, `["rewrite-history"]`,
   `["templates"]` — keys centralised in `src/lib/accountData.ts`), flips to
   signed-out, and redirects to `/login` with `state.reason = "expired"` so the
   login page shows a "your session expired" banner. A `expiredRef` flag
   collapses parallel-401 double navigation; it resets on the next sign-in.
3. After sign-in you land wherever you were headed: `Login` trusts
   `location.state.from` when it is an internal path (e.g. `/app/rewrite`),
   otherwise it defaults to `/app/analyze`. Register routes to `/login` with
   `state.registered = true` to show a success note.

Route guarding: `RequireAuth` wraps `/app/*` (loading skeleton → redirect to
`/login`), and `RedirectIfAuthed` keeps signed-in users off `/login` and
`/register`. `/privacy`, `/terms`, and `/contact` are fully public and are
linked from the footer, so the legal pages appear on both the landing page and
the `/app` layout.

## Errors

`getErrorMessage(error, fallback)` in `src/lib/axios.ts` unwraps FastAPI's
`detail` (both the string and the 422 `detail[]` form) and, because the PDF
request uses `responseType: "blob"`, parses the error body out of the Blob first.
Use it instead of a hardcoded string whenever you need to show a failure.

## Tests

`npm run test` runs Vitest (jsdom). Suites: route guards, login/register flows,
the auth-expiry purge, the landing page (incl. /templates data + authed CTA + the
AI section), the legal/contact pages (incl. footer links), a
form-context-aware `getErrorMessage`, and `useGeneratedResumePdf`.

- `tests/testUtils.tsx` — `renderApp` wraps a component in the full provider
  stack (fresh `QueryClient` with `retry: false`, `ThemeProvider`,
  `MemoryRouter` seeded with `route`/`state`, `AuthProvider`) and returns the
  client for cache assertions; `makeAxiosError` builds a shaped `AxiosError`.
- `tests/probes.tsx` — `LocationProbe`/`StateProbe` render `location.pathname`
  and `location.state` so navigation can be asserted.
- The `@/api/*` modules are `vi.mock`ed per suite; components keep making real
  React Query calls against the mocked api layer, so hooks, keys, and effects
  are exercised for real.
- Note: `@testing-library/dom` matchers such as `toHaveTextContent` are used
  with vitest's default globals disabled — import `describe/it/expect` from
  `"vitest"` in each suite (the eslint config exposes no vitest globals).

## Where things live

- `src/context/` — Auth (tokens, expiry event, cache purge) and Theme
  (light/dark, persisted + system-aware)
- `src/components/guards/` — `RequireAuth`, `RedirectIfAuthed`
- `src/components/layout/` — `AppLayout`, `Navbar`, `MobileNav` (Sheet),
  `PublicHeader`, `Footer`, `PageHeader`, `SkipToContent`
- `src/components/rewrite/` — `UploadStep`, `TemplatePicker` (accessible
  radiogroup), `ResultPanel`
- `src/components/auth/` — `AuthShell` shared by Login/Register
- `src/components/ui/` — Button, Card, Input, Textarea, Label, Badge, Skeleton,
  Separator, DropdownMenu, Dialog, Sheet, Table, ThemeToggle, FileDropzone

## Known lint debt

`npm run lint` is green except for two accepted
`react-refresh/only-export-components` errors on the hook exports in
`src/context/AuthContext.tsx` (`useAuth`) and `src/context/ThemeContext.tsx`
(`useTheme`). Do not add more; fix these by extracting the hooks to their own
files when convenient.

## Design

Minimal-neumorphism hybrid over a warm editorial voice: serif headings, mono for
scores, soft extruded same-bg panels (dual subtle shadows, no hard borders on
cards/buttons/inputs), plus a hairline accent border like `ring-2` only where a
state must be unmistakable (selected template, focus). Tokens and the soft
shadow utilities live in `src/index.css`.

The core trick: neumorphism reads only when a surface sits on the page
background with **zero** colour contrast from it:

- `--color-surface` equals `--color-paper` (`#faf9f6` light, `#14161a` dark), so
  `bg-card` panels levitate purely via shadow, never a fill.
- Shadow tones are `--soft-lo` / `--soft-hi` (`:root`: `#dcd7cc` / `#ffffff`;
  `.dark`: `#0c0d10` / `#1f232a`) — warm-dark shadows on the light side, and
  color-adapted (not inverted) on the dark side for parity.
- Radius tokens: `--radius-sm: 0.375rem`, `--radius-md: 0.75rem`,
  `--radius-lg: 1rem`, `--radius-xl: 1.25rem`. (There is no `--radius` base var.)

Soft shadow utilities are registered with `@utility` so Tailwind variants work:

- `.soft` / `.soft-sm` — raised panels, `.soft-sm` the common card/button weight.
- `.soft-hover` — the hover lift; pair with `hover:soft-hover` + `transition-all`.
- `.soft-inset` / `.soft-inset-sm` — pressed (inputs, active buttons, `active:`).
- `.soft-band` — a subtle full-width band (landing hero band).

Conventions to keep:

- Cards, buttons, inputs, and template tiles are **borderless** raised panels:
  `soft-sm rounded-xl bg-card` (buttons also `hover:soft-hover active:soft-inset-sm`).
  No hard `border` on cards / inputs / tiles. Keep only the muted hairline
  dividers (`border-t/b border-line/70` on Card header/footer, table rows) and
  explicit `border border-dashed border-line/80` for empty/error placeholders.
- Inputs and textareas are in-set: `soft-inset rounded-xl bg-card` with a
  transparent border and `focus:border-accent/50` on top of the global focus ring.
- Use the theme tokens (`paper`, `surface`, `ink`, `ink-muted`, `line`, `accent`,
  `danger`) rather than raw Tailwind palette values. Raw `gray-*` reads cool
  against the warm paper palette.
- Inside a `Card`, do not override the background with `dark:bg-paper-dark` —
  `Card` is `bg-card`, equal to the page, and swapping it breaks the soft shadow.
- Never put `outline-none` on an input. It beats the global `:focus-visible`
  ring in `index.css` on specificity, leaving only a 1px border-colour change.
  Use `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`
  alongside `focus:border-accent`.
- The template picker is a single-select group: `role="radiogroup"` +
  `role="radio"` / `aria-checked`, with a roving `tabIndex` and arrow-key
  navigation on the grid. Selected state = `soft-inset-sm ring-2 ring-accent/30`.
- `Button` with `asChild` renders a single child through Radix `Slot`. Do not
  combine `loading` with `asChild` — the loading spinner is only rendered when
  `loading` is true, so `asChild` gets one child and slots correctly.
- Empty / error / message states use an inset panel with a dashed hairline:
  `soft-inset-sm rounded-xl border border-dashed border-line/80`.
- Three keyframes live in `index.css` and are referenced with Tailwind's
  arbitrary `animate-[...]` syntax: `fadeIn` (entrances), `nudge` (a looping
  march toward the hero CTA — two staggered arrows), and `halo` (a breathing
  accent glow behind the primary CTA via the `AttentionButton` wrapper in
  `Landing.tsx`). All are decorative and `aria-hidden`; the global
  `prefers-reduced-motion: reduce` block in `index.css` zeroes all animation
  durations for those users.