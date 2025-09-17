import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, MapPin, Building2, Check, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PropertyData = {
  id: string;
  title: string;
  community: string;
  subCommunity?: string;
  price: number;
  status?: string;
  emirate: string;
  amenities: string[];
  cover_photo?: string;
  type?: string;
  sessionId: string;
  agentId: string;
};

interface PropertiesListProps {
  visitorSessionId: string;
}

const PropertiesList: React.FC<PropertiesListProps> = ({ visitorSessionId }) => {
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [outerModalOpen, setOuterModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectToSSE = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    
    try {
      const evtSource = new EventSource("https://real-estate-prototype.onrender.com/stream");
      eventSourceRef.current = evtSource;

      evtSource.onopen = () => {
        console.log("SSE connection opened");
        setConnectionStatus('connected');
        setReconnectAttempt(0);
      };

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'connection') {
            console.log("Connection confirmed:", data.message);
            setConnectionStatus('connected');
            return;
          }
          
          if (data.type === 'heartbeat') {
            // Just acknowledge heartbeat, don't process
            return;
          }

          // Handle property data
          if (data.SessionId === visitorSessionId) {
            const propsArray = Array.isArray(data.Properties) ? data.Properties : [];
            const matchingData = propsArray.map((p: PropertyData, i: number) => ({
              ...p,
              id: p.id || `${data.SessionId}-${i}`, // fallback id
              sessionId: data.SessionId,
            }));

            if (matchingData.length > 0) {
              // Store in memory instead of sessionStorage for better compatibility
              setProperties(matchingData);
              setOuterModalOpen(false);
              setTimeout(() => setOuterModalOpen(true), 50);
            }
          }
        } catch (err) {
          console.error("SSE parse error", err);
        }
      };

      evtSource.onerror = (error) => {
        console.error("SSE error:", error);
        setConnectionStatus('error');
        
        // Auto-reconnect with exponential backoff
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000); // Max 30 seconds
        console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          connectToSSE();
        }, timeout);
      };

    } catch (error) {
      console.error("Failed to create EventSource:", error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    connectToSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [visitorSessionId]);

  const togglePropertySelection = (id: string) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return `Connection Error (Attempt ${reconnectAttempt})`;
      default:
        return 'Unknown';
    }
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          {getConnectionStatusIcon()}
          <span className="text-sm font-medium">{getConnectionStatusText()}</span>
        </div>
        {connectionStatus === 'connected' && (
          <p className="text-sm text-gray-600">Waiting for properties...</p>
        )}
        {(connectionStatus === 'error' || connectionStatus === 'disconnected') && (
          <Button
            size="sm"
            onClick={() => {
              setReconnectAttempt(0);
              connectToSSE();
            }}
            className="w-full mt-2"
          >
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  const uniqueAgents = new Set(
    properties.filter((p) => selectedProperties.includes(p.id)).map((p) => p.agentId)
  ).size;

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 bg-white border rounded-lg shadow-lg p-2 z-50">
        <div className="flex items-center space-x-2">
          {getConnectionStatusIcon()}
          <span className="text-xs font-medium">{getConnectionStatusText()}</span>
        </div>
      </div>

      {/* Outer Modal */}
      <Dialog open={outerModalOpen} onOpenChange={setOuterModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-center flex-1">
              Available Properties ({properties.length})
            </DialogTitle>
            <Button
              variant={selectMode ? "secondary" : "default"}
              onClick={() => setSelectMode((prev) => !prev)}
              className="ml-4"
            >
              {selectMode ? "Cancel Selection" : "Select"}
            </Button>
          </DialogHeader>

          {/* Property Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4 overflow-y-auto pr-2 flex-1">
            {properties.map((prop) => {
              const isSelected = selectedProperties.includes(prop.id);
              return (
                <div
                  key={prop.id}
                  className="relative border rounded-xl shadow-md bg-white cursor-pointer hover:shadow-lg transition overflow-hidden"
                  onClick={() =>
                    selectMode
                      ? togglePropertySelection(prop.id)
                      : (setSelectedProperty(prop), setModalOpen(true))
                  }
                >
                  {selectMode && (
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  )}

                  {prop.cover_photo && (
                    <img
                      src={prop.cover_photo}
                      alt={prop.title}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}

                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-bold">{prop.title}</h3>
                    <p className="text-sm text-gray-600">
                      {prop.community}
                      {prop.subCommunity ? ` - ${prop.subCommunity}` : ""}
                    </p>
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>AED {prop.price.toLocaleString()}</span>
                    </div>
                    {prop.type && (
                      <p className="text-sm text-gray-600">
                        Type: {prop.type}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date Picker */}
          {selectMode && selectedProperties.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-900 mb-2">
                You have selected <b>{selectedProperties.length}</b> properties
                involving <b>{uniqueAgents}</b>{" "}
                {uniqueAgents === 1 ? "agent" : "agents"}.
              </p>
              <label className="text-sm font-medium text-gray-900">
                Pick a date to meet/talk with the agent(s):
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Property Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-lg rounded-2xl shadow-2xl">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedProperty.title}
                </DialogTitle>
              </DialogHeader>

              {selectedProperty.cover_photo && (
                <img
                  src={selectedProperty.cover_photo}
                  alt={selectedProperty.title}
                  className="w-full h-72 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      AED {selectedProperty.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <span>
                      {selectedProperty.community}
                      {selectedProperty.subCommunity
                        ? ` - ${selectedProperty.subCommunity}`
                        : ""}{" "}
                      ({selectedProperty.emirate})
                    </span>
                  </div>
                  {selectedProperty.type && (
                    <div className="flex items-center text-gray-600">
                      <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                      <span>{selectedProperty.type}</span>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  {selectedProperty.amenities?.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-2">
                        Amenities
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                        {selectedProperty.amenities.map((a, index) => (
                          <li key={index}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertiesList;