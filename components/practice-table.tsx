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
import { usePracticeStore } from "@/store/practice-store"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function PracticeTable() {
  const { practices, selectedIds, toggleSelection, selectAll, deselectAll } = usePracticeStore()

  const allSelected = practices.length > 0 && selectedIds.length === practices.length
  
  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          selectAll()
      } else {
          deselectAll()
      }
  }

  return (
    <div className="flex-1 overflow-auto bg-card text-card-foreground p-0">
      <div className="rounded-md border border-border/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50 border-border/50">
              <TableHead className="w-[40px] px-4">
                <Checkbox 
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="font-medium text-muted-foreground w-[200px]">Name</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[250px]">Email</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[150px]">Mobile</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[100px]">Fax</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[100px]">City</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[150px]">Registration Date</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[100px]">PTAN</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[250px]">Address</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[150px]">Practice POC</TableHead>
              <TableHead className="font-medium text-muted-foreground w-[100px]">CHI POC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practices.map((practice) => (
              <TableRow key={practice.id} className="hover:bg-muted/10 border-border/40 data-[state=selected]:bg-muted/20" data-state={selectedIds.includes(practice.id) ? "selected" : ""}>
                <TableCell className="px-4 py-3">
                  <Checkbox 
                    checked={selectedIds.includes(practice.id)}
                    onCheckedChange={() => toggleSelection(practice.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{practice.name}</TableCell>
                <TableCell>{practice.email}</TableCell>
                <TableCell>{practice.mobile}</TableCell>
                <TableCell>{practice.fax}</TableCell>
                <TableCell>{practice.city}</TableCell>
                <TableCell>{practice.registrationDate}</TableCell>
                <TableCell>{practice.ptan}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={practice.address}>
                    {practice.address}
                </TableCell>
                <TableCell>{practice.practicePoc}</TableCell>
                <TableCell>{practice.chiPoc}</TableCell>
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
