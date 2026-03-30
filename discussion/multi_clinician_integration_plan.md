# Multi-Provider & Multi-Nurse Integration Plan

This document outlines the strategy for implementing a collaborative, supervisor-led clinical dashboard that supports multiple clinicians and tiered accountability.

## 1. Clinician Personas & Requirements

### A. The Nurse Supervisor
- **Goal:** Workload distribution and oversight.
- **Requirement:** A "Supervisor View" to see all nurses' availability and current patient loads.
- **Action:** Can "Assign" or "Re-assign" any patient to a specific Nurse or Doctor.
- **Authority:** Can override assignments if a clinician is over capacity.

### B. The MBBS Doctor (Provider)
- **Goal:** Specialized clinical management.
- **Requirement:** To only be alerted for patients requiring diagnostic intervention or escalation.
- **Action:** Can "Request Specialist" or "Handover" to another doctor during shift changes.
- **Authority:** Highest authority for condition downgrades and discharge.

### C. The Product Manager (PM)
- **Goal:** System scalability and performance metrics.
- **Requirement:** Audit trails for every assignment and "Time to Acknowledge" tracking for each clinician.
- **Action:** Define roles and user management structure.
- **Metric:** Ensure the UI remains performant with 50+ clinicians logged in simultaneously.

### D. The Developer
- **Goal:** Technical robustness and clean state management.
- **Action:** Implement a `Clinician` model and update `PatientStore` to handle `assignedTo` (User ID) instead of just names.
- **Safety:** Use role-based access control (RBAC) to restrict assignment actions to Supervisors.

---

## 2. Proposed Technical Changes

### A. Data Model Updates (PatientStore)
- **Clinician Model:** `{ id, name, roleCode, activeUnreadAlerts, currentPatientCount }`.
- **Patient Model Enhancements:** 
  - `assignedTo`: ID of the primary clinician.
  - `secondaryClinicians`: Array of IDs for multi-disciplinary teams.
  - `assignmentHistory`: Array of `{ fromId, toId, timestamp, reason }`.

### B. UI / UX Enhancements
- **Supervisor Dashboard:** A leaderboard-style view showing active nurses and their "Status" (Available, Busy, Break).
- **Assignment Modal:** A searchable dropdown of active clinicians with "Workload Indicators" (e.g., 🔴 5 Patients, 🟢 1 Patient).
- **Transfer column:** Update to show the user's avatar and name explicitly.

---

## 3. Implementation Workflow

1.  **Phase 1 (User Context):** Replace `loggedInUser: string` with a robust `auth` state containing role and permissions.
2.  **Phase 2 (Clinician Registry):** Create a mock database of active Nurses and Doctors.
3.  **Phase 3 (Assignment Logic):** Update context menus to include "Assign/Re-assign" and "Consult Multi-provider".
4.  **Phase 4 (Supervisor Overrides):** Logic for supervisors to see all queues and force re-assignments.
