import { useState } from "react"
import { usePatientStore, getAiTriageStatus } from "@/store/patient-store"
import { Search, ChevronDown, Info, ArrowRight, X, ArrowLeft, Send, Paperclip, Check, CheckCheck } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RPMDashboard() {
  const { currentMainTab, currentUser, patients } = usePatientStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedChatPatientId, setSelectedChatPatientId] = useState<string | null>(null)

  // State for message patients
  const [messagePatients, setMessagePatients] = useState([
    { id: "demo-act-1", name: "Arthur Morgan", lastMsg: "I am feeling very dizzy and have chest pain.", time: "10:45 AM", unread: 1, status: "waiting" },
    { id: "demo-act-2", name: "Sadie Adler", lastMsg: "When will the doctor see me?", time: "11:02 AM", unread: 0, status: "active" },
    { id: "demo-ai-1", name: "Marcus Aurelius", lastMsg: "The medication is making me sleepy.", time: "9:30 AM", unread: 0, status: "active" },
  ])

  const [chatInputValue, setChatInputValue] = useState("")

  const handlePickUp = (patientId: string) => {
    setMessagePatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: 'active', unread: 0 } : p
    ))
    setSelectedChatPatientId(patientId)
  }

  const handleSendMessage = () => {
    if (!chatInputValue.trim() || !selectedChatPatientId) return
    
    // Transition to active if sending a message to a waiting patient
    setMessagePatients(prev => prev.map(p => 
      p.id === selectedChatPatientId ? { ...p, status: 'active', unread: 0, lastMsg: chatInputValue, time: "Just now" } : p
    ))
    
    setChatInputValue("")
  }

  const chatHistory = [
    { id: 1, sender: "patient", text: "Hello, I am feeling a bit short of breath today.", time: "10:30 AM", status: "read" },
    { id: 2, sender: "staff", text: "I'm sorry to hear that, Arthur. Are you having any chest pain as well?", time: "10:32 AM", status: "read" },
    { id: 3, sender: "patient", text: "Yes, it is a dull ache in the center of my chest.", time: "10:45 AM", status: "delivered" },
  ]

  const selectedPatient = messagePatients.find(p => p.id === selectedChatPatientId)

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
  const waitingPatients = messagePatients.filter(p => p.status === "waiting")
  const activePatients = messagePatients.filter(p => p.status === "active")

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
            {waitingPatients.length + (activePatients.some(p => p.unread > 0) ? 1 : 0)}
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
                        <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.time}</span>
                        </div>
                        <p className="text-[12px] truncate text-slate-900 font-bold">
                          {p.lastMsg}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePickUp(p.id); }}
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
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[14px] text-slate-800 truncate">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.time}</span>
                        </div>
                        <p className={`text-[12px] truncate ${p.unread ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                          {p.lastMsg}
                        </p>
                      </div>
                      {p.unread > 0 && (
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
              {/* Chat Thread */}
              <div className="flex-1 overflow-auto p-5 pb-24 space-y-4">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Today</span>
                </div>
                {chatHistory.map((m) => (
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
                <div className="flex items-end gap-2 bg-[#f8f9fa] border border-slate-200 rounded-2xl p-2.5 transition-all focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <textarea 
                    placeholder="Type a clinical message..." 
                    rows={1}
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent py-2 resize-none outline-none text-[14px] max-h-32 min-h-10 text-slate-700"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="bg-[#0f62fe] h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-medium">HIPAA Encrypted Channel</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
              {mockRows.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-white/40 transition-colors border-none group">
                  <TableCell className="py-6 text-[14px] font-medium text-slate-500">{row.mrn}</TableCell>
                  <TableCell className="py-6 text-[14px] font-bold text-slate-800">{row.name}</TableCell>
                  
                  {/* Triage Score */}
                  <TableCell className="py-6">
                    {row.triage !== null ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm ${
                          row.triage >= 90 ? "bg-[#d12c1f]" : 
                          row.triage >= 70 ? "bg-[#f14d3a]" : "bg-[#0b7840]"
                        }`}>
                          {row.triage}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-[#0f62fe] font-bold text-[11px] bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                            {row.triageSource}
                            <Info className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">{row.triageTime}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[13px] font-bold">—</div>
                    )}
                  </TableCell>

                  {/* EWS */}
                  <TableCell className="py-6">
                    {row.ews !== null ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shadow-sm ${
                          row.ews >= 90 ? "bg-[#d12c1f]" : "bg-[#0b7840]"
                        }`}>
                          {row.ews}
                        </div>
                        <div className="flex flex-col">
                          <Info className="h-3 w-3 text-slate-300 ml-1" />
                          <span className="text-[11px] text-slate-400 mt-0.5">{row.ewsTime}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-[13px] font-bold">—</div>
                    )}
                  </TableCell>

                  {/* Condition */}
                  <TableCell className="py-6">
                    {row.condition ? (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold shadow-sm tracking-wide ${
                            row.condition === "CRITICAL" ? "bg-[#d12c1f] text-white" :
                            row.condition === "HIGH RISK" ? "bg-[#fff1f0] text-[#f14d3a] border border-[#ffccc7]" :
                            "bg-[#e6f4ea] text-[#0b7840] border border-[#b7e1cd]"
                          }`}>
                            {row.condition}
                          </div>
                          <div className="flex flex-col items-center mt-1">
                            <div className="text-[11px] font-bold text-[#0f62fe] px-1.5 py-0.5 bg-blue-50 rounded">
                              {row.conditionSource}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5">{row.conditionTime}</span>
                          </div>
                        </div>
                        <Info className="h-3 w-3 text-slate-300" />
                      </div>
                    ) : (
                      <span className="text-slate-400 px-4">—</span>
                    )}
                  </TableCell>

                  {/* Chat */}
                  <TableCell className="py-6 max-w-[240px]">
                    <div className="flex flex-col gap-1.5">
                      {row.isNew && (
                        <span className="bg-[#00a2ff] text-white text-[9px] font-black px-1.5 py-0.5 rounded w-fit uppercase tracking-tighter shadow-sm">
                          NEW
                        </span>
                      )}
                      <div className={`text-[13px] line-clamp-2 italic ${row.isNew ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                        "{row.latestMessage}"
                      </div>
                    </div>
                  </TableCell>

                  {/* Assignment */}
                  <TableCell className="py-6">
                    <div className="flex items-center gap-4">
                      {row.assignment.to ? (
                        <div className="flex items-center bg-white/60 p-1 pr-3 rounded-full border border-blue-50 shadow-sm">
                          <div className="bg-blue-100 text-[#0f62fe] px-3 py-1.5 rounded-full text-[12px] font-bold mr-2 whitespace-nowrap">
                            {row.assignment.from}
                          </div>
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          <div className="bg-[#eef4ff] text-[#0f62fe] px-3 py-1.5 rounded-full text-[12px] font-bold ml-2 whitespace-nowrap">
                            {row.assignment.to}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#eef4ff] text-[#0f62fe] px-6 py-2 rounded-full text-[12px] font-bold shadow-sm">
                          {row.assignment.from}
                        </div>
                      )}
                      
                      {row.assignment.trend === "up" ? (
                        <span className="text-red-500 font-bold ml-2">↑</span>
                      ) : row.assignment.trend === "down" ? (
                        <span className="text-green-500 font-bold ml-2">↓</span>
                      ) : null}
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
