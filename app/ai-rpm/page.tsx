import { SiteHeader } from "@/components/site-header"
import { RPMDashboard } from "@/components/rpm-dashboard"

export default function AiRpmPage() {
  return (
    <div className="flex h-screen flex-col bg-[#fcfcfc] text-foreground">
      <SiteHeader />
      <div className="flex flex-col flex-1 overflow-hidden bg-[#fafafa]">
        <div className="flex flex-col flex-1 overflow-hidden p-6 pt-8 max-w-[1700px] mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              AI RPM
            </h1>
          </div>
          <div className="flex-1 overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col relative w-full">
            <RPMDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
