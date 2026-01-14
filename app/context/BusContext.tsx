"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, serverTimestamp, collection, query } from 'firebase/firestore';

interface Location {
    lat: number;
    lng: number;
}

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
    location: Location;
    path: Location[];
    isSimulating: boolean;
    stats: BusStats;
}

interface Depot {
    id: string;
    name: string;
    location: Location;
}

interface BusContextType {
    busLocation: Location;
    path: Location[];
    isSimulating: boolean;
    setIsSimulating: (val: boolean) => void;
    isTrackingGPS: boolean;
    setIsTrackingGPS: (val: boolean) => void;
    stats: BusStats;
    allBuses: Bus[];
    depots: Depot[];
    activeBusId: string;
    setActiveBusId: (id: string) => void;
    updateBusLocation: (newLoc: Location) => Promise<void>;
    addDepot: (name: string, location: Location) => Promise<void>;
    userLocation: Location | null;
    setUserLocation: (loc: Location | null) => void;
    syncGPSToBus: boolean;
    setSyncGPSToBus: (val: boolean) => void;
    saveLocation: (name: string, loc: Location) => Promise<void>;
    savedLocations: { id: string, name: string, location: Location }[];
}

const BusContext = createContext<BusContextType | undefined>(undefined);

const THOOTHUKUDI_CENTER = { lat: 8.7139, lng: 78.1348 };
const TIRUCHENDUR_CENTER = { lat: 8.4841, lng: 78.1189 };
const SAWYERPURAM_CENTER = { lat: 8.7186, lng: 77.9624 };
const PALAYAMKOTTAI_CENTER = { lat: 8.7061, lng: 77.7475 };

// Helper to calculate distance in km between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

export function BusProvider({ children }: { children: React.ReactNode }) {
    const [busLocation, setBusLocation] = useState<Location>(THOOTHUKUDI_CENTER);
    const [path, setPath] = useState<Location[]>([THOOTHUKUDI_CENTER]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isTrackingGPS, _setIsTrackingGPS] = useState(false);
    const [stats, setStats] = useState<BusStats>({
        speed: 35,
        eta: "5 mins",
        distance: "1.2 km",
        nextStop: "Old Bus Stand",
        registration: "KA-01-HH-1234"
    });
    const [allBuses, setAllBuses] = useState<Bus[]>([]);
    const [depots, setDepots] = useState<Depot[]>([]);
    const [activeBusId, setActiveBusId] = useState("bus-402");
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [syncGPSToBus, _setSyncGPSToBus] = useState(false);
    const [savedLocations, setSavedLocations] = useState<{ id: string, name: string, location: Location }[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastStoredLocRef = useRef<Location | null>(null);

    const setIsTrackingGPS = (val: boolean) => {
        _setIsTrackingGPS(val);
        if (!val) {
            setUserLocation(null);
            _setSyncGPSToBus(false);
        }
    };

    const setSyncGPSToBus = (val: boolean) => {
        _setSyncGPSToBus(val);
    };

    // 1. Listen for real-time updates from ALL buses
    useEffect(() => {
        const q = query(collection(db, "buses"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const buses: Bus[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                buses.push({
                    id: doc.id,
                    location: data.location,
                    path: data.path || [],
                    isSimulating: !!data.isSimulating,
                    stats: data.stats || {}
                } as Bus);
            });
            setAllBuses(buses);

            const currentActiveBus = buses.find(b => b.id === activeBusId);
            if (currentActiveBus) {
                if (currentActiveBus.location) setBusLocation(currentActiveBus.location);
                if (currentActiveBus.path) setPath(currentActiveBus.path);
                if (currentActiveBus.isSimulating !== undefined) setIsSimulating(currentActiveBus.isSimulating);
                if (currentActiveBus.stats) setStats(currentActiveBus.stats);
            }

            if (buses.length === 0 && querySnapshot.metadata.fromCache === false) {
                // Initialize Bus 1: Thoothukudi
                const bus1Ref = doc(db, "buses", "bus-402");
                setDoc(bus1Ref, {
                    location: THOOTHUKUDI_CENTER,
                    path: [THOOTHUKUDI_CENTER],
                    isSimulating: false,
                    stats: {
                        speed: 0,
                        eta: "N/A",
                        distance: "N/A",
                        registration: "TN-69-HH-1234",
                        nextStop: "Sawyerpuram",
                        driverName: "Ram Singh",
                        routeName: "Tuticorin - Sawyerpuram Express"
                    }
                });

                // Initialize Bus 2: Tiruchendur
                const bus2Ref = doc(db, "buses", "bus-405");
                setDoc(bus2Ref, {
                    location: TIRUCHENDUR_CENTER,
                    path: [TIRUCHENDUR_CENTER],
                    isSimulating: false,
                    stats: {
                        speed: 0,
                        eta: "N/A",
                        distance: "N/A",
                        registration: "TN-69-HH-4567",
                        nextStop: "Sawyerpuram",
                        driverName: "Selvam Kumar",
                        routeName: "Tiruchendur - Sawyerpuram Link"
                    }
                });

                // Initialize Bus 3: Palayamkottai - Sawyerpuram
                const bus3Ref = doc(db, "buses", "bus-408");
                setDoc(bus3Ref, {
                    location: PALAYAMKOTTAI_CENTER,
                    path: [PALAYAMKOTTAI_CENTER],
                    isSimulating: false,
                    stats: {
                        speed: 0,
                        eta: "N/A",
                        distance: "N/A",
                        registration: "TN-69-HH-8888",
                        nextStop: "Sawyerpuram",
                        driverName: "Muthu Raj",
                        routeName: "Tirunelveli - Sawyerpuram Express"
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [activeBusId]);

    // Listen for real-time updates from Depots
    useEffect(() => {
        const q = query(collection(db, "depots"));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const depotList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Depot, 'id'>)
            }));
            setDepots(depotList);

            // Initialize default depots if none exist
            if (snapshot.empty && snapshot.metadata.fromCache === false) {
                const ttdRef = doc(db, "depots", "th-depot");
                await setDoc(ttdRef, {
                    name: "Thoothukudi Central Depot",
                    location: THOOTHUKUDI_CENTER,
                    createdAt: serverTimestamp()
                });

                const tcdRef = doc(db, "depots", "tr-depot");
                await setDoc(tcdRef, {
                    name: "Tiruchendur Terminal",
                    location: TIRUCHENDUR_CENTER,
                    createdAt: serverTimestamp()
                });

                const swpRef = doc(db, "depots", "swp-marker");
                await setDoc(swpRef, {
                    name: "Sawyerpuram Junction",
                    location: SAWYERPURAM_CENTER,
                    createdAt: serverTimestamp()
                });

                const plmRef = doc(db, "depots", "plm-depot");
                await setDoc(plmRef, {
                    name: "Palayamkottai Terminal",
                    location: PALAYAMKOTTAI_CENTER,
                    createdAt: serverTimestamp()
                });
            }
        });
        return () => unsubscribe();
    }, []);

    // Listen for real-time updates from Saved Locations
    useEffect(() => {
        const q = query(collection(db, "saved_locations"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name as string,
                location: doc.data().location as Location
            }));
            setSavedLocations(locList);
        });
        return () => unsubscribe();
    }, []);

    const allBusesRef = useRef<Bus[]>([]);
    useEffect(() => {
        allBusesRef.current = allBuses;
    }, [allBuses]);

    // 2. Simulation logic
    useEffect(() => {
        if (isSimulating) {
            intervalRef.current = setInterval(async () => {
                const updatePromises = allBusesRef.current.map(async (bus) => {
                    const busDocRef = doc(db, "buses", bus.id);
                    const prevLoc = bus.location || THOOTHUKUDI_CENTER;

                    // Define Origin and Destination for each bus
                    let origin = THOOTHUKUDI_CENTER;
                    const destination = SAWYERPURAM_CENTER;
                    let originName = "Old Bus Stand";

                    if (bus.id === "bus-405") {
                        origin = TIRUCHENDUR_CENTER;
                        originName = "Murugan Temple";
                    } else if (bus.id === "bus-408") {
                        origin = PALAYAMKOTTAI_CENTER;
                        originName = "Palayamkottai";
                    }

                    // Move between Origin and Destination
                    const target = bus.stats?.nextStop === "Sawyerpuram" ? destination : origin;

                    const deltaLat = (target.lat - prevLoc.lat);
                    const deltaLng = (target.lng - prevLoc.lng);
                    const mag = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

                    let newLat, newLng;
                    if (mag > 0.0003) {
                        const step = 0.0007;
                        newLat = prevLoc.lat + (deltaLat / mag) * step + (Math.random() - 0.5) * 0.0001;
                        newLng = prevLoc.lng + (deltaLng / mag) * step + (Math.random() - 0.5) * 0.0001;
                    } else {
                        // At destination, stay put or toggle direction
                        newLat = prevLoc.lat;
                        newLng = prevLoc.lng;
                    }

                    const newLoc = { lat: newLat, lng: newLng };
                    const updatedPath = [...(bus.path || []), newLoc].slice(-50);

                    // Calculate stats based on movement
                    const distToNext = calculateDistance(newLoc.lat, newLoc.lng, target.lat, target.lng);
                    const speed = Math.floor(Math.random() * (45 - 25) + 25);
                    const etaMin = Math.round((distToNext / speed) * 60);

                    // Update nextStop if arrived to enable round-trip
                    let nextStopUpdate = bus.stats?.nextStop || "Sawyerpuram";
                    if (mag <= 0.0003) {
                        nextStopUpdate = bus.stats?.nextStop === "Sawyerpuram" ? "Sawyerpuram" : "Sawyerpuram";
                        // Note: For now, the user wanted them going TO sawyerpuram. 
                        // To make them loop, we toggle:
                        nextStopUpdate = bus.stats?.nextStop === "Sawyerpuram" ? originName : "Sawyerpuram";
                    }

                    return updateDoc(busDocRef, {
                        location: newLoc,
                        path: updatedPath,
                        isSimulating: true,
                        stats: {
                            ...bus.stats,
                            speed: mag <= 0.0002 ? 0 : speed,
                            distance: `${distToNext.toFixed(1)} km`,
                            eta: mag <= 0.0002 ? "Arrived" : (etaMin > 0 ? `${etaMin} mins` : "Arriving"),
                            nextStop: nextStopUpdate
                        }
                    });
                });

                await Promise.all(updatePromises);
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            const busDocRef = doc(db, "buses", activeBusId);
            updateDoc(busDocRef, { isSimulating: false });
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isSimulating, activeBusId]);

    const { user } = useAuth();

    const updateBusLocation = React.useCallback(async (newLoc: Location) => {
        const busDocRef = doc(db, "buses", activeBusId);
        const docSnap = await getDoc(busDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const prevPath = data.path || [];
            const updatedPath = [...prevPath, newLoc].slice(-100);

            // Calculate new stats for the active bus
            const nextStopLoc = depots[0]?.location || THOOTHUKUDI_CENTER;
            const distToNext = calculateDistance(newLoc.lat, newLoc.lng, nextStopLoc.lat, nextStopLoc.lng);
            const currentSpeed = Math.max(data.stats?.speed || 30, 1); // Ensure speed is at least 1 to avoid division by zero
            const etaMin = Math.round((distToNext / currentSpeed) * 60);

            await updateDoc(busDocRef, {
                location: newLoc,
                path: updatedPath,
                lastUpdated: serverTimestamp(),
                stats: {
                    ...data.stats,
                    distance: `${distToNext.toFixed(1)} km`,
                    eta: etaMin > 0 ? `${etaMin} mins` : "Arriving"
                }
            });
        }
    }, [activeBusId, depots]);

    // 3. GPS Tracking logic
    useEffect(() => {
        let watchId: number | null = null;
        if (isTrackingGPS) {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const newLoc = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        setUserLocation(newLoc);

                        // 1. Continuous User Tracking in Firestore (History)
                        if (user?.email) {
                            // Throttle: Only store if moved > 5 meters or 10 seconds (simplistic)
                            const shouldStore = !lastStoredLocRef.current ||
                                Math.abs(lastStoredLocRef.current.lat - newLoc.lat) > 0.0001 ||
                                Math.abs(lastStoredLocRef.current.lng - newLoc.lng) > 0.0001;

                            if (shouldStore) {
                                const trackingRef = doc(collection(db, "user_tracking"));
                                setDoc(trackingRef, {
                                    userEmail: user.email,
                                    location: newLoc,
                                    timestamp: serverTimestamp()
                                });
                                lastStoredLocRef.current = newLoc;
                            }
                        }

                        // 2. Separate Sync Logic to Bus
                        if (syncGPSToBus) {
                            updateBusLocation(newLoc);
                        }
                    },
                    (error) => {
                        console.error(error);
                        setIsTrackingGPS(false);
                        setSyncGPSToBus(false);
                    },
                    { enableHighAccuracy: true }
                );
            }
        }
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTrackingGPS, syncGPSToBus, user, updateBusLocation, userLocation]);

    const saveLocation = async (name: string, loc: Location) => {
        try {
            const savedLocRef = doc(collection(db, "saved_locations"));
            await setDoc(savedLocRef, {
                name,
                location: loc,
                savedBy: user?.email || "anonymous",
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving location:", error);
            throw error;
        }
    };

    const addDepot = async (name: string, location: Location) => {
        try {
            const depotId = name.toLowerCase().replace(/\s+/g, '-');
            const depotRef = doc(db, "depots", depotId);
            await setDoc(depotRef, {
                name,
                location,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error adding depot:", error);
            throw error;
        }
    };

    return (
        <BusContext.Provider value={{
            busLocation,
            path,
            isSimulating,
            setIsSimulating,
            isTrackingGPS,
            setIsTrackingGPS,
            stats,
            allBuses,
            depots,
            activeBusId,
            setActiveBusId,
            updateBusLocation,
            addDepot,
            userLocation,
            setUserLocation,
            syncGPSToBus,
            setSyncGPSToBus,
            saveLocation,
            savedLocations
        }}>
            {children}
        </BusContext.Provider>
    );
}

export function useBus() {
    const context = useContext(BusContext);
    if (context === undefined) {
        throw new Error('useBus must be used within a BusProvider');
    }
    return context;
}
