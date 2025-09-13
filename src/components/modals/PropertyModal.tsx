import React from 'react';
import { Property } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square,
  User
} from 'lucide-react';

interface PropertyModalProps {
  property: (Property & { 
    image: string; 
    description: string; 
    bedrooms: number; 
    bathrooms: number; 
    sqft: number; 
  }) | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, open, onClose, onEdit }) => {
  const { deleteProperty } = useData();
  const { toast } = useToast();

  if (!property) return null;

  const handleDelete = () => {
    deleteProperty(property.id);
    toast({
      title: "Property Deleted",
      description: `${property.title} has been removed from listings.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Image */}
          <div className="relative">
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4">
              <Badge 
                variant={
                  property.status === 'Available' ? 'default' :
                  property.status === 'Pending' ? 'secondary' :
                  'outline'
                }
                className={
                  property.status === 'Available' ? 'bg-success text-success-foreground' :
                  property.status === 'Pending' ? 'bg-warning text-warning-foreground' :
                  'bg-muted text-muted-foreground'
                }
              >
                {property.status}
              </Badge>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="font-semibold text-foreground">{property.price}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>{property.assignedAgent}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center text-muted-foreground">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.sqft.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Property
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;