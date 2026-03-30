# Two-State Patient Case Model — Complete Specification

**Version:** 1.0  
**Date:** 2026-03-27  
**Scope:** RPM (Remote Patient Monitoring) — Chat & Escalation System  
**Reference platforms:** Teladoc Health · Amwell · Kaiser Permanente · Babylon Health

---

## Overview

The Two-State Model decouples two concerns that are typically — and dangerously — merged in medical chat systems:

| State | Question It Answers | Values |
|---|---|---|
| **Escalation Level** | Who is **clinically accountable**? Who makes medical decisions? | `NURSE` / `DOCTOR` |
| **Communication Level** | Who is **actively replying** to the patient right now? | `NURSE` / `DOCTOR` |

These two states are **fully independent**. A doctor can be clinically responsible while a nurse handles all patient messages — mirroring how real RPM care teams operate. This eliminates the false binary of "doctor owns everything" vs "nurse guesses on clinical matters."

---

## 1. State Definitions

### 1.1 Escalation Level

Controls **medical authority and accountability**.

| Value | Meaning | Who Sets It |
|---|---|---|
| `NURSE` | Nurse is clinically responsible. Standard monitoring. Nurse can answer clinical questions within scope. | Default on case creation; set by nurse on step-down |
| `DOCTOR` | Doctor is clinically responsible. Nurse must not make medical decisions. Doctor's SLA clock is running. | Set by nurse (manual escalation) or system (auto-trigger) |

### 1.2 Communication Level

Controls **who the patient's messages route to** and who is expected to reply.

| Value | Meaning | Who Sets It |
|---|---|---|
| `NURSE` | Nurse is the active responder. Doctor is not expected to watch chat. Nurse SLA applies. | Default; set explicitly when doctor returns to passive |
| `DOCTOR` | Doctor is the active responder. Patient messages routed to doctor's workspace. Doctor SLA applies. | Set by nurse in escalation modal, or doctor clicking "Take Over Chat" |

---

## 2. The Four Valid State Combinations

| # | Escalation Level | Communication Level | Scenario Name | Description |
|---|---|---|---|---|
| **S1** | `NURSE` | `NURSE` | **Normal Monitoring** | Standard RPM. Nurse handles all clinical and non-clinical chat. Full nurse authority within scope. |
| **S2** | `DOCTOR` | `NURSE` | **Doctor Review, Nurse Active** | Doctor clinically responsible (e.g., reviewing a concern, 5-hour observation window). Nurse handles all chat, filters questions, tags doctor only when needed. **This is the primary RPM design state.** |
| **S3** | `DOCTOR` | `DOCTOR` | **Active Doctor Engagement** | Doctor has taken direct control of chat. Full doctor authority and responsiveness. |
| **S4** | `NURSE` | `NURSE` | **Step-Down (Post-Doctor)** | Doctor episode resolved. Nurse resumes full ownership. Functionally identical to S1 but carries a `step_down_from_doctor` flag for audit purposes. |

> **Invalid combination:** `Escalation = NURSE, Communication = DOCTOR` is not permitted. A doctor actively chatting implies clinical responsibility.

---

## 3. State Transition Rules

### 3.1 Valid Transitions

```
S1 (NURSE/NURSE)
    │
    ├──[Nurse escalates]──────────────────► S2 (DOCTOR/NURSE)
    │                                            │
    │                                            ├──[Doctor takes over chat]──► S3 (DOCTOR/DOCTOR)
    │                                            │                                    │
    │                                            │        [Doctor returns to passive]─┘
    │                                            │
    │                                            ├──[Doctor resolves + step-down]──► S4 (NURSE/NURSE)
    │                                            │
    │                                ───────────┘
    └──[Auto-trigger system alert]──► S2 (DOCTOR/NURSE)
```

### 3.2 Transition Definitions

| Transition | From | To | Who Can Trigger | Prerequisites |
|---|---|---|---|---|
| Manual Escalation | S1 | S2 | Nurse | Escalation modal completed (doctor selected, reason, handover note ≥ 10 chars) |
| Auto-Escalation | S1 | S2 | System | Keyword or vitals trigger (see §6) |
| Doctor Takes Over | S2 | S3 | Doctor | Doctor clicks "Take Over Chat" in their notification |
| Doctor Returns to Passive | S3 | S2 | Doctor | Doctor clicks "Return to Nurse" |
| Nurse Requests Doctor Chat | S2 | S3 | Nurse (via escalation modal choosing "Switch to Doctor") | Escalation modal completed |
| Step-Down | S2 or S3 | S4 | Doctor | Doctor clicks "Resolve & Step Down"; fills step-down note |
| Supervisor Override | Any | Any | Supervisor | Override reason logged; audit event created |

### 3.3 Transition Enforcement Rules

1. **Nurse cannot self-promote Escalation to DOCTOR without the modal.** `PUT /cases/:id` with `escalation_level=DOCTOR` requires role `NURSE` + completed `escalation_packet_id`. Rejected otherwise.
2. **Doctor cannot be removed from Escalation without their explicit action or supervisor override.** Auto-expiry (e.g., after SLA window closes with no activity) is permitted only if configured per clinic policy.
3. **Communication = DOCTOR can only be set when Escalation = DOCTOR.** The `NURSE/DOCTOR` combination is explicitly blocked at the API layer.
4. **Every transition is atomic.** The `escalation_level` and `communication_level` fields update in a single DB transaction. No partial state is permitted.
5. **Transition events are immutable.** All transitions are written to `case_state_transitions` as append-only records. No update or delete.

---

## 4. Message Routing Logic

### 4.1 Routing by State Combination

| State | Incoming Patient Message Routes To | Doctor Gets Notified? |
|---|---|---|
| S1 (NURSE/NURSE) | Nurse active queue | No |
| S2 (DOCTOR/NURSE) | Nurse active queue | Only if: auto-trigger fires, or nurse manually tags |
| S3 (DOCTOR/DOCTOR) | Doctor active queue | Yes — all messages |
| S4 (NURSE/NURSE) | Nurse active queue | No |

### 4.2 Message Classification

Every incoming patient message is classified before routing. Classification is done in this order of priority:

**Priority 1 — System Auto-Classification (keyword match)**

| Class | Keywords / Triggers | Action |
|---|---|---|
| `CRITICAL` | chest pain, can't breathe, unconscious, suicidal, severe bleeding, stroke, heart attack, seizure, choking | Immediately switch Communication to DOCTOR regardless of current state. Alert doctor + supervisor simultaneously. |
| `VITALS_ALERT` | Vitals breach patient-specific thresholds from RPM device | Classify as `CLINICAL_CRITICAL`. Route to doctor. Alert nurse. |
| `REPEATED_CONCERN` | Same unanswered topic appears 3+ times | Escalate packet sent to doctor even if no keyword match |

**Priority 2 — Nurse Manual Classification** (in S2 state, nurse receives all non-critical messages first)

| Class | Examples | Nurse Action |
|---|---|---|
| `CLINICAL_DECISION` | "Should I take this medicine?" · "Is my BP dangerous?" · "Can I stop this drug?" | Tag for Doctor. Nurse must NOT answer. |
| `CLINICAL_ADVISORY` | "I feel a bit dizzy" · "Slight headache since morning" | Nurse answers conservatively. Doctor passively visible. Note added to packet. |
| `ROUTINE` | "When will the doctor reply?" · "Can I drink tea?" · "How do I use this device?" | Nurse answers directly. No restriction. |
| `ADMINISTRATIVE` | "Change my appointment" · "Send me my report" | Nurse handles or routes to admin team. |

### 4.3 Nurse-Gatekeeper Model (State S2)

In State S2, the nurse is the primary gatekeeper. The following rules apply:

- **All patient messages arrive in nurse queue first.**
- Doctor's default view = filtered (only tagged messages + auto-alerts + escalation packets).
- Doctor can always click **"View Full Chat"** — nothing is hidden, only filtered by default.
- Nurse must classify and act on every message within the nurse SLA.
- If nurse is uncertain → **default rule: tag doctor. Never guess.**
- If nurse is at conversation capacity and a critical keyword fires → system bypasses nurse and alerts doctor directly.

### 4.4 Doctor Visibility Rules

| Doctor Default View | What It Shows |
|---|---|
| Escalation packet | Chief complaint, vitals snapshot, nurse note, 3–5 relevant messages |
| Tagged messages | Any message nurse flagged with "Tag Doctor" |
| Auto-alerts | System-generated critical keyword or vitals alerts |
| Filtered out by default | Routine, administrative, and advisory messages already handled by nurse |

Doctor taps **"View Full Chat"** → sees complete unfiltered thread including all nurse replies, internal notes, and patient messages.

---

## 5. Reply Labeling Rules

### 5.1 Patient-Facing Labels

The patient always sees **one unified chat thread**. The chat is never split by role. Only the sender label differs.

| Sender | Internal Role | Patient-Facing Label | Format |
|---|---|---|---|
| Nurse (any state) | `NURSE` | **Care Team** | `Care Team: [message]` |
| Doctor (direct reply) | `DOCTOR` | **Dr. [First Name]** | `Dr. Ahmed: [message]` |
| System | `SYSTEM` | **[Clinic Name] Team** | `[Clinic]: [message]` |
| AI / Bot | `AI` | **[Clinic Name] Assistant** | Only during off-hours or queue wait |

### 5.2 Label Logic

```
IF sender_role = NURSE:
    patient_label = "Care Team"

IF sender_role = DOCTOR AND communication_level = DOCTOR:
    patient_label = "Dr. " + doctor.first_name

IF sender_role = DOCTOR AND communication_level = NURSE:
    // Doctor replied via internal thread — nurse relays
    // Doctor's internal reply is NOT shown to patient
    patient_label = "Care Team" (nurse's outgoing relay message)

IF sender_role = SYSTEM:
    patient_label = clinic.display_name + " Team"
```

### 5.3 Rationale

Labelling nurse responses as **"Care Team"** rather than the nurse's personal name:
- Prevents patient confusion when escalation level is DOCTOR (*"Why is the nurse answering?"*)
- Maintains psychological authority of the doctor without blocking nurse responsiveness
- Allows seamless handover between nurses without patient noticing staff changes
- Reduces patient expectation friction (patient does not expect the same person to reply every time)

### 5.4 System Messages (Patient-Visible)

| Trigger Event | System Message Shown to Patient |
|---|---|
| S1 → S2 escalation | *"Your case is being reviewed by a doctor. Our care team will assist you meanwhile."* |
| S2 → S3 (doctor takes over) | *"You are now talking with Dr. [First Name]."* |
| S3 → S2 (doctor returns to passive) | *"You are now talking with our care team."* |
| S2/S3 → S4 step-down | *"Your doctor has completed their review. Our care team will continue to support you."* |
| Doctor offline mid-S3 | *"Your doctor will be back shortly. For emergencies, please call [emergency number]."* |

---

## 6. Intervention Triggers

### 6.1 Manual Triggers (Nurse-Initiated)

| Trigger | Action | UI Element |
|---|---|---|
| Flag message for doctor | Creates escalation packet; notifies doctor | Long-press / right-click → "Flag for Doctor" on message |
| Tag Doctor in note | Creates escalation packet with note | "@doctor" or "Tag Doctor" button in internal note |
| Escalate to Doctor (modal) | Changes Escalation = DOCTOR; optionally Communication = DOCTOR | "Escalate to Doctor" button in chat header |

### 6.2 Automatic Triggers (System-Initiated)

| Trigger | Condition | Action |
|---|---|---|
| Critical keyword match | Patient message contains any critical keyword (see §4.2) | Immediately: (1) create auto-escalation packet, (2) notify doctor + supervisor, (3) if Comm = NURSE, add warning banner to nurse chat |
| Vitals threshold breach | RPM device reports value outside patient-specific safe range | Same as critical keyword. Also logs vitals alert to patient record. |
| Repeated unanswered concern | Same topic unanswered 3+ times in session | Auto-escalation packet sent to doctor with "Repeated Concern" tag |
| Nurse SLA breach in S2 | No nurse reply within configured SLA in state S2 | Notify supervisor. If no resolution in 2× SLA, notify doctor directly. |
| Doctor SLA breach in S3 | No doctor reply within configured SLA in state S3 | Notify supervisor. If no resolution in 2× SLA, supervisor can reassign. |
| Nurse offline mid-conversation | Nurse goes offline with active S2 conversation | Move conversation to shared queue. Notify supervisor. Session enters On-Hold. Patient notified. |

### 6.3 Doctor-Initiated Triggers

| Trigger | Action |
|---|---|
| Doctor clicks "Take Over Chat" | Communication = DOCTOR. Patient notified via system message. |
| Doctor clicks "Return to Nurse" | Communication = NURSE. No patient system message (seamless). |
| Doctor clicks "Resolve & Step Down" | Escalation = NURSE, Communication = NURSE. Patient receives step-down system message. |
| Doctor sends instruction to nurse (internal only) | Internal message in consult thread. Nurse receives notification. Patient sees nothing. |

### 6.4 Supervisor-Initiated Triggers

| Trigger | Prerequisite | Action |
|---|---|---|
| Override Escalation Level | Logged reason required | Force any state combination; audit event created |
| Reassign Communication Level | Logged reason required | Move communication to any available staff; audit event created |
| Pull in second doctor | Existing doctor unreachable | Adds second doctor as co-owner; primary doctor retains escalation ownership |

---

## 7. SLA Definitions

### 7.1 SLA by State Combination

| State | Escalation | Communication | Nurse Reply SLA | Doctor Reply SLA | Breach Action |
|---|---|---|---|---|---|
| S1 | NURSE | NURSE | ≤ 5 min | N/A | Notify supervisor at 5 min; re-queue at 10 min |
| S2 | DOCTOR | NURSE | ≤ 3 min | ≤ Clinic-defined window (e.g., 4 hrs) | Nurse: notify supervisor at 3 min. Doctor: notify supervisor at window; auto-packet at 2× window |
| S3 | DOCTOR | DOCTOR | N/A | ≤ 30 min | Notify supervisor at 30 min; add to priority list |
| S4 | NURSE | NURSE | ≤ 5 min | N/A | Same as S1 |

### 7.2 SLA Clock Rules

- **Nurse SLA clock** starts when patient message arrives in nurse queue.
- **Doctor SLA clock** starts when escalation packet is created (not when patient sends message).
- **Clock pauses** when: patient is the last to send and no follow-up expected (acknowledged state).
- **Clock resets** on each new patient message.
- **Clock does not pause** for nurse break, shift change, or system maintenance — supervisor is responsible for coverage.

### 7.3 SLA Breach Escalation Chain

```
Nurse SLA breach (S2):
  T+0  → Patient message arrives, nurse SLA starts
  T+3m → No nurse reply → alert supervisor
  T+6m → No nurse reply → alert doctor directly (bypasses nurse)
  T+10m → No reply from anyone → supervisor re-queues case

Doctor SLA breach (S2, 4-hour window):
  T+0  → Escalation packet created, doctor SLA starts
  T+4h → No doctor action → alert supervisor
  T+8h → No doctor action → supervisor must reassign or override

Doctor SLA breach (S3, 30-min window):
  T+0  → Patient message arrives in doctor queue
  T+30m → No doctor reply → alert supervisor
  T+60m → No doctor reply → supervisor may flip Communication = NURSE temporarily
```

---

## 8. Data Model

### 8.1 `patient_case`

```typescript
{
  id:                        UUID           // Primary key
  patient_id:                UUID           // FK → patients
  
  // Two-State Model fields
  escalation_level:          'NURSE' | 'DOCTOR'
  escalation_assigned_to:    UUID           // FK → staff (nurse or doctor)
  escalation_reason:         string | null  // Free text, required when DOCTOR
  escalation_packet_id:      UUID | null    // FK → escalation_packets (most recent)
  escalated_at:              Timestamp | null
  
  communication_level:       'NURSE' | 'DOCTOR'
  communication_assigned_to: UUID           // FK → staff
  
  // SLA tracking
  nurse_sla_deadline:        Timestamp | null
  doctor_sla_deadline:       Timestamp | null
  sla_breached:              boolean        // default false
  sla_breach_count:          integer        // default 0
  
  // State tracking
  state_combination:         'S1' | 'S2' | 'S3' | 'S4'  // derived, stored for query performance
  step_down_from_doctor:     boolean        // true if current S4 came from doctor episode
  
  // Timestamps
  created_at:                Timestamp
  updated_at:                Timestamp
  resolved_at:               Timestamp | null
}
```

### 8.2 `messages`

```typescript
{
  id:                  UUID
  case_id:             UUID           // FK → patient_case
  
  // Sender
  sender_id:           UUID           // FK → staff | patients
  sender_role:         'PATIENT' | 'NURSE' | 'DOCTOR' | 'SYSTEM' | 'AI'
  
  // Patient-facing label (resolved at send time, stored for audit stability)
  patient_label:       string | null  // "Care Team" | "Dr. Ahmed" | "Clinic Team" | null (internal)
  
  // Visibility
  is_internal:         boolean        // true = staff-only, patient cannot see
  is_relayed:          boolean        // true = nurse relaying doctor's internal instruction
  relayed_from_id:     UUID | null    // FK → messages (the internal doctor message being relayed)
  
  // Classification
  message_type:        'clinical_critical' | 'clinical_advisory' | 'routine' | 'administrative' | 'system'
  requires_doctor:     boolean        // default false; true when nurse tags or system classifies critical
  auto_classified:     boolean        // true if system classified, false if nurse manually classified
  
  // Escalation linkage
  escalation_packet_id: UUID | null   // FK → escalation_packets (if this message triggered one)
  flagged_for_doctor:   boolean       // true if nurse used "Flag for Doctor" on this message
  flagged_at:           Timestamp | null
  flagged_by:           UUID | null   // FK → staff
  
  // Content
  content:             string
  attachments:         JSON | null    // [{url, name, size, mime_type, virus_scanned}]
  
  // Delivery
  sent_at:             Timestamp
  delivered_at:        Timestamp | null
  read_at:             Timestamp | null  // read by assigned staff
  retracted_at:        Timestamp | null  // soft delete within 10-second window
}
```

### 8.3 `escalation_packets`

```typescript
{
  id:                      UUID
  case_id:                 UUID           // FK → patient_case
  
  // Trigger
  triggered_by:            'NURSE' | 'SYSTEM'
  trigger_type:            'manual_flag' | 'manual_escalation' | 'keyword_alert' | 'vitals_breach' | 'repeated_concern' | 'sla_breach'
  trigger_message_id:      UUID | null    // FK → messages (the patient message that triggered this)
  
  // Content
  patient_summary:         string         // Nurse-written or system-generated patient summary
  nurse_note:              string | null  // Required for manual escalation
  vitals_snapshot:         JSON | null    // {bp, hr, spo2, weight, glucose, timestamp}
  relevant_message_ids:    UUID[]         // Last 3–5 message IDs included in packet
  action_required:         'REPLY' | 'CALL' | 'REVIEW_VITALS' | 'ACKNOWLEDGE'
  
  // Doctor response
  doctor_id:               UUID | null    // FK → staff (assigned doctor)
  doctor_acknowledged_at:  Timestamp | null
  doctor_response_type:    'replied_internally' | 'took_over_chat' | 'acknowledged_only' | null
  doctor_internal_reply:   string | null  // Doctor's reply in internal thread
  
  // Timestamps
  created_at:              Timestamp
  expires_at:              Timestamp | null  // Optional, based on clinic policy
}
```

### 8.4 `case_state_transitions`

Append-only audit log of all state changes.

```typescript
{
  id:                    UUID
  case_id:               UUID
  
  // Previous state
  prev_escalation_level:    'NURSE' | 'DOCTOR'
  prev_communication_level: 'NURSE' | 'DOCTOR'
  prev_assigned_to_escalation: UUID
  prev_assigned_to_communication: UUID
  
  // New state
  new_escalation_level:    'NURSE' | 'DOCTOR'
  new_communication_level: 'NURSE' | 'DOCTOR'
  new_assigned_to_escalation: UUID
  new_assigned_to_communication: UUID
  
  // Transition metadata
  transition_type:       'manual_escalation' | 'auto_escalation' | 'doctor_takeover' | 'doctor_return' | 'step_down' | 'supervisor_override'
  triggered_by_role:     'NURSE' | 'DOCTOR' | 'SYSTEM' | 'SUPERVISOR'
  triggered_by_id:       UUID           // FK → staff
  reason:                string | null  // Required for supervisor_override
  escalation_packet_id:  UUID | null    // If triggered by a packet
  
  // Timestamp
  transitioned_at:       Timestamp
}
```

### 8.5 `consult_threads`

Internal staff-only thread per escalation packet.

```typescript
{
  id:             UUID
  case_id:        UUID
  packet_id:      UUID           // FK → escalation_packets
  nurse_id:       UUID           // FK → staff
  doctor_id:      UUID           // FK → staff
  
  messages: [
    {
      id:          UUID
      sender_id:   UUID
      sender_role: 'NURSE' | 'DOCTOR'
      content:     string
      sent_at:     Timestamp
    }
  ]
  
  created_at:     Timestamp
  closed_at:      Timestamp | null
}
```

---

## 9. Edge Cases

| # | Edge Case | Detection | Resolution |
|---|---|---|---|
| EC-01 | **Doctor offline when nurse tags** | Doctor WebSocket disconnected or last_seen > 5 min | Escalation packet queued in doctor's list. On-call doctor or supervisor notified within 2 min. |
| EC-02 | **Multiple doctors assigned to one patient** | Case has multiple staff with `role=DOCTOR` linked | One doctor designated as `Primary` per case. Others receive CC-only escalation packets. Only Primary can trigger state transitions. |
| EC-03 | **Nurse and doctor attempt to reply simultaneously** | Two concurrent `POST /messages` within 3-second window | First commit wins (optimistic locking via `updated_at` version check). Second sender receives: *"A message was just sent. Please review before sending."* |
| EC-04 | **Shift change while Escalation = DOCTOR** | Scheduled shift boundary or nurse manually ends shift | Incoming nurse receives: escalation packet summary + last 10 messages. `communication_assigned_to` updates. Doctor escalation ownership does not change. |
| EC-05 | **Doctor escalation window expires (SLA timeout)** | `doctor_sla_deadline` passed with no `doctor_acknowledged_at` | System: (1) alerts supervisor, (2) adds case to supervisor priority queue, (3) supervisor can reassign or override. Case does NOT auto-revert without explicit action. |
| EC-06 | **Patient escalated to doctor — doctor never responds** | `escalation_packets.doctor_acknowledged_at` null + SLA breached 2× | Supervisor receives critical alert. System can auto-flip `communication_level = NURSE` with a mandatory supervisor note. Escalation level remains DOCTOR until resolved. |
| EC-07 | **Nurse accidentally answers a clinical question in S2** | Post-send audit: `message_type = clinical_decision` + `sender_role = NURSE` + `escalation_level = DOCTOR` | Audit log flags as "out-of-scope response." Supervisor notified. Message remains visible to patient. Doctor notified passively. Message cannot be retracted after 10-second window. |
| EC-08 | **Critical keyword fires mid S2 (nurse active)** | System keyword match on incoming patient message | System immediately: (1) notifies doctor + supervisor, (2) creates auto escalation packet, (3) adds `⚠️ CRITICAL` banner to nurse chat, (4) flags message as `clinical_critical`. Nurse is still expected to acknowledge and respond reassuringly while doctor is notified. |
| EC-09 | **Patient sends message after session Closed** | New message on a session with `state = Closed` | Creates new session in `Reopened` state linked to prior session. Inherits last known `escalation_level` and `communication_level`. Assigned to the same nurse if online; else queued. |
| EC-10 | **Two nurses simultaneously try to claim a case in queue** | Two concurrent `POST /cases/:id/claim` | Atomic claim via DB row-level lock. First wins. Second receives: *"This patient was just picked up by another nurse."* |
| EC-11 | **Doctor in S3 goes offline mid-reply (draft not sent)** | Doctor WebSocket disconnect; no outgoing message | Session enters On-Hold. Patient receives offline system message. Draft is preserved server-side for doctor to complete on return. SLA clock pauses for 5 min (grace), then resumes. |
| EC-12 | **Patient sends duplicate/identical message repeatedly** | Same message content within 60 seconds | Second and subsequent duplicates are deduplicated silently. Only one copy delivered to staff queue. Patient sees their messages as sent normally. |

---

## 10. State Machine Summary Diagram

```
                    ┌─────────────────────────────┐
                    │  S1: NURSE / NURSE           │
                    │  Normal Monitoring           │◄──────────────────────┐
                    └──────────┬──────────────────-┘                       │
                               │                                           │
              Manual escalation│ or Auto-trigger                           │
                               ▼                                           │
                    ┌─────────────────────────────┐           Step-down    │
                    │  S2: DOCTOR / NURSE          │───────────────────────►S4
                    │  Doctor Review, Nurse Active │◄──────────────────────┐
                    └──────────┬──────────────────-┘  Doctor returns       │
                               │                       to passive          │
              Doctor takes over│                                           │
                               ▼                                           │
                    ┌─────────────────────────────┐                        │
                    │  S3: DOCTOR / DOCTOR         │────────────────────────┘
                    │  Active Doctor Engagement    │
                    └─────────────────────────────┘

  S4 (NURSE/NURSE) is functionally S1 with a step_down_from_doctor=true flag.
```

---

## 11. Implementation Checklist

- [ ] `patient_case` table includes `escalation_level`, `communication_level`, `state_combination` columns
- [ ] `case_state_transitions` is append-only (no UPDATE or DELETE on this table)
- [ ] API validates that `communication_level = DOCTOR` requires `escalation_level = DOCTOR`
- [ ] Escalation modal enforces doctor selection + reason + handover note before submitting
- [ ] Message routing service reads `communication_level` to determine active queue
- [ ] Doctor's message list defaults to filtered view (tagged + alerts only)
- [ ] System keyword classifier runs on every incoming patient message before queue insertion
- [ ] Vitals integration fires `VITALS_ALERT` trigger when RPM device reports threshold breach
- [ ] SLA timers are server-side (not client-side) and restart on each new patient message
- [ ] SLA breach chain is implemented as a scheduled job (every 1 minute)
- [ ] Patient-facing label is resolved and stored at send time (not computed dynamically)
- [ ] All state transitions write an immutable record to `case_state_transitions`
- [ ] Supervisor can view full audit trail for any case
- [ ] EC-03 (simultaneous reply) handled via optimistic locking on `messages.case_id + sent_at`
- [ ] EC-07 (out-of-scope nurse reply) audited via post-send classification check
- [ ] Quick Reply mechanism implemented with `reply_type` field on messages
- [ ] S1 doctor tag creates no escalation packet; S2 doctor tag creates formal packet
- [ ] Doctor notification card shows correct action options per current state (S1 vs S2)

---

## 12. Doctor Quick Reply Mechanism

### 12.1 What Is Quick Reply

When a nurse tags the doctor (`@doctor` or "Flag for Doctor") in either S1 or S2, the doctor can respond to the patient **directly with a single message** without formally taking over the conversation (without transitioning to S3).

This is a **micro-engagement** — a one-shot direct reply that does not change Communication Level.

### 12.2 When It Is Available

| State | Nurse Tags Doctor | Quick Reply Available? |
|---|---|---|
| S1 (NURSE/NURSE) | Informal tag in chat | ✅ Yes — informal consult |
| S2 (DOCTOR/NURSE) | Formal tag via escalation packet | ✅ Yes — doctor replies without full S3 takeover |
| S3 (DOCTOR/DOCTOR) | N/A — doctor already owns chat | N/A |

### 12.3 Doctor Notification Card — Action Options

When doctor receives a tag notification, they see:

```
┌─────────────────────────────────────────┐
│  🏷 Nurse tagged you                    │
│  Patient: John Doe                      │
│  "Is it safe to double metformin dose?" │
│  Nurse note: "Patient insisting."       │
├─────────────────────────────────────────┤
│  [Quick Reply to Patient]               │  → one message, direct to patient
│  [Reply to Nurse Only]                  │  → internal consult, nurse relays
│  [Take Over Chat]                       │  → full S3 takeover
│  [Formally Accept Escalation → S2]     │  → only shown in S1 (see §13)
└─────────────────────────────────────────┘
```

### 12.4 Quick Reply Flow

```
Doctor selects "Quick Reply to Patient"
        │
Doctor types reply in pop-up input
        │
System sends message directly to patient chat
Patient sees: "Dr. Ahmed: No, do not change your dose."
        │
Communication Level stays = NURSE (unchanged)
        │
Nurse receives notification: "Dr. Ahmed replied directly"
Nurse resumes communication ownership
```

### 12.5 Quick Reply Rules

1. **One message only.** Quick Reply sends exactly one staff message to patient. After that, Communication Level reverts to its current owner (NURSE).
2. **Patient label is "Dr. [First Name]"** — Quick Reply always shows as the doctor personally, never as "Care Team."
3. **No SOAP note required** for a Quick Reply in S1 (informal). SOAP note is recommended but not mandatory.
4. **SOAP note is required** for a Quick Reply in S2 (doctor is clinically responsible). System prompts after Quick Reply is sent.
5. **Quick Reply is audited** as `reply_type = quick_reply` in the messages table.
6. **Doctor cannot Quick Reply to a clinical_critical message.** For critical messages, doctor must Take Over Chat (S3) or Formally Accept Escalation.

### 12.6 Data Model Addition — `messages.reply_type`

```typescript
reply_type: 'standard' | 'quick_reply' | 'relay' | 'internal'
// quick_reply = doctor replied directly to patient in one shot without S3 takeover
// relay       = nurse relaying a doctor's internal instruction
// internal    = staff-only, never shown to patient
// standard    = default for all normal messages
```

---

## 13. S1 vs S2 — Accountability and Obligation Distinction

### 13.1 The Core Difference

Both S1 and S2 allow a nurse to tag a doctor. Both allow a doctor to Quick Reply. The mechanism looks the same. **The difference is entirely about accountability, legal responsibility, and obligation.**

> **Escalation Level = who gets sued if something goes wrong.**
> In S1 → the nurse. In S2 → the doctor.

### 13.2 Side-by-Side Comparison

| Dimension | S1 (NURSE/NURSE) | S2 (DOCTOR/NURSE) |
|---|---|---|
| Clinical accountability | Nurse | **Doctor** |
| Legal/medical liability | Nurse | **Doctor** |
| Doctor's obligation to respond | None — voluntary | **Mandatory — SLA clock running** |
| Doctor SLA | ❌ None | ✅ Clinic-defined window |
| SOAP note on doctor reply | ❌ Not required | ✅ Required for any clinical decision |
| Formal escalation packet | ❌ Not created | ✅ Created and stored in medical record |
| Prescription authority | ❌ Not applicable (nurse owns case) | ✅ Doctor can issue prescription |
| Type of engagement | Informal consult — colleague advice | Formal clinical handoff |
| Medical record impact | Not recorded as escalation | **Recorded in patient's clinical history** |
| If doctor ignores the tag | Acceptable — nurse finds another path | **Clinical governance failure — supervisor alerted** |

### 13.3 The Analogy

> **S1 — Hallway consult:**
> *"Hey Dr. Ahmed, quick question — BP is 145/90, is that OK to continue monitoring?"*
> Doctor says *"Yeah that's fine."* No documentation. No liability transfer. Nurse still owns the case.

> **S2 — Formal handoff:**
> *"I am escalating this patient to you. Here is the handover note. Patient BP 145/90, asking about medication change."*
> Doctor is now **on record** as responsible. SOAP note required. SLA running. Doctor cannot ignore this.

### 13.4 Doctor Notification Difference by State

| When nurse tags in S1 | When nurse tags in S2 |
|---|---|
| Notification labelled: *"Informal consult request"* | Notification labelled: *"⚠️ Escalation — action required"* |
| No SLA badge | SLA countdown badge visible |
| Option: **"Formally Accept Escalation → S2"** shown | Not shown (already in S2) |
| No escalation packet created | Escalation packet already created |
| Doctor's response is optional | Doctor's response is **mandatory** |

### 13.5 The "Formally Accept Escalation" Button (S1 Only)

When a doctor receives an informal tag in S1 and recognises the case is clinically serious:

```
Doctor clicks "Formally Accept Escalation"
        │
System transitions: S1 → S2
  Escalation Level = DOCTOR (doctor assigned)
  Escalation Packet created automatically
  Doctor SLA clock starts
        │
Nurse notified: "Dr. Ahmed has accepted escalation for John Doe"
Patient receives system message:
"Your case is being reviewed by a doctor.
 Our care team will assist you meanwhile."
```

This is the bridge between informal (S1 hallway consult) and formal (S2 owned responsibility).

### 13.6 Clean Rule Summary

```
Nurse tags doctor in S1:
  → Doctor helping as a colleague
  → No obligation, no SLA, no formal record
  → Nurse remains accountable

Nurse tags doctor in S2:
  → Doctor is the responsible clinician
  → Obligation, SLA running, formal record required
  → Doctor is accountable

Doctor can convert S1 informal tag → S2 formal ownership
by clicking "Formally Accept Escalation"
```
