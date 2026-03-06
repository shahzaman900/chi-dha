import Link from "next/link"
import { Bell, Calendar, ChevronDown, PlusSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePatientStore } from "@/store/patient-store"

export function SiteHeader() {
  const { currentMainTab, setCurrentMainTab } = usePatientStore()

  const navLinks = [
    { name: "Dashboard", href: "#" },
    { name: "Patient Dashboard", href: "#" },
    { name: "Appointments", href: "#" },
    { name: "Availability", href: "#" },
    { name: "EWS", id: "ews", href: "#" },
    { name: "Merge Patients", href: "#" },
    { name: "Encounters", id: "encounters", href: "#" },
    { name: "Services", href: "#" },
    { name: "SOAP Note A...", href: "#" },
  ]

  return (
    <div className="flex flex-col bg-white border-b border-slate-200 z-10 relative px-6 py-2">
      <div className="flex items-center justify-between">
        
        {/* Left side: Logo & Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="text-teal-500 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 5 6 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 6 12 2 12 2Z" fill="#14B8A6"/>
              <path d="M12 22C12 22 7 18 7 14C7 11.2386 9.23858 9 12 9C14.7614 9 17 11.2386 17 14C17 18 12 22 12 22Z" fill="#0D9488"/>
              <path d="M2.5 15C2.5 15 5 13 8 15C8 15 6 18 2.5 15Z" fill="#2DD4BF"/>
              <path d="M21.5 15C21.5 15 19 13 16 15C16 15 18 18 21.5 15Z" fill="#2DD4BF"/>
            </svg>
          </div>

          {/* Navigation */}
          <div className="relative">
            <nav className="flex items-center gap-1 text-[13px] font-semibold text-slate-700">
              {navLinks.map((link) => {
                const isActive = link.id === currentMainTab
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      if (link.id) {
                        e.preventDefault()
                        setCurrentMainTab(link.id as "ews" | "encounters")
                      }
                    }}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-2 border-[#0f62fe] text-slate-800 bg-white" 
                        : "hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>
            {/* The grey indicator bar below the first few items */}
            <div className="absolute -bottom-3 left-0 w-[420px] h-2 bg-slate-300 rounded-full"></div>
            <div className="absolute -bottom-3 left-0 w-full h-2 bg-slate-100/80 rounded-full -z-10 mt-[1px]"></div>
          </div>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center gap-4">
          <button className="text-slate-800 hover:text-slate-900 transition-colors">
            <Bell className="h-5 w-5 fill-slate-800" />
          </button>
          
          <Button variant="secondary" className="bg-[#eef6fc] hover:bg-[#e0eff9] text-slate-800 border border-slate-200 h-9 px-3 rounded-md flex items-center gap-2 text-sm font-semibold">
            <div className="flex items-center gap-1 text-[#0f62fe]">
              <PlusSquare className="h-4 w-4 bg-blue-100 rounded text-[#0f62fe] border-blue-200 border" />
              <ChevronDown className="h-3 w-3" />
            </div>
            Central Clinic
          </Button>
          
          <Button className="bg-[#0f62fe] hover:bg-blue-700 text-white border-none h-9 px-4 rounded-md flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Today
          </Button>
          
          <Avatar className="h-9 w-9 ring-2 ring-white cursor-pointer hover:bg-slate-100">
            <AvatarFallback className="bg-slate-100 text-slate-600">
              <User className="h-5 w-5 fill-slate-800 text-slate-800" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
