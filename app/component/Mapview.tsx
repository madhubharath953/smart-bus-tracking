"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

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
    buses?: MapBus[];
    depots?: MapDepot[];
    followActive?: boolean;
    userLocation?: MapLocation | null;
    followUser?: boolean;
    activeBusId?: string | null;
    savedLocations?: { id: string, name: string, location: MapLocation }[];
}

// User/GPS Marker Icon
const UserIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2838/2838912.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'animate-pulse'
});

const defaultCenter: [number, number] = [8.7139, 78.1348];

// Component to handle map center updates
function ChangeView({ center, animate, buses }: { center: L.LatLngExpression, animate: boolean, buses?: MapBus[] }) {
    const map = useMap();
    const prevAnimate = useRef(animate);

    useEffect(() => {
        if (animate) {
            map.setView(center);
        } else if (prevAnimate.current && !animate && buses && buses.length > 0) {
            // Only fit bounds once when toggling away from follow mode
            const bounds = L.latLngBounds(buses.map(b => [b.location.lat, b.location.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        prevAnimate.current = animate;
    }, [center, map, animate, buses]);
    return null;
}

const StarIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', // Star icon
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    className: 'drop-shadow-md'
});

export default function MapView({ busLocation, path = [], buses = [], depots = [], followActive = true, userLocation = null, followUser = false, activeBusId = null, savedLocations = [] }: MapViewProps) {


    // Only show the active bus if followActive is enabled, otherwise show all
    const visibleBuses = (followActive && activeBusId)
        ? buses.filter(b => b.id === activeBusId)
        : buses;

    const mapCenter: L.LatLngExpression = followUser && userLocation
        ? [userLocation.lat, userLocation.lng]
        : busLocation
            ? [busLocation.lat, busLocation.lng]
            : defaultCenter;

    return (
        <div style={{ width: '100%', height: '500px' }} className="border-2 border-blue-200 rounded-lg overflow-hidden z-0">
            <MapContainer
                center={mapCenter as L.LatLngExpression}
                zoom={13}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <ChangeView center={mapCenter as L.LatLngExpression} animate={followActive || followUser} buses={buses} />

                {/* Sleek Movement Trail */}
                <Polyline
                    positions={path.map(p => [p.lat, p.lng])}
                    color="#4f46e5"
                    weight={3}
                    opacity={0.4}
                    dashArray="5, 10"
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

                {/* Render User Location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                            <span className="font-bold text-[8px] text-blue-600 uppercase">You Are Here</span>
                        </Tooltip>
                    </Marker>
                )}

                {/* Render Saved Locations */}
                {savedLocations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.location.lat, loc.location.lng]}
                        icon={StarIcon}
                    >
                        <Tooltip direction="bottom" offset={[0, 10]} opacity={0.8}>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase italic px-1 backdrop-blur-sm bg-white/50 rounded">
                                {loc.name}
                            </span>
                        </Tooltip>
                    </Marker>
                ))}

                {/* Render Filtered Buses */}
                {visibleBuses.map((bus) => (
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
                {visibleBuses.length === 0 && busLocation && (
                    <Marker position={[busLocation.lat, busLocation.lng]} icon={BusIcon} />
                )}
            </MapContainer>
        </div>
    );
}
