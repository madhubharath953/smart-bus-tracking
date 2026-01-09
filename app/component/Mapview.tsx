"use client"

import React from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
};

interface MapViewProps {
    location: { lat: number; lng: number };
}

export default function MapView({ location }: MapViewProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "" // Add your Google Maps API Key here
    });


    if (!isLoaded) {
        return (
            <div style={containerStyle} className="bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <p className="text-gray-500 font-medium">Loading Map...</p>
                    <p className="text-xs text-gray-400 mt-1">Please ensure you have set your Google Maps API key.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={14}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
            >
                <MarkerF position={location} />
            </GoogleMap>
        </div>
    );
}
