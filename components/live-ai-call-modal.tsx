"use client"

import { usePatientStore } from "@/store/patient-store"
import { 
  Phone, AlertTriangle, Stethoscope, Activity, FileText, 
  Send, RefreshCw, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"

export function LiveAiCopilotDashboard({ patientId }: { patientId: string }) {
  const { patients } = usePatientStore()
  const [activeTab, setActiveTab] = useState<'sick' | 'preventive'>('sick')
  const [nurseInput, setNurseInput] = useState("")
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const patient = patients.find(p => p.id === patientId)

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [patientId])

  if (!patient) return null

  return (
    <div className="bg-white flex-1 rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
        
        {/* --- TOP BAR (HUD) --- */}
        <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          
          {/* Patient Info */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {patient.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                  {patient.aiTriageScore?.toFixed(1) || patient.ewsScore.toFixed(1)} High Risk
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  LIVE CALL IN PROGRESS
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-4 mt-0.5">
                <span>{patient.age} yrs • Male</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +1 (555) 019-2834</span>
              </p>
            </div>
          </div>

          {/* AI Confidence & Predictions (From Sketch) */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end border-r border-slate-200 pr-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-700">Conclude Confidence</span>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex items-center gap-3 w-[200px]">
                <Progress value={80} className="h-2 flex-1 [&>div]:bg-red-500" />
                <span className="text-xl font-bold text-red-500">80%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
              <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-white rounded shadow-sm border border-slate-100 min-w-[100px]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Emergency</span>
                <span className="text-lg font-bold text-slate-800">10%</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-white rounded shadow-sm border border-slate-100 min-w-[100px]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Provider Req.</span>
                <span className="text-lg font-bold text-slate-800">2%</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-blue-50 rounded shadow-sm border border-blue-200 min-w-[100px]">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Nurse Handle</span>
                <span className="text-lg font-bold text-blue-700">80%</span>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-white rounded shadow-sm border border-slate-100 min-w-[100px]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">False Alarm</span>
                <span className="text-lg font-bold text-slate-800">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN BODY (3 Columns) --- */}
        <div className="flex-1 flex overflow-hidden bg-[#f4f6f8] p-4 gap-4">
          
          {/* COLUMN 1: Live Transcript */}
          <div className="w-[35%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Live Transcript: AI & Patient
              </h3>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">04:12</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {/* Mock Chat Bubbles */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[14px] text-slate-700 shadow-sm max-w-[85%]">
                  Hello Emily, this is your care team&apos;s AI assistant checking in following your recent vital sign alert. Are you experiencing any new shortness of breath today?
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                  PT
                </div>
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[14px] shadow-sm max-w-[85%]">
                  Yeah, a little bit. Especially when I walked to the kitchen earlier.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[14px] text-slate-700 shadow-sm max-w-[85%]">
                  I see. Have you noticed any increased swelling in your ankles or rapid weight gain over the last 24 hours?
                </div>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
                  PT
                </div>
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[14px] shadow-sm max-w-[85%]">
                  My shoes did feel pretty tight this morning. And I&apos;m just feeling very fatigued overall.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-[14px] text-slate-700 shadow-sm max-w-[85%]">
                  Thank you for sharing that. Are your joints aching as well, particularly your knees or wrists?
                </div>
              </div>
              <div ref={transcriptEndRef} />
            </div>
            
            {/* Input & Join Action */}
            <div className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-md font-bold text-base h-12 px-6 shrink-0 flex items-center gap-2 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
                JOIN CALL
              </Button>
              <div className="relative flex-1">
                <Input 
                  placeholder="Type a message to inject into AI prompt..." 
                  className="pr-10 h-12 rounded-xl bg-slate-50 border-slate-300 focus-visible:ring-blue-500"
                  value={nurseInput}
                  onChange={(e) => setNurseInput(e.target.value)}
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-blue-600 rounded-lg">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Suggested Questions */}
          <div className="w-[30%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Suggested Questions
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto bg-slate-50/30">
              <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                <button 
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'sick' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('sick')}
                >
                  Sick Visit Questions
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'preventive' ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('preventive')}
                >
                  Preventive Questions
                </button>
              </div>

              {activeTab === 'sick' ? (
                <div className="space-y-3">
                  <div className="bg-white border text-left border-indigo-100 hover:border-indigo-300 p-4 rounded-xl shadow-sm transition-colors cursor-pointer group">
                    <p className="text-[14px] text-slate-700 font-medium leading-snug group-hover:text-indigo-800">
                      &quot;Could you describe the swelling in your ankles? Does it pit when you press on it, and how high up your leg does it go?&quot;
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-indigo-600 bg-indigo-50 border-indigo-200">Fluid Retention</Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-500 bg-slate-50">Edema Focus</Badge>
                    </div>
                  </div>
                  <div className="bg-white border text-left border-indigo-100 hover:border-indigo-300 p-4 rounded-xl shadow-sm transition-colors cursor-pointer group">
                    <p className="text-[14px] text-slate-700 font-medium leading-snug group-hover:text-indigo-800">
                      &quot;When you felt short of breath earlier, were you lying completely flat or were you propped up on pillows?&quot;
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-indigo-600 bg-indigo-50 border-indigo-200">Orthopnea Check</Badge>
                    </div>
                  </div>
                  <div className="bg-white border text-left border-indigo-100 hover:border-indigo-300 p-4 rounded-xl shadow-sm transition-colors cursor-pointer group">
                    <p className="text-[14px] text-slate-700 font-medium leading-snug group-hover:text-indigo-800">
                      &quot;Can you tell me more about the fatigue? Is it worse in the morning or does it progress throughout the day?&quot;
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="text-[10px] text-indigo-600 bg-indigo-50 border-indigo-200">Symptom Clarification</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white border text-left border-slate-200 p-4 rounded-xl shadow-sm">
                    <p className="text-[14px] text-slate-700 font-medium leading-snug">
                      &quot;Have you been weighing yourself every morning as part of your fluid management plan?&quot;
                    </p>
                  </div>
                  <div className="bg-white border text-left border-slate-200 p-4 rounded-xl shadow-sm">
                    <p className="text-[14px] text-slate-700 font-medium leading-snug">
                      &quot;Are you up to date with your annual flu and pneumonia vaccinations?&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: Differential Diagnosis */}
          <div className="w-[35%] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-600" />
                Differential Diagnosis
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50/30">
              {/* DDx Item 1 */}
              <div className="bg-white border-[2px] border-amber-400 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h4 className="font-bold text-amber-700 text-[15px] leading-tight pr-4">Heart Failure Exacerbation</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-amber-600">40%</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Probability</span>
                  </div>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed pl-2 mt-2">
                  Patient reports experiencing shortness of breath upon exertion accompanied by unexpected weight gain (swollen ankles) and generalized weakness. These symptoms strongly correlate with volume overload typical in HF exacerbation.
                </p>
                <div className="mt-4 pl-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[40%] rounded-full"></div>
                </div>
              </div>

              {/* DDx Item 2 (From sketch) */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden hover:border-blue-300 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h4 className="font-bold text-blue-700 text-[15px] leading-tight pr-4">Fibromyalgia</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-blue-600">25%</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Probability</span>
                  </div>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed pl-2 mt-2">
                  Patient presents with joint pain in knees and wrists, fatigue, and general weakness, which are characteristic symptoms of fibromyalgia. The chronic nature referenced requires rule-out.
                </p>
                <div className="mt-4 pl-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[25%] rounded-full"></div>
                </div>
              </div>

               {/* DDx Item 3 */}
               <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden hover:border-slate-300 transition-colors opacity-80">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-300"></div>
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h4 className="font-bold text-slate-700 text-[15px] leading-tight pr-4">Viral Infection / Influenza</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-slate-500">15%</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Probability</span>
                  </div>
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed pl-2 mt-2">
                  Generalized fatigue, shortness of breath, and aching joints may present as early signs of a systemic viral infection, though lack of fever reduces probability.
                </p>
                <div className="mt-4 pl-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 w-[15%] rounded-full"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
  )
}
