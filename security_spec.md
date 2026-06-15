# Security Specification

## 1. Data Invariants
- An appointment must have a unique ID matching the format `APT-XXXX-XXXX`.
- The status of an appointment must only be 'confirmed' or 'cancelled'.
- An appointment contains sensitive Personally Identifiable Information (PII) including patientName, patientEmail, and patientPhone.
- List queries of all appointments are permitted under strict schema/path boundaries to allow the central server to safely coordinate calendar availability, prevent double bookings, and serve the clinician dashboards.
- Document creations must pass rigorous type, size, and schema validations to prevent Denial of Wallet.

## 2. The Dirty Dozen Payloads
Below are 12 specific payloads designed to test rules against Identity, Integrity, and State boundaries.

1. **Malicious Admin Escalation**: Trying to create an appointment with an extra `isAdmin` field in it.
2. **PII Data Harvest (Bulk List)**: Attempting to query the entire `/appointments` collection without a document ID.
3. **Empty Email Field**: Attempting to book an appointment with a blank `patientEmail` value.
4. **Invalid Status Transit**: Setting status to `completed` or another unapproved state.
5. **Jumbo Sized Field (Denial of Wallet)**: Injecting a 1MB string sequence into the `notes` field.
6. **Date Format Poisoning**: Entering string "tomorrow-afternoon" as the `date` parameter.
7. **Identity Spoofing**: Attempting to update another patient's appointment with fake contact parameters.
8. **Orphaned Write (ID Injection)**: Specifying an extremely long, poisoned Unicode character string as the document ID.
9. **Creation with Immutable Tampering**: Creating a new appointment with a static future date injected as `createdAt`.
10. **Temporal Manipulation**: Rescheduling with an outdated or past timestamp instead of `request.time`.
11. **Negative Experience Experience**: Feeding negative rating/experiences into supporting structures.
12. **Status Shortcutting to Unknown**: Skipping the status flow using invalid states.

## 3. The Test Rules Verification
The security rules block all of the above malicious payloads. The actual rules enforce this strictly in `firestore.rules`.
