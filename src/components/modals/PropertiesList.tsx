import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MapPin, Building2, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PropertyData = {
  id: string; // 🔹 ensure each property has a unique id
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
  agentId: string; // 🔹 added for unique agent tracking
};

interface PropertiesListProps {
  visitorSessionId: string;
}

const PropertiesList: React.FC<PropertiesListProps> = ({
  visitorSessionId,
}) => {
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const [outerModalOpen, setOuterModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const evtSource = new EventSource("https://real-estate-prototype.onrender.com/stream");

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.SessionId === visitorSessionId) {
          const propsArray = Array.isArray(data.Properties)
            ? data.Properties
            : [];
          const matchingData = propsArray.map((p: PropertyData, i: number) => ({
            ...p,
            id: p.id || `${data.SessionId}-${i}`, // fallback id
            sessionId: data.SessionId,
          }));

          if (matchingData.length > 0) {
            sessionStorage.setItem("properties", JSON.stringify(matchingData));
            sessionStorage.setItem("propertiesSessionId", visitorSessionId);
            setProperties(matchingData);

            setOuterModalOpen(false);
            setTimeout(() => setOuterModalOpen(true), 50);
          }
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    return () => evtSource.close();
  }, [visitorSessionId]);

  const togglePropertySelection = (id: string) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (!properties || properties.length === 0) return null;

  // 🔹 Count unique agents from selected properties
  const uniqueAgents = new Set(
    properties
      .filter((p) => selectedProperties.includes(p.id))
      .map((p) => p.agentId)
  ).size;

  return (
    <>
      {/* Outer Modal */}
      <Dialog open={outerModalOpen} onOpenChange={setOuterModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-center flex-1">
              Available Properties
            </DialogTitle>
            <Button
              variant={selectMode ? "secondary" : "default"}
              onClick={() => setSelectMode((prev) => !prev)}
              className="ml-4"
            >
              {selectMode ? "Cancel Selection" : "Select"}
            </Button>
          </DialogHeader>

          {/* Scrollable container for property cards */}
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
                  {/* Selection Circle */}
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
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-bold">{prop.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prop.community}
                      {prop.subCommunity ? ` - ${prop.subCommunity}` : ""}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>AED {prop.price.toLocaleString()}</span>
                    </div>
                    {prop.type && (
                      <p className="text-sm text-muted-foreground">
                        Type: {prop.type}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent + Date Picker Section */}
          {selectMode && selectedProperties.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-foreground mb-2">
                You have selected <b>{selectedProperties.length}</b> properties
                involving <b>{uniqueAgents}</b>{" "}
                {uniqueAgents === 1 ? "agent" : "agents"}.
              </p>
              <label className="text-sm font-medium text-foreground">
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

      {/* Inner Modal for property details */}
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
                />
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    <span className="font-semibold text-foreground">
                      AED {selectedProperty.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
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
                    <div className="flex items-center text-muted-foreground">
                      <Building2 className="h-5 w-5 mr-2 text-purple-600" />
                      <span>{selectedProperty.type}</span>
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div>
                  {selectedProperty.amenities?.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-foreground mb-2">
                        Amenities
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                        {selectedProperty.amenities.map((a) => (
                          <li key={a}>{a}</li>
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
