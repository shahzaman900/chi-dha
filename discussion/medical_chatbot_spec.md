# Medical Chatbot Specification

## 1. Rules for Chat from the Patient's Side

### Room Management
- **Predefined Rooms:** Multiple predefined rooms exist for a patient, including:
  - Medical
  - General
  - Billing
  - etc.
- **Medical Room Details:**
  - Only **one** medical room per patient.
  - When a staff member is assigned, automatically send a message: *"Person [xyz] is talking to you."*
  - **Integration:** Only the medical room is connected to prevhealth.
  - **Data Synchronisation:** Always send conversations in the medical room to prevhealth.
  - *Future Enhancement:* Staff can move a patient from the general room to the medical room.

### Communication & Privacy
- **Staff Switch Notification:** When ownership transfers from one staff member to another, the patient sees exactly one system message: *"You are now talking with [First Name]."* No other technical detail is shown, and the previous nurse's name is not mentioned.

### Messaging Mechanics
- **Message Status Indicators:** The patient sees three states per message:
  - **Sent:** Single tick
  - **Delivered to server:** Double tick
  - **Read by nurse:** Colored tick
  - *Note:* Never show "typing" from the queue bot — only from an assigned nurse.
- **No Message Deletion:** Patients cannot delete or edit sent messages. What is sent is on record.
- **Attachments Allowed:** Patients can send images and files up to 10 MB. Files are virus-scanned before delivery. A system message warns: *"Files are reviewed by clinical staff."*

### Access & History
- **Off-hours Auto-reply:** When no staff is online, the patient immediately receives: *"Our team is currently unavailable. For emergencies, please call [emergency number]. We will respond when our team is back online."*
- **Conversation History Visible:** The patient can scroll through the full history of the current session. Past closed sessions are accessible as read-only transcripts.

---

## 2. Rules for Chat from the Staff's Side

### Queue & Capacity Management
- **Queue Visibility:** All available nurses see the shared patient queue sorted by wait time.
  - **Priority Flagging:** Priority-flagged patients (keywords: *chest pain, emergency, unconscious, bleeding, suicidal*) appear at the top regardless of wait time.
- **Claim Mechanism:** A nurse claims a patient by pressing "Pick up." The claim is atomic (first to commit wins). The conversation is immediately removed from other nurses' queues.
- **Concurrent Conversation Limit:** A nurse can hold a maximum of **2 active conversations** simultaneously. When at capacity, the queue is still visible but the "Pick up" button is disabled with a tooltip: *"Close an active conversation to pick up a new one."*

### Workspace & Communication
- **Internal Notes:** Nurses can write notes inside a conversation that are invisible to the patient. Notes are timestamped, attributed, and part of the permanent record.
- **Transfer with Handover Note:** A nurse can transfer a conversation to another specific nurse or back to the general queue. A mandatory transfer note field (minimum 10 characters) must be filled before the transfer completes.
- **Message Undo:** A nurse has a **10-second window** to retract a sent message. After 10 seconds, the message is permanent. Retracted messages are soft-deleted (visible as *"Message removed"* to the patient and fully visible in the audit log).
- **No Cross-patient Visibility:** Nurses cannot see another nurse's active conversation unless they are a supervisor or the conversation has been explicitly shared via a consult.

---

## 3. Rules for Chat Sessions

- **AI Continuity:** AI can decide whether to continue the last session.

### Session States
Every conversation exists in one of these states:

| State | Meaning |
| :--- | :--- |
| **Queued** | Patient waiting, no nurse assigned |
| **Active** | Nurse claimed and is chatting |
| **On-hold** | Nurse paused (consult, break) — patient notified |
| **Transferred** | Moving between nurses, brief transition state |
| **Pending close**| Nurse marked resolved, 5-min grace for patient reply |
| **Closed** | Session ended, read-only |
| **Reopened** | Patient messaged after closure — new session linked to prior |

### Session End Triggers
A session closes when:
1. The nurse manually closes with an outcome tag.
2. The patient has been inactive for 15 consecutive minutes after the nurse's last message.
3. The session hits a 4-hour hard cap without any activity.
4. The patient explicitly types *"bye"*, *"done"*, or *"thank you, goodbye"* and the nurse confirms the close.

---

## 4. Rules for Medical Prevhealth Chats

- **Chat Labeling:** Label chats with participants (e.g., Nurse 1, Patient, Nurse 2, Nurse 3).

---

## 5. Chat Edge Cases to Handle

The system must handle the following edge cases:
- Two nurses claim the same patient conversation simultaneously.
- Patient sends a message but no nurse is online.
- Patient abandons the conversation mid-way.
- Shift handover with open conversations.
- Same patient texts multiple times before a nurse picks up.
- Patient queue grows beyond maximum capacity.
- Nurse picks up a case and goes offline mid-conversation.
- During one conversation in progress, can a patient message a particular other nurse?

---

## 6. Doctor Escalation & Consult Flows

### 6.1 Nurse Requests Doctor Advice (Soft Consult)

Used when a nurse cannot answer a patient's clinical question but retains ownership of the conversation.

**Flow:**
1. Nurse opens the patient conversation and clicks **"Ask Doctor"** (Consult).
2. Nurse selects the target doctor from the available staff list.
3. A **private consult thread** opens alongside the patient chat — the patient cannot see it.
4. The system auto-attaches the specific patient message(s) in question + the last 3–5 messages as context. The doctor can tap **"View Full History"** if needed.
5. Nurse adds a brief note describing the question (mandatory, minimum 10 characters).
6. Doctor reviews and **replies inside the consult thread only** — never directly in the patient chat.
7. Nurse reads the doctor's guidance and relays the answer to the patient in their own words.

> **Ownership:** The nurse retains full ownership of the patient conversation throughout. The patient continues to see only the nurse's name.

**Patient experience:** No change. Patient sees no system message and no indication a consult is happening.

**Audit:** The consult thread (question + doctor reply + timestamp) is stored as part of the permanent session record.

---

### 6.2 Hard Transfer — Nurse Escalates Patient to Doctor

Used when the clinical complexity requires the doctor to take over the conversation entirely.

**Flow:**
1. Nurse clicks **"Escalate to Doctor"** → selects the target doctor → fills a mandatory **handover note** (minimum 10 characters) summarising: chief complaint, relevant history, what has already been communicated to the patient.
2. Session state transitions to **Transferred** (brief transition) → **Active** (doctor owns).
3. Patient immediately receives the system message: *"You are now talking with Dr. [First Name]."*
4. All new patient messages route exclusively to the doctor's workspace.
5. The nurse no longer sees the conversation in their active list (read-only access for reference).

**Doctor reply rule:** Once the doctor owns the conversation, the doctor always replies. Nurses cannot pick up or interject in a doctor-owned conversation unless the doctor explicitly transfers it back.

**Doctor goes offline mid-conversation:** Session enters **On-hold** state. Patient receives: *"Your doctor will be back shortly. For emergencies, please call [emergency number]."* The conversation re-activates when the doctor comes back online or is manually re-assigned by a supervisor.

**Transfer back to nurse:** Doctor clicks **"Transfer to Nurse"**, selects nurse, fills handover note. Patient receives: *"You are now talking with [Nurse First Name]."*

| Escalation Type | Patient Ownership | Patient Sees |
|---|---|---|
| Soft Consult (6.1) | Nurse retains | No change |
| Hard Transfer (6.2) | Doctor takes over | *"You are now talking with Dr. X"* |
| Transfer back to Nurse | Nurse resumes | *"You are now talking with [Nurse Name]"* |

---

## 7. Messaging Ownership Rules After Escalation

- A conversation has exactly **one active owner** at any point in time (Nurse or Doctor).
- Patient messages always route to the current owner only.
- No two staff members can reply to the same active patient conversation simultaneously.
- System prevents nurses from accidentally claiming a doctor-owned conversation from the queue.
- Supervisors can override ownership in exceptional circumstances (e.g., doctor unreachable) and must log a reason.

---

## 8. Call Escalation Protocols

### 8.1 Conference Call (Preferred — Urgent Clinical Need)

Used when a nurse is already on a voice call with the patient and needs immediate doctor input.

**Flow:**
1. Nurse places patient on a brief, polite hold: *"Please hold for just a moment."*
2. Nurse contacts the doctor via the **internal staff channel** (separate from the patient line).
3. Doctor joins the call → 3-way conference established.
4. After the call, the doctor decides:
   - To take over the patient relationship (triggers Hard Transfer, Section 6.2), or
   - To return ownership to the nurse (nurse continues).

---

### 8.2 Warm Handoff (Standard Transfer)

Used for non-urgent escalations where a clean handover is preferred.

**Flow:**
1. Nurse informs the patient: *"I'm going to connect you with Dr. [First Name] who can better assist you."*
2. Nurse ends the patient call and calls the doctor first (patient not on the line).
3. Nurse briefs the doctor: patient name, chief complaint, key vitals, what was already communicated.
4. Nurse transfers the call to the doctor.
5. Doctor speaks directly with the patient. Hard Transfer (Section 6.2) is logged in the system.

---

### 8.3 Doctor Advises via Internal Chat (Nurse Stays on Call)

Used when the doctor is unavailable for a voice call but can respond via text.

**Flow:**
1. Nurse remains on the voice call with the patient.
2. Nurse opens an **internal message thread to the doctor** in parallel (this is a staff-only channel, not visible to the patient).
3. Doctor sends clinical guidance via text.
4. Nurse reads the guidance and relays it verbally to the patient in real time.
5. Patient experience is seamless — they only hear the nurse's voice throughout.

**Audit:** The internal message thread is stored as part of the session record linked to the patient and the call timestamp.

---

### Call Escalation Summary

| Scenario | Mechanism | Patient Experience | Doctor Mode |
|---|---|---|---|
| Urgent — doctor needed immediately | Conference call (8.1) | Brief hold, then doctor joins | Joins live call |
| Standard — clean transfer preferred | Warm handoff (8.2) | Brief hold, then speaks to doctor | Takes over call |
| Doctor can text only | Internal sidebar chat (8.3) | Seamless, hears only nurse | Advisory via text |

---

## 9. Two-State Patient Case Model (Decoupled Responsibility Design)

### 9.1 Core Concept

The system separates two concerns that are commonly and dangerously conflated in medical software:

| State | What It Controls | Values |
|---|---|---|
| **Escalation Level** | Clinical accountability — who is medically responsible | `NURSE` / `DOCTOR` |
| **Communication Level** | Chat ownership — who is actively responding to patient messages | `NURSE` / `DOCTOR` |

These two states are **independent**. A doctor can be clinically responsible (Escalation = DOCTOR) while a nurse handles all chat (Communication = NURSE). This mirrors how real RPM care teams work: doctor is accountable, nurse is responsive.

> **Reference implementations:** Teladoc Health, Amwell, Kaiser Permanente, Babylon Health all use a variant of this layered triage model.

---

### 9.2 The Four Valid State Combinations

| Scenario | Escalation Level | Communication Level | Description |
|---|---|---|---|
| **1. Normal Monitoring** | NURSE | NURSE | Standard RPM — nurse handles everything |
| **2. Doctor Escalated, Nurse Chatting** | DOCTOR | NURSE | Doctor clinically responsible; nurse handles daily chat and triage |
| **3. Active Doctor Engagement** | DOCTOR | DOCTOR | Doctor is directly interacting with patient |
| **4. Step-Down (Post-Doctor)** | NURSE | NURSE | Doctor episode resolved; nurse resumes full ownership |

> **Scenario 2 is the primary design target for RPM.** It solves the core problem: patient is escalated but asks casual questions during the 5-hour doctor review window.

---

### 9.3 State Rules Enforcement

#### Rule 1 — Escalation Defines Medical Authority
- If `Escalation = DOCTOR` → nurse **cannot give medical decisions** (medication changes, diagnosis, risk assessment).
- Nurse may only provide: reassurance, device guidance, administrative answers, status updates.
- If nurse is uncertain whether a message is clinical → **default is to tag doctor, never guess**.

#### Rule 2 — Communication Controls Responsiveness
- If `Communication = NURSE` → nurse is expected to reply **within minutes**.
- Doctor is not expected to be watching the chat and is not notified of every message.
- If `Communication = DOCTOR` → doctor is expected to reply within their SLA window.

#### Rule 3 — Nurse Cannot Override Doctor Authority
- Even when `Communication = NURSE` with `Escalation = DOCTOR`, nurse replies are labelled as **"Care Team"** — never as a final medical ruling.
- Nurse tone must be supportive, not decisive.  
  ✅ *"The doctor will review shortly. In general, continuing your normal routine is fine unless advised otherwise."*  
  ❌ *"Your BP is fine, you don't need to worry."*

#### Rule 4 — Doctor Has Passive Visibility (Filtered, Not Hidden)
- Doctor's default view = only tagged/escalated messages + system-generated patient summary.
- Doctor can always tap **"View Full Chat"** for complete history.
- Full chat is **never hidden** — it is filtered by default to reduce noise without creating blind spots.

---

### 9.4 Message Classification & Routing

Every incoming patient message is classified either automatically (keyword/AI triggers) or manually by the nurse.

| Message Category | Examples | Route To | Rule |
|---|---|---|---|
| **Clinical — Decision Required** | "Should I take this medicine?" · "Is my BP dangerous?" · "I have chest pain" | Doctor queue | Nurse must NOT answer. Nurse tags → doctor notified. |
| **Clinical — Non-Critical** | "Can I take paracetamol?" · "I feel a little dizzy" | Nurse (with note to doctor) | Nurse answers conservatively; doctor passively visible |
| **Routine / Casual** | "When will doctor reply?" · "Can I drink tea?" · "How do I use this device?" | Nurse | Nurse answers directly without restriction |
| **Administrative** | "Change my appointment" · "Send me my report" | Nurse | Nurse handles or routes to admin team |

**Auto-escalation triggers (system-level):**
Even if nurse does not manually tag, the system **automatically escalates to Doctor** when:
- Keywords detected: *chest pain, unconscious, can't breathe, suicidal, severe bleeding, stroke*
- Vitals breach threshold (defined per patient RPM plan)
- Patient sends the same concern 3+ times without a clinical response
- SLA breached (Communication = NURSE but no reply in `N` minutes while Escalation = DOCTOR)

---

### 9.5 Reply Labeling Rules (Patient-Facing)

The patient sees a **single unified chat thread** — never split by role. However, the sender label differs.

| Who Replies | Label Shown to Patient | Example |
|---|---|---|
| Nurse (any escalation state) | **Care Team** | *"Care Team: The doctor is reviewing your case. You can continue your regular routine."* |
| Doctor (direct reply) | **Dr. [First Name]** | *"Dr. Ahmed: Based on your vitals, please reduce your salt intake today."* |
| System / AI | **[Clinic Name] Team** | *"Our team is currently unavailable…"* |

> **Design rationale:** Labelling nurse responses as "Care Team" prevents patient confusion (*"Why is the nurse answering if the doctor is responsible?"*) and appropriately positions the doctor as the authority without blocking nurse responsiveness.

---

### 9.6 Intervention Trigger — Switching Communication Level

When `Communication = NURSE`, any of the following switches it to `Communication = DOCTOR`:

| Trigger | Who Initiates | What Happens |
|---|---|---|
| Nurse manually tags doctor | Nurse | Doctor notified with escalation packet (see §9.7) |
| Auto keyword/vitals alert | System | Doctor notified; session flagged urgent |
| SLA breach | System | Doctor notified; supervisor also alerted |
| Doctor decides to engage | Doctor | Doctor clicks "Take Over Chat"; patient notified |

When doctor finishes and returns to passive mode: doctor clicks **"Return to Nurse"** → `Communication` reverts to `NURSE`.

---

### 9.7 Escalation Packet (Structured Doctor Notification)

When a nurse tags the doctor or the system auto-escalates, the doctor receives a structured packet — never raw chat dump:

```
Patient: [Name], DOB, MRN
Chief Complaint: [Nurse summary]
Latest Vitals: HR 92, BP 145/90, SpO2 96% (as of 14:32)
Relevant Messages: [Last 3–5 messages only]
Nurse Note: "Patient asking about medication dose adjustment. Unsure if safe to advise."
Action Required: [Reply / Call / Review vitals]
```

Doctor can then:
- **Reply in chat** (Communication flips to DOCTOR for that reply, then returns to NURSE)
- **Full takeover** (Communication = DOCTOR until explicitly returned)
- **Send instruction to nurse** via internal thread only (nurse relays to patient)

---

### 9.8 SLA Definitions by State Combination

| Escalation Level | Communication Level | Nurse Response SLA | Doctor Response SLA |
|---|---|---|---|
| NURSE | NURSE | ≤ 5 minutes | Not applicable |
| DOCTOR | NURSE | ≤ 3 minutes (nurse) | ≤ defined doctor window (e.g., 4 hours) |
| DOCTOR | DOCTOR | Not applicable | ≤ 30 minutes |
| NURSE | NURSE (step-down) | ≤ 5 minutes | Not applicable |

SLA breach → system alert to supervisor. Repeated breach → escalation packet sent automatically to doctor regardless of current Communication state.

---

### 9.9 Minimal Data Model

#### patient_case

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "escalation_level": "NURSE | DOCTOR",
  "escalation_assigned_to": "staff_id",
  "communication_level": "NURSE | DOCTOR",
  "communication_assigned_to": "staff_id",
  "escalation_reason": "string",
  "escalated_at": "timestamp",
  "sla_deadline": "timestamp"
}
```

#### message

```json
{
  "id": "uuid",
  "case_id": "uuid",
  "sender_id": "uuid",
  "sender_role": "PATIENT | NURSE | DOCTOR | SYSTEM",
  "patient_label": "Care Team | Dr. [Name] | [Clinic] Team | null",
  "message_type": "clinical_critical | clinical_noncritical | routine | administrative",
  "requires_doctor": "boolean",
  "is_internal": "boolean",
  "escalation_packet_id": "uuid | null",
  "content": "string",
  "sent_at": "timestamp"
}
```

#### escalation_packet

```json
{
  "id": "uuid",
  "case_id": "uuid",
  "triggered_by": "NURSE | SYSTEM",
  "patient_summary": "string",
  "nurse_note": "string",
  "vitals_snapshot": "object",
  "relevant_messages": ["message_id"],
  "action_required": "REPLY | CALL | REVIEW_VITALS",
  "created_at": "timestamp",
  "doctor_acknowledged_at": "timestamp | null"
}
```

---

### 9.10 Edge Cases

| Edge Case | Resolution |
|---|---|
| Doctor is offline when nurse tags | Escalation packet queued; on-call doctor or supervisor notified automatically |
| Multiple doctors assigned to a patient | One doctor is designated as *Primary* per case; others are CC'd on escalation packets only |
| Doctor and nurse reply simultaneously | System locks message thread for 3 seconds after first character typed by owner; other party sees "X is typing…" and cannot send |
| Shift change while Escalation = DOCTOR | Incoming doctor receives escalation packet summary + last 10 messages. Escalation ownership transfers automatically |
| Patient escalated to doctor, doctor does not respond within SLA | System auto-notifies supervisor; supervisor can pull in a second doctor or flip Communication = NURSE with a mandatory nurse note |
| Nurse accidentally answers a clinical question | Audit log flags the message as "outside scope". Supervisor review triggered. Message remains visible to patient but doctor is notified |

---

## 10. Platform Design Principles (Reference Architecture)

These principles underpin the two-state model and must be reflected in all future feature design:

1. **Single patient thread** — Patient always sees one unified chat. Internal complexity is hidden from them.
2. **Explicit ownership** — Every message has a clear sender role and patient-facing label. Ambiguity is a clinical risk.
3. **Nurse is the continuity layer** — Nurse responsiveness keeps the patient engaged and safe during doctor review windows.
4. **Doctor is the authority layer** — Doctor involvement is structured (via escalation packets), not reactive to raw chat noise.
5. **System is the safety net** — Auto-escalation triggers, SLA monitoring, and keyword detection catch what humans might miss.
6. **Audit everything** — Every state change, tag, reply, and escalation packet is timestamped and attributed. No action is invisible.
7. **Supervisor as override** — Supervisors can intervene in any state but must log a reason. Override events are flagged in the audit trail.

---

## 11. Nurse-Owned Triage UI Flows

### Context

Starting state: `Escalation = NURSE`, `Communication = NURSE`
Trigger: Patient sends a message that requires a doctor's clinical input.

The nurse has two paths. The choice depends on whether the case needs a one-off answer (Sub-Flow A) or full doctor ownership going forward (Sub-Flow B).

---

### 11.1 Sub-Flow A — Soft Consult (Nurse retains ownership)

**When to use:** Nurse can still manage the patient day-to-day but needs a doctor's input before answering one specific question.

**Full Flow:**

```
1. Patient sends clinical message
2. Nurse reads it → recognises it needs a doctor's input
3. Nurse long-presses / right-clicks the message
4. Context menu appears → Nurse selects "Flag for Doctor"
5. Internal consult side panel opens (patient cannot see this)
6. Nurse types a consult note (min 10 chars) and taps "Send to Doctor"
7. Doctor receives a structured Escalation Packet (not raw chat)
8. Doctor replies inside the internal thread only — never in patient chat
9. Nurse reads doctor's reply → paraphrases and sends to patient
10. Patient reply is labelled "Care Team"
```

**State after:** `Escalation = NURSE`, `Communication = NURSE` — unchanged.

**Patient experience:** Patient sees exactly one nurse reply labelled "Care Team". They are unaware a consult happened.

**Nurse Chat Screen:**

```
┌─────────────────────────────────────────┐
│  Patient: John Doe           [NURSE 🟢] │
├─────────────────────────────────────────┤
│                                         │
│  ● John: "Can I increase my BP          │
│    medication on my own?"      10:42    │
│    ┌───────────────────────┐            │
│    │  🏷 Flag for Doctor   │  ← context │
│    │  📝 Add Internal Note │    menu    │
│    │  📋 Copy Message      │            │
│    └───────────────────────┘            │
│                                         │
│  Care Team: "Let me check with the      │
│  care team and get back to you          │
│  shortly."                    10:45     │
│                                         │
├─────────────────────────────────────────┤
│  [Internal Note]  [Flag Doctor 🏷]  [📎]│
│  Type a message...               [Send] │
└─────────────────────────────────────────┘
```

**Internal Consult Panel (slides in from right — staff only):**

```
┌──────────────────────────────────────┐
│  🔒 Internal Consult · Dr. Ahmed ▼   │
├──────────────────────────────────────┤
│  Patient Snapshot                    │
│  BP: 145/90  HR: 88  SpO2: 97%      │
│  [View last 3 messages ↓]            │
├──────────────────────────────────────┤
│  Nurse Note:                         │
│  "Asking about BP med dose —         │
│   unclear if safe to increase."      │
├──────────────────────────────────────┤
│  Dr. Ahmed: "No adjustment.          │
│  Keep current dose. Schedule a       │
│  review this week."        10:47     │
└──────────────────────────────────────┘
```

---

### 11.2 Sub-Flow B — Hard Escalation (Doctor takes ownership)

**When to use:** The question is beyond nurse scope and the doctor needs to own this case going forward (not just answer one question).

**Full Flow:**

```
1. Patient sends clinical message
2. Nurse reads it → decides full doctor ownership is needed
3. Nurse clicks "Escalate to Doctor" button in the top chat bar
4. Escalation modal opens
5. Nurse fills:
   - Select doctor (dropdown)
   - Escalation reason (dropdown)
   - Handover note (mandatory, min 10 chars)
   - Communication level: keep Nurse in chat OR switch to Doctor
6. Nurse confirms → system updates:
   Escalation Level = DOCTOR
   Communication Level = NURSE (default) or DOCTOR (nurse's choice)
7. Patient receives system message:
   "Your case is being reviewed by a doctor.
    Our care team will assist you meanwhile."
8. Doctor receives Escalation Packet notification
9. Doctor chooses one of three responses:
   A. Reply via nurse → sends internal instruction, nurse relays to patient
   B. Take Over Chat → Communication flips to DOCTOR, patient notified
   C. Acknowledge only → nurse continues handling chat under doctor authority
```

**State after:** `Escalation = DOCTOR`, `Communication = NURSE or DOCTOR` (per nurse's choice in step 5).

**Nurse Chat Screen — after escalation:**

```
┌──────────────────────────────────────────────┐
│  Patient: John Doe                           │
│  🔴 Escalation: DOCTOR  │  🟢 Comm: NURSE   │ ← state badges
│                                  [Escalate ▲]│
├──────────────────────────────────────────────┤
│                                              │
│  ── System ──────────────────────────────── │
│  Your case is being reviewed by a doctor.   │
│  Our care team will assist you meanwhile.   │
│  ─────────────────────────────────────────  │
│                                              │
│  ⚠️  Doctor escalation active               │
│     Answer only non-clinical questions      │
│                                              │
├──────────────────────────────────────────────┤
│  [Internal Note]  [Tag Doctor 🏷]  [📎]      │
│  Type a message...                   [Send]  │
└──────────────────────────────────────────────┘
```

**Escalation Modal:**

```
┌──────────────────────────────────────┐
│  Escalate to Doctor                  │
├──────────────────────────────────────┤
│  Doctor                              │
│  [ Dr. Ahmed                    ▼ ] │
│                                      │
│  Reason                              │
│  [ Clinical Question            ▼ ] │
│    Clinical Question                 │
│    Medication Review                 │
│    Concerning Symptoms               │
│    Vitals Alert                      │
│    Other                             │
│                                      │
│  Handover Note  (required)           │
│  ┌────────────────────────────────┐  │
│  │ Patient asking about BP med    │  │
│  │ dose increase — needs clinical │  │
│  │ judgment.                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  Communication during review         │
│  ◉ Keep Nurse in chat               │
│  ○ Switch to Doctor directly        │
│                                      │
│        [Cancel]    [Escalate →]      │
└──────────────────────────────────────┘
```

**Doctor's Escalation Packet Notification:**

```
┌──────────────────────────────────────────┐
│  🔴 New Escalation                       │
│  Patient: John Doe  |  Reason: Clinical  │
├──────────────────────────────────────────┤
│  Vitals: BP 145/90 · HR 88 · SpO2 97%  │
│  Nurse Note: "Asking about BP med dose  │
│  increase — needs clinical judgment."    │
├──────────────────────────────────────────┤
│  [View Snippet]  [Reply]  [Take Over ▶] │
└──────────────────────────────────────────┘
```

---

### 11.3 Nurse Decision Tree

```
Patient sends a message
        │
        ▼
Is this a clinical question?
        │
   No ──┴── Yes
   │         │
Nurse      Can nurse answer
answers    after one doctor input?
directly        │
           Yes ─┴─ No
           │         │
        Sub-Flow A  Sub-Flow B
        (Flag for   (Hard
         Doctor)    Escalation)
        Nurse       Doctor
        stays       takes
        owner       ownership
```

---

### 11.4 What the Patient Sees in Each Sub-Flow

| Moment | Sub-Flow A (Soft Consult) | Sub-Flow B (Hard Escalation) |
|---|---|---|
| Nurse reads message | No change | No change |
| Nurse flags / escalates | No change | System message: *"Your case is being reviewed by a doctor. Our care team will assist you meanwhile."* |
| Nurse replies | *"Care Team: Let me check and get back to you."* then *"Care Team: [relayed doctor answer]"* | *"Care Team: …"* (if Comm = NURSE) or *"Dr. Ahmed: …"* (if Comm = DOCTOR) |
| Doctor replies directly | Never — stays internal | *"Dr. Ahmed: …"* (only if Communication flipped to DOCTOR) |

---

### 11.5 Audit Trail for Both Sub-Flows

Every action in both sub-flows generates an immutable audit record:

| Event | Recorded Fields |
|---|---|
| Message flagged for doctor | `message_id`, `flagged_by`, `timestamp`, `escalation_packet_id` |
| Consult note sent | `nurse_id`, `doctor_id`, `note_text`, `timestamp` |
| Doctor replies in internal thread | `doctor_id`, `reply_text`, `timestamp`, `consult_thread_id` |
| Escalation modal submitted | `nurse_id`, `doctor_id`, `reason`, `handover_note`, `communication_choice`, `timestamp` |
| Patient system message sent | `message_id`, `trigger_event`, `timestamp` |
| Doctor takes over chat | `doctor_id`, `prev_communication_level`, `timestamp` |
