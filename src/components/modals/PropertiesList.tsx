import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertyData = {
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
};

interface PropertiesListProps {
  visitorSessionId: string;
}

const PropertiesList: React.FC<PropertiesListProps> = ({
  visitorSessionId,
}) => {
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyData | null>(null);
  const [outerModalOpen, setOuterModalOpen] = useState(true); // open initially
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("https://real-estate-prototype.onrender.com/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.SessionId === visitorSessionId) {
          const propsArray = Array.isArray(data.Properties) ? data.Properties : [];
          const matchingData = propsArray.map((p) => ({
            ...p,
            sessionId: data.SessionId,
          }));

          setProperties(matchingData);

          // optional: cache
          sessionStorage.setItem("properties", JSON.stringify(matchingData));
          sessionStorage.setItem("propertiesSessionId", visitorSessionId);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [visitorSessionId]);


  if (loading) return null;
  if (!properties || properties.length === 0) return null;

  return (
    <>
      {/* Outer Modal with property cards */}
      <Dialog open={outerModalOpen} onOpenChange={setOuterModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Available Properties
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {properties.map((prop) => (
              <div
                key={prop.title + prop.price}
                className="border rounded-xl shadow-md bg-white cursor-pointer hover:shadow-lg transition overflow-hidden"
                onClick={() => {
                  setSelectedProperty(prop);
                  setModalOpen(true);
                }}
              >
                {prop.cover_photo && (
                  <div className="relative">
                    <img
                      src={prop.cover_photo}
                      alt={prop.title}
                      className="w-full h-56 object-cover"
                    />
                    {prop.status && (
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={
                            prop.status === "Available"
                              ? "bg-green-600 text-white"
                              : prop.status === "Pending"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {prop.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-bold">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {prop.community}
                    {prop.subCommunity ? ` - ${prop.subCommunity}` : ""}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>AED {prop.price.toLocaleString()}</span>
                    </div>
                  </div>
                  {prop.type && (
                    <p className="text-sm text-muted-foreground">
                      Type: {prop.type}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Button (only shows when outer modal is closed) */}
      {!outerModalOpen && (
        <div className="w-full flex justify-center items-center">
            <Button
            onClick={() => setOuterModalOpen(true)}
            className="relative rounded-full shadow-lg px-6 py-3 bg-primary text-white"
            >
            Show Properties
            </Button>
        </div>
      )}

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
                  {selectedProperty.amenities &&
                    selectedProperty.amenities.length > 0 && (
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
