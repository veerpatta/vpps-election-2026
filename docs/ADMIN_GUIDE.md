# 🖥️ Admin Guide

This guide is for the election incharge or approved school admin who will manage the VPPS Student Council Election 2026.

## 🔗 Admin Control Room

https://veerpatta.github.io/vpps-election-2026/#/admin

## 🔐 Login

- Admin login uses **Google Sign-In**.
- Only the approved school admin account can access admin tools.
- Do not write or share passwords.
- Do not share admin access with students.

## ✅ First Check After Login

Before doing anything else, check the top/admin status area:

| Check | Correct Value |
| --- | --- |
| Data Mode | Firestore Live Backend |
| Election status before voting | Voting Closed |
| Vote count before election | 0 |
| Results | Unpublished |

## ⚠️ Data Mode Warning

If the app shows **Demo Browser Storage**, stop immediately.

Demo Browser Storage is only for testing. It is not valid for the real election because votes are not shared across devices.

The real election must run only in:

> **Firestore Live Backend**

## 🚦 Voting Status Meaning

| Status | Meaning |
| --- | --- |
| Voting Closed | Voters cannot submit votes. Use this before and after the election. |
| Voting Open | Voters can submit final votes. Use this only during official voting time. |

## 🟢 How to Open Voting

1. Open the Admin Control Room.
2. Login with the approved school admin Google account.
3. Confirm **Firestore Live Backend**.
4. Confirm vote count is **0** before the election starts.
5. Change status from **Voting Closed** to **Voting Open**.
6. Confirm the Voting Page is accepting Voting IDs.

## 🔴 How to Close Voting

1. Open the Admin Control Room.
2. Change status from **Voting Open** to **Voting Closed**.
3. Confirm the Voting Page is no longer accepting votes.
4. Check final turnout.
5. View results.
6. Export or print results.

## 📊 Results and Export

Use results only after voting is closed.

- View results in the Admin Control Room.
- Export or print the result sheet.
- Publish results only after director/election incharge approval.

## ✅ Admin Can

- Open or close voting.
- View, edit, deactivate, or delete voters.
- View, edit, deactivate, or delete candidates.
- Monitor turnout.
- View results after closing voting.
- Export or print results.

## 🗑️ Delete vs Inactive

| Action | When to Use |
| --- | --- |
| Mark inactive | Use when a voter or candidate should be blocked but kept in the records for review. |
| Delete | Use only for wrong or duplicate records. Delete is permanent. |

## 🚫 Admin Should Not Reset

- Do not reset votes.
- Do not reset voter status.
- Do not delete voters.
- Do not delete candidates.
- Do not change backend settings.
- Do not publish results before approval.
- Do not use Demo Browser Storage for real voting.

## 🆘 Common Problems

| Problem | Action |
| --- | --- |
| Cannot login | Use the approved school admin Google account and check internet. |
| Voting Page says voting is closed | Open voting from the Admin Control Room when the election is ready. |
| A voter says ID already used | Do not allow a second vote. Inform election incharge. |
| Data Mode is Demo Browser Storage | Stop. Do not conduct the election until Firestore Live Backend is shown. |
| Results are not visible | Close voting first, then check results. |
