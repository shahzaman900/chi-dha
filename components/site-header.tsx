import Link from "next/link"
import { Bell, LayoutGrid, MessageSquare, Command, Users, FileText, Settings, Activity } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  return (
    <div className="flex flex-col bg-white border-b border-slate-200 shadow-sm z-10 relative">
      {/* Top Bar */}
      <div className="flex h-12 items-center px-4 border-b border-slate-100 justify-between">
         <div className="flex items-center gap-2 font-bold text-lg text-slate-800 tracking-tight">
            <span className="text-xl text-blue-600">◻</span>
            <span>EWS App</span>
         </div>
         <div className="flex items-center gap-4 text-slate-600 text-sm">
             <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">92 Alerts</span>
             <Users className="h-4 w-4 hover:text-blue-600 transition-colors cursor-pointer" />
             <Bell className="h-4 w-4 hover:text-blue-600 transition-colors cursor-pointer" />
             <MessageSquare className="h-4 w-4 hover:text-blue-600 transition-colors cursor-pointer" />
             <Avatar className="h-8 w-8 ring-2 ring-slate-100">
               <AvatarImage src="/avatar.png" alt="@user" />
               <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">SK</AvatarFallback>
             </Avatar>
         </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex h-12 items-center px-4 gap-1 text-sm overflow-x-auto bg-slate-50/50">
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-medium transition-colors">
          <LayoutGrid className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <Command className="h-4 w-4" /> Command Center
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <MessageSquare className="h-4 w-4" /> Messages
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <Users className="h-4 w-4" /> Users
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <LayoutGrid className="h-4 w-4" /> Dashboards
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <FileText className="h-4 w-4" /> Reports
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          <Activity className="h-4 w-4" /> Escalations
        </Link>
      </div>
    </div>
  )
}
