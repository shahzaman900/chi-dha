import { useState } from "react"
import { usePatientStore, getAiTriageStatus } from "@/store/patient-store"
import { Search, ChevronDown, Info, ArrowRight, X, ArrowLeft, Send, Paperclip, Check, CheckCheck, Shield, UserCheck, MessageSquare, History, Lock, Unlock, MessageCircle, AlertCircle, Sparkles, User } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function RPMDashboard() {
  const { currentMainTab, currentUser, patients, takeOwnership, handoverToAi, addMessage } = usePatientStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedChatPatientId, setSelectedChatPatientId] = useState<string | null>(null)

  // Ownership Lifecycle State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false)
  const [tempHandoffNote, setTempHandoffNote] = useState("")
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)

  // Get active patient from store
  const activePatient = patients.find(p => p.id === selectedChatPatientId)
  const activeOwner = activePatient?.activeOwner || "AI"

  const [chatInputValue, setChatInputValue] = useState("")

  const handleSendMessage = () => {
    if (!chatInputValue.trim() || !selectedChatPatientId) return
    
    const speaker = currentUser?.role === "Nurse" ? "Care Team" : currentUser?.name || "Staff"
    // If user is a doctor or not the owner, it's always a suggestion
    const isSuggestion = isInternalNote || currentUser?.role === "Doctor" || activeOwner === "AI"
    
    addMessage(selectedChatPatientId, chatInputValue, speaker, isSuggestion)
    setChatInputValue("")
  }

  const handleConfirmOwnership = () => {
    if (!selectedChatPatientId || !responsibilityAccepted) return
    takeOwnership(selectedChatPatientId)
    setIsConfirmModalOpen(false)
    setResponsibilityAccepted(false)
  }

  const handleConfirmHandoff = () => {
    if (!selectedChatPatientId || !tempHandoffNote.trim()) return
    handoverToAi(selectedChatPatientId, tempHandoffNote)
    setIsHandoffModalOpen(false)
    setTempHandoffNote("")
  }

  const chatHistory = [
    { id: 1, sender: "patient", text: "Hello, I am feeling a bit short of breath today.", time: "10:30 AM", status: "read" },
    { id: 2, sender: "staff", text: "I'm sorry to hear that, Arthur. Are you having any chest pain as well?", time: "10:32 AM", status: "read" },
    { id: 3, sender: "patient", text: "Yes, it is a dull ache in the center of my chest.", time: "10:45 AM", status: "delivered" },
  ]

  const selectedPatient = patients.find(p => p.id === selectedChatPatientId)

  const mockRows = [
    {
      mrn: "MRL-0001006",
      name: "Test Test (1)",
      triage: 95,
      triageSource: "Vitals",
      triageTime: "2 days ago",
      ews: 90,
      ewsTime: "2 days ago",
      condition: "CRITICAL",
      conditionSource: "System",
      conditionTime: "2 days ago",
      latestMessage: "I am feeling very dizzy and have chest pain.",
      isNew: true,
      assignment: { from: "Provider (Alice Provider)", to: "System", trend: "down" }
    },
    {
      mrn: "MRL-0001014",
      name: "Eric John (42)",
      triage: 75,
      triageSource: "Vitals",
      triageTime: "2 days ago",
      ews: 90,
      ewsTime: "2 days ago",
      condition: "HIGH RISK",
      conditionSource: "System",
      conditionTime: "2 days ago",
      latestMessage: "My heart is racing and I feel short of breath.",
      isNew: true,
      assignment: { from: "System", to: "AI", trend: "up" }
    },
    {
      mrn: "MRL-0001002",
      name: "Emma Miller (56)",
      triage: 5,
      triageSource: "Vitals",
      triageTime: "2 days ago",
      ews: 10,
      ewsTime: "2 days ago",
      condition: "STABLE",
      conditionSource: "System",
      conditionTime: "2 days ago",
      latestMessage: "I'm doing better today, thanks.",
      assignment: { from: "Provider", to: "Provider (Alice Provider)", trend: "none" }
    },
    {
      mrn: "MRL-0001001",
      name: "Li Chen (56)",
      triage: 5,
      triageSource: "Vitals",
      triageTime: "2 days ago",
      ews: 0,
      ewsTime: "2 days ago",
      condition: "STABLE",
      conditionSource: "System",
      conditionTime: "2 days ago",
      latestMessage: "Checkup complete, no issues.",
      assignment: { from: "System", to: null, trend: "none" }
    },
    {
      mrn: "MRL-0001005",
      name: "Sarah Malik (40)",
      triage: null,
      ews: null,
      condition: null,
      latestMessage: "Waiting for update.",
      assignment: { from: "System", to: null, trend: "none" }
    }
  ]

  const filters = [
    { name: "All", count: 5, active: true },
    { name: "Require Action", count: 0 },
    { name: "AI", count: 1 },
    { name: "Nurse", count: 0 },
    { name: "In Progress", count: 0 },
    { name: "Stable", count: 1 },
  ]
  const waitingPatients = patients.filter(p => p.status === "Nurse Alerted" || p.status === "Urgent Triage")
  const activePatients = patients.filter(p => (p.status === "Nurse Alerted" || p.status === "Urgent Triage") && p.activeOwner === "NURSE")

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-6 pt-4 max-w-[1700px] mx-auto w-full relative">
      {/* Sub-header Breadcrumb/Tab (same as before) */}
      <div className="mb-4 flex items-center gap-3">
        <button 
          className="bg-white border border-[#0f62fe] shadow-sm px-4 py-2 rounded-md text-[13px] font-bold text-[#0f62fe] transition-colors relative"
          onClick={() => setIsSidebarOpen(false)}
        >
          RPM AI Dashboard
        </button>
        <button 
          className="bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-md text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors relative group"
          onClick={() => setIsSidebarOpen(true)}
        >
          General Messages
          <span className="absolute -top-2.5 -right-2 bg-[#d12c1f] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110">
            {waitingPatients.length + (activePatients.some(p => p.isAwaitingAcknowledge) ? 1 : 0)}
          </span>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sliding Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-3">
            {selectedChatPatientId && (
              <button onClick={() => setSelectedChatPatientId(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
            )}
            <h2 className="text-[16px] font-bold text-slate-800">
              {selectedChatPatientId ? "Chat with " + selectedPatient?.name : "General Messages"}
            </h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedChatPatientId ? (
            /* Patient Message List */
            <div className="flex-1 overflow-auto p-4 space-y-6">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                />
              </div>

              {/* Waiting Reply Section */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                  Waiting Reply
                  <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-[10px]">{waitingPatients.length}</span>
                </h3>
                <div className="space-y-1">
                  {waitingPatients.map((p) => (
                    <div 
                      key={p.id} 
                      className="p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white transition-all cursor-pointer group flex items-start gap-3 bg-slate-50/50"
                    >
                      <Avatar className="h-10 w-10 border border-white shadow-sm shrink-0">
                        <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{p.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.triageLastUpdated ? new Date(p.triageLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                        </div>
                        <p className="text-[12px] truncate text-slate-900 font-bold">
                          {p.status}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); takeOwnership(p.id); setSelectedChatPatientId(p.id); }}
                          className="mt-2 text-[11px] font-bold text-white bg-[#0f62fe] px-3 py-1 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                        >
                          Pick up & Reply
                        </button>
                      </div>
                    </div>
                  ))}
                  {waitingPatients.length === 0 && <p className="text-[12px] text-slate-400 text-center py-4 italic">No pending replies</p>}
                </div>
              </div>

              {/* Active Patients Section */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                  Active Patients
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{activePatients.length}</span>
                </h3>
                <div className="space-y-1">
                  {activePatients.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedChatPatientId(p.id)}
                      className="p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all cursor-pointer group flex items-start gap-3"
                    >
                      <Avatar className="h-10 w-10 border border-slate-200 shadow-sm shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{p.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.triageLastUpdated ? new Date(p.triageLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                        </div>
                        <p className={`text-[12px] truncate ${p.isAwaitingAcknowledge ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                          {p.status}
                        </p>
                      </div>
                      {p.isAwaitingAcknowledge && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col h-full bg-white relative">
              {/* Ownership Banner */}
              <div className={`px-4 py-2 flex items-center justify-between border-b transition-colors duration-500 ${
                activeOwner === "AI" 
                  ? "bg-purple-50 border-purple-100" 
                  : "bg-blue-50 border-blue-100"
              }`}>
                <div className="flex items-center gap-2">
                  {activeOwner === "AI" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-purple-700 uppercase tracking-tight">AI Active Owner</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-blue-700 uppercase tracking-tight">Nurse Active Owner</span>
                    </div>
                  )}
                </div>

                {currentUser?.role === "Nurse" && (
                  activeOwner === "AI" ? (
                    <button 
                      onClick={() => setIsConfirmModalOpen(true)}
                      className="text-[11px] font-black text-white bg-purple-600 px-3 py-1 rounded-md hover:bg-purple-700 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Lock className="h-3 w-3" /> Take Control
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsHandoffModalOpen(true)}
                      className="text-[11px] font-black text-blue-700 border border-blue-200 bg-white px-3 py-1 rounded-md hover:bg-blue-50 transition-all flex items-center gap-1.5"
                    >
                      <History className="h-3 w-3" /> Return to AI
                    </button>
                  )
                )}
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-auto p-5 pb-24 space-y-4">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Today</span>
                </div>
                
                {/* Real-time transcript from store */}
                {activePatient?.timeline?.filter(e => e.detailType === "ai-assessment").map((event) => (
                  <div key={event.time} className="space-y-4">
                    {event.details?.transcript?.map((m, idx) => (
                      <div key={idx} className={`flex ${m.speaker === "patient" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[85%] rounded-[20px] px-4 py-2.5 text-[14px] shadow-sm relative group ${
                          m.isSuggestion 
                            ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-br-none" 
                            : m.speaker !== "patient"
                              ? "bg-[#0f62fe] text-white rounded-br-none" 
                              : "bg-slate-100 text-slate-800 rounded-bl-none"
                        }`}>
                          {m.isSuggestion && (
                            <div className="flex items-center gap-1 mb-1 text-[10px] font-black uppercase text-amber-600">
                              <AlertCircle className="h-3 w-3" /> Staff Suggestion
                            </div>
                          )}
                          {m.text}
                          <div className={`flex items-center justify-end gap-1.5 mt-1.5 leading-none`}>
                            <span className={`text-[10px] ${m.speaker !== "patient" && !m.isSuggestion ? "text-blue-100" : "text-slate-400"}`}>
                              {m.isSuggestion ? `By ${m.suggestedBy}` : event.time}
                            </span>
                            {m.speaker !== "patient" && !m.isSuggestion && (
                              <CheckCheck className="h-3 w-3 text-emerald-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Keep mock history if no real transcript exists for demo */}
                {(!activePatient?.timeline || activePatient.timeline.filter(e => e.detailType === "ai-assessment").length === 0) && chatHistory.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-[20px] px-4 py-2.5 text-[14px] shadow-sm relative group ${
                      m.sender === "staff" 
                        ? "bg-[#0f62fe] text-white rounded-br-none" 
                        : "bg-slate-100 text-slate-800 rounded-bl-none"
                    }`}>
                      {m.text}
                      <div className={`flex items-center justify-end gap-1.5 mt-1.5 leading-none`}>
                        <span className={`text-[10px] ${m.sender === "staff" ? "text-blue-100" : "text-slate-400"}`}>{m.time}</span>
                        {m.sender === "staff" && (
                          m.status === "read" ? <CheckCheck className="h-3 w-3 text-emerald-300" /> : <Check className="h-3 w-3 text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input - Fixed at Bottom of Sidebar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
                {/* Input Mode Selector (Nurse only, when owning) */}
                {currentUser?.role === "Nurse" && activeOwner === "NURSE" && (
                  <div className="flex items-center gap-4 mb-3 px-1">
                    <button 
                      onClick={() => setIsInternalNote(false)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${!isInternalNote ? "text-[#0f62fe]" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Reply to Patient
                    </button>
                    <button 
                      onClick={() => setIsInternalNote(true)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${isInternalNote ? "text-amber-600" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <Lock className="h-3.5 w-3.5" /> Internal Suggestion
                    </button>
                  </div>
                )}

                <div className={`flex items-end gap-2 border rounded-2xl p-2.5 transition-all focus-within:ring-4 ${
                  isInternalNote || currentUser?.role === "Doctor" || activeOwner === "AI"
                    ? "bg-amber-50/50 border-amber-200 focus-within:border-amber-300 focus-within:ring-amber-100" 
                    : "bg-[#f8f9fa] border-slate-200 focus-within:border-blue-300 focus-within:ring-blue-100"
                }`}>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <textarea 
                    placeholder={
                      activeOwner === "AI" 
                        ? "Suggest to AI..." 
                        : isInternalNote || currentUser?.role === "Doctor"
                          ? "Write internal suggestion..."
                          : "Type a clinical message..."
                    } 
                    rows={1}
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent py-2 resize-none outline-none text-[14px] max-h-32 min-h-10 text-slate-700 placeholder:text-slate-400"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                      isInternalNote || currentUser?.role === "Doctor" || activeOwner === "AI"
                        ? "bg-amber-600 shadow-amber-500/30 hover:bg-amber-700"
                        : "bg-[#0f62fe] shadow-blue-500/30 hover:bg-blue-700"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                    {activeOwner === "AI" ? "AI Guidance Mode Active" : "Direct Staff-Patient Channel"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ownership Transfer Confirmation Modal */}
        <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
            <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black mb-2 leading-tight">Take Ownership</DialogTitle>
              <DialogDescription className="text-white/80 text-[15px] leading-relaxed">
                You are about to transition this conversation from AI to Manual Nurse control.
              </DialogDescription>
            </div>
            <div className="p-8 bg-white space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Checkbox 
                    id="responsibility" 
                    checked={responsibilityAccepted} 
                    onCheckedChange={(checked) => setResponsibilityAccepted(checked as boolean)}
                    className="mt-1 border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="responsibility"
                      className="text-[14px] font-bold text-slate-800 leading-tight cursor-pointer"
                    >
                      I accept full clinical responsibility
                    </label>
                    <p className="text-[12px] text-slate-500 leading-normal">
                      All messages sent from this point forward will be attributed to the Care Team under my supervision.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  disabled={!responsibilityAccepted}
                  onClick={handleConfirmOwnership}
                  className="w-full bg-[#0f62fe] text-white h-12 rounded-xl font-bold text-[15px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Confirm Ownership Transfer
                </button>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="w-full h-12 rounded-xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Handoff to AI Modal */}
        <Dialog open={isHandoffModalOpen} onOpenChange={setIsHandoffModalOpen}>
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
            <div className="bg-slate-900 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black mb-2 uppercase tracking-tighter">Handover to AI</DialogTitle>
              <DialogDescription className="text-white/60 text-[14px]">
                The AI needs a summary of your interaction to maintain consistency.
              </DialogDescription>
            </div>
            <div className="p-8 bg-white space-y-6">
              <div className="space-y-2">
                <Label htmlFor="handoff-note" className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Handover Note (Mandatory)</Label>
                <Textarea 
                  id="handoff-note"
                  placeholder="e.g., Patient dizzy, vitals checked, stable but needs monitoring..."
                  className="min-h-[120px] rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 text-[14px]"
                  value={tempHandoffNote}
                  onChange={(e) => setTempHandoffNote(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  disabled={!tempHandoffNote.trim()}
                  onClick={handleConfirmHandoff}
                  className="w-full bg-[#0f62fe] text-white h-12 rounded-xl font-bold text-[15px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  Finalize & Handover
                </button>
                <button
                  onClick={() => setIsHandoffModalOpen(false)}
                  className="w-full h-12 rounded-xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Keep Control
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ... (rest of the component: filters, main dashboard card, etc.) */}
      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.name}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 border ${
              f.active 
                ? "bg-[#0f62fe] text-white border-[#0f62fe] shadow-sm" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.name}
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
              f.active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Dashboard Card */}
      <div className="flex-1 bg-[#eff6ff] rounded-[24px] border border-blue-100 shadow-sm flex flex-col overflow-hidden">
        {/* Table Header Area */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-bold text-slate-800">
              Provider Dashboard ({currentUser?.name || "Alice Provider"})
            </h1>
            <Search className="h-4 w-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="text-[13px] text-slate-400 font-medium">5 records</div>
        </div>

        {/* The Table */}
        <div className="flex-1 overflow-auto p-6 pt-4">
          <Table>
            <TableHeader className="border-none">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">MR#</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">Patient Name</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">Triage Score</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">EWS</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">Condition</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">Chat</TableHead>
                <TableHead className="text-slate-800 font-bold text-[13px] h-12 uppercase tracking-wider">Assignment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.slice(0, 5).map((row, idx) => (
                <TableRow key={idx} className="hover:bg-white/40 transition-colors border-none group">
                  <TableCell className="py-6 text-[14px] font-medium text-slate-500">{row.mrn || "MRL-000100" + idx}</TableCell>
                  <TableCell className="py-6 text-[14px] font-bold text-slate-800">{row.name}</TableCell>
                  
                  {/* Triage Score */}
                  <TableCell className="py-6">
                    {row.aiTriageScore !== undefined && row.aiTriageScore !== null ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm ${
                          row.aiTriageScore >= 9 ? "bg-[#d12c1f]" : 
                          row.aiTriageScore >= 7 ? "bg-[#f14d3a]" : "bg-[#0b7840]"
                        }`}>
                          {row.aiTriageScore}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-[#0f62fe] font-bold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                            {row.triageTriggeredBy || "AI"}
                            <Info className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">2 days ago</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[13px] font-bold">—</div>
                    )}
                  </TableCell>

                  {/* EWS */}
                  <TableCell className="py-6">
                    {row.ewsScore !== null ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm ${
                          row.ewsScore >= 7 ? "bg-[#d12c1f]" : "bg-[#0b7840]"
                        }`}>
                          {row.ewsScore}
                        </div>
                        <div className="flex flex-col">
                          <Info className="h-3 w-3 text-slate-300 ml-1" />
                          <span className="text-[11px] text-slate-400 mt-0.5">2 days ago</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[13px] font-bold">—</div>
                    )}
                  </TableCell>

                  {/* Condition */}
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm tracking-wide uppercase ${
                          row.ewsScore >= 7 ? "bg-[#d12c1f] text-white" :
                          row.ewsScore >= 5 ? "bg-[#fff1f0] text-[#f14d3a] border border-[#ffccc7]" :
                          "bg-[#e6f4ea] text-[#0b7840] border border-[#b7e1cd]"
                        }`}>
                          {row.ewsScore >= 7 ? "CRITICAL" : row.ewsScore >= 5 ? "HIGH RISK" : "STABLE"}
                        </div>
                        <div className="flex flex-col items-center mt-1">
                          <div className="text-[11px] font-bold text-[#0f62fe] px-1.5 py-0.5 bg-blue-50 rounded">
                            {row.activeOwner === "AI" ? "AI Management" : "Nurse Managed"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Chat */}
                  <TableCell className="py-6 max-w-[240px]">
                    <div className="flex flex-col gap-1.5">
                      <div className={`text-[13px] line-clamp-2 italic text-slate-600`}>
                        {row.activeOwner === "AI" ? "AI Assistant active..." : "Conversation handled by nurse."}
                      </div>
                    </div>
                  </TableCell>

                  {/* Assignment */}
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      {row.activeOwner === "NURSE" ? (
                        <div className="flex items-center bg-white/60 p-1 pr-3 rounded-full border border-blue-50 shadow-sm">
                          <div className="bg-blue-100 text-[#0f62fe] px-3 py-1.5 rounded-full text-[12px] font-bold mr-2 whitespace-nowrap">
                            AI
                          </div>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <div className="bg-[#eef4ff] text-[#0f62fe] px-3 py-1.5 rounded-full text-[12px] font-bold ml-2 whitespace-nowrap">
                            Nurse
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#eef4ff] text-[#0f62fe] px-6 py-2 rounded-full text-[12px] font-bold shadow-sm">
                          AI
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          setSelectedChatPatientId(row.id);
                          setIsSidebarOpen(true);
                        }}
                        className="ml-auto bg-white border border-slate-200 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-[#0f62fe]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 flex items-center justify-end gap-6 text-[13px] text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          Items per page: 
          <div className="bg-white border border-slate-200 px-2 py-1 rounded flex items-center gap-2 cursor-pointer">
            20 <ChevronDown className="h-3 w-3" />
          </div>
        </div>
        <div>1 - 5 of 5</div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400">{"<"}</button>
          <button className="p-1 hover:bg-slate-100 rounded text-slate-400">{">"}</button>
        </div>
      </div>
    </div>
  )
}

// Helper icons
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
