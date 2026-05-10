# VPPS Student Council Election 2026

Frontend app for Shri Veer Patta Senior Secondary School / Veer Patta School student council voting.

Live election data uses Firebase Firestore when the Vite Firebase environment values are present. If Firebase is not configured, the app falls back to demo browser storage only and admin screens show that warning clearly.

## Tech Stack

- Git and GitHub
- React, Vite, TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router
- Firebase-ready: Hosting, Firestore, Auth admin login
- XLSX voter import/export support

## Run Locally

```powershell
npm install
npm run dev
```

Build:

```powershell
npm run build
```

GitHub Pages build:

```powershell
npm run build:gh-pages
```

Deploy after Firebase setup:

```powershell
firebase login
firebase projects:list
firebase deploy
```

## Demo Voting IDs

- `111111` - Test Student 001, not voted
- `222222` - Test Student 002, not voted
- `333333` - Test Teacher 001, not voted
- `444444` - Test Teacher 002, not voted
- `482913` - demo student, already voted
- `104728` - demo student, not voted
- `739250` - demo student, already voted

Expected house behavior:

- `111111` - Test Student 001, Class X A, Red / Rana Pratap House. Sees Rana Pratap Boys House Captain and Rana Pratap Girls House Captain only.
- `222222` - Test Student 002, Class IX A, Blue / Rana Kumbha House. Sees Rana Kumbha Boys House Captain and Rana Kumbha Girls House Captain only.
- `333333` - Test Teacher 001. Sees all eight House Captain contests.
- `444444` - Test Teacher 002. Sees all eight House Captain contests.

## Routes

Local routes use hash routing so the same build works on GitHub Pages:

- `/#/vote` voter flow
- `/#/admin` staff login
- `/#/admin/dashboard` election control room
- `/#/admin/candidates` candidate list
- `/#/admin/voters` voter list
- `/#/admin/control` voting control
- `/#/admin/results` result sheet

GitHub Pages routes:

- `https://veerpatta.github.io/vpps-election-2026/#/vote`
- `https://veerpatta.github.io/vpps-election-2026/#/admin`

## Firebase Google Sign-In Setup

Firebase project created:

- Project ID: `vpps-election-2026`
- Console: `https://console.firebase.google.com/project/vpps-election-2026/overview`

Add real Firebase web app values to `.env.local` using the keys from `.env.example`. Keep `.env.local` private and never commit it.

Admin Google Sign-In setup:

1. Open Firebase Console.
2. Go to Authentication.
3. Enable Google provider.
4. Use the school support email.
5. Add Firebase web config into `.env.local`.
6. Admin access is restricted in the app to `raj@vpps.co.in`.
7. Add authorized domains:
   - `localhost`
   - `veerpatta.github.io`
8. Do not use Email/Password login for admin in this version.

The voter side does not use Google login. Students and teachers vote using their 6-digit Voting ID.

## Candidate Photos

Candidate profiles focus on the candidate photo, name, class, post, house badge, and approval/active status. Election symbols and slogans are kept only as optional old-data fields and are not shown in the normal UI.

For now, candidate photos are added as image URLs from `/admin/candidates` using the **Candidate Photo** field. If no image is added, or if the image fails to load, the app shows a clean initials avatar using the candidate name and house color.

Recommended photo format:

- Same-size portrait images
- Clear face and clean background
- School uniform if possible
- School-approved image source

Future storage/upload support can be added when Firebase Storage or another approved storage path is ready.

## School Houses

VPPS Student Council Election 2026 uses four school houses:

- Red - Rana Pratap House
- Blue - Rana Kumbha House
- Green - Bappa Rawal House
- Yellow - Rana Sanga House

House voting rules:

- Students vote for the general posts and only their own house's two House Captain contests.
- For their own house, students vote for both Boys House Captain and Girls House Captain.
- Teachers vote for the general posts and all eight House Captain contests.
- Students do not select their house while voting.
- The student house comes from the voter record, usually through the voter import file.

General posts:

- Head Boy
- Head Girl
- Discipline Captain
- Sports Captain
- Cultural Captain

House Captain contests:

- Rana Pratap Boys House Captain
- Rana Pratap Girls House Captain
- Rana Kumbha Boys House Captain
- Rana Kumbha Girls House Captain
- Bappa Rawal Boys House Captain
- Bappa Rawal Girls House Captain
- Rana Sanga Boys House Captain
- Rana Sanga Girls House Captain

## Bulk Voter Import

Admin path: `/admin/voters`

Use **Download Template** to get the voter import columns:

- Voter Name
- Voter Type
- Class & Section
- Roll Number / Admission Number
- House
- Department / Role
- Notes

Required for students:

- Voter Name
- Voter Type
- Class & Section
- Roll Number / Admission Number
- House

Required for teachers:

- Voter Name
- Voter Type

Accepted voter type values:

- Student
- Teacher
- student
- teacher

Accepted house values:

- Red
- Rana Pratap
- Rana Pratap House
- red
- Blue
- Rana Kumbha
- Rana Kumbha House
- blue
- Green
- Bappa Rawal
- Bappa Rawal House
- green
- Yellow
- Rana Sanga
- Rana Sanga House
- yellow

Teachers may keep House blank or use `all`; they still vote for all eight House Captain contests.

Import flow:

1. Click **Upload Excel** and select `.xlsx`, `.xls`, or `.csv`.
2. Review total rows, valid rows, errors, warnings, and generated Voting IDs.
3. Fix blocking errors in the file if needed.
4. Click **Import Valid Voters** only after review.

The app generates random unique 6-digit Voting IDs for valid imported rows. IDs are stored as strings, so leading zero IDs such as `048913` remain intact. `000000` is never generated.

Use **Export Voting ID List** to download:

- Voter Name
- Voter Type
- Class & Section
- Roll Number / Admission Number
- House
- Department / Role
- Voting ID

Use **Print List** for a clean printable class/staff distribution list.

## House Image Assets

Run:

```powershell
npm run import:house-assets
```

The original generated filenames do not need to be renamed manually. Place them in `incoming-house-assets/`, the project root, `assets/`, `public/`, or the user Downloads folder, then run `npm run import:house-assets`.

Canonical hero paths:

- `public/houses/heroes/rana-pratap-hero.png`
- `public/houses/heroes/rana-kumbha-hero.png`
- `public/houses/heroes/bappa-rawal-hero.png`
- `public/houses/heroes/rana-sanga-hero.png`

Canonical logo paths:

- `public/houses/logos/rana-pratap-house-logo.png`
- `public/houses/logos/rana-kumbha-house-logo.png`
- `public/houses/logos/bappa-rawal-house-logo.png`
- `public/houses/logos/rana-sanga-house-logo.png`

Do not hotlink random web images. Use only school-approved images or public-domain images with permission suitable for school election use.

If any image is missing or fails to load, the app shows a shield or flag fallback and does not crash.

## GitHub Pages Deployment

This Vite app is configured for the GitHub Pages project site path:

```powershell
npm run build:gh-pages
```

GitHub repository setup:

1. Open the GitHub repository settings.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or `master`. The workflow triggers on both because this repo currently uses `master` as its default branch.
5. Expected site URL: `https://veerpatta.github.io/vpps-election-2026/`

The public voter route will be:

- `https://veerpatta.github.io/vpps-election-2026/#/vote`

The admin route will be:

- `https://veerpatta.github.io/vpps-election-2026/#/admin`

For Firebase Google Sign-In on GitHub Pages, add this authorized domain in Firebase Authentication:

- `veerpatta.github.io`

GitHub Pages builds need Firebase Vite environment values if admin login should work on the deployed site. Add them in GitHub repository settings under **Secrets and variables > Actions** as secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Do not commit `.env.local`. If these secrets are missing, the deployed app uses **Demo Browser Storage**, which is only for testing and is not valid for a real election.

## Firebase Console Checklist

1. Firebase project:
   - Project ID: `vpps-election-2026`

2. Authentication:
   - Go to Firebase Console > Authentication > Sign-in method.
   - Enable Google provider.
   - Use the school support email.
   - Admin access in the app is restricted to `raj@vpps.co.in`.

3. Web app config:
   - Add Firebase web app.
   - Copy config values into `.env.local`.
   - Use the keys from `.env.example`.
   - Never commit `.env.local`.

4. Firestore:
   - Do not create Firestore casually.
   - Firestore location is permanent.
   - Choose the nearest India region if available.
   - After location is confirmed, create the database.

5. Hosting:
   - Run `npm run build`.
   - Run `firebase deploy`.

## Firestore Setup

Confirm the Firestore location before creating the first database. The location choice is permanent. Use the nearest India region if available in Firebase Console.

The live app uses these collections:

- `elections/current`
- `voters/{voterId}`
- `candidates/{candidateId}`
- `votes/{voteId}`

Admin access is restricted to Google login for `raj@vpps.co.in`. Public voters can use the 6-digit Voting ID flow without Google login. Vote documents do not store voter name, Voting ID, or voter id.

## Live Voting Data

There are two storage modes:

- **Firestore Live Backend**: real election mode. Votes, voter `hasVoted` state, turnout, and results are shared across browsers and devices.
- **Demo Browser Storage**: local testing only. Votes stay inside one browser profile and are not shared with incognito, another browser, another device, or another deployed domain.

Do not run the real election until admin shows **Data Mode: Firestore Live Backend** and the following checks pass:

1. Seed or import voters and candidates into Firestore.
2. Open normal browser and vote using a test ID such as `111111`.
3. Open incognito/private browser and try the same ID.
4. Confirm it says the Voting ID has already been used.
5. Check another browser/device if available.
6. Confirm admin dashboard turnout updates from Firestore.
7. Close voting in admin and confirm the public voter page blocks voting.
8. Reopen voting only if needed and test with an unused test ID.

GitHub Pages production builds require these repository secrets so the deployed site connects to Firestore:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

The current client transaction re-reads the voter document, checks `hasVoted === false`, writes vote documents, and updates the voter to `hasVoted: true` with `votedAt` in the same Firestore transaction. Firestore rules also block vote documents from containing voter identity fields. A callable Cloud Function would be stronger for public write validation, but this version prioritizes reliable shared voting state with the existing static GitHub Pages app.

## Brand Assets

Put the official Veer Patta Senior Secondary School logo files in `public/brand/`:

- `vpps-logo-full.png`
- `vpps-logo-icon.png`
- `vpps-logo-square.png`
- `vpps-reference-banner.png`

The app uses these assets on the welcome screen, voting screens, admin login, admin header, favicon, thank-you screen, and result print sheet. If a logo image is missing or fails to load, the UI falls back to clean VPPS/school-name text instead of crashing.

## Candidate Photo Workflow

Put the candidate Excel workbook with embedded photos in `incoming-candidates/`. Put the school uniform reference image in the same folder, preferably named `uniform-reference.jpg`.

Run the workflow in this order:

```bash
npm run extract:candidate-photos
npm run generate:candidate-portraits
npm run import:real-candidates
```

The extraction step reads the candidate sheet, maps embedded photos by worksheet row, saves source images to `public/candidates/originals/`, writes `data/candidate-photo-mapping.json`, and writes `exports/candidate-photo-mapping.csv`.

Discipline, Cultural, and Sports candidates are imported as separate Boys and Girls voting posts. Workbook values such as `Discipline Captain Boy`, `Dicipline` + `Male`, `Cultural Captain Girl`, `Cluthural` + `Female`, `Sports Captain Boy`, and `Sport` + `Girl` are normalized to the canonical app post IDs.

Portrait generation uses the extracted source photo plus the uniform reference to create a clean school-election portrait in `public/candidates/final/`. It requires `OPENAI_API_KEY` in the environment and does not generate fake faces for rows without a source photo. If the key is missing, the command stops with:

```text
OPENAI_API_KEY required for portrait generation. Please set it, then tell me to continue.
```

Rows without embedded photos use reusable placeholders from `public/candidates/placeholders/`. The import step updates `src/data/realCandidates.ts`; generated portraits are used when present, missing-photo rows use placeholders, and raw extracted originals are not used as final app images.

For a single guarded run after the API key is configured:

```bash
npm run process:candidates
```

The summary report is written to `exports/candidate-processing-summary.md`.

## Next Phase Roadmap

### Phase 1A: Brand Polish

- Logo integration
- Favicon
- Branded welcome/admin/result screens
- Print result sheet polish

### Phase 1B: UI Review

- Review mobile voting flow
- Review admin dashboard
- Confirm school colors/logo usage
- Confirm staff wording is simple

### Phase 2: Firebase Connection

- Create Firebase project
- Add Firebase web app config
- Enable Firebase Google Sign-In for admin
- Create Firestore collections:
  - `elections`
  - `candidates`
  - `voters`
  - `votes`
- Confirm Firestore service is active in admin data mode

### Phase 3: Real Data Setup

- Add approved candidates
- Add student voters
- Add teacher voters
- Generate 6-digit Voting IDs
- Use Excel/CSV bulk voter import and Voting ID export
- Add printable Voting ID slips/sheets

### Phase 4: Testing/UAT

Use only test voters first:

- Test Student 001 - `111111`
- Test Student 002 - `222222`
- Test Teacher 001 - `333333`
- Test Teacher 002 - `444444`

Test:

- Valid Voting ID
- Invalid Voting ID
- Duplicate voting prevention
- Teacher voting flow
- Voting open/closed state
- Candidate selection
- Review vote
- Submit vote
- Result calculation
- CSV export
- Print result sheet

### Phase 5: Real Election Day

- Finalize candidates
- Finalize voter list: students + teachers
- Generate 6-digit Voting IDs
- Print class-wise and staff-wise Voting ID sheets
- Test on actual device
- Open voting
- Monitor turnout
- Close voting
- Review/export results
- Publish/print final result after approval

## Login-Required Services

- GitHub CLI: `gh auth login`
- Firebase CLI: `firebase login`
- Firebase Console: create or confirm the Firebase web app config if the CLI cannot finish setup

## Current Limitations

- Admin login uses Firebase Google Sign-In and only allows `raj@vpps.co.in`.
- Public vote submission is handled by the client Firestore transaction, not a callable Cloud Function.
- Demo Browser Storage remains available only when Firebase config is missing and must not be used for the real election.
