"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface Location {
    lat: number;
    lng: number;
}

interface BusContextType {
    busLocation: Location;
    path: Location[];
    plannedRoute: Location[];
    isSimulating: boolean;
    setIsSimulating: (val: boolean) => void;
    stats: {
        speed: number;
        eta: string;
        distance: string;
    };
    updateBusLocation: (newLoc: Location) => Promise<void>;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

const PLANNED_ROUTE: Location[] = [
    { lat: 12.9716, lng: 77.5946 }, // Start
    { lat: 12.9750, lng: 77.5980 },
    { lat: 12.9800, lng: 77.6050 },
    { lat: 12.9850, lng: 77.6100 },
    { lat: 12.9900, lng: 77.6150 }, // Campus destination
];

export function BusProvider({ children }: { children: React.ReactNode }) {
    const [busLocation, setBusLocation] = useState<Location>(BENGALURU_CENTER);
    const [path, setPath] = useState<Location[]>([BENGALURU_CENTER]);
    const [plannedRoute] = useState<Location[]>(PLANNED_ROUTE);
    const [isSimulating, setIsSimulating] = useState(false);
    const [stats, setStats] = useState({
        speed: 45,
        eta: "8 mins",
        distance: "2.4 km"
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Listen for real-time updates from Firestore
    useEffect(() => {
        const busDocRef = doc(db, "buses", "bus-402");

        const unsubscribe = onSnapshot(busDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.location) setBusLocation(data.location);
                if (data.path) setPath(data.path);
                if (data.isSimulating !== undefined) setIsSimulating(data.isSimulating);
                if (data.stats) setStats(data.stats);
            } else {
                // Initialize doc if it doesn't exist
                setDoc(busDocRef, {
                    location: BENGALURU_CENTER,
                    path: [BENGALURU_CENTER],
                    isSimulating: false,
                    stats: { speed: 0, eta: "N/A", distance: "N/A" }
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. Simulation logic (Writes to Firestore)
    useEffect(() => {
        if (isSimulating) {
            intervalRef.current = setInterval(async () => {
                const busDocRef = doc(db, "buses", "bus-402");
                const docSnap = await getDoc(busDocRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const prevLoc = data.location || BENGALURU_CENTER;
                    const prevPath = data.path || [BENGALURU_CENTER];

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
            const busDocRef = doc(db, "buses", "bus-402");
            updateDoc(busDocRef, { isSimulating: false });
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isSimulating]);

    const updateBusLocation = async (newLoc: Location) => {
        const busDocRef = doc(db, "buses", "bus-402");
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

    return (
        <BusContext.Provider value={{
            busLocation,
            path,
            plannedRoute,
            isSimulating,
            setIsSimulating,
            stats,
            updateBusLocation
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
