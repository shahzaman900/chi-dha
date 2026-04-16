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

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all patient data?")) {
      await api.clearData()
    }
  }

  // Derived stats
  const totalCount = api.patients.length
  // My patients logic: if they have a stage where actor === activeTab
  let myPatientsCount = 0
  let actionNeededCount = 0

  api.patients.forEach(p => {
    let belongsToMe = false
    let needsMyAction = false
    const checkStage = (stageName: string, s: any) => {
      if (!s) return
      if (s.actor === activeTab || s.approval === activeTab) belongsToMe = true
      
      const isApprover = s.approval === activeTab;
      const isActor = s.actor === activeTab;
      const isDone = s.status === 'done';
      
      const canApproveBacklog = !isDone && stageName === 'backlog' && (isApprover || (isActor && activeTab === 'doctor'));
      const isPendingAndMine = !isDone && isActor;
      
      if (canApproveBacklog || isPendingAndMine) needsMyAction = true
    }
    checkStage('backlog', p.rpmBacklog)
    checkStage('active', p.rpmActive)
    checkStage('referral', p.rpmReferral)

    if (belongsToMe) myPatientsCount++
    if (needsMyAction) actionNeededCount++
  })

  // Theme logic
  const activeTabDetails = tabs.find(t => t.id === activeTab)!
  
  return (
    <div className={`flex h-screen flex-col bg-[#fcfcfc] text-foreground`}>
      <div className={`flex flex-col flex-1 overflow-hidden bg-[#fafafa]`}>
        <div className="flex flex-col flex-1 overflow-hidden p-6 pt-4 max-w-[1700px] mx-auto w-full">
          
          <div className="flex-1 overflow-hidden bg-white flex flex-col relative w-full mb-4">
            <AiRpmTable role="nurse" api={api} />
          </div>

        </div>
      </div>
    </div>
  )
}
