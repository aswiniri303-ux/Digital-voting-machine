# Firestore Security Specification - Arafa Student EVM

This specification outlines the data invariants, the "Dirty Dozen" malicious payloads, and the security rules validation design for the Arafa Student Electronic Voting Machine (EVM) application.

## 1. Data Invariants

1. **Election Config Invariant:**
   The document `/elections/global_config` represents the central configuration of the system.
   - It must contain all configuration fields (`isPollStarted`, `isPollClosed`, `pollingStationName`, `adminPin`, etc.).
   - Values must have strict types and character length limits to prevent denial-of-wallet and storage exhaustion.
   - It contains a list of `candidates` which must be a list of objects matching the `Candidate` schema.

2. **Vote Record Invariant:**
   Each document in `/votes/{voteId}` represents a single vote cast by a voter for a particular category.
   - Once written, individual vote documents are **immutable**; they cannot be updated (`allow update: if false;`).
   - They can only be deleted during an authorized factory reset.
   - A vote record must contain `id`, `candidateId`, `timestamp`, and `voterIndex`.
   - `voterIndex` must be a positive integer/number.
   - All string IDs must be within safe length limits (under 128 characters) and conform to safe alphanumeric patterns.

---

## 2. The "Dirty Dozen" Payloads

The following 12 payloads are designed to bypass system integrity, cause data corruption, or exploit resource limits. The firestore security rules must successfully block and deny every single one of these payloads:

### Payload 1: Config with Missing Required Fields
**Target:** `setDoc` on `/elections/global_config`
```json
{
  "isPollStarted": true
}
```
*Expected Result:* `PERMISSION_DENIED` (Missing `pollingStationName`, `adminPin`, etc.)

### Payload 2: Config with Invalid Field Type
**Target:** `setDoc` on `/elections/global_config`
```json
{
  "isPollStarted": "yes",
  "isPollClosed": false,
  "pollingStationName": "Station A",
  "adminPin": "1234",
  "institutionSubtitle": "Sub",
  "institutionTitle": "Title",
  "institutionLogo": "",
  "footerLogo": "R",
  "schoolName": "School",
  "developerName": "Dev",
  "developerSubtitle": "DevSub",
  "academicYear": "2026-27",
  "candidates": []
}
```
*Expected Result:* `PERMISSION_DENIED` (`isPollStarted` must be boolean, not string)

### Payload 3: Config with Denial-of-Wallet Character Flooding (Station Name too long)
**Target:** `setDoc` on `/elections/global_config`
```json
{
  "isPollStarted": true,
  "isPollClosed": false,
  "pollingStationName": "Station A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A A",
  "adminPin": "1234",
  "institutionSubtitle": "Sub",
  "institutionTitle": "Title",
  "institutionLogo": "",
  "footerLogo": "R",
  "schoolName": "School",
  "developerName": "Dev",
  "developerSubtitle": "DevSub",
  "academicYear": "2026-27",
  "candidates": []
}
```
*Expected Result:* `PERMISSION_DENIED` (`pollingStationName` exceeds 200 characters)

### Payload 4: Config with Unauthorized "Ghost Field" (Privilege Escalation)
**Target:** `setDoc` on `/elections/global_config`
```json
{
  "isPollStarted": true,
  "isPollClosed": false,
  "pollingStationName": "Station A",
  "adminPin": "1234",
  "institutionSubtitle": "Sub",
  "institutionTitle": "Title",
  "institutionLogo": "",
  "footerLogo": "R",
  "schoolName": "School",
  "developerName": "Dev",
  "developerSubtitle": "DevSub",
  "academicYear": "2026-27",
  "candidates": [],
  "super_admin_bypass_allowed": true
}
```
*Expected Result:* `PERMISSION_DENIED` (Additional keys not permitted by schema size/key assertions)

### Payload 5: Vote Record Missing Candidate ID
**Target:** `create` on `/votes/vt-malicious-1`
```json
{
  "id": "vt-malicious-1",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": 12345
}
```
*Expected Result:* `PERMISSION_DENIED` (Missing `candidateId`)

### Payload 6: Vote Record with Invalid Types (Voter Index as String)
**Target:** `create` on `/votes/vt-malicious-2`
```json
{
  "id": "vt-malicious-2",
  "candidateId": "cand-123",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": "12345"
}
```
*Expected Result:* `PERMISSION_DENIED` (`voterIndex` must be a number)

### Payload 7: Vote Record ID Poisoning Attack
**Target:** `create` on `/votes/vt-malicious-3-inject-path-or-garbage-$$$`
```json
{
  "id": "vt-malicious-3-inject-path-or-garbage-$$$",
  "candidateId": "cand-123",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": 12345
}
```
*Expected Result:* `PERMISSION_DENIED` (Document ID does not match standard alphanumeric pattern `^[a-zA-Z0-9_\\-]+$`)

### Payload 8: Vote Record with Negative Voter Index (Integer Underflow Attempt)
**Target:** `create` on `/votes/vt-malicious-4`
```json
{
  "id": "vt-malicious-4",
  "candidateId": "cand-123",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": -123
}
```
*Expected Result:* `PERMISSION_DENIED` (`voterIndex` must be a positive number)

### Payload 9: Vote Record Modification (Attempting to change cast vote)
**Target:** `update` on `/votes/vt-existing-vote`
```json
{
  "id": "vt-existing-vote",
  "candidateId": "cand-different-winner",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": 44
}
```
*Expected Result:* `PERMISSION_DENIED` (Votes are immutable; updates are disabled)

### Payload 10: Config with Invalid Short Security PIN
**Target:** `setDoc` on `/elections/global_config`
```json
{
  "isPollStarted": true,
  "isPollClosed": false,
  "pollingStationName": "Station A",
  "adminPin": "1",
  "institutionSubtitle": "Sub",
  "institutionTitle": "Title",
  "institutionLogo": "",
  "footerLogo": "R",
  "schoolName": "School",
  "developerName": "Dev",
  "developerSubtitle": "DevSub",
  "academicYear": "2026-27",
  "candidates": []
}
```
*Expected Result:* `PERMISSION_DENIED` (`adminPin` must be at least 4 characters long)

### Payload 11: Vote Record with Resource Exhaustion String Sizes (Candidate ID too long)
**Target:** `create` on `/votes/vt-malicious-5`
```json
{
  "id": "vt-malicious-5",
  "candidateId": "cand-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "timestamp": "2026-07-08T14:00:00.000Z",
  "voterIndex": 12345
}
```
*Expected Result:* `PERMISSION_DENIED` (`candidateId` exceeds character length limit of 128 characters)

### Payload 12: Vote Record with Invalid Timestamp Format
**Target:** `create` on `/votes/vt-malicious-6`
```json
{
  "id": "vt-malicious-6",
  "candidateId": "cand-123",
  "timestamp": "Not A Timestamp!",
  "voterIndex": 12345
}
```
*Expected Result:* `PERMISSION_DENIED` (`timestamp` must be a valid ISO string of length between 10 and 35)
