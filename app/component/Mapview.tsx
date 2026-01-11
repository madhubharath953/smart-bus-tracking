"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from "react-leaflet";
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

const DepotIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/609/609803.png', // Home/Depot icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
    className: 'drop-shadow-lg p-1 bg-white rounded-lg border-2 border-slate-900'
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocation {
    lat: number;
    lng: number;
}

interface MapBus {
    id: string;
    location: MapLocation;
    isSimulating: boolean;
    stats?: {
        registration?: string;
    };
}

interface MapDepot {
    id: string;
    name: string;
    location: MapLocation;
}

interface MapViewProps {
    busLocation: MapLocation | null;
    path?: MapLocation[];
    plannedRoute?: MapLocation[];
    buses?: MapBus[];
    depots?: MapDepot[];
}

const defaultCenter: [number, number] = [8.7139, 78.1348];

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapView({ busLocation, path = [], plannedRoute = [], buses = [], depots = [] }: MapViewProps) {
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

                {/* Render Depots */}
                {depots.map((depot) => (
                    <Marker
                        key={depot.id}
                        position={[depot.location.lat, depot.location.lng]}
                        icon={DepotIcon}
                    >
                        <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent>
                            <span className="font-black text-[10px] uppercase tracking-tighter text-slate-900 px-1">
                                {depot.name}
                            </span>
                        </Tooltip>
                    </Marker>
                ))}

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

                {/* Render All Buses */}
                {buses && buses.map((bus) => (
                    <Marker
                        key={bus.id}
                        position={[bus.location.lat, bus.location.lng]}
                        icon={BusIcon}
                    >
                        <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent>
                            <span className="font-bold text-xs">{bus.stats?.registration || bus.id.toUpperCase()}</span>
                        </Tooltip>
                    </Marker>
                ))}

                {/* Fallback for primary bus if not in buses array (to avoid breaking) */}
                {!buses && busLocation && (
                    <Marker position={[busLocation.lat, busLocation.lng]} icon={BusIcon} />
                )}
            </MapContainer>
        </div>
    );
}
