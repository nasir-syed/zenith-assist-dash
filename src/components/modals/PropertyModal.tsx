import React from 'react';
import { Property } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  MapPin, 
  DollarSign,
  User
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
}

interface PropertyModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  agentsList: Agent[];
}

const PropertyModal: React.FC<PropertyModalProps> = ({ property, open, onClose, onEdit, onDelete, agentsList }) => {
  if (!property) return null;

  const getAgentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return agentsList.find(a => a.id === id)?.name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {property.cover_photo && (
            <div className="relative">
              <img src={property.cover_photo} alt={property.title} className="w-full h-64 object-cover rounded-lg" />
              <div className="absolute top-4 right-4">
                <Badge
                  variant={property.status === 'Available' ? 'default' : property.status === 'Pending' ? 'secondary' : 'outline'}
                  className={property.status === 'Available' ? 'bg-success text-success-foreground' : property.status === 'Pending' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}
                >
                  {property.status}
                </Badge>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Property Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span className="font-semibold text-foreground">{property.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{property.community}{property.subCommunity ? `, ${property.subCommunity}` : ''}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  <span>{getAgentName(property.assignedAgent)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onEdit(property)} className="flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
            <Button variant="destructive" onClick={() => onDelete(property)}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
