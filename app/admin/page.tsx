"use client";

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, CheckCircle, Navigation, LocateFixed, Loader2, Plus, X as CloseIcon, Bus as BusIcon } from 'lucide-react';
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
  const { isSimulating, setIsSimulating, busLocation, updateBusLocation, activeBusId, setActiveBusId, allBuses, path, plannedRoute, depots, addDepot } = useBus();
  const [manualLat, setManualLat] = useState(busLocation.lat.toString());
  const [manualLng, setManualLng] = useState(busLocation.lng.toString());

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
        location: { lat: 8.7139, lng: 78.1348 },
        path: [{ lat: 8.7139, lng: 78.1348 }],
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
            driverName: editBusDriver || "TBD"
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
    setIsEditModalOpen(true);
  };


  // Sync manual inputs when target bus location changes
  useEffect(() => {
    setManualLat(busLocation.lat.toString());
    setManualLng(busLocation.lng.toString());
  }, [busLocation.lat, busLocation.lng]);

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

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area - Map */}
        <div className="flex-1 relative flex flex-col">
          <div className="absolute inset-0 z-0">
            <MapView
              busLocation={busLocation}
              path={path}
              plannedRoute={plannedRoute}
              buses={allBuses}
              depots={depots}
            />
          </div>

          {/* Floated Stats Deck */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/50 pointer-events-auto min-w-[200px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-900 rounded-xl text-white">
                  <Navigation size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Tracking Target</p>
                  <p className="text-xs font-black text-slate-900">{activeBusId.toUpperCase()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-slate-400">Latitude</p>
                  <p className="text-[10px] font-bold text-slate-900 tabular-nums">{busLocation.lat.toFixed(5)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-slate-400">Longitude</p>
                  <p className="text-[10px] font-bold text-slate-900 tabular-nums">{busLocation.lng.toFixed(5)}</p>
                </div>
              </div>
            </div>

            {/* Quick Simulation Control Floating */}
            <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/10 pointer-events-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{isSimulating ? 'Simulating' : 'Idle'}</span>
                </div>
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isSimulating
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isSimulating ? 'Stop' : 'Start Engine'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Teleport Control Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-2xl border border-white/50 pointer-events-auto flex items-center justify-between max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <LocateFixed size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase">Manual Teleport</h3>
                  <p className="text-[9px] font-bold text-slate-400">Targeting {activeBusId.toUpperCase()}</p>
                </div>
              </div>
              <form onSubmit={handleManualUpdate} className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400">LAT</span>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="bg-transparent w-16 text-[10px] font-bold outline-none tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-black text-slate-400">LNG</span>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="bg-transparent w-16 text-[10px] font-bold outline-none tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all font-black"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar - Fleet List */}
        <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col z-20 shadow-2xl">
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

          <div className="flex-1 overflow-y-auto">
            {/* Depots Section */}
            {depots.length > 0 && (
              <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">Active Depots ({depots.length})</p>
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

            <div className="divide-y divide-slate-50">
              <div className="px-6 py-4 bg-white/50 border-b border-slate-50">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bus Units ({allBuses.length})</p>
              </div>
              {allBuses.map((bus) => (
                <FleetItem
                  key={bus.id}
                  bus={bus}
                  isActive={activeBusId === bus.id}
                  onSelect={() => setActiveBusId(bus.id)}
                  onEdit={() => openEditModal(bus)}
                />
              ))}
              {allBuses.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-xs font-black uppercase tracking-widest">No units detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Bus Modal */}
      {isEditModalOpen && (
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
      )}
      {/* Add Depot Modal */}
      {isDepotModalOpen && (
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
      )}

      {isModalOpen && (
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
      )}
    </div>
  );
}

function FleetItem({ bus, isActive, onSelect, onEdit }: { bus: Bus, isActive: boolean, onSelect: () => void, onEdit: () => void }) {
  const statusStyles: Record<string, string> = {
    'on-route': 'bg-emerald-500',
    'maintenance': 'bg-amber-500',
    'off-duty': 'bg-slate-300'
  };

  const status = bus.isSimulating ? 'on-route' : 'off-duty';

  return (
    <div
      className={`p-5 transition-all cursor-pointer group border-l-4 ${isActive
        ? 'bg-blue-50/50 border-blue-600'
        : 'bg-white border-transparent hover:bg-slate-50'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${statusStyles[status]} ${status === 'on-route' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black text-slate-900 tracking-tight">{bus.id.toUpperCase()}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{bus.stats?.registration || "TN-XX"}</span>
          <span className="text-[11px] font-bold text-slate-700">{bus.stats?.driverName || "TBD"}</span>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Next Stop</p>
          <p className="text-[10px] font-black text-slate-900 italic">{bus.stats?.nextStop || "Depot"}</p>
        </div>
      </div>

      {isActive && (
        <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-blue-600" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Active Control</span>
          </div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
            Manage
          </button>
        </div>
      )}
    </div>
  );
}
