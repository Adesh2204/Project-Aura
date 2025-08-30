import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MapPin, Map, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const ChatSection = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'I have shared my location with you',
      sender: 'me',
      timestamp: new Date(),
      isLocation: true,
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Connaught Place, New Delhi'
      }
    },
    {
      id: 2,
      text: 'I have been alerted about the situation, I have alerted the authorities, I\'m on my way',
      sender: 'aagam',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      isLocation: false
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      timestamp: new Date(),
      isLocation: false
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">Chat with Aagam</h1>
                <div className="flex items-center text-xs text-gray-400">
                  <div className="flex items-center mr-3">
                    <MapPin className="w-3 h-3 mr-1 text-blue-400" />
                    <span>0.5 km away</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-blue-400" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile App Style */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="text-center">
            <div className="inline-block bg-gray-800 rounded-full px-4 py-2 border border-gray-700">
              <p className="text-sm text-gray-300">
                Aagam is your nearest contact (0.5 km away)
              </p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs rounded-2xl px-4 py-3 transition-all duration-200 ${
                    msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20' 
                      : 'bg-white border border-gray-200 rounded-bl-none shadow-lg shadow-black/10'
                  }`}
                >
                  {msg.isLocation ? (
                    <div className="w-64">
                      <div className="h-40 bg-gray-100 rounded-lg mb-2 overflow-hidden border border-gray-200">
                        <MapContainer 
                          center={[msg.location?.lat || 0, msg.location?.lng || 0]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={false}
                          className="rounded-lg"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[msg.location?.lat || 0, msg.location?.lng || 0]} icon={defaultIcon}>
                            <Popup>{msg.location?.address}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                      <div className="p-2">
                        <div className="flex items-center text-blue-600 mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5" />
                          <span className="text-xs font-medium text-gray-800">My Location</span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{msg.location?.address}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">{msg.location?.lat.toFixed(4)}, {msg.location?.lng.toFixed(4)}</span>
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${msg.location?.lat},${msg.location?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center transition-colors"
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Navigate
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${msg.sender === 'me' ? 'text-white' : 'text-gray-900'}`}>{msg.text}</p>
                  )}
                  <div className={`flex items-center mt-1 text-xs ${msg.sender === 'me' ? 'justify-end text-blue-100' : 'text-gray-500'}`}>
                    <span className="opacity-70">{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'me' && (
                      <span className="ml-1 text-blue-300">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <form onSubmit={handleSend} className="flex items-center space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
