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

export function PatientTable() {
  const { patients, selectedPatientId, setSelectedPatientId } = usePatientStore()

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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30 w-full h-full">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-white sticky top-0 border-b border-slate-200 shadow-sm z-10">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px] px-6 py-4">
                <Checkbox className="border-slate-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600" />
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">EWS Score</TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Initiated By</TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Escalated By</TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Trend</TableHead>
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
                    border-b border-slate-100 transition-all cursor-pointer group
                    ${isSelected 
                        ? "bg-brand-50/80 border-l-4 border-l-blue-600" 
                        : "bg-white hover:bg-slate-50"
                    }
                `}
              >
                <TableCell className="px-6 py-4">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => handleRowClick(patient.id)}
                    className="border-slate-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600"
                  />
                </TableCell>
                <TableCell className="font-semibold text-slate-900">{patient.name} <span className="font-normal text-slate-500">({patient.age}y)</span></TableCell>
                <TableCell className="font-bold text-slate-900">
                   <div className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-md bg-slate-100 text-slate-700">
                     {patient.ewsScore}
                   </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center font-medium text-slate-800">
                        {getStatusIcon(patient.status)}
                        <span className={
                            patient.status === "CRITICAL" ? "text-red-400" :
                            patient.status === "High Risk" ? "text-orange-400" :
                            patient.status === "Medium Risk" ? "text-yellow-400" : "text-emerald-400"
                        }>{patient.status}</span>
                    </div>
                </TableCell>
                <TableCell className="text-slate-600">{patient.initiatedBy || "-"}</TableCell>
                <TableCell className="text-slate-600">
                    {patient.escalatedBy ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            {patient.escalatedBy}
                        </span>
                    ) : "-"}
                </TableCell>
                <TableCell className="font-medium">
                    <div className="flex items-center text-slate-700">
                        {getTrendIcon(patient.trend)}
                        {patient.trend}
                    </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 text-sm text-slate-500">
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
