"use client";

import React, { useState } from "react";
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import("../component/Mapview"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg animate-pulse border-2 border-gray-200">
            <p className="text-gray-500 font-medium">Loading Map...</p>
        </div>
    )
});

import { Bus, Clock, MapPin, Gauge, ShieldCheck, AlertCircle, Phone, Navigation } from "lucide-react";
import { useBus } from "../context/BusContext";

export default function Dashboard() {
    const { busLocation, path, stats, plannedRoute, allBuses, depots } = useBus();
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

    // Derive selected bus data, fallback to default context values if none selected
    const selectedBus = allBuses.find(b => b.id === selectedBusId) || allBuses.find(b => b.id === "bus-402") || allBuses[0];

    const displayStats = selectedBus ? selectedBus.stats : stats;
    const displayLocation = selectedBus ? selectedBus.location : busLocation;
    const displayPath = selectedBus ? (selectedBus.path || []) : path;

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6 overflow-y-auto">
            {/* Top Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Tracking</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-slate-500 font-medium">Thoothukudi Fleet</p>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase">{allBuses.length} Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        <Phone size={18} className="text-blue-600" />
                        Call Driver
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                        <Navigation size={18} />
                        Get Directions
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Gauge className="w-5 h-5 text-indigo-600" />}
                    label="Current Speed"
                    value={`${displayStats?.speed || 0} km/h`}
                    color="bg-indigo-50"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-emerald-600" />}
                    label="Expected Arrival"
                    value={displayStats?.eta || "N/A"}
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<MapPin className="w-5 h-5 text-blue-600" />}
                    label="Distance Left"
                    value={displayStats?.distance || "N/A"}
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
                    label="Safety Rating"
                    value="Excellent"
                    color="bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                {/* Map Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative group">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Signal</span>
                        </div>
                    </div>
                    <MapView
                        busLocation={displayLocation}
                        path={displayPath}
                        plannedRoute={plannedRoute}
                        buses={allBuses}
                        depots={depots}
                    />
                </div>

                {/* Sidebar Info Section */}
                <div className="flex flex-col gap-6">
                    {/* Fleet Selection List */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[300px]">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bus className="w-5 h-5 text-blue-600" />
                                Available Fleet
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{allBuses.length} Total</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {allBuses.map((bus) => (
                                <button
                                    key={bus.id}
                                    onClick={() => setSelectedBusId(bus.id)}
                                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${(selectedBusId === bus.id || (!selectedBusId && bus.id === "bus-402"))
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${(selectedBusId === bus.id || (!selectedBusId && bus.id === "bus-402")) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                            <Bus size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">{bus.id}</p>
                                            <p className="text-[10px] font-bold text-slate-500">{bus.stats?.routeName || "General Route"}</p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${bus.isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bus Details */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Live Information
                        </h3>
                        <div className="space-y-4">
                            <InfoRow label="Registration" value={displayStats?.registration || "N/A"} />
                            <InfoRow label="Driver" value={displayStats?.driverName || "Unknown"} />
                            <InfoRow label="Current Status" value={selectedBus?.isSimulating ? "On Route" : "Idle"} />
                            <InfoRow label="Next Stop" value={displayStats?.nextStop || "Depot"} />
                        </div>
                    </div>

                    {/* Alerts/Status */}
                    <div className="bg-indigo-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <AlertCircle size={80} />
                        </div>
                        <h3 className="font-bold mb-4 relative z-10">Status Update</h3>
                        <p className="text-indigo-100/80 text-sm mb-6 relative z-10">
                            The bus is currently running on its scheduled path. No traffic delays reported on Route #402.
                        </p>
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                                Update: Just Now
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`p-3 ${color} rounded-xl shadow-inner`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="text-sm font-bold text-slate-800">{value}</span>
        </div>
    );
}

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = customScrollbarStyles;
    document.head.appendChild(style);
}
