import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

import { PhrData } from "@/store/phr-store"

export function PhrModalDetails({ patient }: { patient: PhrData }) {
  if (patient.patientId === '3') {
    return (
      <div className="flex flex-col h-full bg-slate-950 p-6 rounded-lg">
        {/* Section 1: Diagnostic Probability Report */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shrink-0 mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Diagnostic Probability Report</h2>
            <Separator className="bg-red-500/20 h-[1px] mb-4 w-full" />
            
            {patient.diagnosisMetadata?.subtitle && (
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-6">
                   {patient.diagnosisMetadata.subtitle}
                </p>
            )}

            <div className="space-y-5">
                 {patient.diagnosis.map((d: any, i: number) => (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-200 font-medium text-sm">{d.name}</span>
                            <span className={`font-bold text-sm ${
                                d.color === 'red' ? 'text-red-500' : 
                                d.color === 'orange' ? 'text-orange-500' :
                                d.color === 'orange-light' ? 'text-amber-500' : 'text-yellow-400'
                            }`}>{d.probability}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    d.color === 'red' ? 'bg-red-600' : 
                                    d.color === 'orange' ? 'bg-orange-500' :
                                    d.color === 'orange-light' ? 'bg-amber-500' : 'bg-yellow-400'
                                }`} 
                                style={{ width: `${d.probability}%` }}
                            ></div>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* Section 2: Chat between patient and system */}
        {patient.symptomCheckerTranscript && (
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                {patient.symptomCheckerTranscript.map((step, index) => (
                    <div key={index} className="mb-8">
                        {/* Step Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <Separator className="flex-1 bg-slate-800" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {step.step}
                            </span>
                            <Separator className="flex-1 bg-slate-800" />
                        </div>
                        
                        <div className="space-y-6">
                            {/* System Message - Left Aligned */}
                            <div className="flex gap-4 max-w-[85%]">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-950/50 border border-cyan-900 flex items-center justify-center mt-1">
                                    <Bot className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-cyan-500 mb-1 ml-1">System</div>
                                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none p-5 text-slate-200 shadow-sm leading-relaxed">
                                        {step.system}
                                    </div>
                                </div>
                            </div>

                            {/* Patient Response - Right Aligned */}
                            <div className="flex flex-row-reverse gap-4 max-w-[85%] ml-auto">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-400">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 mb-1 mr-1 text-right">Patient</div>
                                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tr-none p-5 text-slate-200 shadow-sm leading-relaxed">
                                        "{step.patient}"
                                    </div>
                                </div>
                            </div>

                            {/* Alert - Centered/Full width if exists */}
                            {step.alert && (
                                <div className={`mx-auto max-w-[90%] rounded-lg border p-4 flex items-start gap-4 ${
                                    step.alertType === 'critical' ? 'bg-red-950/10 border-red-900/30' : 'bg-orange-950/10 border-orange-900/30'
                                }`}>
                                     {step.alertType === 'critical' ? (
                                        <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0">!</div>
                                    ) : (
                                        <div className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0">!</div>
                                    )}
                                    <div>
                                        <p className={`text-sm font-bold mb-0.5 ${step.alertType === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                                            {step.alert}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {step.alertDesc}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 h-full">
      {/* Section 1: Initial Differential Diagnosis */}
      <Card className="bg-slate-800 border border-slate-700 flex flex-col h-full">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-400">Initial Differential Diagnosis</CardTitle>
            <p className="text-xs text-slate-500 font-medium">AI Analysis: Pre-Q&A</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto">
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
      <Card className="bg-slate-800 border border-slate-700 flex flex-col h-full">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-cyan-400">AI-Powered Q&A</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Patient Interaction</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto">
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

      {/* Section 3: Differential Diagnosis - Updated Probabilities */}
      <Card className="bg-slate-800 border border-slate-700 flex flex-col h-full">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-400">Updated Probabilities</CardTitle>
            <p className="text-xs text-slate-500 font-medium">Post-Q&A Analysis</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto">
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
            description="No fever or signs of infection. Vital pattern more consistent with fluid overload."
          />
          <DiagnosisBar 
            name="Medication Non-compliance" 
            percentage={6} 
            color="yellow"
            description="Patient confirmed compliance. Likely dietary trigger."
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
