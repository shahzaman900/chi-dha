"use client"

import { usePhrStore, PhrData } from "@/store/phr-store"
import { Siren, AlertTriangle, Heart, Activity, Wind, Droplets, User, Clock, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePatientStore } from "@/store/patient-store"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PhrModalDetails } from "./phr-modal-details"



export function PhrDisplay({ patientId }: { patientId: string }) {
  const { getPhrByPatientId } = usePhrStore()
  const patient = getPhrByPatientId(patientId)
  const { closePhrTab } = usePatientStore()
  const [activeModal, setActiveModal] = useState<{ isOpen: boolean; view: 'assessment' | 'treatment' | 'default' }>({ isOpen: false, view: 'default' })
  const [showDetailedDiagnosis, setShowDetailedDiagnosis] = useState(false)
  const [showTreatmentDetails, setShowTreatmentDetails] = useState(false)

  if (!patient) {
      return (
        <div className="flex bg-card text-foreground items-center justify-center p-8 h-full">
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
    <div className="flex overflow-auto flex-col bg-card text-foreground h-full">
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 ${statusColor}`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-card/20 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{patient.profile.name}</h1>
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
            onClick={() => closePhrTab(patient.patientId)}
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
          <Card className={`bg-card shadow-sm border ${borderColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg ${textAccent}`}>Patient Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age</span>
                <span className="text-foreground font-medium">{patient.profile.age} years old</span>
              </div>
              <Separator className="bg-secondary" />
              <div className="flex justify-between items-start">
                 <span className="text-muted-foreground">Conditions</span>
                 <span className="text-foreground font-medium text-right max-w-[180px]">{patient.profile.conditions.join(", ")}</span>
               </div>
               <Separator className="bg-secondary" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Living</span>
                <span className="text-foreground font-medium">{patient.profile.living}</span>
              </div>
              <Separator className="bg-secondary" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">History</span>
                <span className="text-foreground font-medium">{patient.profile.history}</span>
              </div>
              <Separator className="bg-secondary" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-foreground font-medium">{patient.profile.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vital Metrics Card */}
          <Card className={`bg-card shadow-sm border ${borderColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-brand-600">Current Vitals</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Object.entries(patient.metrics).map(([key, data]: [string, any]) => (
                <div key={key} className={`p-3 rounded-lg bg-muted border ${borderColor}`}>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase mb-1">
                    {metricIcons[key] || <Activity className="h-4 w-4" />}
                    {key}
                  </div>
                  <div className={`text-xl font-bold ${textAccent === 'text-orange-400' ? 'text-orange-600' : 'text-red-500'}`}>{data.value}</div>
                  {data.change && <div className="text-xs text-muted-foreground">{data.change}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Diagnosis */}
      <div className="lg:col-span-1 h-full">
        <Card className={`bg-muted border ${borderColor} h-full flex flex-col`}>
          <CardHeader className="pb-2 shrink-0">
             <div className="flex justify-between items-start">
                <div>
                    <CardTitle className={`text-lg flex items-center gap-2 ${patient.profile.name === 'Patient 3' ? 'text-orange-500' : 'text-orange-600'}`}>
                    <Activity className="h-5 w-5" /> 
                    {patient.diagnosisMetadata?.title || "Differential Diagnosis"}
                    </CardTitle>
                    {patient.diagnosisMetadata?.subtitle && (
                        <p className="text-xs text-muted-foreground font-medium uppercase mt-1">
                            {patient.diagnosisMetadata.subtitle}
                        </p>
                    )}
                </div>
                {patient.diagnosisDetails && (
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowDetailedDiagnosis(true)}
                        className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider border border-brand-200 text-brand-600 hover:bg-brand-50 hover:text-brand-700 gap-1.5 ml-2"
                    >
                        <Maximize2 className="h-3 w-3" /> View Detailed
                    </Button>
                )}
             </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            {patient.diagnosis.map((d: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground font-medium">{d.name}</span>
                  <span className={`font-bold ${
                    d.color === 'red' ? 'text-red-500' : 
                    d.color === 'orange' ? 'text-orange-500' : 
                    d.color === 'orange-light' ? 'text-amber-500' : 'text-yellow-600'
                  }`}>{d.probability}%</span>
                </div>
                <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
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
        <Card className={`bg-muted border ${borderColor} h-full flex flex-col`}>
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-lg text-brand-600 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Timeline of Events
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pl-6">
            <div className="relative border-l-2 border-border ml-2 pl-6 space-y-8 py-2">
              {patient.timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-border ${
                      event.type === 'critical' || event.type === 'critical-action' ? 'bg-red-500' :
                      event.type === 'system' ? 'bg-brand-500' :
                      event.type === 'warning' ? 'bg-orange-500' : 'bg-slate-500'
                    }`}></div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="text-brand-500 font-bold text-xs">{event.time}</div>
                    <div className={`text-sm leading-snug ${event.type === 'critical' || event.type === 'critical-action' ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
                        {event.event}
                    </div>

                    {/* View Details Button for specific events */}
                    {(event.time.includes("Day 3") || event.event.includes("Symptom Checker") || event.event.includes("EMERGENCY services dispatched") || event.event.includes("Nurse Sarah") || event.event.includes("AI Assessment") || event.event.includes("Nurse Escalation")) && (
                        <div className="mt-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-4 text-xs font-medium border border-brand-500/30 text-brand-600 hover:bg-brand-50 hover:text-brand-700 bg-muted/50 rounded-md"
                                onClick={() => {
                                    if (event.event.includes("AI Assessment")) {
                                        setActiveModal({ isOpen: true, view: 'assessment' })
                                    } else if (event.event.includes("Nurse Sarah") || event.event.includes("EMERGENCY") || event.event.includes("Nurse Escalation")) {
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
                    {patient.patientId === '2' && event.event.includes("Case escalated") && (
                         <div className="mt-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-4 text-xs font-medium border border-brand-500/30 text-brand-600 hover:bg-brand-50 hover:text-brand-700 bg-muted/50 rounded-md"
                                onClick={() => setShowTreatmentDetails(true)}
                            >
                                View Detailed
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
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-border bg-muted">
           <PhrModalDetails patient={patient} view={activeModal.view} />
        </DialogContent>
    </Dialog>

    {showDetailedDiagnosis && patient.diagnosisDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-muted w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-border">
                <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Activity className="h-5 w-5 text-brand-600" />
                        Differential Diagnosis
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm">
                            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-muted-foreground">Live Analysis</span>
                        </div>
                        <button 
                            onClick={() => setShowDetailedDiagnosis(false)}
                            className="h-8 w-8 rounded-full bg-card hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border shadow-sm"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-muted space-y-4 custom-scrollbar">
                    {patient.diagnosisDetails.map((detail, idx) => (
                        <div key={idx} className="bg-card/50 border-l-4 border-l-yellow-500 rounded-r-lg shadow-sm p-5 relative overflow-hidden border-y border-r border-border">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-yellow-600 tracking-wide">{detail.name}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-bold text-yellow-600 leading-none">{detail.probability}%</span>
                                        <span className="text-[10px] text-yellow-500/50 uppercase font-bold tracking-wider">Probability</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-muted"></div>
                                    <div className="flex flex-col items-start">
                                        <div className="text-lg font-bold text-foreground leading-none">{detail.risk}%</div>
                                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Risk Score</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-0 right-0 w-32 h-20 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                            
                            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                                {detail.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {detail.positiveFactors.map((factor, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-md border border-green-500/20 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                        {factor}
                                    </span>
                                ))}
                                {detail.negativeFactors.map((factor, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-md border border-red-500/20 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                        {factor}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Progress Bar Visual */}
                            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-yellow-500/80 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                                    style={{ width: `${detail.probability}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )}
    
    {patient.patientId === '2' && showTreatmentDetails && patient.treatmentDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-card w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl flex flex-col border border-border max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                    <h2 className="text-xl font-bold text-brand-600 flex items-center gap-2">
                        {patient.treatmentDetails.title}
                    </h2>
                    <button 
                        onClick={() => setShowTreatmentDetails(false)}
                        className="h-8 w-8 rounded-full bg-muted hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-muted grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
                    {/* Left Column: Immediate Interventions */}
                    <div className="border border-green-500/30 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-green-500/10 p-4 border-b border-green-500/30">
                            <h3 className="text-green-400 font-bold text-lg uppercase tracking-wide">
                                {patient.treatmentDetails.immediateInterventions.title}
                            </h3>
                            <p className="text-green-500/70 text-sm mt-1">
                                {patient.treatmentDetails.immediateInterventions.subtitle}
                            </p>
                        </div>
                        <div className="p-6 space-y-6 flex-1 bg-card/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {patient.treatmentDetails.immediateInterventions.sections.map((section, idx) => (
                                <div key={idx}>
                                    <h4 className="text-brand-600 font-bold mb-2 text-sm">{section.name}</h4>
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Monitoring & Follow-up */}
                    <div className="border border-brand-500/30 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-brand-500/10 p-4 border-b border-brand-500/30">
                            <h3 className="text-brand-600 font-bold text-lg uppercase tracking-wide">
                                {patient.treatmentDetails.monitoring.title}
                            </h3>
                            <p className="text-brand-500/70 text-sm mt-1">
                                {patient.treatmentDetails.monitoring.subtitle}
                            </p>
                        </div>
                        <div className="p-6 space-y-6 flex-1 bg-card/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {patient.treatmentDetails.monitoring.sections.map((section, idx) => (
                                <div key={idx}>
                                    <h4 className={`font-bold mb-2 text-sm ${section.name.includes("Red Flags") ? "text-red-400" : "text-brand-600"}`}>
                                        {section.name}
                                    </h4>
                                    <ul className="space-y-2">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                                                <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${section.name.includes("Red Flags") ? "bg-red-500" : "bg-slate-500"}`}></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nurse Dispatch */}
                    {patient.treatmentDetails.nurseDispatch && (
                        <div className="border border-violet-500/30 rounded-lg overflow-hidden flex flex-col">
                            <div className="bg-violet-500/10 p-4 border-b border-violet-500/30">
                                <h3 className="text-violet-400 font-bold text-lg uppercase tracking-wide">
                                    {patient.treatmentDetails.nurseDispatch.title}
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 flex-1 bg-card/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <ul className="space-y-4">
                                    {patient.treatmentDetails.nurseDispatch.items.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                                            <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Lab Dispatch */}
                    {patient.treatmentDetails.labDispatch && (
                        <div className="border border-amber-500/30 rounded-lg overflow-hidden flex flex-col">
                            <div className="bg-amber-500/10 p-4 border-b border-amber-500/30">
                                <h3 className="text-amber-400 font-bold text-lg uppercase tracking-wide">
                                    {patient.treatmentDetails.labDispatch.title}
                                </h3>
                            </div>
                            <div className="p-6 space-y-6 flex-1 bg-card/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <ul className="space-y-4">
                                    {patient.treatmentDetails.labDispatch.items.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}
    </div>
  )
}
