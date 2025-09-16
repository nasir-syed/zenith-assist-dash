import React, { useState, useEffect } from 'react';
import { Property } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';
import property5 from '@/assets/property-5.jpg';

interface PropertyFormProps {
  property?: (Property & {
    image: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
  }) | null;
  open: boolean;
  onClose: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, open, onClose }) => {
  const { agents, addProperty, updateProperty } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    status: 'Available' as 'Available' | 'Pending' | 'Sold',
    assignedAgent: '',
    image: property1,
    description: '',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1000
  });

  const [image, setImage] = useState(property?.image || '');

  const imageOptions = [
    { value: property1, label: 'Modern Building' },
    { value: property2, label: 'Suburban Home' },
    { value: property3, label: 'Waterfront Villa' },
    { value: property4, label: 'Townhouse' },
    { value: property5, label: 'Penthouse' }
  ];

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        location: property.location,
        price: property.price,
        status: property.status,
        assignedAgent: property.assignedAgent,
        image: property.image,
        description: property.description,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft
      });
      setImage(property.image);
    } else {
      setFormData({
        title: '',
        location: '',
        price: '',
        status: 'Available',
        assignedAgent: '',
        image: property1,
        description: '',
        bedrooms: 1,
        bathrooms: 1,
        sqft: 1000
      });
      setImage(property1);
    }
  }, [property, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (property) {
      updateProperty(property.id, formData);
      toast({
        title: "Property Updated",
        description: `${formData.title} has been updated successfully.`,
      });
    } else {
      addProperty(formData);
      toast({
        title: "Property Added",
        description: `${formData.title} has been added to listings.`,
      });
    }

    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Edit Property' : 'Add New Property'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="$450,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedAgent">Assigned Agent</Label>
            <Select value={formData.assignedAgent} onValueChange={(value) => handleChange('assignedAgent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.name}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                max="10"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                max="10"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                type="number"
                min="100"
                value={formData.sqft}
                onChange={(e) => handleChange('sqft', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Property Image</Label>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
              <label
                htmlFor="property-image-upload"
                className="inline-block px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer shadow-sm hover:bg-gray-50 transition"
                style={{ fontWeight: 500, fontSize: '1rem' }}
              >
                Choose Image
                <input
                  id="property-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {image && (
              <img
                src={image}
                alt="Property Preview"
                className="mt-2 w-full h-32 object-cover rounded-md border"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              {property ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyForm;