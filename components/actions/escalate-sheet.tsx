"use client"

import { Patient, SoapNote } from "@/store/patient-store"
import { 
  Stethoscope, 
  FileText, 
  User, 
  Activity, 
  ClipboardList, 
  Plus, 
  X, 
  Info, 
  Search,
  ChevronDown,
  Trash2,
  Trash,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface EscalateSheetProps {
  patient: Patient | undefined
  open: boolean
  onClose: () => void
  onConfirm: (patientId: string, doctorId: string, soapNote: SoapNote) => void
}

type TabType = "subjective" | "objective" | "assessment" | "plan" | "info" | "investigate";

export function EscalateSheet({ patient, open, onClose, onConfirm }: EscalateSheetProps) {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("subjective")
  
  if (!patient) return null;

  // SOAP State
  const [soapData, setSoapData] = useState<SoapNote>(patient.draftSoapNote || {
    subjective: {
      chiefComplaint: "",
      hpi: {
        onset: "", location: "", duration: "", character: "", aggravating: "",
        relieving: "", timing: "", severity: "", radiation: "", 
        associatedSymptoms: "", pastEpisodes: "", details: ""
      },
      pastMedicalHistory: [],
      surgicalHistory: [],
      medications: [],
      allergies: { nkda: false, list: [] },
      vaccinations: [],
      familyHistory: [],
      socialHistory: [],
      ros: {}
    },
    objective: {
      physicalExam: { generalAppearance: "", examDetails: "", systems: {} },
      vitals: { temp: "", hr: "", rr: "", spo2: "", bpSystolic: "", bpDiastolic: "", height: "", weight: "", bmi: "" },
      labs: { results: "", imaging: "", other: "" }
    },
    assessment: {
      differentialDiagnosis: [],
      problemList: [],
      preventive: []
    },
    plan: {
      immediateActions: "",
      medications: [],
      labOrders: [],
      imagingOrders: [],
      procedureOrders: [],
      referrals: { list: [] },
      education: "",
      followUp: ""
    }
  })

  // Auto-fill vitals when sheet opens if not already present
  useEffect(() => {
    if (open && patient && !patient.draftSoapNote) {
      const lastHR = patient.vitalsTrend?.hr?.[patient.vitalsTrend.hr.length - 1]?.toString() || "";
      const lastSpO2 = patient.vitalsTrend?.spo2?.[patient.vitalsTrend.spo2.length - 1]?.toString() || "";
      const lastRR = patient.vitalsTrend?.rr?.[patient.vitalsTrend.rr.length - 1]?.toString() || "";
      const lastBP = patient.vitalsTrend?.bp?.[patient.vitalsTrend.bp.length - 1]?.toString() || "";
      
      setSoapData(prev => ({
        ...prev,
        objective: {
          ...prev.objective,
          vitals: {
            ...prev.objective?.vitals,
            hr: lastHR,
            spo2: lastSpO2,
            rr: lastRR,
            bpSystolic: lastBP.split("/")[0] || "",
            bpDiastolic: lastBP.split("/")[1] || "",
          }
        },
        subjective: {
          ...prev.subjective,
          chiefComplaint: `Patient presenting with elevated risk (EWS ${patient.ewsScore}). Trend is ${patient.trend}.`
        }
      }))
    }
  }, [open, patient])

  if (!patient) return null

  const handleClose = () => {
    onClose();
    setSelectedDoctor("");
    setActiveTab("subjective");
  }

  const updateSubField = (section: keyof SoapNote, field: string, value: any) => {
    setSoapData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  const renderSubjective = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Chief Complaint */}
      <div className="bg-white rounded-xl border border-rose-200 overflow-hidden shadow-sm">
        <div className="bg-rose-50 px-4 py-2 border-b border-rose-200 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-rose-500 flex items-center justify-center text-white font-bold text-xs">!</div>
          <h3 className="font-bold text-rose-800 text-sm">Chief Complaint</h3>
        </div>
        <div className="p-3">
          <Input 
            value={soapData.subjective?.chiefComplaint} 
            onChange={(e) => updateSubField("subjective", "chiefComplaint", e.target.value)}
            className="border-slate-200 focus:ring-rose-500 h-10"
            placeholder="Abdominal discomfort, weight loss, etc."
          />
        </div>
      </div>

      {/* HPI */}
      <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-500 flex items-center justify-center text-white">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-bold text-indigo-800 text-sm">History of Present Illness (HPI)</h3>
        </div>
        <div className="p-4 grid grid-cols-5 gap-3">
          {[
            { label: "Onset", key: "onset" }, 
            { label: "Location", key: "location" },
            { label: "Duration", key: "duration" },
            { label: "Character", key: "character" },
            { label: "Aggravating", key: "aggravating" },
            { label: "Relieving", key: "relieving" },
            { label: "Timing", key: "timing" },
            { label: "Severity", key: "severity" },
            { label: "Radiation", key: "radiation" },
            { label: "Associated Symptoms", key: "associatedSymptoms" }
          ].map(field => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{field.label}</label>
              <Input 
                value={(soapData.subjective?.hpi as any)?.[field.key]}
                onChange={(e) => {
                  const newHpi = { ...soapData.subjective?.hpi, [field.key]: e.target.value };
                  updateSubField("subjective", "hpi", newHpi);
                }}
                className="h-8 text-xs border-slate-200 px-2" 
                placeholder={field.label}
              />
            </div>
          ))}
          <div className="col-span-5 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Details</label>
            <Textarea 
              value={soapData.subjective?.hpi?.details}
              onChange={(e) => {
                const newHpi = { ...soapData.subjective?.hpi, details: e.target.value };
                updateSubField("subjective", "hpi", newHpi);
              }}
              className="min-h-[60px] text-xs" 
              placeholder="Detailed history..."
            />
          </div>
        </div>
      </div>

      {/* Past Medical History & Surgical History */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 flex items-center justify-between">
            <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 bg-emerald-500 text-white rounded-sm" /> PMH
            </h3>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600 hover:bg-emerald-100" onClick={() => {
              const newList = [...(soapData.subjective?.pastMedicalHistory || []), { condition: "", details: "" }];
              updateSubField("subjective", "pastMedicalHistory", newList);
            }}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="p-2 space-y-2">
            {soapData.subjective?.pastMedicalHistory?.map((item, i) => (
              <div key={i} className="flex gap-1">
                <Input value={item.condition} placeholder="Condition" className="h-7 text-[11px]" onChange={(e) => {
                  const newList = [...(soapData.subjective?.pastMedicalHistory || [])];
                  newList[i].condition = e.target.value;
                  updateSubField("subjective", "pastMedicalHistory", newList);
                }} />
                <Input value={item.details} placeholder="Details" className="h-7 text-[11px]" onChange={(e) => {
                  const newList = [...(soapData.subjective?.pastMedicalHistory || [])];
                  newList[i].details = e.target.value;
                  updateSubField("subjective", "pastMedicalHistory", newList);
                }} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden shadow-sm">
          <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200 flex items-center justify-between">
            <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 bg-indigo-500 text-white rounded-sm" /> Surgical
            </h3>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-indigo-600 hover:bg-indigo-100" onClick={() => {
              const newList = [...(soapData.subjective?.surgicalHistory || []), { surgery: "", details: "" }];
              updateSubField("subjective", "surgicalHistory", newList);
            }}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="p-2 space-y-2">
            {soapData.subjective?.surgicalHistory?.map((item, i) => (
              <div key={i} className="flex gap-1">
                <Input value={item.surgery} placeholder="Surgery" className="h-7 text-[11px]" onChange={(e) => {
                  const newList = [...(soapData.subjective?.surgicalHistory || [])];
                  newList[i].surgery = e.target.value;
                  updateSubField("subjective", "surgicalHistory", newList);
                }} />
                <Input value={item.details} placeholder="Details" className="h-7 text-[11px]" onChange={(e) => {
                  const newList = [...(soapData.subjective?.surgicalHistory || [])];
                  newList[i].details = e.target.value;
                  updateSubField("subjective", "surgicalHistory", newList);
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderObjective = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Vitals HUD */}
      <div className="bg-white rounded-xl border border-rose-200 overflow-hidden shadow-sm">
        <div className="bg-rose-50 px-4 py-2 border-b border-rose-200 flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-500" />
          <h3 className="font-bold text-rose-800 text-sm">Vital Signs</h3>
        </div>
        <div className="p-4 grid grid-cols-4 gap-4">
          {[
            { label: "Temp", key: "temp", unit: "°F" },
            { label: "Heart Rate", key: "hr", unit: "bpm" },
            { label: "Resp Rate", key: "rr", unit: "rpm" },
            { label: "O2 Sat", key: "spo2", unit: "%" },
            { label: "Systolic", key: "bpSystolic", unit: "mmHg" },
            { label: "Diastolic", key: "bpDiastolic", unit: "mmHg" },
            { label: "Height", key: "height", unit: "in" },
            { label: "Weight", key: "weight", unit: "lbs" }
          ].map(field => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{field.label}</label>
              <div className="relative flex items-center">
                <Input 
                  value={(soapData.objective?.vitals as any)?.[field.key]}
                  onChange={(e) => {
                    const newVitals = { ...soapData.objective?.vitals, [field.key]: e.target.value };
                    updateSubField("objective", "vitals", newVitals);
                  }}
                  className="h-9 text-sm font-bold border-slate-200 pr-8" 
                />
                <span className="absolute right-2 text-[10px] text-slate-400 font-bold">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Exam Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block">General Appearance</label>
          <Textarea 
            value={soapData.objective?.physicalExam?.generalAppearance}
            onChange={(e) => {
              const newExam = { ...soapData.objective?.physicalExam, generalAppearance: e.target.value };
              updateSubField("objective", "physicalExam", newExam);
            }}
            placeholder="Alert and oriented..." 
            className="h-32 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 block">Physical Exam Findings</label>
          <Textarea 
            value={soapData.objective?.physicalExam?.examDetails}
            onChange={(e) => {
              const newExam = { ...soapData.objective?.physicalExam, examDetails: e.target.value };
              updateSubField("objective", "physicalExam", newExam);
            }}
            placeholder="Lungs clear bilaterally..." 
            className="h-32 text-sm"
          />
        </div>
      </div>
    </div>
  )

  const renderAssessment = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-sm">
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
          <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-amber-600" /> Differential Diagnosis
          </h3>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8" onClick={() => {
            const newList = [...(soapData.assessment?.differentialDiagnosis || []), { diagnosis: "", icd10: "", likelihood: 50, risk: 20, group: "G1" }];
            updateSubField("assessment", "differentialDiagnosis", newList);
          }}>
            <Plus className="h-3 w-3 mr-1.5" /> Add Diagnosis
          </Button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="px-4 py-2">Diagnosis</th>
                <th className="px-2 py-2 w-24">ICD-10</th>
                <th className="px-2 py-2 w-20">Likely%</th>
                <th className="px-2 py-2 w-20">Risk%</th>
                <th className="px-2 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {soapData.assessment?.differentialDiagnosis?.map((item, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-2"><Input value={item.diagnosis} className="h-7 border-transparent focus:border-slate-200 transition-all text-xs" onChange={(e)=>{
                    const nl = [...(soapData.assessment?.differentialDiagnosis || [])]; nl[i].diagnosis = e.target.value; updateSubField("assessment", "differentialDiagnosis", nl);
                  }} /></td>
                  <td className="p-2"><Input value={item.icd10} className="h-7 border-transparent focus:border-slate-200 transition-all text-xs" onChange={(e)=>{
                    const nl = [...(soapData.assessment?.differentialDiagnosis || [])]; nl[i].icd10 = e.target.value; updateSubField("assessment", "differentialDiagnosis", nl);
                  }} /></td>
                  <td className="p-2">
                    <Select value={item.likelihood.toString()} onValueChange={(v) => {
                      const nl = [...(soapData.assessment?.differentialDiagnosis || [])]; nl[i].likelihood = parseInt(v); updateSubField("assessment", "differentialDiagnosis", nl);
                    }}>
                      <SelectTrigger className="h-7 border-transparent shadow-none px-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10,20,30,40,50,60,70,80,90,100].map(v => <SelectItem key={v} value={v.toString()}>{v}%</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Select value={item.risk.toString()} onValueChange={(v) => {
                      const nl = [...(soapData.assessment?.differentialDiagnosis || [])]; nl[i].risk = parseInt(v); updateSubField("assessment", "differentialDiagnosis", nl);
                    }}>
                      <SelectTrigger className="h-7 border-transparent shadow-none px-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10,20,30,40,50,60,70,80,90,100].map(v => <SelectItem key={v} value={v.toString()}>{v}%</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500" onClick={() => {
                       updateSubField("assessment", "differentialDiagnosis", soapData.assessment?.differentialDiagnosis?.filter((_, idx) => idx !== i));
                    }}><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!soapData.assessment?.differentialDiagnosis || soapData.assessment.differentialDiagnosis.length === 0) && (
            <div className="py-8 text-center text-slate-400 italic text-sm">No diagnoses added. AI suggests starting with DDx.</div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPlan = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
        <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 flex items-center gap-2 text-blue-800">
          <h3 className="font-bold text-sm">Immediate Actions</h3>
        </div>
        <div className="p-3">
          <Textarea 
            value={soapData.plan?.immediateActions}
            onChange={(e) => updateSubField("plan", "immediateActions", e.target.value)}
            placeholder="NPO, IV Fluid start, repeat vitals q15m..."
            className="min-h-[80px] text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm">Follow Up</h3>
          </div>
          <div className="p-3">
             <Textarea 
              value={soapData.plan?.followUp}
              onChange={(e) => updateSubField("plan", "followUp", e.target.value)}
              placeholder="Re-evaluate in 4 hours..."
              className="min-h-[60px] text-xs"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-sm">Patient Education</h3>
          </div>
          <div className="p-3">
             <Textarea 
              value={soapData.plan?.education}
              onChange={(e) => updateSubField("plan", "education", e.target.value)}
              placeholder="Educated on red flag symptoms..."
              className="min-h-[60px] text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const tabIcons: Record<TabType, any> = {
    subjective: User,
    objective: Activity,
    assessment: Stethoscope,
    plan: ClipboardList,
    info: Info,
    investigate: Search
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent className="sm:max-w-[700px] p-0 flex flex-col h-full bg-slate-50 overflow-hidden border-l-brand-600 border-l-[6px]">
        <SheetHeader className="px-6 py-5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">Handoff Escalation</SheetTitle>
                <SheetDescription className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  Comprehensive SOAP Note
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* --- CUSTOM TABS BAR --- */}
        <div className="bg-white px-6 border-b border-slate-200 shrink-0">
           <div className="flex gap-2 -mb-[1px]">
             {([
               { id: "subjective", label: "Subjective" },
               { id: "objective", label: "Objective" },
               { id: "assessment", label: "Assessment" },
               { id: "plan", label: "Plan" },
               /* { id: "info", label: "Info" },
               { id: "investigate", label: "Investigate" } */
             ] as {id: TabType, label: string}[]).map(tab => {
               const Icon = tabIcons[tab.id];
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`
                     flex items-center gap-2 px-4 py-3.5 text-[13px] font-bold transition-all border-b-2
                     ${isActive 
                       ? "border-brand-600 text-brand-700 bg-brand-50/30" 
                       : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}
                   `}
                 >
                   <Icon className={`h-4 w-4 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                   {tab.label}
                 </button>
               )
             })}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          {/* Physician Selection - ALWAYS VISIBLE */}
          <div className="mb-8 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex-1 mr-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Target Physician</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 focus:ring-brand-500 rounded-xl">
                  <SelectValue placeholder="Select Physician to notify..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr_smith">Dr. Sarah Smith (Cardiology)</SelectItem>
                  <SelectItem value="dr_jones">Dr. Michael Jones (Pulmonology)</SelectItem>
                  <SelectItem value="dr_patel">Dr. Amit Patel (Internal Med)</SelectItem>
                  <SelectItem value="dr_chen">Dr. Emily Chen (Hospitalist)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-brand-50 rounded-2xl px-5 py-3 border border-brand-100 min-w-[140px]">
              <div className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-0.5">EWS Score</div>
              <div className="text-2xl font-black text-brand-700 leading-none">{patient.ewsScore}</div>
              <div className="text-[10px] font-bold text-brand-500 uppercase mt-1 px-1.5 bg-brand-100/50 rounded inline-block">{patient.status}</div>
            </div>
          </div>

          <div className="pb-20">
            {activeTab === "subjective" && renderSubjective()}
            {activeTab === "objective" && renderObjective()}
            {activeTab === "assessment" && renderAssessment()}
            {activeTab === "plan" && renderPlan()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
            onClick={handleClose}
          >
            Trash Draft
          </Button>
          <Button 
            className="flex-[2] h-12 bg-brand-600 hover:bg-brand-700 text-white shadow-[0_4px_10px_rgba(37,99,235,0.2)] font-bold rounded-xl transition-all disabled:opacity-50"
            disabled={!selectedDoctor || !soapData.subjective?.chiefComplaint}
            onClick={() => {
              onConfirm(patient.id, selectedDoctor, soapData);
              handleClose();
            }}
          >
            <Stethoscope className="h-5 w-5 mr-2" />
            Notify Dr. & Escalate
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

