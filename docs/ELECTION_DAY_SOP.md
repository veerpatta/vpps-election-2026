# 🚦 VPPS Election Day SOP

This is the simple election-day checklist for the VPPS Student Council Election 2026.

## ✅ Final Status

| Item | Status |
| --- | --- |
| App readiness | ✅ Ready for election |
| Backend mode for real voting | Firestore Live Backend |
| Current status | Voting Closed |
| Vote count before election | 0 |
| Results | Unpublished |
| Remaining blockers | None |

## 🔗 Pages

| Page | Link |
| --- | --- |
| Voting Page | https://veerpatta.github.io/vpps-election-2026/#/vote |
| Admin Control Room | https://veerpatta.github.io/vpps-election-2026/#/admin |

## 1. Before Voting Starts

- [ ] Open the Admin Control Room.
- [ ] Login with the approved school admin Google account.
- [ ] Confirm **Data Mode: Firestore Live Backend**.
- [ ] Confirm election status is **Voting Closed**.
- [ ] Confirm vote count is **0**.
- [ ] Confirm results are **unpublished**.
- [ ] Keep the Voting Page ready for students and teachers.

## 2. Starting Voting

- [ ] Confirm the school is ready to begin.
- [ ] In the Admin Control Room, change status from **Voting Closed** to **Voting Open**.
- [ ] Open the Voting Page on one device and confirm the Voting ID screen is available.
- [ ] Share the Voting Page link with students and teachers.

## 3. During Voting

- [ ] Keep the admin dashboard open.
- [ ] Monitor turnout.
- [ ] Help students and teachers only with Voting ID problems.
- [ ] Do not publish results during voting.
- [ ] Do not reset voters, candidates, votes, or settings.
- [ ] If a Voting ID was already used, do not issue another vote without election incharge approval.

## 4. Closing Voting

- [ ] Announce that voting is ending.
- [ ] In the Admin Control Room, change status from **Voting Open** to **Voting Closed**.
- [ ] Confirm the public Voting Page no longer accepts votes.
- [ ] Check final turnout.

## 5. Results

- [ ] View results only after voting is closed.
- [ ] Export or print the result sheet.
- [ ] Share results with the director/election incharge for approval.
- [ ] Publish results only after approval.

## 🆘 Emergency Checklist

| Situation | What to Do |
| --- | --- |
| Data Mode shows Demo Browser Storage | Stop. Do not run voting. Use only Firestore Live Backend. |
| Admin cannot login | Use only the approved school admin Google account. Check internet and Google Sign-In. |
| Voting Page says voting is closed | Admin must open voting from the Admin Control Room. |
| Voting ID not working | Check the Voting ID from the final list. Do not guess IDs. |
| Same ID already voted | Do not allow a second vote. Inform the election incharge. |
| Internet problem | Pause voting until connection is stable. |

## 🚫 What Not to Touch

- Do not reset election data.
- Do not delete voters.
- Do not delete candidates.
- Do not change Firebase settings during voting.
- Do not change GitHub secrets during voting.
- Do not use Demo Browser Storage for real voting.
- Do not share admin access with students.

## ✅ End-of-Day Handover

- [ ] Voting is closed.
- [ ] Final turnout is checked.
- [ ] Result sheet is exported or printed.
- [ ] Results are approved before publishing.
- [ ] No passwords, secrets, or private keys are shared in any report.
