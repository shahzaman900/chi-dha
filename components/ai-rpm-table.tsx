"use client"

import { useState, Fragment, useRef, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as Dialog from "@radix-ui/react-dialog"
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  MoreVertical, 
  CheckCircle, 
  Activity, 
  UserPlus, 
  Clock, 
  BrainCircuit, 
  Eye, 
  ChevronRight,
  UserCog,
  ChevronDown,
  X,
  FileText
} from "lucide-react"

export function AiRpmTable({ role, api }: { role: string; api: any }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null)
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<any | null>(null)
  
  // Reassignment State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState("")
  const [reassignPatientId, setReassignPatientId] = useState<string | null>(null)

  const currentUser = "Nurse Sara"; 
  
  useEffect(() => {
    if (api.fetchStaff) api.fetchStaff();
  }, [api]);

  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
        setMenuPosition(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleRowClick = (e: React.MouseEvent, rowId: string) => {
    // If it's a right click, prevent default context menu
    if (e.type === 'contextmenu') e.preventDefault();
    
    // Toggle menu
    if (activeMenuId === rowId) {
      setActiveMenuId(null);
      setMenuPosition(null);
    } else {
      setActiveMenuId(rowId);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  }

  const filters = [
    { id: "all", label: "All" },
    { id: "my_active", label: "My Active Cases" },
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

  // Helper to generate dynamic dummy history
  const getDummyHistory = (patient: any) => [
    {
      date: "2024-04-16 08:30 AM",
      score: patient.rpmTriageScore,
      condition: patient.rpmCondition,
      reason: "Latest Vitals Check",
      comment: "Stable but monitored."
    },
    {
      date: "2024-04-15 11:45 PM",
      score: Math.max(1, patient.rpmTriageScore - 2),
      condition: "Medium Risk",
      reason: "Lab Results (Creatinine)",
      comment: "Initial signs of elevation noted."
    },
    {
      date: "2024-04-15 02:20 PM",
      score: 2,
      condition: "Low Risk",
      reason: "Routine Follow-up",
      comment: "Baseline vitals recorded."
    }
  ]

  const renderRow = (patient: any, stageName: string, stageData: any) => {
    if (!stageData) return null

    const currentUser = "Nurse Sarah"; // Simulated current user

    // Apply Filter Logic
    if (activeFilter === 'my_active' && stageData.actor !== currentUser) return null;

    const isApprover = stageData.approval === role;
    const isActor = stageData.actor === role || stageData.actor === currentUser;
    
    // Core Role-Based Visibility: Only show if role is approver or actor
    if (!isApprover && !isActor && activeFilter !== 'all') return null;

    const isDone = stageData.status === 'done';
    
    // Pick Logic: If actor is generic role, and it's backlog, show Pick
    const isGenericActor = stageData.actor === 'nurse' || stageData.actor === 'doctor';
    const canPick = !isDone && stageName === 'backlog' && isGenericActor && (isApprover || role === 'doctor');
    const isClaimedByMe = stageData.actor === currentUser;
    const isClaimedByOther = !isGenericActor && !isClaimedByMe && !isDone;

    const canApproveBacklog = !isDone && stageName === 'backlog' && (isClaimedByMe || (isActor && role === 'doctor' && isGenericActor));
    const isPendingAndMine = !isDone && (isActor || isClaimedByMe);
    const isActiveStageNow = patient.rpmCurrentStage === stageName && !isDone;
    const rowOpacity = isDone ? "opacity-60" : "opacity-100";
    const bgClass = isDone ? "bg-slate-50" : (isActiveStageNow ? "bg-blue-50/5" : "bg-white")
    
    const rowId = `${patient.id}-${stageName}`;
    const isMenuOpen = activeMenuId === rowId;

    return (
      <Fragment key={rowId}>
        <TableRow 
          className={`border-b border-slate-100 transition-all text-sm text-slate-700 ${rowOpacity} ${bgClass} hover:bg-slate-50/80 cursor-pointer group relative`}
          onClick={(e) => handleRowClick(e, rowId)}
          onContextMenu={(e) => handleRowClick(e, rowId)}
        >
          <TableCell className="font-mono text-xs text-slate-500 font-medium py-4 px-4 align-top w-[100px]">
            <div className="flex items-center gap-2">
              <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-1" />
              {patient.id}
            </div>
          </TableCell>
          <TableCell className="font-bold text-slate-900 py-4 px-4 align-top w-[150px]">{patient.name}</TableCell>
          <TableCell className="font-bold text-center py-4 px-4 align-top w-[80px]">
            <div className="flex items-center justify-center">
               <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-xs text-slate-600 border border-slate-200">{patient.rpmTriageScore}</span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 align-top w-[180px]">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${getConditionColor(patient.rpmCondition)}`}>
              {patient.rpmCondition}
            </span>
          </TableCell>
          <TableCell className="py-4 px-4 align-top w-[180px]">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${patient.rpmTriageScore > 5 ? getConditionColor('Critical') : getConditionColor('Medium Risk')}`}>
              {patient.rpmTriageScore > 5 ? 'Critical' : 'Medium Risk'}
            </span>
          </TableCell>
          <TableCell className="text-[12px] text-slate-600 font-medium py-4 px-4 align-top w-[160px] overflow-hidden">
            <div className="line-clamp-2">{patient.rpmTriageScore >= 7 ? "Due to Vitals (BP 160/100, HR 110)" : patient.rpmTriageScore >= 4 ? "Due to Lab Report (Elevated Creatinine)" : "Consistent Vitals"}</div>
          </TableCell>
          <TableCell className="text-[11px] text-slate-500 italic py-4 px-4 align-top w-[300px] overflow-hidden">
            <div className="flex gap-2 items-start w-full">
              <BrainCircuit size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div 
                className="line-clamp-2 overflow-hidden text-ellipsis whitespace-normal leading-relaxed"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              >
                {patient.rpmTriageScore >= 7 
                   ? `Triage escalated to ${patient.rpmTriageScore} from previous 4 due to sudden hypertensive spike observed in morning vitals.` 
                   : `Triage maintained at ${patient.rpmTriageScore} based on stable lab trends and consistent patient feedback.`}
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 whitespace-nowrap align-top w-[140px]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <Clock size={12} className="text-slate-400" />
              {patient.startedAt ? new Date(patient.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '---'}
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 whitespace-nowrap align-top w-[140px]">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${patient.assignedTo === 'Unassigned' ? 'bg-slate-100 text-slate-400 border border-dotted border-slate-300' : 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'}`}>
                {patient.assignedTo === 'Unassigned' ? '?' : patient.assignedTo.split(' ').map((n:any) => n[0]).join('')}
              </div>
              <span className={`text-[11px] font-semibold ${patient.assignedTo === 'Unassigned' ? 'text-slate-400' : 'text-slate-700'}`}>
                {patient.assignedTo}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 align-top w-[120px] text-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getConditionColor(patient.rpmCondition)} shadow-sm border`}>
              {patient.rpmCondition}
            </span>
            {isMenuOpen && menuPosition && (
              <div 
                ref={menuRef}
                style={{ 
                  position: 'fixed', 
                  left: Math.min(menuPosition.x, typeof window !== 'undefined' ? window.innerWidth - 220 : menuPosition.x), 
                  top: Math.min(menuPosition.y, typeof window !== 'undefined' ? window.innerHeight - 300 : menuPosition.y),
                  zIndex: 9999 
                }}
                className="bg-white border border-slate-200 shadow-2xl rounded-lg py-1.5 min-w-[200px] animate-in fade-in zoom-in duration-200 pointer-events-auto text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => { setSelectedPatientForDetail(patient); setActiveMenuId(null); setMenuPosition(null); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors border-b border-slate-50 mb-1"
                >
                  <Eye size={14} /> View Details
                </button>
                
                {/* Contextual Actions */}
                {stageName === 'backlog' && patient.assignedTo === 'Unassigned' && (
                  <button 
                    onClick={() => { api.pickBacklog(patient.id, currentUser); setActiveMenuId(null); setMenuPosition(null); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-[#0C447C] hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50"
                  >
                    <UserPlus size={14} /> Pick Patient
                  </button>
                )}

                {/* Reassignment Logic */}
                {patient.assignedTo !== 'Unassigned' && patient.assignedTo !== currentUser && (
                  <button 
                    onClick={() => { api.reassignPatient(patient.id, currentUser, currentUser); setActiveMenuId(null); setMenuPosition(null); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50"
                  >
                    <UserPlus size={14} /> Reassign to Me
                  </button>
                )}

                <button 
                  onClick={() => { setReassignPatientId(patient.id); setIsReassignModalOpen(true); setActiveMenuId(null); setMenuPosition(null); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-50"
                >
                  <UserCog size={14} /> Reassign
                </button>

                {isPendingAndMine && stageName === 'active' && (
                  <>
                    <button 
                      onClick={() => { api.completeActive(patient.id); setActiveMenuId(null); setMenuPosition(null); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle size={14} /> Complete Case
                    </button>
                    {role === 'nurse' && patient.rpmCondition === 'Medium Risk' && (
                      <button 
                        onClick={() => { api.referToDoctor(patient.id); setActiveMenuId(null); setMenuPosition(null); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                      >
                        <UserPlus size={14} /> Refer to Doctor
                      </button>
                    )}
                    {role === 'doctor' && (patient.rpmCondition === 'High Risk' || patient.rpmCondition === 'Critical') && (
                      <button 
                        onClick={() => { api.referToEmergency(patient.id); setActiveMenuId(null); setMenuPosition(null); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Activity size={14} /> Refer Emergency
                      </button>
                    )}
                  </>
                )}

                {isPendingAndMine && stageName === 'referral' && (
                  <button 
                    onClick={() => { api.acceptEmergency(patient.id); setActiveMenuId(null); setMenuPosition(null); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle size={14} /> Accept & Treat
                  </button>
                )}
              </div>
            )}
          </TableCell>
          </TableRow>
      </Fragment>
    )
  }

  const displayPatients = api.patients;

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
      {/* Filter Section */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#fcfcfc] border-b border-slate-200 shrink-0">
        <span className="text-sm font-semibold text-slate-500 mr-2">Filter active cases:</span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              activeFilter === f.id
                ? "bg-slate-800 text-white shadow-md transform scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
        {api.isLoading && <span className="ml-4 text-xs text-blue-500 animate-pulse flex items-center gap-1">
          <Activity size={12} /> Syncing live data...
        </span>}
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto w-full">
        <Table className="w-full table-fixed min-w-[1700px] border-collapse">
          <TableHeader className="bg-[#f8fafc] sticky top-0 z-10 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead style={{ width: '100px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">Mr no</TableHead>
              <TableHead style={{ width: '180px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">Name</TableHead>
              <TableHead style={{ width: '80px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4 text-center">triage</TableHead>
              <TableHead style={{ width: '180px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">current condition</TableHead>
              <TableHead style={{ width: '180px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">peak   (condition)</TableHead>
              <TableHead style={{ width: '200px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">reason</TableHead>
              <TableHead style={{ width: '350px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">comment</TableHead>
              <TableHead style={{ width: '160px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">Started At</TableHead>
              <TableHead style={{ width: '160px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4">Assign To</TableHead>
              <TableHead style={{ width: '120px' }} className="text-slate-900 font-bold text-[13px] uppercase tracking-wider py-4 px-4 text-center">Urgency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPatients.flatMap((p: any) => [
              renderRow(p, 'backlog', p.rpmBacklog),
              renderRow(p, 'active', p.rpmActive),
              renderRow(p, 'referral', p.rpmReferral)
            ]).filter(Boolean)}

            {displayPatients.length === 0 && !api.isLoading && (
              <TableRow className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-all text-[13px] text-slate-600">
                <TableCell colSpan={8} className="text-center text-slate-500 py-24">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                      <FileText size={32} className="text-slate-300" />
                    </div>
                    <span className="font-bold text-slate-900 text-lg">No tracking data available.</span>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">Patients will appear here once they are registered and their clinical triage is initialized.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Triage History Modal */}
      <Dialog.Root open={!!selectedPatientForDetail} onOpenChange={(open) => !open && setSelectedPatientForDetail(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100] animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in duration-300">
            {selectedPatientForDetail && (
              <div className="flex flex-col h-[70vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900 leading-none mb-1">
                      {selectedPatientForDetail.name}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-slate-500 font-medium">
                      Patient ID: {selectedPatientForDetail.id}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </Dialog.Close>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-auto p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock size={16} className="text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Triage Progression History</h4>
                  </div>
                  
                  <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-8 py-2">
                    {getDummyHistory(selectedPatientForDetail).map((h, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${i === 0 ? 'bg-blue-500 ring-4 ring-blue-50' : 'bg-slate-300'}`} />
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500 tabular-nums">{h.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getConditionColor(h.condition)}`}>
                              {h.condition} (Score: {h.score})
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8 mt-1">
                            <div className="flex items-start gap-2">
                              <Activity size={14} className="text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reason</p>
                                <p className="text-xs text-slate-700 font-medium">{h.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Clinical Insight</p>
                                <p className="text-xs text-slate-600 italic leading-relaxed">{h.comment}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                   <Dialog.Close className="px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                     Close
                   </Dialog.Close>
                   <button className="px-4 py-2 bg-blue-600 rounded-md text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all">
                     Download Report
                   </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Reassign Modal */}
      <Dialog.Root open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[10000]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[10001] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserCog size={20} />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-slate-900">Reassign Patient</Dialog.Title>
                  <Dialog.Description className="text-xs text-slate-500">
                    Transfer clinical ownership to another staff member.
                  </Dialog.Description>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Select New Assignee</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="" disabled>Choose a nurse or doctor...</option>
                      <optgroup label="Nurses">
                        {(api.staff?.nurses || []).map((s: any) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Doctors">
                        {(api.staff?.doctors || []).map((s: any) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 text-amber-800">
                  <Activity size={16} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>Note:</strong> Reassigning will update the patient's record and add an automatic entry to the audit log.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsReassignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                   if (reassignPatientId && selectedStaff) {
                     await api.reassignPatient(reassignPatientId, selectedStaff, currentUser);
                     setIsReassignModalOpen(false);
                     setSelectedStaff("");
                   }
                }}
                disabled={!selectedStaff}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reassignment
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
