"use client"

import MapView from "../component/Mapview";

export default function Dashboard() {
    const busLocation = { lat: 12.9716, lng: 77.5946 };

    return (
        <div className="flex">
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Smart Bus Tracking Dashboard
                </h1>
                <MapView location={busLocation} />
            </div>
        </div>
    );
}
