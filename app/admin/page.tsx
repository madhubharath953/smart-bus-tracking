"use client";

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, CheckCircle, Play, Square, Map as MapIcon, Navigation } from 'lucide-react';
import { useBus } from '../context/BusContext';







export default function AdminPanel() {
  const { isSimulating, setIsSimulating, busLocation, updateBusLocation } = useBus();
  const [manualLat, setManualLat] = useState(busLocation.lat.toString());
  const [manualLng, setManualLng] = useState(busLocation.lng.toString());

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      await updateBusLocation({ lat, lng });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-8 overflow-y-auto uppercase tracking-tight">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Control</h1>
          <p className="text-slate-500 font-bold">Fleet Management & Oversight</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
          Add New Bus
        </button>
      </div>

      {/* Simulator & Manual Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <MapIcon size={120} className="text-white" />
          </div>

          <div className="relative z-10 flex flex-col items-start justify-between h-full gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-[10px] font-black text-blue-400 tracking-widest">Auto Simulator</p>
                </div>
                {isSimulating && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-green-400">Active</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">Simulator Engine</h2>
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500">Lat</p>
                  <p className="text-sm font-bold text-white tabular-nums">{busLocation.lat.toFixed(4)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500">Lng</p>
                  <p className="text-sm font-bold text-white tabular-nums">{busLocation.lng.toFixed(4)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 ${isSimulating
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700'
                  }`}
              >
                {isSimulating ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                {isSimulating ? 'Stop Auto' : 'Start Auto'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 group">
          <form onSubmit={handleManualUpdate} className="h-full flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-black text-slate-500 tracking-widest">Manual Override</p>
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Teleport Bus</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Latitude</label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="12.9716"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Longitude</label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="77.5946"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-900/10"
            >
              <Navigation size={16} />
              Update Firestore
            </button>
          </form>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Total Buses" value="52" trend="+3" trendUp={true} />
        <AdminStatCard label="Active Drivers" value="48" trend="-1" trendUp={false} />
        <AdminStatCard label="Total Students" value="4,820" trend="+124" trendUp={true} />
        <AdminStatCard label="Critical Alerts" value="2" trend="0" trendUp={null} />
      </div>

      {/* Fleet Status Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-900">Fleet status Overview</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><MoreHorizontal size={20} className="text-slate-500" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bus ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Route</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Driver</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last stop</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <FleetRow id="BUS-101" route="Campus Exp #402" driver="Ravi Kumar" status="on-route" stop="Green Valley" />
              <FleetRow id="BUS-102" route="City Link #105" driver="Arun P." status="maintenance" stop="Depot 4" />
              <FleetRow id="BUS-103" route="South Wing #301" driver="Suresh L." status="on-route" stop="South Gate" />
              <FleetRow id="BUS-104" route="Airport Dr #700" driver="Vijay M." status="off-duty" stop="Terminal 2" />
              <FleetRow id="BUS-105" route="Lake View #205" driver="Deepak S." status="on-route" stop="North Hub" />
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 bg-slate-50/50 text-center">
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">View All 52 Buses</button>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, trend, trendUp }: { label: string, value: string, trend: string, trendUp: boolean | null }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
        {trendUp !== null && (
          <div className={`flex items-center gap-1 text-xs font-black ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function FleetRow({ id, route, driver, status, stop }: { id: string, route: string, driver: string, status: string, stop: string }) {
  const statusStyles: Record<string, string> = {
    'on-route': 'bg-emerald-100 text-emerald-600 border-emerald-200',
    'maintenance': 'bg-amber-100 text-amber-600 border-amber-200',
    'off-duty': 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-5 text-sm font-black text-slate-900">{id}</td>
      <td className="px-8 py-5 text-sm font-bold text-slate-600">{route}</td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black border border-indigo-100 uppercase">{driver.charAt(0)}</div>
          <span className="text-sm font-bold text-slate-700">{driver}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2 text-slate-500">
          <CheckCircle size={14} className="text-emerald-500" />
          <span className="text-sm font-bold">{stop}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <button className="text-slate-400 hover:text-blue-600 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
}