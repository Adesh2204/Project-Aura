import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

// New Delhi approximate center and bounds
const delhiCenter: [number, number] = [28.6139, 77.2090];

// Example relative/friends locations (mock data). Replace with real coordinates later.
const contacts: Array<{ name: string; relation: string; position: [number, number] }> = [
  { name: 'Rohini', relation: 'Cousin', position: [28.7360, 77.1120] },
  { name: 'Dwarka', relation: 'Friend', position: [28.5921, 77.0460] },
  { name: 'Connaught Place', relation: 'Friend', position: [28.6329, 77.2195] },
  { name: 'Saket', relation: 'Aunt', position: [28.5245, 77.2066] },
  { name: 'Noida Sec 18', relation: 'Uncle', position: [28.5708, 77.3261] },
  { name: 'Gurugram', relation: 'Friend', position: [28.4595, 77.0266] },
  { name: 'Janakpuri', relation: 'Brother', position: [28.6219, 77.0878] },
  { name: 'Vasant Kunj', relation: 'Friend', position: [28.5273, 77.1506] },
];

// Current user location (mock - replace with actual GPS)
const userLocation: [number, number] = [28.6139, 77.2090]; // Connaught Place area

// Fix default icon path for Leaflet when bundling
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CityMapProps {
  height?: number;
}

export const CityMap: React.FC<CityMapProps> = ({ height = 320 }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-700 shadow-lg bg-white">
      <MapContainer
        center={delhiCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height, width: '100%', borderRadius: '12px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location */}
        <CircleMarker
          center={userLocation}
          radius={12}
          pathOptions={{ color: '#ef4444', fillColor: '#f87171', fillOpacity: 0.8, weight: 3 }}
        >
          <Popup>
            <div className="text-sm p-1">
              <div className="font-semibold text-red-600">Your Location</div>
              <div className="text-gray-600">Current Position</div>
              <div className="text-gray-500">{userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</div>
            </div>
          </Popup>
        </CircleMarker>

        {/* Relatives and friends locations */}
        {contacts.map((c, idx) => (
          <CircleMarker
            key={idx}
            center={c.position}
            radius={8}
            pathOptions={{ color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <div className="text-sm p-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-gray-600">{c.relation}</div>
                <div className="text-gray-500">{c.position[0].toFixed(4)}, {c.position[1].toFixed(4)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CityMap;


