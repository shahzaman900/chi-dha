"use client"

import { usePhrStore, PhrData } from "@/store/phr-store"
import { Siren, AlertTriangle, Heart, Activity, Wind, Droplets, User, Clock, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePatientStore } from "@/store/patient-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhrModalDetails } from "./phr-modal-details"



export function PhrDisplay({ patientId }: { patientId: string }) {
  const { getPhrByPatientId } = usePhrStore()
  const patient = getPhrByPatientId(patientId)
  const { setIsPhrOpen } = usePatientStore()
  const [activeModal, setActiveModal] = useState<{ isOpen: boolean; view: 'assessment' | 'treatment' | 'default' }>({ isOpen: false, view: 'default' })

  if (!patient) {
      return (
        <div className="flex bg-slate-900 text-slate-100 items-center justify-center p-8 h-full">
            <h2 className="text-xl font-bold">Patient Not Found</h2>
        </div>
      )
  }

  const isCritical = patient.ews.status === "CRITICAL"
  const statusColor = isCritical ? "bg-red-600" : "bg-orange-500"
  const borderColor = isCritical ? "border-red-500/50" : "border-orange-500/50"
  const textAccent = isCritical ? "text-red-400" : "text-orange-400"

  const metricIcons: Record<string, React.ReactNode> = {
    hr: <Heart className="h-4 w-4" />,
    rr: <Wind className="h-4 w-4" />,
    spo2: <Activity className="h-4 w-4" />,
    bp: <Droplets className="h-4 w-4" />,
  }

  return (
    <div className="flex overflow-auto flex-col bg-slate-900 text-slate-100 h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 ${statusColor}`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{patient.profile.name}</h1>
            <p className="text-white/80 text-sm">{patient.profile.age} years old • {patient.profile.conditions.join(", ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-white/70 uppercase tracking-wider">EWS Score</div>
            <div className="text-4xl font-bold text-white">{patient.ews.score}</div>
          </div>
          <Badge variant="outline" className="border-white/50 text-white text-lg px-4 py-2">
            {isCritical ? <Siren className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
            {patient.ews.status}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-red-600 hover:bg-red-700 text-white ml-4 rounded-lg"
            onClick={() => setIsPhrOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Patient Info & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Patient Profile Card */}
          <Card className={`bg-slate-800 border ${borderColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg ${textAccent}`}>Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Living</span>
                <span className="text-slate-100 font-medium">{patient.profile.living}</span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between">
                <span className="text-slate-400">History</span>
                <span className="text-slate-100 font-medium">{patient.profile.history}</span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-slate-100 font-medium">{patient.profile.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vital Metrics Card */}
          <Card className={`bg-slate-800 border ${borderColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-cyan-400">Current Vitals</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.entries(patient.metrics).map(([key, data]: [string, any]) => (
                <div key={key} className={`p-3 rounded-lg bg-slate-700/50 border ${borderColor}`}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-1">
                    {metricIcons[key] || <Activity className="h-4 w-4" />}
                    {key}
                  </div>
                  <div className={`text-xl font-bold ${textAccent}`}>{data.value}</div>
                  {data.change && <div className="text-xs text-slate-500">{data.change}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Diagnosis */}
      <div className="lg:col-span-1 h-full">
        <Card className={`bg-slate-800 border ${borderColor} h-full flex flex-col`}>
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className={`text-lg flex items-center gap-2 ${patient.profile.name === 'Patient 3' ? 'text-orange-500' : 'text-orange-400'}`}>
               <Activity className="h-5 w-5" /> 
               {patient.diagnosisMetadata?.title || "Differential Diagnosis"}
            </CardTitle>
            {patient.diagnosisMetadata?.subtitle && (
                <p className="text-xs text-slate-500 font-medium uppercase mt-1">
                    {patient.diagnosisMetadata.subtitle}
                </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            {patient.diagnosis.map((d: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-200 font-medium">{d.name}</span>
                  <span className={`font-bold ${
                    d.color === 'red' ? 'text-red-500' : 
                    d.color === 'orange' ? 'text-orange-500' : 
                    d.color === 'orange-light' ? 'text-amber-500' : 'text-yellow-400'
                  }`}>{d.probability}%</span>
                </div>
                <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                        d.color === 'red' ? 'bg-red-500' : 
                        d.color === 'orange' ? 'bg-orange-500' : 
                        d.color === 'orange-light' ? 'bg-amber-500' : 
                        'bg-yellow-400'
                    }`} 
                    style={{ width: `${d.probability}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Timeline */}
      <div className="lg:col-span-1 h-full">
        <Card className={`bg-slate-800 border ${borderColor} h-full flex flex-col`}>
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Timeline of Events
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pl-6">
            <div className="relative border-l-2 border-slate-700 ml-2 pl-6 space-y-8 py-2">
              {patient.timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-slate-800 ${
                      event.type === 'critical' || event.type === 'critical-action' ? 'bg-red-500' :
                      event.type === 'system' ? 'bg-cyan-500' :
                      event.type === 'warning' ? 'bg-orange-500' : 'bg-slate-500'
                    }`}></div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="text-cyan-500 font-bold text-xs">{event.time}</div>
                    <div className={`text-sm leading-snug ${event.type === 'critical' || event.type === 'critical-action' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                        {event.event}
                    </div>

                    {/* View Details Button for specific events */}
                    {(event.time.includes("Day 3") || event.event.includes("Symptom Checker") || event.event.includes("EMERGENCY services dispatched") || event.event.includes("Nurse Sarah") || event.event.includes("AI Assessment")) && (
                        <div className="mt-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-4 text-xs font-medium border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-300 bg-slate-800/50 rounded-md"
                                onClick={() => {
                                    if (event.event.includes("AI Assessment")) {
                                        setActiveModal({ isOpen: true, view: 'assessment' })
                                    } else if (event.event.includes("Nurse Sarah") || event.event.includes("EMERGENCY")) {
                                        setActiveModal({ isOpen: true, view: 'treatment' })
                                    } else {
                                        setActiveModal({ isOpen: true, view: 'default' })
                                    }
                                }}
                            >
                                View Details
                            </Button>
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    <Dialog open={activeModal.isOpen} onOpenChange={(open) => setActiveModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-slate-800 bg-slate-950">
           <PhrModalDetails patient={patient} view={activeModal.view} />
        </DialogContent>
    </Dialog>
    </div>
  )
}
