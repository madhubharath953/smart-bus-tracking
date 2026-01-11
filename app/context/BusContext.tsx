"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
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
    plannedRoute?: Location[];
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
    plannedRoute: Location[];
    isSimulating: boolean;
    setIsSimulating: (val: boolean) => void;
    stats: BusStats;
    allBuses: Bus[];
    depots: Depot[];
    activeBusId: string;
    setActiveBusId: (id: string) => void;
    updateBusLocation: (newLoc: Location) => Promise<void>;
    addDepot: (name: string, location: Location) => Promise<void>;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

const THOOTHUKUDI_CENTER = { lat: 8.7139, lng: 78.1348 };

const PLANNED_ROUTE: Location[] = [
    { lat: 8.7139, lng: 78.1348 }, // Start (Port area)
    { lat: 8.7300, lng: 78.1400 },
    { lat: 8.7450, lng: 78.1450 },
    { lat: 8.7550, lng: 78.1400 },
    { lat: 8.7642, lng: 78.1348 }, // Old Bus Stand area
];

export function BusProvider({ children }: { children: React.ReactNode }) {
    const [busLocation, setBusLocation] = useState<Location>(THOOTHUKUDI_CENTER);
    const [path, setPath] = useState<Location[]>([THOOTHUKUDI_CENTER]);
    const [plannedRoute] = useState<Location[]>(PLANNED_ROUTE);
    const [isSimulating, setIsSimulating] = useState(false);
    const [stats, setStats] = useState<BusStats>({
        speed: 35,
        eta: "5 mins",
        distance: "1.2 km",
        nextStop: "V.V.D Signal",
        registration: "TN-69-AY-4020"
    });
    const [allBuses, setAllBuses] = useState<Bus[]>([]);
    const [depots, setDepots] = useState<Depot[]>([]);
    const [activeBusId, setActiveBusId] = useState("bus-402");

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
                    plannedRoute: data.plannedRoute,
                    isSimulating: !!data.isSimulating,
                    stats: data.stats || {}
                } as Bus);
            });
            setAllBuses(buses);

            // Sync state with the currently ACTIVE bus
            const currentActiveBus = buses.find(b => b.id === activeBusId);
            if (currentActiveBus) {
                if (currentActiveBus.location) setBusLocation(currentActiveBus.location);
                if (currentActiveBus.path) setPath(currentActiveBus.path);
                if (currentActiveBus.isSimulating !== undefined) setIsSimulating(currentActiveBus.isSimulating);
                if (currentActiveBus.stats) setStats(currentActiveBus.stats);
            }

            // Fallback for primary bus-402 initialization if the whole fleet is empty
            if (buses.length === 0 && querySnapshot.metadata.fromCache === false) {
                // Initialize doc if it doesn't exist (Only if we have a real network response)
                const busDocRef = doc(db, "buses", "bus-402");
                setDoc(busDocRef, {
                    location: THOOTHUKUDI_CENTER,
                    path: [THOOTHUKUDI_CENTER],
                    isSimulating: false,
                    stats: {
                        speed: 0,
                        eta: "N/A",
                        distance: "N/A",
                        registration: "TN-69-AY-4020",
                        nextStop: "V.V.D Signal",
                        driverName: "Muthu Kumar",
                        routeName: "Campus Express"
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [activeBusId]);

    // Listen for real-time updates from Depots
    useEffect(() => {
        const q = query(collection(db, "depots"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const depotList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Depot, 'id'>)
            }));
            setDepots(depotList);
        });
        return () => unsubscribe();
    }, []);

    // 2. Simulation logic (Writes to Firestore)
    useEffect(() => {
        if (isSimulating) {
            intervalRef.current = setInterval(async () => {
                const busDocRef = doc(db, "buses", activeBusId);
                const docSnap = await getDoc(busDocRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const prevLoc = data.location || THOOTHUKUDI_CENTER;
                    const prevPath = data.path || [THOOTHUKUDI_CENTER];

                    const newLoc = {
                        lat: prevLoc.lat + (Math.random() - 0.5) * 0.0005,
                        lng: prevLoc.lng + (Math.random() - 0.5) * 0.0005
                    };

                    const updatedPath = [...prevPath, newLoc].slice(-100);

                    await updateDoc(busDocRef, {
                        location: newLoc,
                        path: updatedPath,
                        stats: {
                            ...data.stats,
                            speed: Math.floor(Math.random() * (50 - 30) + 30)
                        }
                    });
                }
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Sync stopping state to Firestore
            const busDocRef = doc(db, "buses", activeBusId);
            updateDoc(busDocRef, { isSimulating: false });
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isSimulating, activeBusId]);

    const updateBusLocation = async (newLoc: Location) => {
        const busDocRef = doc(db, "buses", activeBusId);
        const docSnap = await getDoc(busDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const prevPath = data.path || [];
            const updatedPath = [...prevPath, newLoc].slice(-100);

            await updateDoc(busDocRef, {
                location: newLoc,
                path: updatedPath,
                lastUpdated: serverTimestamp()
            });
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
            plannedRoute,
            isSimulating,
            setIsSimulating,
            stats,
            allBuses,
            depots,
            activeBusId,
            setActiveBusId,
            updateBusLocation,
            addDepot
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
