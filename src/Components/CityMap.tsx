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
    <div className="w-full overflow-hidden rounded-xl border border-gray-700 shadow-lg">
      <MapContainer
        center={delhiCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {contacts.map((c, idx) => (
          <CircleMarker
            key={idx}
            center={c.position}
            radius={10}
            pathOptions={{ color: '#60a5fa', fillColor: '#93c5fd', fillOpacity: 0.35 }}
          >
            <Popup>
              <div className="text-sm">
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


