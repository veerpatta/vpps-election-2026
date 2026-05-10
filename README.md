# 🗳️ VPPS Student Council Election 2026

A simple, beautiful, school election web app for **Shri Veer Patta Senior Secondary School**.

This app is ready for the VPPS Student Council Election 2026. Students and teachers vote with their 6-digit Voting ID, and the election team manages voting from the Admin Control Room.

## ✅ Current Status: READY FOR ELECTION

| Item | Final Status |
| --- | --- |
| Backend connected | ✅ Firestore Live Backend |
| Public website | ✅ Live |
| Voters | ✅ Ready |
| Candidates | ✅ Ready |
| Election posts | ✅ All covered |
| Vote count before election | ✅ 0 |
| Results | ✅ Unpublished |
| Remaining blockers | ✅ None |
| Current voting status | 🔒 Voting Closed until admin opens voting |
| Final confirmed commit | `069c37c` |

> **Important:** Before voting starts, the admin must open the Admin Control Room and change the status from **Voting Closed** to **Voting Open**.

## 🔗 Important Links

| Purpose | Link |
| --- | --- |
| Student / Teacher Voting Page | https://veerpatta.github.io/vpps-election-2026/#/vote |
| Admin Control Room | https://veerpatta.github.io/vpps-election-2026/#/admin |
| GitHub Repo | https://github.com/veerpatta/vpps-election-2026 |
| Firebase Console | https://console.firebase.google.com/project/vpps-election-2026/overview |

## 👥 Final Voter List

| Voter Detail | Count |
| --- | ---: |
| Total voters | 178 |
| Students | 146 |
| Teachers | 32 |
| Missing house records | 0 |
| Duplicate Voting IDs | 0 |
| Invalid Voting IDs | 0 |

Students and teachers vote with a **6-digit Voting ID**. No student login or password is required.

## 🧑‍🎓 Candidate Setup

| Candidate Detail | Status |
| --- | --- |
| Candidates | 41 |
| Election posts/categories | 16 |
| All posts have active approved candidates | ✅ Yes |
| Candidate photos/placeholders | ✅ Ready |

## 🏆 Election Posts

### General Leadership

- Head Boy
- Head Girl

### Discipline

- Discipline Captain Boys
- Discipline Captain Girls

### Cultural

- Cultural Captain Boys
- Cultural Captain Girls

### Sports

- Sports Captain Boys
- Sports Captain Girls

### House Captains

- Rana Pratap Boys House Captain
- Rana Pratap Girls House Captain
- Rana Kumbha Boys House Captain
- Rana Kumbha Girls House Captain
- Bappa Rawal Boys House Captain
- Bappa Rawal Girls House Captain
- Rana Sanga Boys House Captain
- Rana Sanga Girls House Captain

## 🏠 School Houses

| Colour | House |
| --- | --- |
| Red | Rana Pratap House |
| Blue | Rana Kumbha House |
| Green | Bappa Rawal House |
| Yellow | Rana Sanga House |

House voting rules:

- Students vote only for their own house Boys/Girls House Captain posts.
- Teachers vote for all house captain posts.
- Students do not select their own house while voting. Their house comes from the final voter list.

## 🧭 How Voting Works

1. Student or teacher opens the Voting Page.
2. They enter their 6-digit Voting ID.
3. The app shows only the posts they are allowed to vote for.
4. They select one candidate per post.
5. They review their vote.
6. They submit the final vote.
7. The same Voting ID cannot be used again.

## 🛡️ Fairness Rules

- **One Voting ID = one vote.**
- The same Voting ID cannot vote again.
- Incognito mode, another browser, or another device cannot bypass the one-vote rule.
- Votes are saved in **Firestore Live Backend**.
- Vote records do **not** store voter name or Voting ID.
- Results stay unpublished until the admin publishes them.

## 🖥️ Admin Control Room

The Admin Control Room is for the approved school admin account only. Admin login uses **Google Sign-In**.

Admin can:

- Open and close voting.
- View, edit, deactivate, or delete voters.
- View, edit, deactivate, or delete candidates.
- Monitor turnout.
- View results after voting is closed.
- Export or print results.

Admin should not share access with students or unapproved users.
Use **Deactivate** when a record should be blocked but kept for review. Use **Delete** only for wrong or duplicate records because deletion is permanent.

## 🚦 Election Day SOP

### Before Voting Starts

- [ ] Open the Admin Control Room.
- [ ] Login with the approved school admin Google account.
- [ ] Confirm **Data Mode: Firestore Live Backend**.
- [ ] Confirm status is **Voting Closed**.
- [ ] Confirm vote count is **0**.
- [ ] When ready, set status to **Voting Open**.

### During Voting

- [ ] Keep the admin dashboard open.
- [ ] Monitor turnout.
- [ ] Do not publish results.
- [ ] Help students/teachers with Voting ID issues only.
- [ ] Do not reset data.

### After Voting Ends

- [ ] Set status to **Voting Closed**.
- [ ] Check final turnout.
- [ ] View results.
- [ ] Export or print results.
- [ ] Publish results only after school approval.

## ⚠️ Very Important Warning

If **Data Mode** shows **Demo Browser Storage**, do **not** run the real election.

That mode is only for testing. Votes in Demo Browser Storage are not shared across devices and are not valid for the real election.

The real election must run only in:

> **Firestore Live Backend**

## 🔥 Firebase / Backend Status

Live election data is stored in **Firebase Firestore**.

| Backend Item | Status |
| --- | --- |
| Real data storage | Firestore Live Backend |
| Database location | `asia-south2` |
| Admin login | Firebase Google Sign-In |
| Website build secrets | Stored in GitHub Actions secrets |

Do not commit secrets, passwords, private tokens, service account keys, or Firebase private values.

It is safe to document these secret names only:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🚀 Deployment

- The public website is hosted on **GitHub Pages**.
- A GitHub Actions workflow deploys the app when updates are pushed to `master` or `main`.
- The current deployed election app is live at the public URLs listed above.

## 🧪 Final Readiness Checks Passed

- [x] Build passed.
- [x] Tests passed.
- [x] Lint passed.
- [x] GitHub Pages deploy passed.
- [x] Firestore duplicate-vote protection checked.
- [x] Voters checked.
- [x] Candidates checked.
- [x] All 16 posts checked.
- [x] Vote count before election is 0.
- [x] Results are unpublished.
- [x] Remaining blockers: none.

## 📌 Quick Start for Election Incharge

1. Open the Admin Control Room.
2. Confirm **Firestore Live Backend**.
3. Set voting to **Voting Open**.
4. Share the Voting Page with students and teachers.
5. After voting, set voting to **Voting Closed**.
6. Export or print the result.

## 📚 Staff Guides

| Guide | Purpose |
| --- | --- |
| [Election Day SOP](docs/ELECTION_DAY_SOP.md) | Step-by-step election day checklist |
| [Final Readiness Status](docs/FINAL_READINESS_STATUS.md) | Final counts, deployment status, and readiness summary |
| [Admin Guide](docs/ADMIN_GUIDE.md) | How the admin uses the control room |
| [Voter Help](docs/VOTER_HELP.md) | Simple help for students and teachers |

## 🧑‍💻 Technical Notes

This section is only for the person maintaining the website.

### Local Checks

```powershell
npm run build
npm run test
npm run lint
```

### Local Run

```powershell
npm install
npm run dev
```

### GitHub Pages Build

```powershell
npm run build:gh-pages
```

### Firebase Safety

- Keep `.env.local` private.
- Do not commit Firebase values.
- Do not commit service account keys.
- Use GitHub Actions secrets for the public deployment.
- Demo Browser Storage is only a testing fallback when Firebase values are missing.
