"use client"

import { useState, useEffect } from "react"
import { AiRpmTable } from "@/components/ai-rpm-table"
import { useAiRpm } from "@/store/ai-rpm-api"

export default function AiRpmPage() {
  const [activeTab, setActiveTab] = useState<"nurse" | "doctor" | "emergency">("nurse")
  const api = useAiRpm()

  // Form states
  const [newPatientName, setNewPatientName] = useState("")
  const [newPatientScore, setNewPatientScore] = useState(0)

  const [retriageId, setRetriageId] = useState("")
  const [retriageScore, setRetriageScore] = useState(0)

  useEffect(() => {
    api.fetchPatients()
    api.fetchLogs()
  }, [])

  const tabs = [
    { id: "nurse", label: "Nurse", bg: "bg-[#E2EFDA]", text: "text-[#375623]" },
    { id: "doctor", label: "Doctor", bg: "bg-[#DDEEFF]", text: "text-[#0C447C]" },
    { id: "emergency", label: "Emergency", bg: "bg-[#FCE4EC]", text: "text-[#7B0026]" },
  ] as const

  const getConditionColor = (c: string) => {
    switch (c) {
      case "Low Risk": return "bg-[#E2EFDA] text-[#375623]"
      case "Medium Risk": return "bg-[#FFF2CC] text-[#7F6000]"
      case "High Risk": return "bg-[#FCE4D6] text-[#712B13]"
      case "Critical": return "bg-[#FCE4EC] text-[#7B0026]"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatientName) return
    await api.createPatient(newPatientName, newPatientScore)
    setNewPatientName("")
    setNewPatientScore(0)
  }

  const handleRetriage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retriageId) return
    await api.retriage(retriageId, retriageScore)
    setRetriageId("")
    setRetriageScore(0)
  }

  // Derived stats
  const totalCount = api.patients.length
  // My patients logic: if they have a stage where actor === activeTab
  let myPatientsCount = 0
  let actionNeededCount = 0

  api.patients.forEach(p => {
    let belongsToMe = false
    let needsMyAction = false
    const checkStage = (s: any) => {
      if (!s) return
      if (s.actor === activeTab) belongsToMe = true
      if (s.actor === activeTab && s.status === 'pending') needsMyAction = true
    }
    checkStage(p.rpmBacklog)
    checkStage(p.rpmActive)
    checkStage(p.rpmReferral)

    if (belongsToMe) myPatientsCount++
    if (needsMyAction) actionNeededCount++
  })

  // Theme logic
  const activeTabDetails = tabs.find(t => t.id === activeTab)!
  
  return (
    <div className={`flex h-screen flex-col bg-[#fcfcfc] text-foreground`}>
      <div className={`flex flex-col flex-1 overflow-hidden bg-[#fafafa]`}>
        <div className="flex flex-col flex-1 overflow-hidden p-6 pt-4 max-w-[1700px] mx-auto w-full">
          
          {/* Header Stats */}
          <div className={`flex items-center gap-6 p-4 rounded-md mb-6 ${activeTabDetails.bg} ${activeTabDetails.text}`}>
            <h1 className="text-xl font-bold flex-1">RPM Dashboard - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h1>
            <div className="flex gap-4 font-semibold text-sm">
              <span className="bg-white/50 px-3 py-1 rounded">Total: {totalCount}</span>
              <span className="bg-white/50 px-3 py-1 rounded">My Cases: {myPatientsCount}</span>
              <span className="bg-white/50 px-3 py-1 rounded">Action Needed: {actionNeededCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-4">
            <div className="h-10 flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <form onSubmit={handleAddPatient} className="bg-white p-4 rounded border flex flex-col gap-2 shadow-sm">
               <h3 className="font-bold text-sm">Add New Patient</h3>
               <div className="flex gap-2">
                 <input className="border px-2 py-1 flex-1 text-sm rounded" placeholder="Patient Name" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} />
                 <input className="border w-24 px-2 py-1 text-sm rounded" type="number" min="1" max="10" placeholder="Score 1-10" value={newPatientScore || ''} onChange={e => setNewPatientScore(parseInt(e.target.value))} />
                 <button className="bg-slate-800 text-white px-3 py-1 rounded text-sm shrink-0 hover:bg-slate-700">Add Patient</button>
               </div>
            </form>

            <form onSubmit={handleRetriage} className="bg-white p-4 rounded border flex flex-col gap-2 shadow-sm">
               <h3 className="font-bold text-sm">Retriage Mid-flow</h3>
               <div className="flex gap-2">
                 <input className="border px-2 py-1 flex-1 text-sm rounded uppercase" placeholder="Patient ID (ex: P-001)" value={retriageId} onChange={e => setRetriageId(e.target.value)} />
                 <input className="border w-24 px-2 py-1 text-sm rounded" type="number" min="1" max="10" placeholder="Score 1-10" value={retriageScore || ''} onChange={e => setRetriageScore(parseInt(e.target.value))} />
                 <button className="bg-amber-600 text-white px-3 py-1 rounded text-sm shrink-0 hover:bg-amber-700">Retriage</button>
               </div>
            </form>
          </div>

          <div className="flex-1 overflow-hidden bg-white flex flex-col relative w-full mb-4">
            <AiRpmTable role={activeTab} api={api} />
          </div>

          {/* Activity Log */}
          <div className="h-32 bg-slate-50 border rounded p-4 overflow-y-auto shadow-inner text-sm space-y-1">
             <h4 className="font-bold border-b pb-1 mb-2">System Activity Log</h4>
             {api.logs.map((log: any) => (
                <div key={log.id} className="flex gap-4">
                  <span className="text-slate-400 w-20 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`w-16 shrink-0 font-bold ${log.role === 'nurse' ? 'text-[#375623]' : log.role === 'doctor' ? 'text-[#0C447C]' : 'text-[#7B0026]'}`}>[{log.role.toUpperCase()}]</span>
                  <span className="text-slate-700">{log.message}</span>
                </div>
             ))}
             {api.logs.length === 0 && <div className="text-slate-400">No recent activity</div>}
          </div>

        </div>
      </div>
    </div>
  )
}
