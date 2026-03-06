import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CheckCircle2, Activity, AlertTriangle, Siren, Check, Maximize2, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

import { PhrData } from "@/store/phr-store"

export function PhrModalDetails({ patient, view = 'default' }: { patient: PhrData, view?: 'assessment' | 'treatment' | 'default' }) {
    const [showDiagnosisDetails, setShowDiagnosisDetails] = useState(false);
    if (patient.patientId === '1') {
        return (
            <div className="bg-muted p-6 rounded-lg h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                            <div className="bg-red-500/20 p-2 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            CRITICAL: Emergency Protocol Activation
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1 ml-12">AI -&gt; ER Diversion Protocol Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Column 1: Immediate ER Transport */}
                    <Card className="bg-red-50 border border-red-200 flex flex-col shadow-sm">
                        <CardHeader className="bg-card border-b border-red-100 py-4">
                            <CardTitle className="text-sm text-red-600 font-bold uppercase tracking-wide flex items-center gap-2">
                                <Siren className="h-4 w-4" /> IMMEDIATE ER TRANSPORT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 flex-1">
                            <div className="p-4 bg-card rounded-lg border border-red-100 shadow-sm">
                                <div className="text-red-700 font-bold text-lg mb-1">Ambulance Dispatched</div>
                                <div className="text-red-500 font-medium text-sm">ETA: 8 Minutes</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-3 items-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                    <p className="text-muted-foreground text-sm">Immediate ER Transport (Ambulance Dispatched)</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                    <p className="text-muted-foreground text-sm">Notify Emergency Contact</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                                    <p className="text-muted-foreground text-sm">Pre-Arrival Notification to ER Triage</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 2: ER Triage Notification */}
                    <Card className="bg-card border border-border flex flex-col">
                        <CardHeader className="bg-muted/50 border-b border-border py-4">
                            <CardTitle className="text-sm text-orange-400 font-bold uppercase tracking-wide">ER TRIAGE NOTIFICATION</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 flex-1">
                             <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                    <Check className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground mb-0.5">City General ER Notified</div>
                                    <div className="text-foreground font-bold text-lg">COPD Exacerbation</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                                <div className="flex gap-3 items-start">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                    <p className="text-black text-lg">Supplemental Oxygen</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                    <p className="text-foreground text-lg">Intravenous (IV) Steroids</p>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                    <p className="text-foreground text-lg">Non-Invasive Ventilation (NIV)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 3: Clinical Handoff Data */}
                    <Card className="bg-card border border-border flex flex-col">
                        <CardHeader className="bg-muted/50 border-b border-border py-4">
                            <CardTitle className="text-sm text-brand-600 font-bold uppercase tracking-wide">CLINICAL HANDOFF DATA</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 flex-1">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">TRANSMITTED VITALS</div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-muted p-2 rounded border border-border">
                                        <div className="text-muted-foreground text-[10px]">HR</div>
                                        <div className="font-mono font-bold text-red-400">124 BPM</div>
                                    </div>
                                    <div className="bg-muted p-2 rounded border border-border">
                                        <div className="text-muted-foreground text-[10px]">RR</div>
                                        <div className="font-mono font-bold text-red-400">28/min</div>
                                    </div>
                                    <div className="bg-muted p-2 rounded border border-border">
                                        <div className="text-muted-foreground text-[10px]">SPO2</div>
                                        <div className="font-mono font-bold text-red-400">88%</div>
                                    </div>
                                    <div className="bg-muted p-2 rounded border border-border">
                                        <div className="text-muted-foreground text-[10px]">BP</div>
                                        <div className="font-mono font-bold text-red-400">150/95</div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-muted" />

                            <div className="space-y-4">
                                <div className="flex gap-3 items-center">
                                    <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                                    <p className="text-muted-foreground text-sm">Monitor Vitals en route</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                                    <p className="text-muted-foreground text-sm">Supplemental Oxygen</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                                    <p className="text-muted-foreground text-sm">Neuro Checks q15min</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

        )
    }


    if (patient.patientId === '2' || patient.patientId === '3') {
        const isEmergency = patient.patientId === '3';

        return (
            <div className="bg-muted p-6 rounded-lg h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isEmergency ? 'text-red-400' : 'text-foreground'}`}>
                        <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                            {isEmergency ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <Activity className="h-6 w-6 text-orange-500" />}
                        </div>
                        {view === 'assessment' ? 'AI Assessment & Analysis' : (isEmergency ? 'CRITICAL: Emergency Protocol Activation' : 'Early Warning Intervention & Triage')}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1 ml-12">
                        {view === 'assessment' ? 'Symptom Check & Differential Diagnosis' : (isEmergency ? 'AI -> ER Diversion Protocol Active' : 'AI -> Nurse Escalation Protocol Active')}
                    </p>
                </div>

                {/* Content based on View */}
                {view === 'assessment' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
                        {/* Col 1: Initial Diagnosis (Pre-Q&A) */}
                        <Card className="bg-card border border-border flex flex-col h-full">
                            <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                                <CardTitle className="text-lg text-orange-400">Initial Differential Diagnosis</CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">AI Analysis: Pre-Q&A</p>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                {patient.initialDiagnosis?.map((d, i) => (
                                    <DiagnosisBar key={i} name={d.name} percentage={d.probability} color={d.color} description="" />
                                ))}
                            </CardContent>
                        </Card>
                    
                        {/* Col 2: Q&A Chat */}
                        <div className="flex-1 bg-muted rounded-xl border border-border flex flex-col overflow-hidden h-full shadow-sm">
                            <div className="bg-card p-3 flex items-center gap-3 border-b border-border">
                                <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100">
                                    <Bot className="h-6 w-6 text-brand-600" />
                                </div>
                                <div>
                                    <p className="text-foreground font-bold text-sm">CHI Monitoring Agent</p>
                                    <p className="text-muted-foreground text-xs font-medium">Automated Symptom Check</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50 custom-scrollbar">
                                {patient.symptomCheckerTranscript?.map((step: any, i: number) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-start">
                                            <div className="bg-card border border-border text-muted-foreground p-3 rounded-2xl rounded-tl-sm max-w-[80%] text-sm shadow-sm">
                                                <p className="font-bold text-brand-600 text-xs mb-1">System</p>
                                                {step.system}
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-brand-600 border border-brand-700 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">
                                                <p className="font-bold text-brand-100 text-xs mb-1 text-right">Patient ({patient.profile.name})</p>
                                                {step.patient}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Col 3: Updated Diagnosis (Post-Q&A) */}
                        <Card className="bg-card border border-border flex flex-col h-full">
                            <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-red-500">Updated Probabilities</CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Post-Q&A Analysis</p>
                                    </div>
                                    {/* {patient.patientId === '3' && (
                                        <button 
                                            onClick={() => setShowDiagnosisDetails(true)}
                                            className="text-brand-600 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-brand-500/30 px-2 py-1 rounded bg-cyan-950/30"
                                        >
                                            <Maximize2 className="h-3 w-3" /> View Detailed
                                        </button>
                                    )} */}
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
                              <Card className="bg-red-50 border border-red-200 flex-1 shadow-sm">
                                   <CardHeader className="bg-card border-b border-red-100 py-3">
                                       <CardTitle className="text-sm text-red-600 font-bold uppercase tracking-wide flex items-center gap-2">
                                           <Siren className="h-4 w-4" /> Immediate ER Transport
                                       </CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                       <div className="p-4 bg-card rounded-lg border border-red-100 shadow-sm">
                                           <div className="text-red-700 font-bold text-lg mb-1">Ambulance Dispatched</div>
                                           <div className="text-red-500 font-medium text-sm">ETA: 8 Minutes</div>
                                       </div>
                                       {patient.treatmentPlan?.actions.map((action: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></div>
                                               <p className="text-muted-foreground text-sm">{action}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>

                              {/* Emergency Col 2: Hospital Notification */}
                              <Card className="bg-card border border-border flex-1">
                                   <CardHeader className="bg-muted/50 border-b border-border py-3">
                                       <CardTitle className="text-sm text-orange-400 font-bold uppercase tracking-wide">ER Triage Notification</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                       <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                           <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                                               <Check className="h-4 w-4 text-green-500" />
                                           </div>
                                           <div>
                                               <div className="text-foreground font-medium text-sm">City General ER Notified</div>
                                               <div className="text-muted-foreground text-xs">Meningitis Protocol Activated</div>
                                           </div>
                                       </div>
                                       <Separator className="bg-muted" />
                                       {patient.treatmentPlan?.labDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                               <p className="text-muted-foreground text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>

                              {/* Emergency Col 3: Clinical Handoff */}
                              <Card className="bg-card border border-border flex-1">
                                   <CardHeader className="bg-muted/50 border-b border-border py-3">
                                       <CardTitle className="text-sm text-brand-600 font-bold uppercase tracking-wide">Clinical Handoff Data</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-4 space-y-4">
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2">Transmitted Vitals</div>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-muted p-2 rounded border border-border">
                                                <div className="text-muted-foreground text-[10px]">TEMP</div>
                                                <div className="text-red-400 font-mono font-bold">102.3 F</div>
                                            </div>
                                            <div className="bg-muted p-2 rounded border border-border">
                                                <div className="text-muted-foreground text-[10px]">HR</div>
                                                <div className="text-orange-400 font-mono font-bold">115 BPM</div>
                                            </div>
                                        </div>
                                        <Separator className="bg-muted mb-4" />
                                        {patient.treatmentPlan?.nurseDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                                               <p className="text-muted-foreground text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                              </Card>
                           </>
                       ) : (
                           <>
                               {/* Treatment Plan: Approved Actions */}
                               <Card className="bg-card border border-border flex-1">
                                   <CardHeader className="bg-muted/50 border-b border-border py-3">
                                       <CardTitle className="text-sm text-brand-600 font-bold uppercase tracking-wide">Approved Treatment Actions</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.actions.map((action: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                                               <p className="text-muted-foreground text-sm">{action}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                               </Card>

                               {/* Lab Dispatch */}
                               <Card className="bg-card border border-border flex-1">
                                   <CardHeader className="bg-muted/50 border-b border-border py-3">
                                       <CardTitle className="text-sm text-orange-400 font-bold uppercase tracking-wide">Lab Dispatch Workflow</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.labDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                               <p className="text-muted-foreground text-sm">{step}</p>
                                           </div>
                                       ))}
                                   </CardContent>
                               </Card>

                               {/* Medication Delivery */}
                               <Card className="bg-card border border-border flex-1">
                                   <CardHeader className="bg-muted/50 border-b border-border py-3">
                                       <CardTitle className="text-sm text-emerald-400 font-bold uppercase tracking-wide">Medication Delivery Workflow</CardTitle>
                                   </CardHeader>
                                   <CardContent className="pt-3 space-y-3">
                                       {patient.treatmentPlan?.nurseDispatch.map((step: string, i: number) => (
                                           <div key={i} className="flex gap-3">
                                               <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                               <p className="text-muted-foreground text-sm">{step}</p>
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
                    <div className="bg-muted w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Activity className="h-5 w-5 text-brand-600" />
                                Differential Diagnosis
                            </h2>
                            <div className="flex items-center gap-4">
                                <Activity className="h-5 w-5 text-green-500 animate-pulse" />
                                <button 
                                    onClick={() => setShowDiagnosisDetails(false)}
                                    className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-muted space-y-4">
                            {patient.diagnosisDetails.map((detail, idx) => (
                                <div key={idx} className="bg-[#FFFBEB] border-l-4 border-l-yellow-400 rounded-r-lg shadow-sm p-4 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-yellow-700">{detail.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-yellow-600">{detail.probability}%</span>
                                            <div className="text-xs font-bold text-muted-foreground">Risk: {detail.risk}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-0 right-0 w-32 h-1 bg-yellow-200"></div>
                                    
                                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
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
      <Card className="bg-card border border-border flex flex-col h-full">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border">
            <CardTitle className="text-lg text-orange-400">Initial Differential Diagnosis</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">AI Analysis: Pre-Q&A</p>
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
      <Card className="bg-card border border-border flex flex-col h-full">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border">
            <CardTitle className="text-lg text-brand-600">AI-Powered Q&A</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Patient Interaction</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Questions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-5 w-5 text-brand-500" />
                    <h4 className="text-sm font-semibold text-brand-600">AI Questions</h4>
                </div>
                <div className="space-y-2 text-muted-foreground text-xs pl-2 border-l-2 border-border">
                    <p><span className="text-muted-foreground font-mono">Q1:</span> Any shortness of breath?</p>
                    <p><span className="text-muted-foreground font-mono">Q2:</span> Increased swelling in legs?</p>
                    <p><span className="text-muted-foreground font-mono">Q3:</span> Recent infections/fever?</p>
                    <p><span className="text-muted-foreground font-mono">Q4:</span> Taking all medications?</p>
                    <p><span className="text-muted-foreground font-mono">Q5:</span> Any chest pain/pressure?</p>
                    <p><span className="text-muted-foreground font-mono">Q6:</span> Recent dietary changes?</p>
                    <p><span className="text-muted-foreground font-mono">Q7:</span> How is your sleep?</p>
                </div>
            </div>

            <Separator className="bg-secondary" />

            {/* Answers */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h4 className="text-sm font-semibold text-green-400">Patient Findings</h4>
                </div>
                <div className="space-y-2 text-muted-foreground text-xs pl-2 border-l-2 border-border">
                    <p><span className="text-muted-foreground font-mono">A1:</span> Mild SOB on exertion</p>
                    <p><span className="text-muted-foreground font-mono">A2:</span> YES - ankles puffier</p>
                    <p><span className="text-muted-foreground font-mono">A3:</span> No fever, feeling okay</p>
                    <p><span className="text-muted-foreground font-mono">A4:</span> YES - taking all meds</p>
                    <p><span className="text-muted-foreground font-mono">A5:</span> No chest pain</p>
                    <p><span className="text-muted-foreground font-mono">A6:</span> Ate salty food recently</p>
                    <p><span className="text-muted-foreground font-mono">A7:</span> Sleeping propped up</p>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Section 3: Updated Probabilities */}
      <Card className="bg-card border border-border flex flex-col h-full">
        <CardHeader className="pb-2 bg-muted/50 border-b border-border">
            <CardTitle className="text-lg text-orange-400">Updated Probabilities</CardTitle>
            <p className="text-xs text-muted-foreground font-medium">Post-Q&A Analysis</p>
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
              <span className="font-bold text-foreground text-base">{name}</span>
          </div>
          <div className="flex items-center gap-4">
              <span className={`text-xl font-bold w-12 ${textColorClass}`}>{percentage}%</span>
              <div className="flex-1 h-8 bg-muted/50 rounded-r-md rounded-l-md overflow-hidden relative border border-white/10">
                  <div 
                      className={`h-full rounded-r-md rounded-l-md bg-gradient-to-r ${color === 'red' ? 'from-red-600 to-red-500' : color === 'orange' ? 'from-orange-600 to-orange-500' : color === 'orange-light' ? 'from-orange-400 to-amber-500' : 'from-yellow-400 to-yellow-300'}`} 
                      style={{ width: `${percentage}%` }}
                  ></div>
              </div>
          </div>
          <p className="text-muted-foreground text-xs pl-16">{description}</p>
      </div>
  )
}
