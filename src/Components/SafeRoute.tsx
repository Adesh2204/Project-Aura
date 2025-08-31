import { useState, useEffect } from 'react';
import { ArrowLeft, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Mock route coordinates (simplified for demonstration)
const ROUTE_COORDINATES: [number, number][] = [
  [28.6139, 77.2090], // Current location (Connaught Place)
  [28.6140, 77.2120],
  [28.6150, 77.2150],
  [28.6170, 77.2200],
  [28.6180, 77.2250],
  [28.6190, 77.2300],
  [28.6200, 77.2350],
  [28.6210, 77.2400],
  [28.6220, 77.2450],
  [28.6230, 77.2500],
  [28.6235, 77.2550],
  [28.6240, 77.2600],
  [28.6245, 77.2650],
  [28.6250, 77.2700],
  [28.6255, 77.2750],  // Connaught Place Police Station
];

const DESTINATION = {
  name: 'Connaught Place Police Station',
  position: [28.6255, 77.2750] as [number, number],
  address: 'H 8, Connaught Place, New Delhi, Delhi 110001'
};

const SafeRoute = () => {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current location (in a real app, use browser's geolocation API)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLocation([28.6139, 77.2090]); // Connaught Place
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Custom icons
  const currentLocationIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const destinationIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
             <MapPin className="w-3 h-3 text-white" />
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  if (isLoading || !currentLocation) {
    return (
      <div className="min-h-screen bg-aura-background flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="animate-pulse text-gray-600">Loading route...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aura-background">
      {/* Mobile App Header */}
      <div className="bg-gray-900 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">Safe Route</h1>
                <p className="text-sm text-gray-400">The safest route near you is Connaught Place police station</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile App Style */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Map Container */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="h-80 relative">
              <MapContainer
                center={currentLocation}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Current Location */}
                <Marker position={currentLocation} icon={currentLocationIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {/* Destination */}
                <Marker position={DESTINATION.position} icon={destinationIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{DESTINATION.name}</p>
                      <p className="text-gray-600">{DESTINATION.address}</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Route */}
                <Polyline 
                  positions={ROUTE_COORDINATES} 
                  color="#3b82f6"
                  weight={5}
                  opacity={0.8}
                />
              </MapContainer>
            </div>
          </div>

          {/* Route Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">To: {DESTINATION.name}</h3>
                <p className="text-sm text-gray-600">{DESTINATION.address}</p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>15 min</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                <span>Safe Route</span>
              </div>
              <div>
                <span>2.5 km</span>
              </div>
            </div>
            
            <button 
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/20 transform hover:scale-105 active:scale-95"
              onClick={() => {
                // In a real app, this would open the route in the device's maps app
                const url = `https://www.google.com/maps/dir/?api=1&destination=${DESTINATION.position[0]},${DESTINATION.position[1]}&travelmode=walking`;
                window.open(url, '_blank');
              }}
            >
              Start Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeRoute;
