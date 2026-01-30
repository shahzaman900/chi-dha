"use client"

import { SiteHeader } from "@/components/site-header"
import { usePhrStore } from "@/store/phr-store"
import { ArrowLeft, Activity, Siren, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PhrDashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Unwrap params using React.use()
  const { id } = React.use(params)
  const { getPhrByPatientId } = usePhrStore()
  const patient = getPhrByPatientId(id)

  if (!patient) {
      return (
        <div className="flex h-screen flex-col bg-background text-foreground items-center justify-center">
            <h2 className="text-xl font-bold">Patient Not Found</h2>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      )
  }

  const isCritical = patient.ews.status === "CRITICAL"
  const headerColor = isCritical ? "bg-red-600" : "bg-orange-500"
  const borderColor = isCritical ? "border-red-600" : "border-orange-500"
  const textColor = isCritical ? "text-red-500" : "text-orange-500"
  const bgGradient = isCritical ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-orange-400 to-orange-600"

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <SiteHeader />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
            <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
                 <h1 className="text-3xl font-bold text-slate-100">Real-World Example: {patient.profile.name}</h1>
                 <div className={`h-1 w-32 ${headerColor} mt-2`}></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Alert & Profile */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* EWS Alert Card */}
                <Card className={`bg-slate-900 border-2 ${borderColor} overflow-hidden`}>
                    <div className={`${bgGradient} p-8 text-center text-white`}>
                        <div className="text-sm font-bold opacity-90 tracking-wider mb-2">EARLY WARNING SCORE</div>
                        <div className="text-7xl font-bold mb-4">{patient.ews.score}</div>
                        <div className="text-xl font-bold flex items-center justify-center gap-2">
                            {isCritical ? <Siren className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                            {patient.ews.status}
                        </div>
                    </div>
                    <CardContent className="p-6 bg-white dark:bg-slate-900">
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Patient Profile</h3>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div><span className="font-semibold text-slate-100">Age:</span> {patient.profile.age} years old</div>
                            <div><span className="font-semibold text-slate-100">Conditions:</span> {patient.profile.conditions.join(", ")}</div>
                            <div><span className="font-semibold text-slate-100">Living:</span> {patient.profile.living}</div>
                            <div><span className="font-semibold text-slate-100">History:</span> {patient.profile.history}</div>
                            <div><span className="font-semibold text-slate-100">Status:</span> {patient.profile.status}</div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700">
                             <h4 className="text-cyan-500 font-bold mb-4">Current Metrics</h4>
                             <div className="space-y-2">
                                {Object.entries(patient.metrics).map(([key, data]: [string, any]) => (
                                    <div key={key} className={`font-bold ${textColor} flex items-center gap-2`}>
                                        <span className="uppercase">{key}:</span> {data.value} 
                                        {data.change && <span className="opacity-80 text-xs">({data.change})</span>}
                                    </div>
                                ))}
                             </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Differential Diagnosis */}
                <div className="mt-8">
                     <h2 className="text-2xl font-bold mb-2">Initial Differential Diagnosis (AI Analysis)</h2>
                     <div className="h-1 w-24 bg-orange-500 mb-6"></div>
                     <p className="text-cyan-500 text-sm mb-6 font-medium">Before patient Q&A - Based on vital trends & historical data:</p>
                     
                     <div className="space-y-6">
                        {patient.diagnosis.map((diag, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-200">{diag.name}</span>
                                    <span className={`font-bold ${diag.color === 'red' ? 'text-red-500' : diag.color === 'orange' ? 'text-orange-500' : 'text-yellow-500'}`}>{diag.probability}%</span>
                                </div>
                                <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full ${diag.color === 'red' ? 'bg-red-500' : diag.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'}`} 
                                        style={{ width: `${diag.probability}%` }}
                                     ></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

            </div>

            {/* Right Column - Timeline */}
            <div className="lg:col-span-5">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    Timeline of Events
                 </h3>
                 <div className="space-y-0 relative border-l-2 border-slate-800 ml-3">
                    {patient.timeline.map((event, i) => (
                        <div key={i} className="mb-8 ml-6 relative">
                            {/* Dot */}
                            <div className={`absolute -left-[31px] h-4 w-4 rounded-full border-2 border-slate-950 ${
                                event.type === 'critical' || event.type === 'critical-action' ? 'bg-red-500' : 
                                event.type === 'system' ? 'bg-cyan-500' : 
                                event.type === 'warning' ? 'bg-orange-500' : 'bg-red-400'
                            }`}></div>
                            
                            <div>
                                <div className="text-cyan-500 font-bold text-sm mb-1">{event.time}</div>
                                <div className={`font-medium ${event.type === 'critical' || event.type === 'critical-action' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                                    {event.event}
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  )
}
