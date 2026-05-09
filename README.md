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

## Run Locally

```powershell
npm install
npm run dev
```

Build:

```powershell
npm run build
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

## Routes

- `/` redirects to `/vote`
- `/vote` voter flow
- `/admin` staff login
- `/admin/dashboard` election control room
- `/admin/candidates` candidate list
- `/admin/voters` voter list
- `/admin/control` voting control
- `/admin/results` result sheet

## Firebase Admin Login Setup

Firebase project created:

- Project ID: `vpps-election-2026`
- Console: `https://console.firebase.google.com/project/vpps-election-2026/overview`

Add real Firebase web app values to `.env.local` using the keys from `.env.example`. Keep `.env.local` private and never commit it.

Enable Firebase Authentication:

1. Open Firebase Console.
2. Go to Build > Authentication.
3. Click Get Started if needed.
4. Go to Sign-in method.
5. Enable Email/Password.
6. Save.

Create the admin user:

- Admin email: `raj@vpps.co.in`
- Never commit, print, or document the admin password.
- Create the user manually in Firebase Console > Authentication > Users > Add user, or use the local script below.

Local script option:

```powershell
$env:ADMIN_EMAIL="raj@vpps.co.in"
npm run admin:create-user
```

The script asks for the password in the local terminal only. It uses Firebase Admin SDK with Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` if configured.

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
- Enable Firebase Auth for admin
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
- Add CSV import/export if needed
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

- Staff login is a visual placeholder.
- Data is stored in localStorage only.
- Firebase Auth, Firestore, and Hosting are prepared but not connected to live production data.
