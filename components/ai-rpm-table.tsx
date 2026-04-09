"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AiRpmTable({ role, api }: { role: string, api: any }) {
  const [activeFilter, setActiveFilter] = useState("all") // all, backlog, active, refer

  const filters = [
    { id: "all", label: "All" },
    { id: "approval", label: "Approval Details" },
    { id: "active", label: "Active View" },
    { id: "refer", label: "Referrals" },
  ]

  const getConditionColor = (c: string) => {
    switch (c) {
      case "Low Risk": return "bg-[#E2EFDA] text-[#375623] border-[#375623]/20"
      case "Medium Risk": return "bg-[#FFF2CC] text-[#7F6000] border-[#7F6000]/20"
      case "High Risk": return "bg-[#FCE4D6] text-[#712B13] border-[#712B13]/20"
      case "Critical": return "bg-[#FCE4EC] text-[#7B0026] border-[#7B0026]/20"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'backlog': return 'bg-[#1F4E79] text-white'
      case 'active': return 'bg-[#2E75B6] text-white'
      case 'referral': return 'bg-[#4472C4] text-white'
      default: return 'bg-slate-400 text-white'
    }
  }

  const renderRow = (patient: any, stageName: string, stageData: any) => {
    if (!stageData) return null

    // Apply Filter Logic
    if (activeFilter === 'approval' && stageName !== 'backlog') return null;
    if (activeFilter === 'active' && stageName !== 'active') return null;
    if (activeFilter === 'refer' && stageName !== 'referral') return null;

    const isApprover = stageData.approval === role;
    const isActor = stageData.actor === role;
    
    // Core Role-Based Visibility: Only show if role is approver or actor
    if (!isApprover && !isActor) return null;

    const isDone = stageData.status === 'done';
    
    // "Nurse is approver by default, but if actor is doctor, doctor can pick from his list"
    const canApproveBacklog = !isDone && stageName === 'backlog' && (isApprover || (isActor && role === 'doctor'));
    const isPendingAndMine = !isDone && isActor;

    const isActiveStageNow = patient.rpmCurrentStage === stageName && !isDone;

    const rowOpacity = isDone ? "opacity-60" : "opacity-100";
    const bgClass = isDone ? "bg-slate-50" : (isActiveStageNow ? "bg-blue-50/30" : "bg-white")

    return (
      <TableRow key={`${patient.id}-${stageName}`} className={`border-b border-slate-100 transition-all text-xs text-slate-700 ${rowOpacity} ${bgClass} hover:bg-slate-100`}>
        <TableCell className="font-mono">{patient.id}</TableCell>
        <TableCell className="font-bold">{patient.name}</TableCell>
        <TableCell className="font-bold text-center">{patient.rpmTriageScore}</TableCell>
        <TableCell>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getConditionColor(patient.rpmCondition)}`}>
            {patient.rpmCondition}
          </span>
        </TableCell>
        <TableCell>
           <div className="flex flex-col gap-1">
             <span className={`px-2 py-0.5 rounded text-[10px] w-fit font-bold ${getStageColor(stageName)}`}>
               {stageName.toUpperCase()}
             </span>
             <span className="text-[10px] text-slate-400 uppercase font-bold">{stageData.status}</span>
           </div>
        </TableCell>
        <TableCell className="capitalize">{stageData.approval || "—"}</TableCell>
        <TableCell className="capitalize font-semibold text-slate-800">{stageData.actor || "—"}</TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            {canApproveBacklog && (
              <button 
                onClick={() => api.approveBacklog(patient.id)} 
                className={`${role === 'doctor' ? 'bg-[#0C447C] hover:bg-[#08305c]' : 'bg-[#375623] hover:bg-[#284119]'} text-white px-2 py-1 flex items-center justify-center rounded text-[10px]`}
              >
                {role === 'doctor' ? 'Pick Patient' : `Approve (${stageData.action})`}
              </button>
            )}
            
            {isPendingAndMine && stageName === 'active' && (role === 'nurse' || role === 'doctor') && (
              <>
                <button onClick={() => api.completeActive(patient.id)} className={`${role === 'doctor' ? 'bg-[#0C447C] hover:bg-[#08305c]' : 'bg-[#0C447C] hover:bg-[#08305c]'} text-white px-2 py-1 rounded text-[10px]`}>
                  Complete ({stageData.action})
                </button>
                {role === 'nurse' && patient.rpmCondition === 'Medium Risk' && (
                  <button onClick={() => api.referToDoctor(patient.id)} className="bg-amber-600 text-white px-2 py-1 rounded text-[10px] hover:bg-amber-700">
                    Refer to Doctor
                  </button>
                )}
                {role === 'doctor' && (patient.rpmCondition === 'High Risk' || patient.rpmCondition === 'Critical') && (
                  <button onClick={() => api.referToEmergency(patient.id)} className="bg-[#7B0026] text-white px-2 py-1 rounded text-[10px] hover:bg-[#5a001c]">
                    Refer Emergency
                  </button>
                )}
              </>
            )}
            
            {isPendingAndMine && (stageName === 'active' || stageName === 'referral') && role === 'emergency' && (
                <button onClick={() => api.acceptEmergency(patient.id)} className="bg-[#7B0026] text-white px-2 py-1 rounded text-[10px] hover:bg-[#5a001c]">
                  Accept & Treat
                </button>
            )}
            {isPendingAndMine && stageName === 'referral' && role === 'doctor' && (
                <button onClick={() => api.acceptEmergency(patient.id)} className="bg-[#0C447C] text-white px-2 py-1 rounded text-[10px] hover:bg-[#08305c]">
                  Consult Complete
                </button>
            )}
            
            {(!canApproveBacklog && (!isPendingAndMine || (stageName !== 'active' && stageName !== 'referral'))) && (
              <span className="text-slate-400 capitalize">{stageData.action || "—"}</span>
            )}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-md border border-slate-200 overflow-hidden">
      {/* Filter Section */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#fcfcfc] border-b border-slate-200 shrink-0">
        <span className="text-sm font-semibold text-slate-500 mr-2">Filter by {role} cases:</span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeFilter === f.id
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
        {api.isLoading && <span className="ml-4 text-xs text-blue-500 animate-pulse">Syncing...</span>}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-[#eaf3fd] sticky top-0 z-10 shadow-sm shadow-[#eaf3fd]/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Mr No</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Patient Name</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap text-center">Triage</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Condition</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Peak</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Approvar</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Actor</TableHead>
              <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {api.patients.flatMap((p: any) => [
              renderRow(p, 'backlog', p.rpmBacklog),
              renderRow(p, 'active', p.rpmActive),
              renderRow(p, 'referral', p.rpmReferral)
            ]).filter(Boolean)}

            {api.patients.length === 0 && !api.isLoading && (
              <TableRow className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-all text-[13px] text-slate-600">
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No tracking data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
