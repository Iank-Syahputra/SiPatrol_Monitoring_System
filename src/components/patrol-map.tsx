'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  timestamp?: string;
}

interface PatrolMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  showPopup?: boolean;
}

export function PatrolMap({ 
  locations, 
  center = [-4.0428, 122.5278], // Coordinates for Kendari, Indonesia
  zoom = 13,
  showPopup = true 
}: PatrolMapProps) {
  const [mapKey, setMapKey] = useState(0); // Force remount when locations change

  useEffect(() => {
    // Force remount when locations change to ensure markers update
    setMapKey(prev => prev + 1);
  }, [locations]);

  return (
    <MapContainer 
      key={mapKey}
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker key={location.id} position={[location.lat, location.lng]}>
          {showPopup && (
            <Popup>
              <div>
                <h3 className="font-semibold">{location.title}</h3>
                {location.description && <p>{location.description}</p>}
                {location.timestamp && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(location.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}