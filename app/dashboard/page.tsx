"use client";

import React from "react";
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
    const { busLocation, path, stats, plannedRoute } = useBus();

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6 overflow-y-auto">
            {/* Top Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Tracking</h1>
                    <p className="text-slate-500 font-medium">Route #402 - Campus Express</p>
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
                    value={`${stats.speed} km/h`}
                    color="bg-indigo-50"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-emerald-600" />}
                    label="Expected Arrival"
                    value={stats.eta}
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<MapPin className="w-5 h-5 text-blue-600" />}
                    label="Distance Left"
                    value={stats.distance}
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
                    <MapView busLocation={busLocation} path={path} plannedRoute={plannedRoute} />
                </div>

                {/* Sidebar Info Section */}
                <div className="flex flex-col gap-6">
                    {/* Bus Details */}
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Bus className="w-5 h-5 text-blue-600" />
                            Bus Information
                        </h3>
                        <div className="space-y-4">
                            <InfoRow label="Registration" value="KA-01-F-1234" />
                            <InfoRow label="Driver" value="Ravi Kumar" />
                            <InfoRow label="Capacity" value="42/50" />
                            <InfoRow label="Next Stop" value="Green Valley" />
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
