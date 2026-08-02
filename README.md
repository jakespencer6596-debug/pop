# POP - Pickleball Operating Platform

POP is a web app for running pop-up pickleball tournaments. It replaces the spreadsheet-and-group-text workflow with one tool: it generates a rotating-partner round robin schedule, tracks live scores, ranks players automatically, runs the championship Super Money Round, and shows a public live leaderboard that players and spectators can follow on their phones or a big screen.

The standard format is 16 players on 4 courts. Round 1 is six games of rotating-partner doubles where every player earns an individual record. The top 6 advance to the Super Money Round, which can run as a round robin (default) or a single elimination bracket, in singles or doubles.

## Tech stack

- Next.js (App Router) with TypeScript in strict mode
- React, Tailwind CSS, SWR for polling
- Prisma ORM with PostgreSQL
- Zod for API input validation
- iron-session for the admin session cookie
- Vitest for unit tests, Playwright for the end-to-end smoke test

## Design tokens

POP wears the Pickleball Kingdom look: a dark navy-black base, gold for emphasis, royal blue for actions, and condensed uppercase headline type (Oswald for display, Inter for UI).

| Token | Value | Use |
| --- | --- | --- |
| Kingdom Ink | `#101820` | Top navigation, headings, public big-screen background |
| Kingdom Gold | `#F9E01D` | Active indicators, leader emphasis, Advancing badge, wordmark dot |
| Gold deep | `#E4CC00` | Hover on gold fills |
| Kingdom Blue | `#0056B8` | Primary buttons, links, focus rings |
| Blue hover | `#00429A` | Primary button hover |
| Blue tint | `#E7EEF8` | Subtle info surfaces |
| Canvas | `#F4F6F8` | App background |
| Surface | `#FFFFFF` | Cards |
| Border | `#E2E6EA` | Dividers and card borders |
| Body text | `#2A2F36` | Default text |
| Muted text | `#5B6570` | Secondary text |
| Positive | `#12A150` | Wins, paid |
| Danger | `#D22E2E` | Losses, alerts |
| Night surface | `#16202B` | Cards on the big-screen view |
| Night muted | `#93A1AF` | Secondary text on dark |
| Win green (dark) | `#29C46A` | Wins on the big-screen view |

Gold is never used as small text on light backgrounds; as text it appears only on the Kingdom Ink dark background.

## Prerequisites

- Node.js 20.9 or newer
- A PostgreSQL 16 database. Either Docker (compose file included) or a free hosted Postgres such as Neon.

## Local setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the database. With Docker:

   ```
   docker compose up -d
   ```

   This runs Postgres 16 on port 5432 and produces the connection string `postgresql://pop:pop@localhost:5432/pop`.

   Without Docker: create a free database at neon.tech (or any hosted Postgres) and copy its connection string instead.

3. Create your env file:

   ```
   copy .env.example .env
   ```

   Set `DATABASE_URL` to the connection string from step 2, pick an `ADMIN_PASSWORD`, and set `SESSION_SECRET` to any random string of at least 32 characters.

4. Apply migrations and seed the demo data:

   ```
   npx prisma migrate dev
   npx prisma db seed
   ```

   The seed creates "POP Test Event", a fully played tournament with 16 players, complete Round 1 standings, a finished Super Money Round with a champion, and a mix of Venmo, cash, and unpaid entries. It also creates a second tournament still in setup. The seed resets tournament data, so it is safe to re-run.

5. Run the app:

   ```
   npm run dev
   ```

   Open http://localhost:3000. You will land on `/login`; sign in with the `ADMIN_PASSWORD` from your `.env`.

## Scripts

- `npm run dev` - development server
- `npm run build` - production build (runs `prisma generate` first)
- `npm run start` - production server
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript
- `npm test` - unit tests (schedule generator, standings, scoring, money round)
- `npm run test:e2e` - Playwright smoke test (starts its own server on port 3100; needs the database running)
- `npx prisma db seed` - reset and reseed demo data

## Deploying to Render

The repo includes `render.yaml`, a Render blueprint that defines the web service and a managed PostgreSQL database.

1. Push the repo to GitHub and create a new Blueprint in the Render dashboard, pointing at the repo.
2. Render provisions the `pop-db` database and wires `DATABASE_URL` into the web service automatically.
3. Set `ADMIN_PASSWORD` when prompted (it is marked `sync: false`, so Render asks for a value). `SESSION_SECRET` is generated for you.
4. On each deploy, the pre-deploy step runs `prisma migrate deploy`, so the first deploy creates the schema.
5. Optional: seed demo data by running `npx prisma db seed` from a shell on the service (or locally with `DATABASE_URL` pointed at the Render database).

After the deploy, the admin login is at `https://your-service.onrender.com/login`. The public pages are `/live/<tournament id>` and `/pay/<tournament id>`; both are linked with copy buttons on the tournament Setup tab.

## Environment variables

- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - the single organizer password for `/login`
- `SESSION_SECRET` - at least 32 characters; signs the session cookie (12 hour sessions)

## Organizer guide

1. **Create the tournament.** From the dashboard, choose Create tournament. The defaults match the standard format: 4 courts, games to 11 win by two, 6 round robin games, top 6 advancing, singles round robin money round. Set the entry fee, prize pool, and your Venmo handle here.
2. **Add players.** On the Players tab, add up to 16 names. Toggle check-in as people arrive and record payments (Venmo or cash) as they come in. The Payments tab shows expected, collected, and outstanding totals.
3. **Generate the schedule.** Once the field is a full multiple of 4, the Schedule tab generates the rotating-partner rounds. Nobody sits out, nobody is double-booked, and partners do not repeat. Regenerate reshuffles with a new seed.
4. **Enter scores.** The Scoring tab is built for a phone at courtside: pick the round, punch in both scores, and mark the game final. Standings update below as games close. Scores that break the target or win-by-two rule are flagged, with an override for unusual finishes.
5. **Start the money round.** When every Round 1 game is final, the Money round tab locks the top 6 with their seeds and generates the championship games for your configured format. Score it the same way through to a champion; the Results tab then shows the final placement.
6. **Share the links.** The Setup tab has copy buttons for the public live leaderboard (dark, big-screen friendly, auto-refreshing) and the pay page (Venmo link plus QR code, with cash accepted at the desk).
