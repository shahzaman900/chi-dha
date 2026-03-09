"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePatientStore, Patient } from "@/store/patient-store"
import { Button } from "./ui/button"
import { 
  ChevronLeft, ChevronRight, Siren, AlertTriangle, Check, Search, Filter, Settings,
  Activity, Phone, Clock, MessageSquare,
  Stethoscope, CheckCircle2, PauseCircle, AlertCircle, FileText
} from "lucide-react"
import { useState } from "react"
import { TimelineModal } from "./timeline-modal"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PatientTable() {
  const { 
    patients, 
    selectedPatientId, 
    setSelectedPatientId, 
    openPhrTab,
    acknowledgeAlert,
    triggerEmergency,
    escalateToDoctor,
    pauseAiOutreach,
    initiateAiCheckIn,
    markAsResolved
  } = usePatientStore()
  
  // Context Menu State
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [timelineModalPatientId, setTimelineModalPatientId] = useState<string | null>(null)
  
  // Action Sheet State
  const [actionSheetPatientId, setActionSheetPatientId] = useState<string | null>(null)
  const [actionNote, setActionNote] = useState("")
  
  // Emergency Sheet State
  const [emergencySheetPatientId, setEmergencySheetPatientId] = useState<string | null>(null)
  const [dispatchRrt, setDispatchRrt] = useState(true)
  const [dispatchPhysician, setDispatchPhysician] = useState(true)

  // Escalate Sheet State
  const [escalateSheetPatientId, setEscalateSheetPatientId] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [sbarAssessment, setSbarAssessment] = useState("")
  const [sbarRecommendation, setSbarRecommendation] = useState("")

  // Resolve Sheet State
  const [resolveSheetPatientId, setResolveSheetPatientId] = useState<string | null>(null)
  const [resolutionReason, setResolutionReason] = useState<string>("")
  const [closingNote, setClosingNote] = useState("")
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false)
  const [adjustBaselines, setAdjustBaselines] = useState(false)
  
  // Filtering State
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs_action' | 'in_progress' | 'resolved'>('all')

  const getFilteredPatients = () => {
    let filtered = [...patients];
    
    if (activeFilter === 'needs_action') {
      filtered = filtered.filter(p => 
        ["Emergency Protocol", "Timeout Escalation", "Urgent Triage", "AI Outreach"].includes(p.status)
      );
    } else if (activeFilter === 'in_progress') {
      filtered = filtered.filter(p => 
        ["Nurse Alerted", "Refer to Doctor"].includes(p.status)
      );
    } else if (activeFilter === 'resolved') {
      filtered = filtered.filter(p => 
        ["Resolved", "Stable / Monitoring"].includes(p.status)
      );
    }

    return filtered.sort((a, b) => (b.aiTriageScore || 0) - (a.aiTriageScore || 0));
  }

  const handleRowClick = (e: React.MouseEvent, id: string) => {
    // Only select if they specifically clicked the checkbox or if it's not a context menu interaction
    // Since we're changing this to open a menu on click, we'll stop the selection toggle here
    // But keep standard selection logic isolated
    
    // Instead of selecting, open context menu where clicked:
    setContextMenuOpenId(contextMenuOpenId === id ? null : id)
    setMenuPosition({ x: e.clientX, y: e.clientY })
  }

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedPatientId(id === selectedPatientId ? null : id)
  }

  const handleViewPhr = (patientId: string, patientName: string, type: 'encounter' | 'phr' = 'encounter') => {
    openPhrTab(patientId, patientName, type)
    setContextMenuOpenId(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Emergency Protocol":
      case "Timeout Escalation":
        return <Siren className="h-4 w-4 text-red-500 mr-2" />
      case "Urgent Triage":
      case "Nurse Alerted":
      case "Refer to Doctor":
        return <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
      case "AI Outreach":
        return <Activity className="h-4 w-4 text-blue-500 mr-2" />
      case "Stable / Monitoring":
      case "Resolved":
        return <Check className="h-4 w-4 text-emerald-500 mr-2" />
      default:
        return <Check className="h-4 w-4 text-slate-400 mr-2" />
    }
  }

  const getAiTriageStatus = (score: number) => {
    if (score >= 9) return "critical"
    if (score >= 7) return "high risk"
    if (score >= 5) return "medium risk"
    return "stable"
  }

  const getAiTriageColorStyles = (score: number) => {
    if (score >= 9) return "text-red-700 bg-red-50 border-red-200"
    if (score >= 7) return "text-orange-700 bg-orange-50 border-orange-200"
    if (score >= 5) return "text-yellow-700 bg-yellow-50 border-yellow-200"
    return "text-emerald-700 bg-emerald-50 border-emerald-200"
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white w-full h-full relative" onClick={() => setContextMenuOpenId(null)}>
      
      {/* Darker Header Above Table with Filters */}
      <div className="bg-[#eaf3fd] h-14 border-b border-[#dce9f8] flex items-center justify-between px-6 rounded-t-lg shrink-0 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-800 text-[15px]">EWS List</h2>
            <Search className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-700 transition" />
          </div>
          
          <div className="h-8 flex items-center bg-white/60 border border-brand-100 rounded-md p-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilter('all'); }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === 'all' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilter('needs_action'); }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 ${activeFilter === 'needs_action' ? 'bg-red-50 text-red-700 shadow-sm border border-red-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Requires Action
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilter('in_progress'); }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === 'in_progress' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              In Progress
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveFilter('resolved'); }}
              className={`px-3 py-1 text-xs font-semibold rounded ${activeFilter === 'resolved' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Resolved / Stable
            </button>
          </div>
        </div>
        <div className="text-slate-500 text-sm font-medium">
          {getFilteredPatients().length} records
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <Table>
          <TableHeader className="bg-[#eaf3fd] sticky top-0 z-10 shadow-sm shadow-[#eaf3fd]/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px] px-6 py-4">
                <Checkbox className="border-slate-400 bg-white data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe] rounded-sm" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Patient</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">AI Triage score <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" /></TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Status <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" /></TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">EWS Score</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">AI Engagement <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" /></TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Initiated By <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" /></TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Escalated By <Filter className="h-3 w-3 inline ml-0.5 text-slate-400" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getFilteredPatients().map((patient: Patient) => {
              const isSelected = selectedPatientId === patient.id;
              const isMenuOpen = contextMenuOpenId === patient.id;
              
              return (
                <TableRow 
                  key={patient.id} 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(e, patient.id)
                  }}
                  className={`
                      border-b border-slate-100 transition-all cursor-pointer group text-[13px] text-slate-600
                      ${isSelected || isMenuOpen
                          ? "bg-brand-50/50" 
                          : "bg-white hover:bg-slate-50"
                      }
                  `}
                >
                  <TableCell className="px-6 py-4">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => {
                        // Handled by onClick below to safely pass event
                      }}
                      className="border-slate-400 bg-white data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe] rounded-sm z-10 relative"
                      onClick={(e) => handleCheckboxClick(e, patient.id)}
                    />
                  </TableCell>
                  <TableCell className="text-slate-700 whitespace-nowrap">{patient.name} <span className="text-slate-400">({patient.age}y)</span></TableCell>
                  <TableCell className="whitespace-nowrap">
                     {patient.aiTriageScore ? (
                        <div className={`inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded ${getAiTriageColorStyles(patient.aiTriageScore)}`}>
                          {patient.aiTriageScore} ({getAiTriageStatus(patient.aiTriageScore)})
                        </div>
                     ) : (
                        <div className="inline-flex items-center justify-center font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                          -
                        </div>
                     )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                      <div className="flex items-center text-slate-700">
                          {getStatusIcon(patient.status)}
                          <span className={
                              ["Emergency Protocol", "Timeout Escalation"].includes(patient.status) ? "text-red-500 font-medium" :
                              ["Urgent Triage", "Nurse Alerted", "Refer to Doctor"].includes(patient.status) ? "text-orange-500 font-medium" :
                              patient.status === "AI Outreach" ? "text-blue-500 font-medium" : 
                              "text-emerald-500 font-medium"
                          }>{patient.status}</span>
                      </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     <div className="inline-flex items-center justify-center font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-700">
                       {patient.ewsScore}
                     </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                     {patient.aiEngagement ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                           patient.aiEngagement.includes('Call') ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                           patient.aiEngagement.includes('Text') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                           'bg-slate-50 border-slate-200 text-slate-700'
                        } border`}>
                           {patient.aiEngagement.includes('Call') ? <Phone className="h-3 w-3" /> : 
                            patient.aiEngagement.includes('Text') ? <MessageSquare className="h-3 w-3" /> : null}
                           <span className={patient.aiEngagement.includes('In Progress') || patient.aiEngagement.includes('Active') || patient.aiEngagement.includes('Awaiting') ? 'animate-pulse' : ''}>
                              {patient.aiEngagement}
                           </span>
                        </div>
                     ) : (
                        <span className="text-slate-400 font-medium">-</span>
                     )}
                  </TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">{patient.initiatedBy || "-"}</TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">
                      {patient.escalatedBy ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium border border-red-200 bg-red-50 text-red-600">
                              {patient.escalatedBy}
                          </span>
                      ) : "-"}
                  </TableCell>
                </TableRow>
            )})}
            
            {/* Added empty spacer to ensure table items don't hide behind floating button */}
            <TableRow className="border-transparent hover:bg-transparent"><TableCell colSpan={7} className="h-16 cursor-default"></TableCell></TableRow>
          </TableBody>
        </Table>

        {/* Global Floating Context Menu */}
        {contextMenuOpenId && (
          <div 
            className="fixed z-50 animate-in fade-in zoom-in-95 duration-100"
            style={{ 
              left: `${menuPosition.x}px`, 
              top: `${menuPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[240px] p-1 border border-slate-200 shadow-xl rounded-lg bg-white overflow-hidden flex flex-col">
              {(() => {
                const patient = patients.find(p => p.id === contextMenuOpenId);
                if (!patient) return null;

                const isCritical = ["Emergency Protocol", "Timeout Escalation", "Urgent Triage"].includes(patient.status);
                const isAiActive = patient.aiEngagement?.includes("In Progress") || patient.aiEngagement?.includes("Active") || patient.aiEngagement?.includes("Awaiting");
                
                // If a Nurse initiated it, it's inherently acknowledged.
                const isHumanInitiated = patient.initiatedBy === "Nurse" || patient.initiatedBy === "Caregiver / Family";
                const isAlreadyHandled = ["Nurse Alerted", "Refer to Doctor", "Resolved", "Stable / Monitoring"].includes(patient.status);
                
                const canAcknowledge = !isAlreadyHandled && (!isHumanInitiated || patient.status === "Emergency Protocol" || patient.status === "Timeout Escalation");

                return (
                  <>
                    {/* WORKFLOW & TRIAGE ACTIONS */}
                    {(isCritical || canAcknowledge) && (
                      <div className="pb-1 mb-1 border-b border-slate-100">
                        {canAcknowledge && (
                          <div 
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-[13px] text-orange-700 transition-colors rounded-md font-medium"
                            onClick={() => {
                               setActionSheetPatientId(patient.id);
                               setContextMenuOpenId(null);
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <AlertCircle className="h-4 w-4" />
                              <span>Acknowledge Alert</span>
                            </div>
                          </div>
                        )}
                        {!patient.status.includes("Emergency Protocol") && (
                          <div 
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-[13px] text-red-700 transition-colors rounded-md font-medium mt-0.5"
                            onClick={() => {
                               setEmergencySheetPatientId(patient.id);
                               setContextMenuOpenId(null);
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <Siren className="h-4 w-4" />
                              <span>Trigger Emergency</span>
                            </div>
                          </div>
                        )}
                        {patient.status !== "Refer to Doctor" && (
                          <div 
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 text-[13px] text-indigo-700 transition-colors rounded-md font-medium mt-0.5"
                            onClick={() => {
                               setEscalateSheetPatientId(patient.id);
                               setContextMenuOpenId(null);
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <Stethoscope className="h-4 w-4" />
                              <span>Escalate to Doctor</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* COMMUNICATION ACTIONS */}
                    <div className="pb-1 mb-1 border-b border-slate-100">
                      {isAiActive ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md font-medium"
                          onClick={() => {
                             pauseAiOutreach(patient.id);
                             setContextMenuOpenId(null);
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <PauseCircle className="h-4 w-4 text-slate-500" />
                            <span>Pause AI Outreach</span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md font-medium"
                          onClick={() => {
                             initiateAiCheckIn(patient.id, "call");
                             setContextMenuOpenId(null);
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span>Initiate AI Check-in</span>
                          </div>
                        </div>
                      )}
                      {patient.status !== "Resolved" && (
                        <div 
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md font-medium mt-0.5"
                          onClick={() => {
                             setResolveSheetPatientId(patient.id);
                             setContextMenuOpenId(null);
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-slate-500" />
                            <span>Mark as Resolved</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CLINICAL REVIEW ACTIONS */}
                    <div>
                      <div 
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md"
                        onClick={() => handleViewPhr(patient.id, patient.name, 'encounter')}
                      >
                        <div className="flex items-center gap-2.5">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <span>View Latest Encounter</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">E</span>
                      </div>
                      <div 
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md mt-0.5"
                        onClick={() => handleViewPhr(patient.id, patient.name, 'phr')}
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span>Open Health Record</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">P</span>
                      </div>
                      <div 
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[13px] text-slate-700 transition-colors rounded-md mt-0.5"
                        onClick={() => {
                           setTimelineModalPatientId(contextMenuOpenId)
                           setContextMenuOpenId(null)
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span>Timeline of Events</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">T</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <TimelineModal 
        patientId={timelineModalPatientId} 
        isOpen={!!timelineModalPatientId} 
        onClose={() => setTimelineModalPatientId(null)} 
      />

      {/* Floating Action Button */}
      <div className="absolute right-4 bottom-[72px] z-20">
         <div className="bg-[#00a2ff] hover:bg-blue-500 rounded-xl h-[52px] w-[52px] shadow-lg flex items-center justify-center cursor-pointer transition-colors shadow-blue-400/30">
           <Settings className="h-6 w-6 text-white" />
         </div>
      </div>

      {/* Acknowledge Alert Slide-out Sheet */}
      <Sheet open={!!actionSheetPatientId} onOpenChange={(open) => !open && setActionSheetPatientId(null)}>
        <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto">
          {(() => {
             const patient = patients.find(p => p.id === actionSheetPatientId);
             if (!patient) return null;

             return (
               <>
                  <SheetHeader className="px-6 py-5 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <SheetTitle className="text-xl">Acknowledge Alert</SheetTitle>
                    </div>
                    <SheetDescription>
                      Review clinical context and take ownership of this alert.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 p-6 flex flex-col gap-6">
                     {/* Patient Summary Header */}
                     <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                           <div>
                             <h3 className="font-bold text-lg text-slate-900">{patient.name}</h3>
                             <p className="text-slate-500 text-sm">{patient.age}y • MRN: {patient.id.padStart(6, '0')} • Room 402B</p>
                           </div>
                           <div className="flex flex-col items-end">
                             <div className="inline-flex items-center justify-center font-bold border px-2 py-0.5 rounded text-orange-700 bg-orange-50 border-orange-200 mb-1">
                               AI Score: {patient.aiTriageScore}
                             </div>
                             <span className="text-xs font-medium text-slate-500">EWS: {patient.ewsScore}</span>
                           </div>
                        </div>

                        {/* Why are they here? */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                           <p className="text-sm font-medium text-slate-700 mb-1">Trigger Event</p>
                           <p className="text-sm text-slate-600 bg-orange-50/50 p-3 rounded-md border border-orange-100 flex items-start gap-2">
                             <Siren className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                             <span>SpO2 dropped to 88% over the last 2 hours. Heart rate showing rising trend.</span>
                           </p>
                        </div>
                     </div>

                     {/* Vitals Snapshot */}
                     <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Latest Vitals
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                             <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Heart Rate</span>
                             <div className="flex items-baseline gap-1">
                               <span className="text-lg font-bold text-slate-900">112</span>
                               <span className="text-xs text-red-500 font-bold">↑</span>
                             </div>
                           </div>
                           <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                             <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">SpO2</span>
                             <div className="flex items-baseline gap-1">
                               <span className="text-lg font-bold text-red-600">88%</span>
                               <span className="text-xs text-red-500 font-bold">↓</span>
                             </div>
                           </div>
                           <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                             <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Blood Press.</span>
                             <div className="flex items-baseline gap-1">
                               <span className="text-lg font-bold text-slate-900">145/90</span>
                             </div>
                           </div>
                           <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                             <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Temp</span>
                             <div className="flex items-baseline gap-1">
                               <span className="text-lg font-bold text-slate-900">38.2°</span>
                             </div>
                           </div>
                        </div>
                     </div>
                     
                     {/* Nurse Assessment Note */}
                     <div className="flex-1 flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-2 ml-1">Initial Assessment Note (Optional)</label>
                        <Textarea 
                          placeholder="E.g. Patient appears flushed, applying supplemental oxygen..."
                          className="flex-1 min-h-[120px] resize-none bg-white border-slate-200 focus-visible:ring-brand-500"
                          value={actionNote}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionNote(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Fixed Bottom Action Bar */}
                  <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setActionSheetPatientId(null);
                        setActionNote("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                      onClick={() => {
                        acknowledgeAlert(patient.id);
                        setActionSheetPatientId(null);
                        setActionNote("");
                      }}
                    >
                      Take Ownership
                    </Button>
                  </div>
               </>
             )
          })()}
        </SheetContent>
      </Sheet>

      {/* Trigger Emergency Slide-out Sheet */}
      <Sheet open={!!emergencySheetPatientId} onOpenChange={(open) => !open && setEmergencySheetPatientId(null)}>
        <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-red-500 border-l-[6px]">
          {(() => {
             const patient = patients.find(p => p.id === emergencySheetPatientId);
             if (!patient) return null;

             return (
               <>
                  <SheetHeader className="px-6 py-5 bg-red-600 border-b border-red-700 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Siren className="h-6 w-6 text-white animate-pulse" />
                      <SheetTitle className="text-xl text-white">Trigger Emergency Protocol</SheetTitle>
                    </div>
                    <SheetDescription className="text-red-100 font-medium">
                      You are about to initiate a Code Blue / Rapid Response.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 p-6 flex flex-col gap-6">
                     {/* Location Warning Box */}
                     <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm text-center">
                        <h3 className="font-bold text-xl text-red-900 mb-1">{patient.name}</h3>
                        <p className="text-red-700 font-medium">{patient.age}y • MRN: {patient.id.padStart(6, '0')}</p>
                        
                        <div className="mt-4 inline-block bg-white px-6 py-3 rounded-lg border-2 border-red-300 shadow-sm">
                           <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Current Location</p>
                           <p className="text-2xl font-black text-slate-900 tracking-tight">ROOM 402B</p>
                        </div>
                     </div>

                     {/* Dispatch Protocols */}
                     <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 ml-1 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-red-600" />
                          Emergency Dispatch Options
                        </h4>
                        <div className="space-y-3">
                           <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                             <Checkbox checked={dispatchRrt} onCheckedChange={(c) => setDispatchRrt(!!c)} className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                             <div>
                               <p className="font-semibold text-slate-900 text-sm">Deploy Rapid Response Team (RRT)</p>
                               <p className="text-xs text-slate-500 mt-0.5">Dispatches the internal critical care team immediately to Room 402B.</p>
                             </div>
                           </label>

                           <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                             <Checkbox checked={dispatchPhysician} onCheckedChange={(c) => setDispatchPhysician(!!c)} className="mt-0.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                             <div>
                               <p className="font-semibold text-slate-900 text-sm">Alert On-Call Attending</p>
                               <p className="text-xs text-slate-500 mt-0.5">Sends priority SMS override to Dr. Smith&apos;s mobile device.</p>
                             </div>
                           </label>
                           
                           <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                             <Checkbox checked={true} disabled className="mt-0.5 data-[state=checked]:bg-slate-400 data-[state=checked]:border-slate-400 opacity-50" />
                             <div className="opacity-70">
                               <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                 Automated Crash Cart Request <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 uppercase font-bold tracking-wider">Default</span>
                               </p>
                               <p className="text-xs text-slate-500 mt-0.5">System automatically routes nearest crash cart based on RFID.</p>
                             </div>
                           </label>
                        </div>
                     </div>
                  </div>

                  {/* Fixed Bottom Action Bar */}
                  <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setEmergencySheetPatientId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] bg-red-600 hover:bg-red-700 text-white shadow-lg text-lg h-12 flex items-center gap-2"
                      onClick={() => {
                        triggerEmergency(patient.id);
                        setEmergencySheetPatientId(null);
                        setDispatchRrt(true);
                        setDispatchPhysician(true);
                      }}
                    >
                      <Siren className="h-5 w-5" />
                      Dispatch Emergency
                    </Button>
                  </div>
               </>
             )
          })()}
        </SheetContent>
      </Sheet>

      {/* Escalate to Doctor Slide-out Sheet */}
      <Sheet open={!!escalateSheetPatientId} onOpenChange={(open) => !open && setEscalateSheetPatientId(null)}>
        <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-indigo-500 border-l-[4px]">
          {(() => {
             const patient = patients.find(p => p.id === escalateSheetPatientId);
             if (!patient) return null;

             return (
               <>
                  <SheetHeader className="px-6 py-5 bg-indigo-600 border-b border-indigo-700 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Stethoscope className="h-5 w-5 text-indigo-100" />
                      <SheetTitle className="text-xl text-white">Escalate to Physician</SheetTitle>
                    </div>
                    <SheetDescription className="text-indigo-100 font-medium">
                      Formal Clinical SBAR Handoff
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 p-6 flex flex-col gap-6">
                     
                     {/* Physician Selection */}
                     <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wider">Select Attending Physician</label>
                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                          <SelectTrigger className="w-full bg-white border-slate-200 h-12 shadow-sm focus:ring-indigo-500">
                            <SelectValue placeholder="Assign to an on-call doctor..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dr_smith">Dr. Sarah Smith (Cardiology)</SelectItem>
                            <SelectItem value="dr_jones">Dr. Michael Jones (Pulmonology)</SelectItem>
                            <SelectItem value="dr_patel">Dr. Amit Patel (Internal Med)</SelectItem>
                            <SelectItem value="dr_chen">Dr. Emily Chen (Hospitalist)</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>

                     <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                           <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                              <FileText className="h-4 w-4 text-indigo-500" /> 
                              SBAR Clinical Handoff Form
                           </h3>
                        </div>
                        
                        <div className="p-4 flex flex-col gap-4 flex-1">
                           {/* S: Situation */}
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">S</div>
                                <label className="text-sm font-bold text-slate-700">Situation <span className="text-slate-400 font-normal text-xs">(Auto-filled)</span></label>
                              </div>
                              <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                                Escalating patient {patient.name} ({patient.age}y). EWS Score is currently {patient.ewsScore} (Condition: {patient.status}). Patient triggered automated early warning for anomalous vital trends.
                              </div>
                           </div>
                           
                           {/* B: Background */}
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-5 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">B</div>
                                <label className="text-sm font-bold text-slate-700">Background <span className="text-slate-400 font-normal text-xs">(Auto-filled)</span></label>
                              </div>
                              <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                                Admitted securely 2 days ago. Primary DX: exacerbation of chronic condition. Latest AI Triage Risk index is {patient.aiTriageScore}/10. 
                              </div>
                           </div>

                           {/* A: Assessment */}
                           <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">A</div>
                                <label className="text-sm font-bold text-slate-900">Assessment <span className="text-red-500">*</span></label>
                              </div>
                              <Textarea 
                                placeholder="What is your clinical assessment of the current situation?"
                                className="flex-1 min-h-[80px] resize-none bg-white border-slate-300 focus-visible:ring-indigo-500 shadow-inner"
                                value={sbarAssessment}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSbarAssessment(e.target.value)}
                              />
                           </div>

                           {/* R: Recommendation */}
                           <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="h-5 w-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">R</div>
                                <label className="text-sm font-bold text-slate-900">Recommendation / Request <span className="text-red-500">*</span></label>
                              </div>
                              <Textarea 
                                placeholder="What do you need the physician to do? (e.g., 'Please evaluate patient at bedside' or 'Requesting order for Lasix 40mg IV')"
                                className="flex-1 min-h-[80px] resize-none bg-white border-slate-300 focus-visible:ring-indigo-500 shadow-inner"
                                value={sbarRecommendation}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSbarRecommendation(e.target.value)}
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Fixed Bottom Action Bar */}
                  <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setEscalateSheetPatientId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
                      disabled={!selectedDoctor || !sbarAssessment || !sbarRecommendation}
                      onClick={() => {
                        escalateToDoctor(patient.id);
                        setEscalateSheetPatientId(null);
                        setSelectedDoctor("");
                        setSbarAssessment("");
                        setSbarRecommendation("");
                      }}
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Send Handoff & Escalate
                    </Button>
                  </div>
               </>
             )
          })()}
        </SheetContent>
      </Sheet>

      {/* Mark as Resolved Slide-out Sheet */}
      <Sheet open={!!resolveSheetPatientId} onOpenChange={(open) => !open && setResolveSheetPatientId(null)}>
        <SheetContent className="sm:max-w-[450px] p-0 flex flex-col h-full bg-slate-50 overflow-y-auto border-l-emerald-500 border-l-[4px]">
          {(() => {
             const patient = patients.find(p => p.id === resolveSheetPatientId);
             if (!patient) return null;

             return (
               <>
                  <SheetHeader className="px-6 py-5 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <SheetTitle className="text-xl">Resolve Alert Encounter</SheetTitle>
                    </div>
                    <SheetDescription>
                      Document the clinical resolution to safely close this loop.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 p-6 flex flex-col gap-6">
                     {/* Patient Summary */}
                     <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                         <div>
                           <h3 className="font-bold text-lg text-slate-900">{patient.name}</h3>
                           <p className="text-slate-500 text-sm">MRN: {patient.id.padStart(6, '0')}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Status</p>
                           <p className="text-sm font-medium text-slate-700">{patient.status}</p>
                         </div>
                     </div>
                     
                     {/* Resolution Form */}
                     <div className="flex-1 flex flex-col gap-5">
                       
                        {/* 1. Reason */}
                        <div>
                           <label className="text-sm font-bold text-slate-700 mb-2 block">Resolution Reason <span className="text-red-500">*</span></label>
                           <Select value={resolutionReason} onValueChange={setResolutionReason}>
                             <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm focus:ring-emerald-500">
                               <SelectValue placeholder="Select primary reason..." />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="stabilized">Patient Stabilized Post-Intervention</SelectItem>
                               <SelectItem value="false_alarm">False Alarm / Sensor Artifact</SelectItem>
                               <SelectItem value="medication_adjusted">Medication Adjusted</SelectItem>
                               <SelectItem value="admitted">Admitted to Hospital / ER</SelectItem>
                               <SelectItem value="patient_refused">Patient Refused Assessment</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>

                        {/* 2. Closing Note */}
                        <div className="flex-1 flex flex-col">
                           <label className="text-sm font-bold text-slate-700 mb-2">Final Clinical Note <span className="text-red-500">*</span></label>
                           <Textarea 
                             placeholder="Document your final assessment, interventions provided, and the patient's response..."
                             className="flex-1 min-h-[120px] resize-none bg-white border-slate-300 focus-visible:ring-emerald-500 shadow-inner"
                             value={closingNote}
                             onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClosingNote(e.target.value)}
                           />
                        </div>

                        {/* 3. Follow-up Checkboxes */}
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                           <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3">Post-Resolution Plan</h4>
                           <div className="space-y-3">
                              <label className="flex items-start gap-3 cursor-pointer">
                                <Checkbox checked={scheduleFollowUp} onCheckedChange={(c) => setScheduleFollowUp(!!c)} className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">Schedule 24h Telemed Follow-up</p>
                                </div>
                              </label>
                              <label className="flex items-start gap-3 cursor-pointer">
                                <Checkbox checked={adjustBaselines} onCheckedChange={(c) => setAdjustBaselines(!!c)} className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">Adjust Personal EWS Baselines</p>
                                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">The system will use today&apos;s vitals to recalibrate this patient&apos;s &quot;normal&quot; thresholds to prevent future false alarms.</p>
                                </div>
                              </label>
                           </div>
                        </div>

                     </div>
                  </div>

                  {/* Fixed Bottom Action Bar */}
                  <div className="p-4 bg-white border-t border-slate-200 mt-auto flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setResolveSheetPatientId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
                      disabled={!resolutionReason || !closingNote}
                      onClick={() => {
                        markAsResolved(patient.id);
                        setResolveSheetPatientId(null);
                        setResolutionReason("");
                        setClosingNote("");
                        setScheduleFollowUp(false);
                        setAdjustBaselines(false);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Sign-off & Resolve
                    </Button>
                  </div>
               </>
             )
          })()}
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 text-sm text-slate-500 w-full shrink-0">
        <div className="flex items-center gap-3">
           <span>Version 1.124</span>
           <span className="text-slate-300">•</span>
           <span className="font-medium text-slate-700">Make Master Tab</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
             <span>Rows per page: 30</span>
             <span className="font-medium text-slate-700">1 - 30 of 30</span>
             <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                   <ChevronLeft className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                   <ChevronRight className="h-4 w-4" />
                 </Button>
             </div>
        </div>
      </div>
    </div>
  )
}
