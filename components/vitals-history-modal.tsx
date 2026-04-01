"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from "recharts";
import { Heart, Activity, Wind, Droplets, X } from "lucide-react";
import { useVitalsHistory } from "@/hooks/use-patients";
import { Patient } from "@/store/patient-store";

interface VitalsHistoryModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChartCard = ({ 
  title, 
  icon: Icon, 
  color, 
  data, 
  dataKey, 
  dataKey2,
  unit, 
  latestValue 
}: any) => {
  // Use a lookup table for Tailwind 4 dynamic classes
  const colorMap: any = {
    red: { bg: "bg-red-50", text: "text-red-500", stroke: "#ef4444" },
    orange: { bg: "bg-orange-50", text: "text-orange-500", stroke: "#f97316" },
    blue: { bg: "bg-blue-50", text: "text-blue-500", stroke: "#3b82f6" },
    purple: { bg: "bg-purple-50", text: "text-purple-500", stroke: "#8b5cf6" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${theme.bg}`}>
            <Icon className={`w-5 h-5 ${theme.text}`} />
          </div>
          <h3 className="font-semibold text-slate-700">{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Latest</span>
          <span className="text-lg font-bold text-slate-700">{latestValue} <span className="text-xs font-normal text-slate-400 italic">{unit}</span></span>
        </div>
      </div>
      
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.stroke} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={theme.stroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="timestamp" 
              hide={true} 
            />
            <YAxis 
              hide={false} 
              domain={['auto', 'auto']} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: '600' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: any) => [`${value} ${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={theme.stroke} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            {dataKey2 && (
              <Area 
                type="monotone" 
                dataKey={dataKey2} 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={0} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2 px-2">
        <span className="text-[10px] text-slate-400 font-medium">24h ago</span>
        <span className="text-[10px] text-slate-400 font-medium">Now</span>
      </div>
    </div>
  );
};

export function VitalsHistoryModal({ patient, isOpen, onClose }: VitalsHistoryModalProps) {
  const { data: history, isLoading, error } = useVitalsHistory(patient?.id || "", isOpen);

  console.log("VitalsHistoryModal - Patient:", patient?.id, patient?.name);
  console.log("VitalsHistoryModal - Loading:", isLoading);
  console.log("VitalsHistoryModal - History:", history);
  if (error) console.error("VitalsHistoryModal - Error:", error);

  if (!patient) return null;

  const latest = history?.[history.length - 1] || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#fafafa] border-none shadow-2xl rounded-2xl">
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-800">Vitals History</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              {patient.name} — <span className="font-medium text-slate-700">Trend over last 50 readings</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 grayscale opacity-50">
              <Activity className="animate-pulse w-12 h-12 text-blue-500" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard 
                title="Heart Rate" 
                icon={Heart} 
                color="red" 
                data={history} 
                dataKey="heartRate"
                unit="bpm"
                latestValue={latest.heartRate || "--"}
              />
              <ChartCard 
                title="Respiratory Rate" 
                icon={Wind} 
                color="orange" 
                data={history} 
                dataKey="respiratoryRate"
                unit="br/min"
                latestValue={latest.respiratoryRate || "--"}
              />
              <ChartCard 
                title="SpO₂" 
                icon={Activity} 
                color="blue" 
                data={history} 
                dataKey="spO2"
                unit="%"
                latestValue={latest.spO2 || "--"}
              />
              <ChartCard 
                title="Blood Pressure" 
                icon={Droplets} 
                color="purple" 
                data={history} 
                dataKey="systolic"
                dataKey2="diastolic"
                unit="mmHg"
                latestValue={`${latest.systolic || "--"}/${latest.diastolic || "--"}`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No vitals history found</p>
              <p className="text-xs">History for {patient.name} hasn't been recorded yet.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100 text-center text-[11px] text-slate-400 italic">
          Measurements are captured automatically via remote patient monitoring devices.
        </div>
      </DialogContent>
    </Dialog>
  );
}
