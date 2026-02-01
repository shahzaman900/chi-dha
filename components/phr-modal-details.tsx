import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CheckCircle2, Activity, AlertTriangle, Siren, Check, Maximize2, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

import { PhrData } from "@/store/phr-store"

export function PhrModalDetails({ patient, view = 'default' }: { patient: PhrData, view?: 'assessment' | 'treatment' | 'default' }) {
    const [showDiagnosisDetails, setShowDiagnosisDetails] = useState(false);
    if (patient.patientId === '1') {
        return (
            <div className="bg-slate-950 p-6 rounded-lg h-full overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <div className="bg-red-500/20 p-2 rounded-lg">
                            <Activity className="h-6 w-6 text-red-500" />
                        </div>
                        Treatment Plan Execution
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 ml-12">Critial Escalation Protocol Active</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Approved Treatment Actions */}
                    <Card className="bg-slate-900 border border-slate-800">
                        <CardHeader className="bg-slate-800/50 border-b border-slate-800 pb-3">
                            <CardTitle className="text-base text-cyan-400 font-bold uppercase tracking-wide">Approved Treatment Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {patient.treatmentPlan?.actions.map((action, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{action}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Column 2: Lab Dispatch Workflow */}
                    <Card className="bg-slate-900 border border-slate-800">
                        <CardHeader className="bg-slate-800/50 border-b border-slate-800 pb-3">
                            <CardTitle className="text-base text-orange-400 font-bold uppercase tracking-wide">Lab Dispatch Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {patient.treatmentPlan?.labDispatch.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Column 3: Nurse Dispatch Workflow */}
                    <Card className="bg-slate-900 border border-slate-800">
                        <CardHeader className="bg-slate-800/50 border-b border-slate-800 pb-3">
                            <CardTitle className="text-base text-emerald-400 font-bold uppercase tracking-wide">Nurse Dispatch Workflow</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {patient.treatmentPlan?.nurseDispatch.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }


    if (patient.patientId === '2' || patient.patientId === '3') {
        const isEmergency = patient.patientId === '3';

        return (
            <div className="bg-slate-950 p-6 rounded-lg h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isEmergency ? 'text-red-400' : 'text-slate-100'}`}>
                        <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                            {isEmergency ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <Activity className="h-6 w-6 text-orange-500" />}
                        </div>
                        {view === 'assessment' ? 'AI Assessment & Analysis' : (isEmergency ? 'CRITICAL: Emergency Protocol Activation' : 'Early Warning Intervention & Triage')}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 ml-12">
                        {view === 'assessment' ? 'Symptom Check & Differential Diagnosis' : (isEmergency ? 'AI -> ER Diversion Protocol Active' : 'AI -> Nurse Escalation Protocol Active')}
                    </p>
                </div>

                {/* Content based on View */}
                {view === 'assessment' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
                        {/* Col 1: Initial Diagnosis (Pre-Q&A) */}
                        <Card className="bg-slate-900 border border-slate-800 flex flex-col h-full">
                            <CardHeader className="pb-2 bg-slate-800/50 border-b border-slate-800">
                                <CardTitle className="text-lg text-orange-400">Initial Differential Diagnosis</CardTitle>
                                <p className="text-xs text-slate-500 font-medium">AI Analysis: Pre-Q&A</p>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                {patient.initialDiagnosis?.map((d, i) => (
                                    <DiagnosisBar key={i} name={d.name} percentage={d.probability} color={d.color} description="" />
                                ))}
                            </CardContent>
                        </Card>
                    
                        {/* Col 2: Q&A Chat */}
                        <div className="flex-1 bg-[##fafafa] rounded-xl border border-slate-800 flex flex-col overflow-hidden h-full">
                            <div className="bg-[#202c33] p-3 flex items-center gap-3 border-b border-slate-800">
                                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-slate-200 font-bold text-sm">CHI Monitoring Agent</p>
                                    <p className="text-slate-500 text-xs">Automated Symptom Check</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 bg-repeat opacity-90 custom-scrollbar">
                                {patient.symptomCheckerTranscript?.map((step: any, i: number) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-start">
                                            <div className="bg-[#202c33] text-slate-200 p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm shadow-md">
                                                <p className="font-bold text-emerald-400 text-xs mb-1">System</p>
                                                {step.system}
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-[#155dfc] text-white p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm shadow-md">
                                                <p className="font-bold text-emerald-200 text-xs mb-1 text-right">John Miller</p>
                                                {step.patient}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Col 3: Updated Diagnosis (Post-Q&A) */}
                        <Card className="bg-slate-900 border border-slate-800 flex flex-col h-full">
                            <CardHeader className="pb-2 bg-slate-800/50 border-b border-slate-800">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-red-500">Updated Probabilities</CardTitle>
                                        <p className="text-xs text-slate-500 font-medium">Post-Q&A Analysis</p>
                                    </div>
                                    {patient.patientId === '3' && (
                                        <button 
                                            onClick={() => setShowDiagnosisDetails(true)}
                                            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 px-2 py-1 rounded bg-cyan-950/30"
                                        >
                                            <Maximize2 className="h-3 w-3" /> View Detailed
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                {patient.diagnosis.map((d: any, i: number) => (
                                    <DiagnosisBar key={i} name={d.name} percentage={d.probability} color={d.color} description="" />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 h-[800px]">
                       {isEmergency ? (
                           <>
                              {/* Emergency Col 1: ER Transport */}
                              <Card className="bg-red-950/10 border border-red-900/40 flex-1">
                                   <CardHeader className="bg-red-900/20 border-b border-red-900/40 py-3">
                                       <CardTitle className="text-sm text-red-400 font-bold uppercase tracking-wide flex items-center gap-2">
                                           <Siren className="h-4 w-4" /> Immediate ER Transport
                                       </CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                       <div className="p-4 bg-red-900/10 rounded-lg border border-red-900/30">
                                           <div className="text-red-300 font-bold text-lg mb-1">Ambulance Dispatched</div>
                                           <div className="text-red-400/70 text-sm">ETA: 8 Minutes</div>
                                       </div>
                                       {patient.treatmentPlan?.actions.map((action: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
                                               <p className="text-slate-300 text-sm">{action}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>

                              {/* Emergency Col 2: Hospital Notification */}
                              <Card className="bg-slate-900 border border-slate-800 flex-1">
                                   <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                                       <CardTitle className="text-sm text-orange-400 font-bold uppercase tracking-wide">ER Triage Notification</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                       <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                                           <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                                               <Check className="h-4 w-4 text-green-500" />
                                           </div>
                                           <div>
                                               <div className="text-slate-200 font-medium text-sm">City General ER Notified</div>
                                               <div className="text-slate-500 text-xs">Meningitis Protocol Activated</div>
                                           </div>
                                       </div>
                                       <Separator className="bg-slate-800" />
                                       {patient.treatmentPlan?.labDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                               <p className="text-slate-300 text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>

                              {/* Emergency Col 3: Clinical Handoff */}
                              <Card className="bg-slate-900 border border-slate-800 flex-1">
                                   <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                                       <CardTitle className="text-sm text-cyan-400 font-bold uppercase tracking-wide">Clinical Handoff Data</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Transmitted Vitals</div>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                                <div className="text-slate-400 text-[10px]">TEMP</div>
                                                <div className="text-red-400 font-mono font-bold">102.3 F</div>
                                            </div>
                                            <div className="bg-slate-800 p-2 rounded border border-slate-700">
                                                <div className="text-slate-400 text-[10px]">HR</div>
                                                <div className="text-orange-400 font-mono font-bold">115 BPM</div>
                                            </div>
                                        </div>
                                        <Separator className="bg-slate-800 mb-4" />
                                        {patient.treatmentPlan?.nurseDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                                               <p className="text-slate-300 text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>
                           </>
                       ) : (
                           <>
                               {/* Treatment Plan: Approved Actions */}
                               <Card className="bg-slate-900 border border-slate-800 flex-1">
                                   <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                                       <CardTitle className="text-sm text-cyan-400 font-bold uppercase tracking-wide">Approved Treatment Actions</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.actions.map((action: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                                               <p className="text-slate-300 text-sm">{action}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                               </Card>

                               {/* Lab Dispatch */}
                               <Card className="bg-slate-900 border border-slate-800 flex-1">
                                   <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                                       <CardTitle className="text-sm text-orange-400 font-bold uppercase tracking-wide">Lab Dispatch Workflow</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.labDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                               <p className="text-slate-300 text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                               </Card>

                               {/* Medication Delivery */}
                               <Card className="bg-slate-900 border border-slate-800 flex-1">
                                   <CardHeader className="bg-slate-800/50 border-b border-slate-800 py-3">
                                       <CardTitle className="text-sm text-emerald-400 font-bold uppercase tracking-wide">Medication Delivery Workflow</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.nurseDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                               <p className="text-slate-300 text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                               </Card>
                           </>
                       )}
                    </div>
                )}

            
            {showDiagnosisDetails && patient.diagnosisDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-cyan-600" />
                                Differential Diagnosis
                            </h2>
                            <div className="flex items-center gap-4">
                                <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                                <button 
                                    onClick={() => setShowDiagnosisDetails(false)}
                                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                            {patient.diagnosisDetails.map((detail, idx) => (
                                <div key={idx} className="bg-[#FFFBEB] border-l-4 border-l-yellow-400 rounded-r-lg shadow-sm p-4 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-yellow-700">{detail.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-yellow-600">{detail.probability}%</span>
                                            <div className="text-xs font-bold text-slate-400">Risk: {detail.risk}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-0 right-0 w-32 h-1 bg-yellow-200"></div>
                                    
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                        {detail.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {detail.positiveFactors.map((factor, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md border border-green-200">
                                                {factor}
                                            </span>
                                        ))}
                                        {detail.negativeFactors.map((factor, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">
                                                {factor}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    {/* Progress Bar Visual */}
                                    <div className="mt-3 h-1.5 w-full bg-yellow-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-500 rounded-full" 
                                            style={{ width: `${detail.probability}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
        )
    }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Section 1: Initial Differential Diagnosis */}
      <Card className="bg-slate-900 border border-slate-800 flex flex-col h-full">
        <CardHeader className="pb-2 bg-slate-800/50 border-b border-slate-800">
            <CardTitle className="text-lg text-orange-400">Initial Differential Diagnosis</CardTitle>
            <p className="text-xs text-slate-500 font-medium">AI Analysis: Pre-Q&A</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto custom-scrollbar">
          <DiagnosisBar 
            name="Acute Heart Failure Exacerbation" 
            percentage={45} 
            color="red"
            description="Weight gain, edema, vital instability"
          />
          <DiagnosisBar 
            name="Hypertensive Crisis" 
            percentage={25} 
            color="orange"
            description="Elevated BP with tachycardia"
          />
          <DiagnosisBar 
            name="Infection/Sepsis" 
            percentage={20} 
            color="orange-light"
            description="Fever + vital instability (less likely)"
          />
          <DiagnosisBar 
            name="Medication Non-compliance" 
            percentage={10} 
            color="yellow" 
            description="Sudden change in pattern"
          />
        </CardContent>
      </Card>

      {/* Section 2: AI-Powered Q&A Assessment */}
      <Card className="bg-slate-900 border border-slate-800 flex flex-col h-full">
        <CardHeader className="pb-2 bg-slate-800/50 border-b border-slate-800">
            <CardTitle className="text-lg text-cyan-400">AI-Powered Q&A</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Patient Interaction</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Questions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-5 w-5 text-cyan-500" />
                    <h4 className="text-sm font-semibold text-cyan-400">AI Questions</h4>
                </div>
                <div className="space-y-2 text-slate-300 text-xs pl-2 border-l-2 border-slate-700">
                    <p><span className="text-slate-500 font-mono">Q1:</span> Any shortness of breath?</p>
                    <p><span className="text-slate-500 font-mono">Q2:</span> Increased swelling in legs?</p>
                    <p><span className="text-slate-500 font-mono">Q3:</span> Recent infections/fever?</p>
                    <p><span className="text-slate-500 font-mono">Q4:</span> Taking all medications?</p>
                    <p><span className="text-slate-500 font-mono">Q5:</span> Any chest pain/pressure?</p>
                    <p><span className="text-slate-500 font-mono">Q6:</span> Recent dietary changes?</p>
                    <p><span className="text-slate-500 font-mono">Q7:</span> How is your sleep?</p>
                </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Answers */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h4 className="text-sm font-semibold text-green-400">Patient Findings</h4>
                </div>
                <div className="space-y-2 text-slate-300 text-xs pl-2 border-l-2 border-slate-700">
                    <p><span className="text-slate-500 font-mono">A1:</span> Mild SOB on exertion</p>
                    <p><span className="text-slate-500 font-mono">A2:</span> YES - ankles puffier</p>
                    <p><span className="text-slate-500 font-mono">A3:</span> No fever, feeling okay</p>
                    <p><span className="text-slate-500 font-mono">A4:</span> YES - taking all meds</p>
                    <p><span className="text-slate-500 font-mono">A5:</span> No chest pain</p>
                    <p><span className="text-slate-500 font-mono">A6:</span> Ate salty food recently</p>
                    <p><span className="text-slate-500 font-mono">A7:</span> Sleeping propped up</p>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Section 3: Updated Probabilities */}
      <Card className="bg-slate-900 border border-slate-800 flex flex-col h-full">
        <CardHeader className="pb-2 bg-slate-800/50 border-b border-slate-800">
            <CardTitle className="text-lg text-orange-400">Updated Probabilities</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Post-Q&A Analysis</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto custom-scrollbar">
          <DiagnosisBar 
            name="Acute Heart Failure Exacerbation" 
            percentage={68} 
            color="red"
            description="Weight gain (+2.5 lbs) + ankle edema + SOB on exertion + sleeping propped up (orthopnea) + salty food intake"
          />
          <DiagnosisBar 
            name="Hypertensive Crisis" 
            percentage={18} 
            color="orange"
            description="Medication compliance confirmed, so less likely."
          />
          <DiagnosisBar 
            name="Infection/Sepsis" 
            percentage={8} 
            color="orange-light"
            description="No fever or signs of infection."
          />
          <DiagnosisBar 
            name="Medication Non-compliance" 
            percentage={6} 
            color="yellow"
            description="Patient confirmed compliance."
          />
        </CardContent>
      </Card>
    </div>
  )
}

function DiagnosisBar({ name, percentage, color, description }: { name: string, percentage: number, color: string, description: string }) {
  const textColorClass = color === 'red' ? 'text-red-500' : color === 'orange' ? 'text-orange-500' : color === 'orange-light' ? 'text-orange-400' : 'text-yellow-400';

  return (
      <div className="space-y-2">
          <div className="flex justify-between items-end mb-1">
              <span className="font-bold text-slate-200 text-base">{name}</span>
          </div>
          <div className="flex items-center gap-4">
              <span className={`text-xl font-bold w-12 ${textColorClass}`}>{percentage}%</span>
              <div className="flex-1 h-8 bg-slate-800/50 rounded-r-md rounded-l-md overflow-hidden relative border border-white/10">
                  <div 
                      className={`h-full rounded-r-md rounded-l-md bg-gradient-to-r ${color === 'red' ? 'from-red-600 to-red-500' : color === 'orange' ? 'from-orange-600 to-orange-500' : color === 'orange-light' ? 'from-orange-400 to-amber-500' : 'from-yellow-400 to-yellow-300'}`} 
                      style={{ width: `${percentage}%` }}
                  ></div>
              </div>
          </div>
          <p className="text-slate-400 text-xs pl-16">{description}</p>
      </div>
  )
}
