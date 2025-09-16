import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MapPin, User } from "lucide-react";

type PropertyData = {
  title: string;
  community: string;
  subCommunity?: string;
  price: number;
  status: string;
  emirate: string;
  amenities: string[];
  image?: string;
  description?: string;
  sessionId: string; 
};

interface PropertiesListProps {
  visitorSessionId: string; // passed from parent
}

const PropertiesList: React.FC<PropertiesListProps> = ({ visitorSessionId }) => {
  const [properties, setProperties] = useState<PropertyData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const stored = sessionStorage.getItem("properties");
        const storedSessionId = sessionStorage.getItem("propertiesSessionId");

        if (stored && storedSessionId === visitorSessionId) {
          setProperties(JSON.parse(stored));
          setLoading(false);
          return;
        }

        // Fetch from backend
        const res = await fetch("http://localhost:4000/properties");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data: PropertyData[] = await res.json();

        // Only include properties with matching sessionId
        const matchingData = data.filter((p) => p.sessionId === visitorSessionId);

        if (matchingData.length > 0) {
          sessionStorage.setItem("properties", JSON.stringify(matchingData));
          sessionStorage.setItem("propertiesSessionId", visitorSessionId);
          setProperties(matchingData);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error(err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [visitorSessionId]);

  if (loading) return null;
  if (!properties || properties.length === 0) return null;

  return (
    <>
      {/* Property Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {properties.map((prop) => (
          <div
            key={prop.title + prop.price}
            className="border rounded-lg shadow cursor-pointer hover:shadow-lg transition overflow-hidden"
            onClick={() => {
              setSelectedProperty(prop);
              setModalOpen(true);
            }}
          >
            {prop.image && (
              <div className="relative">
                <img
                  src={prop.image}
                  alt={prop.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    className={
                      prop.status === "Available"
                        ? "bg-success text-success-foreground"
                        : prop.status === "Pending"
                        ? "bg-warning text-warning-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {prop.status}
                  </Badge>
                </div>
              </div>
            )}
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-bold">{prop.title}</h3>
              <p className="text-sm text-muted-foreground">
                {prop.community}{prop.subCommunity ? ` - ${prop.subCommunity}` : ""}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>AED {prop.price.toLocaleString()}</span>
                </div>
              </div>
              {prop.amenities && prop.amenities.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Amenities: {prop.amenities.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Property Modal */}
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedProperty.title}</DialogTitle>
              </DialogHeader>
              {selectedProperty.image && (
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">
                      AED {selectedProperty.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedProperty.community}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Assigned Agent</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProperty.description || "No description available."}
                  </p>
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Amenities: {selectedProperty.amenities.join(", ")}
                    </p>
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
