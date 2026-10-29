# HARF — Human Agency, Reasoning & Futures

A Living Memory of the AI transition: a platform where people share how AI is changing the way they think, learn,
work and feel, and where HARF editors review, theme and publish anonymized excerpts.

**Live:** https://harf.media (also https://www.harf.media and https://main.d1teugon3t49oi.amplifyapp.com). The archive currently holds fictional sample entries.

## What's here

| Route | Purpose |
| --- | --- |
| `/` | Landing page: the idea, three actions, Question of the Week, archive preview |
| `/share/` | Open testimony in three steps: write → optional context → consent. Returns a private participant code |
| `/share/?weekly=<id>` | Respond to the Question of the Week |
| `/archive/` | Published excerpts, filterable by theme |
| `/survey/` | The existing Tally questionnaire (embedded + link), a separate pathway |
| `/privacy/`, `/about/` | Privacy notice (draft) and project background |
| `/admin/` | Editors only: review, theme, notes, approve & publish excerpts, delete on request, Question of the Week, CSV/JSON export |

## Stack

- **Frontend:** Next.js 16 (App Router, static export), React 19, Tailwind CSS 4 — hosted on **AWS Amplify Hosting**
- **Backend:** **AWS Amplify Gen 2** → AppSync GraphQL API + **DynamoDB** tables, two Lambda functions, Cognito
- Region `us-east-2`, Amplify app `d1teugon3t49oi`, branch `main`

## Data design

```
Testimony       private   original text (immutable), context, consent record + version, participantRef,
                          editorial status, themes, notes, excerpt draft
Contact         private   separate table; only exists if the participant opted in to follow-up
Excerpt         public    edited, anonymized excerpt; no link back to the private testimony
WeeklyQuestion  public    Question of the Week, managed in the dashboard

S3 bucket (Amplify Storage)
uploads/        guests can write, never read; expires after 1 day
media/<id>/     files accepted with a testimony; editors only
```

Rules enforced on the server, not just in the UI:

- Participants submit as unauthenticated guests through `submitTestimony` (Lambda): validation, research consent
  required, consent version checked, contact details written to the separate table only with contact consent.
- Guests can read only `Excerpt` and `WeeklyQuestion`. They cannot read testimonies or contacts (`npm run check:access`).
- Editors (Cognito group `ADMINS`) can read testimonies but **cannot modify** the original text, context or consent
  fields (field-level authorization). They can edit status, themes, notes and the excerpt draft.
- `publishExcerpt` refuses any testimony without publication consent, or withdrawn. Nothing is published automatically.
- `removeTestimony` deletes a testimony together with its contact record and published excerpt.
- **Longitudinal participation:** each submission returns a code like `HARF-7K2M-QX9D-4TPA`. Only its SHA-256 hash is
  stored (`participantRef`, indexed), so a returning participant's entries are linked without identifying them.
- **Attachments:** up to 5 images, audio or video files (50 MB each) per testimony. Files upload only when the
  participant submits, after consent. `submitTestimony` checks each file's type and size and moves it to
  `media/<testimonyId>/`, which only editors can read. The testimony stores just the keys.
- Point-in-time recovery (35 days) is enabled on every table; the media bucket is versioned with old versions
  expiring after 35 days. Self sign-up is disabled in Cognito.

Shared vocabulary (themes, prompts, feelings, consent text and version) lives in `src/lib/harf.ts` and is used by
both the site and the Lambda functions. **Bump `CONSENT_VERSION` whenever consent wording changes.**

## Working on it

```bash
npm install
AWS_PROFILE=chenyu npm run backend:outputs   # writes amplify_outputs.json for the deployed backend
npm run dev                                  # http://localhost:3000, talks to the deployed backend
```

For an isolated personal backend instead: `AWS_PROFILE=chenyu npx ampx sandbox`.

| Command | |
| --- | --- |
| `AWS_PROFILE=chenyu npm run deploy` | Deploy backend + site to Amplify (`scripts/deploy.sh`) |
| `AWS_PROFILE=chenyu npm run invite-editor -- someone@example.org` | Create an editor; Cognito emails a temporary password |
| `AWS_PROFILE=chenyu npm run seed` / `seed:remove` | Add / remove the fictional sample entries (all marked `synthetic`) |
| `npm run check:access` | Verify guest access rules against the live API |
| `npm run typecheck`, `npm run lint` | |

`amplify.yml` is ready for when the GitHub repo is connected to the Amplify app for CI/CD deploys.

## Before opening to real submissions

- Finalize the privacy notice (`/privacy/`) and add a contact address for removal requests.
- Run `npm run seed:remove` to delete the fictional samples. (A "testing preview" banner can be shown by building with `NEXT_PUBLIC_HARF_PREVIEW=true`.)
- Consider AWS WAF rate limiting on the AppSync API, and a custom domain.
