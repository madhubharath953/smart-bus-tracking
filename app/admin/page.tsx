"use client";

import React, { useState, useEffect } from 'react';
import { Bus, MapPin, ShieldCheck, Navigation, Zap, LocateFixed, Settings2, CheckCircle, Loader2, Plus, X as CloseIcon, Bus as BusIcon } from "lucide-react";
import { useBus } from '../context/BusContext';
import { db } from '../../lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('../component/Mapview'), { ssr: false });







interface BusStats {
  speed: number;
  eta: string;
  distance: string;
  nextStop?: string;
  registration?: string;
  driverName?: string;
  routeName?: string;
}

interface Bus {
  id: string;
  location: { lat: number; lng: number };
  path: { lat: number; lng: number }[];
  isSimulating: boolean;
  stats: BusStats;
}


export default function AdminPanel() {
  const {
    isSimulating,
    setIsSimulating,
    isTrackingGPS,
    setIsTrackingGPS,
    busLocation,
    updateBusLocation,
    activeBusId,
    setActiveBusId,
    allBuses,
    path,
    depots,
    addDepot,
    userLocation,
    syncGPSToBus,
    setSyncGPSToBus,
    saveLocation,
    savedLocations,
    stats,
  } = useBus();
  const [manualLat, setManualLat] = useState(busLocation.lat.toString());
  const [manualLng, setManualLng] = useState(busLocation.lng.toString());
  const [pointName, setPointName] = useState('New Point');
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [followActive, setFollowActive] = useState(false);

  // Add Bus Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBusId, setNewBusId] = useState('');
  const [newBusReg, setNewBusReg] = useState('');
  const [newBusDriver, setNewBusDriver] = useState('');
  const [newBusRoute, setNewBusRoute] = useState('');
  const [isAddingBus, setIsAddingBus] = useState(false);

  // Depot Modal State
  const [isDepotModalOpen, setIsDepotModalOpen] = useState(false);
  const [depotName, setDepotName] = useState('');
  const [depotLat, setDepotLat] = useState('8.7139');
  const [depotLng, setDepotLng] = useState('78.1348');
  const [isAddingDepot, setIsAddingDepot] = useState(false);

  // Edit Bus Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBusId, setEditingBusId] = useState('');
  const [editBusReg, setEditBusReg] = useState('');
  const [editBusDriver, setEditBusDriver] = useState('');
  const [editBusRoute, setEditBusRoute] = useState('');
  const [editBusNextStop, setEditBusNextStop] = useState('');
  const [isUpdatingBus, setIsUpdatingBus] = useState(false);

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusId || !newBusReg) {
      alert("Please fill in Bus ID and Registration");
      return;
    }

    setIsAddingBus(true);
    try {
      const busRef = doc(db, "buses", newBusId.toLowerCase());
      await setDoc(busRef, {
        location: { lat: 8.8733, lng: 78.0310 },
        path: [{ lat: 8.8733, lng: 78.0310 }],
        isSimulating: false,
        stats: {
          speed: 0,
          eta: "N/A",
          distance: "N/A",
          registration: newBusReg.toUpperCase(),
          nextStop: "Depot",
          driverName: newBusDriver || "TBD",
          routeName: newBusRoute || "Harbor Line"
        }
      });

      // Reset form
      setNewBusId('');
      setNewBusReg('');
      setNewBusDriver('');
      setNewBusRoute('');
      setIsModalOpen(false);
      alert("New Bus Added Successfully!");
    } catch (error) {
      console.error("Error adding bus:", error);
      alert("Failed to add bus. Please check console.");
    } finally {
      setIsAddingBus(false);
    }
  };

  const handleSaveDepot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotName) {
      alert("Please enter a depot name");
      return;
    }

    setIsAddingDepot(true);
    try {
      await addDepot(depotName, { lat: parseFloat(depotLat), lng: parseFloat(depotLng) });
      setDepotName('');
      setIsDepotModalOpen(false);
      alert("Depot added successfully!");
    } catch (error) {
      console.error("Error adding depot:", error);
      alert("Failed to add depot.");
    } finally {
      setIsAddingDepot(false);
    }
  };

  const handleUpdateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBusReg) {
      alert("Registration cannot be empty");
      return;
    }

    setIsUpdatingBus(true);
    try {
      const busRef = doc(db, "buses", editingBusId);
      const docSnap = await getDoc(busRef);

      if (docSnap.exists()) {
        const currentData = docSnap.data();
        await updateDoc(busRef, {
          stats: {
            ...currentData.stats,
            registration: editBusReg.toUpperCase(),
            driverName: editBusDriver || "TBD",
            routeName: editBusRoute || "General",
            nextStop: editBusNextStop || "Depot"
          }
        });
        setIsEditModalOpen(false);
        alert("Bus Details Updated Successfully!");
      }
    } catch (error) {
      console.error("Error updating bus:", error);
      alert("Failed to update bus. Please check console.");
    } finally {
      setIsUpdatingBus(false);
    }
  };

  const openEditModal = (bus: Bus) => {
    setEditingBusId(bus.id);
    setEditBusReg(bus.stats?.registration || '');
    setEditBusDriver(bus.stats?.driverName || '');
    setEditBusRoute(bus.stats?.routeName || '');
    setEditBusNextStop(bus.stats?.nextStop || '');
    setIsEditModalOpen(true);
  };


  // Sync manual inputs only when the active bus changes
  useEffect(() => {
    setManualLat(busLocation.lat.toString());
    setManualLng(busLocation.lng.toString());
  }, [activeBusId, busLocation.lat, busLocation.lng]);

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      await updateBusLocation({ lat, lng });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden uppercase tracking-tight">
      {/* Header - Compact */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Admin Fleet Dashboard
            <div className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest">
              Live Control
            </div>
          </h1>
          <p className="text-[10px] font-bold text-slate-400">Monitoring {allBuses.length} active units</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6 px-6 border-r border-slate-100 italic">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Active Drivers</p>
              <p className="text-sm font-black text-slate-900">{allBuses.filter(b => b.stats?.driverName && b.stats.driverName !== "TBD").length}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase">Avg Speed</p>
              <p className="text-sm font-black text-slate-900">32 km/h</p>
            </div>
          </div>
          <button
            onClick={() => setFollowActive(!followActive)}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${followActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-600'
              } `}
          >
            <Navigation size={16} />
            {followActive ? 'Following Active' : 'Fleet View'}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDepotModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <LocateFixed size={16} />
              Manage Depots
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus size={16} />
              New Bus
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fleet List (LEFT) */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                <BusIcon size={18} />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Fleet</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Depots Section */}
            {depots.length > 0 && (
              <div className="bg-slate-50/30 p-4 border-b border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Active Depots ({depots.length})</p>
                <div className="flex flex-wrap gap-2">
                  {depots.map(depot => (
                    <div key={depot.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                      <span className="text-[10px] font-black text-slate-700 uppercase">{depot.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Bus Inventory</p>
              {allBuses.map((bus) => (
                <div
                  key={bus.id}
                  onClick={() => {
                    setActiveBusId(bus.id);
                    setFollowActive(true);
                  }}
                  className={`group p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeBusId === bus.id
                    ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200 text-white'
                    : 'bg-white border-slate-100 hover:border-blue-200 text-slate-600'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${activeBusId === bus.id ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <BusIcon size={16} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase ${activeBusId === bus.id ? 'text-white' : 'text-slate-900'}`}>
                          {bus.stats?.registration || bus.id.toUpperCase()}
                        </p>
                        <p className={`text-[8px] font-bold ${activeBusId === bus.id ? 'text-slate-400' : 'text-slate-400'}`}>
                          {bus.stats?.driverName || 'No Driver Assigned'}
                        </p>
                      </div>
                    </div>
                    {bus.isSimulating && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className={`text-[7px] font-black uppercase ${activeBusId === bus.id ? 'text-green-400' : 'text-green-600'}`}>Moving</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <p className={`text-[7px] font-black uppercase ${activeBusId === bus.id ? 'text-slate-400' : 'text-slate-400'}`}>Route</p>
                      <p className={`text-[9px] font-bold ${activeBusId === bus.id ? 'text-white' : 'text-slate-700'}`}>{bus.stats?.routeName || 'Unassigned'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(bus);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${activeBusId === bus.id ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >
                      <Settings2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Central Map Column */}
        <div className="flex-1 relative flex flex-col">
          <div className="absolute inset-0 z-0">
            <MapView
              busLocation={busLocation}
              path={path}
              buses={allBuses}
              depots={depots}
              userLocation={userLocation}
              followActive={followActive}
              followUser={isTrackingGPS || syncGPSToBus}
              activeBusId={activeBusId}
              savedLocations={savedLocations}
            />
          </div>
        </div>

        {/* Command Center (RIGHT) */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col z-20 shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <Navigation size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Command Engine</p>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black tracking-tight">{activeBusId.toUpperCase()}</h2>
                  <button
                    onClick={() => {
                      const activeBus = allBuses.find(b => b.id === activeBusId);
                      if (activeBus) openEditModal(activeBus);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 group"
                  >
                    <Settings2 size={14} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Current Speed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tabular-nums">{stats.speed}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">km/h</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Distance Left</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tabular-nums">{stats.distance.split(' ')[0]}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Movement Control Card */}
            <div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                Drive Operations
              </p>
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{isSimulating ? 'Autonomous Active' : 'Manual Mode'}</span>
                  </div>
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg ${isSimulating
                      ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
                      : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                      }`}
                  >
                    {isSimulating ? 'Deactivate' : 'Ignition'}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <LocateFixed size={14} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-400 uppercase">Precision Teleport</p>
                  </div>
                  <form onSubmit={handleManualUpdate} className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1 px-4 py-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[7px] font-black text-slate-400 uppercase">Latitude</span>
                        <input
                          type="text"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          className="bg-transparent text-xs font-black outline-none tabular-nums text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1 px-4 py-2 bg-white rounded-xl border border-slate-200">
                        <span className="text-[7px] font-black text-slate-400 uppercase">Longitude</span>
                        <input
                          type="text"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          className="bg-transparent text-xs font-black outline-none tabular-nums text-slate-900"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all font-black"
                      >
                        Update Coordinates
                      </button>
                      <button
                        type="button"
                        disabled={!userLocation}
                        onClick={() => {
                          if (userLocation) {
                            setManualLat(userLocation.lat.toFixed(6));
                            setManualLng(userLocation.lng.toFixed(6));
                          }
                        }}
                        className={`p-3 rounded-xl transition-all border ${userLocation
                          ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                          : 'bg-slate-50 border-slate-200 text-slate-300'
                          }`}
                        title="Use my device location"
                      >
                        <LocateFixed size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* GPS & Data Sync Section */}
            <div>
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-600" />
                Connectivity & Sync
              </p>
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isTrackingGPS ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Device Visibility</p>
                  </div>
                  <button
                    onClick={() => setIsTrackingGPS(!isTrackingGPS)}
                    className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${isTrackingGPS ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {isTrackingGPS ? 'Connected' : 'Offline'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${syncGPSToBus ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Live GPS Sync</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isTrackingGPS) setIsTrackingGPS(true);
                      setSyncGPSToBus(!syncGPSToBus);
                      if (!syncGPSToBus) setIsSimulating(false);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${syncGPSToBus ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {syncGPSToBus ? 'Syncing...' : 'Sync Off'}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={14} className="text-slate-400" />
                    <p className="text-[8px] font-black text-slate-400 uppercase">Save Interest Point</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1 px-4 py-2 bg-white rounded-xl border border-slate-200">
                      <span className="text-[7px] font-black text-slate-400 uppercase">Bookmark Name</span>
                      <input
                        type="text"
                        value={pointName}
                        onChange={(e) => setPointName(e.target.value)}
                        className="bg-transparent text-xs font-black text-slate-900 outline-none w-full uppercase placeholder:text-slate-300"
                        placeholder="e.g., Highway Bridge"
                      />
                    </div>
                    <button
                      disabled={!userLocation || isSavingPoint}
                      onClick={async () => {
                        if (userLocation) {
                          setIsSavingPoint(true);
                          try {
                            await saveLocation(pointName, userLocation);
                            setPointName('New Point');
                          } finally {
                            setIsSavingPoint(false);
                          }
                        }
                      }}
                      className={`w-full py-3 rounded-xl text-[9px] font-black uppercase transition-all ${userLocation ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-200 text-slate-400'}`}
                    >
                      {isSavingPoint ? 'Establishing Registry...' : 'Register Location'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Bus Modal */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 uppercase tracking-tight">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-blue-600 p-8 flex items-center justify-between font-black">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Navigation className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Edit Bus: {editingBusId.toUpperCase()}</h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors font-black text-white"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateBus} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Registration</label>
                    <input
                      type="text"
                      value={editBusReg}
                      onChange={(e) => setEditBusReg(e.target.value)}
                      placeholder="TN-69-XX-0000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Driver Name</label>
                    <input
                      type="text"
                      value={editBusDriver}
                      onChange={(e) => setEditBusDriver(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Name</label>
                      <input
                        type="text"
                        value={editBusRoute}
                        onChange={(e) => setEditBusRoute(e.target.value)}
                        placeholder="e.g. Express"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Stop</label>
                      <input
                        type="text"
                        value={editBusNextStop}
                        onChange={(e) => setEditBusNextStop(e.target.value)}
                        placeholder="e.g. Center"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all font-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingBus}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 font-black"
                  >
                    {isUpdatingBus ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    {isUpdatingBus ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* Add Depot Modal */}
      {
        isDepotModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 uppercase tracking-tight">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-slate-900 p-8 flex items-center justify-between font-black">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <LocateFixed className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Add New Depot</h2>
                </div>
                <button
                  onClick={() => setIsDepotModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors font-black"
                >
                  <CloseIcon className="text-slate-400" size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveDepot} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Depot Name</label>
                    <input
                      type="text"
                      value={depotName}
                      onChange={(e) => setDepotName(e.target.value)}
                      placeholder="e.g. South Campus Hub"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latitude</label>
                      <input
                        type="text"
                        value={depotLat}
                        onChange={(e) => setDepotLat(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none tabular-nums"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Longitude</label>
                      <input
                        type="text"
                        value={depotLng}
                        onChange={(e) => setDepotLng(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingDepot}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all transform active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50 font-black"
                >
                  {isAddingDepot ? <Loader2 className="animate-spin font-black" size={20} /> : <CheckCircle size={20} className="font-black" />}
                  {isAddingDepot ? 'Saving Depot...' : 'Create Depot'}
                </button>
              </form>
            </div>
          </div>
        )
      }

      {
        isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 uppercase tracking-tight">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-slate-900 p-8 flex items-center justify-between font-black">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <BusIcon className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Add New Bus</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors font-black"
                >
                  <CloseIcon className="text-slate-400" size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBus} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus ID</label>
                    <input
                      type="text"
                      value={newBusId}
                      onChange={(e) => setNewBusId(e.target.value)}
                      placeholder="e.g. BUS-405"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</label>
                    <input
                      type="text"
                      value={newBusReg}
                      onChange={(e) => setNewBusReg(e.target.value)}
                      placeholder="TN-69-XX-0000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name (Optional)</label>
                  <input
                    type="text"
                    value={newBusDriver}
                    onChange={(e) => setNewBusDriver(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Name (Optional)</label>
                  <input
                    type="text"
                    value={newBusRoute}
                    onChange={(e) => setNewBusRoute(e.target.value)}
                    placeholder="e.g. Campus Express"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingBus}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all transform active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 font-black"
                >
                  {isAddingBus ? <Loader2 className="animate-spin font-black" size={20} /> : <Plus size={20} className="font-black" />}
                  {isAddingBus ? 'Adding to Fleet...' : 'Deploy to Database'}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}

