import Link from "next/link"
import { Bell, LayoutGrid, MessageSquare, Search, Command, Users, FileText, Settings, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  return (
    <div className="flex flex-col border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="flex h-12 items-center px-4 border-b border-border/20 justify-between">
         <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-xl">◻</span> {/* Logo placeholder */}
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center justify-center">92</span>
                <Users className="h-4 w-4" />
                <Bell className="h-4 w-4" />
                <MessageSquare className="h-4 w-4" />
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatar.png" alt="@user" />
                  <AvatarFallback>SK</AvatarFallback>
                </Avatar>
            </div>
         </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex h-12 items-center px-4 gap-6 text-sm overflow-x-auto">
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <LayoutGrid className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <Command className="h-4 w-4" /> Command Center
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <MessageSquare className="h-4 w-4" /> Messages
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <Users className="h-4 w-4" /> Users
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <LayoutGrid className="h-4 w-4" /> Dashboards
        </Link>
         <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <FileText className="h-4 w-4" /> Reports
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link href="#" className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground">
          <Activity className="h-4 w-4" /> Escalations
        </Link>
      </div>
    </div>
  )
}
