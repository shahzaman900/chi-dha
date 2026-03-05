"use client"

import { useState } from "react"
import { usePatientStore, Patient } from "@/store/patient-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PatientRegistrationModal() {
  const { isRegistrationOpen, setIsRegistrationOpen, addPatient } = usePatientStore()
  
  const [formData, setFormData] = useState<Omit<Patient, "id">>({
    name: "",
    age: 30,
    ewsScore: 0,
    status: "Stable",
    trend: "Stable",
    initiatedBy: "System"
  })

  const handleChange = (field: keyof Omit<Patient, "id">, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return
    
    addPatient(formData)
    setFormData({
      name: "",
      age: 30,
      ewsScore: 0,
      status: "Stable",
      trend: "Stable",
      initiatedBy: "System"
    })
    setIsRegistrationOpen(false)
  }

  return (
    <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl">Register New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-slate-700">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="col-span-3 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm"
              placeholder="Full Name"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right text-slate-700">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="150"
              value={formData.age}
              onChange={(e) => handleChange("age", parseInt(e.target.value) || 0)}
              className="col-span-3 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ewsScore" className="text-right text-slate-700">
              EWS Score
            </Label>
            <Input
              id="ewsScore"
              type="number"
              min="0"
              max="20"
              value={formData.ewsScore}
              onChange={(e) => handleChange("ewsScore", parseInt(e.target.value) || 0)}
              className="col-span-3 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right text-slate-700">
              Status
            </Label>
            <Select 
               value={formData.status} 
               onValueChange={(val: string) => handleChange("status", val)}
            >
              <SelectTrigger className="col-span-3 bg-white border-slate-200 shadow-sm focus:ring-blue-500">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md border-slate-200 text-slate-800">
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                <SelectItem value="High Risk">High Risk</SelectItem>
                <SelectItem value="Medium Risk">Medium Risk</SelectItem>
                <SelectItem value="Stable">Stable</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trend" className="text-right text-slate-700">
              Trend
            </Label>
            <Select 
               value={formData.trend} 
               onValueChange={(val: string) => handleChange("trend", val)}
            >
              <SelectTrigger className="col-span-3 bg-white border-slate-200 shadow-sm focus:ring-blue-500">
                <SelectValue placeholder="Select trend" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md border-slate-200 text-slate-800">
                <SelectItem value="Escalating">Escalating</SelectItem>
                <SelectItem value="Rising">Rising</SelectItem>
                <SelectItem value="Stable">Stable</SelectItem>
                <SelectItem value="Improving">Improving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initiatedBy" className="text-right text-slate-700">
              Initiated By
            </Label>
            <Select 
               value={formData.initiatedBy} 
               onValueChange={(val: string) => handleChange("initiatedBy", val)}
            >
              <SelectTrigger className="col-span-3 bg-white border-slate-200 shadow-sm focus:ring-blue-500">
                <SelectValue placeholder="Select initiator" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-md border-slate-200 text-slate-800">
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
                <SelectItem value="Doctor">Doctor</SelectItem>
                <SelectItem value="Patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button 
               type="button" 
               variant="ghost" 
               onClick={() => setIsRegistrationOpen(false)}
               className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Register Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
