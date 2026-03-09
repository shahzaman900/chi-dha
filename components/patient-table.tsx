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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePatientStore } from "@/store/patient-store"
import { Button } from "./ui/button"
import { 
  ChevronLeft, ChevronRight, Siren, AlertTriangle, Check, Search, Filter, Settings,
  Eye, Pencil, FileText, Mail, MessageSquare, Plus, FlaskConical, UserMinus, Activity, Phone, Clock
} from "lucide-react"
import { useState } from "react"
import { TimelineModal } from "./timeline-modal"

export function PatientTable() {
  const { patients, selectedPatientId, setSelectedPatientId, openPhrTab } = usePatientStore()
  
  // Context Menu State
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [timelineModalPatientId, setTimelineModalPatientId] = useState<string | null>(null)

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
      
      {/* Darker Header Above Table */}
      <div className="bg-[#eaf3fd] h-14 border-b border-[#dce9f8] flex items-center justify-between px-6 rounded-t-lg shrink-0 w-full">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800 text-[15px]">EWS List</h2>
          <Search className="h-4 w-4 text-slate-500 cursor-pointer hover:text-slate-700 transition" />
        </div>
        <div className="text-slate-500 text-sm">
          307 records
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
            {patients.map((patient: any, index: number) => {
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
            <div className="w-[200px] p-1 border border-slate-200 shadow-xl rounded-lg bg-white overflow-hidden">
                <div 
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[14px] text-slate-700 transition-colors rounded-md"
                  onClick={() => {
                      const patient = patients.find(p => p.id === contextMenuOpenId)
                      if(patient) handleViewPhr(patient.id, patient.name, 'encounter')
                  }}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <Activity className="h-[18px] w-[18px] text-slate-500" />
                    <span>View Encounter</span>
                  </div>
                  <span className="text-xs text-slate-400">E</span>
                </div>
                <div 
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[14px] text-slate-700 transition-colors rounded-md mt-1"
                  onClick={() => {
                      const patient = patients.find(p => p.id === contextMenuOpenId)
                      if(patient) handleViewPhr(patient.id, patient.name, 'phr')
                  }}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <FileText className="h-[18px] w-[18px] text-slate-500" />
                    <span>View PHR</span>
                  </div>
                  <span className="text-xs text-slate-400">P</span>
                </div>
                
                <div 
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[14px] text-slate-700 transition-colors rounded-md mt-1 border-t border-slate-100 pt-3"
                  onClick={() => {
                     setTimelineModalPatientId(contextMenuOpenId)
                     setContextMenuOpenId(null)
                  }}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <Clock className="h-[18px] w-[18px] text-slate-500" />
                    <span>Timeline of Events</span>
                  </div>
                  <span className="text-xs text-slate-400">T</span>
                </div>
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
