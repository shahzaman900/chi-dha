# Practice Dashboard — Complete Website Flow Analysis

> **Project:** AI-Powered Remote Patient Monitoring Dashboard  
> **Stack:** Next.js (App Router), Zustand, TypeScript, Tailwind CSS, shadcn/ui  
> **Generated:** Feb 24, 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current Website Flow](#2-current-website-flow)
3. [Nurse Flow](#3-nurse-flow)
4. [Doctor Flow](#4-doctor-flow)
5. [Patient Flow](#5-patient-flow)
6. [EWS Overall Escalation Flow](#6-ews-overall-escalation-flow)
7. [Enterprise Platform Architecture](#7-enterprise-platform-architecture)
8. [Best Flow Recommendations](#8-best-flow-recommendations)

---

## 1. Architecture Overview

### Pages

| Route       | File                    | Purpose                       |
| ----------- | ----------------------- | ----------------------------- |
| `/`         | `app/page.tsx`          | Main dashboard — Patient list |
| `/phr/[id]` | `app/phr/[id]/page.tsx` | Standalone PHR detail page    |

### Components

| Component         | File                               | Purpose                                                                                    |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `SiteHeader`      | `components/site-header.tsx`       | Top bar + nav (Dashboard, Command Center, Messages, Users, Reports, Settings, Escalations) |
| `PracticeHeader`  | `components/practice-header.tsx`   | Patient list toolbar (search, add, refresh, View PHR button)                               |
| `PatientTable`    | `components/patient-table.tsx`     | Patient list table with EWS scores, status, trends (opens PHR modal on "View PHR")         |
| `PhrDisplay`      | `components/phr-display.tsx`       | PHR modal — Patient profile, vitals, differential diagnosis, timeline                      |
| `PhrModalDetails` | `components/phr-modal-details.tsx` | Deep-dive modals — AI assessment, treatment plans, emergency protocols                     |

### State Management (Zustand Stores)

| Store            | Key Data                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| `patient-store`  | Patient list, selected patient ID, PHR modal open/close                   |
| `phr-store`      | PHR records (profile, EWS, metrics, timeline, diagnosis, treatment plans) |
| `practice-store` | Practice/clinic records (not actively used in current UI)                 |

### Data (3 Patients with PHR Data)

| ID  | Patient             | EWS | Status    | Scenario                                               |
| --- | ------------------- | --- | --------- | ------------------------------------------------------ |
| 1   | William Davis (75)  | 11  | CRITICAL  | COPD exacerbation — AI auto-escalated to ER            |
| 2   | Robert Johnson (68) | 7   | High Risk | Heart failure — AI symptom call → Nurse → Doctor       |
| 3   | Kylie James (32)    | 9   | CRITICAL  | Meningitis risk — Patient-initiated symptom check → ER |

---

## 2. Current Website Flow

```mermaid
flowchart TD
    A["Landing: / (Main Dashboard)"] --> B["SiteHeader (top nav)"]
    A --> C["PracticeHeader (toolbar)"]
    A --> D["PatientTable (patient list)"]

    D -->|"Click row"| E["Select patient (highlight row)"]
    E -->|"Click 'View PHR' button"| F["Open PHR Modal (Dialog)"]

    F --> G["PhrDisplay: Header (name, EWS, status)"]
    F --> H["PhrDisplay: Patient Profile card"]
    F --> I["PhrDisplay: Current Vitals card"]
    F --> J["PhrDisplay: Differential Diagnosis card"]
    F --> K["PhrDisplay: Timeline of Events"]

    J -->|"Click 'View Detailed'"| L["Detailed Diagnosis Modal (probability, risk, factors)"]
    K -->|"Click 'View Details' on timeline event"| M["PhrModalDetails Modal"]

    M --> N{"Which view?"}
    N -->|"assessment"| O["3-column: Initial Dx → AI Q&A Chat → Updated Dx"]
    N -->|"treatment"| P["3-column: Treatment Actions / Lab Dispatch / Med Delivery"]
    N -->|"default"| Q["3-column: Initial Dx → AI Q&A → Updated Dx"]

    K -->|"Patient 2: 'View Detailed' on escalation"| R["Treatment Details Modal"]
    R --> S["Immediate Interventions + Monitoring + Nurse Dispatch + Lab Dispatch"]
```

---

## 3. Nurse Flow

### Current Flow (as implemented)

```mermaid
flowchart TD
    N1["🏠 Nurse logs in → Main Dashboard (/)"]
    N2["📋 Views Patient Table (sorted by EWS score)"]
    N3["🔍 Identifies high-risk / critical patients"]
    N4["👆 Clicks patient row → Selects patient"]
    N5["📄 Clicks 'View PHR' → Opens PHR Modal"]

    N1 --> N2 --> N3 --> N4 --> N5

    N5 --> N6["Reviews Patient Profile (age, conditions, history)"]
    N5 --> N7["Reviews Current Vitals (HR, RR, SpO2, BP)"]
    N5 --> N8["Reviews AI Differential Diagnosis (probability bars)"]
    N5 --> N9["Reviews Timeline of Events"]

    N9 -->|"Clicks 'View Details' on nurse-related events"| N10["Views Treatment/Escalation Modal"]
    N10 --> N11["Reviews Approved Treatment Actions"]
    N10 --> N12["Reviews Medication Delivery Workflow"]
    N10 --> N13["Reviews Nurse Dispatch details"]

    N8 -->|"Clicks 'View Detailed'"| N14["Reviews Detailed Diagnosis (positive/negative factors)"]
```

### Nurse's Key Touchpoints

1. **Patient Triage** — View patient table, identify by EWS score & status badges
2. **PHR Review** — Open modal to see full patient profile and vitals
3. **Timeline Review** — See chronological events, including AI calls and escalations
4. **Treatment Execution** — View treatment plans, nurse dispatch assignments, medication delivery workflow
5. **Escalation** — See cases escalated TO the nurse (from AI) and cases nurse escalates UP (to doctor/ER)

### Scenarios by Patient

| Patient                    | Nurse Role                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| William Davis (CRITICAL)   | Nurse receives AI escalation → dispatches emergency services → performs clinical handoff           |
| Robert Johnson (High Risk) | Nurse Sarah joins AI call → assesses fluid overload → messages Dr. Patel → executes treatment plan |
| Kylie James (CRITICAL)     | Nurse escalation: immediate ER referral → monitors vitals en route → neuro checks q15min           |

---

## 4. Doctor Flow

### Current Flow (as implemented)

```mermaid
flowchart TD
    D1["🏥 Doctor logs in → Main Dashboard (/)"]
    D2["📊 Views Patient Table — Focus on CRITICAL & High Risk"]
    D3["👆 Selects patient row"]
    D4["📄 Clicks 'View PHR' → Opens PHR Modal"]

    D1 --> D2 --> D3 --> D4

    D4 --> D5["Reviews EWS Score & Status"]
    D4 --> D6["Reviews Patient Profile & History"]
    D4 --> D7["Reviews Current Vitals & Trends"]
    D4 --> D8["Reviews AI Differential Diagnosis"]
    D4 --> D9["Reviews Timeline of Events"]

    D8 -->|"Clicks 'View Detailed'"| D10["Detailed Diagnosis View"]
    D10 --> D11["Reviews probability %, risk scores, positive/negative factors per condition"]

    D9 -->|"Clicks 'View Details' on AI Assessment"| D12["AI Assessment Modal"]
    D12 --> D13["Col 1: Initial Dx (Pre-Q&A)"]
    D12 --> D14["Col 2: AI Symptom Check Chat Transcript"]
    D12 --> D15["Col 3: Updated Dx (Post-Q&A)"]

    D9 -->|"Clicks 'View Detailed' on escalation"| D16["Treatment Details Modal"]
    D16 --> D17["Immediate Interventions (Rx changes, BP control, dietary)"]
    D16 --> D18["Monitoring & Follow-up Schedule"]
    D16 --> D19["Nurse Dispatch details"]
    D16 --> D20["Lab Dispatch details"]
```

### Doctor's Key Touchpoints

1. **Dashboard Overview** — Scan all patients, focus on highest EWS scores
2. **Clinical Decision Support** — Review AI-generated differential diagnosis with evidence
3. **AI-Patient Interaction Review** — Read symptom checker transcripts to assess quality of AI triage
4. **Treatment Planning** — Review/approve treatment details (medications, labs, monitoring)
5. **Dispatch Review** — Verify nurse and lab dispatch assignments and schedules

### Scenarios by Patient

| Patient                    | Doctor Role                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| William Davis (CRITICAL)   | Reviews emergency protocol activation, verifies ER triage notification and clinical handoff data                                    |
| Robert Johnson (High Risk) | Receives escalation from nurse, reviews AI assessment, approves treatment (increase diuretics, order labs), sets follow-up schedule |
| Kylie James (CRITICAL)     | Reviews AI meningitis assessment, verifies ER transport dispatch, reviews clinical handoff data                                     |

---

## 5. Patient Flow

### Current Flow (as implemented)

```mermaid
flowchart TD
    P1["📱 Patient triggers via remote monitoring / symptom checker"]
    P2["🤖 AI system detects vital sign changes"]
    P3["📞 AI initiates call to patient (Symptom Check)"]
    P4["💬 AI Q&A session (symptoms, history, lifestyle)"]
    P5["🧠 AI generates/updates differential diagnosis"]

    P1 --> P2 --> P3 --> P4 --> P5

    P5 -->|"Low-Medium Risk"| P6["Monitoring adjustments, patient education"]
    P5 -->|"High Risk"| P7["Escalation to Nurse → Doctor"]
    P5 -->|"CRITICAL"| P8["Emergency Protocol → ER Transport"]

    subgraph "Patient 2: Robert Johnson"
        P4a["AI calls patient about rising HR, BP, weight"]
        P4b["Patient reports: mild SOB, puffy ankles, salty food, sleeping propped up"]
        P4c["AI assesses: Early fluid overload"]
        P4d["Nurse Sarah joins call → escalates to Dr. Patel"]
    end

    subgraph "Patient 3: Kylie James"
        P3a["Patient initiates symptom check (headache, fever)"]
        P3b["AI detects: neck stiffness, photophobia, vomiting"]
        P3c["AI flags: CRITICAL meningitis risk"]
        P3d["Nurse escalation: Immediate ER referral"]
    end
```

### Patient's Key Touchpoints (Indirect — via AI)

1. **Remote Monitoring** — Vitals automatically collected (HR, BP, SpO2, weight, etc.)
2. **AI Symptom Check Call** — AI initiates or patient initiates a symptom assessment call
3. **Q&A Interaction** — AI asks targeted questions, patient responds
4. **Escalation Notification** — Patient is informed of nurse/doctor involvement
5. **Treatment Outcomes** — Nurse home visit, lab tech home visit, medication delivery

---

## 6. EWS Overall Escalation Flow

> The **Early Warning Score (EWS)** is the core engine driving the entire system. This is the end-to-end flow from vitals collection to patient outcome.

![EWS Escalation Flow](public/flowcharts/ews_overall_flow.png)

### How It Works — Step by Step

```mermaid
flowchart TD
    subgraph MONITORING["🏠 CONTINUOUS REMOTE MONITORING"]
        M1["Patient's home devices collect vitals"]
        M2["HR, BP, SpO2, RR, Temp, Weight"]
    end

    MONITORING --> EWS["🧠 AI COMPUTES EWS SCORE<br/>Based on vitals + historical trends"]

    EWS -->|"EWS 0-4"| LOW["🟢 LOW RISK"]
    EWS -->|"EWS 5-6"| MED["🟡 MEDIUM RISK"]
    EWS -->|"EWS 7-8"| HIGH["🟠 HIGH RISK"]
    EWS -->|"EWS 9+"| CRIT["🔴 CRITICAL"]

    LOW --> L1["Continue routine monitoring"]
    L1 --> L2["Patient education & lifestyle tips"]
    L2 --> L3["Next check: 12-24 hours"]
    L3 --> MONITORING

    MED --> MD1["AI initiates patient call"]
    MD1 --> MD2["Symptom Q&A assessment"]
    MD2 --> MD3["AI updates differential diagnosis"]
    MD3 --> MD4["Nurse notified & reviews"]
    MD4 --> MD5["Treatment plan adjusted"]
    MD5 --> MD6["Follow-up in 24-48 hrs"]
    MD6 --> MONITORING

    HIGH --> H1["⚠️ IMMEDIATE AI ALERT"]
    H1 --> H2["AI calls patient — Symptom Q&A"]
    H2 --> H3["AI generates differential diagnosis"]
    H3 --> H4["Nurse escalation"]
    H4 --> H5["Doctor reviews case"]
    H5 --> H6["Doctor approves treatment plan"]
    H6 --> H7["Nurse Dispatch: Home visit"]
    H6 --> H8["Lab Dispatch: Blood work"]
    H6 --> H9["Medication Delivery"]
    H7 --> FU["📅 Follow-up & Outcome Tracking"]
    H8 --> FU
    H9 --> FU
    FU --> MONITORING

    CRIT --> C1["🚨 EMERGENCY PROTOCOL ACTIVATED"]
    C1 -->|"Patient responds"| C2["AI Symptom Q&A Assessment"]
    C1 -->|"No response"| C3["Auto-escalate to Nurse"]
    C2 --> C4["AI Differential Diagnosis"]
    C3 --> C4
    C4 --> C5["🚑 Ambulance Dispatched"]
    C4 --> C6["📋 ER Triage Notified"]
    C4 --> C7["📄 Clinical Handoff Data Sent"]
    C5 --> ER["🏥 EMERGENCY ROOM"]
    C6 --> ER
    C7 --> ER
```

### EWS Score Ranges & Actions

| EWS Score | Risk Level  | Color     | System Action                               | Human Involvement                                   |
| --------- | ----------- | --------- | ------------------------------------------- | --------------------------------------------------- |
| **0 – 4** | Low Risk    | 🟢 Green  | Continue monitoring, patient education      | None required                                       |
| **5 – 6** | Medium Risk | 🟡 Yellow | AI calls patient, symptom Q&A               | Nurse notified, reviews findings                    |
| **7 – 8** | High Risk   | 🟠 Orange | Immediate AI alert, full symptom assessment | Nurse escalates → Doctor reviews → Treatment plan   |
| **9+**    | Critical    | 🔴 Red    | Emergency protocol activated                | Ambulance dispatched, ER notified, clinical handoff |

### Real Examples from the Dashboard

| Patient                 | EWS    | Trigger                             | AI Action                                 | Escalation Path                           | Outcome                                                          |
| ----------------------- | ------ | ----------------------------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| **William Davis** (75)  | **11** | HR 124, SpO2 88%, RR 28             | AI called — no response (disoriented)     | AI → Nurse → Emergency Services           | 🚑 Ambulance dispatched, ER triage notified, clinical handoff    |
| **Robert Johnson** (68) | **7**  | HR 102, BP 148/92, Weight +2.5 lbs  | AI called patient — symptom Q&A completed | AI → Nurse Sarah → Dr. Patel              | 💊 Diuretics increased, labs ordered, nurse home visit scheduled |
| **Kylie James** (32)    | **9**  | Temp 102.3°F, HR 115, headache 8/10 | Patient initiated symptom check           | AI flags meningitis → Nurse → ER referral | 🚑 Ambulance dispatched, meningitis protocol activated           |

---

## 7. Enterprise Platform Architecture

> How enterprise-grade RPM platforms (Epic, Philips, Biofourmis, etc.) manage patient monitoring at scale.

![Enterprise RPM Platform Flow](public/flowcharts/enterprise_platform_flow.png)

### 5 Layers of an Enterprise RPM Platform

| Layer                        | What It Does                                           | Key Systems                                                                            |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **1. Data Collection**       | Collects vitals from patient devices & EHR systems     | IoT wearables, HL7/FHIR, Epic/Cerner, Patient App (MyChart)                            |
| **2. AI & Analytics Engine** | Processes vitals, computes EWS, predicts deterioration | ML-enhanced EWS, Risk stratification, NLP for patient calls, AI differential diagnosis |
| **3. Automated Triage**      | Routes patients by severity into escalation workflows  | Low → education, Medium → AI call, High → nurse+doctor, Critical → ER                  |
| **4. Care Coordination**     | Manages all human actions triggered by the system      | Nurse command center, Doctor portal (e-prescribe), Lab dispatch, Pharmacy integration  |
| **5. Business & Compliance** | Handles revenue, legal, and population health          | CPT billing, HIPAA audit logs, Population analytics, HEDIS/MIPS quality metrics        |

### Your Dashboard vs Enterprise Platforms

| Feature                    | Your Dashboard | Enterprise (Epic/Philips/Biofourmis) |
| -------------------------- | :------------: | :----------------------------------: |
| EWS Score                  |       ✅       |           ✅ + ML-enhanced           |
| AI Symptom Checker         |       ✅       |               ⚠️ Rare                |
| AI Differential Diagnosis  |       ✅       |  ❌ Rare — **your differentiator**   |
| Nurse Escalation           |       ✅       |           ✅ + paging/SMS            |
| Doctor Review              |  ✅ read-only  |       ✅ + e-prescribe, e-sign       |
| Patient Portal             |       ❌       |           ✅ MyChart etc.            |
| EHR Integration (HL7/FHIR) |       ❌       |                  ✅                  |
| Lab/Nurse Dispatch         |    ✅ in UI    |          ✅ + GPS tracking           |
| Billing & Claims           |       ❌       |           ✅ CPT/Medicare            |
| HIPAA Compliance           |       ❌       |                  ✅                  |

> [!TIP]
> Your **AI Differential Diagnosis** and **AI Symptom Checker** features are ahead of most enterprise platforms. These are your biggest competitive advantages.

---

## 8. Best Flow Recommendations

---

### 🩺 Best Doctor Flow (Recommended)

![Doctor Flow](public/flowcharts/doctor_flow.png)

```mermaid
flowchart TD
    style DR1 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR2 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR3 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR4 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR5 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR6 fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style DR7 fill:#1e3a5f,stroke:#3b82f6,color:#fff

    DR1["1. Command Center<br/>📊 Priority queue sorted by EWS<br/>🔔 Real-time alerts for new escalations"]
    DR2["2. Case Review<br/>📋 One-click patient summary<br/>🧠 AI diagnosis + confidence level"]
    DR3["3. AI Assessment Review<br/>💬 Read symptom check transcript<br/>📉 Compare Pre vs Post Q&A diagnosis"]
    DR4["4. Clinical Decision<br/>✅ Approve / Modify treatment plan<br/>💊 Adjust medications with safety checks"]
    DR5["5. Dispatch Authorization<br/>👩‍⚕️ Assign/confirm nurse dispatch<br/>🧪 Authorize lab orders"]
    DR6["6. Follow-up Dashboard<br/>📅 Track patient outcomes<br/>🔄 Review post-treatment vitals trends"]
    DR7["7. Escalation History<br/>📝 Audit trail of all decisions<br/>📞 Communication log"]

    DR1 --> DR2 --> DR3 --> DR4 --> DR5 --> DR6 --> DR7
```

**What's Missing (Suggestions to Add):**

- **Priority queue / Command Center** — A dedicated escalation inbox showing only cases that need doctor attention, sorted by urgency
- **Approve/Reject Treatment** — Interactive treatment plan approval (not just read-only view)
- **Prescribing Interface** — Inline medication adjustment with drug interaction checks
- **Follow-up Tracker** — Post-treatment outcome dashboard showing patient response to interventions
- **Doctor-to-Doctor Consult** — Ability to request specialist consultation directly

---

### 👩‍⚕️ Best Nurse Flow (Recommended)

![Nurse Flow](public/flowcharts/nurse_flow.png)

```mermaid
flowchart TD
    style NR1 fill:#1e3a4f,stroke:#06b6d4,color:#fff
    style NR2 fill:#1e3a4f,stroke:#06b6d4,color:#fff
    style NR3 fill:#1e3a4f,stroke:#06b6d4,color:#fff
    style NR4 fill:#1e3a4f,stroke:#06b6d4,color:#fff
    style NR5 fill:#1e3a4f,stroke:#06b6d4,color:#fff
    style NR6 fill:#1e3a4f,stroke:#06b6d4,color:#fff

    NR1["1. Shift Dashboard<br/>📋 Today's assigned patients<br/>🚨 Active alerts (sorted by EWS)"]
    NR2["2. Patient Quick View<br/>🩺 Vitals snapshot + trend arrows<br/>⚠️ Active alerts & flags"]
    NR3["3. AI Triage Review<br/>🤖 AI symptom check summary<br/>📊 Diagnosis probabilities"]
    NR4["4. Action Center<br/>💊 Execute prescribed treatments<br/>📝 Document interventions<br/>📞 Contact doctor if needed"]
    NR5["5. Dispatch Management<br/>🏠 Home visit scheduling<br/>🧪 Lab coordination<br/>💊 Med delivery tracking"]
    NR6["6. Escalation Panel<br/>⬆️ Escalate to doctor<br/>🚑 Activate emergency protocol<br/>📋 Handoff documentation"]

    NR1 --> NR2 --> NR3 --> NR4 --> NR5 --> NR6
```

**What's Missing (Suggestions to Add):**

- **Task/Checklist System** — Interactive checklist for nurse to mark completed interventions
- **Real-time AI Co-pilot** — Live AI assistance during patient calls (suggested questions, risk flags)
- **Shift Handoff** — Structured handoff notes for the next nurse shift
- **Direct Messaging** — In-app messaging to doctors, lab techs, and patients
- **Home Visit Tracker** — Map-based view of scheduled home visits with patient locations

---

### 🧑‍💻 Best Patient Flow (Recommended)

![Patient Flow](public/flowcharts/patient_flow.png)

```mermaid
flowchart TD
    style PR1 fill:#1e4f3a,stroke:#10b981,color:#fff
    style PR2 fill:#1e4f3a,stroke:#10b981,color:#fff
    style PR3 fill:#1e4f3a,stroke:#10b981,color:#fff
    style PR4 fill:#1e4f3a,stroke:#10b981,color:#fff
    style PR5 fill:#1e4f3a,stroke:#10b981,color:#fff
    style PR6 fill:#1e4f3a,stroke:#10b981,color:#fff

    PR1["1. My Health Dashboard<br/>❤️ Current vitals (auto-synced)<br/>📈 Health trend graphs"]
    PR2["2. AI Health Check<br/>📱 On-demand symptom checker<br/>🤖 AI-guided Q&A conversation"]
    PR3["3. Alerts & Notifications<br/>🔔 'Your nurse has been notified'<br/>📞 Incoming care team call alerts"]
    PR4["4. Care Plan View<br/>💊 My medications & schedule<br/>📅 Upcoming appointments & visits"]
    PR5["5. Care Team Communication<br/>💬 Message nurse / doctor<br/>📹 Telehealth video call"]
    PR6["6. Health Education<br/>📚 Condition-specific resources<br/>🥗 Dietary & lifestyle guidance"]

    PR1 --> PR2 --> PR3 --> PR4 --> PR5 --> PR6
```

**What's Missing (Suggestions to Add):**

- **Patient-Facing App/Portal** — Currently no patient-facing UI exists; patients experience the system only through AI phone calls
- **My Health Dashboard** — Self-service vitals view with trends and personal health record
- **Symptom Checker UI** — Web/mobile interface for patient-initiated symptom checks (not just phone call)
- **Appointment & Visit Tracker** — View upcoming nurse home visits, lab visits, doctor appointments
- **Medication Reminders** — Push notifications / SMS for medication adherence
- **Care Plan Education** — Personalized health content based on diagnosed conditions

---

## Summary of Gaps & Priorities

| Priority  | Feature                               | Affects   | Impact                                            |
| --------- | ------------------------------------- | --------- | ------------------------------------------------- |
| 🔴 High   | Priority Escalation Inbox for Doctors | Doctor    | Reduces time-to-action on critical cases          |
| 🔴 High   | Interactive Treatment Approval        | Doctor    | Enables doctors to approve/modify plans inline    |
| 🔴 High   | Nurse Task Checklist                  | Nurse     | Tracks intervention completion and accountability |
| 🟡 Medium | Patient-Facing Portal                 | Patient   | Empowers patients with health visibility          |
| 🟡 Medium | Real-time Notifications/Alerts        | All roles | Ensures timely response to changes                |
| 🟡 Medium | Messaging System                      | All roles | Enables direct communication between roles        |
| 🟢 Low    | Shift Handoff Notes                   | Nurse     | Improves continuity of care between shifts        |
| 🟢 Low    | Health Education Portal               | Patient   | Improves patient engagement and compliance        |
| 🟢 Low    | Analytics/Reports Dashboard           | Doctor    | Tracks population-level trends                    |
