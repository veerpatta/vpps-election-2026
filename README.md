# VPPS Student Council Election 2026

Frontend prototype for Shri Veer Patta Senior Secondary School / Veer Patta School student council voting.

The current phase is a local prototype with mock data and browser storage. Firebase files are prepared, but the app does not need Firebase to run locally.

## Tech Stack

- Git and GitHub
- React, Vite, TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router
- Firebase-ready: Hosting, Firestore, Auth placeholders

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
- `/admin` staff login placeholder
- `/admin/dashboard` election control room
- `/admin/candidates` candidate list
- `/admin/voters` voter list
- `/admin/control` voting control
- `/admin/results` result sheet

## Firebase Setup Notes

Firebase is not connected yet. Add real Firebase web app values to `.env.local` using the keys from `.env.example`.

Required later:

- Firebase Hosting project selected in `.firebaserc`
- Firestore rules reviewed before live data
- Firebase Authentication Email/Password enabled for admin login

## Login-Required Services

- GitHub CLI: `gh auth login`
- Firebase CLI: `firebase login`
- Firebase Console: create or confirm the Firebase web app config if the CLI cannot finish setup

## Current Limitations

- Staff login is a visual placeholder.
- Data is stored in localStorage only.
- Firebase Auth, Firestore, and Hosting are prepared but not connected to live production data.
