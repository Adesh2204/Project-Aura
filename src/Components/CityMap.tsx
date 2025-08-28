import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// New Delhi coordinates and bounds
const DELHI_CENTER: [number, number] = [28.6139, 77.2090];
const DELHI_BOUNDS: L.LatLngBoundsExpression = [
  [28.4, 76.8], // Southwest coordinates
  [28.9, 77.5]   // Northeast coordinates
];

// Important landmarks in New Delhi with red pin markers
const LANDMARKS = [
  { name: 'India Gate', position: [28.6129, 77.2295] as [number, number], description: 'War memorial' },
  { name: 'Red Fort', position: [28.6562, 77.2410] as [number, number], description: 'Historic fort' },
  { name: 'Connaught Place', position: [28.6280, 77.2185] as [number, number], description: 'Financial district' },
  { name: 'Lotus Temple', position: [28.5535, 77.2588] as [number, number], description: 'Bahá\'í House of Worship' },
  { name: 'Akshardham Temple', position: [28.6127, 77.2773] as [number, number], description: 'Hindu temple complex' },
];

// Relative/friends locations
const CONTACTS = [
  { name: 'Rohini', relation: 'Cousin', position: [28.7360, 77.1120] as [number, number] },
  { name: 'Dwarka', relation: 'Friend', position: [28.5921, 77.0460] as [number, number] },
  { name: 'Saket', relation: 'Aunt', position: [28.5245, 77.2066] as [number, number] },
  { name: 'Noida', relation: 'Uncle', position: [28.5708, 77.3261] as [number, number] },
  { name: 'Gurugram', relation: 'Friend', position: [28.4595, 77.0266] as [number, number] },
];

// User location (mock)
const USER_LOCATION: [number, number] = [28.6139, 77.2090]; // Connaught Place

// Create custom icons
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const redPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds
const MapBounds = () => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      map.setMaxBounds(DELHI_BOUNDS);
      map.setMinZoom(10);
      map.setMaxZoom(16);
    }
  }, [map]);

  return null;
};

interface CityMapProps {
  height?: number | string;
  className?: string;
}

export const CityMap: React.FC<CityMapProps> = ({ 
  height = 400,
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-md bg-white ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-70 z-10">
          <div className="animate-pulse text-gray-500">Loading map...</div>
        </div>
      )}
      
      <MapContainer
        center={DELHI_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
          width: '100%',
          minHeight: '300px',
          borderRadius: '0.5rem'
        }}
        className="z-0"
        zoomControl={true}
        maxBounds={DELHI_BOUNDS}
        maxBoundsViscosity={1.0}
        whenReady={() => setIsLoading(false)}
      >
        <MapBounds />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {/* User's current location */}
        <Marker position={USER_LOCATION} icon={createCustomIcon('#ef4444')}>
          <Popup>
            <div className="text-sm p-1 min-w-[160px]">
              <div className="font-semibold text-red-600">Your Location</div>
              <div className="text-gray-500 text-xs">
                {USER_LOCATION[0].toFixed(4)}, {USER_LOCATION[1].toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Important landmarks with red pins */}
        {LANDMARKS.map((landmark, idx) => (
          <Marker 
            key={`landmark-${idx}`} 
            position={landmark.position}
            icon={redPinIcon}
          >
            <Popup>
              <div className="text-sm p-1 min-w-[160px]">
                <div className="font-semibold">{landmark.name}</div>
                <div className="text-gray-600 text-xs">{landmark.description}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {landmark.position[0].toFixed(4)}, {landmark.position[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Contacts locations */}
        {CONTACTS.map((contact, idx) => (
          <Marker 
            key={`contact-${idx}`} 
            position={contact.position}
            icon={createCustomIcon('#3b82f6')}
          >
            <Popup>
              <div className="text-sm p-1 min-w-[160px]">
                <div className="font-semibold">{contact.name}</div>
                <div className="text-gray-600 text-xs">{contact.relation}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {contact.position[0].toFixed(4)}, {contact.position[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CityMap;


