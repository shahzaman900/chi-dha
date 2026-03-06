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
import { usePatientStore } from "@/store/patient-store"
import { Button } from "./ui/button"
import { 
  ChevronLeft, ChevronRight, Siren, AlertTriangle, Check, Search, Filter, Settings,
  Eye, Pencil, FileText, Mail, MessageSquare, Plus, FlaskConical, UserMinus, Activity, Phone, Clock
} from "lucide-react"
import { useState, useMemo } from "react"

export function EncountersTable() {
  const { patients, selectedPatientId, setSelectedPatientId, openPhrTab } = usePatientStore()
  
  // Context Menu State
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(null) // This will now hold an encounter ID, not just patient ID
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const allEncounters = useMemo(() => {
    return patients.flatMap(patient => {
      if (patient.encounters && patient.encounters.length > 0) {
        return patient.encounters.map(enc => ({
          patient,
          encounter: enc
        }))
      }
      // default mock encounter if none specified
      return [{
        patient,
        encounter: {
          id: `enc-default-${patient.id}`,
          date: "Today, 09:30 AM",
          provider: "Dr. Smith",
          reason: "Routine checkup / monitoring",
          type: "Follow Up"
        }
      }]
    })
  }, [patients])

  const handleRowClick = (e: React.MouseEvent, encounterId: string) => {
    e.stopPropagation()
    // Instead of selecting, open context menu where clicked:
    setContextMenuOpenId(contextMenuOpenId === encounterId ? null : encounterId)
    setMenuPosition({ x: e.clientX, y: e.clientY })
  }

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedPatientId(id === selectedPatientId ? null : id)
  }

  const handleViewDetails = (id: string, name: string) => {
    openPhrTab(id, name, 'encounter')
    setContextMenuOpenId(null)
  }

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'CRITICAL':
              return <Siren className="h-4 w-4 mr-2 text-red-500" />
          case 'High Risk':
          case 'Medium Risk':
              return <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
          default:
              return <Check className="h-4 w-4 mr-2 text-emerald-500" />
      }
  }

  const getTrendIcon = (trend: string) => {
      if (trend === 'Escalating' || trend === 'Rising') {
          return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mr-2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
      }
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mr-2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
  }

  // Close context menu if clicked outside table
  // Use a capturing event listener normally, but for simplicity here we just use onMouseLeave on the container or a generic div wrap

  return (
    <div className="flex flex-col h-full relative" onClick={() => setContextMenuOpenId(null)}>
      {/* Table Header Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#eef6fc] border-b border-blue-100 rounded-t-lg">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-[#0f62fe]">Encounters List</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded flex-1 min-w-[300px] border border-blue-100 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Date" 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-sm font-semibold text-slate-600 bg-white px-3 py-1.5 rounded border border-slate-200">
               {allEncounters.length} records
           </div>
        </div>
      </div>

      {/* Table Body Section */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-[#f8f9fa] sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-transparent">
              <TableHead className="w-12 pl-6">
                <Checkbox className="border-slate-300 data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe]" />
              </TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Patient</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">MR No.</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Check-In</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Provider</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Reason</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Status</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Encounter Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEncounters.map(({ patient, encounter }) => {
              const mrNumber = `MR-${patient.id.padStart(4, '0')}`
              return (
                <TableRow 
                  key={encounter.id}
                  className={`border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${selectedPatientId === patient.id ? 'bg-blue-50/50 hover:bg-blue-50/80' : ''}`}
                  onClick={(e) => handleRowClick(e, encounter.id)}
                >
                  <TableCell className="pl-6">
                    <Checkbox 
                        checked={selectedPatientId === patient.id}
                        onCheckedChange={() => setSelectedPatientId(patient.id === selectedPatientId ? null : patient.id)}
                        onClick={(e: React.MouseEvent) => handleCheckboxClick(e, patient.id)}
                        className="border-slate-300 data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe]" 
                    />
                  </TableCell>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="font-bold text-[#0f62fe]">{patient.name}</span>
                          <span className="text-xs text-slate-500">{patient.age} yrs • Male</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{mrNumber}</TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap text-sm">{encounter.date}</TableCell>
                  <TableCell className="text-slate-600 font-medium text-sm">{encounter.provider}</TableCell>
                  <TableCell className="text-slate-600 text-[13px]">{encounter.reason}</TableCell>
                  <TableCell className="whitespace-nowrap">
                      <div className="flex items-center text-slate-700">
                          {getStatusIcon(patient.status)}
                          <span className={
                              patient.status === "CRITICAL" ? "text-red-500 font-medium" :
                              patient.status === "High Risk" ? "text-orange-500 font-medium" :
                              patient.status === "Medium Risk" ? "text-yellow-500 font-medium" : "text-emerald-500 font-medium"
                          }>{patient.status}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium border border-blue-200 bg-blue-50 text-blue-700">
                          {encounter.type}
                      </span>
                  </TableCell>
                </TableRow>
            )})}
            
            {/* Added empty spacer to ensure table items don't hide behind floating button */}
            <TableRow className="border-transparent hover:bg-transparent"><TableCell colSpan={8} className="h-16 cursor-default"></TableCell></TableRow>
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
            <div className="w-[180px] p-1 border border-slate-200 shadow-xl rounded-lg bg-white overflow-hidden">
                <div 
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 text-[14px] text-slate-700 transition-colors rounded-md"
                  onClick={() => {
                      const match = allEncounters.find(e => e.encounter.id === contextMenuOpenId)
                      if(match) handleViewDetails(match.patient.id, match.patient.name)
                  }}
                >
                  <div className="flex items-center gap-3 font-medium text-brand-600">
                    <Activity className="h-[18px] w-[18px]" />
                    <span>View Detail</span>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>

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
             <span className="font-medium text-slate-700">1 - {allEncounters.length} of {allEncounters.length}</span>
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
