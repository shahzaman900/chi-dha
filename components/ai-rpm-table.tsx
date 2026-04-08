import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AiRpmTable() {
  return (
    <div className="flex-1 overflow-auto rounded-md border border-slate-200 bg-white">
      <Table>
        <TableHeader className="bg-[#eaf3fd] sticky top-0 z-10 shadow-sm shadow-[#eaf3fd]/50">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Mr No</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Patient Name</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Triage</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Condition</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Peak</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Approvar</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Actor</TableHead>
            <TableHead className="text-slate-800 font-bold text-[13px] whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-all text-[13px] text-slate-600">
            <TableCell colSpan={8} className="text-center text-slate-500 py-8">
              No data available
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
