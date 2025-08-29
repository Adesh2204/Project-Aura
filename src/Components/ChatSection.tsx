import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Chat with Aagam</h1>
          <p className="text-xs text-gray-500">Nearest contact • 0.5 km away</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Chat with your contacts nearest to you and right now Aagam is nearest to you
          </p>
        </div>
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${
                msg.sender === 'me' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.isLocation ? (
                <div className="w-64">
                  <div className="h-32 bg-blue-100 rounded-lg mb-2 overflow-hidden">
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium">My Location</p>
                    <p>{msg.location?.address}</p>
                    <p className="text-gray-500">{msg.location?.lat.toFixed(4)}, {msg.location?.lng.toFixed(4)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{msg.text}</p>
              )}
              <p className="text-right text-xs mt-1 opacity-70">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;
