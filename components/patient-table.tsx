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
import { ChevronLeft, ChevronRight, Siren, AlertTriangle, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhrDisplay } from "@/components/phr-display"

export function PatientTable() {
  const { patients, selectedPatientId, setSelectedPatientId, isPhrOpen, setIsPhrOpen } = usePatientStore()

  const handleRowClick = (id: string) => {
    setSelectedPatientId(id === selectedPatientId ? null : id)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return <Siren className="h-4 w-4 text-red-500 mr-2" />
      case "High Risk":
      case "Medium Risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
      case "Stable":
      case "Healthy":
        return <Check className="h-4 w-4 text-green-500 mr-2" />
      default:
        return null
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend.includes("Escalating")) return <span className="mr-2 text-red-400">↑↑</span>
    if (trend.includes("Rising") || trend.includes("Up")) return <span className="mr-2 text-orange-400">↑</span>
    if (trend.includes("Stable")) return <span className="mr-2 text-slate-500">→</span>
    return null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-100 w-full h-full">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-800 sticky top-0">
            <TableRow className="border-slate-700 hover:bg-slate-800">
              <TableHead className="w-[50px] px-4 py-3">
                <Checkbox className="border-slate-600" />
              </TableHead>
              <TableHead className="text-slate-400 font-medium">Patient</TableHead>
              <TableHead className="text-slate-400 font-medium">EWS Score</TableHead>
              <TableHead className="text-slate-400 font-medium">Status</TableHead>
              <TableHead className="text-slate-400 font-medium">Initiated By</TableHead>
              <TableHead className="text-slate-400 font-medium">Escalated By</TableHead>
              <TableHead className="text-slate-400 font-medium">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient: any, index: number) => {
              const isSelected = selectedPatientId === patient.id;
              
              return (
              <TableRow 
                key={patient.id} 
                onClick={() => handleRowClick(patient.id)}
                className={`
                    border-slate-800 transition-colors cursor-pointer
                    ${isSelected 
                        ? "bg-blue-600/30 border-l-4 border-l-blue-500 hover:bg-blue-600/40" 
                        : index % 2 === 1 ? "bg-slate-850/30" : "bg-slate-900"
                    }
                    ${!isSelected && "hover:bg-slate-800"}
                `}
              >
                <TableCell className="px-4 py-3">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => handleRowClick(patient.id)}
                    className="border-slate-600"
                  />
                </TableCell>
                <TableCell className="font-medium text-slate-100">{patient.name} ({patient.age})</TableCell>
                <TableCell className="font-bold text-slate-100">{patient.ewsScore}</TableCell>
                <TableCell>
                    <div className="flex items-center font-medium text-slate-200">
                        {getStatusIcon(patient.status)}
                        <span className={
                            patient.status === "CRITICAL" ? "text-red-400" :
                            patient.status === "High Risk" ? "text-orange-400" :
                            patient.status === "Medium Risk" ? "text-yellow-400" : "text-emerald-400"
                        }>{patient.status}</span>
                    </div>
                </TableCell>
                <TableCell className="text-slate-300">{patient.initiatedBy || "-"}</TableCell>
                <TableCell className="text-slate-300">
                    {patient.escalatedBy ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/40 text-red-200 border border-red-800/50">
                            {patient.escalatedBy}
                        </span>
                    ) : "-"}
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center text-slate-300">
                        {getTrendIcon(patient.trend)}
                        {patient.trend}
                    </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        <div className="flex items-center gap-3">
           <span>Version 1.124</span>
           <span className="text-slate-600">•</span>
           <span className="font-medium text-slate-300">Make Master Tab</span>
        </div>
        <div className="flex items-center gap-4">
             <span>Rows per page: 30</span>
             <span>1 - 30 of 30</span>
             <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-700">
                   <ChevronLeft className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-100 hover:bg-slate-700">
                   <ChevronRight className="h-4 w-4" />
                 </Button>
             </div>
        </div>
      </div>
       
      {/* PHR Modal */}
      <Dialog open={isPhrOpen} onOpenChange={setIsPhrOpen}>
        <DialogContent showCloseButton={false} className="w-[95vw] max-w-[95vw] h-[85vh] bg-slate-900 border-slate-700 p-0 overflow-hidden rounded-xl">
          <DialogHeader className="hidden">
            <DialogTitle>PHR Dashboard</DialogTitle>
          </DialogHeader>
          {selectedPatientId && <PhrDisplay patientId={selectedPatientId} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
