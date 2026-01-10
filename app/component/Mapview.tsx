"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Custom Bus Icon
const BusIcon = L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/bus.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

// Custom Destination Icon
const DestinationIcon = L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    busLocation: {
        lat: number;
        lng: number;
    } | null;
    path?: { lat: number; lng: number }[];
    plannedRoute?: { lat: number; lng: number }[];
}

const defaultCenter: [number, number] = [12.9716, 77.5946];

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapView({ busLocation, path = [], plannedRoute = [] }: MapViewProps) {
    const center: [number, number] = busLocation
        ? [busLocation.lat, busLocation.lng]
        : defaultCenter;

    const leafletPath = path.map(p => [p.lat, p.lng] as [number, number]);
    const leafletPlannedRoute = plannedRoute.map(p => [p.lat, p.lng] as [number, number]);
    const destination = plannedRoute.length > 0 ? plannedRoute[plannedRoute.length - 1] : null;

    return (
        <div style={{ width: '100%', height: '500px' }} className="border-2 border-blue-200 rounded-lg overflow-hidden z-0">
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {leafletPlannedRoute.length > 0 && (
                    <Polyline
                        positions={leafletPlannedRoute}
                        pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.5, dashArray: '10, 10' }}
                    />
                )}

                {leafletPath.length > 0 && (
                    <Polyline
                        positions={leafletPath}
                        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }}
                    />
                )}

                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon} />
                )}

                <Marker position={center} icon={BusIcon} />
            </MapContainer>
        </div>
    );
}
