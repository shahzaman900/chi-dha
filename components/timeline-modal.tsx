"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePatientStore } from "@/store/patient-store"
import { Clock, Calendar as CalendarIcon, Filter } from "lucide-react"

interface TimelineModalProps {
  patientId: string | null
  isOpen: boolean
  onClose: () => void
}

type FilterOption = "all" | "today" | "week" | "month"

export function TimelineModal({ patientId, isOpen, onClose }: TimelineModalProps) {
  const { patients } = usePatientStore()
  const patient = patients.find((p) => p.id === patientId)
  
  const [filter, setFilter] = useState<FilterOption>("all")

  // For this mock data, since the times are strings like "Jan 31, 2026 4:45 AM"
  // or "Day 1 08:00 AM", we will implement a simplified filter logic.
  // In a real application with Date objects, you'd use date-fns or similar.
  const filteredEvents = useMemo(() => {
    if (!patient?.timeline) return []
    
    // As patient.json timeline data contains dates like "Jan 31, 2026...", 
    // we'll filter based on string matching or simple logic.
    return patient.timeline.filter((event: any) => {
      if (filter === "all") return true;
      
      const timeLower = event.time.toLowerCase()
      // Simplified mock filtering for demonstration
      if (filter === "today") {
          return timeLower.includes("today") || timeLower.includes("jan 31"); // Assuming today is Jan 31 in mock
      }
      if (filter === "week") {
          return timeLower.includes("day 1") || timeLower.includes("day 2") || timeLower.includes("day 3") || timeLower.includes("jan"); 
      }
      if (filter === "month") {
          return timeLower.includes("jan") || timeLower.includes("feb");
      }
      
      return true;
    })
  }, [patient, filter])

  if (!patient) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-brand-600 flex items-center gap-2">
              <Clock className="h-5 w-5" /> 
              Timeline of Events
              <span className="text-sm font-normal text-muted-foreground ml-2">
                 - {patient.name}
              </span>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(val) => setFilter(val as FilterOption)}>
                 <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
                   <SelectValue placeholder="Filter by date" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Time</SelectItem>
                   <SelectItem value="today">Today</SelectItem>
                   <SelectItem value="week">This Week</SelectItem>
                   <SelectItem value="month">This Month</SelectItem>
                 </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
           {filteredEvents.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                   <CalendarIcon className="h-12 w-12 opacity-20" />
                   <p>No events found for this time period.</p>
               </div>
           ) : (
               <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8 py-2">
                  {filteredEvents.map((event: any, i: number) => (
                    <div key={i} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-[3px] border-white shadow-sm custom-timeline-node ${
                          event.type === 'critical' || event.type === 'critical-action' ? 'bg-red-500 ring-2 ring-red-100' :
                          event.type === 'system' ? 'bg-brand-500 ring-2 ring-brand-100' :
                          event.type === 'warning' ? 'bg-orange-500 ring-2 ring-orange-100' : 'bg-slate-400 ring-2 ring-slate-100'
                        }`}></div>
                      
                      <div className="flex flex-col gap-1.5 bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="text-brand-600 font-bold text-xs tracking-wide">
                                {event.time}
                            </div>
                            <div className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                {event.type === 'critical' || event.type === 'critical-action' ? 'Critical' : event.type === 'system' ? 'System' : 'Update'}
                            </div>
                        </div>
                        
                        <div className={`text-[14px] leading-relaxed ${event.type === 'critical' || event.type === 'critical-action' ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
                            {event.event}
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
