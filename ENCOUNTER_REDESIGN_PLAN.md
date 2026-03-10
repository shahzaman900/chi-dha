# Encounter Command Center — Implementation Plan

> **Goal:** Transform the encounter view into the nurse's single command center. Simplify the context menu to 3 items. All clinical actions happen inside the encounter via side sheets. Timeline events get "View Detailed" popups.

---

## Phase 1: Patient Demographics

### Add Fields to Patient Interface + Data

**[MODIFY] `store/patient-store.ts`**
Add to `Patient` interface:

```typescript
phone?: string;
mrn?: string;
gender?: "Male" | "Female" | "Other";
```

**[MODIFY] `data/patients.json`**
Add `phone`, `mrn`, `gender` to each of the 10 patients.

---

## Phase 2: Simplify Context Menu

**[MODIFY] `components/patient-table.tsx`**

Replace ~150-line context menu with **3 clean items**:

| #   | Item              | Icon        | Action                                        |
| --- | ----------------- | ----------- | --------------------------------------------- |
| 1   | Acknowledge Alert | AlertCircle | `acknowledgeAlert(id)` → auto-opens encounter |
| 2   | View Encounter    | Activity    | `openPhrTab(id, name, 'encounter')`           |
| 3   | View PHR          | FileText    | `openPhrTab(id, name, 'phr')`                 |

**Remove:** All action sheet state variables (`emergencySheetPatientId`, `escalateSheetPatientId`, `resolveSheetPatientId`, `timelineModalPatientId`) and sheet component mounts.

**Remove imports:** `EmergencySheet`, `EscalateSheet`, `ResolveSheet`, `TimelineModal`, `PauseCircle`, `CheckCircle2`.

---

## Phase 3: Timeline Event Data Model

### Add DetailType to Events

**[MODIFY] `store/patient-store.ts`**

New interface:

```typescript
interface TimelineEvent {
  time: string;
  event: string;
  type: "update" | "warning" | "system" | "critical" | "critical-action";
  detailType?: "ai-assessment" | "emergency-protocol" | "escalation";
  details?: {
    // For AI call events
    initialDiagnosis?: Array<{ name: string; probability: number }>;
    transcript?: Array<{ speaker: string; text: string }>;
    updatedDiagnosis?: Array<{ name: string; probability: number }>;
    // For emergency events
    transport?: { status: string; eta: string; actions: string[] };
    erNotification?: { hospital: string; protocol: string; orders: string[] };
    handoff?: { vitals: Record<string, string>; instructions: string[] };
    // For escalation events
    doctor?: string;
    assessment?: string;
    recommendation?: string;
  };
}
```

**[MODIFY] `data/patients.json`**
Add `detailType` + `details` to relevant events (AI calls, emergencies, escalations).

**[MODIFY] `store/patient-store.ts` actions**

- `triggerEmergency` → creates event with `detailType: "emergency-protocol"` + transport/triage/handoff details
- `escalateToDoctor` → creates event with `detailType: "escalation"` + doctor/SBAR
- `initiateAiCheckIn` → creates event with `detailType: "ai-assessment"` + transcript/DDx

---

## Phase 4: Event Detail Modal

**[NEW] `components/event-detail-modal.tsx`**

A `Dialog` popup that renders 3-column detail views based on `detailType`:

### AI Assessment Layout (3 columns):

| Initial DDx                     | CHI Agent Transcript          | Updated DDx            |
| ------------------------------- | ----------------------------- | ---------------------- |
| Pre-Q&A probabilities with bars | System ↔ Patient chat bubbles | Post-Q&A probabilities |

### Emergency Protocol Layout (3 columns):

| Immediate ER Transport         | ER Triage Notification        | Clinical Handoff Data           |
| ------------------------------ | ----------------------------- | ------------------------------- |
| Ambulance status, ETA, actions | Hospital notified, lab orders | Vitals, monitoring instructions |

### Escalation Layout (single panel):

| Doctor name | SBAR Assessment | Recommendation |
| ----------- | --------------- | -------------- |

---

## Phase 5: Encounter Command Center

**[MODIFY] `components/phr-display.tsx`**

### Enhanced Header

```
[Patient Avatar] [Name] [Age • Gender] [Phone] [MRN]     [Action Buttons] [EWS Score] [Status Badge]
```

Patient demographics pulled from `Patient` store (not just PHR store).

### Action Buttons (interactive — update state + show toast):

- **Trigger AI Text** → calls `initiateAiCheckIn(id, "text")`, creates timeline event
- **Trigger AI Call** → calls `initiateAiCheckIn(id, "call")`, creates timeline event with AI transcript details
- **Call Patient** → button (visual only for demo)
- **Refer to Doctor** → opens `EscalateSheet` as side sheet
- **Dispatch Emergency** → opens `EmergencySheet` as side sheet
- **Mark Resolved** → opens `ResolveSheet` as side sheet
- **Go to PHR** → calls `openPhrTab(id, name, 'phr')`

### Main Body (3-column layout):

- **Left:** Patient Profile + Current Vitals + **Vitals Trend Sparklines** (using `SparkLine` component with patient's HR/SpO2 data)
- **Center:** AI DDx + Symptom Checker (existing)
- **Right:** **Timeline of Events** — each event as a card, events with `detailType` get a "View Detailed" button → opens `EventDetailModal`

### Side Sheets (within encounter):

```typescript
const [activeSheet, setActiveSheet] = useState<
  "emergency" | "escalate" | "resolve" | null
>(null);
const [eventDetail, setEventDetail] = useState<TimelineEvent | null>(null);
```

Import: `EmergencySheet`, `EscalateSheet`, `ResolveSheet`, `EventDetailModal`

### Interactive Demo Requirements:

- **Every button does something** — no dummy buttons
- Actions update patient state immediately (via Zustand store)
- Timeline events appear in real-time after actions
- Toast notifications confirm each action
- Status badges update in real-time

---

## Phase 6: Auto-Open Encounter on Acknowledge

**[MODIFY] `store/patient-store.ts`**

```typescript
acknowledgeAlert: (patientId, note) => {
  const patientName =
    get().patients.find((p) => p.id === patientId)?.name || "Patient";
  set((state) => ({
    /* existing logic */
  }));
  toast.success(`Alert Acknowledged — ${patientName}`);
  // Auto-open encounter
  get().openPhrTab(patientId, patientName, "encounter");
};
```

---

## Phase 7: Cleanup

**[MODIFY] `components/patient-table.tsx`**

- Remove unused imports and state variables
- Remove action sheet mounts
- Net reduction: ~200+ lines

---

## File Change Summary

| File                                | Action | Description                                                                           |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `store/patient-store.ts`            | MODIFY | Add phone/mrn/gender to Patient, TimelineEvent interface, update actions with details |
| `data/patients.json`                | MODIFY | Add demographics + event details to all 10 patients                                   |
| `components/patient-table.tsx`      | MODIFY | Replace context menu with 3 items, remove action sheets                               |
| `components/event-detail-modal.tsx` | NEW    | Detail popup for AI/emergency/escalation events                                       |
| `components/phr-display.tsx`        | MODIFY | Full command center with actions, timeline, sparklines                                |

---

## Verification Flows

| #   | Flow                                 | Expected Result                                               |
| --- | ------------------------------------ | ------------------------------------------------------------- |
| 1   | Click patient → Acknowledge          | Status → "Nurse Alerted", encounter opens, toast shown        |
| 2   | In encounter → Dispatch Emergency    | Side sheet opens → confirm → timeline event + "View Detailed" |
| 3   | In encounter → Refer to Doctor       | SBAR side sheet → confirm → timeline event + "View Detailed"  |
| 4   | In encounter → Mark Resolved         | Resolve side sheet → confirm → status changes, toast          |
| 5   | In encounter → Trigger AI Call       | Store updated, timeline event with AI DDx detail              |
| 6   | Timeline → View Detailed (AI)        | Modal: Initial DDx / Transcript / Updated DDx                 |
| 7   | Timeline → View Detailed (Emergency) | Modal: ER Transport / Triage / Handoff                        |
| 8   | Context menu → View PHR              | PHR tab opens                                                 |
