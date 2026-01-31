import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

import { PhrData } from "@/store/phr-store"

export function PhrModalDetails({ patient }: { patient: PhrData }) {
  if (patient.patientId === '3') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 h-full">
        {/* Left Column: EWS & Profile */}
        <div className="space-y-6">
           <Card className="bg-red-500/10 border-red-500/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-xl text-red-500 flex items-center gap-2">
                 CRITICAL ALERT
               </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="text-center py-4">
                  <div className="text-sm text-red-400 font-semibold mb-1">EARLY WARNING SCORE</div>
                  <div className="text-6xl font-bold text-slate-100 mb-2">{patient.ews.score}</div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/50 font-bold text-sm">
                    CRITICAL
                  </div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-slate-800 border-slate-700">
             <CardHeader>
               <CardTitle className="text-cyan-400">Current Symptoms</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {Object.entries(patient.metrics).map(([key, metric]) => (
                 <div key={key} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-400 font-medium">{key}</span>
                    <span className="text-red-400 font-bold">{metric.value}</span>
                 </div>
               ))}
             </CardContent>
           </Card>
        </div>

        {/* Right Column: Symptom Checker Timeline */}
        <Card className="bg-slate-800 border-slate-700 flex flex-col h-full">
           <CardHeader>
             <CardTitle className="text-orange-400">Symptom Checker Assessment Timeline</CardTitle>
           </CardHeader>
           <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto relative">
              <div className="absolute left-[28px] top-6 bottom-6 w-0.5 bg-slate-700"></div>
              {patient.timeline.map((event, i) => (
                <div key={i} className="relative flex gap-4">
                   <div className={`relative z-10 w-4 h-4 rounded-full mt-1 shrink-0 ${
                      event.type === 'critical' ? 'bg-red-500 ring-4 ring-red-500/20' : 
                      event.type === 'system' ? 'bg-cyan-500 ring-4 ring-cyan-500/20' : 
                      'bg-slate-500'
                   }`}></div>
                   <div>
                      <div className={`text-xs font-bold mb-0.5 ${event.type === 'critical' ? 'text-red-400' : event.type === 'system' ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {event.time}
                      </div>
                      <div className="text-slate-200 text-sm font-medium">{event.event}</div>
                   </div>
                </div>
              ))}
           </CardContent>
        </Card>
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
