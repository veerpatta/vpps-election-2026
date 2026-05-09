# VPPS Student Council Election 2026

Frontend prototype for Shri Veer Patta Senior Secondary School / Veer Patta School student council voting.

The voter flow currently uses mock data and browser storage. Firebase Auth is used for the admin login when `.env.local` contains the Firebase web app config.

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

- `111111` - Test Student 001, Class X A, Red / Rana Pratap House. Sees only Rana Pratap House Captain candidates.
- `222222` - Test Student 002, Class IX A, Blue / Rana Kumbha House. Sees only Rana Kumbha House Captain candidates.
- `333333` - Test Teacher 001. Sees all four House Captain posts.
- `444444` - Test Teacher 002. Sees all four House Captain posts.

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

- Students vote for the general posts and only their own House Captain post.
- Teachers vote for the general posts and all four House Captain posts.
- Students do not select their house while voting.
- The student house comes from the voter record, usually through the voter import file.

General posts:

- Head Boy
- Head Girl
- Discipline Captain
- Sports Captain
- Cultural Captain

House Captain result posts:

- Rana Pratap House Captain
- Rana Kumbha House Captain
- Bappa Rawal House Captain
- Rana Sanga House Captain

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

Teachers may keep House blank or use `all`; they still vote for all four House Captain posts.

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
4. Push to `main`. The workflow also accepts `master` because this repo currently uses `master` as its default branch.
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

Do not commit `.env.local`. If these secrets are missing, the deployed voter flow can still load, but admin login will show the Firebase setup-needed message.

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

For now, the voter flow still uses localStorage and 6-digit Voting IDs. Firestore rules are prepared conservatively:

- Signed-in Firebase admins can manage future election collections.
- Public vote writes are not open yet.
- Final live voting rules need testing before election day.

## Brand Assets

Put the official Veer Patta Senior Secondary School logo files in `public/brand/`:

- `vpps-logo-full.png`
- `vpps-logo-icon.png`
- `vpps-logo-square.png`
- `vpps-reference-banner.png`

The app uses these assets on the welcome screen, voting screens, admin login, admin header, favicon, thank-you screen, and result print sheet. If a logo image is missing or fails to load, the UI falls back to clean VPPS/school-name text instead of crashing.

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
- Replace localStorage service with Firebase service

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
- Data is stored in localStorage only.
- Firestore and Hosting are prepared but not connected to live production voting data.
