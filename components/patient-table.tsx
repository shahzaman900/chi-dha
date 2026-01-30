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
  const { patients } = usePatientStore()

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
    if (trend.includes("Escalating")) return <span className="mr-2">↑↑</span>
    if (trend.includes("Rising") || trend.includes("Up")) return <span className="mr-2">↑</span>
    if (trend.includes("Stable")) return <span className="mr-2">→</span>
    return null
  }

  return (
    <div className="flex-1 overflow-auto bg-card text-card-foreground p-0">
      <div className="rounded-md border border-border/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50 border-border/50">
              <TableHead className="w-[40px] px-4">
                <Checkbox />
              </TableHead>
              <TableHead className="font-medium text-muted-foreground w-[200px]">Patient</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[150px]">EWS Score</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[200px]">Status</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[200px]">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/10 border-border/40">
                <TableCell className="px-4 py-3">
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{patient.name} ({patient.age})</TableCell>
                <TableCell className="font-bold">{patient.ewsScore}</TableCell>
                <TableCell>
                    <div className="flex items-center font-medium">
                        {getStatusIcon(patient.status)}
                        {patient.status}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center font-medium">
                        {getTrendIcon(patient.trend)}
                        {patient.trend}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <div className="flex items-center justify-between px-4 py-4 bg-background border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
               <span>Version 1.124</span>
               <span className="font-semibold text-foreground">Make Master Tab</span>
            </div>
            <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    Rows per page: 
                    <select className="bg-transparent border-none outline-none font-medium text-foreground">
                        <option>30</option>
                    </select>
                 </div>
                 <span>1 - 30 of 30</span>
                 <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronLeft className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronRight className="h-4 w-4" /></Button>
                 </div>
            </div>
       </div>
    </div>
  )
}
