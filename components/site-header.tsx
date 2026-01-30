import Link from "next/link"
import { Bell, LayoutGrid, MessageSquare, Command, Users, FileText, Settings, Activity } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  return (
    <div className="flex flex-col bg-slate-950 border-b border-slate-800">
      {/* Top Bar */}
      <div className="flex h-12 items-center px-4 border-b border-slate-800 justify-between">
         <div className="flex items-center gap-2 font-bold text-lg text-slate-100">
            <span className="text-xl">◻</span>
         </div>
         <div className="flex items-center gap-3 text-slate-400 text-sm">
             <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">92</span>
             <Users className="h-4 w-4 hover:text-slate-200 cursor-pointer" />
             <Bell className="h-4 w-4 hover:text-slate-200 cursor-pointer" />
             <MessageSquare className="h-4 w-4 hover:text-slate-200 cursor-pointer" />
             <Avatar className="h-7 w-7">
               <AvatarImage src="/avatar.png" alt="@user" />
               <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">SK</AvatarFallback>
             </Avatar>
         </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex h-11 items-center px-4 gap-1 text-sm overflow-x-auto bg-slate-900">
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <LayoutGrid className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Command className="h-4 w-4" /> Command Center
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <MessageSquare className="h-4 w-4" /> Messages
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Users className="h-4 w-4" /> Users
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <LayoutGrid className="h-4 w-4" /> Dashboards
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <FileText className="h-4 w-4" /> Reports
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors">
          <Activity className="h-4 w-4" /> Escalations
        </Link>
      </div>
    </div>
  )
}
