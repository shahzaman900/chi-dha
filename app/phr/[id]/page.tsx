import type { Metadata } from "next"
import { PhrClientDashboard } from "@/components/phr-client-dashboard"
import phrData from "@/data/phr-data.json"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const patient = (phrData as any[]).find((p) => p.patientId === id)
  
  if (!patient) {
    return { title: "Patient Not Found" }
  }
  
  return {
    title: patient.profile.name,
    description: `Clinical health record and early warning assessment for ${patient.profile.name}.`,
  }
}

export default async function PhrDashboardPage({ params }: Props) {
  const { id } = await params
  
  return <PhrClientDashboard id={id} />
}
