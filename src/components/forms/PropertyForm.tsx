import React, { useEffect, useState } from 'react';
import { Property } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyFormProps {
  property?: Property | null;
  open: boolean;
  onClose: () => void;
  agents: { id: string; name: string }[];
  onSaved?: (savedProperty: Property, isEdit: boolean) => void;
}


const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Duplex',
  'Penthouse',
  'Studio',
  'Commercial Office',
  'Retail Space',
  'Land (Plot)'
];

const AMENITY_OPTIONS = [
  "Gym or Health Club",
  "Swimming Pool",
  "Security Staff",
  "CCTV Security",
  "Cafeteria or Canteen",
  "Freehold",
  "Kids Play Area",
  "Lawn or Garden",
  "Balcony or Terrace",
  "Lobby in Building",
  "Parking Spaces",
  "Metro Nearby",
  "Pet Friendly",
  "Rooftop Terrace",
  "Private Garden",
  "Sauna or Steam Room",
  "Smart Home System",
  "BBQ Area"
];

const PropertyForm: React.FC<PropertyFormProps> = ({ property, open, onClose, agents, onSaved }) => {
  const [formData, setFormData] = useState<Omit<Property, 'id'>>({
    title: '',
    community: '',
    subCommunity: '',
    price: 0,
    status: 'Available',
    assignedAgent: '',
    cover_photo: '',
    emirate: '',
    amenities: [],
    type: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  

  // Initialize form with existing property
  useEffect(() => {
    if (property) {
      const { id, ...rest } = property;
      setFormData(rest);
    } else {
      setFormData({
        title: '',
        community: '',
        subCommunity: '',
        price: 0,
        status: 'Available',
        assignedAgent: '',
        cover_photo: '',
        emirate: '',
        amenities: [],
        type: '',
      });
    }
  }, [property, open]);

  const handleChange = (field: keyof Omit<Property, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenityToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log(property)
      const isEdit = !!property?.id;
      const url = isEdit
        ? `http://localhost:5000/api/properties/${property.id}`
        : 'http://localhost:5000/api/properties';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log('Making request:', { method, url, data: formData }); // Debug log
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} property`);
      }
      
      const savedProperty = await res.json();
      console.log('Saved property:', savedProperty); // Debug log
      
      // Call the callback with the saved property
      if (onSaved) {
        onSaved(savedProperty, isEdit);
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error saving property:', err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!property?.id) return;
    if (!confirm('Are you sure you want to delete this property?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/properties/${property.id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }
      
      // For delete, we can call onSaved with null to indicate deletion
      if (onSaved) {
        onSaved(property, true); // Pass the deleted property for reference
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error deleting property:', err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => handleChange('title', e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Input 
                id="community" 
                value={formData.community} 
                onChange={e => handleChange('community', e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subCommunity">Sub Community</Label>
              <Input 
                id="subCommunity" 
                value={formData.subCommunity} 
                onChange={e => handleChange('subCommunity', e.target.value)} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                type="number" 
                value={formData.price} 
                onChange={e => handleChange('price', parseFloat(e.target.value))} 
                required 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={v => handleChange('status', v)} disabled={isLoading}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedAgent">Assigned Agent</Label>
              <Select 
                value={formData.assignedAgent} 
                onValueChange={v => handleChange('assignedAgent', v)} 
                disabled={isLoading} // prevent switching if agent
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {(user.role === "agent"
                    ? agents.filter(agent => agent.id === user.id)  // only self
                    : agents
                  ).map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_photo">Cover Photo URL</Label>
            <Input 
              id="cover_photo" 
              value={formData.cover_photo} 
              onChange={e => handleChange('cover_photo', e.target.value)} 
              placeholder="https://example.com/image.jpg"
              disabled={isLoading}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emirate">Emirate</Label>
              <Input 
                id="emirate" 
                value={formData.emirate} 
                onChange={e => handleChange('emirate', e.target.value)} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={v => handleChange('type', v)} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {AMENITY_OPTIONS.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor={amenity} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
            {formData.amenities.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Selected Amenities:</div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map(amenity => (
                    <div 
                      key={amenity} 
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            {property?.id && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (property ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyForm;