import { Plus, RotateCw, Archive } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PracticeHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/20 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
           <Archive className="h-6 w-6" /> Practice
        </h1>
        <div className="w-[300px]">
          <Input placeholder="Search" className="h-9 bg-background/50" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" className="h-9 w-9 bg-blue-500 hover:bg-blue-600">
          <Plus className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="secondary" className="h-9 w-9 bg-blue-500 hover:bg-blue-600 text-white">
           <RotateCw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
